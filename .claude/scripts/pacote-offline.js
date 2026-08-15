/* pacote-offline.js — monta uma pasta pronta para apresentar, com TUDO, sem o miolo do projeto.
 *
 * Uso:  node .claude/scripts/pacote-offline.js
 * Sai em:  ../PACOTE-APRESENTACAO-iGreen  (pasta irmã desta, fácil de achar e de compactar)
 *
 * ============================================================================
 * POR QUE ISSO EXISTE, E POR QUE NÃO É "CTRL+S"
 * ----------------------------------------------------------------------------
 * Pedido do dono (2026-08-13): *"entrar no link da página, dar um Ctrl+S, salvar o HTML de
 * forma completa com os assets de forma completa, uma reprodução completa sem esquecer de
 * nenhum arquivo"*. E a premissa dele era que *"por trás do link já tem os arquivos baixados
 * dentro das pastas, já renomeados"*.
 *
 * ⚠ A PREMISSA ESTAVA ERRADA, e foi medido: o que o Netlify publica é o conteúdo do
 * repositório, e os quatro `reconhecimento-*.mp4` estão no `.gitignore` — `git ls-tree
 * origin/main -- assets/video/` lista 22 vídeos e NENHUM deles. No site publicado esses
 * caminhos devolvem 404, e é por isso que o player cai no YouTube. Não havia o que o Ctrl+S
 * puxar.
 *
 * ⚠ E O CTRL+S NÃO SERVIRIA NEM SE OS ARQUIVOS ESTIVESSEM LÁ, por dois motivos:
 *   1. o elemento <video> só é criado QUANDO ALGUÉM CLICA para abrir o pop-up. No instante do
 *      Ctrl+S ele não existe no documento, e o navegador não salva o que não está lá;
 *   2. "Página completa" do Chrome salva o que ele já baixou. Esta página monta muita coisa
 *      por JavaScript depois do carregamento (as galerias, os estados do mapa, os pop-ups), e
 *      é justamente a parte interativa que sairia quebrada.
 *
 * Então a saída não é adivinhar o que o navegador salvou: é MONTAR A LISTA. É o que este
 * script faz — e por isso ele pode prometer "sem esquecer nenhum arquivo", o que o Ctrl+S não
 * pode.
 *
 * ============================================================================
 * LISTA DE INCLUSÃO, NÃO DE EXCLUSÃO — e isso é decisão de segurança
 * ----------------------------------------------------------------------------
 * O pacote é montado por INCLUSÃO explícita (`INCLUIR` abaixo). Uma lista de exclusão teria o
 * defeito clássico: alguém cria uma pasta nova com anotação interna amanhã e ela vai junto no
 * pacote sem ninguém perceber. Com inclusão, o pior caso é faltar algo — e o script CONFERE o
 * que faltou no fim, em voz alta.
 *
 * O que fica de fora de propósito (o "miolo" que o dono pediu para separar): `.git` (226 MB de
 * histórico), `.claude` (agentes, mapas, scripts, estas anotações), `.github`, `.githooks` e
 * os arquivos `.md` da raiz. E também os MASTERS que a página não serve — `assets/img/Banner
 * próximo evento/` são 67 MB de JPG 4000x2250. ⚠ Eles alimentavam `assets/img/summit/`, que saiu
 * junto com a seção do mapa; a exclusão fica como defesa caso a pasta de masters reapareça.
 *
 * ============================================================================
 * ⚠ O PACOTE PRECISA DE http, E POR ISSO VAI COM UM ABRIDOR
 * ----------------------------------------------------------------------------
 * Abrir o `index.html` com dois cliques usa `file://`, e ali as FONTES do projeto são
 * bloqueadas por CORS — o texto cai para a fonte do sistema e a apresentação inteira muda de
 * cara. Não é defeito da página; é regra do navegador. Por isso o pacote leva um servidor
 * mínimo (`servidor.js`, o http que já vem no node) e um atalho de duplo clique para Mac e
 * para Windows.
 * ⚠ O servidor responde a `Range` (206). Sem isso um mp4 de 108 MB não busca posição e a barra
 * de progresso do vídeo não funciona — foi medido neste projeto.
 * ============================================================================
 */
const fs   = require('fs');
const path = require('path');

const RAIZ    = path.resolve(__dirname, '..', '..');
const DESTINO = path.resolve(RAIZ, '..', 'PACOTE-APRESENTACAO-iGreen');

/* o que a página precisa para rodar — nada além disto */
const INCLUIR = [
  'index.html',
  'css',
  'js',
  'produtos',
  'assets/fonts',
  'assets/img',
  'assets/logos',
  'assets/pins',
  'assets/vendor',
  'assets/video'
];

/* dentro do que foi incluído, o que ainda não vai */
const FORA = [
  'assets/img/Banner próximo evento',   /* masters 4000x2250, sem uso desde que a seção do
                                           mapa do Summit saiu; fica como defesa */
];
function ehFora(rel) {
  if (/(^|\/)\.DS_Store$/.test(rel)) return true;
  if (/-master\.mp4$/.test(rel))     return true;
  /* ⚠ TODO .md FICA FORA, EM QUALQUER PROFUNDIDADE — e isto foi um vazamento real, pego na
     primeira execução: as pastas de arte guardam instruções internas (`COMO-COLOCAR-AS-FOTOS.md`
     em ecossistema, destaques, reconhecimento, top10, e um `README.md` em produtos/). São
     exatamente as anotações que o dono pediu para não ir no pacote, e estavam DENTRO de pastas
     que a página precisa — então excluir a pasta não era opção; tinha de ser por extensão.
     A página não carrega nenhum `.md`: nada quebra ao tirá-los. */
  if (/\.md$/i.test(rel)) return true;
  return FORA.some(f => rel === f || rel.startsWith(f + path.sep) || rel.startsWith(f + '/'));
}

/* vídeos que o CÓDIGO procura no disco: se faltar, aquele trecho vai pedir internet.
   Lido do .gitignore pelo mesmo motivo do checar-offline.js — não repetir a lista. */
function videosQueOCodigoQuer() {
  try {
    return fs.readFileSync(path.join(RAIZ, '.gitignore'), 'utf8').split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => /^assets\/video\/[^*]+\.mp4$/.test(l));
  } catch (e) { return []; }
}

let arquivos = 0, bytes = 0;
function copia(rel) {
  const de  = path.join(RAIZ, rel);
  const para = path.join(DESTINO, rel);
  let st; try { st = fs.statSync(de); } catch (e) { return false; }
  if (st.isDirectory()) {
    fs.mkdirSync(para, { recursive: true });
    for (const nome of fs.readdirSync(de)) {
      const filho = rel + '/' + nome;
      if (ehFora(filho)) continue;
      copia(filho);
    }
    return true;
  }
  fs.mkdirSync(path.dirname(para), { recursive: true });
  fs.copyFileSync(de, para);
  arquivos++; bytes += st.size;
  return true;
}

console.log('\n  Montando o pacote em:\n    ' + DESTINO + '\n');
if (fs.existsSync(DESTINO)) {
  console.log('  (a pasta já existia — vou sobrescrever o conteúdo)\n');
}

const faltaram = [];
for (const alvo of INCLUIR) {
  if (ehFora(alvo)) continue;
  process.stdout.write('  copiando ' + alvo + ' ... ');
  const ok = copia(alvo);
  console.log(ok ? 'ok' : 'NÃO ENCONTRADO');
  if (!ok) faltaram.push(alvo);
}

/* ---- o abridor, para não cair em file:// e perder as fontes ---- */
const SERVIDOR = `/* servidor minimo: o http que ja vem no node. Nao instala nada.
   Responde Range (206) porque video grande exige isso para buscar posicao. */
const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml',
'.mp4':'video/mp4','.webm':'video/webm','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.ico':'image/x-icon',
'.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const RAIZ=__dirname;
http.createServer(function(req,res){
  let rel; try{ rel=decodeURIComponent(req.url.split('?')[0].split('#')[0]); }catch(e){ res.writeHead(400); return res.end(); }
  if(rel==='/'||rel==='') rel='/index.html';
  const alvo=path.join(RAIZ,path.normalize(rel));
  if(!alvo.startsWith(RAIZ+path.sep)){ res.writeHead(403); return res.end('Fora da pasta'); }
  fs.stat(alvo,function(err,st){
    if(err||!st.isFile()){ res.writeHead(404); return res.end('Nao encontrado: '+rel); }
    const cab={'Content-Type':T[path.extname(alvo).toLowerCase()]||'application/octet-stream','Accept-Ranges':'bytes'};
    const r=req.headers.range;
    if(r){
      const m=/bytes=(\\d*)-(\\d*)/.exec(r);
      let ini=m&&m[1]?parseInt(m[1],10):0, fim=m&&m[2]?parseInt(m[2],10):st.size-1;
      if(ini>=st.size){ res.writeHead(416,{'Content-Range':'bytes */'+st.size}); return res.end(); }
      cab['Content-Range']='bytes '+ini+'-'+fim+'/'+st.size; cab['Content-Length']=fim-ini+1;
      res.writeHead(206,cab); return fs.createReadStream(alvo,{start:ini,end:fim}).pipe(res);
    }
    cab['Content-Length']=st.size; res.writeHead(200,cab); fs.createReadStream(alvo).pipe(res);
  });
}).listen(0,'127.0.0.1',function(){
  const url='http://localhost:'+this.address().port+'/index.html';
  console.log('\\n  Apresentacao iGreen em:  '+url);
  console.log('  Para encerrar, feche esta janela.\\n');
  const abridor=process.platform==='darwin'?'open':process.platform==='win32'?'explorer':'xdg-open';
  require('child_process').execFile(abridor,[url],function(){});
});
`;
fs.writeFileSync(path.join(DESTINO, 'servidor.js'), SERVIDOR);
fs.writeFileSync(path.join(DESTINO, 'ABRIR-NO-MAC.command'),
  '#!/bin/bash\ncd "$(dirname "$0")"\nnode servidor.js\n');
try { fs.chmodSync(path.join(DESTINO, 'ABRIR-NO-MAC.command'), 0o755); } catch (e) {}
fs.writeFileSync(path.join(DESTINO, 'ABRIR-NO-WINDOWS.bat'),
  '@echo off\r\ncd /d "%~dp0"\r\nnode servidor.js\r\npause\r\n');

/* ---- confere os vídeos ---- */
const querVideo = videosQueOCodigoQuer();
const semVideo = querVideo.filter(rel => !fs.existsSync(path.join(DESTINO, rel)));

const LEIA =
`APRESENTACAO iGREEN — como abrir
================================

1. Instale o Node.js, se ainda nao tiver:  https://nodejs.org  (o botao grande, versao LTS)
2. No Mac:      dois cliques em  ABRIR-NO-MAC.command
   No Windows:  dois cliques em  ABRIR-NO-WINDOWS.bat
3. O navegador abre sozinho. Pronto.

FUNCIONA SEM INTERNET? Sim, com os videos que estao na pasta assets/video.
${semVideo.length ? 'ATENCAO: faltam ' + semVideo.length + ' video(s) nesta copia (listados abaixo).\n' +
  semVideo.map(v => '  - ' + v).join('\n') + '\nEsses vao tentar o YouTube e aí precisam de internet.\n'
  : 'Todos os videos estao aqui. Nada precisa de rede.\n'}
NAO abra o index.html com dois cliques. Sem o servidor acima as FONTES do projeto sao
bloqueadas pelo navegador e o texto muda de aparencia. O atalho resolve isso.

MODO APRESENTACAO: o botao redondo no canto superior direito. Passa com as setas, PageUp/
PageDown, espaco ou com o passador de slide. Setas para os lados e para baixo funcionam igual.
`;
fs.writeFileSync(path.join(DESTINO, 'LEIA-ME.txt'), LEIA);

/* ---- relatorio ---- */
const mb = bytes / 1048576;
console.log('\n  ' + '-'.repeat(58));
console.log('  arquivos copiados: ' + arquivos.toLocaleString('pt-BR'));
console.log('  tamanho:           ' + (mb >= 1024 ? (mb / 1024).toFixed(2) + ' GB' : mb.toFixed(0) + ' MB'));
console.log('  mais: servidor.js, os dois atalhos e o LEIA-ME.txt');
console.log('\n  FORA do pacote, de proposito: .git, .claude, .github, .githooks,');
console.log('  os .md da raiz e os masters de assets/img/Banner proximo evento.');

if (faltaram.length) {
  console.log('\n  ATENCAO — nao encontrei no projeto: ' + faltaram.join(', '));
}
console.log('\n  Videos que o codigo procura no disco:');
querVideo.forEach(rel => {
  console.log('    ' + (semVideo.indexOf(rel) < 0 ? 'OK    ' : 'FALTA ') + rel);
});
if (semVideo.length) {
  console.log('\n  Os que faltam vao tentar o YouTube — nesses, o pacote PRECISA de internet.');
  console.log('  Para fechar: ponha o arquivo em assets/video/ com o nome exato e rode de novo.');
} else {
  console.log('\n  Nenhum video faltando: este pacote apresenta sem internet.');
}
console.log('\n  Agora compacte a pasta e mande o arquivo para quem vai apresentar.\n');
