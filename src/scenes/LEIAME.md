# src/scenes/ · Jonatha

**PT:** As cenas da demo, na ordem: `BootScene` (carrega a arte e as fontes), `TitleScene`, `TeaserScene`, `TravelScene`, `LandingScene`, `EvaScene` (com `EvaUiScene` por cima, para HUD, seta de objetivo, diálogo, avisos e Guia de Campo) e `EndingScene`. A lista da arte usada fica em `art.ts`. As cenas leem `src/state/` e `src/map/` e não recalculam regras.

O estado da partida vem de `src/state/GameState.ts` (Miguel). A EVA avisa quando a Ana está ao lado do habitat ou do rover (`setSheltered`), escurece a tela com `darkness` e mostra os avisos da noite: entardecer (diálogo), anoitecer e amanhecer (avisos curtos) e EVA abortada às 19h30 (diálogo, e o Tatu leva a Ana de volta ao habitat).

Evento solar (tempestade de partículas), como no artefato: depois das Dunas Bagnold, a comandante avisa que as partículas chegam em 45 minutos. Perto do habitat ou do rover pressurizado aparece a plaquinha "A ↓": A entra no abrigo e A de novo sai. A tripulação daquele abrigo entra junto (e quem ainda estiver lá fora corre para dentro quando as partículas chegam), e só sai quando o evento acaba. Dentro do abrigo o tempo corre 10 vezes mais rápido e um aviso pequeno, logo abaixo do HUD, mostra onde a Ana está, quantos minutos faltam e como sair. Do lado de fora, as camadas saem do ar e a dose sobe, com avisos aos 20 e 50 mSv; aos 80 mSv a EVA é abortada e o Tatu leva a Ana para dentro do habitat. As regras e os números ainda estão em `eva/eventoSolarProvisorio.ts`, até o Miguel passá-los para `src/state/`.

Volta para casa: com a amostra, a Ana não entra sozinha no habitat. Ao chegar perto aparecem o aviso e a plaquinha, e ela entra com A (Z no teclado), como no abrigo. Assim dá tempo de limpar o traje antes de entrar.

Enquanto o mapa real (Arthur) não fica pronto, a EVA usa `eva/mapaProvisorio.ts`, o mesmo mapa gerado do protótipo. Para trocar, basta entregar um objeto com a interface `EvaMap`. A tecla C troca a camada ativa no HUD; o desenho de cada camada no mapa é do Arthur.

Visual da EVA igual ao artefato final: a tela da EVA tem 2 pixels por pixel do jogo (`EVA_PIXEL` em `src/config.ts`), e personagens, Tatu, habitat, rover, balizas e rochas usam a arte `_2x` com escala 0,5. As outras cenas continuam em 160x144. O chão (`eva/renderMap.ts`) tem a areia escura das Dunas Bagnold andando com o vento, o lamito rachado de Yellowknife Bay e os estratos do Monte Sharp, gerados no código como no protótipo, e as encostas são uma faixa contínua.

Mapa da EVA: o jogo usa o mapa de `eva/mapaProvisorio.ts` (areia só nas Dunas Bagnold, como no protótipo). O gerador procedural do Arthur (`src/map/EvaMapLoader.ts`) fica no repositório e volta para o jogo quando a areia estiver ajustada.

A Ana anda em 8 direções: na diagonal o passo leva cerca de 1,4 vez o tempo (mesma velocidade), não corta quina de rocha e, se a diagonal estiver fechada, desliza pela parede.

Mapa da missão (tecla M, `eva/GaleMapOverlay.ts`): à esquerda, o mesmo mapa em que a Ana anda, com a Ana piscando, o Tatu, o habitat e o rover, as rochas que bloqueiam, os alvos (visitado, atual e a visitar), uma linha até o alvo atual e o pedaço que aparece na tela. À direita, a Cratera Gale com o Monte Sharp, o Peace Vallis e os lugares reais do Curiosity em posições aproximadas, e a Ana no lugar equivalente. Tudo é lido da cena a cada quadro (`getMapView`).

Ponto de retorno e redemoinhos: a EVA entrega o mapa ao estado (`setReturnGrid`) e as posições da Ana e do Tatu a cada quadro (`setActors`). Com pouco O₂ para voltar, a comandante avisa e o objetivo vira "volte ao abrigo". Os redemoinhos do Miguel aparecem perto do meio-dia, andam até o Tatu e limpam os painéis.

Rochas pontiagudas: todo tile que machuca o traje mostra a rocha pontiaguda, e só ele (antes metade parecia chão comum).

Limpeza do traje: o Natan fica perto da saída como a comandante, mas fora da porta do habitat, com o ponto de limpeza (escova e painel eletrostático) do lado. A perto do ponto limpa o traje (10 minutos); andar para longe suja de novo. Durante a limpeza, o zigue-zague do painel acende de baixo para cima (sprite `03_Veiculos/estacao_limpeza_2x.png`). O traje suja de novo depois de 12 passos, e dá para limpar de novo sempre que a Ana tiver andado. O Natan acompanha a Ana com o olhar, igual à Keli. Na volta para casa, entrar com o traje sujo faz o Natan perguntar se a Ana tem certeza.

Modo de teste: abra o jogo com `?cena=teaser`, `viagem`, `pouso`, `eva`, `dunas`, `solar`, `boxwork`, `retorno` ou `final` no fim do endereço para ir direto à etapa. As entradas do Guia e as camadas das etapas anteriores já vêm liberadas, e `final` abre com o Guia completo. Na EVA, `&x=..&y=..` coloca a Ana num tile (ex.: `?cena=dunas&x=48&y=34`) e `&hora=16` começa às 16h, para testar a noite. `?cena=solar&x=61&y=50` começa o evento solar ao lado do rover.

**EN:** The demo scenes, in order: `BootScene` (loads art and fonts), `TitleScene`, `TeaserScene`, `TravelScene`, `LandingScene`, `EvaScene` (with `EvaUiScene` on top for HUD, objective arrow, dialogue, notices and Field Guide) and `EndingScene`. The list of art used lives in `art.ts`. Scenes read `src/state/` and `src/map/` and never recompute rules.

The game state comes from `src/state/GameState.ts` (Miguel). The EVA tells it when Ana is next to the habitat or the rover (`setSheltered`), darkens the screen with `darkness` and shows the night notices: dusk (dialogue), nightfall and dawn (short notices) and the EVA aborted at 19:30 (dialogue, and the Tatu brings Ana back to the habitat).

Solar event (particle storm), as in the artifact: after the Bagnold Dunes, the commander warns that the particles arrive in 45 minutes. Next to the habitat or the pressurized rover an "A ↓" sign shows up: A goes into the shelter and A again goes out. That shelter's crew go in too (and anyone still outside runs in when the particles arrive), and they only come out when the event ends. Inside the shelter time runs 10 times faster and a small notice, just below the HUD, shows where Ana is, how many minutes are left and how to go out. Outside, the data layers go down and the dose climbs, with warnings at 20 and 50 mSv; at 80 mSv the EVA is aborted and the Tatu takes Ana into the habitat. The rules and numbers still live in `eva/eventoSolarProvisorio.ts`, until Miguel moves them into `src/state/`.

Back home: with the sample, Ana no longer walks into the habitat by herself. Next to it the notice and the sign show up, and she goes in with A (Z on a keyboard), as with the shelter. That leaves time to clean the suit before going in.

Until the real map (Arthur) is ready, the EVA uses `eva/mapaProvisorio.ts`, the same generated map as the prototype. To swap it, just hand over an object with the `EvaMap` interface. The C key switches the active layer on the HUD; drawing each layer on the map is Arthur's.

EVA visuals match the final artifact: the EVA screen has 2 pixels per game pixel (`EVA_PIXEL` in `src/config.ts`), and characters, Tatu, habitat, rover, beacons and rocks use the `_2x` art at 0.5 scale. The other scenes stay at 160x144. The ground (`eva/renderMap.ts`) has the dark Bagnold Dunes sand creeping with the wind, the cracked Yellowknife Bay mudstone and the Mount Sharp strata, generated in code as in the prototype, and cliffs are one continuous strip.

EVA map: the game uses the map from `eva/mapaProvisorio.ts` (sand only at Bagnold Dunes, as in the prototype). Arthur's procedural generator (`src/map/EvaMapLoader.ts`) stays in the repository and comes back to the game once the sand is tuned.

Ana walks in 8 directions: a diagonal step takes about 1.4 times as long (same speed), does not cut rock corners and, if the diagonal is blocked, slides along the wall.

Mission map (M key, `eva/GaleMapOverlay.ts`): on the left, the same map Ana walks on, with Ana blinking, the Tatu, the habitat and rover, blocking rocks, the targets (visited, current and still to visit), a line to the current target and the part shown on screen. On the right, Gale Crater with Mount Sharp, Peace Vallis and Curiosity's real sites at approximate positions, and Ana at the matching spot. Everything is read from the scene each frame (`getMapView`).

Point of return and dust devils: the EVA hands the map to the state (`setReturnGrid`) and Ana's and the Tatu's positions each frame (`setActors`). With little O₂ left to get back, the commander warns and the objective becomes "head back to shelter". Miguel's dust devils show up around midday, head for the Tatu and clean the panels.

Sharp rocks: every tile that hurts the suit shows the sharp rock, and only those do (before, half looked like plain ground).

Suit cleaning: Natan stands near the exit like the commander, but off the habitat door, with the cleaning point (brush and electrostatic panel) next to him. A next to it cleans the suit (10 minutes); walking away gets it dusty again. While cleaning, the panel's zigzag lights up from bottom to top (sprite `03_Veiculos/estacao_limpeza_2x.png`). The suit gets dusty again after 12 steps, and Ana can clean again whenever she has walked. Natan follows Ana with his eyes, like Keli. On the way home, going in with a dirty suit makes Natan ask whether Ana is sure.

Test mode: open the game with `?cena=teaser`, `viagem`, `pouso`, `eva`, `dunas`, `solar`, `boxwork`, `retorno` or `final` at the end of the address to jump straight to that step. Guide entries and layers from earlier steps come pre-unlocked, and `final` opens with the full Guide. In the EVA, `&x=..&y=..` puts Ana on a tile (e.g. `?cena=dunas&x=48&y=34`) and `&hora=16` starts at 16:00, to test the night. `?cena=solar&x=61&y=50` starts the solar event next to the rover.
