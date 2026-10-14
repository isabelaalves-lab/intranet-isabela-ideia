
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
document.getElementById('logo-side').innerHTML  = logoHTML(true, 'assets/logo2.png');
  document.getElementById('logo-top').innerHTML   =logoHTML(true);
    '<div style="transform:scale(.62);transform-origin:left center">' + logoHTML(true) + '</div>';
  document.getElementById('social-side').innerHTML = socHTML;

  /* Rodapé com logo + redes */
  document.getElementById('site-footer').innerHTML =
    logoHTML(true, 'assets/logo2.png') +
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

