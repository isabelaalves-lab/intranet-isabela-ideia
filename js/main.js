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