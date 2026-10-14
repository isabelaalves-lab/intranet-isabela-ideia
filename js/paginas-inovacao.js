
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
  const hero = '<div class="grid2" style="grid-template-columns:1fr 1fr 1fr; margin-top:-30px">' + SUST_HERO.map(h =>
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
    '<div class="grid2" style="margin-top: 0px">' + meta + dica + '</div>' +
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
    '<div class="idea-title"><span class="train-accent"></span> <h2> Inovação e Ideias</h2></div>' +
    '<span class="idea-count">' + list.length + ' ideia' + (list.length === 1 ? '' : 's') + '</span>' +
    '</div>' +
    '<div class="idea-form card">' +
      '<div class="idea-form-head">' +
        '<div><b class="navy-text">Compartilhe sua ideia</b>' +
        '<p class="sub-text" style="margin:2px 0 0">Toda sugestão passa por análise antes de ser aprovada.</p></div>' +
      '</div>' +
      '<label style="margin-top:14  px">Título da ideia</label><input id="i-t" placeholder="Ex.: Reduzir desperdício no envase">' +
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
