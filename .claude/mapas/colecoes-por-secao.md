# Mapa das coleções, seção por seção

> ⚠ **A seção do MAPA DO SUMMIT foi removida deste projeto** (pedido do dono: partir do
> ROYAIS-APN e tirar o mapa por completo). Saíram a `<section id="summit">`, o
> `<style id="summit-estilo">`, o `js/mapa-summit.js`, as 23 imagens de `assets/img/summit/`
> (9 MB), a entrada dela no `presentation-mode.js` e a 3ª tela do carrossel dos Destaques.
> As seções deste mapa que descreviam a construção do Summit foram apagadas junto. **Entradas
> antigas ainda podem citar `#summit` de passagem** — em medições de desempenho e de versionamento
> feitas quando ela existia. São registros datados, não instruções: os números daquelas linhas
> (paradas totais, contagem de URLs) valiam com o mapa no ar e não valem mais.

Referência do `colecoes-guardian`. Toda seção desta landing tem uma lista, e cada uma esconde acoplamentos próprios. Contagens medidas em 2026-07-26 — **confirme antes de usar**, elas mudam.

## Como levantar o inventário de qualquer coleção

Antes de mexer, rode isto trocando o seletor. Não presuma o nome: confirme no HTML.

```bash
grep -c 'class="SELETOR' index.html                    # quantos itens hoje
grep -o 'nth-child([0-9]*)' index.html | sort | uniq -c # animação por índice
grep -n '\.g[0-9]{\|SNAPS\|CARO' index.html js/presentation-mode.js   # posição/parada fixa
grep -n "sel:'#SECAO'" -A12 js/presentation-mode.js    # como a apresentação trata a seção
```

O último é o mais importante: mostra se a seção usa `subs`, `buildStops` ou `frame` — e é isso que decide se a quantidade de itens muda o número de paradas.

---

## Hero — 4 KPIs no carrossel (`.kpi` / `.ktx`)

Estado em 2026-07-30: `+800 mil` · `5G Ultra Veloz` · `Zero Burocracia` · `Expansão`.
Cada KPI é `<button class="kpi" data-i="N" aria-label="...">` com um `<span class="kic">` (ícone SVG
inline) e um `<span class="ktx"><b>título</b><span data-m="copy curta do mobile">descrição</span>`.

Quatro coisas que só se descobrem mexendo:

1. **Só o KPI ATIVO tem largura.** Os inativos ficam com `width: 0`, então medir "texto cortado"
   (`scrollWidth > clientWidth`) num inativo dá **falso positivo**. Espere o carrossel colocá-lo em
   foco — ele gira a cada ~5,6s. Container tem ~533px; um KPI ativo ocupa 240–280px.
2. **O `aria-label` do botão descreve o conteúdo** e é o que o leitor de tela anuncia. Ao trocar o
   texto, troque o rótulo junto — um deles dizia "Tecnologia" muito depois do conteúdo ter mudado.
3. **O `data-m` é a copy curta do mobile**, que substitui a descrição em tela pequena. Trocar só a
   descrição deixa o celular mostrando a frase antiga.
4. **Os ícones SVG são compartilhados.** O ícone de cartão do 4º KPI aparecia **4 vezes** no
   `index.html`. Nunca substitua um `<path>`/`<rect>` de ícone por busca global — restrinja ao bloco
   daquele botão (localize por `data-i`).

O carrossel do hero também é o motivo pelo qual `.kpi` e `.kpis` ficam **excluídos** do comparador de
geometria: o KPI ativo expande de 72 para ~300px sozinho, gerando diferença sem mudança de código.

## Trajetória — 7 `.jitem`
Estado em 2026-08-03: Origem (2021) · Marco Histórico (2023) · Expansão e Telecom (2024) · A maior do Setor (2025) · Dominação Global (2026) · **Expansão Internacional (2026)** · **Parceria Estratégica (2026)** — os dois últimos entraram nesta data. **Três cards marcam 2026**: o dono não informou o ano dos dois novos e a linha já terminava em 2026; confirmar com ele.

O lado **alterna** por item via `.jl`/`.jr` (esq/dir). Ao inserir no fim, continue a alternância — não há JS que corrija isso.

**Foto é OPCIONAL**: o `jcheck()` guarda com `if(ph)`, então item sem `.jphoto` aparece normal (é o caso de "A maior do Setor" e dos dois novos). Mas o **`.jyear` NÃO é opcional**: no mobile o `placeDots()` alinha o ponto da linha pela altura dele (`if(dot&&year)`) — item sem ano fica com o ponto solto no topo do card, sem erro nenhum.

A **curva SVG se estende sozinha**: `buildCurve()` gera o `d` amostrando uma senoide a cada 12px pela ALTURA do `.jwrap`, e os pontos derivam da posição real de cada item. Medido ao passar de 5 para 7 itens: caminho foi para 2569px de comprimento e cobre o último ponto (dot em Y 1940, fim em Y 2484). Não há lista de coordenadas para manter.

Cada item tem `.jcard`, `.jphoto` e `.jspark`. As fotos têm efeito CRT aplicado por JS que envolve a `<img>` (usa `img.closest('picture') || img` — se você trocar por `<picture>`, o efeito precisa continuar achando o elemento certo).

⚠ **O `end` do scrub é `bottom 90%`, e mudar isso quebra o último marco.** Era `bottom 62%` e o dono relatou: "no modo apresentação, quando chego na foto do Gusttavo Lima ele já desce de uma vez". Não era a apresentação descendo — **medido em 1955×1142** (tela alta), a parada dele pousava com o card em `[-345,-229]`, isto é **345px acima do topo da tela**. Causa raiz, e ela vale também para o site sem apresentação: o `jcheck` revela um marco quando a PONTA da curva passa o ponto dele, e com `end` em 62% a curva só terminava de crescer quando a base do `.jwrap` chegava a 62% da tela — em tela alta isso é muito scroll, e o último ponto só era alcançado depois de o card sair de cena (revelação em y≈6843 contra y≈6539, o último instante em que ele ainda caberia). Com 90% a curva fecha com a base do wrap mais baixa na tela. Verificado depois: 1955×1142 → o 7º card em `[888,1004]`, e **os 7 na tela e revelados**; 1229×600 → os 7 ok e a apresentação andando `Trajetória#0…#6 → Sede#0`.

**Por que eu não achei antes:** testei 1920×946, 1229×600 e mobile, e nas três o último marco aparecia. O defeito só existe a partir de ~1000px de ALTURA de viewport. Ao mexer nesta seção, inclua uma tela alta nas configurações de teste.

**Apresentação:** usa `trig:'.jwrap'` com `buildStops` que faz **busca binária ao longo do caminho SVG** (`fill.getPointAtLength`) para achar o progresso em que cada ponto aparece. Ou seja: as paradas **derivam do desenho**, não de uma lista fixa. Adicionar um ponto tende a funcionar sozinho — mas **valide**, porque o caminho SVG e o número de itens precisam continuar casados. Confirmado na prática em 2026-08-03: ao ir de 5 para 7 itens as paradas foram de 5 para 7 sem tocar em nada, e cada parada revela exatamente um card a mais.

Ao adicionar: o ponto no caminho SVG, o `.jitem` correspondente, e a foto tratada (`ativos-guardian`).

## Órbita — 7 `.fc` (cards) + mockup
**O ponto mais delicado do site.** Três acoplamentos:

1. **`SNAPS = [0, .26, .58, .93]`** — as 4 "vistas" da seção, fixas. Adicionar um substep exige acrescentar o valor aqui **e** os limiares de fase no `apply()` (`p-.02-i*.012` para entrada dos cards, `p-.2-i*.02` para saída, `rf` na virada de tela, `df` na fase download). Esses números são calibrados à mão.
2. **Escala em runtime** — `fitOrbita()` calcula o fator a partir da altura disponível, com piso 0.42, e o título acompanha o celular. Mexer no mockup (tamanho, altura do texto) muda esse cálculo. Ver `responsividade-guardian`.
3. **Snap manual** que escreve posição de scroll, com posse compartilhada (`autoAte`). Não crie um terceiro escritor sem respeitar a posse.

Editar o mockup: confira as 3 configs e o piso da escala. Adicionar substep: obrigatoriamente `apresentacao-guardian` depois.

## Ecossistema — 7 `.ecard`
**Um passo de apresentação por card** (`ecoCards()[k]`, `ecoStopIndexFor`), **mais um passo por página de fotos da galeria daquele card** desde 2026-08-10. Mudar a quantidade muda o número de paradas e a duração da apresentação inteira.

### Galeria de fotos por conexão (2026-08-10) — `js/ecossistema-galeria.js`
Pedido do dono: *"coloca esse pop up [o das graduações] e replica ela para o ecossistema... você clica na seta da apresentação, abre o pop up e vai passando as imagens; chega na última e ela volta, e com outro clique passa para a Conexão Green"*.

⚠ **O DECK JÁ FOI TROCADO DUAS VEZES.** Estado válido: **deck de 2026-08-12, 59 imagens** — ver a
seção "O DECK FOI TROCADO DE NOVO" no fim deste mapa. Os números 94, 27 e as faixas antigas que
aparecem abaixo são **história**, não o presente; estão mantidos porque o raciocínio deles ainda
ensina, mas **nenhum nome de arquivo citado antes de 2026-08-12 existe mais**.

- **O pop-up NÃO é um desenho novo:** ele usa `class="grad-modal eco-modal"` e herda todo o CSS da galeria das graduações (painel, fundo desfocado, grade de fotos, setas, bolinhas, responsivo de retrato). Sob `.eco-modal` mora só o miolo, que é o que difere — lá é logo do evento + pin + QR, aqui é etiqueta + nome da conexão + descrição + contador. **~20 linhas de CSS em vez de ~50 duplicadas.**
- **Nenhum texto foi copiado:** nome, etiqueta e descrição são lidos do **próprio cartão** no `index.html`, e o `slug` sai do `data-pt-href` (`produtos/conexaolivre.html` → `livre`). Renomear a conexão no cartão atualiza o pop-up sozinho.
- **UMA IMAGEM POR VEZ** (ajuste do dono no mesmo dia: *"deve ser 1 imagem por vez para exibição"*). A primeira versão era o mosaico de 8, cópia da galeria das graduações. Mudou porque **o que chegou não é foto de evento: são slides de apresentação** (720×405, 16:9, exportados de um deck de 100 slides). Slide tem texto — oito deles a 189px de largura seria ilegível. O pop-up virou um **visor**: um slide ocupando o painel, com `object-fit:contain` e **nunca cover**, porque cortar slide é cortar texto. `porPagina()` devolve 1 e continua sendo função — voltar ao mosaico é mudar aí, e contagem, contador e paradas acompanham.
- **Imagens:** `assets/img/ecossistema/<slug>/Slide<n>.jpeg`. Instruções para o dono em `assets/img/ecossistema/COMO-COLOCAR-AS-FOTOS.md`.
  - ⚠ **Os nomes são os do deck e ficam assim de propósito.** Renomear para `1..N` deixaria o código mais bonito e quebraria a única coisa que importa: **a ordem é a do deck**, e é ela que o dono chama de "linha cronológica". Mantendo o nome, ele reexporta e sobrescreve.
  - **As listas estão no `FOTOS`** do topo do arquivo, o único lugar a atualizar quando entrar ou sair imagem (navegador não lista pasta). ⚠ **REESCRITAS DE CIMA A BAIXO DUAS VEZES: às 18h de 2026-08-10 e de novo em 2026-08-12.** **Estado atual, medido no navegador (`IGREEN_ECO_GAL.paginas()`, não contando arquivo na pasta): Livre 6 · Green 10 · Placas 6 · Solar 4 · Telecom 13 · Seguros 13 · Expansão 7 = 59**, e a seção rende **73 paradas** (132 no total da página). ⚠ Este número mudou TRÊS VEZES em 12/08 (27 → 59 → 52 → 59). Ver, no fim deste mapa, "SETE SLIDES SAÍRAM" e "SETE ABERTURAS ENTRARAM". **As sete usam lista explícita** (`arquivos`); faixa `de`/`ate` não pode voltar porque o deck tem buracos (falta o 36 no Green e o 61 em Seguros).
  - **Duas formas de declarar, e o código aceita as duas** (`nomesDe()` normaliza): **faixa** `{de,ate}` para quem tem os nomes seguidos do deck, e **lista** `{arquivos:[...]}` para quem ganhou tela com nome próprio. A **Livre** virou lista em 2026-08-10: `Slide19..Slide24` + `Destaques1-livre`, `2` e `3`. A alternativa era renumerar os arquivos novos para Slide25-27 — números que já são do Green — ou seja, renomear arquivo do dono para caber num formato do código. **A ordem da lista é a ordem na tela**, e o `Slide24` fica ANTES dos três porque ele é a CAPA deles ("DESTAQUES CONEXÃO LIVRE") — conferido abrindo o arquivo, não pelo nome. ⚠ **Os slides 86 a 89 nunca entraram em pasta nenhuma.**
  - ⚠ **A CAPA DE CADA CONEXÃO SAIU DA GALERIA** (2026-08-10: *"retire esses slides"*, com as sete capas em anexo). Era sempre o **primeiro** slide da faixa — o de título, com "Conexão Livre" grande e a descrição. Repetia o que o pop-up já mostra no rodapé e o que o cartão da seção já diz. Por isso cada faixa começa um número depois do que o deck tinha.
    ⚠ **ISTO CADUCOU EM 2026-08-12 E A PASTA DE RESGATE NÃO EXISTE MAIS.** A frase original dizia que os arquivos estavam salvos em `assets/img/ecossistema/_capas/`. Medido em 2026-08-12: essa pasta **não está no disco** e **nunca foi versionada** (`git ls-files` não devolve nada com `capas`) — ela era só do disco do dono e foi embora com a troca do deck. Não é perda relevante: eram telas de título do deck dele, que ele tem no PowerPoint. Mas **não conte com `_capas` como backup**, porque não é um. O que o git realmente guarda são os 27 arquivos do deck anterior, recuperáveis em `git show 842756b:assets/img/ecossistema/...`.
  - Curiosidade útil: as paradas da seção continuaram **103**. Saíram 7 imagens e entraram 7 passos de "só fechar" — coincidência aritmética, não relação de causa.
  - Faixa com `de:0` = conexão sem imagem: **sem pop-up e sem parada**, mesmo critério do `GRAD_GAL_LEVELS`. Foi assim que a peça foi entregue antes das imagens chegarem, e nesse estado a apresentação tinha as mesmas 62 paradas de antes.
  - **Só `.jpeg`, e isso é proteção:** a galeria das graduações usa `<picture>` com avif+webp+jpg porque **os três existem** para toda foto dela. `<source>` apontando para arquivo inexistente **não** cai para o `<img>` — a imagem simplesmente não aparece. Conversão depois, nunca antes.
  - ⚠ **Os slides estão em 720×405 e o painel os desenha com 1442px** — ampliação de **2×**, texto com borda mole. Reexportar em 1920×1080 resolve; ficou registrado como pendência com o dono.
- **Custo no carregamento: ZERO.** Medido em carga limpa: **nenhuma** requisição de `/ecossistema/` e o `#ecoGalModal` nem existe no DOM até alguém abrir. Os **20MB das 59 imagens** (deck de 2026-08-12; eram 6,5MB em 27) só saem do disco uma por vez, e o `desenha()` **pré-carrega apenas a SEGUINTE** — ao fim da maior conexão, Seguros, terão sido baixados **16 slides ≈ 5,5MB, não os 59**. Quem abre uma conexão não paga pelas outras seis, e quem não abre nenhuma não paga nada. É por isso que 20MB na pasta **não** violam o orçamento de bytes do projeto: eles nunca entram no boot.
- **Trocar o `src` de um `<img>` que já existe**, em vez de recriar o nó a cada passo: o navegador mantém o quadro anterior desenhado até o novo estar pronto, e a troca não pisca. Recriando o nó existe um quadro com a caixa vazia, que numa tela de apresentação lê como falha.
- **Paradas:** cada card ganha uma ação que **FECHA** o pop-up, cada imagem é uma parada **no mesmo y do card**, e **depois da última imagem existe um passo só para fechar**. Esse último passo foi acrescentado em 2026-08-10, quando o dono relatou: *"quando é a última imagem, no modo apresentação ele volta de uma vez e já pula para o próximo, e isso não pode acontecer."* Antes, o clique que saía da última imagem fazia duas coisas no mesmo gesto — fechava o pop-up **e** movia o baralho para a conexão seguinte. Agora a volta e o pulo são dois cliques. Verificado ação por ação: `Livre 6/6 → ECOSSISTEMA (fecha, fica na Livre) → ECOSSISTEMA (card da Green) → Green 1/15`. Isso depende de o `activeStops.sort()` por y ser **estável**; dar outro y às imagens as jogaria para outro lugar da fila. Medido com as 96: Ecossistema 7 → **103** paradas, total 62 → **158**.
  - **Sequência verificada ação por ação** (sem depender da varredura): `livre/Slide22 (05) · livre/Slide23 (06) · livre/Slide24 (07) · CARD com pop-up fechado · green/Slide25 (01) · green/Slide26 (02)`. E os sete blocos batem com as pastas: 1 card + 7 · 16 · 11 · 6 · 24 · 21 · 11 imagens.
- ⚠ **A galeria NÃO trava o scroll quando a apresentação está ativa.** Fora dela a trava é obrigatória (senão a roda rola a página atrás do pop-up); dentro dela seria errado, e só nesta seção: as paradas do ecossistema estão em **alturas diferentes** (uma por card, ao longo do pin do baralho), então sair da última imagem para o card seguinte **precisa mover o scroll** — e a apresentação move escrevendo em `ScrollSmoother.scrollTop()`. Com o smoother pausado pela galeria, esse passo escreveria numa mecânica desligada. Regra de posse explícita, a mesma do `autoAte`/`igNavAte`. Nas graduações o problema não existe porque as 17 paradas de lá compartilham **um y só**.
  - **Isto não está medido, e é honesto dizer:** no pane automatizado a varredura do presentation-mode **não anda em nenhuma seção** — conferido no baseline, a Trajetória (7 paradas em alturas diferentes, código intocado) também fica parada, porque o tween depende de quadros reais e a janela oculta roda a 1 fps. Decisão por leitura de código; quem confirma é a tela do dono.
  - ⚠ **Armadilha de medição nova, custou duas rodadas:** com a bomba de quadros desligada entre chamadas, o tween da varredura congela no meio, o `activeTween` do presentation-mode **nunca zera**, e o `goNext` passa a engolir TODO clique seguinte (`if (activeTween) return`). O sintoma imita perfeitamente um bug de produto — "a apresentação morre na última imagem" — e não é. Antes de acusar travamento aqui, teste a Trajetória: se ela também não anda, é o ambiente.
- ⚠ **No retrato os seletores precisam das DUAS classes** (`.grad-modal.eco-modal`). O bloco mobile da galeria das graduações vem depois no arquivo e crava `height:min(84vh,640px)` no painel e `padding:54px 18px 50px` no slide; com seletor de mesma força ganha o último, e o último é o deles. Medido antes da correção: painel de **640px com 224px de conteúdo** (416 de vazio) e a seta pousando **300px abaixo do rodapé**. Depois: painel 246px, imagem 205 + rodapé 39, **2px de folga**, seta centrada na imagem.
- ⚠ **No mobile o X mora numa FAIXA acima da arte, não no canto dela** (2026-08-14). Sintoma do dono, com print: *"na versao mobile ficou o botao de fechar encima da escrita"* — o X caía sobre a caixa "Quanto mais portabilidades / MAIOR O BÔNUS POR VENDA" da arte do Telecom. A causa é o botão ter **40px fixos**: numa arte de 1444px (desktop) ele cobre 3% da largura e fica acima da caixa; numa de 365px (celular) cobre **11%** e cai dentro dela — medido a 390×844, de 0,846 a 0,956 da largura e de 0,078 a 0,273 da altura. **Encolher o botão não resolve**, porque a caixa ocupa todo o canto superior direito da arte; ele tem de sair da arte. E **não dá para empurrá-lo com `top` negativo**: o `.gm-panel` é `overflow:hidden` (é ele que arredonda os cantos da imagem) e o botão sumiria sem deixar rastro. Por isso o painel ganhou `padding-top:46px` no retrato, com o X de 32px dentro dessa faixa e a arte com `border-radius:0` no topo. ⚠ **A conta da largura mudou junto**: `calc((80vh - 52px) * 16/9)` virou `- 98px` (52 do rodapé + 46 da faixa) — ela existe para o painel não estourar a tela em paisagem, e esquecê-la devolve o painel maior que a janela no celular deitado. Verificado em 390×844, 320×568 e 844×390 (paisagem): botão **fora da arte** nas três, 5px de folga, painel inteiro dentro da tela, rodapé visível. Desktop 1920×946 **intocado**: `padding-top` 0, painel 1444×863, botão 40px, mesmo raio de canto.
- ⚠ **`sub` deixou de ser o número do card.** `ecoStopIndexFor(k)` procurava `sub===k`; com as paradas de foto no meio, isso cairia numa parada de FOTO. Agora existe `ecoSubDoCard(k)`, que soma 1 + páginas de cada card anterior. É o mesmo tipo de erro de "índice de uma coisa usado como índice de outra" que já abriu a galeria da qualificação vizinha.
- ⚠ **A seção tem DOIS endereços e a galeria precisa dos dois:** no desktop quem está na tela é o clone `#ecossistema2`, criado em runtime; **no celular o clone não existe** (aquele bloco sai antes por `matchMedia('(max-width:1024px)')`) e quem vale é o `#ecossistema` original. Procurar só pelo clone deixaria a galeria inexistente no celular, sem erro nenhum. E há **corrida**: o clone depende do GSAP, e foi **medido acontecendo** — numa carga a lista veio com os 7 cartões, na seguinte veio **vazia**. Por isso a lista é lida com preguiça e refeita enquanto estiver vazia (array vazio é *truthy*: guardar um vazio no cache mataria a galeria naquela carga) e o `window.ECO_GAL_CARDS` é **getter**, não valor congelado.
- **O clique no cartão voltou a fazer algo, e não roubou nada:** ele já não levava a lugar nenhum desde 2026-08-03 (o `page-transition.js` dá `preventDefault` e sai fora em qualquer href com `produtos/`). Onde a conexão tem foto, o clique abre a galeria; onde não tem, segue mudo como estava. Delegado no documento em fase de captura — listener por cartão perderia os cartões do clone, que são os que estão na tela no desktop.
- **O tint das fotos SAIU aqui** (`.eco-modal .gm-photo::after` sem `mix-blend-mode`). Nas graduações ele casa fotos de eventos diferentes com a cor da qualificação; no ecossistema a cor é a mesma verde nas sete, então ele não distinguia nada — só lavava a foto (blend `color` a 42%). E são 8 quadros por página: `mix-blend-mode` obriga a GPU a reler os pixels de baixo, que é o trabalho por quadro que engasga neste projeto. Ficou um degradê comum, custo zero.

Há uma constante de duração casada com a animação do deck: `CARO = 5` em `js/presentation-mode.js` (o comentário no código explica: `cp = (progress*D)/CARO_DUR`). Se você mexer no tempo do deck no `index.html`, as paradas por card saem de sincronia.

Cada card aponta para uma `produtos/conexao*.html` — card novo precisa de página nova (base: `produtos/template.html`).

**Cada card tem 4 `.emods li`.** Até 2026-08-04 o **Expansão** tinha só 3 e media **471px**, contra 510px dos vizinhos de mesma forma — 39px de degrau. Ao trocar o conteúdo dele (texto novo do dono) os itens foram para 4 e ele igualou.

### O que faz a altura de um card (medido a 1920×946, card de 346px, lista de 300px)
Três coisas somam, e **cada linha de texto a mais custa ~14px na lista e 19px na descrição**:

| peça | 1 linha | 2 linhas |
|---|---|---|
| `.emods li` (fonte 12,5px, padding 11px 2px) | 39px | 53px |
| descrição `<p>` | — | +19px por linha extra |

Alturas reais depois do pedido do dono de 2026-08-04 (expandir "+ Extra" para "+ Bônus Extra conforme campanha vigente"): **Livre 510 · Green 524 · Placas 510 · Solar 524 · Telecom 544 · Seguros 544 · Expansão 510**. O texto longo quebra em 2 linhas em Green, Solar, Telecom e Seguros; Telecom e Seguros ainda somam a 3ª linha de descrição. Espalhamento de 34px (era 19px).

⚠ **Esse espalhamento NÃO é degrau numa fileira.** Os 7 cards ficam em posições diferentes do baralho 3D dirigido por scroll (medido: topos em 9130, 9246, 9467, 9640, 9670, 9670, 9687) — aparecem um por vez, então altura diferente não desalinha nada visualmente.

⚠ **No DESKTOP mexer no texto do card não move nada abaixo** (o deck tem altura própria): página 30037 antes e depois. **No MOBILE move**: lá os cards empilham, e as 4 quebras de linha somaram **58px** na página (16872 → 16930). Nada quebrou — a Trajetória vem ANTES do Ecossistema, e o que vem depois se posiciona pela própria seção — mas se um dia a conta de scroll do mobile não fechar, este é um dos lugares que a mudou.

⚠ **Ao medir quebra de linha aqui, não use `line-height`:** ele é `normal` nestes `li`, então `parseFloat` devolve NaN e qualquer comparação vira falso — um detector escrito assim reporta "0 itens em 2 linhas" com os itens visivelmente quebrados (aconteceu). Meça a altura do texto (altura da caixa menos o padding): 17px = 1 linha, 31px = 2.

⚠ **REVERTIDO em 2026-08-03 (pedido do dono):** os cards **NUNCA** abrem a página de produto — nem na apresentação, nem fora dela. Antes avançar por dentro do stop navegava para o produto de propósito; hoje há **duas travas pareadas**, e as duas precisam continuar existindo:
- `js/page-transition.js` — o `click` e o `keydown` saem antes se o href contém `produtos/`. A trava é **incondicional** (antes só valia com `pmode-active`).
- `js/presentation-mode.js` — no `goNext`, o stop de card do ecossistema só avança (`isEcoCardStop` → `goToIndex(+1)`); não chama mais `openEcoCard()`.

Junto com isso, os cards deixaram de ter **qualquer** afordância de clique: o cursor "+" (`.curplus`) não aparece mais neles (o gatilho em `pointermove` foi neutralizado com `over=null`) e **nenhuma** regra de `:hover` os acende — o destaque verde (borda giratória + glow) é só do `.focus`, o card selecionado pelo carrossel. Se for religar o clique, reverta os quatro pontos, não só um.

Efeito colateral bom: dá para testar o trecho com ↓/espaço/roda sem destruir o contexto.

## Resultados / "Os números não mentem" — 8 `.sfloat`
Seção `.stats#resultados` (`.spin` como palco). Cada stat é um `.sfloat` com `.sfnum` (número + prefixo/sufixo em `<i>`, ex.: `+R$`, `mi`, `mil`, `m²`) e `.sflbl` (rótulo). O número **anima de 0 até `data-target`** — para trocar o valor exibido, troque o `data-target`, **não** o texto `0` (que é só o ponto de partida da contagem). Locale pt-BR formata milhar com ponto: `data-target="1000"` renderiza **"1.000"** (igual a "3.000 m²").

Estado em **2026-08-13 (8 itens)**, na ordem do HTML: `+R$150mi` bônus · `+800mil` clientes · `+35mil` licenciados · `+15` milionários · `3.000m²` sede · `+500` colaboradores · `+1.000` usinas solares · **`+R$1Bi` de boletos pagos de energia**. (O item "21 estados atendidos" foi removido a pedido do dono em 2026-07-30. O bônus foi de `140` para `150` em 2026-08-03 — via `data-target`, como manda o parágrafo acima.)

**O 8º item, `+R$ 1 Bi de boletos pagos de energia` (2026-08-13).** Pedido do dono apontando um print da seção: *"coloque um novo aqui"*. Ele veio primeiro como "1 Bilhão" e ele corrigiu para **"1 Bi"** minutos depois, o que também alinhou com o vizinho (`+R$ 150 mi` já usava abreviação).

- **Posição:** `bottom:15%;right:12%`, o vão livre do canto inferior direito, espelhando a sede (`bottom:15%;left:12%`). Conferido MEDINDO todos os 28 pares de caixas: **zero colisão**. Folga de 287 px do vizinho de lado (colaboradores, cuja caixa acaba em 1038 px) e 238 px do de cima (milionários formados). Caixa do número: 167 px, limite do `.sfloat` 250 px — não estoura.
- **Por último no HTML, e isso decide DUAS coisas:** no desktop a ordem do HTML é a ordem de aparição (`t0 = n*STEP`), e no mobile é o empilhamento — lá o `.sfloat` vira `position:static` e os `top/right` inline são **ignorados**. Sendo o último, o maior número fecha a sequência nos dois.
- ⚠ **É O ÚNICO DOS OITO SEM `data-target`, e isso é a correção de um defeito que eu mesmo introduzi.** Com `data-target="1"` o contador anima 0→1 e arredonda, então ele exibia **"+R$ 0 Bi"** durante metade do percurso do scroll — flagrado num print do mobile. "R$ 0 Bi" lê como bug. Os outros sete contam por números que valem a viagem (150, 800, 3.000); este não tem para onde contar. Agora o `1` está impresso no HTML e o item só aparece.
- ⚠ **Isso exigiu uma guarda na timeline do desktop**, e ela vale além deste item: a linha era `var target=+b.getAttribute('data-target')` **direto**, então qualquer `.sfloat` sem o atributo **lançaria** ali e mataria a timeline INTEIRA da seção — os oito reveals e o parallax do fundo junto. Hoje é `if(b){ ...contagem... }`. O gêmeo do mobile (`countUp`) já tinha `if(b&&!b.__counted)` desde sempre; era só o desktop que estava descoberto.
- **Verificado:** 8 floats, todos com opacidade final > 0.9, **zero erro de JS**, os oito valores finais corretos (`+R$150mi … +R$1Bi`). Geometria **igual ao HEAD**: docH 33339, as 16 seções com deslocamento 0 px, 24 ScrollTriggers, 7 pins, pin da `.stats` em `950->3409`, **73 paradas** (nem perdida nem criada — a seção tem `subs:[]`). Mobile 390×844: sem estouro horizontal, "Bi" não quebra linha (número 154 px na coluna de 154 px). `revisar.js`: 0 erros.
- ⚠ **Não deu para ver o desktop rolado em print:** com o painel do navegador oculto o ScrollSmoother não acompanha o `window.scrollTo` (nativo foi a 1900, suavizado ficou em 0). O desktop foi verificado por medição de caixas e pela timeline forçada a `progress(1)`; o print visual é do mobile, onde o scroll é nativo.

**Animação (nenhuma contagem fixa no JS):** desktop = timeline pinada (`.stats` `start:'top top'` `end:'+=260%'`, scrub) dirigida por `floats.length` e índice `n` — `STEP=.32`, `TOTAL=floats.length*STEP+1.1`, drift `-(60+((n*53)%90))`; some/adiciona `.sfloat` que ela recalcula sozinha — conferido ao entrar o 8º item: o pin continuou em `950->3409` (o `end:'+=260%'` é distância fixa, então a seção NÃO muda de altura; o que muda é o ritmo dos itens dentro do mesmo trecho de scroll). Mobile (≤1024px) = grade `auto-fit repeat(minmax(150px,1fr))` com reveal+contagem por IntersectionObserver (`.sfloat.inview`); com 8 itens a grade fecha em **duas colunas cheias** — o problema do nº ímpar deixando o último sozinho na coluna esquerda deixou de existir. Apresentação: `#resultados` tem `subs:[]` (parada única) — mexer nos itens não muda paradas.

## Recorrência — 6 `.rblock` + 7 `.rfloat`
Os `.rfloat` têm **posição fixa por índice**: `.g1` a `.g7`, com valores **diferentes** no desktop e dentro de `@media (max-width:1024px)`. Um oitavo card não tem posição e empilha no canto.

No mobile, o palco é escalado (`.recwrap` com altura fixa 1680px + `zoom:.52`) e cada `.rfloat` revela sozinho via `IntersectionObserver` com threshold 0.35 — cuidado: o `.recstage` tem `overflow:hidden`, e o observador conta o clip dos ancestrais. Card cortado pode nunca atingir o threshold e ficar invisível para sempre. **Teste rolando a seção inteira** e confirme que todos chegam a opacidade 1.

## Sede — badges + botão
4 `.hqbadge` visíveis, revelados por cascata de CSS com `nth-child(1)` a `(4)` e `transition-delay` escalonado (~80ms). **Um quinto badge nasce invisível** — a regra do índice 5 não existe. O botão entra por último (`.hqwatch`, delay .62s).

A seção tem folga de pin de `+=75%` (só respiro para o snap encaixar, não coreografa nada) e o vídeo toca em loop com play/pause por visibilidade real.

## A Rede — 16 `.rcard` (baralho 3D)

> ⚠ **A SEÇÃO `#rede` ESTÁ OCULTA desde 2026-08-03** (marcador `REDE-DESATIVADO`, `display:none` no
> topo do `<style id="rede-styles">`). O dono pediu que a vitrine saísse de seção própria e passasse
> a viver **dentro da Bonificação**, como o trilho que aparece na metade escurecida quando um carro
> é selecionado — e que "as qualificações vão direto para a bonificação". Ver **Bonificação** logo
> abaixo.
>
> **O que continua valendo desta seção:** tudo sobre o array `P`, os níveis, os pins e as fotos. O
> `<script id="rede-app">` continua sendo o **dono dos dados**: ele monta `P`, `PIN` e `cardHtml()` e
> publica em `window.REDE_DATA` **antes** de parar no guard de seção oculta. É de lá que o trilho da
> Bonificação tira as 16 pessoas. **Não apague o bloco `#rede`** — apagar leva as 16 pessoas embora.
>
> **O que NÃO vale mais:** a altura de 1050vh, o pin em `.rede-pin`, a parada por pessoa da
> apresentação (`on:false` na entrada 'A Rede') e o carrossel mobile próprio. Para reativar a seção:
> tirar o `display:none`, devolver `'rede'` ao array do `#reorder-secoes` e trocar `on:false` por
> `on:true` no `presentation-mode.js`.

Seção `#rede`, entre Graduações e Bonificação. Porte do material "Depth Rail" (React+Tailwind+Framer Motion) para o stack daqui. Tudo vem de **um array `P` no `<script id="rede-app">`** — o HTML dos cards e os dots são gerados em runtime, então **pessoa nova = uma entrada no array**, nada de HTML.

**O HTML do card é COMPARTILHADO e o CSS também.** `cardHtml(p)` é uma função só, consumida por esta seção e pelo trilho da Bonificação. No CSS, cada regra do cartão tem **dois seletores** (`#rede .rcard, .rdeck .rcard`): quem tem a classe `.rdeck` no container do baralho usa a mesma declaração. As **medidas** saem de variáveis (`--cardw`, `--cardh`, `--headh`, `--namefs`, `--pinsz`), então cada host escolhe o seu tamanho sem copiar CSS. Mexer no visual do card = mexer **num** lugar; os dois baralhos acompanham.

Estado em 2026-08-06: **2 Embaixadores + 14 Royais**, nomes reais passados pelo dono. **Madson e Jheniffer** entraram em 2026-08-06 entre Luiz Carlos e Orlando (ordem alfabética de primeiro nome) e **passaram para o FIM da lista em 2026-08-09**, a pedido do dono: "por ocasião que ele é o novo Royal" — quem chegou por último fecha a vitrine. ⚠ É a **única entrada fora da ordem alfabética**; se um Royal novo entrar, ele passa a ser o último e o Madson volta para o meio. Conferido depois da mudança: 14 Royais, Madson em **14/14**. A foto veio 273×415 com fundo TRANSPARENTE (as outras são 273×426 opacas) e foi achatada sobre `#070A08` (a `--rede-surface`) antes de virar JPEG — JPEG não tem canal alpha, e sem achatar o vazado sai preto chapado. `first` sai no accent e `last` na linha branca; em casal a 2ª linha começa com "e ..." (ex.: `first:"David Willian"`, `last:"e Aline Moura"`).

**A lista dos Royais foi trocada na 2ª rodada de 2026-08-03** e a ordem do array **é a ordem do trilho** (alfabética por primeiro nome, como o dono mandou). Quatro nomes mudaram e valem conferência se algum dia baterem os registros: `André Maluf` → `André Maluf e Beatriz Guimarães`; `Fillipe Souza` → `Fillipe Souza e Stela Souza` (antes o nome vinha **cortado** no material); `Joel Pletsch` → **`Joel e Fabiana Lisboa`** (sobrenome era outro); `Orlando Ferreira` → `Orlando Ferreira e Florence Gentil`. E `Luiz Carlos (Pit)` perdeu os parênteses.

**O nível aparece em 2 lugares (2026-08-04): o rótulo ACIMA do card e o pin.** Dentro do card não há mais texto de nível — o `[ ROYAL ]` / `[ EMBAIXADOR ]` saiu a pedido do dono. O rótulo acima é o `.cr-kicker` do trilho e diz só **"Acionistas Royal"** / **"Acionistas Embaixadores"** (sem o "A Rede ·", sem 5K/12K), vindo do `rotulo` de cada grupo em `G[]`. A regra CSS do `.rc-tag` fica no arquivo: devolver é só voltar o `<span>` no `cardHtml()`.

⚠ **Ao remover a tag, o pin foi para a ESQUERDA e caiu em cima do nome.** A regra compartilhada do `.rc-head` usa `justify-content:space-between`, que com dois filhos jogava um em cada ponta — com um filho só, ela manda o item para o **início**. Por isso o trilho força `justify-content:flex-end`. Verificado: pin em x 288–345, nome termina em 276, folga de 12px, nos dois grupos.

**(histórico) Antes eram 2 lugares assim no card, ambos vindos do mesmo `lvl`** — mudar o `lvl` de uma pessoa muda os dois de uma vez, e move a pessoa de grupo no trilho:
1. `[ EMBAIXADOR ]` / `[ ROYAL ]` no canto superior **esquerdo** (`.rc-tag`);
2. o **pin exato** no canto superior direito (`.rc-pin`) — `EMBAIXADOR` → `assets/pins/pin-e12.webp`, `ROYAL` → `assets/pins/pin-r5.webp`, os mesmos arquivos das graduações. Antes era um selo desenhado em CSS (conic-gradient); foi removido. Nível novo = entrada nova no objeto `PIN`, senão o card sai sem pin.

**Eram 4 lugares até 2026-08-03 (2ª rodada).** O dono pediu "tire o acionista royal 5k. e o royal lado esquerdo acima. e o pin continua". Saíram: a **faixa verde da base** (`.rc-cta`, que era o botão "Garanta o seu ingresso" do material e tinha virado rótulo do nível) e a **linha de reserva do `.rc-hl`**, que repetia "Acionista Royal 5K" / "Acionista Embaixador 12K" para quem não tinha destaque próprio. O `.rc-hl` continua para quem **tem** destaque no material ("80 Milhões", "Clube de Milionários"): hoje ele só entra se houver `hl`. A regra CSS do `.rc-cta` ficou no arquivo, marcada como sem uso — devolver a faixa é só devolver o `<span>` no `cardHtml()`.

⚠ **David Willian tem `hl:"Acionista Royal"`** — esse texto veio do material do dono, não é a linha de reserva, então continua aparecendo. Se ele quiser tirar também, é só apagar o `hl` dessa entrada.

**Texto por pessoa é OPCIONAL e isso é deliberado.** Só 5 têm `pill`/`hl`/`body` (os que vieram com texto no material: Lucas, David, Evandro, Gabriel, João Paulo). Para os outros **não** se inventa conquista, cidade nem número — são pessoas reais; o card mostra nome + nível (`Acionista Royal 5K` / `Acionista Embaixador 12K`) e o `hl` cai nesse rótulo sozinho. Ao receber o texto, preencha `pill`/`hl`/`body` e o card se completa sem mexer em CSS.

**A quantidade muda a altura da seção** — mas hoje a seção afetada é a **Bonificação**, não esta. Com `#rede` oculta, somar uma pessoa ao array `P` alonga a **Bonificação em 40vh** e desloca só o Rodapé. Ver a tabela em Bonificação. (Enquanto `#rede` esteve visível era `height = N * 70vh` = 1050vh.)

**Apresentação:** a entrada `'A Rede'` está `on:false` (parada morta, mesmo tratamento do `#recorrencia` oculto). Quem tem uma parada por pessoa agora é a **Bonificação**.

Duas adaptações que **não** são escolha de estilo, não "conserte" para o que estava no material:
- **`position:sticky` virou pin do ScrollTrigger.** Sticky não gruda dentro de ancestral transformado, e o ScrollSmoother move o `#smooth-content` por transform. O projeto já tinha batido nisso (ver o sticky do resultado do simulador).
- **O pin fica no filho `.rede-pin`, não na section.** Por isso o `.pin-spacer` nasce **dentro** de `#rede` e a section pode ser movida à vontade pelo `#reorder-secoes` (é o que permite ela entrar antes da Bonificação sem o cuidado extra que o simulador exige no PASSO 1).

**Fotos — requisito de conteúdo, não capricho:** uma foto por pessoa, com dominante **distinta das vizinhas**. Enquanto a seção esteve visível, a foto do card ativo virava backdrop borrado (blur 95px) e o crossfade entre elas era o efeito de ambiente; reciclar imagem fazia a troca passar em branco. No trilho da Bonificação não há backdrop, mas a exigência de foto distinta continua: são cards vizinhos no baralho. Ficam em `assets/img/rede/`.

**`ph:true` = placeholder de evento esperando a foto real.** Hoje faltam **10 fotos**: Anderson Gessler, André Maluf, Eduardo Martins, Fillipe Souza, Gabriel Martins, Joel, Lucas Battistoni, Luiz Carlos Pit, Orlando Ferreira e Renato Cardoso. Já têm foto real: David Willian, Evandro Martinez, João Paulo, **Fellipe e Andréa Morais** e **Sanzio e Soraia Morvan** (as duas últimas vieram em 2026-08-03). Ver a especificação da foto abaixo antes de pedir arquivo novo.

### Especificação da foto do card — ATUALIZADA em 2026-08-04
**A foto ocupa o CARD INTEIRO no trilho.** O dono reenviou as 13 fotos dos Royais já recortadas (pasta `Fotos_Royais`, com o `.psd` de trabalho), em **273×415 = proporção 0,66** — que não é a da caixa antiga da foto (330:353 = 0,935) e sim quase a do **card** (1/1.575 = 0,635). Trocar só os arquivos faria o `object-fit:cover` comer 30% da altura pelo meio e decepar cabeças. Então `.carsrail .rcard .rc-ph{top:0;height:100%}`: o corte caiu para **≤4%**, e sobra na largura, não na altura (medido nas 15).

**Pedir ao dono:** proporção **1/1.575** (≈ 0,635), rostos no **primeiro terço** — a máscara é opaca até 38% da altura e totalmente transparente a partir de 82%, onde entra o nome.

⚠ **RESOLUÇÃO ABAIXO DO IDEAL, em aberto:** os arquivos têm 273px de largura, e o card renderiza **360px** no desktop e até 320px no mobile (×3 de dpr = **960px reais**). Ou seja o navegador amplia ~1,3× no desktop e ~3,5× no celular — fica macio. O `.psd` também é 273px, então não há resolução escondida: para resolver, exportar em **720×1134**. Não bloqueia nada, é qualidade.

**Os dois Embaixadores** foram recortados dos posters 1080×1350 na proporção nova (`crop=508:800`). Não dá para excluir o pill "Acionistas Embaixadores" **e** manter o homem inteiro — eles disputam a mesma faixa horizontal; o pill sobrou dentro do recorte de propósito, a ~70% da altura, onde a máscara já o deixa quase invisível.

⚠ **O pin desceu para o canto INFERIOR direito.** Com a foto no card inteiro, o canto superior direito é onde costuma estar o rosto de quem aparece à direita — medido: no card do Anderson o pin caía em cima da cabeça da Débora. Embaixo ele pousa na faixa já dissolvida. O `[ ROYAL ]` fica no topo esquerdo. O `.rc-body` ganhou `padding-right` do tamanho do pin para o nome não correr por baixo dele (verificado: nome termina em x=276, pin começa em x=288).

### (histórico) Especificação anterior — caixa de 68% da altura
Medido em 2026-08-03 na cena real (não deduzido):

| | valor |
|---|---|
| `<img>` declarado | **330 × 353** px → proporção **0,935** (≈ 15:16, um tico mais alta que quadrada) |
| caixa renderizada, desktop 1920×946 | 304 × 326 CSS px (card 306 × 482) |
| caixa renderizada, mobile 390×844 dpr3 | 302 × 324 CSS px = **907 × 973 px reais** |
| **pedir ao dono** | **990 × 1059 px** (3×, cobre o mobile retina). Aceitável 660 × 706. Mínimo 330 × 353 |

**Enquadramento importa mais que a resolução.** A foto tem `mask-image`: opaca até **38%** da altura, e **totalmente transparente a partir de 82%** — o terço de baixo dissolve no card e é ali que entra o nome. Então: **rostos no primeiro 55%**, e nada de importante abaixo de 80%.

**Proporção 330:353, não 3:4.** As 3 primeiras fotos são 3:4 (240×320) e o `object-fit:cover` **corta ~10% em cima e ~10% embaixo** — em foto com pouca folga acima da cabeça, isso decepa o topo. As duas dos Embaixadores foram recortadas na proporção da caixa (495×530), então nada é cortado.

**Os posters "… - Embaixador - Post" que o dono manda são 1080×1350 com o nome e o pill impressos na arte** — recorte fora do texto (o card já escreve nome e nível; duplicar fica feio e briga com o `text-wrap`). Serve como fonte: dá para tirar um 520×556 limpo da região do casal.

**Backdrop:** duas `<img>` em ping-pong. Nunca troque o `src` da mesma tag nem remonte o elemento — repintar um blur desse tamanho a cada quadro trava o scroll.

**Mobile (≤1024px):** sem pin e sem 3D — carrossel horizontal nativo com `scroll-snap`. Deliberado: pinar 8 × 90vh no celular seria 720vh de rolagem forçada, e o ScrollSmoother não existe abaixo de 1025px. A troca de faixa (girar o aparelho) faz `location.reload()` de propósito, para não ficar num meio-estado entre pin e carrossel.

### Apresentação — bolinhas do trilho de navegação
**Seção com `on:false` NÃO ganha bolinha** (2026-08-03). O dono relatou "tem mais bolinha aparecendo que seção de navegação" e era isso, medido: **12 bolinhas para 10 seções ligadas** — as duas sobrando eram de seções ocultas (`#recorrencia`, antiga, e `#rede`, que virou o trilho dos carros). A bolinha existia, era visível e não fazia nada (o clique é guardado por `if (SECTIONS[i].on)`). O array `dots` **continua com um lugar por seção** (índice = índice em `SECTIONS`, que é como o resto do arquivo indexa); as desligadas ficam `null`, e `renderDotsState` e o listener de clique testam a existência antes de mexer. Verificado depois: 10 bolinhas, 10 seções, nenhuma desativada.

### Trajetória no mobile — o trilho verde PARA no último marco
Era `bottom:0` com fade a partir de 64%, **de propósito**: o comentário dizia "conectando/dissolvendo na próxima section". Só que a próxima section é a do vídeo, e a linha entrava nela — o dono relatou "a linha verde desce até o vídeo". Agora `bottom:230px` (a mesma conta do preenchimento `::after`, `100% - 234px`) com fade curto em 88%. Verificado: a linha termina em 2893, exatamente onde o último marco termina. Os 230px de `padding-bottom` seguem como respiro.

### Trilho de pessoas no mobile — tudo centralizado
Rótulo, barra+contador e setas ficavam em alinhamentos diferentes (só as setas estavam no centro). A coluna é `align-items:stretch` porque o deck precisa da largura toda, então quem centraliza cada linha é `text-align:center` no rótulo e `justify-content:center` na barra. Verificado: desvio do centro **0px** nos três.

### Trajetória no mobile — tamanho das fotos
**⚠ Três das cinco fontes são QUADRADAS** — medido: jp1 1536×1024 (paisagem de verdade), jp2 1254×1254, jp3 1024×1024, jp4 1024×1024, jp5 460×460. Na caixa 16:10 do mobile o `object-fit:cover` come **34% da altura** de toda fonte quadrada.

Em jp4 (Forbes/Amanda) e jp5 (BP/Gusttavo Lima) isso cortava **conteúdo real**: são peças de arte com texto no topo E no rodapé — partia a palavra "Forbes" ao meio e comia o "+800M clientes"; no BP cortava a testa e os olhos. Nenhum `object-position` resolvia, porque salvar um lado perde o outro. Solução: nessas duas a caixa acompanha a arte (`aspect-ratio:1/1`), e nada é cortado (verificado: caixa 328×328, perda 0%). As outras seguem 16:10 — são fotos, não arte com texto.

**Em aberto:** jp2 e jp3 também perdem 34% da altura. Não foram tocadas porque o dono não pediu e são fotos (recorte é enquadramento, não perda de informação). Se um dia incomodar, é a mesma linha — mas cada foto que vira quadrada alonga a timeline do mobile em ~112px.
As 5 `.jphoto` eram **172×108** (16:10) — 44% de uma tela de 390px, e num recorte 16:10 as fotos verticais mostravam só um pedaço do tronco da pessoa. O dono pediu ajuste; medido antes de mexer, as cinco tinham **exatamente** o mesmo tamanho, ou seja o problema não era inconsistência entre elas, era escala. Agora **300×188** (77% da tela). O teto de 300px vem da largura útil: `390 − 40` do `padding-left` da linha do tempo `− 20` de margem `= 330`.

⚠ **Esse teto de 300px valia para a foto SOZINHA, e o item de 2026 tem o selo GPTW na MESMA linha.** Sintoma do dono (2026-08-06): "no mobile alguns estão cortando a imagem da great place to work, exemplo iphone 11". Medido: a linha `.jmedia` pedia `300 + 12` de gap `+ 76` do selo `= 388px` contra **295px** de `.jitem` — transbordava o próprio item em **93px**. O que acontecia a seguir variava com a tela, e é por isso que só **alguns** aparelhos cortavam:

| tela | o que acontecia | |
|---|---|---|
| 414 (iPhone 11) | linha encostava na borda: direita em 414 de 414 | zero folga |
| 390 | linha empurrada, começava em x=2 | perdia a margem esquerda |
| 375 | linha começava em **−13** | cortava 14px da FOTO pela esquerda |

**Correção:** a foto passou a poder encolher — `.jmedia .jphoto{flex:0 1 auto;min-width:0}` (o `min-width:0` é obrigatório: item flex não encolhe abaixo do conteúdo sem ele). A linha passa a caber dentro do item em qualquer largura, sem número mágico novo. Só esta linha é afetada: das duas `.jmedia` do site, a outra (Expansão Internacional) não tem foto, só os dois selos.

**O custo, medido:** a foto de 2026 fica menor que as outras quatro — larguras das 5 `.jphoto` a 414px: `[300, 300, 300, 246, 300]`; a 375px a dela cai para **207**. Em 360, 375 e 414 o selo fica **inteiro** (76×108) com **20px de folga** à direita e nada sai da tela.
Alternativa não aplicada, se o dono preferir a foto grande: `flex-wrap:wrap` no `.jmedia` joga o selo para baixo da foto e as duas ficam em tamanho cheio — muda o arranjo em **todo** celular, porque para caberem lado a lado com 300px seria preciso uma tela de ~468px.

Detalhe que aparece ao medir: o `<picture>` da foto renderiza ~13% mais largo que a caixa do `.jphoto` (a 375: 235 contra 207) e o `.jphoto` é `overflow:visible`, então ele vaza para os dois lados. É anterior e constante (não é animação — amostrado 14 vezes, sempre 235). A sobreposição sobre o selo caiu de **8px para 2px** com a correção.

## Bonificação (carros) — seção PINADA + trilho das 16 pessoas
Seção `#bonificacao`, a última antes do Rodapé. **Mudou de natureza em 2026-08-03:** era 1 tela fixa (`.carstage{height:100vh}`, sem pin e sem scrub) e passou a ser **pinada com curso de rolagem**, porque recebeu o trilho de pessoas que era a seção A Rede. Blocos: `<style id="carsrail-styles">`, o `<div class="carsrail">` dentro da `.carstage`, e o `<script id="carsrail-app">`.

### Dois grupos, na ordem do plano de carreira
O trilho **não** é uma fila única com as 16 pessoas. São **dois grupos, e o grupo é a mesma informação que o carro selecionado** (pedido do dono, 2ª rodada de 2026-08-03):

1. **Royal 5K** selecionado (BYD acesa, à esquerda) → só os **14 Royais**, à direita;
2. passados todos, o carro troca **sozinho** para **Embaixador 12K** (Taycan) e entram só os **2 Embaixadores**, à esquerda;
3. um passo depois, sai da seção.

Na 1ª versão o trilho misturava os 15 e mostrava card `[ ROYAL ]` com o Embaixador selecionado — lia errado. Os grupos saem do `lvl` de cada pessoa no array `P`, o **mesmo campo** que escolhe o pin e o rótulo do card: trocar o `lvl` de alguém move a pessoa de grupo sozinho, e os quatro nunca discordam. `G[0]` casa com `data-car="0"` e `G[1]` com `data-car="1"` — a ordem é a **das abas**, não a do array `P` (onde os Embaixadores vêm primeiro).

**O curso é FIXO e tem cinco trechos** (constantes em vh no `carsrail-app`):

| trecho | vh | o que acontece |
|---|---|---|
| cabeça | `CABECA=55` | cena limpa: o vídeo toca e as abas aparecem |
| Royais | `TRECHO(N_R)` = **40** hoje (é a capa, 1 cartão) | trilho à direita |
| ponte | `PONTE=40` | trilho sai, o carro troca no **meio** da ponte, trilho volta do outro lado |
| Embaixadores | `TRECHO(N_E)` = `40` | uma parada por Embaixador, trilho à esquerda |
| cauda | `CAUDA=45` | o trilho sai de cena e a seção fica limpa outra vez |

⚠ **`TRECHO(n) = max(n−1, 1) × PASSO`, e o piso de UM PASSO não é enfeite.** Para n ≥ 2 é
idêntico ao `(n−1)×PASSO` de sempre — nada mudou para quem tem dois ou mais cartões. O piso existe
porque **o trecho é o que decide por quanto tempo o trilho fica NA TELA**: fora dele o `.rail-on`
cai e a `.carsrail` volta a `opacity:0`. Quando o grupo ROYAL virou **uma capa só** (14 → 1), o
trecho zerou e a janela virou apenas as duas FOLGAs — medido em 2026-08-14: **18vh de um curso de
180vh, ou 130px de rolagem**, e a `.carsrail` leva **0,55s** só para aparecer. Numa rolagem comum
(~1000px/s) a capa cruzava a janela em ~130ms e **nunca chegava a aparecer**. Com o piso, a janela
do ROYAL vai a **58vh** — a mesma dos Embaixadores, que são dois e sempre funcionaram. A PONTE
continua intacta: o trecho cresce **antes** dela, então a troca de carro segue com o trilho fora da
tela.

Altura da section = `100 + CABECA + TRECHO(NR) + PONTE + TRECHO(NE) + CAUDA`. Com **1 capa + 2
Embaixadores**: `100 + 55 + 40 + 40 + 40 + 45` = **320vh** (medido a 1920×946; era 280vh antes do
piso, e 800vh na época dos 14 Royais individuais). **Nada disso é número fixo** — o curso sai de
`NR`/`NE`, e `sec.style.height` também: **Royal novo alonga a Bonificação em 40vh sozinho**,
Embaixador novo idem. Só o Rodapé se desloca.

Medido ao entrar Madson e Jheniffer (13→14 Royais), a 1920×946: seção 760vh → **800vh**, página 30217 → **30595** (+378px = 40% de 946) e topo do Rodapé 29179 → **29557** — o mesmo deslocamento, como esperado. Paradas do trilho 15 → **16**; contador do grupo Royal `/13` → **`/14`**. No **mobile nada disso vale**: lá o deck rola na horizontal (`scrollWidth` 4527 contra 390 de tela) e a página não muda de altura (17267 antes e depois).

**Por que fixo:** se a distância dependesse do carro selecionado, um clique nas abas mudaria a altura da página no meio da navegação (pulo visível) e as paradas da apresentação — montadas **uma vez** — apontariam para o lugar errado.

**FOLGA de 9vh nas pontas de cada trecho, e não é enfeite:** a parada da última pessoa cai **exatamente** no fim do trecho e a posição em que o tween pousa erra por fração de pixel — medido na 1ª versão, progresso `0.8978390` contra o limite `0.8978102`, 28 milionésimos para fora, e o trilho aparecia **vazio justo na última pessoa**.

⚠ **NUNCA declare `position` num seletor `.carsrail .rcard`.** Foi o defeito de `01d1e42`, achado em
2026-08-14: para dar contexto de posicionamento à moldura girante escrevi
`.carsrail .rcard{position:relative}`. Ela já tinha contexto — `#rede .rcard, .rdeck .rcard` é
`position:absolute` — e as duas regras têm a **mesma especificidade** (2 classes), então a de baixo
venceu e os **17 cartões caíram do posicionamento absoluto para o fluxo normal**. Medido: empilhados
de 201,6px em 201,6px, com o cartão do grupo no ar **3.398px abaixo** de uma janela de 720px.
`visibility:visible`, `opacity:1`, **zero erro no console** — e nada na tela. Atingiu Royais **e**
Embaixadores, no site e na apresentação. Sintoma do dono: *"no modo site e modo apresentacao nao
esta exibindo a carta"*. Depois do conserto: cartão em `top:204 left:1260` numa janela 1920×946.

⚠ **A flutuação da capa usa `translate`, não `transform`.** O baralho posiciona cada cartão
escrevendo `style.transform` a cada quadro (o `translateX/scale/rotateY` do `apply()`), e **animação
CSS vence até estilo em linha**: com o keyframe mexendo em `transform`, o computado media
`matrix(1,0,0,1,0,-0.016)` enquanto o inline dizia `translateX(0px) scale(1) rotateY(0deg)` — o
baralho perdia o comando da capa em silêncio. Hoje o grupo ROYAL tem 1 cartão e o deslocamento é
zero, então não aparece; volta a ter dois e a capa fica parada no lugar errado. A propriedade
`translate` é independente e **soma** ao `transform`.

**A troca de grupo é um salto seco, não um tween.** O baralho novo tem outra contagem; deixar o tween varrer de `p=12` (último Royal) para `p=0` fazia o `apply()` rodar com índices que não existem nos 2 Embaixadores — medido: contador em `03 / 02`. E ao estacionar os cards do grupo que sai é preciso **remover o `.on`**, não só zerar a opacidade: sem isso o `.rcard.on` do documento continuava sendo o do grupo anterior (medido: na 1ª parada dos Embaixadores o destacado ainda era "Fillipe Souza"). O salto cai no meio da ponte, com o trilho invisível, então ninguém vê.

⚠ **`garanteCarro()` tem de ser chamado DEPOIS do bloco que força o fim do vídeo, nunca antes.** O `carsFinish()` do site — disparado pelo `ended` que o trilho força quando liga — termina com um `setCar(0)`. Com a ordem invertida ficava um estado impossível: card de Embaixador na tela com a aba em "Royal 5K" e a BYD acesa. Só aparece ao **entrar direto** no trecho dos Embaixadores (o que a apresentação e quem chega no meio da página fazem); rolando devagar não aparecia, porque o vídeo acaba muito antes de o trilho ligar. Verificado depois: entrada direta nos Embaixadores → aba "Embaixador 12K", trilho à ESQ; voltando aos Royais → aba "Royal 5K", trilho à DIR.

**Clicar numa aba dentro do trilho SALTA para o trecho daquele grupo.** Quem manda na seleção aqui é a **posição do scroll**; se o clique só trocasse o carro, ficava um estado impossível — medido: aba em "Embaixador 12K" com os cards dos Royais na tela. Posse explícita a uma das duas mecânicas é a lição que este projeto já aprendeu com o snap brigando com auto-scroll. A trava do salto é "o grupo discorda do scroll" (+ um flag para a troca feita **pelo** scroll não voltar como salto) — **de propósito não usa `isTrusted`**: qualquer coisa que selecione um carro fora do trecho dele precisa levar o scroll junto, venha de clique humano ou de código. Sem risco de laço: o salto muda o scroll, o `onUpdate` vê o grupo já correto e não clica em nada.

**SETAS, e por que elas são obrigatórias.** O container do trilho é `pointer-events:none` para não roubar o tap que seleciona o carro — consequência: fora da apresentação **não havia como passar as fotos**, porque clicar em cima do card cai na metade escurecida e seleciona o carro de trás. As duas setas (`.cr-arrows`) são a **única** parte do trilho com `pointer-events:auto`. Ficam em **linha própria, abaixo do contador** (pedido do dono). Elas andam pela lista **global** das 15 paradas, não pelo grupo: no 13º Royal o "próximo" atravessa a ponte e cai no 1º Embaixador, com o carro trocando sozinho. No mobile empurram o `scrollLeft` do deck (não há pin lá). Verificado: desktop `01/13→02→03→04`, volta a `03`, e do 13º Royal salta para `01/02` com o Taycan aceso; mobile `01/15→02→03→04`.

**Tamanho do card no desktop:** `--cardw: min(clamp(232px,20vw,360px), calc((100vh - 235px)/1.575))`. O 2º termo é o orçamento de ALTURA e subiu de 210 para 235px quando as setas ganharam linha própria — sem isso, num notebook de 600px úteis a coluna card+contador+setas não caberia. Medido: 1920×946 → **360×567** (era 306×482); 1229×600 → 232×365, **igual a antes** (lá quem manda é a altura, não a largura).

⚠ **Ao medir a `.carpick` deslocada, meça em DUAS chamadas.** A transição de `transform` é de 0,6s e numa aba throttled ela não avança dentro do mesmo `evaluate`: duas leituras minhas deram "não deslocou" (777px) e a chamada seguinte deu o valor certo (`translateX(-307px)`, folga de 317px do card). Não era bug — era a medição.

**O kicker do trilho diz de quem é a vez** (`A Rede · Acionistas Royal 5K` / `... Embaixador 12K`) — é o que amarra o baralho ao carro aceso ao lado. No mobile ele volta a ser só `A Rede`.

**A cena cede o palco enquanto o trilho roda** (`.carstage.rail-on`) — isto foi **medido**, não deduzido. Na metade escurecida não existe espaço para um card de ~470px:

| viewport | `.carshead` | `.carbottom` | `.carpick` |
|---|---|---|---|
| 1920×946 | 490–1430 × 205–394 | 520–1400 × 583–903 | 778–1142 × 583–633 |
| 1229×600 | 145–1085 × 44–208 | 175–1055 × 264–579 | 433–797 × 264–315 |

A copy central ocupa 940px dos 1229 do notebook: sobravam ~145px à direita, e **a 1025px de largura sobra zero**. Então, com `rail-on`: `.carshead` e `.carinfos` vão a `opacity:0`, e a `.carpick` escorrega **25vw** para o lado oposto ao trilho (continua clicável — a troca de carro não se perde).

**⚠ Quem escorrega é a `.carpick`, NÃO a `.carbottom`.** Duas tentativas morreram no inline do GSAP: ele anima a `.carbottom` no reveal e escreve `transform: translate(-50%,0%); translate:none; rotate:none; scale:none` **inline**, e inline ganha da folha de estilo — inclusive na propriedade `translate` separada (medido: computed voltava `none`). A `.carpick` não é animada por ninguém.

**Lado do trilho = metade escurecida = carro NÃO selecionado.** Royal 5K (`data-car="0"`) é a BYD, à **esquerda** → trilho à direita (padrão). Embaixador 12K é a Porsche, à **direita** → trilho à esquerda (`.rail-left` + `.rail-l`). Quem avisa é o evento `cars:select`, disparado dentro do `setCar` — evento e não variável global porque `setCar` também é chamado por `carsFinish()` **sem clique**, e ouvir só o clique das abas deixaria esse caso de fora.

**PENDENTE (2026-08-03):** o dono vai mandar um **formato de slide diferente** para o lado do Embaixador 12K. Hoje os 2 Embaixadores usam o mesmo card dos Royais, só do outro lado. Quando o formato chegar, muda **só o conteúdo do grupo `G[1]`** — geometria, curso e paradas ficam.

**Apresentação: 16 paradas onde antes eram 2.**

| parada | o que aparece |
|---|---|
| 1 | **cena limpa**: título "Aqui a iGreen te dá a chave", os dois carros, as abas e a ficha da BYD. O vídeo dos carros toca aqui, como no site |
| 2 – 15 | os 14 Royais, trilho à direita, Royal 5K aceso |
| 15 – 16 | o carro troca sozinho para Embaixador 12K e entram os 2 Embaixadores, trilho à esquerda |
| +1 toque | próxima seção |

As posições das pessoas vêm de **`window.CARSRAIL.paradas`** (lista de frações já pronta, publicada pelo `carsrail-app`): **não repita os 55/40/40/45 no `presentation-mode.js`** — número repetido em dois arquivos é o gêmeo escondido deste projeto, e o sintoma seria a apresentação pousando entre dois cards sem erro nenhum no console. A troca de carro **não** é papel da apresentação: ela só pousa no `y`, e é o trilho que troca o carro pelo scroll.

Duas ações, e a diferença entre elas é proposital: a **1ª parada** usa `carSelectRaw(0)` para **não** forçar o fim do vídeo (o dono quer ver a animação dos carros chegando); a **1ª pessoa** usa `carSelect(0)`, que **força** o estado final — se o dono avançar antes de o vídeo acabar, as abas e a foto precisam estar no lugar antes de o card entrar.

Existe um caminho de exceção (sem `window.CARSRAIL`) que volta às 2 paradas antigas, para a seção nunca cair para 1 parada — com 1 parada, um único toque em "passar" sai dela direto, sintoma que o dono já relatou.

**O pin fica no filho `.carstage`, não na section** — por isso o `.pin-spacer` nasce dentro de `#bonificacao` e a section continua podendo ser movida pelo `#reorder-secoes`. E o gatilho do vídeo mudou de `.carstage` para `.cars`: o ScrollTrigger mede a caixa **natural** de um elemento pinado (a mesma armadilha que já pausava o vídeo da sede no meio do caminho).

**Mobile (≤1024px):** sem pin **e sem grupos** — os 15 numa tira só, na ordem do array, carrossel nativo com `scroll-snap`, `order:4` na coluna da `.carstage` (depois das abas), sempre visível. A coreografia de grupo existe porque no desktop metade da cena fica escurecida; no celular a cena é uma coluna e não há metade nenhuma para ocupar. As regras mobile do trilho ficam **dentro do `#carsrail-styles`**, não no bloco mobile geral: media query **não soma especificidade**, e lá elas perderiam para as regras de desktop do trilho, declaradas depois (foi assim que a logo da Trajetória foi para o lado errado).

**Geometria conferida (2026-08-03), antes → depois:** altura da página 33.727 → **30.037px**; ScrollTriggers 24 → 24 e pins 7 → 7 (o pin de `.rede-pin` saiu, o de `.carstage` entrou); paradas da apresentação 51 → 49; âncoras acima da Bonificação **sem deslocamento nenhum** (simulador 12165, órbita 13325, planos 16542, graduações 17817); 217 imagens, 0 falhas; fração visível do globo do rodapé 0,26 (o mesmo valor de quando ele foi consertado). ⚠ **Conte os triggers em carga LIMPA:** varrer a página antes de contar mata os 8 gatilhos `once:true` e a contagem cai para 16 — foi exatamente o falso alarme que apareceu aqui.

## Carros, Graduações, Eventos, Planos, Simulador
Não confirmei os seletores destas — **rode o inventário** acima antes de mexer. O que valida para todas:

- **Eventos** ficam num modal construído por JS (`buildEventsModal`), a partir de um array `EVENTS` com uma entrada por evento e uma chave `gal:` que casa com o prefixo dos arquivos em `assets/img/eventos/`. Adicionar evento = entrada no array + fotos nomeadas no padrão `<gal>-1..8` + `<gal>-qrcode`, todas tratadas (`ativos-guardian`). Os masters ficam fora do git. **O modal libera o `loading="lazy"` de todas as fotos visíveis quando abre** — sem isso, só a galeria do slide ativo carrega (ver o achado corrigido no fim deste arquivo). Foto nova entra nesse mecanismo sozinha, mas se você mudar a estrutura dos slides, confirme que `liberaFotos()` ainda alcança as novas.
- **Pins de graduação:** o site serve `assets/pins/grad-<nivel>.webp` (420px lossless, ~135kB cada). Os PNG de 1080×1080 são masters e ficam fora do git — eram servidos direto e, somando 5,7MB, seguravam a tela de boot por ~6,4s em toda primeira visita. Pin novo: gere o webp a 420px (dobro do tamanho de exibição, 203px) e **lossless**, porque o WebP lossy subamostra croma e mancha cor saturada.
- **Planos** têm um alternador (mensal/anual) — plano novo precisa dos dois valores, e o card destacado usa `.plan.feat`.
  - **2 planos, 6 `.plan-items li` cada** (Connect Plus e Connect Full). Eram 5 até 2026-08-04, quando o dono trocou as duas listas: saiu "Treinamentos e eventos" solto (virou parte do parêntese do Escritório Virtual) e entraram "Acesso ao iGreen Pay (Plano Basic)" e o "Voucher ... iGreen Store". Só o **valor do voucher** difere entre os dois (R$50,00 no Plus, R$100,00 no Full) e o **item 1** (Plus lista as três conexões, Full diz "acesso total"). Os outros 4 itens são idênticos — ao editar um, edite o outro.
  - ⚠ **A apresentação tem 3 paradas aqui e elas dependem da ALTURA dos cards:** (1) cabeçalho + plano 1, (2) plano 2, (3) rodapé. Não há pin nem scrub — o `buildStops` de `#planos` usa geometria, com um `off1` **adaptativo** que rola o quanto for preciso para o plano 1 caber inteiro. Medido a 1920×946 depois da troca de 2026-08-04, com os cards em **377px (Plus) e 358px (Full)** (eram 302px os dois): parada 1 → plano 1 em [533,910] inteiro na tela; parada 2 → plano 2 em [258,616] inteiro. O adaptativo absorveu os 75px a mais. **Se um dia a lista crescer até o card passar da altura da tela, é aqui que quebra** — o `off1` não consegue enquadrar o que não cabe.
  - Cascata da altura: página **30037 → 30168** no desktop (+131px) e **16930 → 17198** no mobile (+268px, porque lá os itens quebram em até 3 linhas). Tudo abaixo (Graduações, Bonificação, rodapé) desce junto; nenhuma âncora quebrou porque cada seção se posiciona por si.
- **Graduações** têm gráfico próprio, com versão 2D simplificada no mobile. Item novo entra nos dois.
- **Graduações na apresentação — TRÊS índices diferentes para a mesma pessoa. É o lugar mais fácil de errar em silêncio de todo o projeto.** O `buildStops` de `#graduacoes` gera **1 + N + G + R + V paradas** (gráfico completo · depois **pin → galeria daquele pin → reconhecimento daquele pin**, intercalado · N = níveis, G = níveis **com** galeria, R = níveis **com** reconhecimento, V = níveis com popup de vídeo), todas no **mesmo `y`** de scroll: quem muda a cena é a `action`, não a rolagem. Hoje: 1 + 5 + 4 + 3 + 1 = **14 paradas** (medido em 2026-08-09, com `.jphoto` em 202 e 24 ScrollTriggers — os dois sinais de medição válida). A apresentação inteira foi de **50 para 54** paradas nesse mesmo dia; as outras 11 seções não mudaram.
- **Reconhecimento por qualificação (2026-08-09).** Peça animada em tela cheia (`js/reconhecimento.js` + `css/reconhecimento.css`), porte do pacote React que o dono mandou. Existe hoje em **Sênior, Gestor e Executivo** — a lista está em **`window.GRAD_REC_LEVELS`**, publicada pelo próprio `reconhecimento.js`, e o `buildStops` lê de lá. Fallback sem a lista é **"nenhum tem"** (ao contrário da galeria, cujo fallback é "todos têm"): parada de reconhecimento sem a peça carregada seria um passo que não faz nada.
  - Ordem pedida pelo dono: **as fotos, depois os nomes**. Entre as duas entra a **CAPA DE VÍDEO** — um cartão sem funcionalidade nenhuma (`.recvid`, montado no `index.html` junto da galeria), que fica **por cima** das fotos e não fecha a galeria; quem fecha é a parada seguinte. Não há elemento de vídeo, iframe nem requisição: é sinalização.
    - **A capa existe em Gestor, Executivo, Diretor e Acionista** (`LVLS_VID = [1,2,3,4]`). Executivo, Diretor e Acionista entraram em 2026-08-09; o **Gestor em 2026-08-10** ("adicione o player ilustrativo no pin do gestor"). Cada uma usa a **1ª foto e a cor daquele evento**: Gestor `experience-1` laranja, Executivo `cruzeiro-1` azul, Diretor `america-latina-1` prata, Acionista `mundo-1` dourado. **Nenhum arquivo novo entrou** — a capa se monta com o que a galeria daquele nível já tem.
    - **O Sênior é o único fora, e não por esquecimento**: a capa é um cartão que aparece POR CIMA das fotos, e ele não tem galeria. Sem fotos atrás, não é capa de nada. Se ganhar galeria um dia, basta entrar na lista.
    - O clique faz a coisa certa em cada caso: onde **há** reconhecimento (Gestor e Executivo) ele segue para os nomes; onde **não há** (Diretor e Acionista), a capa apenas fecha e as fotos continuam. O texto do cartão muda junto, para o botão não prometer o que não entrega. Verificado no Gestor: cartão laranja `#f97316`, foto `experience-1.jpg` carregada, texto "Toque para seguir para os reconhecidos do mês", e o clique abrindo os 114 nomes.
    - ⚠ **`LVLS_VID` está duplicado**: a função `temCapa()` que decide o botão da galeria roda ANTES de o array existir (os slides são montados primeiro). Os dois ficam a poucas dezenas de linhas de distância, com aviso no meio. Mexeu num, mexa no outro.
  - Sequência medida, parada a parada (**17** na seção, **62** no total, medido em 2026-08-10): gráfico · pin Sênior · **rec SÊNIOR** · pin Gestor · galeria · **capa vídeo** · **rec GESTOR** · pin Executivo · galeria · **capa vídeo** · **rec EXECUTIVO** · pin Diretor · galeria · **capa vídeo** · pin Acionista · galeria · **capa vídeo**. O `onLeave` fecha os três (`gradTudoClose`). Eram 16/56 em 09/08 e 16/61 depois da Agenda; a 17ª é a capa do Gestor.
  - **A PEÇA COBRE A JANELA INTEIRA, em qualquer proporção de tela** (pedido do dono, 2026-08-09: "tem que preencher toda a tela de qualquer dispositivo... tá tendo um corte entre as linhas e o fundo"). O que era: TUDO vivia dentro do palco de 1920×1080 escalado por `min(vw/1920, vh/1080)`, então em qualquer tela fora do 16:9 o cenário terminava numa borda reta com preto em volta.
    - Agora existe o **`.rec-cenario`**, irmão do palco e colado nos quatro cantos da janela: vídeo, grade, halo, **a sala 3D**, brilho, horizonte, neblina e vinheta. O facho da varredura e o ruído também saíram do palco pelo mesmo motivo — dentro dele parariam na tarja.
    - O palco ficou com o **conteúdo** (pin, título, nomes, setas, contador), `background:transparent` e `overflow:visible`. Com fundo preto ele desenhava o retângulo 16:9 por cima do cenário; com `overflow:hidden` os véus parariam na beira dele.
    - Os **véus de blur desfazem a escala** para chegar na borda: `left:calc(960px - 50vw / var(--rec-k))` e `width:calc(100vw / var(--rec-k))` — eles vivem dentro do palco escalado, então precisam da conta inversa. No retrato o palco JÁ é a janela e essas contas são desligadas (a 390px, `960px - 50vw` daria 765px e o véu iria parar fora da tela).
    - Verificado em **1400×800 (1.75:1)**, **1600×700 (2.29:1)** e **1000×900 (1.11:1)**: cenário, vídeo, sala, neblina e vinheta cobrindo os quatro cantos, véus tocando as bordas, e o conteúdo dentro da tela.
  - **Os nomes ficam num lugar só**: os arrays `SENIORS`, `GESTORES` e `EXECUTIVOS` no topo do `js/reconhecimento.js`. Vieram do dono em 2026-08-09 (`nomes pins/SENIORS.md`): **313 · 114 · 48**, ordem alfabética de ponta a ponta (as tabelas do .md correm alfabéticas **por coluna**, não por linha — lidas linha a linha sairiam embaralhadas). ⚠ **"Eduardo Voss Wotter" vinha duplicado** na tabela de Gestores e entrou uma vez só.
    - Páginas resultantes: Sênior **15**, Gestor **6**, Executivo **3** no desktop (21 por página); no celular 27/10/4 (12 por página). Nada disso mexe nas paradas da apresentação — ver o item da tecla em captura, logo abaixo.
  - **O TOTAL DO NÍVEL na tela de título** ("313 SÊNIORS"), pedido do dono em 2026-08-10: "coloque a quantidade total de cada um deles. Exemplo: XX Sêniors". Fica **só no ato 1**, abaixo do nome do nível, entrando aos `--rec-tTotal:2450` (depois de a última letra do título começar, antes de ela terminar) — na tela dos nomes o cabeçalho já é apertado e o rodapé é do contador de página. Sai de cena junto com o resto do texto porque mora dentro do `.rec-txt1`, que é quem apaga aos 780ms.
    - O **número nunca é escrito à mão**: é `nomes.length`. Trocar a lista de nomes já atualiza o total, então não existe aqui o "número visível com gêmeo escondido" que esta base já teve. O que é escrito à mão é só o **plural** (campo `plural` no `NIVEIS`), porque nenhuma regra automática acerta os três: SÊNIOR+S dá certo, GESTOR+S não.
    - Medido: **313 SÊNIORS · 114 GESTORES · 48 EXECUTIVOS**, em uma linha só, dentro da tela nas três configs (no celular a 16,38px, base em y=600 de 844).
  - **Sem legenda e sem botão Repetir** desde 2026-08-09 ("pode tirar essas nomenclaturas"). A faixa de baixo ficou com setas + contador, e o contador é o centro da linha.
    - ⚠ **Bug corrigido no mesmo dia, e ele é armadilha para qualquer elemento novo:** o keyframe `recSobe` termina em `transform:none`, e com `fill:both` esse `none` continua valendo depois da animação. Em quem se posiciona por transform isso APAGA a posição — medido, o contador ficava **193px à direita** do centro e as setas **31px abaixo** da linha delas. Quem se posiciona por transform tem de usar **`recSurge`**, que mexe só na opacidade.
  - **Véus de blur em gradiente** no topo e na base (`.rec-veu-topo` / `.rec-veu-base`), pedido do dono para o cabeçalho "não ficar chapado". O que faz ser gradiente e não faixa é a **máscara sobre o `backdrop-filter`**: o desfoque nasce forte na borda e some no meio, sem linha onde começa. São duas faixas e não a tela toda por causa do custo, e a classe `leve` (máquina fraca) fica só com o gradiente.
  - **O pin atravessa a varredura.** O dono: "quando a animação for apagando precisa exibir a imagem do pin ainda, pois está sem nada no fundo". Agora o ato 1 **não apaga inteiro** — some só o texto (`.rec-txt1`); o pin fica e **voa** até o lugar dele no cabeçalho. O destino é **medido em runtime** (`mediaVooDoPin`), não fixo: a largura do cabeçalho muda com o nome do nível, então o pin do cabeçalho não fica sempre no mesmo x. Verificado nos três: erro de pouso **0px**.
    - ⚠ Dois detalhes que já falharam: (1) a flutuação do pin desloca até 14px e tem de ser **congelada antes de medir**, senão entra inteira na conta; (2) o `recPinVai` precisa de **`opacity:1` nos dois quadros** — a regra base do `.rec-selo` é `opacity:0` e quem o acendia era o `recSeloEntra`, que o voo substitui. Sem isso o pin voava e pousava certinho, **invisível**.
  - **A cor sai do nível**, não é fixa: `luz` é a cor do pin daquele nível no `DATA` (Sênior verde `#22C55E`, Gestor laranja `#F97316`, Executivo azul `#38BDF8`). Todos os `rgba()` de brilho são gerados a partir dela em `pintar()`, num lugar só.
  - **O card é uma LINHA, não um quadrado** — ícone à esquerda, nome inteiro à direita. O pacote original era 5 colunas de cards quadrados com o nome espremido em 2 linhas de 18px; o dono viu a versão de celular e pediu o mesmo formato no desktop (2026-08-09).
    - **NO MÁXIMO 6 PÁGINAS, e o arranjo se escolhe sozinho** (pedido do dono, 2026-08-10: *"essa parte dos nomes, pode colocar no máximo 6 slides, adapte para no máximo 6"*). O Sênior tinha **14** páginas de 24; agora tem **6** de 53. `MAX_PAGINAS = 6` entra na `paginar()` como piso do teto (`max(teto, ceil(total/6))`), então o número de nomes por página só SOBE se for preciso — Gestor (5 páginas) e Executivo (2) não mudaram.
      - **O número de colunas deixou de ser 4 escrito à mão.** 53 nomes em 4 colunas dariam 14 linhas e card de **30px** — menos que uma linha de texto. Mais colunas = menos linhas = card mais ALTO, então a `arranjo()` anda de 4 a 7 colunas e para na primeira em que o card passa de 50px. Medido no mural de 1378×624: `53/pág → 4col=14lin=30px ✗ · 5col=11lin=42px ✗ · 6col=9lin=55px ✓` e `24/pág → 4col=6lin=91px ✓`. Resultado: Sênior em **6 colunas**, Gestor e Executivo seguem em 4.
      - **O MURAL CRESCEU para isso caber**: era `top:176; height:566`, virou `top:158; height:624`. Medido, havia 44px de folga sob o cabeçalho (que acaba em 146) e 48 sobre o paginador (que começa em 790) sem uso nenhum. São esses +58px que fazem o card de 9 linhas fechar em 55px em vez de 49. O reflexo do chão desceu junto (752 → 792). ⚠ **Os 1378×624 e os vãos 12/16 estão no CSS E no JS** (`MURAL_W`, `MURAL_H`, `VAO_COL`, `VAO_LIN`), porque é de lá que sai a contagem de colunas e a largura útil do texto. Mexeu num, mexa no outro.
      - **Card DENSO a partir de 6 colunas** (classe `rec-denso` na `.rec-tela`, posta pelo JS): padding 14→9/11, ícone 32→26, vão 12→9, line-height 1,22→1,18. Sem isso a soma padding + 2 linhas de 18px daria 58px num card de 55. Os mesmos três números vivem em `medidasDoArranjo()` no JS — é ele que calcula a largura útil passada ao `corpo()`.
      - ⚠ **A CURVATURA passou a encolher com o número de colunas.** O passo era 11° fixo, e a nota do autor do pacote dizia que a escala aparente da coluna externa não pode cair abaixo de 0,9 (sob isso o texto girado rasteriza pior). Com passo fixo a regra se rompia sozinha ao acrescentar coluna: ±16,5° com 4 (cos 0,959) mas **±27,5° com 6 (cos 0,887)** — abaixo do limite, e justamente no arranjo de letra menor. Agora o passo é o que mantém a externa em 24°: `min(11, 24/((colunas-1)/2))` → 11° com 4 colunas (idêntico ao de antes) e 9,6° com 6. **Medido depois: pior escala 0,91.**
      - **O CORPO DA FONTE PASSOU A SER MEDIDO, não estimado.** Até aqui a conta usava "largura média do caractere = 0,52 do corpo", uma estimativa do autor do pacote — e o comentário dele já dizia que o certo seria `canvas.measureText`. Virou obrigatório quando a coluna caiu para 220px: com essa folga um erro de 5% na largura deixa de ser detalhe e estoura o card. Agora cada nome é medido na fonte real, uma vez, a 100px de corpo (largura é linear no corpo, então uma medição serve para qualquer tamanho). ⚠ **A pilha de fontes está repetida no JS** (`FAMILIA`) e espelha a do `.rec-overlay` no CSS: medir com uma fonte e desenhar com outra é pior que estimar, porque o erro fica invisível até um nome específico estourar.
      - Medido nos três níveis, 1920×946 e 1536×750: **zero nomes cortados** (`scrollHeight` vs `clientHeight` em todos os cards), mural dentro da tela, último card 53px acima do paginador. No Sênior o corpo ficou entre **14,2 e 16px** (contra 17–21 dos outros dois) e **33 dos 53 nomes usam 2 linhas**.
      - **No CELULAR o teto de 6 NÃO se aplica**, de propósito: lá é uma coluna, o mural rola, e o teto vem da altura do aparelho (`tetoDoCelular`) para a página caber sem rolagem. 53 nomes numa coluna de celular exigiriam rolar dentro da página, e o modo apresentação — que é quem conta as páginas — **nem carrega no celular** (desktop-only por `matchMedia`). Conferido em 390×844: segue 35 páginas de 9, sem rolagem e sem nome cortado.
    - **Desktop (histórico): 4 colunas × 6 linhas = 24 por página.** Foram 3 colunas por algumas horas no mesmo dia, até o dono pedir a quarta. O custo, medido nos 475 nomes: a coluna cai de 451px para 336px e a largura útil de 379px para 264px, e **18% dos nomes (84 de 475) passam a usar duas linhas** — com 3 colunas nenhum usava. Por isso o arranjo é **4×6 e não 4×7**: um card de 2 linhas de 18px precisa de 72px de altura, e 7 linhas dariam 67px. Com 6 linhas o card fica com 81px. Páginas: Sênior **14**, Gestor **5**, Executivo **2**.
    - O número de colunas mora no JS (`colunas`), **não** no CSS: a coluna é `flex:1 1 0`. Mudar exige refazer três coisas nas mesmas linhas: a `curvatura()`, o teto da `paginar()` e a largura útil passada ao `corpo()`.
    - O tamanho da fonte vem de `corpo(nome, uteis)` com `uteis = 264` (336 de coluna − 28 de padding − 32 do ícone − 12 do vão) → `fs1 = 507/n`, teto 21. Aqui o clamp de 2 linhas **deixou de ser rede de segurança** e virou caso comum.
    - **Celular: quantos nomes cabem é CALCULADO do aparelho**, não fixo. Era 12 e isso escondia gente: medido em 390×844, a lista tinha 886px de conteúdo numa área visível de 666px — **220px, uns 3 nomes por página, abaixo da dobra**, e numa apresentação eles simplesmente nunca apareceriam. A `tetoDoCelular()` usa a altura da janela menos o cabeçalho (92px) e a faixa de baixo (86px), dividida por card (64px) + vão (10px). Confere com o CSS do retrato — mexeu num, mexa no outro. Dá 9 no iPhone 14, 6 no SE, 10 no Pro Max, 11 no iPad retrato; em todos **a página inteira cabe sem rolar**.
    - ⚠ **As bolinhas do paginador só aparecem até 8 páginas.** Com as listas reais o Sênior dá 35 páginas no celular, e medido em 390×844 as 35 bolinhas somavam 551px de largura numa tela de 390: **empurravam o contador para fora da tela** (nascia em x=390, invisível), tirando do apresentador a única indicação de onde estava. Acima de 8 fica só o contador.
  - **A TROCA DE ATO É MANUAL, não tem relógio** (ajuste do dono, 2026-08-09: "no próximo botão que vier ela apaga e aparece a próxima tela"). Até então um `setTimeout` de 5,4s levava sozinho do título para os nomes. Hoje o JS só põe a classe **`ato2` no overlay** — uma animação CSS começa no instante em que o nó ganha a propriedade, e é isso que dispara a coreografia inteira do 2º ato. Avança por **clique na tela, seta, ou o passo da apresentação**.
    - Os atrasos do 2º ato foram **rebaseados, não reescritos**: onde havia `tVarre + 780` há `780ms`; onde havia `tNomes + 700` há `1700ms`. Mesmo ritmo, outro gatilho. As variáveis `--rec-tVarre` e `--rec-tNomes` deixaram de existir.
    - A conta que amarra: a varredura dura 1,7s e cobre a tela aos **46% dela = 782ms**; por isso o ato 1 apaga e o 2 acende aos **780ms**, escondidos atrás do facho. Mexer na duração da varredura obriga a refazer esses dois números.
  - **A TROCA DE PÁGINA É OCULTAR, sem glitch** (pedido do dono, 2026-08-10: "tire o glitch dos nomes quando passa para as páginas, pode ocultar somente"). Saíram duas coisas: a **falha de sinal por card** (`steps(1,end)` com salto de até 18px, `skewX` e `brightness(2.8)`, escalonada por `--i`) e o **chiado de tela** (`.rec-ruido`, camada de tela cheia piscando em 6 degraus). Ficou opacidade e nada mais: `recSome` 160ms na saída, `recVolta` 200ms na entrada, **sem atraso por card** — todos ao mesmo tempo é o que significa "ocultar". A camada `.rec-ruido` continua no DOM com o CSS; religar é uma linha comentada no `irPara()`.
    - ⚠ **A ENTRADA DOS CARDS RODAVA DUAS VEZES, e isso era metade do "glitch"** — descoberto medindo em 2026-08-10, existia desde o pacote original. A regra base do `.rec-cartao` tem `animation:recAzulejo` **permanente** (é ela que faz a primeira exibição). Quando o `irPara()` tirava o `rec-entra`, o animation-name voltava para `recAzulejo` e o navegador **começava uma animação nova, do zero** — medido no card: `playState:"running"`, `currentTime:0`, e a regra base parte de `opacity:0`. Resultado: a página já montada apagava inteira e os nomes entravam **de novo**, deslizando, de 40 em 40ms. Corrigido com a classe **`rec-fixo`** (`animation:none; opacity:1`) no fim da troca. Ela tem **dois seletores de classe de propósito** — precisa vencer o `rec-sai` — e por isso o `irPara()` a remove ANTES de pôr o `rec-sai`; na ordem inversa a saída não aconteceria e os nomes trocariam de estalo.
    - A janela em que `irPara()` recusa input caiu de **1180ms para 400ms** (`T_SAIDA` 430→180, `T_ENTRADA` 750→220). Isso importa ao vivo: quem clica rápido perdia o segundo clique dentro do 1,18s e o sintoma era "às vezes não passa a página". **Os dois números espelham o CSS** — mexeu na duração lá, mexa aqui.
    - Verificado card a card, no desktop e no celular: clique → `rec-sai`/`recSome`; 300ms → `rec-entra`/`recVolta` já na página nova; 600ms → `rec-fixo` com **zero animações** e opacidade 1, e assim fica. Duas trocas seguidas funcionam (01→02→03 de 14 no desktop, 01→02 de 35 no celular) e o chiado não aparece em nenhum instante.
    - **O mural é montado no gatilho, não na abertura.** Se os cards nascessem no 1º ato, a cascata de entrada deles já teria acabado enquanto o apresentador ainda fala, e ao passar eles apareceriam todos de uma vez.
    - **Janela morta de 400ms** no clique depois de abrir: o gesto que abre a peça pode gerar um segundo `click` já com a tela cheia montada sob o dedo (clique fantasma do toque), e o título seria pulado no mesmo gesto.
  - **UMA parada de apresentação basta para a peça inteira**, por mais páginas de nomes que existam. Por isso acrescentar nomes (e páginas) **não** exige mexer nas paradas.
  - ⚠ **QUEM É O DONO DO AVANÇO — leia antes de mexer em qualquer coisa de teclado aqui.** Isto já quebrou duas vezes seguidas, de formas opostas:
    1. **Primeiro só o teclado era interceptado** (um `keydown` em fase de captura no `reconhecimento.js`). O dono avança pelo **BOTÃO da tela**, e o clique nunca passava por lá: a apresentação pulava a parada e **os nomes nunca apareciam**.
    2. A correção foi mover a decisão para o **`goNext`/`goPrev` do `presentation-mode.js`**, que pergunta à peça (`pecaConsumiu` → `IGREEN_RECONHECIMENTO.avancar()/voltar()`). Tecla, botão e roda passam todos por ali. **Mas o interceptador antigo continuou ativo** — e aí havia DOIS DONOS do mesmo passo: uma seta virava dois avanços e a peça ia do título direto para a **página 2**, pulando a 1. Medido na linha do tempo: `ato=1` → `ato=2 pag=1` aos 194ms → `pag=2` sozinho aos 2355ms.
    - **Regra final:** dentro da apresentação, quem manda é o `goNext`/`goPrev`. O `keydown` de captura do `reconhecimento.js` **sai de cena** quando `__pmode.isActive()` — ele só existe para o modo site, onde não há apresentação para perguntar nada.
    - Verificado nos três níveis com clique real no botão: um clique leva do título para a **página 1** (Sênior 1/14, Gestor 1/5, Executivo 1/2). E no modo site, sem apresentação, a tecla continua funcionando: 1ª → ato 2 página 1, 2ª → página 2.
  - **O pin é o arquivo de verdade** (`assets/pins/grad-*.webp`, 420×420), não mais o selo desenhado em SVG que veio no pacote — o dono pediu a troca e o autor do pacote já avisava que o desenho dele era o ponto mais fraco. O selo desenhado foi **removido**, não comentado: ele dependia de classes CSS que saíram junto, então um bloco comentado seria promessa falsa. O original está no zip que o dono mandou.
  - **Parede, chão e raios suavizados** (o dono: "as bordas muito grossas das paredes... dê uma suavizada... ou passe bem suave para realmente simbolizar uma parede"). O que mudou, com número: máscara das paredes agora fecha **nos dois lados** (pico de opacidade 100% → 72%); pico do pulso dos raios **0,95 → 0,48** e traço 2,6 → 2; grade do chão **.17 → .10**; horizonte nasce e morre antes das bordas. E entrou a **`.rec-neblina`**, um gradiente estático que come as quatro bordas do quadro e dissolve as quinas da caixa 3D — estática de propósito, sem `mix-blend-mode` nem `filter` de tela cheia.
  - **A linha de luz da esquerda fica em `left:0`**, na borda (era 250px). É de onde a varredura sai — com ela no meio do nada, a luz parecia nascer de outro lugar.
  - **VÍDEO DE ENERGIA NO FUNDO, um por nível** (pedido do dono, 2026-08-09: "aquele vídeo de energia de fundo, aquele que estava, porém nas cores de cada pin"). É o `bg-prod.mp4` — o mesmo loop do fundo da Órbita, 960×540, 10s.
    - **A cor está ASSADA NO ARQUIVO**, não filtrada por quadro: `assets/video/rec-energia-{senior,gestor,executivo}.mp4`, 142–153kB cada. Um `filter:hue-rotate()` em camada de tela cheia seria o trabalho por quadro que engasga — mesma decisão do gradiente do vídeo da sede. Receita: `-vf "format=gbrp,hue=h=<graus>,format=yuv420p"` com **+25° / −87° / +83°** a partir da matiz original de 108°. Medido depois: matiz do vídeo contra a do pin com **1 a 2 graus** de desvio.
    - ⚠ O `format=gbrp` ANTES do `hue` não é opcional — sem ele o ffmpeg gira a matiz em YUV e o vídeo sai **magenta**. Já aconteceu neste projeto.
    - `preload="auto"` e não `none`: o elemento só existe depois que a peça abre, então não há byte a economizar no boot — e `none` faria o `play()` falhar por falta de dados. **Verificado: zero requisições de `rec-energia*` no carregamento da página.** Ao fechar, o overlay é esvaziado e o vídeo morre junto.
  - **A barra de luz do topo (`.rec-luztopo`) foi removida** em 2026-08-09 ("img 2, a linha"): era uma faixa acesa de 820px logo abaixo do cabeçalho, com um brilho largo atravessando a cena. Quem dá atmosfera ali agora é o vídeo de fundo.
  - ⚠ **O pin voador precisa de `z-index` acima do véu de blur.** O `.rec-selo` mora no ato 1 (z-index 2), o **mesmo** do véu, e vem antes dele no DOM — então o véu pintava por cima e o pin sumia no fundo escuro (foi o "cadê os pins"). Resolvido com `.rec-overlay.ato2 .rec-ato1{ z-index:4; pointer-events:none }` — o `pointer-events` junto, senão o ato 1 passaria a comer o clique da tela inteira, que é o que faz a peça andar.
    - **`elementFromPoint` NÃO serve para investigar isso**: ele ignora elementos com `pointer-events:none`, então devolvia o pin como se nada o cobrisse. Foi um teste meu que mentiu.
  - **O nome do nível 0 é "Sênior", COM acento** (pedido do dono, 2026-08-10 — ele mandou a foto do título escrito `SENIOR` e a palavra certa). Ele vive em **dois** lugares, e os dois têm de andar juntos: `name:"Sênior"` no `DATA` do `index.html` (alimenta a pílula do gráfico, o tooltip, o rótulo da barra do mobile e o `alt` do pin) e `nome:"SÊNIOR"` no `NIVEIS` do `js/reconhecimento.js` (o título da animação e o cabeçalho do ato 2). O **arquivo** do pin continua `grad-senior.webp` sem acento e nada deriva o caminho de `name` — o comentário antigo que falava de `Ê = %C3%8A` era de quando derivava, e foi trocado.
    - Medido, porque acento em texto de 124px assusta: em Inter Display o **`Ê` tem exatamente a mesma largura de avanço do `E`** (73,02px a 124px), então `SÊNIOR` e `SENIOR` medem os **mesmos 441,27px** — a pílula do gráfico ficou nos mesmos 104px e o rótulo do mobile nos mesmos 36,4px, sem corte (`scrollWidth == clientWidth`). O acento sobe **23,18px acima da caixa** do E, o que passa 10px acima da linha do título — e ali sobram **30,1px** até o `.rec-chapeu` no desktop e **23,1px** no celular. Nada corta: o único ancestral com `overflow:hidden` é o `.rec-overlay`, que é a tela toda.
  - **nível** (a verdade): índice em `DATA` no `index.html`. **Sênior = 0 … Acionista = 4.** É a moeda de troca — todo mundo que pede uma galeria fala em nível: `b.i` do clique na barra (vem de `DATA.forEach(function(d,i)`), o `data-i` da coluna do mobile (vem de `DATA.map`) e o `lvl` do `buildStops`.
  - **barra no DOM**: criadas de trás pra frente (`for(i=DATA.length-1;i>=0;i--)`), então em `#gradBars` a **1ª é Acionista** e a última é Sênior → barra do nível `d` = `bs[(N-1) - d]`.
  - **slide no carrossel do modal**: `data-i` do `.gm-dot`, que é a posição **dentro do array `EVENTS`** (0..3) e é o que o `go()` do modal consome. **Não coincide mais com o nível**, porque o Sênior saiu de `EVENTS`.
  - ⚠ Por isso cada dot carrega **dois** atributos: `data-i` (slide) e **`data-lvl` (nível)**. Quem vem de fora — clique na barra, toque no mobile, `gradEventGo()` — procura por **`data-lvl`**. Eu tentei usar `data-i` para as duas coisas e o resultado foi **galeria deslocada em um**: pin GESTOR abrindo cruzeiro, EXECUTIVO abrindo a neve, ACIONISTA abrindo experience — sem um único erro no console. Medido e corrigido no mesmo dia (2026-08-04).
- **O SÊNIOR NÃO TEM GALERIA** (pedido do dono, 2026-08-04): o pin dele entra na apresentação, a galeria não. Quem tem galeria é declarado em **`window.GRAD_GAL_LEVELS`**, publicado ao lado do array `EVENTS` no `index.html` — é lá que a verdade mora, e o `buildStops` lê de lá para não criar parada morta (um clique que não faz nada). Sem essa lista o fallback é "todos têm". Nos dois cliques do site (barra no desktop, coluna no mobile) a trava é **sair antes de abrir** quando não existe dot: abrir primeiro e só depois procurar o slide mostraria a galeria de OUTRO nível. As fotos `treinamento-*` ficam no repositório sem uso; religar o Sênior é devolver a entrada em `EVENTS` com `lvl:0`.
  - ⚠ **"Sem dot" deixou de significar "nada acontece" em 2026-08-09.** Passou a significar **"este nível não tem FOTOS"**. Como o Sênior ganhou reconhecimento sem ganhar galeria, os dois cliques do site (barra no desktop, coluna no mobile) agora, ao não achar dot, consultam `GRAD_REC_LEVELS` e abrem a **animação** direto. Foi o que devolveu efeito a uma barra que estava muda desde 04/08 — verificado: clique na barra do Sênior abre a peça com o título `SÊNIOR` e `--rec-luz` em `#22C55E`.
- **Galerias × conteúdo real das fotos** (conferido foto por foto, porque os nomes das pastas enganam): `experience` = iGreen Experience · `cruzeiro` = navio · **`america-latina` = NEVE** (esqui, montanha, trem na neve) · **`mundo` = EUROPA** (Coliseu, Paris, Veneza, Pisa, Santorini, Londres). Não existe foto de **Dubai** nem do **Caribe** no projeto — o dono pediu Dubai para o Acionista "podendo mesclar com Europa", e Europa é o que está lá.
- A contagem das paradas sai das **barras**, não dos dots: o modal é montado em runtime e pode não existir quando `rebuildIndex()` roda — contar `.gm-dot` daria 0 e as paradas de galeria sumiriam sem erro nenhum. Nível novo entra nas duas coleções.
- ⚠ **Ao medir isto num navegador automatizado, espere as barras CRESCEREM** (~3s depois de chegar na seção). O `gradHover` dispara `pointerenter`, e o handler da barra ignora enquanto ela está abaixo de 85% da altura final — com espera curta a primeira parada parece morta e você "descobre" um bug que não existe (aconteceu: reportei duas paradas vazias que eram só medição apressada). O clique na barra tem a mesma trava, e por isso não dá para testá-lo com a página recém-carregada.

Para todas: se a seção aparece em `js/presentation-mode.js` com `subs` ou `buildStops`, a quantidade de itens afeta as paradas. Se aparece com `frame`, não afeta.

---

## Páginas internas — 4 `.cstep` (passo a passo)

São **muito mais simples**: sem pin, sem scrub, sem coreografia pesada. O que importa é outra coisa.

**O que realmente pesa aqui:**

1. **O desenho não pode sair do padrão.** Siga `DESIGN.md`: tokens do `:root`, Inter Display local, verde `#18FF00` com parcimônia, cartões com fundo quase transparente e borda `--line`, cantos generosos, brilho por `box-shadow` de raio grande. Nada de terceiros — nenhuma fonte externa, imagem de banco, CDN ou link de fora.
2. **Seção nova segue o layout existente.** Derive a estrutura das seções que já existem na própria página e dos tokens de acento (`--acc`, `--acc-glow`, `--acc-tint`, `--acc-line`) que dão identidade a cada conexão. Base sempre `produtos/template.html`.
3. **Responsividade e escala do monitor** — o ponto mais crítico que já ajustamos. Teste obrigatoriamente nas três: `1920x946x1`, `1536x750x1.25` (o mesmo 1920 com escala 125% do Windows) e `390x844x3`. **Altura é o que aperta**, não largura: algo perfeito em 946 de altura pode estourar em 750. Se não couber, **escale em runtime — não crie breakpoint** (ver `responsividade-guardian`).

**Apresentação nas páginas internas:** o passo a passo é dividido em 2 paradas quando tem 3 ou mais `.cstep` (`buildStops` divide `.cstep` enquadrando pelo `.sec-head`). Passar de 2 para 3 passos **muda o número de paradas**. Valide.

**Ao adicionar passo:** confira se há cascata por `nth-child`, se o texto continua caindo em 2 linhas nas 3 configs, e se as imagens têm `width`/`height` declarados.

---

## Rodapé — 7 `.ft-soc li` (lista de links)

Rótulo da coluna: **"Links importantes"** (`.ft-kicker`, renderizado em caixa alta por CSS). Era "Sociais" até 2026-08-04 — o dono trocou porque a lista deixou de ser só redes sociais quando entraram Escritório Virtual, Store e a Newsletter.

Estado em 2026-08-04: `001.` Instagram Licenciado · `002.` Instagram Cliente · `003.` YouTube · `004.` Escritório Virtual · `005.` iGreen Store · `006.` WhatsApp · `007.` **Newsletter** (`Promoções do Mês Vigente` → `https://igreenenergy.com.br/newsletter`).

Cada `li` é um `<a target="_blank" rel="noopener">` com três partes: `.n` (o número, escrito à mão — **item novo exige numerar à mão**), o rótulo em texto solto e `.ft-h` (o valor à direita), mais a seta `.arw`.

**Ao adicionar item:**
- **Use HTTPS.** Todos os 7 links são https; a página é https, e um link http é queda de protocolo. O dono passou o da Newsletter em `http://` e foi gravado em `https://`.
- **Numere à mão** o `.n` seguinte.
- ⚠ **Verificar o link com `curl` deste ambiente não funciona para `igreenenergy.com.br`:** o domínio devolve **403 até na raiz** (bloqueio de bot/WAF), enquanto os subdomínios `store.` e `escritorio.` devolvem 200. Ou seja, o 403 não distingue "página não existe" de "acesso barrado" — confirme num navegador de verdade. Foi assim que se verificou que `/newsletter` responde (título "Newsletter", servida via FlippingBook).

**Cascata da altura — o rodapé cresce PARA BAIXO, nada acima se move.** Medido a 1920×946 ao passar de 6 para 7 itens: topo do rodapé **29179 antes e depois**; `#planos`, `#graduacoes`, `#bonificacao` e `.pl-list .plan` com as caixas **idênticas**; `.ft-soc` sobe de 291 para 340px (+49, uma linha) e a página de 30168 para 30217. No mobile 390×844: 7 itens de 46px, página 17221 → 17267.
Isso importa porque a **3ª parada de `#planos`** na apresentação mira o rodapé (`footer.top - 60`): como o topo não muda, a parada não muda.

---

## Achado da auditoria de imagens (2026-07-26)

Varredura completa: **267 referências de mídia, todas existem no disco** — nenhum caminho quebrado em `index.html`, nas 8 páginas de produto ou no JS.

Das 183 `<img>` da index, percorrendo a página inteira:

- ~~**33 não carregadas mas ocultas** — carregam quando o modal abre. Esperado, não é defeito.~~ **ESTA CONCLUSÃO ESTAVA ERRADA** (corrigido em 2026-07-28). Elas **não** carregavam ao abrir o modal. Medido, abrindo o modal e clicando nas 5 medalhas: `treinamento` 8/8, `experience` 4/8, `cruzeiro` **0/8**, `america-latina` **0/8**, `mundo` **0/8** — 32 das 47 fotos jamais apareciam, e três galerias ficavam completamente vazias. É o **mesmo** bug dos tiles do clube (item abaixo): os 5 slides do modal ficam lado a lado por `translateX`, só o ativo está na viewport, e o `loading="lazy"` nunca dispara para os outros. Consertado liberando o lazy quando o modal abre (`liberaFotos()` em `openM`), com filtro `getClientRects()` para não baixar no mobile o lado direito que o CSS esconde. Verificado nas 3 configs: 52/52 no desktop, 27/27 visíveis no mobile (25 escondidas seguem sem baixar).
- **12 de 48 tiles do carrossel de logos do clube (órbita) nunca carregam.** São duplicatas do carrossel infinito posicionadas fora da tela na horizontal, e o `loading="lazy"` nunca dispara para elas. Efeito visível: quadrado de 142×142 em branco enquanto o carrossel gira. Arquivos existem (`club-*.avif/webp/png`).
  - **Não é o mesmo bug do fundo de moedas** (ali a caixa tinha altura 0 e a imagem nunca aparecia). Aqui a caixa tem tamanho e o problema é só o disparo do lazy num elemento que vive fora da viewport horizontal.
  - **Conserto quando o dono quiser:** tirar o `loading="lazy"` desses tiles (são pequenos — os avif somam poucas dezenas de kB) ou pré-carregar quando a órbita se aproxima. Custa alguns kB no carregamento e resolve o branco. Decisão de peso é do dono.
- **Nenhuma outra imagem visível deixou de carregar.** As 76 ocorrências de `lazy` sem `width`/`height` **não** estão quebradas hoje — mas continuam sendo a condição que apagou o fundo de moedas, então declare dimensões em imagem nova.

---

## ⚠ Arquivo externo que muda de conteúdo TEM de mudar de URL (2026-08-04)

Sintoma do dono, palavras dele: **"somente no modo apresentação que ficou a ordem das viagens errada; no clique tá ok"**. Eu já tinha medido a apresentação e ela passava — e passava mesmo, no meu navegador.

**Causa: cache do navegador dele.** O caminho do clique é **inline no `index.html`** (ele recebeu a versão nova junto com a página). O caminho da apresentação vem de **`js/presentation-mode.js`, arquivo externo** — e nenhuma URL local do projeto tinha versão, então o navegador reaproveitou a cópia antiga. HTML novo rodando JS velho.

Reproduzido de propósito, servindo o `index.html` novo com o `presentation-mode.js` anterior:

| pin | galeria que abria | correto |
|---|---|---|
| Sênior | Experience | nenhuma |
| Gestor | Cruzeiro | Experience |
| Executivo | neve | Cruzeiro |
| Diretor | Europa | neve |
| Acionista | Europa (repetida) | Europa |

Exatamente "as viagens deslocadas em um, e uma repetida". **Zero erro no console** — o índice antigo (`data-i`) simplesmente casava com o dot errado.

**Correção:** todas as 50 referências a `js/*.js` e `css/*.css` (index + 8 páginas de produto, incluindo o `pm.src=` dinâmico) passaram a levar `?v=20260804`. Script: `node .claude/scripts/versionar-assets.js <versao>` — conta antes, aborta se a contagem não bater, trabalha linha a linha e preserva CRLF.

**Ao mexer em qualquer arquivo de `js/` ou `css/`, suba o `?v=`.** O `antes-de-commitar.js` avisa se você esquecer, e também se aparecer URL sem versão. Detalhe do detector que custou uma volta: ele precisa exigir `src=`/`href=` com as aspas, senão conta as **menções em comentário** ("o IntersectionObserver do js/video-inview.js, que…") e o aviso sai falso.

**Lição mais geral, que vale para além deste caso:** quando o sintoma aparece **só em um dos caminhos** que fazem a mesma coisa, compare o que é *inline* com o que é *arquivo externo* antes de procurar erro de lógica. Aqui a lógica estava certa nos dois — o que diferia era a idade do código.

---

## Agenda da semana (`#agenda`) — 2026-08-09

Seção nova, **depois da Bonificação e antes do rodapé**. Vem do pacote `Agenda_Carrossel.zip`:
um **Web Component** (`<igreen-agenda>`) com Shadow DOM, zero dependência, zero CDN, zero
requisição externa. Diferente do reconhecimento (que veio em React e precisou de porte
inteiro), este entra praticamente como está — o Shadow DOM garante que o CSS deste site não
entra nele e o dele não sai.

- **Onde a ordem é decidida:** no `#reorder-secoes` (fim do `index.html`), na lista
  `['planos','graduacoes','bonificacao','agenda']`. O lugar do HTML **não** decide nada.
- **Os dados ficam EMBUTIDOS** num `<script type="application/json">` dentro do elemento, e
  não no `src` que o componente também aceita. Duas razões: uma requisição a menos e, sobre
  tudo, `src` quebraria em `file://` por CORS — e este projeto é aberto assim o tempo todo.
  São os 9 treinamentos em 5 dias da arte oficial (Seg 2 · Qua 3 · Qui 1 · Sex 2 · Sáb 1).
- **`auto="off"` é pedido explícito:** "ela não fica passando de forma automática". Quem
  troca o dia é quem apresenta — clique, seta, ou o passo da apresentação.
- **Apresentação: uma parada por dia**, todas no mesmo `y` (o mesmo desenho das Graduações).
  É isso que atende "a cada toque no teclado, a cada scroll do mouse, muda o dia". A
  contagem vem de `ag.dados` e **não** de contar nós: os círculos vivem no Shadow DOM e
  `querySelectorAll` de fora não os alcança. Total da apresentação: **56 → 61 paradas**.
- A parada **centra a seção na tela** (`(innerHeight - offsetHeight)/2`) em vez de encostar
  o topo: com o cabeçalho fora a seção cabe inteira, e centrar é o que garante que nem o
  carrossel nem os cards de horário fiquem na beirada.

### Três defeitos do pacote, corrigidos aqui

O autor avisou no README: *"Nunca renderizei isto em browser."* O preço apareceu na primeira
carga.

1. **Uma chave `}` a mais fechava o `:host` cedo demais.** As quatro declarações seguintes
   (`display:block`, `background`, `font-family`, `overflow`) viravam órfãs e o navegador as
   descartava. Sem `display:block` um custom element vale `display:inline` — a seção nasceria
   sem altura e sem fundo.
2. **A casca era montada duas vezes.** O `connectedCallback` dispara toda vez que o elemento
   entra no DOM, e **mover** um elemento é removê-lo e inseri-lo de novo — que é justamente o
   que o `#reorder-secoes` faz. Medido: seção com **1839px** em vez de 932px, dois carrosséis
   empilhados. Consertado com uma guarda de idempotência no `_montarShell()`.
3. **O logo era desenho do autor** ("aproximando a lâmpada-G, sem o arquivo oficial"). O
   `DESIGN.md` é taxativo quanto a logo inventado. Trocado pelo `assets/logos/igreen-logomarca-neon.svg`,
   o mesmo do rodapé — e o texto "iGreen / Academy" do componente virou só "ACADEMY", porque
   a logomarca oficial já traz a palavra e ficava duplicada.

### Quarto defeito do pacote: o card curto ficava deformado

O `<li>` de cada treinamento é **item de grid e estica** até a altura da linha — o card de
"(APN) Plano de Negócios" tem 2 linhas de texto, o de "Start iGreen" tem 1, e os dois ficam
com a mesma altura. Mas o `.miolo` (a caixa opaca de dentro) tem **altura de conteúdo**:
sobrava um vão no fim do card curto, e por ele aparecia o `.anel` — o conic-gradient
giratório que serve de moldura. Na tela isso lia como uma **mancha verde no rodapé do
segundo card**, e só nele.

Consertado com `display:grid` no `<li>`: o miolo vira item e estica junto, cobrindo o anel e
deixando à mostra só a moldura de 1,5px. Medido depois, nos dias de 2 e de 3 treinamentos:
card 88px, miolo 85px, **vão no fim = 0** em todos.

### Ajuste fino pedido depois de ver no modo apresentação

- **Cabeçalho: só o título, centralizado.** Em duas rodadas no mesmo dia. Primeiro saiu
  inteiro ("retira aquelas palavras treinamentos e o iGreen academy"), liberando os ~110px
  que faltavam; depois o dono pediu "coloca em cima Agenda Oficial como título". Hoje: a
  logomarca e o subtítulo ficam escondidos e sobra **uma linha centralizada, "Agenda
  Oficial"** — o texto vem do atributo `titulo=` no elemento, não do CSS.
  - Isso exigiu **expor partes novas** no componente (`part="marca"`, `part="titulo"`,
    `part="subtitulo"`): sem elas o site não alcança esses pedaços. É o único caminho —
    `::part()` e custom property são as duas únicas portas de entrada de um Shadow DOM.
- **Círculos menores**: `--D` de `min(30cqw,34vh)` teto 320 para `min(24cqw,24vh)` teto 240.
  Com o padrão, numa tela de 800px de altura o conjunto passava de 900px e as atividades
  ficavam abaixo da dobra. Com o título de volta em cima, medido: **697px numa janela de
  750** — cabe inteiro, título, dia e atividades juntos.
- ⚠ Os dois ajustes moram no `<style id="agenda-ajuste">` do `index.html` e atravessam o
  Shadow DOM pelos **únicos dois caminhos que existem**: custom property e `::part()`.
  Não existe (nem deve existir) CSS do site entrando na peça por outro caminho.

## Destaques (`#destaques`) — 2 telas

Carrossel horizontal de três artes, **abaixo da Agenda e antes do rodapé**. Pedido do dono:
*"adicione uma nova seção abaixo da agenda, onde será um carrossel que passará por clique e
no modo apresentação também... rolado na horizontal. E depois que passar a última ela
continua para a última seção."*

- **A imagem É o conteúdo.** Ele disse "que será em si a seção", então não há título nem texto
  do site por cima. São `iGreen Creator` e `Escritório Virtual`. ⚠ Havia uma 3ª tela, `iGreen
  Summit`, retirada com a seção do mapa (ver o aviso no topo deste arquivo).
- **Arquivos:** `assets/img/destaques/creator.jpeg` e `escritorio-virtual.jpeg`.
  Guia para o dono em `assets/img/destaques/COMO-COLOCAR-AS-ARTES.md`. **Entregue sem as
  artes** (ele mandou por imagem no chat, não por arquivo): cada tela sem arquivo mostra uma
  **moldura tracejada com o nome e o caminho exato** — a seção já é navegável e documenta ela
  mesma o que falta, em vez de exibir um retângulo preto.
- **Comportamento em `js/destaques.js`; HTML e CSS junto da seção no `index.html`.**
  Acrescentar ou remover tela é acrescentar ou remover um `<figure class="dq-tela">`: as
  bolinhas e as paradas da apresentação são contadas em runtime a partir do HTML.
- ⚠ **NÃO existe `overflow-x:scroll` aqui.** O "rolado na horizontal" é `transform:translateX`
  no trilho. Barra nativa dentro de uma página com ScrollSmoother é duas mecânicas disputando
  o mesmo gesto, que neste projeto sempre acabou em briga.
- **Quatro caminhos, um só lugar de decisão (`vaiPara`)**: seta, bolinha, clique na própria
  arte (com Shift volta) e a apresentação. Verificado: seta → tela 2, clique na arte → tela 3,
  clique na arte no fim **não dá a volta** e a seta fica desabilitada, bolinha 1 → tela 1.
- **`avancar()` devolve `false` no fim**, e é isso que faz a apresentação seguir para a seção
  seguinte em vez de ficar presa. Dar a volta para a primeira prenderia a apresentação num laço.
- **Paradas: 3, todas no MESMO y** (a seção enquadrada e centrada, como a Agenda). Ficando no
  mesmo y, o `activeStops.sort()` — estável — mantém a ordem em que entram. A parada da tela 1
  chama `ir(0)`, e não só enquadra: voltando do rodapé, o carrossel tem de voltar à tela 1.
- **Entrou também a seção 'Encerramento' (`#rodape`)**, uma parada de enquadramento, porque o
  pedido foi que depois da última tela a apresentação "continua para a última seção". Sem ela
  a última tela seria o fim e o clique seguinte não faria nada — parecendo travamento.
  Total de paradas: **162** (Destaques 3 + Encerramento 1).
- ⚠ **O `loading="lazy"` das telas 2 e 3 pode nunca disparar** — elas saem da janela na
  HORIZONTAL, e é o mesmo desenho que já deixou 12 dos 48 logos do clube e 32 das 47 fotos da
  galeria de eventos sem carregar. Aqui o conserto **não** é IntersectionObserver (não dá para
  vê-lo disparar no pane automatizado, que quase não gera quadros): a tela 1 usa o lazy nativo,
  que é confiável porque a caixa dela está no fluxo; e uma **corrente de `load`** já busca a
  seguinte, com o `vaiPara()` tirando o lazy da que entrou como cinto e suspensório.
  **Medido: zero requisição de `/destaques/` no boot**, e ao ir para a tela 2 a 2 e a 3 já
  foram pedidas.
- **O lugar na página é decidido pelo `#reorder-secoes`**, não pelo HTML: `'destaques'` entrou
  na lista dele entre `'agenda'` e o rodapé. Medido depois: a única coisa que se moveu na
  página foi o rodapé, **exatamente +946px** (a altura da seção nova); 24 ScrollTriggers e os
  7 pins com os mesmos start/end.

## Resolução das artes de apresentação — RESOLVIDA no mesmo dia (2026-08-10)

O dono relatou que "as imagens todas do ecossistema perderam muita a qualidade". **Medido: a
perda não era do site, era do arquivo** — os 96 slides do ecossistema e as 3 artes dos
Destaques vinham em **720×405**, e o visor desenhava a 1442px: ampliação de **2,00×**, que em
texto pequeno sempre deixa a borda mole. Não havia conserto no CSS (reduzir a moldura para
720px devolveria nitidez e deixaria a arte minúscula numa tela de 1920).

**Ele reexportou o deck em 1920×1080 e sobrescreveu tudo.** Conferido arquivo por arquivo com
`sips`: 96 + 3 artes, todas 1920×1080. O fator virou **0,75 — REDUZ em vez de ampliar**, que
é a condição em que a imagem fica nítida. Nada no código precisou mudar além dos `width`/
`height` declarados no `<img>` do visor (720×405 → 1920×1080; a proporção é a mesma, então
nenhum layout dependia disso, mas número declarado que não bate com o arquivo é armadilha
para quem vier depois).

⚠ **AS CAPAS VOLTARAM junto com a reexportação** — Slide1, 12, 18, 25, 41, 65 e 90 estão de
novo nas pastas. Não é problema: as faixas do `FOTOS` começam um número depois, então elas
continuam fora das galerias sem ninguém precisar mexer em arquivo. A pasta `_capas/` que
guardava as cópias antigas foi removida — eram duplicatas em 720×405 das que voltaram em
1920×1080, e manter arquivo velho com o mesmo conteúdo em resolução pior é convite a erro.

### O custo, medido
| | antes (720×405) | agora (1920×1080) |
|---|---|---|
| pasta do ecossistema | 6,5MB | **30MB** |
| Destaques (3 artes) | 268kB | **1,2MB** |
| por slide | ~80kB | **~310kB** |

**No carregamento da página continua ZERO** — verificado depois da troca: nenhuma requisição
de `/ecossistema/` ou `/destaques/` sai do boot, e abrir o visor pede duas (a da tela e o
pré-carregamento da seguinte). O que cresceu é o peso do REPOSITÓRIO, e isso importa aqui: o
remoto `empresa` já passou por uma limpeza de 452MB. **Converter para webp cortaria 60-70%
sem perda visível** — era o plano registrado desde o começo ("a conversão para avif/webp entra
depois dos jpeg"). Fica como próximo passo sugerido, não feito sem o dono pedir.

## Reconhecimento em IMAGENS — Diretor e Acionista (2026-08-10)

Pedido do dono: *"preciso adicionar um popup, ao invés dos nomes, em específico Diretores e
Acionistas deve ser imagens... a estrutura é a mesma, só que ao invés dos nomes, após o vídeo,
serão as imagens para esses dois."*

**Existem agora DUAS peças de reconhecimento, divididas por nível, e as listas são disjuntas:**

| peça | níveis | lista de verdade | arquivo |
|---|---|---|---|
| mural de NOMES | Sênior, Gestor, Executivo | `window.GRAD_REC_LEVELS` | `js/reconhecimento.js` |
| visor de IMAGENS | Diretor, Acionista | `window.GRAD_REC_IMG_LEVELS` | `js/reconhecimento-imagens.js` |

⚠ **As duas listas TÊM de continuar disjuntas.** Um nível nas duas geraria dois passos no mesmo
ponto do fluxo, e o apresentador veria a arte e o mural disputando a tela.

- **Por que peça nova e não um "modo imagem" na de nomes:** a de nomes é um teatro de dois atos
  (pin voando, varredura, mural com curvatura 3D, reflexo, paginação calculada pela largura do
  nome). Nada disso serve para arte pronta, e enfiar um modo lá dobraria a complexidade do
  arquivo mais delicado do projeto. O visor é o mesmo desenho já validado no do ecossistema —
  de propósito: mesma mecânica, nada novo para o apresentador aprender.
- **Arquivos:** `assets/img/reconhecimento/{diretor,acionista}/`. Guia para o dono em
  `assets/img/reconhecimento/COMO-COLOCAR-AS-ARTES.md`. **A ordem é a da lista `arquivos`, não a
  do disco**, e a **primeira é a CAPA** ("RECONHECIMENTO DIRETOR"). Nome livre: quem escreve a
  lista sou eu depois de ler a pasta.
- **Entregue com as listas vazias** (o dono mandou as artes por imagem no chat, não por
  arquivo): nesse estado `abrir()` recusa, o nó nem é criado, e a apresentação segue com as
  **17** paradas de sempre em Graduações e **165** no total.
- **Paradas: UMA POR ARTE**, depois da capa de vídeo, todas no mesmo y das outras da seção.
  Diferente da peça de NOMES, que é uma parada só e consome os avanços por dentro
  (`pecaConsumiu`) — aqui o modelo é o do visor do ecossistema, uma parada por passo.
  Medido com 5 artes de teste no Diretor e 2 no Acionista: Graduações 17 → **24**, total → 172,
  e a sequência ação por ação: `pin Diretor · galeria · capa vídeo · IMG 1/5 … 5/5 · pin
  Acionista · galeria · capa vídeo · IMG 1/2 · 2/2`.
- **Quatro lugares passaram a conhecer as duas peças**, e é a soma deles que evita gesto morto:
  o **rótulo** do botão da galeria (`temRec` virou a união das duas listas — antes diria "Ver
  vídeo" no Diretor), o **texto da capa de vídeo** (`segue` usa a união, senão o cartão diria
  "volte às fotos" e o clique levaria às artes), o **roteador `abreRec`** (um lugar só decide
  qual peça abre) e o **fechamento em cascata** (`gradTudoClose`, o `closeM` da galeria e a
  guarda de teclado dela).
- Há também um **`abreRecGlobal`** no `index.html`, para o clique na barra do gráfico e o toque
  na coluna do mobile, que vivem fora do escopo do `buildEventsModal`. Ele prefere o
  `GRAD_REC_FLOW.abrirReconhecimento` justamente para não criar um segundo lugar decidindo.
  Hoje só o Sênior chega lá (os dois de imagem têm galeria), mas somar as listas evita o
  silêncio do dia em que um nível de imagem perder a galeria.
- **A cor sai do nível:** Diretor prata `#cbd5e1`, Acionista dourado `#f5c542`, iguais às do
  `DATA` da escada. ⚠ Repetidas no JS da peça porque o `DATA` vive num IIFE e não é publicado.


## ⚠ DISCO LARANJA CHAPADO EM DUAS ARTES — e o erro de diagnostico que eu cometi (2026-08-10)

O dono mandou uma captura do visor do ecossistema com um **disco laranja enorme** sobre a arte
e disse "remova esse".

**Eu havia dito, na entrega anterior, que aquilo era artefato de pintura do pane automatizado.
Estava ERRADO.** A varredura que eu tinha feito procurava elemento com `border-radius` redondo e
fundo laranja, e nao achou nada — mas ela nao podia achar: **o disco esta DENTRO do .jpeg**,
achatado sobre a foto. Nenhuma busca no DOM ia encontrar. A licao pratica: quando a evidencia e
uma captura do dono, o `elementFromPoint` e a varredura de DOM sao o segundo lugar a olhar; o
primeiro e **abrir o arquivo**.

**Como foi achado de verdade:** medindo a fracao de pixel laranja forte de cada arte num canvas
(r>195, g entre 85 e 165, b<95, r−b>110). Os dois casos saltam:

| arte | laranja na tela | o que o disco cobre |
|---|---|---|
| `livre/Slide19.jpeg` | **12,9%** | ceu/campo, ao lado da turbina |
| `seguros/Slide80.jpeg` | **13,0%** | o torso do Gusttavo Lima, no slide do SORTEIO |

Os outros 90 ficaram entre 0 e 5,2% — conteudo quente legitimo (pele, reflexo em cromado, luz).
O maior falso positivo foi `livre/Slide24` (5,2%), a capa dos destaques: e o reflexo de uma foto
de cidade dentro da lampada cromada, conferido abrindo o arquivo.

**Acao tomada:** os dois slides sairam das galerias. Nao da para tirar o disco sem editar a arte
— e inpintar ceu e pele em cima de material de marca seria pior que o problema.
- `livre` ja usava lista explicita: bastou tirar o `"Slide19"`.
- `seguros` **virou lista** por causa disto: era faixa `66-85`, e faixa contigua nao permite
  pular um numero do meio.
- **Os arquivos continuam nas pastas.** Devolver = reexportar sem a forma, sobrescrever, e por o
  nome de volta na lista (o `Slide80` entre o 79 e o 81).
- ⚠ **O `Slide80` e o primeiro candidato a voltar**: ele carrega o sorteio do cruzeiro, com
  datas e a regra das 5 indicacoes. Sair da apresentacao e perda de conteudo, nao so de estetica.

Contagem depois: Livre 8, Seguros 19, total em galeria **90**. Ecossistema 106 -> **104**
paradas, total 165 -> **163**.

## Diretor e Acionista na PEÇA ANIMADA, e o visor separado desfeito (2026-08-10)

Pedido do dono, no mesmo dia em que ele pediu o visor de imagens: *"as animações, quando eu
clicar no vídeo, deve ter a sequência IDÊNTICA dos sêniors e executivos; adicione essas
animações tanto no Diretores quanto no Acionista."*

**Isto DESFEZ a entrega anterior** (uma peça separada, `js/reconhecimento-imagens.js`, com uma
parada por arte). O motivo é simples e vale registrar: **a forma de a sequência ser idêntica é
ser o MESMO código**, não uma imitação. Então Diretor e Acionista entraram no `NIVEIS` do
`js/reconhecimento.js`, e o 1º ato — pin voando, data, RECONHECIMENTO, nome do nível, total,
varredura de luz — passou a ser literalmente o mesmo. O que muda é só o 2º ato.

| nível | 2º ato | fonte |
|---|---|---|
| Sênior, Gestor, Executivo | mural de nomes | `nomes:[...]` |
| **Diretor, Acionista** | **uma arte por passo** | `imagens:[...]` |

- Um nível tem `nomes` **ou** `imagens`, nunca os dois; é o que o `ehImagem()` consulta.
- **`GRAD_REC_LEVELS` virou `[0,1,2,3,4]`** e, com isso, tudo que consumia essa lista voltou a
  ter um caminho só: o rótulo do botão da galeria, o texto da capa de vídeo, o `abreRec`, o
  fechamento em cascata. Os quatro remendos da versão de duas peças foram removidos.
- **Paradas: UMA por nível** (a peça consome os avanços por dentro, via `pecaConsumiu`), como
  nos três primeiros. Graduações foi de 17 para **19**.
- **As capas NÃO entram na pasta**: a capa do deck é exatamente o que o 1º ato desenha animado.
  O dono já mandou os arquivos sem elas (Diretor `Slide101..114`, Acionista `Slide116`).
- **O total do 1º ato sai de `quantos(n)`** — nomes ou artes — e cai para o singular quando é
  um só: medido, "14 DIRETORES" e "1 ACIONISTA".

### A TELA FINAL do Diretor, com play ilustrativo (2026-08-10, mais tarde)

Pedido: *"insira essa imagem como a última e simule um play ilustrativo e depois em outro click
ele sai e continua normal para o gráfico"*. A arte é
`diretor/SlideUltimo_telaVideoComPayIlustrativo.jpeg` (1920×1080, 308kB) e mostra uma moldura
vertical de vídeo à esquerda com o pin DIRETOR e "Viagem Internacional" à direita.

- ⚠ **Ela NÃO entrou em `imagens`.** É um campo separado, `telaFinal:{arquivo,play}`, e isso é o
  ponto mais importante deste bloco: `imagens.length` é o que o 1º ato anuncia no total. Como 15º
  item da lista, o título passaria a dizer **"15 DIRETORES"** — e a 15ª não é um diretor, é uma
  tela de vídeo. Com o campo separado, `quantos()` continua certo **por construção**, sem ninguém
  precisar lembrar de subtrair 1. Medido depois da mudança: **"14 DIRETORES"**, e o paginador
  em **15/15**.
- Duas contas agora, e elas são diferentes de propósito: `quantos()` conta **gente**,
  `qtdArtes()` conta **telas**.
- **O play não toca vídeo nenhum** — sem elemento de vídeo, sem iframe, sem requisição. É a mesma
  sinalização do cartão `.recvid` da capa. São três coisas: botão de play, anel que pulsa, e uma
  **barra de progresso** que corre 9s e para cheia. A barra é o que faz a tela ler como *tocando*:
  sem ela, um play parado lê como **pausado**, e o pedido era simular o play.
- **Onde o play cai foi MEDIDO no arquivo**, decodificando o jpeg e procurando onde o fundo escuro
  termina: moldura em **x 100–663, y 48–1031** de 1920×1080 (563×983, proporção 0,57 — 9:16 é
  0,5625). Viraram as quatro frações do `PLAY_CAIXA`, no JS. Reexportou a arte com a moldura em
  outro lugar? **Meça de novo**, não estime.
- **A `.rec-artebox`** (div nova em volta da arte) existe só para o play ter coordenadas **da
  arte** e não do mural: no desktop os dois coincidem, mas no retrato o mural é uma caixa alta com
  a arte centrada dentro, e a porcentagem cairia longe. `aspect-ratio:16/9` resolve os dois — e só
  funciona porque **todas** as artes são 1920×1080.
- **`pointer-events:none` no overlay.** Sem isso o clique seguinte morreria justo nesta tela, que é
  metade do pedido.
- **O nó é recriado** a cada vez que a tela final aparece, e removido nas outras: animação de CSS
  não reinicia sozinha (a segunda passada mostraria a barra já cheia), e fora desta tela não fica
  anel pulsando atrás de arte nenhuma.
- **Paradas: não mudou nada.** 169 no total, Graduações 19 — a peça consome o passo por dentro.
  `avancar()` devolve **false** na última arte, que é o sinal lido pelo `pecaConsumiu`; a parada
  seguinte é o pin do Acionista, cuja ação é `gradTudoClose()`, que fecha o reconhecimento e volta
  ao **gráfico** com o pin seguinte aceso. É o "continua normal para o gráfico" do pedido.
- **Defeito encontrado medindo, e corrigido:** a barra usava `forwards`, e nos 350ms de atraso ela
  ficava **sem transform** — o que a renderiza **cheia**. Ela saltava de cheia para vazia quando a
  animação começava. Virou `both`, que aplica o `from` durante o atraso. Medido depois: 0 em
  0ms/100ms/349ms, 25% em 2600ms, 100% em 9350ms, e segura cheia.
- ⚠ **Não foi possível medir o play em movimento** neste ambiente: com o painel oculto o relógio de
  animação do documento congela (timeline em 82.385ms contra 160.531ms de tempo real). A forma da
  animação foi medida dirigindo o `currentTime` pela mão. Se ficou fluido, só o notebook do dono
  responde.
- ⚠ **O Acionista NÃO tem tela final** — conferido: 1 página, "1 ACIONISTA", sem play. Para dar uma
  a ele, é acrescentar `telaFinal` no nível 4 e pôr o arquivo em `acionista/`.
- **Dois vídeos de energia novos**, assados com ffmpeg a partir do `bg-prod.mp4` como os outros
  três: `hue=s=0` para o Diretor (prata **não é matiz**, é ausência de saturação) e
  `hue=h=-63` para o Acionista (108° → 45°, dourado). 109kB e 134kB.
- **A moldura do 2º ato em imagem**, no palco de 1920×1080: o cabeçalho acaba em 146 e o
  paginador precisa de ar, então sobra a faixa 158→990 = 832px de altura, que em 16:9 dá 1479px
  de largura, centrada em x=220. O paginador desceu de 790 para **1012** porque no lugar antigo
  cairia dentro da arte. As setas ficaram: medido, a da direita ocupa 1738→1800 e a moldura
  termina em 1699.
- O **reflexo do chão sai** no modo imagem (por CSS): ele espelha colunas de cards, e refletir
  uma foto inteira de cabeça para baixo é outro efeito, não o mesmo.
- ⚠ **COLISÃO DE CLASSE, achada medindo:** eu batizei a imagem de `.rec-arte` — e `.rec-arte`
  **já existia**, é a camada de arte das paredes e do teto da sala 3D. O sintoma foi um teste
  meu lendo `document.querySelector('.rec-arte')` e achando a parede em vez da foto; o dano real
  seria o CSS (`width/height/object-fit/border-radius`) atingindo as três paredes sempre que o
  modo imagem estivesse ativo. Renomeada para **`.rec-artefoto`**. Antes de criar classe nova
  neste arquivo, faça um `grep` — ele tem muitas.
- ⚠ **`avancar()` devolve `true` mesmo quando o `irPara()` recusa** (durante os 400ms da troca
  de página, `fase !== "parado"`). É pré-existente e foi deixado assim de propósito: devolver
  `false` faria a apresentação pular para a parada seguinte no meio de uma troca, que é pior que
  absorver o clique. **Mas não chame `avancar()` em laço apertado** — foi assim que eu travei o
  navegador durante o teste.

## TOP 10 Green Points (`#top10`) — 2026-08-10, ⚠ DESATIVADA EM 2026-08-12

🚫 **A SEÇÃO ESTÁ FORA DO AR.** O dono pediu em 2026-08-12: *"a imagem anexo retire essa
secao"*, com o print da tabela TOP 10 Green Points em anexo. Ver a seção "TOP 10 DESATIVADA"
no fim deste mapa. O que está descrito abaixo continua verdadeiro sobre COMO a seção funciona
— serve para reativá-la — mas **ela não aparece na página nem na apresentação hoje**.

Arte única **entre a Bonificação e a Agenda**, a pedido do dono ("essa tabela precisa ficar ao
meio, uma seção"): o trecho entre o último carro e a Agenda era um vão, e era esse vão o
"preciso melhorar isso". Uma parada na apresentação, centrada.

- Arquivo: `assets/img/top10/top10-green-points.jpeg` (guia na pasta). Sem arquivo, a seção
  mostra moldura tracejada com o caminho — não retângulo preto.
- **A ordem aparece em DOIS lugares e os dois têm de concordar**: a da página no
  `#reorder-secoes` do `index.html`, e a da apresentação na posição da entrada no `SECTIONS`.
  `'top10'` entrou entre `'bonificacao'` e `'agenda'` nas duas.
- ⚠ **A entrada 'Planos' tinha um TERCEIRO passo que enquadrava o RODAPÉ**, e ele saiu agora:
  com a seção 'Encerramento' (criada para o pedido dos Destaques), o rodapé era enquadrado duas
  vezes seguidas — e o segundo aparecia rotulado **"Planos"** depois dos Destaques, porque o
  `activeStops` ordena por y e aquele passo era clampado para o fim da página (medido: y=32241
  num maxY de 32393). Planos foi de 3 para 2 paradas.

**Estado medido em 1920×946 depois de tudo:** altura 33.339px, 24 ScrollTriggers, **166
paradas**, ordem `Início > Resultados > Trajetória > Sede > Ecossistema > Simulador > Órbita >
Planos > Graduações > Bonificação > TOP 10 > Agenda > Destaques > Encerramento`, e **zero
requisição** de `/reconhecimento/` ou `/top10/` no carregamento.

### Green e Solar ganharam os destaques (2026-08-10)

- **Green virou lista**, pelo mesmo motivo da Livre: três telas de TOP 3 com nome próprio
  (`SlideTop1..3`). ⚠ **A ordem: `Slide40` é a CAPA** ("TOP 3 CONEXÃO GREEN — Performance",
  troféu) e vem ANTES dos três. Conferido abrindo os arquivos, não pelo nome — por nome,
  `SlideTop1` viria antes de `Slide40` em ordem alfabética e a capa cairia no meio dos
  destaques. Green: 15 → **18**.
- **Solar: a faixa cresceu para 13–18.** O `Slide18` **já estava na pasta** desde a
  reexportação, e a faixa parava no 17 — a galeria ignorava um arquivo **em silêncio**, e quem
  percebeu foi o dono. Conferido: `Slide17` é a capa "DESTAQUES CONEXÃO SOLAR" e o `Slide18` é
  o destaque que ela anuncia (Silas Eustáquio). Sem ele, a conexão terminava numa capa
  prometendo um destaque que nunca vinha. Solar: 5 → **6**.
  - ⚠ **LIÇÃO:** faixa que para antes do fim da pasta não dá erro nenhum. Ao reexportar o
    deck, **conte os arquivos de cada pasta** e compare com `ate - de + 1`.

Total em galeria: **95** (⚠ este parágrafo dizia **94**, e estava errado: 8+18+10+6+23+20+10 = 95.
O 94 é a contagem de DEPOIS da saída do `solar/Slide13`, abaixo). Ecossistema 105 → **109**
paradas, total **170**.

### O `solar/Slide13` saiu (2026-08-10, mais tarde no mesmo dia)

O dono mandou o print da tela e escreveu *"remova essa"*: era a **"Formas De Ganhos"** da Solar
(percentuais GP/GI/RO/EQ, celular do app, rodapé com o link do manual), a **página 01/06** dela.
Identificada pelo contador do rodapé do visor — `01 / 06` com a faixa em 13–18 só pode ser o
`Slide13` — e **confirmada abrindo o arquivo**, não pelo número.

- A faixa virou `{de:14, ate:18}`. **Continua faixa**, não virou lista: o slide removido era o
  primeiro, então tirar 1 do `de` basta e não há buraco no meio. Se um dia sair um slide do MEIO
  de uma faixa, aí sim ela precisa virar `{arquivos:[...]}`.
- **O arquivo NÃO foi apagado** — segue em `assets/img/ecossistema/solar/Slide13.jpeg`. Devolver =
  baixar o `de` para 13. Mesmo critério do `livre/Slide19` (que saiu pelo disco laranja).
- Medido depois: Solar 6 → **5** (visor abre em `Slide14`, rodapé `01 / 05`, imagem servida a
  1920×1080), galeria **94**, Ecossistema **108** paradas, total da página **169** — exatamente
  uma parada a menos, que é a imagem que saiu. Nenhuma outra conexão mudou de contagem.

⚠ **EM ABERTO:** Placas, Telecom, Seguros e Expansão podem ter a mesma capa de "DESTAQUES" como
último slide, sem os destaques depois. Não foi possível decidir por medição (a fração de verde
não separa capa de conteúdo: as capas conhecidas deram 3,8 a 11,1% e as outras 4 a 6,1%) e o
dono é quem sabe do deck. Pergunta feita a ele.

---

## O DECK FOI ENXUGADO: 94 → 27 imagens (2026-08-10, ~18h)

O dono mexeu **no disco**, não no código, e avisou depois: *"os slides vão ter apenas a capa
e os destaques de cada um dos ecossistemas, eu excluí as imagens que não precisa e deixei as
que precisa estar em cada um dos ecossistemas"*.

### Como isso apareceu, e por que vale registrar

Eu não estava sabendo. O que denunciou foi o `git status`: **77 arquivos marcados como
apagados** no meio de outro trabalho. As pastas foram alteradas entre **17:48:31 e 17:49:48**,
uma a cada ~10 segundos — cadência regular, de script ou de cliente de sincronização. Nada foi
para o Lixo.

**Ninguém perdeu nada, e o motivo é que o repositório existia.** As 103 imagens estavam no
commit já feito e no remoto. Antes das 17h de 2026-08-10 esta pasta **não era um repositório
git**, e nesse cenário os 77 arquivos teriam sumido de vez. É o argumento mais concreto que
este projeto tem a favor de commitar cedo.

⚠ **Lição de método:** eu quase "consertei" a configuração por dedução, adivinhando os nomes
novos. Errado — havia uma renomeação em curso (`Slide 1_Livre`), e adivinhar teria produzido
listas que pareciam certas. O certo foi **parar e perguntar**, porque só o dono sabia se era
acidente ou intenção.

### O estado novo

Cada conexão = **1 capa + os destaques dela**. A capa é a tela "DESTAQUES CONEXÃO X" (logo
espelhado sobre pódio); os destaques são "DESTAQUE Conexão X" com nome, cidade e números.

| conexão | capa | destaques | total |
|---|---|---|---|
| placas | `Slide7` | Slide8–11 | 5 |
| livre | `Slide 1_Livre` | Destaques1-livre a 3 | 4 |
| green | `Slide40` | SlideTop1 a 3 | 4 |
| telecom | `Slide61` | Slide62–64 | 4 |
| seguros | `Slide82` | Slide83–85 | 4 |
| expansao | `Slide97` | **Slide100, Slide99, Slide98** (nesta ordem — ver abaixo) | 4 |
| solar | `Slide17` | Slide18 | 2 |

**Isto também FECHA a pergunta que estava em aberto** ("Placas, Telecom, Seguros e Expansão
também terminam em capa de destaques?"): sim, todas as sete têm a mesma capa de DESTAQUES, e
agora é ela que abre a conexão. Conferido **abrindo os sete arquivos**, não pelo nome — a
fração de verde nunca ia decidir isso (capas 3,8–11,1% contra 4–6,1% das outras).

### O que mudou no código

- **As sete viraram lista explícita.** Faixa `de`/`ate` fazia sentido com 20 nomes seguidos do
  deck; com 2 a 5 arquivos, a lista é mais curta **e diz a ordem**, que a faixa não sabia dizer.
  O `nomesDe()` continua aceitando as duas formas.
- **A CAPA VEM PRIMEIRO** em todas. Antes a capa estava fora da galeria (saíra em "retire esses
  slides", de manhã); agora ela é a primeira tela, porque é o que anuncia os destaques.
- **`caminho()` passou a usar `encodeURIComponent` no nome.** A capa da Livre chama-se
  `Slide 1_Livre.jpeg`, **com espaço**. Espaço cru num `src` é "às vezes funciona": o navegador
  costuma codificar, um servidor pode devolver 404, e a falha é **muda**. Medido depois de
  codificar: `livre/Slide%201_Livre.jpeg`, natural 1920×1080, carregada. Só o NOME é codificado
  — a pasta fica crua, senão a barra viraria `%2F` e a URL inteira quebraria.

### Medido depois

- **27 de 27 imagens carregam**, todas **1920×1080**, **zero erro** (21 percorrendo o visor
  conexão por conexão, 6 sondadas direto quando o percorredor emperrou no fechar/abrir).
- **Paradas: Ecossistema 108 → 41; página 169 → 102.** Nenhuma outra seção mudou: Graduações 19,
  Bonificação 17, TOP 10 1, Agenda 5, Destaques 3, Encerramento 1.
- `revisar.js`: 0 erros, 110 avisos.


### A ORDEM DOS DESTAQUES NÃO SEGUE O NÚMERO DO ARQUIVO (2026-08-10, correção do dono)

*"a sequência após o Slide97.jpeg desse é assim: Slide100.jpeg, Slide99.jpeg, Slide98.jpeg"*

⚠ **Eu errei, e o erro é instrutivo.** Conferi as sete CAPAS abrindo os arquivos — certo — e
depois assumi que os DESTAQUES seguiam a ordem do número no nome. Não seguem. Metade do
trabalho feito pelo método certo e a outra metade por dedução, que é como um erro passa.

Abrindo os 15 destaques e lendo o número que cada um anuncia:

| conexão | ordem no nome | métrica anunciada | direção |
|---|---|---|---|
| livre | D1 → D2 → D3 | 9.761 → … → 29.829 kWh de recorrência | **sobe** ✓ |
| green | Top1 → Top2 → Top3 | 224 → 389 → 434 associados | **sobe** ✓ |
| telecom | 62 → 63 → 64 | 140 → 146 → 339 portabilidades | **sobe** ✓ |
| seguros | 83 → 84 → 85 | 32 → 33 → 37 vendas | **sobe** ✓ |
| solar | 18 | um destaque só | n/a |
| **expansao** | 98 → 99 → 100 | 50 → 34 → 11 licenciados | **DESCIA** ✗ |
| **placas** | 8 → 9 → 10 | R$ 147.798 → 132.321 → 55.490 de venda | **DESCE** ✗ |

O padrão de intenção é **crescendo**: começa pelo menor e fecha no maior, porque isso é falado
ao vivo e terminar no menor é anticlímax. Cinco conexões já subiam pelo nome; a expansão descia
e foi invertida para `Slide100, Slide99, Slide98`.

**Não existe regra dedutível pelo nome.** O jeito de saber a ordem é abrir os arquivos e ler o
número que cada um anuncia — e, quando houver dúvida de intenção, perguntar: ordem narrativa é
decisão do dono, não medição.

⚠ **PLACAS AINDA ESTÁ DESCENDO** e a pergunta foi feita ao dono. Detalhe que complica: o
`Slide11` da placas **não é um destaque** — é um slide de **"Cliente"** (Junior e Aline Cristine,
plano de R$ 315,87, 538 kWh de geração), categoria diferente, que provavelmente fecha a conexão
independente da ordem dos destaques. Enquanto ele não responder, a ordem da placas segue a do
nome: `Slide7, Slide8, Slide9, Slide10, Slide11`.

---

## O DECK FOI TROCADO DE NOVO: 27 → 59 imagens, e agora é OUTRO CONTEÚDO (2026-08-12)

O dono mexeu **no disco** outra vez e avisou em uma linha: *"dentro da pasta ecossistema das img
atualizei as imagens"*. Não foi um enxugamento como o de 10/08 — foi uma **substituição
completa**.

### O que mudou de fato, medido no `git status`

| | deck de 10/08 | deck de 12/08 |
|---|---|---|
| imagens | 27 | **59** |
| peso da pasta | 6,5MB | **20MB** |
| dimensões | 1920×1080 | 1920×1080 (iguais) |
| peso médio | 238kB | 339kB |
| nomes reaproveitados | — | **1 de 59** (`green/Slide40`, e virou outra imagem) |
| paradas da seção | 41 | **73** |
| paradas da página | 102 | **134** |

⚠ **A lista velha não ficou "desatualizada" — ficou apontando para 27 arquivos INEXISTENTES.**
As sete conexões abririam o pop-up preto. O único nome que sobreviveu, `green/Slide40`, é o caso
mais traiçoeiro: o arquivo existe, o `<img>` carrega, nada aparece no console — e é **outra
imagem**. Era a capa "TOP 3 CONEXÃO GREEN"; agora é "KWH E GREEN POINTS DOBRADO". Um teste que só
checasse 404 diria que estava tudo bem.

### ⚠ O CONTEÚDO É DE OUTRA NATUREZA, e isso muda o que a peça significa

Não são mais fotos de gente. O deck de 10/08 era **capa + destaques** (nome, cidade, número de
licenciados). O de 12/08 são os **slides de campanha de agosto/2026**: Status PRO, tabelas de
bônus e comissão, promoções, licenças Connect Plus/Full, as quatro etapas do Início Rápido.
Quem abrir este mapa procurando "a capa de cada conexão" **não vai achar** — e não é defeito.

### ⚠ A ORDEM AGORA É A NUMÉRICA — e a conclusão de 10/08 estava certa PARA O DECK DELA

Isto merece cuidado porque é uma **inversão** de conclusão registrada:

- em 10/08 ficou escrito, com razão, que ordem por nome **erra** (a capa do Green se chamava
  `SlideTop1`, a da Livre `Slide 1_Livre`, e a Expansão descia de 50 para 11 licenciados);
- em 12/08, medido abrindo **as 59 uma por uma**, a ordem numérica **acerta nas sete**.

A lição que sobrevive às duas não é "use ordem numérica" nem "não use" — é **ordem se confere
abrindo o arquivo**. As duas provas mais limpas de 12/08:

- **Expansão**: `Slide80/81/82/83` se chamam literalmente "1ª Etapa", "2ª Etapa", "3ª Etapa",
  "4ª Etapa". Não há como discutir.
- **Placas**: `Slide15` é a capa "PROMOÇÕES CONEXÃO PLACAS" e vem em **TERCEIRO** — o deck abre
  com Status PRO (13) e a venda via Closer (14) antes de anunciar as promoções. Ou seja: **capa
  no meio é intencional aqui**, o oposto da regra "capa primeiro" de 10/08.

### O estado novo

| conexão | slides | faixa | observação |
|---|---|---|---|
| placas | 8 | 13-20 | capa de promoções no 15, em terceiro |
| solar | 3 | 22-24 | a menor |
| livre | 5 | 29-33 | |
| green | 9 | 35, 37-44 | ⚠ **não existe Slide36** |
| telecom | 11 | 47-57 | dois assuntos: Telecom BR (47-52) + iGreen Mobile USA (53-57) |
| seguros | 16 | 59, 60, 62-75 | ⚠ **não existe Slide61**; a maior |
| expansao | 7 | 77-83 | as 4 etapas em 80-83 |
| | **59** | | |

⚠ **FAIXA `de`/`ate` NÃO PODE MAIS VOLTAR.** Os dois buracos (36 e 61) fariam a faixa pedir um
arquivo inexistente. A rede de segurança do `desenha()` pularia adiante avisando no console, mas
**quem está apresentando veria o salto** — e é ao vivo. Lista explícita não tem esse risco.

### O que foi verificado (2026-08-12)

- **59 de 59** nomes do `FOTOS` casam com o disco; **zero** arquivos sobrando, zero duplicados.
- **59 de 59** URLs respondem **200** por http, já passando pelo `encodeURIComponent` do `caminho()`.
- **59 de 59** imagens **decodificaram** no navegador (`naturalWidth > 0`), todas 1920×1080.
  Isto é mais forte que checar 404: pega o arquivo corrompido, que carrega e não desenha.
- **Zero** avisos `[eco-galeria] slide não encontrado` no console — a rede de segurança nunca disparou.
- As **7** conexões terminam no slide certo com o contador certo (`05/05`, `09/09`, `08/08`,
  `03/03`, `11/11`, `16/16`, `07/07`).
- **Paradas percorridas ação por ação, IDA e VOLTA**, as 73: cada conexão dá `card fechado →
  páginas 0..N-1 → fechado`, e na volta desce `N-1..0`. **Zero vazamento entre conexões** — que é
  exatamente o defeito de 10/08 nas Graduações ("abre o fundo do executivo"), e ele não existe aqui.
- **Geometria: zero diferença** contra a versão do `HEAD` do mesmo arquivo (troquei o js pelo do
  HEAD, medi, e devolvi). Altura do documento **27918** nas duas, **24** ScrollTriggers nas duas,
  **7** com pin nas duas, as 7 caixas de `.ecard` idênticas (`340x405/417/405/417/434/434/405`).
  Medição válida pelos dois sinais do `CLAUDE.md`: `.jphoto` em **202x202** e contagem de triggers
  estável. Só dois números mudaram, e são os dois pretendidos: páginas 27→59, paradas 102→134.
- **Mobile 390×844**: o clone `#ecossistema2` não existe, a galeria lê do `#ecossistema` original
  (caminho de código diferente do desktop) e devolve as mesmas 7 conexões e 59 páginas. Imagem
  cabe na tela, 16:9 preservado, rodapé dentro.
- `revisar.js`: **0 erros, 110 avisos** (o baseline era 111 — nenhum aviso novo).

### Em aberto com o dono

1. ⚠ **Seguros 72-75 não falam de Seguros.** São as licenças Connect Plus/Full, o upgrade entre
   elas, e a **tabela geral de recorrência das SETE conexões**. Caíram na pasta de Seguros porque
   ocupam essa faixa do deck. Tirar = remover os 4 nomes da lista, nada mais.
2. **Legibilidade no celular.** Medido: o visor desenha o slide com **365px de largura** num
   390×844. Nos slides de tabela densa (ex.: `green/Slide39`, `telecom/Slide49`) a letra miúda
   fica apertada. Não é regressão do código — é o deck ter ficado mais denso que o anterior, que
   era foto com nome grande. Decisão do dono: aceitar, ou tratar esses slides à parte.
3. **`placas/Slide18` e `solar/Slide24` têm defeito NO ARQUIVO**: o texto "Por tempo Limitado"
   encavala o "NEO" de "1 DRONE DJI NEO". É no PowerPoint, não no site.

---

## QUALIFICAÇÕES: os NOMES saíram da apresentação, e cada nível ganhou clique de saída (2026-08-12)

Pedido do dono, na mesma mensagem em que pediu para tirar o TOP 10:

> *"a seção das qualificações vai ser da seguinte maneira: ele não precisa exibir e nem a
> animação das qualificações antes de ir pros nomes o [sênior] ele nao tem popup depois o
> proximo que é o gestor aparece as fotos depois video e sai e volta para o grafico e ele clica
> no executivo exibe as imagens aparece o pop up do vídeo e depois sai novamente e assim
> sucessivamente para o diretor e acionista também sabendo que quando chega um acionista as
> fotos e depois o vídeo ele permanece na sessão das qualificações e depois no próximo clique
> ele desce para a próxima sessão."*

### ⚠ DUAS COISAS FORAM CONFIRMADAS COM ELE ANTES DE MEXER, e valia perguntar

1. **"o gestor ele nao tem popup"** — ele escreveu "gestor" duas vezes na mesma frase ("o gestor
   não tem popup, depois o próximo que é o gestor"), o que é impossível. Pelo código quem não tem
   galeria é o **Sênior**, e é o único. Tratado como Sênior.
2. **Os NOMES continuam ou saem?** A descrição dele percorre os cinco níveis e em nenhum os nomes
   aparecem — só fotos e vídeo. Mas a frase de abertura fala em *"antes de ir pros nomes"*. Eram
   duas leituras que davam apresentações diferentes, então **foi perguntado**. Resposta: **os
   nomes saem**. Ele também escolheu **manter** a parada de abertura com o gráfico completo.

Isto é a mesma lição de 2026-08-10 registrada mais acima neste mapa: quando havia renomeação em
curso eu quase "consertei" por dedução. Aqui a dedução também parecia segura e também era
arriscada.

### O fluxo novo — 18 paradas (era 19)

| # | parada | ação |
|---|---|---|
| 0 | abertura | gráfico completo, nada aberto |
| 1 | Sênior | só o pino — **sem fotos, sem vídeo, sem nomes** |
| 2-5 | Gestor | pino · fotos · vídeo · **saída** |
| 6-9 | Executivo | pino · fotos · vídeo · **saída** |
| 10-13 | Diretor | pino · fotos · vídeo · **saída** |
| 14-17 | Acionista | pino · fotos · vídeo · **saída** |

A parada dos nomes (`gradRecOpen`) está **comentada, não apagada**, com o marcador
`RECONHECIMENTO-FORA-DA-APRESENTACAO` — convenção deste projeto. Devolver = descomentar duas
linhas do `temRec` e a parada.

⚠ **A PEÇA DOS NOMES NÃO FICOU ÓRFÃ**, e isso foi conferido antes de desligar: fora da
apresentação o caminho de clique continua inteiro — o botão `.gm-rec-btn` da galeria chama
`depoisDasFotos()`, que abre a capa de vídeo, e clicar no card da capa chama `abreRec()`. O dono
alcança os nomes na mão mesmo durante uma apresentação ao vivo. As 1.7k linhas do
`js/reconhecimento.js` e os 313+114+48 nomes não viraram peso morto.

### Por que a SAÍDA é um clique próprio, e por que isso resolve o Acionista de graça

Ela poderia não existir: a parada do pino do nível seguinte já faz `gradTudoClose()`, então um
clique só fecharia o vídeo E acenderia o pino do Executivo. **Não foi feito assim de propósito**,
e o precedente é do próprio dono — no ecossistema, em 2026-08-10, ele reclamou desse atalho:
*"quando é a última imagem, no modo apresentação ele volta de uma vez e já pula para o próximo, e
isso não pode acontecer."*

E é essa parada que atende ao pedido do Acionista **sem nenhum caso especial escrito à mão**: como
ele é o último, não existe pino seguinte, então a saída dele é a última parada da seção — o
gráfico fica na tela com o pino do Acionista aceso, e o clique seguinte desce para a Bonificação.
Medido: a parada 105 é a última de `#graduacoes` e a 106 pertence à `Bonificação`.

O guarda é `if (temGal(lvl) || temVid(lvl))`: o Sênior não ganha saída, porque para ele o pino já
É o gráfico limpo e a saída seria um clique que não muda nada na tela.

### ⚠ DEFEITO PRÉ-EXISTENTE ACHADO E CONSERTADO NO CAMINHO

Percorrendo as paradas **ao contrário**, o vídeo continuava **ABERTO** na parada das fotos dos
quatro níveis (medido: `lvl 4|ABERTO` onde devia ser `lvl 4|fechado`, e igual em 3, 2 e 1).

A ação das fotos era só `gradClear() + garanteGaleria()`. Indo para a frente basta, porque o vídeo
ainda não abriu. Voltando do vídeo para as fotos, **nada o fechava** — e a capa ficava por cima
das fotos que ela deveria ter deixado à mostra.

⚠ **Não é defeito novo: conferi no HEAD e a ação era idêntica lá.** Ou seja, existia desde que a
capa de vídeo entrou. Só apareceu agora porque percorri a seção de trás para frente, que é
exatamente o método que o CLAUDE.md manda usar ("se todos os caminhos óbvios estão certos, o
problema é de ORDEM ou de ESTADO REMANESCENTE").

Conserto: `gradRecClose(); gradVidClose();` antes do `garanteGaleria()`. **Não** `gradTudoClose()`,
que fecharia também a galeria que a parada existe para mostrar.

### O que foi verificado (2026-08-12)

- **18 paradas**, percorridas **ação por ação, ida e volta**, e a volta é **espelho exato da ida**
  (zero divergência em 18 comparações). Antes do conserto acima eram 4 divergências.
- **Os nomes não abriram em nenhuma das 36 execuções** de parada (18 ida + 18 volta).
- Cada nível abre a galeria **do próprio nível** (`lvl 1` Gestor · `lvl 2` Executivo · `lvl 3`
  Diretor · `lvl 4` Acionista), e o Sênior (`lvl 0`) **não abre galeria nenhuma**.
- Na parada do vídeo, as fotos do MESMO nível continuam atrás (conferido também por captura de
  tela: capa do Gestor sobre a galeria "GESTOR / iGreen EXPERIENCE").
- Idêntico em **1920×946** e **1536×750**.
- Mobile 390×844: a apresentação nem carrega (é desktop-only, `matchMedia(min-width:1025px)`),
  então não há paradas a verificar; a página não estourou na horizontal.

### Em aberto

⚠ **O texto do cartão da capa de vídeo ficou prometendo o que o fluxo não faz mais.** Ele diz
*"Toque para seguir para os reconhecidos do mês"* (visto na captura de tela). O clique ainda
funciona e ainda leva aos nomes — é justamente a saída de emergência descrita acima — mas na
apresentação o clique seguinte volta ao gráfico. Numa apresentação ao vivo, tela dizendo uma coisa
e comando fazendo outra é ruim. **Levado ao dono; é uma linha de texto se ele quiser trocar.**

---

## TOP 10 DESATIVADA (2026-08-12)

Pedido do dono, com o print da tabela em anexo: *"a imagem anexo retire essa secao"*.

**Não foi apagada — foi desativada**, que é o tratamento que a `#rede` e a `#recorrencia` já
levaram neste projeto (ver `REDE-DESATIVADO`). São ~50 linhas entre CSS, HTML e o script da arte
que falta, e o dono já mudou de ideia sobre seção antes.

### As TRÊS coisas têm de andar juntas

| onde | o que fiz | reverter |
|---|---|---|
| `index.html`, CSS | `#top10{ display:none }` com o marcador `TOP10-DESATIVADO` | `display:grid` |
| `index.html`, `#reorder-secoes` | `'top10'` saiu da lista de ordem | devolver entre `'bonificacao'` e `'agenda'` |
| `js/presentation-mode.js`, `SECTIONS` | `on:false` | `on:true` |

⚠ **Deixar uma das três para trás é criar defeito silencioso.** Se a seção ficasse oculta mas com
`on:true`, a apresentação teria um clique que pousa num elemento invisível — o scroll anda e a
tela não muda nada, que é o sintoma que este projeto já conhece de overlay aberto (o comando
parece morto). Se ficasse na lista de ordem, o `insertBefore` mexeria numa seção oculta: inofensivo,
mas daria a entender que ela ainda participa.

### O que foi verificado (1920×946, comparado contra o HEAD do mesmo arquivo)

| | HEAD | agora |
|---|---|---|
| altura do documento | 33339 | **32393** (−946) |
| altura da `#top10` | 946 | **0** (`display:none`) |
| seções ANTES dela (8) | — | **deslocamento 0 px, todas** |
| `#agenda`, `#destaques`, `#rodape` | — | **−946 px, exatamente** |
| ScrollTriggers · com pin | 24 · 7 | **24 · 7** |
| paradas da seção | 1 | **0**, e fora do `secoesAtivas` |
| requisições de `/top10/` | — | **0** (a arte de 278kB deixou de ser baixada) |

Medição válida pelos dois sinais do CLAUDE.md: `.jphoto` em **202x202** e contagem de triggers
estável. A arte segue em `assets/img/top10/` — nada foi apagado do disco.

⚠ **Erro de método que eu cometi e vale registrar:** na primeira comparação apareceu uma deriva de
3 a 7px em seções ACIMA do TOP 10, que não deveriam se mexer. Não era a mudança — era eu: numa das
capturas entrei e saí do modo apresentação antes de medir, na outra não. Refeito com o mesmo
procedimento nas duas, a deriva virou **0 px exatos**. Antes de acusar deslocamento aqui, confira
se as duas capturas passaram pelo mesmo caminho.

⚠ **Um número deste mapa caducou:** a linha que diz "Bonificação 17, TOP 10 1, Agenda 5..." e a
ordem `... Bonificação > TOP 10 > Agenda ...` valiam até 11/08. Hoje é
`... Bonificação > Agenda > Destaques > Encerramento`, sem TOP 10.

---

## SETE SLIDES SAÍRAM DO ECOSSISTEMA: 59 → 52 (2026-08-12, fim do dia)

Pedido do dono com sete prints em anexo: *"remova esses slides, mas antes faz o commit
atualiza ele ja para q no netlify exiba o ultimo."* Os slides foram identificados **pelo
contador do rodapé** de cada print (`03 / 08`, `07 / 08`, …), que é o jeito confiável —
o nome do arquivo não aparece na tela.

| print | contador | arquivo | conteúdo |
|---|---|---|---|
| 1 | 03 / 08 | `placas/Slide15` | capa "PROMOÇÕES CONEXÃO PLACAS" |
| 2 | 07 / 08 | `placas/Slide19` | "BATERIAS — a próxima fronteira" |
| 3 | 08 / 08 | `placas/Slide20` | "Integração: Solar + Bateria + Cliente" |
| 4 | 13 / 16 | `seguros/Slide72` | Licença Connect Full / Plus |
| 5 | 14 / 16 | `seguros/Slide73` | Licença Plus x Full, com os preços |
| 6 | 15 / 16 | `seguros/Slide74` | UPGRADE Plus → Full |
| 7 | 16 / 16 | `seguros/Slide75` | tabela de recorrência das SETE conexões |

### ⚠ ISTO RESOLVEU A PERGUNTA ABERTA QUE EU HAVIA REGISTRADO

Os quatro de Seguros são **exatamente** os que eu tinha apontado como não sendo de
Seguros (licenças + tabela geral, que caíam ali só por ocuparem a faixa do deck). O dono
respondeu tirando. Registro porque é o caso em que anotar a pendência no mapa valeu: a
resposta veio pronta, sem eu precisar reexplicar.

### Duas consequências que NÃO são defeito

- **Placas ficou SEM CAPA** e abre no Status PRO. O Slide15 era a capa.
- **Seguros deixou de fechar nas licenças** e agora fecha na promoção de bônus extra
  (Slide71), que é conteúdo de Seguros de verdade.

### O estado novo

| conexão | slides | faixa |
|---|---|---|
| placas | **5** | 13, 14, 16, 17, 18 |
| solar | 3 | 22-24 |
| livre | 5 | 29-33 |
| green | 9 | 35, 37-44 |
| telecom | 11 | 47-57 |
| seguros | **12** | 59, 60, 62-71 |
| expansao | 7 | 77-83 |
| | **52** | |

Paradas: Ecossistema **73 → 66** (7 cards + 52 fotos + 7 fechamentos) e a página inteira
**132 → 125**. Pasta: 20MB → **18MB**.

**Os arquivos foram APAGADOS do disco, não só desligados da lista.** Estão no commit
`d552ad3` e voltam com
`git checkout d552ad3 -- "assets/img/ecossistema/placas/Slide15.jpeg"` (e assim para os
outros seis) — depois é só devolver o nome na lista `FOTOS`.

### O que foi verificado (2026-08-12)

- **52/52** nomes do `FOTOS` casam com o disco; **zero** arquivos sobrando, zero faltando,
  todas as sete listas em ordem numérica crescente.
- Os 7 apagados devolvem **404** por http, e **nenhum** deles aparece nas 52 URLs que a
  galeria pede (conferido varrendo as 52 e filtrando por esses nomes).
- **52/52** imagens **decodificam** a 1920x1080; **zero** avisos `[eco-galeria]` no console
  — a rede de segurança do `desenha()` não disparou, ou seja, nenhuma lista pede arquivo
  inexistente.
- Bordas de cada conexão conferidas no navegador: `placas: Slide13 … Slide18 [05/05]` e
  `seguros: Slide59 … Slide71 [12/12]`, e as outras cinco intactas.
- Paradas: `#ecossistema2` **66**, total **125**.
- Medição válida pelos dois sinais do CLAUDE.md: `.jphoto` em **202x202** e **24**
  ScrollTriggers.
- `revisar.js`: **0 erros, 110 avisos**.

---

## SETE ABERTURAS ENTRARAM NO ECOSSISTEMA: 52 → 59 (2026-08-12, noite)

Pedido do dono: *"adicionei novas imagens nas pastas assets, img, ecossistema / Slide1g.jpeg
para green / Slide1L.jpeg para livre / Slide1T.jpeg para telecom e o ultimo adicione é
Slideulitmo.jpeg / Slide1S.jpeg para solar / Slide1S.jpeg para seguros / Slide1P.jpeg para
placas"*.

Os seis `Slide1X` são a MESMA família, conferido abrindo: **"Como Funciona" / "Formas de
Ganhos" / "Recorrência licenciado"**, com os percentuais GP/GI/RO/EQ daquela conexão sobre
um mockup do app. São ABERTURAS — explicam como se ganha antes de a conexão mostrar as
campanhas do mês. Vão em PRIMEIRO. O `Slideulitmo` é o **"Cashback Telecom"** e vai em
ÚLTIMO no telecom, porque foi o único para o qual o dono marcou posição (*"e o ultimo
adicione é"*) — e é justamente esse contraste que confirma que os outros seis são o primeiro.

⚠ **A EXPANSÃO NÃO RECEBEU ABERTURA.** Ela é a única das sete sem `Slide1X`, e isso bate com
a lista do dono. Se um dia chegar uma, o lugar é a primeira posição.

### ⚠ A REGRA DA ORDEM VIROU DO AVESSO PELA TERCEIRA VEZ NO MESMO DIA

| deck | ordem numérica | por que |
|---|---|---|
| 10/08 | **errava** | capa do Green era `SlideTop1`, da Livre `Slide 1_Livre` |
| 12/08 manhã | **acertava** | `Slide80..83` são "1ª Etapa" a "4ª Etapa" |
| 12/08 noite | **errou de novo** | `Slide1P` cairia entre `Slide18` e `Slide22`; `Slideulitmo` não tem número |

A lição que sobrevive às três: **ordem se confere abrindo, nunca pelo nome.** Está escrito
no topo do `js/ecossistema-galeria.js` com as três viradas, para o próximo não deduzir.

### ⚠ DUAS ARMADILHAS NOVAS DE NOME DE ARQUIVO

**1. `Slide1S` existe em DUAS pastas com conteúdos diferentes** — `solar/Slide1S` é "Como
Funciona" da Solar e `seguros/Slide1S` é "Recorrência licenciado" de Seguros. Não é engano:
o caminho inclui o slug, então nunca se confundem. Mas um `grep Slide1S` devolve dois, e
quem trocar um pelo outro não vê erro nenhum — vê o slide errado.

**2. `Slideulitmo` está com o "l" e o "t" trocados** ("ulitmo"). É o nome que o dono deu, e
FICA assim: regra do projeto é o código se ajustar ao arquivo. Medido: `Slideultimo.jpeg`
(grafia certa) devolve **404**. Renomear para o certo quebraria a lista sem aviso.

### ⚠ E A ARMADILHA QUE MAIS IMPORTA: TESTE LOCAL É CEGO PARA MAIÚSCULA/MINÚSCULA

Estes nomes trouxeram o primeiro risco real de CAIXA no projeto (`Slide1g` minúsculo,
`Slide1L`/`Slide1P`/`Slide1S`/`Slide1T` maiúsculos). E o teste local **não pega**:

- o disco do macOS é **case-insensitive**: medido, `green/Slide1G.jpeg` (G maiúsculo)
  devolve **200** no servidor local, mesmo o arquivo sendo `Slide1g`;
- o servidor do **Netlify é Linux, case-sensitive**: lá o mesmo pedido daria 404 e a imagem
  não apareceria — no site publicado, não na máquina de quem testou.

Quem garante é uma checagem no CÓDIGO, não no navegador: comparar o nome declarado com o do
disco de forma insensível e depois **exigir igualdade exata**. Está no roteiro de validação
desta seção e passou nos 59. **Ao acrescentar imagem com maiúscula no nome, rode isso.**

### O estado novo

| conexão | slides | abre em | fecha em |
|---|---|---|---|
| placas | **6** | `Slide1P` | Slide18 |
| solar | **4** | `Slide1S` | Slide24 |
| livre | **6** | `Slide1L` | Slide33 |
| green | **10** | `Slide1g` | Slide44 |
| telecom | **13** | `Slide1T` | **`Slideulitmo`** |
| seguros | **13** | `Slide1S` | Slide71 |
| expansao | 7 | Slide77 | Slide83 |
| | **59** | | |

Paradas: Ecossistema **66 → 73**; página **125 → 132**. Pasta: 18MB → **21MB**.

### Bônus: os dois slides do drone foram CONSERTADOS pelo dono

`placas/Slide18` e `solar/Slide24` aparecem como **modificados** no `git status` e o dono não
mencionou. Conferido abrindo: são os dois que eu havia registrado com o defeito de
**"Por tempo Limitado" encavalando o "NEO"** de "1 DRONE DJI NEO". Agora o título cabe numa
linha e o aviso ficou abaixo, sem sobreposição. **Pendência fechada** — era no PowerPoint,
como eu havia dito, e ele reexportou.

### O que foi verificado (2026-08-12, noite)

- **59/59** nomes casam com o disco; zero sobrando, zero faltando, zero duplicado, e
  **caixa exata** conferida nos 59 (a checagem que o teste local não faz).
- **59/59** imagens **decodificam** a 1920x1080; zero avisos `[eco-galeria]` no console.
- Bordas conferidas no navegador: as seis conexões abrem no `Slide1X` certo e o telecom
  **fecha no `Slideulitmo`** (`13 / 13`).
- **73 paradas percorridas ida E VOLTA**: a volta é **espelho exato** da ida (zero
  divergência em 73), e a sequência de páginas de cada conexão é `0..N-1` sem pulo.
- Peso das novas: 358-406 kB cada, 1920x1080 — mesma classe do deck.
- Medição válida: `.jphoto` em **202x202** e **24** ScrollTriggers.
- `revisar.js`: **0 erros, 110 avisos**.

---

## TRES AJUSTES + O MOVIMENTO DO MAPA (2026-08-12, madrugada)

### 1. O Cashback Telecom mudou de lugar: era o último, virou o oitavo

Pedido com dois prints: *"a imagem 1 deve estar antes da imagem 2, e nao a sendo a ultima"*.
Identificados pelo contador do rodapé: imagem 1 = Cashback em `13/13` (`Slideulitmo`), imagem
2 = "Uma Marca Brasileira. Uma Operação Global." em `08/13` (`Slide53`).

⚠ **Isto DESFAZ, em horas, a posição que o próprio dono pediu na tarde do mesmo dia**
(*"e o ultimo adicione é Slideulitmo.jpeg"*). Não é contradição dele: o motivo aparece no
conteúdo. O `Slide53` é onde a conexão **vira EUA**; o Cashback é assunto **Brasil** e estava
caindo depois do bloco americano, fora de contexto. Agora fecha o bloco Brasil (47-52), que é
onde pertence. Telecom: `Slide1T · 47-52 · Slideulitmo · 53-57`.

### 2. O Sênior perdeu o reconhecimento

Pedido, com dois prints da peça: *"o senior da qualificacao nao deve ter isso, pode ocultar
nao tem nenhuma dessas telas. popup etc.. os outros permanecem do jeito que esta"*.

**Um valor resolveu**: `window.GRAD_REC_LEVELS` foi de `[0,1,2,3,4]` para `[1,2,3,4]` no
`js/reconhecimento.js`. Não há segundo lugar para mexer, e a razão é específica do Sênior: ele
é o **único nível sem galeria**, e por isso os dois cliques do gráfico (barra no desktop,
coluna no mobile) caem num caminho especial — "sem dot" deixou de significar "nada acontece"
em 2026-08-09 e passou a consultar essa lista para abrir a animação direto. Tirando o 0, o
caminho não acha o nível e o clique volta a não fazer nada.

Medido, reproduzindo a decisão do `openEvents()` para os cinco níveis:

| nível | tem dot (galeria) | está na lista rec | o que faz |
|---|---|---|---|
| 0 Sênior | não | **não** | **NADA** |
| 1-4 | sim | sim | abre a galeria de fotos |

⚠ **CONSEQUÊNCIA ACEITA**: a barra do Sênior fica muda de novo (era assim até 2026-08-09).
É o pedido, não um defeito. Devolver = pôr o `0` de volta na lista.
⚠ Os **313 nomes** do array `SENIORS` ficam no arquivo de propósito — são o dado, e apagar
para "limpar" custaria redigitá-los se ele mudar de ideia.

⚠ **ARMADILHA DE MEDIÇÃO NOVA:** tentei provar isso clicando nas barras e **nenhum** dos cinco
níveis respondeu, nem os que deveriam. Não é defeito: o `openEvents()` tem a trava
`if(b.state.h < b.d.H*0.85) return`, ou seja, **a barra precisa ter crescido pela animação de
hover** — e a 1 fps do painel ocluído ela não cresce. Clique sintético em barra do gráfico não
serve como prova aqui; o que serve é reproduzir a decisão a partir dos dados.

### 3. O movimento, e as linhas até as bordas

Pedido: *"veja uma forma de ter fundo animado suave e as linhas do mapas elas fiquem passando
animada"*, e depois, com dois recortes das beiradas: *"essas linhas devem completar completo
ate as bordas"*.

**O que se move:** uma bruma de fundo (dois gradientes radiais em `transform`, 26s) e **19 dos
36 traços** com um risco curto correndo por cima (`stroke-dashoffset`, 5,5 a 11s, atrasos
negativos para não andarem em bloco).

**As três travas de desempenho**, e nenhuma é opcional neste projeto:
1. **Nada anima layout nem filtro.** A bruma anima `transform` (composição) e os pulsos animam
   `stroke-dashoffset` (pintura numa área, não na tela toda). O `drop-shadow` do mapa continua
   **estático** — se ele animasse, o mapa inteiro re-rasterizaria a cada quadro.
2. **Só metade dos traços pulsa.**
3. **Pausa fora da tela**, por IntersectionObserver — mesmo padrão do `js/video-inview.js`.
   ⚠ Isto não é micro-otimização: a `#summit` é a última seção de uma página de ~33 mil pixels.
   Sem a guarda, a animação rodaria durante a apresentação inteira, dezenas de minutos, para um
   conteúdo a trinta mil pixels de distância.
4. `prefers-reduced-motion` **desliga o movimento** (não só encurta): o desenho fica inteiro e
   os pulsos ficam visíveis e parados.

**Por que as linhas não chegavam à borda:** o circuito nasceu dentro da `.sm-cena`, que tem a
largura da coluna do mapa — **780px de 1920**. Sobravam ~570px pretos de cada lado. Agora é
filho direto do `#summit` com `inset:0`, e os 36 traços **nascem em x=0 ou x=1920** (trava no
gerador aborta se algum não nascer numa borda).

⚠ **`preserveAspectRatio="none"` trouxe duas consequências, as duas tratadas:** a escala vira
NÃO UNIFORME, então (a) os traços usam `vector-effect:non-scaling-stroke` para a espessura
ficar em pixels de tela, e (b) **os nós são `path` de comprimento zero com ponta redonda, não
`<circle>`** — um círculo viraria elipse. Um traço de comprimento zero com `stroke-linecap:round`
desenha um disco cujo diâmetro é a espessura, e a espessura é imune à escala.

⚠ **No retrato os nós encolhem por media query, com `!important`** — e isso é necessário, não
preguiça: o tamanho vai inline no SVG (varia por nó) e inline só perde para `!important`.
Medido: a distorção no 390x844 é **3,19x**, o que não estraga os traços (são horizontais, só
encurtam), mas os nós de 10px dominavam a cena numa tela de 390.

### O que foi verificado

- **Geometria: zero diferença** contra o HEAD — altura do documento **33332 nas duas**, as 13
  seções nas mesmas posições, **24** ScrollTriggers, **7** pins, `.jphoto` em **202x202**.
- Paradas intactas: total **132**, `#summit` 1, `#ecossistema2` 73, `#graduacoes` 18.
- Telecom na ordem nova: `8:Slideulitmo` e `9:Slide53`, conferido abrindo a galeria.
- `GRAD_REC_LEVELS` = `[1,2,3,4]`, e a API da peça (`IGREEN_RECONHECIMENTO.niveis()`) concorda.
- Circuito **cobre 1920x946** (a seção inteira), com **18 traços tocando cada borda**.
- **19/19 estados clicáveis** pela área interna; circuito inerte (`pointer-events:none`).
- Mobile 390x844: sem estouro horizontal, nós reduzidos, circuito inerte.
- `index.html`: 583 → **591 kB**. `revisar.js`: **0 erros, 110 avisos**.

⚠ **O QUE NÃO DEU PARA VERIFICAR AQUI:** se o IntersectionObserver realmente liga e desliga a
animação. Um observador **novo em folha**, criado com a seção 100% na viewport, **não disparou
em 4 segundos** — os callbacks são entregues nos passos de renderização, que o painel ocluído
estrangula, pelo mesmo motivo do `rAF` a 1 fps. O código foi conferido por leitura e a classe
`.sm-anima` foi forçada à mão para provar que o CSS responde. **Quem confirma o liga/desliga é
a tela do dono.**

### Bônus: o Slide59 foi corrigido pelo dono

`seguros/Slide59.jpeg` chegou reexportado. Conferido abrindo: o último item da caixa de "ITENS
ADICIONAIS" ("Demais opcionais disponíveis conforme contratação") **vazava para fora da moldura
verde** e agora cabe dentro. Mesmo nome e mesma dimensão, então nenhuma lista mudou.

---

## ⚠ ARTE SOBRESCRITA COM O MESMO NOME TEM DE MUDAR DE URL (2026-08-12)

Sintoma do dono, com print: na galeria da Conexão Green, posição **06/10**, aparecia o slide
**"TOP 3 CONEXÃO GREEN — Performance"** — que não existe mais. Palavras dele: *"essa ainda ta
aparecendo e nao deve, certifique que ela nao exibe, as vezes é cache etc."*

### Medido antes de mexer: o site estava CERTO

| | md5 |
|---|---|
| `green/Slide40.jpeg` no disco | `ab75bdcd…` |
| o mesmo arquivo no commit enviado | `ab75bdcd…` — **idêntico** |
| `green/Slide40.jpeg` do deck ANTIGO (842756b) | `c4524566…` — outro arquivo |

Aberto o arquivo do disco: é o **"KWH E GREEN POINTS DOBRADO"**, o correto. Ou seja, o
navegador dele servia a cópia velha. O palpite dele estava certo.

### ⚠ O ERRO FOI MEU, E O PROJETO JÁ TINHA A LIÇÃO ESCRITA

Existe neste mesmo mapa a seção **"Arquivo externo que muda de conteúdo TEM de mudar de URL"**
(2026-08-04), nascida de um defeito idêntico com `js/presentation-mode.js`. Eu apliquei essa
regra aos **arquivos de JS** em 2026-08-12, subindo o `?v=` de três deles — e **não apliquei
às IMAGENS**. A regra vale para os dois.

Quatro artes foram sobrescritas mantendo o nome naquele dia, e **as quatro** tinham o
problema; ele só notou a do Green porque o conteúdo mudou por inteiro:
`green/Slide40` · `placas/Slide18` · `solar/Slide24` · `seguros/Slide59`.

Por que o cache é de 1 dia e não eterno: está no `netlify.toml`, e é deliberado — arte aqui é
**sobrescrita com o mesmo nome**, então cache longo seria pior. Mas um dia já basta para o
dono reexportar, subir e continuar vendo o antigo.

### A correção, em duas camadas

**1. Versão na URL da imagem.** As duas galerias ganharam `var VER = "?v=20260812"`, aplicado
no construtor de caminho (`caminho()` no ecossistema, `caminhoDe()` no summit). Uma linha em
cada, e cobre TODAS as artes de uma vez — não só a que ele viu.
O do summit entrou **preventivamente**: lá ainda não mordeu, e é para não morder (banner de
evento é exatamente o tipo de arquivo que se reexporta com o mesmo nome quando a data muda).

⚠ Como o `VER` muda a URL das imagens, o **JS também precisa chegar novo** — senão o navegador
roda o JS velho, que pede as URLs sem versão. Por isso o `?v=` dos dois scripts subiu junto.

**2. Uma trava no `antes-de-commitar.js`.** A regra nova avisa quando um arquivo de
`assets/img/` foi **MODIFICADO** (não adicionado — nome novo já é URL nova) e o `VER` das
galerias não subiu no mesmo commit.

Testada nos dois sentidos, isoladamente:

| cenário | esperado | resultado |
|---|---|---|
| arte sobrescrita, `VER` não subiu | avisa | **avisou** |
| arte sobrescrita, `VER` subiu | fica quieto | **ficou** |

### O que foi verificado

- As **59** URLs do ecossistema e as **21** do summit levam `?v=`; **zero** sem versão.
- As **59** imagens carregam pela URL nova a 1920x1080, **zero falhas**.
- A posição 06/10 do Green é `assets/img/ecossistema/green/Slide40.jpeg?v=20260812`.
- `revisar.js`: **0 erros, 110 avisos**.

### ⚠ O que o dono precisa saber, e está no guia dele

Recarregamento forçado (`Ctrl+Shift+R`) resolve **só na máquina dele**. Quem assistir à
apresentação continuaria vendo o antigo. Por isso a correção tem de ser na URL, não no
navegador de quem reclamou.

---

## O CARD DO VÍDEO INSTITUCIONAL VOLTOU (2026-08-12)

Pedido: *"coloque o video player https://www.youtube.com/watch?v=qdeblguZdGc ele deve rodar
dentro do site e quanto no modo site quanto no modo apresentacao, finalizou o video no modo
apresentacao ele sai da pagina automatico e segue o fluxo"*.

### ⚠ NADA DISSO PRECISOU SER IMPLEMENTADO — ESTAVA TUDO PRONTO E DESLIGADO

Investigado antes de escrever qualquer código, e o achado mudou o tamanho da tarefa:

- a URL que ele mandou é a **mesma** que já estava no `href` do card e no `var ID` do popup
  (`qdeblguZdGc`);
- o popup **já tocava dentro do site**, com arquivo local primeiro e o YouTube como reserva;
- a apresentação **já abria o vídeo** numa segunda parada da Sede;
- o fim do vídeo **já disparava** `igreen:video-fim`, e o `js/presentation-mode.js` **já
  escutava** para seguir sozinho.

O que faltava era **uma coisa só**: o card `.hqwatch` estava **comentado** desde 2026-08-09
(marcador `CTA-DESATIVADO`), porque na época ele pediu para escondê-lo.

⚠ **E o card é o interruptor da peça inteira.** O `#vmodal-app` começa com
`querySelector('.hqwatch')` e **desiste** se não achar. Sem ele:
- o popup não se monta e `window.IGREEN_VIDEO` não existe;
- o `buildStops` da Sede, que faz `if (!window.IGREEN_VIDEO) return [ y ]`, cai sozinho no
  caminho de **uma** parada e a parada do vídeo some da apresentação.

Foi exatamente isso que a medição mostrou: com o HEAD, `IGREEN_VIDEO: false`, `cardNoDOM:
false`, `#sede` com **1** parada. Descomentado: `true`, `true`, **2** paradas.

### Um detalhe que teria parecido defeito

A miniatura do card era `<img alt="">` **sem `src`**. No celular não importa (o CSS esconde a
imagem e o círculo vira o botão), mas no desktop desenharia uma caixa 16:10 **vazia** com o
triângulo de play em cima — o que lê como imagem quebrada.
Agora aponta para `assets/img/video-igreen-poster.jpg`, que é a fachada com os dois carros —
**a mesma arte que aparece na captura que o dono mandou**. Com `width`/`height` declarados,
que é o que torna o `loading="lazy"` seguro aqui (lazy sem dimensão em caixa que tira a altura
da imagem já apagou o fundo dos planos neste projeto). Medido: a caixa tem 109x68, então não
entra no ciclo vicioso.

### ⚠ O CAMINHO REAL EM PRODUÇÃO É O DO YOUTUBE, E ISSO É DE PROPÓSITO

`assets/video/institucional-igreen.mp4` (42,7MB) está no `.gitignore` e **não existe no disco
nem no deploy**. Então em produção o elemento `<video>` local dá 404, o evento `error` chama
`semArquivo()` e o popup troca pelo embed `youtube-nocookie.com`. É o caminho da captura que o
dono mandou, e funciona.
O arquivo local existe para **apresentar sem internet**, na máquina de quem apresenta.

### O que foi verificado

- **O fim do vídeo foi testado DE VERDADE, não simulado**: mandei o player pular para 188s de
  um vídeo de 3:11 e deixei terminar. Resultado: o evento `igreen:video-fim` disparou, o popup
  **se fechou sozinho** e o iframe foi **destruído** (nenhum áudio tocando atrás).
- O popup cai na reserva do YouTube com o ID certo e `enablejsapi=1`; a API do YouTube carrega
  e conecta.
- A Sede tem **2 paradas**, a segunda **abre o popup**, e a parada seguinte é o **Ecossistema**.
- **Geometria: zero diferença** contra o HEAD — altura do documento igual, **as 13 seções com
  deslocamento 0 px**, 24 ScrollTriggers, 7 pins, `.jphoto` em 202x202. As únicas mudanças são
  as pretendidas: `#sede` 1 → **2** paradas, total 132 → **133**.
- Mobile 390x844: o card aparece como círculo (miniatura escondida pelo CSS, como já era), o
  popup abre dentro do site e cabe na tela, sem estouro horizontal.
- Balanço de tags contra o HEAD: `a` 21→22, `span` 286→289, `img` 93→94, `svg` 87→88 — o card.
- `revisar.js`: **0 erros, 110 avisos**.

### Em aberto

O vídeo depende de internet em produção (é o embed do YouTube). Para apresentar **sem
internet**, o dono precisa copiar `institucional-igreen.mp4` para `assets/video/` na máquina
que vai apresentar — o popup usa o local automaticamente quando ele existe.

## GREEN, TELECOM E SEGUROS COM UM SLIDE CADA + OS NOMES FORA DO FLUXO (2026-08-13)

Dois pedidos numa mensagem, com três prints em anexo:

> "as telas green, telecom, seguros. devem ter somente essas, as demais, dos ecossistema
> permanecem do jeito que esta. e no mobile a parte de nomes quando clica no grafico ainda
> estao os nomes etc."

### Parte 1 — o ecossistema: 59 → 26 slides exibidos

Os três prints eram, medidos pela posição que o rodapé do pop-up mostrava:

| print | conexão | arquivo | posição que ele viu | conteúdo |
|---|---|---|---|---|
| 1 | green | `green/Slide39` | 05/10 | "Bônus Extra — TABELA CLIENTES", 4% a 60% por faixa de clientes |
| 2 | telecom | `telecom/Slide52` | 07/13 | "Promoção Bônus Extra", 50% a 300% por portabilidades |
| 3 | seguros | `seguros/Slide71` | 13/13 | "Promoção Bônus Extra", Nível 1 a 4, 50% a 300% |

**A frase admitia duas leituras opostas** e vale registrar como foi decidida, porque errar aqui
custava 33 imagens: "devem ter somente essas" pode ser *fique só com estas* ou, lido torto,
*tire estas*. O que resolveu não foi a gramática — foi a **aritmética do deck**:

- as três conexões que ele nomeou são exatamente as **três maiores**: green 10, telecom 13,
  seguros 13 = **36 dos 59 slides**;
- as quatro que ele mandou deixar como estavam são exatamente as **quatro menores**: solar 4,
  placas 6, livre 6, expansão 7.

Cortar as maiores e preservar as menores é o que faz uma apresentação ao vivo caber no tempo. A
leitura invertida faria o contrário: apagaria justo o slide de **campanha do mês** de cada uma
das três e deixaria as tabelas de recorrência. Foi essa coincidência de 3-maiores/4-menores que
decidiu, não a leitura da frase.

Antes de decidir, foi descartada uma terceira hipótese: **slide repetido**. Abri os vizinhos dos
três (`green/Slide38` "Status PRO", `green/Slide40` "KWH E GREEN POINTS DOBRADO",
`telecom/Slide51` "Voucher Especial", `seguros/Slide70` "SORTEIO — Cruzeiro"). Nenhum é variante
de "Bônus Extra"; não havia duplicata para remover.

**Estado do `FOTOS` (js/ecossistema-galeria.js):**

| conexão | antes | agora |
|---|---|---|
| placas | 6 | 6 (intacta) |
| solar | 4 | 4 (intacta) |
| livre | 6 | 6 (intacta) |
| **green** | 10 | **1** (`Slide39`) |
| **telecom** | 13 | **1** (`Slide52`) |
| **seguros** | 13 | **1** (`Slide71`) |
| expansao | 7 | 7 (intacta) |
| **total exibido** | **59** | **26** |

⚠ **OS 33 ARQUIVOS NÃO FORAM APAGADOS, e isso é diferente dos cortes anteriores.** Em `57dff13`
os slides removidos (placas 15/19/20, seguros 72-75) saíram do disco. Aqui não: a lista é a
única coisa que faz o navegador buscar a imagem, então arquivo não listado **não custa byte
nenhum ao visitante**. Enquanto o dono não confirmar no navegador, apagar 33 arquivos seria
transformar uma leitura de frase em perda de ativo. Confirmado, apaga-se num comando.
Consequência prática: **contar arquivos dá 59, contar o que o site mostra dá 26.** Não é lista
velha — está escrito no cabeçalho do arquivo.

O `telecom` perdeu dois ajustes finos feitos em 12/08 e que ficam registrados no comentário dele
para o caso de a lista voltar: os três blocos (abertura / Brasil / iGreen Mobile-EUA) e a
realocação do `Slideulitmo` ("Cashback Telecom") para antes do `Slide53`, que é onde a conexão
vira EUA.

### Parte 2 — os nomes saíram do fluxo das graduações

**Sintoma:** *"no mobile a parte de nomes quando clica no grafico ainda estao os nomes"*.

**Causa raiz, medida no celular (390x844, servido por http, não `file://`):**
`window.__pmode` **não existe abaixo de 1025px** — o modo apresentação é só desktop. Em 12/08 a
parada dos nomes saiu da apresentação (`RECONHECIMENTO-FORA-DA-APRESENTACAO`) e eu registrei
naquele commit, com todas as letras, que *"a peça não ficou órfã: fora da apresentação o caminho
de clique continua inteiro"*. **Estava certo como descrição e errado como decisão** — no celular
não existe esse "fora da apresentação" como alternativa: é o único modo que existe. Aquele
caminho preservado era, para quem abre no telefone, **o caminho**.

Medido tocando de verdade: barra do Gestor → galeria → botão **"Ver reconhecimento"** (327x38,
visível) → capa de vídeo → toque no cartão → **RECONHECIMENTO GESTOR, 114 nomes na tela**.

**Correção:** o fluxo que o dono definiu (em 10/08 e repetido em 13/08) é *fotos → vídeo → sai e
volta para o gráfico*, sem etapa de nomes em nenhum nível. Então a função `temRec()` do
`index.html` passou a devolver `false` (marcador `RECONHECIMENTO-FORA-DO-FLUXO-DAS-GRADUACOES`).
Uma linha governa quatro lugares:

1. rótulo do botão da galeria: "Ver reconhecimento" → **"Ver vídeo"**;
2. texto do cartão da capa: "seguir para os reconhecidos do mês" → **"voltar às fotos do
   evento"** — era a frase mentirosa que ficou anotada em EM ABERTO no dia 12;
3. clique no cartão: só fecha, não chama `abreRec`;
4. `depoisDasFotos`: cai sempre na capa de vídeo.

⚠ **Não foi um `if(mobile)`**, de propósito: seria a terceira mecânica a discordar das outras
duas nessa região. E **nada foi apagado** — `js/reconhecimento.js` (1,7k linhas, os 313 nomes do
Sênior, as artes) segue de pé e exportado em `GRAD_REC_FLOW.abrirReconhecimento`. Religar é
trocar `false` pela expressão que ficou comentada ao lado.

⚠ **Não confunda com o corte do Sênior.** Aquele foi na LISTA (`GRAD_REC_LEVELS` virou `[1,2,3,4]`
no `js/reconhecimento.js`, 12/08) e continua valendo por si. Este é o fluxo todo. Os dois ramos
que ainda consultam `GRAD_REC_LEVELS` (clique na barra no desktop e toque na coluna no mobile)
estão **inertes** hoje e ganharam aviso nos dois lugares: se um nível voltar à lista, eles abrem
os nomes por um caminho que o resto do fluxo não tem mais, e o sintoma seria "uma barra abre
nomes e as outras não".

### O que foi verificado

- **Celular 390x844, os 5 níveis, percurso completo (barra → botão → cartão):** `NOMES: false`
  nos **15 estados**. Botão diz "Ver vídeo" nos 4 níveis com galeria; cartão diz "voltar às
  fotos"; Sênior não abre nada.
- **Apresentação, 19 paradas das graduações, para frente E para trás:** espelho exato — cada
  índice produz o mesmo estado nos dois sentidos. `NOMES: false` nos **38 estados**. A etiqueta
  da capa casa com o nível (Gestor/Executivo/Diretor/Acionista), sem par trocado.
- **Apresentação, 40 paradas do ecossistema, para frente E para trás:** espelho exato. green,
  telecom e seguros com **1 parada cada**, mostrando exatamente `Slide39`, `Slide52` e `Slide71`;
  as outras quatro conexões com as sequências inteiras. Galeria de **uma página** era caso novo
  (a menor era 4) e funciona: abre, mostra, e a parada seguinte fecha.
- Paradas: **133 → 100**, exatamente −33 (9+12+12). Graduações seguem 18.
- As três artes que sobraram servem HTTP 200 e são JPEG real 1920x1080 (359/363/378 kB).
- `revisar.js`: **0 erros, 110 avisos** — igual à linha de base.

### ⚠ O ERRO DE MEDIÇÃO QUE EU COMETI AQUI, E A ARMADILHA NOVA QUE ELE REVELOU

A primeira comparação de geometria acusou **+7 px** na altura do documento (33332 → 33339) e
mexida em seções que eu **não tinha tocado** (`trajetoria` +7 de altura, `simulador` −3). Eu
quase reportei isso como consequência da mudança.

O que era, medido: repeti a captura do código novo e deu **idêntica** (33339). Aí voltei os dois
arquivos para o HEAD e medi o HEAD com o mesmo procedimento: **também 33339**, com
`green:10 telecom:13 seguros:13` provando que era o HEAD mesmo. Ou seja, a captura divergente
era **a primeira**, a que eu tinha eleito como referência.

**A armadilha, que ainda não estava escrita:** o **primeiro carregamento da sessão** mede
diferente dos seguintes. Cache HTTP frio, alguma imagem ainda assentando aos 4 s de espera; da
segunda carga em diante o servidor responde do cache e tudo estabiliza no mesmo valor. Os sinais
de validade do projeto (`.jphoto` 202x202, 24 ScrollTriggers, 7 pins) estavam **todos certos** na
captura ruim — eles não pegam este caso.

**Regra que fica:** capture a referência com o cache **quente** — carregue a página, descarte, e
só então capture; e quando o "depois" acusar diferença em seção que você não tocou, meça o HEAD
de novo antes de acreditar. Conclusão desta vez: **zero diferença de geometria** — altura do
documento igual, as 16 seções com deslocamento 0 px, 24 ScrollTriggers, 7 pins.

### Em aberto

- **Se a leitura da parte 1 estiver invertida**, voltar é uma linha por conexão no `FOTOS` — as
  listas antigas estão nos comentários e os 33 arquivos estão no disco. Confirmado o corte, os
  33 podem ser apagados.
- **`expansao` continua sem `Slide1X` de abertura** (pergunta que ficou de 12/08, ainda sem
  resposta). Não foi tocada.
- **O desktop fora da apresentação** também perdeu os nomes, junto com o mobile. Foi decisão, não
  efeito colateral: o fluxo é um só. Se ele quiser os nomes de volta **só no desktop**, aí sim
  precisa de uma condição — e vale avisar que seria a terceira mecânica na região.

## QUATRO CONEXÕES VAZIAS + O PLAYER DE VÍDEO POR QUALIFICAÇÃO (2026-08-13, parte 2)

Duas coisas na mesma mensagem, e a primeira **confirmou uma decisão que eu tinha tomado no
escuro poucas horas antes**.

### Parte 1 — o ecossistema ficou com 3 slides

Pedido, item por item e sem margem para leitura:

> Livre: retirar todos · Green: mantem somente 1 · Placas: retirar todos · Solar: retirar todos ·
> Telecom: mantem somente 1 · Seguros: mantem somente 1 · Expansão: retirar todos

⚠ **Isto encerra a dúvida da mensagem anterior.** Lá a frase era *"as telas green, telecom,
seguros devem ter somente essas"*, que também podia significar "tire essas três". Eu li como
"fique só com estas" e decidi pela aritmética do deck (as três nomeadas eram as três maiores).
A lista acima diz "mantem somente 1" para as mesmas três: **a leitura estava certa**. O que fica
como método é *decidir pela conta, não pela gramática* — o palpite em si não vira regra.

| conexão | antes de hoje | manhã | agora |
|---|---|---|---|
| livre | 6 | 6 | **0** (lista vazia) |
| green | 10 | 1 | **1** — `Slide39` |
| placas | 6 | 6 | **0** (lista vazia) |
| solar | 4 | 4 | **0** (lista vazia) |
| telecom | 13 | 1 | **1** — `Slide52` |
| seguros | 13 | 1 | **1** — `Slide71` |
| expansao | 7 | 7 | **0** (lista vazia) |
| **exibido** | 59 | 26 | **3** |

**Lista vazia é a forma certa de "retirar todos"**, e não apagar a entrada: `qtd` vira 0,
`temGaleria()` devolve false, o cartão não abre pop-up e a apresentação **não cria parada** para
aquela conexão. Parada que abre nada é o pior dos mundos ao vivo — quem apresenta clica e não
entende. Já estava documentado no cabeçalho do `js/ecossistema-galeria.js` desde o primeiro dia;
hoje quatro conexões usam.

⚠ **As 4 conexões continuam na seção, visíveis e clicáveis** para navegar à página de produto. O
que perderam foi o pop-up de slides. Quem investigar "o cartão da Livre não abre nada" tem a
resposta aqui — não é defeito. E os 56 arquivos seguem no disco, com as listas antigas guardadas
no comentário para recolar.

**Medido — a apresentação continua andando pelos 7 cartões:** as 13 paradas do ecossistema, para
frente e para trás, são espelho exato e se decompõem em **7 paradas de cartão** (uma por conexão,
inclusive as vazias) + 3 de slide + 3 de saída. Total geral: **100 → 73**.

### Parte 2 — "aquele padrão do vídeo, para rodar offline, para cada qualificação"

Peça nova: **`js/video-reconhecimento.js`**. É a mesma mecânica do vídeo institucional da Sede,
generalizada para quatro níveis. Arquivo local primeiro, embed do YouTube como reserva, e ao
acabar dispara `igreen:video-fim`.

⚠ **Não foi preciso mexer em nenhuma parada da apresentação**, e é por causa de uma decisão antiga
que se pagou aqui: o listener de `igreen:video-fim` no `js/presentation-mode.js` é **genérico** —
`if(active) setTimeout(goNext, 220)`. Ele não sabe qual vídeo acabou nem precisa saber. Qualquer
peça que dispare o evento ganha o "acabou, segue o fluxo" de graça.

**O ponto de entrada é o cartão da capa** que já existia (`.recvid-card`), o que também não custou
parada nova: fotos → capa → toque → vídeo → fim → a apresentação avança para a parada de saída.
O cartão tem agora **três destinos**, em prioridade: toca o vídeo; senão segue para os nomes
(`temRec`, hoje false); senão só fecha. O texto do cartão e o clique repetem essa ordem em dois
lugares porque são momentos diferentes (montagem x clique) — está avisado nos dois.

⚠ **A TABELA DE LINKS QUE ESTAVA AQUI ESTAVA ERRADA E FOI CORRIGIDA NO MESMO DIA.** Ela listava
playlists. Ver a seção *"OS LINKS VIRARAM VÍDEO ÚNICO"* no fim deste arquivo — é lá que está a
tabela válida, com o ID do Acionista que naquele momento eu não tinha.

O Sênior não entra: sem galeria, não há capa de vídeo (a capa aparece POR CIMA das fotos).
`abrir(0)` devolve **false** de propósito, e o cartão cai no destino seguinte em vez de o toque
morrer calado.

**Três armadilhas tratadas na peça, todas herdadas de defeitos reais desta base:**

1. **ENDED numa playlist não quer dizer "acabou a playlist".** O estado 0 dispara ao fim de CADA
   item. Avançar no primeiro cortaria a sequência de reconhecidos no meio, em cima da fala. O
   avanço só ocorre quando o item atual é o último (`getPlaylistIndex` vs `getPlaylist().length`).
   Se a API não souber responder, a decisão é **avançar**: pop-up que não fecha sozinho se resolve
   com um clique, apresentação travada não.
2. **`window.onYouTubeIframeAPIReady` é global e o institucional já o define.** Sobrescrever faria
   o último a carregar apagar o outro, e o sintoma seria "o vídeo da Sede não fecha sozinho depois
   que eu abri um do reconhecimento" — intermitente. A peça **encadeia**: chama o anterior, depois
   o seu.
3. **`usaReserva` é POR NÍVEL, não global.** Um arquivo faltando não deve condenar os outros três,
   que podem estar no disco. E ele fica ligado para sempre naquele nível: sem isso a segunda
   abertura remontaria o vídeo quebrado com o guarda já gasto e o pop-up abriria **vazio** — o
   pior estado, porque parece que o site travou.

**Teclado:** o player só escuta **Esc**. As setas e o espaço ele deixa passar de propósito, para
que quem apresenta possa cortar o vídeo com o passador de slide. Em troca, o tratador de teclado
da galeria ganhou a cessão `if(IGREEN_REC_VIDEO.aberto()) return` — sem ela o Esc fecharia a
galeria inteira em vez do vídeo, e a seta trocaria a foto atrás de uma tela que ninguém vê. É a
regra "quem está por cima manda", e o player entrou no topo da fila.

### ⚠ "OFFLINE" TEM UM LIMITE, E ELE NÃO É TÉCNICO — LEIA ANTES DE PROMETER

**Vídeo do YouTube não roda offline.** O que roda sem internet é um ARQUIVO no disco. Eu não baixo
vídeo do YouTube — quem tem os originais é a iGreen, e o caminho é exportar do original e copiar
para `assets/video/` com os quatro nomes exatos da tabela acima.

Consequência prática, que o dono precisa saber: os quatro `.mp4` estão no `.gitignore` (mesmo
motivo do institucional — repositório não é lugar de master de vídeo), então **no Netlify vai
tocar a reserva do YouTube**, que exige internet. Para apresentar sem rede, os arquivos têm de
estar na máquina que apresenta.

### O que foi verificado

- **Caminho offline PROVADO, não deduzido.** Copiei um mp4 de 10s para
  `assets/video/reconhecimento-gestor.mp4` e medi o percurso inteiro: o player usou o **arquivo
  local**, o ScrollSmoother pausou, o vídeo tocou até 10,17s, o `ended` disparou,
  `igreen:video-fim` saiu **exatamente 1 vez**, o pop-up **fechou sozinho**, o painel foi
  destruído (é isso que realmente para o áudio) e o smoother foi liberado. O dublê foi removido.
- ⚠ **Uma contagem falsa que eu quase reportei:** na primeira medição o evento apareceu **2
  vezes**. Não era disparo duplo da peça — eu tinha registrado o contador em duas chamadas e havia
  dois ouvintes. Refeito em página nova com um único ouvinte: **1**. Se fosse 2 de verdade, a
  apresentação avançaria duas paradas.
- **Reserva do YouTube nos 4 níveis:** simulando o 404 do arquivo local, os quatro trocaram para
  `youtube-nocookie.com` com o ID e a playlist certos e `origin` explícito (o parâmetro que o
  Erro 153 cobra). `abrir(0)` devolve false.
- **Celular 390x844:** botão "Ver vídeo", cartão "Toque para assistir ao vídeo.", player abre
  dentro do site, cabe na tela, **sem estouro horizontal**.
- **Geometria: zero diferença** contra o HEAD — altura do documento **33339** igual, as 16 seções
  com deslocamento **0 px**, 24 ScrollTriggers, 7 pins, `.jphoto` 202x202. Esta vez a referência
  foi capturada com o cache **quente**, que foi a lição da parte 1 de hoje.
- `revisar.js`: **0 erros, 110 avisos** em 18 arquivos (era 17 — o arquivo novo entrou).

### Em aberto

- **Os quatro `.mp4` não existem ainda.** Até existirem, o pop-up cai no YouTube e **precisa de
  internet**. Nomes exatos na tabela acima.
- **Não sei quantos vídeos tem cada playlist** — não abri as playlists. Se alguma tiver muitos
  itens, a apresentação só avança quando o último acabar, o que pode ser longo ao vivo. Se ele
  quiser "um vídeo e segue", é trocar o embed para o vídeo solto (tirar o `&list=`).
- **O Sênior continua sem vídeo**, por não ter galeria. Se ele quiser um, precisa de um link e a
  decisão de onde o cartão apareceria (hoje não há capa sem fotos atrás).

## OS LINKS VIRARAM VÍDEO ÚNICO, E O ACIONISTA TROCOU DE VÍDEO (2026-08-13, parte 3)

> "esses sao os links, lembrando que eles abrem dentro da pagina e nao fora"

E os quatro na forma `youtu.be/<id>`, um vídeo cada.

### ⚠ EU LI O `list=` COMO INTENÇÃO E ERREI

Os primeiros links vinham como `watch?v=...&list=...`, e eu montei playlist. **Não era
intenção**: `list=` é só o parâmetro que o YouTube cola na URL quando você copia um vídeo
estando dentro de uma lista. Fica registrado porque a conclusão errada era plausível — o
parâmetro estava lá, em três dos quatro links.

O que isso **resolveu**: era a pergunta que ficou aberta no `cab1599`, onde eu escrevi que "a
apresentação só avança quando o ÚLTIMO vídeo da playlist acabar — se alguma for longa, isso
pesa ao vivo" e perguntei se ele preferia "um vídeo e segue". A resposta veio na forma dos
links, sem ele precisar responder a pergunta.

O que isso **simplificou**: sem `list=`, o estado ENDED do embed passa a significar o que
parece significar, e a guarda de "é o último item da lista?" saiu. O comentário de
`aoMudarEstado()` registra por que ela existia — se um nível voltar a apontar para playlist,
ela tem de voltar junto, e `git show cab1599` tem a versão.

### A tabela válida

| nível | arquivo local (offline, 2026-08-13) | reserva no YouTube |
|---|---|---|
| Gestor (1) | `reconhecimento-gestor.mp4` · 2m33s · 69 MB | `embed/aKa11Al0EO8` |
| Executivo (2) | `reconhecimento-executivo.mp4` · 3m23s · 108 MB | `embed/1XJyhAy-JoI` |
| Diretor (3) | `reconhecimento-diretor.mp4` · 3m21s · 97 MB | `embed/zKdpiy-G0y0` |
| Acionista (4) | `reconhecimento-acionista.mp4` · 3m54s · 108 MB | `embed/vNQWlWggnII` |

⚠ **OS QUATRO IDs DESTA COLUNA FORAM TROCADOS NA NOITE DE 2026-08-13** — *"segue os links do youtube atualizado nao sao mais aqueles link"*. **Nenhum** dos anteriores sobreviveu; eles eram `N1y7_qi7glw` (gestor), `sgg9HaKw6xg` (executivo), `F1-N6Cmn3qI` (diretor) e `LF3UO65aB1E` (acionista), e estão em `git show c17ea63` se precisarem ser conferidos. Foi a **terceira** mexida nesses links no mesmo dia (playlist → vídeo único → estes) — se você está lendo esta seção, confira a data antes de confiar na tabela.

⚠ **A COLUNA DO ARQUIVO LOCAL NÃO MUDOU JUNTO, e isso pode ser um descasamento real.** Os quatro `.mp4` do disco são os que o dono entregou mais cedo naquele dia, exportados dos vídeos ANTIGOS. Se os links novos apontam para vídeos de conteúdo diferente (e não só para endereços novos), então o site tem duas versões do mesmo reconhecimento: **offline toca o arquivo antigo, online toca o novo**. O código não tem como perceber — nenhum dos dois lados "erra", eles só discordam. Só quem assiste os dois descobre. Ficou como pergunta em aberto para o dono.

**Total: 13m11s de vídeo, 381 MB.** Os quatro `.mp4` chegaram neste dia e estão no `.gitignore`
(4 de 4 conferidos) — então **no Netlify toca a reserva do YouTube**, que exige internet.

⚠ **O ACIONISTA TROCOU DE CONTEÚDO, não só de forma.** Antes eu só tinha a playlist dele e o
embed usava `videoseries?list=`, que começa no primeiro item da lista — que pode não ser o vídeo
que ele quer mostrar. Agora tem ID próprio (naquele momento `LF3UO65aB1E`; hoje outro — ver o aviso da tabela acima). Quem comparar com o commit anterior e
achar que "só tiraram a lista" vai errar neste nível.

O `?si=...` das URLs é o código de rastreio do botão "compartilhar" do YouTube. Não entra em nada.

### "DENTRO DA PÁGINA E NÃO FORA" — o que sobrava e o que foi feito

O caminho normal já era dentro (pop-up com arquivo local, ou pop-up com embed). Sobrava **um**
caso de aba nova: `file://` **e** arquivo local faltando ao mesmo tempo. Ele existe porque em
`file://` a origem é a string `"null"` e o player do YouTube devolve Erro 153 — sem arquivo e sem
embed, não há o que mostrar dentro.

**Regra nova:** durante a apresentação, **nunca** aba nova. Uma aba abrindo ao vivo rouba a tela,
tira o foco do teclado e o passador de slide para de responder — pior que um recado. Nesse caso o
pop-up fica de pé com um aviso **dentro** dele, e a seta continua avançando. Fora da apresentação
(alguém navegando em `file://`) a aba nova continua, porque aí é a única forma de a pessoa ver o
vídeo e não há apresentação para atrapalhar.

⚠ Na prática **nenhum dos dois dispara hoje**: os quatro `.mp4` estão no disco, então até o
`file://` toca o arquivo local. É rede de segurança, não fluxo.

⚠ Um detalhe de ordem que morde: o modal tem de abrir **antes** de o recado ser escrito no
painel. Escrever num painel de modal fechado não mostra nada, e o sintoma seria "o passo do vídeo
não faz nada" — o mesmo silêncio que esta base já pagou várias vezes.

### O que foi verificado

- **Nenhum ID de playlist sobrou em nenhum arquivo do projeto** (`grep PL5nePqlNfqM` em `js/` e
  `index.html`: zero). As menções a `list=` que restam no `js/video-reconhecimento.js` são todas
  **dentro de comentários**, explicando por que saiu.
  ⚠ Meu primeiro `grep` acusou 9 "resquícios" e eram **falso positivo do meu próprio padrão**:
  ele casava `addEventListener` e `classList`. Refeito com padrão exato: limpo.
- **Os 4 IDs têm 11 caracteres** (formato de ID do YouTube), conferidos um a um.
- **Reserva nos 4 níveis**, simulando o 404 do arquivo local: os quatro montam
  `youtube-nocookie.com/embed/<id>` **sem `list=`**, com `rel=0` (sem isso o YouTube emenda vídeo
  de outro canal no fim — numa apresentação ao vivo é o pior desfecho) e `origin` explícito.
- **"Dentro da página" MEDIDO, não presumido:** grampeei o `window.open` e percorri o fluxo do
  jeito que o dono faz (galeria → botão → cartão da capa) nos quatro níveis. **Abas abertas: 0.**
  Os quatro abriram o pop-up dentro do site com player no painel.
- **Página limpa, os quatro usam o ARQUIVO LOCAL** (`tipo: ARQUIVO LOCAL` nos quatro), e ainda 0
  abas. ⚠ Numa medição anterior os quatro apareceram como "embed" e eu quase reportei como
  regressão: era o `usaReserva[lvl]` grudento fazendo o que deve, porque na chamada anterior eu
  havia simulado o 404 nos quatro. Medição de "local vem primeiro" exige página nova.
- `abrir(0)` (Sênior) devolve **false**.
- **Geometria: zero diferença** — docH **33339**, as 16 seções com deslocamento 0 px, 24
  ScrollTriggers, 7 pins, `.jphoto` 202x202, **73 paradas**. Só mudou conteúdo de JS.
- `revisar.js`: **0 erros, 110 avisos**.

### Em aberto

- **O vídeo chegando ao último quadro com estes quatro arquivos** não é verificável no meu
  ambiente: o painel do navegador fica oculto e o relógio de mídia congela (`playing` e `pause` no
  mesmo instante, sem andar). O encadeamento *acabou → fecha → apresentação segue* foi provado no
  mesmo caminho de código com um vídeo de 10s. Só a máquina do dono responde por estes.
- **13m11s somados.** Se os quatro rodarem inteiros é isso que entra no meio das qualificações.
  A seta corta a qualquer momento, de propósito.

## VÍDEO DA CONEXÃO SEGUROS, DENTRO DO ECOSSISTEMA (2026-08-13)

> "adicione um popup para esse video ... e Seguros-BPSeguradora.mp4 para dentro do ecossistema
> com a capa e popup de play ja com a funcionalidade do modo apresentacao"

| | |
|---|---|
| arquivo local | `assets/video/Seguros-BPSeguradora.mp4` (12 MB) |
| reserva no YouTube | `embed/YYu62Vj0VmM` |
| capa | `assets/img/ecossistema/seguros/capa-video.jpg` (a `thumbnail_seguros.jpeg` que o dono mandou, 1280x720) |
| onde aparece | galeria do ecossistema, como **página 01/02** — tela própria, não adesivo |
| parada da apresentação | cartão → **capa** → vídeo → Bônus Extra → fecha |

**O player virou genérico.** O `js/video-reconhecimento.js` atendia só as graduações e a chave
era sempre número. Agora aceita **chave de texto** (`seguros`), e o `abrir()` deixou de fazer
`+lvl` cego — `+"seguros"` daria `NaN` e a peça recusaria em silêncio. O caminho do arquivo
passou a ser **explícito por entrada**: antes era montado por fórmula
(`reconhecimento-<slug>.mp4`), e `Seguros-BPSeguradora.mp4` não cabe em fórmula nenhuma.

⚠ `IGREEN_REC_VIDEO.niveis()` devolve **só as chaves numéricas**. Devolver `seguros` faria a
escada das qualificações tentar montar parada para uma conexão do ecossistema.

**Onde mora cada coisa** (três arquivos, um dado em cada lugar, sem repetição):
- `video-reconhecimento.js` — o vídeo (arquivo, ID, pop-up, `igreen:video-fim`);
- `ecossistema-galeria.js` — o elo `VIDEO_DA_CONEXAO = { seguros: "seguros" }`, a capa com play,
  e a API `temVideo`/`abrirVideo`/`fecharVideo`;
- `presentation-mode.js` — a parada, que **pergunta** à galeria em vez de ter a própria lista.

**A capa** é o próprio slide, com um play sobreposto — sem imagem nova no projeto.

⚠ **A ORDEM FOI INVERTIDA NO MESMO DIA, e vale registrar as duas.** Entrou como *imagens →
vídeo*, copiando o fluxo das Graduações, e o dono corrigiu: *"coloque o video antes e depois que
finalizar no proximo click aparece o slide do bonus extra do seguro"*. Faz sentido no conteúdo —
o vídeo da BP Seguradora **apresenta** a conexão e o Bônus Extra é a campanha do mês: o argumento
vem antes da tabela. Hoje é **vídeo → imagens**, e o play fica na **primeira**, que é onde o
visitante chega ao abrir a galeria.

⚠ **NÃO "UNIFORMIZE" COM AS GRADUAÇÕES.** Lá a ordem é *fotos → vídeo*; aqui é o inverso, e as
duas estão certas para o que contam. Quem trocar uma pela outra desfaz um pedido explícito.
Como o Seguros tem **um** slide, primeira e última são a mesma e visualmente nada mudou — o que
mudou de verdade foi a ordem das PARADAS, no `presentation-mode.js`.

Sequência medida na apresentação: `21:VIDEO  22:seguros/Slide71  23:fechada`.

### ⚠ DOIS DEFEITOS PEGOS MEDINDO, E UM DELES SÓ APARECIA VOLTANDO

**1. As paradas não eram autossuficientes.** Para a frente estava tudo certo; **ao contrário**, o
vídeo ficava aberto por cima da parada da imagem (21) e da parada do cartão (20), porque as duas
só fechavam a **galeria**. Sintoma ao vivo: o apresentador volta um passo para reexibir a arte e
continua vendo o player. É a MESMA falha de 2026-08-10 nas Graduações. Conserto: `ecoVideoClose()`
nas duas. Depois: **espelho exato**, zero diferenças nos 14 índices.
**A lição que se repete: percorra as paradas NOS DOIS SENTIDOS. Só a ida não prova nada.**

**2. O `checar-offline.js` ficou oco e o veredito virou sorte.** Ele lia a lista do `.gitignore`,
o que era elegante enquanto os vídeos estavam fora do repositório. Quando eles foram versionados
(no mesmo dia), o script parou de listar vídeo nenhum e continuou dizendo "pode apresentar" —
**sem conferir nada**. Verificador que não verifica é pior que nenhum: dá falsa segurança. Agora a
lista sai do **código** (os `arquivo:` do player e o `LOCAL=` do institucional), e o cabeçalho e o
rótulo que diziam "que o repositório não carrega" foram corrigidos junto — tinham virado mentira.

### O que foi verificado

- **Só o Seguros mostra o play:** conferido em green (1 pág.), telecom (1 pág.) e seguros — as
  duas primeiras com a galeria aberta e o botão escondido.
  ⚠ Meu primeiro teste usou a `livre` como controle e deu falso alarme: ela tem lista **vazia**,
  a galeria nem abre, e eu li um botão sobrando do desenho anterior. Controle tem de ter conteúdo.
- **Clique → player com o ARQUIVO LOCAL** (`Seguros-BPSeguradora.mp4`), chave `seguros`, **zero
  abas** abertas.
- **Apresentação: 14 paradas no ecossistema** (era 13), total **74** (era 73), espelho exato nos
  dois sentidos.
- **Geometria: zero diferença** — docH 33339, as 16 seções com deslocamento 0 px, 24
  ScrollTriggers, 7 pins, `.jphoto` 202x202, 8 stats.
- **Teclado:** a galeria do ecossistema cede ao player (`if(IGREEN_REC_VIDEO.aberto()) return`),
  senão o Esc fecharia a galeria em vez do vídeo e a seta trocaria a imagem atrás de uma tela que
  ninguém vê. O player só escuta Esc — as setas passam, para o passador de slide poder cortar.
- ⚠ **O clique do play é ligado UMA vez**, no bloco que monta o slide, e não no `desenha()` — que
  roda a cada passo. Ali empilharia um ouvinte por imagem vista e depois de seis passos um clique
  abriria o player seis vezes.
- `checar-offline.js`: os **6** vídeos presentes, veredito "pode apresentar sem internet".
- `revisar.js`: 0 erros.

## TRÊS DEFEITOS SÓ DE CELULAR (2026-08-14, parte 2)

Todos vieram do mesmo lugar: **medida fixa em pixel num elemento que muda de tamanho com a
tela**, ou **estilo em linha vencendo a folha de estilo**. Nenhum dava erro no console.

### 1. O X da galeria do ecossistema em cima da arte

Sintoma do dono, com print: *"na versao mobile ficou o botao de fechar encima da escrita"*. Ver o
detalhe completo na seção do Ecossistema, acima. Resumo: o botão tem **40px fixos**, e numa arte de
365px (celular) isso é 11% da largura — cai dentro da caixa "Quanto mais portabilidades". No
desktop, arte de 1444px, é 3% e fica acima dela. O painel ganhou `padding-top:46px` no retrato.

### 2. Os 14 Royais empilhados numa coluna

Sintoma: *"no mobile ficou assim, deve ser em carrossel normal na horizontal"*. A grade
`repeat(auto-fit,minmax(min(118px,45%),1fr))` dava 2 colunas × 7 linhas — mais alto que a tela, com
rolagem vertical dentro do pop-up, e o X caindo sobre a 2ª carta.

Virou **carrossel horizontal, no mesmo idioma do baralho da Bonificação no mobile**: flex em linha,
`scroll-snap-type:x mandatory`, `scroll-snap-align:center`, barra escondida e `padding` lateral de
`calc(50% - cardw/2)` — é esse padding que deixa a **primeira e a última** carta pararem centradas.

⚠ Três detalhes que não são estilo:
- **`grid-template-columns:none` explícito.** Sem ele a declaração da grade continua valendo.
- **`align-items:center`.** Flex em linha estica os filhos por padrão, e a carta perderia a
  proporção 273/415.
- **`padding-top:56px`** é a reserva do X, o mesmo remédio do item 1.

Medido a 390×844: painel 367×417 dentro da tela, rolagem **horizontal sim / vertical não**, as 14
na mesma linha, carta 226×343 (proporção 0,660 — exata), **X sobre 0 cartas**, primeira e última
parando no centro (184 contra 184 do meio do visor). A 320×568: carta 186×281, mesma proporção,
mesmo comportamento. Desktop 1920×946 **intocado**: segue `display:grid`, 2 linhas, carta 153×231.

### O que foi verificado
- 390×844, 320×568 e 844×390 (paisagem) nos três defeitos.
- Desktop 1920×946: galeria do ecossistema com `padding-top:0` e painel 1444×863; pop-up dos Royais
  em grade; card do mapa `position:absolute` com o `left` em linha valendo (386px). **Nada mudou.**
- `revisar.js`: 0 erros, 115 avisos — número idêntico ao de antes.

### Em aberto
- **Nada foi validado por imagem.** O navegador automatizado devolve tela preta aqui, independente
  do que está no DOM. As provas são de geometria: caixas que não se cruzam, larguras dentro da
  janela, proporção da carta. Quem confirma no olho é o celular do dono.
- O toque de arrastar do carrossel não foi exercitado — só a rolagem programática e o snap.

## "NÃO ROLA PARA O LADO" — DOIS CARROSSÉIS DIFERENTES (2026-08-14, parte 7)

Sintoma do dono: *"o scroll do mobile nos do acionistas nao esta permitindo rolar para o lado"*.
Existem **dois** carrosséis de acionistas no celular, e a resposta é diferente em cada um.

### 1. O TRILHO da Bonificação — não rola porque tem UM cartão

Medido a 390×844 no grupo **Acionistas Royal**: `scrollWidth 390 = clientWidth 390`, não rola.
E está certo: desde 2026-08-14 esse grupo é **uma capa só** — os 14 moram no pop-up. No grupo dos
**Embaixadores**, com 2 cartões, rola normalmente (708 contra 390).

⚠ Isto é desenho, não defeito. Se um dia alguém quiser o trilho rolando de novo no Royal, é
desfazer a capa — não mexer em CSS de rolagem.

### 2. O POP-UP dos 14 — faltava `touch-action:pan-x`

O que foi medido ANTES de mexer, e é o que exclui as causas óbvias:
- `touch-action:auto` em **toda** a cadeia (grade, painel, modal, body, html); `overflow-x:auto`
  na grade; `overscroll-behavior:auto`.
- **Ninguém cancela o toque**: touchstart / touchmove / touchmove / touchend sintéticos no
  carrossel, `defaultPrevented` **falso nos quatro**. Idem no body, fora do modal.
- O container **está** rolável: `scrollWidth` 3463 contra `clientWidth` 367, e `scrollLeft`
  responde por código (0 → 200 → 1200).
- Modo apresentação inativo.

Então o problema não é a rolagem nem um bloqueio — é a **atribuição do gesto**. Sem `touch-action`
declarado, o navegador decide sozinho de quem é o toque, e num rolador horizontal **dentro de um
modal de tela cheia** ele costuma entregar o gesto ao ancestral: o dedo arrasta e nada acontece.

`touch-action:pan-x` diz que este elemento panoramiza em X — e, de quebra, que o eixo Y não é dele,
o que evita o outro sintoma conhecido da mistura `overflow-x:auto` + `overflow-y:hidden` no iOS.

⚠ **NÃO É VERIFICÁVEL NESTE AMBIENTE.** Toque de verdade não se simula aqui: o `scroll` sintético
do navegador automatizado não moveu o `scrollLeft` e o painel travou. Confirmado só o mensurável —
`touch-action` computado `pan-x`, 14 cartões, snap `x mandatory`, 3.096px de curso. Quem confirma o
dedo é o celular do dono.

⚠ **Como diagnosticar "não rola" da próxima vez, nesta ordem** — foi o que funcionou:
1. `scrollWidth > clientWidth`? Se não, **não há o que rolar** (foi o caso do trilho).
2. `touch-action` computado em toda a cadeia de ancestrais.
3. Alguém cancela? Dispare `touchmove` sintético e leia `defaultPrevented`.
4. `scrollLeft` responde por código? Se sim, a rolagem existe e o problema é do gesto.

## O TRILHO NÃO ROLAVA COM O DEDO: `pointer-events:none` (2026-08-14, parte 8)

Sintoma do dono, com print dos Embaixadores no celular: *"nao esta rolando para o lado, esta no
click ainda no mobile"* — só as setas ‹ › respondiam.

### A causa

Medido a 390×844: `.carsrail` e `.cr-deck` com **`pointer-events:none` computado**. O toque nunca
chegava no baralho. As `.cr-arrows` são o **único** filho que reativa (`pointer-events:auto`), e por
isso pareciam a única forma de andar.

⚠ O baralho estava **rolável o tempo todo** — `scrollWidth` 708 contra `clientWidth` 390, e
`scrollLeft` respondendo por código. Quem não chegava era o dedo. Isto é importante para o
diagnóstico: `scrollWidth > clientWidth` **não prova** que dá para arrastar.

### Por que o `none` existe, e por que não se mexe na regra base

No **desktop** o trilho flutua SOBRE o palco, e sem `pointer-events:none` ele roubaria o toque da
metade escurecida que seleciona o carro. O comentário da regra já dizia isso: *"nunca rouba o
clique das metades"*.

No **celular** o trilho está no FLUXO (`order:4; position:relative`), embaixo dos carros, sem cobrir
nada — o motivo do `none` simplesmente não existe ali. Por isso a devolução é **só** no bloco
`max-width:1024px`. Mexer na regra base quebraria a seleção do carro no desktop.

### O conserto
```
.carsrail{ …; pointer-events:auto }
.carsrail .cr-deck{ touch-action:pan-x }
```
O `pan-x` é o mesmo remédio do carrossel dos Royais: sem declarar, o navegador decide sozinho de
quem é o gesto e costuma entregá-lo ao ancestral que rola a página.

### Verificado
- 390×844, com a página rolada até a seção: `elementFromPoint` no centro do cartão visível devolve
  um elemento **dentro do baralho** nos dois grupos (antes, com `none`, caía no que estava atrás).
  `pointer-events:auto`, `touch-action:pan-x`, baralho rolável.
- Trocar de carro pelas abas continua funcionando (o grupo mudou de ROYAL para EMBAIXADOR).
- **Desktop 1920×946 intocado**: `.carsrail` e `.cr-deck` seguem `pointer-events:none`, e a capa
  segue com `auto` (é ela que recebe o clique que abre o pop-up).
- ⚠ **O arrasto com o dedo continua sem verificação real** — toque não se simula neste ambiente.
  O que está provado é que o toque agora ALCANÇA o baralho; que ele arrasta, quem confirma é o
  celular do dono.

## A CAPA DOS ROYAIS PASSA A SER SÓ DO DESKTOP (2026-08-14, parte 9)

Pedido do dono: *"no do mobile na parte dos royais pode manter da mesma forma que o dos
embaixadores, nao precisa abrir popup no mobile dos royais"*.

Faz sentido pelo motivo de origem: a capa nasceu para **poupar 12 cliques na apresentação ao vivo**,
que é desktop. No celular ninguém apresenta — ali o gesto natural é arrastar o baralho, igual aos
Embaixadores, e um pop-up no meio disso só atrapalha. Foi também a causa direta do "não rola para o
lado" no grupo Royal: com **um** cartão, não havia o que arrastar.

### Como ficou

| | desktop (≥1025px) | celular |
|---|---|---|
| grupo ROYAL no trilho | a **capa** (1 cartão) | as **14 pessoas** |
| clique na capa | abre o pop-up dos 14 | (a capa não existe) |
| contador e setas no ROYAL | escondidos | **visíveis** |
| paradas da apresentação | 62 em 17 seções | (apresentação é desktop) |

### Três decisões

⚠ **A capa nem é CRIADA no celular** (`if (ehDesk) (function(){…})()`), em vez de existir e ficar
escondida por CSS. Se ela continuasse no grupo, o baralho teria 1 item e não haveria o que arrastar
— era exatamente o sintoma relatado. Quem manda no que aparece é o `G[].idx`, não o `display`.

⚠ **O `G[0].idx` tem dois caminhos**: `if(iCapa>=0) push(iCapa); else` empurra as 14 pessoas com
`lvl==='ROYAL'`. Uma linha só, e o resto da coreografia não sabe da diferença — continua sendo "um
grupo com N cartões".

⚠ **A regra que esconde contador e setas no ROYAL virou `@media (min-width:1025px)`.** Ela existe
porque no desktop o grupo é uma capa só e o contador mostraria "01 / 01" com setas que não levam a
lugar nenhum. No celular são 14 e as duas coisas servem — sem o `@media`, a mesma regra apagaria a
navegação justamente onde ela é necessária, e o baralho ficaria sem nenhuma pista de que há mais 13
cartas ao lado.

### Verificado
- **390×844**: nenhuma capa no baralho (16 cartões = 14 + 2). ROYAL com **14 visíveis**, rolável
  (4527 contra 390), contador **"01 / 14"** e setas visíveis. EMBAIXADOR com 2, "01 / 02", igual a
  antes. `pointer-events:auto` e `touch-action:pan-x` nos dois.
- **Desktop 1920×946 intocado**: capa presente, 17 cartões, `nRoyal:1 nEmb:2`, paradas
  `[0.25, 0.6136, 0.7955]`, seção em 320vh, contador e setas escondidos no ROYAL, pop-up existindo.
- **Apresentação: 62 paradas em 17 seções** — mesma contagem de antes.
- O pop-up dos 14 continua no código e intacto; só não é alcançável pelo celular.

## O DEDO PASSA A MOVER O BARALHO POR CÓDIGO (2026-08-14, parte 10)

Sintoma relatado **três vezes**: *"nao esta rolando para o lado"*, *"esta scrollando no click no
mobile"* — só as setas andavam.

Duas causas reais já haviam sido consertadas (`pointer-events:none` no trilho, parte 8; e o grupo
Royal com um cartão só, parte 9). Depois delas **tudo o que dá para medir dizia que o arrasto nativo
devia funcionar**: `overflow-x:auto`, `touch-action:pan-x`, `pointer-events:auto` na cadeia inteira,
`scroll-snap-align:center` nas cartas, ninguém cancelando o `touchmove`, 3.985px de curso e
`scrollLeft` respondendo por código. E no aparelho dele continuava sem andar.

### A decisão: tirar o navegador da decisão

- **`touch-action: pan-y`** no baralho — o navegador fica dono do eixo **vertical** (a página
  continua rolando com o dedo em cima do baralho) e o **horizontal** passa a ser do JS.
- **Arrasto por `pointerdown`/`pointermove`/`pointerup`**, escrevendo `scrollLeft` direto.

Um dono por eixo, sem disputa — a mesma lição de posse explícita que este projeto já aprendeu com o
snap brigando com o auto-scroll. ⚠ Manter `pan-x` junto faria o nativo e o código moverem o mesmo
scroll no mesmo gesto, e o baralho andaria **o dobro**.

⚠ **E há um ganho que não é estético: isto é TESTÁVEL aqui.** Arrasto nativo não se simula neste
ambiente (as tentativas travaram o painel), mas eventos de ponteiro sintéticos movem o `scrollLeft`
de verdade — a verificação vira número em vez de esperança.

### Três detalhes do arrasto
- **O snap é desligado durante o arrasto** e devolvido ao soltar. Com `mandatory` ligado, cada
  escrita em `scrollLeft` seria puxada de volta e o movimento sairia aos trancos.
- **Folga de 4px antes de assumir o gesto**: sem ela, encostar na carta já mexeria o baralho.
- **Ao soltar, pousa centrado** na carta mais próxima, reusando o `irCard()` das setas.

### O contador deixou de depender do rAF
`irCard()` agora pinta contador e barra **no destino**, além do `requestAnimationFrame` do listener
de scroll (que continua valendo para o arrasto em andamento). Depender só do rAF deixa o número
atrás do dedo quando o quadro demora — e "14 cartas com o contador travado em 01" lê como se nada
tivesse acontecido, que é exatamente a reclamação que este trilho já gerou.

### Verificado a 375×812 com toque emulado
Quatro arrastos para a esquerda: contador **01 → 02 → 03 → 04 → 05 de 14**, `scrollLeft` em passos
exatos de 307px. Dois arrastos de volta: **05 → 04 → 03**. Toque parado de 2px **não move nada** e
não mexe no contador. Setas seguem funcionando (04 e depois 03). Trocar de grupo leva a "01 / 02"
com 2 cartas.

### Desktop 1920×946, intocado
Baralho `pointer-events:none`, `touch-action:auto`, `overflow:visible`, `display:block`; capa
presente; `nRoyal:1 nEmb:2`; paradas `[0.25, 0.6136, 0.7955]`; seção 320vh; **apresentação com 62
paradas em 17 seções**. Todo o arrasto vive no ramo mobile do `carsrail-app`.

## O ARRASTO GANHA INÉRCIA E POUSO SUAVE (2026-08-14, parte 11)

Pedido do dono: *"deixe o scroll mais suave"*. O arrasto da parte 10 era 1:1 e o pouso usava o
`scrollTo({behavior:'smooth'})` do navegador — que tem curva e **duração fixas**: passar uma carta e
atravessar cinco levavam o mesmo tempo, então o passo curto saía lento e o longo saía correndo.

### O que mudou
- **Inércia:** a posição de pouso sai de onde o baralho **estaria** se continuasse no embalo, não de
  onde o dedo soltou. É isso que transforma um peteleco em "passa três cartas" e um arrasto lento em
  "passa uma" — antes os dois passavam uma só.
- **Pouso por tween do GSAP**, `power3.out`, com duração acompanhando a distância
  (`0,34s + dist/2600`, teto de 1,05s). Sai rápido e assenta devagar.

### Quatro travas, todas por um motivo medido
⚠ **Velocidade suavizada** (média exponencial, peso 0,7 no histórico). A instantânea do último par
de eventos oscila demais e um tremor no fim do gesto mandaria o baralho para longe.

⚠ **Piso de 8ms no intervalo entre amostras.** Dois eventos quase juntos dão um `dt` minúsculo e a
divisão explode: 30px em 0,2ms daria 150px/ms, mil vezes um peteleco real. **Medido aqui**: com
eventos sintéticos (que chegam com `dt` ~0) a velocidade estourava e só o teto de 3 cartas segurava
— o teto é a última trava, não a primeira. 8ms é o intervalo de uma tela de 120Hz, então nenhum
aparelho real perde precisão.

⚠ **Teto de 3 cartas** na projeção, para o peteleco não atravessar as 14 e perder o contexto.

⚠ **Toque sem arrasto devolve o encaixe.** O `pointerdown` mata o tween do pouso (para o dedo poder
pegar o baralho no meio do deslize), e quem devolvia o `scroll-snap-type` era o `onComplete` desse
tween — que nunca ia rodar. Sem essa linha, um toque no meio do deslize deixava o baralho **sem
encaixe** até o próximo pouso, com as cartas parando em qualquer lugar. Não dava erro, só ficava
relaxado. Verificado: durante o deslize `none`, depois do toque **`x mandatory`** de volta.

### Verificado a 375×812 com toque emulado
| gesto (300px) | pouso | duração |
|---|---|---|
| lento (20 passos de 15px) | 3 cartas | 0,58s |
| médio (10 passos de 30px) | 4 cartas (no teto) | 0,70s |
| peteleco (5 passos de 60px) | 4 cartas (no teto) | 0,70s |
| peteleco de volta | carta 1 | 0,34s |

A velocidade **influencia o pouso** e a duração **acompanha a distância** — as duas coisas que não
existiam antes. Setas seguem funcionando (02 → 03 → 02), troca de grupo leva a "01 / 02", seta
anterior desativada na primeira carta.

### Desktop 1920×946, intocado
Baralho `pointer-events:none`, `display:block`, sem snap; capa presente; `nRoyal:1 nEmb:2`; paradas
`[0.25, 0.6136, 0.7955]`; seção 320vh; **62 paradas em 17 seções**.

⚠ Com movimento reduzido no sistema, o pouso **salta** em vez de deslizar — melhor um pulo do que
uma peça que não responde.
