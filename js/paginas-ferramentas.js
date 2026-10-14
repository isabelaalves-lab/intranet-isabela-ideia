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