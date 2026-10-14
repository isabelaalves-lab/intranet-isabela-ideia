
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