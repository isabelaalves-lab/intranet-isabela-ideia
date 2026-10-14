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
  if(podeAprovarComm({ autor: u.email }, u) || u.role === 'gerente' || u.role === 'admin' || (u.perms || {}).admin) tabs.push(['aprovacao','✅ Aprovações']);

  const list = get(K.C, []).filter(c => {
    if(commTab === 'rascunho')
      return can && c.status === 'rascunho' && c.autor === u.email;
  if(commTab === 'aprovacao')
      return c.status === 'pendente' && podeAprovarComm(c);
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
          ? (podeAprovarComm(c)
              ? '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
                '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();aprovarComm(\'' + c.id + '\')">✅ Aprovar e publicar</button>' +
                '<button class="btn btn-ghost btn-sm" style="color:#c0392b" onclick="event.stopPropagation();recusarComm(\'' + c.id + '\')">❌ Recusar</button>' +
                '</div>'
              : '<span class="badge bg-or">⏳ Aguardando aprovação de ' + esc(c.aprovador || '') + '</span>')
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
  const aprov = aprovadorDaComm(alvo);
  if(!aprov){ toast('Nenhum aprovador encontrado no seu setor.', 'err'); return; }
  set(K.C, list.map(c => c.id === id
    ? Object.assign({}, c, {
        status:'pendente',
        aprovador: aprov.email,
        aprovacao: Object.assign({}, c.aprovacao, { status:'pendente', enviadoEm: new Date().toLocaleDateString('pt-BR') })
      })
    : c));
  toast('Enviado para aprovação de ' + aprov.nomeCompleto + '.', 'ok');
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
function aprovadorDaComm(c){
  const autor = get(K.U, []).find(x => x.email === c.autor);
  if(!autor) return null;
  const setor = autor.setor;
  return get(K.U, []).find(x =>
    x.ativo !== false &&
    (x.role === 'gerente' || x.role === 'admin' || (x.perms || {}).admin) &&
    depNorm(x.setor) === depNorm(setor)
  );
}
function podeAprovarComm(c, u){
  u = u || me();
  if(!u || !c) return false;
  if(c.aprovador && c.aprovador !== u.email) return false;
  if(!(u.role === 'gerente' || u.role === 'admin' || (u.perms || {}).admin)) return false;
  const autor = get(K.U, []).find(x => x.email === c.autor);
  if(!autor) return false;
  return depNorm(u.setor) === depNorm(autor.setor);
}
function aprovarComm(id){
  const u = me();
  const list = get(K.C, []);
  const alvo = list.find(c => c.id === id);
  if(!alvo) return;
  if(!podeAprovarComm(alvo, u)){ toast('Somente o aprovador desta comunicação pode aprovar.', 'err'); return; }
  set(K.C, list.map(c => c.id === id
    ? Object.assign({}, c, { status:'publicado', aprovacao: Object.assign({}, c.aprovacao, { status:'aprovado', aprovadoPor: u.email, aprovadoEm: new Date().toLocaleDateString('pt-BR') }) })
    : c));
  toast('Comunicação aprovada e publicada.', 'ok');
  renderPage();
}
function recusarComm(id){
  const u = me();
  const list = get(K.C, []);
  const alvo = list.find(c => c.id === id);
  if(!alvo) return;
  if(!podeAprovarComm(alvo, u)){ toast('Somente o aprovador desta comunicação pode recusar.', 'err'); return; }
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
  const list = get(K.C, []);
  const alvo = list.find(c => c.id === id);
  if(!alvo) return;
  if(!podeAprovarComm(alvo, u)){ toast('Somente o aprovador desta comunicação pode recusar.', 'err'); return; }
  const obs = (document.getElementById('rec-obs') || {}).value || '';
  if(!obs.trim()){ toast('Informe a observação da recusa.', 'err'); return; }
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