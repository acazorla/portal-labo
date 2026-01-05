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

loadPatients();
