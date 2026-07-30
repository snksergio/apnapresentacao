#!/usr/bin/env node
/* revisar.js — verificador de padrões deste projeto.
   Pega, NA HORA, os erros que já quebraram este site antes. Cada regra abaixo existe porque
   o problema realmente aconteceu — não são boas práticas genéricas.

   Uso:  node .claude/scripts/revisar.js [arquivo ...]     (sem argumento = todos os relevantes)
   Saída: lista de achados. Código 1 se houver ERRO, 0 se só houver avisos.

   É chamado automaticamente pelo hook PostToolUse depois de cada edição. */

const fs = require('fs');
const path = require('path');

const ERRO = 'ERRO', AVISO = 'AVISO';
const achados = [];
const add = (nivel, arq, linha, regra, msg) => achados.push({ nivel, arq, linha, regra, msg });

/* ---------- regras por linha ---------- */
const REGRAS = [
  {
    nome: 'lazy-sem-dimensoes',
    nivel: AVISO,   /* aviso, nao erro: o projeto tem muitos casos que funcionam. So quebra quando
                       o container tira a altura da imagem — mas ai quebra de forma invisivel. */
    testa: l => /<img\b/.test(l) && /loading\s*=\s*["']lazy/.test(l) && !(/\bwidth\s*=/.test(l) && /\bheight\s*=/.test(l)),
    msg: 'img com loading="lazy" SEM width/height. PERIGOSO se o container for absolute e tirar a altura da imagem (img{height:auto}): caixa de altura 0 -> o navegador nunca a considera perto da tela -> nunca carrega -> invisivel para sempre, sem erro (foi o que apagou o bg de moedas dos planos). Em TODOS os casos, declarar width/height tambem evita salto de layout (CLS). Se voce esta criando esta img agora, declare.'
  },
  {
    nome: 'anima-layout',
    nivel: ERRO,
    testa: l => /gsap\.(to|from|fromTo|set)\s*\(/.test(l) && /\b(width|height|top|left|marginTop|marginLeft)\s*:/.test(l) && !/\/\*/.test(l),
    msg: 'animacao de propriedade de LAYOUT (width/height/top/left). Recalcula layout a cada quadro e trava em maquina fraca. Use apenas opacity e transform (x/y/scale).'
  },
  {
    nome: 'terceiros',
    nivel: ERRO,
    testa: l => /(https?:)?\/\/(fonts\.googleapis|fonts\.gstatic|cdn\.|unpkg|jsdelivr|cdnjs|googletagmanager|google-analytics|facebook\.net|placehold|unsplash|pexels)/.test(l),
    msg: 'referencia a terceiro. Este projeto e 100% autoral e offline-first: nada de CDN, fonte externa, imagem de banco ou script de terceiro. Ver DESIGN.md.'
  },
  {
    nome: 'fonte-nova',
    nivel: AVISO,
    testa: l => /font-family\s*:/.test(l) && !/Inter Display|Inter|inherit|sans-serif|monospace|var\(/.test(l),
    msg: 'font-family fora do padrao. O projeto usa somente Inter Display (2 arquivos locais em assets/fonts). Ver DESIGN.md.'
  },
  {
    nome: 'scrollTop-por-quadro',
    nivel: AVISO,
    testa: l => /(smoother|smr|s)\s*\.\s*scrollTop\s*\(/.test(l) && /onUpdate|requestAnimationFrame|ticker|setInterval/.test(l),
    msg: 'escrita de smoother.scrollTop() dentro de callback por quadro. Isso DESSINCRONIZA o ScrollSmoother: depois disso o scrollTo do menu move a barra e o conteudo nao anima. Empurre o scroll NATIVO (window.scrollTo).'
  },
  {
    nome: 'progress-suprime-callback',
    nivel: AVISO,
    testa: l => /\.progress\s*\(\s*1\s*\)/.test(l),
    msg: 'progress(1) SUPRIME callbacks no GSAP. Se algum onComplete dispara algo importante (revelar elemento, liberar scroll), ele sera pulado silenciosamente.'
  },
  {
    nome: 'blend-tela-cheia',
    nivel: AVISO,
    testa: l => /mix-blend-mode\s*:\s*(screen|soft-light|overlay|hard-light|color-dodge)/.test(l),
    msg: 'mix-blend-mode em camada possivelmente de tela cheia: a GPU rele os pixels de baixo e reescreve a tela por quadro. Se o gradiente for estatico e estiver sobre video, asse no arquivo (ver ativos-guardian).'
  },
  {
    nome: 'video-sem-atributos',
    nivel: AVISO,
    testa: l => /<video\b/.test(l) && !(/\bmuted\b/.test(l) && /\bplaysinline\b/.test(l)),
    msg: 'video sem muted e/ou playsinline. Sem os dois o autoplay e bloqueado (principalmente iOS).'
  },
  {
    nome: 'will-change-solto',
    nivel: AVISO,
    testa: l => /will-change\s*:/.test(l) && !/transform|opacity|auto/.test(l),
    msg: 'will-change em propriedade que nao seja transform/opacity gasta memoria de GPU sem ganho.'
  },
  {
    nome: 'sem-reduced-motion',
    nivel: AVISO,
    testa: (l, i, todas) => /ScrollTrigger\.create\s*\(/.test(l) && !todas.some(x => /prefers-reduced-motion/.test(x)),
    msg: 'arquivo cria ScrollTrigger mas nao menciona prefers-reduced-motion em nenhum lugar. Acessibilidade: respeite quem pediu menos movimento.'
  }
];

/* ---------- schema.org / JSON-LD ---------- */
/* Existe porque schema que DISCORDA da pagina e pior que schema nenhum: ele mente para o
   Google em silencio -- sem erro no console, sem nada quebrado na tela, sem ninguem notar
   por meses. Foi o risco assumido em 2026-07-30 ao gerar Service/FAQPage das 7 paginas de
   produto a partir do HTML delas: os dados batiam no dia, mas nada obrigava a continuarem
   batendo. Estas checagens sao essa rede. Se alguem trocar um titulo, uma descricao ou uma
   pergunta da FAQ e esquecer o bloco, reclama na hora da edicao. */
const PLACEHOLDERS = ['NOME-DO-ARQUIVO', 'Conexao NOME', 'DESCRICAO DA PAGINA'];
const PROIBIDOS = ['aggregateRating', 'review', 'ratingValue', 'price', 'offers'];

const textoLimpo = h => String(h)
  .replace(/<span class="pl">[^<]*<\/span>/g, '')   /* o "+" decorativo do <summary> */
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

/* ---------- datas: dateModified x sitemap x git ----------
   A data e escrita a mao no arquivo e nao se atualiza sozinha. Sem conferencia, basta
   alguem mexer no conteudo e esquecer para que a pagina passe a declarar uma data falsa --
   em silencio, como todo o resto desta familia de problemas. E frescor mentido nao e
   inofensivo: mecanismos de busca comparam versoes da pagina entre visitas e descontam
   quem finge. Duas fontes de verdade independentes: o sitemap.xml e o proprio historico. */
let _sitemap;
function lastmodDoSitemap(url) {
  if (_sitemap === undefined) {
    try { _sitemap = fs.readFileSync('sitemap.xml', 'utf8').replace(/<!--[\s\S]*?-->/g, ''); }
    catch (e) { _sitemap = ''; }        /* rodando fora da raiz: nao confere, nao inventa */
  }
  if (!_sitemap) return undefined;
  const escapada = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = _sitemap.match(new RegExp('<loc>\\s*' + escapada + '\\s*</loc>[\\s\\S]*?<lastmod>\\s*([^<]+?)\\s*</lastmod>'));
  return m ? m[1] : null;               /* null = a URL nao esta no sitemap */
}

/* Um unico `git log` para todos os arquivos, e nao um por arquivo: o hook roda o revisar a
   cada edicao, e 9 chamadas de git a cada tecla seria lento o bastante para alguem desligar
   o hook -- e hook desligado nao previne nada. Como o log vem do mais novo para o mais
   velho, a PRIMEIRA vez que um nome aparece ja e a data mais recente dele. */
let _datasGit;
function dataDoGit(arq) {
  if (_datasGit === undefined) {
    _datasGit = {};
    try {
      const saida = require('child_process').execSync(
        'git log --date=short --format=D:%ad --name-only -n 500',
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 24 });
      let d = null;
      for (const l of saida.split(/\r?\n/)) {
        if (l.startsWith('D:')) { d = l.slice(2).trim(); continue; }
        const nome = l.trim();
        if (nome && d && !(nome in _datasGit)) _datasGit[nome] = d;
      }
    } catch (e) { _datasGit = {}; }     /* sem git (zip, clone raso): nao confere, nao quebra */
  }
  return _datasGit[String(arq).replace(/\\/g, '/')];
}

/* Nao precisa saber se e o template: a excecao dele cai naturalmente do canonical, que la
   e um marcador em MAIUSCULAS e por isso nunca estara no sitemap. */
function confereData(arq, linha, tipo, data, canonical) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(data)) {
    add(ERRO, arq, linha, 'schema-data-invalida',
      tipo + '.dateModified = "' + data + '" nao esta em AAAA-MM-DD. Formato fora do padrao pode ser simplesmente ignorado pelo buscador.');
    return;
  }
  const soDia = data.slice(0, 10);

  /* 1) contra o sitemap.xml, que declara a mesma coisa em outro arquivo */
  if (canonical && !PLACEHOLDERS.some(p => canonical.includes(p))) {
    const lm = lastmodDoSitemap(canonical);
    if (lm === null) add(AVISO, arq, linha, 'schema-data-fora-do-sitemap',
      'esta pagina declara dateModified mas o canonical (' + canonical + ') nao aparece em nenhum <loc> do sitemap.xml, entao nao da para conferir. Pagina nova que esqueceram de acrescentar ao sitemap?');
    else if (lm !== undefined && lm.slice(0, 10) !== soDia) add(ERRO, arq, linha, 'schema-data-diverge',
      tipo + '.dateModified diz ' + soDia + ' e o <lastmod> desta pagina no sitemap.xml diz ' + lm + '. Os dois descrevem a MESMA coisa e tem de dizer a mesma data.');
  }

  /* 2) contra o historico: quando o arquivo mudou de verdade pela ultima vez */
  const git = dataDoGit(arq);
  if (!git) return;
  if (git > soDia) add(ERRO, arq, linha, 'schema-data-diverge',
    'o arquivo foi alterado em ' + git + ' (ultimo commit) mas ' + tipo + '.dateModified ainda diz ' + soDia + '. Mudou o conteudo e a data ficou para tras — atualize as duas, aqui e no <lastmod> do sitemap.xml.');
  else if (git < soDia) add(AVISO, arq, linha, 'schema-data-adiantada',
    tipo + '.dateModified diz ' + soDia + ' mas o ultimo commit deste arquivo e de ' + git + '. Se nao houve mudanca real de conteudo, isso e frescor cosmetico — buscadores comparam versoes da pagina entre visitas e descontam. Se houve, commite antes de confiar na data.');
}

function checaSchema(arq, txt) {
  const blocos = txt.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  if (!blocos.length) return;
  /* o template usa marcadores em MAIUSCULAS de proposito; numa pagina real eles sao bug */
  const ehTemplate = /template\.html$/.test(arq);
  const linha = txt.slice(0, txt.indexOf('application/ld+json')).split(/\r?\n/).length;

  const pega = re => { const m = txt.match(re); return m ? textoLimpo(m[1]) : null; };
  const titulo = (pega(/<title>([^<]*)<\/title>/) || '').replace(/\s*—\s*iGreen\s*$/, '');
  const descricao = pega(/<meta name="description" content="([^"]*)"/);
  const canonical = (txt.match(/<link rel="canonical" href="([^"]*)"/) || [, null])[1];
  const faq = txt.indexOf('id="faq"') >= 0 ? textoLimpo(txt.slice(txt.indexOf('id="faq"'))) : '';

  const ehPlaceholder = v => PLACEHOLDERS.some(p => String(v).includes(p));
  const confere = (valor, esperado, campo) => {
    if (valor == null || esperado == null) return;
    if (ehPlaceholder(valor)) {
      if (!ehTemplate) add(ERRO, arq, linha, 'schema-placeholder-em-pagina-real',
        campo + ' ainda esta com o marcador do template ("' + valor + '"). Pagina duplicada e o bloco JSON-LD nao foi trocado — o Google le o marcador como se fosse o nome real.');
      return;
    }
    if (valor !== esperado) add(ERRO, arq, linha, 'schema-diverge-da-pagina',
      campo + ' nao bate com a pagina. schema: "' + String(valor).slice(0, 55) + '" / pagina: "' + String(esperado).slice(0, 55) + '". Atualize o bloco JSON-LD junto com o texto.');
  };

  for (const bloco of blocos) {
    const cru = bloco.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    let dados;
    try { dados = JSON.parse(cru); }
    catch (e) {
      add(ERRO, arq, linha, 'schema-json-invalido',
        'o bloco JSON-LD nao e JSON valido (' + e.message + '). O Google descarta o bloco inteiro sem avisar ninguem.');
      continue;
    }
    PROIBIDOS.forEach(k => {
      if (new RegExp('"' + k + '"').test(JSON.stringify(dados)))
        add(ERRO, arq, linha, 'schema-campo-inventado',
          'campo "' + k + '" no JSON-LD. Aqui so se declara fato simples que existe na pagina: nota, review e preco nao existem neste site, e dado inventado em rich result e penalizado pelo Google.');
    });

    for (const it of (dados['@graph'] || [dados])) {
      if (it['@type'] === 'Service') {
        confere(it.name, titulo, 'Service.name');
        confere(it.description, descricao, 'Service.description');
        confere(it.url, canonical, 'Service.url');
      }
      if (it['@type'] === 'FAQPage') {
        confere(it.url, canonical, 'FAQPage.url');
        if (!ehTemplate) (it.mainEntity || []).forEach(q => {
          const p = textoLimpo(q.name || ''), r = textoLimpo((q.acceptedAnswer || {}).text || '');
          if (p && !faq.includes(p)) add(ERRO, arq, linha, 'schema-diverge-da-pagina',
            'pergunta do FAQPage nao existe na secao #faq: "' + p.slice(0, 55) + '". Ou a pergunta mudou na pagina, ou o bloco ficou para tras.');
          else if (r && !faq.includes(r)) add(ERRO, arq, linha, 'schema-diverge-da-pagina',
            'resposta do FAQPage nao existe na pagina, para a pergunta "' + p.slice(0, 45) + '".');
        });
      }
      /* Exige href="..." e nao um includes solto: o proprio bloco JSON-LD faz parte do
         arquivo, entao procurar a URL no texto inteiro sempre acha ela mesma e a regra
         nunca dispara. Descoberto testando a regra de proposito com um link trocado. */
      if (it['@type'] === 'Organization') (it.sameAs || []).forEach(u => {
        if (!txt.includes('href="' + u + '"')) add(ERRO, arq, linha, 'schema-diverge-da-pagina',
          'sameAs "' + u + '" nao aparece em nenhum href desta pagina. Rede social trocada no rodape e esquecida no schema?');
      });
      if (it.dateModified) confereData(arq, linha, it['@type'], it.dateModified, canonical);
    }
  }
}

/* ---------- checagens de arquivo inteiro ---------- */
function checaArquivoInteiro(arq, txt) {
  if (/\.html$/.test(arq)) {
    const imgs = txt.match(/<img\b[^>]*>/g) || [];
    const semAlt = imgs.filter(t => !/\balt\s*=/.test(t)).length;
    if (semAlt) add(AVISO, arq, 0, 'img-sem-alt', semAlt + ' <img> sem atributo alt. Use alt="" se for decorativa — mas declare.');

    const semLazy = imgs.filter(t => !/loading\s*=/.test(t) && !/fetchpriority/.test(t)).length;
    if (semLazy > 2) add(AVISO, arq, 0, 'muitas-img-sem-lazy', semLazy + ' <img> sem loading nem fetchpriority. O que nao aparece no primeiro quadro deve ser lazy.');

    checaSchema(arq, txt);
  }
}

/* ---------- execucao ---------- */
const RAIZ = process.cwd();
let alvos = process.argv.slice(2).filter(a => fs.existsSync(a));
if (!alvos.length) {
  alvos = ['index.html'];
  ['js', 'produtos'].forEach(d => {
    if (!fs.existsSync(d)) return;
    fs.readdirSync(d).forEach(f => { if (/\.(js|html)$/.test(f)) alvos.push(path.join(d, f)); });
  });
}
alvos = alvos.filter(a => !/legados|node_modules|\.claude[\\/]scripts/.test(a));

for (const arq of alvos) {
  let txt; try { txt = fs.readFileSync(arq, 'utf8'); } catch (e) { continue; }
  const linhas = txt.split(/\r?\n/);
  linhas.forEach((l, i) => {
    if (/^\s*(\/\*|\*|\/\/|<!--)/.test(l)) return;         // ignora comentario
    for (const r of REGRAS) {
      try { if (r.testa(l, i, linhas)) add(r.nivel, arq, i + 1, r.nome, r.msg); } catch (e) {}
    }
  });
  checaArquivoInteiro(arq, txt);
}

const erros = achados.filter(a => a.nivel === ERRO);
const avisos = achados.filter(a => a.nivel === AVISO);

if (!achados.length) {
  console.log('revisar: nenhum achado nos padroes do projeto (' + alvos.length + ' arquivo(s)).');
  process.exit(0);
}
/* Agrupa por REGRA e mostra no maximo 3 exemplos de cada. Uma lista de 76 achados identicos
   faz qualquer pessoa ignorar a ferramenta — e uma ferramenta ignorada nao previne nada. */
function relata(titulo, lista) {
  if (!lista.length) return;
  console.log('\n=== ' + titulo + ' ===');
  const porRegra = {};
  lista.forEach(a => { (porRegra[a.regra] = porRegra[a.regra] || []).push(a); });
  Object.keys(porRegra).forEach(regra => {
    const g = porRegra[regra];
    console.log('\n* ' + regra + '  (' + g.length + ' ocorrencia' + (g.length > 1 ? 's' : '') + ')');
    console.log('  ' + g[0].msg);
    console.log('  onde: ' + g.slice(0, 3).map(a => a.arq + ':' + a.linha).join(', ') +
      (g.length > 3 ? ' ... e mais ' + (g.length - 3) : ''));
  });
}
relata('ERROS — corrija antes de entregar', erros);
relata('AVISOS — confirme se e intencional', avisos);
console.log('\nresumo: ' + erros.length + ' erro(s), ' + avisos.length + ' aviso(s) em ' + alvos.length + ' arquivo(s).');
console.log('Detalhes de cada regra: .claude/agents/ e .claude/CLAUDE.md\n');
process.exit(erros.length ? 1 : 0);
