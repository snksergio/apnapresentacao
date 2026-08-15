# CTAs — mapa de estado

Este arquivo diz **onde cada botão está e o que ele faz hoje**. Não é lista de tarefas.

Vários CTAs de conversão do site ainda não têm fluxo (formulário, CRM). A decisão do dono foi
**comentar, não remover**, para religar quando existir. Todos os blocos comentados carregam o
marcador **`CTA-DESATIVADO`** — um `grep` por ele lista todos de uma vez.

Última conferência: 2026-08-09.

## Ativos, com destino real

| botão | onde | vai para |
|---|---|---|
| `Iniciar jornada` | hero da home | `#resultados` |
| `Simular minha recorrência` | hero da home | `#simulador` |
| `Conhecer o produto` | hero das 7 páginas de produto | `#produto` (âncora, **sem** `data-pt-href`) |
| `Compartilhar` | simulador de 6 páginas de produto | valores calculados + URL da página |
| `Voltar para o início` | rodapé das 7 páginas | `../index.html` |
| `Chamar no WhatsApp` | 7 páginas | `wa.me/5534996775654` com mensagem pronta citando o produto |
| `Baixar para iPhone` | seção do app, na home | `apps.apple.com/br/app/igreen-connect/id6744383784` |
| `Disponível no Android` | seção do app, na home | `play.google.com/store/apps/details?id=com.br.iGreenEnergy` |

Os links externos abrem em nova aba com `rel="noopener"`. O `&` da URL do Play Store está escapado
como `&amp;` no HTML — obrigatório, senão o parser pode truncar o parâmetro.

## Comentados, esperando o fluxo de conversão

| onde | botão |
|---|---|
| header da home | `Fale conosco` |
| planos da home (2 cards) | `Escolher Connect Plus` · `Escolher Connect Full` |
| rodapé das 7 páginas | `Quero ser licenciado` · `Falar com um consultor` |
| meio da Conexão Expansão | `Quero ser licenciado` |

Ao religar: descomente o bloco e **dê um destino real**. Se for âncora, confirme que o ID existe
(ver abaixo). Se for link externo, use `target="_blank" rel="noopener"`.

## Sem destino, a decidir

- **`Começar agora`** (home) — CTA visível que ainda não leva a lugar nenhum.
- ~~`Garanta o seu ingresso` (A Rede)~~ — **deixou de existir em 2026-08-03.** A faixa verde da base do card virou o **rótulo do nível** (`EMBAIXADOR` / `ROYAL`), a pedido do dono. Trocado de `<button>` para `<span>` no mesmo passo: é rótulo, não ação — então saiu da conta de CTA morto e parou de anunciar clique para teclado/leitor de tela. Se um dia existir fluxo de ingresso, o botão volta no `innerHTML` do card dentro do `rede-app` (um lugar só, os 15 cards são gerados de lá).
- Um `href="#"` sem texto por volta da linha 2156 do `index.html` — verificar o que é antes de mexer.

## Outros blocos desativados por marcador (2026-08-03)

Mesma decisão de sempre — **desativar, não apagar** — mas estes não são CTAs de conversão:

| marcador | onde | o que é / como religar |
|---|---|---|
| `PINS-DESATIVADO` | seção dos carros (`#bonificacao`) | Medalhas 3D **Royal 5K** (`assets/pins/pin-r5.webp`, sobre a BYD) e **Embaixador 12K** (`pin-e12.webp`, sobre a Porsche), girando em `rotateY` 360°. Foram pedidas, feitas e então ocultadas. Reativar = remover **uma linha** de `display:none!important`. Toda a mecânica segue viva: o `setCar` ainda alterna `.on`, e no mobile o JS ainda move os pins para dentro da `.carband`. |
| `BOTAO-EVENTOS-DESATIVADO` | graduações, `#gradEventsBtn` ("Nossos Eventos") | ⚠ **Oculto por CSS, de propósito NÃO removido do HTML.** Ele é o **único** gatilho que abre o modal de eventos — o listener `openM` está nele. Dois caminhos dependem de um `btn.click()` nesse botão: `gradEventsOpen()` em `js/presentation-mode.js` (as 5 paradas de galeria da apresentação) e `openEvents()` no `index.html` (clicar num pin fora da apresentação). Clique programático **funciona** em elemento `display:none` — os dois foram validados no Chrome depois de ocultar. Se algum dia remover o botão de vez, **mova o listener `openM` antes**, senão a galeria fica inacessível pelos dois caminhos, sem erro no console. |
| `REDE-DESATIVADO` | seção `#rede` ("A Rede") | ⚠ **Seção inteira oculta, de propósito NÃO removida.** O dono pediu que a vitrine de licenciados saísse de seção própria e virasse o trilho dentro da Bonificação, para "as qualificações irem direto para a bonificação". O `<script id="rede-app">` continua sendo o **dono dos dados**: monta o array `P` (15 pessoas), o mapa `PIN` e o `cardHtml()`, publica em `window.REDE_DATA` e **só então** para no guard de seção oculta. O trilho da Bonificação consome isso. **Apagar o bloco `#rede` leva as 15 pessoas embora.** Religar = tirar o `display:none`, devolver `'rede'` ao array do `#reorder-secoes` e trocar `on:false` por `on:true` na entrada 'A Rede' do `presentation-mode.js`. |

**DESATIVADO DE NOVO EM 2026-08-09 — e desta vez o elemento saiu do DOM (comentado).** O dono pediu para ocultar o card **nos dois modos: site e apresentação**. Escolhido comentar o `<a class="hqwatch">` no `index.html` com o marcador `CTA-DESATIVADO`, e **não** `display:none`, porque só a remoção do DOM atende os dois de uma vez: o `<script id="vmodal-app">` começa com `querySelector('.hqwatch')` e **desiste se não achar**, então sem o card ele não monta, `window.IGREEN_VIDEO` não existe, e o `buildStops` da Sede em `js/presentation-mode.js` cai sozinho no caminho de **uma parada** (`if (!window.IGREEN_VIDEO) return [ y ]`). Com `display:none` o card continuaria no DOM, o popup continuaria montado e a apresentação continuaria abrindo o vídeo numa parada **sem gatilho visível**. Efeito medido em 1536×750: apresentação de **51 → 50 paradas**, seção **Sede de 2 → 1**, todas as outras 11 seções com a mesma contagem; geometria com **zero diferenças em 51 valores**, altura total 26.760px igual, 24 ScrollTriggers igual, `.jphoto` 202 igual. Nada de pin ou altura foi tocado — o card era `position:absolute`. No mobile 390×844 o botão de play sumiu junto (confirmado na tela) e o resto da seção ficou intacto. Todo o código que ainda fala com o card é guardado por `if` (o `setFinal`, o ajuste de `bottom` junto dos badges, o `onLeave` que fecha o popup e o listener `igreen:video-fim`), então nada vira erro — só deixa de acontecer. **Religar = descomentar o bloco.** O que está escrito abaixo continua valendo como descrição de COMO ele funciona quando ligado.

**Histórico — religado em 2026-08-03, e então com destino de verdade:** o card **"Assista ao vídeo institucional"** (`.hqwatch`, seção da sede) voltou a pedido do dono e **saiu** desta lista. O dono passou a URL do vídeo e pediu **popup dentro do site**, não nova aba: quem faz isso é o `<script id="vmodal-app">` (desde 2026-08-04 com o **arquivo local** no player e o YouTube como reserva — ver a seção mais abaixo). O `href` do card continua sendo `https://youtu.be/qdeblguZdGc` com `target="_blank"` — é a **rede de segurança** para o caso de o JS não rodar; com JS ativo o popup dá `preventDefault` e o `href` só é usado se o arquivo local faltar. **No mobile ele deixou de ser card e virou BOTÃO DE PLAY** (pedido do dono, 2026-08-04): antes era `display:none` aqui, com a justificativa de que "o vídeo já roda sozinho" — mas o que roda sozinho é o vídeo de FUNDO da sede, e o institucional do YouTube ficava **inacessível no celular**, sem nenhum gatilho para o popup. Reexibir o card não servia: ele é `position:absolute; bottom:15%` e colide com os `.hqbadge`. Então no mobile some a miniatura e sobra um círculo de play centralizado a 30% da altura do vídeo, com o rótulo embaixo — mesmo clique, mesmo popup. Verificado em 390×844: botão em [161,253,229,321], desvio do centro **0px**, **sem colidir** com os badges, e o clique abre o popup com iframe. ⚠ Centralizar exigiu `left:0;right:0` + `align-items:center`: com `left:50%` + `translate(-50%)` o botão caía a 72% da largura, porque o bloco pai do elemento absoluto não é a largura da tela.

Histórico: seguia `display:none` no `@media (max-width:1024px)` — medido: no mobile o card **colide com os `.hqbadge`** (ele é `position:absolute; bottom:15%`). Para mostrar no celular não basta tirar o `display:none`, precisa tirar do fluxo absoluto. No mobile o canal já está acessível pelo item `003. YouTube` do rodapé.

| `CTA-DESATIVADO` (2026-08-09) | seção da sede, card `.hqwatch` ("Assista ao vídeo institucional") | ⚠ **Único caso em que o elemento foi COMENTADO e não escondido por CSS** — e de propósito: sem o `.hqwatch` no DOM o `#vmodal-app` não monta, `window.IGREEN_VIDEO` some, e a apresentação perde sozinha a parada que abria o vídeo (Sede vai de 2 para 1 parada; total 51 → 50). Era exatamente o pedido: ocultar **nos dois modos**. Religar = descomentar. Detalhes e números logo abaixo desta tabela. |
| `CARTAO-MOBILE-DESATIVADO` | graduações, gráfico do mobile (`.gb`) | O toque na barra abria o `mOpen`, um cartão com pontos/ganho/perk daquele nível. **Agora abre a GALERIA de eventos** daquela qualificação (`#gradEventsModal`), a pedido do dono — os números do cartão já estão impressos embaixo de cada barra no próprio gráfico ("10.000 · SÊNIOR · R$ 500/mês"), então ele repetia a tela; o que faltava era a galeria. A função `mOpen` e o modal `.gmob` ficam no arquivo: religar é voltar a chamada no listener das `.gb`. ⚠ **Ordem: abre e DEPOIS seleciona o slide.** O inverso depende de o modal já existir no primeiro toque, e um `dot` nulo abriria a galeria do nível **errado** (Sênior) em silêncio. Verificado no mobile: toque na 4ª barra → modal aberto, dot ativo `data-i="3"`, trilha em −1099px, evento "VIAGEM". |

**Na apresentação a Sede tem 2 paradas** (2026-08-03): a 1ª enquadra a seção; a 2ª **abre o popup**. Quando o vídeo termina, o `#vmodal-app` fecha o popup e dispara `igreen:video-fim`; o `presentation-mode.js` escuta e chama `goNext()` **só se estiver apresentando** — fora da apresentação o fim do vídeo não move a página. Medido de novo com o vídeo local (2026-08-04): 7163 (Sede) → 8819 (Ecossistema), popup fechado sozinho, smoother liberado. Com o `<video>` nativo o fim vem do evento `ended` — a **API de iframe do YouTube só é carregada se a reserva entrar em cena**, e no caminho normal nenhum script de terceiro é buscado.

⚠ **`focus()` rola a página.** O `fechar()` devolvia o foco ao `.hqwatch`, que é `position:absolute` dentro da Sede — e `focus()` sem `preventScroll` faz o navegador trazer o elemento para a tela, brigando com o ScrollSmoother. Foi exatamente o que o dono relatou como "no modo apresentação ele desce automático". Os dois `focus()` do popup usam `{preventScroll:true}`. Medido depois: 4s parado na Sede, posição inalterada (7163 → 7163).

Três coisas do popup que valem registro: o player **nasce no clique e é destruído ao fechar** (custo zero no carregamento, e destruir é o que realmente **para** o vídeo — esconder deixaria o áudio tocando); ele pausa o vídeo de fundo da Sede enquanto está aberto; e o nó do modal é pendurado no `<body>`, **fora do `#smooth-content`**, senão `position:fixed` passaria a medir o ancestral transformado pelo ScrollSmoother.

### O player virou o ARQUIVO LOCAL, o YouTube é reserva (2026-08-04)

O dono relatou "no desktop ele precisa abrir dentro do site". **Abria** — medido em http: popup com iframe de 1178×662 e nenhuma aba nova. O que ele viu foi o caminho `file://`: o player do YouTube exige origem válida, em `file://` a origem é a string `"null"` e ele devolve **"Erro 153 — erro de configuração do player de vídeo"** (remedido em 2026-08-04, print no popup). Até então o `vmodal-app` fazia `return` fora de http e o clique caía no `href` do card → YouTube em nova aba.

No mesmo dia o dono perguntou se a apresentação depende 100% de internet, e **colocou o vídeo institucional na pasta do projeto**. Isso resolveu as duas coisas de uma vez: o popup passou a montar um `<video>` nativo com `assets/video/institucional-igreen.mp4`, que toca em `file://`, em http e **sem internet**.

- **O arquivo:** 1440×600, H.264, 42,7MB, 3min11. Veio de um master AV1 2560×1440 de 89,2MB, renomeado para `institucional-master.mp4` — assim a regra `assets/video/*-master.mp4` do `.gitignore` (padrão já usado pelo vídeo da sede) o mantém fora do repo. Convertido para H.264 porque **AV1 não toca em Safari sem decodificação por hardware**. Alternativas medidas: 1280×534 → 36,4MB; 1440×600 CRF 24 → 52,7MB.
- ⚠ **A proporção é 12/5 (2,40:1), não 16/9.** O `cropdetect` mostrou a imagem útil em **2560×1068** dentro do quadro 2560×1440, com 186px de **tarja preta gravada** em cima e embaixo, constante nos 5 pontos amostrados (5s, 60s, 100s, 150s, 185s). Num painel 16/9 essa tarja aparecia como duas faixas negras grossas **dentro** do popup — era o que se via no embed do YouTube. A tarja foi cortada na conversão e o `.vm-panel` passou a `aspect-ratio:12/5`.
- **A reserva:** se o arquivo faltar (deploy sem ele, caminho trocado), o evento `error` do `<video>` troca o player pelo embed do YouTube em http, ou manda para a aba do YouTube em `file://`. ⚠ **A escolha da reserva é gravada em `usaReserva` para sempre.** Sem isso a 2ª abertura montava o `<video>` quebrado de novo, o `error` voltava com o guarda já gasto e o popup abria **VAZIO** — o pior estado, porque parece que o site travou. Verificado com o arquivo removido de propósito: abertura 1 → iframe, abertura 2 → iframe.
- **Medido** (vídeo local tocando, painel razão 2,400, sem faixa preta): 1920×946 → painel 1180×492; 1536×750 dpr1.25 → 1180×492 com 129px de folga acima e abaixo; 1955×1142 → 1180×492; 390×844 → 374×156, desvio do centro **0px**. Em `file://` → toca, `currentTime` andando, duração 190,8s.
- **Geometria da página: 0 diferenças em 205 valores.** Provado arrancando o `#videoModal` e o `#vmodal-styles` da página montada e remedindo: nada se move, altura 30037 → 30037. O popup é `position:fixed` pendurado no `<body>`, então não participa do layout — não havia como mover pixel.

Detalhe do mobile que custou tempo: os pins **precisam** entrar na `.carband` (a faixa que envolve só o vídeo). Lá a seção é uma coluna (título → vídeo → abas), então um `position:absolute` na `.carstage` mede a seção inteira e joga o pin longe do carro.

## `href="#"` que estão CORRETOS — não ligue

`Ver extrato`, `Ver toda jornada` e `Ver detalhes` (×2) ficam **dentro do mockup do celular**, na
seção do app. São parte da tela simulada, não botões do site. O dono confirmou: ignorar.

## Duas armadilhas desta área

**Âncora para ID inexistente falha em silêncio.** Três botões apontavam para `#plano`, `#simulacao` e
`#contato` — nenhum existe. O handler de âncora faz `querySelector`, não acha, e retorna **sem
`preventDefault` e sem erro no console**: o botão parece morto sem nenhuma pista. Sempre confira o ID.

**`data-pt-href` é só para navegar entre páginas.** Em âncora da mesma página ele faz o clique tentar
"navegar" para o próprio documento. Remova ao converter link de página em âncora.

## Sobre o compartilhar

Já implementado nos dois lugares, com lógicas próprias:

- **Home** (`#shareBtn`): monta a mensagem com `#oTit`, `#oRec`, `#oTot` + `location.href`.
- **Páginas de produto** (`#shareProd`): monta com `#oEco`, `#oRec`, `#oTotal` + `location.href`.

No celular usa `navigator.share` (folha nativa do sistema); no desktop copia para a área de
transferência e mostra "Copiado!" por 1,6s. Sem SDK de terceiro — coerente com o `DESIGN.md`.

**As duas APIs exigem HTTPS.** Em `file://` falham caladas e o botão parece quebrado — teste
servindo por http (`npx serve .`) ou na Vercel.

`conexaoexpansao.html` não tem simulador (nenhum id de resultado), então não recebeu o botão.

**Melhoria possível, não feita:** levar os valores na URL (ex.: `?consumo=350`) e o simulador
reconstruir o resultado ao carregar. Hoje quem recebe o link vê o simulador vazio, com os valores
apenas no texto da mensagem. É a parte grande e nunca foi pedida como prioridade.


---

## ⚠ O card do vídeo institucional (`.hqwatch`) VOLTOU (2026-08-12)

Ele esteve desativado entre 2026-08-09 e 2026-08-12. O dono pediu de volta:
*"coloque o video player [...] ele deve rodar dentro do site e quanto no modo site quanto no
modo apresentacao, finalizou o video no modo apresentacao ele sai da pagina automatico e
segue o fluxo"*.

⚠ **Tudo o que ele descreveu já estava implementado** — só estava desligado pelo comentário.
A URL que ele mandou (`youtu.be/qdeblguZdGc`) é a MESMA que já estava no `href` e no `ID` do
popup. Ver a seção "O CARD DO VÍDEO VOLTOU" no `colecoes-por-secao.md`.
