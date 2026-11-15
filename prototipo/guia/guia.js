/* Código do guia de sobrevivência v3 (extraído do HTML original). / Survival guide v3 code (extracted from the original HTML). */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const cv=$('#cv'), g=cv.getContext('2d');
g.imageSmoothingEnabled=false;
const SW=160, SH=144, T=16, MW=48, MH=36;
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
const HABP={x:5,y:29,w:2,h:2}, ROVP={x:30,y:24,w:2,h:1};
const START={x:7,y:30};
const POIS=[
  {id:'ykb',name:'Yellowknife Bay',x:15,y:25},
  {id:'bag',name:'Dunas Bagnold',x:25,y:17},
  {id:'box',name:'Formações boxwork',x:41,y:6}
];
/* ponto opcional: Rocknest, onde o Curiosity achou água presa no solo */
const OPTS=[
  {id:'rock',name:'Rocknest',x:19,y:31},
  {id:'murray',name:'Formação Murray',x:35,y:20},
  {id:'vrr',name:'Vera Rubin Ridge',x:35,y:12},
  {id:'gediz',name:'Gediz Vallis',x:45,y:10}
];
function genMap(){
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const e=0.5*(x/(MW-1))+0.5*((MH-1-y)/(MH-1))+0.34*(vn(x/7,y/7,3)-0.5);
    elev[I(x,y)]=e; band[I(x,y)]=Math.max(0,Math.min(7,Math.floor(e*8)));
  }
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    let t=R; const e=elev[I(x,y)];
    const sx=25+(vn(x/4,y/4,5)-0.5)*5;
    if(y>=11&&y<=24&&Math.abs(x-sx)<3.4&&vn(x/3,y/3,9)>0.28) t=SAND;
    if(t===R){
      const b=band[I(x,y)];
      const edge=(x+1<MW&&band[I(x+1,y)]!==b)||(y+1<MH&&band[I(x,y+1)]!==b);
      if(edge&&e>0.42&&hash(x,y,7)<0.62) t=CLIFF;
      else if(hash(x,y,11)<0.06) t=ROCK;
    }
    if(x===0||y===0||x===MW-1||y===MH-1) t=CLIFF;
    tile[I(x,y)]=t;
  }
  const clear=(x,y)=>{if(inMap(x,y)&&x>0&&y>0&&x<MW-1&&y<MH-1){const t=tile[I(x,y)];if(t===ROCK||t===CLIFF)tile[I(x,y)]=R}};
  const carve=(a,b,s)=>{let x=a.x,y=a.y,k=0;clear(x,y);
    while((x!==b.x||y!==b.y)&&k<400){k++;const dx=b.x-x,dy=b.y-y;
      const hor=dy===0||(dx!==0&&hash(x+k,y,s)<Math.abs(dx)/(Math.abs(dx)+Math.abs(dy)));
      if(hor)x+=Math.sign(dx);else y+=Math.sign(dy);clear(x,y)}};
  const way=[START,{x:12,y:28},POIS[0],{x:20,y:22},POIS[1],{x:29,y:22},{x:31,y:23},{x:34,y:16},{x:38,y:11},POIS[2]];
  for(let i=0;i<way.length-1;i++)carve(way[i],way[i+1],40+i);
  carve(POIS[0],OPTS[0],60);carve({x:31,y:23},OPTS[1],61);carve({x:38,y:11},OPTS[2],62);carve(POIS[2],OPTS[3],63);
  const ring=(cx,cy,w,h,r)=>{for(let y=cy-r;y<cy+h+r;y++)for(let x=cx-r;x<cx+w+r;x++)clear(x,y)};
  POIS.forEach(p=>ring(p.x,p.y,1,1,1)); OPTS.forEach(p=>ring(p.x,p.y,1,1,1));
  const RK=OPTS[0];for(let y=RK.y-1;y<=RK.y+1;y++)for(let x=RK.x-1;x<=RK.x+1;x++)if(inMap(x,y)&&!(x===RK.x&&y===RK.y)&&hash(x,y,61)<0.5)tile[I(x,y)]=SAND;
  /* Formação Murray: campo de rochas pontiagudas esculpidas pelo vento (as que furaram as rodas do Curiosity) */
  for(let y=15;y<=22;y++)for(let x=31;x<=38;x++)if(tile[I(x,y)]===R&&vn(x/2,y/2,71)>0.42&&!(x===OPTS[1].x&&y===OPTS[1].y))tile[I(x,y)]=SHARP;
  ring(HABP.x,HABP.y,HABP.w,HABP.h,2); ring(ROVP.x,ROVP.y,ROVP.w,ROVP.h,1);
  for(let y=HABP.y;y<HABP.y+HABP.h;y++)for(let x=HABP.x;x<HABP.x+HABP.w;x++)tile[I(x,y)]=HAB;
  for(let x=ROVP.x;x<ROVP.x+ROVP.w;x++)tile[I(x,ROVP.y)]=ROV;
}
const walkable=(x,y)=>inMap(x,y)&&(tile[I(x,y)]===R||tile[I(x,y)]===SAND||tile[I(x,y)]===SHARP);

/* ---------------- custos da caminhada (M1) ----------------
   Um traje carrega O₂ para cerca de 8 h (480 min de jogo). Cada tile custa tempo e esforço:
   regolito firme 3 min, areia fofa 6 min; subir encosta aumenta o esforço. */
const SUIT_MIN=480;
const stepMin=t=>t===SAND?6:3;
const stepEff=(t,up)=>(t===SAND?1.6:1.2)*(up?1.25:1);
const o2PerMin=()=>100/SUIT_MIN;
/* custo de O₂ (%) para voltar de cada tile ao abrigo mais próximo (Dijkstra a partir do habitat e do rover) */
const retCost=new Float32Array(MW*MH).fill(1e9);
function computeReturn(){
  const done=new Uint8Array(MW*MH);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(walkable(x,y)&&(nearRect(HABP,x,y)||nearRect(ROVP,x,y)))retCost[I(x,y)]=0;
  for(;;){let bi=-1,bv=1e9;for(let i=0;i<MW*MH;i++)if(!done[i]&&retCost[i]<bv){bv=retCost[i];bi=i}
    if(bi<0)break;done[bi]=1;const x=bi%MW,y=(bi/MW)|0;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!walkable(nx,ny))continue;
      const t=tile[bi];const c=stepMin(t)*stepEff(t,false)*o2PerMin();
      if(bv+c<retCost[I(nx,ny)])retCost[I(nx,ny)]=bv+c}}
}

/* ---------------- pixel helpers ---------------- */
function px(c,x,y,w=1,h=1,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function disc(c,cx,cy,r,col){c.fillStyle=col;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*0.6)c.fillRect(cx+x,cy+y,1,1)}
function planet(c,cx,cy,r,c1,c2,c3){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=x*x+y*y;if(d>r*r+r*0.6)continue;
  const k=(x*0.8+y*0.45)/r+(((x+y)&1)?0.07:-0.07);c.fillStyle=k>0.42?c3:(k>0.0?c2:c1);c.fillRect(cx+x,cy+y,1,1)}}

/* ---------------- prerender map ---------------- */
const base=document.createElement('canvas');base.width=MW*T;base.height=MH*T;const b=base.getContext('2d');
const layers={};
function drawGround(x,y){const X=x*T,Y=y*T,e=elev[I(x,y)];
  px(b,X,Y,T,T,P[2]);
  /* camadas de rocha expostas nas partes altas: os sedimentos do Monte Sharp */
  if(e>0.58&&vn(x/3,y/5,31)>0.45){for(let r=2;r<T;r+=4){const o=Math.floor(hash(x,y+r,33)*4);px(b,X,Y+r,T,1,P[3]);px(b,X+o,Y+r+1,T-o-2,1,P[1])}}
  for(let i=0;i<9;i++){const sx=Math.floor(hash(x*13+i,y,21)*T),sy=Math.floor(hash(x,y*17+i,22)*T);
    px(b,X+sx,Y+sy,1,1,hash(x+i,y+i,23)<(e>0.62?0.65:0.4)?P[3]:P[1])}
  /* pedrinhas com luz e sombra */
  const n=Math.floor(hash(x,y,24)*3);for(let i=0;i<n;i++){const sx=1+Math.floor(hash(x+i,y,25)*12),sy=1+Math.floor(hash(x,y+i,26)*12);
    px(b,X+sx,Y+sy+1,3,1,P[1]);px(b,X+sx,Y+sy,2,1,P[4]);px(b,X+sx+2,Y+sy,1,1,P[3])}
}
function renderBase(){
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=tile[I(x,y)],X=x*T,Y=y*T;
    if(t===SAND){px(b,X,Y,T,T,P[3]);
      for(const r of [3,8,13])for(let i=0;i<T;i++){if(((i+x*5+r*3)%8)<4){px(b,X+i,Y+r,1,1,P[2]);px(b,X+i,Y+r-1,1,1,P[4])}}
    }else if(t===CLIFF){px(b,X,Y,T,T,P[1]);px(b,X,Y,T,2,P[2]);px(b,X,Y+15,T,1,P[0]);
      for(let i=0;i<3;i++){const cx=Math.floor(hash(x,y,30+i)*14)+1;px(b,X+cx,Y+3,1,9,P[0]);px(b,X+cx+1,Y+5,1,4,P[2])}
    }else{drawGround(x,y);
      if(t===SHARP){for(let k=0;k<5;k++){const sx=1+Math.floor(hash(x,y,80+k)*13),sy=3+Math.floor(hash(x,y,90+k)*10);
        px(b,X+sx-1,Y+sy+3,4,1,P[1]);px(b,X+sx,Y+sy,1,3,P[0]);px(b,X+sx+1,Y+sy+1,1,2,P[1]);px(b,X+sx,Y+sy-1,1,1,P[4])}}
      if(t===ROCK){px(b,X+3,Y+13,11,1,P[0]);px(b,X+3,Y+7,10,6,P[1]);px(b,X+5,Y+5,7,2,P[1]);
        px(b,X+5,Y+6,4,1,P[3]);px(b,X+4,Y+8,2,1,P[2]);px(b,X+11,Y+9,1,3,P[0]);px(b,X+2,Y+8,1,5,P[0]);px(b,X+13,Y+7,1,6,P[0]);px(b,X+5,Y+4,7,1,P[0])}
    }
  }
  // habitat dome 32x32
  {const X=HABP.x*T,Y=HABP.y*T;px(b,X+2,Y+26,28,4,P[1]);disc(b,X+16,Y+18,13,P[0]);disc(b,X+16,Y+18,12,P[5]);
   for(let yy=-12;yy<=12;yy++)for(let xx=0;xx<=12;xx++){if(xx*xx+yy*yy<=150&&xx+yy>6&&((xx+yy)&1))px(b,X+16+xx,Y+18+yy,1,1,P[4])}
   px(b,X+2,Y+24,28,6,P[2]);px(b,X+2,Y+24,28,1,P[0]);px(b,X+13,Y+20,6,10,P[1]);px(b,X+14,Y+21,4,1,P[3]);
   px(b,X+7,Y+12,4,3,P[1]);px(b,X+21,Y+12,4,3,P[1]);px(b,X+15,Y+3,2,3,P[0])}
  // pressurized rover 32x16
  {const X=ROVP.x*T,Y=ROVP.y*T;px(b,X+2,Y+4,28,7,P[0]);px(b,X+3,Y+5,26,5,P[5]);px(b,X+20,Y+1,9,4,P[0]);px(b,X+21,Y+2,7,3,P[4]);
   px(b,X+23,Y+2,4,2,P[1]);px(b,X+4,Y+2,14,2,P[1]);px(b,X+3,Y+8,26,1,P[4]);
   for(const wx of [7,16,25]){disc(b,X+wx,Y+12,3,P[0]);px(b,X+wx,Y+12,1,1,P[2])}}
}
function mkLayer(fn){const c=document.createElement('canvas');c.width=MW*T;c.height=MH*T;const l=c.getContext('2d');fn(l);return c}
function renderLayers(){
  const BC=['#1a0d0b','#341711','#4f2216','#6e3019','#91431f','#b5602f','#d68a52','#f0c08a'];
  layers.TOPOGRAFIA=mkLayer(l=>{l.globalAlpha=0.6;
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){l.fillStyle=BC[band[I(x,y)]];l.fillRect(x*T,y*T,T,T)}
    l.globalAlpha=1;
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const bb=band[I(x,y)];
      if(x+1<MW&&band[I(x+1,y)]!==bb)px(l,x*T+15,y*T,1,T,P[5]);
      if(y+1<MH&&band[I(x,y+1)]!==bb)px(l,x*T,y*T+15,T,1,P[5])}
  });
  layers.MINERAIS=mkLayer(l=>{
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const e=elev[I(x,y)],d=Math.hypot(x-POIS[0].x,y-POIS[0].y);
      let col=null;
      if(d<7&&vn(x/3,y/3,17)>0.32)col=ACC.clay;
      else if(e>0.7&&vn(x/4,y/4,13)>0.38)col=ACC.sulf;
      if(col){l.globalAlpha=0.62;l.fillStyle=col;l.fillRect(x*T,y*T,T,T);l.globalAlpha=1;
        for(let i=0;i<T;i+=4)px(l,x*T+i+((y&1)*2),y*T+i,1,1,P[0])}
      else{l.globalAlpha=0.4;l.fillStyle=P[0];l.fillRect(x*T,y*T,T,T);l.globalAlpha=1}}
  });
  layers.TERRENO=mkLayer(l=>{
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=tile[I(x,y)],X=x*T,Y=y*T;
      if(t===SAND){l.globalAlpha=0.5;l.fillStyle=ACC.soft;l.fillRect(X,Y,T,T);l.globalAlpha=1;for(let i=0;i<T;i++)if(i%4<2){px(l,X+i,Y+((i*1+y*3)%T),1,1,P[0])}}
      else if(t===CLIFF){l.globalAlpha=0.6;l.fillStyle=ACC.alert;l.fillRect(X,Y,T,T);l.globalAlpha=1}
      else if(t===SHARP){l.globalAlpha=0.55;l.fillStyle='#ff9a4a';for(let i=0;i<T;i+=4)l.fillRect(X+i,Y,2,T);l.globalAlpha=1}
      else if(t===ROCK){l.globalAlpha=0.45;l.fillStyle=ACC.alert;l.fillRect(X+3,Y+4,10,9);l.globalAlpha=1}
      else if(t===R){l.globalAlpha=0.3;l.fillStyle=P[0];l.fillRect(X,Y,T,T);l.globalAlpha=1}}
    l.strokeStyle=ACC.safe;l.lineWidth=2;
    l.strokeRect(HABP.x*T-1,HABP.y*T-1,HABP.w*T+2,HABP.h*T+2);
    l.strokeRect(ROVP.x*T-1,ROVP.y*T-1,ROVP.w*T+2,ROVP.h*T+2);
  });
}
const LAYER_INFO={
  MAPA:{chips:[],note:'Vista normal do terreno. Toque em CAMADA para trocar a camada de dados.'},
  TOPOGRAFIA:{chips:[['#341711','mais baixo'],['#b5602f','médio'],['#f0c08a','mais alto'],['#f7ead8','curva de nível']],
    note:'<strong>Topografia.</strong> Faixas de elevação com curvas de nível. A encosta sobe para o Monte Sharp, no nordeste. Na versão final: modelos de elevação do HiRISE (MRO).'},
  MINERAIS:{chips:[['#6fb0a0','argilominerais'],['#e3d06a','sulfatos']],
    note:'<strong>Minerais.</strong> Argilas indicam água antiga de baixa acidez. As camadas altas do Monte Sharp são ricas em sulfatos. Na versão final: espectros do CRISM (MRO) e análises do Curiosity.'},
  TERRENO:{chips:[['#ffd27a','areia fofa'],['#ff9a4a','rocha pontiaguda'],['#ff6a45','encosta ou rocha'],['#9ad48a','abrigo']],
    note:'<strong>Terreno.</strong> Mostra onde é arriscado pisar e onde se abrigar. Areia fofa gasta mais O₂ e deixa você mais lenta. Rochas pontiagudas desgastam as rodas do Tatu.'}
};
/* ---------------- guide ---------------- */
const GUIDE=[
 {id:'cruise',title:'Radiação na viagem',body:'Fora da proteção do campo magnético da Terra, a radiação é constante. Durante o cruzeiro até Marte, o instrumento RAD, a bordo do Curiosity, mediu cerca de 1,8 mSv por dia.',lesson:'Lição: tenha um abrigo blindado na nave e um plano para alertas solares.',src:'Fonte: NASA/JPL · MSL RAD (Zeitlin et al., Science, 2013)'},
 {id:'env',title:'O ambiente de Marte',body:'A gravidade é 38% da terrestre e a pressão atmosférica é menos de 1% da da Terra. Um dia marciano, o sol, dura 24h39min.',lesson:'Lição: o traje fica pressurizado o tempo todo. Planeje a EVA pela duração do oxigênio.',src:'Fonte: NASA Mars Exploration Program'},
 {id:'ret',title:'Ponto de retorno',body:'Uma pessoa consome cerca de 0,84 kg de oxigênio por dia. No traje, o estoque é fixo, e subir encostas ou andar na areia fofa aumenta o esforço e o consumo. Neste jogo, o marcador VOLTA calcula o O₂ necessário para chegar ao abrigo mais próximo.',lesson:'Lição: planeje a volta antes da ida. O O₂ que resta precisa cobrir o caminho até o abrigo, com folga.',src:'Fonte: NASA Ames · Jones e Kliss, Advanced Life Support for the Flexible Path (2010)'},
 {id:'water',title:'Marte já teve água',body:'Em 2013, o Curiosity perfurou as rochas de Yellowknife Bay e encontrou argilominerais. Ali existiu um lago com água pouco salgada e de pH neutro, um ambiente que poderia ter sustentado vida microbiana.',lesson:'Lição: rochas sedimentares finas, como lamitos, são os melhores alvos para buscar sinais de habitabilidade.',src:'Fonte: NASA/JPL-Caltech · MSL (Grotzinger et al., Science, 2014)'},
 {id:'soil',title:'Água presa no solo',body:'Em Rocknest, o instrumento SAM do Curiosity aqueceu areia marciana a cerca de 835 °C e mediu cerca de 2% de água em peso. Isso dá perto de 1 litro de água a cada 0,03 m³ de solo.',lesson:'Lição: em Gale não há rios nem poços. A água para uma base viria do próprio solo, aquecido.',src:'Fonte: NASA/JPL-Caltech · MSL SAM (Leshin et al., Science, 2013)'},
 {id:'sand',title:'Areia fofa',body:'As Dunas Bagnold são dunas ativas, que se movem com o vento. O Curiosity as estudou em 2015 e 2016. Em 2009, o rover Spirit atolou em solo fofo e não conseguiu mais sair.',lesson:'Lição: evite areia fofa e teste o solo antes de avançar com carga.',src:'Fonte: NASA/JPL-Caltech · MSL Curiosity; MER Spirit'},
 {id:'spe',title:'Partículas solares',body:'Na superfície, o RAD mediu em média cerca de 0,64 mSv por dia. Um evento de partículas solares pode elevar a dose em pouco tempo. As taxas do evento neste jogo são simuladas.',lesson:'Lição: monitore os alertas de clima espacial e mantenha um abrigo sempre a poucos minutos.',src:'Fonte: NASA/JPL · MSL RAD (Hassler et al., Science, 2014)'},
 {id:'air',title:'Ar feito de Marte',body:'O MOXIE, a bordo do Perseverance, tirou oxigênio do CO₂ da atmosfera marciana: até 10,5 g por hora, acima da meta de 6 g/h. Uma pessoa precisa de cerca de 35 g/h, e uma versão para tripulações teria de ser cerca de 200 vezes mais rápida.',lesson:'Lição: o habitat pode fabricar O₂ com o ar de Marte, mas isso consome energia. Sem energia, a recarga fica lenta.',src:'Fonte: NASA/JPL · Mars 2020 MOXIE (2022)'},
 {id:'layers',title:'O livro de camadas',body:'A Formação Murray, na base do Monte Sharp, é feita de lamitos em camadas finas, depositados no fundo de lagos antigos. A montanha tem cerca de 5 km de altura, quase toda em camadas de sedimento. Subir é como virar as páginas da história da água em Marte.',lesson:'Lição: quanto mais alto, mais recente a camada. A rota pela encosta é também uma viagem no tempo.',src:'Fonte: NASA/JPL-Caltech · MSL Curiosity (Formação Murray, 2014 em diante)'},
 {id:'wheels',title:'Rodas e rochas pontiagudas',body:'Em 2013, as rodas de alumínio do Curiosity ganharam furos e rasgos ao passar por rochas de 7 a 10 cm, esculpidas pelo vento como dentes. A equipe mudou a rota até o Monte Sharp e passou a dirigir de ré nos piores trechos.',lesson:'Lição: o caminho mais curto nem sempre é o mais seguro. Use a camada TERRENO para desviar das rochas pontiagudas.',src:'Fonte: NASA/JPL-Caltech · MSL Curiosity (2013–2014)'},
 {id:'hematite',title:'Crista de hematita',body:'A Vera Rubin Ridge é uma crista resistente no Monte Sharp, rica em hematita, um óxido de ferro que costuma se formar na presença de água. O Curiosity subiu e estudou a crista em 2017 e 2018.',lesson:'Lição: cristas duras resistem à erosão e guardam pistas de água que circulou nas rochas.',src:'Fonte: NASA/JPL-Caltech · MSL Curiosity (2017–2018)'},
 {id:'box',title:'Formações boxwork',body:'São redes de cristas na rocha. Água subterrânea depositou minerais em fraturas, e a erosão depois removeu a rocha em volta, deixando as cristas em relevo. O Curiosity estudou essas formações em 2025, no Monte Sharp.',lesson:'Lição: essas cristas registram água subterrânea depois que os lagos secaram. É ciência que só se faz no local.',src:'Fonte: NASA/JPL-Caltech · MSL Curiosity (2025)'},
 {id:'sulfur',title:'Cristais de enxofre',body:'Em maio de 2024, em Gediz Vallis, o Curiosity passou por cima de uma rocha, que rachou e revelou cristais amarelos de enxofre puro. Foi a primeira vez que se encontrou enxofre puro em Marte.',lesson:'Lição: na exploração, o inesperado aparece no chão. Registre e fotografe antes de seguir.',src:'Fonte: NASA/JPL-Caltech/MSSS · MSL Curiosity (2024)'},
 {id:'devil',title:'Redemoinhos de poeira',body:'Redemoinhos de poeira cruzam a Cratera Gale, e o Curiosity filmou vários deles. Nos rovers solares Spirit e Opportunity, rajadas e redemoinhos às vezes limparam os painéis e devolveram energia de uma hora para outra.',lesson:'Lição: o vento que suja também limpa. Mesmo assim, não conte com a sorte: limpe os painéis na base.',src:'Fonte: NASA/JPL-Caltech · MSL Curiosity; MER Spirit e Opportunity'},
 {id:'cold',title:'A noite marciana',body:'Em Gale, a estação REMS do Curiosity mediu máximas de cerca de 0 °C e mínimas de cerca de −70 °C. O helicóptero Ingenuity precisou manter um aquecedor ligado na bateria para sobreviver a noites de −90 °C.',lesson:'Lição: volte antes do pôr do sol. À noite, o aquecimento do traje e do rover consome a reserva.',src:'Fonte: NASA · MSL REMS (2012); NASA/JPL · Ingenuity (2021)'},
 {id:'storm',title:'Poeira e energia solar',body:'Em junho de 2018, uma tempestade global de poeira derrubou a energia do rover Opportunity de cerca de 645 Wh para 22 Wh por sol em uma semana. A opacidade do ar (tau) chegou a 10,8, recorde em Marte. O rover nunca mais respondeu. O Curiosity, movido a energia nuclear, seguiu trabalhando.',lesson:'Lição: com energia solar, poeira no céu e nos painéis é falta de energia. Na tempestade, volte à base e desligue o que não for essencial.',src:'Fonte: NASA/JPL · MER Opportunity; The Planetary Society (2018)'},
 {id:'sunset',title:'O pôr do sol azul',body:'Em 2015, o Curiosity fotografou o pôr do sol na Cratera Gale. De dia o céu marciano é cor de caramelo, mas ao entardecer a região em volta do sol fica azulada, porque a poeira fina espalha a luz azul na direção do sol.',lesson:'Lição: a mesma poeira que pinta o céu decide quanta luz chega aos painéis.',src:'Fonte: NASA/JPL-Caltech/MSSS · MSL Mastcam (2015)'},
 {id:'earth',title:'A Terra no céu de Marte',body:'Em 2014, logo depois do pôr do sol, o Curiosity fotografou a Terra e a Lua no céu da Cratera Gale. Vista de Marte, a Terra parece uma estrela brilhante da tarde.',lesson:'Lição: cada mensagem para casa leva vários minutos para chegar. Em Marte, a tripulação decide sozinha.',src:'Fonte: NASA/JPL-Caltech/MSSS/TAMU · MSL Mastcam (2014)'},
 {id:'dust',title:'Poeira tóxica',body:'O solo marciano tem cerca de 0,5 a 1% de percloratos, sais que afetam a tireoide. A sonda Phoenix os detectou em 2008, e o Curiosity também os encontrou na Cratera Gale.',lesson:'Lição: limpe o traje na eclusa antes de entrar. Poeira dentro do habitat é risco para toda a tripulação.',src:'Fonte: NASA/JPL · Phoenix Mars Lander; MSL Curiosity'}
];
const GN=GUIDE.length;

/* ---------------- state ---------------- */
let S;
function reset(){
  S={mode:'title',t:0,min:8*60,o2:100,o2min:100,dose:0,step:0,layers:['MAPA','TOPOGRAFIA'],layer:0,guide:new Set(),
     p:{x:START.x,y:START.y,fx:START.x,fy:START.y,ox:START.x,oy:START.y,mt:1,dur:.16,face:1,frame:0},
     trail:[{x:START.x-1,y:START.y}],spe:null,teaser:0,teaserT:0,edlT:0,guideOpen:false,guideSel:0,bumpT:0,refillT:0,visited:new Set(),hudT:0,
     /* v2 */
     tatu:82,tatuMin:82,tatuOff:false,panel:0,suit:0,away:false,cleans:0,skips:0,breaches:0,inBreach:false,retWarned:false,
     coldWarnSol:0,nightAborts:0,o2Outs:0,storm:null,tau:0.5,al:null,lowRefillMsg:false,
     /* v3 */ wheels:100,prints:[],devil:null,lastDevil:560,tips:new Set(),seenDusk:false,duskT:0,duskAfter:null,mini:0,stepsKey:''};
  D=null;$('#dlg').hidden=true;$('#hud').hidden=true;toastHide();
  updLegend();showTitle();
}

/* ---------------- dialog ---------------- */
let D=null;
const dlg=$('#dlg'),dW=$('#dlgWho'),dT=$('#dlgTxt');
function say(lines,done){D={lines,i:0,shown:0,done};startLine()}
function startLine(){const L=D.lines[D.i];const o=typeof L==='string'?{t:L}:L;D.cur=o;D.shown=0;
  dlg.hidden=false;dW.textContent=o.who||'';dW.hidden=!o.who;dT.textContent='';
  dlg.classList.toggle('alert',!!o.alert);dlg.classList.toggle('guide',!!o.guide);dlg.classList.remove('ready');
  if(o.guide)unlockGuide(o.guide);if(o.layer)unlockLayer(o.layer);if(o.fx)o.fx()}
function updDialog(dt){if(!D)return;const f=D.cur.t;
  if(D.shown<f.length){D.shown=Math.min(f.length,D.shown+dt*60);dT.textContent=f.slice(0,Math.floor(D.shown))}
  else dlg.classList.add('ready')}
function advDialog(){if(!D)return;if(D.shown<D.cur.t.length){D.shown=D.cur.t.length;dT.textContent=D.cur.t;return}
  D.i++;if(D.i>=D.lines.length){const cb=D.done;D=null;dlg.hidden=true;cb&&cb()}else startLine()}

/* ---------------- toast ---------------- */
const toastEl=$('#toast');let toastTimer=0;
function toast(msg,kind){toastEl.textContent=msg;toastEl.className='toast'+(kind?' '+kind:'');toastEl.hidden=false;toastTimer=2.2}
function toastHide(){toastEl.hidden=true;toastTimer=0}

function unlockGuide(id){if(S.guide.has(id))return;S.guide.add(id);const e=GUIDE.find(g=>g.id===id);toast('+ GUIA: '+e.title.toUpperCase(),'good')}
function unlockLayer(name){if(!S.layers.includes(name))S.layers.push(name);S.layer=S.layers.indexOf(name);updLegend()}
function updLegend(){const n=S?S.layers[S.layer]:'MAPA',info=LAYER_INFO[n];
  $('#lgName').textContent=n;$('#layerTag').textContent=n;
  $('#lgChips').innerHTML=info.chips.map(c=>`<span><i style="background:${c[0]}"></i>${c[1]}</span>`).join('');
  $('#lgNote').innerHTML=info.note}

/* ---------------- overlays ---------------- */
const ov=$('#ov');
function setOv(html,cls){ov.className='ov '+(cls||'');ov.innerHTML=html;ov.hidden=!html}
function showTitle(){setOv(`<h2>MARTE<br>GUIA DE<br>SOBREVIVÊNCIA</h2><p class="sub">Cratera Gale · Sol 1</p><button class="start" id="startBtn">▶ JOGAR</button><p class="tiny">Z / A para começar</p>`,'title');
  $('#startBtn').addEventListener('click',()=>act('A'))}

const TEASER=[
 {yr:'',art:'intro',l:['Desde sempre, olhamos para o céu e nos perguntamos o que havia além.','Durante milênios, ele foi apenas um sonho.','Até que, um dia, decidimos ir.']},
 {yr:'1961',art:'ham',l:['Antes de qualquer astronauta, foi ele.','Um chimpanzé chamado Ham, a bordo de uma cápsula Mercury.','Subiu, enfrentou o desconhecido... e voltou vivo.','Provou que era possível.']},
 {yr:'1961 – 1983',art:'orbit',l:['Alan Shepard rompeu a barreira e foi ao espaço.','“Boa viagem, John Glenn.” Com essas palavras, Glenn deu três voltas ao redor da Terra.','Anos depois, Sally Ride mostrou que o espaço pertencia a todos.']},
 {yr:'20 · JUL · 1969',art:'moon',l:['Milhões de pessoas em silêncio. Neil Armstrong desce a escada.','“Um pequeno passo para o homem, um salto gigante para a humanidade.”','Ao seu lado, Buzz Aldrin. Na órbita, Michael Collins esperando por eles.']},
 {yr:'1970',art:'a13',l:['“Houston, tivemos um problema.”','A 300 mil quilômetros de casa, uma explosão.','Lovell, Swigert e Haise tinham uma única missão: sobreviver.','E sobreviveram.']},
 {yr:'1976 – 2021',art:'robots',l:['Por décadas, enviamos nossos olhos onde ainda não podíamos ir.','Viking. Spirit. Opportunity. Curiosity. Perseverance.','Cada dado era uma promessa: um dia, alguém viria.']},
 {yr:'HOJE',art:'artemis',l:['Meio século depois, voltamos à Lua.','A tripulação da Artemis II (Wiseman, Glover, Koch e Hansen) contornou seu lado oculto e olhou adiante.','Para um ponto vermelho no céu.']},
 {yr:'',art:'mars',l:['Os robôs mapearam o caminho.','<big>Agora é a nossa vez.'],end:true}
];
function showTeaser(i){S.teaser=i;S.teaserT=0;const s=TEASER[i];
  const lines=s.l.map((t,k)=>{const big=t.startsWith('<big>');return `<p class="${big?'big':''}" style="animation-delay:${0.35+k*0.85}s">${big?t.slice(5):t}</p>`}).join('');
  const dots=TEASER.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('');
  setOv(`<span class="skip">B: PULAR</span>${s.yr?`<span class="yr">${s.yr}</span>`:''}<div class="lines">${lines}</div><div class="dots">${dots}</div>`,'teaser')}

function showEDL(){setOv(`<span class="hd">7 MINUTOS DE TERROR</span><span class="clock" id="edlClock">7:00</span><span class="ph" id="edlPh">ENTRADA</span><span class="v" id="edlV">21.000 km/h</span>
  <div class="note">O sinal leva minutos para chegar à Terra. Ninguém pode intervir a tempo: tudo é automático.</div>`,'edl')}

function showGuide(){S.guideOpen=true;renderGuide()}
function renderGuide(){const got=S.guide.size,sel=GUIDE[S.guideSel],has=S.guide.has(sel.id);
  const list=GUIDE.map((g,k)=>`<button data-g="${k}" class="${S.guide.has(g.id)?'got':''} ${k===S.guideSel?'sel':''}" aria-label="${S.guide.has(g.id)?g.title:'Entrada bloqueada'}">${k+1}</button>`).join('');
  const body=has?`<h3>${sel.title}</h3><p>${sel.body}</p><p class="lesson">${sel.lesson}</p><p class="src">${sel.src}</p>`
    :`<h3>???</h3><p class="locked">Entrada ainda não registrada. Continue a missão para descobri-la.</p>`;
  setOv(`<div class="gh">GUIA DE CAMPO<span>${got}/${GN}</span></div><div class="glist">${list}</div><div class="gbody">${body}</div><div class="gfoot">◀ ▶ NAVEGAR · B FECHAR</div>`,'guide');
  ov.querySelectorAll('[data-g]').forEach(bt=>bt.addEventListener('click',()=>{S.guideSel=+bt.dataset.g;renderGuide()}))}
function closeGuide(){S.guideOpen=false;setOv('');if(S.mode==='ending')showEnding();if(S.mode==='airlock')showAirlock()}

function safetyScore(){let s=100;s-=15*S.breaches;s-=10*S.skips;s-=15*S.nightAborts;s-=20*S.o2Outs;
  if(S.o2min<15)s-=10;if(S.dose>0.4)s-=10;return Math.max(0,s)}
function showEnding(){const h=fmtClock();S.stepsKey='';try{updPanel()}catch(e){}
  setOv(`<p style="animation-delay:.2s">De volta ao habitat, a Dra. Lia Moreno envia uma última mensagem.</p>
  <p style="animation-delay:1.2s">Ela levará muitos minutos para chegar à Terra.</p>
  <p style="animation-delay:2.2s">Anexado: o Guia de Sobrevivência de Marte, escrito sol após sol.</p>
  <p style="animation-delay:3.2s">Para a próxima tripulação.</p>
  <div class="stats" style="animation-delay:4.2s">CIÊNCIA ${S.guide.size}/${GN} · SEGURANÇA ${safetyScore()}/100<br>DOSE ${fmtDose(S.dose)} · O2 MÍN ${Math.round(S.o2min)}% · ${h}<br>EXTRAS ${OPTS.filter(o=>S.visited.has(o.id)).length}/${OPTS.length} · LIMPEZAS ${S.cleans}/${S.cleans+S.skips}<br>RETORNO ULTRAPASSADO ${S.breaches}× · RODAS ${Math.round(S.wheels)}%</div>
  <div class="acts" style="animation-delay:4.8s"><button id="gBtn">VER GUIA</button><button id="rBtn">JOGAR DE NOVO</button></div>`,'end');
  $('#gBtn').addEventListener('click',()=>act('G'));$('#rBtn').addEventListener('click',()=>{reset()})}

/* ---------------- eclusa (M5) ---------------- */
function showAirlock(){const a=S.al;const pct=a&&a.t>0?Math.min(100,Math.round(a.t/3*100)):0;
  setOv(`<span class="hd">ECLUSA DO HABITAT</span>
  <p class="sub">Poeira no traje: ${Math.round(S.suit)}%</p>
  <div class="albar"><b id="alFill" style="width:${pct}%"></b></div>
  <p class="altxt" id="alTxt">${a&&a.t>0?'Aspirando e escovando o traje...':'O solo tem percloratos. Limpar leva alguns minutos.'}</p>
  <div class="acts"><button id="alA">A · LIMPAR</button><button id="alB" class="ghost">B · ENTRAR SEM LIMPAR</button></div>`,'airlock');
  $('#alA').addEventListener('click',()=>act('A'));$('#alB').addEventListener('click',()=>act('B'))}
function closeDlg(){D=null;dlg.hidden=true}
function startAirlock(){closeDlg();S.mode='airlock';S.al={t:0,run:false};showAirlock()}
function finishAirlock(cleaned){setOv('');S.mode='play';S.away=false;S.al=null;
  if(cleaned){S.cleans++;S.suit=0;S.min+=10;toast('TRAJE LIMPO','good');unlockGuide('dust')}
  else{S.skips++;toast('POEIRA ENTROU NO HABITAT','bad')}
  if(S.step===4)ending();
  else if(hour()>=15)askRest()}
function askRest(){say([{who:'COMANDANTE RUIZ',t:'Fim de tarde. Descanse até o próximo sol: o Tatu recarrega na base e o traje é reabastecido.'}],()=>restSol())}

/* ---------------- flow ---------------- */
function startTravel(){S.mode='travel';S.t=0;setOv('');
  say([
    {who:'DIÁRIO DE BORDO',t:'A nave deixa a órbita da Terra rumo a Marte. A travessia dura cerca de 7 meses, o mesmo tempo que o Perseverance levou.'},
    {who:'DIÁRIO DE BORDO',t:'Longe do campo magnético da Terra, a radiação é constante. O Curiosity mediu cerca de 1,8 mSv por dia neste trajeto.'},
    {who:'COMANDANTE RUIZ',alert:true,t:'Alerta de tempestade solar! Todos para o abrigo, a área mais blindada da nave.',fx:()=>{S.flash=2.5}},
    {who:'+ GUIA DE CAMPO',guide:'cruise',t:'Radiação na viagem: tenha um abrigo blindado e um plano para alertas solares.'},
    {who:'DIÁRIO DE BORDO',t:'A cada mês, as mensagens para a Terra demoram mais. Perto de Marte, a conversa em tempo real deixa de existir.'},
    {who:'COMANDANTE RUIZ',t:'Marte à vista. Iniciando entrada, descida e pouso. Segurem-se.'}
  ],()=>{S.mode='edl';S.edlT=0;showEDL()})}

function startPlay(){S.mode='play';setOv('');$('#hud').hidden=false;updLegend();
  say([
    {who:'COMANDANTE RUIZ',t:'Pouso confirmado na Cratera Gale. Bem-vinda a Marte, Dra. Moreno.'},
    {who:'+ GUIA DE CAMPO',guide:'env',t:'Gravidade de 38%, pressão de menos de 1% da Terra e um sol de 24h39min. O traje tem O2 para cerca de 8 horas.'},
    {who:'COMANDANTE RUIZ',t:'Primeiro alvo: Yellowknife Bay. Siga a seta. Eu aviso pelo rádio quando algo novo aparecer.'}
  ],()=>{})}
/* dicas curtas, cada uma aparece uma vez, no momento em que faz sentido */
const TIPS={
  ret:'O risco branco na barra de O2 é o VOLTA: o oxigênio que você precisa para chegar ao abrigo. Se a barra encostar nele, volte.',
  sand:'Areia fofa: o passo fica lento e gasta mais O2. Subidas também cansam.',
  tatu:'Cada camada ligada gasta bateria do Tatu (⚡). Ela recarrega com o sol, e a poeira nos painéis atrapalha. No habitat, A limpa os painéis.',
  layer:'Novo instrumento! Aperte CAMADA (C) para alternar entre as camadas de dados.',
  dusk:'Fim de tarde. No habitat, aperte A para descansar até o próximo sol.'
};
function tip(id){if(S.tips.has(id)||D)return false;S.tips.add(id);say([{who:'DICA',t:TIPS[id]}],()=>{});return true}

const OPT_DLG={
  rock:[{who:'DRA. MORENO',t:'Rocknest. Um bolsão de areia fina, trazida pelo vento.'},
    {who:'COMANDANTE RUIZ',t:'Em 2012, o Curiosity colheu esta areia. O instrumento SAM a aqueceu a cerca de 835 °C, e saiu água: cerca de 2% do peso.'},
    {who:'+ GUIA DE CAMPO',guide:'soil',t:'Água presa no solo: perto de 1 litro a cada 0,03 m³ de areia aquecida.'}],
  murray:[{who:'DRA. MORENO',t:'Lamito em camadas finas, uma sobre a outra. Cada camada é o fundo de um lago que já existiu aqui.'},
    {who:'COMANDANTE RUIZ',t:'É a Formação Murray, a base do Monte Sharp. São cerca de 5 km de camadas até o topo.'},
    {who:'+ GUIA DE CAMPO',guide:'layers',t:'O livro de camadas: quanto mais alto, mais recente a página.'}],
  vrr:[{who:'DRA. MORENO',t:'Uma crista dura, avermelhada, resistindo ao vento. O espectrômetro acusa hematita.'},
    {who:'COMANDANTE RUIZ',t:'Vera Rubin Ridge. O Curiosity subiu esta crista em 2017 e 2018. Hematita costuma se formar com água.'},
    {who:'+ GUIA DE CAMPO',guide:'hematite',t:'Crista de hematita: ferro e água antiga.'}],
  gediz:[{who:'DRA. MORENO',t:'Pedras claras no fundo do vale... uma rachou sob a bota. Cristais amarelos!'},
    {who:'COMANDANTE RUIZ',t:'Enxofre puro. Foi assim que o Curiosity encontrou, em Gediz Vallis, em maio de 2024: passando por cima de uma rocha.'},
    {who:'+ GUIA DE CAMPO',guide:'sulfur',t:'Cristais de enxofre: a primeira vez que se viu enxofre puro em Marte.'}]
};
function visitOpt(o){S.visited.add(o.id);
  say(OPT_DLG[o.id].concat([{who:'COMANDANTE RUIZ',t:'Ponto extra registrado. Volte ao alvo quando quiser.'}]),()=>{})}

function visitPOI(i){const p=POIS[i];S.visited.add(p.id);
  if(i===0)say([
    {who:'DRA. MORENO',t:'Yellowknife Bay. Rocha de grão fino, em camadas... é um lamito.'},
    {who:'COMANDANTE RUIZ',t:'Foi aqui que o Curiosity perfurou em 2013. Encontrou argilominerais: aqui existiu um lago de água pouco salgada.'},
    {who:'+ GUIA DE CAMPO',guide:'water',t:'Marte já teve água, num ambiente que poderia ter sustentado vida microbiana.'},
    {who:'NOVO INSTRUMENTO',layer:'MINERAIS',t:'Espectrômetro pronto. Camada MINERAIS liberada. Aperte CAMADA para ver argilas e sulfatos.'},
    {who:'COMANDANTE RUIZ',t:'Próximo alvo: Dunas Bagnold. Cuidado com a areia. Se quiser um desvio, há areia interessante em Rocknest, ao sudeste.'}
  ],()=>{S.step=1});
  if(i===1)say([
    {who:'DRA. MORENO',t:'Dunas Bagnold. Dunas ativas: o vento as move até hoje.'},
    {who:'COMANDANTE RUIZ',t:'Em 2009, o rover Spirit atolou em solo fofo e nunca mais saiu. Não repita o erro.'},
    {who:'+ GUIA DE CAMPO',guide:'sand',t:'Areia fofa: evite e teste o solo antes de avançar com carga.'},
    {who:'NOVO INSTRUMENTO',layer:'TERRENO',t:'Sensor de solo pronto. Camada TERRENO liberada: ela mostra areia, encostas e abrigos.'}
  ],()=>{S.step=2;startSPE()});
  if(i===2)say([
    {who:'DRA. MORENO',t:'Lá estão elas. Cristas cruzadas, como as paredes de uma caixa.'},
    {who:'COMANDANTE RUIZ',t:'Formações boxwork. Água subterrânea depositou minerais em fraturas. A erosão deixou as cristas em relevo.'},
    {who:'+ GUIA DE CAMPO',guide:'box',t:'Boxwork: registro de água subterrânea, estudado pelo Curiosity em 2025.'},
    {who:'DRA. MORENO',t:'Amostra coletada. Objetivo científico cumprido.'}
  ],()=>{S.step=4;startStorm()});
}
function startSPE(){S.spe={phase:'warn',left:60,doseStart:S.dose};
  say([{who:'COMANDANTE RUIZ',alert:true,t:'Alerta! Os satélites detectaram uma erupção solar. As partículas chegam em cerca de 1 hora.'},
       {who:'COMANDANTE RUIZ',alert:true,t:'Vá para um abrigo: o rover pressurizado, a leste, ou o habitat. A seta indica o mais próximo.'}],()=>{})}
function endSPE(){S.spe.phase='done';const d=S.dose-S.spe.doseStart;
  say([{who:'COMANDANTE RUIZ',t:`Evento encerrado. Dose recebida durante o alerta: ${fmtDose(d)}.`},
       {who:'+ GUIA DE CAMPO',guide:'spe',t:'Partículas solares: monitore alertas e mantenha um abrigo a poucos minutos.'},
       {who:'COMANDANTE RUIZ',t:'Último alvo: as formações boxwork, subindo o Monte Sharp, ao nordeste. É uma subida longa: confira o VOLTA antes de seguir.'}],()=>{S.step=3})}
/* M2: tempestade de poeira na volta */
function startStorm(){S.storm={t:0};
  say([{who:'COMANDANTE RUIZ',alert:true,t:'Tempestade de poeira se aproximando pelo sul. A opacidade do ar está subindo rápido.'},
       {who:'COMANDANTE RUIZ',alert:true,t:'Com o céu fechado, os painéis do Tatu quase não geram energia. Desligue as camadas que não precisar e volte ao habitat.'},
       {who:'+ GUIA DE CAMPO',guide:'storm',t:'Poeira e energia: em 2018, uma tempestade assim calou o Opportunity.'}],()=>{})}
function ending(){closeDlg();$('#hud').hidden=true;if(!S.seenDusk){showDusk(()=>{S.mode='ending';showEnding()})}else{S.mode='ending';showEnding()}}
/* cena do pôr do sol azul e da Terra no céu */
function showDusk(after){S.mode='dusk';S.duskT=0;S.duskAfter=after;setOv('');$('#hud').hidden=true;S.seenDusk=true;
  setTimeout(()=>{if(S.mode!=='dusk')return;
    say([{who:'DRA. MORENO',t:'Olhe o sol se pondo atrás da borda da cratera. Em volta dele, o céu fica azul.'},
         {who:'+ GUIA DE CAMPO',guide:'sunset',t:'O pôr do sol azul: a poeira fina espalha a luz azul na direção do sol.'},
         {who:'COMANDANTE RUIZ',t:'E aquele ponto brilhante, acima do horizonte? É a Terra. Lá estão todos que nos trouxeram até aqui.'},
         {who:'+ GUIA DE CAMPO',guide:'earth',t:'A Terra no céu de Marte, como o Curiosity fotografou em 2014.'}],()=>{const f=S.duskAfter;S.duskAfter=null;f&&f()})},2200)}

/* M3: fim do sol. forced=true quando a noite pegou a astronauta do lado de fora */
function restSol(){if(!S.seenDusk)showDusk(()=>{S.mode='play';$('#hud').hidden=false;nextSol(false)});else nextSol(false)}
function nextSol(forced){const SOL=1479.5;const sol=Math.floor(S.min/SOL)+1;
  const hrs=(sol*SOL+8*60-S.min)/60;S.dose+=0.64/24*hrs;S.min=sol*SOL+8*60;
  S.o2=100;S.tatu=100;S.tatuOff=false;S.panel=Math.max(0,S.panel-0.05);S.retWarned=false;S.inBreach=false;S.away=false;
  const p=S.p;p.x=p.fx=p.ox=START.x;p.y=p.fy=p.oy=START.y;p.mt=1;S.trail=[{x:START.x-1,y:START.y}];
  if(S.spe&&S.spe.phase!=='done'){S.spe.phase='active';S.spe.left=0}
  if(forced)say([{who:'COMANDANTE RUIZ',alert:true,t:'Anoiteceu com você do lado de fora. O Tatu trouxe você de volta ao habitat, mas o traje quase não aguentou o frio.'},
                 {who:'+ GUIA DE CAMPO',guide:'cold',t:'A noite marciana: volte antes do pôr do sol.'},
                 {who:'COMANDANTE RUIZ',t:`Sol ${sol+1}, 08:00. Traje e Tatu recarregados. A missão continua.`}],()=>{});
  else say([{who:'COMANDANTE RUIZ',t:`Sol ${sol+1}, 08:00. Traje e Tatu recarregados. A missão continua.`}],()=>{})}

/* ---------------- helpers ---------------- */
const SOLM=1479.5;
function hour(){return (S.min%SOLM)/60}
function fmtClock(){const m=S.min%SOLM,sol=1+Math.floor(S.min/SOLM);const h=Math.floor(m/60),mm=Math.floor(m%60);
  return `SOL ${sol} ${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`}
function fmtDose(d){return d.toFixed(3).replace('.',',')+' mSv'}
function nearRect(r,x,y){return x>=r.x-1&&x<=r.x+r.w&&y>=r.y-1&&y<=r.y+r.h}
function sheltered(){const p=S.p;return p.mt>=1&&(nearRect(HABP,p.x,p.y)||nearRect(ROVP,p.x,p.y))}
function atHab(){const p=S.p;return p.mt>=1&&nearRect(HABP,p.x,p.y)}
/* M3: sol e temperatura. Em Gale, o REMS mediu máximas perto de 0 °C e mínimas perto de −70 °C */
function sunF(){const h=hour();return Math.max(0,Math.sin(Math.PI*(h-6)/12.3))}
function tempC(){const h=hour();return -35+35*Math.cos(2*Math.PI*(h-14)/24.65)}
function isNight(){const h=hour();return h>=18.5||h<6.5}
/* M2: transmissão da luz pela poeira (lei de Beer-Lambert simplificada). tau 0,5 deixa passar ~85%; tau 10,8 deixa ~3%,
   parecido com a queda do Opportunity em 2018 (645 Wh para 22 Wh) */
function transm(){return Math.exp(-S.tau*0.33)}
function retNeed(){const p=S.p;const c=retCost[I(p.x,p.y)];return c>=1e8?100:Math.min(100,c*1.2*(isNight()?2:1)+2)}
function target(){
  if(S.step===0)return POIS[0];if(S.step===1)return POIS[1];
  if(S.step===2){const p=S.p,dh=Math.abs(p.x-HABP.x)+Math.abs(p.y-HABP.y),dr=Math.abs(p.x-ROVP.x)+Math.abs(p.y-ROVP.y);
    return dr<dh?{x:ROVP.x,y:ROVP.y,name:'Rover pressurizado'}:{x:HABP.x,y:HABP.y,name:'Habitat'}}
  if(S.step===3)return POIS[2];return {x:HABP.x,y:HABP.y,name:'Habitat'}}
function objText(){
  if(S.step===2&&S.spe){if(S.spe.phase==='warn')return `ABRIGO JÁ! PARTÍCULAS EM ${Math.ceil(S.spe.left)} MIN`;
    if(S.spe.phase==='active')return sheltered()?`ABRIGADA · ${Math.ceil(S.spe.left)} MIN · DOSE ${fmtDose(S.dose)}`:`EXPOSTA! ABRIGO · DOSE ${fmtDose(S.dose)}`}
  if(S.storm&&S.step===4)return 'TEMPESTADE! VOLTE AO HABITAT';
  if(!sheltered()&&S.o2-retNeed()<6)return 'PONTO DE RETORNO: VOLTE AO ABRIGO';
  const t=target();return '▶ '+t.name.toUpperCase()+(sheltered()?' · ABRIGO':' · VOLTA '+Math.round(retNeed())+'%')}

/* ---------------- input ---------------- */
const held=[];const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const KEYDIR={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
const KEYACT={KeyZ:'A',Enter:'A',Space:'A',KeyX:'B',Escape:'B',Backspace:'B',KeyC:'L',KeyQ:'L',KeyG:'G'};
function hold(d){if(!held.includes(d))held.push(d);if(S.guideOpen&&(d==='left'||d==='right'||d==='up'||d==='down')){S.guideSel=(S.guideSel+(d==='left'||d==='up'?GN-1:1))%GN;renderGuide()}}
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

function act(a){
  const m=S.mode;
  if(S.guideOpen){if(a==='B'||a==='G'||a==='A')closeGuide();return}
  if(m==='title'){if(a==='A'){S.mode='teaser';showTeaser(0)}return}
  if(m==='teaser'){if(a==='A'){if(S.teaser<TEASER.length-1)showTeaser(S.teaser+1);else startTravel()}if(a==='B')startTravel();return}
  if(m==='travel'){if(a==='A'||a==='B')advDialog();return}
  if(m==='edl'){if(a==='A'){S.edlT=Math.max(S.edlT,8.6)}return}
  if(m==='ending'){if(a==='G')showGuide();return}
  if(m==='dusk'){if(D&&(a==='A'||a==='B'))advDialog();return}
  if(m==='airlock'){if(S.al.run)return;if(a==='A'){S.al.run=true;S.al.t=0.001;showAirlock()}else if(a==='B')finishAirlock(false);else if(a==='G')showGuide();return}
  if(m==='play'){
    if(D){if(a==='A'||a==='B')advDialog();return}
    if(a==='L'){if(S.tatuOff){toast('TATU SEM ENERGIA: INSTRUMENTOS OFF','bad');return}
      S.layer=(S.layer+1)%S.layers.length;updLegend();toast('CAMADA: '+S.layers[S.layer]);if(S.layer>0&&S.layers.length>2)tip('tatu');return}
    if(a==='G'){showGuide();return}
    if(a==='A'){const p=S.p;
      if(nearRect(HABP,p.x,p.y)){
        if(S.panel>0.05){S.panel=0;S.min+=15;toast('PAINÉIS DO TATU LIMPOS','good')}
        else if(hour()>=15&&S.step<4)askRest();
        else toast('HABITAT: ABRIGO E O2','good')}
      else if(nearRect(ROVP,p.x,p.y))toast('ROVER PRESSURIZADO: ABRIGO E O2','good');
      else{const t=tile[I(p.x,p.y)];toast(t===SAND?'AREIA FOFA: PASSO LENTO':'REGOLITO FIRME')}}
  }
}

/* ---------------- tempo de missão ----------------
   advance(m, eff): passa m minutos de jogo com esforço eff. Tudo que depende do tempo mora aqui:
   O₂, dose, alerta solar, energia do Tatu e tempestade. */
function advance(m,eff){
  S.min+=m;const sh=sheltered(),night=isNight();
  if(!sh)S.o2=Math.max(0,S.o2-m*o2PerMin()*eff*(night?2:1));
  let rate=0.64/24;
  if(S.spe){if(S.spe.phase==='warn'){S.spe.left-=m;if(S.spe.left<=0){S.spe.phase='active';S.spe.left=40;toast('PARTÍCULAS CHEGARAM','bad')}}
    else if(S.spe.phase==='active'){rate=sh?0.05:2.0;S.spe.left-=m;if(S.spe.left<=0&&!D)endSPE()}}
  S.dose+=rate*m/60;S.o2min=Math.min(S.o2min,S.o2);
  /* tempestade: tau sobe de 0,5 até ~9 em 40 min de jogo */
  if(S.storm){S.storm.t+=m;S.tau=Math.min(9,0.5+S.storm.t*0.21)}
  /* Tatu (M2): recarga solar e consumo por hora */
  const hrs=m/60;
  let gain=10*sunF()*transm()*(1-S.panel)*hrs;
  if(atHab())gain+=30*hrs;
  let use=(1*hrs+(S.layers[S.layer]!=='MAPA'?4*hrs:0)+(night?6*hrs:0)+(S.storm?2*hrs:0))*(S.wheels<50?1.5:1);
  S.tatu=Math.max(0,Math.min(100,S.tatu+gain-use));S.tatuMin=Math.min(S.tatuMin,S.tatu);
  checkTatu();
}
function checkTatu(){
  if(!S.tatuOff&&S.tatu<=0){S.tatuOff=true;S.layer=0;updLegend();
    say([{who:'TATU',alert:true,t:'Bateria esgotada. O Tatu entrou em hibernação e desligou os instrumentos. Só a vista normal funciona.'},
         {who:'COMANDANTE RUIZ',t:'Ele volta quando os painéis recarregarem acima de 10%, ou quando chegar à base.'}],()=>{})}
  else if(S.tatuOff&&S.tatu>10){S.tatuOff=false;toast('TATU RELIGADO','good')}
}

/* ---------------- redemoinho de poeira ----------------
   Redemoinhos são mais comuns no meio do dia. Se um passa pelo Tatu, limpa parte dos painéis,
   como aconteceu com Spirit e Opportunity. */
function updDevil(dt){const h=hour(),tr=S.trail[0];
  if(!S.devil){if(!S.storm&&S.step>=1&&h>=11&&h<=16&&S.min-S.lastDevil>110&&tr){
      const an=hash(S.min|0,7,5)*6.283,d=7;const sx=tr.x+Math.cos(an)*d,sy=tr.y+Math.sin(an)*d;
      const vx=(tr.x-sx)/d*2.2,vy=(tr.y-sy)/d*2.2;S.devil={x:sx,y:sy,vx,vy,life:6.5,hitT:false,hitP:false};S.lastDevil=S.min;
      if(!S.tips.has('devilSeen')){S.tips.add('devilSeen');toast('REDEMOINHO DE POEIRA À VISTA')}}
    return}
  const v=S.devil;v.x+=v.vx*dt;v.y+=v.vy*dt;v.life-=dt;
  if(tr&&!v.hitT&&Math.hypot(v.x-tr.x,v.y-tr.y)<1.1){v.hitT=true;const before=S.panel;S.panel=Math.max(0,S.panel-0.35);
    if(!S.guide.has('devil'))say([{who:'TATU',t:'O redemoinho passou por cima de mim e varreu a poeira dos painéis! A recarga melhorou.'},
      {who:'+ GUIA DE CAMPO',guide:'devil',t:'Redemoinhos de poeira: o vento que suja também limpa.'}],()=>{});
    else toast(before>0.05?'REDEMOINHO LIMPOU OS PAINÉIS':'REDEMOINHO PASSOU PELO TATU','good')}
  const p=S.p;if(!v.hitP&&Math.hypot(v.x-p.x,v.y-p.y)<0.9){v.hitP=true;S.suit=Math.min(100,S.suit+6);toast('POEIRA NO TRAJE','bad')}
  if(v.life<=0)S.devil=null}

/* ---------------- update ---------------- */
function tryMove(){const p=S.p;if(p.mt<1||D||S.guideOpen||!held.length||S.mode!=='play')return;
  const d=held[held.length-1],[dx,dy]=DIRS[d];if(dx)p.face=dx;
  const nx=p.x+dx,ny=p.y+dy;
  if(!walkable(nx,ny)){if(S.bumpT<=0){const t=inMap(nx,ny)?tile[I(nx,ny)]:CLIFF;
      toast(t===CLIFF?'ENCOSTA ÍNGREME: CONTORNE':t===ROCK?'ROCHA: CONTORNE':'ABRIGO À FRENTE','bad');S.bumpT=1.2}return}
  S.trail.unshift({x:p.x,y:p.y});S.trail.length=2;
  const t=tile[I(nx,ny)],up=elev[I(nx,ny)]-elev[I(p.x,p.y)]>0.012;
  p.ox=p.x;p.oy=p.y;p.x=nx;p.y=ny;p.mt=0;
  const sand=t===SAND;p.dur=sand?0.34:0.18;
  /* cada passo custa tempo e O₂; poeira gruda no traje e nos painéis */
  advance(stepMin(t),stepEff(t,up));
  S.suit=Math.min(100,S.suit+(sand?2:1));
  S.panel=Math.min(0.6,S.panel+(S.storm?0.012:0.004));
  S.tatu=Math.max(0,S.tatu-0.25);checkTatu();
  S.prints.push({x:nx,y:ny,f:dx?(dx>0?0:1):(dy>0?2:3),m:S.min});if(S.prints.length>70)S.prints.shift();
  if(t===SHARP){S.wheels=Math.max(0,S.wheels-3);
    if(!S.guide.has('wheels'))say([{who:'TATU',alert:true,t:'Rochas pontiagudas! Elas cortam as rodas. Rodas gastas fazem o Tatu gastar mais bateria.'},
      {who:'+ GUIA DE CAMPO',guide:'wheels',t:'Em 2013, rochas assim rasgaram as rodas do Curiosity. Use a camada TERRENO para desviar.'}],()=>{});
    else if(S.wheels<=40&&!S.tips.has('w40')){S.tips.add('w40');toast('RODAS DO TATU EM '+S.wheels+'%','bad')}}
  else if(sand)tip('sand');
  if(Math.abs(p.x-HABP.x)+Math.abs(p.y-HABP.y)>4){S.away=true;tip('ret')}
}
function arrive(){const p=S.p;
  const o=OPTS.find(o=>o.x===p.x&&o.y===p.y&&!S.visited.has(o.id));if(o){visitOpt(o);return}
  POIS.forEach((q,i)=>{if(q.x===p.x&&q.y===p.y&&!S.visited.has(q.id)){
    const want=[0,1,null,2][S.step];if(want===i)visitPOI(i);
    else if(S.bumpT<=0){toast('SIGA A ORDEM: '+target().name.toUpperCase());S.bumpT=1.5}}});
  if(atHab()&&S.away){if(S.suit>=5)startAirlock();else{S.away=false;if(S.step===4)ending()}}
}
function update(dt){
  S.t+=dt;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)toastEl.hidden=true}
  if(S.bumpT>0)S.bumpT-=dt;if(S.flash>0)S.flash-=dt;
  updDialog(dt);
  if(S.mode==='teaser'){S.teaserT+=dt;const s=TEASER[S.teaser];const need=1.4+s.l.length*0.85+3.6;
    if(S.teaserT>need){if(S.teaser<TEASER.length-1)showTeaser(S.teaser+1);else startTravel()}}
  if(S.mode==='edl'){S.edlT+=dt;const t=S.edlT,DUR=9;const left=Math.max(0,420*(1-t/DUR));
    const ck=$('#edlClock');if(ck){ck.textContent=`${Math.floor(left/60)}:${String(Math.floor(left%60)).padStart(2,'0')}`;
      let ph,v;if(t<2.6){ph='ENTRADA · ESCUDO TÉRMICO';v=21000-(21000-1500)*(t/2.6)}
      else if(t<5.2){ph='PARAQUEDAS';v=1500-(1500-300)*((t-2.6)/2.6)}
      else if(t<7.8){ph='DESCIDA PROPULSADA';v=300-297*((t-5.2)/2.6)}
      else{ph='POUSO CONFIRMADO';v=0}
      $('#edlPh').textContent=ph;$('#edlV').textContent=Math.round(v).toLocaleString('pt-BR')+' km/h (aprox.)'}
    if(t>DUR+1.2)startPlay()}
  if(S.mode==='dusk')S.duskT+=dt;
  if(S.mode==='airlock'&&S.al&&S.al.run&&!S.guideOpen){S.al.t+=dt;const f=$('#alFill');if(f)f.style.width=Math.min(100,S.al.t/3*100)+'%';
    if(S.al.t>=3)finishAirlock(true)}
  if(S.mode==='play'){const p=S.p;
    if(p.mt<1){p.mt=Math.min(1,p.mt+dt/p.dur);p.frame+=dt*8;if(p.mt>=1)arrive()}
    tryMove();
    if(!D&&!S.guideOpen&&S.mode==='play'){
      const sh=sheltered();
      /* parada: 1 min de jogo por segundo; abrigada durante o evento solar, o tempo corre 4x */
      const fast=sh&&S.spe&&S.spe.phase==='active';
      advance(dt*(fast?4:1),1);
      if(sh){if(S.o2<99.5){const r=S.storm?6:25;S.o2=Math.min(100,S.o2+dt*r);
          if(S.refillT<=0){toast(S.storm?'O2: RECARGA LENTA, POUCA ENERGIA':'O2 RECARREGANDO','good');S.refillT=4}
          if(!S.guide.has('air')&&S.o2>=99.5)unlockGuide('air')}
        S.retWarned=false;S.inBreach=false}
      else{const need=retNeed();
        if(!S.retWarned&&S.o2-need<6){S.retWarned=true;
          say([{who:'COMANDANTE RUIZ',alert:true,t:`Ponto de retorno! Você tem ${Math.round(S.o2)}% de O₂ e precisa de cerca de ${Math.round(need)}% para chegar ao abrigo. Volte agora.`},
               {who:'+ GUIA DE CAMPO',guide:'ret',t:'Ponto de retorno: planeje a volta antes da ida.'}],()=>{})}
        if(!S.inBreach&&S.o2<need){S.inBreach=true;S.breaches++}}
      if(S.refillT>0)S.refillT-=dt;
      if(atHab()&&hour()>=15&&S.step<4)tip('dusk');
      updDevil(dt);
      /* M3: janela térmica */
      const h=hour(),sol=Math.floor(S.min/SOLM)+1;
      if(h>=16.5&&h<19&&S.coldWarnSol!==sol&&!atHab()&&S.step<4){S.coldWarnSol=sol;
        say([{who:'COMANDANTE RUIZ',alert:true,t:`São ${fmtClock().slice(-5)} e o sol vai se pôr. A temperatura vai cair até perto de −70 °C. Volte ao habitat.`},
             {who:'+ GUIA DE CAMPO',guide:'cold',t:'A noite marciana: volte antes do pôr do sol.'}],()=>{})}
      if(h>=19.5&&!atHab()){S.nightAborts++;nextSol(true)}
      if(S.o2<=0){S.o2Outs++;S.o2=100;S.min+=60;p.x=p.fx=p.ox=START.x;p.y=p.fy=p.oy=START.y;p.mt=1;S.trail=[{x:START.x-1,y:START.y}];S.away=false;
        say([{who:'COMANDANTE RUIZ',alert:true,t:'O₂ esgotado. EVA abortada: o Tatu trouxe você de volta ao habitat.'},
             {who:'COMANDANTE RUIZ',t:'Lição: planeje a rota pelo marcador VOLTA e use o rover pressurizado para recarregar.'}],()=>{})}
    }
    S.hudT-=dt;if(S.hudT<=0){S.hudT=0.1;updHud()}
  }
}
function updHud(){$('#o2fill').style.width=S.o2+'%';const sh=sheltered(),need=sh?0:retNeed(),low=!sh&&S.o2-need<6;
  $('#o2ret').style.left=Math.min(100,need)+'%';$('#o2ret').hidden=need<=0;
  $('#o2bar').classList.toggle('low',S.o2<25||low);
  $('#o2txt').textContent=Math.round(S.o2)+'%';
  $('#clock').textContent=fmtClock();
  const tc=Math.round(tempC());const te=$('#temp');te.textContent=(tc<0?'−':'')+Math.abs(tc)+'°C';te.classList.toggle('warn',hour()>=16.5||isNight());
  const h=hour();$('#sunic').className='sunic'+(isNight()?' night':(h>=17||h<7.5?' dusk':''));
  $('#tfill').style.width=S.tatu+'%';$('#tbar').classList.toggle('low',S.tatuOff||S.tatu<20);
  const tb=$('#tatu');tb.textContent=S.tatuOff?'OFF':Math.round(S.tatu)+'%';tb.classList.toggle('warn',S.tatuOff||S.tatu<20);
  const o=$('#obj');o.textContent=objText();o.classList.toggle('alert',(S.step===2&&!!S.spe&&S.spe.phase!=='done')||(S.storm&&S.step===4)||low);
  updPanel()}
/* ---------------- painel da missão ---------------- */
const STEP_NAMES=['Yellowknife Bay','Dunas Bagnold','Abrigo do alerta solar','Formações boxwork','Voltar ao habitat'];
function updPanel(){
  const done=[S.step>0,S.step>1,S.step>2,S.step>3,S.mode==='ending'];
  const key=S.step+'|'+[...S.visited].join(',')+'|'+S.mode;
  if(key!==S.stepsKey){S.stepsKey=key;
    let h=STEP_NAMES.map((n,i)=>{if(i===2&&S.step<2)return `<li class="${done[i]?'done':''}">Sobreviver ao alerta solar</li>`;
      const now=!done[i]&&(i===S.step||(i===4&&S.step===4));return `<li class="${done[i]?'done':''} ${now?'now':''}">${n}</li>`}).join('');
    h+='<li class="sep">EXTRAS</li>'+OPTS.map(o=>`<li class="opt ${S.visited.has(o.id)?'done':''}">${o.name}</li>`).join('');
    $('#steps').innerHTML=h}
  $('#rDose').textContent=fmtDose(S.dose);
  const rt=$('#rTau');rt.textContent=S.tau.toFixed(1).replace('.',',')+(S.tau>3?' · tempestade':'');rt.classList.toggle('bad',S.tau>3);
  const pn=Math.round(S.panel*100);const rp=$('#rPanel');rp.textContent=pn<5?'limpos':pn+'% sujos';rp.classList.toggle('bad',pn>=25);
  const rw=$('#rWheel');rw.textContent=Math.round(S.wheels)+'%';rw.classList.toggle('bad',S.wheels<50);
  const rs=$('#rSuit');rs.textContent=Math.round(S.suit)+'%';rs.classList.toggle('bad',S.suit>=30);
  drawMini()}
const mini=$('#mini'),mg=mini.getContext('2d');const MS=4;
const MCOL={[R]:'#7a3519',[ROCK]:'#7a3519',[CLIFF]:'#4a2216',[SAND]:'#c96f3b',[HAB]:'#9ad48a',[ROV]:'#9ad48a',[SHARP]:'#7a3519'};
const miniBase=document.createElement('canvas');miniBase.width=MW*MS;miniBase.height=MH*MS;
function renderMiniBase(){const c=miniBase.getContext('2d');
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=tile[I(x,y)];c.fillStyle=MCOL[t];c.fillRect(x*MS,y*MS,MS,MS);
    if(t===ROCK){c.fillStyle='#4a2216';c.fillRect(x*MS+1,y*MS+1,2,2)}
    if(t!==HAB&&t!==ROV&&t!==SAND){c.globalAlpha=0.32*band[I(x,y)]/7;c.fillStyle='#f0c08a';c.fillRect(x*MS,y*MS,MS,MS);c.globalAlpha=1}
    if(t===SHARP){c.fillStyle='#ff9a4a';c.fillRect(x*MS+1,y*MS+1,1,1);c.fillRect(x*MS+3,y*MS+2,1,1)}}}
function drawMini(){mg.imageSmoothingEnabled=false;mg.drawImage(miniBase,0,0);
  mg.fillStyle='#1a0d0b';for(const f of S.prints)mg.fillRect(f.x*MS+1,f.y*MS+1,2,2);
  const tg=(S.mode==='play'||S.mode==='airlock')?target():null;
  POIS.forEach(q=>{const d=S.visited.has(q.id);mg.fillStyle=d?'#4a2216':'#f0c08a';mg.fillRect(q.x*MS-1,q.y*MS-1,MS+2,MS+2);
    if(tg===q&&((S.t*3)|0)%2){mg.strokeStyle='#f7ead8';mg.lineWidth=1;mg.strokeRect(q.x*MS-3.5,q.y*MS-3.5,MS+7,MS+7)}});
  OPTS.forEach(q=>{mg.fillStyle=S.visited.has(q.id)?'#3d6b62':'#6fb0a0';mg.fillRect(q.x*MS,q.y*MS,MS,MS)});
  if(S.devil){mg.fillStyle='#f0c08a';mg.fillRect(Math.round(S.devil.x*MS),Math.round(S.devil.y*MS),3,3)}
  const tr=S.trail[0];if(tr){mg.fillStyle=S.tatuOff?'#4a2216':'#e3d06a';mg.fillRect(tr.x*MS+1,tr.y*MS+1,2,2)}
  const p=S.p;if(((S.t*4)|0)%2||S.mode!=='play'){mg.fillStyle='#f7ead8';mg.fillRect(p.x*MS,p.y*MS,MS,MS)}
  if(S.tau>0.6){mg.globalAlpha=Math.min(0.5,(S.tau-0.5)*0.06);mg.fillStyle='#c96f3b';mg.fillRect(0,0,mini.width,mini.height);mg.globalAlpha=1}}

/* ---------------- render ---------------- */
const STARS=Array.from({length:70},(_,i)=>({x:Math.floor(hash(i,1,91)*SW),y:Math.floor(hash(i,2,91)*SH),b:hash(i,3,91)}));
function stars(scroll=0){for(const s of STARS){const tw=Math.sin(S.t*2+s.b*20)>0.6;const x=((s.x-scroll*(0.3+s.b))%SW+SW)%SW;
  px(g,Math.floor(x),s.y,1,1,s.b>0.8?(tw?P[4]:P[5]):(s.b>0.45?P[3]:P[2]))}}
function rocket(x,y,flame){px(g,x+3,y,2,2,P[5]);px(g,x+2,y+2,4,3,P[5]);px(g,x+1,y+5,6,6,P[4]);px(g,x+3,y+6,2,2,P[1]);px(g,x,y+9,1,3,P[2]);px(g,x+7,y+9,1,3,P[2]);
  if(flame){px(g,x+2,y+11,4,2,P[4]);px(g,x+3,y+13,2,2+Math.floor(Math.random()*3),P[3])}}
function capsule(x,y){px(g,x+3,y,3,1,P[5]);px(g,x+2,y+1,5,1,P[5]);px(g,x+1,y+2,7,2,P[4]);px(g,x,y+4,9,1,P[3]);px(g,x+1,y+5,7,4,P[5]);px(g,x+2,y+6,5,1,P[2])}
function drawTeaserArt(){const a=TEASER[S.teaser].art,t=S.teaserT;px(g,0,0,SW,SH,P[0]);stars(a==='artemis'?t*6:0);
  if(a==='intro'){planet(g,80,170,78,P[1],P[2],P[3]);}
  if(a==='ham'){planet(g,80,175,72,P[1],P[2],P[3]);rocket(76,Math.max(10,62-t*9),true)}
  if(a==='orbit'){planet(g,80,52,22,P[1],P[2],P[4]);g.strokeStyle=P[3];g.lineWidth=1;
    for(let k=0;k<64;k++){const an=k/64*Math.PI*2;px(g,Math.round(80+Math.cos(an)*38),Math.round(52+Math.sin(an)*12),1,1,k%2?P[2]:P[3])}
    const an=t*1.4;const ox=Math.round(80+Math.cos(an)*38),oy=Math.round(52+Math.sin(an)*12);if(Math.sin(an)>-0.2||Math.abs(Math.cos(an))>0.6)px(g,ox-1,oy-1,3,3,P[5])}
  if(a==='moon'){planet(g,80,150,90,P[2],P[3],P[4]);
    for(let k=0;k<9;k++){const cx=Math.floor(hash(k,4,77)*150)+5,cy=70+Math.floor(hash(k,5,77)*20);disc(g,cx,cy,1+Math.floor(hash(k,6,77)*3),P[2])}
    planet(g,128,22,7,P[1],P[2],P[4]);px(g,70,40,1,22,P[5]);px(g,71,40,10,6,P[5]);px(g,72,41,4,2,P[2]);
    px(g,86,52,4,8,P[5]);px(g,86,50,4,3,P[4]);px(g,87,51,2,1,P[0])}
  if(a==='a13'){const x=70+Math.sin(t)*2;capsule(x,46);px(g,x+1,55,7,10,P[4]);px(g,x+1,57,7,1,P[2]);
    for(let k=0;k<10;k++){const ang=hash(k,t|0,55)*6.28,r=(t*14+k*3)%26;px(g,Math.round(x+8+Math.cos(ang)*r),Math.round(60+Math.sin(ang)*r),1,1,k%2?P[4]:P[3])}
    planet(g,26,26,9,P[1],P[2],P[4])}
  if(a==='robots'){planet(g,80,165,92,P[1],P[2],P[3]);const rx=Math.floor(30+((t*10)%100));
    px(g,rx,66,12,4,P[5]);px(g,rx+9,62,1,4,P[5]);px(g,rx+8,60,3,2,P[4]);disc(g,rx+2,71,1,P[0]);disc(g,rx+6,71,1,P[0]);disc(g,rx+10,71,1,P[0]);px(g,rx+1,64,6,2,P[1])}
  if(a==='artemis'){planet(g,36,48,26,P[2],P[3],P[4]);const cx=Math.floor(70+t*7);capsule(cx,40);px(g,cx+1,49,7,5,P[4]);
    disc(g,142,34,2,P[3]);px(g,142,34,1,1,P[4])}
  if(a==='mars'){const r=Math.min(46,4+t*12);planet(g,80,54,Math.floor(r),P[1],P[2],P[3])}
}
function drawTitle(){px(g,0,0,SW,SH,P[0]);stars(S.t*2);planet(g,80,214,128,P[1],P[2],P[3]);
  for(let x=0;x<SW;x++){const hh=Math.floor(6+vn(x/9,1,4)*14);px(g,x,SH-hh,1,hh,P[1])}
  for(let x=0;x<SW;x++){const hh=Math.floor(2+vn(x/5,2,6)*7);px(g,x,SH-hh,1,hh,P[0])}
  disc(g,128,16,4,P[4]);px(g,128,16,1,1,P[5])}
function drawTravel(){px(g,0,0,SW,SH,P[0]);stars(S.t*10);const pr=D?D.i/(D.lines.length-1):1;
  planet(g,Math.round(18-pr*30),40,Math.max(2,Math.round(14-pr*12)),P[1],P[2],P[4]);
  planet(g,Math.round(150-pr*14),36,Math.round(4+pr*16),P[1],P[2],P[3]);
  const x=70,y=34+Math.round(Math.sin(S.t*2)*1);px(g,x,y+3,22,6,P[5]);px(g,x+22,y+4,4,4,P[4]);px(g,x+2,y-3,4,16,P[1]);px(g,x+12,y-4,3,18,P[1]);
  px(g,x+3,y+5,14,1,P[2]);px(g,x-3,y+4,3,4,P[3]);if((S.t*8|0)%2)px(g,x-5,y+5,2,2,P[4]);
  if(S.flash>0&&((S.t*6|0)%2)){g.globalAlpha=0.28;px(g,0,0,SW,SH,ACC.alert);g.globalAlpha=1}}
function drawEDL(){const t=S.edlT;px(g,0,0,SW,SH,t<2.6?P[0]:P[1]);if(t<2.6)stars();
  const gy=Math.round(SH-Math.min(70,t*8));planet(g,80,gy+120,130,P[1],P[2],P[3]);
  const cx=76,cy=74;
  if(t<2.6){for(let k=0;k<14;k++){const ang=3.6+hash(k,(t*10)|0,8)*2.2,r=6+hash(k,1,(t*10)|0)*10;px(g,Math.round(cx+4+Math.cos(ang)*r),Math.round(cy+8+Math.sin(ang)*r),2,2,k%3?P[3]:P[4])}
    px(g,cx-2,cy+8,12,3,P[4])}
  if(t>=2.6&&t<5.2){px(g,cx-10,cy-26,28,6,P[5]);px(g,cx-8,cy-26,3,6,P[3]);px(g,cx+5,cy-26,3,6,P[3]);for(let k=0;k<4;k++)px(g,cx-8+k*7,cy-20,1,22,P[4])}
  if(t>=5.2&&t<7.8){for(const fx of [cx-2,cx+8]){px(g,fx,cy+10,2,3+((t*20|0)%3),P[4])}}
  capsule(cx,cy);if(t>=7.8){px(g,cx-2,cy+9,13,1,P[0])}}

const SPR=["................",".....aaaaa......","....abbbbba.....","...abbbcccca....","...abbbccdca....","...abbbbbbba....","....abbbbba.....","..aaabbbbbbaa...",".aeeabbbbbbba...",".aeeabbdbbbba...",".aeeabbbbbba....","..aaabbbbbba....","....abbaabba....","....abba.abba...","...aaaa..aaaa...","................"];
const SPR2=["................",".....aaaaa......","....abbbbba.....","...abbbcccca....","...abbbccdca....","...abbbbbbba....","....abbbbba.....","..aaabbbbbbaa...",".aeeabbbbbbba...",".aeeabbdbbbba...",".aeeabbbbbba....","..aaabbbbbba....",".....abbabba....",".....abbabba....","....aaaaaaaa....","................"];
const SC={a:P[0],b:P[5],c:P[1],d:P[3],e:P[2]};
function sprite(sp,x,y,flip){for(let r=0;r<16;r++){const row=sp[r];for(let c=0;c<16;c++){const ch=row[c];if(ch&&ch!=='.'){px(g,flip?x+15-c:x+c,y+r,1,1,SC[ch])}}}}
function tatu(x,y,bob){px(g,x+2,y+6+bob,12,5,P[0]);px(g,x+3,y+7+bob,10,3,P[4]);px(g,x+3,y+5+bob,6,1,P[1]);px(g,x+10,y+3+bob,1,4,P[5]);px(g,x+9,y+2+bob,3,1,P[3]);
  disc(g,x+4,y+12,1,P[0]);disc(g,x+11,y+12,1,P[0])}
function drawPlay(){const p=S.p,k=p.mt;const rx=(p.ox+(p.x-p.ox)*k)*T,ry=(p.oy+(p.y-p.oy)*k)*T;
  const camx=Math.round(Math.max(0,Math.min(MW*T-SW,rx+8-SW/2))),camy=Math.round(Math.max(0,Math.min(MH*T-SH,ry+8-SH/2-10)));
  g.drawImage(base,camx,camy,SW,SH,0,0,SW,SH);
  const L=S.layers[S.layer];if(L!=='MAPA'&&layers[L])g.drawImage(layers[L],camx,camy,SW,SH,0,0,SW,SH);
  // pegadas
  for(let i=0;i<S.prints.length;i++){const f=S.prints[i],X=f.x*T-camx,Y=f.y*T-camy;if(X<-16||Y<-16||X>SW||Y>SH)continue;
    g.globalAlpha=0.15+0.35*i/S.prints.length;const c=P[1];
    if(f.f<2){px(g,X+4,Y+6,2,1,c);px(g,X+10,Y+10,2,1,c)}else{px(g,X+6,Y+4,1,2,c);px(g,X+9,Y+10,1,2,c)}}
  g.globalAlpha=1;
  // flags
  const flag=(q,cur,done,col0)=>{const fx=q.x*T-camx,fy=q.y*T-camy;if(fx<-16||fy<-16||fx>SW||fy>SH)return;
    px(g,fx+5,fy+2,1,12,P[0]);px(g,fx+3,fy+13,5,2,P[0]);
    const col=done?P[2]:(cur?(((S.t*3)|0)%2?P[5]:P[4]):col0);px(g,fx+6,fy+2,7,5,P[0]);px(g,fx+6,fy+3,6,3,col);
    if(done){px(g,fx+8,fy+4,1,1,P[0]);px(g,fx+9,fy+5,1,1,P[0]);px(g,fx+10,fy+3,1,2,P[0])}};
  POIS.forEach(q=>flag(q,target()===q,S.visited.has(q.id),P[3]));
  OPTS.forEach(q=>flag(q,false,S.visited.has(q.id),ACC.clay));
  {const q=target();const fx=q.x*T-camx+8,fy=q.y*T-camy+12;if(S.mode==='play'&&fx>-20&&fy>-20&&fx<SW+20&&fy<SH+20){const rr=6+((S.t*10)%8);
    g.globalAlpha=0.6-(rr-6)/14;g.strokeStyle=P[5];g.lineWidth=1;g.beginPath();g.ellipse(fx,fy,rr,rr*0.5,0,0,6.283);g.stroke();g.globalAlpha=1}}
  // companion
  const tr=S.trail[0];if(tr){const ox=S.trail[1]||tr;const cx=(ox.x+(tr.x-ox.x)*k)*T-camx,cy=(ox.y+(tr.y-ox.y)*k)*T-camy;
    g.globalAlpha=0.35;px(g,Math.round(cx)+3,Math.round(cy)+14,11,2,P[0]);g.globalAlpha=1;
    if(S.tatuOff)g.globalAlpha=0.5;tatu(Math.round(cx),Math.round(cy),((S.t*6)|0)%2&&k<1&&!S.tatuOff?1:0);g.globalAlpha=1}
  // player
  g.globalAlpha=0.35;px(g,Math.round(rx-camx)+4,Math.round(ry-camy)+14,8,2,P[0]);g.globalAlpha=1;
  const fr=(p.mt<1&&((p.frame|0)%2))?SPR2:SPR;sprite(fr,Math.round(rx-camx),Math.round(ry-camy),p.face<0);
  // luz do dia (M3) e poeira no ar (M2)
  // redemoinho
  if(S.devil){const v=S.devil,X=Math.round(v.x*T-camx+8),Y=Math.round(v.y*T-camy+12);
    g.globalAlpha=0.3;px(g,X-6,Y+1,12,2,P[0]);g.globalAlpha=0.85;
    for(let k=0;k<26;k++){const hh=k/26,yy=Y-hh*24,rad=2+hh*7,an=S.t*9+k*1.7;px(g,Math.round(X+Math.cos(an)*rad),Math.round(yy+Math.sin(an)*rad*0.3),1,1,k%3?P[4]:P[3])}
    g.globalAlpha=1}
  const light=Math.min(1,sunF()*2.2);if(light<1){g.globalAlpha=(1-light)*0.62;px(g,0,0,SW,SH,'#0b0420');g.globalAlpha=1;
    // luzes do habitat e do rover no escuro
    for(const [rc,str] of [[HABP,1],[ROVP,0.6]]){const cx=(rc.x+rc.w/2)*T-camx,cy=(rc.y+rc.h/2)*T-camy;
      for(let k=4;k>=1;k--){g.globalAlpha=(1-light)*0.07*str*(5-k);g.fillStyle='#ffd27a';g.beginPath();g.arc(cx,cy,k*9,0,6.283);g.fill()}
      g.globalAlpha=1;if(rc===HABP){px(g,Math.round(cx)-9,Math.round(cy)-6,3,2,'#ffd27a');px(g,Math.round(cx)+5,Math.round(cy)-6,3,2,'#ffd27a')}}}
  // grãos de poeira levados pelo vento
  {const n=S.storm?0:6;for(let i=0;i<n;i++){const sx=Math.floor((hash(i,9,3)*SW+S.t*(18+i*4))%SW),sy=Math.floor((hash(i,8,3)*SH+Math.sin(S.t+i)*4+SH)%SH);
    g.globalAlpha=0.5;px(g,sx,sy,2,1,P[4]);g.globalAlpha=1}}
  if(S.tau>0.6){const a=Math.min(0.62,(S.tau-0.5)*0.075);g.globalAlpha=a;px(g,0,0,SW,SH,P[3]);g.globalAlpha=1;
    for(let i=0;i<Math.floor(S.tau*6);i++){const sx=Math.floor((hash(i,1,(S.t*20)|0)*SW+S.t*60)%SW),sy=Math.floor(hash(i,2,(S.t*20)|0)*SH);px(g,sx,sy,2,1,P[4])}}
  // target arrow
  if(S.step<=4&&!D){const t=target();const tx=t.x*T+8-camx,ty=t.y*T+8-camy;
    if(tx<0||ty<34||tx>SW||ty>SH){const cx=SW/2,cy=(SH+34)/2,ang=Math.atan2(ty-cy,tx-cx);
      const ax=Math.max(8,Math.min(SW-8,cx+Math.cos(ang)*72)),ay=Math.max(40,Math.min(SH-8,cy+Math.sin(ang)*46));
      g.save();g.translate(Math.round(ax),Math.round(ay));g.rotate(ang);g.fillStyle=P[0];g.beginPath();g.moveTo(6,0);g.lineTo(-5,-5);g.lineTo(-5,5);g.closePath();g.fill();
      g.fillStyle=((S.t*3)|0)%2?P[5]:P[4];g.beginPath();g.moveTo(4,0);g.lineTo(-3,-3);g.lineTo(-3,3);g.closePath();g.fill();g.restore()}}
  // radiation exposure
  if(S.spe&&S.spe.phase==='active'&&!sheltered()){g.globalAlpha=0.18+0.1*Math.sin(S.t*8);px(g,0,0,SW,SH,ACC.alert);g.globalAlpha=1;
    for(let i=0;i<14;i++)px(g,Math.floor(Math.random()*SW),Math.floor(Math.random()*SH),1,1,P[5])}
  if(S.spe&&S.spe.phase==='warn'&&((S.t*2)|0)%2){g.globalAlpha=0.08;px(g,0,0,SW,SH,ACC.alert);g.globalAlpha=1}
}
function drawDusk(){const t=S.duskT;const k=Math.min(1,t/16);
  const sky=['#c9925a','#a5704a','#6d4a3e','#3b2a36','#1a1424'];const si=Math.min(4,Math.floor(k*4.6));
  px(g,0,0,SW,SH,sky[si]);
  if(k>0.55){for(const s of STARS){if(s.y<80&&s.b>0.5)px(g,s.x,s.y,1,1,s.b>0.85?P[5]:P[3])}
    const tw=0.6+0.4*Math.sin(t*3);g.globalAlpha=Math.min(1,(k-0.55)*3)*tw;px(g,38,26,2,2,'#cfe6ff');px(g,39,25,1,1,'#ffffff');px(g,42,28,1,1,'#bcbcbc');g.globalAlpha=1}
  const sy=Math.round(34+k*50),sx=104;
  const halo=['#4a6890','#6f95bf','#9fc3e2','#cfe3f0'];
  for(let i=0;i<4;i++){g.globalAlpha=(0.35+i*0.15)*(1-k*0.6);disc(g,sx,sy,18-i*4,halo[i]);g.globalAlpha=1}
  disc(g,sx,sy,2,'#ffffff');
  for(let x=0;x<SW;x++){const hh=Math.floor(58+vn(x/14,1,12)*10+(x>80?(x-80)*0.06:0));px(g,x,SH-hh,1,hh,'#2a1510')}
  for(let x=0;x<SW;x++){const hh=Math.floor(50+vn(x/7,2,13)*6);px(g,x,SH-hh,1,hh,P[0])}
  const hx=26,hy=SH-56;disc(g,hx,hy,9,'#120807');px(g,hx-12,hy,24,8,'#120807');px(g,hx-5,hy-3,3,2,'#ffd27a');px(g,hx+3,hy-3,3,2,'#ffd27a');
  px(g,60,SH-53,4,6,'#120807');px(g,59,SH-55,6,3,'#120807')}
function render(){g.setTransform(1,0,0,1,0,0);
  if(S.mode==='dusk'){drawDusk();return}
  if(S.mode==='title')drawTitle();else if(S.mode==='teaser')drawTeaserArt();else if(S.mode==='travel')drawTravel();
  else if(S.mode==='edl')drawEDL();else drawPlay()}

/* ---------------- boot ---------------- */
genMap();renderBase();renderLayers();computeReturn();renderMiniBase();reset();updPanel();
let last=performance.now();
function loop(now){const dt=Math.min(0.05,(now-last)/1000);last=now;try{update(dt);render()}catch(err){console.error(err)}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
})();
