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
set(K.C, get(K.C, []).map(c => c.status ? c : Object.assign({}, c, { status:'publicado' })));
