# Ankerona: sprites com fundo transparente

Pacote da arte usada no protótipo (versão 50). Todos os PNG têm fundo transparente, exceto as cenas da pasta 09, que ocupam a tela inteira.

## Como usar no Phaser

- Use `pixelArt: true` na configuração do jogo. Nunca suavize ao escalar.
- Tela interna: 160×144. Tile: 16×16.
- Arquivos com vários quadros são **tiras horizontais**: todos os quadros têm o mesmo tamanho, lado a lado, da esquerda para a direita. Carregue com `this.load.spritesheet(chave, arquivo, { frameWidth, frameHeight })`, usando o tamanho de quadro indicado abaixo.
- Arquivos `_2x` são a mesma arte com o dobro de detalhe. No protótipo, o jogo desenha a tela com 2 pixels por pixel do jogo e usa a versão 2x nos personagens, no Tatu, nos veículos e nas rochas. Se não quiser isso, use só as versões 1x.
- O Tatu de lado está virado para a esquerda. Para a direita, espelhe (`setFlipX(true)`).
- No protótipo, a areia das Dunas Bagnold, o lamito de Yellowknife Bay e os estratos do Monte Sharp não são tiles: são texturas geradas no código (ver `RIP`, `MUDT`, `STRT` e `paintGround` no HTML do protótipo).

## Tripulação (homenagem à CHAPEA 1)

| Personagem | Função | Referência |
|---|---|---|
| Ana Selari (protagonista) | Geóloga | Anca Selariu |
| Cmdte. Keli Hastor | Comandante | Kelly Haston |
| Eng. Rossi Brook | Engenheiro | Ross Brockwell |
| Dr. Natan Jonas | Médico | Nathan Jones |

## Arquivos

| Arquivo | Tamanho da imagem | O que é |
|---|---|---|
| `01_Personagens/ana_selari/ana_frente.png` | 80×24 | Ana Selari, frente: parada + 4 de caminhada · 5 quadros de 16×24 |
| `01_Personagens/ana_selari/ana_frente_2x.png` | 160×48 | Ana Selari, frente: parada + 4 de caminhada (versão 2x) · 5 quadros de 32×48 |
| `01_Personagens/ana_selari/ana_costas.png` | 80×24 | Ana Selari, costas: parada + 4 de caminhada · 5 quadros de 16×24 |
| `01_Personagens/ana_selari/ana_costas_2x.png` | 160×48 | Ana Selari, costas: parada + 4 de caminhada (versão 2x) · 5 quadros de 32×48 |
| `01_Personagens/ana_selari/ana_esquerda.png` | 80×24 | Ana Selari, esquerda: parada + 4 de caminhada · 5 quadros de 16×24 |
| `01_Personagens/ana_selari/ana_esquerda_2x.png` | 160×48 | Ana Selari, esquerda: parada + 4 de caminhada (versão 2x) · 5 quadros de 32×48 |
| `01_Personagens/ana_selari/ana_direita.png` | 80×24 | Ana Selari, direita: parada + 4 de caminhada · 5 quadros de 16×24 |
| `01_Personagens/ana_selari/ana_direita_2x.png` | 160×48 | Ana Selari, direita: parada + 4 de caminhada (versão 2x) · 5 quadros de 32×48 |
| `01_Personagens/tripulacao/keli_hastor.png` | 120×24 | Cmdte. Keli Hastor: frente, direita, costas, esquerda, aceno 1, aceno 2 · 6 quadros de 20×24 |
| `01_Personagens/tripulacao/keli_hastor_2x.png` | 240×48 | Cmdte. Keli Hastor: frente, direita, costas, esquerda, aceno 1, aceno 2 (versão 2x) · 6 quadros de 40×48 |
| `01_Personagens/tripulacao/rossi_brook.png` | 120×24 | Eng. Rossi Brook: frente, direita, costas, esquerda, aceno 1, aceno 2 · 6 quadros de 20×24 |
| `01_Personagens/tripulacao/rossi_brook_2x.png` | 240×48 | Eng. Rossi Brook: frente, direita, costas, esquerda, aceno 1, aceno 2 (versão 2x) · 6 quadros de 40×48 |
| `01_Personagens/tripulacao/natan_jonas.png` | 120×24 | Dr. Natan Jonas: frente, direita, costas, esquerda, aceno 1, aceno 2 · 6 quadros de 20×24 |
| `01_Personagens/tripulacao/natan_jonas_2x.png` | 240×48 | Dr. Natan Jonas: frente, direita, costas, esquerda, aceno 1, aceno 2 (versão 2x) · 6 quadros de 40×48 |
| `01_Personagens/retratos/retrato_ana_selari.png` | 96×80 | Retrato da caixa de diálogo |
| `01_Personagens/retratos/retrato_keli_hastor.png` | 96×80 | Retrato da caixa de diálogo |
| `01_Personagens/retratos/retrato_natan_jonas.png` | 96×80 | Retrato da caixa de diálogo |
| `01_Personagens/retratos/retrato_rossi_brook.png` | 96×80 | Retrato da caixa de diálogo |
| `02_Tatu/tatu_frente.png` | 100×18 | Tatu, frente: parado + 2 de movimento + 1 na areia · 5 quadros de 20×18 |
| `02_Tatu/tatu_frente_2x.png` | 200×36 | Tatu, frente: parado + 2 de movimento + 1 na areia (versão 2x) · 5 quadros de 40×36 |
| `02_Tatu/tatu_costas.png` | 100×18 | Tatu, costas: parado + 2 de movimento + 1 na areia · 5 quadros de 20×18 |
| `02_Tatu/tatu_costas_2x.png` | 200×36 | Tatu, costas: parado + 2 de movimento + 1 na areia (versão 2x) · 5 quadros de 40×36 |
| `02_Tatu/tatu_lado.png` | 100×18 | Tatu, lado: parado + 2 de movimento + 1 na areia (lado: virado para a esquerda; espelhe para a direita) · 5 quadros de 20×18 |
| `02_Tatu/tatu_lado_2x.png` | 200×36 | Tatu, lado: parado + 2 de movimento + 1 na areia (lado: virado para a esquerda; espelhe para a direita) (versão 2x) · 5 quadros de 40×36 |
| `03_Veiculos/habitat.png` | 48×44 | Habitat (módulo de pouso) |
| `03_Veiculos/habitat_2x.png` | 96×88 | Habitat (versão 2x) |
| `03_Veiculos/rover_pressurizado.png` | 96×32 | Rover pressurizado: luz do teto apagada/acesa · 2 quadros de 48×32 |
| `03_Veiculos/rover_pressurizado_2x.png` | 192×64 | Rover pressurizado: luz do teto apagada/acesa (versão 2x) · 2 quadros de 96×64 |
| `03_Veiculos/estacao_limpeza_2x.png` | 160×64 | Estação de limpeza do traje (escova e painel eletrostático): apagada + 3 com a luz subindo + acesa (só versão 2x) · 5 quadros de 32×64 |
| `04_Rochas_e_decoracao/rochas_medias.png` | 64×16 | Rochas médias (bloqueiam, 1 tile) · 4 quadros de 16×16 |
| `04_Rochas_e_decoracao/rochas_medias_2x.png` | 128×32 | Rochas médias (bloqueiam, 1 tile) (versão 2x) · 4 quadros de 32×32 |
| `04_Rochas_e_decoracao/rochas_grandes.png` | 128×32 | Rochas grandes (bloqueiam, 2×2 tiles) · 4 quadros de 32×32 |
| `04_Rochas_e_decoracao/rochas_grandes_2x.png` | 256×64 | Rochas grandes (bloqueiam, 2×2 tiles) (versão 2x) · 4 quadros de 64×64 |
| `04_Rochas_e_decoracao/rocha_media_antiga.png` | 14×10 | Decoração |
| `04_Rochas_e_decoracao/rocha_pequena.png` | 10×8 | Decoração |
| `04_Rochas_e_decoracao/rocha_pontiaguda.png` | 16×12 | Decoração |
| `04_Rochas_e_decoracao/meteorito.png` | 12×9 | Decoração |
| `04_Rochas_e_decoracao/pedra_com_veios.png` | 13×9 | Decoração |
| `04_Rochas_e_decoracao/cratera_pequena.png` | 12×10 | Decoração |
| `04_Rochas_e_decoracao/cratera_media.png` | 16×14 | Decoração |
| `04_Rochas_e_decoracao/boxwork.png` | 32×28 | Decoração |
| `04_Rochas_e_decoracao/cristais_de_enxofre.png` | 16×14 | Decoração |
| `04_Rochas_e_decoracao/rastros_de_roda.png` | 16×16 | Decoração |
| `04_Rochas_e_decoracao/ventifatos.png` | 64×8 | Ventifatos (rochas pontiagudas) · 4 quadros de 16×8 |
| `04_Rochas_e_decoracao/seixos.png` | 48×8 | Seixos soltos (pisáveis) · 4 quadros de 12×8 |
| `04_Rochas_e_decoracao/seixos_grupos.png` | 56×10 | Grupos de seixos (pisáveis) · 4 quadros de 14×10 |
| `05_Terreno/regolito.png` | 64×16 | Chão de regolito (tiles 16×16) · 4 quadros de 16×16 |
| `05_Terreno/chao_ventifatos.png` | 64×16 | Chão com ventifatos (tiles 16×16) · 4 quadros de 16×16 |
| `05_Terreno/encosta.png` | 192×32 | Encosta: ponta esquerda, 3 meios, ponta direita, curta isolada (desenhada em 2x, ocupa 16 px de largura por coluna no jogo) · 6 quadros de 32×32 |
| `06_Marcadores/baliza.png` | 80×20 | Baliza dos pontos da missão (luz piscando) · 4 quadros de 20×20 |
| `06_Marcadores/baliza_2x.png` | 160×40 | Baliza dos pontos da missão (luz piscando) (versão 2x) · 4 quadros de 40×40 |
| `06_Marcadores/tripe_ponto_visitado.png` | 12×14 | Tripé do ponto visitado |
| `06_Marcadores/tripe_ponto_visitado_2x.png` | 24×28 | Tripé (2x) |
| `06_Marcadores/marcador_abrigo.png` | 28×14 | Marcador de abrigo no evento solar · 2 quadros de 14×14 |
| `06_Marcadores/alerta_radiacao.png` | 32×14 | Ícone de alerta de radiação · 2 quadros de 16×14 |
| `06_Marcadores/acertos_no_sensor.png` | 36×7 | Acertos de partículas no sensor · 4 quadros de 9×7 |
| `07_Efeitos/poeira_passos.png` | 48×10 | Poeira dos passos · 4 quadros de 12×10 |
| `07_Efeitos/faisca_rocha.png` | 30×10 | Faísca ao pisar em rocha pontiaguda · 3 quadros de 10×10 |
| `07_Efeitos/redemoinho_poeira.png` | 84×26 | Redemoinho de poeira (dust devil) · 6 quadros de 14×26 |
| `07_Efeitos/brilho_descoberta.png` | 48×12 | Brilho das descobertas extras · 4 quadros de 12×12 |
| `08_HUD/icones_hud.png` | 72×12 | Ícones do HUD: O₂, bateria, traje, radiação, hora, camada · 6 quadros de 12×12 |
| `09_Cenas/titulo.png` | 160×144 | Fundo da tela de título (160×144) |
| `09_Cenas/viagem_espaco.png` | 160×144 | Fundo da viagem |
| `09_Cenas/teaser_lua.png` | 160×144 | Fundo da Lua (1969) |
| `09_Cenas/epilogo_por_do_sol.png` | 160×144 | Epílogo: pôr do sol azul |
| `09_Cenas/pouso_chao_gale.png` | 160×72 | Chão de Gale que sobe no pouso |
| `09_Cenas/marte_horizonte.png` | 160×42 | Horizonte de Marte visto da órbita |
| `09_Cenas/marte.png` | 96×96 | Planeta Marte |
| `09_Cenas/terra.png` | 64×64 | Terra |
| `09_Cenas/lua_pequena.png` | 22×22 | Lua pequena (Apollo 13) |
| `09_Cenas/lua_grande.png` | 52×52 | Lua (Artemis II) |
| `10_Teaser_e_viagem/nave_transporte.png` | 264×34 | Nave de transporte: motor apagado, brilho 1, brilho 2, janelas · 4 quadros de 66×34 |
| `10_Teaser_e_viagem/pouso_sequencia.png` | 280×46 | Pouso: plasma 1, plasma 2, paraquedas, escudo solto, retrofoguetes 1, retrofoguetes 2, pousada · 7 quadros de 40×46 |
| `10_Teaser_e_viagem/foguete_mercury_redstone.png` | 136×62 | Foguete do Ham: plataforma + 3 de decolagem · 4 quadros de 34×62 |
| `10_Teaser_e_viagem/capsula_mercury_orbita.png` | 56×14 | Cápsula Mercury girando · 4 quadros de 14×14 |
| `10_Teaser_e_viagem/apollo13.png` | 150×28 | Apollo 13: intacta, vazamento, painel faltando · 3 quadros de 50×28 |
| `10_Teaser_e_viagem/rover_robos.png` | 104×18 | Rover da tela dos robôs, andando · 4 quadros de 26×18 |
| `10_Teaser_e_viagem/orion_artemis2.png` | 132×32 | Orion (Artemis II) · 3 quadros de 44×32 |
| `11_Logo/logo_ankerona_pt.png` | 560×360 | Logo com fundo transparente |
| `11_Logo/logo_ankerona_en.png` | 560×360 | Logo com fundo transparente |

## Fontes das fotos reais do Guia de Campo

PIA17595, PIA20284, PIA20334, PIA26309 e PIA26559 · NASA/JPL-Caltech/MSSS. Estão na pasta `space-apps`, em resolução original.
