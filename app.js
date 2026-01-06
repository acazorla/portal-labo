const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const mainContent = document.getElementById('main-content');
const loginError = document.getElementById('login-error');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const users = await loadUsers();
    const user = users.find(u => u.userName === username);
    
    if (user) {
      const hashedInput = await hashPassword(password);
      if (hashedInput === user.password) {
        loginContainer.style.display = 'none';
        mainContent.style.display = 'block';
        loadPatients(); // Load patients after login
      } else {
        loginError.style.display = 'block';
      }
    } else {
      loginError.style.display = 'block';
    }
  });
}
// Function to hash password using SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Load users from JSON
async function loadUsers() {
  try {
    const res = await fetch('data/users.json');
    const data = await res.json();
    return data.users || [];
  } catch (e) {
    console.error('Error loading users:', e);
    return [];
  }
}
async function loadPatients(){
  try{
    const res = await fetch('data/patients.json');
    const data = await res.json();
    window.patients = data.patients || [];
    renderPatients(window.patients);
  }catch(e){
    document.getElementById('patients').innerHTML = '<div class="empty">No se pudieron cargar los datos. Asegúrate de que <code>data/patients.json ???</code> existe.</div>';
    console.error(e);
  }
}

function formatDate(d){
  if(!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('es-ES');
}

function renderPatients(list){
  const container = document.getElementById('patients');
  if(!list.length){
    container.innerHTML = '<div class="empty">No hay pacientes en la lista.</div>';
    return;
  }
  container.innerHTML = '';
  for(const p of list){
    const card = document.createElement('article');
    card.className = 'card';

    const left = document.createElement('div');
    left.className = 'left';
    left.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">${escapeHtml(p.nombrePaciente)} <small class="card-meta">• ${escapeHtml(p.id)}</small></div>
          <div class="card-meta">F.Atención: ${formatDate(p.fechaAtencion)} • Nacimiento: ${formatDate(p.fechaNacimiento)} • Sexo: ${escapeHtml(p.sexo || '-')}</div>
        </div>
      </div>
    `;

    const right = document.createElement('div');
    right.className = 'right';

    if(p.examenes && p.examenes.length){
      const examenes = document.createElement('div');
      examenes.className = 'examenes';
      for(const e of p.examenes){
        const ex = document.createElement('div');
        ex.className = 'exam';
        const name = document.createElement('div');
        name.textContent = `${e.nombre} (${formatDate(e.fecha)})`;
        const link = document.createElement('div');
        const a = document.createElement('a');
        a.href = e.rutaExamen;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Ver';
        link.appendChild(a);
        ex.appendChild(name);
        ex.appendChild(link);
        examenes.appendChild(ex);
      }
      right.appendChild(examenes);
    }else{
      right.innerHTML = '<div class="empty">Sin exámenes registrados</div>';
    }

    card.appendChild(left);
    card.appendChild(right);
    container.appendChild(card);
  }
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g,function(s){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]);
  });
}

// Search
const searchInput = document.getElementById('search');
if(searchInput){
  searchInput.addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase();
    if(!q) return renderPatients(window.patients || []);
    const filtered = (window.patients||[]).filter(p=> {
      return p.nombrePaciente.toLowerCase().includes(q) || (p.id && p.id.toLowerCase().includes(q));
    });
    renderPatients(filtered);
  });
}
//------------------------------------------------------------------------------------------------------
// Password validation regex
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Function to validate password and update UI
function validatePassword(password) {
  const reqLength = document.getElementById('req-length');
  const reqUppercase = document.getElementById('req-uppercase');
  const reqNumber = document.getElementById('req-number');
  const reqSpecial = document.getElementById('req-special');

  const isValid = passwordRegex.test(password);
  reqLength.className = password.length >= 8 ? 'valid' : '';
  reqUppercase.className = /[A-Z]/.test(password) ? 'valid' : '';
  reqNumber.className = /\d/.test(password) ? 'valid' : '';
  reqSpecial.className = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'valid' : '';
  return isValid;
}

// Change password logic
const changePasswordBtn = document.getElementById('change-password-btn');
const changePasswordContainer = document.getElementById('change-password-container');
const changePasswordForm = document.getElementById('change-password-form');
const newPasswordInput = document.getElementById('new-password');
const changeError = document.getElementById('change-error');
const changeSuccess = document.getElementById('change-success');
const cancelChangeBtn = document.getElementById('cancel-change-btn');

if (changePasswordBtn) {
  changePasswordBtn.addEventListener('click', () => {
    changePasswordContainer.style.display = 'block';
  });
}

if (cancelChangeBtn) {
  cancelChangeBtn.addEventListener('click', () => {
    changePasswordContainer.style.display = 'none';
    changePasswordForm.reset();
    changeError.style.display = 'none';
    changeSuccess.style.display = 'none';
  });
}

if (newPasswordInput) {
  newPasswordInput.addEventListener('input', (e) => {
    validatePassword(e.target.value);
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = newPasswordInput.value.trim();
    
    if (validatePassword(newPassword)) {
      const hashedPassword = await hashPassword(newPassword);
      // Simulate saving to localStorage (in production, send to server)
      const currentUser = 'admin'; // Assuming logged-in user; adjust if needed
      let users = JSON.parse(localStorage.getItem('users')) || await loadUsers();
      const userIndex = users.findIndex(u => u.userName === currentUser);
      if (userIndex !== -1) {
        users[userIndex].password = hashedPassword;
        localStorage.setItem('users', JSON.stringify(users));
        changeSuccess.style.display = 'block';
        changeError.style.display = 'none';
        changePasswordForm.reset();
        changePasswordContainer.style.display = 'none';
      } else {
        changeError.style.display = 'block';
      }
    } else {
      changeError.style.display = 'block';
    }
  });
}

// Modify loadUsers to check localStorage first (for simulation)
async function loadUsers() {
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  try {
    const res = await fetch('data/users.json');
    const data = await res.json();
    return data.users || [];
  } catch (e) {
    console.error('Error loading users:', e);
    return [];
  }
}
//------------------------------------------------------------------------------------------------------
loadPatients();
