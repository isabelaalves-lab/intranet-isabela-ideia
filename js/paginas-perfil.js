
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
    '<div class="card-perfil">' +
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
    '<div class="card-perfil"><h3 class="navy-text" style="font-size:1rem;margin-bottom:10px">✍️ Gerador de Assinatura de E-mail</h3>' +
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
    '<div class="train-title"><span class="train-accent-trei"></span> <h2>Academia Italac & Treinamentos</h2></div>' +
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