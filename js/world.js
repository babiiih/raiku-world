/* ============================================================
   RAIKU WORLD — world.js : peta dunia 240x160, biome & gerbang
   ============================================================ */
const MW=240, MH=160, TILE=16;
const T={GRASS:0,STONE:1,WATER:2,TREE:3,ROCK:4,FLOWER:5,DIRT:6,WOOD:7,SAND:8,
  LANTERN:9,FIRE:10,DUMMY:11,SIGN:12,STATUE:13,BENCH:14,CRYSTAL:15,
  SNOW:16,ICE:17,LAVA:18,CACTUS:19,VROCK:20,GATE:21,SWAMP:22,DTREE:23};
const SOLID = new Set([T.WATER,T.TREE,T.ROCK,T.LANTERN,T.FIRE,T.DUMMY,T.STATUE,
  T.BENCH,T.CRYSTAL,T.LAVA,T.CACTUS,T.DTREE]);
const map = new Uint8Array(MW*MH);
const mget=(x,y)=> (x<0||y<0||x>=MW||y>=MH) ? T.TREE : map[y*MW+x];
const mset=(x,y,v)=>{ if(x>=0&&y>=0&&x<MW&&y<MH) map[y*MW+x]=v; };
function hash(x,y){ let h=(x*374761393+y*668265263)^(x*y*97); h=(h^(h>>13))*1274126177; return ((h^(h>>16))>>>0)/4294967295; }

/* urutan penting: zona spesifik dulu */
const ZONES = [
  {name:'SARANG KRAKEN ★BOSS',          x1:198,y1:16, x2:224,y2:40},
  {name:'PLAZA GENESIS',                 x1:108,y1:68, x2:132,y2:92},
  {name:'CHILL LOUNGE 🔥',               x1:148,y1:98, x2:178,y2:116},
  {name:'TRAINING FIELD ⚔ Lv.1-5',      x1:74, y1:98, x2:106,y2:126},
  {name:'FROZEN CACHE ❄ Lv.10-15',      x1:4,  y1:4,  x2:68, y2:46},
  {name:'VOLCANIC RIDGE 🌋 Lv.15-20',   x1:170,y1:4,  x2:236,y2:54},
  {name:'NEON FOREST ✦',                 x1:70, y1:4,  x2:168,y2:40},
  {name:'GURUN VOLATILITAS ☀ Lv.6-10',  x1:4,  y1:50, x2:64, y2:120},
  {name:'RAWA MEMPOOL ☠ Lv.8-12',       x1:148,y1:118,x2:236,y2:154},
  {name:'DANAU DATA',                    x1:164,y1:60, x2:216,y2:94},
];

/* gerbang waypoint — ditemukan dengan mendekat, teleport via peta dunia */
const GATES = [
  {id:'plaza',    nm:'Plaza Genesis',     x:116, y:86},
  {id:'training', nm:'Training Field',    x:92,  y:100},
  {id:'chill',    nm:'Chill Lounge',      x:156, y:100},
  {id:'desert',   nm:'Gurun Volatilitas', x:36,  y:84},
  {id:'snow',     nm:'Frozen Cache',      x:34,  y:36},
  {id:'volcano',  nm:'Volcanic Ridge',    x:192, y:46},
  {id:'swamp',    nm:'Rawa Mempool',      x:176, y:126},
];

(function genMap(){
  map.fill(T.GRASS);
  // ===== border hutan =====
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)
    if(x<3||y<3||x>=MW-3||y>=MH-3) mset(x,y,T.TREE);

  // ===== FROZEN CACHE (barat laut): salju, es, pinus, kristal =====
  for(let y=3;y<46;y++)for(let x=3;x<68;x++){
    mset(x,y,T.SNOW);
    const h=hash(x,y);
    if(h<0.14) mset(x,y,T.TREE);
    else if(h<0.155) mset(x,y,T.ROCK);
    else if(h<0.175) mset(x,y,T.CRYSTAL);
  }
  // danau beku (licin!)
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const dx=(x-32)/11, dy=(y-20)/7;
    if(dx*dx+dy*dy<1) mset(x,y,T.ICE);
  }

  // ===== NEON FOREST (utara tengah) =====
  for(let y=3;y<38;y++)for(let x=68;x<170;x++){
    if(x>116&&x<126) continue;                    // koridor jalan
    const h=hash(x,y);
    if(h<0.3) mset(x,y,T.TREE);
    else if(h<0.33) mset(x,y,T.CRYSTAL);
  }

  // ===== VOLCANIC RIDGE (timur laut): batu gelap + kolam lava =====
  for(let y=3;y<54;y++)for(let x=170;x<MW-3;x++){
    mset(x,y,T.VROCK);
    const h=hash(x*7,y*3);
    if(h<0.06) mset(x,y,T.ROCK);
  }
  [[182,14,5,3],[224,30,4,3],[178,40,4,2],[210,46,5,2]].forEach(([cx,cy,rx,ry])=>{
    for(let y=0;y<MH;y++)for(let x=170;x<MW;x++){
      const dx=(x-cx)/rx, dy=(y-cy)/ry;
      if(dx*dx+dy*dy<1) mset(x,y,T.LAVA);
    }
  });
  // sarang kraken: cincin lava dengan celah masuk di selatan
  for(let y=16;y<40;y++)for(let x=198;x<224;x++){
    const d=Math.sqrt(dist2(x,y,210,27));
    if(d<9.5) mset(x,y,T.VROCK);
    if(d>=7.5&&d<9.5 && !(x>=208&&x<=212&&y>27)) mset(x,y,T.LAVA);
  }

  // ===== GURUN VOLATILITAS (barat): pasir, kaktus =====
  for(let y=50;y<120;y++)for(let x=3;x<64;x++){
    mset(x,y,T.SAND);
    const h=hash(x*5,y*11);
    if(h<0.025) mset(x,y,T.CACTUS);
    else if(h<0.04) mset(x,y,T.ROCK);
  }

  // ===== DANAU DATA (timur) + sungai =====
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const dx=(x-190)/20, dy=(y-76)/12;
    if(dx*dx+dy*dy<1) mset(x,y,T.WATER);
    else if(dx*dx+dy*dy<1.25 && mget(x,y)===T.GRASS) mset(x,y,T.SAND);
  }
  for(let y=86;y<MH-3;y++){ const x=196+Math.round(Math.sin(y/7)*3);
    mset(x,y,T.WATER); mset(x+1,y,T.WATER); }
  for(let x=192;x<=203;x++){ mset(x,112,T.WOOD); mset(x,113,T.WOOD); }  // jembatan

  // ===== RAWA MEMPOOL (tenggara): lumpur lambat, pohon mati =====
  for(let y=118;y<MH-3;y++)for(let x=148;x<MW-3;x++){
    const h=hash(x*3,y*5);
    if(h<0.42) mset(x,y,T.SWAMP);
    if(h>0.95) mset(x,y,T.WATER);
    else if(h>0.90&&h<=0.95) mset(x,y,T.DTREE);
  }

  // ===== PLAZA GENESIS (tengah) =====
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)
    if(dist2(x,y,120,80)<100) mset(x,y,T.STONE);
  // jalan utama
  for(let x=28;x<=166;x++){ mset(x,80,T.DIRT); mset(x,81,T.DIRT); }
  for(let y=14;y<=146;y++){ mset(120,y,T.DIRT); mset(121,y,T.DIRT); }
  for(let y=82;y<=100;y++){ mset(92,y,T.DIRT); mset(93,y,T.DIRT); }    // ke training
  for(let y=82;y<=100;y++){ mset(156,y,T.DIRT); mset(157,y,T.DIRT); }  // ke chill
  // patung Raiku
  mset(119,78,T.STATUE); mset(120,78,T.STATUE); mset(119,77,T.STATUE); mset(120,77,T.STATUE);

  // ===== CHILL LOUNGE =====
  for(let y=100;y<=114;y++)for(let x=150;x<=176;x++){
    const t=mget(x,y);
    if((t===T.GRASS||t===T.SWAMP) && hash(x,y)<0.85) mset(x,y,T.WOOD);
  }
  mset(162,106,T.FIRE); mset(163,106,T.FIRE);
  [[159,104],[166,104],[159,109],[166,109]].forEach(([x,y])=>mset(x,y,T.BENCH));
  [[152,101],[174,101],[152,112],[174,112]].forEach(([x,y])=>mset(x,y,T.LANTERN));
  mset(154,99,T.SIGN);

  // ===== TRAINING FIELD =====
  for(let y=102;y<=122;y++)for(let x=78;x<=102;x++)
    if(mget(x,y)===T.GRASS && hash(x*3,y)<0.3) mset(x,y,T.DIRT);
  [[82,106],[88,104],[82,118]].forEach(([x,y])=>mset(x,y,T.DUMMY));
  mset(98,103,T.SIGN);

  // ===== dekorasi acak di padang rumput =====
  for(let y=4;y<MH-4;y++)for(let x=4;x<MW-4;x++){
    if(mget(x,y)!==T.GRASS) continue;
    const h=hash(x*13,y*7);
    if(h<0.02) mset(x,y,T.TREE);
    else if(h<0.028) mset(x,y,T.ROCK);
    else if(h<0.07) mset(x,y,T.FLOWER);
  }

  // ===== gerbang waypoint: pad batu 3x3 + tile GATE =====
  for(const g of GATES){
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) mset(g.x+dx,g.y+dy,T.STONE);
    mset(g.x,g.y,T.GATE);
  }
  // spawn bersih
  for(let y=83;y<=88;y++)for(let x=117;x<=124;x++) if(SOLID.has(mget(x,y))) mset(x,y,T.STONE);
})();

function walkableAt(px,py){
  return !SOLID.has(mget(Math.floor(px/TILE), Math.floor(py/TILE)));
}
/* pengaruh medan pada kecepatan */
function tileSpeedAt(px,py){
  const t=mget(Math.floor(px/TILE), Math.floor(py/TILE));
  if (t===T.SWAMP) return 0.5;
  if (t===T.SAND)  return 0.85;
  if (t===T.SNOW)  return 0.88;
  return 1;
}
function onIce(px,py){ return mget(Math.floor(px/TILE),Math.floor(py/TILE))===T.ICE; }
function nearLava(px,py){
  for(const [dx,dy] of [[0,0],[10,0],[-10,0],[0,10],[0,-10]])
    if (mget(Math.floor((px+dx)/TILE),Math.floor((py+dy)/TILE))===T.LAVA) return true;
  return false;
}

const TCOL = {
  [T.GRASS]:'#12240f',[T.STONE]:'#23282a',[T.WATER]:'#0a2b3d',[T.DIRT]:'#241d10',
  [T.WOOD]:'#2c2013',[T.SAND]:'#3a3420',[T.FLOWER]:'#12240f',[T.TREE]:'#12240f',
  [T.ROCK]:'#12240f',[T.LANTERN]:'#12240f',[T.FIRE]:'#2c2013',[T.DUMMY]:'#241d10',
  [T.SIGN]:'#12240f',[T.STATUE]:'#23282a',[T.BENCH]:'#2c2013',[T.CRYSTAL]:'#12240f',
  [T.SNOW]:'#c8d8e4',[T.ICE]:'#9fc8e8',[T.LAVA]:'#3a1408',[T.CACTUS]:'#3a3420',
  [T.VROCK]:'#1a1416',[T.GATE]:'#23282a',[T.SWAMP]:'#1e2a12',[T.DTREE]:'#1e2a12',
};
