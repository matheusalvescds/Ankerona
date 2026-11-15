/* Código do protótipo do jogo (extraído do HTML original). A arte fica em arte.js, carregado antes. / Game prototype code (extracted from the original HTML). The art lives in arte.js, loaded first. */
(()=>{
'use strict';
let LANG='pt';try{const v=localStorage.getItem('ankerona-lang');if(v==='en'||v==='pt')LANG=v}catch(e){}
const EN={"Dunas Bagnold": "Bagnold Dunes", "Formações boxwork": "Boxwork formations", "Uma laje lisa, polida pelo vento. Para a escala de Marte, esta rocha ficou exposta há pouquíssimo tempo.": "A smooth slab, polished by the wind. On the Martian timescale, this rock was exposed only very recently.", "Ao lado, a face de uma duna enorme, lisa e inclinada. É a Duna Namib.": "Next to it, the face of a huge dune, smooth and steep. It's Namib Dune.", "Sua bota quebrou uma pedra, e dentro dela há cristais amarelos! Igual ao que o Curiosity encontrou em 2024.": "Your boot cracked a rock, and inside there are yellow crystals! Just like what Curiosity found in 2024.", "CMDTE. KELI HASTOR": "CMDR. KELI HASTOR", "DR. NATAN JONAS": "DR. NATAN JONAS", "ENG. ROSSI BROOK": "ENG. ROSSI BROOK", "Vista normal do terreno. Toque em CAMADA para trocar a camada de dados. Cada camada ligada gasta bateria (EN); o MAPA não gasta.": "Normal view of the terrain. Tap LAYER to switch data layers. Every active layer drains battery (PWR); the MAP does not.", "mais baixo": "lowest", "médio": "middle", "mais alto": "highest", "curva de nível": "contour line", "<strong>Topografia.</strong> Faixas de elevação com curvas de nível. A encosta sobe em direção ao Monte Sharp. Na versão final: modelos de elevação do HiRISE (MRO).": "<strong>Topography.</strong> Elevation bands with contour lines. The slope rises toward Mount Sharp. Final version: HiRISE (MRO) elevation models.", "<strong>Minerais.</strong> Argilas indicam água antiga de baixa acidez. As camadas altas do Monte Sharp são ricas em sulfatos. Na versão final: espectros do CRISM (MRO) e análises do Curiosity.": "<strong>Minerals.</strong> Clays point to ancient, low-acidity water. Mount Sharp's upper layers are rich in sulfates. Final version: CRISM (MRO) spectra and Curiosity analyses.", "areia fofa": "soft sand", "rochas pontiagudas": "sharp rocks", "encosta ou rocha": "slope or rock", "<strong>Terreno.</strong> Mostra onde é arriscado pisar e onde se abrigar. Areia fofa gasta mais O₂ e deixa você mais lenta. Rochas pontiagudas danificam o traje.": "<strong>Terrain.</strong> Shows where it's risky to step and where to take shelter. Soft sand uses more O₂ and slows you down. Sharp rocks damage the suit.", "Radiação na viagem": "Radiation in transit", "Fora da proteção do campo magnético da Terra, a radiação é constante. Durante o cruzeiro até Marte, o instrumento RAD, a bordo do Curiosity, mediu cerca de 1,8 mSv por dia.": "Outside the protection of Earth's magnetic field, radiation is constant. During the cruise to Mars, the RAD instrument aboard Curiosity measured about 1.8 mSv per day.", "Lição: tenha um abrigo blindado na nave e um plano para alertas solares.": "Lesson: have a shielded shelter on the ship and a plan for solar alerts.", "Fonte: NASA/JPL · MSL RAD (Zeitlin et al., Science, 2013)": "Source: NASA/JPL · MSL RAD (Zeitlin et al., Science, 2013)", "O ambiente de Marte": "The Martian environment", "A gravidade é 38% da terrestre e a pressão atmosférica é menos de 1% da da Terra. Um dia marciano, o sol, dura 24h39min. As noites chegam a dezenas de graus negativos.": "Gravity is 38% of Earth's and atmospheric pressure is less than 1% of Earth's. A Martian day, a sol, lasts 24h39min. Nights drop to tens of degrees below zero.", "Lição: o traje fica pressurizado o tempo todo. Planeje a EVA pela duração do oxigênio.": "Lesson: the suit stays pressurized at all times. Plan the EVA around your oxygen supply.", "Fonte: NASA Mars Exploration Program": "Source: NASA Mars Exploration Program", "Poeira tóxica": "Toxic dust", "O solo marciano contém percloratos, sais tóxicos para humanos. A sonda Phoenix os detectou em 2008, e o Curiosity também os encontrou na Cratera Gale.": "Martian soil contains perchlorates, salts that are toxic to humans. The Phoenix lander detected them in 2008, and Curiosity also found them in Gale Crater.", "Lição: remova a poeira do traje antes de entrar no habitat.": "Lesson: remove dust from the suit before entering the habitat.", "Fonte: NASA/JPL · Phoenix Mars Lander; MSL Curiosity": "Source: NASA/JPL · Phoenix Mars Lander; MSL Curiosity", "Marte já teve água": "Mars once had water", "Em 2013, o Curiosity perfurou as rochas de Yellowknife Bay e encontrou argilominerais. Ali existiu um lago com água pouco salgada e de pH neutro, um ambiente que poderia ter sustentado vida microbiana.": "In 2013, Curiosity drilled the rocks of Yellowknife Bay and found clay minerals. A lake of low-salinity, neutral-pH water once existed there, an environment that could have supported microbial life.", "Lição: rochas sedimentares finas, como lamitos, são os melhores alvos para buscar sinais de habitabilidade.": "Lesson: fine-grained sedimentary rocks, like mudstones, are the best targets when looking for signs of habitability.", "Fonte: NASA/JPL-Caltech · MSL (Grotzinger et al., Science, 2014)": "Source: NASA/JPL-Caltech · MSL (Grotzinger et al., Science, 2014)", "Areia fofa": "Soft sand", "As Dunas Bagnold são dunas ativas, que se movem com o vento. O Curiosity as estudou em 2015 e 2016. Em 2009, o rover Spirit atolou em solo fofo e não conseguiu mais sair.": "The Bagnold Dunes are active dunes that move with the wind. Curiosity studied them in 2015 and 2016. In 2009, the Spirit rover got stuck in soft soil and never got out.", "Lição: evite areia fofa e teste o solo antes de avançar com carga.": "Lesson: avoid soft sand and test the ground before moving ahead with cargo.", "Fonte: NASA/JPL-Caltech · MSL Curiosity; MER Spirit": "Source: NASA/JPL-Caltech · MSL Curiosity; MER Spirit", "Energia e poeira": "Power and dust", "O Opportunity funcionava com energia solar. Em junho de 2018, uma tempestade de poeira cobriu o planeta inteiro, e o último contato com o rover foi em 10/06/2018. A NASA encerrou a missão em fevereiro de 2019, depois de quase 15 anos em Marte. O Curiosity usa um gerador nuclear e continuou operando.": "Opportunity ran on solar power. In June 2018, a dust storm covered the entire planet, and the last contact with the rover was on June 10, 2018. NASA ended the mission in February 2019, after almost 15 years on Mars. Curiosity uses a nuclear power source and kept operating.", "Lição: instrumentos gastam energia. Planeje a bateria da EVA e guarde reserva para voltar.": "Lesson: instruments use power. Plan your EVA battery and keep a reserve for the way back.", "Fonte: NASA/JPL · encerramento da missão Opportunity (fev. 2019)": "Source: NASA/JPL · Opportunity end of mission (Feb. 2019)", "Partículas solares": "Solar particles", "Na superfície, o RAD mediu em média cerca de 0,64 mSv por dia. Um evento de partículas solares pode elevar a dose em pouco tempo. As taxas e o tempo de aviso do evento neste jogo são simulados.": "On the surface, RAD measured an average of about 0.64 mSv per day. A solar particle event can raise the dose quickly. The event's rates and warning time in this game are simulated.", "Lição: monitore os alertas de clima espacial e mantenha um abrigo sempre a poucos minutos.": "Lesson: monitor space weather alerts and always keep a shelter a few minutes away.", "Fonte: NASA/JPL · MSL RAD (Hassler et al., Science, 2014)": "Source: NASA/JPL · MSL RAD (Hassler et al., Science, 2014)", "Rochas pontiagudas": "Sharp rocks", "No fim de 2013, os furos e rasgos nas rodas de alumínio do Curiosity aumentaram rápido ao cruzar terreno com rochas pontiagudas. A equipe passou a buscar rotas mais lisas, inspecionar as rodas com frequência e testar dirigir de ré.": "In late 2013, the holes and tears in Curiosity's aluminum wheels grew quickly while it crossed terrain with sharp rocks. The team began looking for smoother routes, inspecting the wheels often and testing driving in reverse.", "Lição: rochas assim também podem cortar trajes. Contorne quando der e inspecione o equipamento ao voltar.": "Lesson: rocks like these could also cut suits. Go around them when you can and inspect your gear when you return.", "Fonte: NASA/JPL · relatórios da missão MSL (2013–2014)": "Source: NASA/JPL · MSL mission reports (2013–2014)", "São redes de cristas na rocha. Água subterrânea depositou minerais em fraturas, e a erosão depois removeu a rocha em volta, deixando as cristas em relevo. O Curiosity estudou essas formações em 2025, no Monte Sharp.": "They are networks of ridges in the rock. Groundwater deposited minerals in fractures, and erosion later removed the surrounding rock, leaving the ridges standing out. Curiosity studied these formations in 2025, on Mount Sharp.", "Lição: essas cristas registram água subterrânea depois que os lagos secaram. É ciência que só se faz no local.": "Lesson: these ridges record groundwater after the lakes dried up. It's science that can only be done on site.", "Fonte: NASA/JPL-Caltech · MSL Curiosity (2025)": "Source: NASA/JPL-Caltech · MSL Curiosity (2025)", "Relógio da erosão": "Erosion clock", "As rochas de Yellowknife Bay ficaram expostas há cerca de 80 milhões de anos, quando o vento erodiu as camadas que as cobriam. Para a geologia de Marte, é uma exposição recente.": "The rocks of Yellowknife Bay were exposed about 80 million years ago, when wind eroded the layers covering them. For Martian geology, that is a recent exposure.", "Lição: superfícies expostas há menos tempo passaram menos tempo sob a radiação da superfície.": "Lesson: more recently exposed surfaces have spent less time under surface radiation.", "Fonte: NASA/JPL-Caltech/MSSS · PIA17595": "Source: NASA/JPL-Caltech/MSSS · PIA17595", "PIA17595 · mosaico de Yellowknife Bay com os pontos de perfuração (sol 137)": "PIA17595 · Yellowknife Bay mosaic with the drill sites (sol 137)", "Duna Namib": "Namib Dune", "É uma das Dunas Bagnold. A face a favor do vento tem inclinação de cerca de 28° e uns 5 m de altura. Imagens orbitais mostram que essas dunas avançam até cerca de 1 m por ano terrestre.": "It is one of the Bagnold Dunes. Its downwind face slopes about 28° and stands about 5 m tall. Orbital images show these dunes advance up to about 1 m per Earth year.", "Lição: dunas mudam de lugar. Atualize a rota com imagens recentes.": "Lesson: dunes move. Update your route with recent images.", "Fonte: NASA/JPL-Caltech/MSSS · PIA20284 (sol 1.197, 18/12/2015)": "Source: NASA/JPL-Caltech/MSSS · PIA20284 (sol 1,197, Dec 18, 2015)", "PIA20284 · panorama 360° ao lado da Duna Namib": "PIA20284 · 360° panorama beside Namib Dune", "Cristais de enxofre": "Sulfur crystals", "Em 30/05/2024 (sol 4.200), o Curiosity passou por cima de uma rocha no canal Gediz Vallis, apelidada de Convict Lake, e a quebrou. Dentro havia cristais amarelos de enxofre puro, identificados pelo instrumento APXS. Foi a primeira vez que se encontrou enxofre puro em Marte.": "On May 30, 2024 (sol 4,200), Curiosity drove over a rock in the Gediz Vallis channel, nicknamed Convict Lake, and cracked it open. Inside were yellow crystals of pure sulfur, identified by the APXS instrument. It was the first time pure sulfur was found on Mars.", "Lição: descobertas podem surgir por acaso. Registre tudo, até o que aparece sob os pés.": "Lesson: discoveries can happen by chance. Record everything, even what turns up under your feet.", "Fonte: NASA/JPL-Caltech · PIA26309 (2024)": "Source: NASA/JPL-Caltech · PIA26309 (2024)", "PIA26309 · rocha Convict Lake quebrada, com os cristais": "PIA26309 · the cracked Convict Lake rock, with the crystals", "Dia 112 de viagem. O alarme tocou de madrugada e passamos horas espremidos no abrigo. Lá fora, o Sol não para. Aqui dentro, aprendi que medo também se mede em mSv.": "Day 112 of the trip. The alarm went off before dawn and we spent hours squeezed into the shelter. Outside, the Sun never stops. In here, I learned that fear can also be measured in mSv.", "Sol 1. Dei o primeiro passo e quase pulei alto demais: aqui eu peso pouco mais de um terço do que pesava em casa. O céu é cor de caramelo, e o silêncio é absoluto. Sem o traje, eu não duraria um minuto.": "Sol 1. I took my first step and almost jumped too high: here I weigh a little over a third of what I weighed at home. The sky is the color of caramel, and the silence is absolute. Without the suit, I wouldn't last a minute.", "Keli avisou pelo rádio: \"Limpa o traje antes de entrar.\" Esse pó vermelho é bonito, mas é veneno.": "Keli said over the radio: \"Clean your suit before coming in.\" This red dust is beautiful, but it's poison.", "Toquei uma rocha que um dia foi lama no fundo de um lago. Água de verdade, calma, com pH neutro. Talvez algo tenha vivido aqui. Fiquei um tempo parada, só olhando.": "I touched a rock that was once mud at the bottom of a lake. Real water, calm, with neutral pH. Maybe something lived here. I stood still for a while, just looking.", "O vento levou milhões de anos para descobrir esta laje. Para Marte, isso é ontem. Sou a primeira pessoa a tocá-la.": "The wind took millions of years to uncover this slab. For Mars, that's yesterday. I'm the first person to touch it.", "As dunas parecem macias, mas o Spirit ficou preso numa areia assim e nunca mais saiu. O Tatu reclamou a cada metro. Contornamos.": "The dunes look soft, but Spirit got stuck in sand like this and never got out. Tatu complained every meter. We went around.", "Uma parede de areia escura com a altura de uma casa. E ela anda: até um metro por ano. O mapa de hoje não vale para amanhã.": "A wall of dark sand as tall as a house. And it moves: up to a meter a year. Today's map won't work tomorrow.", "A bateria do traje caiu para 30%. Lembrei do Opportunity, que dormiu numa tempestade de poeira e nunca mais acordou. Desliguei os instrumentos e voltei a andar.": "My suit battery dropped to 30%. I remembered Opportunity, which fell asleep in a dust storm and never woke up. I turned off the instruments and kept walking.", "Alerta: uma erupção solar. Quarenta e cinco minutos para me esconder. Corri como nunca dentro de um traje. Chegar ao abrigo foi o melhor abraço da minha vida.": "Alert: a solar flare. Forty-five minutes to take cover. I ran like never before inside a suit. Reaching the shelter was the best hug of my life.", "As pedras aqui são facas. Foram pedras assim que furaram as rodas do Curiosity. Hoje rasparam o meu traje. Um corte pequeno, mas o ar não perdoa.": "The stones here are knives. Rocks like these punched holes in Curiosity's wheels. Today they scraped my suit. A small cut, but the air is unforgiving.", "Pisei numa pedra e ela quebrou. Dentro, cristais amarelos, brilhando. O Curiosity achou algo assim por acaso, em 2024. Marte guarda surpresas debaixo dos nossos pés.": "I stepped on a rock and it broke. Inside, yellow crystals, shining. Curiosity found something like this by chance, in 2024. Mars keeps surprises under our feet.", "Cheguei. Cristas cruzadas, como as paredes de uma colmeia de pedra. A água correu por baixo da terra muito depois de os lagos secarem. Guardei a amostra com as mãos tremendo.": "I made it. Crossing ridges, like the walls of a stone honeycomb. Water flowed underground long after the lakes dried up. I stored the sample with shaking hands.", "PIA17595 · formação Yellowknife Bay (sol 137)": "PIA17595 · Yellowknife Bay formation (sol 137)", "PIA20284 · Duna Namib, Dunas Bagnold (sol 1.197)": "PIA20284 · Namib Dune, Bagnold Dunes (sol 1,197)", "PIA20334 · inspeção de desgaste das rodas do Curiosity": "PIA20334 · Curiosity wheel wear inspection", "PIA26559 · primeira vista 360° do boxwork (sols 4.451 a 4.454)": "PIA26559 · first 360° view of the boxwork (sols 4,451 to 4,454)", "MAPA": "MAP", "TOPOGRAFIA": "TOPOGRAPHY", "+ GUIA: ": "+ GUIDE: ", "Pixel art: uma pessoa de costas no alto de uma colina, olhando o céu estrelado com Marte como um ponto vermelho": "Pixel art: a person seen from behind on a hilltop, looking at the starry sky with Mars as a red dot", "Ilustração em pixel art da sonda Viking 1 pousada em Marte": "Pixel art illustration of the Viking 1 lander on Mars", "Ilustração em pixel art do rover Spirit na Cratera Gusev": "Pixel art illustration of the Spirit rover in Gusev Crater", "Ilustração em pixel art do rover Opportunity em Meridiani Planum": "Pixel art illustration of the Opportunity rover at Meridiani Planum", "Ilustração em pixel art do rover Curiosity diante do Monte Sharp": "Pixel art illustration of the Curiosity rover in front of Mount Sharp", "Ilustração em pixel art do rover Perseverance perfurando rocha na Cratera Jezero": "Pixel art illustration of the Perseverance rover drilling rock in Jezero Crater", "Retrato em pixel art do chimpanzé Ham na cápsula Mercury": "Pixel art portrait of Ham the chimpanzee in the Mercury capsule", "Retrato em pixel art de Alan Shepard na cápsula Mercury": "Pixel art portrait of Alan Shepard in the Mercury capsule", "Retrato em pixel art de John Glenn na cápsula Mercury": "Pixel art portrait of John Glenn in the Mercury capsule", "Retrato em pixel art de Sally Ride a bordo do ônibus espacial": "Pixel art portrait of Sally Ride aboard the Space Shuttle", "Retrato em pixel art de Neil Armstrong com o capacete nas mãos": "Pixel art portrait of Neil Armstrong holding his helmet", "Retrato em pixel art de Buzz Aldrin na Lua": "Pixel art portrait of Buzz Aldrin on the Moon", "Retrato em pixel art de Michael Collins no módulo de comando": "Pixel art portrait of Michael Collins in the command module", "Retrato em pixel art de Jim Lovell na Apollo 13": "Pixel art portrait of Jim Lovell on Apollo 13", "Retrato em pixel art de Jack Swigert na Apollo 13": "Pixel art portrait of Jack Swigert on Apollo 13", "Retrato em pixel art de Fred Haise na Apollo 13": "Pixel art portrait of Fred Haise on Apollo 13", "Retrato em pixel art de um tripulante da Artemis II": "Pixel art portrait of an Artemis II crew member", "Retrato em pixel art de Christina Koch na Artemis II": "Pixel art portrait of Christina Koch on Artemis II", "Retrato em pixel art de Jeremy Hansen na Artemis II": "Pixel art portrait of Jeremy Hansen on Artemis II", "Desde sempre, olhamos para o céu e nos perguntamos o que havia além.": "Since the beginning, we have looked at the sky and wondered what lay beyond.", "Durante milênios, ele foi apenas um sonho.": "For millennia, it was only a dream.", "Até que, um dia, decidimos ir.": "Until, one day, we decided to go.", "Antes de qualquer astronauta, foi ele.": "Before any astronaut, there was him.", "Um chimpanzé chamado Ham, a bordo de uma cápsula Mercury.": "A chimpanzee named Ham, aboard a Mercury capsule.", "Subiu, enfrentou o desconhecido... e voltou vivo.": "He went up, faced the unknown... and came back alive.", "Provou que era possível.": "He proved it was possible.", "Alan Shepard rompeu a barreira e foi ao espaço.": "Alan Shepard broke the barrier and went to space.", "“Boa viagem, John Glenn.” Com essas palavras, Glenn deu três voltas ao redor da Terra.": "“Godspeed, John Glenn.” With those words, Glenn circled the Earth three times.", "Anos depois, Sally Ride mostrou que o espaço pertencia a todos.": "Years later, Sally Ride showed that space belonged to everyone.", "20 · JUL · 1969": "JUL · 20 · 1969", "Milhões de pessoas em silêncio. Neil Armstrong desce a escada.": "Millions of people in silence. Neil Armstrong climbs down the ladder.", "“Um pequeno passo para o homem, um salto gigante para a humanidade.”": "“That's one small step for man, one giant leap for mankind.”", "Ao seu lado, Buzz Aldrin. Na órbita, Michael Collins esperando por eles.": "Beside him, Buzz Aldrin. In orbit, Michael Collins waiting for them.", "“Houston, tivemos um problema.”": "“Houston, we've had a problem.”", "A 300 mil quilômetros de casa, uma explosão.": "200,000 miles from home, an explosion.", "Lovell, Swigert e Haise tinham uma única missão: sobreviver.": "Lovell, Swigert and Haise had a single mission: survive.", "E sobreviveram.": "And they did.", "Por décadas, enviamos nossos olhos onde ainda não podíamos ir.": "For decades, we sent our eyes where we could not yet go.", "Cada dado era uma promessa: um dia, alguém viria.": "Every piece of data was a promise: one day, someone would come.", "HOJE": "TODAY", "Meio século depois, voltamos a viajar até a Lua.": "Half a century later, we traveled to the Moon again.", "A tripulação da Artemis II (Wiseman, Glover, Koch e Hansen) contornou seu lado oculto e olhou adiante.": "The Artemis II crew (Wiseman, Glover, Koch and Hansen) flew around its far side and looked ahead.", "Para um ponto vermelho no céu.": "Toward a red dot in the sky.", "Os robôs mapearam o caminho.": "The robots mapped the way.", "<big>Agora é a nossa vez.": "<big>Now it's our turn.", " ANOS DEPOIS": " YEARS LATER", "UM ANO DEPOIS": "ONE YEAR LATER", "IGNIÇÃO": "IGNITION", "Entrada bloqueada": "Locked entry", "Entrada extra. Explore fora da rota para encontrá-la.": "Extra entry. Explore off the route to find it.", "Entrada ainda não registrada. Continue a missão para descobri-la.": "Entry not recorded yet. Keep going with the mission to discover it.", "DIÁRIO DE BORDO": "SHIP'S LOG", "A nave deixa a órbita da Terra rumo a Marte. A travessia dura cerca de 7 meses, o mesmo tempo que o Perseverance levou.": "The ship leaves Earth orbit bound for Mars. The crossing takes about 7 months, the same time Perseverance took.", "Longe do campo magnético da Terra, a radiação é constante. O Curiosity mediu cerca de 1,8 mSv por dia neste trajeto.": "Far from Earth's magnetic field, radiation is constant. Curiosity measured about 1.8 mSv per day on this route.", "COMANDANTE HASTOR": "COMMANDER HASTOR", "Alerta de tempestade solar! Todos para o abrigo, a área mais blindada da nave.": "Solar storm alert! Everyone to the shelter, the most heavily shielded area of the ship.", "+ GUIA DE CAMPO": "+ FIELD GUIDE", "Radiação na viagem: tenha um abrigo blindado e um plano para alertas solares.": "Radiation in transit: have a shielded shelter and a plan for solar alerts.", "A cada mês, as mensagens para a Terra demoram mais. Perto de Marte, a conversa em tempo real deixa de existir.": "Every month, messages to Earth take longer. Near Mars, real-time conversation is no longer possible.", "Marte à vista. Iniciando entrada, descida e pouso. Segurem-se.": "Mars in sight. Beginning entry, descent and landing. Hold on.", "Pouso confirmado na Cratera Gale. Bem-vinda a Marte, Dra. Selari.": "Touchdown confirmed in Gale Crater. Welcome to Mars, Dr. Selari.", "Somos quatro: eu fico no habitat, o Dr. Natan Jonas cuida da saúde e o Eng. Rossi Brook está no rover pressurizado, perto das dunas. Fale com a gente com A.": "There are four of us: I stay at the habitat, Dr. Natan Jonas looks after our health, and Eng. Rossi Brook is at the pressurized rover, near the dunes. Talk to us with A.", "A gravidade aqui é 38% da terrestre, e a pressão é menos de 1% da da Terra. Sem traje, não há sobrevivência.": "Gravity here is 38% of Earth's, and the pressure is less than 1% of Earth's. Without a suit, there is no survival.", "O ambiente de Marte: um sol dura 24h39min. Sua EVA de hoje tem oxigênio para cerca de 8 horas.": "The Martian environment: a sol lasts 24h39min. Today's EVA has oxygen for about 8 hours.", "O solo tem percloratos, sais tóxicos. Limpe o traje antes de entrar no habitat.": "The soil has perchlorates, toxic salts. Clean your suit before entering the habitat.", "Poeira tóxica: remova a poeira do traje antes de entrar.": "Toxic dust: remove dust from the suit before going in.", "Seu mapa já tem a camada de topografia. Use CAMADA para alternar. Encostas e rochas bloqueiam o caminho.": "Your map already has the topography layer. Use LAYER to switch. Slopes and rocks block the way.", "O traje tem três reservas: O₂, bateria (EN) e integridade (TJ). Camadas de dados gastam bateria. O habitat e o rover restauram tudo.": "The suit has three reserves: O₂, battery (PWR) and integrity (SUIT). Data layers drain battery. The habitat and the rover restore everything.", "Primeiro alvo: Yellowknife Bay. O Tatu, nosso rover de carga, vai na frente mostrando o caminho. Siga o Tatu: se você ficar para trás, ele espera.": "First target: Yellowknife Bay. Tatu, our cargo rover, will lead the way. Follow Tatu: if you fall behind, it waits for you.", "Se sobrar tempo, explore fora da rota. Fique de olho em brilhos no chão.": "If you have time left, explore off the route. Keep an eye out for glints on the ground.", "DRA. SELARI": "DR. SELARI", "Yellowknife Bay. Rocha de grão fino, em camadas... é um lamito.": "Yellowknife Bay. Fine-grained rock, in layers... it's a mudstone.", "Foi aqui que o Curiosity perfurou em 2013. Encontrou argilominerais: aqui existiu um lago de água pouco salgada.": "This is where Curiosity drilled in 2013. It found clay minerals: a lake of low-salinity water once existed here.", "Marte já teve água, num ambiente que poderia ter sustentado vida microbiana.": "Mars once had water, in an environment that could have supported microbial life.", "NOVO INSTRUMENTO": "NEW INSTRUMENT", "MINERAIS": "MINERALS", "Espectrômetro pronto. Camada MINERAIS liberada.": "Spectrometer ready. MINERALS layer unlocked.", "Próximo alvo: Dunas Bagnold. Cuidado com a areia.": "Next target: Bagnold Dunes. Watch out for the sand.", "Dunas Bagnold. Dunas ativas: o vento as move até hoje.": "Bagnold Dunes. Active dunes: the wind still moves them today.", "Em 2009, o rover Spirit atolou em solo fofo e nunca mais saiu. Não repita o erro.": "In 2009, the Spirit rover got stuck in soft soil and never got out. Don't repeat that mistake.", "Areia fofa: evite e teste o solo antes de avançar com carga.": "Soft sand: avoid it and test the ground before moving ahead with cargo.", "TERRENO": "TERRAIN", "Sensor de solo pronto. Camada TERRENO liberada: ela mostra areia, encostas e abrigos.": "Soil sensor ready. TERRAIN layer unlocked: it shows sand, slopes and shelters.", "Lá estão elas. Cristas cruzadas, como as paredes de uma caixa.": "There they are. Crossing ridges, like the walls of a box.", "Formações boxwork. Água subterrânea depositou minerais em fraturas. A erosão deixou as cristas em relevo.": "Boxwork formations. Groundwater deposited minerals in fractures. Erosion left the ridges standing out.", "Boxwork: registro de água subterrânea, estudado pelo Curiosity em 2025.": "Boxwork: a record of groundwater, studied by Curiosity in 2025.", "Amostra coletada. Objetivo científico cumprido.": "Sample collected. Science objective complete.", "Excelente trabalho. Volte ao habitat. O rover pressurizado pode recarregar seu O₂ no caminho.": "Excellent work. Head back to the habitat. The pressurized rover can refill your O₂ on the way.", "Alerta! Os satélites detectaram uma erupção solar. As partículas chegam em cerca de 45 minutos.": "Alert! Satellites detected a solar flare. The particles arrive in about 45 minutes.", "Vá para um abrigo: o rover pressurizado, perto das dunas, ou o habitat. O Tatu leva você ao mais próximo.": "Get to a shelter: the pressurized rover, near the dunes, or the habitat. Tatu will lead you to the nearest one.", "Partículas solares: monitore alertas e mantenha um abrigo a poucos minutos.": "Solar particles: monitor alerts and keep a shelter a few minutes away.", "Último alvo: as formações boxwork, subindo a encosta do Monte Sharp.": "Final target: the boxwork formations, up the slope of Mount Sharp.", "Rover pressurizado": "Pressurized rover", "ALVO: ": "TARGET: ", "SEM BATERIA: VÁ A UM ABRIGO": "NO BATTERY: GO TO A SHELTER", "CAMADA: ": "LAYER: ", "HABITAT: ABRIGO E O₂": "HABITAT: SHELTER AND O₂", "ROVER PRESSURIZADO: ABRIGO E O₂": "PRESSURIZED ROVER: SHELTER AND O₂", "AREIA FOFA: PASSO LENTO": "SOFT SAND: SLOW STEPS", "REGOLITO FIRME": "FIRM REGOLITH", "A: FALAR COM ": "A: TALK TO ", "ENCOSTA ÍNGREME: CONTORNE": "STEEP SLOPE: GO AROUND", "ROCHA: CONTORNE": "ROCK: GO AROUND", "ABRIGO À FRENTE": "SHELTER AHEAD", "TRAJE DANIFICADO: ": "SUIT DAMAGED: ", "Rochas pontiagudas! Senti o traje raspar.": "Sharp rocks! I felt my suit scrape.", "Em 2013, rochas assim furaram as rodas de alumínio do Curiosity. Com o traje abaixo de 50%, ele começa a vazar O₂.": "In 2013, rocks like these punched holes in Curiosity's aluminum wheels. With the suit below 50%, it starts leaking O₂.", "Rochas pontiagudas: contorne quando der. O habitat e o rover reparam o traje.": "Sharp rocks: go around them when you can. The habitat and the rover repair the suit.", "DESCOBERTA": "DISCOVERY", "+ GUIA · EXTRA": "+ GUIDE · EXTRA", ": entrada extra registrada no Guia.": ": extra entry recorded in the Guide.", "SIGA A ORDEM: ": "FOLLOW THE ORDER: ", "ENTRADA · ESCUDO TÉRMICO": "ENTRY · HEAT SHIELD", "PARAQUEDAS": "PARACHUTE", "DESCIDA PROPULSADA": "POWERED DESCENT", "POUSO CONFIRMADO": "TOUCHDOWN CONFIRMED", " km/h (aprox.)": " km/h (approx.)", "O₂, BATERIA E TRAJE OK": "O₂, BATTERY AND SUIT OK", "SEM BATERIA: CAMADAS DESLIGADAS": "NO BATTERY: LAYERS OFF", "Bateria do traje abaixo de 30%. Camadas de dados gastam energia: ligue só quando precisar.": "Suit battery below 30%. Data layers drain power: turn them on only when you need them.", "Energia e poeira: o Opportunity, movido a energia solar, parou após a tempestade de poeira de 2018.": "Power and dust: Opportunity, a solar-powered rover, stopped after the 2018 dust storm.", "PARTÍCULAS CHEGARAM": "PARTICLES HAVE ARRIVED", "O₂ esgotado": "O₂ depleted", "Traje sem integridade": "Suit integrity lost", ". EVA abortada: o Tatu trouxe você de volta ao habitat.": ". EVA aborted: Tatu brought you back to the habitat.", "Lição: planeje a rota pela reserva de oxigênio e use o rover pressurizado para recarregar.": "Lesson: plan your route by your oxygen reserve and use the pressurized rover to refill.", "Amostra a bordo? Então volte para o habitat, sem desvios.": "Sample on board? Then head back to the habitat, no detours.", "Objetivo atual: ": "Current objective: ", ". Siga o Tatu e não gaste bateria à toa.": ". Follow Tatu and don't waste battery.", "Lembre: quem decide a rota é o oxigênio, não a curiosidade.": "Remember: oxygen decides the route, not curiosity.", "Sua dose acumulada hoje: ": "Your accumulated dose today: ", ". Na superfície, o Curiosity mediu em média cerca de 0,64 mSv por dia.": ". On the surface, Curiosity measured an average of about 0.64 mSv per day.", "Seu O₂ está abaixo da metade. Recarregue antes de seguir.": "Your O₂ is below half. Refill before moving on.", "Limpe o traje antes de entrar. A poeira tem percloratos, que são tóxicos.": "Clean your suit before going in. The dust has perchlorates, which are toxic.", "Seu traje está em ": "Your suit is at ", "%. Aqui no rover eu remendo tudo.": "%. Here at the rover I can patch everything.", "O rover pressurizado recarrega O₂, bateria e traje. Use sempre que passar por aqui.": "The pressurized rover refills O₂, battery and suit. Use it whenever you pass by.", "No caminho para o boxwork há rochas pontiagudas. Pedras assim furaram as rodas do Curiosity em 2013.": "On the way to the boxwork there are sharp rocks. Rocks like these punched holes in Curiosity's wheels in 2013.", "FASE 2: DUNAS BAGNOLD": "PHASE 2: BAGNOLD DUNES", "FASE 3: BOXWORK": "PHASE 3: BOXWORK", "VOLTE AO HABITAT": "HEAD BACK TO THE HABITAT", "▶ JOGAR": "▶ PLAY", "Missão hipotética · dados reais da NASA<br>Z / A para começar · Cratera Gale · Sol 1": "Hypothetical mission · real NASA data<br>Z / A to start · Gale Crater · Sol 1", "IDIOMA": "LANGUAGE", "ANKERONA · MISSÃO MARTE": "ANKERONA · MISSION MARS", "CONTAGEM PARA O LANÇAMENTO": "LAUNCH COUNTDOWN", "B: PULAR": "B: SKIP", "7 MINUTOS DE TERROR": "7 MINUTES OF TERROR", "ENTRADA": "ENTRY", "O sinal leva minutos para chegar à Terra. Ninguém pode intervir a tempo: tudo é automático.": "The signal takes minutes to reach Earth. No one can step in in time: everything is automatic.", "GUIA DE CAMPO": "FIELD GUIDE", "◀ ▶ NAVEGAR · B FECHAR": "◀ ▶ BROWSE · B CLOSE", "FOTO REAL": "REAL PHOTO", "Foto real da NASA: ": "Real NASA photo: ", "DADO REAL ·": "REAL DATA ·", "De volta ao habitat, Ana escreve a última página do Guia e a envia para a Terra.": "Back at the habitat, Ana writes the last page of the Guide and sends it to Earth.", "“Vocês vão ler isto daqui a alguns anos. Tudo o que aprendi está nestas páginas: o lago, a areia, o Sol, as pedras.”": "“You will read this a few years from now. Everything I learned is in these pages: the lake, the sand, the Sun, the rocks.”", "“Não fui longe sozinha. Os robôs vieram antes e deixaram o caminho marcado.”": "“I didn't get this far alone. The robots came first and marked the way.”", "“Agora o caminho é de vocês.”": "“Now the way is yours.”", "GUIA": "GUIDE", "EXTRAS": "EXTRAS", "DOSE": "DOSE", "O₂ MÍNIMO": "MIN O₂", "VER GUIA": "VIEW GUIDE", "JOGAR DE NOVO": "PLAY AGAIN", "ABRIGO JÁ! PARTÍCULAS EM ": "TAKE SHELTER! PARTICLES IN ", "ABRIGADA · EVENTO: ": "SHELTERED · EVENT: ", "EXPOSTA! VÁ AO ABRIGO · ": "EXPOSED! GET TO SHELTER · ", "Evento encerrado. Dose recebida durante o alerta: ": "Event over. Dose received during the alert: ", "comandante": "commander", "médico": "physician", "engenheiro": "engineer", "● ENERGIA": "● POWER"};
Object.assign(EN,{"Uma depressão rasa perto do local de pouso do Curiosity: o rover tinha rodado cerca de 680 m quando chegou lá. Ali aparecem rochas de grão fino, em camadas, que se formaram no fundo de um lago antigo.": "A shallow depression near Curiosity's landing site: the rover had driven about 680 m when it got there. Fine-grained, layered rocks that formed at the bottom of an ancient lake are exposed there.", "Foi a primeira rocha que o Curiosity perfurou, em 2013. Vamos lá descobrir se Gale já teve água capaz de sustentar vida microbiana.": "It was the first rock Curiosity drilled, in 2013. We are going to find out whether Gale once had water able to support microbial life.", "Procure rocha lisa, rachada em placas, com veios claros: é o lamito.": "Look for smooth rock split into plates, with light veins: that is the mudstone.", "NASA/JPL-Caltech · MSL (Grotzinger et al., Science, 2014)": "NASA/JPL-Caltech · MSL (Grotzinger et al., Science, 2014)", "DUNAS BAGNOLD": "BAGNOLD DUNES", "Um campo de dunas escuras na base noroeste do Monte Sharp. O nome homenageia Ralph Bagnold, engenheiro britânico que estudou como o vento forma dunas na Terra.": "A field of dark dunes along the northwest base of Mount Sharp. It is named after Ralph Bagnold, a British engineer who studied how wind shapes dunes on Earth.", "São dunas ativas: o vento ainda as move. Em 2015 e 2016, o Curiosity fez ali a primeira visita de perto a dunas ativas fora da Terra. O caminho até o Monte Sharp passa por elas.": "They are active dunes: the wind still moves them. In 2015 and 2016, Curiosity made the first close-up visit to active dunes beyond Earth there. The way to Mount Sharp goes through them.", "Areia escura com ondulações. Ela é fofa: contorne quando puder.": "Dark sand with ripples. It is soft: go around it when you can.", "NASA/JPL-Caltech · MSL Curiosity, campanha das Dunas Bagnold (2015–2016)": "NASA/JPL-Caltech · MSL Curiosity, Bagnold Dunes campaign (2015–2016)", "FORMAÇÕES BOXWORK": "BOXWORK FORMATIONS", "Redes de cristas que se cruzam na encosta do Monte Sharp, visíveis até da órbita. Água subterrânea deixou minerais nas fraturas da rocha, e a erosão removeu o resto.": "Networks of crisscrossing ridges on the slope of Mount Sharp, visible even from orbit. Groundwater left minerals in the rock's fractures, and erosion removed the rest.", "Mostram que ainda corria água sob o solo depois que os lagos secaram, o que pode ter estendido o tempo em que Gale era habitável. O Curiosity chegou a elas em 2025.": "They show that water still flowed underground after the lakes dried up, which may have extended the time Gale was habitable. Curiosity reached them in 2025.", "Cristas em relevo formando \"caixas\". A amostra da missão é coletada ali.": "Raised ridges forming \"boxes\". The mission sample is collected there.", "NASA/JPL-Caltech · MSL Curiosity (2025)": "NASA/JPL-Caltech · MSL Curiosity (2025)", "ABRIGO": "SHELTER", "Um evento de partículas solares está a caminho: prótons de alta energia lançados pelo Sol.": "A solar particle event is on its way: high-energy protons thrown out by the Sun.", "As paredes do habitat e do rover pressurizado reduzem a dose. Do lado de fora, o traje protege pouco.": "The walls of the habitat and the pressurized rover reduce the dose. Outside, the suit offers little protection.", "Chegue perto do rover ou do habitat e aperte A (ou toque nele) para entrar.": "Get close to the rover or the habitat and press A (or tap it) to go in.", "NASA/JPL · MSL RAD (Hassler et al., Science, 2014)": "NASA/JPL · MSL RAD (Hassler et al., Science, 2014)", "HABITAT": "HABITAT", "A base da missão, onde a tripulação vive e trabalha.": "The mission base, where the crew lives and works.", "A amostra precisa voltar para ser analisada e registrada. Fechar o Guia de Campo é o objetivo final da missão.": "The sample has to come back to be analyzed and logged. Completing the Field Guide is the mission's final goal.", "Chegue perto da escada do habitat.": "Walk up to the habitat ladder.", "Missão fictícia baseada em dados reais da NASA": "Fictional mission based on real NASA data", "ALVO ATUAL": "CURRENT TARGET", "O QUE É": "WHAT IT IS", "POR QUE IR": "WHY GO", "O QUE PROCURAR": "WHAT TO LOOK FOR", "Fonte: ": "Source: ", "O que é? Toque no alvo no topo da tela ou abra o Tatu.": "What is it? Tap the target at the top of the screen or open Tatu.", "ROVER PRESSURIZADO": "PRESSURIZED ROVER", "DENTRO DO ": "INSIDE THE ", "PARTÍCULAS A CAMINHO": "PARTICLES ON THE WAY", "EVENTO SOLAR LÁ FORA": "SOLAR EVENT OUTSIDE", "EVENTO ENCERRADO · A: SAIR": "EVENT OVER · A: GO OUT", "A: SAIR (AINDA HÁ RISCO LÁ FORA)": "A: GO OUT (STILL RISKY OUTSIDE)", "A: ENTRAR": "A: GO IN", "A: SAIR DO ABRIGO": "A: LEAVE THE SHELTER", "AINDA HÁ PARTÍCULAS LÁ FORA": "PARTICLES ARE STILL OUT THERE", "CHEGUE MAIS PERTO PARA ENTRAR": "GET CLOSER TO GO IN", "Chegue perto do abrigo e aperte A para entrar. A tripulação entra com você.": "Get close to a shelter and press A to go in. The crew comes in with you."});
Object.assign(EN,{'A: PULAR':'A: SKIP','RUÍDO NOS SENSORES: CAMADAS FORA DO AR':'SENSOR NOISE: DATA LAYERS DOWN',
'As partículas chegaram e você está do lado de fora! Elas também afetam eletrônicos: em 2003, uma tempestade solar danificou o instrumento MARIE, da sonda Mars Odyssey. Suas camadas de dados vão falhar aqui fora.':'The particles are here and you are outside! They also hit electronics: in 2003, a solar storm damaged the MARIE instrument on the Mars Odyssey orbiter. Your data layers will fail out here.',
'Dose do evento: ':'Event dose: ','. Isso já equivale a cerca de ':'. That already equals about ',' dias na superfície de Marte, pela média do RAD (0,64 mSv por dia).':' days on the surface of Mars, by RAD\'s average (0.64 mSv per day).',
'Já passou de 50 mSv: mais de 8% do limite de carreira de um astronauta da NASA, que é de 600 mSv. O risco é de longo prazo, principalmente câncer. Entre num abrigo agora!':'You are past 50 mSv: more than 8% of a NASA astronaut\'s career limit of 600 mSv. The risk is long term, mainly cancer. Get to a shelter now!',
'Dose acima do limite desta missão. EVA abortada: o Tatu vai levar você ao habitat agora.':'Dose above this mission\'s limit. EVA aborted: Tatu will take you to the habitat now.',
', cerca de ':', about ',' dias na superfície.':' days on the surface.','Evacuação.':'Evacuation.','O Tatu leva você às pressas para o habitat, o abrigo mais blindado da base.':'Tatu rushes you to the habitat, the best-shielded shelter at the base.',
'EXPOSIÇÃO NO EVENTO':'EVENT EXPOSURE','DO LIMITE DA NASA':'OF NASA\'S LIMIT','ALERTA: TRAJE COMPROMETIDO':'ALERT: SUIT BREACHED','ALERTA: O₂ ESGOTADO':'ALERT: O₂ DEPLETED','Tudo escurece.':'Everything goes dark.',
'O Tatu detecta a falha, envia o alerta e leva você de volta ao habitat.':'Tatu detects the failure, sends the alert and brings you back to the habitat.',
'Calma, Dra. Selari. Você está no habitat. Respire devagar: seus sinais estão voltando ao normal.':'Easy, Dr. Selari. You are in the habitat. Breathe slowly: your vital signs are coming back to normal.',
'Lição: contorne as rochas pontiagudas e repare o traje no rover ou no habitat antes que a integridade caia.':'Lesson: go around sharp rocks and repair the suit at the rover or the habitat before its integrity drops.','O TATU ESTÁ VOLTANDO ATÉ VOCÊ':'TATU IS COMING BACK FOR YOU','VISÃO AMPLA':'WIDE VIEW','VISÃO NORMAL':'NORMAL VIEW','GUIA DE CAMPO':'FIELD GUIDE','CLIMA AGORA':'WEATHER NOW','RADIAÇÃO':'RADIATION','OUVIR O VENTO':'LISTEN TO THE WIND','MAPA DA CRATERA':'CRATER MAP',
'▲ ▼ ESCOLHER · A ABRIR · B FECHAR':'▲ ▼ CHOOSE · A OPEN · B CLOSE','B VOLTAR':'B BACK','A TOCAR DE NOVO · B VOLTAR':'A PLAY AGAIN · B BACK','TATU · DADOS DA MISSÃO':'TATU · MISSION DATA','câmeras · sensores · microfone':'cameras · sensors · microphone',
'AR':'AIR','SOLO':'GROUND','PRESSÃO':'PRESSURE','ALTO':'HIGH','MÉDIO':'MEDIUM','BAIXO':'LOW','DOSE HOJE':'DOSE TODAY','TAXA: ALTA (EVENTO SOLAR)':'RATE: HIGH (SOLAR EVENT)','TAXA: NORMAL':'RATE: NORMAL',
'Valores simulados. O REMS, estação meteorológica do Curiosity, mede ar, solo, pressão, umidade, vento e UV desde 2012. Em Gale, a diferença entre o dia e a noite pode passar de 60 °C, e a pressão fica perto de 0,8% da terrestre.':'Simulated values. REMS, Curiosity\'s weather station, has measured air, ground, pressure, humidity, wind and UV since 2012. In Gale, the gap between day and night can exceed 60 °C, and the pressure is about 0.8% of Earth\'s.',
'Fonte: NASA/JPL-Caltech · MSL REMS (Gómez-Elvira et al., 2012)':'Source: NASA/JPL-Caltech · MSL REMS (Gómez-Elvira et al., 2012)',
'Na superfície, o RAD do Curiosity mediu em média cerca de 0,64 mSv por dia. Num evento de partículas solares a dose sobe rápido: o abrigo é o habitat ou o rover pressurizado.':'On the surface, Curiosity\'s RAD measured an average of about 0.64 mSv per day. In a solar particle event the dose climbs fast: shelter in the habitat or the pressurized rover.',
'Fonte: NASA/JPL · MSL RAD (Hassler et al., Science, 2014)':'Source: NASA/JPL · MSL RAD (Hassler et al., Science, 2014)',
'Som simulado do vento. Em 2021, os microfones do rover Perseverance gravaram os primeiros sons de Marte. A atmosfera fina abafa o som, que viaja a cerca de 240 m/s (na Terra, 343 m/s).':'Simulated wind sound. In 2021, the Perseverance rover\'s microphones recorded the first sounds of Mars. The thin air muffles sound, which travels at about 240 m/s (343 m/s on Earth).',
'Fonte: NASA/JPL-Caltech · Perseverance SuperCam (Maurice et al., Nature, 2022)':'Source: NASA/JPL-Caltech · Perseverance SuperCam (Maurice et al., Nature, 2022)',
'CRATERA GALE · MAPA ESQUEMÁTICO':'GALE CRATER · SCHEMATIC MAP','Monte Sharp':'Mount Sharp','Pouso 2012':'2012 landing',
'154 km de diâmetro · Monte Sharp: cerca de 5,5 km acima do piso · 5,4° S, 137,8° L':'154 km across · Mount Sharp: about 5.5 km above the floor · 5.4° S, 137.8° E',
'Esquema com base na imagem PIA15687 (NASA/JPL-Caltech/ESA/DLR/FU Berlin/MSSS). Posições aproximadas. B: VOLTAR':'Schematic based on image PIA15687 (NASA/JPL-Caltech/ESA/DLR/FU Berlin/MSSS). Approximate positions. B: BACK',
'O Tatu guarda os dados da missão: câmeras, sensores e microfone. Aperte A ou toque no ícone acima dele.':'Tatu stores the mission data: cameras, sensors and a microphone. Press A or tap the icon above it.','NOVA CAMADA: ':'NEW LAYER: ',' · USE CAMADA':' · USE LAYER'});
const tr=s=>LANG==='en'&&typeof s==='string'&&EN[s]!==undefined?EN[s]:s;
const $=s=>document.querySelector(s);
const cv=$('#cv');let g=cv.getContext('2d');
g.imageSmoothingEnabled=false;
const SW=160, SH=144, T=16, MW=96, MH=72;
const P=['#1a0d0b','#4a2216','#8f3e1f','#c96f3b','#f0c08a','#f7ead8'];
const ACC={clay:'#6fb0a0',sulf:'#e3d06a',alert:'#ff6a45',safe:'#9ad48a',soft:'#ffd27a'};

/* ---------------- noise ---------------- */
function hash(x,y,s){let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296}
function vn(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}

/* ---------------- map ---------------- */
const R=0,ROCK=1,CLIFF=2,SAND=3,HAB=4,ROV=5,SHARP=6;
const tile=new Uint8Array(MW*MH), elev=new Float32Array(MW*MH), band=new Uint8Array(MW*MH);
const I=(x,y)=>y*MW+x;
const inMap=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
const HABP={x:9,y:59,w:3,h:3}, ROVP={x:60,y:48,w:3,h:2};
const START={x:12,y:61};
const POIS=[
  {id:'ykb',name:'Yellowknife Bay',x:30,y:50},
  {id:'bag',name:'Dunas Bagnold',x:50,y:34},
  {id:'box',name:'Formações boxwork',x:82,y:12}
];
const SECRETS=[
  {id:'erosion',x:20,y:42,from:{x:24,y:56},say:'Uma laje lisa, polida pelo vento. Para a escala de Marte, esta rocha ficou exposta há pouquíssimo tempo.'},
  {id:'namib',x:42,y:24,from:{x:50,y:34},say:'Ao lado, a face de uma duna enorme, lisa e inclinada. É a Duna Namib.'},
  {id:'sulfur',x:88,y:28,from:{x:76,y:22},say:'Sua bota quebrou uma pedra, e dentro dela há cristais amarelos! Igual ao que o Curiosity encontrou em 2024.'}
];
const DEVILS=[{x:40,y:58},{x:72,y:44},{x:20,y:30}];
const CREW=[
  {id:'ruiz',name:'CMDTE. KELI HASTOR',role:'comandante',x:13,y:60,col:'#ff6a45'},
  {id:'iara',name:'DR. NATAN JONAS',role:'médico',x:9,y:62,col:'#9ad48a'},
  {id:'kenji',name:'ENG. ROSSI BROOK',role:'engenheiro',x:59,y:49,col:'#e3d06a'}
];
const PATH=new Set();
function genMap(){
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const e=0.5*(x/(MW-1))+0.5*((MH-1-y)/(MH-1))+0.3*(vn(x/12,y/12,3)-0.5)+0.1*(vn(x/4,y/4,8)-0.5);
    elev[I(x,y)]=e; band[I(x,y)]=Math.max(0,Math.min(7,Math.floor(e*8)));
  }
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    let t=R; const e=elev[I(x,y)];
    const sx=50+(vn(x/8,y/8,5)-0.5)*12;
    if(y>=20&&y<=50&&Math.abs(x-sx)<7&&vn(x/5,y/5,9)>0.26) t=SAND;
    if(t===R){
      const b=band[I(x,y)];
      const edge=y+1<MH&&band[I(x,y+1)]<b;
      if(edge&&e>0.56) t=CLIFF;
      else if(hash(x,y,11)<0.06) t=ROCK;
    }
    if(x===0||y===0||x===MW-1||y===MH-1) t=CLIFF;
    tile[I(x,y)]=t;
  }
  const clear=(x,y)=>{if(inMap(x,y)&&x>0&&y>0&&x<MW-1&&y<MH-1){const t=tile[I(x,y)];if(t===ROCK||t===CLIFF)tile[I(x,y)]=R}};
  const carve=(a,b,s)=>{let x=a.x,y=a.y,k=0;clear(x,y);PATH.add(I(x,y));
    while((x!==b.x||y!==b.y)&&k<400){k++;const dx=b.x-x,dy=b.y-y;
      const hor=dy===0||(dx!==0&&hash(x+k,y,s)<Math.abs(dx)/(Math.abs(dx)+Math.abs(dy)));
      if(hor)x+=Math.sign(dx);else y+=Math.sign(dy);clear(x,y);PATH.add(I(x,y))}};
  const way=[START,{x:24,y:56},POIS[0],{x:40,y:44},POIS[1],{x:58,y:44},{x:62,y:46},{x:68,y:32},{x:76,y:22},POIS[2]];
  for(let i=0;i<way.length-1;i++)carve(way[i],way[i+1],40+i);
  SECRETS.forEach((s,i)=>carve(s.from,s,70+i));
  for(let y=24;y<=40;y++)for(let x=62;x<=74;x++){if(tile[I(x,y)]===R&&vn(x/3,y/3,31)>0.45)tile[I(x,y)]=SHARP}
  const ring=(cx,cy,w,h,r)=>{for(let y=cy-r;y<cy+h+r;y++)for(let x=cx-r;x<cx+w+r;x++)clear(x,y)};
  POIS.forEach(p=>ring(p.x,p.y,1,1,1));
  ring(HABP.x,HABP.y,HABP.w,HABP.h,2); ring(ROVP.x,ROVP.y,ROVP.w,ROVP.h,1);
  for(let y=HABP.y;y<HABP.y+HABP.h;y++)for(let x=HABP.x;x<HABP.x+HABP.w;x++)tile[I(x,y)]=HAB;
  for(let y=ROVP.y;y<ROVP.y+ROVP.h;y++)for(let x=ROVP.x;x<ROVP.x+ROVP.w;x++)tile[I(x,y)]=ROV;
  // large 2x2 boulders, kept off the route and away from key spots
  const keep=[START,...POIS,...SECRETS,...CREW,{x:HABP.x+1,y:HABP.y+1},{x:ROVP.x+1,y:ROVP.y}];
  for(let y=2;y<MH-3;y++)for(let x=2;x<MW-3;x++){if(hash(x,y,121)>=0.02)continue;
    const cells=[[x,y],[x+1,y],[x,y+1],[x+1,y+1]];
    if(!cells.every(([cx,cy])=>tile[I(cx,cy)]===R&&!PATH.has(I(cx,cy))))continue;
    if(keep.some(q=>Math.abs(q.x-x)<5&&Math.abs(q.y-y)<5))continue;
    if(BIG.some(q=>Math.abs(q.x-x)<3&&Math.abs(q.y-y)<3))continue;
    BIG.push({x,y,k:Math.floor(hash(x,y,122)*4)});cells.forEach(([cx,cy])=>{tile[I(cx,cy)]=ROCK;BIGC.add(I(cx,cy))})}
  // a lone cliff tile reads as a box: turn it into a boulder instead
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=I(x,y);if(tile[i]!==CLIFF)continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].every(([dx,dy])=>tile[I(x+dx,y+dy)]!==CLIFF))tile[i]=ROCK}
  // active dunes bury rocks: keep boulders and pebbles off the sand and its rim
  const nearSand=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inMap(x+dx,y+dy)&&tile[I(x+dx,y+dy)]===SAND)return true;return false};
  for(let k=BIG.length-1;k>=0;k--){const q=BIG[k];if([[0,0],[1,0],[0,1],[1,1]].some(([dx,dy])=>nearSand(q.x+dx,q.y+dy))){[[0,0],[1,0],[0,1],[1,1]].forEach(([dx,dy])=>{const i=I(q.x+dx,q.y+dy);tile[i]=R;BIGC.delete(i)});BIG.splice(k,1)}}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=I(x,y);if(tile[i]===ROCK&&!BIGC.has(i)&&nearSand(x,y))tile[i]=R}
  // small rocks are only decoration: you can step over them
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=I(x,y);if(tile[i]===ROCK&&!BIGC.has(i)&&hash(x,y,91)<0.4){tile[i]=R;PEB.add(i)}}
}
const BIG=[],BIGC=new Set(),PEB=new Set();
const walkable=(x,y)=>inMap(x,y)&&(tile[I(x,y)]===R||tile[I(x,y)]===SAND||tile[I(x,y)]===SHARP);

/* ---------------- pixel helpers ---------------- */
function px(c,x,y,w=1,h=1,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
let VW=160,VH=144;
function vignette(col,a){for(let k=0;k<6;k++){g.globalAlpha=a*(1-k/6);g.fillStyle=col;g.fillRect(k*2,k*2,VW-k*4,2);g.fillRect(k*2,VH-k*2-2,VW-k*4,2);g.fillRect(k*2,k*2,2,VH-k*4);g.fillRect(VW-k*2-2,k*2,2,VH-k*4)}g.globalAlpha=1}
function disc(c,cx,cy,r,col){c.fillStyle=col;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*0.6)c.fillRect(cx+x,cy+y,1,1)}
function planet(c,cx,cy,r,c1,c2,c3){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=x*x+y*y;if(d>r*r+r*0.6)continue;
  const k=(x*0.8+y*0.45)/r+(((x+y)&1)?0.07:-0.07);c.fillStyle=k>0.42?c3:(k>0.0?c2:c1);c.fillRect(cx+x,cy+y,1,1)}}

/* ---------------- prerender map ---------------- */
const base=document.createElement('canvas');base.width=MW*T;base.height=MH*T;const b=base.getContext('2d');
const layers={};
b.imageSmoothingEnabled=false;
const AI={};
function loadArt(){return Promise.all(Object.entries(ART).map(([k,src])=>new Promise(r=>{const im=new Image();im.onload=()=>{AI[k]=im;r()};im.onerror=()=>r();im.src=src})))}
// while exploring, the screen has 2 canvas pixels per game pixel: sprites with an @2 version use that extra detail
let HD=false;
function blit(c,k,x,y,flip){const im=AI[k];if(!im)return;const src=(HD&&c===g&&AI[k+'@2'])||im,w=im.width,h=im.height;
  if(flip){c.save();c.translate(x+w,y);c.scale(-1,1);c.drawImage(src,0,0,w,h);c.restore()}else c.drawImage(src,x,y,w,h)}
const isSand=(x,y)=>!inMap(x,y)||tile[I(x,y)]===SAND;
const MUD=new Uint8Array(MW*MH),STR=new Uint8Array(MW*MH);
function regions(){for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=I(x,y);if(tile[i]!==R)continue;
  const dk=Math.hypot(x-POIS[0].x,y-POIS[0].y);
  const m=0.55*vn(x/4,y/4,44)+0.3*vn(x/9,y/9,47)+0.6*(1-dk/13);
  if(dk<17&&m>0.83)MUD[i]=1;else if(0.6*vn(x/6,y/6,46)+0.3*vn(x/11,y/11,48)+(elev[i]-0.8)*2.2>0.62)STR[i]=1}
  // drop single stray tiles so the outline stays smooth
  for(const A of [MUD,STR])for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=I(x,y),n=A[I(x+1,y)]+A[I(x-1,y)]+A[I(x,y+1)]+A[I(x,y-1)];if(A[i]&&n<=1)A[i]=0;else if(!A[i]&&n>=3&&tile[i]===R)A[i]=1}
  // the layered strata are the mountain's own outcrops: no separate cliff boxes inside them
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=I(x,y);if(tile[i]!==CLIFF)continue;
    if([I(x+1,y),I(x-1,y),I(x,y+1),I(x,y-1)].filter(j=>STR[j]).length>=2){tile[i]=R;STR[i]=1}}
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=I(x,y);if(tile[i]!==ROCK)continue;
    let m=0,t=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const j=I(x+dx,y+dy);m+=MUD[j];t+=STR[j]}
    if(m>=2)MUDX[i]=1;else if(t>=2)STRX[i]=1}}
const MUDX=new Uint8Array(MW*MH),STRX=new Uint8Array(MW*MH);
const inMud=(x,y)=>!inMap(x,y)||MUD[I(x,y)]===1, inStr=(x,y)=>!inMap(x,y)||STR[I(x,y)]===1;
// pick the 3x3 edge tile from the four orthogonal neighbours
function edgeKey(set,inR,x,y){const n=inR(x,y-1),s=inR(x,y+1),w=inR(x-1,y),e=inR(x+1,y);
  const r=!n&&s?0:(!s&&n?2:1),c=!w&&e?0:(!e&&w?2:1);return `${set}_${r}${c}`}
function innerKey(set,inR,x,y){if(!inR(x+1,y+1))return set+'_iSE';if(!inR(x-1,y+1))return set+'_iSW';if(!inR(x+1,y-1))return set+'_iNE';if(!inR(x-1,y-1))return set+'_iNW';return null}
function hexf(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
const TAU=Math.PI*2;
// 64x64 textures that wrap, so neighbouring tiles always continue the same pattern
function texCanvas(fn){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),im=x.createImageData(64,64);
  for(let y=0;y<64;y++)for(let x_=0;x_<64;x_++){const r=fn(x_,y),o=(y*64+x_)*4;im.data[o]=r[0];im.data[o+1]=r[1];im.data[o+2]=r[2];im.data[o+3]=255}x.putImageData(im,0,0);return c}
const SANDPAL=['#401d1b','#4f231f','#5e2a23','#73352a','#8d4333'].map(hexf);
// Bagnold dark basaltic sand: large ripples with small ripples on top, both creeping downwind
const RIP=[0,1,2,3].map(fr=>texCanvas((x,y)=>{const ph=fr/4*TAU;
  const big=Math.sin(TAU*(2*x+3*y)/64+0.9*Math.sin(TAU*x/64)+ph),small=Math.sin(TAU*(7*x+10*y)/64+1.1*Math.sin(TAU*2*y/64)+ph*3);
  const v=big*0.72+small*0.28+(hash(x,y,5)<0.05?0.35:0);return SANDPAL[v>0.8?4:v>0.42?3:v>-0.12?2:v>-0.62?1:0]}));
// Sheepbed-like mudstone: plates split by cracks, a few light mineral veins
const MSEED=[...Array(34)].map((_,k)=>({x:hash(k,1,71)*64,y:hash(k,2,71)*64,c:Math.floor(hash(k,3,71)*4)}));
const MUDPAL=['#c98252','#d7905a','#dc955d','#cf8a55'].map(hexf),MCRACK=hexf('#7d4430'),MBEV=hexf('#ae6945'),MHI=hexf('#e8b98c'),MVEIN=hexf('#e6be92');
const MUDT=texCanvas((x,y)=>{let d1=1e9,d2=1e9,c=0;for(const p of MSEED){let dx=Math.abs(x-p.x),dy=Math.abs(y-p.y);dx=Math.min(dx,64-dx);dy=Math.min(dy,64-dy);const d=Math.hypot(dx,dy);if(d<d1){d2=d1;d1=d;c=p.c}else if(d<d2)d2=d}
  const e=d2-d1;if(e<1.1)return MCRACK;if(e<2.1)return (x+y)&1?MBEV:MUDPAL[c];
  if(Math.abs(Math.sin(TAU*(3*x+y)/64+2*Math.sin(TAU*y/64)))<0.035&&c===0)return MVEIN;
  return MUDPAL[c]});
// Mount Sharp sulfate strata: thin layers that follow the slope
const STRPAL=['#b5602f','#c17040','#a9552b','#cf8550','#b0592d'].map(hexf);
const STRT=texCanvas((x,y)=>{const v=y+2.2*Math.sin(TAU*x/64)+0.8*Math.sin(TAU*3*x/64);const k=Math.floor(((v%64)+64)%64/3);return STRPAL[(k*7+Math.floor(k/3))%5]});
const SANDMASK=document.createElement('canvas');
// a smooth field over tile membership plus a little noise gives organic borders that never break at tile edges
// south-facing walls drawn as one continuous strip that bends smoothly where the contour steps a row
function drawWalls(){const isC=(x,y)=>inMap(x,y)&&x>0&&x<MW-1&&tile[I(x,y)]===CLIFF,seen=new Uint8Array(MW*MH);
  const nextR=(x,y)=>isC(x+1,y)?y:isC(x+1,y-1)?y-1:isC(x+1,y+1)?y+1:null,hasL=(x,y)=>isC(x-1,y)||isC(x-1,y-1)||isC(x-1,y+1);
  const col=(k,sx,X,Y)=>b.drawImage(AI[k],sx,0,1,32,X,Y,1,32);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(!isC(x,y)||seen[I(x,y)]||hasL(x,y)&&!seen[I(x,y)]&&false)continue;if(hasL(x,y))continue;
    // follow the wall to the right
    const run=[];let cx=x,cy=y;while(cx<MW&&isC(cx,cy)&&!seen[I(cx,cy)]){seen[I(cx,cy)]=1;run.push(cy);const n=nextR(cx,cy);if(n===null)break;cx++;cy=n}
    const X0=x*T,N=run.length;
    if(N===1){b.drawImage(AI.cw_one2,X0-8,run[0]*T-6);continue}
    // height per pixel column, smoothed so a one-row step becomes a long gentle curve like the art
    const L=N*T,raw=new Float32Array(L),h=new Float32Array(L);for(let k=0;k<L;k++)raw[k]=run[k>>4]*T;
    const R=14;for(let k=0;k<L;k++){let s=0,c=0;for(let j=-R;j<=R;j++){const q=Math.min(L-1,Math.max(0,k+j));s+=raw[q];c++}h[k]=s/c}
    for(let k=0;k<L;k++){const X=X0+k,Y=Math.round(h[k])-6,tx=X>>5;
      if(k<16)col('cw_l2',k,X,Y);else if(k>=L-16)col('cw_r2',16+(k-(L-16)),X,Y);else col('cw_m'+Math.floor(hash(tx,run[k>>4],141)*3)+'2',X&31,X,Y)}}}
function paintGround(){const W=MW*T,H=MH*T,im=b.getImageData(0,0,W,H),d=im.data;
  const mk=SANDMASK;mk.width=W;mk.height=H;const mx=mk.getContext('2d'),mim=mx.createImageData(W,H),md=mim.data;
  const RIPD=RIP[0].getContext('2d').getImageData(0,0,64,64).data,MUDD=MUDT.getContext('2d').getImageData(0,0,64,64).data,STRD=STRT.getContext('2d').getImageData(0,0,64,64).data;
  const FS=new Float32Array(MW*MH),FM=new Float32Array(MW*MH),FT=new Float32Array(MW*MH);
  for(let i=0;i<MW*MH;i++){FS[i]=tile[i]===SAND?1:0;FM[i]=MUD[i]||MUDX[i];FT[i]=STR[i]||STRX[i]}
  const can=(tx,ty,kind)=>{if(!inMap(tx,ty))return false;const t=tile[I(tx,ty)],i=I(tx,ty);return kind===0?(t===SAND||t===R):(t===R||(t===ROCK&&(MUDX[i]||STRX[i])))};
  const field=(F,X,Y,s)=>bil(F,(X+0.5)/T-0.5,(Y+0.5)/T-0.5)+(vn(X/9,Y/9,s)-0.5)*0.34+(vn(X/3,Y/3,s+1)-0.5)*0.12;
  // blend: inside a narrow band the two grounds mix through ordered dithering, like dust settling on the edge
  const mixPix=(o,q,src,v,lo,hi,X,Y)=>{const t=(v-lo)/(hi-lo),by=BAYER[(Y&3)*4+(X&3)];if(t>by){d[o]=src[q];d[o+1]=src[q+1];d[o+2]=src[q+2];return true}return false};
  const dim=(o,k)=>{d[o]=d[o]*k|0;d[o+1]=d[o+1]*k|0;d[o+2]=d[o+2]*k|0};
  for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){const tx=(X/T)|0,ty=(Y/T)|0,o=(Y*W+X)*4,q=((Y&63)*64+(X&63))*4;
    if(can(tx,ty,0)){const v=field(FS,X,Y,31);
      if(v>0.58){d[o]=RIPD[q];d[o+1]=RIPD[q+1];d[o+2]=RIPD[q+2];md[o+3]=255;continue}
      if(v>0.42){if(mixPix(o,q,RIPD,v,0.42,0.58,X,Y)){md[o+3]=255;continue}}
      if(v>0.36&&!PEB.has(I(tx,ty)))dim(o,0.86)}
    if(!can(tx,ty,1))continue;
    let v=field(FM,X,Y,33);
    if(v>0.6){d[o]=MUDD[q];d[o+1]=MUDD[q+1];d[o+2]=MUDD[q+2];continue}
    if(v>0.44){if(mixPix(o,q,MUDD,v,0.44,0.6,X,Y))continue}
    if(v>0.38&&field(FM,X-2,Y-2,33)>0.5){dim(o,0.82);continue}
    v=field(FT,X,Y,35);
    if(v>0.6){d[o]=STRD[q];d[o+1]=STRD[q+1];d[o+2]=STRD[q+2];continue}
    if(v>0.44){if(mixPix(o,q,STRD,v,0.44,0.6,X,Y))continue}
    if(v>0.38&&field(FT,X-2,Y-2,35)>0.5)dim(o,0.82)}
  b.putImageData(im,0,0);mx.putImageData(mim,0,0);
  // rocks sit on top of the bedrock
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=I(x,y);if(tile[i]===ROCK&&!BIGC.has(i)&&(MUDX[i]||STRX[i]))blit(b,'bs'+Math.floor(hash(x,y,126)*4),x*T,y*T,hash(x,y,92)<0.5)}}
function drawGround(x,y){const X=x*T,Y=y*T,h=hash(x,y,83);
  // ventifacts: wind-carved rocks, more common around the polished slab
  const ero=SECRETS[0],near=Math.hypot(x-ero.x,y-ero.y)<9,hv=hash(x,y,123);
  if(hv<(near?0.3:0.035)){blit(b,'vent'+Math.floor(hash(x,y,124)*4),X,Y,hash(x,y,84)<0.5);return}
  const k=h<0.45?'reg3':h<0.72?'reg0':h<0.9?'reg1':'reg2';
  blit(b,k,X,Y,hash(x,y,84)<0.5)}
function renderBase(){regions();
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=I(x,y),t=tile[i],X=x*T,Y=y*T;
    if(t===SAND)drawGround(x,y);
    else if(t===CLIFF)drawGround(x,y);
    else{
      drawGround(x,y);
      if(t===SHARP){const h=hash(x,y,89),fl=hash(x,y,90)<0.5;
        if(h<0.45)blit(b,'rock_sharp',X,Y+2,fl);else if(h<0.55)blit(b,'rock_s',X,Y+2,fl);else blit(b,'vfx'+Math.floor(hash(x,y,125)*4),X,Y+6,fl)}
      else if(t===ROCK&&!BIGC.has(i)){const h=hash(x,y,91),fl=hash(x,y,92)<0.5;
        if(h<0.3)blit(b,'rock_m',X+1,Y+4,fl);else if(h<0.4)blit(b,'rock_s',X+1,Y+4,fl);else blit(b,'bs'+Math.floor(hash(x,y,126)*4),X,Y,fl)}
      if(PEB.has(i)&&!MUD[i]&&!STR[i])blit(b,hash(x,y,91)<0.2?'pebg'+Math.floor(hash(x,y,94)*4):'peb'+Math.floor(hash(x,y,95)*4),X+2,Y+6,hash(x,y,92)<0.5);
      else if(t===R&&!MUD[i]&&!STR[i]){const h=hash(x,y,93),dk=Math.hypot(x-POIS[0].x,y-POIS[0].y);
        if(PATH.has(i)&&h<0.2)blit(b,'tracks',X,Y);
        else if(!PATH.has(i)&&h<0.012)blit(b,'crater_m',X,Y+1);
        else if(!PATH.has(i)&&h<0.03)blit(b,'crater_s',X+2,Y+3);
        else if(!PATH.has(i)&&h<0.0306)blit(b,'meteor',X+2,Y+5);
        else if(!PATH.has(i)&&dk<16&&h<0.06)blit(b,'vein',X+1,Y+5,hash(x,y,127)<0.5);
        else if(h<0.11)blit(b,'pebg'+Math.floor(hash(x,y,128)*4),X+1,Y+6,hash(x,y,129)<0.5)}}
  }
  // boxwork ridges at the final target (PIA26559)
  blit(b,'boxwork',POIS[2].x*T-8,POIS[2].y*T-14);
  paintGround();
  drawWalls();
  // large boulders (2x2 tiles)
  BIG.forEach(q=>{const im=AI['bl'+q.k];if(im)blit(b,'bl'+q.k,q.x*T,(q.y+2)*T-im.height,hash(q.x,q.y,130)<0.5)});
  // habitat lander 48x48 (3x3 tiles)
  {const im=AI.lander;if(im)blit(b,'lander',HABP.x*T,(HABP.y+HABP.h)*T-im.height)}
}
function mkLayer(fn){const c=document.createElement('canvas');c.width=MW*T;c.height=MH*T;const l=c.getContext('2d');fn(l);return c}
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+0.5)/16);
function bil(F,u,v){u=Math.max(0,Math.min(MW-1,u));v=Math.max(0,Math.min(MH-1,v));const x0=Math.floor(u),y0=Math.floor(v),x1=Math.min(x0+1,MW-1),y1=Math.min(y0+1,MH-1),fx=u-x0,fy=v-y0;
  return (F[I(x0,y0)]*(1-fx)+F[I(x1,y0)]*fx)*(1-fy)+(F[I(x0,y1)]*(1-fx)+F[I(x1,y1)]*fx)*fy}
const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
// paints a layer at half resolution (2x2 pixels per dot), smooth edges with ordered dithering
function softLayer(fn){const W=MW*8,H=MH*8,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),im=x.createImageData(W,H),d=im.data;
  for(let py=0;py<H;py++)for(let px_=0;px_<W;px_++){const r=fn((px_+0.5)/8-0.5,(py+0.5)/8-0.5,BAYER[(py&3)*4+(px_&3)],px_,py);if(!r)continue;const o=(py*W+px_)*4;d[o]=r[0];d[o+1]=r[1];d[o+2]=r[2];d[o+3]=r[3]}
  x.putImageData(im,0,0);return c}
function ring(l,cx,cy,rx,ry,col){for(let k=0;k<64;k++){const a=k/64*Math.PI*2;if(k%8<6)px(l,Math.round(cx+Math.cos(a)*rx),Math.round(cy+Math.sin(a)*ry),1,1,col)}}
function renderLayers(){
  const BC=['#1a0d0b','#341711','#4f2216','#6e3019','#91431f','#b5602f','#d68a52','#f0c08a'].map(hex),C5=hex(P[5]);
  const up=src=>mkLayer(l=>{l.imageSmoothingEnabled=false;l.drawImage(src,0,0,MW*T,MH*T)});
  // topography: continuous elevation, so contour lines follow the slope instead of tile edges
  const bandAt=(u,v)=>Math.max(0,Math.min(7,Math.floor(bil(elev,u,v)*8)));
  layers.TOPOGRAFIA=up(softLayer((u,v)=>{const b0=bandAt(u,v);
    if(bandAt(u+1/8,v)!==b0||bandAt(u,v+1/8)!==b0)return [...C5,230];return [...BC[b0],150]}));
  // minerals: clays near Yellowknife Bay, sulfates high on Mount Sharp
  const CL=new Float32Array(MW*MH),SU=new Float32Array(MW*MH);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const e=elev[I(x,y)],dd=Math.hypot(x-POIS[0].x,y-POIS[0].y);
    if(dd<14&&vn(x/5,y/5,17)>0.32)CL[I(x,y)]=1;else if(e>0.7&&vn(x/7,y/7,13)>0.38)SU[I(x,y)]=1}
  const CC=hex(ACC.clay),SC_=hex(ACC.sulf),D0=hex(P[0]);
  layers.MINERAIS=up(softLayer((u,v,bay,px_,py)=>{const c=bil(CL,u,v),s_=bil(SU,u,v);
    if(c>bay)return [...CC,(px_+py)%6===0?200:130];if(s_>bay)return [...SC_,(px_+py)%6===0?200:130];return [...D0,90]}));
  // terrain: risk zones with soft edges; single rocks get a ring, not a box
  const SA=new Float32Array(MW*MH),SH_=new Float32Array(MW*MH),CF=new Float32Array(MW*MH);
  for(let i=0;i<MW*MH;i++){SA[i]=tile[i]===SAND?1:0;SH_[i]=tile[i]===SHARP?1:0;CF[i]=tile[i]===CLIFF?1:0}
  const CS=hex(ACC.soft),CO=hex('#ff9a3c'),CA=hex(ACC.alert);
  const ter=softLayer((u,v,bay,px_,py)=>{const a=bil(SA,u,v),sh=bil(SH_,u,v),cf=bil(CF,u,v);
    if(cf>bay)return [...CA,(px_+py)%4===0?190:110];if(sh>bay)return [...CO,(px_-py)%4===0?200:120];if(a>bay)return [...CS,(px_+2*py)%8===0?190:105];return [...D0,70]});
  layers.TERRENO=mkLayer(l=>{l.imageSmoothingEnabled=false;l.drawImage(ter,0,0,MW*T,MH*T);
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=I(x,y);if(tile[i]===ROCK&&!BIGC.has(i))ring(l,x*T+8,y*T+10,7,5,ACC.alert)}
    BIG.forEach(q=>ring(l,q.x*T+16,q.y*T+22,15,9,ACC.alert));
    ring(l,(HABP.x+HABP.w/2)*T,(HABP.y+HABP.h/2)*T+4,HABP.w*T/2+4,HABP.h*T/2+2,ACC.safe);
    ring(l,(ROVP.x+ROVP.w/2)*T,(ROVP.y+ROVP.h/2)*T+4,ROVP.w*T/2+4,ROVP.h*T/2+2,ACC.safe)});
}
const LAYER_INFO={
  MAPA:{chips:[],note:'Vista normal do terreno. Toque em CAMADA para trocar a camada de dados. Cada camada ligada gasta bateria (EN); o MAPA não gasta.'},
  TOPOGRAFIA:{chips:[['#341711','mais baixo'],['#b5602f','médio'],['#f0c08a','mais alto'],['#f7ead8','curva de nível']],
    note:'<strong>Topografia.</strong> Faixas de elevação com curvas de nível. A encosta sobe em direção ao Monte Sharp. Na versão final: modelos de elevação do HiRISE (MRO).'},
  MINERAIS:{chips:[['#6fb0a0','argilominerais'],['#e3d06a','sulfatos']],
    note:'<strong>Minerais.</strong> Argilas indicam água antiga de baixa acidez. As camadas altas do Monte Sharp são ricas em sulfatos. Na versão final: espectros do CRISM (MRO) e análises do Curiosity.'},
  TERRENO:{chips:[['#ffd27a','areia fofa'],['#ff9a3c','rochas pontiagudas'],['#ff6a45','encosta ou rocha'],['#9ad48a','abrigo']],
    note:'<strong>Terreno.</strong> Mostra onde é arriscado pisar e onde se abrigar. Areia fofa gasta mais O₂ e deixa você mais lenta. Rochas pontiagudas danificam o traje.'}
};

/* ---------------- guide ---------------- */
const GUIDE=[
 {id:'cruise',title:'Radiação na viagem',body:'Fora da proteção do campo magnético da Terra, a radiação é constante. Durante o cruzeiro até Marte, o instrumento RAD, a bordo do Curiosity, mediu cerca de 1,8 mSv por dia.',lesson:'Lição: tenha um abrigo blindado na nave e um plano para alertas solares.',src:'Fonte: NASA/JPL · MSL RAD (Zeitlin et al., Science, 2013)'},
 {id:'env',title:'O ambiente de Marte',body:'A gravidade é 38% da terrestre e a pressão atmosférica é menos de 1% da da Terra. Um dia marciano, o sol, dura 24h39min. As noites chegam a dezenas de graus negativos.',lesson:'Lição: o traje fica pressurizado o tempo todo. Planeje a EVA pela duração do oxigênio.',src:'Fonte: NASA Mars Exploration Program'},
 {id:'dust',title:'Poeira tóxica',body:'O solo marciano contém percloratos, sais tóxicos para humanos. A sonda Phoenix os detectou em 2008, e o Curiosity também os encontrou na Cratera Gale.',lesson:'Lição: remova a poeira do traje antes de entrar no habitat.',src:'Fonte: NASA/JPL · Phoenix Mars Lander; MSL Curiosity'},
 {id:'water',title:'Marte já teve água',body:'Em 2013, o Curiosity perfurou as rochas de Yellowknife Bay e encontrou argilominerais. Ali existiu um lago com água pouco salgada e de pH neutro, um ambiente que poderia ter sustentado vida microbiana.',lesson:'Lição: rochas sedimentares finas, como lamitos, são os melhores alvos para buscar sinais de habitabilidade.',src:'Fonte: NASA/JPL-Caltech · MSL (Grotzinger et al., Science, 2014)'},
 {id:'sand',title:'Areia fofa',body:'As Dunas Bagnold são dunas ativas, que se movem com o vento. O Curiosity as estudou em 2015 e 2016. Em 2009, o rover Spirit atolou em solo fofo e não conseguiu mais sair.',lesson:'Lição: evite areia fofa e teste o solo antes de avançar com carga.',src:'Fonte: NASA/JPL-Caltech · MSL Curiosity; MER Spirit'},
 {id:'power',title:'Energia e poeira',body:'O Opportunity funcionava com energia solar. Em junho de 2018, uma tempestade de poeira cobriu o planeta inteiro, e o último contato com o rover foi em 10/06/2018. A NASA encerrou a missão em fevereiro de 2019, depois de quase 15 anos em Marte. O Curiosity usa um gerador nuclear e continuou operando.',lesson:'Lição: instrumentos gastam energia. Planeje a bateria da EVA e guarde reserva para voltar.',src:'Fonte: NASA/JPL · encerramento da missão Opportunity (fev. 2019)'},
 {id:'spe',title:'Partículas solares',body:'Na superfície, o RAD mediu em média cerca de 0,64 mSv por dia. Um evento de partículas solares pode elevar a dose em pouco tempo. As taxas e o tempo de aviso do evento neste jogo são simulados.',lesson:'Lição: monitore os alertas de clima espacial e mantenha um abrigo sempre a poucos minutos.',src:'Fonte: NASA/JPL · MSL RAD (Hassler et al., Science, 2014)'},
 {id:'rocks',title:'Rochas pontiagudas',body:'No fim de 2013, os furos e rasgos nas rodas de alumínio do Curiosity aumentaram rápido ao cruzar terreno com rochas pontiagudas. A equipe passou a buscar rotas mais lisas, inspecionar as rodas com frequência e testar dirigir de ré.',lesson:'Lição: rochas assim também podem cortar trajes. Contorne quando der e inspecione o equipamento ao voltar.',src:'Fonte: NASA/JPL · relatórios da missão MSL (2013–2014)'},
 {id:'box',title:'Formações boxwork',body:'São redes de cristas na rocha. Água subterrânea depositou minerais em fraturas, e a erosão depois removeu a rocha em volta, deixando as cristas em relevo. O Curiosity estudou essas formações em 2025, no Monte Sharp.',lesson:'Lição: essas cristas registram água subterrânea depois que os lagos secaram. É ciência que só se faz no local.',src:'Fonte: NASA/JPL-Caltech · MSL Curiosity (2025)'},
 {id:'erosion',ex:true,title:'Relógio da erosão',body:'As rochas de Yellowknife Bay ficaram expostas há cerca de 80 milhões de anos, quando o vento erodiu as camadas que as cobriam. Para a geologia de Marte, é uma exposição recente.',lesson:'Lição: superfícies expostas há menos tempo passaram menos tempo sob a radiação da superfície.',src:'Fonte: NASA/JPL-Caltech/MSSS · PIA17595',photo:'PIA17595 · mosaico de Yellowknife Bay com os pontos de perfuração (sol 137)'},
 {id:'namib',ex:true,title:'Duna Namib',body:'É uma das Dunas Bagnold. A face a favor do vento tem inclinação de cerca de 28° e uns 5 m de altura. Imagens orbitais mostram que essas dunas avançam até cerca de 1 m por ano terrestre.',lesson:'Lição: dunas mudam de lugar. Atualize a rota com imagens recentes.',src:'Fonte: NASA/JPL-Caltech/MSSS · PIA20284 (sol 1.197, 18/12/2015)',photo:'PIA20284 · panorama 360° ao lado da Duna Namib'},
 {id:'sulfur',ex:true,title:'Cristais de enxofre',body:'Em 30/05/2024 (sol 4.200), o Curiosity passou por cima de uma rocha no canal Gediz Vallis, apelidada de Convict Lake, e a quebrou. Dentro havia cristais amarelos de enxofre puro, identificados pelo instrumento APXS. Foi a primeira vez que se encontrou enxofre puro em Marte.',lesson:'Lição: descobertas podem surgir por acaso. Registre tudo, até o que aparece sob os pés.',src:'Fonte: NASA/JPL-Caltech · PIA26309 (2024)',photo:'PIA26309 · rocha Convict Lake quebrada, com os cristais'}
];
const PIC={water:'PIA17595',erosion:'PIA17595',sand:'PIA20284',namib:'PIA20284',rocks:'PIA20334',sulfur:'PIA26309',box:'PIA26559'};
const DIARY={
 cruise:'Dia 112 de viagem. O alarme tocou de madrugada e passamos horas espremidos no abrigo. Lá fora, o Sol não para. Aqui dentro, aprendi que medo também se mede em mSv.',
 env:'Sol 1. Dei o primeiro passo e quase pulei alto demais: aqui eu peso pouco mais de um terço do que pesava em casa. O céu é cor de caramelo, e o silêncio é absoluto. Sem o traje, eu não duraria um minuto.',
 dust:'Keli avisou pelo rádio: "Limpa o traje antes de entrar." Esse pó vermelho é bonito, mas é veneno.',
 water:'Toquei uma rocha que um dia foi lama no fundo de um lago. Água de verdade, calma, com pH neutro. Talvez algo tenha vivido aqui. Fiquei um tempo parada, só olhando.',
 erosion:'O vento levou milhões de anos para descobrir esta laje. Para Marte, isso é ontem. Sou a primeira pessoa a tocá-la.',
 sand:'As dunas parecem macias, mas o Spirit ficou preso numa areia assim e nunca mais saiu. O Tatu reclamou a cada metro. Contornamos.',
 namib:'Uma parede de areia escura com a altura de uma casa. E ela anda: até um metro por ano. O mapa de hoje não vale para amanhã.',
 power:'A bateria do traje caiu para 30%. Lembrei do Opportunity, que dormiu numa tempestade de poeira e nunca mais acordou. Desliguei os instrumentos e voltei a andar.',
 spe:'Alerta: uma erupção solar. Quarenta e cinco minutos para me esconder. Corri como nunca dentro de um traje. Chegar ao abrigo foi o melhor abraço da minha vida.',
 rocks:'As pedras aqui são facas. Foram pedras assim que furaram as rodas do Curiosity. Hoje rasparam o meu traje. Um corte pequeno, mas o ar não perdoa.',
 sulfur:'Pisei numa pedra e ela quebrou. Dentro, cristais amarelos, brilhando. O Curiosity achou algo assim por acaso, em 2024. Marte guarda surpresas debaixo dos nossos pés.',
 box:'Cheguei. Cristas cruzadas, como as paredes de uma colmeia de pedra. A água correu por baixo da terra muito depois de os lagos secarem. Guardei a amostra com as mãos tremendo.'
};
const PHOTOS={water:'PIA17595 · formação Yellowknife Bay (sol 137)',sand:'PIA20284 · Duna Namib, Dunas Bagnold (sol 1.197)',rocks:'PIA20334 · inspeção de desgaste das rodas do Curiosity',box:'PIA26559 · primeira vista 360° do boxwork (sols 4.451 a 4.454)'};

/* ---------------- state ---------------- */
let S;
function reset(){
  S={mode:'title',t:0,min:8*60,o2:100,o2min:100,dose:0,en:100,suit:100,found:new Set(),needRocks:false,step:0,layers:['MAPA','TOPOGRAFIA'],layer:0,guide:new Set(),
     p:{x:START.x,y:START.y,fx:START.x,fy:START.y,ox:START.x,oy:START.y,mt:1,dur:.16,face:1,frame:0},
     trail:[{x:START.x-1,y:START.y}],spe:null,teaser:0,teaserT:0,edlT:0,guideOpen:false,guideSel:0,bumpT:0,refillT:0,visited:new Set(),hudT:0};
  D=null;$('#dlg').hidden=true;$('#hud').hidden=true;toastHide();
  updLegend();showTitle();
}

/* ---------------- dialog ---------------- */
let D=null;
const dlg=$('#dlg'),dW=$('#dlgWho'),dT=$('#dlgTxt');
function portraitFor(w){if(/SELARI/.test(w))return 'port0';if(/HASTOR/.test(w))return 'port1';if(/NATAN/.test(w))return 'port2';if(/ROSSI/.test(w))return 'port3';return null}
function say(lines,done){D={lines,i:0,shown:0,done};startLine()}
function startLine(){const L=D.lines[D.i];const o=typeof L==='string'?{t:L}:L;D.cur=Object.assign({},o,{t:tr(o.t)});D.shown=0;
  dlg.hidden=false;dW.textContent=tr(o.who||'');dW.hidden=!o.who;dT.textContent='';
  const pk=portraitFor(o.who||''),pt=$('#dlgPt');pt.hidden=!pk;if(pk){pt.src=ART[pk]}dlg.classList.toggle('has-pt',!!pk);dlg.classList.toggle('pt-r',pk==='port0');
  dlg.classList.toggle('alert',!!o.alert);dlg.classList.toggle('guide',!!o.guide);dlg.classList.remove('ready');
  dT.style.fontSize='';dT.textContent=D.cur.t;let fs=5;while(dT.scrollHeight>dT.clientHeight+1&&fs>3.4){fs-=0.3;dT.style.fontSize=fs+'cqw'}dT.textContent='';
  if(o.guide)unlockGuide(o.guide);if(o.layer)unlockLayer(o.layer);if(o.fx)o.fx()}
function updDialog(dt){if(!D)return;const f=D.cur.t;
  if(D.shown<f.length){D.shown=Math.min(f.length,D.shown+dt*60);dT.textContent=f.slice(0,Math.floor(D.shown))}
  else dlg.classList.add('ready')}
function advDialog(){if(!D)return;if(D.shown<D.cur.t.length){D.shown=D.cur.t.length;dT.textContent=D.cur.t;return}
  D.i++;if(D.i>=D.lines.length){const cb=D.done;D=null;dlg.hidden=true;cb&&cb()}else startLine()}

/* ---------------- toast ---------------- */
const toastEl=$('#toast');let toastTimer=0;
function toast(msg,kind){toastEl.textContent=tr(msg);toastEl.className='toast'+(kind?' '+kind:'');toastEl.hidden=false;toastTimer=2.2}
function toastHide(){toastEl.hidden=true;toastTimer=0}

function unlockGuide(id){if(S.guide.has(id))return;S.guide.add(id);S.guideNew=true;const e=GUIDE.find(g=>g.id===id);toast(tr('+ GUIA: ')+tr(e.title).toUpperCase(),'good')}
function unlockLayer(name){if(!S.layers.includes(name))S.layers.push(name);toast(tr('NOVA CAMADA: ')+tr(name)+tr(' · USE CAMADA'),'good');updLegend()}
function updLegend(){const n=S?S.layers[S.layer]:'MAPA',info=LAYER_INFO[n];
  $('#lgName').textContent=tr(n);$('#layerTag').textContent=tr(n);
  $('#lgChips').innerHTML=info.chips.map(c=>`<span><i style="background:${c[0]}"></i>${tr(c[1])}</span>`).join('');
  $('#lgNote').innerHTML=tr(info.note)}

const TZPIC={intro:{mode:'scene',src:INTRO,mars:[64.5,19.4],alt:'Pixel art: uma pessoa de costas no alto de uma colina, olhando o céu estrelado com Marte como um ponto vermelho'},robots:[{src:BOTS.viking,alt:'Ilustração em pixel art da sonda Viking 1 pousada em Marte'},{src:BOTS.spirit,alt:'Ilustração em pixel art do rover Spirit na Cratera Gusev'},{src:BOTS.opportunity,alt:'Ilustração em pixel art do rover Opportunity em Meridiani Planum'},{src:BOTS.curiosity,alt:'Ilustração em pixel art do rover Curiosity diante do Monte Sharp'},{src:BOTS.perseverance,alt:'Ilustração em pixel art do rover Perseverance perfurando rocha na Cratera Jezero'}],
 ham:{src:HAM,alt:'Retrato em pixel art do chimpanzé Ham na cápsula Mercury'},orbit:[{src:SHEPARD,alt:'Retrato em pixel art de Alan Shepard na cápsula Mercury'},{src:PORT.glenn,alt:'Retrato em pixel art de John Glenn na cápsula Mercury'},{src:PORT.ride,alt:'Retrato em pixel art de Sally Ride a bordo do ônibus espacial'}],
 moon:[{src:PORT.armstrong,alt:'Retrato em pixel art de Neil Armstrong com o capacete nas mãos'},{src:PORT.aldrin,alt:'Retrato em pixel art de Buzz Aldrin na Lua'},{src:PORT.collins,alt:'Retrato em pixel art de Michael Collins no módulo de comando'}],
 a13:[{src:PORT.a13a,alt:'Retrato em pixel art de Jim Lovell na Apollo 13'},{src:PORT.a13b,alt:'Retrato em pixel art de Jack Swigert na Apollo 13'},{src:HAISE,alt:'Retrato em pixel art de Fred Haise na Apollo 13'}],
 artemis:[{src:PORT.art1,alt:'Retrato em pixel art de um tripulante da Artemis II'},{src:PORT.art2,alt:'Retrato em pixel art de um tripulante da Artemis II'},{src:PORT.art3,alt:'Retrato em pixel art de Christina Koch na Artemis II'},{src:PORT.art4,alt:'Retrato em pixel art de Jeremy Hansen na Artemis II'}]};
/* ---------------- overlays ---------------- */
const ov=$('#ov');
function setOv(html,cls){ov.className='ov '+(cls||'');ov.innerHTML=html;ov.hidden=!html}
function showTitle(){setOv(`<img src="${LANG==='en'?LOGO_EN:LOGO}" alt="${LANG==='en'?'Ankerona: Mission Mars. We sent our eyes where we could not yet go.':'Ankerona: Missão Marte. Enviamos nossos olhos onde ainda não podíamos ir.'}"><button class="start" id="startBtn">${tr('▶ JOGAR')}</button>
  <div class="langsel" role="group" aria-label="Idioma / Language"><span>◀</span><button data-lang="pt" aria-pressed="${LANG==='pt'}">PT-BR</button><button data-lang="en" aria-pressed="${LANG==='en'}">EN-US</button><span>▶</span></div>
  <p class="tiny">${tr('Missão hipotética · dados reais da NASA<br>Z / A para começar · Cratera Gale · Sol 1')}</p>`,'title');
  $('#startBtn').addEventListener('click',()=>act('A'));
  ov.querySelectorAll('[data-lang]').forEach(bt=>bt.addEventListener('click',()=>setLang(bt.dataset.lang)))}
const STATIC=[]; // [element, pt html, en html]
function setLang(l){LANG=l;try{localStorage.setItem('ankerona-lang',l)}catch(e){}
  document.documentElement.lang=l==='en'?'en-US':'pt-BR';
  STATIC.forEach(([el,pt,en])=>{el.innerHTML=l==='en'?en:pt});
  updLegend();if(S&&S.mode==='title')showTitle();
  if(S&&S.mode==='play')updHud()}

const TEASER=[
 {yr:'',art:'intro',l:['Desde sempre, olhamos para o céu e nos perguntamos o que havia além.','Durante milênios, ele foi apenas um sonho.','Até que, um dia, decidimos ir.']},
 {yr:'1961',art:'ham',l:['Antes de qualquer astronauta, foi ele.','Um chimpanzé chamado Ham, a bordo de uma cápsula Mercury.','Subiu, enfrentou o desconhecido... e voltou vivo.','Provou que era possível.']},
 {yr:'1961 – 1983',art:'orbit',l:['Alan Shepard rompeu a barreira e foi ao espaço.','“Boa viagem, John Glenn.” Com essas palavras, Glenn deu três voltas ao redor da Terra.','Anos depois, Sally Ride mostrou que o espaço pertencia a todos.']},
 {yr:'20 · JUL · 1969',art:'moon',l:['Milhões de pessoas em silêncio. Neil Armstrong desce a escada.','“Um pequeno passo para o homem, um salto gigante para a humanidade.”','Ao seu lado, Buzz Aldrin. Na órbita, Michael Collins esperando por eles.']},
 {yr:'1970',art:'a13',l:['“Houston, tivemos um problema.”','A 300 mil quilômetros de casa, uma explosão.','Lovell, Swigert e Haise tinham uma única missão: sobreviver.','E sobreviveram.']},
 {yr:'1976 – 2021',art:'robots',l:['Por décadas, enviamos nossos olhos onde ainda não podíamos ir.','Viking. Spirit. Opportunity. Curiosity. Perseverance.','Cada dado era uma promessa: um dia, alguém viria.']},
 {yr:'HOJE',art:'artemis',l:['Meio século depois, voltamos a viajar até a Lua.','A tripulação da Artemis II (Wiseman, Glover, Koch e Hansen) contornou seu lado oculto e olhou adiante.','Para um ponto vermelho no céu.']},
 {yr:'',art:'mars',l:['Os robôs mapearam o caminho.','<big>Agora é a nossa vez.'],end:true}
];
/* teaser transitions: fade out, let the years roll by, fade the next scene in */
function yearOf(k){const y=TEASER[k].yr;if(!y)return null;if(y==='HOJE')return new Date().getFullYear();const m=y.match(/\d{4}/);return m?+m[0]:null}
function goTeaser(i){const tok=S.tok=(S.tok||0)+1;S.tzBusy=true;ov.classList.add('tz-out');
  const a=yearOf(S.teaser),b=yearOf(i);
  setTimeout(()=>{if(S.tok!==tok||S.mode!=='teaser')return;
    if(a&&b&&b>a)rollYears(a,b,TEASER[i].yr,tok,()=>{S.tzBusy=false;showTeaser(i)});
    else{S.tzBusy=false;showTeaser(i)}},550)}
function rollYears(a,b,label,tok,done){
  setOv(`<div class="roll"><span class="rl">${b-a>1?b-a+tr(' ANOS DEPOIS'):tr('UM ANO DEPOIS')}</span><span class="ry" id="ry">${a}</span></div>`,'teaser rollv');
  const t0=performance.now(),D=Math.min(1700,600+(b-a)*35);
  (function step(now){if(S.tok!==tok)return;const k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);const el=$('#ry');if(el)el.textContent=Math.round(a+(b-a)*e);
    if(k<1)requestAnimationFrame(step);
    else{if(label==='HOJE'&&el)setTimeout(()=>{if(S.tok===tok)el.textContent=tr('HOJE')},350);
      setTimeout(()=>{if(S.tok!==tok)return;ov.classList.add('tz-out');setTimeout(()=>{if(S.tok===tok)done()},450)},label==='HOJE'?1100:650)}})(t0)}
function launch(){const tok=S.tok=(S.tok||0)+1;S.tzBusy=true;ov.classList.add('tz-out');
  setTimeout(()=>{if(S.tok!==tok)return;let n=3;
    setOv(`<div class="roll"><span class="rl">${tr('ANKERONA · MISSÃO MARTE')}</span><span class="ry" id="ry">T-3</span><span class="rl">${tr('CONTAGEM PARA O LANÇAMENTO')}</span></div>`,'teaser rollv');
    const iv=setInterval(()=>{if(S.tok!==tok){clearInterval(iv);return}n--;const el=$('#ry');
      if(n>0)el.textContent='T-'+n;else if(n===0)el.textContent=tr('IGNIÇÃO');
      else{clearInterval(iv);ov.classList.add('tz-out');setTimeout(()=>{if(S.tok===tok){S.tzBusy=false;startTravel()}},500)}},850)},550)}
function teaserDur(i){const s=TEASER[i],tp=TZPIC[s.art];return 1.4+s.l.length*0.85+3.6+(Array.isArray(tp)?(tp.length-1)*1.8:0)}
function showTeaser(i){S.teaser=i;S.teaserT=0;const s=TEASER[i];
  const lines=s.l.map(tr).map((t,k)=>{const big=t.startsWith('<big>');return `<p class="${big?'big':''}" style="animation-delay:${0.35+k*0.85}s">${big?t.slice(5):t}</p>`}).join('');
  const dots=TEASER.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('');
  const tp=TZPIC[s.art];let pic='';
  if(tp&&tp.mode==='scene'){const tw=Array.from({length:12},(_,k)=>`<i class="tz-tw" style="left:${(hash(k,i,7)*100).toFixed(1)}%;top:${(hash(k,i,8)*55).toFixed(1)}%;animation-delay:${(hash(k,i,9)*2).toFixed(2)}s"></i>`).join('');
    pic=`<div class="tz-scene"><img src="${tp.src}" alt="${tr(tp.alt)}">${tp.mars?`<i class="tz-mars" style="left:${tp.mars[0]}%;top:${tp.mars[1]}%"></i>`:''}${tw}</div><div class="tz-shade2"></div>`}
  else if(Array.isArray(tp)){const slot=teaserDur(i)/tp.length;
    pic=tp.map((p,k)=>{const a=(k*slot).toFixed(2),z=((k+1)*slot-0.5).toFixed(2);
      const an=k<tp.length-1?`ghost 1s ease-out ${a}s forwards, ghostout .8s ease-in ${z}s forwards, drift 14s linear ${a}s forwards`:`ghost 1s ease-out ${a}s forwards, drift 14s linear ${a}s forwards`;
      return `<img class="tz-img" src="${p.src}" alt="${tr(p.alt)}" style="animation:${an}">`}).join('')}
  else if(tp)pic=`<img class="tz-img" src="${tp.src}" alt="${tr(tp.alt)}">`;
  setOv(`${pic}<span class="skip">${tr('B: PULAR')}</span>${s.yr?`<span class="yr">${tr(s.yr)}</span>`:''}<div class="lines">${lines}</div>`,'teaser'+(tp&&tp.mode==='scene'?' scene':''))}

function showEDL(){setOv(`<span class="hd">${tr('7 MINUTOS DE TERROR')}</span><span class="clock" id="edlClock">7:00</span><span class="ph" id="edlPh">${tr('ENTRADA')}</span><span class="v" id="edlV">${LANG==='en'?'21,000':'21.000'} km/h</span>
  <div class="note">${tr('O sinal leva minutos para chegar à Terra. Ninguém pode intervir a tempo: tudo é automático.')}</div>`,'edl')}

function showGuide(){S.guideOpen=true;S.guideNew=false;renderGuide()}
function renderGuide(){const got=S.guide.size,sel=GUIDE[S.guideSel],has=S.guide.has(sel.id);
  const list=GUIDE.map((g,k)=>`<button data-g="${k}" class="${S.guide.has(g.id)?'got':''} ${k===S.guideSel?'sel':''} ${g.ex?'ex':''}" aria-label="${S.guide.has(g.id)?tr(g.title):tr('Entrada bloqueada')}">${g.ex?'E'+(k-8):k+1}</button>`).join('');
  const pic=PIC[sel.id],cap=tr(sel.photo||PHOTOS[sel.id]);
  const body=has?`<h3>${tr(sel.title)}</h3>${pic?`<figure><img src="${IMG[pic]}" alt="${tr('Foto real da NASA: ')}${cap}"><figcaption>${tr('FOTO REAL')} · ${cap} · NASA/JPL-Caltech/MSSS</figcaption></figure>`:''}${DIARY[sel.id]?`<p class="diary">${tr(DIARY[sel.id])}</p>`:''}<p><span class="tag">${tr('DADO REAL ·')}</span> ${tr(sel.body)}</p><p class="lesson">${tr(sel.lesson)}</p><p class="src">${tr(sel.src)}</p>`
    :`<h3>???</h3><p class="locked">${tr(sel.ex?'Entrada extra. Explore fora da rota para encontrá-la.':'Entrada ainda não registrada. Continue a missão para descobri-la.')}</p>`;
  setOv(`<div class="gh">${tr('GUIA DE CAMPO')}<span>${got}/${GUIDE.length}</span></div><div class="glist">${list}</div><div class="gbody">${body}</div><div class="gfoot">${tr('◀ ▶ NAVEGAR · B FECHAR')}</div>`,'guide');
  ov.querySelectorAll('[data-g]').forEach(bt=>bt.addEventListener('click',()=>{S.guideSel=+bt.dataset.g;renderGuide()}))}
function closeGuide(){S.guideOpen=false;setOv('');if(S.mode==='ending')showEnding(true)}

/* ---------------- Tatu: mission data hub ---------------- */
const BRIEF={"ykb": ["YELLOWKNIFE BAY", "Uma depressão rasa perto do local de pouso do Curiosity: o rover tinha rodado cerca de 680 m quando chegou lá. Ali aparecem rochas de grão fino, em camadas, que se formaram no fundo de um lago antigo.", "Foi a primeira rocha que o Curiosity perfurou, em 2013. Vamos lá descobrir se Gale já teve água capaz de sustentar vida microbiana.", "Procure rocha lisa, rachada em placas, com veios claros: é o lamito.", "NASA/JPL-Caltech · MSL (Grotzinger et al., Science, 2014)"], "bag": ["DUNAS BAGNOLD", "Um campo de dunas escuras na base noroeste do Monte Sharp. O nome homenageia Ralph Bagnold, engenheiro britânico que estudou como o vento forma dunas na Terra.", "São dunas ativas: o vento ainda as move. Em 2015 e 2016, o Curiosity fez ali a primeira visita de perto a dunas ativas fora da Terra. O caminho até o Monte Sharp passa por elas.", "Areia escura com ondulações. Ela é fofa: contorne quando puder.", "NASA/JPL-Caltech · MSL Curiosity, campanha das Dunas Bagnold (2015–2016)"], "box": ["FORMAÇÕES BOXWORK", "Redes de cristas que se cruzam na encosta do Monte Sharp, visíveis até da órbita. Água subterrânea deixou minerais nas fraturas da rocha, e a erosão removeu o resto.", "Mostram que ainda corria água sob o solo depois que os lagos secaram, o que pode ter estendido o tempo em que Gale era habitável. O Curiosity chegou a elas em 2025.", "Cristas em relevo formando \"caixas\". A amostra da missão é coletada ali.", "NASA/JPL-Caltech · MSL Curiosity (2025)"], "shel": ["ABRIGO", "Um evento de partículas solares está a caminho: prótons de alta energia lançados pelo Sol.", "As paredes do habitat e do rover pressurizado reduzem a dose. Do lado de fora, o traje protege pouco.", "Chegue perto do rover ou do habitat e aperte A (ou toque nele) para entrar.", "NASA/JPL · MSL RAD (Hassler et al., Science, 2014)"], "home": ["HABITAT", "A base da missão, onde a tripulação vive e trabalha.", "A amostra precisa voltar para ser analisada e registrada. Fechar o Guia de Campo é o objetivo final da missão.", "Chegue perto da escada do habitat.", "Missão fictícia baseada em dados reais da NASA"]};
const TATU=[['alvo','ALVO ATUAL'],['guide','GUIA DE CAMPO'],['clima','CLIMA AGORA'],['rad','RADIAÇÃO'],['som','OUVIR O VENTO'],['gale','MAPA DA CRATERA']];
function openTatu(){S.tatuOpen=true;S.tatuSel=S.tatuSel||0;S.tatuView=null;renderTatu()}
function closeTatu(){S.tatuOpen=false;S.tatuView=null;stopWind();setOv('')}
function briefId(){return S.step===0?'ykb':S.step===1?'bag':S.step===2?'shel':S.step===3?'box':'home'}
function openBrief(){openTatu();S.tatuView='alvo';renderTatu()}
function marsHour(){return (S.min%1479.5)/60}
function weather(){const h=marsHour(),day=Math.max(0,Math.sin(Math.PI*(h-6)/13));
  return {air:Math.round(-80+74*Math.pow(day,0.8)),ground:Math.round(-88+95*Math.pow(day,0.9)),p:8.3+0.35*Math.cos(TAU*(h-5)/24),uv:day>0.6?'ALTO':day>0.2?'MÉDIO':'BAIXO'}}
const dec=v=>LANG==='en'?v.toFixed(1):v.toFixed(1).replace('.',',');
function renderTatu(){const v=S.tatuView;let body='';
  if(!v){body=`<div class="tl">${TATU.map(([id,lb],k)=>`<button data-t="${k}" class="${k===S.tatuSel?'sel':''}">${tr(lb)}<span>${id==='alvo'?tr(BRIEF[briefId()][0]):id==='guide'?S.guide.size+'/'+GUIDE.length:id==='clima'?'REMS':id==='rad'?'RAD':id==='som'?'MIC':'GALE'}</span></button>`).join('')}</div><div class="gfoot">${tr('▲ ▼ ESCOLHER · A ABRIR · B FECHAR')}</div>`}
  else if(v==='clima'){const w=weather();body=`<div class="tv"><p class="big">${tr('AR')} ${w.air} °C · ${tr('SOLO')} ${w.ground} °C</p><p class="big">${tr('PRESSÃO')} ${dec(w.p)} hPa · UV ${tr(w.uv)}</p>
    <p>${tr('Valores simulados. O REMS, estação meteorológica do Curiosity, mede ar, solo, pressão, umidade, vento e UV desde 2012. Em Gale, a diferença entre o dia e a noite pode passar de 60 °C, e a pressão fica perto de 0,8% da terrestre.')}</p>
    <p class="src">${tr('Fonte: NASA/JPL-Caltech · MSL REMS (Gómez-Elvira et al., 2012)')}</p></div><div class="gfoot">${tr('B VOLTAR')}</div>`}
  else if(v==='alvo'){const b=BRIEF[briefId()];body=`<div class="tv"><p class="big">${tr(b[0])}</p>
    <p><span class="bk">${tr('O QUE É')}</span> ${tr(b[1])}</p><p><span class="bk">${tr('POR QUE IR')}</span> ${tr(b[2])}</p><p><span class="bk">${tr('O QUE PROCURAR')}</span> ${tr(b[3])}</p>
    <p class="src">${tr('Fonte: ')}${tr(b[4])}</p></div><div class="gfoot">${tr('B VOLTAR')}</div>`}
  else if(v==='rad'){body=`<div class="tv"><p class="big">${tr('DOSE HOJE')} ${fmtDose(S.dose)}</p><p class="big">${S.spe&&S.spe.phase==='active'?tr('TAXA: ALTA (EVENTO SOLAR)'):tr('TAXA: NORMAL')}</p>${S.spe&&S.spe.exp?`<p class="big">${tr('EXPOSIÇÃO NO EVENTO')} ${fmtDose(S.spe.exp)} · ${(S.spe.exp/6).toFixed(1).replace('.',LANG==='en'?'.':',')}% ${tr('DO LIMITE DA NASA')}</p>`:''}
    <p>${tr('Na superfície, o RAD do Curiosity mediu em média cerca de 0,64 mSv por dia. Num evento de partículas solares a dose sobe rápido: o abrigo é o habitat ou o rover pressurizado.')}</p>
    <p class="src">${tr('Fonte: NASA/JPL · MSL RAD (Hassler et al., Science, 2014)')}</p></div><div class="gfoot">${tr('B VOLTAR')}</div>`}
  else if(v==='som'){body=`<div class="tv"><p class="big wave">▁▃▅▂▆▃▁▄▂</p>
    <p>${tr('Som simulado do vento. Em 2021, os microfones do rover Perseverance gravaram os primeiros sons de Marte. A atmosfera fina abafa o som, que viaja a cerca de 240 m/s (na Terra, 343 m/s).')}</p>
    <p class="src">${tr('Fonte: NASA/JPL-Caltech · Perseverance SuperCam (Maurice et al., Nature, 2022)')}</p></div><div class="gfoot">${tr('A TOCAR DE NOVO · B VOLTAR')}</div>`}
  setOv(`<div class="gh">${tr('TATU · DADOS DA MISSÃO')}<span>${tr('câmeras · sensores · microfone')}</span></div>${body}`,'guide tatu');
  ov.querySelectorAll('[data-t]').forEach(bt=>bt.addEventListener('click',()=>{S.tatuSel=+bt.dataset.t;tatuAct('A')}))}
function tatuAct(a){const v=S.tatuView;
  if(v){if(a==='B'){S.tatuView=null;stopWind();renderTatu()}else if(a==='A'&&v==='som')playWind();return}
  if(a==='B'){closeTatu();return}
  if(a!=='A')return;const id=TATU[S.tatuSel][0];
  if(id==='guide'){closeTatu();S.guideNew=false;showGuide();return}
  if(id==='gale'){closeTatu();openGale();return}
  S.tatuView=id;renderTatu();if(id==='som')playWind()}
// wind: filtered noise, muffled like on Mars
let AC=null,WN=null;
function beep(f,d){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),gn=AC.createGain();o.type='square';o.frequency.value=f;
  gn.gain.setValueAtTime(0.06,AC.currentTime);gn.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.connect(gn);gn.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
/* suit failure: alarm, air escaping / vision closing in, blackout, Tatu brings Ana back, she wakes up in the habitat */
function updKO(dt){const k=S.ko;k.t+=dt;
  if(k.t<3.4){k.beepT-=dt;if(k.beepT<=0){beep(k.t<2.2?880:620,0.18);k.beepT=k.t<2.2?0.45:0.7}}
  if(k.t>=3.4&&k.step===0){k.step=1;setOv(k.kind==='rad'?`<p>${tr('Evacuação.')}</p><p>${tr('O Tatu leva você às pressas para o habitat, o abrigo mais blindado da base.')}</p>`:`<p>${tr('Tudo escurece.')}</p><p>${tr('O Tatu detecta a falha, envia o alerta e leva você de volta ao habitat.')}</p>`,'ko')}
  if(k.t>=6&&k.step===1){k.step=2;setOv('');const p=S.p;S.o2=100;S.en=100;S.suit=100;if(k.kind!=='rad')S.min+=60;p.x=p.fx=p.ox=START.x;p.y=p.fy=p.oy=START.y;p.mt=1;p.dir='down';S.trail=[{x:START.x-1,y:START.y}];S.tt=null;S.layer=0;updLegend()}
  if(k.t>=7&&k.step===2&&k.kind==='rad'){S.ko=null;enterShelter('hab');return}
  if(k.t>=7&&k.step===2){const why=tr(k.kind==='suit'?'Traje sem integridade':'O₂ esgotado'),kind=k.kind;S.ko=null;
    say([{who:'DR. NATAN JONAS',t:'Calma, Dra. Selari. Você está no habitat. Respire devagar: seus sinais estão voltando ao normal.'},
         {who:'COMANDANTE HASTOR',alert:true,t:why+tr('. EVA abortada: o Tatu trouxe você de volta ao habitat.')},
         {who:'COMANDANTE HASTOR',t:kind==='suit'?'Lição: contorne as rochas pontiagudas e repare o traje no rover ou no habitat antes que a integridade caia.':'Lição: planeje a rota pela reserva de oxigênio e use o rover pressurizado para recarregar.'}],()=>{})}}
function drawKO(cx,cy){const k=S.ko,t=k.t;
  if(t<3.4){vignette(ACC.alert,0.45+0.35*Math.sin(t*14));
    if(k.kind==='suit')for(let i=0;i<6;i++){const a=hash(i,(t*12)|0,7)*TAU,r=4+((t*30+i*5)%16);px(g,Math.round(cx+Math.cos(a)*r),Math.round(cy-4+Math.sin(a)*r*0.7),1,1,i%2?'#ffffff':P[5])}
    // tunnel vision: the view narrows around Ana, then closes
    const R=t<2.2?VW*(1-0.45*t/2.2):VW*0.55*(1-(t-2.2)/1.2);
    g.fillStyle='#000';g.beginPath();g.rect(0,0,VW,VH);g.arc(cx,cy,Math.max(0,R),0,TAU);g.fill('evenodd')}
  else if(t<6)px(g,0,0,VW,VH,'#000');
  else{g.globalAlpha=Math.max(0,1-(t-6));px(g,0,0,VW,VH,'#000');g.globalAlpha=1}}
function playWind(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();stopWind();
  const len=AC.sampleRate*8,buf=AC.createBuffer(1,len,AC.sampleRate),ch=buf.getChannelData(0);let last=0;
  for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+0.02*w)/1.02;ch[i]=last*3.2}
  const src=AC.createBufferSource();src.buffer=buf;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=420;
  const gn=AC.createGain();gn.gain.setValueAtTime(0,AC.currentTime);gn.gain.linearRampToValueAtTime(0.5,AC.currentTime+1.2);
  for(let k=1;k<7;k++)gn.gain.linearRampToValueAtTime(0.25+0.3*Math.random(),AC.currentTime+1.2+k);gn.gain.linearRampToValueAtTime(0,AC.currentTime+8);
  src.connect(f);f.connect(gn);gn.connect(AC.destination);src.start();WN=src}catch(e){}}
function stopWind(){try{if(WN)WN.stop()}catch(e){}WN=null}

/* ---------------- Gale Crater map (schematic, top-down) ---------------- */
// Geometry from PIA15687 (NASA/JPL-Caltech/ESA/DLR/FU Berlin/MSSS): crater 154 km across, Mount Sharp ~5.5 km high,
// landing ellipse 20 x 7 km on Aeolis Palus, northwest of the mountain. Positions are approximate.
const GALE={cx:80,cy:76,R:58},KM=GALE.R*2/154,GSTOPS=[{x:57,y:55,k:'land'},{x:60,y:55,k:'ykb'},{x:61,y:63,k:'bag'},{x:66,y:70,k:'box'}];
let GALEC=null;
function galeBase(){const c=document.createElement('canvas');c.width=SW;c.height=SH;const x=c.getContext('2d');const {cx,cy,R}=GALE;
  const MS=['#8f3e1f','#a54d28','#b8622f','#c97b44','#dfa06a'];
  for(let y=0;y<SH;y++)for(let X=0;X<SW;X++){const dx=X-cx,dy=y-cy,r=Math.hypot(dx,dy),n=vn(X/5,y/5,91)-0.5;let col;
    if(r>R+3)col=(hash(X,y,92)<0.08?'#6e3019':(n>0.1?'#5a2a1a':'#4f2416'));
    else if(r>R-4){const lit=(-dx-dy)/(r||1);col=lit>0.35?'#d68a52':lit<-0.35?'#6e3019':'#a85a32'}
    else{col=n>0.15?'#7a3a20':'#70341d';
      const mx=(X-86)/30,my=(y-82)/25,e=1-(mx*mx+my*my)+n*0.35;
      if(e>0){const k=Math.min(4,Math.floor(e*5));col=MS[k];const e2=1-(((X+1-86)/30)**2+((y-82)/25)**2)+n*0.35;if(Math.floor(e2*5)!==Math.floor(e*5)&&e2>0)col='#5a2a1a'}}
    x.fillStyle=col;x.fillRect(X,y,1,1)}
  // Peace Vallis: channel from the northwest rim to its fan near the landing site
  for(let t=0;t<=1;t+=0.01){const X=Math.round(52+t*5+Math.sin(t*9)*1.5),Y=Math.round(23+t*25);x.fillStyle='#4a2216';x.fillRect(X,Y,1,1)}
  x.fillStyle='#b8703f';for(let k=0;k<26;k++){const a=Math.PI*(0.25+0.5*hash(k,1,93)),r=4*hash(k,2,93);x.fillRect(Math.round(57+Math.cos(a)*r),Math.round(48+Math.sin(a)*r),1,1)}
  return c}
function drawGale(){if(!GALEC)GALEC=galeBase();g.drawImage(GALEC,0,0);
  // landing ellipse 20 x 7 km
  for(let k=0;k<40;k++){const a=k/40*TAU;if(k%2)continue;px(g,Math.round(57+Math.cos(a)*10*KM*0.75),Math.round(55+Math.sin(a)*3.5*KM*0.75),1,1,P[5])}
  // route
  for(let s_=0;s_<GSTOPS.length-1;s_++){const A=GSTOPS[s_],B=GSTOPS[s_+1];for(let t=0;t<=1;t+=0.12)px(g,Math.round(A.x+(B.x-A.x)*t),Math.round(A.y+(B.y-A.y)*t),1,1,'#9fd8ff')}
  GSTOPS.forEach(q=>{px(g,q.x-1,q.y-1,3,3,P[0]);px(g,q.x,q.y,1,1,P[5])});
  const here=GSTOPS[Math.min(3,[1,2,2,3,3][S.step]||1)];if(((S.t*3)|0)%2){px(g,here.x-2,here.y-2,5,5,ACC.safe);px(g,here.x-1,here.y-1,3,3,P[0])}
  // scale bar 50 km and north arrow
  const L=Math.round(50*KM);px(g,8,110,L,2,P[5]);px(g,8,108,1,6,P[5]);px(g,8+L-1,108,1,6,P[5]);
  px(g,150,14,1,8,P[5]);px(g,149,15,3,1,P[5]);px(g,148,16,5,1,P[5])}
function openGale(){S.mapOpen=true;$('#hud').hidden=true;const pc=(x,y)=>`left:${(x/SW*100).toFixed(1)}%;top:${(y/SH*100).toFixed(1)}%`;
  setOv(`<div class="gm-h">${tr('CRATERA GALE · MAPA ESQUEMÁTICO')}</div>
  <span class="gl" style="${pc(104,90)}">${tr('Monte Sharp')}<br>(Aeolis Mons)</span>
  <span class="gl" style="${pc(34,40)}">Aeolis Palus</span>
  <span class="gl gl-r" style="${pc(36,24)}">Peace Vallis</span>
  <span class="gl gl-s" style="${pc(52,48)}">${tr('Pouso 2012')}</span>
  <span class="gl gl-s" style="${pc(80,52)}">Yellowknife Bay</span>
  <span class="gl gl-s" style="${pc(40,64)}">${tr('Dunas Bagnold')}</span>
  <span class="gl gl-s" style="${pc(52,73)}">Boxwork</span>
  <span class="gl" style="${pc(146,24)}">N</span><span class="gl" style="${pc(8+Math.round(25*KM),103)}">50 km</span>
  <div class="gm-f">${tr('154 km de diâmetro · Monte Sharp: cerca de 5,5 km acima do piso · 5,4° S, 137,8° L')}<br>${tr('Esquema com base na imagem PIA15687 (NASA/JPL-Caltech/ESA/DLR/FU Berlin/MSSS). Posições aproximadas. B: VOLTAR')}</div>`,'gmap')}
function closeGale(){S.mapOpen=false;setOv('');if(S.mode==='play')$('#hud').hidden=false}

function showEnding(fast){const h=fmtClock();
  // 1) three lines over the blue sunset  2) they fade, a pause  3) the final line alone  4) logo + slogan  5) mission summary
  setOv(`<div class="ep ep1"><p style="animation-delay:2.8s">${tr('De volta ao habitat, Ana escreve a última página do Guia e a envia para a Terra.')}</p>
  <p style="animation-delay:4.8s">${tr('“Vocês vão ler isto daqui a alguns anos. Tudo o que aprendi está nestas páginas: o lago, a areia, o Sol, as pedras.”')}</p>
  <p style="animation-delay:7s">${tr('“Não fui longe sozinha. Os robôs vieram antes e deixaram o caminho marcado.”')}</p></div>
  <div class="ep ep2"><div class="fin">${tr('“Agora o caminho é de vocês.”')}</div></div>
  <div class="ep ep3"><img src="${LANG==='en'?LOGO_EN:LOGO}" alt="${LANG==='en'?'Ankerona: Mission Mars. We sent our eyes where we could not yet go.':'Ankerona: Missão Marte. Enviamos nossos olhos onde ainda não podíamos ir.'}">
  <div class="stats">${tr('GUIA')} ${S.guide.size}/${GUIDE.length} · EXTRAS ${S.found.size}/3 · DOSE ${fmtDose(S.dose)}<br>${tr('O₂ MÍNIMO')} ${Math.round(S.o2min)}% · ${h}</div>
  <div class="acts"><button id="gBtn">${tr('VER GUIA')}</button><button id="rBtn">${tr('JOGAR DE NOVO')}</button></div></div>
  <span class="skipe">${tr('A: PULAR')}</span>`,'end'+(fast?' fast':''));
  $('#gBtn').addEventListener('click',()=>act('G'));$('#rBtn').addEventListener('click',()=>{reset()})}

/* ---------------- flow ---------------- */
function startTravel(){S.mode='travel';S.t=0;setOv('');
  say([
    {who:'DIÁRIO DE BORDO',t:'A nave deixa a órbita da Terra rumo a Marte. A travessia dura cerca de 7 meses, o mesmo tempo que o Perseverance levou.'},
    {who:'DIÁRIO DE BORDO',t:'Longe do campo magnético da Terra, a radiação é constante. O Curiosity mediu cerca de 1,8 mSv por dia neste trajeto.'},
    {who:'COMANDANTE HASTOR',alert:true,t:'Alerta de tempestade solar! Todos para o abrigo, a área mais blindada da nave.',fx:()=>{S.flash=2.5}},
    {who:'+ GUIA DE CAMPO',guide:'cruise',t:'Radiação na viagem: tenha um abrigo blindado e um plano para alertas solares.'},
    {who:'DIÁRIO DE BORDO',t:'A cada mês, as mensagens para a Terra demoram mais. Perto de Marte, a conversa em tempo real deixa de existir.'},
    {who:'COMANDANTE HASTOR',t:'Marte à vista. Iniciando entrada, descida e pouso. Segurem-se.'}
  ],()=>{S.mode='edl';S.edlT=0;showEDL()})}

function startPlay(){S.mode='play';setOv('');$('#hud').hidden=false;updLegend();
  say([
    {who:'COMANDANTE HASTOR',t:'Pouso confirmado na Cratera Gale. Bem-vinda a Marte, Dra. Selari.'},
    {who:'COMANDANTE HASTOR',t:'Somos quatro: eu fico no habitat, o Dr. Natan Jonas cuida da saúde e o Eng. Rossi Brook está no rover pressurizado, perto das dunas. Fale com a gente com A.'},
    {who:'COMANDANTE HASTOR',t:'A gravidade aqui é 38% da terrestre, e a pressão é menos de 1% da da Terra. Sem traje, não há sobrevivência.'},
    {who:'+ GUIA DE CAMPO',guide:'env',t:'O ambiente de Marte: um sol dura 24h39min. Sua EVA de hoje tem oxigênio para cerca de 8 horas.'},
    {who:'COMANDANTE HASTOR',t:'O solo tem percloratos, sais tóxicos. Limpe o traje antes de entrar no habitat.'},
    {who:'+ GUIA DE CAMPO',guide:'dust',t:'Poeira tóxica: remova a poeira do traje antes de entrar.'},
    {who:'COMANDANTE HASTOR',t:'Seu mapa já tem a camada de topografia. Use CAMADA para alternar. Encostas e rochas bloqueiam o caminho.'},
    {who:'COMANDANTE HASTOR',t:'O traje tem três reservas: O₂, bateria (EN) e integridade (TJ). Camadas de dados gastam bateria. O habitat e o rover restauram tudo.'},
    {who:'COMANDANTE HASTOR',t:'Primeiro alvo: Yellowknife Bay. O Tatu, nosso rover de carga, vai na frente mostrando o caminho. Siga o Tatu: se você ficar para trás, ele espera.'},
    {who:'COMANDANTE HASTOR',t:BRIEF.ykb[1]},{who:'COMANDANTE HASTOR',t:BRIEF.ykb[2]},
    {who:'COMANDANTE HASTOR',t:'O que é? Toque no alvo no topo da tela ou abra o Tatu.'},
    {who:'COMANDANTE HASTOR',t:'O Tatu guarda os dados da missão: câmeras, sensores e microfone. Aperte A ou toque no ícone acima dele.'},
    {who:'COMANDANTE HASTOR',t:'Se sobrar tempo, explore fora da rota. Fique de olho em brilhos no chão.'}
  ],()=>{})}

function visitPOI(i){const p=POIS[i];S.visited.add(p.id);
  if(i===0)say([
    {who:'DRA. SELARI',t:'Yellowknife Bay. Rocha de grão fino, em camadas... é um lamito.'},
    {who:'COMANDANTE HASTOR',t:'Foi aqui que o Curiosity perfurou em 2013. Encontrou argilominerais: aqui existiu um lago de água pouco salgada.'},
    {who:'+ GUIA DE CAMPO',guide:'water',t:'Marte já teve água, num ambiente que poderia ter sustentado vida microbiana.'},
    {who:'NOVO INSTRUMENTO',layer:'MINERAIS',t:'Espectrômetro pronto. Camada MINERAIS liberada.'},
    {who:'COMANDANTE HASTOR',t:'Próximo alvo: Dunas Bagnold. Cuidado com a areia.'},
    {who:'COMANDANTE HASTOR',t:BRIEF.bag[1]},{who:'COMANDANTE HASTOR',t:BRIEF.bag[2]}
  ],()=>{S.step=1});
  if(i===1)say([
    {who:'DRA. SELARI',t:'Dunas Bagnold. Dunas ativas: o vento as move até hoje.'},
    {who:'COMANDANTE HASTOR',t:'Em 2009, o rover Spirit atolou em solo fofo e nunca mais saiu. Não repita o erro.'},
    {who:'+ GUIA DE CAMPO',guide:'sand',t:'Areia fofa: evite e teste o solo antes de avançar com carga.'},
    {who:'NOVO INSTRUMENTO',layer:'TERRENO',t:'Sensor de solo pronto. Camada TERRENO liberada: ela mostra areia, encostas e abrigos.'}
  ],()=>{S.step=2;startSPE()});
  if(i===2)say([
    {who:'DRA. SELARI',t:'Lá estão elas. Cristas cruzadas, como as paredes de uma caixa.'},
    {who:'COMANDANTE HASTOR',t:'Formações boxwork. Água subterrânea depositou minerais em fraturas. A erosão deixou as cristas em relevo.'},
    {who:'+ GUIA DE CAMPO',guide:'box',t:'Boxwork: registro de água subterrânea, estudado pelo Curiosity em 2025.'},
    {who:'DRA. SELARI',t:'Amostra coletada. Objetivo científico cumprido.'},
    {who:'COMANDANTE HASTOR',t:'Excelente trabalho. Volte ao habitat. O rover pressurizado pode recarregar seu O₂ no caminho.'},{who:'COMANDANTE HASTOR',t:BRIEF.home[2]}
  ],()=>{S.step=4});
}
function startSPE(){S.spe={phase:'warn',left:45,doseStart:S.dose};
  say([{who:'COMANDANTE HASTOR',alert:true,t:'Alerta! Os satélites detectaram uma erupção solar. As partículas chegam em cerca de 45 minutos.'},
       {who:'COMANDANTE HASTOR',alert:true,t:'Vá para um abrigo: o rover pressurizado, perto das dunas, ou o habitat. O Tatu leva você ao mais próximo.'},
       {who:'COMANDANTE HASTOR',t:'Chegue perto do abrigo e aperte A para entrar. A tripulação entra com você.'}],()=>{})}
/* staying outside during the event: electronics fail first, then the dose adds up against real references */
const days=d=>Math.round(d/0.64);
function speExposure(){const sp=S.spe,e=sp.exp;sp.lv=sp.lv||0;
  if(sp.lv<1){sp.lv=1;sp.noisy=true;if(S.layer){S.layer=0;updLegend()}toast('RUÍDO NOS SENSORES: CAMADAS FORA DO AR','bad');
    say([{who:'COMANDANTE HASTOR',alert:true,t:'As partículas chegaram e você está do lado de fora! Elas também afetam eletrônicos: em 2003, uma tempestade solar danificou o instrumento MARIE, da sonda Mars Odyssey. Suas camadas de dados vão falhar aqui fora.'}],()=>{});return}
  if(sp.lv<2&&e>=20){sp.lv=2;say([{who:'DR. NATAN JONAS',alert:true,t:tr('Dose do evento: ')+fmtDose(e)+tr('. Isso já equivale a cerca de ')+days(e)+tr(' dias na superfície de Marte, pela média do RAD (0,64 mSv por dia).')}],()=>{});return}
  if(sp.lv<3&&e>=50){sp.lv=3;say([{who:'DR. NATAN JONAS',alert:true,t:'Já passou de 50 mSv: mais de 8% do limite de carreira de um astronauta da NASA, que é de 600 mSv. O risco é de longo prazo, principalmente câncer. Entre num abrigo agora!'}],()=>{});return}
  if(sp.lv<4&&e>=80){sp.lv=4;say([{who:'COMANDANTE HASTOR',alert:true,t:'Dose acima do limite desta missão. EVA abortada: o Tatu vai levar você ao habitat agora.'}],()=>{S.ko={t:3.3,kind:'rad',beepT:0,step:0};held.length=0})}}
function endSPE(){S.spe.phase='done';const d=S.dose-S.spe.doseStart;
  say([{who:'COMANDANTE HASTOR',t:tr('Evento encerrado. Dose recebida durante o alerta: ')+fmtDose(d)+tr(', cerca de ')+days(d)+tr(' dias na superfície.')},
       {who:'+ GUIA DE CAMPO',guide:'spe',t:'Partículas solares: monitore alertas e mantenha um abrigo a poucos minutos.'},
       {who:'COMANDANTE HASTOR',t:'Último alvo: as formações boxwork, subindo a encosta do Monte Sharp.'},
    {who:'COMANDANTE HASTOR',t:BRIEF.box[1]},{who:'COMANDANTE HASTOR',t:BRIEF.box[2]}],()=>{S.step=3;if(S.inside&&S.inside.phase==='in')toast('A: SAIR DO ABRIGO','good')})}
const SHELTERS={rov:{r:ROVP,crew:['kenji'],name:'ROVER PRESSURIZADO'},hab:{r:HABP,crew:['ruiz','iara'],name:'HABITAT'}};
const doorOf=k=>{const r=SHELTERS[k].r;return {x:(r.x+r.w/2)*T-8,y:(r.y+r.h)*T-14}};
function shelterNear(){const p=S.p;if(p.mt<1)return null;for(const k in SHELTERS)if(nearRect(SHELTERS[k].r,p.x,p.y))return k;return null}
function canShelter(){return S.spe&&S.spe.phase!=='done'&&!S.inside}
function enterShelter(k,then){S.inside={k,phase:'enter',t:0,then};held.length=0}
function exitShelter(){if(S.spe&&S.spe.phase!=='done')toast('AINDA HÁ PARTÍCULAS LÁ FORA','bad');S.inside.phase='exit';S.inside.t=0}
function updInside(dt){const z=S.inside;if(!z)return;z.t+=dt;
  if(z.phase==='enter'&&z.t>0.9+0.45*SHELTERS[z.k].crew.length+0.6){z.phase='in';z.t=0;if(z.then){const f=z.then;S.inside=null;f();return}}
  else if(z.phase==='exit'&&z.t>1.2+0.45*SHELTERS[z.k].crew.length){S.inside=null}}
const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
// where a walker is drawn during the animation: from its spot to the door (enter) or back (exit), fading at the door
function shelterPose(who,idx,hx,hy){const z=S.inside;if(!z||(who!=='ana'&&!SHELTERS[z.k].crew.includes(who)))return null;
  const d=doorOf(z.k),t0=who==='ana'?0:0.5+0.45*idx;
  if(z.phase==='in')return {hide:true};
  let k=z.phase==='enter'?ease((z.t-t0)/0.8):1-ease((z.t-t0-0.2)/0.8);
  const a=z.phase==='enter'?1-ease((z.t-t0-0.65)/0.3):ease((z.t-t0)/0.3);
  return {x:hx+(d.x-hx)*k,y:hy+(d.y-hy)*k,a,moving:k>0&&k<1,dx:d.x-hx}}
function ending(){S.inside=null;S.mode='ending';$('#hud').hidden=true;showEnding()}

/* ---------------- helpers ---------------- */
function fmtClock(){const SOL=1479.5;const m=S.min%SOL,sol=1+Math.floor(S.min/SOL);const h=Math.floor(m/60),mm=Math.floor(m%60);
  return `SOL ${sol} ${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`}
function fmtDose(d){const v=d.toFixed(d>=10?1:3);return (LANG==='en'?v:v.replace('.',','))+' mSv'}
function nearRect(r,x,y){return x>=r.x-1&&x<=r.x+r.w&&y>=r.y-1&&y<=r.y+r.h}
function sheltered(){const p=S.p;return p.mt>=1&&(nearRect(HABP,p.x,p.y)||nearRect(ROVP,p.x,p.y))}
function target(){
  if(S.step===0)return POIS[0];if(S.step===1)return POIS[1];
  if(S.step===2){const p=S.p,dh=Math.abs(p.x-HABP.x)+Math.abs(p.y-HABP.y),dr=Math.abs(p.x-ROVP.x)+Math.abs(p.y-ROVP.y);
    return dr<dh?{x:ROVP.x,y:ROVP.y,name:'Rover pressurizado'}:{x:HABP.x,y:HABP.y,name:'Habitat'}}
  if(S.step===3)return POIS[2];return {x:HABP.x,y:HABP.y,name:'Habitat'}}
function objText(){
  if(S.step===2&&S.spe){if(S.spe.phase==='warn')return tr('ABRIGO JÁ! PARTÍCULAS EM ')+Math.ceil(S.spe.left)+' MIN';
    if(S.spe.phase==='active')return (sheltered()?tr('ABRIGADA · EVENTO: '):tr('EXPOSTA! VÁ AO ABRIGO · '))+Math.ceil(S.spe.left)+' MIN'+(S.spe.exp?' · '+fmtDose(S.spe.exp):'')}
  const t=target();return tr('ALVO: ')+tr(t.name).toUpperCase()}

/* ---------------- input ---------------- */
const held=[];const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const KEYDIR={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
const KEYACT={KeyZ:'A',Enter:'A',Space:'A',KeyX:'B',Escape:'B',Backspace:'B',KeyC:'L',KeyQ:'L',KeyG:'G',KeyT:'T',KeyV:'Z',KeyM:'M'};
function hold(d){if(!held.includes(d))held.push(d);if(S.tatuOpen&&!S.tatuView&&(d==='up'||d==='down')){S.tatuSel=(S.tatuSel+(d==='up'?TATU.length-1:1))%TATU.length;renderTatu();return}if(S.mode==='title'&&(d==='left'||d==='right')){setLang(d==='left'?'pt':'en');return}if(S.guideOpen&&(d==='left'||d==='right'||d==='up'||d==='down')){S.guideSel=(S.guideSel+(d==='left'||d==='up'?GUIDE.length-1:1))%GUIDE.length;renderGuide()}}
function release(d){const k=held.indexOf(d);if(k>=0)held.splice(k,1)}
addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;
  const d=KEYDIR[e.code],a=KEYACT[e.code];
  if(d){e.preventDefault();if(!e.repeat)hold(d)}
  else if(a){if(e.target&&e.target.tagName==='BUTTON'&&(e.code==='Enter'||e.code==='Space'))return;e.preventDefault();if(!e.repeat)act(a)}});
addEventListener('keyup',e=>{const d=KEYDIR[e.code];if(d)release(d)});
addEventListener('blur',()=>{held.length=0});
document.querySelectorAll('[data-dir]').forEach(bt=>{const d=bt.dataset.dir;
  bt.addEventListener('pointerdown',e=>{e.preventDefault();bt.setPointerCapture&&bt.setPointerCapture(e.pointerId);bt.classList.add('on');hold(d)});
  const up=()=>{bt.classList.remove('on');release(d)};
  bt.addEventListener('pointerup',up);bt.addEventListener('pointercancel',up);bt.addEventListener('lostpointercapture',up)});
document.querySelectorAll('[data-act]').forEach(bt=>bt.addEventListener('click',e=>{e.preventDefault();act(bt.dataset.act)}));
$('#obj').addEventListener('click',e=>{if(S.mode==='play'&&!D&&!S.guideOpen&&!S.tatuOpen&&!S.mapOpen&&!S.inside){e.preventDefault();openBrief()}});
document.querySelector('.screen').addEventListener('pointerdown',e=>{if(S.mode!=='play'||D||S.guideOpen||S.tatuOpen||S.mapOpen||!S.tatuHit)return;
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*cv.width/2,y=(e.clientY-r.top)/r.height*cv.height/2,h=S.tatuHit;
  if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){e.preventDefault();openTatu();return}
  if(canShelter()&&S.cam)for(const k in SHELTERS){const r=SHELTERS[k].r,X=r.x*T-S.cam.x,Y=(r.y-1)*T-S.cam.y;
    if(x>=X&&x<=X+r.w*T&&y>=Y&&y<=Y+(r.h+1)*T){e.preventDefault();if(shelterNear()===k)enterShelter(k);else toast('CHEGUE MAIS PERTO PARA ENTRAR');return}}});

function act(a){
  const m=S.mode;
  if(S.guideOpen){if(a==='B'||a==='G'||a==='A')closeGuide();return}
  if(S.mapOpen){if(a==='B'||a==='M'||a==='A')closeGale();return}
  if(S.tatuOpen){if(a==='T'){closeTatu();return}tatuAct(a);return}
  if(m==='title'){if(a==='A'){S.mode='teaser';showTeaser(0)}return}
  if(m==='teaser'){if(a==='B'){S.tok=(S.tok||0)+1;S.tzBusy=false;startTravel();return}if(S.tzBusy)return;if(a==='A'){if(S.teaser<TEASER.length-1)goTeaser(S.teaser+1);else launch()}return}
  if(m==='travel'){if(a==='A'||a==='B')advDialog();return}
  if(m==='edl'){if(a==='A'){S.edlT=Math.max(S.edlT,8.6)}return}
  if(m==='ending'){if(a==='G')showGuide();else if((a==='A'||a==='B')&&!ov.classList.contains('fast'))ov.classList.add('fast');return}
  if(m==='play'){
    if(S.ko)return;
    if(D){if(a==='A'||a==='B')advDialog();return}
    if(S.inside){if(S.inside.phase==='in'&&(a==='A'||a==='B'))exitShelter();return}
    if(a==='L'&&S.spe&&S.spe.noisy&&S.spe.phase==='active'&&!sheltered()){toast('RUÍDO NOS SENSORES: CAMADAS FORA DO AR','bad');return}
    if(a==='L'){if(S.en<=0){S.layer=0;updLegend();toast('SEM BATERIA: VÁ A UM ABRIGO','bad');return}
      S.layer=(S.layer+1)%S.layers.length;updLegend();toast(tr('CAMADA: ')+tr(S.layers[S.layer]));return}
    if(a==='T'){if(!S.inside)openTatu();return}
    if(a==='G'){showGuide();return}
    if(a==='Z'){S.zoom=S.zoom===2?1:2;$('#zoomBtn').setAttribute('aria-pressed',S.zoom===2);toast(S.zoom===2?'VISÃO AMPLA':'VISÃO NORMAL');return}
    if(a==='M'){openGale();return}
    if(a==='A'){const p=S.p;
      if(canShelter()){const k=shelterNear();if(k){enterShelter(k);return}}
      const near=CREW.find(c=>Math.abs(c.x-p.x)+Math.abs(c.y-p.y)<=1);if(near){talk(near);return}
      openTatu()}
  }
}

/* ---------------- update ---------------- */
/* ---------------- Tatu leads the way ---------------- */
// It rolls ahead toward the current target, avoiding sharp rocks and soft sand when it can (the lesson from Curiosity and Spirit).
// If Ana falls behind it stops and waits; after a few seconds it drives back to her.
const TT_NEAR=3,TT_WAIT=4,D4=[[1,0],[-1,0],[0,1],[0,-1]];
const ttPass=(x,y,strict)=>walkable(x,y)&&(!strict||(tile[I(x,y)]!==SHARP&&tile[I(x,y)]!==SAND));
function ttNext(fx,fy,goals,strict,bx=-9,by=-9){const dist=new Int16Array(MW*MH).fill(-1),q=[];
  for(const [gx,gy] of goals)if(inMap(gx,gy)&&(ttPass(gx,gy,strict)||(gx===fx&&gy===fy))&&dist[I(gx,gy)]<0){dist[I(gx,gy)]=0;q.push(gx,gy)}
  for(let h=0;h<q.length;h+=2){const x=q[h],y=q[h+1],d=dist[I(x,y)];if(x===fx&&y===fy)break;
    for(const [dx,dy] of D4){const nx=x+dx,ny=y+dy;if(!inMap(nx,ny)||dist[I(nx,ny)]>=0)continue;if(!(nx===fx&&ny===fy)&&(!ttPass(nx,ny,strict)||(nx===bx&&ny===by)))continue;dist[I(nx,ny)]=d+1;q.push(nx,ny)}}
  const d0=dist[I(fx,fy)];if(d0<=0)return d0===0?'here':null;
  for(const [dx,dy] of D4){const nx=fx+dx,ny=fy+dy;if(inMap(nx,ny)&&dist[I(nx,ny)]===d0-1)return [nx,ny]}return null}
function ttGoals(){const t=target(),r=t.x===HABP.x&&t.y===HABP.y?HABP:t.x===ROVP.x&&t.y===ROVP.y?ROVP:{x:t.x,y:t.y,w:1,h:1},out=[];
  for(let y=r.y-3;y<r.y+r.h+3;y++)for(let x=r.x-3;x<r.x+r.w+3;x++){const d=Math.max(r.x-x,x-(r.x+r.w-1),r.y-y,y-(r.y+r.h-1));if(d===2)out.push([x,y])}return out}
function updTatu(dt){const p=S.p;let tt=S.tt;if(S.inside&&tt)return;
  if(!tt||Math.abs(tt.x-p.x)+Math.abs(tt.y-p.y)>30){const s0=S.trail[0]||{x:p.x-1,y:p.y};tt=S.tt={x:s0.x,y:s0.y,ox:s0.x,oy:s0.y,mt:1,dur:.24,dir:'r',wait:0,mode:'lead',think:0}}
  if(tt.mt<1){tt.mt=Math.min(1,tt.mt+dt/tt.dur);return}
  if(D||S.guideOpen||S.tatuOpen||S.mapOpen)return;
  tt.think-=dt;if(tt.think>0)return;tt.think=0.06;
  const dp=Math.max(Math.abs(tt.x-p.x),Math.abs(tt.y-p.y));let nx=null;
  if(tt.mode==='back'){if(dp<=1){tt.mode='lead';tt.wait=0}else{const n=ttNext(tt.x,tt.y,[[p.x,p.y]],false);if(Array.isArray(n))nx=n}}
  else if(dp>TT_NEAR){tt.wait+=0.06;if(tt.wait>TT_WAIT){tt.mode='back';toast('O TATU ESTÁ VOLTANDO ATÉ VOCÊ')}}
  else{tt.wait=0;const gs=ttGoals();let n=ttNext(tt.x,tt.y,gs,true,p.x,p.y);if(n===null)n=ttNext(tt.x,tt.y,gs,false,p.x,p.y);if(Array.isArray(n))nx=n}
  if(nx&&!(nx[0]===p.x&&nx[1]===p.y)){tt.ox=tt.x;tt.oy=tt.y;tt.x=nx[0];tt.y=nx[1];tt.mt=0;
    tt.dur=tile[I(tt.x,tt.y)]===SAND?0.42:tt.mode==='back'?0.17:0.24;const dx=tt.x-tt.ox,dy=tt.y-tt.oy;tt.dir=dx<0?'l':dx>0?'r':dy<0?'u':'d'}}
function tryMove(){const p=S.p;if(S.ko||S.inside||p.mt<1||D||S.guideOpen||S.tatuOpen||S.mapOpen||!held.length)return;
  const d=held[held.length-1],[dx,dy]=DIRS[d];if(dx)p.face=dx;p.dir=d;
  const nx=p.x+dx,ny=p.y+dy;
  const npc=CREW.find(c=>c.x===nx&&c.y===ny);if(npc){if(S.bumpT<=0){toast(tr('A: FALAR COM ')+tr(npc.name));S.bumpT=1}return}
  if(!walkable(nx,ny)){if(S.bumpT<=0){const t=inMap(nx,ny)?tile[I(nx,ny)]:CLIFF;
      toast(t===CLIFF?'ENCOSTA ÍNGREME: CONTORNE':t===ROCK?'ROCHA: CONTORNE':'ABRIGO À FRENTE','bad');S.bumpT=1.2}return}
  S.trail.unshift({x:p.x,y:p.y});S.trail.length=2;
  (S.fx||(S.fx=[])).push({k:'dust',n:4,d:.4,t:0,x:p.x*T+2,y:p.y*T+6});
  p.ox=p.x;p.oy=p.y;p.x=nx;p.y=ny;p.mt=0;
  const sand=tile[I(nx,ny)]===SAND;p.dur=sand?0.34:0.16;if(sand){S.o2=Math.max(0,S.o2-0.35)}
  if(tile[I(nx,ny)]===SHARP){S.fx.push({k:'spark',n:3,d:.3,t:0,x:nx*T+3,y:ny*T-2});S.suit=Math.max(0,S.suit-7);if(!S.guide.has('rocks'))S.needRocks=true;else toast(tr('TRAJE DANIFICADO: ')+Math.round(S.suit)+'%','bad')}
}
function arrive(){const p=S.p;
  if(S.needRocks){S.needRocks=false;say([{who:'DRA. SELARI',alert:true,t:'Rochas pontiagudas! Senti o traje raspar.'},
    {who:'COMANDANTE HASTOR',t:'Em 2013, rochas assim furaram as rodas de alumínio do Curiosity. Com o traje abaixo de 50%, ele começa a vazar O₂.'},
    {who:'+ GUIA DE CAMPO',guide:'rocks',t:'Rochas pontiagudas: contorne quando der. O habitat e o rover reparam o traje.'}],()=>{});return}
  for(const s of SECRETS){if(s.x===p.x&&s.y===p.y&&!S.found.has(s.id)){S.found.add(s.id);const e=GUIDE.find(g=>g.id===s.id);
    say([{who:'DESCOBERTA',t:s.say},{who:'+ GUIA · EXTRA',guide:s.id,t:tr(e.title)+tr(': entrada extra registrada no Guia.')}],()=>{});return}}
  POIS.forEach((q,i)=>{if(q.x===p.x&&q.y===p.y&&!S.visited.has(q.id)){
    const want=[0,1,null,2][S.step];if(want===i)visitPOI(i);
    else if(S.bumpT<=0){toast(tr('SIGA A ORDEM: ')+tr(target().name).toUpperCase());S.bumpT=1.5}}});
}
function update(dt){
  S.t+=dt;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)toastEl.hidden=true}
  if(S.bumpT>0)S.bumpT-=dt;if(S.flash>0)S.flash-=dt;
  updDialog(dt);
  if(S.mode==='teaser'){S.teaserT+=dt;const need=teaserDur(S.teaser);
    if(S.teaserT>need&&!S.tzBusy){if(S.teaser<TEASER.length-1)goTeaser(S.teaser+1);else launch()}}
  if(S.mode==='edl'){S.edlT+=dt;const t=S.edlT,DUR=9;const left=Math.max(0,420*(1-t/DUR));
    const ck=$('#edlClock');if(ck){ck.textContent=`${Math.floor(left/60)}:${String(Math.floor(left%60)).padStart(2,'0')}`;
      let ph,v;if(t<2.6){ph='ENTRADA · ESCUDO TÉRMICO';v=21000-(21000-1500)*(t/2.6)}
      else if(t<5.2){ph='PARAQUEDAS';v=1500-(1500-300)*((t-2.6)/2.6)}
      else if(t<7.8){ph='DESCIDA PROPULSADA';v=300-297*((t-5.2)/2.6)}
      else{ph='POUSO CONFIRMADO';v=0}
      $('#edlPh').textContent=tr(ph);$('#edlV').textContent=Math.round(v).toLocaleString(LANG==='en'?'en-US':'pt-BR')+tr(' km/h (aprox.)')}
    if(t>DUR+1.2)startPlay()}
  if(S.mode==='play'){const p=S.p;
    if(p.mt<1){p.mt=Math.min(1,p.mt+dt/p.dur);p.frame+=dt*11;if(p.mt>=1)arrive()}
    if(S.ko){updKO(dt);S.hudT-=dt;if(S.hudT<=0){S.hudT=0.1;updHud()}return}
    updTatu(dt);
    tryMove();
    updInside(dt);
    if(!D&&!S.guideOpen){
      const gm=dt*2*(S.inside&&S.inside.phase==='in'&&S.spe&&S.spe.phase!=='done'?10:1);S.min+=gm;const sh=sheltered();
      if(sh){if((S.o2<99.5||S.en<99.5||S.suit<99.5)&&S.refillT<=0){toast('O₂, BATERIA E TRAJE OK','good');S.refillT=4}S.o2=100;S.en=100;S.suit=100}
      else{const leak=S.suit<50?1.6:1;S.o2=Math.max(0,S.o2-gm*(100/480)*leak);
        const lay=S.layers[S.layer]!=='MAPA';S.en=Math.max(0,S.en-gm*(100/600+(lay?100/200:0)));
        if(S.en<=0&&lay){S.layer=0;updLegend();toast('SEM BATERIA: CAMADAS DESLIGADAS','bad')}
        if(S.en<30&&!S.guide.has('power'))say([{who:'COMANDANTE HASTOR',alert:true,t:'Bateria do traje abaixo de 30%. Camadas de dados gastam energia: ligue só quando precisar.'},
          {who:'+ GUIA DE CAMPO',guide:'power',t:'Energia e poeira: o Opportunity, movido a energia solar, parou após a tempestade de poeira de 2018.'}],()=>{})}
      if(S.refillT>0)S.refillT-=dt;
      let rate=0.64/24;
      if(S.spe){if(S.spe.phase==='warn'){S.spe.left-=gm;if(S.spe.left<=0){S.spe.phase='active';S.spe.left=60;toast('PARTÍCULAS CHEGARAM','bad')}}
        else if(S.spe.phase==='active'){rate=sh||S.inside?10:90;S.spe.left-=gm;if(!sh&&!S.inside){S.spe.exp=(S.spe.exp||0)+rate*gm/60;speExposure()}if(S.spe.left<=0)endSPE()}}
      S.dose+=rate*gm/60;S.o2min=Math.min(S.o2min,S.o2);
      if((S.o2<=0||S.suit<=0)&&!S.ko){S.ko={t:0,kind:S.suit<=0?'suit':'o2',beepT:0,step:0};held.length=0;toast(S.suit<=0?'ALERTA: TRAJE COMPROMETIDO':'ALERTA: O₂ ESGOTADO','bad')}
      if(S.step===4&&nearRect(HABP,p.x,p.y)&&p.mt>=1&&!S.inside)enterShelter('hab',ending);
    }
    S.hudT-=dt;if(S.hudT<=0){S.hudT=0.1;updHud()}
  }
}
function updHud(){$('#o2fill').style.width=S.o2+'%';$('#o2bar').classList.toggle('low',S.o2<25);$('#o2bar').classList.toggle('mid',S.o2>=25&&S.o2<50);
  $('#enfill').style.width=S.en+'%';$('#enbar').classList.toggle('low',S.en<30);$('#enbar').classList.toggle('mid',S.en>=30&&S.en<60);
  $('#sfill').style.width=S.suit+'%';$('#sbar').classList.toggle('low',S.suit<50);$('#sbar').classList.toggle('mid',S.suit>=50&&S.suit<80);$('#dose').textContent=fmtDose(S.dose);$('#clock').textContent=fmtClock();
  const sl=$('#shel'),z=S.inside;sl.hidden=!(z&&z.phase==='in');
  if(z&&z.phase==='in'){const sp=S.spe&&S.spe.phase!=='done'?S.spe:null,names=SHELTERS[z.k].crew.map(id=>tr(CREW.find(c=>c.id===id).name)).join(' + ');
    sl.innerHTML=`<b>${tr('DENTRO DO ')}${tr(SHELTERS[z.k].name)}</b><br>ANA SELARI + ${names}<br>${sp?`<i>${tr(sp.phase==='warn'?'PARTÍCULAS A CAMINHO':'EVENTO SOLAR LÁ FORA')} · ${Math.ceil(sp.left)} MIN ▶▶</i><br>${tr('A: SAIR (AINDA HÁ RISCO LÁ FORA)')}`:tr('EVENTO ENCERRADO · A: SAIR')}`}
  $('#hud').classList.toggle('glitch',!!(S.spe&&S.spe.phase==='active'&&!sheltered()&&!S.inside));
  const o=$('#obj');o.textContent=objText();o.classList.toggle('alert',S.step===2&&!!S.spe&&S.spe.phase!=='done')}

/* ---------------- render ---------------- */
const STARS=Array.from({length:70},(_,i)=>({x:Math.floor(hash(i,1,91)*SW),y:Math.floor(hash(i,2,91)*SH),b:hash(i,3,91)}));
function stars(scroll=0){for(const s of STARS){const tw=Math.sin(S.t*2+s.b*20)>0.6;const x=((s.x-scroll*(0.3+s.b))%SW+SW)%SW;
  px(g,Math.floor(x),s.y,1,1,s.b>0.8?(tw?P[4]:P[5]):(s.b>0.45?P[3]:P[2]))}}
function rocket(x,y,flame){px(g,x+3,y,2,2,P[5]);px(g,x+2,y+2,4,3,P[5]);px(g,x+1,y+5,6,6,P[4]);px(g,x+3,y+6,2,2,P[1]);px(g,x,y+9,1,3,P[2]);px(g,x+7,y+9,1,3,P[2]);
  if(flame){px(g,x+2,y+11,4,2,P[4]);px(g,x+3,y+13,2,2+Math.floor(Math.random()*3),P[3])}}
function capsule(x,y){px(g,x+3,y,3,1,P[5]);px(g,x+2,y+1,5,1,P[5]);px(g,x+1,y+2,7,2,P[4]);px(g,x,y+4,9,1,P[3]);px(g,x+1,y+5,7,4,P[5]);px(g,x+2,y+6,5,1,P[2])}
function drawTeaserArt(){const a=TEASER[S.teaser].art,t=S.teaserT;px(g,0,0,SW,SH,P[0]);if(S.tzBusy){stars();return}stars(a==='artemis'?t*6:0);
  if(a==='intro'){planet(g,80,170,78,P[1],P[2],P[3]);}
  if(a==='ham'){planet(g,80,175,72,P[1],P[2],P[3]);const rt=t-1.2;
    if(rt<0)blit(g,'rkt0',10,44);else blit(g,'rkt'+(rt<0.5?1:2+((S.t*8|0)%2)),10,44-Math.round(rt*rt*4))}
  if(a==='orbit'){if(AI.earth)g.drawImage(AI.earth,20,34,36,36);g.strokeStyle=P[3];g.lineWidth=1;
    for(let k=0;k<64;k++){const an=k/64*Math.PI*2;px(g,Math.round(38+Math.cos(an)*30),Math.round(52+Math.sin(an)*10),1,1,k%2?P[2]:P[3])}
    const an=t*1.4;const ox=Math.round(38+Math.cos(an)*30),oy=Math.round(52+Math.sin(an)*10);if(Math.sin(an)>-0.2||Math.abs(Math.cos(an))>0.6)blit(g,'merc'+(((t*3)|0)%4),ox-7,oy-7)}
  if(a==='moon'&&AI.bg_moon){g.save();g.translate(SW,0);g.scale(-1,1);g.drawImage(AI.bg_moon,0,0);g.restore()}
  else if(a==='moon'){planet(g,80,150,90,P[2],P[3],P[4]);
    for(let k=0;k<9;k++){const cx=Math.floor(hash(k,4,77)*150)+5,cy=70+Math.floor(hash(k,5,77)*20);disc(g,cx,cy,1+Math.floor(hash(k,6,77)*3),P[2])}
    planet(g,128,22,7,P[1],P[2],P[4]);px(g,70,40,1,22,P[5]);px(g,71,40,10,6,P[5]);px(g,72,41,4,2,P[2]);
    px(g,86,52,4,8,P[5]);px(g,86,50,4,3,P[4]);px(g,87,51,2,1,P[0])}
  if(a==='a13'){const x=Math.round(40+Math.sin(t)*2);blit(g,'moon_s',6,30);blit(g,'a13_'+(t<1.6?0:t<2.4?1:2),x,22);
    if(t>=1.6)for(let k=0;k<10;k++){const ang=hash(k,t|0,55)*6.28,r=((t-1.6)*14+k*3)%26;px(g,Math.round(x+22+Math.cos(ang)*r),Math.round(32+Math.sin(ang)*r),1,1,k%2?P[5]:P[4])}}
  if(a==='robots'){planet(g,80,165,92,P[1],P[2],P[3]);const rx=Math.floor(30+((t*10)%100));
    blit(g,'rov'+((t*8|0)%4),rx,56)}
  if(a==='artemis'){blit(g,'moon_l',10,22);const cx=Math.floor(62+t*7);blit(g,'ori'+(((t*2)|0)%5===4?2:((t*2)|0)%2),cx,28);
    disc(g,142,34,2,P[3]);px(g,142,34,1,1,P[4])}
  if(a==='mars'){const r=Math.floor(Math.min(46,4+t*12));if(AI.marsp)g.drawImage(AI.marsp,80-r,54-r,2*r,2*r);else planet(g,80,54,r,P[1],P[2],P[3])}
}
function drawTitle(){px(g,0,0,SW,SH,P[0]);if(AI.bg_title)g.drawImage(AI.bg_title,0,0);
  for(const st of STARS.slice(0,14)){if(Math.sin(S.t*2+st.b*20)>0.8)px(g,st.x,Math.floor(st.y*0.5),1,1,P[5])}}
function drawTravel(){px(g,0,0,SW,SH,P[0]);const pr=D?D.i/(D.lines.length-1):1,bx=Math.round(-pr*70);
  if(AI.bg_space)g.drawImage(AI.bg_space,bx,0);
  // moving stars only over open space, never over Earth
  for(const st of STARS){const x=((st.x-S.t*10*(0.3+st.b))%SW+SW)%SW;if(x>bx+42)px(g,Math.floor(x),st.y,1,1,st.b>0.7?P[5]:P[3])}
  const ms=Math.round(10+pr*40);if(AI.marsp)g.drawImage(AI.marsp,Math.round(148-pr*20-ms/2),Math.round(34-ms/2),ms,ms);
  const fr=((S.t/2.5)|0)%4===3?3:1+((S.t*8|0)%2);blit(g,'ship'+fr,46,22+Math.round(Math.sin(S.t*2)));
  if(S.flash>0)vignette(ACC.alert,0.45+0.35*Math.sin(S.t*10))}
function mixc(a,b,k){const A=hex(a),B=hex(b);return `rgb(${A.map((v,n)=>Math.round(v+(B[n]-v)*k)).join(',')})`}
function drawEDL(){const t=S.edlT,air=Math.max(0,Math.min(1,(t-1.2)/3.5));
  // sky: black space, then butterscotch haze thickening toward the horizon (dithered bands)
  for(let y=0;y<SH;y++){const k=air*Math.pow(y/SH,0.8),b=Math.floor(k*6)/6,nb=Math.min(1,b+1/6),f=k*6-Math.floor(k*6);
    g.fillStyle=mixc(P[0],'#a85a32',b);g.fillRect(0,y,SW,1);g.fillStyle=mixc(P[0],'#a85a32',nb);for(let x=(y&1);x<SW;x+=2)if(f>BAYER[(y&3)*4+(x&3)])g.fillRect(x,y,1,1)}
  if(air<1){g.globalAlpha=1-air;stars();g.globalAlpha=1}
  if(t<2.6&&AI.mars_hz)g.drawImage(AI.mars_hz,0,SH-Math.round(20+t*9));
  const gyT=Math.round(SH-Math.min(72,Math.max(0,t-2.2)*11));
  if(AI.edl_ground&&t>=2.2)g.drawImage(AI.edl_ground,0,gyT);
  const k=t<2.6?(S.t*8|0)%2:t<4.6?2:t<5.2?3:t<7.8?4+((S.t*8|0)%2):6;
  const bot=t>=7.8?gyT+60:Math.min(gyT+60,70+t*6);
  blit(g,'edl'+k,60,Math.round(bot)-46)}

const SPR=["................",".....aaaaa......","....abbbbba.....","...abbbcccca....","...abbbccdca....","...abbbbbbba....","....abbbbba.....","..aaabbbbbbaa...",".aeeabbbbbbba...",".aeeabbdbbbba...",".aeeabbbbbba....","..aaabbbbbba....","....abbaabba....","....abba.abba...","...aaaa..aaaa...","................"];
const SPR2=["................",".....aaaaa......","....abbbbba.....","...abbbcccca....","...abbbccdca....","...abbbbbbba....","....abbbbba.....","..aaabbbbbbaa...",".aeeabbbbbbba...",".aeeabbdbbbba...",".aeeabbbbbba....","..aaabbbbbba....",".....abbabba....",".....abbabba....","....aaaaaaaa....","................"];
const SC={a:P[0],b:P[5],c:P[1],d:P[3],e:P[2]};
function sprite(sp,x,y,flip,col){for(let r=0;r<16;r++){const row=sp[r];for(let c=0;c<16;c++){const ch=row[c];if(ch&&ch!=='.'){px(g,flip?x+15-c:x+c,y+r,1,1,(col&&ch==='e')?col:SC[ch])}}}}
function tatu(x,y,bob){px(g,x+2,y+6+bob,12,5,P[0]);px(g,x+3,y+7+bob,10,3,P[4]);px(g,x+3,y+5+bob,6,1,P[1]);px(g,x+10,y+3+bob,1,4,P[5]);px(g,x+9,y+2+bob,3,1,P[3]);
  disc(g,x+4,y+12,1,P[0]);disc(g,x+11,y+12,1,P[0])}
const RTC=document.createElement('canvas');RTC.width=SW*2;RTC.height=SH*2;const RT=RTC.getContext('2d');
function drawPlay(){const p=S.p,k=p.mt;const rx=(p.ox+(p.x-p.ox)*k)*T,ry=(p.oy+(p.y-p.oy)*k)*T;
  const camx=Math.round(Math.max(0,Math.min(MW*T-VW,rx+8-VW/2))),camy=Math.round(Math.max(0,Math.min(MH*T-VH,ry+8-VH/2-6)));
  g.drawImage(base,camx,camy,VW,VH,0,0,VW,VH);
  const L=S.layers[S.layer];if(L!=='MAPA'&&layers[L])g.drawImage(layers[L],camx,camy,VW,VH,0,0,VW,VH);
  // habitat and boulders are baked into the map; redraw the visible ones with their detailed versions
  {const im=AI.lander;if(im)blit(g,'lander',HABP.x*VW/VW*T-camx,(HABP.y+HABP.h)*T-im.height-camy)}
  BIG.forEach(q=>{const im=AI['bl'+q.k],X=q.x*T-camx,Y=(q.y+2)*T-camy;if(im&&X>-40&&Y>-8&&X<VW+8&&Y<VH+70)blit(g,'bl'+q.k,X,Y-im.height,hash(q.x,q.y,130)<0.5)});
  {const x0=Math.floor(camx/T),y0=Math.floor(camy/T);for(let y=y0;y<=y0+VH/T+1;y++)for(let x=x0;x<=x0+VW/T+1;x++){if(!inMap(x,y))continue;const i=I(x,y);
    if(tile[i]===ROCK&&!BIGC.has(i)&&!PEB.has(i)&&hash(x,y,91)>=0.4)blit(g,'bs'+Math.floor(hash(x,y,126)*4),x*T-camx,y*T-camy,hash(x,y,92)<0.5)}}
  // pressurized rover (3x2 tiles), beacon blinking
  {const im=AI.rover0;if(im)blit(g,'rover'+(((S.t*2)|0)%2),ROVP.x*T-camx,(ROVP.y+ROVP.h)*T-im.height-camy)}
  // POI markers: a beacon until visited, then a science tripod
  POIS.forEach((q,i)=>{const fx=q.x*T-camx,fy=q.y*T-camy;if(fx<-16||fy<-24||fx>VW||fy>VH)return;const done=S.visited.has(q.id);
    if(done){blit(g,'tripod',fx+2,fy+2);return}
    const cur=target()===q,ph=(S.t*1.6+i)%1;
    if(cur){g.globalAlpha=0.35;px(g,fx+7,fy-40,2,44,P[5]);g.globalAlpha=1}
    g.globalAlpha=1-ph;ring(g,fx+8,fy+13,4+ph*9,2+ph*4,cur?P[5]:P[4]);g.globalAlpha=1;
    blit(g,'bcn'+[0,1,2,1][((S.t*(cur?6:3))|0)%4],fx-2,fy-4);
    if(cur){const by=fy-10+Math.round(Math.sin(S.t*5)*2);px(g,fx+5,by,6,1,P[0]);px(g,fx+6,by+1,4,1,P[5]);px(g,fx+7,by+2,2,1,P[5]);px(g,fx+6,by,4,1,P[4])}});
  if(S.spe&&S.spe.phase!=='done'){const f=((S.t*3)|0)%2,bob=Math.round(Math.sin(S.t*4)*2);
    blit(g,'shel'+f,(HABP.x+1)*T+1-camx,HABP.y*T-30-camy+bob);blit(g,'shel'+f,(ROVP.x+1)*T+1-camx,ROVP.y*T-22-camy+bob)}
  // sulfur crystals stay where the boot broke the rock
  SECRETS.forEach(s=>{if(s.id==='sulfur'&&S.found.has(s.id))blit(g,'sulfur',s.x*T-camx,s.y*T-camy+2)});
  // hidden discoveries: a sparkle shows only when close
  SECRETS.forEach(s=>{if(S.found.has(s.id))return;if(Math.abs(s.x-p.x)+Math.abs(s.y-p.y)>7)return;const sx=s.x*T-camx,sy=s.y*T-camy,tw=((S.t*4)|0)%2;
    blit(g,'shine'+(((S.t*6+s.x)|0)%4),sx+2,sy+2);if(tw){px(g,sx+7,sy-2,1,5,'#ffffff');px(g,sx+5,sy,5,1,'#ffffff')}});
  // Bagnold ripples creep with the wind (wrapping texture, masked to the dune shape)
  {const fr=((S.t*3)|0)%4;RT.clearRect(0,0,VW,VH);RT.globalCompositeOperation='source-over';RT.save();RT.translate(-(camx%64),-(camy%64));
    RT.fillStyle=RT.createPattern(RIP[fr],'repeat');RT.fillRect(0,0,VW+64,VH+64);RT.restore();
    RT.globalCompositeOperation='destination-in';RT.drawImage(SANDMASK,camx,camy,VW,VH,0,0,VW,VH);RT.globalCompositeOperation='source-over';g.drawImage(RTC,0,0,VW,VH,0,0,VW,VH)}
  // dust devils drift across the open plain (Curiosity has filmed them in Gale)
  DEVILS.forEach((d,i)=>{const dx=(d.x+Math.sin(S.t*0.07+i*2)*6)*T-camx,dy=(d.y+Math.cos(S.t*0.05+i)*3)*T-camy;if(dx<-16||dy<-28||dx>VW||dy>VH)return;
    blit(g,'devil'+(((S.t*10)|0)%6),Math.round(dx),Math.round(dy)-10)});
  // short effects: dust under the boots, sparks on sharp rock
  S.fx=(S.fx||[]).filter(e=>(e.t+=1/60)<e.d);S.fx.forEach(e=>blit(g,e.k+Math.min(e.n-1,Math.floor(e.t/e.d*e.n)),Math.round(e.x-camx),Math.round(e.y-camy)));
  // Tatu: leads the way; a bubble shows when it is waiting or coming back
  const tt=S.tt;if(tt){const kk=tt.mt,cx=Math.round((tt.ox+(tt.x-tt.ox)*kk)*T-camx),cy=Math.round((tt.oy+(tt.y-tt.oy)*kk)*T-camy),td=tt.dir,mv=kk<1;
    const fr=mv?(tile[I(tt.x,tt.y)]===SAND?4:((S.t*8)|0)%3):0;
    blit(g,td==='u'?'tatu_up'+fr:td==='d'?'tatu_down'+fr:'tatu_side'+fr,cx-2,cy-3,td==='r');
    const ix=cx+4,iy=cy-12+Math.round(Math.sin(S.t*4));
    px(g,ix-1,iy-1,10,9,P[0]);px(g,ix,iy,8,7,S.guideNew&&((S.t*3)|0)%2?ACC.safe:P[4]);px(g,ix+1,iy+1,6,4,P[0]);
    px(g,ix+2,iy+3,1,1,ACC.safe);px(g,ix+3,iy+2,1,2,ACC.safe);px(g,ix+4,iy+1,1,3,ACC.safe);px(g,ix+3,iy+7,2,2,P[0]);
    if(tt.mode==='back'||tt.wait>1){const bx=ix+10,by=iy-4;px(g,bx-1,by-1,7,8,P[0]);px(g,bx,by,5,6,P[5]);
      if(tt.mode==='back'){px(g,bx+2,by+1,1,3,ACC.alert);px(g,bx+2,by+5,1,1,ACC.alert)}else{px(g,bx+1,by+3,1,1,P[0]);px(g,bx+2,by+3,1,1,P[0]);px(g,bx+3,by+3,1,1,P[0])}}
    S.tatuHit={x:ix-4,y:iy-4,w:18,h:16};S.tatuScr={x:cx+8,y:cy+8}}
  // player
  S.cam={x:camx,y:camy};
  CREW.forEach(c=>{let nx=c.x*T-camx,ny=c.y*T-camy;if(nx<-40||ny<-40||nx>VW+40||ny>VH+40)return;
    const ddx=S.p.x-c.x,ddy=S.p.y-c.y,near=Math.abs(ddx)+Math.abs(ddy)<=1;
    let col=near?4+(((S.t*3)|0)%2):Math.abs(ddx)>Math.abs(ddy)?(ddx>0?1:3):(ddy<0?2:0);
    const ps=S.inside&&shelterPose(c.id,SHELTERS[S.inside.k].crew.indexOf(c.id),c.x*T,c.y*T);
    if(ps){if(ps.hide)return;nx=Math.round(ps.x-camx);ny=Math.round(ps.y-camy);col=ps.moving?(Math.abs(ps.dx)>8?(ps.dx>0?1:3):(S.inside.phase==='enter'?2:0)):0;g.globalAlpha=ps.a}
    blit(g,c.id+col,nx-2,ny-8);g.globalAlpha=1});
  {let ax=rx,ay=ry,dir=p.dir||'down',mv=p.mt<1,al=1;const ps=S.inside&&shelterPose('ana',0,rx,ry);
    if(ps&&ps.hide){}else{if(ps){ax=ps.x;ay=ps.y;al=ps.a;mv=ps.moving;if(mv)dir=Math.abs(ps.dx)>8&&ps.a>0.5?(S.inside.phase==='enter'?(ps.dx>0?'right':'left'):(ps.dx>0?'left':'right')):(S.inside.phase==='enter'?'up':'down')}
      const wk=mv?WALK[dir][((ps?S.t*10:p.frame)|0)%4]:[0,0];g.globalAlpha=al;blit(g,'lia_'+dir+wk[0],Math.round(ax-camx),Math.round(ay-camy)-8,!!wk[1]);g.globalAlpha=1}}
  // prompt above a shelter during the solar event
  if(canShelter()&&!D){const k=shelterNear();if(k&&((S.t*2)|0)%2){const d=doorOf(k),bx=Math.round(d.x-camx)-6,by=Math.round(SHELTERS[k].r.y*T-camy)-14;
    px(g,bx-1,by-1,30,11,P[0]);px(g,bx,by,28,9,ACC.safe);g.fillStyle=P[0];g.font='7px monospace';g.fillText('A',bx+2,by+7);g.fillText(LANG==='en'?'IN':'ENTRA',bx+9,by+7)}}
  // target arrow
  if(S.step<=4&&!D&&S.tatuScr){const tx=S.tatuScr.x,ty=S.tatuScr.y;
    if(tx<0||ty<26||tx>VW||ty>VH){const cx=VW/2,cy=(VH+26)/2,ang=Math.atan2(ty-cy,tx-cx);
      const ax=Math.max(8,Math.min(VW-8,cx+Math.cos(ang)*72)),ay=Math.max(32,Math.min(VH-8,cy+Math.sin(ang)*50));
      if(((S.t*3)|0)%2||true){g.save();g.translate(Math.round(ax),Math.round(ay));g.rotate(ang);g.fillStyle=P[0];g.beginPath();g.moveTo(6,0);g.lineTo(-5,-5);g.lineTo(-5,5);g.closePath();g.fill();
        g.fillStyle=((S.t*3)|0)%2?P[5]:P[4];g.beginPath();g.moveTo(4,0);g.lineTo(-3,-3);g.lineTo(-3,3);g.closePath();g.fill();g.restore()}}}
  // inside a shelter: time runs fast, the event builds up outside and fades
  if(S.inside&&S.inside.phase==='in'){const sp=S.spe&&S.spe.phase!=='done'?S.spe:null,it=sp?(sp.phase==='warn'?0.25+0.25*(1-sp.left/45):0.5+0.5*Math.sin(Math.PI*Math.min(1,1-sp.left/60))):0;
    g.globalAlpha=0.18+0.25*it;px(g,0,0,VW,VH,'#2a0c08');g.globalAlpha=1;if(it>0){vignette(ACC.alert,0.25+0.5*it);
      for(let i=0;i<Math.round(3+it*22);i++)blit(g,'hit'+((Math.random()*4)|0),(Math.random()*(VW-9))|0,(Math.random()*(VH-7))|0)}}
  // radiation exposure
  // solar particles are invisible; like on rover cameras, they show up as bright pixel hits on the sensor
  if(S.spe&&S.spe.phase==='active'&&!sheltered()){vignette(ACC.alert,0.5+0.3*Math.sin(S.t*6));
    for(let i=0;i<4;i++)blit(g,'hit'+((Math.random()*4)|0),(Math.random()*(VW-9))|0,(Math.random()*(VH-7))|0)}
  if(S.spe&&S.spe.phase==='warn')vignette('#ffb347',0.25+0.2*Math.sin(S.t*4));
  if(S.spe&&S.spe.phase!=='done')blit(g,'radi'+(((S.t*3)|0)%2),VW-20,40);
  // drifting dust and the light of the hour (Martian dusk turns bluish)
  for(let i=0;i<10;i++){const sx=(hash(i,1,99)*VW+S.t*(6+i))%VW,sy=(hash(i,2,99)*VH+Math.sin(S.t+i)*4+VH)%VH;px(g,Math.floor(sx),Math.floor(sy),1,1,i%3?P[3]:P[4])}
  const hr=(S.min%1479.5)/60;if(hr>15){g.globalAlpha=Math.min(0.3,(hr-15)*0.08);px(g,0,0,VW,VH,hr>17.5?'#141a3a':'#1a0d0b');g.globalAlpha=1}
  if(S.ko)drawKO(Math.round(rx-camx)+8,Math.round(ry-camy)+4)
}
function render(){HD=false;sizeCanvas(1);g.setTransform(1,0,0,1,0,0);
  if(S.mode==='title')drawTitle();else if(S.mode==='teaser')drawTeaserArt();else if(S.mode==='travel')drawTravel();
  else if(S.mode==='edl')drawEDL();else if(S.mode==='ending'&&AI.bg_end){g.drawImage(AI.bg_end,0,0)}
  else{const z=S.zoom===2&&!S.mapOpen?2:1;sizeCanvas(z*2);g.setTransform(2,0,0,2,0,0);HD=true;if(z===2){VW=SW*2;VH=SH*2;drawPlay();VW=SW;VH=SH}else drawPlay();HD=false;
    if(S.mapOpen)drawGale()}}
// zoomed out = more canvas pixels in the same screen box, so every sprite stays sharp (just smaller)
function sizeCanvas(z){if(cv.width!==SW*z){cv.width=SW*z;cv.height=SH*z;g.imageSmoothingEnabled=false}}

/* ---------------- crew talk ---------------- */
function talk(c){const st=S.step,tn=target().name;
  const L={
   ruiz:[st===4?'Amostra a bordo? Então volte para o habitat, sem desvios.':tr('Objetivo atual: ')+tr(tn)+tr('. Siga o Tatu e não gaste bateria à toa.'),
         'Lembre: quem decide a rota é o oxigênio, não a curiosidade.'],
   iara:[tr('Sua dose acumulada hoje: ')+fmtDose(S.dose)+tr('. Na superfície, o Curiosity mediu em média cerca de 0,64 mSv por dia.'),
         S.o2<50?'Seu O₂ está abaixo da metade. Recarregue antes de seguir.':'Limpe o traje antes de entrar. A poeira tem percloratos, que são tóxicos.'],
   kenji:[S.suit<99?tr('Seu traje está em ')+Math.round(S.suit)+tr('%. Aqui no rover eu remendo tudo.'):'O rover pressurizado recarrega O₂, bateria e traje. Use sempre que passar por aqui.',
          'No caminho para o boxwork há rochas pontiagudas. Pedras assim furaram as rodas do Curiosity em 2013.']
  }[c.id];
  say(L.map(x=>({who:tr(c.name)+' · '+tr(c.role).toUpperCase(),t:x})),()=>{})}

/* ---------------- test jumps ---------------- */
const WALK={down:[[1,0],[0,0],[1,1],[0,0]],up:[[1,0],[0,0],[1,1],[0,0]],left:[[2,0],[0,0],[3,0],[0,0]],right:[[2,0],[0,0],[3,0],[0,0]]};
const BASE=['cruise','env','dust','water'];
function setupPlay(o){reset();S.tt=null;S.mode='play';setOv('');$('#hud').hidden=false;
  S.step=o.step;S.layers=o.layers.slice();S.layer=0;
  o.guide.forEach(id=>S.guide.add(id));(o.visited||[]).forEach(id=>S.visited.add(id));
  const p=S.p;p.x=p.fx=p.ox=o.pos.x;p.y=p.fy=p.oy=o.pos.y;p.mt=1;S.trail=[{x:o.pos.x-1,y:o.pos.y}];
  S.min=8*60+(o.min||0);updLegend();updHud()}
function jumpTo(k){
  if(k==='teaser'){reset();S.mode='teaser';showTeaser(0)}
  else if(k==='travel'){reset();startTravel()}
  else if(k==='edl'){reset();S.mode='edl';S.edlT=0;showEDL()}
  else if(k==='eva'){reset();startPlay()}
  else if(k==='bagnold'){setupPlay({step:1,layers:['MAPA','TOPOGRAFIA','MINERAIS'],guide:BASE,visited:['ykb'],pos:POIS[0],min:60});toast('FASE 2: DUNAS BAGNOLD')}
  else if(k==='spe'){setupPlay({step:2,layers:['MAPA','TOPOGRAFIA','MINERAIS','TERRENO'],guide:[...BASE,'sand'],visited:['ykb','bag'],pos:POIS[1],min:150});startSPE()}
  else if(k==='boxwork'){setupPlay({step:3,layers:['MAPA','TOPOGRAFIA','MINERAIS','TERRENO'],guide:[...BASE,'sand','spe'],visited:['ykb','bag'],pos:{x:76,y:22},min:240});toast('FASE 3: BOXWORK')}
  else if(k==='return'){setupPlay({step:4,layers:['MAPA','TOPOGRAFIA','MINERAIS','TERRENO'],guide:[...BASE,'sand','spe','rocks','box'],visited:['ykb','bag','box'],pos:POIS[2],min:300});toast('VOLTE AO HABITAT')}
  else if(k==='ending'){reset();GUIDE.forEach(g=>S.guide.add(g.id));SECRETS.forEach(s=>S.found.add(s.id));S.dose=0.21;S.o2min=38;S.min=8*60+340;ending()}
  $('#screen').focus({preventScroll:true});
}
document.querySelectorAll('[data-jump]').forEach(bt=>bt.addEventListener('click',()=>jumpTo(bt.dataset.jump)));

/* ---------------- boot ---------------- */
document.querySelectorAll('[data-ico]').forEach(el=>{el.src=ART[el.dataset.ico]});
let last=performance.now();
function loop(now){const dt=Math.min(0.05,(now-last)/1000);last=now;try{update(dt);render()}catch(err){console.error(err)}requestAnimationFrame(loop)}

[["header h1", ["Ankerona: Mission Mars"]], ["header p", ["Teaser, cruise, landing and the first EVA in Gale Crater. Every discovery becomes a Field Guide entry, with the real data and its source."]], [".bezel .brand i", ["● POWER"]], [".pill", ["<span></span>LAYER", "<span></span>GUIDE", "<span></span>ZOOM", "<span></span>GALE"]], [".keys", ["Keyboard: <kbd>←↑↓→</kbd> walk · <kbd>Z</kbd> confirm · <kbd>X</kbd> back · <kbd>T</kbd> Tatu · <kbd>C</kbd> layer · <kbd>G</kbd> guide · <kbd>V</kbd> zoom · <kbd>M</kbd> crater map · <kbd>Z</kbd> near Tatu: data"]], [".panel h2", ["Test mode · jump to", "Active layer", "About the prototype"]], [".panel > p:not(#lgNote)", ["Go straight to any stage. Guide entries and layers from earlier stages come unlocked."]], ["#jump button", ["TEASER<small>Animated prologue</small>", "CRUISE<small>Transit and solar alert</small>", "LANDING<small>7 minutes of terror</small>", "PHASE 1<small>Yellowknife Bay</small>", "PHASE 2<small>Bagnold Dunes</small>", "EVENT<small>Solar particles</small>", "PHASE 3<small>Boxwork</small>", "RETURN<small>Back to the habitat</small>", "EPILOGUE<small>Complete guide</small>"]], [".facts dt", ["SCENARIO", "NAME", "MAP", "CREW", "GUIDE", "RESOURCES", "ART", "PHOTOS", "SCOPE"]], [".facts dd", ["Hypothetical crewed mission: no human has been to Mars yet. The crew, ship, habitat, pressurized rover and the Tatu robot are the game's setting. Every scientific fact is real and comes with its source; simulated values are marked as such.", "Ankerona combines Anca, Kelly, Ross and Nathan: Anca Selariu, Kelly Haston, Ross Brockwell and Nathan Jones, the CHAPEA 1 crew, who lived 378 days in a habitat that simulates Mars, at NASA's Johnson Space Center (2023–2024). An independent project using public NASA data; not an official NASA product.", "The terrain in this prototype is illustrative, is 96 × 72 tiles and is not oriented north-south (the crater map is). In the hackathon version, each layer will come from real NASA data for Gale Crater.", "4 crew members: Ana Selari (geologist, you), Cmdr. Keli Hastor, Dr. Natan Jonas (physician) and Eng. Rossi Brook (engineer). Their first syllables spell AN-KE-RO-NA, a tribute to the CHAPEA 1 crew. Walk up to them and press A to talk.", "12 entries: 9 along the route and 3 extras hidden off it. The facts come from real missions and include their source. The solar event doses in the game are simulated.", "O₂, battery (PWR) and suit integrity (SUIT). Data layers drain battery, sharp rocks damage the suit, and a suit below 50% leaks O₂. The habitat and the rover restore everything.", "Tiles, characters, Tatu, effects, portraits and HUD in pixel art made by the team; the map is still illustrative.", "Guide entries show, on a field tablet, real photos taken by Curiosity on site (PIA17595, PIA20284, PIA20334, PIA26309 and PIA26559), credited NASA/JPL-Caltech/MSSS.", "3 regions, 1 space weather event, 3 layers and 3 extra spots: the MVP planned for the 48 hours."]]].forEach(([sel,ens])=>{document.querySelectorAll(sel).forEach((el,i)=>{if(ens[i]!==undefined)STATIC.push([el,el.innerHTML,ens[i]])})});
document.title='Ankerona';
if(LANG==='en')setLang('en');
loadArt().then(()=>{genMap();renderBase();renderLayers();reset();last=performance.now();requestAnimationFrame(loop)});
})();
