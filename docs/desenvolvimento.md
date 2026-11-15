# Desenvolvimento / Development

- [Português](#português)
- [English](#english)

---

## Português

### 1. Instalar no computador (primeira vez)

1. **Git:** baixe em https://git-scm.com e instale com as opções padrão.
2. **Node.js (o npm vem junto):** baixe a versão **LTS** em https://nodejs.org e instale com as opções padrão, deixando marcado **Add to PATH**. No Windows também dá para usar `winget install OpenJS.NodeJS.LTS`.
3. **Feche e abra o terminal de novo** e confira: `node -v` (precisa ser v20 ou mais) e `npm -v`.
4. **Baixe o projeto:**
   ```bash
   git clone https://github.com/matheusalvescds/Ankerona.git
   cd Ankerona
   ```
5. **Instale as dependências** (Phaser 4.2.1, Vite, TypeScript e as fontes):
   ```bash
   npm install
   ```

### 2. Rodar o jogo

```bash
npm run dev        # abre http://localhost:5173 e recarrega sozinho a cada mudança
npm run build      # confere os tipos e gera a versão final em dist/
npm run preview    # abre a versão de dist/ para testar
```

Pare o servidor com **Ctrl+C**. Sempre que alguém adicionar um pacote novo, rode `npm install` de novo depois do `git pull`.

**XAMPP (opcional):** o Apache não roda TypeScript direto. Se o projeto estiver em `C:\xampp\htdocs\Ankerona`, rode `npm run build` e abra `http://localhost/Ankerona/dist/`. No dia a dia, use `npm run dev`.

### 3. Onde cada pessoa trabalha

Somos 6. Cada pessoa mexe só nas pastas que estão com o nome dela. Assim ninguém altera o mesmo arquivo que outra pessoa ao mesmo tempo e o Git não dá conflito.

**Jonatha** (Dev 1 · Jogo)
- `src/scenes/`, `src/ui/`, `src/i18n/`
- `src/main.ts`, `src/config.ts`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`

**Miguel** (Dev 2 · Mecânicas)
- `src/state/`

**Arthur** (Dev 3 · Dados no jogo e áudio)
- `src/map/`, `src/audio/`

**Aylton** (Pesquisador 1 · Dados técnicos)
- `data/`

**Bruno** (Pesquisador 2 · Ciência e conteúdo)
- `src/content/pt.json` e `src/content/en.json`: revisa e corrige os textos. Quem cria uma tela adiciona as chaves novas lá, e o Bruno revisa depois.
- `README.md`

**Matheus** (Scrum Master e Designer)
- `public/assets/`

**Pastas e arquivos de todos:** `docs/` (cada um pode adicionar o seu documento). A pasta `prototipo/` é só para consulta; ninguém edita.

**Precisa mudar algo fora da sua pasta?** Por exemplo, instalar um pacote novo (`package.json`). Avise o dono no grupo do WhatsApp e combine antes.

### 4. Regras do código

- Resolução interna 160×144, pixel art sem suavização (`src/config.ts`).
- Nenhum texto escrito direto no código: tudo vai em `src/content/pt.json` e `en.json` (mesmas chaves nos dois) e é lido com `t('chave')`.
- Textos de interface usam `uiText()` de `src/ui/UiText.ts`, que deixa a fonte nítida.
- Comentários em português e inglês.
- O Phaser 4 é diferente do 3: confira a API em `node_modules/phaser/skills/` antes de usar exemplos da internet.

---

## English

### 1. Install on your computer (first time)

1. **Git:** download from https://git-scm.com and install with the default options.
2. **Node.js (npm comes with it):** download the **LTS** version from https://nodejs.org and install with the default options, keeping **Add to PATH** checked. On Windows you can also use `winget install OpenJS.NodeJS.LTS`.
3. **Close and reopen the terminal** and check: `node -v` (v20 or newer) and `npm -v`.
4. **Get the project:**
   ```bash
   git clone https://github.com/matheusalvescds/Ankerona.git
   cd Ankerona
   ```
5. **Install dependencies** (Phaser 4.2.1, Vite, TypeScript and the fonts):
   ```bash
   npm install
   ```

### 2. Run the game

```bash
npm run dev        # opens http://localhost:5173 and reloads on every change
npm run build      # type-checks and builds the final version into dist/
npm run preview    # serves dist/ for testing
```

Stop the server with **Ctrl+C**. Whenever someone adds a new package, run `npm install` again after `git pull`.

**XAMPP (optional):** Apache can't run TypeScript directly. If the project is in `C:\xampp\htdocs\Ankerona`, run `npm run build` and open `http://localhost/Ankerona/dist/`. Day to day, use `npm run dev`.

### 3. Who works where

There are 6 of us. Each person only touches the folders under their name. That way nobody edits the same file as someone else at the same time, and Git doesn't hit conflicts.

**Jonatha** (Dev 1 · Game)
- `src/scenes/`, `src/ui/`, `src/i18n/`
- `src/main.ts`, `src/config.ts`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`

**Miguel** (Dev 2 · Mechanics)
- `src/state/`

**Arthur** (Dev 3 · In-game data and audio)
- `src/map/`, `src/audio/`

**Aylton** (Researcher 1 · Technical data)
- `data/`

**Bruno** (Researcher 2 · Science and content)
- `src/content/pt.json` and `src/content/en.json`: reviews and fixes the texts. Whoever builds a screen adds the new keys there, and Bruno reviews them afterwards.
- `README.md`

**Matheus** (Scrum Master and Designer)
- `public/assets/`

**Shared:** `docs/` (anyone can add their own document). The `prototipo/` folder is reference only; nobody edits it.

**Need to change something outside your folder?** For example, adding a new package (`package.json`). Tell the owner in the WhatsApp group and agree first.

### 4. Code rules

- Internal resolution 160×144, pixel art without smoothing (`src/config.ts`).
- No hard-coded text: everything goes in `src/content/pt.json` and `en.json` (same keys in both) and is read with `t('key')`.
- Interface text uses `uiText()` from `src/ui/UiText.ts`, which keeps the font crisp.
- Comments in Portuguese and English.
- Phaser 4 differs from Phaser 3: check the API in `node_modules/phaser/skills/` before using examples from the web.
