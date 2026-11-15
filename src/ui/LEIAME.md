# src/ui/ · Jonatha (Dev 1 · Jogo / Game)

**PT:** Interface em HTML por cima do canvas, para o texto ficar nítido.

- `UiText.ts`: textos soltos. `Screen.ts`: camada do tamanho da tela.
- `DialogBox.ts`: caixa de diálogo com retrato. Uma fala com `guide: 'id'` registra a entrada no Guia. Uma fala com `choices` vira pergunta: setas trocam a opção, A escolhe, B escolhe a opção `cancel`, e tocar numa opção também escolhe.
- `Hud.ts`: HUD da EVA (O₂, bateria, traje, hora com sol, entardecer ou lua, temperatura, dose, camada, objetivo com ⓘ para rever a instrução e botões de zoom, guia e camada). Só mostra o que vem do estado (`src/state/contract.ts`). A marca VOLTA na barra de O₂ mostra quanto O₂ a Ana precisa para chegar ao abrigo; pisca em vermelho perto do ponto de retorno.
- `FieldGuide.ts` e `guideEntries.ts`: Guia de Campo (12 entradas, 9 na rota e 3 extras) e quais já foram registradas.
- `controls.ts`: teclas do time e o `inputBus`, por onde passam os botões na tela. Duas setas juntas andam na diagonal (`HeldDirs.step`).
- `TouchPad.ts`: direcional, A e B na tela, só no toque (para testar no computador: `?toque=1`). O padrão é um joystick com 8 direções: a bolinha segue o dedo e entre dois lados vale a diagonal. Com `?joystick=0` volta o direcional de setas, que funciona do mesmo jeito. Nada na página se seleciona com toques repetidos (regras no começo do `ui.css`).
- `device.ts`: descobre se é computador, celular ou tablet e se a pessoa usa teclado ou toque (segue o último uso). No teclado os botões da tela somem e os textos com `{A}` e `{B}` mostram Z e X; no toque mostram A e B.
- `Screen.ts`: as camadas não pegam clique, só os botões delas (uma camada escondida, como o Guia, não fica mais por cima dos botões do final).
- Estilos em `ui.css` e `screens.css` (classes copiadas do protótipo).

A seta de objetivo fica em `src/scenes/EvaUiScene.ts`.

**EN:** HTML interface over the canvas, so text stays crisp.

- `UiText.ts`: loose text. `Screen.ts`: screen-sized layer.
- `DialogBox.ts`: dialogue box with portrait. A line with `guide: 'id'` records that Guide entry. A line with `choices` becomes a question: arrows change the option, A picks, B picks the `cancel` option, and tapping an option picks it too.
- `Hud.ts`: EVA HUD (O₂, battery, suit, clock with sun, dusk or moon, temperature, dose, layer, objective with ⓘ to see the briefing again, plus zoom, guide and layer buttons). It only shows what comes from the state (`src/state/contract.ts`). The RETURN mark on the O₂ bar shows how much O₂ Ana needs to reach shelter; it blinks red near the point of return.
- `FieldGuide.ts` and `guideEntries.ts`: Field Guide (12 entries, 9 on the route and 3 extras) and which ones were recorded.
- `controls.ts`: team keys and the `inputBus` that on-screen buttons go through. Two arrows together walk diagonally (`HeldDirs.step`).
- `TouchPad.ts`: on-screen d-pad, A and B, touch only (to test on a computer: `?toque=1`). The default is an 8-direction joystick: the knob follows the finger and between two sides it's a diagonal. With `?joystick=0` the arrow d-pad comes back, and it works the same way. Nothing on the page gets selected by repeated taps (rules at the top of `ui.css`).
- `device.ts`: finds out whether it is a computer, phone or tablet and whether the player uses keyboard or touch (follows the last input). With a keyboard the on-screen buttons hide and texts with `{A}` and `{B}` show Z and X; with touch they show A and B.
- `Screen.ts`: layers don't take clicks, only their buttons do (a hidden layer, like the Guide, no longer sits over the ending buttons).
- Styles in `ui.css` and `screens.css` (classes copied from the prototype).

The objective arrow lives in `src/scenes/EvaUiScene.ts`.
