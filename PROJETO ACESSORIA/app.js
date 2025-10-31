/* eslint-disable no-alert */
/* eslint-disable no-use-before-define */

// --- FUNÇÕES GERAIS DE DADOS (Simulação de Banco de Dados com localStorage) ---

/**
 * Busca dados do localStorage.
 * @param {string} key - A chave para buscar (ex: 'disciplinas').
 * @returns {Array} - Um array de dados ou um array vazio.
 */
function getDb(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

/**
 * Salva dados no localStorage.
 * @param {string} key - A chave para salvar (ex: 'disciplinas').
 * @param {Array} data - O array de dados para salvar.
 */
function saveDb(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- LÓGICA DE AUTENTICAÇÃO E ROTEAMENTO  ---

document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();

  if (page === 'index.html' || page === '') {
    // --- PÁGINA DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
  } else if (page === 'dashboard.html') {
    // --- PÁGINA DO DASHBOARD ---
    checkAuth();
    setupDashboard();
  }
});

/**
 * Processa o formulário de login.
 */
function handleLogin(event) {
  event.preventDefault();
  const userType = document.getElementById('user-type').value;
  const username = document.getElementById('username').value;

  if (!username) {
    alert('Por favor, digite um nome de usuário.');
    return;
  }

  // Salva os dados do usuário "logado" na sessão
  localStorage.setItem('currentUserType', userType);
  localStorage.setItem('currentUsername', username);

  // Redireciona para o dashboard
  window.location.href = 'dashboard.html';
}

/**
 * Verifica se o usuário está logado; se não, redireciona para o login.
 */
function checkAuth() {
  const userType = localStorage.getItem('currentUserType');
  if (!userType) {
    window.location.href = 'index.html';
  }
}

/**
 * Configura o dashboard (mostra o painel correto, listeners, etc.).
 */
function setupDashboard() {
  const userType = localStorage.getItem('currentUserType');
  const username = localStorage.getItem('currentUsername');
  
  document.getElementById('username-display').textContent = username;
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Mostra o painel correto com base no tipo de usuário
  switch (userType) {
    case 'admin':
      document.getElementById('admin-panel').style.display = 'block';
      initAdminPanel();
      break;
    case 'professor':
      document.getElementById('professor-panel').style.display = 'block';
      initProfessorPanel();
      break;
    case 'aluno':
      document.getElementById('aluno-panel').style.display = 'block';
      initAlunoPanel();
      break;
    default:
      handleLogout(); // Tipo de usuário inválido
  }
}

/**
 * Desloga o usuário e limpa o localStorage.
 */
function handleLogout() {
  localStorage.removeItem('currentUserType');
  localStorage.removeItem('currentUsername');
  window.location.href = 'index.html';
}

// --- LÓGICA DO PAINEL DO ADMINISTRADOR (US6) [cite: 25] ---

function initAdminPanel() {
  // Listeners dos formulários
  document.getElementById('admin-form-prof').addEventListener('submit', adminAddProfessor);
  document.getElementById('admin-form-disc').addEventListener('submit', adminAddDisciplina);
  
  // Renderiza listas existentes
  renderAdminLists();
}

function adminAddProfessor(e) {
  e.preventDefault();
  const nome = document.getElementById('prof-nome').value;
  if (!nome) return;

  const professores = getDb('professores');
  professores.push({ id: Date.now(), nome });
  saveDb('professores', professores);
  
  renderAdminLists();
  e.target.reset();
}

function adminAddDisciplina(e) {
  e.preventDefault();
  const nome = document.getElementById('disc-nome').value;
  if (!nome) return;

  const disciplinas = getDb('disciplinas');
  disciplinas.push({ id: Date.now(), nome });
  saveDb('disciplinas', disciplinas);

  renderAdminLists();
  e.target.reset();
}

function renderAdminLists() {
  const profList = document.getElementById('admin-list-prof');
  const discList = document.getElementById('admin-list-disc');
  
  const professores = getDb('professores');
  const disciplinas = getDb('disciplinas');

  profList.innerHTML = '';
  professores.forEach(prof => {
    profList.innerHTML += `<li>${prof.nome}</li>`;
  });

  discList.innerHTML = '';
  disciplinas.forEach(disc => {
    discList.innerHTML += `<li>${disc.nome}</li>`;
  });
}

// --- LÓGICA DO PAINEL DO PROFESSOR (US1) [cite: 20] ---

function initProfessorPanel() {
  // Popula o select de disciplinas
  const discSelect = document.getElementById('prof-disciplina');
  const disciplinas = getDb('disciplinas');
  discSelect.innerHTML = '<option value="">Selecione sua disciplina</option>';
  disciplinas.forEach(disc => {
    discSelect.innerHTML += `<option value="${disc.nome}">${disc.nome}</option>`;
  });

  // Listener do formulário
  document.getElementById('prof-form-horarios').addEventListener('submit', profAddHorario);
  
  // Renderiza horários existentes
  renderProfessorHorarios();
}

function profAddHorario(e) {
  e.preventDefault();
  const professorNome = localStorage.getItem('currentUsername');
  const disciplina = document.getElementById('prof-disciplina').value;
  const data = document.getElementById('prof-data').value;
  const hora = document.getElementById('prof-hora').value;

  if (!disciplina || !data || !hora) {
    alert('Preencha todos os campos!');
    return;
  }

  const horarios = getDb('horarios');
  horarios.push({
    id: Date.now(),
    professor: professorNome,
    disciplina,
    data,
    hora,
    agendado: false, // Indica se o horário está livre
  });
  saveDb('horarios', horarios);

  renderProfessorHorarios();
  e.target.reset();
}

function renderProfessorHorarios() {
  const listaHorarios = document.getElementById('prof-list-horarios');
  const professorNome = localStorage.getItem('currentUsername');
  
  const meusHorarios = getDb('horarios').filter(h => h.professor === professorNome);

  listaHorarios.innerHTML = '';
  if (meusHorarios.length === 0) {
    listaHorarios.innerHTML = '<li>Você ainda não cadastrou horários.</li>';
    return;
  }

  meusHorarios.forEach(h => {
    listaHorarios.innerHTML += `<li>
      ${h.disciplina} - ${new Date(h.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} às ${h.hora}
      <span>${h.agendado ? '(Agendado)' : '(Disponível)'}</span>
    </li>`;
  });
}


// --- LÓGICA DO PAINEL DO ALUNO (US2, US3) [cite: 21, 22] ---

function initAlunoPanel() {
  // Popula o filtro de disciplinas
  const filtroDisc = document.getElementById('aluno-filtro-disc');
  const disciplinas = getDb('disciplinas');
  disciplinas.forEach(disc => {
    filtroDisc.innerHTML += `<option value="${disc.nome}">${disc.nome}</option>`;
  });

  // Listener do filtro
  filtroDisc.addEventListener('change', renderAlunoHorarios);
  
  // Listener para os botões de agendar (usando delegação de evento)
  document.getElementById('aluno-list-horarios').addEventListener('click', alunoAgendarAula);

  // Renderiza a lista inicial
  renderAlunoHorarios();
}

function renderAlunoHorarios() {
  const listaContainer = document.getElementById('aluno-list-horarios');
  const filtro = document.getElementById('aluno-filtro-disc').value;
  
  let horarios = getDb('horarios').filter(h => h.agendado === false); // Apenas disponíveis

  // Aplica o filtro [cite: 21]
  if (filtro !== 'todas') {
    horarios = horarios.filter(h => h.disciplina === filtro);
  }

  listaContainer.innerHTML = '';
  if (horarios.length === 0) {
    listaContainer.innerHTML = '<p>Nenhum horário disponível encontrado para esta disciplina.</p>';
    return;
  }

  horarios.forEach(h => {
    listaContainer.innerHTML += `
      <div class="horario-card">
        <span><strong>${h.disciplina}</strong></span>
        <span>Prof. ${h.professor}</span>
        <span>${new Date(h.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} às ${h.hora}</span>
        <button class="btn btn-agendar" data-horario-id="${h.id}">
          Reservar Aula [cite: 22]
        </button>
      </div>
    `;
  });
}

function alunoAgendarAula(e) {
  // Verifica se o clique foi no botão de agendar
  if (e.target.classList.contains('btn-agendar')) {
    const horarioId = parseInt(e.target.dataset.horarioId, 10);
    
    // Confirmação
    const confirma = confirm('Você tem certeza que deseja reservar esta aula?');
    if (!confirma) {
      return;
    }

    // Atualiza o "banco de dados"
    const horarios = getDb('horarios');
    const horarioIndex = horarios.findIndex(h => h.id === horarioId);

    if (horarioIndex > -1) {
      horarios[horarioIndex].agendado = true;
      horarios[horarioIndex].aluno = localStorage.getItem('currentUsername');
      saveDb('horarios', horarios);
      
      // Feedback da Sprint 2 (US4) [cite: 23] - Simulado com 'alert'
      alert('Aula reservada com sucesso! [cite: 23]');

      // Re-renderiza a lista para remover o item agendado
      renderAlunoHorarios();
    }
  }
}