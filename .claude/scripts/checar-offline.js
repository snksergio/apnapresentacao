/* checar-offline.js — responde UMA pergunta: se faltar internet, a apresentacao roda?
 *
 * Uso:  node .claude/scripts/checar-offline.js
 *
 * POR QUE ISSO EXISTE
 * Pedido do dono em 2026-08-13: *"eu preciso que se nao tiver internet ele rode"*. A resposta
 * nao pode ser a minha palavra num relatorio que ele leu semanas antes — ele precisa poder
 * conferir na maquina que vai apresentar, minutos antes, sem depender de ninguem.
 *
 * O QUE FOI MEDIDO E VIROU A BASE DESTE SCRIPT (2026-08-13)
 * A pagina em si JA roda offline por inteiro, e isso foi verificado varrendo todo o
 * index.html e os js/: NAO existe um unico `src` externo — nenhuma fonte, script, CSS ou
 * imagem vem de fora. As unicas URLs externas sao `href` (so carregam se alguem clicar) e
 * `<meta>`/`<link rel=canonical>`, que nao fazem pedido de rede nenhum. Fontes, GSAP e as
 * imagens sao todos locais.
 *
 * Ou seja: o unico risco real de "precisou de internet" sao os VIDEOS. A lista deles nao esta
 * escrita aqui a mao — ela e LIDA DO CODIGO que os procura (ver `alvosIgnorados` abaixo, e o
 * aviso de por que a fonte da lista mudou no meio do dia). Repetir a lista neste arquivo
 * criaria o defeito classico desta base: o mesmo dado em dois lugares, discordando com o tempo.
 *
 * O QUE ELE NAO SABE FAZER, e e melhor dizer do que fingir:
 *  - nao testa se o video ABRE, so se o arquivo esta la e tem tamanho plausivel;
 *  - nao ve caminho de video montado por concatenacao em tempo de execucao;
 *  - nao substitui abrir a pagina e assistir. Ele evita a surpresa, nao a conferencia.
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const IGN  = path.join(RAIZ, '.gitignore');
const HTML = path.join(RAIZ, 'index.html');

/* ------------------------------------------------------------------ *
 * 1. quais videos o CODIGO procura no disco (lidos do proprio codigo)
 * ------------------------------------------------------------------ */
/* ⚠ A LISTA VEM DO CODIGO, NAO MAIS DO .gitignore — corrigido em 2026-08-13.
   A primeira versao lia os caminhos do `.gitignore`, e a ideia era boa enquanto os videos
   estavam FORA do repositorio: a lista se mantinha sozinha. No mesmo dia o dono pediu para
   versiona-los, eles sairam do .gitignore, e este script passou a nao listar VIDEO NENHUM —
   o veredito continuava "pode apresentar", mas por acidente, sem conferir nada. Verificador
   que nao verifica e pior que verificador nenhum: da falsa seguranca.
   Agora a lista sai de onde ela realmente existe: os `arquivo:"..."` do
   js/video-reconhecimento.js (os videos das qualificacoes e das conexoes) e o `LOCAL=` do
   IIFE do video institucional no index.html. Se alguem acrescentar um video ao player
   amanha, este script passa a cobrar por ele sozinho — que era a intencao desde o começo. */
function alvosIgnorados() {
  const achados = new Set();
  try {
    const js = fs.readFileSync(path.join(RAIZ, 'js', 'video-reconhecimento.js'), 'utf8');
    for (const m of js.matchAll(/arquivo\s*:\s*"([^"]+\.mp4)"/g)) achados.add(m[1]);
  } catch (e) { /* peca ausente: nada a cobrar dela */ }
  try {
    const html = fs.readFileSync(HTML, 'utf8');
    for (const m of html.matchAll(/var\s+LOCAL\s*=\s*'([^']+\.mp4)'/g)) achados.add(m[1]);
  } catch (e) { /* idem */ }
  return [...achados].sort();
}

/* ------------------------------------------------------------------ *
 * 2. rotulo humano para cada arquivo (o dono nao pensa em nome de arquivo)
 * ------------------------------------------------------------------ */
const ROTULOS = {
  'assets/video/institucional-igreen.mp4'      : 'Vídeo institucional (seção da Sede)',
  'assets/video/reconhecimento-gestor.mp4'     : 'Reconhecimento — Gestor',
  'assets/video/Seguros-BPSeguradora.mp4'      : 'Conexão Seguros (ecossistema)',
  'assets/video/reconhecimento-executivo.mp4'  : 'Reconhecimento — Executivo',
  'assets/video/reconhecimento-diretor.mp4'    : 'Reconhecimento — Diretor',
  'assets/video/reconhecimento-acionista.mp4'  : 'Reconhecimento — Acionista'
};
function rotulo(rel) { return ROTULOS[rel] || rel; }

/* ------------------------------------------------------------------ *
 * 3. confere que nenhum ATIVO vem de fora
 *    (link e meta nao contam: nao fazem pedido de rede)
 * ------------------------------------------------------------------ */
function ativosExternos() {
  let txt = '';
  try { txt = fs.readFileSync(HTML, 'utf8'); } catch (e) { return ['nao consegui ler o index.html']; }
  const achados = [];
  /* `src=` de qualquer tag, e `href=` SO quando for folha de estilo ou preload */
  const re = /(?:src\s*=\s*"(https?:\/\/[^"]+)")|(?:<link[^>]+rel\s*=\s*"(?:stylesheet|preload)"[^>]*href\s*=\s*"(https?:\/\/[^"]+)")/gi;
  let m;
  while ((m = re.exec(txt)) !== null) achados.push(m[1] || m[2]);
  return achados;
}

/* ------------------------------------------------------------------ *
 * relatorio
 * ------------------------------------------------------------------ */
const alvos = alvosIgnorados();
const faltando = [], presentes = [];

alvos.forEach(rel => {
  const abs = path.join(RAIZ, rel);
  let st = null;
  try { st = fs.statSync(abs); } catch (e) { /* nao existe */ }
  if (st && st.isFile() && st.size > 1024) presentes.push({ rel, mb: st.size / 1048576 });
  else faltando.push(rel);
});

const externos = ativosExternos();

console.log('\n  APRESENTAÇÃO SEM INTERNET — conferência');
console.log('  ' + '-'.repeat(58));

console.log('\n  A página em si (textos, imagens, fontes, animações):');
if (externos.length === 0) {
  console.log('    OK — nada é baixado de fora. Roda sem rede.');
} else {
  console.log('    ATENÇÃO — ' + externos.length + ' arquivo(s) vindo(s) de fora:');
  externos.forEach(u => console.log('      · ' + u));
  console.log('    Isso PRECISA de internet. Avise quem cuida do código.');
}

console.log('\n  Vídeos (os que o código procura no disco):');
presentes.forEach(p => console.log('    OK      ' + rotulo(p.rel) + '  (' + p.mb.toFixed(0) + ' MB)'));
faltando.forEach(f => console.log('    FALTA   ' + rotulo(f)));

console.log('\n  ' + '-'.repeat(58));
if (faltando.length === 0 && externos.length === 0) {
  console.log('  VEREDITO: pode apresentar sem internet. Está tudo aqui.\n');
  process.exit(0);
}
if (faltando.length) {
  console.log('  VEREDITO: ' + faltando.length + ' vídeo(s) vão tentar o YouTube, e aí PRECISAM de internet.');
  console.log('\n  Como resolver: copie o arquivo para esta pasta, com o nome exato:');
  faltando.forEach(f => console.log('    ' + f));
  console.log('\n  Os nomes têm de ser exatamente esses — o código procura por eles.');
  console.log('  Nada mais precisa ser feito: com o arquivo lá, o vídeo passa a tocar do disco.\n');
}
process.exit(1);
