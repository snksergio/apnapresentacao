/* ver-local.js — abre a landing num endereco http de verdade, no navegador padrao.
 *
 * POR QUE ISSO EXISTE
 * Abrir o index.html com dois cliques na pasta usa o protocolo file://, e file:// NAO E o site.
 * Tres coisas do projeto simplesmente nao funcionam la, e nenhuma delas e defeito da pagina:
 *   1) O popup do video institucional. O player do YouTube exige uma origem valida; em file:// a
 *      origem e a string "null" e ele devolve "Erro 153 — erro de configuracao do player de video".
 *      Por isso o card cai no plano B (abre o YouTube em outra aba) quando nao ha http. Servido
 *      por http o popup abre DENTRO do site — medido: iframe de 1178x662 e nenhuma aba nova.
 *   2) As fontes locais dao erro de CORS no console.
 *   3) Compartilhar / area de transferencia (navigator.share) falham calados.
 *
 * Uso:  node .claude/scripts/ver-local.js
 * Nao instala nada: e o servidor http que ja vem dentro do node.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const RAIZ = path.resolve(__dirname, '..', '..');   /* .claude/scripts -> igreen-apresentacao */

const TIPOS = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',   '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.webp':'image/webp', '.avif':'image/avif', '.gif':'image/gif', '.ico':'image/x-icon',
  '.mp4':'video/mp4', '.webm':'video/webm', '.m4v':'video/mp4',
  '.woff2':'font/woff2', '.woff':'font/woff', '.ttf':'font/ttf',
  '.pdf':'application/pdf', '.txt':'text/plain; charset=utf-8', '.md':'text/markdown; charset=utf-8'
};

const servidor = http.createServer(function (req, res) {
  let rel;
  try { rel = decodeURIComponent(req.url.split('?')[0].split('#')[0]); }
  catch (e) { res.writeHead(400); return res.end('URL invalida'); }
  if (rel === '/' || rel === '') rel = '/index.html';

  /* nao sair da pasta do projeto (um ../../ na URL viraria leitura de qualquer arquivo do Mac) */
  const alvo = path.join(RAIZ, path.normalize(rel));
  if (!alvo.startsWith(RAIZ + path.sep)) { res.writeHead(403); return res.end('Fora do projeto'); }

  fs.stat(alvo, function (err, st) {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Nao encontrado: ' + rel); }
    const tipo = TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream';

    /* Range: o <video> do Chrome pede pedaco do arquivo, e sem isso os videos da pagina
       (sede, planos) ficam parados. Nunca use cache aqui: o dono edita e recarrega. */
    const cab = { 'Content-Type': tipo, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
    const faixa = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (faixa) {
      let ini = faixa[1] === '' ? null : parseInt(faixa[1], 10);
      let fim = faixa[2] === '' ? null : parseInt(faixa[2], 10);
      if (ini === null) { ini = Math.max(0, st.size - (fim || 0)); fim = st.size - 1; }
      if (fim === null || fim > st.size - 1) fim = st.size - 1;
      if (ini > fim) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + st.size });
        return res.end();
      }
      cab['Content-Range'] = 'bytes ' + ini + '-' + fim + '/' + st.size;
      cab['Content-Length'] = fim - ini + 1;
      res.writeHead(206, cab);
      return fs.createReadStream(alvo, { start: ini, end: fim }).pipe(res);
    }
    cab['Content-Length'] = st.size;
    res.writeHead(200, cab);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(alvo).pipe(res);
  });
});

/* porta 0 = o sistema escolhe uma livre. Assim nunca colide com outro servidor ja aberto. */
servidor.listen(0, '127.0.0.1', function () {
  const url = 'http://localhost:' + servidor.address().port + '/index.html';
  console.log('\n  Landing iGreen servida em:  ' + url);
  console.log('  Pasta: ' + RAIZ);
  console.log('\n  Aqui o popup do video abre DENTRO do site (em file:// da Erro 153).');
  console.log('  Para encerrar, aperte Ctrl+C nesta janela.\n');
  const abridor = process.platform === 'darwin' ? 'open'
                : process.platform === 'win32' ? 'explorer' : 'xdg-open';
  execFile(abridor, [url], function () { /* se nao abrir sozinho, o endereco esta acima */ });
});
