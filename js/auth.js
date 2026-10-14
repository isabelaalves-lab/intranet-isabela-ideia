/* ============================================================
   AUTH.JS  |  Intranet Italac
   Sessão, permissões, acesso a documentos e autenticação.
   ============================================================ */

/* ---------- Sessão ---------- */

const me = () => {
  const s = get(K.S);
  return s ? get(K.U, []).find(u => u.email === s) : null;
};

const isAdm = u => !!u && u.role === 'admin';

function rhManager() {
  return get(K.U, []).find(x => x.setor === 'RH' && x.role === 'gerente');
}

/* ---------- Permissões ----------
   Sistema por usuário: u.perms + padrões por papel.
   Removeu-se o sistema legado (ROLE_DEFAULT, RANK, perm() e cap()
   por matriz K.P), que o painel admin não grava mais. */

const PERM_PADRAO = {
  gerente:  { documentos: true, treinamentos: true, vagas: true, ocorrencias: true, calendario: true },
  analista: { documentos: true },
};

function temPerm(u, c) {
  if (!u) return false;
  if (u.role === 'admin' || (u.perms || {}).admin) return true;
  return (u.perms || {})[c] === true || !!(PERM_PADRAO[u.role] || {})[c];
}

function cap(c) { return temPerm(me(), c); }

function canComm(u)        { u = u || me(); return temPerm(u, 'comunicacao'); }
function canCreateTrain(u) { u = u || me(); return temPerm(u, 'treinamentos'); }
function canDoc(u)         { u = u || me(); return temPerm(u, 'documentos'); }
function canCal(u)         { u = u || me(); return temPerm(u, 'calendario'); }

function capEscopo(c, itemSetor) {
  const u = me();
  if (!u) return false;
  if (u.role === 'admin' || (u.perms || {}).admin) return true;
  const p = u.perms || {};
  if (p[c] !== true) return false;
  if (c === 'calendario') {
    const alvo = u.calSetor || 'todos';
    if (alvo === 'todos') return true;
    return depNorm(alvo) === depNorm(itemSetor);
  }
  if (!itemSetor) return true;
  return depNorm(u.setor) === depNorm(itemSetor);
}

function canEditDept(dep) {
  const u = me();
  if (!u) return false;
  if (isAdm(u) || u.setor === 'Diretoria') return true;
  return (u.role === 'gerente' || u.role === 'analista') && u.setor === dep;
}

function donoDaComunicacao(c) {
  const u = me();
  if (!u || !c) return false;
  const autor = String(c.autor || c.criadoPor || c.email || '').toLowerCase();
  return autor === String(u.email || '').toLowerCase();
}

function podeEditarComunicacao(c) {
  const u = me();
  if (!u) return false;
  if (u.role === 'admin' || (u.perms || {}).admin) return true;
  const p = u.perms || {};
  if (p.comunicacaoTodas) return true;
  if (p.comunicacaoPropria) return donoDaComunicacao(c);
  return false;
}

/* ---------- Acesso a documentos ----------
   Níveis: PUBLICO | RESTRITO_SETOR | SOLICITACAO | CONFIDENCIAL
   Retorno: 'open' | 'locked' | 'hidden'
   CONFIDENCIAL: só dono e admin, para os demais não aparece. */

const NIVEL_LBL = {
  PUBLICO: 'Público',
  RESTRITO_SETOR: 'Restrito por setor',
  SOLICITACAO: 'Com solicitação',
  CONFIDENCIAL: 'Confidencial',
};

function docAccess(d, u) {
  u = u || me();
  const adm = isAdm(u);
  if (d.nivel === 'CONFIDENCIAL') {
    return (adm || d.dono === u.email) ? 'open' : 'hidden';
  }
  if (d.nivel === 'PUBLICO') return 'open';
  const autorizado = adm || d.dono === u.email || (d.aprovados || []).includes(u.email);
  if (autorizado) return 'open';
  if (d.nivel === 'RESTRITO_SETOR') {
    return u.setor === d.departamento ? 'open' : 'locked';
  }
  return 'locked';
}

/* ---------- Autenticação ---------- */

function fillLogin(email, pass) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-pass').value = pass;
}

function togglePass() {
  const p = document.getElementById('login-pass');
  p.type = p.type === 'password' ? 'text' : 'password';
}

document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const em = document.getElementById('login-email').value.trim().toLowerCase();
  const ps = document.getElementById('login-pass').value;
  const err = document.getElementById('login-err');
  err.classList.add('hidden');

  if (!em.endsWith('@italac.com.br')) {
    err.textContent = 'Use um e-mail corporativo @italac.com.br.';
    err.classList.remove('hidden');
    return;
  }
  if (ps.length < 6) {
    err.textContent = 'A senha deve ter no mínimo 6 dígitos.';
    err.classList.remove('hidden');
    return;
  }
  const u = get(K.U, []).find(x => x.email === em && x.senha === ps);
  if (!u) {
    err.textContent = 'E-mail ou senha inválidos.';
    err.classList.remove('hidden');
    return;
  }
  set(K.S, u.email); // sessão persistente
  startApp();
});

function logout() {
  localStorage.removeItem(K.S);
  location.reload();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}