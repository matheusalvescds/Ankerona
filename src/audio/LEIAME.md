# src/audio/ · Arthur

**PT:** Trilha e efeitos sonoros. As cenas só chamam funções como `playMusic(this, 'eva')` e `play(this, 'passo')`, de `audio.ts`.

**EN:** Music and sound effects. Scenes only call functions such as `playMusic(this, 'eva')` and `play(this, 'passo')`, from `audio.ts`.

## Arquivos / Files

Em `public/assets/audio/`. / In `public/assets/audio/`.

| Arquivo / File | Onde toca / Where it plays | Original |
|---|---|---|
| `musica/menu.mp3` | Título e final / Title and ending | `menu-ankerona-f.wav` |
| `musica/prologo.mp3` | Teaser, viagem e pouso / Teaser, travel and landing | `ankerona_prologue.wav` |
| `musica/gale.mp3` | EVA na Cratera Gale / EVA in Gale Crater | `gale_bgm.wav` |
| `efeitos/passo.wav` | Cada passo da Ana / Each step Ana takes | `walk_sfx.wav` |
| `efeitos/troca_camada.wav` | Trocar a camada de dados (C ou L) / Switching the data layer (C or L) | `layer_switch.wav` |
| `efeitos/alerta_solar.wav` | Aviso e chegada do evento solar / Solar event warning and arrival | `solar_alert.wav` |

**PT:** As músicas vieram em WAV (106 MB) e foram convertidas para MP3 (cerca de 8 MB), que toca em todos os navegadores. A `gale.mp3` ganhou +12 dB porque o original era bem mais baixo que as outras. Os efeitos continuam em WAV, porque são pequenos.

**EN:** The music came as WAV (106 MB) and was converted to MP3 (about 8 MB), which plays in every browser. `gale.mp3` got +12 dB because the original was much quieter than the others. The effects stay as WAV, since they are small.

**PT:** O volume de cada som fica em `audio.ts`. A música do menu e os efeitos carregam na abertura; as outras carregam quando a cena pede (o título já começa a baixar em segundo plano). O navegador só toca som depois do primeiro toque ou tecla, então a música do título começa nesse momento.

**EN:** Each sound's volume lives in `audio.ts`. The menu music and the effects load at startup; the others load when a scene asks for them (the title screen already starts downloading them in the background). The browser only plays sound after the first tap or key press, so the title music starts at that moment.
