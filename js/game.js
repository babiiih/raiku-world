/* ============================================================
   RAIKU WORLD — game.js : update loop, combat, input, UI dunia
   ============================================================ */
let zoneNow='', lavaAcc=0, gateAcc=0;

function update(dt,tm){
  if (hitStop>0){ hitStop-=dt; dt=Math.max(0.0001, dt*0.12); }
  if (me.hurtT>0) me.hurtT-=dt;
  dayT += dt;
  for(let i=0;i<cds.length;i++) if(cds[i]>0) cds[i]=Math.max(0,cds[i]-dt);
  if(!me.dead){
    me.mp = Math.min(maxMp(), me.mp + 4*dt);
    me.hp = Math.min(maxHp(), me.hp + (inZone('CHILL')?6:1.2)*dt);
  }
  /* ---- gerakan: momentum + pengaruh medan (es licin, rawa lambat) ---- */
  const v = joyVec();
  let ix=0, iy=0;
  if (!me.dead && !chatFocused()){
    if (keys['arrowleft']||keys['a']) ix-=1;
    if (keys['arrowright']||keys['d']) ix+=1;
    if (keys['arrowup']||keys['w']) iy-=1;
    if (keys['arrowdown']||keys['s']) iy+=1;
  }
  ix+=v.x; iy+=v.y;
  const il=Math.hypot(ix,iy);
  if (il>1){ ix/=il; iy/=il; }
  const want = il>0.12 && !me.dead;
  const ice = onIce(me.x,me.y);
  const tmod = tileSpeedAt(me.x,me.y);
  if (want){
    me.sit=false;
    const dot=me.vx*ix+me.vy*iy;
    let acc = (dot<-20 ? 1500 : 760)*tmod;
    if (ice) acc*=0.28;                       // es: susah grip
    if (dot<-45 && Math.hypot(me.vx,me.vy)>65 && now()-lastSkid>380 && !ice){
      lastSkid=now(); dustAt(me.x,me.y,5); SFX.skid();
    }
    me.vx+=ix*acc*dt; me.vy+=iy*acc*dt;
  } else {
    const fric = ice? 55 : 500;               // es: meluncur jauh
    const sp=Math.hypot(me.vx,me.vy);
    if (sp>0.1){ const ns=Math.max(0,sp-fric*dt); me.vx*=ns/sp; me.vy*=ns/sp; }
    else { me.vx=0; me.vy=0; }
  }
  if (me.dashT>0) me.dashT-=dt;
  else {
    const sp2=Math.hypot(me.vx,me.vy), lim=96*tmod*(want?Math.min(1,Math.max(il,0.25)):1);
    if (sp2>lim && sp2>0){ const f=Math.max(lim,sp2-(ice?120:900)*dt)/sp2; me.vx*=f; me.vy*=f; }
  }
  me.moving = Math.hypot(me.vx,me.vy)>12 && !me.dead;
  if (want && Math.abs(ix)>0.3) me.dir = ix>0?1:-1;
  if (!me.dead) tryMove(me.vx*dt, me.vy*dt);

  /* ---- bahaya lava ---- */
  lavaAcc+=dt;
  if (lavaAcc>0.5){ lavaAcc=0;
    if (!me.dead && nearLava(me.x,me.y)){
      SFX.sizzle(); addParts(me.x,me.y-8,'#ff7a2a',8,60);
      hurtMe(6+Math.floor(me.lv*0.8), null);
    }
  }
  /* ---- penemuan waypoint ---- */
  gateAcc+=dt;
  if (gateAcc>0.5){ gateAcc=0;
    for(const g of GATES){
      if (!me.wps[g.id] && dist2(me.x,me.y,(g.x+0.5)*TILE,(g.y+0.5)*TILE)<48*48){
        me.wps[g.id]=true; SFX.gate();
        toast('⚡ WAYPOINT DITEMUKAN: '+g.nm);
        addParts((g.x+0.5)*TILE,(g.y)*TILE,'#C0FF38',22,80);
        saveDirty=true;
      }
    }
  }
  /* ---- projectiles ---- */
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i];
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.t-=dt;
    let hit = !walkableAt(p.x,p.y) || p.t<=0;
    for(const m of mobs){ if(m.dead<=0 && m.dying<=0 && p.dmg>0 && dist2(p.x,p.y,m.x,m.y-8)<14*14){ damageMob(m,p.dmg,'#38e8f8'); hit=true; break; } }
    if (hit){ addParts(p.x,p.y,'#38e8f8',8,50); projectiles.splice(i,1); }
  }
  for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=60*dt; p.t-=dt; if(p.t<=0) particles.splice(i,1); }
  for(let i=floats.length-1;i>=0;i--){ const f=floats[i];
    f.vy=(f.vy===undefined?-72:f.vy)*Math.exp(-3.6*dt); f.y+=f.vy*dt;
    f.t-=dt; if(f.t<=0) floats.splice(i,1); }
  for(let i=fxs.length-1;i>=0;i--){ fxs[i].t-=dt; if(fxs[i].t<=0) fxs.splice(i,1); }

  /* ---- AI monster (per region) ---- */
  for(const m of mobs){
    if (m.dead>0){ m.dead-=dt; if(m.dead<=0){ m.hp=m.maxHp; m.sq=1; mobRespawnPos(m); } continue; }
    if (m.dying>0){
      m.dying-=dt; m.x+=(m.kvx||0)*dt; m.y+=(m.kvy||0)*dt;
      if (m.dying<=0){ m.dying=0; m.dead=m.boss?60:8; }
      continue;
    }
    if (m.kvx||m.kvy){
      m.x+=m.kvx*dt; m.y+=m.kvy*dt;
      const dk=Math.exp(-9*dt); m.kvx*=dk; m.kvy*=dk;
      if (Math.abs(m.kvx)+Math.abs(m.kvy)<4){ m.kvx=m.kvy=0; }
    }
    m.atkCd=Math.max(0,m.atkCd-dt); m.t+=dt;
    const d2p = dist2(m.x,m.y,me.x,me.y);
    if (!me.dead && playerInRect(m.rect) && d2p < m.aggro*m.aggro){
      const d=Math.sqrt(d2p)||1;
      if (d>14){ const nx=m.x+(me.x-m.x)/d*m.spd*1.6*dt, ny=m.y+(me.y-m.y)/d*m.spd*1.6*dt;
        if(walkableAt(nx,ny)||m.ghost){ m.x=nx; m.y=ny; } }
      else if (m.atkCd<=0){ m.atkCd=1.1; m.sq=0.8; hurtMe(m.dmg, m); }
    } else {
      if (dist2(m.x,m.y,m.tx,m.ty)<16 || Math.random()<0.004){
        m.tx=(m.rect[0]+Math.random()*(m.rect[2]-m.rect[0]))*TILE;
        m.ty=(m.rect[1]+Math.random()*(m.rect[3]-m.rect[1]))*TILE;
      }
      const d=Math.hypot(m.tx-m.x,m.ty-m.y)||1;
      const nx=m.x+(m.tx-m.x)/d*m.spd*dt, ny=m.y+(m.ty-m.y)/d*m.spd*dt;
      if(walkableAt(nx,ny)||m.ghost){ m.x=nx; m.y=ny; }
    }
  }
  /* ---- NPC ---- */
  for(const n of npcs){
    n.t+=dt;
    if (n.moving){
      const d=Math.hypot(n.tx-n.x,n.ty-n.y);
      if (d<4){ n.moving=false; n.wait=3+Math.random()*7; }
      else { n.x+=(n.tx-n.x)/d*30*dt; n.y+=(n.ty-n.y)/d*30*dt; n.dir=(n.tx>n.x)?1:-1; }
    } else {
      if (dist2(n.x,n.y,me.x,me.y)<70*70) n.dir = me.x>n.x?1:-1;
      n.wait-=dt;
      if (n.wait<=0){
        const a=Math.random()*Math.PI*2, r=2+Math.random()*4;
        const tx=(n.hx+Math.cos(a)*r)*TILE, ty=(n.hy+Math.sin(a)*r)*TILE;
        if (walkableAt(tx,ty)){ n.tx=tx; n.ty=ty; n.moving=true; }
        else n.wait=1;
      }
      if (Math.random()<0.0012 && dist2(n.x,n.y,me.x,me.y)<200*200){
        const line=NPC_LINES[Math.floor(Math.random()*NPC_LINES.length)];
        n.bubble={txt:line, until:now()+4500};
        addChatMsg(n.nick, line, 'npc');
      }
    }
  }
  for(const [,o] of others){ o.x += (o.tx-o.x)*Math.min(1,dt*10); o.y += (o.ty-o.y)*Math.min(1,dt*10); }
  /* ---- kamera ---- */
  lookX += ((me.vx*0.42)-lookX)*Math.min(1,dt*2.4);
  lookY += ((me.vy*0.34)-lookY)*Math.min(1,dt*2.4);
  camX += ((me.x+lookX-VW2/2)-camX)*Math.min(1,dt*5.2);
  camY += ((me.y+lookY-VH2/2-14)-camY)*Math.min(1,dt*5.2);
  camX = clamp(camX, 0, MW*TILE-VW2); camY = clamp(camY, 0, MH*TILE-VH2);
  /* ---- banner zona ---- */
  const z = zoneAt(me.x/TILE, me.y/TILE);
  if (z!==zoneNow){ zoneNow=z;
    if(z){ $('zoneBanner').textContent=z; $('zoneBanner').style.opacity=1;
      clearTimeout($('zoneBanner')._t); $('zoneBanner')._t=setTimeout(()=>$('zoneBanner').style.opacity=0, 2200); }
  }
  updateHud();
  NETSYNC(dt);
}
function fits(x,y){
  const h=5;
  return walkableAt(x-h,y-2)&&walkableAt(x+h,y-2)&&walkableAt(x-h,y+3)&&walkableAt(x+h,y+3);
}
function tryMove(dx,dy){
  if (fits(me.x+dx,me.y)) me.x+=dx; else me.vx*=-0.15;
  if (fits(me.x,me.y+dy)) me.y+=dy; else me.vy*=-0.15;
  me.x=clamp(me.x,TILE*3,MW*TILE-TILE*3); me.y=clamp(me.y,TILE*3,MH*TILE-TILE*3);
}
function zoneAt(tx,ty){
  for(const z of ZONES) if(tx>=z.x1&&tx<=z.x2&&ty>=z.y1&&ty<=z.y2) return z.name;
  return '';
}
function inZone(tag){ return zoneNow.includes(tag); }

/* ============================================================
   COMBAT
   ============================================================ */
function damageMob(m,dmg,col='#FDFDFF'){
  if (m.dead>0 || m.dying>0) return;
  m.hp-=dmg; m.flash=1; m.sq=0.6;
  const d=Math.max(12,Math.hypot(m.x-me.x,m.y-me.y));
  const kbf=m.boss?0.25:1;
  m.kvx=(m.x-me.x)/d*150*kbf; m.kvy=(m.y-me.y)/d*95*kbf;
  hitStop=Math.max(hitStop,0.045);
  shake=Math.max(shake,3.5);
  addFloat(m.x,m.y-24,dmg,col);
  addParts(m.x,m.y-10,col,8,60);
  SFX.hit();
  if (m.hp<=0){
    m.dying=0.38;
    hitStop=Math.max(hitStop,0.09); shake=Math.max(shake,7);
    addParts(m.x,m.y-10,'#C0FF38',18,90);
    gainExp(m.exp);
    addFloat(m.x,m.y-34,'+'+m.exp+' EXP','#C0FF38');
    if (m.boss){ toast('★ KRAKEN DIKALAHKAN! NETWORK AMAN! ★'); flashCol='#C0FF38'; flashA=0.5; }
  }
}
function hurtMe(dmg,src){
  if (me.dead || now()<me.invUntil) return;
  if (now()<me.shieldUntil) dmg=Math.ceil(dmg*0.3);
  me.hp-=dmg; me.hurtT=0.3; me.invUntil=now()+520;
  shake=Math.max(shake,8); hitStop=Math.max(hitStop,0.055);
  if (src){
    const d=Math.max(10,Math.hypot(me.x-src.x,me.y-src.y));
    me.vx+=(me.x-src.x)/d*190; me.vy+=(me.y-src.y)/d*140;
    me.dashT=Math.max(me.dashT,0.16);
  }
  if (me.anim) me.anim.sqV-=2.5;
  addFloat(me.x,me.y-40,'-'+dmg,'#ff5470');
  SFX.hurt();
  if (me.hp<=0 && !me.dead){
    me.dead=true; SFX.die();
    toast('KAMU TUMBANG! respawn di Plaza...', true);
    addParts(me.x,me.y-12,'#ff5470',22,90);
    setTimeout(()=>{ me.x=SPAWN.x; me.y=SPAWN.y; me.hp=maxHp(); me.mp=maxMp(); me.dead=false; me.vx=me.vy=0;
      if(me.anim){me.anim.px=me.x;me.anim.py=me.y;me.anim.vx=me.anim.vy=0;} }, 1800);
  }
}
function gainExp(n){
  me.exp+=n;
  let up=false;
  while (me.exp>=expNext() && me.lv<50){ me.exp-=expNext(); me.lv++; up=true; }
  if (up){
    SFX.lvup(); flashCol='#FDFDFF'; flashA=0.3;
    toast('★ LEVEL UP! Lv.'+me.lv);
    SKILLS.filter(s=>s.unlock===me.lv).forEach(s=>toast('SKILL BARU: '+s.ic+' '+s.nm));
    me.hp=maxHp(); me.mp=maxMp();
    buildHotbar();
  }
  saveDirty=true;
}
function useSkill(i){
  const s=SKILLS[i];
  if (!s || me.dead) return;
  if (me.lv<s.unlock){ toast('terkunci — butuh Lv.'+s.unlock, true); return; }
  if (cds[i]>0) return;
  if (me.mp<s.mp){ toast('MP kurang!', true); return; }
  me.mp-=s.mp; cds[i]=s.cd; me.sit=false;
  const fx=me.dir, cxp=me.x+fx*20, cyp=me.y-8;
  switch(i){
    case 0:
      SFX.slash();
      me.vx += fx*165; me.dashT=Math.max(me.dashT,0.08);
      if (me.anim) me.anim.sqV += 1.4;
      fxs.push({type:'slash',x:me.x,y:me.y,dirr:fx>0?0:Math.PI,t:.18,dur:.18,col:'#C0FF38'});
      meleeHit(cxp,cyp,26, 8+2*me.lv, '#C0FF38');
      NETFX('slash');
      break;
    case 1:
      SFX.bolt();
      projectiles.push({x:me.x+fx*10,y:me.y-10,vx:fx*250,vy:0,t:1.1,dmg:12+2*me.lv});
      NETFX('bolt');
      break;
    case 2:
      SFX.dash();
      me.vx = fx*440; me.vy *= 0.25; me.dashT = 0.22;
      if (me.anim){ me.anim.sqV += 2.8; }
      dustAt(me.x,me.y,4);
      addParts(me.x-fx*14,me.y-10,'#C0FF38',12,70);
      break;
    case 3:
      SFX.shield();
      me.shieldUntil=now()+4500;
      flashCol='#38bdf8'; flashA=0.15;
      break;
    case 4:
      SFX.heal();
      me.hp=Math.min(maxHp(), me.hp+Math.floor(maxHp()*0.35));
      fxs.push({type:'heal',x:me.x,y:me.y,t:.7,dur:.7});
      addFloat(me.x,me.y-44,'+HP','#C0FF38');
      NETFX('heal');
      break;
    case 5:
      SFX.nova();
      fxs.push({type:'ring',x:me.x,y:me.y-8,r:22,t:.4,dur:.4,col:'#38e8f8'});
      aoeHit(me.x,me.y,62, 16+2*me.lv, '#38e8f8');
      NETFX('nova');
      break;
    case 6:
      SFX.roar();
      shake=16; flashCol='#C0FF38'; flashA=0.4; hitStop=Math.max(hitStop,0.1);
      if (me.anim){ me.anim.sqV -= 3.5; }
      fxs.push({type:'roar',x:me.x,y:me.y-8,r:40,t:.7,dur:.7,col:'#C0FF38'});
      aoeHit(me.x,me.y,115, 30+3*me.lv, '#C0FF38');
      NETFX('roar');
      break;
  }
  buildHotbarCd();
}
function meleeHit(x,y,r,dmg,col){
  for(const m of mobs) if(m.dead<=0 && m.dying<=0 && dist2(x,y,m.x,m.y-8)<r*r) damageMob(m,dmg,col);
}
function aoeHit(x,y,r,dmg,col){
  for(const m of mobs) if(m.dead<=0 && m.dying<=0 && dist2(x,y,m.x,m.y-8)<r*r) damageMob(m,dmg,col);
}
function emote(kind){
  SFX.emote();
  if (me.anim) me.anim.sqV += 1.8;
  if (kind==='wave'){ me.bubble={txt:'👋', until:now()+2500}; NETFX('bub:👋'); }
  if (kind==='sit'){ me.sit=!me.sit; if(me.sit){me.bubble={txt:'🧘', until:now()+2000}; NETFX('bub:🧘');} }
  if (kind==='dance'){ me.bubble={txt:'🕺🎶', until:now()+3000}; NETFX('bub:🕺🎶'); }
}

/* ============================================================
   HUD / hotbar / input / chat DOM
   ============================================================ */
function updateHud(){
  $('hudNick').childNodes[0].nodeValue = me.nick||'RAIKU';
  $('hudLv').textContent = ' Lv.'+me.lv;
  $('hbHp').firstElementChild.style.width = clamp(me.hp/maxHp()*100,0,100)+'%';
  $('hbMp').firstElementChild.style.width = clamp(me.mp/maxMp()*100,0,100)+'%';
  $('hbXp').firstElementChild.style.width = clamp(me.exp/expNext()*100,0,100)+'%';
}
function buildHotbar(){
  const hb=$('hotbar'); hb.innerHTML='';
  SKILLS.forEach((s,i)=>{
    const b=document.createElement('button');
    b.className='skillbtn'+(me.lv<s.unlock?' locked':'');
    b.innerHTML=`<span class="kb">${s.key}</span><span class="ic">${me.lv<s.unlock?'🔒':s.ic}</span><span class="nm">${me.lv<s.unlock?'Lv.'+s.unlock:s.nm}</span>`;
    b.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse'){ e.preventDefault(); b._pt=now(); useSkill(i); } });
    b.onclick=()=>{ if(!b._pt || now()-b._pt>400) useSkill(i); };
    b.id='sk'+i;
    hb.appendChild(b);
  });
  const eb=document.createElement('button');
  eb.className='skillbtn emoteb';
  eb.innerHTML='<span class="ic">👋</span>';
  eb.addEventListener('pointerdown',e=>{ e.preventDefault(); emote('wave'); });
  hb.appendChild(eb);
}
function buildHotbarCd(){
  SKILLS.forEach((s,i)=>{
    const b=$('sk'+i); if(!b) return;
    if (cds[i]>0){ b.classList.add('cd'); b.style.setProperty('--cd', cds[i]/s.cd); }
    else b.classList.remove('cd');
  });
}
setInterval(buildHotbarCd, 100);

const keys={};
window.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if (chatFocused()){
    if (k==='escape') $('chatInput').blur();
    return;
  }
  keys[k]=true;
  if (!$('gameScreen').classList.contains('active')) return;
  if (k>='1'&&k<='7') useSkill(parseInt(k)-1);
  if (k==='e') emote('wave');
  if (k==='q') emote('sit');
  if (k==='m'){ e.preventDefault(); toggleMap(); }
  if (k==='enter'){ e.preventDefault(); $('chatInput').focus(); }
});
window.addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
function chatFocused(){ return document.activeElement===$('chatInput'); }

/* joystick mengambang */
let joyState={x:0,y:0};
function joyVec(){ return joyState; }
(function(){
  const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints||0)>0;
  if (isTouch) document.body.classList.add('touch');
  const joy=$('joy'), knob=$('joyKnob'), gs=$('gameScreen');
  let pid=null, ox=0, oy=0, usedOnce=false;
  function setKnob(dx,dy){
    const d=Math.hypot(dx,dy), max=40;
    if (d>max){ dx=dx/d*max; dy=dy/d*max; }
    joyState={x:dx/max, y:dy/max};
    knob.style.left=(32+dx)+'px'; knob.style.top=(32+dy)+'px';
  }
  function reset(){
    pid=null; joyState={x:0,y:0};
    knob.style.left='32px'; knob.style.top='32px';
    joy.classList.remove('on');
  }
  gs.addEventListener('pointerdown',e=>{
    if (!document.body.classList.contains('touch')) return;
    if (e.target!==cvW) return;
    const r=gs.getBoundingClientRect();
    if (e.clientX-r.left > r.width*0.62) return;
    pid=e.pointerId; ox=e.clientX; oy=e.clientY;
    joy.style.left=(e.clientX-r.left-55)+'px';
    joy.style.top =(e.clientY-r.top -55)+'px';
    joy.classList.add('on');
    if (!usedOnce){ usedOnce=true; $('joyHint').classList.add('off'); }
    e.preventDefault();
  },{passive:false});
  window.addEventListener('pointermove',e=>{ if(e.pointerId===pid) setKnob(e.clientX-ox, e.clientY-oy); });
  window.addEventListener('pointerup',e=>{ if(e.pointerId===pid) reset(); });
  window.addEventListener('pointercancel',e=>{ if(e.pointerId===pid) reset(); });
})();

/* chat toggle mobile + badge */
let unread=0;
function bumpUnread(){
  if (!document.body.classList.contains('touch')) return;
  if ($('chatBox').classList.contains('open')) return;
  unread++;
  const b=$('chatBadge'); b.textContent=unread>9?'9+':unread; b.classList.add('show');
}
$('chatToggle').onclick=()=>{
  const cb=$('chatBox');
  cb.classList.toggle('open');
  if (cb.classList.contains('open')){
    unread=0; $('chatBadge').classList.remove('show');
    $('chatMsgs').scrollTop=$('chatMsgs').scrollHeight;
  }
};
function addChatMsg(nick,txt,cls=''){
  const el=$('chatMsgs');
  const d=document.createElement('div');
  d.innerHTML = cls==='sys' ? `<span class="sys">${esc(txt)}</span>`
    : `<span class="cn ${cls}">${esc(nick)}:</span> ${esc(txt)}`;
  el.appendChild(d);
  while (el.children.length>60) el.firstChild.remove();
  el.scrollTop=el.scrollHeight;
  if (cls!=='sys') bumpUnread();
}

/* ============================================================
   PETA DUNIA + teleport waypoint
   ============================================================ */
let mapIv=null;
function toggleMap(force){
  const ov=$('mapOverlay');
  const show = force!==undefined ? force : !ov.classList.contains('show');
  ov.classList.toggle('show', show);
  clearInterval(mapIv);
  if (show){ drawBigmap(); mapIv=setInterval(drawBigmap, 600); SFX.click(); }
}
$('mapBtn').onclick=()=>toggleMap();
$('mapClose').onclick=()=>toggleMap(false);
$('mapOverlay').addEventListener('click',e=>{ if(e.target===$('mapOverlay')) toggleMap(false); });

function drawBigmap(){
  const bc=$('bigmap'), g=bc.getContext('2d');
  const sc=bc.width/MW;
  g.imageSmoothingEnabled=false;
  g.drawImage(mmBase,0,0,bc.width,bc.height);
  // grid halus
  g.fillStyle='rgba(0,2,4,0.15)'; g.fillRect(0,0,bc.width,bc.height);
  for(const gt of GATES){
    const gx=gt.x*sc, gy=gt.y*sc;
    if (me.wps[gt.id]){
      g.fillStyle='#C0FF38';
      g.beginPath(); g.arc(gx,gy,5,0,7); g.fill();
      g.strokeStyle='rgba(192,255,56,0.5)'; g.lineWidth=2;
      g.beginPath(); g.arc(gx,gy,9+Math.sin(now()/300)*2,0,7); g.stroke();
      g.fillStyle='#FDFDFF'; g.font='bold 10px monospace'; g.textAlign='center';
      g.fillText(gt.nm, gx, gy-13);
    } else {
      g.fillStyle='rgba(253,253,255,0.3)';
      g.beginPath(); g.arc(gx,gy,4,0,7); g.fill();
      g.fillStyle='rgba(253,253,255,0.4)'; g.font='bold 10px monospace'; g.textAlign='center';
      g.fillText('?', gx, gy-8);
    }
  }
  // posisi pemain
  const px=me.x/TILE*sc, py=me.y/TILE*sc;
  g.fillStyle='#FDFDFF';
  g.beginPath(); g.arc(px,py,4,0,7); g.fill();
  g.fillStyle='#C0FF38';
  g.beginPath(); g.arc(px,py,2.5,0,7); g.fill();
}
$('bigmap').addEventListener('click',e=>{
  const bc=$('bigmap'), r=bc.getBoundingClientRect();
  const mx=(e.clientX-r.left)/r.width*MW, my=(e.clientY-r.top)/r.height*MH;
  let best=null, bd=1e9;
  for(const gt of GATES){
    if (!me.wps[gt.id]) continue;
    const d=dist2(mx,my,gt.x,gt.y);
    if (d<bd){ bd=d; best=gt; }
  }
  if (best && bd<20*20){
    SFX.tp();
    addParts(me.x,me.y-10,'#C0FF38',16,80);
    me.x=(best.x+0.5)*TILE; me.y=(best.y+1.5)*TILE;
    me.vx=me.vy=0;
    if (me.anim){ me.anim.px=me.x; me.anim.py=me.y; me.anim.vx=me.anim.vy=0; }
    camX=clamp(me.x-VW2/2,0,MW*TILE-VW2); camY=clamp(me.y-VH2/2,0,MH*TILE-VH2);
    addParts(me.x,me.y-10,'#C0FF38',16,80);
    toast('⚡ Teleport ke '+best.nm);
    toggleMap(false);
  }
});

/* ============================================================
   CHARACTER CREATOR + preview auth
   ============================================================ */
let curSkin = defaultSkin();
function buildCreator(){
  const mk=(id,arr,key,isColor,pairIdx)=>{
    const el=$(id); el.innerHTML='';
    arr.forEach((v,i)=>{
      let b;
      if (isColor){ b=document.createElement('div'); b.className='sw';
        b.style.background = Array.isArray(v)?v[pairIdx??0]:v; }
      else { b=document.createElement('button'); b.className='pill'; b.textContent=v; }
      if (curSkin[key]===i) b.classList.add('on');
      b.onclick=()=>{ curSkin[key]=i; SFX.click(); buildCreator(); drawPreview(); };
      el.appendChild(b);
    });
  };
  mk('optBody',OPTS.body,'body',true,1);
  mk('optCrest',OPTS.crest,'crest',true,0);
  mk('optBelly',OPTS.belly,'belly',true);
  mk('optEye',OPTS.eye,'eye',true);
  mk('optWing',OPTS.wing,'wing',false);
  mk('optAcc',OPTS.acc,'acc',false);
}
function drawPreview(){
  const c=$('charPrev'), g=c.getContext('2d');
  g.imageSmoothingEnabled=false;
  g.clearRect(0,0,c.width,c.height);
  const s=skinCanvas(curSkin);
  const sc=Math.floor(Math.min(c.width/24, c.height/s.height));
  g.drawImage(s,(c.width-24*sc)/2,(c.height-s.height*sc)/2,24*sc,s.height*sc);
}
(function(){
  const c=$('authPrev'), g=c.getContext('2d');
  g.imageSmoothingEnabled=false;
  const s1=skinCanvas(defaultSkin()), s2=skinCanvas({body:1,crest:1,belly:2,eye:1,wing:0,acc:1});
  let t=0;
  (function ap(){ t++;
    g.clearRect(0,0,120,60);
    const b1=Math.round(Math.sin(t/30)*1.5), b2=Math.round(Math.sin(t/30+2)*1.5);
    g.drawImage(s1, 18, 60-48+b1, 48, 48);
    g.save(); g.translate(120,0); g.scale(-1,1);
    g.drawImage(s2, 16, 60-s2.height*2+b2, 48, s2.height*2);
    g.restore();
    requestAnimationFrame(ap);
  })();
})();
