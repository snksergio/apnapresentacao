# CTAs — mapa de estado

Este arquivo diz **onde cada botão está e o que ele faz hoje**. Não é lista de tarefas.

Vários CTAs de conversão do site ainda não têm fluxo (formulário, CRM). A decisão do dono foi
**comentar, não remover**, para religar quando existir. Todos os blocos comentados carregam o
marcador **`CTA-DESATIVADO`** — um `grep` por ele lista todos de uma vez.

Última conferência: 2026-07-28.

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

**Religado em 2026-08-03:** o card **"Assista ao vídeo institucional"** (`.hqwatch`, seção da sede) voltou a pedido do dono e **saiu** desta lista. O `href` não é mais a âncora morta `#video-sede`: aponta para `https://www.youtube.com/@IgreenEnergy` (`target="_blank" rel="noopener"`), à espera da URL do vídeo específico. Segue `display:none` no `@media (max-width:1024px)` — medido: no mobile o card **colide com os `.hqbadge`** (ele é `position:absolute; bottom:15%`). Para mostrar no celular não basta tirar o `display:none`, precisa tirar do fluxo absoluto. No mobile o canal já está acessível pelo item `003. YouTube` do rodapé.

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
