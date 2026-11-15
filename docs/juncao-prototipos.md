# Junção dos protótipos / Prototype merge

**PT:** Este documento junta a versão do Jonatha (`prototipo/guia/`) com a versão atual do time (`prototipo/jogo/`). A versão atual é a base. Para cada coisa que só existe na v3, a tabela diz para onde ela vai no código novo e de quem é. Os textos da versão atual já foram passados para `src/content/pt.json` e `en.json` (132 chaves).

**EN:** This document merges Jonatha's version (`prototipo/guia/`) with the team's current version (`prototipo/jogo/`). The current version is the base. For each item that only exists in v3, the table says where it goes in the new code and who owns it. The current version's texts are already in `src/content/pt.json` and `en.json` (132 keys).

## Mecânicas só da v3 / v3-only mechanics

| Mecânica / Mechanic | Vai para / Goes to | Dono / Owner | Lado do Jonatha / Jonatha's side |
|---|---|---|---|
| Ponto de retorno: O₂ até o abrigo (marcador VOLTA) / Return point: O₂ to shelter (RETURN marker) | `src/state/` | Miguel | Marcador na barra de O₂ do HUD, lendo `o2Return` / Marker on the HUD O₂ bar, reading `o2Return` |
| Noite marciana e frio / Martian night and cold | `src/state/` | Miguel | Escurecer a câmera no evento `night-start` / Darken the camera on `night-start` |
| Tatu solar e poeira nos painéis / Solar Tatu and dusty panels | `src/state/` | Miguel | Barra de bateria do HUD / HUD battery bar |
| Tempestade de poeira / Dust storm | `src/state/` | Miguel | Véu de poeira na tela no evento `dust-storm` / Dust overlay on `dust-storm` |
| Limpeza do traje na eclusa / Suit cleaning in the airlock | `src/state/` | Miguel | Tela da eclusa (diálogo) / Airlock screen (dialogue) |
| Minimapa e lista de objetivos / Minimap and objective list | `src/state/` + `src/map/` | Miguel, Arthur | Espaço no layout / Layout slot |
| Desgaste das rodas na Formação Murray / Wheel wear at Murray Formation | `src/state/` | Miguel | — |
| Redemoinhos, pôr do sol azul, Terra no céu / Dust devils, blue sunset, Earth in the sky | Ideias (triagem) / Ideas (triage) | Time / Team | — |

## Entradas do Guia só da v3 / v3-only Guide entries

**PT:** A versão atual tem 12 entradas (9 na rota e 3 extras), que é o escopo do documento de contexto. A v3 tem 19. As entradas abaixo só existem na v3, só em português, e ainda não estão em `pt.json`. Entram só se passarem pela triagem e pela revisão do Bruno.

**EN:** The current version has 12 entries (9 on the route, 3 extras), which matches the context document's scope. v3 has 19. The entries below exist only in v3, only in Portuguese, and are not in `pt.json` yet. They go in only after triage and Bruno's review.

| id (v3) | Título / Title | Observação / Note |
|---|---|---|
| `ret` | Ponto de retorno / Return point | Liga à mecânica VOLTA / Tied to the RETURN mechanic |
| `soil` | Água presa no solo / Water bound in the soil | — |
| `air` | Ar feito de Marte / Air made from Mars | — |
| `layers` | O livro de camadas / The book of layers | — |
| `hematite` | Crista de hematita / Hematite ridge | Vera Rubin Ridge |
| `devil` | Redemoinhos de poeira / Dust devils | — |
| `cold` | A noite marciana / The Martian night | Liga à mecânica de noite / Tied to the night mechanic |
| `sunset` | O pôr do sol azul / The blue sunset | — |
| `earth` | A Terra no céu de Marte / Earth in the Martian sky | — |

`wheels` (v3) ≈ `rocks` (atual / current) e/and `storm` (v3) ≈ `power` (atual / current): já cobertas / already covered.

## Textos que ainda estão dentro do código do protótipo / Texts still inside the prototype code

**PT:** Diálogos, dicas e mensagens da viagem e da EVA estão dentro das funções do protótipo. O dicionário completo PT→EN do protótipo está em `prototipo/textos-prototipo-pt-en.json` (261 pares) e vira chaves em `pt.json`/`en.json` quando cada cena for criada.

**EN:** Travel and EVA dialogue, tips and messages are inside the prototype's functions. The prototype's full PT→EN dictionary is in `prototipo/textos-prototipo-pt-en.json` (261 pairs) and becomes keys in `pt.json`/`en.json` as each scene is built.

## Novidades da versão de 08/11 / What's new in the 08/11 version

**PT:** O protótipo em `prototipo/jogo/` foi atualizado. Os nomes da tripulação mudaram e já estão em `pt.json`/`en.json`, com chaves por função (`crew.commander`, `crew.doctor`, `crew.engineer`, `crew.geologist`), para não depender dos nomes.

**EN:** The prototype in `prototipo/jogo/` was updated. The crew names changed and are already in `pt.json`/`en.json`, keyed by role (`crew.commander`, `crew.doctor`, `crew.engineer`, `crew.geologist`) so the keys don't depend on names.

| Novidade / New | Dono / Owner | Lado do Jonatha / Jonatha's side |
|---|---|---|
| Tripulação: Ana Selari, Keli Hastor, Natan Jonas, Rossi Brook (AN-KE-RO-NA) | Bruno (textos / texts) | Já nos textos / Already in texts |
| Mapa da Cratera Gale (tecla M) / Gale Crater map (M key) | Arthur | Tela/sobreposição do mapa / Map screen overlay |
| Painel de dados do Tatu (Z perto do Tatu) / Tatu data panel (Z near Tatu) | Miguel (dados / data) | Painel na UI / UI panel |
| Zoom da câmera (tecla V) / Camera zoom (V key) | Jonatha | Câmera / Camera |
| Clima e hora marciana (luz do dia, vento) / Weather and Martian hour (daylight, wind) | Miguel (regras / rules), Arthur (som do vento / wind sound) | Escurecer/iluminar a cena / Darken/light the scene |
| Arte de terreno nova (areia, lama, estrias) / New terrain art (sand, mud, striations) | Matheus, Arthur | — |
| Logo em inglês / English logo | Matheus | Já em uso na tela de título / Already used on the title screen |
