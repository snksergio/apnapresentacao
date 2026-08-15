#!/usr/bin/env node
/* Roda no momento do commit (hook PreToolUse). NAO bloqueia — avisa.
   Verifica o que costuma ser esquecido justamente na hora de fechar o trabalho.
   Uso: node .claude/scripts/antes-de-commitar.js */

const { execFileSync } = require('child_process');
const fs = require('fs');

/* ============================================================================
   ⚠ NUNCA VOLTE A EXECUTAR COMANDO COMO STRING AQUI — era command injection, e ATIVA
   ----------------------------------------------------------------------------
   Achado numa varredura de seguranca da equipe da org em 2026-08-14, antes de publicar o
   repositorio. Este arquivo montava o comando concatenando NOME DE ARQUIVO numa string e
   entregava ao shell. Um arquivo chamado `produtos/a$(comando).html` executaria codigo na
   maquina de quem commitasse — e este script roda AUTOMATICAMENTE, pelo hook de PreToolUse do
   .claude/settings.json. Bastava um PR trazendo um arquivo com nome malicioso.

   ⚠ E NAO ERA TEORICO, NEM PRECISAVA DE MA-FE: o repositorio JA TEM nomes com espaco e acento
   (`Ribeirao Preto.jpg`, `Sao Luis.jpg`, `Belem.jpg`). Concatenados sem aspas, o shell os
   parte em varios argumentos e o `git diff` olhava o arquivo errado — ou nenhum. Ou seja, o
   verificador vinha dando resposta silenciosamente ERRADA justamente para os arquivos de nome
   composto, e ninguem notava porque ele "nao acusava nada".

   A CORRECAO: `execFileSync(programa, [args])`. Sem shell no meio, cada item do array e UM
   argumento, e nome com espaco, acento, cifrao ou ponto-e-virgula viaja intacto.
   `git()` para os comandos do git e `node()` para chamar outro script — os dois unicos
   programas que este arquivo executa.
   ============================================================================ */
const run = (exe, args) => {
  try { return execFileSync(exe, args, { encoding: 'utf8' }).trim(); }
  catch (e) { return ''; }
};
const git  = (...args) => run('git', args);
const node = (...args) => run(process.execPath, args);

/* Quais arquivos entram NESTE commit.
   Regra: normalmente e o que esta staged. Mas `git commit -a` tambem leva os
   modificados sem stage — e ai olhar so o staged deixava passar alteracao do
   site sem aviso. Recebe o comando como argumento para decidir. */
const cmdGit = process.argv[2] || '';
const staged = git('diff','--cached','--name-only').split('\n').filter(Boolean);
const modif = git('diff','--name-only').split('\n').filter(Boolean);
let arq = staged;
if (/\s-(?:[a-zA-Z]*a[a-zA-Z]*)\b|--all\b/.test(cmdGit)) arq = [...new Set([...staged, ...modif])];
else if (!staged.length) arq = modif; // nada staged: a intencao e commitar o que esta ai
if (!arq.length) process.exit(0);

const avisos = [];
const site = arq.filter(f => /^(index\.html|produtos\/.*\.html|js\/.*\.js|css\/.*\.css)$/.test(f));
const mapas = arq.filter(f => f.startsWith('.claude/mapas/'));

/* 1) mexeu no site e nao atualizou mapa nenhum */
if (site.length && !mapas.length) {
  avisos.push('Voce alterou ' + site.length + ' arquivo(s) do site e NENHUM mapa em .claude/mapas/.\n' +
    '     Se mudou contagem, rotulo, icone, CTA ou estrutura de secao, o mapa precisa ser atualizado\n' +
    '     NO MESMO COMMIT — mapa velho faz o proximo confiar num numero que nao existe.\n' +
    '     Se a mudanca nao afeta nenhum mapa (ex.: so cor ou texto solto), ignore este aviso.');
}

/* 2) numero visivel trocado sem olhar os contadores animados */
const idx = arq.includes('index.html') ? git('diff','--cached','-U0','index.html') || git('diff','-U0','index.html') : '';
if (/^[+-].*\b\d{2,3} mil\b/m.test(idx) && !/data-(target|cnum)/.test(idx)) {
  avisos.push('Voce mudou um numero em texto ("N mil") mas nao tocou em data-target/data-cnum.\n' +
    '     Esses atributos guardam o MESMO numero e sao o que anima subindo na tela. O site pode\n' +
    '     mostrar o valor novo e animar ate o antigo. Procure: grep -n "data-target\\|data-cnum" index.html');
}

/* 3) href novo para ancora — o ID existe? */
const todos = arq.filter(f => /\.html$/.test(f));
for (const f of todos) {
  const d = git('diff','--cached','-U0','--',f) || git('diff','-U0','--',f);
  for (const m of d.matchAll(/^\+.*href="#([A-Za-z][\w-]*)"/gm)) {
    const id = m[1];
    let html = ''; try { html = fs.readFileSync(f, 'utf8'); } catch (e) {}
    if (html && !html.includes('id="' + id + '"')) {
      avisos.push('Em ' + f + ' ha href="#' + id + '" mas NAO existe id="' + id + '" no arquivo.\n' +
        '     Ancora para ID inexistente falha em SILENCIO: sem erro no console, o botao so nao faz nada.');
    }
  }
}

/* 4) mexeu num js/css externo e NAO subiu o ?v= das URLs?
   Isto existe porque aconteceu (2026-08-04): o dono viu "a ordem das viagens errada SO no modo
   apresentacao, no clique ta ok". Reproduzido — o navegador dele tinha o js/presentation-mode.js
   ANTIGO em cache com o index.html novo: o pin GESTOR abria cruzeiro, EXECUTIVO abria a neve,
   DIRETOR abria Europa, e o Senior abria uma galeria que nao deveria ter. O clique acertava porque
   esse caminho e inline no index; a apresentacao vem do arquivo externo. Nenhuma URL local tinha
   versao, entao o navegador reaproveitou a copia velha — sem erro nenhum no console.
   Um arquivo externo que muda de CONTEUDO tem de mudar de URL, senao o cache decide por voce. */
const ext = arq.filter(f => /^(js|css)\/.*\.(js|css)$/.test(f));
if (ext.length) {
  const html = ['index.html'].concat(
    fs.existsSync('produtos') ? fs.readdirSync('produtos').filter(f => f.endsWith('.html')).map(f => 'produtos/' + f) : []
  ).filter(f => fs.existsSync(f));
  /* a versao em uso hoje, lida do proprio HTML */
  const versoes = new Set();
  let semVersao = 0;
  /* exige src=/href= e as aspas: sem isso conta tambem as MENCOES em comentario
     ("o IntersectionObserver do js/video-inview.js, que...") e o aviso sai falso — testado. */
  for (const f of html) {
    const t = fs.readFileSync(f, 'utf8');
    const re = /(?:src|href)\s*=\s*(['"])((?:\.\.\/)?(?:js|css)\/[a-z0-9-]+\.(?:js|css))(\?v=([0-9]+))?\1/g;
    let m;
    while ((m = re.exec(t))) { if (m[4]) versoes.add(m[4]); else semVersao++; }
  }
  if (semVersao) {
    avisos.push('Ha ' + semVersao + ' URL(s) de js/css SEM ?v= nos HTML.\n' +
      '     Arquivo externo sem versao na URL fica preso no cache do navegador: o visitante roda\n' +
      '     codigo velho com HTML novo, e nao aparece erro nenhum. Rode o versionador ou adicione\n' +
      '     ?v=<data> a mao.');
  }
  /* o ?v= mudou neste commit? */
  const diffHtml = git('diff','--cached','-U0','--','index.html','produtos') || git('diff','-U0','--','index.html','produtos');
  if (!/^\+.*\?v=/m.test(diffHtml)) {
    avisos.push('Voce alterou ' + ext.length + ' arquivo(s) em js/ ou css/ e NAO subiu o ?v= das URLs\n' +
      '     nos HTML (versao atual: ' + (Array.from(versoes).join(', ') || 'nenhuma') + ').\n' +
      '     Sem trocar a URL, quem ja visitou o site continua rodando a versao antiga desse arquivo.\n' +
      '     Foi assim que "a ordem das viagens" ficou errada so no modo apresentacao.');
  }
}

/* 4b) ARTE SOBRESCRITA COM O MESMO NOME e o VER das galerias nao subiu?
   ---------------------------------------------------------------------------
   Esta regra existe por um defeito real de 2026-08-12. O dono viu, na galeria da Conexao
   Green, um slide que NAO EXISTE MAIS ("TOP 3 CONEXAO GREEN"). Medido: o arquivo no disco e
   no commit tinham o mesmo md5, e o do deck ANTIGO tinha outro — ou seja, o site estava
   certo e o NAVEGADOR DELE servia a copia velha.

   Por que so com algumas artes: o netlify.toml guarda /assets/* por UM DIA, de proposito
   (arte aqui e SOBRESCRITA com o mesmo nome, entao cache eterno seria pior). Mas um dia ja
   basta para o dono reexportar, subir e continuar vendo o antigo. Naquele dia QUATRO artes
   foram sobrescritas mantendo o nome e as quatro tinham o problema.

   O item (4) acima ja cobria isso para js/css. Esta cobre para IMAGEM: se um arquivo de
   assets/img/ foi MODIFICADO (nao adicionado — nome novo ja e URL nova) e o `VER` das
   galerias nao mudou no mesmo commit, avisa. */
const artesMod = git('diff','--cached','--name-only','--diff-filter=M','--','assets/img')
  .split('\n').filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f));
if (artesMod.length) {
  const jsGaleria = ['js/ecossistema-galeria.js', 'js/mapa-summit.js'].filter(f => fs.existsSync(f));
  const diffGal = jsGaleria.length
    ? git('diff','--cached','-U0','--',...jsGaleria) || git('diff','-U0','--',...jsGaleria)
    : '';
  if (!/^\+\s*var VER\s*=/m.test(diffGal)) {
    avisos.push(artesMod.length + ' arte(s) foram SOBRESCRITAS com o mesmo nome e o `VER` das\n' +
      '     galerias NAO subiu. O netlify.toml guarda /assets/* por 1 dia: quem ja viu a arte\n' +
      '     antiga continua vendo ela, so no navegador dele, sem erro nenhum.\n' +
      '     Suba o `var VER` em js/ecossistema-galeria.js e/ou js/mapa-summit.js.\n' +
      '     Arquivos: ' + artesMod.slice(0, 4).join(', ') + (artesMod.length > 4 ? ' ...' : ''));
  }
}

/* 5) o verificador de padroes passa? */
const rev = node('.claude/scripts/revisar.js');
const mErr = rev.match(/(\d+) erro\(s\)/);
if (mErr && +mErr[1] > 0) {
  avisos.push('O revisar.js encontrou ' + mErr[1] + ' ERRO(S). Rode e corrija antes de commitar:\n' +
    '     node .claude/scripts/revisar.js');
}

if (!avisos.length) { console.error('antes-de-commitar: nada a apontar.'); process.exit(0); }

console.error('\n=== ANTES DE COMMITAR — ' + avisos.length + ' ponto(s) para conferir ===');
avisos.forEach((a, i) => console.error('\n  ' + (i + 1) + ') ' + a));
console.error('\n  (avisos, nao bloqueios. Confirme se sao intencionais e siga.)\n');
process.exit(0);
