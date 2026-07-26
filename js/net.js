/* ============================================================
   RAIKU WORLD — net.js : Firebase auth, multiplayer, chat, boot
   ============================================================ */
const isConfigured = !String(FIREBASE_CONFIG.apiKey).includes('GANTI');
const fbOK = isConfigured && typeof firebase!=='undefined';
let db=null, auth=null, online=false, demo=false;
let saveDirty=false, fxCounter=0, pendingFx=null, lastSent='', sendAcc=0, hbAcc=0, saveAcc=0;

if (fbOK){
  firebase.initializeApp(FIREBASE_CONFIG);
  auth=firebase.auth(); db=firebase.database();
  $('cfgNote').textContent='server online siap ⚡';
} else {
  $('cfgNote').innerHTML = typeof firebase==='undefined'
    ? 'CDN Firebase tidak termuat — hanya mode demo yang tersedia.'
    : 'Firebase belum dikonfigurasi (lihat README.md).<br>Login online nonaktif — pakai MODE DEMO dulu.';
  $('authBtn').disabled=true; $('authBtn').style.opacity=.4;
}

let regMode=false;
$('tabLogin').onclick=()=>{ regMode=false; $('tabLogin').classList.add('on'); $('tabReg').classList.remove('on');
  $('pass2Row').style.display='none'; $('authBtn').textContent='MASUK DUNIA ▶'; };
$('tabReg').onclick=()=>{ regMode=true; $('tabReg').classList.add('on'); $('tabLogin').classList.remove('on');
  $('pass2Row').style.display='block'; $('authBtn').textContent='DAFTAR & MASUK ▶'; };

const ERRMAP = {
  'auth/invalid-email':'Format email tidak valid.',
  'auth/user-not-found':'Akun tidak ditemukan. Coba DAFTAR dulu.',
  'auth/wrong-password':'Password salah.',
  'auth/invalid-credential':'Email atau password salah.',
  'auth/email-already-in-use':'Email sudah terdaftar. Coba MASUK.',
  'auth/weak-password':'Password minimal 6 karakter.',
  'auth/too-many-requests':'Terlalu banyak percobaan. Tunggu sebentar.',
  'auth/network-request-failed':'Gagal terhubung. Cek koneksi internet.',
};
function authMsg(t,ok=false){ const m=$('authMsg'); m.textContent=t; m.className='authmsg'+(ok?' ok':''); }

$('authBtn').onclick = async ()=>{
  if (!fbOK) return;
  const em=$('email').value.trim(), pw=$('pass').value;
  if (!em||!pw) return authMsg('Isi email & password dulu.');
  if (regMode && pw!==$('pass2').value) return authMsg('Password tidak sama.');
  $('authBtn').disabled=true; authMsg(regMode?'Mendaftarkan akun...':'Masuk...', true);
  try{
    if (regMode) await auth.createUserWithEmailAndPassword(em,pw);
    else await auth.signInWithEmailAndPassword(em,pw);
  }catch(e){
    authMsg(ERRMAP[e.code]||('Gagal: '+(e.message||e.code)));
    $('authBtn').disabled=false;
  }
};

$('demoBtn').onclick=()=>{
  demo=true; online=false;
  me.uid='demo';
  const savedNick = store('rw_nick'), savedSkin = store('rw_skin');
  if (savedSkin){ try{ curSkin=JSON.parse(savedSkin); }catch(e){} }
  if (savedNick) $('nick').value=savedNick;
  gotoCreator();
};

if (fbOK) auth.onAuthStateChanged(async user=>{
  if (!user || demo) return;
  me.uid=user.uid;
  authMsg('Memuat profil...', true);
  try{
    const snap = await db.ref('users/'+user.uid).get();
    const prof = snap.val();
    if (prof && prof.nick){
      me.nick=prof.nick; me.skin=prof.skin||defaultSkin();
      me.lv=prof.lv||1; me.exp=prof.exp||0;
      me.wps=Object.assign({plaza:true}, prof.wps||{});
      me.hp=maxHp(); me.mp=maxMp(); me._cv=me._cvB=me._cvR=null;
      curSkin={...me.skin};
      enterWorld();
    } else {
      gotoCreator();
    }
  }catch(e){
    authMsg('Gagal memuat profil: '+(e.code||e.message));
    $('authBtn').disabled=false;
  }
});

function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); }
function gotoCreator(){
  show('charScreen'); buildCreator(); drawPreview();
  if (me.nick) $('nick').value=me.nick;
}
$('charGo').onclick=async ()=>{
  const n=$('nick').value.trim();
  if (n.length<3) { $('charMsg').textContent='Nickname minimal 3 karakter.'; return; }
  if (!/^[a-zA-Z0-9_\-]+$/.test(n)) { $('charMsg').textContent='Hanya huruf, angka, _ dan -'; return; }
  me.nick=n; me.skin={...curSkin}; me._cv=me._cvB=me._cvR=null;
  store('rw_nick',n); store('rw_skin',JSON.stringify(curSkin));
  if (!demo && db && me.uid){
    $('charGo').disabled=true; $('charMsg').textContent='';
    try{
      await db.ref('users/'+me.uid).update({nick:me.nick, skin:me.skin, lv:me.lv, exp:me.exp, wps:me.wps});
    }catch(e){ $('charMsg').textContent='Gagal simpan: '+(e.code||e.message); $('charGo').disabled=false; return; }
    $('charGo').disabled=false;
  }
  enterWorld();
};

function enterWorld(){
  show('gameScreen');
  resize();
  me.x=SPAWN.x; me.y=SPAWN.y; me.hp=maxHp(); me.mp=maxMp(); me.dead=false;
  camX=clamp(me.x-VW2/2,0,MW*TILE-VW2); camY=clamp(me.y-VH2/2,0,MH*TILE-VH2);
  buildHotbar(); updateHud();
  $('chatMsgs').innerHTML='';
  addChatMsg('','— Selamat datang di RAIKU WORLD, '+me.nick+'! —','sys');
  addChatMsg('','Dunia luas menantimu: 6 biome, 7 waypoint, dan boss Kraken di timur laut. Buka PETA (M / 🗺) untuk fast-travel.','sys');
  addChatMsg('','Zona aman: Plaza & Chill Lounge 🔥 (HP regen cepat). Zona bahaya ditandai level di banner.','sys');
  if (demo) addChatMsg('','MODE DEMO — pemain online tidak terlihat. Setup Firebase untuk fitur online penuh (README.md).','sys');
  if (!demo && db) startNet();
  try{ ac().resume(); }catch(e){}
}

function myState(){
  return { nick:me.nick, skin:me.skin, x:Math.round(me.x), y:Math.round(me.y),
    dir:me.dir, mv:me.moving?1:0, sit:me.sit?1:0, lv:me.lv,
    fx:pendingFx, ts:firebase.database.ServerValue.TIMESTAMP };
}
function startNet(){
  online=true;
  const myRef = db.ref('world/'+me.uid);
  myRef.onDisconnect().remove();
  myRef.set(myState());
  db.ref('world').on('child_added', s=>{ if(s.key!==me.uid) remoteUpsert(s.key,s.val()); });
  db.ref('world').on('child_changed', s=>{ if(s.key!==me.uid) remoteUpsert(s.key,s.val()); });
  db.ref('world').on('child_removed', s=>{
    const o=others.get(s.key);
    if(o){ addChatMsg('', o.nick+' meninggalkan dunia.','sys'); others.delete(s.key); updOnline(); }
  });
  const t0=Date.now();
  db.ref('chat').limitToLast(30).on('child_added', s=>{
    const m=s.val(); if(!m||!m.txt) return;
    addChatMsg(m.nick||'???', m.txt);
    if (m.ts && m.ts>t0-2000){
      if (m.uid===me.uid) me.bubble={txt:m.txt, until:now()+5000};
      else { const o=others.get(m.uid); if(o) o.bubble={txt:m.txt, until:now()+5000}; }
      if (m.uid!==me.uid) SFX.msg();
    }
  });
}
function remoteUpsert(uid,v){
  if (!v||!v.nick) return;
  let o=others.get(uid);
  if (!o){
    o={nick:v.nick, skin:v.skin||defaultSkin(), x:v.x,y:v.y,tx:v.x,ty:v.y,dir:v.dir||1,
       moving:false,sit:false,lv:v.lv||1,bubble:null,_lastFx:v.fx?v.fx.t:-1,_cv:null,_seen:now()};
    others.set(uid,o);
    addChatMsg('', v.nick+' bergabung ke dunia!','sys');
  }
  o._seen=now();
  o.tx=v.x; o.ty=v.y; o.dir=v.dir||1; o.moving=!!v.mv; o.sit=!!v.sit; o.lv=v.lv||1;
  if (JSON.stringify(o.skin)!==JSON.stringify(v.skin)){ o.skin=v.skin; o._cv=o._cvB=o._cvR=null; }
  if (v.fx && v.fx.t!==o._lastFx){
    o._lastFx=v.fx.t;
    remoteFx(o, v.fx.k);
  }
  updOnline();
}
function remoteFx(o,k){
  if (!k) return;
  if (k.startsWith('bub:')){ o.bubble={txt:k.slice(4), until:now()+2500}; return; }
  if (k==='slash') fxs.push({type:'slash',x:o.x,y:o.y,dirr:o.dir>0?0:Math.PI,t:.18,dur:.18,col:'#C0FF38'});
  if (k==='bolt') projectiles.push({x:o.x+o.dir*10,y:o.y-10,vx:o.dir*250,vy:0,t:1,dmg:0});
  if (k==='nova') fxs.push({type:'ring',x:o.x,y:o.y-8,r:22,t:.4,dur:.4,col:'#38e8f8'});
  if (k==='roar') fxs.push({type:'roar',x:o.x,y:o.y-8,r:40,t:.7,dur:.7,col:'#C0FF38'});
  if (k==='heal') fxs.push({type:'heal',x:o.x,y:o.y,t:.7,dur:.7});
}
function updOnline(){ $('onlineNum').textContent = 1+others.size; }
function NETFX(k){ if(online) pendingFx={t:++fxCounter,k}; }

function NETSYNC(dt){
  for (const [uid,o] of others) if (now()-o._seen>20000){ others.delete(uid); updOnline(); }
  if (!online || !db) return;
  sendAcc+=dt; hbAcc+=dt; saveAcc+=dt;
  const st=myState(); delete st.ts;
  const ser=JSON.stringify(st);
  if ((sendAcc>0.12 && ser!==lastSent) || hbAcc>3){
    sendAcc=0; hbAcc=0; lastSent=ser;
    db.ref('world/'+me.uid).set(myState()).catch(()=>{});
    pendingFx=null;
  }
  if (saveAcc>10 && saveDirty){
    saveAcc=0; saveDirty=false;
    db.ref('users/'+me.uid).update({lv:me.lv, exp:me.exp, wps:me.wps}).catch(()=>{});
  }
}

let lastChat=0;
function sendChat(){
  const inp=$('chatInput'), txt=inp.value.trim();
  if (!txt) return;
  if (now()-lastChat<1200) return;
  lastChat=now();
  inp.value='';
  if (txt==='/dance'){ emote('dance'); return; }
  if (online && db){
    db.ref('chat').push({uid:me.uid, nick:me.nick, txt:txt.slice(0,140), ts:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});
  } else {
    addChatMsg(me.nick, txt);
    me.bubble={txt, until:now()+5000};
  }
  inp.blur();
}
$('chatSend').onclick=sendChat;
$('chatInput').addEventListener('keydown',e=>{
  if (e.key==='Enter'){ e.preventDefault(); sendChat(); }
  e.stopPropagation();
});

$('muteBtn2').onclick=function(){ muted=!muted; this.textContent=muted?'SFX ✕':'SFX'; };
$('editChar').onclick=()=>{ curSkin={...me.skin}; gotoCreator(); };
$('logoutBtn').onclick=async ()=>{
  try{ if(online&&db) await db.ref('world/'+me.uid).remove(); }catch(e){}
  try{ if(auth&&auth.currentUser) await auth.signOut(); }catch(e){}
  location.reload();
};
window.addEventListener('beforeunload',()=>{
  try{ if(online&&db){ db.ref('world/'+me.uid).remove(); if(saveDirty) db.ref('users/'+me.uid).update({lv:me.lv,exp:me.exp,wps:me.wps}); } }catch(e){}
});
resize();
