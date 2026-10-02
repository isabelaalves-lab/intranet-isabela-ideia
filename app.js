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
function canCreateTrain(){
  const u = me();
  return !!u && RANK[u.role] >= 1; /* analista, coordenador, gerente ou acima */
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
  return '<img src="' + (src || 'logo.png') + '" alt="Italac" class="logo-img">';
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
    calendario:pCalendario
  };
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
  document.getElementById('logo-side').innerHTML  = logoHTML(true);
  document.getElementById('logo-top').innerHTML   =
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
  /* Solicitações de acesso pendentes (admin) */
  if(isAdm(u)) n += get(K.R, []).filter(r => r.status === 'PENDENTE').length;
  /* Vagas aguardando RH (gerente de RH ou admin) */
  if(u.setor === 'RH' && u.role === 'gerente' || isAdm(u))
    n += get(K.J, []).filter(j => j.status === 'PENDENTE_RH').length;
  /* Ocorrências pendentes no setor do gerente */
  if(u.role === 'gerente' && u.setor !== 'RH')
    n += get(K.O, []).filter(o => o.status === 'PENDENTE' && o.setorSolicitante === u.setor).length;
  /* Ocorrências aprovadas pelo gerente aguardando RH */
  if((u.setor === 'RH' && u.role === 'gerente') || isAdm(u))
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
  if(isAdm(u))
    get(K.R, []).filter(r => r.status === 'PENDENTE')
      .forEach(r => items.push('🔔 Solicitação de acesso pendente: <b>' + esc(r.docTitulo) + '</b> — ' + esc(r.nome)));
  if((u.setor === 'RH' && u.role === 'gerente') || isAdm(u)){
    get(K.J, []).filter(j => j.status === 'PENDENTE_RH')
      .forEach(j => items.push('💼 Vaga aguardando aprovação do RH: <b>' + esc(j.titulo) + '</b>'));
    get(K.O, []).filter(o => o.status === 'APROVADA_GERENTE')
      .forEach(o => items.push('⏱️ Ocorrência de ponto aprovada pelo gerente, aguardando RH'));
  }
  if(u.role === 'gerente' && u.setor !== 'RH')
    get(K.O, []).filter(o => o.status === 'PENDENTE' && o.setorSolicitante === u.setor)
      .forEach(o => items.push('⏱️ Ocorrência de ponto pendente no seu setor'));
  if(!items.length) items.push('Nenhuma notificação nova. Tudo em dia! ✅');

  openModal('<h3>🔔 Notificações</h3><ul style="margin:10px 0 0 18px;font-size:.86rem">' +
    items.map(i => '<li style="margin-bottom:8px">' + i + '</li>').join('') + '</ul>');
}

/* ================= 10. BUSCA GLOBAL ================= */
function doSearch(){
  const q = document.getElementById('global-search').value.trim().toLowerCase();
  if(!q) return;
  const routes = [
    ['holerite','rh'],['ponto','rh'],['ocorr','rh'],['vaga','rh'],
    ['documento','documentos'],['política','documentos'],['norma','documentos'],
    ['treinamento','treinamentos'],['bpf','treinamentos'],['nr-12','treinamentos'],
    ['comunic','comunicacao'],['notícia','comunicacao'],['tv','comunicacao'],
    ['vaga','vagas'],['candidat','vagas'],
    ['sustent','sustentabilidade'],['reciclagem','sustentabilidade'],
    ['ideia','ideias'],['inova','ideias'],
    ['sap','ferramentas'],['power bi','ferramentas'],['fluig','ferramentas'],
    ['organo','departamentos'],['fábrica','departamentos'],
    ['história','historia'],['perfil','perfil'],['conta','perfil']
  ];
  const hit = routes.find(r => q.includes(r[0]));
  if(hit){ showPage(hit[1]); toast('Resultado encontrado em "' + hit[1] + '".', 'ok'); }
  else { toast('Nada encontrado para "' + q + '". Tente: holerite, BPF, vaga, ideia...', 'warn'); }
  document.getElementById('global-search').value = '';
}

/* ================= 11. PÁGINA: INÍCIO ================= */
function tenure(u){
  const d = new Date(u.ingresso || '2021-06-01');
  const m = Math.max(0, Math.floor((Date.now() - d) / 2629800000));
  return Math.floor(m/12) + ' anos e ' + (m%12) + ' meses';
}

function pInicio(){
  const u = me();
  const can = isAdm(u) || (u.setor === 'Marketing' && RANK[u.role] >= 1);
  const todas = get(K.C, []).filter(c => c.tab === 'empresa');
  const principal = todas.find(c => c.dest) || null;
  const demais = todas.filter(c => c.id !== (principal ? principal.id : null));
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
          : '<div class="card""><p class="meta" style="margin:0">Nenhuma notícia destacada.</p>' +
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
    (demais.length ?
      '<h2 class="sec" style="margin-top:24px"><span class="train-accent-des"></span> Notícias da Empresa</h2>' +
      '<div class="gridcomunic">' + demais.map(f => cardNoticia(f, 'feat-comunicacao')).join('') + '</div>'
      : '') +
    '<div class="card" style="margin-top:20px"><h3 class="navy-text" style="font-size:1rem">Seu Tempo de Casa</h3>' +
    '<p class="sub-text" style="margin-top:6px">Ingresso em ' +
      new Date(u.ingresso || '2021-06-01').toLocaleDateString('pt-BR', {month:'long', year:'numeric'}) +
      ' • Setor ' + esc(u.setor) + '</p>' +
    '<div class="countup">' + tenure(u) + '</div></div>';
}

/* ================= 12. PÁGINA: COMUNICAÇÃO ================= */
let commTab = 'tv';

function canComm(){
  const u = me();
  return isAdm(u) || (u.setor === 'Marketing' && RANK[u.role] >= 1);
}
function pComunicacao(){
  const u = me(), can = canComm();
  const tabs = [['tv','TV Corporativa'],['mercado','Mercado Lácteo'],['empresa','Notícias da Empresa']];
  const list = get(K.C, []).filter(c => c.tab === commTab)
    .sort((a, b) => (a.dest === b.dest) ? 0 : (a.dest ? -1 : 1)); 
      return '<h2 class="sec"><span class="train-accent-des"></span> Comunicação Corporativa' +
    (can ? ' <button class="btn btn-primary btn-sm" onclick="commForm()">+ Nova Comunicação</button>' : '') + '</h2>' +
    '<div class="tabs">' + tabs.map(t =>
      '<button class="tab' + (commTab === t[0] ? ' active' : '') +
      '" onclick="commTab=\'' + t[0] + '\';renderPage()">' + t[1] + '</button>').join('') + '</div>' +
    '<div class="card" style="margin-bottom:16px"><b class="navy-text">Siga a Italac</b>' +
    '<p class="sub-text" style="margin:4px 0 10px">Acompanhe a marca nas redes oficiais, abrem em nova aba.</p>' +
    '<div class="social-row">' + SOCIAL.map(s =>
      '<a href="' + s.u + '" target="_blank" style="background:var(--navy)" title="' + s.n + '">' +
      '<svg viewBox="0 0 24 24"><path d="' + s.i + '"/></svg></a>').join('') +
'</div></div>' +
      '<div class="gridcomunic">' +
      (list.map(c =>
        '<div class="feat-comunicacao' + (c.dest ? ' destacada' : '') + '">' +
        (c.img ? '<img src="' + esc(c.img) + '" alt="' + esc(c.titulo) + '">' : '') +
        '<div class="feat-body">' +
        (c.dest ? '<span class="badge bg-or">★ Destaque da Home</span> ' : '') +
        '<span class="badge bg-sk">' + esc(c.tipo) + '</span> ' +
        '<span class="meta">' + esc(c.data) + (c.dur ? ' • ' + c.dur : '') + '</span>' +
        '<h4>' + esc(c.titulo) + '</h4><p>' + esc(c.conteudo) + '</p>' +
        ((can && c.autor === u.email) || isAdm(u) ?
          (commTab === 'empresa' ?
            '<button class="btn btn-ghost btn-sm" style="margin-top:8px;color:#e67e22" onclick="destaqueComm(\'' + c.id + '\')">' + (c.dest ? '★ Remover destaque' : '★ Destacar no Inicio') + '</button>' : '') +
          '<button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="commForm(\'' + c.id + '\')">✏️ Editar</button>' +
          '<button class="btn btn-ghost btn-sm" style="margin-top:8px;color:#c0392b" onclick="delComm(\'' + c.id + '\')">🗑 Excluir</button>' : '') +
        '</div></div>').join('') ||
     '<p class="meta">Nenhuma publicação nesta aba.</p>');
}
function commForm(id){
  const c = get(K.C, []).find(x => x.id === id) || {};
  openModal('<h3>' + (id ? 'Editar' : 'Nova') + ' Comunicação</h3>' +
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
    '<button class="btn btn-primary" style="margin-top:14px" onclick="saveComm(\'' + (id || '') + '\')">Publicar</button>');
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
  const o = {
    id: id || uid(), titulo:titulo, tipo:tipo, tab:tab,
    img:img, conteudo:conteudo,
    data:new Date().toLocaleDateString('pt-BR').slice(0,5), autor:u.email
  };
  if(id){ set(K.C, list.map(x => x.id === id ? o : x)); toast('Comunicação atualizada.', 'ok'); }
  else  { list.unshift(o); set(K.C, list); toast('Comunicação publicada!', 'ok'); }
  closeModal(); renderPage();
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
    '<p style="margin-top:12px;font-size:.9rem">' + esc(c.conteudo) + '</p>');
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
    '<button class="btn btn-primary" style="margin-top:14px" onclick="saveDoc()">Salvar</button>');
}

function saveDoc(){
  const u = me();
  const docs = get(K.D, []);
  docs.unshift({ id:uid(), titulo:v('d-t'), departamento:v('d-d'), nivel:v('d-n'),
                 dono:u.email, aprovados:[u.email], tamanho:'PDF • 0,8 MB' });
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
(fer ? '<button class="cal-hol" title="' + esc(fer) + '" onclick="calFeriadoVer(\'' + ds + '\')">' + esc(fer) + '</button>' : '') +      diaEvs.slice(0,3).map(e =>
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

  return '<h2 class="sec">📅 Calendário da Empresa' +
    (can ? ' <button class="btn btn-primary btn-sm" onclick="calForm()">+ Novo Evento</button>' : '') + '</h2>' +
    '<div class="cal-pills">' + pills + '</div>' +
    '<div class="cal-nav">' +
      '<button class="btn btn-ghost btn-sm" onclick="calNav(-1)">← ' + CAL_MESES[(calM + 11) % 12].slice(0,3) + '</button>' +
      '<span class="cal-month">' + CAL_MESES[calM] + ' ' + calY + '</span>' +
      '<button class="btn btn-ghost btn-sm" onclick="calNav(1)">' + CAL_MESES[(calM + 1) % 12].slice(0,3) + ' →</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="calHoje()">Hoje</button>' +
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
  const e = get('italac_calendar', []).find(x => x.id === id); if(!e) return;
  const can = canCal();
const CAL_CORES = {
  'Tecnologia & TI':'#d9edff',
  'Marketing':'#f8d7da',
  'Financeiro':'#d4edda',
  'RH':'#e2d9f3',
  'Comercial':'#fff3cd',
  'Qualidade':'#d1e7dd',
  'Operações':'#e2e8f0'
};
  const ini = calDataLonga(e.inicio);
  const fim = e.fim && e.fim !== e.inicio ? calDataLonga(e.fim) : '';
  const temHora = e.inicio && e.inicio.slice(11,16) !== '00:00';
  const linhas =
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
      '<span style="font-size:1rem">📅</span><span style="font-size:.88rem;color:#1e293b">' +
      esc(ini + (fim ? ' – ' + fim : '')) + (temHora ? ' às ' + esc(e.inicio.slice(11,16)) : '') + '</span></div>' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
      '<span style="font-size:1rem">📍</span><span style="font-size:.88rem;color:#1e293b">' + esc(e.local || '—') + '</span></div>' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
      '<span style="font-size:1rem">👤</span><span style="font-size:.88rem;color:#1e293b">' + esc(calAutorNome(e.autor) || '—') + '</span></div>' +
    (e.desc ? '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f5">' +
      '<span style="font-size:1rem">💬</span><span style="font-size:.88rem;color:#1e293b">' + esc(e.desc) + '</span></div>' : '');
  openModal(
    '<div style="background:' + cor + ';border-radius:10px 10px 0 0;padding:14px 16px;position:relative">' +
      '<span style="display:inline-block;background:rgba(255,255,255,.22);color:#fff;font-size:.62rem;font-weight:800;letter-spacing:.4px;padding:3px 9px;border-radius:99px;text-transform:uppercase">🏷️ ' + esc(e.tipo) + '</span>' +
      '<button onclick="closeModal()" style="position:absolute;top:10px;right:12px;background:transparent;border:none;color:#fff;font-size:1rem;cursor:pointer;font-weight:700" aria-label="Fechar">✕</button>' +
      '<h3 style="color:#fff;margin:10px 0 0;font-size:1.15rem">' + esc(e.nome) + '</h3>' +
    '</div>' +
    '<div style="background:#fff;border-radius:0 0 10px 10px;padding:4px 16px 16px">' + linhas +
      (can ? '<div style="display:flex;gap:8px;padding-top:14px">' +
        '<button class="btn btn-primary btn-sm" onclick="calForm(\'' + e.id + '\')">✏️ Atualizar</button>' +
        '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="calDel(\'' + e.id + '\')">🗑 Excluir</button>' +
      '</div>' : '') +
    '</div>');
}

function calDia(ds){
  const evs = get('italac_calendar', []).filter(e => e.inicio && ds >= e.inicio.slice(0,10) && ds <= (e.fim || e.inicio).slice(0,10));
  openModal('<h3>📅 ' + ds.split('-').reverse().join('/') + '</h3>' +
    (evs.length ? evs.map(e =>
      '<div class="cal-item" style="border-left-color:' + (CAL_CORES[e.tipo] || '#0A66C2') + ';margin-bottom:8px;cursor:pointer" onclick="calVer(\'' + e.id + '\')">' +
        '<div style="flex:1;min-width:180px"><b>' + esc(e.nome) + '</b><div class="meta">' + calHora(e.inicio) + (e.fim && e.fim !== e.inicio ? ' – ' + calHora(e.fim) : '') + ' • ' + esc(e.tipo) + '</div></div>' +
      '</div>').join('') : '<p class="meta">Nenhum evento neste dia.</p>'));
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
    '<div style="background:#fd5000;border-radius:10px;padding:14px 16px;margin-bottom:14px">' +
      '<span style="display:inline-block;background:rgba(255,255,255,.22);color:#fff;font-size:.64rem;font-weight:800;letter-spacing:.4px;padding:3px 9px;border-radius:99px;text-transform:uppercase">' + (ehFacultativo ? 'Ponto facultativo' : 'Feriado nacional') + '</span>' +
      '<h3 style="color:#fff;margin:8px 0 0">🎉 ' + esc(nome.replace('*','')) + '</h3>' +
    '</div>' +
    '<p style="margin:0 0 8px;font-size:.9rem"><b>Data:</b> ' + dataFmt + ' (' + diasSemana[wd] + ')</p>' +
    '<p class="sub-text" style="margin:4px 0"><b>Expediente:</b> ' + (ehFacultativo ? 'Ponto facultativo, verifique a escala da sua área.' : 'Não é dia útil, não há expediente de trabalho.') + '</p>');
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
  const setores = ['Todos'].concat(Array.from(new Set(todos
    .filter(u => u.setor && pertenceFac(u, o, fac))
    .map(u => u.setor))).sort());
  const equipe = todos.filter(u =>
    pertenceFac(u, o, fac) &&
    (depSetor === 'Todos' || u.setor === depSetor));

  function usrCard(u){
    const nome = u.nomeCompleto || u.email || 'Colaborador';
    const pref = u.nomePref || nome.split(' ')[0];
    const cargo = u.cargo || u.role || 'Colaborador';
    return '<div class="usr-card">' +
      (u.foto ?
        '<img class="usr-av" src="' + esc(u.foto) + '" alt="' + esc(pref) + '">' :
        '<div class="usr-av">' + initials(nome) + '</div>') +
      '<div class="usr-info">' +
        '<b>' + esc(nome) + '</b>' +
        (u.nomePref ? '<span class="usr-pref">' + esc(u.nomePref) + '</span>' : '') +
        '<span class="usr-role">' + esc(cargo) + ' • ' + esc(u.setor || 'Sem setor') + '</span>' +
        '<a class="usr-mail" href="mailto:' + esc(u.email || '') + '">' + esc(u.email || '') + '</a>' +
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
  return '<h2 class="sec"><span class="train-accent-des"></span>  Minha Conta</h2>' +
    '<div class="grid2">' +
    '<div class="card">' +
      '<div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">' +
        '<div class="mini-av" style="width:64px;height:64px;font-size:1.2rem;background:var(--navy)">' +
          initials(u.nomeCompleto) + '</div>' +
        '<div><b>' + esc(u.nomeCompleto) + '</b>' +
        '<div class="doc-size">' + esc(u.cargo) + ' • ' + esc(u.setor) + ' • ' + esc(u.unidade) + '</div></div>' +
      '</div>' +
      '<div class="profile-rows">' +
        row('Nome Completo', u.nomeCompleto) + row('Cargo', u.cargo) +
        row('Setor', u.setor) + row('Matrícula', u.matricula) +
        row('E-mail', u.email) + row('Ramal', u.ramal || '—') +
        row('Tempo de Casa', tenure(u)) + row('Fábrica', u.unidade) +
      '</div>' +
      '<div style="margin-top:14px;padding:14px;background:#EEF2F8;border-radius:10px">' +
        '<label style="margin-top:0">Como prefere ser chamado(a)? <span class="doc-size">(único campo editável — aparece na saudação e nos registros)</span></label>' +
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
              u.email + ' • Ramal ' + (u.ramal || '—');
  navigator.clipboard.writeText(sig)
    .then(() => toast('Assinatura copiada!', 'ok'))
    .catch(() => toast('Não foi possível copiar.', 'err'));
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
  h += '<div class="card" style="margin-bottom:16px"><h3 class="navy-text" style="font-size:1rem"><div style="width:40px; height:40px; border-radius:8px; background:#fee2e2; color:var(--brand-red); display:flex; align-items:center; justify-content:center; margin-bottom:12px;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div> Registrar Ocorrência de Ponto</h3>' +
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
    h += '<h2 class="sec">📋 Minhas ocorrências</h2><div class="card">' +
      minhas.map(o =>
        '<div class="access-row"><span><b>' + esc(o.tipo) + '</b> — ' +
        new Date(o.data + 'T12:00').toLocaleDateString('pt-BR') +
        '<br><span class="doc-size">' + esc(o.obs || '') + '</span></span>' + occSt(o.status) + '</div>').join('') + '</div>';
  }

  /* --- Painel do gerente do setor: aprovar/recusar --- */
  if(filaSetor.length){
    h += '<h2 class="sec">⚖️ Ocorrências do meu setor (aprovação 1ª etapa)</h2><div class="card">' +
      filaSetor.map(o =>
        '<div class="access-row"><span><b>' + esc(o.nomeSolicitante || o.email) + '</b> — ' + esc(o.tipo) +
        ' em ' + new Date(o.data + 'T12:00').toLocaleDateString('pt-BR') +
        '<br><span class="doc-size">' + esc(o.obs || '') + '</span></span>' +
        '<span><button class="btn btn-ok btn-sm" onclick="approveOccSetor(\'' + o.id + '\')">Aprovar</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="rejectOcc(\'' + o.id + '\')">Recusar</button></span></div>').join('') + '</div>';
  }

  /* --- Painel do gerente de RH: aprovação final --- */
  if(filaRH.length){
    h += '<h2 class="sec">🏢 Aprovação final — RH</h2><div class="card">' +
      filaRH.map(o =>
        '<div class="access-row"><span><b>' + esc(o.nomeSolicitante || o.email) + '</b> — ' + esc(o.tipo) +
        ' em ' + new Date(o.data + 'T12:00').toLocaleDateString('pt-BR') + ' <span class="badge bg-gr">Aprovada pelo gerente</span></span>' +
        '<span><button class="btn btn-ok btn-sm" onclick="approveOccRH(\'' + o.id + '\')">Aprovar (RH)</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="rejectOcc(\'' + o.id + '\')">Recusar</button></span></div>').join('') + '</div>';
  }

  /* --- Gerenciamento de Vagas: solicitar abertura --- */
  if(cap('vagas')){
    h += '<h2 class="sec"><span class="train-accent-des"></span> Solicitar Abertura de Vaga</h2>' +
      '<div class="card"><div class="grid2" style="grid-template-columns:1fr 1fr">' +
        '<div><label>Título da vaga</label><input id="j-t"></div>' +
        '<div><label>Setor</label><select id="j-s">' + DEPTS.map(d => '<option>' + d + '</option>').join('') + '</select></div>' +
        '<div><label>Descrição</label><input id="j-d"></div>' +
        '<div><label>Requisitos</label><input id="j-r"></div>' +
        '<div><label>Salário (opcional)</label><input id="j-sal" placeholder="R$ —,——"></div>' +
        '<div><label>&nbsp;</label><button class="btn btn-primary btn-block" onclick="requestJob()">Enviar ao RH</button></div>' +
      '</div></div>';
  }

  /* --- Painel do gerente de RH: aprovar vagas --- */
  const jobsPend = (souRH || isAdm(u)) ? get(K.J, []).filter(j => j.status === 'PENDENTE_RH') : [];
  if(jobsPend.length){
    h += '<h2 class="sec">✅ Vagas aguardando aprovação do RH</h2><div class="card">' +
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
function pSust(){
  setTimeout(animCounts, 60);
  return '<h2 class="sec"><span class="train-accent-des"></span>  Sustentabilidade</h2>' +
    '<div class="grid2" style="grid-template-columns:1fr 1fr 1fr">' +
      ['♻️ Reciclagem|98% das embalagens recicláveis',
       '💧 Tratamento de Água|100% do efluente tratado',
       '☀️ Energia Solar|42% da matriz energética']
      .map(s => { const p = s.split('|');
        return '<div class="card" style="text-align:center"><div class="countup" data-to="' +
          parseInt(p[1]) + '">0</div><p style="font-size:.85rem">' + p[0] + '</p><p class="doc-size">' + p[1] + '</p></div>'; }).join('') +
    '</div>' +
    '<div class="grid2" style="margin-top:20px">' +
      '<div class="card"><h3 class="navy-text" style="font-size:.95rem;margin-bottom:10px">Resíduos tratados (toneladas/ano)</h3>' +
        '<div id="sust-bar"></div></div>' +
      '<div class="card"><h3 class="navy-text" style="font-size:.95rem;margin-bottom:10px">Origem da energia</h3>' +
        '<div id="sust-donut"></div></div>' +
    '</div>';
}

function animCounts(){
  document.querySelectorAll('.countup[data-to]').forEach(el => {
    const to = parseInt(el.dataset.to), t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / 900);
      el.textContent = Math.round(to * p) + (to <= 100 ? '%' : '');
      if(p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  /* Gráficos SVG simples */
  const barEl = document.getElementById('sust-bar');
  if(barEl){
    const vals = [['2022',120],['2023',180],['2024',240],['2025',310],['2026',380]];
    const max = 400;
    barEl.innerHTML = '<svg viewBox="0 0 320 160" style="width:100%">' + vals.map((vv,i) => {
      const bh = (vv[1]/max)*120, x = 20 + i*60;
      return '<rect x="' + x + '" y="' + (130-bh) + '" width="40" height="' + bh + '" rx="4" fill="var(--sky)"/>' +
             '<text x="' + (x+20) + '" y="148" text-anchor="middle" font-size="9" fill="var(--muted)">' + vv[0] + '</text>' +
             '<text x="' + (x+20) + '" y="' + (124-bh) + '" text-anchor="middle" font-size="9" fill="var(--navy)">' + vv[1] + '</text>';
    }).join('') + '</svg>';
  }
  const donutEl = document.getElementById('sust-donut');
  if(donutEl){
    const data = [['Solar',42,'#F26522'],['Eólica',18,'#4A9FD8'],['Hidráulica',28,'#1BAF7A'],['Outras',12,'#EDA100']];
    let a0 = -Math.PI/2, paths = '';
    data.forEach(d => {
      const a1 = a0 + (d[1]/100)*Math.PI*2, cx = 80, cy = 80, R = 60, r = 38;
      const large = (a1-a0) > Math.PI ? 1 : 0;
      paths += '<path d="M ' + (cx+R*Math.cos(a0)) + ' ' + (cy+R*Math.sin(a0)) +
        ' A ' + R + ' ' + R + ' 0 ' + large + ' 1 ' + (cx+R*Math.cos(a1)) + ' ' + (cy+R*Math.sin(a1)) +
        ' L ' + (cx+r*Math.cos(a1)) + ' ' + (cy+r*Math.sin(a1)) +
        ' A ' + r + ' ' + r + ' 0 ' + large + ' 0 ' + (cx+r*Math.cos(a0)) + ' ' + (cy+r*Math.sin(a0)) + ' Z" fill="' + d[2] + '"><title>' + d[0] + ': ' + d[1] + '%</title></path>';
      a0 = a1;
    });
    donutEl.innerHTML = '<div style="display:flex;gap:14px;align-items:center">' +
      '<svg viewBox="0 0 160 160" style="width:140px">' + paths +
      '<text x="80" y="85" text-anchor="middle" font-size="16" font-weight="700" fill="var(--navy)">100%</text></svg>' +
      '<div>' + data.map(d =>
        '<div style="font-size:.78rem;margin:3px 0"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + d[2] + ';margin-right:6px"></span>' + d[0] + ' — ' + d[1] + '%</div>').join('') + '</div></div>';
  }
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
  const destaque = FERR_TOOLS[5];
  const resto = FERR_TOOLS.filter(t => t[0] !== destaque[0]);
  let list = ferrCat === 'Todos' ? resto : resto.filter(t => t[3] === ferrCat);
  return '<div class="ferr-head">' +
    '<div class="ferr-title"><span class="train-accent-des"></span> <h2> Programas e Ferramentas</h2></div>' +
    '<span class="ferr-count">' + FERR_TOOLS.length + ' sistemas</span>' +
    '</div>' +
    /* Italac Conecta acima do filtro de categorias */
    '<div class="ferr-feat" style="margin-top:16px">' +
      '<div class="ferr-feat-icon">' + destaque[3] + '</div>' +
      '<div class="ferr-feat-body">' +
        '<div class="ferr-feat-top">' +
          '<h4>' + destaque[0] + ' • ' + destaque[1] + '</h4>' +
          '<span class="ferr-novo">NOVO!</span>' +
        '</div>' +
        '<p>' + destaque[2] + '</p>' +
          '<div class="ferr-feat-actions">' +
          '<button class="btn-orange" onclick="toast(\'Abrindo o Italac Conecta (demo).\',\'ok\')">Abrir Aplicativo</button>' +
          '<button class="btn-manual" onclick="toast(\'Abrindo manual do Italac Conecta...\',\'ok\')">Ver Manual</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="ferr-pills">' + FERR_CATS.map(c =>
      '<button class="ferr-pill' + (ferrCat === c ? ' active' : '') +
      '" onclick="ferrCat=\'' + c + '\';renderPage()">' + c + '</button>').join('') + '</div>' +
    '<div class="ferr-grid">' +
    (list.map(t =>
      '<div class="ferr-card">' +
        '<h4>' + t[0] + '</h4>' +
        '<p>' + t[1] + '</p>' +
        '<span class="ferr-tag">' + t[3] + '</span>' +
        '<div class="ferr-card-actions">' +
          '<button class="btn-navy-block" onclick="toast(\'' + t[0] + ' aberto em nova janela (demo).\',\'ok\')">Abrir</button>' +
          '<button class="btn-manual" onclick="toast(\'Abrindo manual do ' + t[0] + '...\',\'ok\')">Ver Manual</button>' +
        '</div>' +
      '</div>').join('') ||
    '<p class="meta">Nenhuma ferramenta nesta categoria.</p>') +
    '</div>';
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
const PERM_KEYS = [['docs','Gerenciar documentos'],['comms','Publicar comunicações'],['train','Criar treinamentos'],['vagas','Solicitar vagas'],['occ','Aprovar ocorrências'],['admin','Acesso administrativo']];

function pAdmin(){
  const u = me();
  if(!isAdm(u)){
    toast('Acesso restrito ao administrador.', 'err');
    currentPage = 'inicio'; renderPage(); return '';
  }
  const tabs = [['usuarios','👥 Usuários'],['reqs','📥 Solicitações de acesso'],['docs','📚 Todos os documentos'],['perms','🔐 Permissões por setor e cargo']];
  let h = '<h2 class="sec">⚙️ Painel de Administração</h2>' +
    '<div class="tabs">' + tabs.map(t =>
      '<button class="tab' + (adminTab === t[0] ? ' active' : '') +
      '" onclick="adminTab=\'' + t[0] + '\';renderPage()">' + t[1] + '</button>').join('') + '</div>';

  if(adminTab === 'usuarios'){
    h += '<div class="tools-row"><button class="btn btn-primary btn-sm" onclick="userForm()">+ Novo Usuário</button></div>' +
      '<table class="tbl"><thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Setor</th><th>Papel</th><th>Ações</th></tr></thead><tbody>' +
      get(K.U, []).map(x =>
        '<tr><td><b>' + esc(x.nomeCompleto) + '</b><br><span class="doc-size">prefere: ' + esc(x.nomePreferido) + '</span></td>' +
        '<td>' + esc(x.email) + '</td><td>' + esc(x.cargo) + '</td><td>' + esc(x.setor) + '</td>' +
        '<td><span class="badge bg-nv">' + esc(x.role) + '</span></td>' +
        '<td><button class="btn btn-ghost btn-sm" onclick="userForm(\'' + esc(x.email) + '\')">✏️</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="delUser(\'' + esc(x.email) + '\')">🗑️</button></td></tr>').join('') +
      '</tbody></table>';
  }

  if(adminTab === 'reqs'){
    const reqs = get(K.R, []);
    h += '<table class="tbl"><thead><tr><th>Solicitante</th><th>Documento</th><th>Justificativa</th><th>Status</th><th>Ações</th></tr></thead><tbody>' +
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

  if(adminTab === 'docs'){
    h += '<table class="tbl"><thead><tr><th>Documento</th><th>Departamento</th><th>Nível</th><th>Dono</th><th>Aprovados</th></tr></thead><tbody>' +
      get(K.D, []).map(d =>
        '<tr><td><b>' + esc(d.titulo) + '</b></td><td>' + esc(d.departamento) + '</td>' +
        '<td>' + nivelBadge(d.nivel) + '</td><td class="doc-size">' + esc(d.dono) + '</td>' +
        '<td>' + (d.aprovados || []).length + ' pessoa(s)</td></tr>').join('') + '</tbody></table>';
  }

  if(adminTab === 'perms'){
    const perms = get(K.P, {});
    const chaves = Object.keys(perms);
    h += '<p class="sub-text" style="margin-bottom:10px">Configure o que cada combinação de <b>setor + cargo</b> pode fazer. Combinações sem configuração usam o padrão do papel.</p>' +
      '<div class="tools-row"><button class="btn btn-primary btn-sm" onclick="userForm()">+ Cadastrar usuário com permissões</button></div>' +
      (chaves.length ?
        '<table class="tbl"><thead><tr><th>Setor</th><th>Cargo</th><th>Permissões</th><th>Ações</th></tr></thead><tbody>' +
        chaves.map(k => { const [s,c] = k.split('|');
          return '<tr><td>' + esc(s) + '</td><td>' + esc(c) + '</td><td>' +
            PERM_KEYS.filter(pk => perms[k][pk[0]]).map(pk => '<span class="perm-chip">' + pk[1] + '</span>').join(' ') + '</td>' +
            '<td><button class="btn btn-ghost btn-sm" onclick="permForm(\'' + esc(s) + '\',\'' + esc(c) + '\')">✏️ Editar</button> ' +
            '<button class="btn btn-danger btn-sm" onclick="delPerm(\'' + esc(s) + '\',\'' + esc(c) + '\')">🗑️</button></td></tr>'; }).join('') +
        '</tbody></table>'
        : '<p class="meta">Nenhuma configuração personalizada — todas as combinações usam os padrões por cargo.</p>') +
      '<div class="tools-row" style="margin-top:12px"><button class="btn btn-navy btn-sm" onclick="permForm(\'\',\'\')">+ Nova combinação setor + cargo</button></div>';
  }
  return h;
}

function userForm(email){
  const users = get(K.U, []);
  const x = users.find(z => z.email === email) || {};
  const perms = get(K.P, {});
  const cur = perms[x.setor + '|' + x.cargo] || {};
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
      '<div><label>Papel (perfil de acesso)</label><select id="u-role">' +
        ['auxiliar','analista','gerente','admin'].map(r => '<option ' + (x.role === r ? 'selected' : '') + '>' + r + '</option>').join('') + '</select></div>' +
      '<div><label>Unidade</label><select id="u-unid">' +
        ['Goiânia','Anápolis','Belo Horizonte','Campinas'].map(s => '<option ' + (x.unidade === s ? 'selected' : '') + '>' + s + '</option>').join('') + '</select></div>' +
    '</div>' +
    '<label>Matrícula e Ramal</label><div style="display:flex;gap:8px">' +
      '<input id="u-mat" placeholder="Matrícula" value="' + esc(x.matricula || '') + '">' +
      '<input id="u-ram" placeholder="Ramal" value="' + esc(x.ramal || '') + '"></div>' +
    '<div style="margin-top:10px;padding:12px;background:#EEF2F8;border-radius:10px">' +
      '<b style="font-size:.8rem;color:var(--navy)">🔐 Nível de acesso desta combinação (setor + cargo)</b>' +
      '<div style="margin-top:6px">' + PERM_KEYS.map(pk =>
        '<label style="display:inline-flex;align-items:center;gap:6px;margin:4px 12px 4px 0;font-size:.78rem;text-transform:none">' +
        '<input type="checkbox" id="pm-' + pk[0] + '" style="width:auto" ' + (cur[pk[0]] ? 'checked' : '') + '> ' + pk[1] + '</label>').join('') + '</div>' +
      '<p class="doc-size">Se nenhum campo for marcado, o usuário usa o padrão do papel.</p></div>' +
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
    ingresso:(users.find(z => z.email === email) || {}).ingresso || new Date().toISOString().slice(0,10)
  };
  if(email){
    const i = users.findIndex(z => z.email === email);
    users[i] = data;
  } else {
    if(users.some(z => z.email === em)){ toast('E-mail já cadastrado.', 'err'); return; }
    users.push(data);
  }
  set(K.U, users);

  /* Salva/remove permissão personalizada da combinação setor+cargo */
  const perms = get(K.P, {});
  const key = setor + '|' + cargo;
  const chosen = {};
  let any = false;
  PERM_KEYS.forEach(pk => { if(document.getElementById('pm-' + pk[0]).checked){ chosen[pk[0]] = true; any = true; } });
  if(any) perms[key] = chosen; else delete perms[key];
  set(K.P, perms);

  closeModal(); renderPage(); buildNav();
  toast('Usuário ' + (email ? 'atualizado' : 'criado') + ' com sucesso.', 'ok');
}

function delUser(email){
  const u = me();
  if(email === u.email){ toast('Você não pode excluir a própria conta.', 'err'); return; }
  openModal('<h3>Excluir usuário?</h3><p class="sub-text">Tem certeza? Esta ação remove o acesso de ' + esc(email) + '.</p>' +
    '<div style="display:flex;gap:10px;margin-top:14px">' +
    '<button class="btn btn-danger" onclick="delUserOk(\'' + esc(email) + '\')">Sim, excluir</button>' +
    '<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button></div>');
}
function delUserOk(email){
  set(K.U, get(K.U, []).filter(x => x.email !== email));
  closeModal(); renderPage(); toast('Usuário excluído.', 'warn');
}

function permForm(setor, cargo){
  const perms = get(K.P, {});
  const cur = perms[setor + '|' + cargo] || {};
  openModal('<h3>🔐 Permissões — ' + (setor ? esc(setor) + ' • ' + esc(cargo) : 'Nova combinação') + '</h3>' +
    '<div class="grid2" style="grid-template-columns:1fr 1fr">' +
      '<div><label>Setor</label><select id="p-s">' +
        ['Administrativo','TI','RH','Financeiro','Marketing','Produção','Qualidade & BPF','Jurídico & Compliance','Logística & Frota','Diretoria']
        .map(s => '<option ' + (setor === s ? 'selected' : '') + '>' + s + '</option>').join('') + '</select></div>' +
      '<div><label>Cargo</label><select id="p-c">' +
        ['Assistente','Auxiliar Administrativo','Jovem Aprendiz','Analista','Coordenador','Gerente','Diretor','Administrador']
        .map(c => '<option ' + (cargo === c ? 'selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
    '</div>' +
    '<div style="margin-top:10px">' + PERM_KEYS.map(pk =>
      '<label style="display:block;margin:8px 0;font-size:.85rem;text-transform:none">' +
      '<input type="checkbox" id="pm-' + pk[0] + '" style="width:auto" ' + (cur[pk[0]] ? 'checked' : '') + '> ' + pk[1] + '</label>').join('') + '</div>' +
    '<button class="btn btn-primary" style="margin-top:14px" onclick="savePerm(\'' + esc(setor) + '\',\'' + esc(cargo) + '\')">Salvar</button>');
}

function savePerm(oldSetor, oldCargo){
  const perms = get(K.P, {});
  delete perms[oldSetor + '|' + oldCargo];
  const chosen = {};
  let any = false;
  PERM_KEYS.forEach(pk => { if(document.getElementById('pm-' + pk[0]).checked){ chosen[pk[0]] = true; any = true; } });
  if(any) perms[v('p-s') + '|' + v('p-c')] = chosen;
  set(K.P, perms);
  closeModal(); renderPage(); toast('Permissões atualizadas.', 'ok');
}
function delPerm(setor, cargo){
  const perms = get(K.P, {});
  delete perms[setor + '|' + cargo];
  set(K.P, perms);
  renderPage(); toast('Configuração removida — voltou ao padrão do cargo.', 'warn');
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