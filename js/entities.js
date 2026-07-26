/* ============================================================
   RAIKU WORLD — entities.js : pemain, skill, monster, NPC
   ============================================================ */
const SPAWN = {x:120.5*TILE, y:86*TILE};
const me = {
  uid:null, nick:'', skin:defaultSkin(),
  lv:1, exp:0, hp:100, mp:50,
  x:SPAWN.x, y:SPAWN.y, dir:1, moving:false, sit:false,
  vx:0, vy:0, dashT:0, hurtT:0, invUntil:0,
  shieldUntil:0, dead:false, bubble:null,
  wps:{plaza:true},
};
const maxHp = ()=>100+me.lv*12;
const maxMp = ()=>50+me.lv*6;
const expNext = ()=>me.lv*80;

const SKILLS = [
  {nm:'CHAIN STRIKE', ic:'⚔', unlock:1, mp:0,  cd:.45, key:'1'},
  {nm:'DATA BURST',   ic:'◆', unlock:2, mp:8,  cd:.8,  key:'2'},
  {nm:'SPARK DASH',   ic:'⚡', unlock:3, mp:10, cd:2.5, key:'3'},
  {nm:'NODE SHIELD',  ic:'🛡', unlock:4, mp:15, cd:9,  key:'4'},
  {nm:'HEAL PULSE',   ic:'✚', unlock:5, mp:20, cd:7,  key:'5'},
  {nm:'VOLT NOVA',    ic:'✦', unlock:6, mp:25, cd:6,  key:'6'},
  {nm:'GENESIS ROAR', ic:'🔥', unlock:8, mp:40, cd:14, key:'7'},
];
const cds = new Array(SKILLS.length).fill(0);

const others = new Map();
const projectiles = [], fxs = [], particles = [], floats = [];

function addFloat(x,y,txt,col){ floats.push({x,y,txt,col,t:1}); }
function addParts(x,y,col,n=10,sp=60){
  for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2,s=sp*(.4+Math.random());
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,t:.6+Math.random()*.4,col,sz:2+Math.random()*2}); }
}
function dustAt(x,y,n=2){
  for(let i=0;i<n;i++) particles.push({
    x:x+(Math.random()-.5)*10, y:y+(Math.random()-.5)*3,
    vx:(Math.random()-.5)*34, vy:-10-Math.random()*16,
    t:.3+Math.random()*.22, col:'rgba(196,214,176,0.4)', sz:1.6+Math.random()*1.4});
}
function toast(txt,red=false){
  const d=document.createElement('div'); d.className='toast'+(red?' redt':''); d.textContent=txt;
  $('toasts').appendChild(d); setTimeout(()=>d.remove(),3600);
}

/* ============================================================
   MONSTER PER REGION — makin jauh dari plaza makin kuat
   ============================================================ */
const MOB_TYPES = {
  slime:   {cv:()=>SLIME_CV, hp:30,  dmg:6,  exp:20,  spd:22, aggro:90,  ps:1},
  ghost:   {cv:()=>GHOST_CV, hp:70,  dmg:10, exp:45,  spd:30, aggro:110, ps:1,   ghost:true},
  scorpion:{cv:()=>SCORP_CV, hp:130, dmg:16, exp:95,  spd:34, aggro:120, ps:1},
  toxslime:{cv:()=>TOX_CV,   hp:170, dmg:21, exp:130, spd:24, aggro:100, ps:1.15},
  yeti:    {cv:()=>YETI_CV,  hp:260, dmg:27, exp:200, spd:26, aggro:110, ps:1.3},
  imp:     {cv:()=>IMP_CV,   hp:340, dmg:35, exp:290, spd:42, aggro:130, ps:1.15},
  kraken:  {cv:()=>KRAK_CV,  hp:1600,dmg:52, exp:1600,spd:30, aggro:190, ps:2.2, boss:true},
};
/* rect dalam TILE: [x1,y1,x2,y2] */
const REGION_SPAWNS = [
  {rect:[76,100,104,124], type:'slime',    n:7, lv:[1,3]},
  {rect:[76,100,104,124], type:'ghost',    n:3, lv:[3,5]},
  {rect:[8,54,60,116],    type:'scorpion', n:9, lv:[6,10]},
  {rect:[150,118,232,152],type:'toxslime', n:9, lv:[8,12]},
  {rect:[6,6,64,44],      type:'yeti',     n:7, lv:[10,15]},
  {rect:[172,6,232,50],   type:'imp',      n:8, lv:[15,20]},
  {rect:[202,20,219,34],  type:'kraken',   n:1, lv:[22,22]},
];
const mobs = [];
(function spawnMobs(){
  for(const rs of REGION_SPAWNS){
    const bt=MOB_TYPES[rs.type];
    for(let i=0;i<rs.n;i++){
      const lv = rs.lv[0]+Math.floor(Math.random()*(rs.lv[1]-rs.lv[0]+1));
      const sc = 1+(lv-1)*0.10;
      let x,y,ok=false;
      for(let t=0;t<30&&!ok;t++){
        x=(rs.rect[0]+Math.random()*(rs.rect[2]-rs.rect[0]))*TILE;
        y=(rs.rect[1]+Math.random()*(rs.rect[3]-rs.rect[1]))*TILE;
        ok = walkableAt(x,y);
      }
      if(!ok) continue;
      mobs.push({
        kind:rs.type, lv, rect:rs.rect, boss:bt.boss, ghost:bt.ghost, ps:bt.ps,
        hp:Math.round(bt.hp*sc), maxHp:Math.round(bt.hp*sc),
        dmg:Math.round(bt.dmg*sc), exp:Math.round(bt.exp*sc),
        spd:bt.spd, aggro:bt.aggro, cv:bt.cv(),
        x, y, tx:x, ty:y, t:Math.random()*9, atkCd:0, dead:0, dying:0, kvx:0, kvy:0, sq:1,
      });
    }
  }
})();
function mobRespawnPos(m){
  for(let t=0;t<30;t++){
    const x=(m.rect[0]+Math.random()*(m.rect[2]-m.rect[0]))*TILE;
    const y=(m.rect[1]+Math.random()*(m.rect[3]-m.rect[1]))*TILE;
    if (walkableAt(x,y)){ m.x=x; m.y=y; m.tx=x; m.ty=y; return; }
  }
}
function playerInRect(r,pad=3){
  const tx=me.x/TILE, ty=me.y/TILE;
  return tx>r[0]-pad && tx<r[2]+pad && ty>r[1]-pad && ty<r[3]+pad;
}

/* ---------- NPC penghuni chill lounge ---------- */
const NPC_LINES = [
  'GM explorer! ⚡','udah stake rkuSOL belum? 😎','chill dulu di api unggun 🔥',
  'network aman berkat Raiku 🐉','WAGMI!','block baru dikonfirmasi... nice',
  'hati-hati ke Volcanic Ridge, Lv.15+ baru aman!','kraken di utara timur itu... seram 😨',
  'gurun di barat banyak scorpion, EXP-nya lumayan','aku suka duduk di sini liat danau',
];
const npcs = [
  {nick:'NodeRunner', skin:{body:1,crest:1,belly:2,eye:1,wing:0,acc:0}, x:160*TILE,y:105*TILE, hx:159,hy:107},
  {nick:'BlockSmith', skin:{body:5,crest:3,belly:1,eye:2,wing:0,acc:1}, x:167*TILE,y:108*TILE, hx:166,hy:110},
  {nick:'rkuFanGirl', skin:{body:3,crest:2,belly:3,eye:4,wing:1,acc:2}, x:162*TILE,y:110*TILE, hx:162,hy:112},
];
npcs.forEach(n=>{n.tx=n.x;n.ty=n.y;n.dir=1;n.moving=false;n.t=Math.random()*10;n.bubble=null;n.wait=2+Math.random()*6;n.npc=true;});
