# Mapa das coleções, seção por seção

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
**Um passo de apresentação por card** (`ecoCards()[k]`, `ecoStopIndexFor`). Mudar a quantidade muda o número de paradas e a duração da apresentação inteira.

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

## Resultados / "Os números não mentem" — 7 `.sfloat`
Seção `.stats#resultados` (`.spin` como palco). Cada stat é um `.sfloat` com `.sfnum` (número + prefixo/sufixo em `<i>`, ex.: `+R$`, `mi`, `mil`, `m²`) e `.sflbl` (rótulo). O número **anima de 0 até `data-target`** — para trocar o valor exibido, troque o `data-target`, **não** o texto `0` (que é só o ponto de partida da contagem). Locale pt-BR formata milhar com ponto: `data-target="1000"` renderiza **"1.000"** (igual a "3.000 m²").

Estado em 2026-08-03 (7 itens): `+R$150mi` bônus · `+800mil` clientes · `+35mil` licenciados · `+11` milionários · `3.000m²` sede · `+500` colaboradores · `+1.000` usinas solares. (O item "21 estados atendidos" foi removido a pedido do dono em 2026-07-30. O bônus foi de `140` para `150` em 2026-08-03 — via `data-target`, como manda o parágrafo acima.)

**Animação (nenhuma contagem fixa no JS):** desktop = timeline pinada (`.stats` `start:'top top'` `end:'+=260%'`, scrub) dirigida por `floats.length` e índice `n` — `STEP=.32`, `TOTAL=floats.length*STEP+1.1`, drift `-(60+((n*53)%90))`; some/adiciona `.sfloat` que ela recalcula sozinha. Mobile (≤1024px) = grade `auto-fit repeat(minmax(150px,1fr))` com reveal+contagem por IntersectionObserver (`.sfloat.inview`); nº ímpar de itens deixa o último sozinho na coluna esquerda (ok). Apresentação: `#resultados` tem `subs:[]` (parada única) — mexer nos itens não muda paradas.

## Recorrência — 6 `.rblock` + 7 `.rfloat`
Os `.rfloat` têm **posição fixa por índice**: `.g1` a `.g7`, com valores **diferentes** no desktop e dentro de `@media (max-width:1024px)`. Um oitavo card não tem posição e empilha no canto.

No mobile, o palco é escalado (`.recwrap` com altura fixa 1680px + `zoom:.52`) e cada `.rfloat` revela sozinho via `IntersectionObserver` com threshold 0.35 — cuidado: o `.recstage` tem `overflow:hidden`, e o observador conta o clip dos ancestrais. Card cortado pode nunca atingir o threshold e ficar invisível para sempre. **Teste rolando a seção inteira** e confirme que todos chegam a opacidade 1.

## Sede — badges + botão
4 `.hqbadge` visíveis, revelados por cascata de CSS com `nth-child(1)` a `(4)` e `transition-delay` escalonado (~80ms). **Um quinto badge nasce invisível** — a regra do índice 5 não existe. O botão entra por último (`.hqwatch`, delay .62s).

A seção tem folga de pin de `+=75%` (só respiro para o snap encaixar, não coreografa nada) e o vídeo toca em loop com play/pause por visibilidade real.

## A Rede — 15 `.rcard` (baralho 3D)

> ⚠ **A SEÇÃO `#rede` ESTÁ OCULTA desde 2026-08-03** (marcador `REDE-DESATIVADO`, `display:none` no
> topo do `<style id="rede-styles">`). O dono pediu que a vitrine saísse de seção própria e passasse
> a viver **dentro da Bonificação**, como o trilho que aparece na metade escurecida quando um carro
> é selecionado — e que "as qualificações vão direto para a bonificação". Ver **Bonificação** logo
> abaixo.
>
> **O que continua valendo desta seção:** tudo sobre o array `P`, os níveis, os pins e as fotos. O
> `<script id="rede-app">` continua sendo o **dono dos dados**: ele monta `P`, `PIN` e `cardHtml()` e
> publica em `window.REDE_DATA` **antes** de parar no guard de seção oculta. É de lá que o trilho da
> Bonificação tira as 15 pessoas. **Não apague o bloco `#rede`** — apagar leva as 15 pessoas embora.
>
> **O que NÃO vale mais:** a altura de 1050vh, o pin em `.rede-pin`, a parada por pessoa da
> apresentação (`on:false` na entrada 'A Rede') e o carrossel mobile próprio. Para reativar a seção:
> tirar o `display:none`, devolver `'rede'` ao array do `#reorder-secoes` e trocar `on:false` por
> `on:true` no `presentation-mode.js`.

Seção `#rede`, entre Graduações e Bonificação. Porte do material "Depth Rail" (React+Tailwind+Framer Motion) para o stack daqui. Tudo vem de **um array `P` no `<script id="rede-app">`** — o HTML dos cards e os dots são gerados em runtime, então **pessoa nova = uma entrada no array**, nada de HTML.

**O HTML do card é COMPARTILHADO e o CSS também.** `cardHtml(p)` é uma função só, consumida por esta seção e pelo trilho da Bonificação. No CSS, cada regra do cartão tem **dois seletores** (`#rede .rcard, .rdeck .rcard`): quem tem a classe `.rdeck` no container do baralho usa a mesma declaração. As **medidas** saem de variáveis (`--cardw`, `--cardh`, `--headh`, `--namefs`, `--pinsz`), então cada host escolhe o seu tamanho sem copiar CSS. Mexer no visual do card = mexer **num** lugar; os dois baralhos acompanham.

Estado em 2026-08-03: **2 Embaixadores + 13 Royais**, nomes reais passados pelo dono. `first` sai no accent e `last` na linha branca; em casal a 2ª linha começa com "e ..." (ex.: `first:"David Willian"`, `last:"e Aline Moura"`).

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

## Bonificação (carros) — seção PINADA + trilho das 15 pessoas
Seção `#bonificacao`, a última antes do Rodapé. **Mudou de natureza em 2026-08-03:** era 1 tela fixa (`.carstage{height:100vh}`, sem pin e sem scrub) e passou a ser **pinada com curso de rolagem**, porque recebeu o trilho de pessoas que era a seção A Rede. Blocos: `<style id="carsrail-styles">`, o `<div class="carsrail">` dentro da `.carstage`, e o `<script id="carsrail-app">`.

### Dois grupos, na ordem do plano de carreira
O trilho **não** é uma fila única com as 15 pessoas. São **dois grupos, e o grupo é a mesma informação que o carro selecionado** (pedido do dono, 2ª rodada de 2026-08-03):

1. **Royal 5K** selecionado (BYD acesa, à esquerda) → só os **13 Royais**, à direita;
2. passados todos, o carro troca **sozinho** para **Embaixador 12K** (Taycan) e entram só os **2 Embaixadores**, à esquerda;
3. um passo depois, sai da seção.

Na 1ª versão o trilho misturava os 15 e mostrava card `[ ROYAL ]` com o Embaixador selecionado — lia errado. Os grupos saem do `lvl` de cada pessoa no array `P`, o **mesmo campo** que escolhe o pin e o rótulo do card: trocar o `lvl` de alguém move a pessoa de grupo sozinho, e os quatro nunca discordam. `G[0]` casa com `data-car="0"` e `G[1]` com `data-car="1"` — a ordem é a **das abas**, não a do array `P` (onde os Embaixadores vêm primeiro).

**O curso é FIXO e tem cinco trechos** (constantes em vh no `carsrail-app`):

| trecho | vh | o que acontece |
|---|---|---|
| cabeça | `CABECA=55` | cena limpa: o vídeo toca e as abas aparecem |
| Royais | `PASSO=40` × (N_R−1) = 480 | uma parada por Royal, trilho à direita |
| ponte | `PONTE=40` | trilho sai, o carro troca no **meio** da ponte, trilho volta do outro lado |
| Embaixadores | `PASSO=40` × (N_E−1) = 40 | uma parada por Embaixador, trilho à esquerda |
| cauda | `CAUDA=45` | o trilho sai de cena e a seção fica limpa outra vez |

Altura da section = `100 + 55 + 480 + 40 + 40 + 45` = **760vh** com 13+2. **Royal novo alonga a Bonificação em 40vh**; Embaixador novo, idem. Só o Rodapé se desloca.

**Por que fixo:** se a distância dependesse do carro selecionado, um clique nas abas mudaria a altura da página no meio da navegação (pulo visível) e as paradas da apresentação — montadas **uma vez** — apontariam para o lugar errado.

**FOLGA de 9vh nas pontas de cada trecho, e não é enfeite:** a parada da última pessoa cai **exatamente** no fim do trecho e a posição em que o tween pousa erra por fração de pixel — medido na 1ª versão, progresso `0.8978390` contra o limite `0.8978102`, 28 milionésimos para fora, e o trilho aparecia **vazio justo na última pessoa**.

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
| 2 – 14 | os 13 Royais, trilho à direita, Royal 5K aceso |
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
- **Graduações na apresentação — ordens INVERTIDAS, cuidado.** O `buildStops` de `#graduacoes` gera **1 + 2N paradas** (gráfico completo, depois **pin → galeria daquele pin**, intercalado, N = nº de níveis), todas no **mesmo `y`** de scroll: quem muda a cena é a `action`, não a rolagem. As duas coleções estão em ordens **opostas** e usar o mesmo índice nas duas mostra a galeria do pin errado:
  - as barras são criadas de trás pra frente (`for(i=DATA.length-1;i>=0;i--)` no `index.html`), então no DOM `#gradBars` a **1ª é Acionista** e a última é Sênior → barra do nível `d` = `bs[(N-1) - d]`;
  - os dots do modal usam `data-i` = índice de `DATA`/`EVENTS` (**Sênior = 0**) → galeria do nível `d` = `gradEventGo(d)`.
- A contagem das paradas sai das **barras**, não dos dots: o modal é montado em runtime e pode não existir quando `rebuildIndex()` roda — contar `.gm-dot` daria 0 e as paradas de galeria sumiriam sem erro nenhum. Nível novo entra nas duas coleções e o total de paradas sobe de 2.

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

## Achado da auditoria de imagens (2026-07-26)

Varredura completa: **267 referências de mídia, todas existem no disco** — nenhum caminho quebrado em `index.html`, nas 8 páginas de produto ou no JS.

Das 183 `<img>` da index, percorrendo a página inteira:

- ~~**33 não carregadas mas ocultas** — carregam quando o modal abre. Esperado, não é defeito.~~ **ESTA CONCLUSÃO ESTAVA ERRADA** (corrigido em 2026-07-28). Elas **não** carregavam ao abrir o modal. Medido, abrindo o modal e clicando nas 5 medalhas: `treinamento` 8/8, `experience` 4/8, `cruzeiro` **0/8**, `america-latina` **0/8**, `mundo` **0/8** — 32 das 47 fotos jamais apareciam, e três galerias ficavam completamente vazias. É o **mesmo** bug dos tiles do clube (item abaixo): os 5 slides do modal ficam lado a lado por `translateX`, só o ativo está na viewport, e o `loading="lazy"` nunca dispara para os outros. Consertado liberando o lazy quando o modal abre (`liberaFotos()` em `openM`), com filtro `getClientRects()` para não baixar no mobile o lado direito que o CSS esconde. Verificado nas 3 configs: 52/52 no desktop, 27/27 visíveis no mobile (25 escondidas seguem sem baixar).
- **12 de 48 tiles do carrossel de logos do clube (órbita) nunca carregam.** São duplicatas do carrossel infinito posicionadas fora da tela na horizontal, e o `loading="lazy"` nunca dispara para elas. Efeito visível: quadrado de 142×142 em branco enquanto o carrossel gira. Arquivos existem (`club-*.avif/webp/png`).
  - **Não é o mesmo bug do fundo de moedas** (ali a caixa tinha altura 0 e a imagem nunca aparecia). Aqui a caixa tem tamanho e o problema é só o disparo do lazy num elemento que vive fora da viewport horizontal.
  - **Conserto quando o dono quiser:** tirar o `loading="lazy"` desses tiles (são pequenos — os avif somam poucas dezenas de kB) ou pré-carregar quando a órbita se aproxima. Custa alguns kB no carregamento e resolve o branco. Decisão de peso é do dono.
- **Nenhuma outra imagem visível deixou de carregar.** As 76 ocorrências de `lazy` sem `width`/`height` **não** estão quebradas hoje — mas continuam sendo a condição que apagou o fundo de moedas, então declare dimensões em imagem nova.
