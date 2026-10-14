
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