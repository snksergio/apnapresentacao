/* Poe ?v=<VERSAO> nas URLs dos js/css locais.
   POR QUE: o dono viu "a ordem das viagens errada SO no modo apresentacao, no clique ta ok".
   Reproduzido: com o index.html novo e o js/presentation-mode.js ANTIGO em cache, o pin GESTOR
   abria cruzeiro, EXECUTIVO abria a neve, DIRETOR abria Europa e o Senior abria uma galeria que
   nao deveria ter. O clique acertava porque esse caminho e inline no index; a apresentacao vem do
   arquivo externo, e nenhuma URL local tinha versao — o navegador reaproveitava a antiga.
   Regras de edicao em massa deste projeto: conta antes, aborta se der diferente do esperado,
   trabalha linha a linha e preserva CRLF. */
const fs = require('fs');
const path = require('path');

const RAIZ = '/Users/matheusfrancelino/Desktop/iGreen.SYS/001_APN/igreen-apresentacao';
const VERSAO = process.argv[2] || '20260804';

const ARQS = ['index.html'].concat(
  fs.readdirSync(path.join(RAIZ, 'produtos'))
    .filter(f => f.endsWith('.html'))
    .map(f => 'produtos/' + f)
);

/* casa js/x.js e ../css/x.css, com ' ou ", e SO se ainda nao tiver ?v= */
const RE = /(['"])((?:\.\.\/)?(?:js|css)\/[a-z0-9-]+\.(?:js|css))\1/g;

let totalTrocas = 0, totalArqs = 0;
const relatorio = [];

for (const rel of ARQS) {
  const p = path.join(RAIZ, rel);
  const txt = fs.readFileSync(p, 'utf8');
  const crlf = txt.indexOf('\r\n') >= 0;
  const linhas = txt.split(/\r?\n/);
  let n = 0;
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].indexOf('?v=') >= 0 && !RE.test(linhas[i])) { RE.lastIndex = 0; }
    RE.lastIndex = 0;
    linhas[i] = linhas[i].replace(RE, function (todo, q, url) {
      n++;
      return q + url + '?v=' + VERSAO + q;
    });
  }
  if (!n) { relatorio.push('  (nenhuma) ' + rel); continue; }
  fs.writeFileSync(p, linhas.join(crlf ? '\r\n' : '\n'));
  totalTrocas += n; totalArqs++;
  relatorio.push('  ' + String(n).padStart(2) + ' em ' + rel);
}

console.log('URLs versionadas com ?v=' + VERSAO + ':');
console.log(relatorio.join('\n'));
console.log('\ntotal: ' + totalTrocas + ' URL(s) em ' + totalArqs + ' arquivo(s)');
