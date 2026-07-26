/* ============================================================
   RAIKU WORLD — sprites.js : pixel art naga, monster & skin
   ============================================================ */

/* naga Raiku 24x24. K outline, G body-dark, g body-mid, L crest, l crest-dim,
   B belly, W eye-white, P tongue, F wing, Y crown, R scarf, k glasses */
const BASE = [
"......L....LL....L......",
".....LL...LLLL...LL.....",
".....LLL..LLLL..LLL.....",
"....KLLLKKLLLLKKLLLK....",
"....KGLLLGGLLGGLLLGK....",
"...KGGGGGGGGGGGGGGGGK...",
"..KGGGGGGGGllGGGGGGGGK..",
"..KGGLLLLGGGGGGLLLLGGK..",
"..KGGLWKLGGGGGGLWKLGGK..",
"..KGGLKKLGGGGGGLKKLGGK..",
"..KGGLLLLGGGGGGLLLLGGK..",
"..KGGGGGGKKKKKKGGGGGGK..",
"..KGGGGGGKPPPPKGGGGGGK..",
"...KGGGGGKKKKKKGGGGGK...",
"....KKGGGGGGGGGGGGKK....",
"..KFFKGGBBBllBBBGGKFFK..",
".KFFFKGGBBBBBBBBGGKFFFK.",
".KFFKGGGBBBBBBBBGGGKFFK.",
"..KKKGGGBBBBBBBBGGGKKK..",
"....KGGGGBBBBBBGGGGK....",
"....KGGGGGBBBBGGGGGK....",
".....KGGGGGGGGGGGGK.....",
".....KGGK......KGGK.....",
"....KLLLK......KLLLK....",
];

/* ---------- monster maps ---------- */
const SLIME_MAP = [
"......UUUUUUUU......",
"....UUUUUUUUUUUU....",
"...UUUWWUUUUWWUUU...",
"...UUUWKUUUUWKUUU...",
"..UUUUUUUUUUUUUUUU..",
"..UUUUUuuuuuUUUUUU..",
".UUUUUUUUUUUUUUUUUU.",
".UuUUUUUUUUUUUUUuUU.",
".UuuUUUUUUUUUUUuuUU.",
"..uuuuuuuuuuuuuuuu..",
];
const GHOST_MAP = [
"....WWWWWWWWWW......",
"...WWWWWWWWWWWW.....",
"..WWKKWWWWWWKKWW....",
"..WWKKWWWWWWKKWW....",
"..WWWWWWWWWWWWWW....",
"..WWWWWKKKKWWWWW....",
"..WWWWWWWWWWWWWW....",
"..WWWWWWWWWWWWWW....",
"..WW.WWW.WWW.WWW....",
"..W...W...W...W.....",
];
const SCORP_MAP = [
".......YO.........",
"......oOo.........",
"OO......o.......OO",
"OOO....OOOO....OOO",
".OO..OOOOOOOO..OO.",
"..O.OOoKOOKoOO.O..",
"....OOOOOOOOOO....",
"..O.OOOOOOOOOO.O..",
".O..oOOOOOOOOo..O.",
"....O.o....o.O....",
"...o..........o...",
"..oo....oo....oo..",
];
const YETI_MAP = [
"....EEEEEEEE....",
"...EEEEEEEEEE...",
"..EEKKEEEEKKEE..",
"..EEKKEEEEKKEE..",
"..EEEEEeeEEEEE..",
"..EEEeKKKKeEEE..",
"...EEEEEEEEEE...",
"..EEEEEEEEEEEE..",
".EEeEEEEEEEEeEE.",
".EEeEEEEEEEEeEE.",
"..EEEEEEEEEEEE..",
"...eeEEEEEEee...",
"...EE..EE..EE...",
"..ee...ee...ee..",
];
const IMP_MAP = [
".r..........r...",
".Rr........rR...",
"..RR.RRRR.RR....",
"..RRRRRRRRRR....",
"..RYKRRRRKYR....",
"..RRRRRRRRRR....",
"...RRKKKKRR.....",
"..RRRRRRRRRR....",
".RRrRRRRRRrRR...",
".R.rRRRRRRr.R...",
"....rRRRRr......",
"....R.RR.R......",
"...rr.rr.rr.....",
];
const KRAKEN_MAP = [
"......rrRRRRrr......",
"....rrRRRRRRRRrr....",
"...rRRRRRRRRRRRRr...",
"..rRRRRRRRRRRRRRRr..",
"..rRRYYKRRRRKYYRRr..",
".rRRRYYKRRRRKYYRRRr.",
".rRRRRRRRRRRRRRRRRr.",
".rRRRRRKKKKKKRRRRRr.",
".rRRRRKrrrrrrKRRRRr.",
".rRRRRRRRRRRRRRRRRr.",
"..rRRrRRrRRrRRrRRr..",
"..rRr.rRr.rRr.rRr...",
".rRr..rRr..rRr..rRr.",
".rr...rr....rr...rr.",
"rr....r......r....rr",
];

const ENEMY_PAL = {
  U:'#a855f7', u:'#6b21a8', W:'#e8ecf4', K:'#0a0f16',
  O:'#ffa438', o:'#b06a1a', Y:'#ffd166',
  E:'#e8f4fc', e:'#93b4d4',
  R:'#ff5470', r:'#a1123a',
  N:'#7ec822', n:'#3e7a14',
};

/* ---------- skin options ---------- */
const OPTS = {
  body:[ ['#1c3b22','#2e5c33'], ['#14324a','#20618a'], ['#4a1420','#7a2136'],
         ['#2e1a4a','#4d2c80'], ['#191b20','#2b2f38'], ['#5a4210','#8a6a1f'] ],
  crest:[ ['#C0FF38','#86c722'], ['#38e8f8','#1fa8c0'], ['#f85ce0','#b02da0'],
          ['#ffa438','#c0741f'], ['#FDFDFF','#b8c0c8'] ],
  belly:[ '#e4f9a8', '#f9edc8', '#d8f4f9', '#f9d8e8' ],
  eye:[ '#C0FF38', '#38e8f8', '#ffd166', '#ff5470', '#b78cf9' ],
  wing:[ 'Normal', 'Tanpa Sayap' ],
  acc:[ 'Tanpa', 'Mahkota', 'Syal', 'Kacamata' ],
};
const defaultSkin = ()=>({body:0,crest:0,belly:0,eye:0,wing:0,acc:0});

/* skin → offscreen canvas (cache per kombinasi) */
const skinCache = new Map();
function skinCanvas(skin, blink=false){
  if (blink && OPTS.acc[skin.acc]==='Kacamata') blink=false;
  const key = JSON.stringify(skin)+(blink?'|b':'');
  if (skinCache.has(key)) return skinCache.get(key);
  let grid = BASE.map(r=>r.split(''));
  const eyeRows=[7,8,9,10], eyeCols=new Set([5,6,7,8,15,16,17,18]);
  if (blink){
    for (const r of [7,8,9]) for (const c of eyeCols) if (grid[r][c]!=='.') grid[r][c]='G';
    for (const c of eyeCols) if (grid[10][c]!=='.') grid[10][c]='K';
  }
  if (OPTS.acc[skin.acc]==='Kacamata'){
    for (const r of [8,9]) for (const c of eyeCols) if (grid[r][c]!=='.') grid[r][c]='k';
    for (let c=9;c<=14;c++) if (grid[8][c]!=='.') grid[8][c]='k';
  }
  if (OPTS.acc[skin.acc]==='Syal'){
    grid[14] = "....KKRRRRRRRRRRRRKK....".split('');
  }
  if (OPTS.wing[skin.wing]==='Tanpa Sayap'){
    for (let r=15;r<=17;r++) for (let c=0;c<24;c++)
      if (grid[r][c]==='F'||(grid[r][c]==='K'&&(c<6||c>17))) grid[r][c]='.';
  }
  if (OPTS.acc[skin.acc]==='Mahkota'){
    grid.unshift("........YYYYYYYY........".split(''));
    grid.unshift("........Y..YY..Y........".split(''));
  }
  const [bd,bm]=OPTS.body[skin.body], [cl,cd]=OPTS.crest[skin.crest];
  const pal = {
    K:'#061007', G:bd, g:bm, L:cl, l:cd, F:cl,
    B:OPTS.belly[skin.belly], W:'#FDFDFF', P:'#ff8fa3',
    Y:'#ffd166', R:'#ff5470', k:'#0e1116',
  };
  const crownOff = OPTS.acc[skin.acc]==='Mahkota' ? 2 : 0;
  const c = document.createElement('canvas');
  c.width=24; c.height=grid.length;
  const g2 = c.getContext('2d');
  for (let r=0;r<grid.length;r++) for (let col=0;col<24;col++){
    const ch = grid[r][col];
    if (ch==='.'||ch===' '||ch===undefined) continue;
    let color = pal[ch]||'#f0f';
    if (ch==='L' && eyeRows.includes(r-crownOff) && eyeCols.has(col)) color = OPTS.eye[skin.eye];
    g2.fillStyle=color;
    g2.fillRect(col,r,1,1);
  }
  skinCache.set(key,c);
  return c;
}
function tintCanvas(src,color){
  const c=document.createElement('canvas'); c.width=src.width; c.height=src.height;
  const g=c.getContext('2d'); g.drawImage(src,0,0);
  g.globalCompositeOperation='source-atop'; g.fillStyle=color; g.fillRect(0,0,c.width,c.height);
  return c;
}
function enemyCanvas(map, palOverride={}){
  const pal = Object.assign({}, ENEMY_PAL, palOverride);
  const c=document.createElement('canvas');
  c.width=Math.max(...map.map(r=>r.length)); c.height=map.length;
  const g2=c.getContext('2d');
  map.forEach((row,r)=>{ for(let col=0;col<row.length;col++){
    const ch=row[col]; if(ch==='.'||ch===' ') continue;
    g2.fillStyle=pal[ch]||'#f0f'; g2.fillRect(col,r,1,1);
  }});
  return c;
}
const SLIME_CV = enemyCanvas(SLIME_MAP);
const TOX_CV   = enemyCanvas(SLIME_MAP, {U:'#7ec822', u:'#3e7a14', W:'#ffd166'});
const GHOST_CV = enemyCanvas(GHOST_MAP);
const SCORP_CV = enemyCanvas(SCORP_MAP);
const YETI_CV  = enemyCanvas(YETI_MAP);
const IMP_CV   = enemyCanvas(IMP_MAP);
const KRAK_CV  = enemyCanvas(KRAKEN_MAP);
