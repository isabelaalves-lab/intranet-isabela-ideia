/* ============================================================
   INTRANET ITALAC — app.js
   PARTE 1 de 2
   Dados, sessão, login, navegação, notificações,
   Início, Comunicação, busca global e rodapé
   ============================================================ */
"use strict";

/* ================= 1. CHAVES DE PERSISTÊNCIA ================= */
const K = {
  U:'italac_users', S:'italac_session', D:'italac_docs',
  C:'italac_comms', T:'italac_trainings', J:'italac_jobs',
  O:'italac_occ', I:'italac_ideas', R:'italac_requests',
  P:'italac_perms', TOUR:'italac_tour_done'
};

const get = (k,f) => { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; };
const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const uid = () => Math.random().toString(36).slice(2,10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const v   = id => document.getElementById(id).value;
const initials = n => String(n||'').split(' ').filter(Boolean)
  .map(p => p[0]).slice(0,2).join('').toUpperCase();

/* ================= 2. DADOS INICIAIS (SEED) ================= */
const DEPTS = ['RH','Financeiro','TI','Marketing','Qualidade & BPF',
               'Jurídico & Compliance','Logística & Frota'];

const SEED_USERS = [
  {email:'admin@italac.com.br', senha:'admin123', nomeCompleto:'Administrador do Sistema',
   nomePreferido:'Admin', cargo:'Administrador', setor:'TI', unidade:'Goiânia',
   matricula:'ADM001', role:'admin', ramal:'4000', ingresso:'2019-03-04'},
  {email:'isabela.alves@italac.com.br', senha:'123456', nomeCompleto:'Isabela Alves',
   nomePreferido:'Isa', cargo:'Analista de Marketing', setor:'Marketing', unidade:'Goiânia',
   matricula:'MKT042', role:'analista', ramal:'4421', ingresso:'2022-01-10'},
  {email:'camila.torres@italac.com.br', senha:'123456', nomeCompleto:'Camila Torres',
   nomePreferido:'Camila', cargo:'Gerente de RH', setor:'RH', unidade:'Goiânia',
   matricula:'RH015', role:'gerente', ramal:'4102', ingresso:'2018-06-18'},
  {email:'helena.duarte@italac.com.br', senha:'123456', nomeCompleto:'Helena Duarte',
   nomePreferido:'Helena', cargo:'Diretora de Operações', setor:'Diretoria', unidade:'Goiânia',
   matricula:'DIR003', role:'admin', ramal:'4001', ingresso:'2015-02-02'},
  {email:'joao.silva@italac.com.br', senha:'123456', nomeCompleto:'João Silva',
   nomePreferido:'João', cargo:'Assistente Administrativo', setor:'Administrativo',
   unidade:'Goiânia', matricula:'ADM089', role:'auxiliar', ramal:'4233', ingresso:'2024-04-15'}
];

const mkDoc = (titulo, dep, nivel, dono) =>
  ({ id:uid(), titulo, departamento:dep, nivel, dono,
     aprovados:[dono], tamanho:'PDF • 1,2 MB' });

const SEED_DOCS = [
  mkDoc('Código de Conduta e Ética','RH','PUBLICO','camila.torres@italac.com.br'),
  mkDoc('Manual de Benefícios e Férias','RH','PUBLICO','camila.torres@italac.com.br'),
  mkDoc('Plano de Cargos e Salários','RH','RESTRITO_SETOR','camila.torres@italac.com.br'),
  mkDoc('Política de Viagens e Reembolso','Financeiro','SOLICITACAO','admin@italac.com.br'),
  mkDoc('Alçadas de Aprovação & Compras','Financeiro','RESTRITO_SETOR','admin@italac.com.br'),
  mkDoc('Segurança da Informação (PSI)','TI','PUBLICO','admin@italac.com.br'),
  mkDoc('Manual VPN & Suporte TI','TI','RESTRITO_SETOR','admin@italac.com.br'),
  mkDoc('Brandbook e Manual da Marca','Marketing','PUBLICO','isabela.alves@italac.com.br'),
  mkDoc('Guia de Execução no PDV','Marketing','PUBLICO','isabela.alves@italac.com.br'),
  mkDoc('Manual de BPF Fabril (POP-01)','Qualidade & BPF','PUBLICO','admin@italac.com.br'),
  mkDoc('APPCC / HACCP Linhas Lácteas','Qualidade & BPF','RESTRITO_SETOR','admin@italac.com.br'),
  mkDoc('Manual de Privacidade e LGPD','Jurídico & Compliance','PUBLICO','admin@italac.com.br'),
  mkDoc('Política Anticorrupção & Canal Ético','Jurídico & Compliance','SOLICITACAO','admin@italac.com.br'),
  mkDoc('Normas de Cadeia de Frio','Logística & Frota','RESTRITO_SETOR','admin@italac.com.br'),
  mkDoc('Auditoria Interna — Resultados Q3','Financeiro','CONFIDENCIAL','admin@italac.com.br')
];

const SEED_COMMS = [
  {id:uid(), titulo:'Italac atinge novo recorde de engajamento no LinkedIn',
   tipo:'Redes Sociais', tab:'empresa',
   conteudo:'Nossa página corporativa no LinkedIn ultrapassou 100 mil seguidores, impulsionada pela campanha "Lá em casa tem".',
   data:'22/09', autor:'isabela.alves@italac.com.br'},
  {id:uid(), titulo:'Inauguração da moderna Linha UHT em Anápolis',
   tipo:'Indústria & Produção', tab:'empresa',
   conteudo:'A nova linha UHT aumenta em 40% a capacidade de envase longa vida da unidade.',
   data:'14/09', autor:'isabela.alves@italac.com.br'},
  {id:uid(), titulo:'Ampliação da linha Zero Lactose e Whey',
   tipo:'Pesquisa & Inovação', tab:'empresa',
   conteudo:'Novas fórmulas chegam ao mercado nacional com foco em nutrição especializada.',
   data:'11/09', autor:'isabela.alves@italac.com.br'},
  {id:uid(), titulo:'TV Corporativa: mensagem especial da Diretoria Executiva',
   tipo:'Comunicação Interna', tab:'tv', dur:'08:45',
   conteudo:'Assista à mensagem de Helena Duarte sobre os resultados do trimestre.',
   data:'08/09', autor:'isabela.alves@italac.com.br'},
  {id:uid(), titulo:'Especial Gente Italac: parceria com o produtor rural',
   tipo:'TV Corporativa', tab:'tv', dur:'12:10',
   conteudo:'Conheça as histórias dos produtores que fornecem leite à Italac.',
   data:'05/09', autor:'isabela.alves@italac.com.br'},
  {id:uid(), titulo:'Preço do leite spot sobe no atacado em SP',
   tipo:'Mercado Lácteo', tab:'mercado',
   conteudo:'Leilões do setor registraram alta média de 3,2% na última quinzena.',
   data:'20/09', autor:'isabela.alves@italac.com.br'}
];

const SEED_TRAIN = [
  {id:uid(), titulo:'Boas Práticas de Fabricação (BPF)',   desc:'Treinamento obrigatório de controle sanitário.', tipo:'PDF',      data:'10/08'},
  {id:uid(), titulo:'Segurança em Máquinas (NR-12)',        desc:'Operação segura nas linhas de envase.',          tipo:'Vídeo',    data:'15/08'},
  {id:uid(), titulo:'Liderança Eficaz no Chão de Fábrica',  desc:'Capacitação para coordenadores e gerentes.',     tipo:'PDF',      data:'20/08'},
  {id:uid(), titulo:'Higienização e CIP em Tanques',        desc:'Procedimentos de esterilização.',                tipo:'Impresso', data:'25/08'},
  {id:uid(), titulo:'Brigada de Incêndio e Primeiros Socorros', desc:'Simulações práticas de evacuação.',          tipo:'Vídeo',    data:'02/09'}
];

const SEED_JOBS = [
  {id:uid(), titulo:'Supervisora de Envase UHT', setor:'Produção', unidade:'Anápolis',
   desc:'Liderar a equipe do turno B na linha UHT.', req:'Experiência em envase; liderança.',
   salario:'', status:'APROVADA', prazo:'25/10', solicitante:'admin@italac.com.br'},
  {id:uid(), titulo:'Especialista da Garantia da Qualidade', setor:'Qualidade & BPF', unidade:'Goiânia',
   desc:'Auditorias internas e liberação de lotes.', req:'CRF ativo; BPF/HACCP.',
   salario:'', status:'APROVADA', prazo:'30/10', solicitante:'admin@italac.com.br'},
  {id:uid(), titulo:'Assistente de Logística e Fretes', setor:'Logística & Frota', unidade:'Belo Horizonte',
   desc:'Cotações, roteirização e cadeia de frio.', req:'Pacote Office; desejável SAP.',
   salario:'', status:'APROVADA', prazo:'28/10', solicitante:'admin@italac.com.br'},
  {id:uid(), titulo:'Analista de Dados Power BI Pleno', setor:'TI', unidade:'Goiânia',
   desc:'Dashboards corporativos e governança de dados.', req:'DAX avançado; SQL.',
   salario:'', status:'APROVADA', prazo:'05/11', solicitante:'admin@italac.com.br'}
];

const SEED_OCC = [{
  id:uid(), email:'joao.silva@italac.com.br', data:'2026-09-18',
  tipo:'Esquecimento de Marcação', obs:'Esqueci a marcação da entrada.',
  status:'PENDENTE', setorSolicitante:'Administrativo', hist:[]
}];

const SEED_IDEAS = [{
  id:uid(), titulo:'Sensor de nível nos silos de leite cru',
  cat:'Processos Fabris', desc:'Evitar paradas por falta de nível no recebimento.',
  status:'Em análise', autor:'joao.silva@italac.com.br'
}];

function boot(){
  if(!get(K.U)) set(K.U, SEED_USERS);
  if(!get(K.D)) set(K.D, SEED_DOCS);
  if(!get(K.C)) set(K.C, SEED_COMMS);
  if(!get(K.T)) set(K.T, SEED_TRAIN);
  if(!get(K.J)) set(K.J, SEED_JOBS);
  if(!get(K.O)) set(K.O, SEED_OCC);
  if(!get(K.I)) set(K.I, SEED_IDEAS);
  if(!get(K.R)) set(K.R, []);
  if(!get(K.P)) set(K.P, {});
}
boot();
set(K.C, get(K.C, []).map(c => c.status ? c : Object.assign({}, c, { status:'publicado' })));
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

/* ================= 5. COMPONENTES GLOBAIS ================= */
function toast(msg, type){
  const t = document.createElement('div');
  t.className = 'toast ' + (type || '');
  t.textContent = msg;
  document.getElementById('toast-wrap').appendChild(t);
  setTimeout(() => t.remove(), 4200);
}
function openModal(html){
  document.getElementById('modal').innerHTML =
    '<button class="x" onclick="closeModal()">✕</button>' + html;
  document.getElementById('modal-bg').classList.add('on');
}
function closeModal(){ document.getElementById('modal-bg').classList.remove('on'); }
function ddOff(){ document.getElementById('user-dd').classList.remove('on'); }
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){ closeModal(); ddOff(); }
});
document.addEventListener('click', e => {
  if(!e.target.closest('.menu-wrap')) ddOff();
});

/* ================= 6. LOGO E REDES SOCIAIS ================= */
function logoHTML(light, src){
  return '<img src="' + (src || 'logo.png') + '?v=' + Date.now() + '" alt="Italac" class="logo-img">';
}
  const SOCIAL = [
  { n:'Instagram', u:'https://www.instagram.com/italac_oficial/',
    i:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'},
  { n:'Facebook', u:'https://www.facebook.com/ItalacOficial/?locale=pt_BR',
    i:'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'},
  { n:'LinkedIn', u:'https://br.linkedin.com/company/italacoficial',
    i:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'},
  { n:'YouTube', u:'https://www.youtube.com/c/italacoficial',
    i:'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'}
  ];
const socHTML = SOCIAL.map(s =>
  '<a href="' + s.u + '" target="_blank" title="' + s.n + '">' +
  '<svg viewBox="0 0 24 24"><path d="' + s.i + '"/></svg></a>').join('');

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
  set(K.S, u.email);   /* sessão persistente */
  startApp();
});

function logout(){
  localStorage.removeItem(K.S);
  location.reload();
}
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
}

/* ================= 8. NAVEGAÇÃO E RENDER ================= */
const PAGES = [
  ['inicio',' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>','Início'],
  ['comunicacao','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>','Comunicação'],
  ['documentos','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>','Políticas e Normas'],
  ['calendario','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>','Calendário'],
  ['departamentos','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>','Departamentos'],
  ['perfil','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>','Minha Conta'],
  ['treinamentos','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>','Treinamentos'],
  ['rh','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>','Recursos Humanos'],
  ['sustentabilidade','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>','Sustentabilidade'],
  ['ideias','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>','Inovação e Ideias'],
  ['vagas','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>','Vagas Internas'],
  ['ferramentas','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>','Programas e Ferramentas'],
  ['intranet','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>','Intranet Corporativa'],
  ['historia','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>','História da Italac']
];
let currentPage = 'inicio';

function buildNav(){
  const u = me();
  let h = '';
  PAGES.forEach(p => {
    h += '<button class="nav-item' + (currentPage === p[0] ? ' active' : '') +
         '" onclick="showPage(\'' + p[0] + '\')"><span class="ico">' + p[1] +
         '</span> ' + p[2] + '</button>';
  });
  if(isAdm(u)){
    h += '<button class="nav-item' + (currentPage === 'admin' ? ' active' : '') +
         '" onclick="showPage(\'admin\')"><span class="ico">⚙️</span> Administração</button>';
  }
  document.getElementById('nav').innerHTML = h;
}

function showPage(p){
  currentPage = p;
  buildNav();
  renderPage();
  ddOff();
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo(0,0);
}

function renderPage(){
  const u = me();
  document.getElementById('avatar-btn').textContent = initials(u.nomePreferido || u.nomeCompleto);
  const H = {
    inicio:pInicio, comunicacao:pComunicacao, documentos:pDocumentos,
    departamentos:pDepartamentos, perfil:pPerfil, treinamentos:pTreinamentos,
    rh:pRH, sustentabilidade:pSust, ideias:pIdeias, vagas:pVagas,
    ferramentas:pFerr, historia:pHist, admin:pAdmin,
    calendario:pCalendario,
    intranet:function(){ return pIntranetHub(); },
    'intra-rh':function(){ return pIntranetSetor('rh'); },
    'intra-fin':function(){ return pIntranetSetor('financeiro'); },
    'intra-mkt':function(){ return pIntranetSetor('marketing'); },
    'intra-ti':function(){ return pIntranetSetor('ti'); },
    'intra-adm':function(){ return pIntranetSetor('administrativo'); },
    'intra-dir':function(){ return pIntranetSetor('diretoria'); },
    'intra-prod':function(){ return pIntranetSetor('producao'); },
    'intra-qual':function(){ return pIntranetSetor('qualidade'); },
    'intra-jur':function(){ return pIntranetSetor('juridico'); },
    'intra-log':function(){ return pIntranetSetor('logistica'); }
  };
    if(!H[currentPage] && typeof intraList === 'function'){
    const alvo = intraList().find(x => (x.rota || 'intra-' + x.key) === currentPage);
    if(alvo){ document.getElementById('content').innerHTML = '<div class="page on">' + pIntranetSetor(alvo.key) + '</div>'; updateBadge(); return; }
  }
  document.getElementById('content').innerHTML =
    '<div class="page on">' + (H[currentPage] || pInicio)() + '</div>';
  updateBadge();
  
}

function startApp(){
  document.getElementById('login-screen').classList.add('hidden');
  const app = document.getElementById('app');
  app.classList.remove('hidden');   /* <-- correção: remove o !important */
  app.classList.add('on');

  /* Logos e redes */
  document.getElementById('logo-login').innerHTML = logoHTML(true);
document.getElementById('logo-side').innerHTML  = logoHTML(true, 'logo2.png');
  document.getElementById('logo-top').innerHTML   =logoHTML(true);
    '<div style="transform:scale(.62);transform-origin:left center">' + logoHTML(true) + '</div>';
  document.getElementById('social-side').innerHTML = socHTML;

  /* Rodapé com logo + redes */
  document.getElementById('site-footer').innerHTML =
    logoHTML(true, 'logo2.png') +
    '<div>© 2026 Goiasminas Indústria de Laticínios — Intranet Corporativa</div>' +
    '<div class="social-row" style="margin-left:auto">' + socHTML + '</div>';

  buildNav();
  renderPage();
  startClock();

  if(!get(K.TOUR)) setTimeout(startTour, 600);
}
/* Feriados nacionais fixos (MM-DD) + ponto facultativo do servidor público */
const CAL_FERIADOS_FIXOS = {
  '01-01':'Confraternização Universal',
  '04-21':'Tiradentes',
  '05-01':'Dia do Trabalho',
  '09-07':'Independência do Brasil',
  '10-12':'Nossa Senhora Aparecida',
  '10-28':'Dia do Servidor Público*',
  '11-02':'Finados',
  '11-15':'Proclamação da República',
  '11-20':'Dia da Consciência Negra',
  '12-25':'Natal'
};

/* Datas móveis: Carnaval, Sexta-Feira Santa e Corpus Christi a partir da Páscoa (algoritmo de Gauss) */
function calFeriados(ano){
  const out = {};
  Object.keys(CAL_FERIADOS_FIXOS).forEach(k => out[ano + '-' + k] = CAL_FERIADOS_FIXOS[k]);
  const a = ano % 19, b = Math.floor(ano/100), c = ano % 100;
  const d = Math.floor(b/4), e = b % 4, f = Math.floor((b+8)/25), g = Math.floor((b-f+1)/3);
  const h = (19*a + b - d - g + 15) % 30, i = Math.floor(c/4), k = c % 4;
  const l = (32 + 2*e + 2*i - h - k) % 7, m = Math.floor((a + 11*h + 22*l)/451);
  const mesP = Math.floor((h + l - 7*m + 114)/31), diaP = ((h + l - 7*m + 114) % 31) + 1;
  const pascoa = new Date(ano, mesP - 1, diaP);
  const add = (dias, nome) => {
    const dt = new Date(pascoa.getTime() + dias*86400000);
    out[dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0')] = nome;
  };
  add(-48, 'Carnaval');
  add(-47, 'Carnaval');
  add(-2, 'Sexta-Feira Santa');
  add(60, 'Corpus Christi');
  return out;
}
/* ================= 9. RELÓGIO E NOTIFICAÇÕES ================= */
function startClock(){
  const tick = () => {
    const n = new Date();
    document.getElementById('clock').textContent =
      n.toLocaleDateString('pt-BR') + ' • ' +
      n.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  };
  tick(); setInterval(tick, 1000);
}

function pendingFor(u){
  let n = 0;
  /* Vagas aguardando aprovação do RH (só gerente de RH) */
  if(u.setor === 'RH' && u.role === 'gerente')
    n += get(K.J, []).filter(j => j.status === 'PENDENTE_RH').length;
  /* Ocorrências pendentes no setor do gerente (nunca admin) */
  if(u.role === 'gerente' && u.setor !== 'RH')
    n += get(K.O, []).filter(o => o.status === 'PENDENTE' && o.setorSolicitante === u.setor).length;
  /* Ocorrências aprovadas pelo gerente aguardando o RH (só gerente de RH) */
  if(u.setor === 'RH' && u.role === 'gerente')
    n += get(K.O, []).filter(o => o.status === 'APROVADA_GERENTE').length;
  return n;
}

function updateBadge(){
  const u = me(); if(!u) return;
  const n = pendingFor(u);
  const d = document.getElementById('notif-dot');
  d.classList.toggle('on', n > 0);
  d.textContent = n;
}

function showNotifs(){
  const u = me();
  const items = [];

  /* Solicitações de acesso pendentes → aba de solicitações do admin */
  if(isAdm(u))
    get(K.R, []).filter(r => r.status === 'PENDENTE')
      .forEach(r => items.push({
        icone:'🔔',
        texto:'Solicitação de acesso pendente: <b>' + esc(r.docTitulo) + '</b> — ' + esc(r.nome),
        ir:function(){ currentPage='admin'; adminTab='reqs'; closeModal(); renderPage(); }
      }));

  /* Vagas aguardando RH → página de vagas */
  if((u.setor === 'RH' && u.role === 'gerente') || isAdm(u)){
    get(K.J, []).filter(j => j.status === 'PENDENTE_RH')
      .forEach(j => items.push({
        icone:'💼',
        texto:'Vaga aguardando aprovação do RH: <b>' + esc(j.titulo) + '</b>',
        ir:function(){ currentPage='vagas'; closeModal(); renderPage(); }
      }));
    get(K.O, []).filter(o => o.status === 'APROVADA_GERENTE')
      .forEach(o => items.push({
        icone:'⏱️',
        texto:'Ocorrência de ponto aprovada pelo gerente, aguardando RH',
        ir:function(){ currentPage='ocorrencias'; closeModal(); renderPage(); }
      }));
  }

  /* Ocorrências pendentes no setor do gerente → página de ocorrências */
  if(u.role === 'gerente' && u.setor !== 'RH')
    get(K.O, []).filter(o => o.status === 'PENDENTE' && o.setorSolicitante === u.setor)
      .forEach(o => items.push({
        icone:'⏱️',
        texto:'Ocorrência de ponto pendente no seu setor',
        ir:function(){ currentPage='ocorrencias'; closeModal(); renderPage(); }
      }));

  if(!items.length){
    openModal('<h3>🔔 Notificações</h3><p class="meta" style="margin-top:10px">Nenhuma notificação nova. Tudo em dia! ✅</p>');
    return;
  }

  window.__notifItems = items;

  openModal('<h3>🔔 Notificações</h3>' +
    '<p class="doc-size" style="margin:2px 0 10px">Clique em uma notificação para ir até ela.</p>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    items.map((i, idx) =>
      '<button type="button" class="btn btn-ghost" style="justify-content:flex-start;text-align:left;white-space:normal;height:auto;line-height:1.35;padding:10px 12px" onclick="abreNotif(' + idx + ')">' +
      i.icone + ' ' + i.texto + '</button>').join('') +
    '</div>');
}

/* Chamado pelo clique: fecha o modal e executa o destino da notificação */
function abreNotif(idx){
  const itens = window.__notifItems || [];
  const alvo = itens[idx];
  if(!alvo) return;
  closeModal();
  alvo.ir();
}

/* ================= 10. BUSCA GLOBAL ================= */
const ROTAS_BUSCA = [
  ['holerite','rh'],['ponto','rh'],['ocorrencia','rh'],['vaga','rh'],
  ['documento','documentos'],['política','documentos'],['norma','documentos'],
  ['treinamento','treinamentos'],['bpf','treinamentos'],['nr-12','treinamentos'],
  ['comunicação','comunicacao'],['notícia','comunicacao'],['tv','comunicacao'],
  ['vaga','vagas'],['candidato','vagas'],
  ['sustentabilidade','sustentabilidade'],['reciclagem','sustentabilidade'],
  ['ideia','ideias'],['inovação','ideias'],
  ['sap','ferramentas'],['power bi','ferramentas'],['fluig','ferramentas'],
  ['organograma','departamentos'],['fábrica','departamentos'],
  ['história','historia'],['perfil','perfil'],['conta','perfil']
];
const ROTULO_BUSCA = {
  'rh':'Recursos Humanos','documentos':'Documentos','treinamentos':'Treinamentos',
  'comunicacao':'Comunicação','vagas':'Vagas','sustentabilidade':'Sustentabilidade',
  'ideias':'Caixa de Ideias','ferramentas':'Ferramentas','departamentos':'Departamentos',
  'historia':'História','perfil':'Meu Perfil'
};
const ICONE_BUSCA = {
  'rh':'👥','documentos':'📄','treinamentos':'📚','comunicacao':'📣',
  'vagas':'💼','sustentabilidade':'🌱','ideias':'💡','ferramentas':'🛠️',
  'departamentos':'🏢','historia':'🏛️','perfil':'👤'
};

let gsInp = null, gsBox = null;

function listaSugestoes(q){
  const vistos = {}, out = [];
  ROTAS_BUSCA.forEach(r => {
    if(vistos[r[0]]) return;
    vistos[r[0]] = true;
    out.push({ k:r[0], p:r[1], ic:ICONE_BUSCA[r[1]] || '🔎' });
  });
  if(q) return out.filter(s => s.k.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  return out.slice(0, 8);
}

function hideSugestoes(){
  if(gsBox) gsBox.style.display = 'none';
}

function posicionaSugestoes(){
  if(!gsInp || !gsBox) return;
  const r = gsInp.getBoundingClientRect();
  gsBox.style.position = 'fixed';
  gsBox.style.top = (r.bottom + 4) + 'px';
  gsBox.style.left = r.left + 'px';
  gsBox.style.width = r.width + 'px';
}

function renderSugestoes(q){
  if(!gsBox) return;
  const lista = listaSugestoes(q);
  if(!lista.length){ hideSugestoes(); return; }
  gsBox.innerHTML = lista.map(s =>
    '<div class="gs-sug" data-k="' + s.k + '" onmousedown="event.preventDefault();gsEscolhe(this)">' +
      '<span>' + s.ic + '</span>' +
      '<div><b>' + esc(s.k) + '</b><small>Ir para ' + esc(ROTULO_BUSCA[s.p] || s.p) + '</small></div>' +
    '</div>').join('');
  posicionaSugestoes();
  gsBox.style.display = 'block';
}

function gsEscolhe(el){
  const k = el.getAttribute('data-k');
  if(gsInp) gsInp.value = k;
  hideSugestoes();
  doSearch();
}

function injetaCSSBusca(){
  if(document.getElementById('gs-css')) return;
  const st = document.createElement('style');
  st.id = 'gs-css';
  st.textContent =
    '#busca-sugestoes{display:none;background:#fff;border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 8px 24px rgba(15,42,94,.12);z-index:9999;overflow:hidden}' +
    '.gs-sug{display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;border-bottom:1px solid #eef2f8}' +
    '.gs-sug:last-child{border-bottom:none}' +
    '.gs-sug:hover{background:#f0f4fb}' +
    '.gs-sug > span{font-size:1rem}' +
    '.gs-sug b{display:block;font-size:.82rem;color:#0f2a5e;text-transform:capitalize}' +
    '.gs-sug small{display:block;font-size:.72rem;color:#64748b}';
  document.head.appendChild(st);
}

function initBuscaSugestoes(){
  const inp = document.getElementById('global-search');
  if(!inp) return;
  gsInp = inp;
  inp.setAttribute('autocomplete', 'off');
  const box = document.createElement('div');
  box.id = 'busca-sugestoes';
  document.body.appendChild(box);
  gsBox = box;
  injetaCSSBusca();
  inp.addEventListener('input', function(){ renderSugestoes(this.value.trim()); });
  inp.addEventListener('focus', function(){ renderSugestoes(this.value.trim()); });
  inp.addEventListener('keydown', function(e){ if(e.key === 'Escape') hideSugestoes(); });
  document.addEventListener('click', function(e){
    if(gsInp && !gsInp.contains(e.target) && gsBox && !gsBox.contains(e.target)) hideSugestoes();
  });
  window.addEventListener('scroll', hideSugestoes, true);
}

function doSearch(){
  const q = document.getElementById('global-search').value.trim().toLowerCase();
  if(!q) return;
  const hit = ROTAS_BUSCA.find(r => q.includes(r[0]));
  if(hit){ showPage(hit[1]); toast('Resultado encontrado em "' + ROTULO_BUSCA[hit[1]] + '".', 'ok'); }
  else { toast('Nada encontrado para "' + q + '". Tente: holerite, BPF, vaga, ideia...', 'warn'); }
  document.getElementById('global-search').value = '';
  hideSugestoes();
}
document.addEventListener('DOMContentLoaded', function(){
  initBuscaSugestoes();
});
/* ================= 11. PÁGINA: INÍCIO ================= */
function tenure(u){
  const d = new Date(u.ingresso || '2021-06-01');
  const m = Math.max(0, Math.floor((Date.now() - d) / 2629800000));
  return Math.floor(m/12) + ' anos e ' + (m%12) + ' meses';
}
function pInicio(){
  const u = me();
  const can = isAdm(u) || (u.setor === 'Marketing' && RANK[u.role] >= 1);
const todas = get(K.C, []).filter(c => c.tab === 'empresa' && c.status === 'publicado');
  const principal = todas.find(c => c.dest) || null;
  const demais = todas.filter(c => c.id !== (principal ? principal.id : null));
  const visiveis = demais.slice(0, 3);                     // máximo de 3
  const restantes = demais.length - visiveis.length;       // quantas ficaram fora
  function cardNoticia(f, estilo){
    return '<div class="' + estilo + '" onclick="openComm(\'' + f.id + '\')">' +
      (f.img ? '<img src="' + esc(f.img) + '" alt="' + esc(f.titulo) + '">' : '') +
      '<div class="feat-body">' +
      (f.dest ? '<span class="badge bg-or">★ Destaque da Home</span> ' : '') +
      '<span class="badge bg-or"> ' + esc(f.tipo) + ' • </span> <span class="meta">' + esc(f.data) + '</span>' +
      '<h4>' + esc(f.titulo) + '</h4><p>' + esc(f.conteudo) + '</p>' +
      '<span class="meta" style="color:rgb(253, 80, 0)">Ver matéria</span>' +
     '</div></div>';
  }
  const bd = [
    ['Aline Rocha','Garantia da Qualidade • Goiânia','18/10'],
    ['Marcos Prado','Logística e Frota • Anápolis','21/10'],
    ['Camila Silveira','Controladoria • Belo Horizonte','24/10'],
    ['Diego Fontes','Manutenção Industrial • Campinas','29/10']
  ];
  return '<div class="hero"><h1>Olá, ' + esc(u.nomeCompleto) + '! Bem-vindo à Intranet Italac </h1>' +
    '<p>Seu ponto de encontro corporativo com notícias, documentos operacionais, processos de fábrica e canais da Goiasminas Indústria de Laticínios.</p>' +
    ' <div class="slogan-pill">Lá em casa tem dedicação e qualidade em cada gota</div></div>' +
    '<div class="grid2" style="margin-top:20px">' +
      '<div><h2 class="sec"><span class="train-accent-des"></span>Destaque Corporativo</h2>' +
        (principal ? cardNoticia(principal, 'feat')
          : '<div class="card"><p class="meta" style="margin:0">Nenhuma notícia destacada.</p>' +
            '<p class="sub-text" style="font-size:.78rem;margin-top:6px">Veja outras Noticias abaixo!</p></div>') +
      '</div>' +
      '<div class="card"><h3 class="navy-text" style="font-size:1rem;margin-bottom:10px"> Aniversariantes do Mês (Outubro)</h3>' +
        bd.map(b =>
          '<div class="bday"><div class="mini-av">' + initials(b[0]) + '</div>' +
          '<div><b style="font-size:.86rem">' + b[0] + '</b>' +
          '<div style="font-size:.72rem;color:var(--muted)">' + b[1] + '</div></div>' +
          '<div class="d">' + b[2] + '</div></div>').join('') +
      '</div>' +
    '</div>' +
    (visiveis.length ?
      '<h2 class="sec" style="margin-top:24px"><span class="train-accent-des"></span> Notícias da Empresa</h2>' +
      '<div class="gridcomunic">' + visiveis.map(f => cardNoticia(f, 'feat-comunicacao')).join('') + '</div>' +
      (restantes > 0 ?
        '<div style="text-align:center;margin-top:14px">' +
        '<button class="btn btn-primary" onclick="currentPage=\'comunicacao\';commTab=\'empresa\';renderPage()">Ver mais (' + restantes + ')</button>' +
        '</div>' : '')
      : '') +
    '<div class="card" style="margin-top:20px"><h3 class="navy-text" style="font-size:1rem">Seu Tempo de Casa</h3>' +
    '<p class="sub-text" style="margin-top:6px">Ingresso em ' +
      new Date(u.ingresso || '2021-06-01').toLocaleDateString('pt-BR', {month:'long', year:'numeric'}) +
      ' • Setor ' + esc(u.setor) + '</p>' +
    '<div class="countup">' + tenure(u) + '</div></div>';
}
/* ================= 12. PÁGINA: COMUNICAÇÃO ================= */
let commTab = 'tv';
function canComm(u){
  u = u || me();
  if(!u) return false;
  if(u.role === 'admin' || (u.perms || {}).admin) return true;
  const p = u.perms || {};
  return !!(p.comunicacao || p.comunicacaoPropria || p.comunicacaoTodas);
}
function rankOf(u){ return RANK[(u && u.role)] || 1; }
function podeAprovar(u){
  u = u || me();
  return !!(u && (u.role === 'gerente' || u.role === 'admin' || (u.perms || {}).admin));
}
/* Auxiliar e analista precisam de aprovação de cargo maior; gerente/admin não */
function precisaAprovacao(u){
  u = u || me();
  if(!u) return false;
  return rankOf(u) < RANK.gerente;
}
function autorPrecisaAprovacao(c){
  const autor = get(K.U, []).find(x => x.email === c.autor);
  return precisaAprovacao(autor);
}

function pComunicacao(){
  const u = me(), can = canComm();
  const tabs = [['tv','TV Corporativa'],['mercado','Mercado Lácteo'],['empresa','Notícias da Empresa']];
  if(can) tabs.push(['rascunho','📝 Rascunhos']);
  if(podeAprovar(u)) tabs.push(['aprovacao','✅ Aprovações']);

  const list = get(K.C, []).filter(c => {
    if(commTab === 'rascunho')
      return can && c.status === 'rascunho' && c.autor === u.email;
    if(commTab === 'aprovacao')
      return podeAprovar() && c.status === 'pendente';
    return c.status === 'publicado' && c.tab === commTab;
  }).sort((a, b) => (a.dest === b.dest) ? 0 : (a.dest ? -1 : 1));

  /* Paginação em blocos de 6 */
  const qtd = commQtd[commTab] || 6;
  const visiveis = list.slice(0, qtd);
  const temMais = list.length > qtd;

  return '<h2 class="sec"><span class="train-accent-des"></span> Comunicação Corporativa' +
    (can ? ' <button class="btn btn-primary btn-sm" onclick="commForm()">+ Nova Comunicação</button>' : '') + '</h2>' +
    '<div class="tabs">' + tabs.map(t =>
      '<button class="tab' + (commTab === t[0] ? ' active' : '') +
      '" onclick="commTab=\'' + t[0] + '\';commQtd[\'' + t[0] + '\']=6;renderPage()">' + t[1] + '</button>').join('') + '</div>' +
    '<div class="card" style="margin-bottom:16px"><b class="navy-text">Siga a Italac</b>' +
    '<p class="sub-text" style="margin:4px 0 10px">Acompanhe a marca nas redes oficiais, abrem em nova aba.</p>' +
    '<div class="social-row">' + SOCIAL.map(s =>
      '<a href="' + s.u + '" target="_blank" style="background:var(--navy)" title="' + s.n + '">' +
      '<svg viewBox="0 0 24 24"><path d="' + s.i + '"/></svg></a>').join('') + '</div></div>' +
    '<div class="gridcomunic">' +
    (visiveis.map(c =>
      '<div class="feat-comunicacao' + (c.dest ? ' destacada' : '') + '" style="cursor:pointer" onclick="openComm(\'' + c.id + '\')">' +
      (c.img ? '<img src="' + esc(c.img) + '" alt="' + esc(c.titulo) + '">' : '') +
      '<div class="feat-body">' +
      (c.status === 'rascunho' ? '<span class="badge bg-sk">📝 Rascunho</span> ' : '') +
      (c.status === 'pendente' ? '<span class="badge bg-or">⏳ Aguardando aprovação</span> ' : '') +
      (c.dest ? '<span class="badge bg-or">★ Destaque da Home</span> ' : '') +
      '<span class="badge bg-or">' + esc(c.tipo) + '</span> ' +
      '<span class="meta">' + esc(c.data) + (c.dur ? ' • ' + c.dur : '') + '</span>' +
      '<h4>' + esc(c.titulo) + '</h4><p>' + esc(c.conteudo) + '</p>' +
      (c.fonte ? '<div class="doc-size" style="margin-bottom:6px">Fonte: ' + esc(c.fonte) + '</div>' : '') +
            (c.status === 'rascunho'
        ? '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          (c.aprovacao && c.aprovacao.status === 'recusado'
            ? '<div style="background:#fdecea;border:1px solid #f5c6c6;border-radius:8px;padding:8px 10px;margin-bottom:8px;font-size:.8rem;width:100%">' +
              '<b style="color:#c0392b">❌ Recusada por ' + esc(c.aprovacao.recusadoPor || '') + '</b>' +
              (c.aprovacao.recusadoEm ? ' <span class="doc-size">em ' + esc(c.aprovacao.recusadoEm) + '</span>' : '') +
              '<div style="margin-top:4px">' + esc(c.aprovacao.observacao || '') + '</div>' +
              '</div>' : '') +
          (c.aprovacao && c.aprovacao.status === 'pendente'
            ? '<span class="badge bg-or">⏳ Em análise</span>' +
              '<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();cancelarAprovacao(\'' + c.id + '\')">↩️ Cancelar envio</button>'
            : (autorPrecisaAprovacao(c)
                ? '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();enviarAprovacao(\'' + c.id + '\')">📤 Enviar para aprovação</button>'
                : '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();publicarComm(\'' + c.id + '\')">✅ Publicar</button>') +
              '<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();commForm(\'' + c.id + '\')">✏️ Editar</button>' +
              '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="event.stopPropagation();delComm(\'' + c.id + '\')">🗑 Excluir</button>') +
          '</div>'
        : c.status === 'pendente'
          ? '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
            '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();aprovarComm(\'' + c.id + '\')">✅ Aprovar e publicar</button>' +
            '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="event.stopPropagation();recusarComm(\'' + c.id + '\')">❌ Recusar</button>' +
            '</div>'
          : (podeEditarComunicacao(c) ?
            (commTab === 'empresa' ?
              '<button class="btn btn-ghost btn-sm" style="margin-top:8px;color:#e67e22" onclick="event.stopPropagation();destaqueComm(\'' + c.id + '\')">' + (c.dest ? '★ Remover destaque' : '★ Destacar no Inicio') + '</button>' : '') +
            '<button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="event.stopPropagation();commForm(\'' + c.id + '\')">✏️ Editar</button>' +
            '<button class="btn btn-ghost btn-sm" style="margin-top:8px;color:#c0392b" onclick="event.stopPropagation();delComm(\'' + c.id + '\')">🗑 Excluir</button>' : '')) +
      '</div></div>').join('') ||
    '<p class="meta">Nenhuma publicação nesta aba.</p>') +
    '</div>' +
    (temMais ?
      '<div style="text-align:center;margin-top:16px">' +
      '<button class="btn btn-ghost" onclick="commVerMais()">Ver mais (' + (list.length - qtd) + ')</button>' +
      '</div>' : '');
}
function commForm(id){
  const c = get(K.C, []).find(x => x.id === id) || {};
  openModal('<h3>' + (id ? 'Editar' : 'Nova') + ' Comunicação</h3>' +
    '<p class="doc-size" style="margin:2px 0 8px">' + (id ? 'Edite os dados abaixo.' : 'Ao salvar, a comunicação vai para a aba 📝 Rascunhos. Se precisar de aprovação, você envia para um cargo maior.') + '</p>' +
    '<label>Título *</label><input id="c-t" required value="' + esc(c.titulo || '') + '">' +
    '<label>Tipo *</label><select id="c-tp" required>' +
      ['Redes Sociais','Indústria & Produção','Pesquisa & Inovação','Comunicação Interna','TV Corporativa','Mercado Lácteo']
      .map(t => '<option ' + (c.tipo === t ? 'selected' : '') + '>' + t + '</option>').join('') + '</select>' +
    '<label>Aba *</label><select id="c-tab" required>' +
      [['tv','TV Corporativa'],['mercado','Mercado Lácteo'],['empresa','Empresa']]
      .map(t => '<option value="' + t[0] + '" ' + (c.tab === t[0] ? 'selected' : '') + '>' + t[1] + '</option>').join('') + '</select>' +
    '<label>Imagem *</label>' +
    '<div style="display:flex;gap:8px;align-items:center">' +
      '<button class="btn btn-sm" style="background:var(--sky);color:#fff" ' +
        'onclick="document.getElementById(\'c-file\').click()">📷 Escolher imagem</button>' +
      '<input type="file" id="c-file" accept="image/*" style="display:none" onchange="readImg(this)">' +
      '<input type="hidden" id="c-img" required value="' + esc(c.img || '') + '">' +
      '<img id="c-preview" src="' + esc(c.img || '') + '" alt="" ' +
        'style="display:' + (c.img ? 'block' : 'none') + ';width:44px;height:44px;object-fit:cover;border-radius:8px">' +
      '<button id="c-rmbtn" class="btn btn-ghost btn-sm" ' +
        'style="display:' + (c.img ? 'inline-block' : 'none') + '" onclick="clearImg()">✖ Remover</button>' +
    '</div>' +
    '<label>Conteúdo *</label><textarea id="c-x" rows="4" required>' + esc(c.conteudo || '') + '</textarea>' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="saveComm(\'' + (id || '') + '\')">' + (id ? 'Salvar alterações' : 'Salvar rascunho') + '</button>');
}
function sv(id){ const el = document.getElementById(id); return el ? el.value : ''; }

function saveComm(id){
  const u = me();
  const list = get(K.C, []);
  const titulo = sv('c-t'), tipo = sv('c-tp'), tab = sv('c-tab'),
        img = sv('c-img'), conteudo = sv('c-x');
  if(!titulo.trim()){ toast('Preencha o título.', 'err'); return; }
  if(!tipo){ toast('Selecione o tipo.', 'err'); return; }
  if(!tab){ toast('Selecione a aba.', 'err'); return; }
  if(!img){ toast('Escolha uma imagem.', 'err'); return; }
  if(!conteudo.trim()){ toast('Preencha o conteúdo.', 'err'); return; }
  const antiga = id ? (list.find(x => x.id === id) || {}) : {};
  const precisa = precisaAprovacao(u);
  const o = {
    id: id || uid(), titulo:titulo, tipo:tipo, tab:tab,
    img:img, conteudo:conteudo,
    data: antiga.data || new Date().toLocaleDateString('pt-BR').slice(0,5),
    autor: antiga.autor || u.email,
    dest: antiga.dest,
    status: antiga.status || 'rascunho',
    aprovacao: antiga.aprovacao || (precisa ? { status:'nao_enviado' } : { status:'dispensada' }),
    fonte: antiga.fonte || ''
  };
  if(id){ set(K.C, list.map(x => x.id === id ? o : x)); toast('Comunicação atualizada.', 'ok'); }
  else  { list.unshift(o); set(K.C, list); toast('Rascunho salvo na aba 📝 Rascunhos.', 'ok'); }
  closeModal(); renderPage();
}

/* ===== FLUXO DE APROVAÇÃO ===== */
function enviarAprovacao(id){
  const u = me();
  const list = get(K.C, []);
  const alvo = list.find(c => c.id === id);
  if(!alvo) return;
  if(alvo.autor !== u.email){ toast('Somente o autor pode enviar.', 'err'); return; }
  set(K.C, list.map(c => c.id === id
    ? Object.assign({}, c, { status:'pendente', aprovacao: Object.assign({}, c.aprovacao, { status:'pendente', enviadoEm: new Date().toLocaleDateString('pt-BR') }) })
    : c));
  toast('Enviado para aprovação.', 'ok');
  renderPage();
}
function cancelarAprovacao(id){
  const u = me();
  const list = get(K.C, []);
  const alvo = list.find(c => c.id === id);
  if(!alvo) return;
  if(alvo.autor !== u.email){ toast('Somente o autor pode cancelar.', 'err'); return; }
  set(K.C, list.map(c => c.id === id
    ? Object.assign({}, c, { status:'rascunho', aprovacao: Object.assign({}, c.aprovacao, { status:'nao_enviado' }) })
    : c));
  toast('Envio cancelado.', 'ok');
  renderPage();
}
function aprovarComm(id){
  const u = me();
  if(!podeAprovar(u)){ toast('Sem permissão para aprovar.', 'err'); return; }
  const list = get(K.C, []);
  const alvo = list.find(c => c.id === id);
  if(!alvo) return;
  set(K.C, list.map(c => c.id === id
    ? Object.assign({}, c, { status:'publicado', aprovacao: Object.assign({}, c.aprovacao, { status:'aprovado', aprovadoPor: u.email, aprovadoEm: new Date().toLocaleDateString('pt-BR') }) })
    : c));
  toast('Comunicação aprovada e publicada.', 'ok');
  renderPage();
}
function recusarComm(id){
  const u = me();
  if(!podeAprovar(u)){ toast('Sem permissão para recusar.', 'err'); return; }
  const list = get(K.C, []);
  const alvo = list.find(c => c.id === id);
  if(!alvo) return;
  openModal('<h3>❌ Recusar comunicação</h3>' +
    '<p class="doc-size" style="margin:2px 0 8px">Informe o motivo da recusa. O autor verá esta observação ao reabrir o rascunho.</p>' +
    '<label>Observação (obrigatória)</label>' +
    '<textarea id="rec-obs" rows="4" placeholder="Ex.: Ajustar o título para refletir a fonte oficial antes de republicar."></textarea>' +
    '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' +
      '<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>' +
      '<button class="btn btn-primary" style="background:#c0392b;border-color:#c0392b" onclick="recusarCommFinal(\'' + id + '\')">❌ Confirmar recusa</button>' +
    '</div>');
}
function recusarCommFinal(id){
  const u = me();
  if(!podeAprovar(u)){ toast('Sem permissão para recusar.', 'err'); return; }
  const obs = (document.getElementById('rec-obs') || {}).value || '';
  if(!obs.trim()){ toast('Informe a observação da recusa.', 'err'); return; }
  const list = get(K.C, []);
  const alvo = list.find(c => c.id === id);
  if(!alvo) return;
  set(K.C, list.map(c => c.id === id
    ? Object.assign({}, c, {
        status: 'rascunho',
        aprovacao: Object.assign({}, c.aprovacao, {
          status: 'recusado',
          recusadoPor: u.email,
          observacao: obs.trim(),
          recusadoEm: new Date().toLocaleDateString('pt-BR')
        })
      })
    : c));
  toast('Comunicação recusada, voltou para rascunho.', 'ok');
  renderPage();
}
function publicarComm(id){
  const u = me(), list = get(K.C, []);
  const alvo = list.find(c => c.id === id);
  if(!alvo) return;
  if(!(alvo.autor === u.email || podeAprovar(u))){ toast('Sem permissão para publicar.', 'err'); return; }
  if(autorPrecisaAprovacao(alvo) && !podeAprovar(u)){ toast('Esta comunicação precisa de aprovação.', 'err'); return; }
  if(!alvo.img){ toast('Adicione uma imagem antes de publicar.', 'err'); commForm(id); return; }
  set(K.C, list.map(c => c.id === id
    ? Object.assign({}, c, { status:'publicado', aprovacao:Object.assign({}, c.aprovacao, { status:'dispensada' }) }) : c));
  toast('Notícia publicada no canal oficial.', 'ok'); renderPage();
}
function delComm(id){
  const u = me(), c = get(K.C, []).find(x => x.id === id);
  if(!c) return;
  if(!(isAdm(u) || (c.autor === u.email && canComm()))){ toast('Sem permissão para excluir.', 'err'); return; }
  if(!confirm('Excluir "' + c.titulo + '"? Essa ação não pode ser desfeita.')) return;
  set(K.C, get(K.C, []).filter(x => x.id !== id));
  toast('Publicação excluída.', 'ok');
  renderPage();
}
function destaqueComm(id){
  const u = me(), list = get(K.C, []);
  const alvo = list.find(x => x.id === id);
  if(!alvo) return;
  if(!(isAdm(u) || (alvo.autor === u.email && canComm()))){ toast('Sem permissão.', 'err'); return; }
  const fixar = !alvo.dest;
  set(K.C, list.map(x => ({...x, dest: x.id === id ? fixar : false})));
  toast(fixar ? 'Notícia destacada na Home.' : 'Destaque removido.', 'ok');
  renderPage();
}
function readImg(input){
  const f = input.files && input.files[0]; if(!f) return;
  if(f.size > 500 * 1024){ toast('Imagem muito grande. Use até 500KB.', 'err'); input.value = ''; return; }
  const r = new FileReader();
  r.onload = e => {
    document.getElementById('c-img').value = e.target.result;
    const p = document.getElementById('c-preview');
    p.src = e.target.result;
    p.style.display = 'block';
    const rm = document.getElementById('c-rmbtn');
    if(rm) rm.style.display = 'inline-block';
    input.value = '';
  };
  r.readAsDataURL(f);
}

function clearImg(){
  document.getElementById('c-img').value = '';
  const p = document.getElementById('c-preview');
  if(p){ p.src = ''; p.style.display = 'none'; }
  const rm = document.getElementById('c-rmbtn');
  if(rm) rm.style.display = 'none';
}
function openComm(id){
  const c = get(K.C, []).find(x => x.id === id); if(!c) return;
  openModal('<h3>' + esc(c.titulo) + '</h3><span class="badge bg-sk">' + esc(c.tipo) + '</span>' +
    (c.img ? '<img src="' + esc(c.img) + '" alt="' + esc(c.titulo) + '" style="width:100%;max-height:280px;object-fit:cover;border-radius:10px;margin-top:12px">' : '') +
    '<p style="margin-top:12px;font-size:.9rem">' + esc(c.conteudo) + '</p>' +
    (c.fonte ? '<p class="doc-size" style="margin-top:10px">Fonte: ' + esc(c.fonte) + '</p>' : ''));
}
/* ================= RASCUNHOS DE NOTÍCIAS ================= */
/* Abre o modal para colar o bloco JSON que a automação semanal entrega */
function importarRascunhos(){
  openModal('<h3>📝 Importar rascunhos da semana</h3>' +
    '<p class="doc-size" style="margin:2px 0 8px">Cole aqui o bloco JSON gerado pela automação. Cada item vira um rascunho para você revisar.</p>' +
    '<textarea id="dr-json" rows="10" style="width:100%" placeholder=\'[{"titulo":"...","tipo":"...","tab":"empresa","conteudo":"...","img":"","fonte":"..."}]\'></textarea>' +
    '<button class="btn btn-primary" style="margin-top:10px" onclick="salvarRascunhos()">Importar rascunhos</button>');
}

function salvarRascunhos(){
  let lista;
  try { lista = JSON.parse(v('dr-json')); }
  catch(e){ toast('JSON inválido. Verifique o bloco colado.', 'err'); return; }
  if(!Array.isArray(lista) || !lista.length){ toast('Nenhum rascunho encontrado no bloco.', 'err'); return; }

  const list = get(K.C, []);
  lista.forEach(d => {
    list.unshift({
      id: uid(),
      titulo: String(d.titulo || '').trim(),
      tipo: d.tipo || 'Comunicação Interna',
      tab: ['tv','mercado','empresa'].includes(d.tab) ? d.tab : 'empresa',
      img: d.img || '',
      conteudo: String(d.conteudo || '').trim(),
      data: new Date().toLocaleDateString('pt-BR').slice(0,5),
      autor: 'automacao-italac',
      fonte: d.fonte || '',
      status: 'rascunho'
    });
  });
  set(K.C, list);
  closeModal(); renderPage();
  toast(lista.length + ' rascunho(s) importado(s) para revisão.', 'ok');
}
function importarLista(lista){
  const list = get(K.C, []);
  const chaves = new Set(list.map(c => (c.fonte || '') + '|' + c.titulo));
  let novos = 0;
  lista.forEach(d => {
    const titulo = String(d.titulo || '').trim();
    const chave = (d.fonte || '') + '|' + titulo;
    if(!titulo || chaves.has(chave)) return;
    chaves.add(chave);
    list.unshift({
      id: uid(),
      titulo: titulo,
      tipo: d.tipo || 'Comunicação Interna',
      tab: ['tv','mercado','empresa'].includes(d.tab) ? d.tab : 'empresa',
      img: d.img || '',
      conteudo: String(d.conteudo || '').trim(),
      data: new Date().toLocaleDateString('pt-BR').slice(0,5),
      autor: 'automacao-italac',
      fonte: d.fonte || '',
      status: 'rascunho'
    });
    novos++;
  });
  set(K.C, list);
  return novos;
}


/* Paginação da Comunicação: blocos de 6 por aba */
let commQtd = { tv: 6, mercado: 6, empresa: 6, rascunho: 6 };

function commVerMais(){
  const t = commTab || 'tv';
  commQtd[t] = (commQtd[t] || 6) + 6;
  renderPage();
}
/* ============================================================
   PARTE 2 CONTINUA A PARTIR DAQUI
   (documentos, departamentos, perfil, treinamentos, RH,
    vagas, sustentabilidade, ideias, ferramentas, história,
    administração, tour e inicialização)
   ============================================================ */

   /* ============================================================
   INTRANET ITALAC — app.js
   PARTE 2 de 2
   Documentos, Departamentos, Perfil, Treinamentos, RH,
   Vagas, Sustentabilidade, Ideias, Ferramentas, História,
   Administração, Tour e Inicialização
   ============================================================ */

/* ================= 13. PÁGINA: POLÍTICAS E NORMAS (DOCUMENTOS) ================= */
function nivelBadge(n){
  return n === 'PUBLICO'        ? '<span class="badge bg-gr">Público</span>' :
         n === 'RESTRITO_SETOR' ? '<span class="badge bg-nv">Restrito</span>' :
         n === 'SOLICITACAO'    ? '<span class="badge bg-or">Com solicitação</span>' :
                                  '<span class="badge bg-rd">Confidencial</span>';
}

function pDocumentos(){
  const u = me();
  const docs = get(K.D, []);
  const podeCriar = isAdm(u) || u.role === 'gerente' || u.role === 'analista';
  let h = '<h2 class="sec"><span class="train-accent-des"></span>  Políticas, Normas e Documentos' +
    (podeCriar ? ' <button class="btn btn-primary btn-sm" onclick="docForm()">+ Novo Documento</button>' : '') + '</h2>' +
    '<div class="sub-text" style="margin-bottom:14px">Níveis: ' +
      '<span class="badge bg-gr">Público</span> <span class="badge bg-nv">Restrito por setor</span> ' +
      '<span class="badge bg-or">Com solicitação</span> <span class="badge bg-rd">Confidencial</span></div>';
  /* NOVO: abre o grid de 2 colunas */
  h += '<div class="deps-grid">';
  DEPTS.forEach(dep => {
    /* CONFIDENCIAL: para os demais o arquivo NEM APARECE (docAccess retorna 'hidden') */
    const list = docs.filter(d => d.departamento === dep && docAccess(d, u) !== 'hidden');
    if(!list.length) return;
    const mine = canEditDept(dep);
    h += '<div class="dep"><div class="dep-h"><span> ' + esc(dep) + '</span>' +
         (mine ? '<span class="badge bg-or">Gerenciável por você</span>' : '') + '</div><div class="dep-b">';
    list.forEach(d => {
      const acc = docAccess(d, u);
      h += '<div class="doc-item"><span>📄</span>' +
           '<div class="grow"><b>' + esc(d.titulo) + '</b>' +
           '<div class="doc-size">' + esc(d.tamanho) + '</div></div>' +
           nivelBadge(d.nivel);
      if(acc === 'open'){
        h += '<button class="btn btn-navy btn-sm" onclick="openDoc(\'' + d.id + '\')">Abrir</button>';
      } else {
        h += '<span class="lock">🔒</span>' +
             '<button class="btn btn-ghost btn-sm" onclick="reqAccess(\'' + d.id + '\')">Solicitar acesso</button>';
      }
      if(mine || d.dono === u.email){
        h += '<button class="btn btn-ghost btn-sm" onclick="manageDoc(\'' + d.id + '\')">⚙️ Gerenciar arquivo</button>';
      }
      h += '</div>';
    });
    h += '</div></div>';
  });
  /* NOVO: fecha o grid de 2 colunas */
  h += '</div>';
  /* Painel do gerente: solicitações pendentes nos docs do seu setor */
  if(u.role === 'gerente' || isAdm(u)){
    const pend = get(K.R, []).filter(r => r.status === 'PENDENTE' &&
      (isAdm(u) || docs.some(d => d.id === r.docId && d.departamento === u.setor)));
    if(pend.length){
      h += '<h2 class="sec">📥 Solicitações de acesso no seu setor</h2>' +
        '<div class="card">' + pend.map(r =>
          '<div class="access-row"><span><b>' + esc(r.nome) + '</b> pediu acesso a <b>' + esc(r.docTitulo) +
          '</b><br><span class="doc-size">Justificativa: ' + esc(r.just || '—') + '</span></span>' +
          '<span><button class="btn btn-ok btn-sm" onclick="grantReq(\'' + r.id + '\')">Aprovar</button> ' +
          '<button class="btn btn-danger btn-sm" onclick="denyReq(\'' + r.id + '\')">Negar</button></span></div>').join('') +
        '</div>';
    }
  }
  return h;
}

function openDoc(id){
  const d = get(K.D, []).find(x => x.id === id);
  if(!d || docAccess(d, me()) !== 'open'){
    toast('Acesso ainda não liberado a este documento.', 'warn'); return;
  }
  openModal('<h3>📄 ' + esc(d.titulo) + '</h3>' + nivelBadge(d.nivel) +
    '<p class="sub-text" style="margin-top:12px">Pré-visualização de "' + esc(d.titulo) +
    '" — ' + esc(d.tamanho) + '. Em produção, este botão abriria o arquivo completo.</p>');
}

function docForm(){
  openModal('<h3>Novo Documento</h3>' +
    '<label>Título</label><input id="d-t">' +
    '<label>Departamento</label><select id="d-d">' +
      DEPTS.map(d => '<option>' + d + '</option>').join('') + '</select>' +
    '<label>Nível de acesso</label><select id="d-n">' +
      Object.entries(NIVEL_LBL).map(([k,l]) => '<option value="' + k + '">' + l + '</option>').join('') + '</select>' +
    '<label>Arquivo (endereço local ou link)</label>' +
    '<input id="d-caminho" placeholder="Ex.: //servidor/normas/regimento.pdf ou https://...">' +
    '<p class="doc-size" style="margin-top:4px">Caminho de rede/pasta compartilhada, caminho do computador ou link web.</p>' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="saveDoc()">Salvar</button>');
}

function saveDoc(){
  const u = me();
  const docs = get(K.D, []);
  docs.unshift({ id:uid(), titulo:v('d-t'), departamento:v('d-d'), nivel:v('d-n'),
                 dono:u.email, aprovados:[u.email], tamanho:'PDF • 0,8 MB',
                 caminho:v('d-caminho').trim() });
  set(K.D, docs);
  closeModal(); renderPage(); toast('Documento criado.', 'ok');
}

/* --- Solicitação de acesso --- */
function reqAccess(id){
  const d = get(K.D, []).find(x => x.id === id);
  openModal('<h3>🔒 Solicitar acesso</h3>' +
    '<p class="sub-text">' + esc(d.titulo) + ' — ' + NIVEL_LBL[d.nivel] + '</p>' +
    '<label>Justificativa</label><textarea id="a-j" rows="3" placeholder="Por que você precisa deste acesso?"></textarea>' +
    '<button class="btn btn-primary" style="margin-top:12px" onclick="sendReq(\'' + id + '\')">Enviar solicitação</button>');
}

function sendReq(id){
  const d = get(K.D, []).find(x => x.id === id);
  const u = me();
  const reqs = get(K.R, []);
  reqs.push({ id:uid(), docId:id, docTitulo:d.titulo, email:u.email,
              nome:u.nomePreferido || u.nomeCompleto, just:v('a-j'), status:'PENDENTE' });
  set(K.R, reqs);
  closeModal(); renderPage(); updateBadge();
  toast('Solicitação enviada ao gerente do setor e ao administrador.', 'ok');
}

/* --- Modal "Gerenciar arquivo" (dono / gerente / analista do setor) --- */
function manageDoc(id){
  const d = get(K.D, []).find(x => x.id === id);
  const users = get(K.U, []);
  const reqs = get(K.R, []).filter(r => r.docId === id && r.status === 'PENDENTE');
  let h = '<h3>⚙️ Gerenciar arquivo</h3>' +
    '<p class="sub-text">' + esc(d.titulo) + ' • Dono: ' + esc(d.dono) + '</p>' +
    '<label>Renomear</label><input id="m-t" value="' + esc(d.titulo) + '">' +
    '<label>Nível de acesso</label><select id="m-n">' +
      Object.entries(NIVEL_LBL).map(([k,l]) =>
        '<option value="' + k + '"' + (d.nivel === k ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>' +
    '<label>Conceder acesso a pessoa específica</label>' +
    '<input id="m-u" placeholder="Buscar por nome ou e-mail..." oninput="userSug(\'' + id + '\', this.value)">' +
    '<div id="m-sug"></div>' +
    '<div style="margin-top:10px"><b style="font-size:.8rem">Pessoas aprovadas</b><div id="m-ap">';
  (d.aprovados || []).forEach(e => {
    const uu = users.find(x => x.email === e);
    h += '<div class="access-row"><span>' + esc(uu ? uu.nomeCompleto : e) +
         ' <span class="doc-size">(' + esc(e) + ')</span></span>' +
         '<button class="btn btn-danger btn-sm" onclick="revoke(\'' + id + '\',\'' + esc(e) + '\')">Remover</button></div>';
  });
  h += '</div></div>';
  if(reqs.length){
    h += '<div style="margin-top:10px"><b style="font-size:.8rem">Solicitações pendentes</b>' +
      reqs.map(r =>
        '<div class="access-row"><span>' + esc(r.nome) + ' — <i>' + esc(r.just || '') + '</i></span>' +
        '<span><button class="btn btn-ok btn-sm" onclick="grantReq(\'' + r.id + '\')">Aprovar</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="denyReq(\'' + r.id + '\')">Negar</button></span></div>').join('') + '</div>';
  }
  h += '<div style="margin-top:16px;display:flex;gap:10px">' +
       '<button class="btn btn-primary" onclick="saveManage(\'' + id + '\')">Salvar alterações</button>' +
       '<button class="btn btn-danger" onclick="delDoc(\'' + id + '\')">🗑️ Excluir</button></div>';
  openModal(h);
}

function userSug(docId, q){
  const users = get(K.U, []).filter(u =>
    (u.nomeCompleto + ' ' + u.email).toLowerCase().includes((q || '').toLowerCase()));
  document.getElementById('m-sug').innerHTML = users.slice(0,5).map(u =>
    '<button class="btn btn-ghost btn-sm" style="margin:3px 4px 0 0" onclick="grant(\'' + docId + '\',\'' + esc(u.email) + '\')">+ ' +
    esc(u.nomeCompleto) + '</button>').join('');
}

function grant(docId, email){
  const docs = get(K.D, []);
  const d = docs.find(x => x.id === docId);
  if(d && !(d.aprovados || []).includes(email)){
    d.aprovados.push(email); set(K.D, docs);
  }
  manageDoc(docId); toast('Acesso concedido a ' + email + '.', 'ok');
}

function revoke(docId, email){
  const docs = get(K.D, []);
  const d = docs.find(x => x.id === docId);
  if(d){ d.aprovados = (d.aprovados || []).filter(e => e !== email); set(K.D, docs); }
  manageDoc(docId); toast('Acesso removido.', 'warn');
}

function saveManage(id){
  const docs = get(K.D, []);
  const d = docs.find(x => x.id === id);
  d.titulo = v('m-t'); d.nivel = v('m-n');
  set(K.D, docs);
  closeModal(); renderPage(); toast('Arquivo atualizado.', 'ok');
}

function delDoc(id){
  openModal('<h3>Excluir documento?</h3>' +
    '<p class="sub-text">Tem certeza? Esta ação não pode ser desfeita.</p>' +
    '<div style="display:flex;gap:10px;margin-top:14px">' +
    '<button class="btn btn-danger" onclick="delDocOk(\'' + id + '\')">Sim, excluir</button>' +
    '<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button></div>');
}

function delDocOk(id){
  set(K.D, get(K.D, []).filter(x => x.id !== id));
  closeModal(); renderPage(); toast('Documento excluído.', 'warn');
}

/* ============================================================
   FLUXO DE APROVAÇÃO — CORRIGIDO
   Ao aprovar, o e-mail do solicitante é ADICIONADO DE FATO ao
   array "aprovados" do documento. A partir daí docAccess()
   retorna 'open' para o usuário — o acesso fica realmente
   liberado, visível na lista "Pessoas aprovadas" e removível.
   ============================================================ */
function grantReq(reqId){
  const reqs = get(K.R, []);
  const r = reqs.find(x => x.id === reqId);
  if(!r) return;
  const docs = get(K.D, []);
  const d = docs.find(x => x.id === r.docId);
  if(d){
    d.aprovados = d.aprovados || [];
    if(!d.aprovados.includes(r.email)) d.aprovados.push(r.email);  /* liberação real */
    set(K.D, docs);
  }
  r.status = 'APROVADA';
  set(K.R, reqs);
  closeModal(); renderPage(); updateBadge();
  toast('Acesso liberado de fato para ' + r.email + '!', 'ok');
}

function denyReq(reqId){
  const reqs = get(K.R, []);
  const r = reqs.find(x => x.id === reqId);
  if(r){ r.status = 'RECUSADA'; set(K.R, reqs); }
  closeModal(); renderPage(); updateBadge();
  toast('Solicitação negada.', 'warn');
}
/* ================= PÁGINA: CALENDÁRIO DA EMPRESA ================= */
let calY, calM, calOn = {};
const CAL_TIPOS = ['Tecnologia & TI','Marketing','Financeiro','RH','Comercial','Qualidade','Operações'];
const CAL_MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CAL_CORES = {
  'Tecnologia & TI':'#0A66C2',
  'Marketing':'#e91e63',
  'Financeiro':'#2e7d32',
  'RH':'#8e24aa',
  'Comercial':'#f39c12',
  'Qualidade':'#00a99d',
  'Operações':'#607d8b'
};
function calInit(){ const h = new Date(); calY = h.getFullYear(); calM = h.getMonth(); }
calInit();

function canCal(){
  const u = me();
  return isAdm(u) || (u.cargo && /gerente|diretor/i.test(u.cargo)) || (RANK[u.role] || 0) >= 2;
}

function calAtivos(){ return CAL_TIPOS.filter(t => calOn[t]); }

function calToggle(t){
  if(t === 'Todos'){
    const todasOn = CAL_TIPOS.every(k => calOn[k]);
    CAL_TIPOS.forEach(k => calOn[k] = !todasOn);
  } else {
    calOn[t] = !calOn[t];
  }
  renderPage();
}

function calNav(d){
  calM += d;
  if(calM < 0){ calM = 11; calY--; }
  if(calM > 11){ calM = 0; calY++; }
  renderPage();
}
function calHoje(){ const h = new Date(); calY = h.getFullYear(); calM = h.getMonth(); renderPage(); }
function calHora(dt){ return dt ? dt.slice(11,16) : ''; }

function calFmt(dt){
  if(!dt) return '';
  const [d, h] = dt.split('T');
  const [a, m, dd] = d.split('-');
  return dd + '/' + m + '/' + a + (h ? ' às ' + h.slice(0,5) : '');
}

function calAutorNome(email){
  if(!email) return '—';
  const u = get(K.U, []).find(x => x.email === email);
  return u ? (u.nomeCompleto || email) : email;
}
function calGridBody(evs, mostraEvs){
  const FER = calFeriados(calY);
  const first = new Date(calY, calM, 1);
  const dias = new Date(calY, calM + 1, 0).getDate();
  const lead = first.getDay();
  const hj = new Date();
  const hojeStr = calY + '-' + String(calM + 1).padStart(2,'0') + '-' + String(hj.getDate()).padStart(2,'0');
  const celulas = [];
  for(let i = 0; i < lead; i++) celulas.push('<td class="cal-vazio"></td>');
  for(let d = 1; d <= dias; d++){
    const ds = calY + '-' + String(calM + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    const wd = new Date(calY, calM, d).getDay();
    const fds = wd === 0 || wd === 6;
    const fer = FER[ds];
    const diaEvs = mostraEvs
      ? evs.filter(e => e.inicio && ds >= e.inicio.slice(0,10) && ds <= (e.fim || e.inicio).slice(0,10))
      : [];
    let cls = 'cal-dia';
    if(ds === hojeStr) cls += ' hoje';
    if(fds) cls += ' fds';
    if(fer) cls += ' feriado';
    celulas.push('<td class="' + cls + '">' +
      '<div class="cal-num">' + d + '</div>' +
(fer ? '<button class="cal-hol" title="' + esc(fer) + '" onclick="calFeriadoVer(\'' + ds + '\')">' + esc(fer) + '</button>' : '') +      
    diaEvs.slice(0,3).map(e =>
        '<button class="cal-chip" style="background:' + (CAL_CORES[e.tipo] || '#010a8f') + '" onclick="calVer(\'' + e.id + '\')">' +
        calHora(e.inicio) + ' · ' + esc(e.nome) + '</button>').join('') +
      (diaEvs.length > 3 ? '<button class="cal-mais" onclick="calDia(\'' + ds + '\')">+' + (diaEvs.length - 3) + ' mais</button>' : '') +
    '</td>');
  }
  while(celulas.length % 7 !== 0) celulas.push('<td class="cal-vazio"></td>');
  let rows = '';
  for(let i = 0; i < celulas.length; i += 7){
    rows += '<tr>' + celulas.slice(i, i + 7).join('') + '</tr>';
  }
  return rows;
}

function pCalendario(){
  const u = me(), can = canCal();
  const evs = get('italac_calendar', []);
  const ativos = calAtivos();
  const temFiltro = ativos.length > 0;
  const temTodos = evs.some(e => e.tipo === 'Todos');
  const visiveis = evs.filter(e => e.tipo === 'Todos' || ativos.includes(e.tipo));

  const pills = ['Todos'].concat(CAL_TIPOS).map(t => {
    const on = t === 'Todos' ? ativos.length === CAL_TIPOS.length : calOn[t];
    const dot = t !== 'Todos' ? '<span class="cal-dot" style="background:' + (CAL_CORES[t] || '#0A66C2') + '"></span>' : '';
    return '<button class="cal-pill' + (on ? ' on' : '') + '" onclick="calToggle(\'' + t + '\')">' + dot + t + '</button>';
  }).join('');

  const headDias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => '<th>' + d + '</th>').join('');
  const grid = calGridBody(visiveis, temFiltro || temTodos);

  const hj = new Date();
  const hjStr = hj.getFullYear() + '-' + String(hj.getMonth()+1).padStart(2,'0') + '-' + String(hj.getDate()).padStart(2,'0') + 'T00:00';
  const proximos = visiveis.filter(e => (e.fim || e.inicio) >= hjStr)
    .sort((a,b) => a.inicio.localeCompare(b.inicio));

  const estadoFiltro = temFiltro ? ativos.join(' + ') : (temTodos ? 'Todos' : '');

  return '<h2 class="sec"><span class="train-accent-des"></span>  Calendário da Empresa' +
    (can ? ' <button class="btn btn-primary btn-sm" onclick="calForm()">+ Novo Evento</button>' : '') + '</h2>' +
    '<div class="cal-pills">' + pills + '</div>' +
    '<div class="cal-nav">' +
      '<button class="btn btn-ghost1 btn-sm" onclick="calNav(-1)">← ' + CAL_MESES[(calM + 11) % 12].slice(0,3) + '</button>' +
      '<span class="cal-month">' + CAL_MESES[calM] + ' ' + calY + '</span>' +
      '<button class="btn btn-ghost1 btn-sm" onclick="calNav(1)">' + CAL_MESES[(calM + 1) % 12].slice(0,3) + ' →</button>' +
      '<button class="btn btn-ghost1 btn-sm" onclick="calHoje()">Hoje</button>' +
    '</div>' +
    '<div class="cal-wrap"><table class="cal-grid"><thead><tr>' + headDias + '</tr></thead><tbody>' + grid + '</tbody></table></div>' +
    '<div class="cal-legenda">' +
      '<span><i class="leg fds"></i>Fim de semana (não útil)</span>' +
      (estadoFiltro ? '<span class="lmeta">Eventos exibidos: ' + estadoFiltro + '</span>' : '<span class="lmeta">Ative os filtros para ver os eventos</span>') +
    '</div>' +
    '<h3 class="sec" style="font-size:1.05rem;margin-top:20px">🗓️ Próximos eventos' +
      (estadoFiltro ? ' • ' + estadoFiltro : '') + '</h3>' +
    (proximos.length ?
      '<div class="cal-list">' + proximos.map(e =>
        '<div class="cal-item" style="border-left-color:' + (CAL_CORES[e.tipo] || '#010a8f') + '" onclick="calVer(\'' + e.id + '\')">' +
          '<div style="flex:1;min-width:200px">' +
            '<b>' + esc(e.nome) + '</b>' +
            '<div class="meta">📅 ' + calFmt(e.inicio) + (e.fim && e.fim !== e.inicio ? ' → ' + calFmt(e.fim) : '') +
              (e.local ? ' • 📍 ' + esc(e.local) : '') + ' • 🏷️ ' + esc(e.tipo) + '</div>' +
            '<div class="meta">👤 Adicionado por ' + esc(calAutorNome(e.autor)) + '</div>' +
          '</div>' +
          (can ?
            '<div class="acts">' +
              '<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();calForm(\'' + e.id + '\')">✏️ Atualizar</button>' +
              '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="event.stopPropagation();calDel(\'' + e.id + '\')">🗑 Excluir</button>' +
            '</div>' : '') +
        '</div>').join('') + '</div>' :
      '<p class="meta">Nenhum evento futuro com os filtros ativos.</p>');
}

function calForm(id){
  const e = get('italac_calendar', []).find(x => x.id === id) || {};
  const u = me();
  openModal('<h3>' + (id ? '✏️ Atualizar Evento' : '➕ Novo Evento no Calendário') + '</h3>' +
    '<label>Nome do evento</label><input id="k-nome" value="' + esc(e.nome || '') + '" placeholder="Ex.: Reunião de planejamento">' +
    '<label>Tipo (filtro)</label><select id="k-tipo">'+
      '<option value="Todos"' + (e.tipo === 'Todos' ? ' selected' : '') + '>Todos</option>' +
      CAL_TIPOS.map(t =>
      '<option' + (e.tipo === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>' +
    '<div class="grid2" style="grid-template-columns:1fr 1fr;gap:10px">' +
      '<div><label>Data e hora de início</label><input type="datetime-local" id="k-ini" value="' + esc(e.inicio || '') + '"></div>' +
      '<div><label>Data e hora de fim</label><input type="datetime-local" id="k-fim" value="' + esc(e.fim || '') + '"></div>' +
    '</div>' +
    '<label>Local (opcional)</label><input id="k-local" value="' + esc(e.local || '') + '" placeholder="Ex.: Sala 2, Matriz Goiânia">' +
    '<label>Responsável (quem adicionou)</label><input value="' + esc(id ? calAutorNome(e.autor) : (u.nomeCompleto || u.email)) + '" disabled>' +
    (id ? '<input type="hidden" id="k-autor" value="' + esc(e.autor || '') + '">' : '') +
    '<label>Descrição (opcional)</label><textarea id="k-desc" rows="3" placeholder="Pauta, participantes, observações...">' + esc(e.desc || '') + '</textarea>' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="calSave(\'' + (id || '') + '\')">' + (id ? 'Salvar alterações' : 'Adicionar ao calendário') + '</button>');
}

function calSave(id){
  const u = me();
  const nome = v('k-nome').trim();
  const ini = v('k-ini'), fim = v('k-fim');
  if(!nome){ toast('Informe o nome do evento.', 'err'); return; }
  if(!ini || !fim){ toast('Informe a data de início e de fim.', 'err'); return; }
  if(fim < ini){ toast('A data de fim não pode ser anterior à de início.', 'err'); return; }
  const list = get('italac_calendar', []);
  const o = { id: id || uid(), nome: nome, tipo: v('k-tipo'), inicio: ini, fim: fim,
    local: v('k-local').trim(), autor: id ? (v('k-autor') || u.email) : u.email, desc: v('k-desc').trim() };
  if(id){ set('italac_calendar', list.map(x => x.id === id ? o : x)); toast('Evento atualizado.', 'ok'); }
  else{ list.push(o); set('italac_calendar', list); toast('Evento adicionado ao calendário!', 'ok'); }
  closeModal(); renderPage();
}

function calDel(id){
  const e = get('italac_calendar', []).find(x => x.id === id); if(!e) return;
  if(!confirm('Excluir "' + e.nome + '" do calendário? Essa ação não pode ser desfeita.')) return;
  set('italac_calendar', get('italac_calendar', []).filter(x => x.id !== id));
  closeModal(); toast('Evento excluído.', 'ok'); renderPage();
}
function calDataLonga(dt){
  if(!dt) return '';
  const p = dt.slice(0,10).split('-');
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return parseInt(p[2], 10) + ' de ' + meses[parseInt(p[1], 10) - 1] + ' de ' + p[0];
}

function calVer(id){
  const e = get('italac_calendar', []).find(x => String(x.id) === String(id)); if(!e) return;
  const can = canCal();
  const cor = CAL_CORES[e.tipo] || '#00026e';
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const fmt = dt => { if(!dt) return ''; const p = dt.slice(0,10).split('-'); return parseInt(p[2],10) + ' de ' + meses[parseInt(p[1],10)-1] + ' de ' + p[0]; };
  const ini = fmt(e.inicio);
  const fim = e.fim && e.fim !== e.inicio ? fmt(e.fim) : '';
  const temHora = e.inicio && e.inicio.slice(11,16) !== '00:00';
  const linhas =
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
      '<span style="font-size:1rem">📅</span><span style="font-size:.88rem;color:#1e293b">' + esc(ini + (fim ? ' – ' + fim : '')) + (temHora ? ' às ' + esc(e.inicio.slice(11,16)) : '') + '</span></div>' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
      '<span style="font-size:1rem">📍</span><span style="font-size:.88rem;color:#1e293b">' + esc(e.local || '—') + '</span></div>' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
      '<span style="font-size:1rem">👤</span><span style="font-size:.88rem;color:#1e293b">' + esc(calAutorNome(e.autor) || '—') + '</span></div>' +
    (e.desc ? '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
      '<span style="font-size:1rem">💬</span><span style="font-size:.88rem;color:#1e293b">' + esc(e.desc) + '</span></div>' : '');
  openModal(
    '<div style="background:' + cor + ';border-radius:10px 10px 0 0;padding:14px 16px;position:relative;margin:-24px -24px 0">' +
      '<span style="display:inline-block;background:rgba(255,255,255,.22);color:#fff;font-size:.62rem;font-weight:800;letter-spacing:.4px;padding:3px 9px;border-radius:99px;text-transform:uppercase">🏷️ ' + esc(e.tipo) + '</span>' +
      '<button onclick="closeModal()" style="position:absolute;top:10px;right:12px;background:transparent;border:none;color:#fff;font-size:1rem;cursor:pointer;font-weight:700" aria-label="Fechar">✕</button>' +
      '<h3 style="color:#fff;margin:10px 0 0;font-size:1.15rem">' + esc(e.nome) + '</h3>' +
    '</div>' +
    '<div style="background:#fff;border-radius:0 0 10px 10px;padding:15px 1px 1px">' + linhas +
      (can ? '<div style="display:flex;gap:8px;padding-top:14px">' +
        '<button class="btn btn-sm" style="background:' + cor + ';color:#fff;border:none" onclick="calForm(\'' + e.id + '\')">✏️ Atualizar</button>' +
        '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="calDel(\'' + e.id + '\')">🗑 Excluir</button>' +
      '</div>' : '') +
    '</div>');
}
function calFeriadoVer(ds){
  const FER = calFeriados(calY);
  const nome = FER[ds];
  if(!nome) return;
  const p = ds.split('-');
  const dataFmt = p[2] + '/' + p[1] + '/' + p[0];
  const wd = new Date(calY, parseInt(p[1]) - 1, parseInt(p[2])).getDay();
  const diasSemana = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const ehFacultativo = nome.indexOf('*') >= 0;
  openModal(
    '<div style="background:#fd5000;padding:14px 16px;position:relative;margin:-24px -24px 0;border-radius:0">' +
      '<span style="display:inline-block;background:rgba(255,255,255,.22);color:#fff;font-size:.62rem;font-weight:800;letter-spacing:.4px;padding:3px 9px;border-radius:99px;text-transform:uppercase">' + (ehFacultativo ? 'Ponto facultativo' : 'Feriado nacional') + '</span>' +
      '<button onclick="closeModal()" style="position:absolute;top:10px;right:12px;background:transparent;border:none;color:#fff;font-size:1rem;cursor:pointer;font-weight:700" aria-label="Fechar">✕</button>' +
      '<h3 style="color:#fff;margin:10px 0 0;font-size:1.15rem">🎉 ' + esc(nome.replace('*','')) + '</h3>' +
    '</div>' +
    '<div style="padding:15px 1px 1px">' +
      '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
        '<span style="font-size:1rem">📅</span><span style="font-size:.88rem;color:#1e293b">' + dataFmt + ' (' + diasSemana[wd] + ')</span></div>' +
      '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
        '<span style="font-size:1rem">🏢</span><span style="font-size:.88rem;color:#1e293b">' + (ehFacultativo ? 'Ponto facultativo, verifique a escala da sua área.' : 'Não é dia útil, não há expediente de trabalho.') + '</span></div>' +
    '</div>');
}
/* ================= 14. PÁGINA: DEPARTAMENTOS ================= */
let fac = 'goiania';
let depSetor = 'Todos';
const ORG = {
  goiania:{ n:'Goiânia (Matriz)', dir:'Helena Duarte — Diretora de Operações',
    m:[['Camila Torres','Gerente de RH','RH'],['Rafael Mendes','Gerente Industrial','Produção'],['Marcos Lopes','Gerente de TI','TI']],
    a:[['Isabela Alves','Analista de Marketing'],['Paulo Ribeiro','Analista Financeiro'],['Larissa Coelho','Analista de Qualidade']] },
  anapolis:{ n:'Anápolis', dir:'Helena Duarte — Diretoria',
    m:[['Sérgio Ramos','Gerente de Fábrica']],
    a:[['Marcos Prado','Analista de Logística']] },
  bh:{ n:'Belo Horizonte', dir:'Helena Duarte — Diretoria',
    m:[['Cláudia Nunes','Gerente de Distribuição']],
    a:[['Fernanda Lima','Assistente Administrativa']] },
  campinas:{ n:'Campinas', dir:'Helena Duarte — Diretoria',
    m:[['Bruno Tavares','Gerente de Manutenção']],
    a:[['Diego Fontes','Técnico de Manutenção']] }
};

function isAdmin(){
  const u = me();
  return !!(u && (u.role === 'admin' || (u.perms || {}).admin));
}
function pertenceFac(u, o, k){
  if(u.fac) return u.fac === k;
  if(!u.unidade) return true;
  const un = String(u.unidade).toLowerCase();
  const nome = o.n.toLowerCase();
  return nome.includes(un) || un.includes(nome) || un === k;
}
function pDepartamentos(){
  const o = ORG[fac];
  const todos = get(K.U, []);
  const ehAdmin = isAdmin();
  const setores = ['Todos'].concat(Array.from(new Set(todos
    .filter(u => u.setor && pertenceFac(u, o, fac))
    .map(u => u.setor))).sort());
  const equipe = todos.filter(u =>
    pertenceFac(u, o, fac) &&
    (depSetor === 'Todos' || depNorm(u.setor) === depNorm(depSetor)));

  function usrCard(u){
    const nome = u.nomeCompleto || u.email || 'Colaborador';
    const pref = u.nomePreferido || nome.split(' ')[0];
    const cargo = u.cargo || u.role || 'Colaborador';
    return '<div class="usr-card' + (ehAdmin ? ' usr-clicavel' : '') + '"' +
      (ehAdmin ? ' onclick="userForm(\'' + esc(u.email) + '\')" title="Clique para editar cadastro"' : '') + '>' +
      (u.foto ?
        '<img class="usr-av" src="' + esc(u.foto) + '" alt="' + esc(pref) + '">' :
        '<div class="usr-av">' + initials(nome) + '</div>') +
      '<div class="usr-info">' +
        '<b>' + esc(nome) + '</b>' +
        (u.nomePreferido ? '<span class="usr-pref">' + esc(u.nomePreferido) + '</span>' : '') +
        '<span class="usr-role">' + esc(cargo) + ' • ' + esc(u.setor || 'Sem setor') + '</span>' +
        '<a class="usr-mail" href="mailto:' + esc(u.email || '') + '" onclick="event.stopPropagation()">' + esc(u.email || '') + '</a>' +
      '</div></div>';
  }

  return '<h2 class="sec"><span class="train-accent-des"></span>  Colaboradores</h2>' +
    '<div class="tools-row">' + Object.entries(ORG).map(([k,val]) =>
      '<button class="factory-btn' + (fac === k ? ' active' : '') +
      '" onclick="fac=\'' + k + '\';depSetor=\'Todos\';renderPage()">' + val.n + '</button>').join('') + '</div>' +
    '<div class="dep-pills">' + setores.map(s =>
      '<button class="dep-pill' + (depSetor === s ? ' active' : '') +
      '" onclick="depSetor=\'' + s + '\';renderPage()">' + s + '</button>').join('') + '</div>' +
    '<div class="dep-grid">' + equipe.map(usrCard).join('') + '</div>';
}
/* ================= 15. PÁGINA: MINHA CONTA (PERFIL) ================= */
function pPerfil(){
  const u = me();
  const row = (l, val) =>
    '<div class="prow"><span class="plabel">' + l + '</span><b>' + esc(val) + '</b></div>';
  const avatar = u.foto
    ? '<img src="' + esc(u.foto) + '" alt="Foto de perfil" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--sky)">'
    : '<div class="mini-av" style="width:64px;height:64px;font-size:1.2rem;background:var(--navy)">' + initials(u.nomeCompleto) + '</div>';
  return '<h2 class="sec"><span class="train-accent-des"></span> Minha Conta</h2>' +
    '<div class="grid2">' +
    '<div class="card">' +
    '<div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">' +
      '<div style="position:relative;width:64px;height:64px;flex-shrink:0">' +
        avatar +
        '<button onclick="document.getElementById(\'foto-input\').click()" title="Editar foto" style="position:absolute;bottom:-2px;right:-2px;width:24px;height:24px;border-radius:50%;background:#0f172a;border:2px solid #fff;color:#fff;font-size:.7rem;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;line-height:1">✏️</button>' +
      '</div>' +
      '<div>' +
        '<b>' + esc(u.nomeCompleto) + '</b>' +
        (u.seloVerde ? ' <span style="display:inline-block;background:#d4edda;color:#1b5e20;font-size:.62rem;font-weight:800;border-radius:99px;padding:2px 8px;vertical-align:middle">🏅 Selo Verde</span>' : '') +        '<div class="doc-size">' + esc(u.cargo) + ' • ' + esc(u.setor) + ' • ' + esc(u.unidade) + '</div>' +
        (u.foto ? '<button onclick="removerFoto()" style="background:none;border:none;color:#c0392b;font-size:.68rem;cursor:pointer;padding:0;margin-top:2px">Remover foto</button>' : '') +
      '</div>' +
    '</div>' +
    '<input type="file" id="foto-input" accept="image/*" style="display:none" onchange="salvarFoto(this)">' +
    '<div class="profile-rows">' +
      row('Nome Completo', u.nomeCompleto) + row('Cargo', u.cargo) +
      row('Setor', u.setor) + row('Matrícula', u.matricula) +
      row('E-mail', u.email) + row('Ramal', u.ramal || '—') +
      row('Tempo de Casa', tenure(u)) + row('Fábrica', u.unidade) +
    '</div>' +
    '<div style="margin-top:14px;padding:14px;background:#EEF2F8;border-radius:10px">' +
      '<label style="margin-top:0">Como prefere ser chamado(a)? <span class="doc-size">(único campo editável, aparece na saudação e nos registros)</span></label>' +
      '<div style="display:flex;gap:8px">' +
        '<input id="pref-name" value="' + esc(u.nomePreferido) + '">' +
        '<button class="btn btn-primary btn-sm" onclick="savePrefName()">Salvar</button>' +
      '</div>' +
    '</div>' +
    '</div>' +
    '<div class="card"><h3 class="navy-text" style="font-size:1rem;margin-bottom:10px">✍️ Gerador de Assinatura de E-mail</h3>' +
    '<div id="sig-preview" style="border:1px dashed var(--line);border-radius:10px;padding:14px;font-size:.85rem">' +
    '<b>' + esc(u.nomeCompleto) + '</b><br>' + esc(u.cargo) + '<br>' +
    'Italac — Goiasminas Indústria de Laticínios<br>' +
    esc(u.email) + ' • Ramal ' + esc(u.ramal || '—') + '</div>' +
    '<button class="btn btn-navy btn-sm" style="margin-top:12px" onclick="copySig()">Copiar assinatura</button>' +
    '</div></div>';
}
function savePrefName(){
  const u = me();
  u.nomePreferido = v('pref-name').trim() || u.nomeCompleto.split(' ')[0];
  const users = get(K.U, []);
  set(K.U, users.map(x => x.email === u.email ? u : x));
  renderPage();
  toast('Nome preferido salvo! Saudação atualizada para "' + u.nomePreferido + '".', 'ok');
}

function copySig(){
  const u = me();
    const sig = u.nomeCompleto + '\n' + u.cargo + '\nItalac — Goiasminas Indústria de Laticínios\n' +
    u.email + ' • Ramal ' + (u.ramal || '—') +
    (u.seloVerde ? '\n🏅 Selo Verde — Sustentabilidade Italac' : '');
  navigator.clipboard.writeText(sig)
    .then(() => toast('Assinatura copiada!', 'ok'))
    .catch(() => toast('Não foi possível copiar.', 'err'));
}
function salvarFoto(input){
  const arquivo = input.files && input.files[0];
  if(!arquivo) return;
  if(!/^image\/(png|jpe?g|gif|webp)$/i.test(arquivo.type)){
    toast('Envie uma imagem (JPG, PNG, GIF ou WebP).', 'err');
    input.value = '';
    return;
  }
  if(arquivo.size > 2 * 1024 * 1024){
    toast('Imagem muito grande. Envie uma com até 2 MB.', 'err');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(ev){
    const u = me();
    u.foto = ev.target.result;
    const users = get(K.U, []);
    set(K.U, users.map(x => x.email === u.email ? u : x));
    renderPage();
    toast('Foto de perfil atualizada!', 'ok');
  };
  reader.readAsDataURL(arquivo);
}

function removerFoto(){
  const u = me();
  delete u.foto;
  const users = get(K.U, []);
  set(K.U, users.map(x => x.email === u.email ? u : x));
  renderPage();
  toast('Foto de perfil removida.', 'ok');
}
/* ================= 16. PÁGINA: TREINAMENTOS ================= */
let trainFilter = 'Todos os Formatos';
let trainUnit = 'Todas as Unidades';
const TRAIN_EXT = {
  'PDF':      ['.pdf'],
  'Vídeo':    ['.mp4','.webm','.mov','.avi','.mkv'],
  'Impresso': ['.pdf','.doc','.docx','.ppt','.pptx']
};
const TRAIN_LABEL = { 'PDF':'MANUAL PDF', 'Vídeo':'VÍDEO', 'Impresso':'MATERIAL IMPRESSO' };
const TRAIN_CTA   = { 'PDF':'⬇ Baixar Manual', 'Vídeo':'▶ Assistir Aula', 'Impresso':'🖨 Solicitar Impressão' };
const TRAIN_EMOJI = { 'PDF':'📘', 'Vídeo':'🎬', 'Impresso':'📄' };
const UNIDADES = ['Todas as Unidades','Goiânia','Anápolis','Belo Horizonte','Campinas'];
let _trainFile = null;
function pTreinamentos(){
  const can = canCreateTrain();
  const u = me();
  let list = get(K.T, []);
  if(trainFilter !== 'Todos os Formatos') list = list.filter(t => t.tipo === trainFilter);
  if(trainUnit !== 'Todas as Unidades')   list = list.filter(t => (t.unidade || 'Goiânia') === trainUnit);
  return '<div class="train-head">' +
    '<div class="train-title"><span class="train-accent-des"></span> <h2>Academia Italac & Treinamentos</h2></div>' +
    '<div class="train-actions">' +
      (can ? '<button class="btn btn-primary btn-sm" onclick="trainForm()">+ Novo Treinamento</button>' : '') +
      '<button class="btn btn-navy btn-sm" onclick="toast(\'Abrindo central de suporte...\',\'ok\')">Dúvidas & Abrir Ticket</button>' +
    '</div></div>' +
    '<div class="train-filters">' +
      '<div class="train-filter">' +
        '<label for="tf-format">Filtrar por Formato:</label>' +
        '<select id="tf-format" onchange="trainFilter=this.value;renderPage()">' +
          ['Todos os Formatos','PDF','Vídeo','Impresso'].map(t =>
            '<option ' + (trainFilter === t ? 'selected' : '') + '>' + t + '</option>').join('') + '</select>' +
      '</div>' +
      '<div class="train-filter">' +
        '<label for="tf-unit">Unidade Fabril:</label>' +
        '<select id="tf-unit" onchange="trainUnit=this.value;renderPage()">' +
          UNIDADES.map(u => '<option ' + (trainUnit === u ? 'selected' : '') + '>' + u + '</option>').join('') + '</select>' +
      '</div>' +
    '</div>' +
    '<div class="train-grid">' +
    (list.map(t =>
      '<div class="train-card">' +
        '<div class="train-media">' +
          '<span class="train-badge">' + (TRAIN_LABEL[t.tipo] || t.tipo) + '</span>' +
          '<span class="train-emoji">' + (TRAIN_EMOJI[t.tipo] || '📘') + '</span>' +
        '</div>' +
        '<div class="train-body">' +
          '<span class="train-meta">Obrigatório Geral • Atualização ' + (t.data ? t.data.slice(3,5) : '20') + '</span>' +
          '<h4>' + esc(t.titulo) + '</h4><p>' + esc(t.desc) + '</p>' +
          '<div class="doc-size">' +
            (t.ext ? '📎 ' + esc(t.ext) : t.url ? '🔗 ' + esc(trainHost(t.url)) : '') +
          '</div>' +
          '<div class="train-actions-card">' +
            '<button class="btn btn-navy btn-sm train-btn" onclick="openTrain(\'' + t.id + '\')">' + (TRAIN_CTA[t.tipo] || '▶ Iniciar') + '</button>' +
            ((t.autor === u.email) || isAdm(u) ?
              '<button class="btn btn-ghost btn-sm" onclick="trainForm(\'' + t.id + '\')">✏️ Editar</button>' +
              '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="delTrain(\'' + t.id + '\')">🗑 Excluir</button>' : '') +
          '</div>' +
        '</div>' +
      '</div>').join('') ||
    '<p class="meta">Nenhum treinamento encontrado.</p>') +
    '</div>';
}

function trainHost(u){
  try{ return new URL(u).hostname.replace('www.',''); }
  catch(e){ return 'link externo'; }
}

function openTrain(id){
  const t = get(K.T, []).find(x => x.id === id);
  if(!t) return;
  if(t.file)     { window.open(t.file, '_blank'); }
  else if(t.url) { window.open(t.url, '_blank'); }
  else           { toast('Treinamento sem anexo.', 'err'); }
}

function trainTipoHint(){
  const tipo = document.getElementById('t-tp') ? v('t-tp') : 'PDF';
  const inp = document.getElementById('t-file');
  if(inp) inp.accept = TRAIN_EXT[tipo] ? TRAIN_EXT[tipo].join(',') : '';
  const h = document.getElementById('t-hint');
  if(h) h.textContent = 'Extensões aceitas: ' + (TRAIN_EXT[tipo] ? TRAIN_EXT[tipo].join(', ') : '');
}

function trainForm(id){
  if(!canCreateTrain()){ toast('Você não tem permissão para criar treinamentos.', 'err'); return; }
  const t = id ? get(K.T, []).find(x => x.id === id) : null;
  if(t && t.autor !== me().email && !isAdm(me())){ toast('Só o autor ou o admin podem editar.', 'err'); return; }
  _trainFile = null;
  openModal('<h3>' + (id ? 'Editar' : 'Novo') + ' Treinamento</h3>' +
    '<label>Título *</label><input id="t-t" value="' + esc(t ? t.titulo : '') + '">' +
    '<label>Descrição *</label><textarea id="t-d" rows="3">' + esc(t ? t.desc : '') + '</textarea>' +
    '<label>Formato *</label><select id="t-tp" onchange="trainTipoHint()">' +
      ['PDF','Vídeo','Impresso'].map(x => '<option ' + (t && t.tipo === x ? 'selected' : '') + '>' + x + '</option>').join('') + '</select>' +
    '<label>Unidade Fabril *</label><select id="t-uni">' +
      ['Goiânia','Anápolis','Belo Horizonte','Campinas'].map(u => '<option ' + (t && t.unidade === u ? 'selected' : '') + '>' + u + '</option>').join('') + '</select>' +
    '<p class="meta" id="t-hint" style="margin:4px 0 0">Extensões aceitas: .pdf</p>' +
    '<label style="margin-top:12px">Anexo: arquivo ou link (Google Drive / YouTube) *</label>' +
    '<div style="display:flex;gap:8px;align-items:center;margin-top:6px">' +
      '<button class="btn btn-sm" style="background:var(--sky);color:#fff" ' +
        'onclick="document.getElementById(\'t-file\').click()">📎 Escolher arquivo</button>' +
      '<input type="file" id="t-file" accept=".pdf" style="display:none" onchange="trainFile(this)">' +
      '<span id="t-fname" class="meta">' + (t && t.ext ? '📎 ' + esc(t.ext) : t && t.url ? '🔗 ' + esc(trainHost(t.url)) : 'Nenhum arquivo') + '</span>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:8px;margin-top:10px">' +
      '<span class="meta" style="white-space:nowrap">ou link:</span>' +
      '<input id="t-url" value="' + esc(t ? t.url : '') + '" placeholder="https://drive.google.com/... ou https://youtube.com/...">' +
    '</div>' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="saveTrain(\'' + (id || '') + '\')">Salvar</button>');
  trainTipoHint();
}

function trainFile(input){
  const f = input.files && input.files[0];
  if(!f) return;
  const ext = '.' + f.name.split('.').pop().toLowerCase();
  const aceitas = TRAIN_EXT[v('t-tp')] || [];
  if(!aceitas.includes(ext)){
    toast('Extensão ' + ext + ' não permitida para ' + v('t-tp') + '. Aceitas: ' + aceitas.join(', '), 'err');
    input.value = ''; _trainFile = null;
    document.getElementById('t-fname').textContent = 'Nenhum arquivo';
    return;
  }
  if(f.size > 1500 * 1024){
    toast('Arquivo acima de 1,5MB: use o link do Google Drive ou YouTube.', 'err');
    input.value = ''; _trainFile = null;
    document.getElementById('t-fname').textContent = 'Nenhum arquivo';
    return;
  }
  const r = new FileReader();
  r.onload = e => { _trainFile = e.target.result; };
  r.readAsDataURL(f);
  document.getElementById('t-fname').textContent = '📎 ' + f.name;
}

function saveTrain(id){
  if(!canCreateTrain()){ toast('Você não tem permissão para criar treinamentos.', 'err'); return; }
  const u = me();
  const titulo = v('t-t').trim(), desc = v('t-d').trim(), tipo = v('t-tp');
  const unidade = v('t-uni'), url = v('t-url').trim();
  if(!titulo){ toast('Preencha o título.', 'err'); return; }
  if(!desc){ toast('Preencha a descrição.', 'err'); return; }
  if(!url && !_trainFile){ toast('Adicione um anexo: arquivo ou link do Google Drive / YouTube.', 'err'); return; }
  if(url && !/^https?:\/\/\S+$/.test(url)){ toast('Link inválido. Use um link completo (https://...).', 'err'); return; }
  const m = _trainFile ? _trainFile.match(/^data:[^/]+\/(\w+)/) : null;
  const list = get(K.T, []);
  if(id){
    const alvo = list.find(x => x.id === id);
    if(!alvo){ toast('Treinamento não encontrado.', 'err'); return; }
    if(alvo.autor !== u.email && !isAdm(u)){ toast('Só o autor ou o admin podem editar.', 'err'); return; }
    Object.assign(alvo, { titulo, desc, tipo, unidade, url:url || '',
      file:_trainFile || alvo.file, ext:m ? '.' + m[1] : alvo.ext });
    set(K.T, list);
    toast('Treinamento atualizado.', 'ok');
  } else {
    list.unshift({ id:uid(), titulo, desc, tipo, unidade, autor:u.email,
      url:url || '', file:_trainFile || '', ext:m ? '.' + m[1] : '',
      data:new Date().toLocaleDateString('pt-BR').slice(0,5) });
    set(K.T, list);
    toast('Treinamento criado.', 'ok');
  }
  _trainFile = null;
  closeModal(); renderPage();
}
function delTrain(id){
  const u = me(), t = get(K.T, []).find(x => x.id === id);
  if(!t) return;
  if(t.autor !== u.email && !isAdm(u)){ toast('Só o autor ou o admin podem excluir.', 'err'); return; }
  if(!confirm('Excluir o treinamento "' + t.titulo + '"? Essa ação não pode ser desfeita.')) return;
  set(K.T, get(K.T, []).filter(x => x.id !== id));
  toast('Treinamento excluído.', 'ok');
  renderPage();
}
/* ================= 17. PÁGINA: RECURSOS HUMANOS ================= */
const OCC_TIPOS = ['Esquecimento de Marcação','Atestado Médico','Trabalho Externo','Falha Técnica do Ponto','Outros'];
const occSt = s =>
  s === 'PENDENTE'        ? '<span class="st-pendente">Pendente — aguardando gerente do setor</span>' :
  s === 'APROVADA_GERENTE'? '<span class="st-gerente">Aprovada pelo gerente — aguardando RH</span>' :
  s === 'APROVADA_RH'     ? '<span class="st-rh">Aprovada pelo RH ✅</span>' :
                            '<span class="st-recusado">Recusada ❌</span>';

function pRH(){
  const u = me();
  const minhas = get(K.O, []).filter(o => o.email === u.email);
  const gerenteSetor = u.role === 'gerente' && u.setor !== 'RH';
  const rh = rhManager();
  const souRH = rh && u.email === rh.email;
  const filaSetor = gerenteSetor || isAdm(u)
    ? get(K.O, []).filter(o => o.status === 'PENDENTE' && (isAdm(u) || o.setorSolicitante === u.setor)) : [];
  const filaRH = (souRH || isAdm(u))
    ? get(K.O, []).filter(o => o.status === 'APROVADA_GERENTE') : [];

    let h = '<h2 class="sec"><span class="train-accent-des"></span>  Recursos Humanos</h2>' +
    '<div class="grid2" style="grid-template-columns:1fr 1fr;margin-bottom:16px">' +
      '<div class="rh-card">' +
        '<div class="rh-icon"><div style="width:40px; height:40px; border-radius:8px; background:#eff6ff; color:var(--brand-navy); display:flex; align-items:center; justify-content:center; margin-bottom:12px;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>'+
            '</div></div>' +
        '<h4>Portal Meu RH (Holerites & Informe)</h4><p>Acesse seus comprovantes de rendimento, espelho de ponto eletrônico e informe de rendimentos para IRPF.</p>' +
        '<button class="btn btn-dark btn-sm" onclick="toast(\'Portal do Holerite aberto (demo).\',\'ok\')">Acessar Meu RH</button>' +
      '</div>' +
      '<div class="rh-card">' +
        '<div class="rh-icon"><div style="width:40px; height:40px; border-radius:8px; background:#fef3c7; color:#b45309; display:flex; align-items:center; justify-content:center; margin-bottom:12px;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>'+
            '</div></div>' +
        '<h4>Templates de PowerPoint</h4><p>Templates institucionais prontos nos formatos 16:9 com tipografia, paleta Italac e capas temáticas.</p>' +
        '<button class="btn btn-dark btn-sm" onclick="toast(\'Templates abertos (demo).\',\'ok\')">Baixar Templates (.pptx)</button>' +
      '</div>' +
    '</div>';

    /* --- Ocorrência de Ponto: formulário do colaborador --- */
  h += '<div class="card-rh" style="margin-bottom:16px"><h3 class="navy-text" style="font-size:1rem"><div style="width:40px; height:40px; border-radius:8px; background:#fee2e2; color:var(--brand-red); display:flex; align-items:center; justify-content:center; margin-bottom:12px;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div> Registrar Ocorrência de Ponto</h3>' +
    '<p class="sub-text">Sua ocorrência vai primeiro ao gerente do seu setor e, se aprovada, ao gerente de RH.</p>' +
    '<div class="occ-dados">' +
      '<span>👤 <b>' + esc(u.nomeCompleto || u.nomePreferido || 'não informado') + '</b></span>' +
      '<span>🏢 ' + esc(u.setor || 'não informado') + '</span>' +
      '<span>🪪 Matrícula ' + esc(u.matricula || u.registro || u.chapa || 'não informado') + '</span>' +
      '<span>✉️ ' + esc(u.email || 'não informado') + '</span>' +
    '</div>' +
    '<div class="grid2" style="grid-template-columns:1fr 1fr 1fr;margin-top:10px">' +
      '<div><label>Data</label><input id="o-data" type="date" value="' + new Date().toISOString().slice(0,10) + '"></div>' +
      '<div><label>Tipo</label><select id="o-tipo" onchange="occTipoHint()">' +
        OCC_TIPOS.map(t => '<option>' + t + '</option>').join('') + '</select></div>' +
      '<div><label>&nbsp;</label><button class="btn btn-primary btn-block" onclick="sendOcc()">Enviar ocorrência</button></div>' +
    '</div>' +
    '<label>Observações <span id="o-oblig" style="display:none;color:#c0392b;font-weight:700">(* obrigatório para "Outros")</span></label>' +
    '<textarea id="o-obs" rows="2" placeholder="Descreva o que aconteceu..."></textarea></div>';

  if(minhas.length){
    h += '<h2 class="sec">📋 Minhas ocorrências</h2><div class="card-rh">' +
      minhas.map(o =>
        '<div class="access-row"><span><b>' + esc(o.tipo) + '</b> — ' +
        new Date(o.data + 'T12:00').toLocaleDateString('pt-BR') +
        '<br><span class="doc-size">' + esc(o.obs || '') + '</span></span>' + occSt(o.status) + '</div>').join('') + '</div>';
  }

  /* --- Painel do gerente do setor: aprovar/recusar --- */
  if(filaSetor.length){
    h += '<h2 class="sec-rh">⚖️ Ocorrências do meu setor (aprovação 1ª etapa)</h2><div class="card-rh-aprov">' +
      filaSetor.map(o =>
        '<div class="access-row"><span><b>' + esc(o.nomeSolicitante || o.email) + '</b> — ' + esc(o.tipo) +
        ' em ' + new Date(o.data + 'T12:00').toLocaleDateString('pt-BR') +
        '<br><span class="doc-size">' + esc(o.obs || '') + '</span></span>' +
        '<span><button class="btn btn-ok btn-sm" onclick="approveOccSetor(\'' + o.id + '\')">Aprovar</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="rejectOcc(\'' + o.id + '\')">Recusar</button></span></div>').join('') + '</div>';
  }

  /* --- Painel do gerente de RH: aprovação final --- */
  if(filaRH.length){
    h += '<h2 class="sec-rh">🏢 Aprovação final — RH</h2><div class="card-rh">' +
      filaRH.map(o =>
        '<div class="access-row"><span><b>' + esc(o.nomeSolicitante || o.email) + '</b> — ' + esc(o.tipo) +
        ' em ' + new Date(o.data + 'T12:00').toLocaleDateString('pt-BR') + ' <span class="badge bg-gr">Aprovada pelo gerente</span></span>' +
        '<span><button class="btn btn-ok btn-sm" onclick="approveOccRH(\'' + o.id + '\')">Aprovar (RH)</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="rejectOcc(\'' + o.id + '\')">Recusar</button></span></div>').join('') + '</div>';
  }

  /* --- Gerenciamento de Vagas: solicitar abertura --- */
  if(cap('vagas')){
    h += '<h2 class="sec-rh"><span class="train-accent-des"></span> Solicitar Abertura de Vaga</h2>' +
      '<div class="card-rh"><div class="grid2" style="grid-template-columns:1fr 1fr">' +
        '<div><label>Título da vaga</label><input id="j-t"></div>' +
        '<div><label>Setor</label><select id="j-s">' + DEPTS.map(d => '<option>' + d + '</option>').join('') + '</select></div>' +
        '<div><label>Descrição</label><input id="j-d"></div>' +
        '<div><label>Requisitos</label><input id="j-r"></div>' +
        '<div><label>Salário (opcional)</label><input id="j-sal" placeholder="R$ —,——"></div>' +
                '<div><label>Salário (opcional)</label><input id="j-sal" placeholder="R$ —,——"></div>' +
        '<div><label>Data de início do processo</label><input type="date" id="j-inicio"></div>' +
        '<div><label>Data de fim do processo</label><input type="date" id="j-fim"></div>' +
        '<div><label>&nbsp;</label><button class="btn btn-primary btn-block" onclick="requestJob()">Enviar ao RH</button></div>' +
      '</div></div>';
  }

  /* --- Painel do gerente de RH: aprovar vagas --- */
  const jobsPend = (souRH || isAdm(u)) ? get(K.J, []).filter(j => j.status === 'PENDENTE_RH') : [];
  if(jobsPend.length){
    h += '<h2 class="sec-rh-aprov">✅ Vagas aguardando aprovação do RH</h2><div class="card-rh-aprov">' +
      jobsPend.map(j =>
        '<div class="access-row"><span><b>' + esc(j.titulo) + '</b> — ' + esc(j.setor) + ' • ' + esc(j.unidade) +
        '<br><span class="doc-size">' + esc(j.desc) + '</span></span>' +
        '<span><button class="btn btn-ok btn-sm" onclick="approveJob(\'' + j.id + '\')">Aprovar</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="rejectJob(\'' + j.id + '\')">Recusar</button></span></div>').join('') + '</div>';
  }
  return h;
}

/* --- Ocorrências: fluxo em duas etapas --- */
function sendOcc(){
  const u = me();
  const tipo = v('o-tipo');
  const obs = v('o-obs');
  if(tipo === 'Outros' && !obs.trim()){
    toast('Para o tipo "Outros" a observação é obrigatória.', 'err');
    return;
  }
  const list = get(K.O, []);
  list.unshift({ id:uid(), email:u.email,
    nomeSolicitante:u.nomeCompleto || u.nomePreferido || '',
    matricula:u.matricula || u.registro || u.chapa || '',
    setorSolicitante:u.setor, data:v('o-data'), tipo:tipo, obs:obs,
    status:'PENDENTE' });
  set(K.O, list);
  renderPage(); updateBadge();
  toast('Ocorrência enviada ao gerente do setor ' + u.setor + '.', 'ok');
}
function approveOccSetor(id){
  const list = get(K.O, []);
  const o = list.find(x => x.id === id);
  o.status = 'APROVADA_GERENTE';   /* segue para o gerente de RH */
  set(K.O, list);
  renderPage(); updateBadge();
  toast('Ocorrência aprovada pelo gerente. Enviada ao RH.', 'ok');
}
function approveOccRH(id){
  const list = get(K.O, []);
  const o = list.find(x => x.id === id);
  o.status = 'APROVADA_RH';
  set(K.O, list);
  renderPage(); updateBadge();
  toast('Ocorrência aprovada pelo RH.', 'ok');
}
function rejectOcc(id){
  const list = get(K.O, []);
  const o = list.find(x => x.id === id);
  o.status = 'RECUSADA';
  set(K.O, list);
  renderPage(); updateBadge();
  toast('Ocorrência recusada.', 'warn');
}
function occTipoHint(){
  const ob = document.getElementById('o-oblig');
  if(ob) ob.style.display = v('o-tipo') === 'Outros' ? 'inline' : 'none';
}
/* --- Vagas: solicitação + aprovação do RH --- */
function requestJob(){
  const u = me();
  const list = get(K.J, []);
  list.unshift({ id:uid(), titulo:v('j-t'), setor:v('j-s'), unidade:u.unidade,
    desc:v('j-d'), req:v('j-r'), salario:v('j-sal'), status:'PENDENTE_RH',
    prazo:'—', solicitante:u.email });
  set(K.J, list);
  renderPage(); updateBadge();
  toast('Solicitação enviada. A vaga só é liberada após aprovação do gerente de RH.', 'ok');
}
function approveJob(id){
  const list = get(K.J, []);
  const j = list.find(x => x.id === id);
  j.status = 'APROVADA';
  set(K.J, list);
  renderPage(); updateBadge();
  toast('Vaga aprovada e publicada em Vagas Internas!', 'ok');
}
function rejectJob(id){
  set(K.J, get(K.J, []).filter(x => x.id !== id));
  renderPage(); updateBadge();
  toast('Solicitação de vaga recusada.', 'warn');
}

/* ================= 18. PÁGINA: VAGAS INTERNAS ================= */
function pVagas(){
  const list = get(K.J, []).filter(j => j.status === 'APROVADA');
  return '<div class="vagas-head">' +
    '<div class="vagas-title"><span class="train-accent-des"></span> <h2> Vagas Internas</h2></div>' +
    '<span class="vagas-count">' + list.length + ' vaga' + (list.length === 1 ? '' : 's') + ' aberta' + (list.length === 1 ? '' : 's') + '</span>' +
    '</div>' +
    '<p class="sub-text" style="margin-bottom:16px">Oportunidades aprovadas pelo RH, mobilidade interna primeiro.</p>' +
    '<div class="vagas-grid">' +
    (list.map(j =>
      '<div class="vaga-card">' +
        '<div class="vaga-top">' +
          '<span class="vaga-badge">' + esc(j.setor) + '</span>' +
          '<span class="vaga-deadline">' + (j.prazo !== '—' ? '📅 Inscrições até ' + esc(j.prazo) : '🎯 Inscrições abertas') + '</span>' +
        '</div>' +
        '<h4>' + esc(j.titulo) + '</h4>' +
        '<div class="vaga-loc">📍 ' + esc(j.unidade) + ' • ' + esc(j.setor) + '</div>' +
        '<p class="vaga-desc">' + esc(j.desc) + '</p>' +
        '<div class="vaga-req"><b>Requisitos:</b> ' + esc(j.req) +
          (j.salario ? '<br><b>Faixa salarial:</b> ' + esc(j.salario) : '') + '</div>' +
        '<button class="btn btn-navy btn-block vaga-btn" onclick="applyJob(\'' + j.id + '\')">Candidatar-se</button>' +
      '</div>').join('') ||
    '<div class="vaga-empty"><span>🔍</span><p>Nenhuma vaga aberta no momento.</p></div>') +
    '</div>';
}

function applyJob(id){
  const j = get(K.J, []).find(x => x.id === id);
  openModal('<h3>Candidatura — ' + esc(j.titulo) + '</h3>' +
    '<label>Carta de motivação</label>' +
    '<textarea id="c-mot" rows="5" placeholder="Conte por que você é a pessoa ideal para esta vaga..."></textarea>' +
    '<button class="btn btn-primary" style="margin-top:12px" onclick="sendApply(\'' + id + '\')">Enviar candidatura</button>');
}

function sendApply(id){
  const j = get(K.J, []).find(x => x.id === id);
  const u = me();
  const apps = get('italac_applications', []);
  apps.push({ id:uid(), jobId:id, job:j.titulo, email:u.email, nome:u.nomePreferido, mot:v('c-mot'), data:new Date().toISOString() });
  set('italac_applications', apps);
  closeModal();
  toast('Candidatura enviada para "' + j.titulo + '"! O RH entrará em contato.', 'ok');
}

/* ================= 19. PÁGINA: SUSTENTABILIDADE ================= */
const SUST_HERO = [
  { ic:'♻️', to:380, tit:'toneladas recicladas por ano', leg:'≈ 19 caminhões de resíduos que não vão para o aterro' },
  { ic:'💧', to:100, tit:'do efluente é tratado', leg:'≈ 400 piscinas olímpicas de água devolvida limpa ao ano' },
  { ic:'☀️', to:42, tit:'da energia vem do sol', leg:'≈ 2.300 casas abastecidas por mês' }
];
const SUST_META_AT = 62;
const SUST_META = { nome:'Reduzir em 25% o consumo de água por litro de leite produzido' };
const SUST_DICAS = [
  'Desligue o monitor e as luzes da sua estação ao sair para o almoço.',
  'Use a garrafa reutilizável: cada copo descartável economiza 4g de plástico.',
  'Imprima só quando for necessário e sempre em frente e verso.',
  'Separe o resíduo certo: papelão seco vai para a reciclagem, resto orgânico para a compostagem.',
  'Reporte vazamentos de água ao ver: uma torneira pingando desperdiça 46 litros por dia.'
];
const SUST_ACOES = [
  { t:'Água', ic:'💧', nome:'Reúso de água da CIP', desc:'A água do enxágue da limpeza em circuito passa por tratamento e volta para a torre de resfriamento.', st:'Concluída' },
  { t:'Energia', ic:'⚡', nome:'Usina solar da matriz', desc:'Os painéis no telhado dos armazéns já respondem por 42% do consumo das áreas administrativas.', st:'Em andamento' },
  { t:'Resíduos', ic:'♻️', nome:'Reciclagem de embalagens', desc:'Parceria com cooperativa local para papelão, filmes e plásticos da produção.', st:'Em andamento' },
  { t:'Embalagem', ic:'📦', nome:'Garrafa 8% mais leve', desc:'Nova garrafa de 1L usa menos plástico sem perder resistência no transporte.', st:'Planejada' },
  { t:'Comunidade', ic:'🤝', nome:'Horta comunitária', desc:'Terreno ao lado da fábrica cultivado por funcionários e famílias, adubado com o resíduo orgânico.', st:'Em andamento' },
  { t:'Água', ic:'💧', nome:'Medidores setoriais', desc:'Telemetria em cada setor para identificar vazamentos em até 24 horas.', st:'Concluída' }
];
let SUST_DICA_IDX = 0;
let SUST_ACAO_FILTRO = 'Todas';

function pSust(){
  setTimeout(sustInicia, 60);
  const cat = ['Todas','Água','Energia','Resíduos','Embalagem','Comunidade'];
  const hero = '<div class="grid2" style="grid-template-columns:1fr 1fr 1fr">' + SUST_HERO.map(h =>
    '<div class="card" style="text-align:center">' +
      '<div style="font-size:1.7rem">' + h.ic + '</div>' +
      '<div class="countup" data-to="' + h.to + '" style="font-size:1.9rem;font-weight:800;color:var(--navy)">0</div>' +
      '<p style="font-size:.85rem;font-weight:600;margin:2px 0 4px">' + h.tit + '</p>' +
      '<p class="doc-size">' + h.leg + '</p>' +
    '</div>').join('') + '</div>';
  const meta = '<div class="card">' +
    '<h3 class="navy-text" style="font-size:.95rem;margin-bottom:6px">🎯 Meta de ' + new Date().getFullYear() + '</h3>' +
    '<p style="font-size:.85rem;margin-bottom:12px">' + SUST_META.nome + '</p>' +
    '<div class="sust-bar"><div id="sust-meta-fill"></div></div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:.75rem;color:var(--muted)">' +
      '<span id="sust-meta-lbl">0% atingido</span><span>faltam ' + (100 - SUST_META_AT) + '%</span>' +
    '</div></div>';
  const dica = '<div class="card">' +
    '<h3 class="navy-text" style="font-size:.95rem;margin-bottom:6px">💡 Dica verde da semana</h3>' +
    '<p id="sust-dica" style="font-size:.85rem;min-height:52px">' + SUST_DICAS[0] + '</p>' +
    '<button class="btn btn-ghost btn-sm" onclick="sustDica()">⟳ Próxima dica</button>' +
  '</div>';
  return '<h2 class="sec"><span class="train-accent-des"></span> Sustentabilidade: Nosso Impacto</h2>' +
    '<p class="sub-text" style="margin-bottom:12px">Aqui a sustentabilidade aparece do jeito que a gente vive: em números que cabem na rotina, na meta que é de todos e nas ideias que saem do chão de fábrica.</p>' +
    hero +
    '<div class="grid2" style="margin-top:20px">' + meta + dica + '</div>' +
    '<div class="card" style="margin-top:20px">' +
      '<h3 class="navy-text" style="font-size:.95rem;margin-bottom:4px">🌱 Ações que já são rotina</h3>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 12px" id="sust-chips">' + cat.map(c =>
        '<button class="sust-chip' + (SUST_ACAO_FILTRO === c ? ' on' : '') + '" onclick="sustFiltro(\'' + c + '\')">' + c + '</button>').join('') +
      '</div><div id="sust-acoes"></div>' +
    '</div>' +
    '<div class="card" style="margin-top:20px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px">' +
        '<h3 class="navy-text" style="font-size:.95rem;margin:0">💬 Ideias dos colaboradores</h3>' +
        '<button class="btn btn-primary btn-sm" onclick="sustFormIdeia()">+ Enviar ideia</button>' +
      '</div>' +
      '<div id="sust-ideias"></div>' +
        '</div>' +
    '<div id="sust-impacto"></div>' +
    '<div id="sust-cantinho"></div>' +
    '<div id="sust-mural"></div>';
}

function sustMontaChips(){
  const el = document.getElementById('sust-chips'); if(!el) return;
  const cat = ['Todas','Água','Energia','Resíduos','Embalagem','Comunidade'];
  el.innerHTML = cat.map(c => '<button class="sust-chip' + (SUST_ACAO_FILTRO === c ? ' on' : '') + '" onclick="sustFiltro(\'' + c + '\')">' + c + '</button>').join('');
}
function sustFiltro(c){ SUST_ACAO_FILTRO = c; sustMontaChips(); sustMontaAcoes(); }
function sustMontaAcoes(){
  const el = document.getElementById('sust-acoes'); if(!el) return;
  const lista = SUST_ACOES.filter(a => SUST_ACAO_FILTRO === 'Todas' || a.t === SUST_ACAO_FILTRO);
  el.innerHTML = lista.length ? lista.map(a =>
    '<div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
      '<div style="font-size:1.2rem">' + a.ic + '</div>' +
      '<div style="flex:1">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b style="font-size:.85rem;color:var(--navy)">' + a.nome + '</b>' +
        '<span class="sust-status" style="background:' + (a.st === 'Concluída' ? '#d4edda' : a.st === 'Em andamento' ? '#fff3cd' : '#eef2f8') + ';color:' + (a.st === 'Concluída' ? '#1b5e20' : a.st === 'Em andamento' ? '#7a5900' : '#1e293b') + '">' + a.st + '</span></div>' +
        '<p class="doc-size" style="margin-top:2px">' + a.desc + '</p>' +
      '</div>' +
    '</div>').join('') : '<p class="doc-size">Nenhuma ação nessa categoria.</p>';
}

function sustMontaIdeias(){
  const el = document.getElementById('sust-ideias'); if(!el) return;
  const u = me();
  const pode = (typeof isAdm === 'function' && isAdm(u)) || (u.cargo && /gerente|diretor/i.test(u.cargo));
  const lista = get('italac_sust_ideias', []);
  el.innerHTML = lista.length ? lista.map(i =>
    '<div class="sust-ideia">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center">' +
        '<b style="font-size:.85rem;color:var(--navy)">' + esc(i.titulo) + '</b>' +
        '<span class="sust-status" style="background:' + (i.status === 'Aprovada' ? '#d4edda' : '#eef2f8') + ';color:' + (i.status === 'Aprovada' ? '#1b5e20' : '#1e293b') + '">' + i.status + '</span>' +
      '</div>' +
      (i.desc ? '<p class="doc-size" style="margin-top:4px">' + esc(i.desc) + '</p>' : '') +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;gap:8px;flex-wrap:wrap">' +
        '<span class="doc-size">👤 ' + esc(i.autor) + ' · ' + i.data + '</span>' +
        (pode ?
          '<span style="display:flex;gap:6px">' +
            (i.status !== 'Aprovada' ? '<button class="btn btn-ghost btn-sm" onclick="sustAprova(\'' + i.id + '\')">✅ Aprovar</button>' : '') +
            '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="sustExc(\'' + i.id + '\')">🗑 Excluir</button>' +
          '</span>' : '') +
      '</div>' +
    '</div>').join('') : '<p class="doc-size">Nenhuma ideia enviada ainda. Seja a primeira pessoa a contribuir.</p>';
}
function sustAprova(id){
  set('italac_sust_ideias', get('italac_sust_ideias', []).map(i => i.id === id ? Object.assign({}, i, { status:'Aprovada' }) : i));
  sustMontaIdeias(); toast('Ideia aprovada. Vamos colocar em prática!', 'ok');
}
function sustExc(id){
  const it = get('italac_sust_ideias', []).find(x => x.id === id); if(!it) return;
  if(!confirm('Excluir a ideia "' + it.titulo + '"?')) return;
  set('italac_sust_ideias', get('italac_sust_ideias', []).filter(x => x.id !== id));
  sustMontaIdeias(); toast('Ideia excluída.', 'ok');
}
function sustFormIdeia(){
  openModal('<h3>💬 Enviar ideia sustentável</h3>' +
    '<p class="sub-text" style="margin:-6px 0 12px">Sua ideia entra no quadro e fica em análise. O gerente da área aprova e ela aparece como aprovada para todo mundo.</p>' +
    '<label>Título da ideia</label><input id="s-ideia-titulo" placeholder="Ex.: Coleta seletiva no refeitório">' +
    '<label>Como funciona (opcional)</label><textarea id="s-ideia-desc" rows="3" placeholder="Descreva a ideia e o impacto esperado..."></textarea>' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="sustSalvarIdeia()">Enviar ideia</button>');
}
function sustSalvarIdeia(){
  const titulo = v('s-ideia-titulo').trim(); if(!titulo){ toast('Dê um título para a ideia.', 'err'); return; }
  const u = me();
  const agora = new Date();
  const data = String(agora.getDate()).padStart(2,'0') + '/' + String(agora.getMonth()+1).padStart(2,'0') + '/' + agora.getFullYear();
  const lista = get('italac_sust_ideias', []);
  lista.push({ id: typeof uid === 'function' ? uid() : 'si_' + Date.now(), titulo: titulo, desc: v('s-ideia-desc').trim(), autor: (u.nomeCompleto || u.email), data: data, status: 'Em análise' });
  set('italac_sust_ideias', lista);
  closeModal(); toast('Ideia enviada! Ela entrou no quadro.', 'ok');
  sustMontaIdeias();
}
function sustDica(){
  SUST_DICA_IDX = (SUST_DICA_IDX + 1) % SUST_DICAS.length;
  const el = document.getElementById('sust-dica');
  if(el) el.textContent = SUST_DICAS[SUST_DICA_IDX];
}
function sustInicia(){
  const inicio = performance.now();
  const passo = t => {
    const p = Math.min(1, (t - inicio) / 900);
    document.querySelectorAll('.countup[data-to]').forEach(el => {
      const alvo = parseInt(el.dataset.to, 10);
      el.textContent = Math.round(alvo * p) + (alvo <= 100 ? '%' : '');
    });
    const bar = document.getElementById('sust-meta-fill');
    if(bar) bar.style.width = (SUST_META_AT * p) + '%';
    const lbl = document.getElementById('sust-meta-lbl');
    if(lbl) lbl.textContent = Math.round(SUST_META_AT * p) + '% atingido';
    if(p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
  sustMontaAcoes();
  sustMontaIdeias();
  calcMonta();
  sustMontaCantinho();
  sustMontaMural();
}

/* ================= 19c. SUSTENTABILIDADE: CALCULADORA, CANTINHO E MURAL ================= */

const SUST_CANTINHO = [
  { ic:'🍌', tit:'Aproveite a casca da banana', txt:'Lá em casa a casca da banana vira doce, vitamina ou adubo pro vasinho. Nada de ir pro lixo o que ainda pode alimentar a família ou a horta.' },
  { ic:'🥛', tit:'Embalagem de leite vira vaso', txt:'Lave bem a caixinha, corte no meio, decore com o Italakinho e plante uma muda. As crianças adoram e a planta cresce junto com elas.' },
  { ic:'💧', tit:'Água do enxágue não é lixo', txt:'Aquela água do arroz ou de lavar as frutas rega as plantas, lava o quintal e ainda economiza no bolso no fim do mês.' },
  { ic:'❄️', tit:'Geladeira é coisa séria', txt:'Borracha da porta vedando direitinho e nada de comida esquecida no fundo: menos energia, menos desperdício, mais dinheiro pro lazer.' },
  { ic:'🧺', tit:'Paninho no lugar do papel', txt:'Um jogo de panos de prato por semana substitui dezenas de rolos de papel toalha. "Lá em casa tem" pano pro que precisar.' }
];
let SUST_MURAL_ARQ = null;

function calcMonta(){
  const el = document.getElementById('sust-impacto'); if(!el) return;
  const u = me();
  const ja = get('italac_sust_impacto', {})[u.email];
  el.innerHTML = '<div class="card" style="margin-top:20px">' +
    '<h3 class="navy-text" style="font-size:.95rem;margin-bottom:4px">🧮 Calculadora Meu Impacto</h3>' +
    '<p class="doc-size" style="margin-bottom:12px">Responde 3 perguntas rápidas e descobre sua pegada em coisas que a gente entende.</p>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<select id="imp-carro" style="flex:1;min-width:150px">' +
        '<option value="">🚗 Uso o carro...</option><option value="0">Não uso / só carona</option>' +
        '<option value="50">Pouco (até 50 km/sem)</option><option value="150">Médio (50–200 km/sem)</option>' +
        '<option value="400">Muito (mais de 200 km/sem)</option></select>' +
      '<select id="imp-copo" style="flex:1;min-width:150px">' +
        '<option value="">🥤 Copos descartáveis...</option><option value="0">Não uso</option>' +
        '<option value="3">Poucos (até 3/sem)</option><option value="10">Muitos (+3/sem)</option></select>' +
      '<select id="imp-carne" style="flex:1;min-width:150px">' +
        '<option value="">🥩 Carne vermelha...</option><option value="0">Não como</option>' +
        '<option value="2">Pouca (1–2x/sem)</option><option value="6">Todo dia</option></select>' +
      '<button class="btn btn-primary btn-sm" onclick="calcImpactoCalc()">Calcular</button>' +
    '</div>' +
    '<div id="imp-resultado" style="margin-top:14px"></div>' +
    (ja ? '<p class="doc-size" style="margin-top:8px">Seu último resultado: <b>' + ja.co2 + ' kg CO₂/ano</b> (' + ja.data + ')</p>' : '') +
  '</div>';
}

function calcImpactoCalc(){
  if(v('imp-carro') === '' || v('imp-copo') === '' || v('imp-carne') === ''){ toast('Responda as 3 perguntas para calcular.', 'err'); return; }
  const km = parseInt(v('imp-carro'), 10), copo = parseInt(v('imp-copo'), 10), carne = parseInt(v('imp-carne'), 10);
  const total = Math.round(km * 0.16 * 52 + copo * 52 * 0.01 + carne * 52 * 0.21);
  const arvores = Math.max(1, Math.round(total / 21));
  const kmEquiv = Math.round(total / 0.16);
  const u = me();
  const salvos = get('italac_sust_impacto', {});
  salvos[u.email] = { co2: total, data: new Date().toISOString().slice(0,10) };
  set('italac_sust_impacto', salvos);
  const el = document.getElementById('imp-resultado');
  if(el) el.innerHTML =
    '<div style="background:#EEF7F0;border:1px solid #cfe8d8;border-radius:10px;padding:14px">' +
      '<div style="font-size:1.6rem;font-weight:800;color:#1e7a3c">' + total + ' kg CO₂/ano</div>' +
      '<p class="doc-size" style="margin-top:4px">É como dirigir cerca de <b>' + kmEquiv.toLocaleString('pt-BR') + ' km</b> ou precisar de <b>' + arvores + ' árvores</b> para absorver tudo isso. Cada copo reutilizável, cada carona e cada dia sem carne já mudam esse número.</p>' +
    '</div>';
  sustGanhaSelo();
}

function sustGanhaSelo(){
  const u = me();
  if(u.seloVerde) return;
  u.seloVerde = true;
  set(K.U, get(K.U, []).map(x => x.email === u.email ? u : x));
  toast('🏅 Parabéns! Você ganhou o Selo Verde. Ele já aparece na Minha Conta e na sua assinatura de e-mail.', 'ok');
}

function sustMontaCantinho(){
  const el = document.getElementById('sust-cantinho'); if(!el) return;
  el.innerHTML = '<div class="card" style="margin-top:20px">' +
    '<h3 class="navy-text" style="font-size:.95rem;margin-bottom:4px">🏠 Cantinho "Lá em casa tem"</h3>' +
    '<p class="doc-size" style="margin-bottom:12px">Sustentabilidade do jeito que a gente vive em casa: simples, gostoso e que cabe na rotina. Clique para abrir cada ideia.</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">' +
      SUST_CANTINHO.map(c =>
        '<details class="sust-dica-card"><summary>' + c.ic + ' ' + c.tit + '</summary>' +
        '<p class="doc-size" style="margin-top:8px;color:#1e293b">' + c.txt + '</p></details>').join('') +
    '</div></div>';
}

/* ---------- Mural Nosso Verde ---------- */
function sustMontaMural(){
  const el = document.getElementById('sust-mural'); if(!el) return;
  const u = me();
  const podeGerir = (typeof isAdm === 'function' && isAdm(u)) || (u.cargo && /gerente|diretor/i.test(u.cargo));
  const lista = get('italac_sust_mural', []);
  const ordenada = lista.slice().sort((a,b) => b.curtidas.length - a.curtidas.length);
  el.innerHTML =
    '<div class="card" style="margin-top:20px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:4px">' +
        '<h3 class="navy-text" style="font-size:.95rem;margin:0">📸 Mural Nosso Verde <span style="font-weight:600;color:var(--muted);font-size:.75rem">(' + lista.length + ')</span></h3>' +
        '<button class="btn btn-primary btn-sm" onclick="sustMuralEnviar()">+ Publicar foto</button>' +
      '</div>' +
      '<p class="doc-size" style="margin-bottom:12px">Ações reais de gente como a gente: horta, coleta seletiva, carona solidária. Curta e dê destaque ao que te inspirar.</p>' +
      (!lista.length ? '<p class="doc-size">Ninguém publicou ainda. Seja a primeira pessoa a mostrar o verde da Italac. 🌱</p>' :
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">' +
        ordenada.map(m =>
          '<div class="sust-mural-item">' +
            (m.foto ? '<img src="' + esc(m.foto) + '" alt="' + esc(m.legenda || 'Post do mural') + '">' :
              '<div style="height:150px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#d4edda,#cfe8d8);font-size:2.4rem">🌱</div>') +
            '<div class="mbody">' +
              (m.legenda ? '<p style="font-size:.8rem;margin:0 0 6px;color:#1e293b">' + esc(m.legenda) + '</p>' : '') +
              '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap">' +
                '<span class="doc-size">👤 ' + esc(m.autor) + ' · ' + m.data + '</span>' +
                '<span style="display:flex;gap:6px;align-items:center">' +
                  '<button class="sust-like' + (m.curtidas.includes(u.email) ? ' on' : '') + '" onclick="sustMuralCurtir(\'' + m.id + '\')">👍 ' + m.curtidas.length + '</button>' +
                  ((podeGerir || m.autor === (u.nomeCompleto || u.email)) ? '<button onclick="sustMuralExcluir(\'' + m.id + '\')" style="background:none;border:none;color:#c0392b;cursor:pointer;font-size:.8rem" title="Excluir">Deletar</button>' : '') +
                '</span>' +
              '</div>' +
            '</div>' +
          '</div>').join('') +
      '</div>') +
    '</div>';
}

function sustMuralCurtir(id){
  const u = me();
  const lista = get('italac_sust_mural', []);
  const f = lista.find(x => x.id === id); if(!f) return;
  const ja = f.curtidas.includes(u.email);
  set('italac_sust_mural', lista.map(x => x.id === id ?
    Object.assign({}, x, { curtidas: ja ? x.curtidas.filter(e => e !== u.email) : x.curtidas.concat([u.email]) }) : x));
  sustMontaMural();
}

function sustMuralExcluir(id){
  const post = get('italac_sust_mural', []).find(x => x.id === id); if(!post) return;
  if(!confirm('Excluir esta publicação do mural?')) return;
  set('italac_sust_mural', get('italac_sust_mural', []).filter(x => x.id !== id));
  toast('Publicação excluída.', 'ok');
  sustMontaMural();
}

function sustMuralEnviar(){
  SUST_MURAL_ARQ = null;
  openModal('<h3>📸 Publicar no Mural Nosso Verde</h3>' +
    '<p class="sub-text" style="margin:-6px 0 12px">Compartilhe uma ação sustentável real, da fábrica ou de casa. A foto é reduzida automaticamente para caber na intranet.</p>' +
    '<button class="btn btn-ghost btn-sm" onclick="document.getElementById(\'mural-file\').click()">📷 Escolher foto</button>' +
    '<input type="file" id="mural-file" accept="image/*" style="display:none" onchange="sustMuralPreview(this)">' +
    '<div id="mural-preview" style="margin-top:10px"></div>' +
    '<label>Legenda (opcional)</label><input id="mural-legenda" placeholder="Ex.: Horta da fábrica 3 meses depois!">' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="sustMuralSalvar()">Publicar no mural</button>');
}

function sustMuralPreview(inp){
  const arq = inp.files && inp.files[0]; if(!arq) return;
  if(!/^image\//.test(arq.type)){ toast('Envie uma imagem.', 'err'); return; }
  if(arq.size > 5 * 1024 * 1024){ toast('Imagem acima de 5 MB. Escolha outra.', 'err'); inp.value = ''; return; }
  SUST_MURAL_ARQ = arq;
  const el = document.getElementById('mural-preview');
  if(el) el.innerHTML = '<img src="' + URL.createObjectURL(arq) + '" style="max-height:160px;border-radius:8px;border:1px solid var(--line)">';
}

function sustComprimeImagem(arquivo, cb){
  const img = new Image();
  const url = URL.createObjectURL(arquivo);
  img.onload = function(){
    const MAX = 720;
    let w = img.width, h = img.height;
    if(w > MAX){ h = Math.round(h * MAX / w); w = MAX; }
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    cv.getContext('2d').drawImage(img, 0, 0, w, h);
    cb(cv.toDataURL('image/jpeg', .72));
    URL.revokeObjectURL(url);
  };
  img.onerror = function(){ URL.revokeObjectURL(url); cb(null); };
  img.src = url;
}

function sustMuralSalvar(){
  const u = me();
  const leg = v('mural-legenda').trim();
  if(!SUST_MURAL_ARQ && !leg){ toast('Escolha uma foto ou escreva uma legenda.', 'err'); return; }
  const grava = foto => {
    const agora = new Date();
    const data = String(agora.getDate()).padStart(2,'0') + '/' + String(agora.getMonth()+1).padStart(2,'0') + '/' + agora.getFullYear();
    const lista = get('italac_sust_mural', []);
    if(lista.length >= 40){ toast('Mural cheio (40 posts). Exclua alguns antes de publicar.', 'err'); return; }
    lista.push({ id: typeof uid === 'function' ? uid() : 'sm_' + Date.now(), autor: u.nomeCompleto || u.email, data: data, legenda: leg, foto: foto, curtidas: [] });
    set('italac_sust_mural', lista);
    SUST_MURAL_ARQ = null;
    closeModal(); toast('Publicado no mural!', 'ok');
    sustMontaMural();
  };
  if(SUST_MURAL_ARQ) sustComprimeImagem(SUST_MURAL_ARQ, b64 => { if(b64) grava(b64); else toast('Não deu para processar a imagem.', 'err'); });
  else grava(null);
}
/* ================= 20. PÁGINA: INOVAÇÃO E IDEIAS ================= */
const IDEA_CATS = ['Processos Fabris','Qualidade & BPF','Redução de Desperdício','Bem-Estar & Ergonomia','Tecnologia & TI'];
function pIdeias(){
  const u = me();
  const list = get(K.I, []);
  const stB = s => s === 'Em análise' ? 'bg-or' : s === 'Aprovada' ? 'bg-sk' : 'bg-gr';
  return '<div class="idea-head">' +
    '<div class="idea-title"><span class="train-accent-des"></span> <h2> Inovação e Ideias</h2></div>' +
    '<span class="idea-count">' + list.length + ' ideia' + (list.length === 1 ? '' : 's') + '</span>' +
    '</div>' +
    '<div class="idea-form card">' +
      '<div class="idea-form-head">' +
        '<div><b class="navy-text">Compartilhe sua ideia</b>' +
        '<p class="sub-text" style="margin:2px 0 0">Toda sugestão passa por análise antes de ser aprovada.</p></div>' +
      '</div>' +
      '<label style="margin-top:14px">Título da ideia</label><input id="i-t" placeholder="Ex.: Reduzir desperdício no envase">' +
      '<div class="grid-ino" style="margin-top:4px">' +
        '<div><label>Categoria</label><select id="i-c">' +
          IDEA_CATS.map(c => '<option>' + c + '</option>').join('') + '</select></div>' +
        '<div><label>&nbsp;</label><button class="btn btn-primary btn-block" onclick="sendIdea()">Enviar ideia</button></div>' +
      '</div>' +
      '<label>Descrição detalhada</label><textarea id="i-d" rows="3" placeholder="Explique sua ideia e o impacto esperado..."></textarea>' +
    '</div>' +
    '<h2 class="sec" style="margin-top:22px"><span class="train-accent-des"></span>Ideias enviadas</h2>' +
    '<div class="idea-grid">' +
    (list.map(i =>
      '<div class="idea-card">' +
        '<div class="idea-top">' +
          '<span class="badge ' + stB(i.status) + '">' + esc(i.status) + '</span>' +
          '<span class="badge bg-gy">' + esc(i.cat) + '</span>' +
        '</div>' +
        '<h4>' + esc(i.titulo) + '</h4>' +
        '<p>' + esc(i.desc) + '</p>' +
        '<div class="idea-foot">' +
          '<span class="doc-size">👤 ' + esc(i.autor || 'Anônimo') + '</span>' +
          '<span class="doc-size">📅 ' + esc(i.data || '—') + '</span>' +
        '</div>' +
      '</div>').join('') ||
    '<div class="idea-empty"><span>🚀</span><p>Seja o primeiro a enviar uma ideia!</p></div>') +
    '</div>';
}

function sendIdea(){
  const u = me();
  const list = get(K.I, []);
  list.unshift({ id:uid(), titulo:v('i-t'), cat:v('i-c'), desc:v('i-d'), status:'Em análise', autor:u.email });
  set(K.I, list);
  renderPage(); toast('Ideia enviada! O comitê de inovação vai analisar.', 'ok');
}

/* ================= 21. PÁGINA: PROGRAMAS E FERRAMENTAS ================= */
let ferrCat = 'Todos';
const FERR_CATS = ['Todos','Tecnologia & TI','Marketing','Financeiro','RH','Comercial','Qualidade'];
const FERR_TOOLS = [
  ['SAP ERP','Gestão empresarial integrada: suprimentos, produção e finanças.','🧩','Financeiro'],
  ['Fluig BPM','Workflow, documentos eletrônicos e aprovações internas.','🔄','Tecnologia & TI'],
  ['Power BI','Dashboards corporativos e indicadores de performance.','📊','Tecnologia & TI'],
  ['LIMS','Gestão de laboratório: análises físico-químicas e microbiológicas.','🧪','Qualidade'],
  ['Salesforce','Gestão de clientes e força de vendas (Trade).','🤝','Comercial'],
  ['Italac Conecta','Rede Social Interna','Portal de colaboradores, benefícios e ponto eletrônico.','🔗','RH']
];
function pFerr(){
  admSeedProgramas();
  const todos = get('italac_programas', []).filter(p => p.ativo !== false);
  if(!todos.length){
    return '<div class="ferr-head">' +
      '<div class="ferr-title"><span class="train-accent-des"></span> <h2> Programas e Ferramentas</h2></div>' +
      '<span class="ferr-count">0 sistemas</span></div>' +
      '<p class="meta">Nenhum programa cadastrado ainda. O administrador pode adicionar no Painel do Administrador.</p>';
  }
  const cats = ['Todos'].concat(Array.from(new Set(todos.map(t => t.categoria).filter(Boolean))));
  if(!cats.includes(ferrCat)) ferrCat = 'Todos';
  const destaque = todos.find(t => t.destaque) || null;
  const resto = destaque ? todos.filter(t => t.id !== destaque.id) : todos;
  const list = ferrCat === 'Todos' ? resto : resto.filter(t => t.categoria === ferrCat);
  const icone = { 'Tecnologia & TI':'🖥️', 'Marketing':'📣', 'Financeiro':'💰', 'RH':'👥', 'Comercial':'🤝', 'Qualidade':'🧪' };
  return '<div class="ferr-head">' +
    '<div class="ferr-title"><span class="train-accent-des"></span> <h2> Programas e Ferramentas</h2></div>' +
    '<span class="ferr-count">' + todos.length + ' sistemas</span>' +
    '</div>' +
    (destaque ? '<div class="ferr-feat" style="margin-top:16px">' +
      '<div class="ferr-feat-icon">' + (icone[destaque.categoria] || '🧩') + '</div>' +
      '<div class="ferr-feat-body">' +
        '<div class="ferr-feat-top">' +
          '<h4>' + esc(destaque.nome) + ' • ' + esc(destaque.categoria) + '</h4>' +
          '<span class="ferr-novo">DESTAQUE</span>' +
        '</div>' +
        '<p>' + esc(destaque.desc || '') + '</p>' +
        '<div class="ferr-feat-actions">' +
          '<button class="btn-orange" onclick="toast(\'Abrindo ' + esc(destaque.nome) + ' (demo).\',\'ok\')">Abrir Aplicativo</button>' +
          '<button class="btn-manual" onclick="manualAcao(\'' + destaque.id + '\')">Ver Manual</button>' +
        '</div>' +
      '</div>' +
    '</div>' : '') +
    '<div class="ferr-pills">' + cats.map(c =>
      '<button class="ferr-pill' + (ferrCat === c ? ' active' : '') +
      '" onclick="ferrCat=\'' + c + '\';renderPage()">' + c + '</button>').join('') + '</div>' +
    '<div class="ferr-grid">' +
    (list.map(t =>
      '<div class="ferr-card">' +
        '<h4>' + esc(t.nome) + '</h4>' +
        '<p>' + esc(t.desc || '') + '</p>' +
        '<span class="ferr-tag">' + esc(t.categoria) + '</span>' +
        '<div class="ferr-card-actions">' +
          '<button class="btn-navy-block" onclick="toast(\'' + esc(t.nome) + ' aberto em nova janela (demo).\',\'ok\')">Abrir</button>' +
          '<button class="btn-manual" onclick="manualAcao(\'' + t.id + '\')">Ver Manual</button>' +
        '</div>' +
      '</div>').join('') ||
    '<p class="meta">Nenhuma ferramenta nesta categoria.</p>') +
    '</div>';
}
function manualAcao(programaId){
  const p = get('italac_programas', []).find(x => x.id === programaId && x.ativo !== false);
  if(!p){ toast('Programa não encontrado.', 'err'); return; }
  if(p.manualData){
    const a = document.createElement('a');
    a.href = p.manualData;
    if(/^application\/(pdf|msword|vnd\.openxmlformats)/.test(p.manualTipo || '')){
      a.target = '_blank'; a.rel = 'noopener';
    } else {
      a.download = p.manualNome || 'manual';
    }
    document.body.appendChild(a); a.click(); a.remove();
    return;
  }
  if(p.manualNome){ toast('Arquivo "' + p.manualNome + '" foi anexado, mas o armazenamento não carregou. Tente novamente.', 'err'); return; }
  toast('Manual deste programa ainda não foi publicado.', 'err');
}
/* ================= 22. PÁGINA: HISTÓRIA DA ITALAC ================= */
function pHist(){
  const hist = '<div class="card-his" style="margin-bottom:16px">' +
    '<h3 class="navy-text" style="font-size:1.05rem;margin-bottom:6px">Goiasminas Indústria de Laticínios: De Goiás para o Brasil</h3>' +
    '<p class="sub-text" style="margin:0 0 8px">Fundada em 1996 no coração do Centro-Oeste brasileiro, a Goiasminas nasceu com o firme propósito de valorizar a bacia leiteira nacional e entregar produtos lácteos puros, saborosos e de altíssimo valor nutricional. Com a criação da marca Italac e o consagrado slogan "Lá em casa tem", construímos uma relação de carinho e confiança diária com milhões de famílias.</p>' +
    '<p class="sub-text" style="margin:0">Hoje, operamos plantas fabris de alta tecnologia distribuídas estrategicamente pelo país, processando milhões de litros de leite por dia com processos automatizados, rigoroso controle microbiológico e compromisso social com milhares de produtores rurais integrados.</p>' +
    '</div>';
  const tl = [
    ['1996 • Fundação','A Goiasminas nasce em Goiânia com uma única usina de beneficiamento de leite.'],
    ['2001 • Consolidação','Instalação das primeiras linhas de envase longa vida e adoção da marca Italac com a célebre assinatura "Lá em casa tem".'],
    ['2008 • Liderança em Condensados','Inauguração de novas linhas industriais automatizadas, conquistando a preferência nacional de culinária e sobremesas.'],
    ['2016 • Nutrição Especializada','Pioneirismo no desenvolvimento de fórmulas com digestibilidade especial para dietas com restrição de lactose.'],
    ['2024 • Indústria 4.0 e Sustentabilidade','Mais de 3.500 colaboradores, linhas hiperconectadas e liderança contínua no mercado lácteo brasileiro.']
  ];
  return '<h2 class="sec"><span class="train-accent-des"></span> História da Italac</h2>' +
    hist +
    '<div class="grid2" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:16px;">' +
      '<div class="card-his"><h4 class="navy-text"> Missão</h4><p class="sub-text">Levar nutrição e afeto para a mesa dos brasileiros, com qualidade em cada gota.</p></div>' +
      '<div class="card-his"><h4 class="navy-text"> Visão</h4><p class="sub-text">Ser a marca de lácteos mais presente nas casas do Brasil.</p></div>' +
      '<div class="card-his"><h4 class="navy-text"> Valores</h4><p class="sub-text">Qualidade • Inovação • Sustentabilidade • Pessoas</p></div>' +
    '</div>' +
    '<div class="card-his"><div class="timeline">' +
    tl.map(t => '<div class="tl-item"><div class="tl-year">' + t[0] + '</div>' +
      '<p class="sub-text">' + t[1] + '</p></div>').join('') + '</div></div>';
}
/* ================= 23. PÁGINA: ADMINISTRAÇÃO (só admin) ================= */
let adminTab = 'usuarios';

function pAdmin(){
  const u = me();
  if(!isAdm(u)){
    toast('Acesso restrito ao administrador.', 'err');
    currentPage = 'inicio'; renderPage(); return '';
  }
  const ABAS = ADM_ABAS.concat([
    ['usuarios','👥 Todos os Usuários'],
    ['reqs','📥 Solicitações de acesso'],
    ['docs','📚 Normas & Documentos'],
    ['intranets','🛠️ Intranets'],
  ]);
  setTimeout(admBody, 0);
  return '<h2 class="sec"><span class="train-accent-des"></span>Painel do Administrador</h2>' +
    '<p class="sub-text" style="margin-bottom:12px">Gerencie programas, departamentos, documentos, calendário, usuários, permissões e solicitações. Cada item pode ser adicionado, atualizado ou desativado.</p>' +
    '<div class="adm-tabs">' + ABAS.map(a =>
      '<button class="adm-tab' + (ADM_ABA === a[0] ? ' on' : '') + '" onclick="admAba(\'' + a[0] + '\')">' + a[1] + '</button>').join('') +
    '</div>' +
    '<div id="adm-body" style="margin-top:16px"></div>';
}
function userForm(email){
  const users = get(K.U, []);
  const x = users.find(z => z.email === email) || {};
  const p = x.perms || {};                    // ← passou a usar x (usuário), não mais a combinação
  const cargos = ['Assistente','Auxiliar Administrativo','Jovem Aprendiz','Analista','Coordenador','Gerente','Diretor','Administrador'];
  openModal('<h3>' + (email ? 'Editar' : 'Novo') + ' Usuário</h3>' +
    '<label>Nome completo</label><input id="u-nc" value="' + esc(x.nomeCompleto || '') + '">' +
    '<label>Como prefere ser chamado(a)</label><input id="u-np" value="' + esc(x.nomePreferido || '') + '">' +
    '<label>E-mail (@italac.com.br)</label><input id="u-em" value="' + esc(x.email || '') + '" ' + (email ? 'readonly' : '') + '>' +
    '<label>Senha</label><input id="u-senha" value="' + esc(x.senha || '123456') + '">' +
    '<div class="grid2" style="grid-template-columns:1fr 1fr">' +
      '<div><label>Cargo</label><select id="u-cargo">' +
        cargos.map(c => '<option ' + (x.cargo === c ? 'selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
      '<div><label>Setor</label><select id="u-setor">' +
        ['Administrativo','TI','RH','Financeiro','Marketing','Produção','Qualidade & BPF','Jurídico & Compliance','Logística & Frota','Diretoria']
        .map(s => '<option ' + (x.setor === s ? 'selected' : '') + '>' + s + '</option>').join('') + '</select></div>' +
    '</div>' +
    '<div class="grid2" style="grid-template-columns:1fr 1fr">' +
      '<div><label>Unidade</label><select id="u-unid">' +
        ['Goiânia','Anápolis','Belo Horizonte','Campinas'].map(s => '<option ' + (x.unidade === s ? 'selected' : '') + '>' + s + '</option>').join('') + '</select></div>' +
    '</div>' +
    '<label>Matrícula e Ramal</label><div style="display:flex;gap:8px">' +
      '<input id="u-mat" placeholder="Matrícula" value="' + esc(x.matricula || '') + '">' +
      '<input id="u-ram" placeholder="Ramal" value="' + esc(x.ramal || '') + '"></div>' +
    /* ═══ NOVO BLOCO: liberação POR USUÁRIO (substitui o bloco antigo por setor+cargo) ═══ */
    '<div style="margin-top:10px;padding:12px;background:#EEF2F8;border-radius:10px">' +
      '<b style="font-size:.8rem;color:var(--navy)">🔐 Liberação de acesso deste usuário</b>' +
      '<p class="doc-size" style="margin:4px 0 8px">Marque apenas os acessos que este usuário pode fazer. Sem marcação, ele usa o padrão do papel. "Acesso administrativo" libera tudo.</p>' +
      '<div class="perm-user-grid">' +
  permUserChk('pu-documentos','Gerenciar documentos', p.documentos) +
  permUserChk('pu-comunicacao','Publicar comunicações (criar)', p.comunicacao) +
  permUserChk('pu-comunicacao-propria','Editar as próprias comunicações', p.comunicacaoPropria) +
  permUserChk('pu-comunicacao-todas','Editar todas as comunicações', p.comunicacaoTodas) +
  permUserChk('pu-treinamentos','Criar treinamentos', p.treinamentos) +
  permUserChk('pu-vagas','Solicitar vagas', p.vagas) +
  permUserChk('pu-ocorrencias','Aprovar ocorrências', p.ocorrencias) +
  permUserChk('pu-admin','Acesso administrativo', p.admin) +
'</div>' +
          '<h4 style="margin:14px 0 4px;font-size:.9rem;color:var(--navy)">🌐 Intranets que este usuário pode acessar</h4>' +
    '<p class="doc-size" style="margin-bottom:8px">Marque as intranets liberadas. O papel Administrador e o campo "Acesso administrativo" acessam todas automaticamente.</p>' +
    '<div class="perm-user-grid">' +
            intraList().map(m =>
        permUserChk('pi-' + m.key, m.ic + ' ' + m.n, (x.intranets || []).includes(m.key))
      ).join('') +
    '</div>' +
    '</div>' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="saveUser(\'' + esc(email || '') + '\')">Salvar</button>');
}

function saveUser(email){
  const users = get(K.U, []);
  const nc = v('u-nc'), em = v('u-em').trim().toLowerCase();
  const cargo = v('u-cargo'), setor = v('u-setor');
  const data = {
    email:em, senha:v('u-senha'), nomeCompleto:nc,
    nomePreferido:v('u-np') || nc.split(' ')[0],
    cargo, setor, role:v('u-role'), unidade:v('u-unid'),
    matricula:v('u-mat'), ramal:v('u-ram'),
    ingresso:(users.find(z => z.email === email) || {}).ingresso || new Date().toISOString().slice(0,10),
    perms: {
      documentos: !!document.getElementById('pu-documentos').checked,
      comunicacao: !!document.getElementById('pu-comunicacao').checked,
      comunicacaoPropria: !!document.getElementById('pu-comunicacao-propria').checked,
      comunicacaoTodas: !!document.getElementById('pu-comunicacao-todas').checked,
      treinamentos: !!document.getElementById('pu-treinamentos').checked,
      vagas: !!document.getElementById('pu-vagas').checked,
      ocorrencias: !!document.getElementById('pu-ocorrencias').checked,
      admin: !!document.getElementById('pu-admin').checked
    },
       intranets: intraList().map(m => m.key).filter(k => {
      const el = document.getElementById('pi-' + k);
      return !!(el && el.checked);
    })
  };
  if(email){
    const i = users.findIndex(z => z.email === email);
    users[i] = Object.assign({}, users[i], data);
  } else {
    if(users.some(z => z.email === em)){ toast('E-mail já cadastrado.', 'err'); return; }
    users.push(data);
  }
  set(K.U, users);
  closeModal(); renderPage(); buildNav();
  toast('Usuário ' + (email ? 'atualizado' : 'criado') + ' com sucesso.', 'ok');
}
function permUserChk(id, label, checked){
  return '<label><input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '> ' + label + '</label>';
}

function escopoCalOptions(sel){
  var setores = ['todos'].concat(Array.from(new Set(get(K.U, []).map(x => (x.setor || '').trim()).filter(Boolean))).sort());
  return setores.map(s =>
    '<option value="' + esc(s) + '"' + (sel === s ? ' selected' : '') + '>' +
    (s === 'todos' ? 'Todos os setores' : 'Somente ' + esc(s)) + '</option>').join('');
}
function permUserSave(u){
  function chk(id){ permUserChk('pu-calendario','Criar eventos no calendário', p.calendario); var el = document.getElementById(id); return !!(el && el.checked); }
  u.perms = {
    documentos: chk('pu-documentos'),
    comunicacao: chk('pu-comunicacao'),
    treinamentos: chk('pu-treinamentos'),
    vagas: chk('pu-vagas'),
    ocorrencias: chk('pu-ocorrencias'),
    aprovarVagas: chk('pu-aprovarvagas'),
    calendario: chk('pu-calendario'),
    admin: chk('pu-admin')
  };
  u.calSetor = (document.getElementById('pu-calsetor') || {}).value || u.setor || 'todos';
  return u;
}

/* ================= ADMIN: PAINEL DE GERENCIAMENTO ================= */
function admSeedProgramas(){
  if(get('italac_programas_seedado', false)) return;
  const lista = get('italac_programas', []);
  const seed = [
    { nome:'SAP ERP', categoria:'Financeiro', desc:'Gestão empresarial integrada: suprimentos, produção e finanças.', url:'', ativo:true, destaque:false },
    { nome:'Fluig BPM', categoria:'Tecnologia & TI', desc:'Workflow, documentos eletrônicos e aprovações internas.', url:'', ativo:true, destaque:false },
    { nome:'Power BI', categoria:'Tecnologia & TI', desc:'Dashboards corporativos e indicadores de performance.', url:'', ativo:true, destaque:false },
    { nome:'LIMS', categoria:'Qualidade', desc:'Gestão de laboratório: análises físico-químicas e microbiológicas.', url:'', ativo:true, destaque:false },
    { nome:'Salesforce', categoria:'Comercial', desc:'Gestão de clientes e força de vendas (Trade).', url:'', ativo:true, destaque:false },
    { nome:'Italac Conecta', categoria:'RH', desc:'Portal de colaboradores, benefícios e ponto eletrônico.', url:'', ativo:true, destaque:true }
  ];
  const nomesExistentes = lista.map(p => p.nome);
  const novos = seed.filter(s => !nomesExistentes.includes(s.nome)).map(o => Object.assign({ id: uid() }, o));
  if(novos.length) set('italac_programas', lista.concat(novos));
  set('italac_programas_seedado', true);
}

const ADM_ABAS = [
  ['prog','🖥️ Programas & Ferramentas'],
  ['comunicacao','📣 Comunicação'],
  ['treinamentos','🎓 Treinamentos'],
  ['vagas','💼 Vagas Internas'],
  ['cal','📅 Calendário'],
  ['user','👥 Usuários Restritos']
];
let ADM_ABA = 'prog';


function admAba(aba){
  ADM_ABA = aba;
  renderPage();
}
function admBody(){
  const el = document.getElementById('adm-body'); if(!el) return;
  if(ADM_ABA === 'prog') admProg(el);
  else if(ADM_ABA === 'comunicacao') admComunicacao(el);
  else if(ADM_ABA === 'treinamentos') admTreinamentos(el);
  else if(ADM_ABA === 'vagas') admVagas(el);
  else if(ADM_ABA === 'cal') admCal(el);
  else if(ADM_ABA === 'user') admUser(el);
  else if(ADM_ABA === 'usuarios') admUsuarios(el);
  else if(ADM_ABA === 'reqs') admReqs(el);
  else if(ADM_ABA === 'docs') admDocs(el);
  else if(ADM_ABA === 'intranets') admIntranets(el);
}

/* ---------- Todos os Usuários (CRUD completo) ---------- */
function admUsuarios(el){
  const users = get(K.U, []);
  el.innerHTML = '<div class="tools-row"><button class="btn btn-primary btn-sm" onclick="userForm()">+ Novo Usuário</button></div>' +
    '<table class="adm-tbl"><thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Setor</th><th>Papel</th><th>Acesso</th><th>Ações</th></tr></thead><tbody>' +
    (users.map(x =>
      '<tr><td><b>' + esc(x.nomeCompleto) + '</b><br><span class="doc-size">prefere: ' + esc(x.nomePreferido) + '</span></td>' +
      '<td>' + esc(x.email) + '</td><td>' + esc(x.cargo) + '</td><td>' + esc(x.setor) + '</td>' +
      '<td><span class="badge bg-nv">' + esc(x.role) + '</span></td>' +
      '<td>' + (x.restrito ? '<span class="adm-badge warn">Restrito</span>' : '<span class="adm-badge on">Ativo</span>') + '</td>' +
      '<td><button class="btn btn-ghost btn-sm" onclick="userForm(\'' + esc(x.email) + '\')" title="Editar">✏️</button> ' +
      (x.restrito
        ? '<button class="btn btn-ghost btn-sm" style="color:#1b5e20" onclick="admLiberar(\'' + esc(x.email) + '\')">Liberar</button>'
        : '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="admRestringir(\'' + esc(x.email) + '\')">🔒 Restringir</button>') +
      '</td></tr>').join('') ||
      '<tr><td colspan="7" class="doc-size">Nenhum usuário cadastrado.</td></tr>') +
    '</tbody></table>';
}
function admRestringir(email){
  const u = me();
  if(email === u.email){ toast('Você não pode restringir o próprio acesso.', 'err'); return; }
  if(!confirm('Restringir o acesso de ' + esc(email) + '?')) return;
  set(K.U, get(K.U, []).map(x => x.email === email
    ? Object.assign({}, x, { restrito: true, motivoRestricao: x.motivoRestricao || 'desconhecido' })
    : x));
  toast('Acesso restrito. O usuário aparece em "Usuários Restritos".', 'ok');
  renderPage();
}
function admLiberar(email){
  set(K.U, get(K.U, []).map(x => x.email === email
    ? Object.assign({}, x, { restrito: false, motivoRestricao: '' })
    : x));
  toast('Acesso liberado.', 'ok');
  renderPage();
}
function donoDaComunicacao(c){
  const u = me();
  if(!u || !c) return false;
  const autor = String(c.autor || c.criadoPor || c.email || '').toLowerCase();
  return autor === String(u.email || '').toLowerCase();
}
function podeEditarComunicacao(c){
  const u = me();
  if(!u) return false;
  if(u.role === 'admin' || (u.perms || {}).admin) return true;
  const p = u.perms || {};
  if(p.comunicacaoTodas) return true;
  if(p.comunicacaoPropria) return donoDaComunicacao(c);
  return false;
}
/* ---------- Permissões por usuário ---------- */
/* ===== PERMISSÕES POR USUÁRIO =====
   Cada usuário guarda u.perms = { documentos, comunicacao, treinamentos,
   vagas, ocorrencias, aprovarVagas, calendario, admin } e u.calSetor.
   Papel admin e u.perms.admin passam em tudo. O resto só com checkbox marcado. */
const PERM_PADRAO = {
  gerente:  { documentos:true, treinamentos:true, vagas:true, ocorrencias:true, calendario:true },
  analista: { documentos:true }
};

function temPerm(u, c){
  if(!u) return false;
  if(u.role === 'admin' || (u.perms || {}).admin) return true;
  return (u.perms || {})[c] === true || !!(PERM_PADRAO[u.role] || {})[c];
}
function cap(c){
  return temPerm(me(), c);
}
function canComm(u){ u = u || me(); return temPerm(u, 'comunicacao'); }
function canCreateTrain(u){ u = u || me(); return temPerm(u, 'treinamentos'); }
function canDoc(u){ u = u || me(); return temPerm(u, 'documentos'); }
function canCal(u){ u = u || me(); return temPerm(u, 'calendario'); }

/* Escopo por setor: liberado para agir sobre ITENS do próprio setor.
   calendario usa u.calSetor ('todos' ou setor). Admin passa em tudo. */
function capEscopo(c, itemSetor){
  var u = me();
  if(!u) return false;
  if(u.role === 'admin') return true;
  var p = u.perms || {};
  if(p.admin) return true;
  if(p[c] !== true) return false;
  if(c === 'calendario'){
    var alvo = u.calSetor || 'todos';
    if(alvo === 'todos') return true;
    return depNorm(alvo) === depNorm(itemSetor);
  }
  if(!itemSetor) return true;
  return depNorm(u.setor) === depNorm(itemSetor);
}
/* ---------- Solicitações de acesso ---------- */
function admReqs(el){
  const reqs = get(K.R, []);
  el.innerHTML = '<table class="adm-tbl"><thead><tr><th>Solicitante</th><th>Documento</th><th>Justificativa</th><th>Status</th><th>Ações</th></tr></thead><tbody>' +
    (reqs.map(r =>
      '<tr><td>' + esc(r.nome) + '<br><span class="doc-size">' + esc(r.email) + '</span></td>' +
      '<td>' + esc(r.docTitulo) + '</td><td>' + esc(r.just || '—') + '</td>' +
      '<td>' + (r.status === 'PENDENTE' ? '<span class="st-pendente">Pendente</span>' :
                r.status === 'APROVADA' ? '<span class="st-rh">Aprovada</span>' : '<span class="st-recusado">Negada</span>') + '</td>' +
      '<td>' + (r.status === 'PENDENTE' ?
        '<button class="btn btn-ok btn-sm" onclick="grantReq(\'' + r.id + '\')">Aprovar</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="denyReq(\'' + r.id + '\')">Negar</button>' : '—') + '</td></tr>').join('') ||
      '<tr><td colspan="5" class="doc-size">Nenhuma solicitação registrada.</td></tr>') +
    '</tbody></table>';
}
/* ---------- Normas & Documentos (visão) ---------- */
function admDocs(el){
  const docs = get(K.D, []);
  el.innerHTML = '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">' +
      '<h3 class="navy-text" style="font-size:1rem;margin:0">📚 Normas & Documentos <span class="doc-size">(' + docs.length + ')</span></h3>' +
      '<button class="btn btn-primary btn-sm" onclick="docForm()">+ Novo documento</button>' +
    '</div>' +
    '<p class="doc-size" style="margin-bottom:10px">Gerencie os documentos como na página de Normas & Documentos: renomear, nível de acesso, conceder/remover acesso e excluir.</p>' +
    (docs.length ? '<table class="adm-tbl"><thead><tr><th>Documento</th><th>Departamento</th><th>Nível</th><th>Dono</th><th>Aprovados</th><th style="width:180px">Ações</th></tr></thead><tbody>' +
      docs.map(d => '<tr>' +
        '<td><b>' + esc(d.titulo) + '</b>' + (d.caminho ? '<div class="doc-size">📂 ' + esc(d.caminho) + '</div>' : '') + '</td>' +
        '<td>' + esc(d.departamento) + '</td>' +
        '<td>' + nivelBadge(d.nivel) + '</td>' +
        '<td class="doc-size">' + esc(d.dono) + '</td>' +
        '<td>' + (d.aprovados || []).length + ' pessoa(s)</td>' +
        '<td>' +
          '<button class="btn btn-ghost btn-sm" onclick="manageDoc(\'' + d.id + '\')" title="Gerenciar">⚙️</button> ' +
          '<button class="btn-manual" onclick="abrirDocArquivo(\'' + d.id + '\')" title="Abrir arquivo">📂 Arquivo</button> ' +
          '<button class="btn btn-danger btn-sm" onclick="delDoc(\'' + d.id + '\')" title="Excluir">🗑️</button>' +
        '</td>' +
      '</tr>').join('') + '</tbody></table>' :
      '<p class="meta">Nenhum documento cadastrado. Use "+ Novo documento".</p>') + '</div>';
}

function abrirDocArquivo(id){
  const d = get(K.D, []).find(x => x.id === id);
  if(!d || !d.caminho){ toast('Este documento não tem arquivo vinculado.', 'err'); return; }
  const c = d.caminho.trim();
  if(/^https?:\/\//i.test(c)){ window.open(c, '_blank'); return; }
  const contrabarra = String.fromCharCode(92);
  const u = 'file:///' + c.split(contrabarra).join('/');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(c).catch(function(){});
  }
  toast('Caminho copiado: ' + c, 'ok');
  try { window.open(u, '_blank'); } catch(e){}
} 
/* ---------- Programas & Ferramentas ---------- */
function admProg(el){
  const lista = get('italac_programas', []);
  el.innerHTML = '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">' +
      '<h3 class="navy-text" style="font-size:1rem;margin:0">🖥️ Programas & Ferramentas <span class="doc-size">(' + lista.length + ')</span></h3>' +
      '<button class="btn btn-primary btn-sm" onclick="admProgForm()">+ Novo programa</button>' +
    '</div>' +
    (lista.length ? '<table class="adm-tbl"><thead><tr><th>Nome</th><th>Categoria</th><th>Manual</th><th>Destaque</th><th>Status</th><th style="width:220px">Ações</th></tr></thead><tbody>' +
      lista.map(p => '<tr>' +
        '<td><b>' + esc(p.nome) + '</b><div class="doc-size">' + esc(p.desc || '') + '</div></td>' +
        '<td>' + esc(p.categoria || '—') + '</td>' +
        '<td>' + (p.manualData ? '<a href="javascript:void(0)" onclick="manualAcao(\'' + p.id + '\')" style="color:var(--sky);font-weight:600">📎 ' + esc(p.manualNome || 'Manual') + '</a>' : '<span class="doc-size">—</span>') + '</td>' +
        '<td><button class="btn btn-ghost btn-sm" style="font-size:1.05rem;color:' + (p.destaque ? '#f5a623' : '#cbd5e1') + '" onclick="admProgDestaque(\'' + p.id + '\')" title="' + (p.destaque ? 'Remover destaque' : 'Marcar como destaque') + '">' + (p.destaque ? '⭐' : '☆') + '</button></td>' +
        '<td>' + (p.ativo === false ? '<span class="adm-badge off">Desativado</span>' : '<span class="adm-badge on">Ativo</span>') + '</td>' +
        '<td>' +
          '<button class="btn btn-ghost btn-sm" onclick="admProgForm(\'' + p.id + '\')" title="Editar">✏️</button> ' +
          '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="admProgDel(\'' + p.id + '\')" title="Excluir">🗑️</button>' +
        '</td>' +
      '</tr>').join('') + '</tbody></table>' :
      '<p class="meta">Nenhum programa cadastrado ainda.</p>') + '</div>';
}
function admProgDel(id){
  const p = get('italac_programas', []).find(x => x.id === id); if(!p) return;
  if(!confirm('Excluir o programa "' + p.nome + '" e o manual anexado definitivamente?')) return;
  set('italac_programas', get('italac_programas', []).filter(x => x.id !== id));
  toast('Programa "' + p.nome + '" excluído.', 'ok');
  renderPage();
}
function admProgDestaque(id){
  const lista = get('italac_programas', []);
  const alvo = lista.find(x => x.id === id); if(!alvo) return;
  const novo = !alvo.destaque;
  set('italac_programas', lista.map(x => Object.assign({}, x, { destaque: x.id === id ? novo : false })));
  toast(novo ? 'Programa marcado como destaque.' : 'Destaque removido.', 'ok');
  renderPage();
}
function admProgForm(id){
  const p = get('italac_programas', []).find(x => x.id === id) || {};
  const anexo = p.manualData ? '<div id="ap-anexo-atual" style="margin:6px 0 10px;padding:8px 10px;background:#f1f5f9;border-radius:8px;font-size:.8rem;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">' +
      '<span>📎 ' + esc(p.manualNome || 'Manual anexado') + ' <span class="doc-size">(' + Math.round((p.manualData.length * 0.75) / 1024) + ' KB)</span></span>' +
      '<button type="button" onclick="document.getElementById(\'ap-remover-anexo\').value=\'1\';this.parentElement.remove();document.getElementById(\'ap-arq\').disabled=false" style="background:none;border:none;color:#c0392b;cursor:pointer;font-size:.75rem;font-weight:700">✕ Remover</button>' +
    '</div><input type="hidden" id="ap-remover-anexo" value="">' : '';
  openModal('<h3>' + (id ? '✏️ Atualizar Programa' : '➕ Novo Programa') + '</h3>' +
    '<label>Nome do programa/ferramenta</label><input id="ap-nome" value="' + esc(p.nome || '') + '" placeholder="Ex.: Portal do RH">' +
    '<label>Categoria</label><input id="ap-cat" value="' + esc(p.categoria || '') + '" placeholder="Ex.: Recursos Humanos">' +
    '<label>Descrição</label><textarea id="ap-desc" rows="2" placeholder="O que faz?">' + esc(p.desc || '') + '</textarea>' +
    '<label>Link do aplicativo (opcional)</label><input id="ap-url" value="' + esc(p.url || '') + '" placeholder="https://...">' +
    '<hr style="border:none;border-top:1px solid var(--line);margin:14px 0">' +
    '<h4 style="margin:0 0 4px;font-size:.9rem;color:var(--navy)">📘 Manual do programa</h4>' +
    anexo +
    '<label>' + (p.manualData ? 'Substituir arquivo (opcional)' : 'Arquivo do manual (PDF, Word, TXT, imagem)') + '</label>' +
    '<input type="file" id="ap-arq" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg"' + (p.manualData ? ' disabled' : '') + '>' +
    '<p class="doc-size" style="margin-top:4px">Máximo de 2 MB por arquivo. Formatos maiores que isso não cabem no armazenamento da intranet.</p>' +
    '<div style="display:flex;align-items:center;gap:8px;margin-top:12px;white-space:nowrap">' +
      '<input type="checkbox" id="ap-destaque" style="width:16px;height:16px;flex:0 0 auto;margin:0;accent-color:#f5a623;cursor:pointer"' + (p.destaque ? ' checked' : '') + '>' +
      '<span style="font-size:.85rem;font-weight:600;color:var(--navy);cursor:pointer">Marcar como destaque</span>' +
    '</div>' +
        '<button class="btn btn-primary" style="margin-top:14px" onclick="admProgSave(\'' + (id || '') + '\')">' + (id ? 'Salvar alterações' : 'Adicionar') + '</button>');
}
function admProgSave(id){
  const nome = v('ap-nome').trim(); if(!nome){ toast('Informe o nome.', 'err'); return; }
  const chk = document.getElementById('ap-destaque');
  const destaque = !!(chk && chk.checked);
  const lista = get('italac_programas', []);
  const atual = id ? (lista.find(x => x.id === id) || {}) : {};
  const remover = (document.getElementById('ap-remover-anexo') || {}).value === '1';
  const arqInp = document.getElementById('ap-arq');
  const arq = arqInp && arqInp.files && arqInp.files[0];

  const base = {
    id: id || uid(), nome: nome, categoria: v('ap-cat').trim(), desc: v('ap-desc').trim(),
    url: v('ap-url').trim(), ativo: true, destaque: destaque
  };
  if(remover){ base.manualData = null; base.manualNome = ''; base.manualTipo = ''; }
  else if(!arq){ base.manualData = atual.manualData; base.manualNome = atual.manualNome; base.manualTipo = atual.manualTipo; }

  const conclui = () => {
    if(id){ set('italac_programas', lista.map(x => x.id === id ? Object.assign({}, x, base) : x)); toast('Programa atualizado.', 'ok'); }
    else{ lista.push(base); set('italac_programas', lista); toast('Programa adicionado.', 'ok'); }
    closeModal(); renderPage();
  };

  if(arq){
    if(arq.size > 2 * 1024 * 1024){ toast('Arquivo acima de 2 MB. Escolha um menor.', 'err'); return; }
    const rd = new FileReader();
    rd.onload = function(){
      base.manualData = rd.result;
      base.manualNome = arq.name;
      base.manualTipo = arq.type || 'application/octet-stream';
      conclui();
    };
    rd.onerror = function(){ toast('Não foi possível ler o arquivo.', 'err'); };
    rd.readAsDataURL(arq);
  } else {
    conclui();
  }
}


function depNorm(s){
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
var DEP_ALIASES = {
  rh:'recursoshumanos', 'recursoshumanos':'rh',
  ti:'tecnologia', tecnologia:'ti',
  vendas:'comercial', comercial:'vendas',
  expedicao:'logistica', logistica:'expedicao',
  'r.h.':'rh', 't.i.':'ti'
};
function depSetorCasa(ref, setor){
  if(!setor) return false;
  const a = depNorm(ref.setor || ref.nome), b = depNorm(setor);
  if(!a || !b) return false;
  if(a === b) return true;
  if(a.includes(b) || b.includes(a)) return true;
  const al = DEP_ALIASES[a], bl = DEP_ALIASES[b];
  return (al && (al === b || b.includes(al))) || (bl && (bl === a || a.includes(bl)));
}
function admSeedDepartamentos(){
  const lista = get('italac_departamentos', []);
  const restantes = lista.filter(d => !/teste|tese|test/i.test(depNorm(d.nome)));
  if(restantes.length !== lista.length) set('italac_departamentos', restantes);
  if(get('italac_departamentos_seedado', false)) return;
  const seed = [
    { nome:'Recursos Humanos', setor:'RH', responsavel:'Camila Torres', ativo:true },
    { nome:'Produção', setor:'Produção', responsavel:'Rafael Mendes', ativo:true },
    { nome:'Tecnologia & TI', setor:'TI', responsavel:'Marcos Lopes', ativo:true },
    { nome:'Marketing', setor:'Marketing', responsavel:'Isabela Alves', ativo:true },
    { nome:'Financeiro', setor:'Financeiro', responsavel:'Paulo Ribeiro', ativo:true },
    { nome:'Qualidade', setor:'Qualidade', responsavel:'Larissa Coelho', ativo:true },
    { nome:'Logística', setor:'Logística', responsavel:'Marcos Prado', ativo:true },
    { nome:'Manutenção', setor:'Manutenção', responsavel:'Bruno Tavares', ativo:true },
    { nome:'Distribuição', setor:'Distribuição', responsavel:'Cláudia Nunes', ativo:true }
  ];
  const tem = restantes.map(d => depNorm(d.nome));
  const novos = seed.filter(s => !tem.includes(depNorm(s.nome))).map(o => Object.assign({ id: uid() }, o));
  if(novos.length) set('italac_departamentos', restantes.concat(novos));
  set('italac_departamentos_seedado', true);
}

/* ---------- Calendário ---------- */
function admCal(el){
  const lista = get('italac_calendar', []);
  el.innerHTML = '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">' +
      '<h3 class="navy-text" style="font-size:1rem;margin:0">📅 Calendário <span class="doc-size">(' + lista.length + ' eventos)</span></h3>' +
      '<button class="btn btn-primary btn-sm" onclick="calForm()">+ Novo evento</button>' +
    '</div>' +
    (lista.length ? '<table class="adm-tbl"><thead><tr><th>Evento</th><th>Data</th><th>Tipo</th><th style="width:150px">Ações</th></tr></thead><tbody>' +
      lista.map(e => '<tr>' +
        '<td><b>' + esc(e.nome) + '</b></td>' +
        '<td>' + esc((e.inicio || '').slice(0,10)) + (e.fim && e.fim !== e.inicio ? ' → ' + esc(e.fim.slice(0,10)) : '') + '</td>' +
        '<td>' + esc(e.tipo || '—') + '</td>' +
        '<td>' +
          '<button class="btn btn-ghost btn-sm" onclick="calForm(\'' + e.id + '\')" title="Editar">✏️</button> ' +
          '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="calDel(\'' + e.id + '\')" title="Excluir">🗑️</button>' +
        '</td>' +
      '</tr>').join('') + '</tbody></table>' :
      '<p class="meta">Nenhum evento no calendário.</p>') + '</div>';
}
function admCalToggle(id){
  set('italac_calendar', get('italac_calendar', []).map(x => x.id === id ? Object.assign({}, x, { ativo: x.ativo === false }) : x));
  toast('Status atualizado.', 'ok'); renderPage();
}

/* ---------- Usuários Restritos ---------- */
function admUser(el){
  const users = get(K.U, []).filter(u => u.restrito);
  el.innerHTML = '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">' +
      '<h3 class="navy-text" style="font-size:1rem;margin:0">👥 Usuários Restritos <span class="doc-size">(' + users.length + ')</span></h3>' +
    '</div>' +
    '<p class="doc-size" style="margin-bottom:10px">Aqui aparecem apenas os usuários restringidos. Para restringir, edite o usuário na aba "Todos os Usuários" e escolha o motivo. Para liberar, use o botão aqui.</p>' +
    (users.length ? '<table class="adm-tbl"><thead><tr><th>Nome</th><th>E-mail</th><th>Motivo da restrição</th><th style="width:150px">Ações</th></tr></thead><tbody>' +
      users.map(u => '<tr>' +
        '<td><b>' + esc(u.nomeCompleto || u.email) + '</b></td>' +
        '<td>' + esc(u.email) + '</td>' +
        '<td><span class="adm-badge warn">' + esc(motivoRestricao(u)) + '</span></td>' +
        '<td>' +
          '<button class="btn btn-ghost btn-sm" onclick="admUserForm(\'' + esc(u.email) + '\')" title="Editar motivo">✏️</button> ' +
          '<button class="btn btn-ghost btn-sm" style="color:#1b5e20" onclick="admUserToggle(\'' + esc(u.email) + '\')">Liberar</button>' +
        '</td>' +
      '</tr>').join('') + '</tbody></table>' :
      '<p class="meta">Nenhum usuário restrito no momento. Restrinja um usuário na aba "Todos os Usuários" para ele aparecer aqui.</p>') + '</div>';
}
function motivoRestricao(u){
  if(u.motivoRestricao === 'desativado') return 'Desativado na empresa';
  if(u.motivoRestricao === 'desconhecido') return 'Desconhecido';
  if(u.motivoRestricao) return u.motivoRestricao;
  return 'Desconhecido';
}
function admUserForm(email){
  const users = get(K.U, []);
  const u = users.find(x => x.email === email) || {};
  const ehNovo = !email;
  openModal('<h3>' + (ehNovo ? '➕ Novo Usuário' : '✏️ Atualizar Usuário') + '</h3>' +
    (ehNovo ? '<label>Nome completo</label><input id="au-nome" placeholder="Ex.: Maria Silva">' : '') +
    '<label>E-mail</label><input id="au-email" value="' + esc(u.email || '') + '" ' + (ehNovo ? '' : 'disabled') + '>' +
    '<label>Cargo</label><input id="au-cargo" value="' + esc(u.cargo || '') + '" placeholder="Ex.: Analista">' +
    '<label>Setor</label><input id="au-setor" value="' + esc(u.setor || '') + '" placeholder="Ex.: Financeiro">' +
    '<label>Acesso</label><select id="au-acesso" onchange="document.getElementById(\'au-motivo-wrap\').style.display=this.value===\'restrito\'?\'\':\'none\'">' +
      '<option value="ativo"' + (!u.restrito ? ' selected' : '') + '>Ativo (acesso completo)</option>' +
      '<option value="restrito"' + (u.restrito ? ' selected' : '') + '>Restrito (acesso limitado)</option>' +
    '</select>' +
    '<div id="au-motivo-wrap" style="' + (u.restrito ? '' : 'display:none') + '">' +
      '<label>Motivo da restrição</label><select id="au-motivo">' +
        '<option value="desativado"' + (u.motivoRestricao === 'desativado' ? ' selected' : '') + '>Desativado na empresa</option>' +
        '<option value="desconhecido"' + (u.motivoRestricao === 'desconhecido' || !u.motivoRestricao ? ' selected' : '') + '>Desconhecido</option>' +
      '</select>' +
    '</div>' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="admUserSave(\'' + (email || '') + '\')">' + (ehNovo ? 'Adicionar' : 'Salvar alterações') + '</button>');
}

function admUserSave(email){
  const users = get(K.U, []);
  const ehNovo = !email;
  const mail = ehNovo ? v('au-email').trim() : email;
  if(!mail){ toast('Informe o e-mail.', 'err'); return; }
  if(ehNovo && users.some(x => x.email === mail)){ toast('Já existe um usuário com esse e-mail.', 'err'); return; }
  const restrito = v('au-acesso') === 'restrito';
  const o = {
    email: mail,
    nomeCompleto: ehNovo ? (v('au-nome').trim() || mail) : (users.find(x => x.email === email) || {}).nomeCompleto,
    cargo: v('au-cargo').trim(), setor: v('au-setor').trim(),
    restrito: restrito,
    motivoRestricao: restrito ? v('au-motivo') : ''
  };
  if(ehNovo){ users.push(o); set(K.U, users); toast('Usuário adicionado.', 'ok'); }
  else{ set(K.U, users.map(x => x.email === email ? Object.assign({}, x, o) : x)); toast('Usuário atualizado.', 'ok'); }
  closeModal(); renderPage();
}
function admUserToggle(email){
  set(K.U, get(K.U, []).map(x => x.email === email
    ? Object.assign({}, x, { restrito: !x.restrito, motivoRestricao: !x.restrito ? (x.motivoRestricao || 'desconhecido') : '' })
    : x));
  toast('Acesso atualizado.', 'ok'); renderPage();
}

function admComunicacao(el){
  const list = get(K.C, []);
  const tabLbl = { tv:'TV Corporativa', mercado:'Mercado Lácteo', empresa:'Notícias da Empresa' };
  el.innerHTML = '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">' +
      '<h3 class="navy-text" style="font-size:1rem;margin:0">📣 Comunicação Corporativa <span class="doc-size">(' + list.length + ')</span></h3>' +
      '<button class="btn btn-primary btn-sm" onclick="commForm()">+ Nova Comunicação</button>' +
    '</div>' +
    '<p class="doc-size" style="margin-bottom:10px">Gerencie as publicações de todas as abas: editar, excluir e definir o destaque da Home. Mesmas funções da página de Comunicação.</p>' +
    (list.length ? '<table class="adm-tbl"><thead><tr><th>Título</th><th>Aba</th><th>Tipo</th><th>Data</th><th>Destaque</th><th style="width:200px">Ações</th></tr></thead><tbody>' +
      list.map(c => '<tr>' +
        '<td><b>' + esc(c.titulo) + '</b>' + (c.autor ? '<div class="doc-size">por ' + esc(c.autor) + '</div>' : '') + '</td>' +
        '<td>' + esc(tabLbl[c.tab] || c.tab) + '</td>' +
        '<td><span class="adm-badge sk">' + esc(c.tipo) + '</span></td>' +
        '<td>' + esc(c.data) + '</td>' +
        '<td><button class="btn btn-ghost btn-sm" style="color:' + (c.dest ? '#e67e22' : '#cbd5e1') + '" onclick="destaqueComm(\'' + c.id + '\')" title="' + (c.dest ? 'Remover destaque' : 'Destacar na Home') + '">' + (c.dest ? '★' : '☆') + '</button></td>' +
        '<td>' +
          '<button class="btn btn-ghost btn-sm" onclick="commForm(\'' + c.id + '\')" title="Editar">✏️</button> ' +
          '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="delComm(\'' + c.id + '\')" title="Excluir">🗑️</button>' +
        '</td>' +
      '</tr>').join('') + '</tbody></table>' :
      '<p class="meta">Nenhuma comunicação cadastrada. Use "+ Nova Comunicação".</p>') + '</div>';
}

function admTreinamentos(el){
  const list = get(K.T, []);
  const tipoLbl = { 'PDF':'📘 PDF', 'Vídeo':'🎬 Vídeo', 'Impresso':'📄 Impresso' };
  el.innerHTML = '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">' +
      '<h3 class="navy-text" style="font-size:1rem;margin:0">🎓 Treinamentos <span class="doc-size">(' + list.length + ')</span></h3>' +
      '<button class="btn btn-primary btn-sm" onclick="trainForm()">+ Novo Treinamento</button>' +
    '</div>' +
    '<p class="doc-size" style="margin-bottom:10px">Gerencie os treinamentos da Academia Italac: criar, editar, excluir e anexar arquivo ou link. Mesmas funções da página de Treinamentos.</p>' +
    (list.length ? '<table class="adm-tbl"><thead><tr><th>Título</th><th>Formato</th><th>Unidade</th><th>Data</th><th>Autor</th><th style="width:180px">Ações</th></tr></thead><tbody>' +
      list.map(t => '<tr>' +
        '<td><b>' + esc(t.titulo) + '</b>' +
          (t.ext ? '<div class="doc-size">📎 ' + esc(t.ext) + '</div>' : t.url ? '<div class="doc-size">🔗 ' + esc(trainHost(t.url)) + '</div>' : '') + '</td>' +
        '<td><span class="adm-badge sk">' + esc(tipoLbl[t.tipo] || t.tipo) + '</span></td>' +
        '<td>' + esc(t.unidade || 'Goiânia') + '</td>' +
        '<td>' + esc(t.data || '—') + '</td>' +
        '<td class="doc-size">' + esc(t.autor || '—') + '</td>' +
        '<td>' +
          '<button class="btn btn-ghost btn-sm" onclick="openTrain(\'' + t.id + '\')" title="Abrir">▶️</button> ' +
          '<button class="btn btn-ghost btn-sm" onclick="trainForm(\'' + t.id + '\')" title="Editar">✏️</button> ' +
          '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="delTrain(\'' + t.id + '\')" title="Excluir">🗑️</button>' +
        '</td>' +
      '</tr>').join('') + '</tbody></table>' :
      '<p class="meta">Nenhum treinamento cadastrado. Use "+ Novo Treinamento".</p>') + '</div>';
}

/* ---------- Vagas Internas ---------- */
function admVagas(el){
  const list = get(K.J, []);
  const statusLbl = { 'PENDENTE_RH':'⏳ Pendente RH', 'APROVADA':'✅ Aberta', 'FECHADA':'🔒 Fechada' };
  el.innerHTML = '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">' +
      '<h3 class="navy-text" style="font-size:1rem;margin:0">💼 Vagas Internas <span class="doc-size">(' + list.length + ')</span></h3>' +
      '<button class="btn btn-primary btn-sm" onclick="admVagaForm()">+ Nova vaga</button>' +
    '</div>' +
    '<p class="doc-size" style="margin-bottom:10px">Gerencie as vagas: cadastrar, editar, excluir, abrir e fechar o processo seletivo.</p>' +
    (list.length ? '<table class="adm-tbl"><thead><tr><th>Vaga</th><th>Setor</th><th>Unidade</th><th>Período</th><th>Status</th><th style="width:220px">Ações</th></tr></thead><tbody>' +
      list.map(j => '<tr>' +
        '<td><b>' + esc(j.titulo) + '</b><div class="doc-size">' + esc(j.desc || '') + '</div></td>' +
        '<td>' + esc(j.setor) + '</td>' +
        '<td>' + esc(j.unidade || '—') + '</td>' +
        '<td class="doc-size">' + (j.inicio ? esc(j.inicio) : '—') + (j.fim ? ' → ' + esc(j.fim) : '') + '</td>' +
        '<td><span class="adm-badge ' + (j.status === 'APROVADA' ? 'on' : j.status === 'FECHADA' ? 'off' : 'warn') + '">' + esc(statusLbl[j.status] || j.status) + '</span></td>' +
        '<td>' +
          '<button class="btn btn-ghost btn-sm" onclick="admVagaForm(\'' + j.id + '\')" title="Editar">✏️</button> ' +
          (j.status === 'APROVADA'
            ? '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="admVagaStatus(\'' + j.id + '\',\'FECHADA\')">🔒 Fechar</button>'
            : '<button class="btn btn-ghost btn-sm" style="color:#1b5e20" onclick="admVagaStatus(\'' + j.id + '\',\'APROVADA\')">✅ Abrir</button>') + ' ' +
          '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="admVagaDel(\'' + j.id + '\')" title="Excluir">🗑️</button>' +
        '</td>' +
      '</tr>').join('') + '</tbody></table>' :
      '<p class="meta">Nenhuma vaga cadastrada.</p>') + '</div>';
}
function admVagaForm(id){
  const j = get(K.J, []).find(x => x.id === id) || {};
  openModal('<h3>' + (id ? '✏️ Atualizar Vaga' : '➕ Nova Vaga') + '</h3>' +
    '<label>Título da vaga</label><input id="av-t" value="' + esc(j.titulo || '') + '">' +
    '<label>Setor</label><select id="av-s">' + DEPTS.map(d => '<option' + (j.setor === d ? ' selected' : '') + '>' + d + '</option>').join('') + '</select>' +
    '<label>Unidade</label><input id="av-u" value="' + esc(j.unidade || '') + '" placeholder="Ex.: Goiânia">' +
    '<label>Descrição</label><textarea id="av-d" rows="2">' + esc(j.desc || '') + '</textarea>' +
    '<label>Requisitos</label><textarea id="av-r" rows="2">' + esc(j.req || '') + '</textarea>' +
    '<label>Salário (opcional)</label><input id="av-sal" value="' + esc(j.salario || '') + '" placeholder="R$ —,——">' +
    '<div class="grid2" style="grid-template-columns:1fr 1fr">' +
      '<div><label>Data de início do processo</label><input type="date" id="av-inicio" value="' + esc(j.inicio || '') + '"></div>' +
      '<div><label>Data de fim do processo</label><input type="date" id="av-fim" value="' + esc(j.fim || '') + '"></div>' +
    '</div>' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="admVagaSave(\'' + (id || '') + '\')">' + (id ? 'Salvar alterações' : 'Adicionar') + '</button>');
}
function admVagaSave(id){
  const titulo = v('av-t').trim(); if(!titulo){ toast('Informe o título.', 'err'); return; }
  const lista = get(K.J, []);
  const o = {
    id: id || uid(), titulo: titulo, setor: v('av-s'), unidade: v('av-u').trim(),
    desc: v('av-d').trim(), req: v('av-r').trim(), salario: v('av-sal').trim(),
    inicio: v('av-inicio'), fim: v('av-fim'),
    status: id ? ((lista.find(x => x.id === id) || {}).status || 'APROVADA') : 'APROVADA'
  };
  if(id){ set(K.J, lista.map(x => x.id === id ? o : x)); toast('Vaga atualizada.', 'ok'); }
  else{ lista.push(o); set(K.J, lista); toast('Vaga adicionada.', 'ok'); }
  closeModal(); renderPage();
}
function admVagaStatus(id, status){
  set(K.J, get(K.J, []).map(x => x.id === id ? Object.assign({}, x, { status: status }) : x));
  toast(status === 'APROVADA' ? 'Vaga aberta.' : 'Vaga fechada.', 'ok');
  renderPage();
}
function admVagaDel(id){
  const j = get(K.J, []).find(x => x.id === id); if(!j) return;
  if(!confirm('Excluir a vaga "' + j.titulo + '" definitivamente?')) return;
  set(K.J, get(K.J, []).filter(x => x.id !== id));
  toast('Vaga excluída.', 'ok'); renderPage();
}
/* ================= INTRANETS POR SETOR ================= */
const INTRANET_DEPTS = {
  rh:             ['rh','recursoshumanos'],
  financeiro:     ['financeiro'],
  marketing:      ['marketing'],
  ti:             ['ti','tecnologia'],
  administrativo: ['administrativo'],
  diretoria:      ['diretoria'],
  producao:       ['producao'],
  qualidade:      ['qualidade','qualidade & bpf'],
  juridico:       ['juridico','compliance','juridico & compliance'],
  logistica:      ['logistica','frota','logistica & frota']
};
const INTRANET_META = {
  rh:             { n:'Intranet RH',                 ic:'👥',  desc:'Central da área de Recursos Humanos: portais, benefícios, ponto e ocorrências.' },
  financeiro:     { n:'Intranet Financeiro',         ic:'💰',  desc:'Central da área Financeira: SAP FI/CO, fluxo de caixa, notas fiscais e orçamento.' },
  marketing:      { n:'Intranet Marketing',          ic:'📣',  desc:'Central da área de Marketing: campanhas, identidade visual, mídia e redes sociais.' },
  ti:             { n:'Intranet TI',                 ic:'🖥️',  desc:'Central de Tecnologia: chamados, manuais de sistemas, acessos e segurança da informação.' },
  administrativo: { n:'Intranet Administrativo',     ic:'🗂️',  desc:'Central do Administrativo: documentos internos, expediente, compras e protocolo.' },
  diretoria:      { n:'Intranet Diretoria',          ic:'🏛️',  desc:'Central da Diretoria: metas, reuniões, indicadores e comunicados executivos.' },
  producao:       { n:'Intranet Produção',           ic:'🏭',  desc:'Central da Produção: ordens de fabricação, BPF, manutenção e segurança do trabalho.' },
  qualidade:      { n:'Intranet Qualidade & BPF',    ic:'✅',  desc:'Central da Qualidade: padrões, análises, auditorias e documentação de BPF.' },
  juridico:       { n:'Intranet Jurídico & Compliance', ic:'⚖️', desc:'Central do Jurídico: contratos, compliance, LGPD e política anticorrupção.' },
  logistica:      { n:'Intranet Logística & Frota',  ic:'🚛',  desc:'Central de Logística: transportes, roteirização, frota e entrega.' }
};
const INTRANET_LINKS = {
  rh: [
    { n:'Portal Meu RH',          d:'Holerites, informe de rendimentos e benefícios.', u:'' },
    { n:'Ponto Eletrônico',       d:'Marcações, espelhos e aprovações de ponto.',       u:'' },
    { n:'Solicitar Férias',       d:'Solicitação e acompanhamento de férias.',          u:'' },
    { n:'Ocorrências de Ponto',   d:'Registrar e acompanhar ocorrências.',              u:'rh', rota:true },
    { n:'Benefícios',             d:'Vale-transporte, vale-alimentação e plano.',       u:'' }
  ],
  financeiro: [
    { n:'SAP FI/CO',              d:'Contabilidade, contas a pagar e receber.',         u:'' },
    { n:'Fluxo de Caixa',         d:'Posição diária e projeções.',                      u:'' },
    { n:'Notas Fiscais',          d:'Emissão e conferência de NF-e.',                   u:'' },
    { n:'Contas a Pagar',         d:'Faturas, vencimentos e baixas.',                   u:'' },
    { n:'Orçamento',              d:'Metas, acompanhamento e revisões.',                u:'' }
  ],
  marketing: [
    { n:'Calendário de Campanhas', d:'Agenda de ações e lançamentos.',                  u:'' },
    { n:'Modelos de Briefing',     d:'Briefings prontos para preencher.',               u:'' },
    { n:'Identidade Visual',       d:'Logos, cores e manuais de marca.',                u:'' },
    { n:'Central de Mídia',        d:'Fotos, vídeos e materiais de PDV.',               u:'' },
    { n:'Redes Sociais',           d:'Conteúdos e calendário de posts.',                u:'' }
  ],
  ti: [
    { n:'Abrir Chamado',           d:'Help desk e solicitações de TI.',                 u:'' },
    { n:'Manuais de Sistemas',     d:'SAP, Fluig, LIMS, Power BI e mais.',              u:'ferramentas', rota:true },
    { n:'VPN e Acesso Remoto',     d:'Conectividade fora da unidade.',                  u:'' },
    { n:'Gestão de Senhas',        d:'Troca e recuperação de senhas.',                  u:'' },
    { n:'Segurança da Informação', d:'Políticas e boas práticas.',                      u:'' }
  ],
  administrativo: [
    { n:'Expediente',              d:'Rotinas administrativas e horários.',             u:'' },
    { n:'Protocolo Interno',       d:'Entrada e acompanhamento de documentos.',         u:'' },
    { n:'Compras',                 d:'Solicitações de compra e fornecedores.',          u:'' },
    { n:'Contratos',               d:'Gestão de contratos administrativos.',            u:'' },
    { n:'Formulários',             d:'Requisições e modelos prontos.',                  u:'' }
  ],
  diretoria: [
    { n:'Metas e Indicadores',     d:'Metas da unidade e KPIs executivos.',             u:'' },
    { n:'Reuniões',                d:'Pautas, atas e calendário de reuniões.',          u:'' },
    { n:'Comunicados',             d:'Comunicados oficiais da Diretoria.',              u:'' },
    { n:'Apresentações',           d:'Deck e materiais de reunião executiva.',          u:'' },
    { n:'Gestão à Vista',          d:'Painéis de resultados por área.',                 u:'' }
  ],
  producao: [
    { n:'Ordens de Produção',      d:'Acompanhamento de ordens e apontamento.',         u:'' },
    { n:'BPF',                     d:'Boas Práticas de Fabricação e padrões.',          u:'' },
    { n:'Manutenção',              d:'Chamados e plano de manutenção.',                 u:'' },
    { n:'Segurança do Trabalho',   d:'EPIs, procedimentos e treinamentos.',             u:'' },
    { n:'Indicadores de Fábrica',  d:'OEE, perdas e produtividade.',                    u:'' }
  ],
  qualidade: [
    { n:'Padrões Internos',        d:'Especificações e procedimentos de qualidade.',    u:'' },
    { n:'Análises Laboratoriais',  d:'Resultados de análises físico-químicas.',         u:'' },
    { n:'Auditorias',              d:'Agenda e relatórios de auditoria.',               u:'' },
    { n:'Rastreabilidade',         d:'Controle de lote e rastreio.',                    u:'' },
    { n:'Não Conformidades',       d:'Registro e acompanhamento de NC.',                u:'' }
  ],
  juridico: [
    { n:'Contratos',               d:'Minutas, modelos e vigências.',                   u:'' },
    { n:'Compliance',              d:'Canal de ética e políticas internas.',            u:'' },
    { n:'LGPD',                    d:'Procedimentos de proteção de dados.',             u:'' },
    { n:'Processos Judiciais',     d:'Acompanhamento de demandas e prazos.',            u:'' },
    { n:'Modelos de Documento',    d:'Contratos e documentos jurídicos prontos.',       u:'' }
  ],
  logistica: [
    { n:'Rastreamento de Entregas', d:'Acompanhamento de viagens e entregas.',          u:'' },
    { n:'Roteirização',            d:'Planejamento de rotas e cargas.',                 u:'' },
    { n:'Frota',                   d:'Manutenção, abastecimento e documentos da frota.',u:'' },
    { n:'Expedição',               d:'Carregamento e conferência de embarques.',        u:'' },
    { n:'Indicadores Logísticos',  d:'OTIF, custo por km e utilização.',                u:'' }
  ]
};
function depNorm(s){
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function userAcessaIntranet(key){
  const u = me();
  if(!u) return false;
  if(intraMeta(key).ativo === false) return false;
  if(u.role === 'admin' || (u.perms || {}).admin) return true;
  if((u.intranets || []).includes(key)) return true;
  return intraDepts(key).indexOf(depNorm(u.setor)) !== -1;
}
function pIntranetHub(){
  const metas = intraList().filter(function(m){ return m.ativo !== false; });
  if(!metas.length) return '<h2 class="sec"><span class="train-accent-des"></span>  Intranets por Setor</h2>' +
    '<div class="card"><p class="meta">Nenhuma intranet ativa no momento.</p></div>';
  return '<h2 class="sec"><span class="train-accent-des"></span>  Intranets por Setor</h2>' +
    '<div class="ferr-grid">' +
    metas.map(function(m){
      const ok = userAcessaIntranet(m.key);
      const rota = m.rota || 'intra-' + m.key;
      return '<div class="ferr-card' + (ok ? '' : ' locked') + '"><h4>' + esc(m.n) + '</h4>' +
        '<p>' + esc(m.desc) + '</p>' +
        '<button class="btn-navy-block" onclick="page=\'' + esc(rota) + '\';renderPage()">' +
        (ok ? 'Acessar' : '🔒 Sem acesso') + '</button></div>';
    }).join('') + '</div>';
}
function pIntranetSetor(key){
  const meta = intraMeta(key);
  if(!userAcessaIntranet(key)){
    return '<h2 class="sec"><span class="train-accent-des"></span> ' + esc(meta.n) + '</h2>' +
      '<div class="card"><p class="meta">🔒 Esta intranet não está liberada para o seu acesso. Fale com o administrador para solicitar a liberação.</p></div>';
  }
  const depts = intraDepts(key);
  const links = INTRANET_LINKS[key] || [];
  let h = '<h2 class="sec"><span class="train-accent-des"></span> ' + esc(meta.n) + '</h2>' +
    '<div class="sub-text" style="margin-bottom:14px">' + esc(meta.desc) + '</div>';
  if(links.length){
    h += '<div class="ferr-grid">' +
      links.map(function(l){
        const acao = l.rota
          ? "page='" + l.u + "';renderPage()"
          : (l.u ? "window.open('" + l.u + "','_blank')" : "toast('Link ainda não configurado.','warn')");
        return '<div class="ferr-card"><h4>' + (l.i || '🔗') + ' ' + esc(l.n) + '</h4><p>' + esc(l.d) + '</p>' +
          '<button class="btn-navy-block" onclick="' + acao + '">Abrir</button></div>';
      }).join('') + '</div>';
  } else {
    h += '<p class="meta">Nenhum atalho configurado nesta intranet.</p>';
  }
  const docs = get(K.D, []).filter(function(d){
    return depts.indexOf(depNorm(d.departamento)) !== -1 && docAccess(d, me()) !== 'hidden';
  });
  if(docs.length){
    h += '<h2 class="sec">📚 Documentos do setor</h2><div class="card">' +
      docs.map(function(d){
        const acc = docAccess(d, me());
        return '<div class="doc-item"><span>📄</span>' +
          '<div class="grow"><b>' + esc(d.titulo) + '</b><div class="doc-size">' + esc(d.tamanho) + '</div></div>' +
          (acc === 'open' ? '<button class="btn btn-navy btn-sm" onclick="openDoc(\'' + d.id + '\')">Abrir</button>' : '<span class="lock">🔒</span>');
      }).join('') + '</div></div>';
  }
  const equipe = get(K.U, []).filter(function(x){
    return x.ativo !== false && depts.indexOf(depNorm(x.setor)) !== -1;
  });
  const ehAdmin = isAdmin();
  if(equipe.length){
    h += '<h2 class="sec">👥 Equipe do setor</h2><div class="dep-grid">' +
      equipe.map(function(x){
        const nome = x.nomeCompleto || x.email || 'Colaborador';
        return '<div class="usr-card' + (ehAdmin ? ' usr-clicavel' : '') + '"' +
          (ehAdmin ? ' onclick="userForm(\'' + esc(x.email) + '\')" title="Clique para editar cadastro"' : '') + '>' +
          '<div class="usr-av">' + initials(nome) + '</div>' +
          '<div class="usr-info"><b>' + esc(nome) + '</b>' +
          '<span class="usr-role">' + esc(x.cargo || '') + ' • ' + esc(x.setor || '') + '</span>' +
          '<a class="usr-mail" href="mailto:' + esc(x.email || '') + '" onclick="event.stopPropagation()">' + esc(x.email || '') + '</a>' +
          (ehAdmin ? '<span class="usr-edit">✏️ Clique para editar</span>' : '') +
          '</div></div>';
      }).join('') + '</div>';
  }
  return h;
}
/* ===== APOIO: PERMISSÕES + CRUD DE INTRANETS ===== */
function permUserChk(id, label, checked, extra){
  return '<label><input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + (extra || '') + '> ' + label + '</label>';
}
function intraSeed(){
  return Object.keys(INTRANET_META).map(function(k){
    return {
      key: k,
      n: INTRANET_META[k].n,
      desc: INTRANET_META[k].desc || '',
      depts: (INTRANET_DEPTS[k] || []).slice(),
      rota: 'intra-' + k,
      ativo: true
    };
  });
}
function intraList(){
  var s = get('italac_intranets', null);
  if(s && s.itens) return s.itens;
  return intraSeed();
}
function intraCommit(itens){ set('italac_intranets', { itens: itens }); }
function intraMeta(key){
  var it = intraList().find(function(x){ return x.key === key; });
  return it || { key: key, n: key, desc: '', depts: [], rota: 'intra-' + key, ativo: true };
}
function intraDepts(key){ return (intraMeta(key).depts || []).slice(); }
function intraColabs(key){
  var depts = intraDepts(key);
  return get(K.U, []).filter(function(u){
    if(!u || u.ativo === false) return false;
    if(u.role === 'admin' || (u.perms || {}).admin) return true;
    if((u.intranets || []).indexOf(key) !== -1) return true;
    return depts.some(function(d){ return depNorm(d) === depNorm(u.setor); });
  });
}
function admIntranets(el){
  const lista = intraList();
  el.innerHTML = '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">' +
      '<h3 class="navy-text" style="font-size:1rem;margin:0">🛠️ Intranets <span class="doc-size">(' + lista.length + ')</span></h3>' +
      '<button class="btn btn-primary btn-sm" onclick="intraForm()">+ Nova intranet</button>' +
    '</div>' +
    '<p class="doc-size" style="margin-bottom:10px">Edite nome, descrição e link, ative/desative e exclua intranets.</p>' +
    (lista.length ? '<table class="adm-tbl"><thead><tr><th>Intranet</th><th>Status</th><th>Pessoas com acesso</th><th>Link da página</th><th style="width:170px">Ações</th></tr></thead><tbody>' +
      lista.map(function(m){
        const nColab = intraColabs(m.key).length;
        const ativa = m.ativo !== false;
        return '<tr style="' + (ativa ? '' : 'opacity:.55') + '">' +
          '<td><b>' + esc(m.n) + '</b></td>' +
          '<td><span style="font-size:.72rem;padding:2px 8px;border-radius:20px;background:' + (ativa ? '#e8f5e9' : '#fdecea') + ';color:' + (ativa ? '#2e7d32' : '#c0392b') + '">' + (ativa ? '● Ativa' : '● Inativa') + '</span></td>' +
          '<td>' + nColab + ' colaborador(es)</td>' +
          '<td class="doc-size">' + esc(m.rota || 'intra-' + m.key) + '</td>' +
          '<td>' +
            '<button class="btn btn-ghost btn-sm" onclick="intraForm(\'' + esc(m.key) + '\')" title="Editar">✏️</button> ' +
            '<button class="btn btn-ghost btn-sm" onclick="toggleIntra(\'' + esc(m.key) + '\')" title="' + (ativa ? 'Desativar' : 'Ativar') + '">' + (ativa ? '⛔' : '▶️') + '</button> ' +
            '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="delIntra(\'' + esc(m.key) + '\')" title="Excluir">🗑️</button>' +
          '</td>' +
        '</tr>';
      }).join('') + '</tbody></table>' :
      '<p class="meta">Nenhuma intranet cadastrada. Use "+ Nova intranet".</p>') + '</div>';
}
function toggleIntra(key){
  const lista = intraList();
  const alvo = lista.find(function(x){ return x.key === key; });
  if(!alvo) return;
  const novo = alvo.ativo === false;
  intraCommit(lista.map(function(x){ return x.key === key ? Object.assign({}, x, { ativo: novo }) : x; }));
  toast('Intranet ' + (novo ? 'ativada.' : 'desativada.'), 'ok');
  renderPage(); buildNav();
}
function intraForm(key){
  const m = key ? intraMeta(key) : null;
  const chave = m ? m.key : '';
  const colabs = intraColabs(chave);
  const ativa = m ? (m.ativo !== false) : true;
  const listaColabs = colabs.length
    ? colabs.map(function(u){
        const n = u.nomeCompleto || u.email || 'Colaborador';
        return '<div class="bday">' +
          '<div class="mini-av">' + initials(n) + '</div>' +
          '<div><b style="font-size:.84rem">' + esc(n) + '</b>' +
          '<div style="font-size:.72rem;color:var(--muted)">' + esc(u.cargo || '') + ' • ' + esc(u.setor || '') + '</div></div>' +
        '</div>';
      }).join('')
    : '<p class="meta" style="margin:0">Nenhum colaborador com acesso (apenas o administrador).</p>';
  openModal('<h3>' + (m ? '✏️ Editar intranet — ' + esc(m.n) : '➕ Nova intranet') + '</h3>' +
    '<label>Nome da intranet</label>' +
    '<input id="in-nome" value="' + esc(m ? m.n : '') + '" placeholder="Ex.: Intranet RH">' +
    '<label>Status</label><select id="in-ativo">' +
      '<option value="1"' + (ativa ? ' selected' : '') + '>🟢 Ativa</option>' +
      '<option value="0"' + (!ativa ? ' selected' : '') + '>🔴 Inativa</option>' +
    '</select>' +
    '<label>Descrição</label>' +
    '<textarea id="in-desc" rows="2" placeholder="O que essa intranet reúne?">' + esc(m ? m.desc : '') + '</textarea>' +
    '<label>👥 Colaboradores com acesso <span class="doc-size">(' + colabs.length + ')</span></label>' +
    '<div class="card" style="padding:10px;max-height:170px;overflow-y:auto">' + listaColabs + '</div>' +
    '<label>🔗 Link da página (rota interna)</label>' +
    '<input id="in-rota" value="' + esc(m ? (m.rota || 'intra-' + m.key) : '') + '" placeholder="intra-rh">' +
    '<p class="doc-size" style="margin-top:4px">Rota que abre esta intranet. Troque por uma rota única e sem espaços.</p>' +
    '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' +
      '<button class="btn btn-primary" onclick="saveIntra(\'' + esc(chave) + '\')">Salvar</button>' +
      (m ? '<button class="btn btn-ghost" style="color:#c0392b" onclick="delIntra(\'' + esc(m.key) + '\')">Excluir</button>' : '') +
    '</div>');
}
function saveIntra(key){
  const nome = (v('in-nome') || '').trim();
  if(!nome){ toast('Informe o nome da intranet.', 'err'); return; }
  const desc = (v('in-desc') || '').trim();
  const rota = (v('in-rota') || '').trim().replace(/\s+/g, '-') || ('intra-' + (key || Date.now()));
  const ativo = v('in-ativo') === '1';
  const lista = intraList();
  const alvo = key ? lista.find(function(x){ return x.key === key; }) : null;
  if(alvo){
    intraCommit(lista.map(function(x){ return x.key === key ? Object.assign({}, x, { n: nome, desc: desc, rota: rota, ativo: ativo }) : x; }));
  } else {
    const novaKey = 'intra' + Date.now();
    lista.push({ key: novaKey, n: nome, desc: desc, depts: [], rota: rota, ativo: ativo });
    intraCommit(lista);
  }
  closeModal(); renderPage(); buildNav();
  toast('Intranet salva.', 'ok');
}
function delIntra(key){
  const alvo = intraList().find(function(x){ return x.key === key; });
  if(!alvo) return;
  if(!confirm('Excluir a intranet "' + alvo.n + '" definitivamente?')) return;
  intraCommit(intraList().filter(function(x){ return x.key !== key; }));
  toast('Intranet excluída.', 'ok');
  renderPage();
}
/* ================= 24. TOUR DE BOAS-VINDAS ================= */
const TOUR = [
  ['1/4','Bem-vindo(a) à Intranet Italac!','No menu à esquerda você acessa todas as áreas: comunicações, documentos, RH, vagas e mais. Seu avatar fica no canto superior direito, com "Meu Perfil" e "Sair".'],
  ['2/4','Busca global','Use o campo de busca no topo para encontrar rapidamente documentos, ferramentas, treinamentos e seções — digite, por exemplo, "holerite" ou "BPF".'],
  ['3/4','Notificações','O sino exibe pendências que dependem de você: solicitações de acesso, aprovações de ocorrências de ponto e vagas aguardando o RH (quando aplicável ao seu papel).'],
  ['4/4','Guia sempre disponível','Precisa de ajuda de novo? Clique em "Guia da Intranet" no rodapé do menu, a qualquer momento. Lá em casa tem tudo o que você precisa! 💙']
];
let tourStep = 0;

function startTour(){ tourStep = 0; document.getElementById('tour-overlay').classList.remove('hidden'); renderTour(); }
function renderTour(){
  const t = TOUR[tourStep];
  document.getElementById('tour-step-indicator').textContent = 'Passo ' + t[0];
  document.getElementById('tour-title').textContent = t[1];
  document.getElementById('tour-desc').textContent = t[2];
  document.getElementById('tour-next').textContent = tourStep === TOUR.length - 1 ? 'Concluir' : 'Próximo';
}
function nextTourStep(){
  tourStep++;
  if(tourStep >= TOUR.length) skipTour(); else renderTour();
}
function skipTour(){
  document.getElementById('tour-overlay').classList.add('hidden');
  set(K.TOUR, true);
}

/* ================= 25. INICIALIZAÇÃO ================= */
(function init(){
  const s = get(K.S);
  const u = s ? get(K.U, []).find(x => x.email === s) : null;
  if(u) startApp();   /* sessão persistente — sem login se já autenticado */
})();

/* ============================================================
   FIM DO app.js — PARTES 1 + 2 = ARQUIVO COMPLETO
   ============================================================ */