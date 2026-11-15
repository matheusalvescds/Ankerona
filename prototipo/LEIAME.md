# Protótipos / Prototypes

**PT:** Esta pasta guarda os protótipos em HTML que vieram antes do jogo em `src/`. Eles servem só de referência: o jogo de verdade não usa nada daqui.

**EN:** This folder keeps the HTML prototypes that came before the game in `src/`. They are reference only: the real game uses nothing from here.

## Estrutura / Structure

```
prototipo/
├── jogo/                         protótipo final do time / team's final prototype
│   ├── index.html                página / page
│   ├── estilo.css                estilos / styles
│   ├── jogo.js                   lógica do jogo / game logic
│   └── arte.js                   imagens em data URI / images as data URIs
├── guia/                         guia de sobrevivência (v3) / survival guide (v3)
│   ├── index.html
│   ├── estilo.css
│   └── guia.js
└── textos-prototipo-pt-en.json   dicionário PT→EN dos textos / PT→EN text dictionary
```

**PT:** Antes cada protótipo era um único arquivo HTML com o CSS e o JavaScript dentro. Agora cada um está separado em HTML, CSS e JavaScript. O código é o mesmo, só mudou de arquivo.

**EN:** Each prototype used to be a single HTML file with the CSS and JavaScript inside. Now each one is split into HTML, CSS and JavaScript. The code is the same, it only moved to other files.

## Como abrir / How to open

**PT:** Abra `jogo/index.html` ou `guia/index.html` direto no navegador (dois cliques no arquivo). Não precisa de servidor.

**EN:** Open `jogo/index.html` or `guia/index.html` directly in the browser (double-click the file). No server needed.

**PT:** As imagens do protótipo ficam em `arte.js` como data URI, e não em arquivos `.png`. Assim o protótipo continua abrindo pelo `file://`: com imagens soltas, o navegador bloquearia a leitura dos pixels (`getImageData`) que o protótipo usa.

**EN:** The prototype's images live in `arte.js` as data URIs, not as `.png` files. This keeps the prototype opening via `file://`: with separate images, the browser would block the pixel reading (`getImageData`) the prototype uses.

## Barra de linguagens / Language bar

**PT:** O arquivo `.gitattributes` na raiz marca esta pasta como documentação, então ela não entra na barra de linguagens do GitHub.

**EN:** The `.gitattributes` file at the root marks this folder as documentation, so it does not count in GitHub's language bar.
