/* ==========================================================================
   Modo Apresentação — desktop only
   Etapa 0: ícone/toggle na navbar + rail (dots/setas/play/sair); esconde o menu.
   Etapa 1: motor base (índice de waypoints, sweepTo, goToStop/goToSection,
            serialização, rebuild em refresh) + navegação LIGADA só no
            hero e #resultados. Demais seções ficam com o dot apagado até
            serem habilitadas nas próximas etapas.

   Regras: aditivo, não toca em nada existente; gate rígido de desktop.
   Carregado logo antes de js/page-transition.js.
   ========================================================================== */
(function(){
  'use strict';

  /* ---- gate desktop: espelha o gate do ScrollSmoother (index.html) ---- */
  if (window.matchMedia('(max-width:1024px)').matches) return;

  var root   = document.documentElement;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GSAP   = window.gsap;
  var ST     = window.ScrollTrigger;
  var SS     = window.ScrollSmoother;

  /* Seções na ordem do DOM.
     - sel: seletor (usar #ecossistema2, o clone VIVO)
     - subs: valores de progress (0..1) dos sub-stops dentro do pin.
             [] = seção "tocável" simples (descansa no fim) ou sem pin (topo).
     - on: habilitada nesta etapa? (rollout section-by-section) */
  var INDEX_SECTIONS = [
    { label:'Início',       sel:'.hero',         subs:[], on:true  },
    { label:'Resultados',   sel:'#resultados',   subs:[], on:true  },
    { label:'Trajetória',   sel:'#trajetoria',   subs:[], on:true,  trig:'.jwrap',
      /* subseções invisíveis: um passo por marco (2021→2026). As setas andam
         marco a marco; o dot continua único. Cada passo para no ponto em que a
         FOTO do ano aparece: mira dotY + max(0, data-off), garantindo card +
         foto revelados (mesma lógica de limiar do jcheck). */
      buildStops:function(st, node){
        if (!st) return null;   // reduced-motion: sem trigger → enquadramento simples
        var fill = node.querySelector('.jfillp');
        var wrap = node.querySelector('.jwrap');
        if (!fill || !wrap) return null;
        var len = (fill.getTotalLength) ? fill.getTotalLength() : 0;
        /* REDE DE SEGURANÇA (2026-08-04). O dono relatou: "na PRIMEIRA vez ele não trava no último
           marco, desce direto para a seção". Não consegui reproduzir — medido em carga limpa,
           entrando na apresentação sem rolar nada antes, as 7 paradas existiam e a apresentação
           parou em todas, inclusive na última (y=5298). Registrado aqui porque a hipótese pode
           voltar: descer direto é EXATAMENTE o sintoma de a seção ficar com UMA parada, e o único
           caminho que produz isso é este buildStops devolver null — o que acontece se o caminho SVG
           ainda não tiver sido desenhado quando o índice é montado (`getTotalLength()` = 0).
           Em vez de devolver null nesse caso, distribuímos as paradas pela GEOMETRIA dos pontos,
           que existe desde o primeiro quadro. Mesma solução usada na antiga seção A Rede.
           Só entra em ação quando o caminho não está pronto: com ele pronto, nada muda. */
        if (!len){
          var wr0 = wrap.getBoundingClientRect(), h0 = wr0.height || 1;
          var span0 = st.end - st.start, alt = [];
          node.querySelectorAll('.jitem').forEach(function(it){
            var d0 = it.querySelector('.jdot'); if (!d0) return;
            var r0 = d0.getBoundingClientRect();
            var f = ((r0.top - wr0.top) + r0.height / 2) / h0;   // fração da altura do wrap
            alt.push(st.start + span0 * Math.min(1, Math.max(0, f)));
          });
          return alt.length ? alt : null;
        }
        var wr = wrap.getBoundingClientRect();
        var span = st.end - st.start;
        var out = [];
        node.querySelectorAll('.jitem').forEach(function(it){
          var dot = it.querySelector('.jdot');
          if (!dot) return;
          var d = dot.getBoundingClientRect();
          var dotY = d.top - wr.top + d.height / 2;
          var ph = it.querySelector('.jphoto');
          var off = ph ? (parseFloat(ph.getAttribute('data-off')) || 0) : 0;
          var targetY = dotY + Math.max(0, off);   // card + foto revelados
          var lo = 0, hi = 1, p = 1;               // busca binária: fillP tip.y >= targetY
          for (var i = 0; i < 22; i++){
            var mid = (lo + hi) / 2;
            if (fill.getPointAtLength(mid * len).y >= targetY){ p = mid; hi = mid; } else { lo = mid; }
          }
          p = Math.min(1, p + 0.05);               // margem além do limiar → foto já disparada
          out.push(st.start + span * p);
        });
        return out.length ? out : null;
      } },
    /* frame:true + frameOff:0 -> enquadra o topo da secao no topo da tela, ignorando triggers.
       Necessario porque o PIN de 340% foi removido do index (a cascata virou tempo de CSS): sem
       frame, o findTrigger passaria a achar o scrub de escala ou o gatilho de visibilidade do
       video e a parada pousaria no lugar errado (o de visibilidade termina ~1 tela DEPOIS do topo,
       deixando a secao metade fora). Como a secao tem 100vh, topo no topo = tela cheia, que e
       exatamente o enquadramento que o pin dava no seu inicio. */
    { label:'Sede',         sel:'#sede',         subs:[], on:true, frame:true, frameOff:0,
      /* A sede toca em LOOP sozinha — hoje isso vale para a pagina inteira, nao so aqui: o scrub
         do currentTime pelo scroll foi removido do index (era o que mais pesava em notebook).
         Entao no foco so reinicia do zero; ao sair NAO mexe mais em loop nem pausa — quem manda
         nisso agora e o ScrollTrigger do index (toca na tela, pausa fora). Antes havia
         v.loop=false + pause() aqui, o que com o video em loop MATARIA o loop de vez depois de
         usar o modo apresentacao. */
      /* dur = duracao da VARREDURA ate a parada (vira durOverride no sweepTo), nao o tempo parado.
         Era clamp(5,16, duracao do video) porque a varredura atravessava o pin de 340% enquanto o
         video era scrubado por aquele scroll — varredura e video duravam o mesmo de proposito.
         Sem scrub e sem pin longo, isso virou uma viagem absurda: o video novo tem 21,6s, entao
         o clamp dava 16 SEGUNDOS so para chegar na secao. Agora usa um tempo normal, como as
         outras paradas (2.6 / 2.8), e nao depende mais da duracao do video. */
      dur:2.6,
      onEnter:function(){ var v=document.querySelector('.hqbg');
        if(v){ try{ v.loop=true; v.currentTime=0; var p=v.play(); if(p&&p.catch) p.catch(function(){}); }catch(e){} } },
      onLeave:function(){ var v=document.querySelector('.hqbg');
        if(v){ try{ v.loop=true; }catch(e){} }
        /* saindo da seção, o popup não pode ficar aberto por cima da próxima */
        if (window.IGREEN_VIDEO && window.IGREEN_VIDEO.aberto()) window.IGREEN_VIDEO.fechar(); },
      /* DUAS paradas na MESMA posição (pedido do dono, 2026-08-03): a 1ª enquadra a seção como
         sempre; no PRÓXIMO passo abre o popup do vídeo institucional. Quando o vídeo termina, o
         #vmodal-app dispara 'igreen:video-fim' e a apresentação segue sozinha para a próxima
         seção (ver o listener perto do fim deste arquivo).
         Só existe se o popup existir: no mobile o card .hqwatch é display:none e o vmodal nem é
         montado, então lá a seção continua com 1 parada. */
      buildStops:function(st, node){
        var off = (typeof this.frameOff === 'function') ? this.frameOff() : (this.frameOff != null ? this.frameOff : 90);
        var y = curY() + node.getBoundingClientRect().top - off;
        if (!window.IGREEN_VIDEO) return [ y ];
        /* ============================================================
           O PLAY VIROU UMA PARADA (2026-08-13)
           ------------------------------------------------------------
           Pedido do dono: *"no modo apresentacao no proximo click ele da o play e no proximo
           click ele segue o fluxo normal"*.

           ⚠ ISTO É A OUTRA METADE DA RETIRADA DO AUTOPLAY (6f36fb7). Tirar o `v.play()` do
           `montaLocal()` deixou o pop-up abrindo na capa — certo para quem navega o site, mas
           na apresentação criou um buraco: a parada abria o vídeo parado e o clique seguinte
           já saía da seção. O vídeo nunca tocava. Uma mudança pediu a outra, e é por isso que
           elas estão separadas em dois commits mas descrevem um fluxo só.

           A SEQUÊNCIA AGORA: enquadra a seção -> abre o pop-up (capa + play) -> TOCA -> o
           clique seguinte segue o fluxo. São 3 paradas onde eram 2.

           ⚠ A PARADA DO PLAY É AUTOSSUFICIENTE: ela reabre o pop-up antes de mandar tocar. Sem
           isso, funcionaria descendo e falharia subindo — voltar atrás é uso normal ao vivo, e
           `abrir()` num pop-up já aberto não faz mal (a peça é idempotente).
           ⚠ E o `tocar()` é do próprio `IGREEN_VIDEO`, não um `querySelector('video').play()`
           daqui: quem sabe se o player montado é o arquivo local ou o embed do YouTube é a
           peça, e os dois tocam de formas diferentes. Alcançar dentro dela seria criar um
           segundo dono do play.
           ============================================================ */
        /* ⚠ AS TRÊS FECHAM/PAUSAM O QUE NÃO É DELAS — medido, e sem isso o defeito só aparecia
           VOLTANDO: da parada do play para a do pop-up, o vídeo continuava tocando; e da do
           pop-up para o enquadramento, o pop-up continuava aberto. É a terceira vez hoje que
           esta mesma armadilha aparece (ecossistema e graduações foram as outras duas). */
        var V = function(){ return window.IGREEN_VIDEO; };
        return [
          { y:y, action:function(){ if (V().aberto()) V().fechar(); } },
          { y:y, action:function(){ V().abrir(); if (V().pausar) V().pausar(); } },
          { y:y, action:function(){ V().abrir(); if (V().tocar) V().tocar(); } }
        ];
      } },
    { label:'Ecossistema',  sel:'#ecossistema2', subs:[], on:true,
      /* baralho: um passo por card em foco (como a trajetória). O card i fica em
         foco quando cp = i/(N-1); e cp = (progress*D)/CARO_DUR, com CARO_DUR=5 e
         D = duração da deckTL (exposta pelo próprio trigger em st.animation).
         ============================================================
         E, DEPOIS DE CADA CARD, AS FOTOS DAQUELA CONEXÃO
         ------------------------------------------------------------
         Pedido do dono (2026-08-10): "cada ecossistema terá o seu pop up... você
         clica na seta da apresentação, abre o pop up e vai passando as imagens;
         chega na última e ela volta, e com outro clique passa para a Conexão
         Green". É a MESMA forma das graduações: parada de conteúdo, depois uma
         parada por página de foto, todas no MESMO y do card.
         Duas coisas fazem isso funcionar e as duas são fáceis de quebrar:
         (1) as paradas de foto ficam no y do card, e o `activeStops.sort()` por y
             é ESTÁVEL — então elas continuam logo depois dele, na ordem em que
             entram aqui. Dar a elas outro y as jogaria para outro lugar da fila.
         (2) o próprio card ganha uma AÇÃO que FECHA o pop-up. É o que faz o
             caminho de volta funcionar: voltando da 1ª foto para o card, o
             pop-up sai da frente. Sem isso ele ficaria aberto sobre a seção.
         Quem tem foto vem do window.ECO_GAL_CARDS, publicado pelo
         js/ecossistema-galeria.js — conexão sem foto não gera parada nenhuma,
         mesmo critério do GRAD_GAL_LEVELS: parada que não faz nada é pior que
         parada nenhuma, porque quem apresenta clica e não entende.
         ============================================================ */
      buildStops:function(st, node){
        if (!st) return null;   // reduced-motion: sem trigger → enquadramento simples
        var cards = node.querySelectorAll('.ecard');
        var N = cards.length;
        if (!N) return null;
        var D = (st.animation && st.animation.duration) ? st.animation.duration() : 10.4;
        var CARO = 5, span = st.end - st.start, out = [];
        var G = window.IGREEN_ECO_GAL || null;
        for (var i = 0; i < N; i++){
          var cp = (N > 1) ? i / (N - 1) : 0;
          var p = Math.min(1, (CARO * cp) / D);
          var y = st.start + span * p;
          (function(idx, yy){
            /* ⚠ `ecoVideoClose()` NAS DUAS PARADAS ABAIXO — e isto é correção de um defeito
               REAL, medido em 2026-08-13 ao percorrer as paradas ao contrário. Indo para a
               frente estava tudo certo; VOLTANDO, o vídeo do Seguros ficava aberto por cima
               da parada da imagem (21) e até da parada do cartão (20), porque essas duas só
               fechavam a GALERIA. Sintoma ao vivo: o apresentador volta um passo para
               reexibir a arte e continua vendo o player.
               É a MESMA falha de 2026-08-10 nas Graduações, e a mesma regra: PARADA TEM DE
               SER AUTOSSUFICIENTE. Ela não pode contar com o que a parada vizinha deixou
               pronto — funciona descendo e falha subindo, e voltar atrás é uso normal. */
            out.push({ y:yy, action:function(){ ecoVideoClose(); ecoGalClose(); } });  // o card em foco
            var pags = G ? G.paginas(idx) : 0;
            /* ============================================================
               O VÍDEO VEM ANTES DAS IMAGENS (2026-08-13, à noite)
               ------------------------------------------------------------
               ⚠ ESTA ORDEM JÁ FOI A CONTRÁRIA, no mesmo dia. Entrou como imagens -> vídeo,
               copiando o fluxo das Graduações, e o dono corrigiu: *"coloque o video antes e
               depois que finalizar no proximo click aparece o slide do bonus extra"*.
               Faz sentido no conteúdo: o vídeo da BP Seguradora APRESENTA a conexão, e o
               Bônus Extra é a campanha do mês — o argumento vem antes da tabela.
               ⚠ NÃO GENERALIZE DAS GRADUAÇÕES: lá a ordem é fotos -> vídeo, aqui é o
               inverso, e as duas estão certas para o que contam. Quem for "uniformizar" as
               duas vai desfazer um pedido explícito.
               ⚠ A parada é AUTOSSUFICIENTE: fecha a galeria antes de abrir o vídeo. Sem isso
               ela funcionaria descendo e falharia subindo — o defeito que esta mesma região
               teve horas atrás.
               ============================================================ */
            for (var k = 0; k < pags; k++){
              (function(pag){ out.push({ y:yy, action:function(){ ecoVideoClose(); ecoGalOpen(idx, pag); } }); })(k);
              /* logo DEPOIS da capa (página 0), o vídeo. As páginas 1..N são as artes. */
              if (k === 0 && ecoTemVideo(idx))
                out.push({ y:yy, action:function(){ ecoGalOpen(idx, 0); ecoVideoOpen(idx); } });
            }
            /* ============================================================
               UM PASSO SÓ PARA FECHAR, depois da última imagem
               ------------------------------------------------------------
               Sem ele, o clique que saía da última imagem fazia DUAS coisas no mesmo
               gesto: fechava o pop-up e movia o baralho para a conexão seguinte. O dono
               relatou exatamente isso (2026-08-10): "quando é a última imagem, no modo
               apresentação ele volta de uma vez e já pula para o próximo, e isso não pode
               acontecer."
               Agora a última imagem tem um passo próprio de volta: o pop-up esmaece e a
               cena fica NESTA conexão, com o card dela em foco. Só o clique seguinte vai
               para a próxima. Fica no mesmo y, então esse passo não move o scroll — quem
               move é o card seguinte, e aí o pop-up já saiu da frente há um clique.
               ============================================================ */
            /* ============================================================
               A PARADA DO VÍDEO DA CONEXÃO (2026-08-13, Conexão Seguros)
               ------------------------------------------------------------
               Entra ENTRE a última imagem e o passo que fecha, e a ordem é a mesma que o
               dono definiu para as graduações e repetiu aqui: FOTOS -> VÍDEO -> sai.
               ⚠ A PARADA É AUTOSSUFICIENTE, que é a regra mais cara deste arquivo: ela
               garante a galeria na página certa ANTES de abrir o vídeo. Sem isso ela
               funcionaria descendo e falharia subindo — e voltar atrás é uso normal ao vivo,
               o dono reexibe coisa. Foi exatamente o defeito de 2026-08-10 nas Graduações.
               ⚠ E o passo de fechar logo abaixo fecha os DOIS (vídeo e galeria), senão o
               pop-up do vídeo ficaria por cima da conexão seguinte.
               ============================================================ */
            if (pags) out.push({ y:yy, action:function(){ ecoVideoClose(); ecoGalClose(); } });
          })(i, y);
        }
        return out;
      },
      /* saindo da seção pela seta ou pelo dot, o pop-up não pode ficar por cima da
         próxima seção — mesma rede de segurança do vídeo institucional e das graduações */
      onLeave:function(){ ecoVideoClose(); ecoGalClose(); } },
    { label:'Simulador',    sel:'#simulador',    subs:[], on:true, frame:true,
      /* enquadra o cabeçalho do simulador (evita o vazio grande no topo) */
      buildStops:function(st, node){
        var head = node.querySelector('.sim-head') || node;
        return [ curY() + head.getBoundingClientRect().top - 88 ];
      } },
    { label:'Recorrência',  sel:'#recorrencia',  subs:[], on:false,   /* #recorrencia oculto (display:none) — parada morta, fora da apresentacao */
      /* transições mais suaves (entrada e beat1↔beat2) */
      dur:2.6,
      /* 2 subcategorias: (1) texto central + cards convergindo (fim do scrub radial,
         ainda no pin); (2) grid "Seis frentes, uma recorrência" enquadrado. Enquadra
         o grid por geometria em vez de usar o fim do reveal (que ia parar na bonificação). */
      buildStops:function(st, node){
        if (!st) return null;   // reduced-motion: sem trigger → enquadramento simples
        var stage = node.querySelector('.recstage');
        var grid  = node.querySelector('.recgrid');
        var out = [];
        /* recstage oculto (pedido do dono): a cena radial nao existe mais -> pula o beat 1,
           deixa so o enquadramento do grid ("Seis frentes"). */
        var stageHidden = stage && getComputedStyle(stage).display === 'none';
        if (!stageHidden){
          var all = sectionTriggers({}, node), radial = null;
          for (var i = 0; i < all.length; i++){ if (all[i].trigger === stage && !all[i].pin){ radial = all[i]; break; } }
          out.push(radial ? (radial.start + (radial.end - radial.start) * 0.98) : st.end);   // beat 1
        }
        if (grid){
          var r = grid.getBoundingClientRect(), vh = window.innerHeight;
          var off = Math.max(80, (vh - r.height) / 2);
          out.push(curY() + r.top - off);                                                  // beat 2
        }
        return out;
      } },
    { label:'Órbita',       sel:'#orbita',       on:true,
      /* 3 views: (1) app + cards flutuantes, (2) tela do clube, (3) download.
         Ao ir pela seta a ponte eco2→órbita dispara o igStartOrbita; ao ir pelo dot
         disparamos o intro na mão e garantimos o smoother ativo. */
      /* entrada pela seta é LENTA: cobre o colapso dos cards no núcleo + a descida
         até o celular (era rápido demais pra ver). Não afeta os passos internos. */
      enterDur:6,
      onEnter:function(){
        try{ var s=(window.ScrollSmoother&&ScrollSmoother.get)?ScrollSmoother.get():null; if(s) s.paused(false); }catch(e){}
        if (window.igStartOrbita) window.igStartOrbita();
      },
      /* o 1º stop era 0.19, mas os cards flutuantes só ficam 100% visíveis ~0.26
         (antes disso o celular sobe mas os cards ainda estão zerados); e a varredura
         às vezes era atropelada pelo intro (lock/seat), parando no início do pin.
         Cada stop REAFIRMA a posição exata ao chegar — apply() é 100% scroll-driven e
         força o celular no p>.16, então o estado final fica garantido (celular + cards). */
      buildStops:function(st, node){
        if (!st) return null;
        var span = st.end - st.start;
        function mk(p){ var y = st.start + span * p;
          return { y:y, action:function(){
            var s=(window.ScrollSmoother&&ScrollSmoother.get)?ScrollSmoother.get():null;
            try{ if(s) s.paused(false); }catch(e){}
            if(s) s.scrollTop(y); else window.scrollTo(0,y);
            if(window.ScrollTrigger) ScrollTrigger.update();
          } }; }
        return [ mk(0.26), mk(0.58) ];   /* 3o stop (mk .93 = fase download) removido: 3o step do celular oculto (pedido do dono) */
      } },
    { label:'Planos',       sel:'#planos',       subs:[], on:true,
      /* sub-steps (os cards são altos e não cabem juntos): (1) título + plano 1;
         (2) plano 2 enquadrado. Sem pin/scrub → geometria.
         ⚠ HAVIA UM TERCEIRO passo aqui, que enquadrava o RODAPÉ. Ele saiu em 2026-08-10,
         quando o rodapé ganhou seção própria (a entrada "Encerramento", criada porque o
         dono pediu que depois da última tela dos Destaques a apresentação "continuasse
         para a última seção"). Com os dois, o rodapé era enquadrado DUAS VEZES em sequência
         — e, pior, o segundo enquadramento aparecia rotulado como "Planos", já depois dos
         Destaques, porque o `activeStops` ordena por y e aquele passo era clampado para o
         fim da página. Medido: y=32241 num maxY de 32393, ou seja o fim.
         Se um dia o Encerramento sair, este passo é o que o substitui. */
      buildStops:function(st, node){
        var head = node.querySelector('.pl-head');
        var plans = node.querySelectorAll('.pl-list .plan');
        var vh = window.innerHeight, base = curY(), out = [];
        var ref1 = head || plans[0];
        /* off1 ADAPTATIVO: rola o quanto precisar p/ o plano 1 caber inteiro (antes era fixo
           60/240 e em monitor de ~900-940px o salto p/ 240 cortava o plano 1). H = do topo do
           titulo ate a base do plano 1; teto 240 (telas altas seguem folgadas), piso 56. */
        var off1 = 240;
        if (ref1 && plans[0]){
          var H1 = plans[0].getBoundingClientRect().bottom - ref1.getBoundingClientRect().top;
          off1 = clamp(56, 240, vh - 26 - H1);
        }
        if (ref1) out.push(base + ref1.getBoundingClientRect().top - off1);         // título + plano 1
        if (plans[1]){
          var r2 = plans[1].getBoundingClientRect();
          out.push(base + r2.top - Math.max(80, (vh - r2.height) / 2));            // plano 2
        }
        return out.length ? out : null;
      } },
    { label:'Graduações',   sel:'#graduacoes',   subs:[], on:true, trig:'#gradSection', dur:2.8,
      onLeave:function(){ recVidClose(); gradTudoClose(); gradClear(); },
      /* 1º passo: gráfico completo. Depois, INTERCALADO por nível (pedido do dono):
         pin no gráfico → galeria daquele pin → pin do próximo → galeria dele → ...
         Antes vinham em dois blocos (os 5 pins, e só então as 5 galerias), o que não
         casava o pin com as fotos dele. Tudo na mesma posição de scroll, com as mesmas
         setas; a galeria fecha sozinha ao avançar pro pin seguinte (gradEventsClose no
         passo do pin) e ao sair da seção (onLeave).
           ÍNDICES (cuidado, são ordens OPOSTAS):
           - as barras são criadas de trás pra frente (index.html: for(i=DATA.length-1;i>=0;i--)),
             então no DOM #gradBars a 1ª é Acionista e a última é Sênior
             => barra do nível d  =  bs[(n-1) - d]
           - os dots da galeria usam data-i = índice de DATA/EVENTS (Sênior=0 … Acionista=4)
             => galeria do nível d = gradEventGo(d)
         A contagem vem das BARRAS, não dos dots: o modal é montado em runtime e pode ainda
         não existir quando rebuildIndex() roda — contar dots daria 0 e as paradas de galeria
         simplesmente não existiriam. As barras já estão no DOM aqui. */
      buildStops:function(st, node){
        if (!st) return null;   // reduced-motion: sem trigger → enquadramento simples
        var y = st.start + (st.end - st.start) * 0.9;
        var bs = document.querySelectorAll('#gradBars .bar-group');
        var n = bs.length;
        var out = [{ y:y, action:function(){ gradTudoClose(); gradClear(); } }];   // gráfico completo
        /* NEM TODO NÍVEL TEM GALERIA. O Sênior não tem (pedido do dono, 2026-08-04: "Senior não
           tem pop-up, retira esse que tá aparecendo treinamentos") — o pin dele entra, a galeria
           não. Quem tem vem do index, em window.GRAD_GAL_LEVELS, ao lado do array EVENTS: é lá que
           a verdade mora. Contar dots aqui NÃO serve — o modal é montado em runtime e pode não
           existir quando rebuildIndex() roda (mesma razão de a contagem sair das barras). Sem a
           lista, o fallback é "todos têm", que é o comportamento antigo. */
        var comGal = window.GRAD_GAL_LEVELS || null;
        var temGal = function(lvl){ return comGal ? comGal.indexOf(lvl) >= 0 : true; };
        /* ============================================================
           RECONHECIMENTO-FORA-DA-APRESENTACAO (2026-08-12)
           ------------------------------------------------------------
           A parada dos NOMES saiu da apresentação por pedido do dono. Ele descreveu a
           sequência nova nível por nível e em nenhum dos cinco os nomes aparecem:
           *"o próximo que é o gestor aparece as fotos depois video e sai e volta para o
           grafico e ele clica no executivo exibe as imagens aparece o pop up do vídeo e
           depois sai novamente e assim sucessivamente para o diretor e acionista"*.
           Confirmado com ele antes de mexer, porque a frase de abertura falava em "antes de
           ir pros nomes" e havia duas leituras possíveis.

           ⚠ COMENTADO, NÃO APAGADO — é a convenção deste projeto (ver `CTA-DESATIVADO` no
           CLAUDE.md). Devolver os nomes à apresentação é descomentar estas duas linhas e a
           parada lá embaixo, nada mais.

           ⚠ E A PEÇA NÃO FICOU ÓRFÃ, o que foi conferido antes de desligar: fora da
           apresentação o caminho de clique continua inteiro — o botão `.gm-rec-btn` da
           galeria chama `depoisDasFotos()`, que abre a capa de vídeo, e clicar no card da
           capa chama `abreRec()`. Ou seja, o dono ainda alcança os nomes na mão durante uma
           apresentação ao vivo se quiser. Nada de `js/reconhecimento.js` (1.7k linhas) nem
           dos ativos dele virou peso morto.

        var comRec = window.GRAD_REC_LEVELS || null;
        var temRec = function(lvl){ return comRec ? comRec.indexOf(lvl) >= 0 : false; };
           ============================================================ */
        /* NÍVEIS COM CAPA DE VÍDEO. Era um número só (o Executivo) até 2026-08-09, quando o
           dono pediu a mesma capa no Diretor e no Acionista; o GESTOR entrou em 2026-08-10.
           São quatro hoje, e a lista vem do index, ao lado do EVENTS.
           Nos níveis SEM reconhecimento a capa é a última parada daquele pin: a próxima
           parada é o pin seguinte, e é ela que fecha tudo. Onde HÁ reconhecimento (Gestor e
           Executivo) a capa é o passo do meio, e é o `gradVidClose()` da parada dos nomes
           que a tira da frente. */
        var comVid = (window.GRAD_REC_FLOW && window.GRAD_REC_FLOW.niveisDoVideo) || [];
        var temVid = function(lvl){ return comVid.indexOf(lvl) >= 0; };
        /* ============================================================
           CADA PARADA ESTABELECE O ESTADO COMPLETO DO SEU NÍVEL
           ------------------------------------------------------------
           Esta função existe por causa de um defeito relatado pelo dono em 2026-08-10:
           *"eu seleciono o do gestor e ele abre a imagem de fundo do executivo, e as
           outras em sequência também"* — sempre o nível VIZINHO.

           A causa: as ações eram escritas só para AVANÇO. A galeria era selecionada na
           parada das fotos, e as paradas da CAPA DE VÍDEO e do RECONHECIMENTO confiavam
           que ela já estivesse no nível certo. Indo para a FRENTE isso é verdade; indo
           para TRÁS, não — e aí a capa do Gestor aparecia sobre as fotos do Executivo.
           Medido percorrendo as 19 paradas ao contrário: na parada 6 (capa do Gestor) o
           rótulo dizia "Gestor" e o dot ativo da galeria era "Executivo".
           Por que o SÊNIOR estava ok, e a pista estava aí: ele não tem galeria, então não
           havia fundo errado para aparecer. Era o único nível imune.

           A correção é tornar cada parada AUTOSSUFICIENTE em vez de acrescentar uma
           regra para o caso de "estar voltando": uma parada que só funciona vinda de um
           lado é uma parada que vai falhar de novo na próxima mudança de ordem.
           Voltar atrás é uso normal numa apresentação ao vivo — o dono reexibe coisa.

           ⚠ O guarda `temGal` não é enfeite: sem ele, o Sênior abriria o modal SEM ter
           dot para selecionar, e o fundo ficaria na galeria de outro nível — exatamente
           o defeito que esta função conserta, só que no único nível que não o tinha.
           `gradEventsOpen` é idempotente (sai se o modal já está aberto), então chamar em
           toda parada não pisca nem reabre nada.
           ============================================================ */
        var garanteGaleria = function(lvl){
          if (!temGal(lvl)) return;
          /* Usa o `abrirGaleriaDe` do index de propósito, e não o par
             `gradEventsOpen()` + `gradEventGo()`: é ele que posiciona o slide ANTES de abrir
             e sem deslizar. Com o par, o modal reabria no nível ANTERIOR e corria 0,5s até o
             certo — o "no primeiro clique ainda é o anterior" que o dono relatou.
             Quem sabe fazer isso sem deslize é quem tem o `track` na mão, ou seja o index.
             O par fica como reserva para o caso de o script não ter carregado: melhor um
             deslize do que nenhuma galeria. */
          var F = window.GRAD_REC_FLOW;
          if (F && F.abrirGaleriaDe){ try{ F.abrirGaleriaDe(lvl); return; }catch(e){} }
          gradEventsOpen(); gradEventGo(lvl);
        };
        for (var d = 0; d < n; d++){                                                 // Sênior → ... → Acionista
          (function(lvl){
            var barIdx = n - 1 - lvl;                                                // DOM invertido
            out.push({ y:y, action:function(){ gradTudoClose(); gradHover(barIdx); } });                      // pin no gráfico
            /* ⚠ O `gradRecClose()` e o `gradVidClose()` AQUI CONSERTAM UM DEFEITO PRÉ-EXISTENTE,
               achado em 2026-08-12 percorrendo as paradas AO CONTRÁRIO (medido: nas paradas de
               fotos do Gestor, Executivo, Diretor e Acionista o vídeo continuava ABERTO).
               A ação era só `gradClear() + garanteGaleria()`. Indo para a FRENTE isso basta,
               porque quando esta parada roda o vídeo ainda não abriu. Voltando do vídeo para as
               fotos, nada o fechava — e a capa ficava por cima das fotos que era para ela ter
               deixado. Não é defeito novo: conferi no HEAD e a ação era idêntica lá.
               É exatamente a armadilha do CLAUDE.md ("parada de apresentação tem de ser
               AUTOSSUFICIENTE... funciona indo para a frente e falha indo para trás"), e voltar
               atrás é uso normal ao vivo — o dono reexibe coisa.
               Fecha os dois e NÃO usa `gradTudoClose()`, que fecharia também a galeria que esta
               parada existe para mostrar. */
            if (temGal(lvl))                            // sem galeria: não cria parada morta
              out.push({ y:y, action:function(){ recVidClose(); gradRecClose(); gradVidClose(); gradClear(); garanteGaleria(lvl); } });   // galeria do pin
            /* ORDEM PEDIDA PELO DONO: as fotos, depois a capa de vídeo, e só então os nomes.
               A capa é sinalização e fica POR CIMA das fotos, por isso ela NÃO fecha a
               galeria — quem fecha é a parada seguinte. E é justamente por ficar por cima
               que ela precisa GARANTIR o fundo: o que aparece atrás dela é conteúdo. */
            if (temVid(lvl))
              out.push({ y:y, action:function(){ recVidClose(); garanteGaleria(lvl); gradVidOpen(lvl); } });  // capa de vídeo
            /* ============================================================
               O VÍDEO TOCANDO É UMA PARADA (2026-08-13, à noite)
               ------------------------------------------------------------
               Pedido do dono, descrevendo o passador de slide na mão: *"entra na foto, depois
               no popup do video, clica denovo abre o video, clica novamente ele fecha e depois
               clica novamente passa para a proxima qualificacao"*.

               ⚠ FALTAVA JUSTO ESTA. A capa (`gradVidOpen`) é só o cartão que anuncia o vídeo;
               quem TOCA é o `IGREEN_REC_VIDEO`. No site o cartão já abria o player no clique
               desde que a peça existe — mas na apresentação não havia parada para isso, então
               o passador ia da capa direto para a saída e o vídeo nunca rodava. Sintoma: o
               apresentador clica esperando o vídeo e a tela volta para o gráfico.

               ⚠ A CAPA É FECHADA AQUI, e a primeira versão desta parada NÃO fechava — defeito
               relatado pelo dono com print: *"quando dou o player o popup anterior fica na
               frente dos videos"*. Eu tinha deixado a capa aberta supondo que o player, sendo
               tela cheia, cobriria tudo. Não cobre: a capa está numa camada acima e ficava
               POR CIMA do vídeo. Fechar a capa não custa nada indo para trás, porque a parada
               anterior a reabre por conta própria — é a autossuficiência fazendo o trabalho.
               ⚠ E O "FECHA" NÃO É PARADA NOVA: a saída do nível, logo abaixo, já é o clique
               que fecha tudo e volta ao gráfico. Somando, a sequência fica exatamente a que
               ele pediu — fotos, capa, vídeo, fecha, próxima qualificação.
               ============================================================ */
            if (temVid(lvl))
              out.push({ y:y, action:function(){ garanteGaleria(lvl); gradVidClose(); recVidOpen(lvl); } });   // o vídeo tocando
            /* ============================================================
               A SAÍDA DO NÍVEL É UM CLIQUE PRÓPRIO (2026-08-12)
               ------------------------------------------------------------
               Pedido do dono, nas palavras dele: as fotos, o vídeo, *"e sai e volta para o
               grafico"*, e só então *"ele clica no executivo"*.

               Poderia não existir: a parada do PIN do nível seguinte já faz
               `gradTudoClose()`, então um único clique fecharia o vídeo E acenderia o pino
               do Executivo. Não fiz assim de propósito, e o precedente é do próprio dono —
               no ecossistema, em 2026-08-10, ele reclamou exatamente desse atalho:
               *"quando é a última imagem, no modo apresentação ele volta de uma vez e já
               pula para o próximo, e isso não pode acontecer."* Um clique que faz duas
               coisas atropela a fala de quem está apresentando.

               ⚠ E É ESTA PARADA que resolve o Acionista sem nenhum caso especial. O dono
               pediu: *"quando chega um acionista as fotos e depois o vídeo ele permanece na
               sessão das qualificações e depois no próximo clique ele desce para a próxima
               sessão"*. Como o Acionista é o último, não existe pino seguinte — a saída dele
               é a última parada da seção, o gráfico fica na tela com o pino dele aceso, e o
               clique seguinte desce. Cai fora da regra geral por consequência, não por
               exceção escrita à mão, que é o tipo de coisa que quebra na próxima mudança.

               A ação é a MESMA do pino (`gradTudoClose` + `gradHover`), e isso é correto:
               parada autossuficiente estabelece o estado completo do seu nível, indo para a
               frente ou para trás. Ver o bloco `garanteGaleria` acima.

               O guarda existe porque o SÊNIOR não tem fotos nem vídeo: para ele o pino já é
               o gráfico limpo, e uma saída seria um clique que não muda nada na tela. */
            if (temGal(lvl) || temVid(lvl))
              out.push({ y:y, action:function(){ recVidClose(); gradTudoClose(); gradHover(barIdx); } });     // sai e volta ao gráfico
          })(d);
        }
        return out;
      } },
    /* REDE-DESATIVADO (2026-08-03): a seção está display:none e a vitrine dela virou o trilho
       dentro da Bonificação. on:false é o mesmo tratamento dado ao #recorrencia oculto — parada
       morta, fora da apresentação, com o mapa preservado para reativar (on:true) se a seção
       voltar. É por isso que Graduações agora avança direto para a Bonificação. */
    { label:'A Rede',       sel:'#rede',         subs:[], on:false, trig:'#rede', dur:1.1,
      /* Uma parada por pessoa. Diferente das graduações (que agem por `action` na MESMA
         posição), aqui cada parada é uma posição de scroll DE VERDADE: a própria seção é
         pinada com scrub e o baralho lê o progresso do pin, então basta pousar no y de cada
         card e o site anima sozinho — do mesmo jeito que o ecossistema faz por card.
         O y de cada card usa a mesma fórmula do goTo() do rede-app, para a apresentação e os
         controles da seção nunca discordarem. */
      buildStops:function(st, node){
        var n = document.querySelectorAll('#rede .rcard').length;
        if (n < 2) return null;
        var ini, fim;
        if (st){ ini = st.start; fim = st.end; }
        else if (node){
          /* SEM o ScrollTrigger em mãos, cai na geometria da própria seção — a mesma fórmula
             do brief. Isto NAO é perfeccionismo: se aqui retornasse null, a seção viraria UMA
             parada só e um único toque em "passar" sairia dela direto para a Bonificação —
             exatamente o sintoma relatado pelo dono. Com o fallback, as 8 paradas existem
             mesmo que o trigger ainda não esteja registrado quando o índice é montado. */
          var top = 0, el = node;
          while (el){ top += el.offsetTop || 0; el = el.offsetParent; }
          ini = top; fim = top + (node.offsetHeight - window.innerHeight);
        } else return null;
        if (!(fim > ini)) return null;
        var out = [];
        for (var i = 0; i < n; i++) out.push(ini + (i / (n - 1)) * (fim - ini));
        return out;
      } },
    { label:'Bonificação',  sel:'#bonificacao',  subs:[], on:true, dur:1.1,
      /* DE ENQUADRAMENTO PARA PINADA (2026-08-03). Antes esta seção tinha 1 tela e 2 paradas na
         MESMA posição (enquadra + troca de carro). Agora ela é pinada e leva o trilho das pessoas
         da rede dentro dela (REDE-DESATIVADO: a seção A Rede saiu e virou este trilho).
         Sequência pedida pelo dono (2ª rodada de 2026-08-03, ele mandou o print da tela 1):
           1ª parada  — a CENA LIMPA: título "Aqui a iGreen te dá a chave", os dois carros, as abas
                        e a ficha da BYD. O vídeo dos carros toca aqui, como no site;
           2ª a 14ª   — os 13 Royais, trilho à direita, Royal 5K aceso;
           15ª e 16ª  — o carro troca sozinho para o Embaixador 12K e entram os 2 Embaixadores,
                        trilho à esquerda;
           um passo depois, próxima seção.
         São 16 paradas onde antes eram 2: é o preço de trazer as pessoas para cá.
         O vídeo dos carros toca sozinho ao entrar; pelo dot (teleporte) o reveal `once` pode não
         disparar, então damos play na mão. */
      /* frameOff só é usado no CAMINHO DE EXCEÇÃO abaixo (sem trilho): telas altas sobem um
         pouco (-72), telas baixas (notebook ~700-768px) ficam em 0, senão o título encavala
         na navbar. Com o pin ativo o enquadramento é o próprio start do pin. */
      frameOff:function(){ return window.innerHeight < 900 ? 0 : -72; },
      /* ============================================================
         A "ANDADA" DOS CARROS VOLTA A CADA ENTRADA NA SEÇÃO (2026-08-13)
         ------------------------------------------------------------
         Sintoma do dono: *"os carros antes andavam, nao sei se tirou por querer, mas se der
         pra voltar com essa andada quando tiver no slide dele, seria bom"*.

         ⚠ NADA FOI TIRADO — o vídeo nunca deixou de existir. O que acontece é que ele toca
         UMA vez e congela no último quadro, por duas razões somadas: o `<video class="carvid">`
         não tem `loop`, e o IntersectionObserver que dá o play faz `disconnect()` logo depois
         (de propósito: é para não ficar religando a cada rolagem).
         Resultado ao vivo: na primeira passagem os carros andam; ao VOLTAR para o slide deles
         — que é uso normal, o dono reexibe — a cena já está parada e parece que a animação
         sumiu. Daí o "antes andavam".

         ⚠ A CORREÇÃO É O `currentTime = 0`, não o `play()`. O `play()` sozinho já estava aqui,
         e é justamente por isso que o defeito passou despercebido: num vídeo que ACABOU, o
         play recomeça do zero em alguns navegadores e em outros não faz nada visível. Rebobinar
         explicitamente tira essa diferença do caminho.
         ⚠ Dentro de `try`: mexer em `currentTime` antes de os metadados carregarem lança em
         alguns navegadores, e uma exceção aqui derrubaria a entrada da seção inteira.
         ============================================================ */
      onEnter:function(){
        var v=document.querySelector('.carvid');
        if (!v) return;
        try{ v.currentTime = 0; }catch(e){}
        var p=v.play(); if (p&&p.catch) p.catch(function(){});
      },
      buildStops:function(st, node){
        /* as frações vêm do próprio trilho (window.CARSRAIL, publicado pelo #carsrail-app).
           NÃO repetir aqui os 55/40/70vh dele: número repetido em dois arquivos é o gêmeo
           escondido deste projeto — muda-se um e a apresentação passa a pousar entre dois cards
           sem erro nenhum no console. */
        var R = window.CARSRAIL;
        var pin = (R && R.st) ? R.st : st;
        if (!(R && pin && R.paradas && R.paradas.length > 1 && pin.end > pin.start)){
          /* sem trilho (GSAP ausente, ou o trilho não montou): volta ao comportamento antigo de
             2 paradas no mesmo y. Melhor uma seção pobre do que uma seção com 1 parada, que faria
             um único toque em "passar" sair dela direto — o sintoma que o dono já relatou. */
          var off = (typeof this.frameOff === 'function') ? this.frameOff() : (this.frameOff != null ? this.frameOff : 90);
          var y = curY() + node.getBoundingClientRect().top - off;
          return [
            { y:y, action:function(){ if (document.body.classList.contains('cars-ready')) carSelectRaw(0); } },
            { y:y, action:function(){ carSelect(1); } }
          ];
        }
        var ini = pin.start, L = pin.end - pin.start;
        var out = [];
        /* 1) CENA LIMPA (progresso 0 do pin): título + os dois carros + abas. O trilho ainda não
              entrou — ele começa depois dos 55vh de cabeça. Aqui NÃO forçamos o fim do vídeo
              (`carSelectRaw`, não `carSelect`): o dono quer ver a animação dos carros chegando,
              como no site. Se o vídeo ainda não terminou, o site revela as abas sozinho. */
        out.push({ y:ini, action:function(){ if (document.body.classList.contains('cars-ready')) carSelectRaw(0); } });
        /* 2) uma parada por pessoa, na ordem Royais → Embaixadores. São posições de scroll DE
              VERDADE: a seção é pinada com scrub, o trilho lê o progresso do pin e é ELE que troca
              o carro no meio do caminho — a apresentação não manda em nada, só pousa no y certo.
              A 1ª pessoa é a única com ação: `carSelect(0)` (e não `carSelectRaw`) porque, se o
              dono avançar antes de o vídeo acabar, é preciso forçar o estado final — abas e foto
              no lugar — antes de o card aparecer. */
        out.push({ y:ini + R.paradas[0] * L, action:function(){ carSelect(0); royaisClose(); } });
        /* ============================================================
           A CAPA DOS ROYAIS ABRE O POP-UP (2026-08-14)
           ------------------------------------------------------------
           Pedido do dono: a capa no trilho e, ao clicar, *"um pop up com todas os quatorze
           nomes e imagens"*, com "a funcionalidade do clique da apresentacao". Ele confirmou
           que e UM clique so — os 14 aparecem juntos numa grade, nao um por vez.

           ⚠ A PARADA ENTRA LOGO DEPOIS DA PRIMEIRA POSICAO DO TRILHO, que e onde a capa fica:
           o grupo ROYAL passou a ter UM card (a capa) em vez de 14, entao `R.paradas[0]` e ela.
           ⚠ AUTOSSUFICIENTE nos dois sentidos: esta ABRE, e a parada de cima e as de baixo
           FECHAM. Sem isso o pop-up ficaria por cima dos Embaixadores ao seguir, e continuaria
           aberto ao voltar — o defeito de "so falha voltando" que este arquivo ja teve tres
           vezes esta semana (ecossistema, graduacoes e Sede).
           ============================================================ */
        out.push({ y:ini + R.paradas[0] * L, action:function(){ carSelect(0); royaisOpen(); } });
        /* ⚠ O PASSO QUE FECHA E VOLTA A CARTA — pedido explicito do dono, e eu tinha construido
           so dois passos onde ele descreveu TRES: *"selecionar a carta, abrir o pop up, quando
           exibir tudo no proximo clic ele fecha volta no estado da carta e depois no proximo
           clique ele continua no fluxo normal"*.
           Sem esta parada, o clique que fecha o pop-up era o MESMO que saia da secao — duas
           coisas num gesto so. E exatamente a reclamacao que ele ja fez em 2026-08-10 sobre o
           ecossistema (*"volta de uma vez e ja pula para o proximo, e isso nao pode acontecer"*).
           Fica no MESMO y da anterior: nao move o scroll, so muda a cena. */
        out.push({ y:ini + R.paradas[0] * L, action:function(){ carSelect(0); royaisClose(); } });
        for (var i = 1; i < R.paradas.length; i++)
          (function(fr){ out.push({ y:ini + fr * L, action:royaisClose }); })(R.paradas[i]);
        return out;
      } },
    /* ----- AGENDA DA SEMANA (2026-08-09) -----
       Carrossel de dias, logo depois da Bonificação. UMA PARADA POR DIA, todas no MESMO y:
       quem muda a cena é a `action`, não a rolagem — o mesmo desenho das Graduações e da
       Trajetória. É isso que atende ao pedido do dono de que "a cada toque no teclado, a
       cada scroll do mouse, muda o dia": na apresentação o avanço já é tecla e roda, e
       aqui cada avanço cai num dia.
       A CONTAGEM VEM DOS DADOS, não de contar nós na tela: o componente usa Shadow DOM e
       os círculos não são alcançáveis por querySelectorAll a partir daqui. `ag.dados` é a
       lista publicada pelo próprio componente. Sem ele (script não carregou), devolve null
       e a seção volta a ser uma parada de enquadramento simples — nunca uma parada morta. */
    /* ============================================================
       TOP 10 GREEN POINTS — uma parada, entre os carros e a Agenda (2026-08-10)
       ------------------------------------------------------------
       Pedido do dono: a tabela "precisa ficar ao meio, uma secao", entre os carros e a
       agenda. E arte unica, sem passo interno: uma parada so, centrada na tela como a
       Agenda e os Destaques — encostar o topo no topo da janela deixaria a tabela na
       beirada de baixo.
       A ORDEM na apresentacao sai da posicao desta entrada no SECTIONS, e a ordem na
       PAGINA sai do #reorder-secoes. As duas precisam concordar: 'top10' entrou entre
       'bonificacao' e 'agenda' nas duas listas.

       ⚠ TOP10-DESATIVADO (2026-08-12): `on:false`. O dono pediu *"a imagem anexo retire essa
       secao"*, com o print da tabela em anexo. A secao esta `display:none` no index e saiu da
       lista do #reorder-secoes; aqui ela vira parada MORTA e fica fora da apresentacao — e é
       obrigatorio que as tres coisas andem juntas, senao a apresentacao teria um clique que
       pousa num elemento invisivel e a tela nao muda nada (defeito que este projeto ja
       conhece: overlay aberto com o scroll andando atras, comando que parece morto).
       Mesmo tratamento da #rede e da #recorrencia. Reativar = `on:true` + as duas de la.
       ============================================================ */
    { label:'TOP 10',       sel:'#top10',        subs:[], on:false, frame:true,
      buildStops:function(st, node){
        var sobra = Math.max(0, (window.innerHeight - node.offsetHeight) / 2);
        return [ curY() + node.getBoundingClientRect().top - sobra ];
      } },
    { label:'Agenda',       sel:'#agenda',       subs:[], on:false, dur:1.2,
      buildStops:function(st, node){
        var ag = document.getElementById('agendaSemana');
        var dias = (ag && ag.dados && ag.dados.length) || 0;
        if (dias < 2) return null;
        /* CENTRALIZA a seção na tela em vez de encostar o topo dela no topo da janela
           (pedido do dono: "sobe ele mais um pouco e ajusta de forma que eu consiga ver em
           uma tela de forma completa tanto o dia quanto as atividades abaixo").
           A seção cabe inteira depois que o cabeçalho saiu; centrar é o que garante que
           nem o carrossel nem os cards de horário fiquem na beirada. O Math.max(0,...)
           cobre a tela baixa, onde a seção é maior que a janela: aí volta a encostar no
           topo, que é o menos pior. */
        var sobra = Math.max(0, (window.innerHeight - node.offsetHeight) / 2);
        var y = curY() + node.getBoundingClientRect().top - sobra;
        var out = [];
        for (var d = 0; d < dias; d++) (function(i){
          out.push({ y:y, action:function(){ try{ ag.ir(i); }catch(e){} } });
        })(d);
        return out;
      } },
    /* ============================================================
       DESTAQUES — 3 telas, uma parada cada (2026-08-10)
       ------------------------------------------------------------
       "um carrossel que passará por clique e no modo apresentação também... e depois
       que passar a última ela continua para a última seção."
       Mesma forma da Agenda: todas as paradas no MESMO y (a seção enquadrada), e a
       ação de cada uma leva o carrossel para a tela dela. Ficando no mesmo y, o
       `activeStops.sort()` — que é estável — mantém a ordem em que entram aqui, e a
       varredura não precisa andar entre telas.
       A parada da PRIMEIRA tela chama `ir(0)`, e não só enquadra: voltando do rodapé
       para cá, o carrossel tem de voltar à tela 1 em vez de continuar na 3.
       ============================================================ */
    { label:'Destaques',    sel:'#destaques',    subs:[], on:false, dur:1.2,
      buildStops:function(st, node){
        var D = window.IGREEN_DESTAQUES;
        var n = (D && D.telas && D.telas()) || 0;
        if (!n) return null;                       /* sem telas: enquadramento simples */
        /* centraliza a seção, como a Agenda: ela é uma arte 16:9 e encostar o topo no
           topo da janela deixaria a arte na beirada de baixo */
        var sobra = Math.max(0, (window.innerHeight - node.offsetHeight) / 2);
        var y = curY() + node.getBoundingClientRect().top - sobra;
        var out = [];
        for (var i = 0; i < n; i++) (function(k){
          out.push({ y:y, action:function(){ try{ D.ir(k); }catch(e){} } });
        })(i);
        return out;
      } },
    /* ============================================================
       MAPA DO SUMMIT — uma parada, entre os Destaques e o Encerramento (2026-08-12)
       ------------------------------------------------------------
       Entrou quando o dono tirou a 3ª tela do carrossel dos Destaques (a arte da agenda
       das 21 cidades) e pediu *"crie uma nova secao abaixo para mapa summit"*.

       ⚠ UMA PARADA, DE ENQUADRAMENTO — e essa foi uma escolha conservadora que vale
       explicar, porque o contrário era tentador. O `window.IGREEN_SUMMIT` já expõe tudo
       o que faria uma parada por CIDADE (as 21, com `paginas()`, `abrir(uf, pag)` e
       `fechar()`, de propósito na mesma forma da `IGREEN_ECO_GAL`). Não fiz isso porque:
         · o dono pediu uma SEÇÃO, não uma coreografia — 21 paradas novas mudariam a
           duração da apresentação inteira sem ele ter pedido;
         · ele acabou de REDUZIR paradas (tirou os nomes das Graduações e o TOP 10);
         · a arte que saiu dos Destaques era UMA parada, então a apresentação fica com o
           mesmo tamanho de antes desta mudança.
       Se ele quiser percorrer as cidades, o `buildStops` vira o mesmo desenho do
       ecossistema (uma parada por página, todas no mesmo y, mais uma de fechar) e a API
       já está pronta. Está registrado como pergunta aberta.

       `frame:true` centra a seção na tela, como o TOP 10 fazia e como a Agenda faz: o
       mapa é alto e encostar o topo no topo da janela deixaria o rodapé da seção fora.
       ============================================================ */
    /* ============================================================
       ENCERRAMENTO — o rodapé, para a apresentação ter fim
       ------------------------------------------------------------
       Entrou junto com os Destaques porque o pedido do dono foi que depois da última
       tela do carrossel a apresentação "continua para a última seção". Sem uma parada
       aqui, a última tela do carrossel seria o fim e o clique seguinte não faria nada
       — parecendo travamento. É uma parada só, de enquadramento: o rodapé não tem
       coreografia nenhuma.
       ============================================================ */
    { label:'Encerramento', sel:'#rodape',       subs:[], on:true, frame:true, frameOff:0 },
  ];

  /* ----- config por página -----
     index.html: sem window.PMODE → usa INDEX_SECTIONS (mapa rico, com pin/scrub).
     páginas de produto: definem window.PMODE = { auto:true, backHref:'../index.html' }
     antes deste script; as seções são auto-detectadas (header.hero + <section>),
     cada uma vira um stop simples de enquadramento (scroll nativo, sem GSAP). */
  var PM   = window.PMODE || {};
  var AUTO = !!PM.auto;
  /* produto em apresentação: limpa o restore de scroll da visita anterior ANTES do
     page-transition rodar (este script carrega antes dele) — assim a página não é
     deslocada na chegada; a apresentação sempre começa no hero. */
  if (AUTO){ try{ if (sessionStorage.getItem('pm') === '1') sessionStorage.removeItem('pt-scroll:' + location.pathname); }catch(e){} }
  function buildAutoSections(){
    var sel = PM.screens || 'header.hero, section';
    var seen = [];
    [].slice.call(document.querySelectorAll(sel)).forEach(function(s){ if (seen.indexOf(s) === -1) seen.push(s); });
    return seen.map(function(s, i){
      var lbl = s.getAttribute('data-pm-label');
      if (!lbl){ var h = s.querySelector('h1, h2, .kicker'); lbl = h ? h.textContent : (s.id || ('Seção ' + (i + 1))); }
      lbl = (lbl || '').replace(/\s+/g, ' ').trim().slice(0, 22) || ('Seção ' + (i + 1));
      var cfg = { label: lbl, el: s, subs: [], on: true, frame: true, frameOff: (PM.frameOff != null ? PM.frameOff : 80) };
      /* PASSO A PASSO (.cstep empilhados, normalmente 4): nao cabe numa tela — antes so dava
         p/ ver o passo 1 e metade do 2. Vira 2 stops: (1) titulo + primeira metade,
         (2) segunda metade centralizada. Offsets adaptativos p/ nao cortar em tela baixa. */
      if (s.querySelectorAll('.cstep').length >= 3){
        cfg.buildStops = function(st, node){
          var all = node.querySelectorAll('.cstep');
          var n = all.length, half = Math.ceil(n / 2);
          var vh = window.innerHeight, base = curY(), out = [];
          var headEl = node.querySelector('.sec-head') || all[0];
          /* 1o stop: enquadra pelo TITULO (nao pelo topo da section, que tem padding e
             desperdicava ~120px) e rola o quanto precisar p/ a 1a metade caber. */
          var hTop = base + headEl.getBoundingClientRect().top;
          var H1 = (base + all[half - 1].getBoundingClientRect().bottom) - hTop;
          out.push(hTop - clamp(24, 120, vh - 26 - H1));
          /* 2o stop: 2a metade centralizada na tela */
          var g0 = all[half], gl = all[n - 1];
          if (g0 && gl){
            var t0 = base + g0.getBoundingClientRect().top;
            var gh = (base + gl.getBoundingClientRect().bottom) - t0;
            out.push(t0 - clamp(40, 220, (vh - gh) / 2));
          }
          return out;
        };
      }
      return cfg;
    });
  }
  var SECTIONS = AUTO ? buildAutoSections() : INDEX_SECTIONS;

  /* ---- ícones (SVG inline) ---- */
  var ICON_PRESENT =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect class="pm-frame" x="2.5" y="4.5" width="19" height="13" rx="2.2" fill="none" stroke-width="1.6"/>' +
      '<path class="pm-play" d="M10 8.6v6l5-3z"/>' +
      '<line class="pm-frame" x1="8" y1="20.5" x2="16" y2="20.5" stroke-width="1.6"/>' +
    '</svg>';
  var ICON_EXIT = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
  var ICON_UP   = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 15 12 9 18 15"/></svg>';
  var ICON_DOWN = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
  var ICON_PLAY = '<span class="pm-playicon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6l10 6-10 6z" fill="currentColor" stroke="none"/></svg></span>' +
                  '<span class="pm-pauseicon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="6" width="3.4" height="12" fill="currentColor" stroke="none"/><rect x="13.6" y="6" width="3.4" height="12" fill="currentColor" stroke="none"/></svg></span>';

  /* ---- helpers ---- */
  function el(tag, cls, html){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function sm(){ return (SS && SS.get) ? SS.get() : null; }
  function curY(){ var s = sm(); return s ? s.scrollTop() : (window.pageYOffset || 0); }
  function setY(y){ var s = sm(); if (s) s.scrollTop(y); else window.scrollTo(0, y); if (ST) ST.update(); }
  function maxY(){ return ST ? ST.maxScroll(window) : Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
  function clamp(a, b, v){ return v < a ? a : (v > b ? b : v); }

  /* graduações: activate/deactivate do hover são locais ao app; disparamos os
     eventos que os próprios elementos das barras escutam (pointerenter/leave). */
  function gradBarEls(){ var r = document.getElementById('gradBars'); return r ? [].slice.call(r.querySelectorAll('.bar-group')) : []; }
  function gradClear(){ gradBarEls().forEach(function(g){ try{ g.dispatchEvent(new PointerEvent('pointerleave', {bubbles:true})); }catch(e){} }); }
  function gradHover(i){ var bs = gradBarEls(); if (!bs.length) return; gradClear(); if (bs[i]){ try{ bs[i].dispatchEvent(new PointerEvent('pointerenter', {bubbles:true})); }catch(e){} } }

  /* modal "Nossos Eventos" das graduações: abrir/fechar e navegar os slides pelos
     próprios controles do site (o modal já tem navegação horizontal). */
  function gradModalEl(){ return document.getElementById('gradEventsModal'); }
  function gradEventsOpen(){ var m = gradModalEl(); if (m && m.classList.contains('open')) return; var b = document.getElementById('gradEventsBtn'); if (b) try{ b.click(); }catch(e){} }
  function gradEventsClose(){ var m = gradModalEl(); if (m && m.classList.contains('open')){ var c = m.querySelector('.gm-close'); if (c) try{ c.click(); }catch(e){} } }
  /* `i` é o NÍVEL da escada (Sênior=0 … Acionista=4), por isso data-lvl e não data-i — o data-i é a
     posição do slide no carrossel do modal, e os dois deixaram de coincidir quando o Sênior saiu da
     galeria. Trocar um pelo outro abre a galeria do nível vizinho, sem erro nenhum no console. */
  function gradEventGo(i){ var d = document.querySelector('#gradEventsModal .gm-dot[data-lvl="' + i + '"]'); if (d) try{ d.click(); }catch(e){} }

  /* ---- reconhecimento por qualificação (2026-08-09) ----
     A peça (js/reconhecimento.js) é tela cheia e o popup de vídeo é um cartão sobre a
     galeria. Os dois PRECISAM ser fechados no passo seguinte, e não só ao sair da seção:
     no Sênior não há galeria aberta, então o gradEventsClose() do passo do pin não fecha
     nada e a peça ficaria por cima do gráfico da próxima qualificação — sem erro nenhum
     no console, que é justamente o tipo de falha silenciosa que este projeto já pagou caro. */
  function gradRecClose(){ var R = window.IGREEN_RECONHECIMENTO; if (R && R.aberto()) try{ R.fechar(); }catch(e){} }
  function gradVidClose(){ var F = window.GRAD_REC_FLOW; if (F && F.videoAberto && F.videoAberto()) try{ F.fecharVideo(); }catch(e){} }
  function gradRecOpen(lvl){ var R = window.IGREEN_RECONHECIMENTO; if (R) try{ R.abrir(lvl); }catch(e){} }
  function gradVidOpen(lvl){ var F = window.GRAD_REC_FLOW; if (F && F.abrirVideo) try{ F.abrirVideo(lvl); }catch(e){} }
  /* fecha tudo que possa estar por cima, na ordem em que aparece */
  function gradTudoClose(){ gradRecClose(); gradVidClose(); gradEventsClose(); }

  /* ---- fotos do ecossistema (2026-08-10) ----
     Uma galeria por conexão (js/ecossistema-galeria.js), com o mesmo desenho da galeria
     das graduações. `i` é a posição do CARTÃO na seção (0 = Livre … 6 = Expansão), que é a
     ordem do DOM e a mesma que o buildStops percorre — aqui não existe a distinção
     nível/slide que já deslocou a galeria das graduações em um. `pag` é a página de fotos.
     O `abrir` recusa sozinho a conexão sem foto, então não há o que conferir antes. */
  function ecoGalOpen(i, pag){ var G = window.IGREEN_ECO_GAL; if (G) try{ G.abrir(i, pag); }catch(e){} }
  function ecoGalClose(){ var G = window.IGREEN_ECO_GAL; if (G && G.aberto()) try{ G.fechar(); }catch(e){} }
  /* o vídeo de uma conexão do ecossistema (Conexão Seguros desde 2026-08-13). A verdade sobre
     quem tem vídeo mora na galeria, que por sua vez pergunta à peça do vídeo — aqui só se
     consulta, para não criar um terceiro lugar com a mesma lista. */
  /* o player de vídeo em si (o mesmo que o ecossistema usa, chaveado por nível nas graduações).
     ⚠ `recVidClose()` aparece em TODAS as paradas do nível, não só na saída: parada tem de
     estabelecer o estado completo, e sem isso o vídeo ficaria aberto ao voltar — que foi
     exatamente o defeito medido no ecossistema hoje mais cedo. */
  function recVidOpen(lvl){ var V = window.IGREEN_REC_VIDEO; if (V) try{ V.abrir(lvl); }catch(e){} }
  function recVidClose(){ var V = window.IGREEN_REC_VIDEO; if (V && V.aberto()) try{ V.fechar(); }catch(e){} }
  /* pop-up dos 14 Acionistas Royal (#royais-app). Mesma forma dos outros: a apresentacao
     PERGUNTA a peca, nao alcanca dentro dela. */
  function royaisOpen(){ var R=window.IGREEN_ROYAIS; if(R) try{ R.abrir(); }catch(e){} }
  function royaisClose(){ var R=window.IGREEN_ROYAIS; if(R && R.aberto()) try{ R.fechar(); }catch(e){} }
  function ecoTemVideo(i){ var G = window.IGREEN_ECO_GAL; return !!(G && G.temVideo && G.temVideo(i)); }
  function ecoVideoOpen(i){ var G = window.IGREEN_ECO_GAL; if (G && G.abrirVideo) try{ G.abrirVideo(i); }catch(e){} }
  function ecoVideoClose(){ var G = window.IGREEN_ECO_GAL; if (G && G.fecharVideo) try{ G.fecharVideo(); }catch(e){} }

  /* bonificação: seleciona o carro/aba (clicar no .carbtn dispara o setCar do site) */
  function carSelectRaw(i){ var b = document.querySelector('.carbtn[data-car="' + i + '"]'); if (b) try{ b.click(); }catch(e){} }
  function carSelect(i){
    // se o vídeo ainda estiver rodando, força o estado final (abas de carro visíveis)
    if (!document.body.classList.contains('cars-ready')){
      var v = document.querySelector('.carvid'); if (v) try{ v.dispatchEvent(new Event('ended')); }catch(e){}
    }
    carSelectRaw(i);
  }

  /* ==========================================================================
     UI
     ========================================================================== */

  /* 1) botão toggle na navbar (ao lado do CTA / antes do hambúrguer) */
  var toggle = el('button', 'pmode-toggle', ICON_PRESENT);
  toggle.type = 'button';
  toggle.setAttribute('aria-pressed', 'false');
  toggle.setAttribute('aria-label', 'Ativar modo apresentação');
  toggle.title = 'Modo apresentação';

  // index: agrupa o toggle + "Fale conosco" (toggle ANTES do CTA, juntinhos).
  // produtos (AUTO): não injeta toggle na navbar — a página entra em apresentação
  // sozinha (auto-enter) e o "sair" do rail volta pro index.
  if (!AUTO){
    var navCta = document.querySelector('.nav .nav-cta');
    if (navCta && navCta.parentNode){
      var ctaGroup = el('div', 'pmode-cta-group');
      navCta.parentNode.insertBefore(ctaGroup, navCta);
      ctaGroup.appendChild(toggle);
      ctaGroup.appendChild(navCta);
    } else {
      var navShell = document.querySelector('.nav .nav-shell');
      if (navShell) navShell.appendChild(toggle);
    }
  }

  /* 2) rail à esquerda (irmão da <nav>, fora do #smooth-content) */
  var rail = el('nav', 'pmode-rail');
  rail.setAttribute('aria-label', 'Navegação da apresentação');

  var btnExit = el('button', 'pmode-ctrl pmode-exit', ICON_EXIT);
  btnExit.type = 'button'; btnExit.setAttribute('aria-label', 'Sair do modo apresentação'); btnExit.title = 'Sair (Esc)';

  var btnUp = el('button', 'pmode-ctrl pmode-up', ICON_UP);
  btnUp.type = 'button'; btnUp.setAttribute('aria-label', 'Passo anterior');

  var btnDown = el('button', 'pmode-ctrl pmode-down', ICON_DOWN);
  btnDown.type = 'button'; btnDown.setAttribute('aria-label', 'Próximo passo');

  var btnPlay = el('button', 'pmode-ctrl pmode-play', ICON_PLAY);
  btnPlay.type = 'button'; btnPlay.setAttribute('aria-pressed', 'false');
  btnPlay.setAttribute('aria-label', 'Reproduzir automaticamente'); btnPlay.title = 'Auto (play)';

  var dotsList = el('ol', 'pmode-dots'); dotsList.setAttribute('role', 'list');
  /* SEÇÃO DESLIGADA NÃO GANHA BOLINHA (2026-08-03). O dono relatou "tem mais bolinha aparecendo
     que seção de navegação" — e era isso, medido: 12 bolinhas para 10 seções ligadas. As duas
     sobrando eram de seções ocultas (#recorrencia, de antes, e #rede, que virou o trilho dos
     carros): a bolinha existia, era visível e não fazia nada, porque o clique dela é guardado por
     `if (SECTIONS[i].on)`.
     O `dots` continua com um lugar por seção (índice = índice em SECTIONS) — o resto do arquivo
     indexa por aí, inclusive o renderDotsState. As desligadas só ficam com `null`, e quem mexe em
     dot já testa a existência. */
  var dots = SECTIONS.map(function(s, i){
    if (!s.on) return null;
    var li = el('li');
    var d = el('button', 'pmode-dot', '<span class="sr-only">' + s.label + '</span>');
    d.type = 'button';
    d.setAttribute('data-section', String(i));
    d.setAttribute('data-label', s.label);
    d.setAttribute('aria-label', 'Ir para ' + s.label);
    d.setAttribute('aria-current', 'false');
    li.appendChild(d); dotsList.appendChild(li);
    return d;
  });

  rail.appendChild(btnExit);
  rail.appendChild(el('span', 'pmode-sep'));
  rail.appendChild(btnUp);
  rail.appendChild(dotsList);
  rail.appendChild(btnDown);
  rail.appendChild(el('span', 'pmode-sep'));
  rail.appendChild(btnPlay);
  document.body.appendChild(rail);

  /* telas menores: rail recolhido que abre ao aproximar o mouse da lateral (ou foco).
     Em telas grandes o CSS mantém o rail completo, então isto é inócuo lá. */
  var railZone = el('div', 'pmode-railzone');
  document.body.appendChild(railZone);
  var railCloseT = null;
  function railOpen(){ if (railCloseT){ clearTimeout(railCloseT); railCloseT = null; } rail.classList.add('pmode-rail-open'); }
  function railClose(){ if (railCloseT) clearTimeout(railCloseT); railCloseT = setTimeout(function(){ rail.classList.remove('pmode-rail-open'); }, 280); }
  railZone.addEventListener('mouseenter', railOpen);
  rail.addEventListener('mouseenter', railOpen);
  railZone.addEventListener('mouseleave', railClose);
  rail.addEventListener('mouseleave', railClose);
  rail.addEventListener('focusin', railOpen);
  rail.addEventListener('focusout', railClose);

  /* ==========================================================================
     Motor de waypoints
     ========================================================================== */
  var built = false;
  var sections = [];       // paralelo a SECTIONS: { si, el, on, startY, stops:[y..] }
  var activeStops = [];    // lista plana ordenada: { y, si, sub, first }
  var curIdx = -1;
  var activeTween = null;

  /* acha o ScrollTrigger que representa a transição da seção (pinado OU scrub).
     Prioriza o elemento explícito sc.trig; senão qualquer trigger contido na seção.
     Entre candidatos, prefere pinado; senão o de maior range (o scrub principal). */
  function sectionTriggers(sc, node){
    if (!ST) return [];
    var all = ST.getAll();
    var trigNode = sc.trig ? document.querySelector(sc.trig) : null;
    var pool = [];
    if (trigNode) pool = all.filter(function(t){ return t.trigger === trigNode; });
    if (!pool.length && node) pool = all.filter(function(t){
      return t.trigger && (t.trigger === node || node.contains(t.trigger) || t.trigger.contains(node));
    });
    return pool;
  }
  function findTrigger(sc, node){
    // só triggers "varreáveis" (pin ou scrub). Reveals once — mesmo com end grande
    // 'bottom top' — NÃO contam: senão parariam com a seção já rolada pra fora.
    var pool = sectionTriggers(sc, node).filter(function(t){ return t.pin || (t.vars && t.vars.scrub); });
    if (!pool.length) return null;
    var pinned = pool.filter(function(t){ return t.pin; });
    var use = pinned.length ? pinned : pool;
    use.sort(function(a, b){ return (b.end - b.start) - (a.end - a.start); });
    return use[0];
  }

  function rebuildIndex(){
    built = true;
    sections = [];
    activeStops = [];

    SECTIONS.forEach(function(sc, si){
      var node = sc.el || document.querySelector(sc.sel);
      var entry = { si:si, el:node, on: !!(sc.on && node), startY:0, stops:[] };
      if (entry.on){
        // sc.frame força enquadramento (ignora pin/scrub) — p/ seções interativas
        var st = sc.frame ? null : findTrigger(sc, node);
        // buildStops roda com OU sem trigger (ex.: planos, sem pin, usa geometria)
        var custom = sc.buildStops ? sc.buildStops(st, node) : null;
        if (custom && custom.length){
          // cada item pode ser um número (y) ou {y, action} (ação ao chegar no stop)
          entry.stops   = custom.map(function(s){ return clamp(0, maxY(), (s && typeof s === 'object') ? s.y : s); });
          entry.actions = custom.map(function(s){ return (s && typeof s === 'object') ? s.action : null; });
          entry.startY = st ? clamp(0, maxY(), st.start) : entry.stops[0];
        } else if (st){
          var s0 = st.start, s1 = st.end;
          if (sc.union){   // varre a união dos ranges de todos os triggers da seção
            var trs = sectionTriggers(sc, node);
            s0 = Math.min.apply(null, trs.map(function(t){ return t.start; }));
            s1 = Math.max.apply(null, trs.map(function(t){ return t.end; }));
          }
          entry.startY = clamp(0, maxY(), s0);
          if (sc.subs && sc.subs.length){
            entry.stops = sc.subs.map(function(p){ return clamp(0, maxY(), s0 + (s1 - s0) * p); });
          } else {
            entry.stops = [ clamp(0, maxY(), s1) ];   // tocável: descansa no fim
          }
        } else {
          // sem pin → enquadra o topo. frameOff = quanto o topo da seção fica abaixo
          // do topo da viewport (menor/negativo = rola mais para baixo).
          var foff = (sc.frameOff != null) ? (typeof sc.frameOff === 'function' ? sc.frameOff() : sc.frameOff) : 90;
          var top = curY() + node.getBoundingClientRect().top - foff;
          entry.startY = clamp(0, maxY(), top);
          entry.stops = [ entry.startY ];
        }
      }
      sections[si] = entry;
    });

    sections.forEach(function(entry){
      if (!entry.on) return;
      entry.stops.forEach(function(y, k){
        activeStops.push({ y:y, si:entry.si, sub:k, first:(k === 0),
          action:(entry.actions ? entry.actions[k] : null) });
      });
    });
    activeStops.sort(function(a, b){ return a.y - b.y; });

    renderDotsState();
  }

  function nearestIdx(){
    if (!activeStops.length) return -1;
    var y = curY(), best = 0, bd = Infinity;
    activeStops.forEach(function(s, i){ var dd = Math.abs(s.y - y); if (dd < bd){ bd = dd; best = i; } });
    return best;
  }

  /* tween nativo (rAF) p/ páginas sem GSAP (produtos) — mantém suavidade + onComplete */
  function sweepNative(fromY, targetY, dur){
    return new Promise(function(res){
      var start = null, cancelled = false;
      var ease = function(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }; // ~power3.inOut
      activeTween = { kill:function(){ cancelled = true; activeTween = null; } };
      function step(ts){
        if (cancelled) return;
        if (start == null) start = ts;
        var t = Math.min(1, (ts - start) / (dur * 1000));
        setY(fromY + (targetY - fromY) * ease(t));
        if (t < 1) requestAnimationFrame(step);
        else { activeTween = null; res(); }
      }
      requestAnimationFrame(step);
    });
  }

  function sweepTo(targetY, durOverride, easeOverride){
    targetY = clamp(0, maxY(), targetY);
    if (REDUCE){ setY(targetY); return Promise.resolve(); }
    var fromY = curY();
    var dist = Math.abs(targetY - fromY);
    if (dist < 2){ setY(targetY); return Promise.resolve(); }
    if (!GSAP) return sweepNative(fromY, targetY, durOverride ? Math.max(0.4, durOverride) : clamp(0.6, 1.4, dist / 2200));
    /* piso alto de duração + ease forte: trechos curtos ficam gentis (não bruscos);
       trechos longos não passam de ~1.7s. durOverride (ex.: sede) força um tempo
       próprio; easeOverride (ex.: entrada da órbita) deixa o ritmo mais uniforme. */
    var dur = durOverride ? Math.max(0.4, durOverride) : clamp(0.85, 1.7, dist / 2000);
    var pr = { v: fromY };
    return new Promise(function(res){
      activeTween = GSAP.to(pr, {
        v: targetY, duration: dur, ease: easeOverride || 'power3.inOut', overwrite: true,
        onUpdate: function(){ setY(pr.v); },
        onComplete: function(){ activeTween = null; res(); },
        onInterrupt: function(){ activeTween = null; res(); }
      });
    });
  }

  /* reposition=true  → salta pro início da seção e anima até o passo (uso do DOT)
     reposition=false → varredura contínua e suave da posição atual até o alvo (SETAS) */
  /* force=true -> o passo INTERROMPE a varredura em curso e assume. Sem isto o clique era
     silenciosamente DESCARTADO enquanto a varredura anterior terminava: o usuario apertava para
     baixo, nada acontecia, e ele precisava apertar de novo (o famoso "duplo clique"). Vinha da
     serializacao abaixo — 1 varredura por vez — que continua valendo para tudo que NAO e passo
     manual (tour automatico, cards do ecossistema), onde encavalar de fato bagunçaria.
     Interromper e seguro: o sweepTo usa overwrite:true e o activeTween expoe kill(). */
  function goToIndex(idx, reposition, force){
    if (activeTween){
      if (!force) return Promise.resolve();      // serializa: 1 varredura por vez
      activeTween.kill(); activeTween = null;    // passo manual tem prioridade
    }
    if (!built) rebuildIndex();
    if (!activeStops.length) return Promise.resolve();
    idx = clamp(0, activeStops.length - 1, idx);
    var prevSi = (curIdx >= 0 && activeStops[curIdx]) ? activeStops[curIdx].si : -1;
    var stop = activeStops[idx];
    var entry = sections[stop.si];
    var sc = SECTIONS[stop.si];
    // entrando numa seção nova pela seta (varredura contínua) → usa enterDur se houver;
    // senão a duração normal da seção (sc.dur) ou o cálculo por distância.
    var enteringNew = stop.first && stop.si !== prevSi && !reposition;
    var durOv, easeOv;
    if (enteringNew && sc && sc.enterDur != null){
      durOv = (typeof sc.enterDur === 'function') ? sc.enterDur() : sc.enterDur;
      easeOv = 'power1.inOut';   // entrada longa: ritmo uniforme (não acelera no meio)
    } else {
      durOv = (sc && typeof sc.dur === 'function') ? sc.dur() : ((sc && sc.dur) || 0);
    }
    // saindo de uma seção → hook de limpeza (ex.: graduações limpa o hover ativo)
    if (prevSi >= 0 && prevSi !== stop.si && SECTIONS[prevSi] && typeof SECTIONS[prevSi].onLeave === 'function') SECTIONS[prevSi].onLeave();

    curIdx = idx;
    renderDotsState();

    return new Promise(function(resolve){
      var done = function(){ renderDotsState(); if (typeof stop.action === 'function') stop.action(); resolve(); };
      if (reposition && stop.first && entry && Math.abs(curY() - entry.startY) > 4){
        // salta pro começo da seção e então anima a transição até o passo
        setY(entry.startY);
        if (sc && typeof sc.onEnter === 'function') sc.onEnter();
        requestAnimationFrame(function(){ sweepTo(stop.y, durOv, easeOv).then(done); });
      } else {
        // scroll suave direto — sem teleporte (voltar/continuar com as setas).
        // entrando numa seção NOVA por aqui (ex.: setas) → dispara onEnter também
        // (antes só o teleporte por dot chamava; a sede não tocava o vídeo pelas setas).
        if (stop.first && stop.si !== prevSi && sc && typeof sc.onEnter === 'function') sc.onEnter();
        sweepTo(stop.y, durOv, easeOv).then(done);
      }
    });
  }

  function firstStopIndexOf(si){
    for (var i = 0; i < activeStops.length; i++) if (activeStops[i].si === si && activeStops[i].first) return i;
    return -1;
  }
  function goToSection(si){ var i = firstStopIndexOf(si); return (i >= 0) ? goToIndex(i, true) : Promise.resolve(); }

  var liveRegion = null, lastAnnounced = -1;
  function renderDotsState(){
    var activeSi = (curIdx >= 0 && activeStops[curIdx]) ? activeStops[curIdx].si : -1;
    dots.forEach(function(d, i){
      if (!d) return;                       // seção desligada não tem bolinha
      var on = !!(sections[i] && sections[i].on);
      d.disabled = !on;
      d.classList.toggle('is-disabled', !on);
      d.classList.toggle('is-active', i === activeSi);
      d.setAttribute('aria-current', i === activeSi ? 'true' : 'false');
      if (on && activeSi >= 0 && i < activeSi) d.classList.add('is-visited');
    });
    if (liveRegion && activeSi >= 0 && activeSi !== lastAnnounced){
      lastAnnounced = activeSi; liveRegion.textContent = SECTIONS[activeSi].label;
    }
  }

  /* rebuild quando o layout muda (fonts/mídia/resize) — start/end em px mudam */
  if (ST) ST.addEventListener('refresh', function(){ if (built) rebuildIndex(); });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(e){
    REDUCE = e.matches; if (built) rebuildIndex();
  });

  /* ==========================================================================
     Ativação / saída + auto-play + captura de input
     ========================================================================== */
  var active = false;
  var autoOn = false, autoTimer = null;
  var AUTO_DWELL = 1400;   // pausa entre passos durante o auto-play

  /* região aria-live para leitores de tela anunciarem a seção atual */
  liveRegion = el('div', 'sr-only'); liveRegion.setAttribute('aria-live', 'polite');
  document.body.appendChild(liveRegion);

  function stopAuto(){
    if (autoTimer){ clearTimeout(autoTimer); autoTimer = null; }
    if (autoOn){ autoOn = false; btnPlay.classList.remove('is-playing'); btnPlay.setAttribute('aria-pressed', 'false'); }
  }
  function autoStep(){
    autoTimer = null;
    if (!autoOn) return;
    if (curIdx >= activeStops.length - 1){ stopAuto(); return; }   // chegou ao fim → para
    goToIndex(curIdx + 1, false).then(function(){
      if (!autoOn) return;
      autoTimer = setTimeout(autoStep, AUTO_DWELL);                // segue sozinho até o fim
    });
  }
  function startAuto(){
    if (autoOn || activeTween) return;
    if (curIdx >= activeStops.length - 1) return;                  // já no fim
    autoOn = true; btnPlay.classList.add('is-playing'); btnPlay.setAttribute('aria-pressed', 'true');
    autoStep();
  }

  /* navegação manual = para o auto-play ao interagir */
  function manualIndex(idx){ stopAuto(); goToIndex(idx, false); }
  function manualSection(si){ stopAuto(); goToSection(si); }

  function enter(){
    if (active) return;
    active = true;
    if (AUTO) root.style.scrollBehavior = 'auto';   // rAF controla o scroll (sem CSS smooth brigando)
    root.classList.add('pmode-active');
    toggle.setAttribute('aria-pressed', 'true');
    toggle.setAttribute('aria-label', 'Sair do modo apresentação');
    if (!built) rebuildIndex();
    curIdx = nearestIdx();
    renderDotsState();
    try { btnDown.focus(); } catch(e){}
  }
  function exit(){
    if (!active) return;
    active = false;
    stopAuto();
    tourSet(false);      // sair encerra o tour do ecossistema
    try{ sessionStorage.removeItem('pm'); }catch(e){}
    gradEventsClose();   // se saiu com o modal "Nossos Eventos" aberto, fecha (despausa o smoother)
    if (activeTween){ activeTween.kill(); activeTween = null; }
    root.classList.remove('pmode-active');
    if (AUTO) root.style.scrollBehavior = '';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-label', 'Ativar modo apresentação');
    try { toggle.focus(); } catch(e){}
  }
  /* produto: "sair" = voltar pro index (reusa o link .back / data-pt-href → cortina) */
  function goBack(){
    var back = document.querySelector('.nav .back, [data-pt-href$="index.html"]');
    if (back){ back.click(); return; }
    try{ sessionStorage.setItem('pt', '1'); }catch(e){}
    location.href = PM.backHref || '../index.html';
  }

  /* ===== Tour do ecossistema =====
     No ecossistema (index), ↓ ABRE o produto do card atual (sem clique). Ao terminar
     de percorrer o produto (↓ no último passo dele), ele volta pra home focando o
     PRÓXIMO card; após o último card, segue pra órbita. Estado em sessionStorage
     (pmtour/pmcard) sobrevive à navegação. */
  function isEcoCardStop(idx){ var s=activeStops[idx]; return !!(s && SECTIONS[s.si] && SECTIONS[s.si].sel==='#ecossistema2'); }
  function ecoCards(){ return document.querySelectorAll('#ecossistema2 .ecard'); }
  /* ⚠ `sub` é a posição da parada DENTRO da seção, e desde 2026-08-10 a seção não tem mais
     uma parada por card: cada conexão com foto acrescenta uma parada por página de galeria
     depois do card dela. Então `sub` deixou de ser igual ao número do card, e procurar
     `sub===k` passaria a cair numa parada de FOTO — o mesmo tipo de erro de "índice de uma
     coisa usado como índice de outra" que já abriu a galeria da qualificação vizinha.
     A conta certa é somar, para cada card anterior, ele mesmo (1) mais as páginas dele. */
  function ecoSubDoCard(k){
    var G = window.IGREEN_ECO_GAL, s = 0;
    for (var i = 0; i < k; i++){
      var p = G ? G.paginas(i) : 0;
      /* 1 (o card) + uma por imagem + 1 do passo que só fecha (só existe se houver imagem) */
      s += 1 + p + (p ? 1 : 0);
    }
    return s;
  }
  function ecoStopIndexFor(k){ var alvo = ecoSubDoCard(k); for (var i=0;i<activeStops.length;i++){ var s=activeStops[i]; if (SECTIONS[s.si] && SECTIONS[s.si].sel==='#ecossistema2' && s.sub===alvo) return i; } return -1; }
  function tourOn(){ try{ return sessionStorage.getItem('pmtour')==='1'; }catch(e){ return false; } }
  function tourCard(){ try{ return parseInt(sessionStorage.getItem('pmcard')||'-1',10); }catch(e){ return -1; } }
  function tourSet(on, card){ try{ if(on){ sessionStorage.setItem('pmtour','1'); sessionStorage.setItem('pmcard',String(card)); } else { sessionStorage.removeItem('pmtour'); sessionStorage.removeItem('pmcard'); } }catch(e){} }

  function openEcoCard(k){
    var card = ecoCards()[k]; if (!card){ goToIndex(curIdx+1, false); return; }
    tourSet(true, k);
    try{ sessionStorage.setItem('pm','1'); sessionStorage.setItem('pm-stop', String(curIdx)); }catch(e){}
    card.click();   // page-transition navega com a cortina
  }
  function goToEcoCard(k){ var i=ecoStopIndexFor(k); if (i>=0) goToIndex(i, false); }

  /* "próximo" central: no ecossistema abre o produto; no produto (tour) o ↓ no fim
     avança pro próximo card; senão comportamento normal de passo. */
  /* ============================================================
     QUEM ESTÁ POR CIMA CONSOME O PASSO PRIMEIRO
     ------------------------------------------------------------
     O reconhecimento é uma peça de dois atos com várias páginas de
     nomes. Ela precisa "comer" os avanços enquanto tiver para onde
     ir, e só então devolver o passo para a apresentação.
     Isso já existia — mas só no TECLADO, por um listener em fase de
     captura. E o dono avança pelo BOTÃO da tela: o clique nunca
     passava por lá, a apresentação pulava direto para a próxima
     parada e OS NOMES DOS EXECUTIVOS NUNCA APARECIAM. Sintoma dele,
     literal: "quando eu vou passar para a parte dos nomes ele não
     exibe os nomes".
     Perguntar aqui resolve os três caminhos de uma vez — tecla,
     botão e roda do mouse todos passam por goNext/goPrev. É o lugar
     certo: um único ponto de decisão em vez de três interceptações.
     ============================================================ */
  function pecaConsumiu(frente){
    var R = window.IGREEN_RECONHECIMENTO;
    if (!R || !R.aberto()) return false;
    try{ return frente ? !!R.avancar() : !!R.voltar(); }catch(e){ return false; }
  }

  /* `manual` = o passo veio de uma AÇÃO DELIBERADA (tecla, passador de slide, botão da
     interface), não da roda do mouse. Nesse caso ele tem PRIORIDADE: mata a varredura em
     curso em vez de ser descartado.
     Por que essa diferença existe, e por que ela não é capricho: a roda dispara muitos
     eventos por gesto e sem a serialização um único giro de dedo atravessaria três paradas.
     Uma tecla e um clique de passador disparam UM evento — descartar esse é perder o
     comando, e o apresentador clica de novo achando que o aparelho falhou (e aí anda dois).
     O `goPrev` sempre foi assim (force=true desde antes); o `goNext` era o único que
     descartava, e essa assimetria vinha junto com o defeito do passador de 2026-08-10. */
  function goNext(manual){
    if (pecaConsumiu(true)) return;
    stopAuto();
    if (activeTween && !manual) return;
    if (AUTO){
      if (tourOn() && curIdx >= activeStops.length - 1){
        tourSet(true, tourCard() + 1);
        try{ sessionStorage.setItem('pm','1'); }catch(e){}
        goBack();
        return;
      }
      goToIndex(curIdx + 1, false); return;
    }
    /* TRAVA (pedido do dono): no modo apresentacao NAO entra nas paginas de produto (os 7
       servicos). No stop de card do ecossistema, ↓/espaco/roda apenas AVANCA (troca de card
       e, no ultimo, segue pra proxima secao) — mesmo comportamento da seta →, que ja "NUNCA
       abre produto". Antes aqui chamava openEcoCard() -> card.click() -> abria o produto. */
    if (curIdx >= 0 && isEcoCardStop(curIdx)){ goToIndex(curIdx + 1, false, true); return; }
    goToIndex(curIdx < 0 ? 0 : curIdx + 1, false, manual);
  }
  function goPrev(){ if (pecaConsumiu(false)) return; stopAuto(); goToIndex(curIdx <= 0 ? 0 : curIdx - 1, false, true); }

  /* ⚠ O `goStepNext` FOI REMOVIDO em 2026-08-10. Ele era o passo "puro" da seta →, e existia
     por uma razão que deixou de valer: garantir que no ecossistema a seta trocasse de card
     SEM abrir a página de produto. Essa trava mora hoje dentro do próprio `goNext`
     (`isEcoCardStop`), então ele virou um segundo caminho para o mesmo gesto — sem vantagem
     nenhuma e com um defeito grave: não chamava `pecaConsumiu()`, e por isso a seta → pulava
     galerias e reconhecimentos inteiros em vez de virar a página deles.
     Se você sentir falta do "force" que ele tinha, ele está preservado: é o parâmetro
     `manual` do `goNext`. NÃO recrie esta função. */

  /* produto: fechar E PULAR pro próximo card (no tour); fora do tour só volta */
  function skipProduct(){
    if (tourOn()) tourSet(true, tourCard() + 1);
    try{ sessionStorage.setItem('pm', '1'); }catch(e){}
    goBack();
  }

  /* ---- controles ---- */
  dots.forEach(function(d, i){
    if (!d) return;                         // seção desligada não tem bolinha
    d.addEventListener('click', function(){ if (SECTIONS[i].on) manualSection(i); });
  });
  btnUp.addEventListener('click', function(){ goPrev(); });
  btnDown.addEventListener('click', function(){ goNext(true); });   /* clique no botao = passo manual, tem prioridade */
  btnPlay.addEventListener('click', function(){ autoOn ? stopAuto() : startAuto(); });
  toggle.addEventListener('click', function(){ active ? exit() : enter(); });
  btnExit.addEventListener('click', function(){ AUTO ? skipProduct() : exit(); });

  /* ---- teclado (só no modo ativo) ---- */
  document.addEventListener('keydown', function(e){
    if (!active) return;
    var k = e.key;
    if (k === 'Escape' || e.keyCode === 27){ e.preventDefault(); AUTO ? skipProduct() : exit(); }
    /* ============================================================
       AS QUATRO SETAS FAZEM A MESMA COISA — e isso é o conserto do PASSADOR DE SLIDE
       ------------------------------------------------------------
       Sintoma relatado pelo dono em 2026-08-10, testando com o passador de slide na mão:
       *"ele está passando só com a seta para cima e para baixo"*.

       CAUSA: `ArrowRight` chamava `goStepNext()`, e `goStepNext` NÃO chamava
       `pecaConsumiu()` — só o `goNext()` chama. Ou seja, a seta → pulava a parada inteira
       em vez de perguntar à peça se ela ainda tem página para virar.
       O pior caso é justamente o mais visível numa apresentação ao vivo: com o
       reconhecimento do Diretor aberto (15 artes, UMA parada), a → mandava o scroll andar
       ATRÁS de um overlay de tela cheia — a tela não mudava nada e o passador parecia
       morto, enquanto ↓ trocava a arte normalmente. Era exatamente o que o dono descreveu.

       POR QUE `goNext()` cobre tudo o que o `goStepNext` fazia: a proteção que justificava
       a existência dele ("no modo apresentação NUNCA abre página de produto", no stop de
       card do ecossistema) hoje mora dentro do próprio `goNext`. Então `goStepNext` virou
       um caminho paralelo sem nenhuma vantagem e só com o defeito. Foi removido — caminho
       duplicado para o mesmo gesto é a armadilha dos "dois donos" que este projeto já
       pagou várias vezes.

       Passadores de slide mandam teclas diferentes conforme o modelo: uns PageDown/PageUp,
       outros ArrowRight/ArrowLeft, alguns espaço. Com as quatro setas + PageDown/PageUp +
       espaço todas ligadas ao mesmo par de funções, qualquer um deles funciona sem
       configuração e sem o apresentador precisar saber qual tecla o aparelho manda.
       ⚠ Ao acrescentar tecla aqui, ligue em `goNext`/`goPrev` e em mais nada: é o
       `pecaConsumiu` dentro delas que faz as galerias e o reconhecimento passarem página.
       ============================================================ */
    else if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Spacebar'){ e.preventDefault(); goNext(true); }
    else if (k === 'ArrowUp'   || k === 'ArrowLeft'  || k === 'PageUp'){ e.preventDefault(); goPrev(); }
    else if (k === 'Home'){ e.preventDefault(); manualIndex(0); }
    else if (k === 'End'){ e.preventDefault(); manualIndex(activeStops.length - 1); }
  }, true);

  /* ---- captura da roda do mouse: cada gesto = um passo (sem scroll livre) ---- */
  var wheelLock = false;
  window.addEventListener('wheel', function(e){
    if (!active) return;
    e.preventDefault();                       // bloqueia o scroll livre no modo apresentação
    if (activeTween || wheelLock || Math.abs(e.deltaY) < 4) return;
    wheelLock = true; setTimeout(function(){ wheelLock = false; }, 320);
    if (e.deltaY > 0) goNext(); else goPrev();
  }, { passive:false, capture:true });

  /* ---- handoff index <-> páginas de produto (Opção B do backlog) ---- */
  if (!AUTO){
    // saindo da index em apresentação ao clicar num card → lembra o modo e o card
    document.addEventListener('click', function(e){
      if (!active) return;
      var link = e.target.closest && e.target.closest('[data-pt-href]');
      if (!link) return;
      try{ sessionStorage.setItem('pm', '1'); sessionStorage.setItem('pm-stop', String(curIdx)); }catch(err){}
      // não previne: o page-transition faz a navegação (cortina)
    }, true);
  }
  function autoEnterIfNeeded(){
    var pm = null, ps = null;
    try{ pm = sessionStorage.getItem('pm'); ps = sessionStorage.getItem('pm-stop'); }catch(e){}
    var tour = tourOn();
    if (pm !== '1' && !tour) return;
    if (AUTO){
      enter();                                    // produto entra em apresentação sozinho
      curIdx = 0; setY(0); renderDotsState();     // sempre no topo (tour segue via pmtour)
      try{ sessionStorage.removeItem('pm'); }catch(e){}
      return;
    }
    // INDEX
    enter();
    if (tour){
      var c = tourCard(), N = ecoCards().length;
      if (c >= 0 && c < N){
        setTimeout(function(){ goToEcoCard(c); }, 90);         // foca o próximo card (não abre)
      } else {
        tourSet(false);                                        // acabaram os cards → segue pra órbita
        var tryOrbita = function(n){                            // espera os triggers construírem
          var orbSi = -1; for (var i=0;i<SECTIONS.length;i++){ if (SECTIONS[i].sel==='#orbita'){ orbSi=i; break; } }
          var oi = orbSi>=0 ? firstStopIndexOf(orbSi) : -1;
          if (oi>=0) goToIndex(oi, false);
          else if (n>0) setTimeout(function(){ tryOrbita(n-1); }, 200);
        };
        setTimeout(function(){ tryOrbita(10); }, 150);
      }
      try{ sessionStorage.removeItem('pm'); }catch(e){}
    } else {
      var idx = parseInt(ps, 10); if (isNaN(idx)) idx = 0;
      setTimeout(function(){ goToIndex(idx, true); }, 80);
      try{ sessionStorage.removeItem('pm'); sessionStorage.removeItem('pm-stop'); }catch(e){}
    }
  }
  if (document.readyState === 'complete') setTimeout(autoEnterIfNeeded, 140);
  else window.addEventListener('load', function(){ setTimeout(autoEnterIfNeeded, 140); });

  /* ---- vídeo institucional acabou → próxima seção (pedido do dono, 2026-08-03) ----
     Quem detecta o fim é o #vmodal-app (só ele tem a API de iframe do YouTube em mãos); ele fecha
     o popup e dispara este evento. Aqui a única decisão é "estou apresentando?": fora da
     apresentação o fim do vídeo não deve mover a página de lugar nenhum. */
  document.addEventListener('igreen:video-fim', function(){
    if (!active) return;
    setTimeout(goNext, 220);   /* deixa o popup terminar de fechar antes de rolar */
  });

  /* handle p/ depuração */
  window.__pmode = {
    enter:enter, exit:exit, isActive:function(){ return active; },
    rebuild:rebuildIndex, stops:function(){ return activeStops; }, sections:function(){ return sections; },
    goToSection:goToSection, goToIndex:goToIndex, SECTIONS:SECTIONS
  };
})();
