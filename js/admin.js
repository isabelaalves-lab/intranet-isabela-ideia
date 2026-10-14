/* ============================================================
   ADMIN.JS  |  Painel do Administrador + Intranets por Setor
   Intranet Italac
   Bloco de permissões removido (vive no auth.js). Botão de
   exportar log removido (funções não existiam). Modernizado.
   ============================================================ */

let ADM_ABA = 'prog';

const ADM_ABAS = [
  ['prog', '🖥️ Programas & Ferramentas'],
  ['comunicacao', '📣 Comunicação'],
  ['treinamentos', '🎓 Treinamentos'],
  ['vagas', '💼 Vagas Internas'],
  ['cal', '📅 Calendário'],
  ['user', '👥 Usuários Restritos'],
  ['usuarios', '👥 Todos os Usuários'],
  ['reqs', '📥 Solicitações de acesso'],
  ['docs', '📚 Normas & Documentos'],
  ['intranets', '🛠️ Intranets'],
];

const ADM_CARGOS = ['Assistente', 'Auxiliar Administrativo', 'Jovem Aprendiz', 'Analista', 'Coordenador', 'Gerente', 'Diretor', 'Administrador'];
const ADM_SETORES = ['Administrativo', 'TI', 'RH', 'Financeiro', 'Marketing', 'Produção', 'Qualidade & BPF', 'Jurídico & Compliance', 'Logística & Frota', 'Diretoria'];
const ADM_UNIDADES = ['Goiânia', 'Anápolis', 'Belo Horizonte', 'Campinas'];

const ADM_ROLE_POR_CARGO = {
  'Administrador': 'admin',
  'Diretor': 'gerente',
  'Gerente': 'gerente',
  'Coordenador': 'analista',
  'Analista': 'analista',
  'Assistente': 'auxiliar',
  'Auxiliar Administrativo': 'auxiliar',
  'Jovem Aprendiz': 'auxiliar',
};

function rolePadraoPorCargo(cargo) {
  return ADM_ROLE_POR_CARGO[cargo] || 'auxiliar';
}

function admSel(cond) {
  return cond ? ' selected' : '';
}

function isChecked(id) {
  const el = document.getElementById(id);
  return !!(el && el.checked);
}

function admCardHeader(icone, titulo, contagem, acao, desc) {
  return `
    <div class="card">
      <div class="adm-card-head">
        <h3 class="navy-text adm-card-title">${icone} ${titulo} <span class="doc-size">(${contagem})</span></h3>
        ${acao || ''}
      </div>
      ${desc || ''}`;
}

function pAdmin() {
  const u = me();
  if (!isAdm(u)) {
    toast('Acesso restrito ao administrador.', 'err');
    currentPage = 'inicio';
    renderPage();
    return '';
  }
  setTimeout(admBody, 0);
  return `
    <h2 class="sec"><span class="train-accent-des"></span>Painel do Administrador</h2>
    <p class="sub-text mb12">Gerencie programas, departamentos, documentos, calendário, usuários, permissões e solicitações. Cada item pode ser adicionado, atualizado ou desativado.</p>
    <div class="adm-tabs">
      ${ADM_ABAS.map(a => `<button class="adm-tab${ADM_ABA === a[0] ? ' on' : ''}" onclick="admAba('${a[0]}')">${a[1]}</button>`).join('')}
    </div>
    <div id="adm-body" class="mt16"></div>`;
}

function admAba(aba) {
  ADM_ABA = aba;
  renderPage();
}

function admBody() {
  const el = document.getElementById('adm-body');
  if (!el) return;
  const abas = {
    prog: admProg,
    comunicacao: admComunicacao,
    treinamentos: admTreinamentos,
    vagas: admVagas,
    cal: admCal,
    user: admUser,
    usuarios: admUsuarios,
    reqs: admReqs,
    docs: admDocs,
    intranets: admIntranets,
  };
  const abrir = abas[ADM_ABA];
  if (abrir) abrir(el);
}

/* ---------- Todos os Usuários ---------- */

function admUsuarios(el) {
  const users = get(K.U, []);
  const linhas = users.map(x => `
    <tr>
      <td><b>${esc(x.nomeCompleto)}</b><br><span class="doc-size">prefere: ${esc(x.nomePreferido)}</span></td>
      <td>${esc(x.email)}</td>
      <td>${esc(x.cargo)}</td>
      <td>${esc(x.setor)}</td>
      <td><span class="badge bg-nv">${esc(x.role)}</span></td>
      <td>${x.restrito ? '<span class="adm-badge warn">Restrito</span>' : '<span class="adm-badge on">Ativo</span>'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="userForm('${esc(x.email)}')" title="Editar">✏️</button>
        ${x.restrito
          ? `<button class="btn btn-ghost btn-sm c-ok" onclick="admLiberar('${esc(x.email)}')">Liberar</button>`
          : `<button class="btn btn-ghost btn-sm c-danger" onclick="admRestringir('${esc(x.email)}')">🔒 Restringir</button>`}
      </td>
    </tr>`).join('') || '<tr><td colspan="7" class="doc-size">Nenhum usuário cadastrado.</td></tr>';
  el.innerHTML = `
    <div class="tools-row"><button class="btn btn-primary btn-sm" onclick="userForm()">+ Novo Usuário</button></div>
    <table class="adm-tbl">
      <thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Setor</th><th>Papel</th><th>Acesso</th><th>Ações</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>`;
}

function admRestringir(email) {
  const u = me();
  if (email === u.email) { toast('Você não pode restringir o próprio acesso.', 'err'); return; }
  if (!confirm(`Restringir o acesso de ${esc(email)}?`)) return;
  set(K.U, get(K.U, []).map(x => x.email === email
    ? { ...x, restrito: true, motivoRestricao: x.motivoRestricao || 'desconhecido' }
    : x));
  toast('Acesso restrito. O usuário aparece em "Usuários Restritos".', 'ok');
  renderPage();
}

function admLiberar(email) {
  set(K.U, get(K.U, []).map(x => x.email === email
    ? { ...x, restrito: false, motivoRestricao: '' }
    : x));
  toast('Acesso liberado.', 'ok');
  renderPage();
}

function userForm(email) {
  const users = get(K.U, []);
  const x = users.find(z => z.email === email) || {};
  const p = x.perms || {};
  const editando = !!email;
  openModal(`
    <h3>${editando ? 'Editar' : 'Novo'} Usuário</h3>
    <label>Nome completo</label><input id="u-nc" value="${esc(x.nomeCompleto || '')}">
    <label>Como prefere ser chamado(a)</label><input id="u-np" value="${esc(x.nomePreferido || '')}">
    <label>E-mail (@italac.com.br)</label><input id="u-em" value="${esc(x.email || '')}" ${editando ? 'readonly' : ''}>
    <label>Senha</label><input id="u-senha" value="${esc(x.senha || '123456')}">
    <div class="g2">
      <div><label>Cargo</label><select id="u-cargo">${ADM_CARGOS.map(c => `<option${admSel(x.cargo === c)}>${c}</option>`).join('')}</select></div>
      <div><label>Setor</label><select id="u-setor">${ADM_SETORES.map(s => `<option${admSel(x.setor === s)}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="g2">
      <div><label>Unidade</label><select id="u-unid">${ADM_UNIDADES.map(u => `<option${admSel(x.unidade === u)}>${u}</option>`).join('')}</select></div>
    </div>
    <label>Matrícula e Ramal</label>
    <div class="flex-row">
      <input id="u-mat" placeholder="Matrícula" value="${esc(x.matricula || '')}">
      <input id="u-ram" placeholder="Ramal" value="${esc(x.ramal || '')}">
    </div>
    <div class="caixa-permissoes">
      <b class="perm-titulo">🔐 Liberação de acesso deste usuário</b>
      <p class="doc-size m4-8">Marque apenas os acessos que este usuário pode fazer. Sem marcação, ele usa o padrão do papel. "Acesso administrativo" libera tudo.</p>
      <div class="perm-user-grid">
        ${permUserChk('pu-documentos', 'Gerenciar documentos', p.documentos)}
        ${permUserChk('pu-comunicacao', 'Publicar comunicações (criar)', p.comunicacao)}
        ${permUserChk('pu-comunicacao-propria', 'Editar as próprias comunicações', p.comunicacaoPropria)}
        ${permUserChk('pu-comunicacao-todas', 'Editar todas as comunicações', p.comunicacaoTodas)}
        ${permUserChk('pu-treinamentos', 'Criar treinamentos', p.treinamentos)}
        ${permUserChk('pu-vagas', 'Solicitar vagas', p.vagas)}
        ${permUserChk('pu-ocorrencias', 'Aprovar ocorrências', p.ocorrencias)}
        ${permUserChk('pu-admin', 'Acesso administrativo', p.admin)}
      </div>
      <h4 class="perm-intra-titulo">🌐 Intranets que este usuário pode acessar</h4>
      <p class="doc-size mb8">Marque as intranets liberadas. O papel Administrador e o campo "Acesso administrativo" acessam todas automaticamente.</p>
      <div class="perm-user-grid">
        ${intraList().map(m => permUserChk(`pi-${m.key}`, m.n, (x.intranets || []).includes(m.key))).join('')}
      </div>
    </div>
    <button class="btn btn-primary mt14" onclick="saveUser('${esc(email || '')}')">Salvar</button>`);
}

function saveUser(email) {
  const users = get(K.U, []);
  const nc = v('u-nc');
  const em = v('u-em').trim().toLowerCase();
  const cargo = v('u-cargo');
  const setor = v('u-setor');
  const atual = users.find(z => z.email === email) || {};

  if (!em) { toast('Informe o e-mail.', 'err'); return; }
  if (!nc.trim()) { toast('Informe o nome completo.', 'err'); return; }

  const data = {
    email: em,
    senha: v('u-senha'),
    nomeCompleto: nc,
    nomePreferido: v('u-np') || nc.split(' ')[0],
    cargo,
    setor,
    role: atual.role || rolePadraoPorCargo(cargo),
    unidade: v('u-unid'),
    matricula: v('u-mat'),
    ramal: v('u-ram'),
    ingresso: atual.ingresso || new Date().toISOString().slice(0, 10),
    perms: {
      documentos: isChecked('pu-documentos'),
      comunicacao: isChecked('pu-comunicacao'),
      comunicacaoPropria: isChecked('pu-comunicacao-propria'),
      comunicacaoTodas: isChecked('pu-comunicacao-todas'),
      treinamentos: isChecked('pu-treinamentos'),
      vagas: isChecked('pu-vagas'),
      ocorrencias: isChecked('pu-ocorrencias'),
      admin: isChecked('pu-admin'),
    },
    intranets: intraList().map(m => m.key).filter(k => isChecked(`pi-${k}`)),
  };

  if (email) {
    const i = users.findIndex(z => z.email === email);
    if (i === -1) return;
    users[i] = { ...users[i], ...data };
  } else {
    if (users.some(z => z.email === em)) { toast('E-mail já cadastrado.', 'err'); return; }
    users.push(data);
  }
  set(K.U, users);
  closeModal();
  renderPage();
  buildNav();
  toast(`Usuário ${email ? 'atualizado' : 'criado'} com sucesso.`, 'ok');
}

/* ---------- Solicitações ---------- */

function reqStatusBadge(status) {
  if (status === 'PENDENTE') return '<span class="st-pendente">Pendente</span>';
  if (status === 'APROVADA') return '<span class="st-rh">Aprovada</span>';
  return '<span class="st-recusado">Negada</span>';
}

function admReqs(el) {
  const reqs = get(K.R, []);
  const linhas = reqs.map(r => `
    <tr>
      <td>${esc(r.nome)}<br><span class="doc-size">${esc(r.email)}</span></td>
      <td>${esc(r.docTitulo)}</td>
      <td>${esc(r.just || '—')}</td>
      <td>${reqStatusBadge(r.status)}</td>
      <td>${r.status === 'PENDENTE'
        ? `<button class="btn btn-ok btn-sm" onclick="grantReq('${r.id}')">Aprovar</button>
           <button class="btn btn-danger btn-sm" onclick="denyReq('${r.id}')">Negar</button>`
        : ''}</td>
    </tr>`).join('') || '<tr><td colspan="5" class="doc-size">Nenhuma solicitação registrada.</td></tr>';
  el.innerHTML = `
    <table class="adm-tbl">
      <thead><tr><th>Solicitante</th><th>Documento</th><th>Justificativa</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>`;
}

/* ---------- Normas & Documentos ---------- */

function admDocs(el) {
  const docs = get(K.D, []);
  const linhas = docs.map(d => `
    <tr>
      <td><b>${esc(d.titulo)}</b>${d.caminho ? `<div class="doc-size">📂 ${esc(d.caminho)}</div>` : ''}</td>
      <td>${esc(d.departamento)}</td>
      <td>${nivelBadge(d.nivel)}</td>
      <td class="doc-size">${esc(d.dono)}</td>
      <td>${(d.aprovados || []).length} pessoa(s)</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="manageDoc('${d.id}')" title="Gerenciar">⚙️</button>
        <button class="btn-manual" onclick="abrirDocArquivo('${d.id}')" title="Abrir arquivo">📂 Arquivo</button>
        <button class="btn btn-danger btn-sm" onclick="delDoc('${d.id}')" title="Excluir">🗑️</button>
      </td>
    </tr>`).join('');
  el.innerHTML = admCardHeader('📚', 'Normas & Documentos', docs.length, `<button class="btn btn-primary btn-sm" onclick="docForm()">+ Novo documento</button>`,
    '<p class="doc-size mb10">Gerencie os documentos como na página de Normas & Documentos: renomear, nível de acesso, conceder/remover acesso e excluir.</p>') +
    (docs.length
      ? `<table class="adm-tbl"><thead><tr><th>Documento</th><th>Departamento</th><th>Nível</th><th>Dono</th><th>Aprovados</th><th class="w180">Ações</th></tr></thead><tbody>${linhas}</tbody></table>`
      : '<p class="meta">Nenhum documento cadastrado. Use "+ Novo documento".</p>') +
    '</div>';
}

function abrirDocArquivo(id) {
  const d = get(K.D, []).find(x => x.id === id);
  if (!d || !d.caminho) { toast('Este documento não tem arquivo vinculado.', 'err'); return; }
  const c = d.caminho.trim();
  if (/^https?:\/\//i.test(c)) { window.open(c, '_blank'); return; }
  const u = 'file:///' + c.split('\\').join('/');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(c).catch(() => {});
  }
  toast(`Caminho copiado: ${c}`, 'ok');
  try { window.open(u, '_blank'); } catch (e) { /* janela bloqueada */ }
}

/* ---------- Programas & Ferramentas ---------- */

function admProg(el) {
  const lista = get('italac_programas', []);
  const linhas = lista.map(p => `
    <tr>
      <td><b>${esc(p.nome)}</b><div class="doc-size">${esc(p.desc || '')}</div></td>
      <td>${esc(p.categoria || '—')}</td>
      <td>${p.manualData
        ? `<a href="javascript:void(0)" onclick="manualAcao('${p.id}')" class="c-sky fw600">📎 ${esc(p.manualNome || 'Manual')}</a>`
        : '<span class="doc-size">—</span>'}</td>
      <td><button class="btn btn-ghost btn-sm star ${p.destaque ? 'star-amber' : 'off'}" onclick="admProgDestaque('${p.id}')" title="${p.destaque ? 'Remover destaque' : 'Marcar como destaque'}">${p.destaque ? '⭐' : '☆'}</button></td>
      <td>${p.ativo === false ? '<span class="adm-badge off">Desativado</span>' : '<span class="adm-badge on">Ativo</span>'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="admProgForm('${p.id}')" title="Editar">✏️</button>
        <button class="btn btn-ghost btn-sm c-danger" onclick="admProgDel('${p.id}')" title="Excluir">🗑️</button>
      </td>
    </tr>`).join('');
  el.innerHTML = admCardHeader('🖥️', 'Programas & Ferramentas', lista.length, `<button class="btn btn-primary btn-sm" onclick="admProgForm()">+ Novo programa</button>`) +
    (lista.length
      ? `<table class="adm-tbl"><thead><tr><th>Nome</th><th>Categoria</th><th>Manual</th><th>Destaque</th><th>Status</th><th class="w220">Ações</th></tr></thead><tbody>${linhas}</tbody></table>`
      : '<p class="meta">Nenhum programa cadastrado ainda.</p>') +
    '</div>';
}

function admProgDel(id) {
  const p = get('italac_programas', []).find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Excluir o programa "${p.nome}" e o manual anexado definitivamente?`)) return;
  set('italac_programas', get('italac_programas', []).filter(x => x.id !== id));
  toast(`Programa "${p.nome}" excluído.`, 'ok');
  renderPage();
}

function admProgDestaque(id) {
  const lista = get('italac_programas', []);
  const alvo = lista.find(x => x.id === id);
  if (!alvo) return;
  const novo = !alvo.destaque;
  set('italac_programas', lista.map(x => Object.assign({}, x, { destaque: x.id === id ? novo : false })));
  toast(novo ? 'Programa marcado como destaque.' : 'Destaque removido.', 'ok');
  renderPage();
}

function admProgForm(id) {
  const p = get('italac_programas', []).find(x => x.id === id) || {};
  const anexo = p.manualData
    ? `<div class="anexo-atual" id="ap-anexo-atual">
         <span>📎 ${esc(p.manualNome || 'Manual anexado')} <span class="doc-size">(${Math.round((p.manualData.length * 0.75) / 1024)} KB)</span></span>
         <button type="button" class="anexo-remover" onclick="document.getElementById('ap-remover-anexo').value='1';this.parentElement.remove();document.getElementById('ap-arq').disabled=false">✕ Remover</button>
       </div><input type="hidden" id="ap-remover-anexo" value="">`
    : '';
  openModal(`
    <h3>${id ? '✏️ Atualizar Programa' : '➕ Novo Programa'}</h3>
    <label>Nome do programa/ferramenta</label><input id="ap-nome" value="${esc(p.nome || '')}" placeholder="Ex.: Portal do RH">
    <label>Categoria</label><input id="ap-cat" value="${esc(p.categoria || '')}" placeholder="Ex.: Recursos Humanos">
    <label>Descrição</label><textarea id="ap-desc" rows="2" placeholder="O que faz?">${esc(p.desc || '')}</textarea>
    <label>Link do aplicativo (opcional)</label><input id="ap-url" value="${esc(p.url || '')}" placeholder="https://...">
    <hr class="divider">
    <h4 class="form-sec-titulo">📘 Manual do programa</h4>
    ${anexo}
    <label>${p.manualData ? 'Substituir arquivo (opcional)' : 'Arquivo do manual (PDF, Word, TXT, imagem)'}</label>
    <input type="file" id="ap-arq" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg"${p.manualData ? ' disabled' : ''}>
    <p class="doc-size mt4">Máximo de 2 MB por arquivo. Formatos maiores que isso não cabem no armazenamento da intranet.</p>
    <div class="prog-check-row">
      <input type="checkbox" id="ap-destaque"${p.destaque ? ' checked' : ''}>
      <span>Marcar como destaque</span>
    </div>
    <button class="btn btn-primary mt14" onclick="admProgSave('${id || ''}')">${id ? 'Salvar alterações' : 'Adicionar'}</button>`);
}

function admProgSave(id) {
  const nome = v('ap-nome').trim();
  if (!nome) { toast('Informe o nome.', 'err'); return; }
  const destaque = isChecked('ap-destaque');
  const lista = get('italac_programas', []);
  const atual = id ? (lista.find(x => x.id === id) || {}) : {};
  const remover = ((document.getElementById('ap-remover-anexo') || {}).value) === '1';
  const arqInp = document.getElementById('ap-arq');
  const arq = arqInp && arqInp.files && arqInp.files[0];
  const base = {
    id: id || uid(),
    nome,
    categoria: v('ap-cat').trim(),
    desc: v('ap-desc').trim(),
    url: v('ap-url').trim(),
    ativo: true,
    destaque,
  };
  if (remover) {
    base.manualData = null;
    base.manualNome = '';
    base.manualTipo = '';
  } else if (!arq) {
    base.manualData = atual.manualData;
    base.manualNome = atual.manualNome;
    base.manualTipo = atual.manualTipo;
  }
  const conclui = () => {
    if (id) {
      set('italac_programas', lista.map(x => x.id === id ? { ...x, ...base } : x));
      toast('Programa atualizado.', 'ok');
    } else {
      lista.push(base);
      set('italac_programas', lista);
      toast('Programa adicionado.', 'ok');
    }
    closeModal();
    renderPage();
  };
  if (arq) {
    if (arq.size > 2 * 1024 * 1024) { toast('Arquivo acima de 2 MB. Escolha um menor.', 'err'); return; }
    const rd = new FileReader();
    rd.onload = () => {
      base.manualData = rd.result;
      base.manualNome = arq.name;
      base.manualTipo = arq.type || 'application/octet-stream';
      conclui();
    };
    rd.onerror = () => toast('Não foi possível ler o arquivo.', 'err');
    rd.readAsDataURL(arq);
  } else {
    conclui();
  }
}

/* ---------- Calendário ---------- */

function admCal(el) {
  const lista = get('italac_calendar', []);
  const linhas = lista.map(e => `
    <tr>
      <td><b>${esc(e.nome)}</b></td>
      <td>${esc((e.inicio || '').slice(0, 10))}${e.fim && e.fim !== e.inicio ? ` → ${esc(e.fim.slice(0, 10))}` : ''}</td>
      <td>${esc(e.tipo || '—')}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="calForm('${e.id}')" title="Editar">✏️</button>
        <button class="btn btn-ghost btn-sm c-danger" onclick="calDel('${e.id}')" title="Excluir">🗑️</button>
      </td>
    </tr>`).join('');
  el.innerHTML = admCardHeader('📅', 'Calendário', `${lista.length} eventos`, `<button class="btn btn-primary btn-sm" onclick="calForm()">+ Novo evento</button>`) +
    (lista.length
      ? `<table class="adm-tbl"><thead><tr><th>Evento</th><th>Data</th><th>Tipo</th><th class="w150">Ações</th></tr></thead><tbody>${linhas}</tbody></table>`
      : '<p class="meta">Nenhum evento no calendário.</p>') +
    '</div>';
}

/* ---------- Usuários Restritos ---------- */

function motivoRestricao(u) {
  if (u.motivoRestricao === 'desativado') return 'Desativado na empresa';
  return u.motivoRestricao || 'Desconhecido';
}

function admUser(el) {
  const users = get(K.U, []).filter(u => u.restrito);
  const linhas = users.map(u => `
    <tr>
      <td><b>${esc(u.nomeCompleto || u.email)}</b></td>
      <td>${esc(u.email)}</td>
      <td><span class="adm-badge warn">${esc(motivoRestricao(u))}</span></td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="admUserForm('${esc(u.email)}')" title="Editar motivo">✏️</button>
        <button class="btn btn-ghost btn-sm c-ok" onclick="admUserToggle('${esc(u.email)}')">Liberar</button>
      </td>
    </tr>`).join('');
  el.innerHTML = admCardHeader('👥', 'Usuários Restritos', users.length, '',
    '<p class="doc-size mb10">Aqui aparecem apenas os usuários restringidos. Para restringir, edite o usuário na aba "Todos os Usuários" e escolha o motivo. Para liberar, use o botão aqui.</p>') +
    (users.length
      ? `<table class="adm-tbl"><thead><tr><th>Nome</th><th>E-mail</th><th>Motivo da restrição</th><th class="w150">Ações</th></tr></thead><tbody>${linhas}</tbody></table>`
      : '<p class="meta">Nenhum usuário restrito no momento. Restrinja um usuário na aba "Todos os Usuários" para ele aparecer aqui.</p>') +
    '</div>';
}

function admUserForm(email) {
  const users = get(K.U, []);
  const u = users.find(x => x.email === email) || {};
  const ehNovo = !email;
  openModal(`
    <h3>${ehNovo ? '➕ Novo Usuário' : '✏️ Atualizar Usuário'}</h3>
    ${ehNovo ? '<label>Nome completo</label><input id="au-nome" placeholder="Ex.: Maria Silva">' : ''}
    <label>E-mail</label><input id="au-email" value="${esc(u.email || '')}" ${ehNovo ? '' : 'disabled'}>
    <label>Cargo</label><input id="au-cargo" value="${esc(u.cargo || '')}" placeholder="Ex.: Analista">
    <label>Setor</label><input id="au-setor" value="${esc(u.setor || '')}" placeholder="Ex.: Financeiro">
    <label>Acesso</label><select id="au-acesso" onchange="document.getElementById('au-motivo-wrap').classList.toggle('hidden', this.value !== 'restrito')">
      <option value="ativo"${!u.restrito ? ' selected' : ''}>Ativo (acesso completo)</option>
      <option value="restrito"${u.restrito ? ' selected' : ''}>Restrito (acesso limitado)</option>
    </select>
    <div id="au-motivo-wrap" class="${u.restrito ? '' : 'hidden'}">
      <label>Motivo da restrição</label><select id="au-motivo">
        <option value="desativado"${u.motivoRestricao === 'desativado' ? ' selected' : ''}>Desativado na empresa</option>
        <option value="desconhecido"${u.motivoRestricao === 'desconhecido' || !u.motivoRestricao ? ' selected' : ''}>Desconhecido</option>
      </select>
    </div>
    <button class="btn btn-primary mt14" onclick="admUserSave('${email || ''}')">${ehNovo ? 'Adicionar' : 'Salvar alterações'}</button>`);
}

function admUserSave(email) {
  const users = get(K.U, []);
  const ehNovo = !email;
  const mail = ehNovo ? v('au-email').trim() : email;
  if (!mail) { toast('Informe o e-mail.', 'err'); return; }
  if (ehNovo && users.some(x => x.email === mail)) { toast('Já existe um usuário com esse e-mail.', 'err'); return; }
  const restrito = v('au-acesso') === 'restrito';
  const o = {
    email: mail,
    nomeCompleto: ehNovo ? (v('au-nome').trim() || mail) : (users.find(x => x.email === email) || {}).nomeCompleto,
    cargo: v('au-cargo').trim(),
    setor: v('au-setor').trim(),
    restrito,
    motivoRestricao: restrito ? v('au-motivo') : '',
  };
  if (ehNovo) {
    users.push(o);
    set(K.U, users);
    toast('Usuário adicionado.', 'ok');
  } else {
    set(K.U, users.map(x => x.email === email ? { ...x, ...o } : x));
    toast('Usuário atualizado.', 'ok');
  }
  closeModal();
  renderPage();
}

function admUserToggle(email) {
  set(K.U, get(K.U, []).map(x => x.email === email
    ? { ...x, restrito: !x.restrito, motivoRestricao: !x.restrito ? (x.motivoRestricao || 'desconhecido') : '' }
    : x));
  toast('Acesso atualizado.', 'ok');
  renderPage();
}

/* ---------- Comunicação ---------- */

function admComunicacao(el) {
  const list = get(K.C, []);
  const tabLbl = { tv: 'TV Corporativa', mercado: 'Mercado Lácteo', empresa: 'Notícias da Empresa' };
  const linhas = list.map(c => `
    <tr>
      <td><b>${esc(c.titulo)}</b>${c.autor ? `<div class="doc-size">por ${esc(c.autor)}</div>` : ''}</td>
      <td>${esc(tabLbl[c.tab] || c.tab)}</td>
      <td><span class="adm-badge sk">${esc(c.tipo)}</span></td>
      <td>${esc(c.data)}</td>
      <td><button class="btn btn-ghost btn-sm star ${c.dest ? 'on' : 'off'}" onclick="destaqueComm('${c.id}')" title="${c.dest ? 'Remover destaque' : 'Destacar na Home'}">${c.dest ? '★' : '☆'}</button></td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="commForm('${c.id}')" title="Editar">✏️</button>
        <button class="btn btn-ghost btn-sm c-danger" onclick="delComm('${c.id}')" title="Excluir">🗑️</button>
      </td>
    </tr>`).join('');
  el.innerHTML = admCardHeader('📣', 'Comunicação Corporativa', list.length, `<button class="btn btn-primary btn-sm" onclick="commForm()">+ Nova Comunicação</button>`,
    '<p class="doc-size mb10">Gerencie as publicações de todas as abas: editar, excluir e definir o destaque da Home. Mesmas funções da página de Comunicação.</p>') +
    (list.length
      ? `<table class="adm-tbl"><thead><tr><th>Título</th><th>Aba</th><th>Tipo</th><th>Data</th><th>Destaque</th><th class="w200">Ações</th></tr></thead><tbody>${linhas}</tbody></table>`
      : '<p class="meta">Nenhuma comunicação cadastrada. Use "+ Nova Comunicação".</p>') +
    '</div>';
}

/* ---------- Treinamentos ---------- */

function admTreinamentos(el) {
  const list = get(K.T, []);
  const tipoLbl = { 'PDF': '📘 PDF', 'Vídeo': '🎬 Vídeo', 'Impresso': '📄 Impresso' };
  const linhas = list.map(t => `
    <tr>
      <td><b>${esc(t.titulo)}</b>
        ${t.ext ? `<div class="doc-size">📎 ${esc(t.ext)}</div>` : t.url ? `<div class="doc-size">🔗 ${esc(trainHost(t.url))}</div>` : ''}
      </td>
      <td><span class="adm-badge sk">${esc(tipoLbl[t.tipo] || t.tipo)}</span></td>
      <td>${esc(t.unidade || 'Goiânia')}</td>
      <td>${esc(t.data || '—')}</td>
      <td class="doc-size">${esc(t.autor || '—')}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="openTrain('${t.id}')" title="Abrir">▶️</button>
        <button class="btn btn-ghost btn-sm" onclick="trainForm('${t.id}')" title="Editar">✏️</button>
        <button class="btn btn-ghost btn-sm c-danger" onclick="delTrain('${t.id}')" title="Excluir">🗑️</button>
      </td>
    </tr>`).join('');
  el.innerHTML = admCardHeader('🎓', 'Treinamentos', list.length, `<button class="btn btn-primary btn-sm" onclick="trainForm()">+ Novo Treinamento</button>`,
    '<p class="doc-size mb10">Gerencie os treinamentos da Academia Italac: criar, editar, excluir e anexar arquivo ou link. Mesmas funções da página de Treinamentos.</p>') +
    (list.length
      ? `<table class="adm-tbl"><thead><tr><th>Título</th><th>Formato</th><th>Unidade</th><th>Data</th><th>Autor</th><th class="w180">Ações</th></tr></thead><tbody>${linhas}</tbody></table>`
      : '<p class="meta">Nenhum treinamento cadastrado. Use "+ Novo Treinamento".</p>') +
    '</div>';
}

/* ---------- Vagas Internas ---------- */

function admVagas(el) {
  const list = get(K.J, []);
  const statusLbl = { 'PENDENTE_RH': '⏳ Pendente RH', 'APROVADA': '✅ Aberta', 'FECHADA': '🔒 Fechada' };
  const linhas = list.map(j => `
    <tr>
      <td><b>${esc(j.titulo)}</b><div class="doc-size">${esc(j.desc || '')}</div></td>
      <td>${esc(j.setor)}</td>
      <td>${esc(j.unidade || '—')}</td>
      <td class="doc-size">${j.inicio ? esc(j.inicio) : '—'}${j.fim ? ` → ${esc(j.fim)}` : ''}</td>
      <td><span class="adm-badge ${j.status === 'APROVADA' ? 'on' : j.status === 'FECHADA' ? 'off' : 'warn'}">${esc(statusLbl[j.status] || j.status)}</span></td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="admVagaForm('${j.id}')" title="Editar">✏️</button>
        ${j.status === 'APROVADA'
          ? `<button class="btn btn-ghost btn-sm c-danger" onclick="admVagaStatus('${j.id}','FECHADA')">🔒 Fechar</button>`
          : `<button class="btn btn-ghost btn-sm c-ok" onclick="admVagaStatus('${j.id}','APROVADA')">✅ Abrir</button>`}
        <button class="btn btn-ghost btn-sm c-danger" onclick="admVagaDel('${j.id}')" title="Excluir">🗑️</button>
      </td>
    </tr>`).join('');
  el.innerHTML = admCardHeader('💼', 'Vagas Internas', list.length, `<button class="btn btn-primary btn-sm" onclick="admVagaForm()">+ Nova vaga</button>`,
    '<p class="doc-size mb10">Gerencie as vagas: cadastrar, editar, excluir, abrir e fechar o processo seletivo.</p>') +
    (list.length
      ? `<table class="adm-tbl"><thead><tr><th>Vaga</th><th>Setor</th><th>Unidade</th><th>Período</th><th>Status</th><th class="w220">Ações</th></tr></thead><tbody>${linhas}</tbody></table>`
      : '<p class="meta">Nenhuma vaga cadastrada.</p>') +
    '</div>';
}

function admVagaForm(id) {
  const j = get(K.J, []).find(x => x.id === id) || {};
  openModal(`
    <h3>${id ? '✏️ Atualizar Vaga' : '➕ Nova Vaga'}</h3>
    <label>Título da vaga</label><input id="av-t" value="${esc(j.titulo || '')}">
    <label>Setor</label><select id="av-s">${DEPTS.map(d => `<option${admSel(j.setor === d)}>${d}</option>`).join('')}</select>
    <label>Unidade</label><input id="av-u" value="${esc(j.unidade || '')}" placeholder="Ex.: Goiânia">
    <label>Descrição</label><textarea id="av-d" rows="2">${esc(j.desc || '')}</textarea>
    <label>Requisitos</label><textarea id="av-r" rows="2">${esc(j.req || '')}</textarea>
    <label>Salário (opcional)</label><input id="av-sal" value="${esc(j.salario || '')}" placeholder="R$ —,——">
    <div class="g2">
      <div><label>Data de início do processo</label><input type="date" id="av-inicio" value="${esc(j.inicio || '')}"></div>
      <div><label>Data de fim do processo</label><input type="date" id="av-fim" value="${esc(j.fim || '')}"></div>
    </div>
    <button class="btn btn-primary mt14" onclick="admVagaSave('${id || ''}')">${id ? 'Salvar alterações' : 'Adicionar'}</button>`);
}

function admVagaSave(id) {
  const titulo = v('av-t').trim();
  if (!titulo) { toast('Informe o título.', 'err'); return; }
  const lista = get(K.J, []);
  const o = {
    id: id || uid(),
    titulo,
    setor: v('av-s'),
    unidade: v('av-u').trim(),
    desc: v('av-d').trim(),
    req: v('av-r').trim(),
    salario: v('av-sal').trim(),
    inicio: v('av-inicio'),
    fim: v('av-fim'),
    status: id ? ((lista.find(x => x.id === id) || {}).status || 'APROVADA') : 'APROVADA',
  };
  if (id) { set(K.J, lista.map(x => x.id === id ? o : x)); toast('Vaga atualizada.', 'ok'); }
  else { lista.push(o); set(K.J, lista); toast('Vaga adicionada.', 'ok'); }
  closeModal();
  renderPage();
}

function admVagaStatus(id, status) {
  set(K.J, get(K.J, []).map(x => x.id === id ? { ...x, status } : x));
  toast(status === 'APROVADA' ? 'Vaga aberta.' : 'Vaga fechada.', 'ok');
  renderPage();
}

function admVagaDel(id) {
  const j = get(K.J, []).find(x => x.id === id);
  if (!j) return;
  if (!confirm(`Excluir a vaga "${j.titulo}" definitivamente?`)) return;
  set(K.J, get(K.J, []).filter(x => x.id !== id));
  toast('Vaga excluída.', 'ok');
  renderPage();
}

/* ================= INTRANETS POR SETOR ================= */

const INTRANET_DEPTS = {
  rh:             ['rh', 'recursoshumanos'],
  financeiro:     ['financeiro'],
  marketing:      ['marketing'],
  ti:             ['ti', 'tecnologia'],
  administrativo: ['administrativo'],
  diretoria:      ['diretoria'],
  producao:       ['producao'],
  qualidade:      ['qualidade', 'qualidade & bpf'],
  juridico:       ['juridico', 'compliance', 'juridico & compliance'],
  logistica:      ['logistica', 'frota', 'logistica & frota'],
};

const INTRANET_META = {
  rh:             { n: 'Intranet RH',                 ic: '👥',  desc: 'Central da área de Recursos Humanos: portais, benefícios, ponto e ocorrências.' },
  financeiro:     { n: 'Intranet Financeiro',         ic: '💰',  desc: 'Central da área Financeira: SAP FI/CO, fluxo de caixa, notas fiscais e orçamento.' },
  marketing:      { n: 'Intranet Marketing',          ic: '📣',  desc: 'Central da área de Marketing: campanhas, identidade visual, mídia e redes sociais.' },
  ti:             { n: 'Intranet TI',                 ic: '🖥️',  desc: 'Central de Tecnologia: chamados, manuais de sistemas, acessos e segurança da informação.' },
  administrativo: { n: 'Intranet Administrativo',     ic: '🗂️',  desc: 'Central do Administrativo: documentos internos, expediente, compras e protocolo.' },
  diretoria:      { n: 'Intranet Diretoria',          ic: '🏛️',  desc: 'Central da Diretoria: metas, reuniões, indicadores e comunicados executivos.' },
  producao:       { n: 'Intranet Produção',           ic: '🏭',  desc: 'Central da Produção: ordens de fabricação, BPF, manutenção e segurança do trabalho.' },
  qualidade:      { n: 'Intranet Qualidade & BPF',    ic: '✅',  desc: 'Central da Qualidade: padrões, análises, auditorias e documentação de BPF.' },
  juridico:       { n: 'Intranet Jurídico & Compliance', ic: '⚖️', desc: 'Central do Jurídico: contratos, compliance, LGPD e política anticorrupção.' },
  logistica:      { n: 'Intranet Logística & Frota',  ic: '🚛',  desc: 'Central de Logística: transportes, roteirização, frota e entrega.' },
};

const INTRANET_LINKS = {
  rh: [
    { n: 'Portal Meu RH',          d: 'Holerites, informe de rendimentos e benefícios.', u: '' },
    { n: 'Ponto Eletrônico',       d: 'Marcações, espelhos e aprovações de ponto.',       u: '' },
    { n: 'Solicitar Férias',       d: 'Solicitação e acompanhamento de férias.',          u: '' },
    { n: 'Ocorrências de Ponto',   d: 'Registrar e acompanhar ocorrências.',              u: 'rh', rota: true },
    { n: 'Benefícios',             d: 'Vale-transporte, vale-alimentação e plano.',       u: '' },
  ],
  financeiro: [
    { n: 'SAP FI/CO',              d: 'Contabilidade, contas a pagar e receber.',         u: '' },
    { n: 'Fluxo de Caixa',         d: 'Posição diária e projeções.',                      u: '' },
    { n: 'Notas Fiscais',          d: 'Emissão e conferência de NF-e.',                   u: '' },
    { n: 'Contas a Pagar',         d: 'Faturas, vencimentos e baixas.',                   u: '' },
    { n: 'Orçamento',              d: 'Metas, acompanhamento e revisões.',                u: '' },
  ],
  marketing: [
    { n: 'Calendário de Campanhas', d: 'Agenda de ações e lançamentos.',                  u: '' },
    { n: 'Modelos de Briefing',     d: 'Briefings prontos para preencher.',               u: '' },
    { n: 'Identidade Visual',       d: 'Logos, cores e manuais de marca.',                u: '' },
    { n: 'Central de Mídia',        d: 'Fotos, vídeos e materiais de PDV.',               u: '' },
    { n: 'Redes Sociais',           d: 'Conteúdos e calendário de posts.',                u: '' },
  ],
  ti: [
    { n: 'Abrir Chamado',           d: 'Help desk e solicitações de TI.',                 u: '' },
    { n: 'Manuais de Sistemas',     d: 'SAP, Fluig, LIMS, Power BI e mais.',              u: 'ferramentas', rota: true },
    { n: 'VPN e Acesso Remoto',     d: 'Conectividade fora da unidade.',                  u: '' },
    { n: 'Gestão de Senhas',        d: 'Troca e recuperação de senhas.',                  u: '' },
    { n: 'Segurança da Informação', d: 'Políticas e boas práticas.',                      u: '' },
  ],
  administrativo: [
    { n: 'Expediente',              d: 'Rotinas administrativas e horários.',             u: '' },
    { n: 'Protocolo Interno',       d: 'Entrada e acompanhamento de documentos.',         u: '' },
    { n: 'Compras',                 d: 'Solicitações de compra e fornecedores.',          u: '' },
    { n: 'Contratos',               d: 'Gestão de contratos administrativos.',            u: '' },
    { n: 'Formulários',             d: 'Requisições e modelos prontos.',                  u: '' },
  ],
  diretoria: [
    { n: 'Metas e Indicadores',     d: 'Metas da unidade e KPIs executivos.',             u: '' },
    { n: 'Reuniões',                d: 'Pautas, atas e calendário de reuniões.',          u: '' },
    { n: 'Comunicados',             d: 'Comunicados oficiais da Diretoria.',              u: '' },
    { n: 'Apresentações',           d: 'Deck e materiais de reunião executiva.',          u: '' },
    { n: 'Gestão à Vista',          d: 'Painéis de resultados por área.',                 u: '' },
  ],
  producao: [
    { n: 'Ordens de Produção',      d: 'Acompanhamento de ordens e apontamento.',         u: '' },
    { n: 'BPF',                     d: 'Boas Práticas de Fabricação e padrões.',          u: '' },
    { n: 'Manutenção',              d: 'Chamados e plano de manutenção.',                 u: '' },
    { n: 'Segurança do Trabalho',   d: 'EPIs, procedimentos e treinamentos.',             u: '' },
    { n: 'Indicadores de Fábrica',  d: 'OEE, perdas e produtividade.',                    u: '' },
  ],
  qualidade: [
    { n: 'Padrões Internos',        d: 'Especificações e procedimentos de qualidade.',    u: '' },
    { n: 'Análises Laboratoriais',  d: 'Resultados de análises físico-químicas.',         u: '' },
    { n: 'Auditorias',              d: 'Agenda e relatórios de auditoria.',               u: '' },
    { n: 'Rastreabilidade',         d: 'Controle de lote e rastreio.',                    u: '' },
    { n: 'Não Conformidades',       d: 'Registro e acompanhamento de NC.',                u: '' },
  ],
  juridico: [
    { n: 'Contratos',               d: 'Minutas, modelos e vigências.',                   u: '' },
    { n: 'Compliance',              d: 'Canal de ética e políticas internas.',            u: '' },
    { n: 'LGPD',                    d: 'Procedimentos de proteção de dados.',             u: '' },
    { n: 'Processos Judiciais',     d: 'Acompanhamento de demandas e prazos.',            u: '' },
    { n: 'Modelos de Documento',    d: 'Contratos e documentos jurídicos prontos.',       u: '' },
  ],
  logistica: [
    { n: 'Rastreamento de Entregas', d: 'Acompanhamento de viagens e entregas.',          u: '' },
    { n: 'Roteirização',            d: 'Planejamento de rotas e cargas.',                 u: '' },
    { n: 'Frota',                   d: 'Manutenção, abastecimento e documentos da frota.', u: '' },
    { n: 'Expedição',               d: 'Carregamento e conferência de embarques.',        u: '' },
    { n: 'Indicadores Logísticos',  d: 'OTIF, custo por km e utilização.',                u: '' },
  ],
};

function depNorm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function userAcessaIntranet(key) {
  const u = me();
  if (!u) return false;
  if (intraMeta(key).ativo === false) return false;
  if (u.role === 'admin' || (u.perms || {}).admin) return true;
  if ((u.intranets || []).includes(key)) return true;
  return intraDepts(key).indexOf(depNorm(u.setor)) !== -1;
}

function pIntranetHub() {
  const metas = intraList().filter(m => m.ativo !== false);
  const titulo = '<h2 class="sec"><span class="train-accent-des"></span>  Intranets por Setor</h2>';
  if (!metas.length) return titulo + '<div class="card"><p class="meta">Nenhuma intranet ativa no momento.</p></div>';
  const cards = metas.map(m => {
    const ok = userAcessaIntranet(m.key);
    const rota = m.rota || 'intra-' + m.key;
    return `<div class="ferr-card${ok ? '' : ' locked'}"><h4>${esc(m.n)}</h4>
      <p>${esc(m.desc)}</p>
      <button class="btn-navy-block" onclick="page='${esc(rota)}';renderPage()">${ok ? 'Acessar' : '🔒 Sem acesso'}</button></div>`;
  }).join('');
  return titulo + `<div class="ferr-grid">${cards}</div>`;
}

function pIntranetSetor(key) {
  const meta = intraMeta(key);
  if (!userAcessaIntranet(key)) {
    return `<h2 class="sec"><span class="train-accent-des"></span> ${esc(meta.n)}</h2>
      <div class="card"><p class="meta">🔒 Esta intranet não está liberada para o seu acesso. Fale com o administrador para solicitar a liberação.</p></div>`;
  }
  const depts = intraDepts(key);
  const links = INTRANET_LINKS[key] || [];
  let h = `<h2 class="sec"><span class="train-accent-des"></span> ${esc(meta.n)}</h2>
    <div class="sub-text mb14">${esc(meta.desc)}</div>`;
  if (links.length) {
    h += '<div class="ferr-grid">' + links.map(l => {
      const acao = l.rota
        ? `page='${l.u}';renderPage()`
        : (l.u ? `window.open('${l.u}','_blank')` : "toast('Link ainda não configurado.','warn')");
      return `<div class="ferr-card"><h4>${l.i || '🔗'} ${esc(l.n)}</h4><p>${esc(l.d)}</p>
        <button class="btn-navy-block" onclick="${acao}">Abrir</button></div>`;
    }).join('') + '</div>';
  } else {
    h += '<p class="meta">Nenhum atalho configurado nesta intranet.</p>';
  }
  const docs = get(K.D, []).filter(d =>
    depts.indexOf(depNorm(d.departamento)) !== -1 && docAccess(d, me()) !== 'hidden');
  if (docs.length) {
    h += '<h2 class="sec">📚 Documentos do setor</h2><div class="card">' + docs.map(d => {
      const acc = docAccess(d, me());
      return `<div class="doc-item"><span>📄</span>
        <div class="grow"><b>${esc(d.titulo)}</b><div class="doc-size">${esc(d.tamanho)}</div></div>
        ${acc === 'open' ? `<button class="btn btn-navy btn-sm" onclick="openDoc('${d.id}')">Abrir</button>` : '<span class="lock">🔒</span>'}</div>`;
    }).join('') + '</div></div>';
  }
  const equipe = get(K.U, []).filter(x => x.ativo !== false && depts.indexOf(depNorm(x.setor)) !== -1);
  const ehAdmin = isAdm(me());
  if (equipe.length) {
    h += '<h2 class="sec">👥 Equipe do setor</h2><div class="dep-grid">' + equipe.map(x => {
      const nome = x.nomeCompleto || x.email || 'Colaborador';
      return `<div class="usr-card${ehAdmin ? ' usr-clicavel' : ''}"${ehAdmin ? ` onclick="userForm('${esc(x.email)}')" title="Clique para editar cadastro"` : ''}>
        <div class="usr-av">${initials(nome)}</div>
        <div class="usr-info"><b>${esc(nome)}</b>
          <span class="usr-role">${esc(x.cargo || '')} • ${esc(x.setor || '')}</span>
          <a class="usr-mail" href="mailto:${esc(x.email || '')}" onclick="event.stopPropagation()">${esc(x.email || '')}</a>
          ${ehAdmin ? '<span class="usr-edit">✏️ Clique para editar</span>' : ''}
        </div></div>`;
    }).join('') + '</div>';
  }
  return h;
}

/* ===== APOIO: CRUD DE INTRANETS ===== */

function permUserChk(id, label, checked, extra) {
  return `<label><input type="checkbox" id="${id}"${checked ? ' checked' : ''}${extra || ''}> ${label}</label>`;
}

function intraSeed() {
  return Object.keys(INTRANET_META).map(k => ({
    key: k,
    n: INTRANET_META[k].n,
    desc: INTRANET_META[k].desc || '',
    depts: (INTRANET_DEPTS[k] || []).slice(),
    rota: 'intra-' + k,
    ativo: true,
  }));
}

function intraList() {
  const s = get('italac_intranets', null);
  return (s && s.itens) ? s.itens : intraSeed();
}

function intraCommit(itens) {
  set('italac_intranets', { itens });
}

function intraMeta(key) {
  const it = intraList().find(x => x.key === key);
  return it || { key, n: key, desc: '', depts: [], rota: 'intra-' + key, ativo: true };
}

function intraDepts(key) {
  return (intraMeta(key).depts || []).slice();
}

function intraColabs(key) {
  const depts = intraDepts(key);
  return get(K.U, []).filter(u => {
    if (!u || u.ativo === false) return false;
    if (u.role === 'admin' || (u.perms || {}).admin) return true;
    if ((u.intranets || []).indexOf(key) !== -1) return true;
    return depts.some(d => depNorm(d) === depNorm(u.setor));
  });
}

function admIntranets(el) {
  const lista = intraList();
  const linhas = lista.map(m => {
    const nColab = intraColabs(m.key).length;
    const ativa = m.ativo !== false;
    return `<tr class="${ativa ? '' : 'row-off'}">
      <td><b>${esc(m.n)}</b></td>
      <td><span class="status-chip ${ativa ? 'on' : 'off'}">● ${ativa ? 'Ativa' : 'Inativa'}</span></td>
      <td>${nColab} colaborador(es)</td>
      <td class="doc-size">${esc(m.rota || 'intra-' + m.key)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="intraForm('${esc(m.key)}')" title="Editar">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="toggleIntra('${esc(m.key)}')" title="${ativa ? 'Desativar' : 'Ativar'}">${ativa ? '⛔' : '▶️'}</button>
        <button class="btn btn-ghost btn-sm c-danger" onclick="delIntra('${esc(m.key)}')" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
  el.innerHTML = admCardHeader('🛠️', 'Intranets', lista.length, `<button class="btn btn-primary btn-sm" onclick="intraForm()">+ Nova intranet</button>`,
    '<p class="doc-size mb10">Edite nome, descrição e link, ative/desative e exclua intranets.</p>') +
    (lista.length
      ? `<table class="adm-tbl"><thead><tr><th>Intranet</th><th>Status</th><th>Pessoas com acesso</th><th>Link da página</th><th class="w170">Ações</th></tr></thead><tbody>${linhas}</tbody></table>`
      : '<p class="meta">Nenhuma intranet cadastrada. Use "+ Nova intranet".</p>') +
    '</div>';
}

function toggleIntra(key) {
  const lista = intraList();
  const alvo = lista.find(x => x.key === key);
  if (!alvo) return;
  const novo = alvo.ativo === false;
  intraCommit(lista.map(x => x.key === key ? { ...x, ativo: novo } : x));
  toast(`Intranet ${novo ? 'ativada.' : 'desativada.'}`, 'ok');
  renderPage();
  buildNav();
}

function intraForm(key) {
  const m = key ? intraMeta(key) : null;
  const chave = m ? m.key : '';
  const colabs = intraColabs(chave);
  const ativa = m ? (m.ativo !== false) : true;
  const listaColabs = colabs.length
    ? colabs.map(u => {
        const n = u.nomeCompleto || u.email || 'Colaborador';
        return `<div class="bday">
          <div class="mini-av">${initials(n)}</div>
          <div><b class="intra-item-nome">${esc(n)}</b>
          <div class="intra-item-sub">${esc(u.cargo || '')} • ${esc(u.setor || '')}</div></div>
        </div>`;
      }).join('')
    : '<p class="meta m0">Nenhum colaborador com acesso (apenas o administrador).</p>';
  openModal(`<h3>${m ? `✏️ Editar intranet — ${esc(m.n)}` : '➕ Nova intranet'}</h3>
    <label>Nome da intranet</label>
    <input id="in-nome" value="${esc(m ? m.n : '')}" placeholder="Ex.: Intranet RH">
    <label>Status</label><select id="in-ativo">
      <option value="1"${ativa ? ' selected' : ''}>🟢 Ativa</option>
      <option value="0"${!ativa ? ' selected' : ''}>🔴 Inativa</option>
    </select>
    <label>Descrição</label>
    <textarea id="in-desc" rows="2" placeholder="O que essa intranet reúne?">${esc(m ? m.desc : '')}</textarea>
    <label>👥 Colaboradores com acesso <span class="doc-size">(${colabs.length})</span></label>
    <div class="card colab-list">${listaColabs}</div>
    <label>🔗 Link da página (rota interna)</label>
    <input id="in-rota" value="${esc(m ? (m.rota || 'intra-' + m.key) : '')}" placeholder="intra-rh">
    <p class="doc-size mt4">Rota que abre esta intranet. Troque por uma rota única e sem espaços.</p>
    <div class="modal-btn-row">
      <button class="btn btn-primary" onclick="saveIntra('${esc(chave)}')">Salvar</button>
      ${m ? `<button class="btn btn-ghost c-danger" onclick="delIntra('${esc(m.key)}')">Excluir</button>` : ''}
    </div>`);
}

function saveIntra(key) {
  const nome = (v('in-nome') || '').trim();
  if (!nome) { toast('Informe o nome da intranet.', 'err'); return; }
  const desc = (v('in-desc') || '').trim();
  const rota = (v('in-rota') || '').trim().replace(/\s+/g, '-') || `intra-${key || Date.now()}`;
  const ativo = v('in-ativo') === '1';
  const lista = intraList();
  const alvo = key ? lista.find(x => x.key === key) : null;
  if (alvo) {
    intraCommit(lista.map(x => x.key === key ? { ...x, n: nome, desc, rota, ativo } : x));
  } else {
    const novaKey = 'intra' + Date.now();
    lista.push({ key: novaKey, n: nome, desc, depts: [], rota, ativo });
    intraCommit(lista);
  }
  closeModal();
  renderPage();
  buildNav();
  toast('Intranet salva.', 'ok');
}

function delIntra(key) {
  const alvo = intraList().find(x => x.key === key);
  if (!alvo) return;
  if (!confirm(`Excluir a intranet "${alvo.n}" definitivamente?`)) return;
  intraCommit(intraList().filter(x => x.key !== key));
  toast('Intranet excluída.', 'ok');
  renderPage();
}

/* ---------- Opções de escopo do calendário ---------- */

function escopoCalOptions(sel) {
  const setores = ['todos'].concat(
    Array.from(new Set(get(K.U, []).map(x => (x.setor || '').trim()).filter(Boolean))).sort()
  );
  return setores.map(s =>
    `<option value="${esc(s)}"${sel === s ? ' selected' : ''}>${s === 'todos' ? 'Todos os setores' : `Somente ${esc(s)}`}</option>`
  ).join('');
}

/* ---------- Seeds ---------- */

function admSeedProgramas() {
  if (get('italac_programas_seedado', false)) return;
  const lista = get('italac_programas', []);
  const seed = [
    { nome: 'SAP ERP', categoria: 'Financeiro', desc: 'Gestão empresarial integrada: suprimentos, produção e finanças.', url: '', ativo: true, destaque: false },
    { nome: 'Fluig BPM', categoria: 'Tecnologia & TI', desc: 'Workflow, documentos eletrônicos e aprovações internas.', url: '', ativo: true, destaque: false },
    { nome: 'Power BI', categoria: 'Tecnologia & TI', desc: 'Dashboards corporativos e indicadores de performance.', url: '', ativo: true, destaque: false },
    { nome: 'LIMS', categoria: 'Qualidade', desc: 'Gestão de laboratório: análises físico-químicas e microbiológicas.', url: '', ativo: true, destaque: false },
    { nome: 'Salesforce', categoria: 'Comercial', desc: 'Gestão de clientes e força de vendas (Trade).', url: '', ativo: true, destaque: false },
    { nome: 'Italac Conecta', categoria: 'RH', desc: 'Portal de colaboradores, benefícios e ponto eletrônico.', url: '', ativo: true, destaque: true },
  ];
  const nomesExistentes = lista.map(p => p.nome);
  const novos = seed
    .filter(s => !nomesExistentes.includes(s.nome))
    .map(o => ({ id: uid(), ...o }));
  if (novos.length) set('italac_programas', lista.concat(novos));
  set('italac_programas_seedado', true);
}

function admSeedDepartamentos() {
  const lista = get('italac_departamentos', []);
  const restantes = lista.filter(d => !/teste|tese|test/i.test(depNorm(d.nome)));
  if (restantes.length !== lista.length) set('italac_departamentos', restantes);
  if (get('italac_departamentos_seedado', false)) return;
  const seed = [
    { nome: 'Recursos Humanos', setor: 'RH', responsavel: 'Camila Torres', ativo: true },
    { nome: 'Produção', setor: 'Produção', responsavel: 'Rafael Mendes', ativo: true },
    { nome: 'Tecnologia & TI', setor: 'TI', responsavel: 'Marcos Lopes', ativo: true },
    { nome: 'Marketing', setor: 'Marketing', responsavel: 'Isabela Alves', ativo: true },
    { nome: 'Financeiro', setor: 'Financeiro', responsavel: 'Paulo Ribeiro', ativo: true },
    { nome: 'Qualidade', setor: 'Qualidade', responsavel: 'Larissa Coelho', ativo: true },
    { nome: 'Logística', setor: 'Logística', responsavel: 'Marcos Prado', ativo: true },
    { nome: 'Manutenção', setor: 'Manutenção', responsavel: 'Bruno Tavares', ativo: true },
    { nome: 'Distribuição', setor: 'Distribuição', responsavel: 'Cláudia Nunes', ativo: true },
  ];
  const tem = restantes.map(d => depNorm(d.nome));
  const novos = seed
    .filter(s => !tem.includes(depNorm(s.nome)))
    .map(o => ({ id: uid(), ...o }));
  if (novos.length) set('italac_departamentos', restantes.concat(novos));
  set('italac_departamentos_seedado', true);
}

const DEP_ALIASES = {
  rh: 'recursoshumanos', 'recursoshumanos': 'rh',
  ti: 'tecnologia', tecnologia: 'ti',
  vendas: 'comercial', comercial: 'vendas',
  expedicao: 'logistica', logistica: 'expedicao',
  'r.h.': 'rh', 't.i.': 'ti',
};

function depSetorCasa(ref, setor) {
  if (!setor) return false;
  const a = depNorm(ref.setor || ref.nome);
  const b = depNorm(setor);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const al = DEP_ALIASES[a];
  const bl = DEP_ALIASES[b];
  return (al && (al === b || b.includes(al))) || (bl && (bl === a || a.includes(bl)));
}