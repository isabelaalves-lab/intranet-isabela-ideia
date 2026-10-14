/* ================= 3. SESSÃO E PERMISSÕES ================= */
const me = () => {
  const s = get(K.S);
  return s ? get(K.U, []).find(u => u.email === s) : null;
};

const RANK = { auxiliar:0, analista:1, gerente:2, admin:3 };
const isAdm = u => !!u && u.role === 'admin';
const rhManager = () => get(K.U, []).find(x => x.setor === 'RH' && x.role === 'gerente');

const ROLE_DEFAULT = {
  admin:    {docs:true, comms:true,  train:true,  vagas:true,  occ:true,  admin:true},
  gerente:  {docs:true, comms:false, train:true,  vagas:true,  occ:true,  admin:false},
  analista: {docs:true, comms:false, train:true,  vagas:false, occ:false, admin:false},
  auxiliar: {docs:false,comms:false, train:false, vagas:false, occ:false, admin:false}
};

/* Permissão efetiva: matriz setor|cargo (admin) > default por role */
function perm(){
  const u = me(); 
  if(!u) return {};
  const p = get(K.P, {});
  return p[u.setor + '|' + u.cargo] || ROLE_DEFAULT[u.role] || {};
}
function cap(k){
  const u = me(); if(!u) return false;
  if(isAdm(u)) return true;
  return !!perm()[k];
}
function canEditDept(dep){
  const u = me(); if(!u) return false;
  if(isAdm(u) || u.setor === 'Diretoria') return true;
  return (u.role === 'gerente' || u.role === 'analista') && u.setor === dep;
}
function canCreateTrain(u){
  u = u || me();
  const t = temPerm(u, 'treinamentos');
  if(t !== null) return t;
  return isAdm(u) || RANK[u.role] >= 2;
}

/* ================= 4. ACESSO A DOCUMENTOS ================= */
/* Níveis: PUBLICO | RESTRITO_SETOR | SOLICITACAO | CONFIDENCIAL
   Retorno: 'open' | 'locked' | 'hidden'
   CONFIDENCIAL: só dono e admin — para os demais nem aparece. */
const NIVEL_LBL = {
  PUBLICO:'Público', RESTRITO_SETOR:'Restrito por setor',
  SOLICITACAO:'Com solicitação', CONFIDENCIAL:'Confidencial'
};

function docAccess(d, u){
  u = u || me();
  const adm = isAdm(u);
  if(d.nivel === 'CONFIDENCIAL')
    return (adm || d.dono === u.email) ? 'open' : 'hidden';
  if(d.nivel === 'PUBLICO') return 'open';
  if(d.nivel === 'RESTRITO_SETOR'){
    if(adm || d.dono === u.email || (d.aprovados||[]).includes(u.email)) return 'open';
    return u.setor === d.departamento ? 'open' : 'locked';
  }
  if(d.nivel === 'SOLICITACAO'){
    if(adm || d.dono === u.email || (d.aprovados||[]).includes(u.email)) return 'open';
    return 'locked';
  }
  return 'locked';
}

/* ================= 7. AUTENTICAÇÃO ================= */
function fillLogin(email, pass){
  document.getElementById('login-email').value = email;
  document.getElementById('login-pass').value = pass;
}
function togglePass(){
  const p = document.getElementById('login-pass');
  p.type = p.type === 'password' ? 'text' : 'password';
}

document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const em  = document.getElementById('login-email').value.trim().toLowerCase();
  const ps  = document.getElementById('login-pass').value;
  const err = document.getElementById('login-err');
  err.style.display = 'none';

  if(!em.endsWith('@italac.com.br')){
    err.textContent = 'Use um e-mail corporativo @italac.com.br.'; err.style.display = 'block'; return;
  }
  if(ps.length < 6){
    err.textContent = 'A senha deve ter no mínimo 6 dígitos.'; err.style.display = 'block'; return;
  }
  const u = get(K.U, []).find(x => x.email === em && x.senha === ps);
  if(!u){
    err.textContent = 'E-mail ou senha inválidos.'; err.style.display = 'block'; return;
  }
  set(K.S, u.email); // sessão persistente
  startApp();
});

function logout() {
  localStorage.removeItem(K.S);
  location.reload();
}
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
}

