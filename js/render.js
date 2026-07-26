/* ============================================================
   RAIKU WORLD — render.js : kamera, tile, karakter, efek, minimap
   ============================================================ */
const cvW = $('world'), ctx = cvW.getContext('2d');
let SCALE=3, VW2=0, VH2=0;
let camX=0, camY=0, shake=0, flashA=0, flashCol='#C0FF38';
let hitStop=0, lookX=0, lookY=0, lastSkid=0;
let dayT=70;                       // waktu dunia (siklus 300 dtk)
const DAYLEN=300;
function nightF(){                 // 0 = siang, ~0.55 = tengah malam
  const ph=(dayT%DAYLEN)/DAYLEN;
  return ph<0.5 ? 0 : Math.sin((ph-0.5)/0.5*Math.PI)*0.55;
}

function resize(){
  const dpr = Math.min(2, window.devicePixelRatio||1);
  const cw = cvW.clientWidth||1, ch = cvW.clientHeight||1;
  cvW.width = Math.round(cw*dpr); cvW.height = Math.round(ch*dpr);
  SCALE = (cw<640 ? 2.3 : 3) * dpr;
  VW2 = cvW.width/SCALE; VH2 = cvW.height/SCALE;
  ctx.imageSmoothingEnabled=false;
}
window.addEventListener('resize',resize);
window.addEventListener('orientationchange',()=>setTimeout(resize,250));
if (window.visualViewport){
  window.visualViewport.addEventListener('resize',()=>{
    resize();
    const kb=Math.max(0, window.innerHeight-window.visualViewport.height);
    if (document.body.classList.contains('touch'))
      $('chatBox').style.transform = kb>60 ? `translateY(-${kb-40}px)` : '';
  });
}

function w2sx(wx){ return Math.round((wx-camX)*SCALE); }
function w2sy(wy){ return Math.round((wy-camY)*SCALE); }

/* ---------- tile ---------- */
function drawTile(x,y,t,tm){
  const sx=w2sx(x*TILE), sy=w2sy(y*TILE), s=Math.ceil(TILE*SCALE);
  ctx.fillStyle=TCOL[t]||'#12240f'; ctx.fillRect(sx,sy,s,s);
  const h=hash(x,y);
  if(t===T.GRASS){ if(h<.3){ ctx.fillStyle='rgba(192,255,56,0.05)'; ctx.fillRect(sx+((h*97)%12)*SCALE, sy+((h*53)%12)*SCALE, SCALE,SCALE);} }
  else if(t===T.WATER){
    const ph=Math.sin(tm/700+x*1.3+y*2.1);
    ctx.fillStyle=`rgba(56,189,248,${0.06+0.04*ph})`; ctx.fillRect(sx,sy,s,s);
    if(h<.25){ ctx.fillStyle='rgba(253,253,255,0.12)'; ctx.fillRect(sx+3*SCALE, sy+(2+2*Math.round(ph+1))*SCALE, 6*SCALE, SCALE);}
  }
  else if(t===T.SNOW){ if(h<.25){ ctx.fillStyle='rgba(253,253,255,0.5)'; ctx.fillRect(sx+((h*89)%13)*SCALE, sy+((h*37)%13)*SCALE, SCALE,SCALE);} }
  else if(t===T.ICE){
    ctx.fillStyle=`rgba(253,253,255,${0.12+0.06*Math.sin(tm/900+x+y)})`;
    ctx.fillRect(sx,sy,s,s);
    if(h<.2){ ctx.fillStyle='rgba(253,253,255,0.5)'; ctx.fillRect(sx+3*SCALE,sy+(3+(h*40)%8)*SCALE,5*SCALE,SCALE); }
  }
  else if(t===T.LAVA){
    const ph=(Math.sin(tm/300+x*2.1+y*1.7)+1)/2;
    ctx.fillStyle=`rgba(255,${90+ph*70},30,${0.55+ph*0.3})`;
    ctx.fillRect(sx,sy,s,s);
    if(h<.3){ ctx.fillStyle=`rgba(255,220,120,${0.5+ph*0.4})`;
      ctx.fillRect(sx+((h*77)%10)*SCALE, sy+((h*41)%10)*SCALE, 3*SCALE, 2*SCALE); }
  }
  else if(t===T.VROCK){ if(h<.06){ ctx.fillStyle='rgba(255,120,40,0.25)'; ctx.fillRect(sx+((h*97)%12)*SCALE, sy+((h*53)%12)*SCALE, SCALE,SCALE);} }
  else if(t===T.SWAMP){
    if(h<.2){ ctx.fillStyle='rgba(126,200,34,0.15)';
      const bp=(tm/1400+h*9)%1;
      ctx.beginPath(); ctx.arc(sx+8*SCALE, sy+8*SCALE, (1+bp*2.5)*SCALE, 0, 7); ctx.stroke(); }
  }
  else if(t===T.STONE||t===T.GATE){ ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.lineWidth=1;
    ctx.strokeRect(sx+.5,sy+.5,s-1,s-1); }
  else if(t===T.WOOD){ ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(sx, sy+Math.floor(s/2), s, 1); }
  else if(t===T.DIRT&&h<.2){ ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(sx+5*SCALE,sy+6*SCALE,2*SCALE,SCALE); }
  else if(t===T.SAND&&h<.3){ ctx.fillStyle='rgba(253,253,255,0.07)'; ctx.fillRect(sx+((h*89)%12)*SCALE,sy+((h*41)%12)*SCALE,SCALE,SCALE); }
  else if(t===T.FLOWER){
    ctx.fillStyle=['#C0FF38','#f85ce0','#ffd166'][Math.floor(h*3)];
    ctx.fillRect(sx+7*SCALE,sy+7*SCALE,2*SCALE,2*SCALE);
    ctx.fillStyle='#2e5c33'; ctx.fillRect(sx+7*SCALE,sy+9*SCALE,SCALE,2*SCALE);
  }
}

/* ---------- props ---------- */
function glowMul(){ return 1+nightF()*1.6; }
function drawTree(wx,wy,dead=false){
  const x=w2sx(wx), y=w2sy(wy);
  ctx.fillStyle='#241407'; ctx.fillRect(x-2*SCALE, y-6*SCALE, 4*SCALE, 6*SCALE);
  if (dead){
    ctx.fillStyle='#1c1208'; ctx.fillRect(x-6*SCALE,y-16*SCALE,3*SCALE,10*SCALE);
    ctx.fillRect(x+3*SCALE,y-20*SCALE,3*SCALE,14*SCALE);
    ctx.fillRect(x-2*SCALE,y-22*SCALE,4*SCALE,16*SCALE);
    return;
  }
  ctx.fillStyle='#0d2b12'; ctx.fillRect(x-8*SCALE, y-20*SCALE, 16*SCALE, 12*SCALE);
  ctx.fillStyle='#143d1a'; ctx.fillRect(x-6*SCALE, y-26*SCALE, 12*SCALE, 9*SCALE);
  ctx.fillStyle='rgba(192,255,56,0.25)'; ctx.fillRect(x-2*SCALE, y-25*SCALE, 3*SCALE, 2*SCALE);
}
function drawRock(wx,wy){
  const x=w2sx(wx), y=w2sy(wy);
  ctx.fillStyle='#2b3136'; ctx.fillRect(x-5*SCALE,y-6*SCALE,10*SCALE,6*SCALE);
  ctx.fillStyle='#3d454c'; ctx.fillRect(x-3*SCALE,y-8*SCALE,6*SCALE,3*SCALE);
}
function drawCactus(wx,wy){
  const x=w2sx(wx), y=w2sy(wy);
  ctx.fillStyle='#2e6b2a'; ctx.fillRect(x-2*SCALE,y-14*SCALE,4*SCALE,14*SCALE);
  ctx.fillRect(x-7*SCALE,y-11*SCALE,3*SCALE,2*SCALE); ctx.fillRect(x-7*SCALE,y-11*SCALE,2*SCALE,5*SCALE);
  ctx.fillRect(x+4*SCALE,y-13*SCALE,3*SCALE,2*SCALE); ctx.fillRect(x+5*SCALE,y-13*SCALE,2*SCALE,6*SCALE);
  ctx.fillStyle='#3e8a36'; ctx.fillRect(x-1*SCALE,y-14*SCALE,SCALE,12*SCALE);
}
function drawLantern(wx,wy,tm){
  const x=w2sx(wx), y=w2sy(wy);
  ctx.fillStyle='#111'; ctx.fillRect(x-SCALE, y-14*SCALE, 2*SCALE, 14*SCALE);
  const gl=(0.5+0.2*Math.sin(tm/300+wx))*glowMul();
  ctx.fillStyle='#C0FF38'; ctx.fillRect(x-3*SCALE, y-19*SCALE, 6*SCALE, 6*SCALE);
  const grd=ctx.createRadialGradient(x,y-16*SCALE,2,x,y-16*SCALE,26*SCALE);
  grd.addColorStop(0,`rgba(192,255,56,${0.16*gl})`); grd.addColorStop(1,'rgba(192,255,56,0)');
  ctx.fillStyle=grd; ctx.fillRect(x-26*SCALE,y-42*SCALE,52*SCALE,52*SCALE);
}
function drawFire(wx,wy,tm){
  const x=w2sx(wx), y=w2sy(wy);
  ctx.fillStyle='#3a2a18';
  ctx.fillRect(x-8*SCALE,y-3*SCALE,16*SCALE,3*SCALE);
  const f=Math.sin(tm/90)*2, f2=Math.cos(tm/70)*2;
  ctx.fillStyle='#ff7a2a'; ctx.beginPath();
  ctx.moveTo(x-5*SCALE,y-3*SCALE); ctx.lineTo(x+(f)*SCALE, y-(14+f2)*SCALE); ctx.lineTo(x+5*SCALE,y-3*SCALE); ctx.fill();
  ctx.fillStyle='#ffd166'; ctx.beginPath();
  ctx.moveTo(x-2*SCALE,y-3*SCALE); ctx.lineTo(x+(f2/2)*SCALE, y-(9+f)*SCALE); ctx.lineTo(x+2*SCALE,y-3*SCALE); ctx.fill();
  const gl=glowMul();
  const grd=ctx.createRadialGradient(x,y-6*SCALE,2,x,y-6*SCALE,34*SCALE);
  grd.addColorStop(0,`rgba(255,150,60,${0.18*gl})`); grd.addColorStop(1,'rgba(255,150,60,0)');
  ctx.fillStyle=grd; ctx.fillRect(x-34*SCALE,y-40*SCALE,68*SCALE,68*SCALE);
  if(Math.random()<.3) particles.push({x:wx+(Math.random()-.5)*8,y:wy-8,vx:(Math.random()-.5)*8,vy:-30-Math.random()*20,t:.8,col:Math.random()<.5?'#ffd166':'#ff7a2a',sz:2});
}
function drawSign(wx,wy,label){
  const x=w2sx(wx), y=w2sy(wy);
  ctx.fillStyle='#241407'; ctx.fillRect(x-SCALE,y-10*SCALE,2*SCALE,10*SCALE);
  ctx.fillStyle='#3a2a14'; ctx.fillRect(x-14*SCALE,y-17*SCALE,28*SCALE,8*SCALE);
  ctx.strokeStyle='#C0FF38'; ctx.lineWidth=1; ctx.strokeRect(x-14*SCALE+.5,y-17*SCALE+.5,28*SCALE-1,8*SCALE-1);
  ctx.fillStyle='#C0FF38'; ctx.font=`bold ${Math.round(4.2*SCALE)}px monospace`; ctx.textAlign='center';
  ctx.fillText(label, x, y-11.5*SCALE);
}
function drawStatue(wx,wy,tm){
  const x=w2sx(wx), y=w2sy(wy);
  ctx.fillStyle='#2b3136'; ctx.fillRect(x-14*SCALE,y-6*SCALE,28*SCALE,6*SCALE);
  ctx.fillStyle='#3d454c'; ctx.fillRect(x-11*SCALE,y-9*SCALE,22*SCALE,3*SCALE);
  const gl=(0.75+0.25*Math.sin(tm/500))*Math.min(1.4,glowMul());
  ctx.save(); ctx.translate(x, y-24*SCALE); ctx.transform(1,0,-0.15,1,0,0);
  ctx.fillStyle=`rgba(192,255,56,${Math.min(1,gl)})`;
  ctx.fillRect(-9*SCALE,-6*SCALE,18*SCALE,4*SCALE);
  ctx.fillRect(-11*SCALE,0,14*SCALE,4*SCALE);
  ctx.fillRect(2*SCALE,0,8*SCALE,10*SCALE);
  ctx.fillRect(-13*SCALE,6*SCALE,8*SCALE,4*SCALE);
  ctx.restore();
  const grd=ctx.createRadialGradient(x,y-20*SCALE,4,x,y-20*SCALE,40*SCALE);
  grd.addColorStop(0,`rgba(192,255,56,${0.1*gl})`); grd.addColorStop(1,'rgba(192,255,56,0)');
  ctx.fillStyle=grd; ctx.fillRect(x-40*SCALE,y-60*SCALE,80*SCALE,80*SCALE);
}
function drawBench(wx,wy){
  const x=w2sx(wx), y=w2sy(wy);
  ctx.fillStyle='#241407'; ctx.fillRect(x-7*SCALE,y-3*SCALE,2*SCALE,3*SCALE); ctx.fillRect(x+5*SCALE,y-3*SCALE,2*SCALE,3*SCALE);
  ctx.fillStyle='#3a2a14'; ctx.fillRect(x-8*SCALE,y-6*SCALE,16*SCALE,3*SCALE);
}
function drawCrystal(wx,wy,tm){
  const x=w2sx(wx), y=w2sy(wy);
  const gl=(0.6+0.4*Math.sin(tm/400+wx*.1))*glowMul();
  ctx.fillStyle=`rgba(56,232,248,${Math.min(1,gl)})`;
  ctx.beginPath(); ctx.moveTo(x,y-14*SCALE); ctx.lineTo(x+5*SCALE,y-5*SCALE); ctx.lineTo(x,y); ctx.lineTo(x-5*SCALE,y-5*SCALE); ctx.fill();
  const grd=ctx.createRadialGradient(x,y-7*SCALE,2,x,y-7*SCALE,22*SCALE);
  grd.addColorStop(0,`rgba(56,232,248,${0.14*gl})`); grd.addColorStop(1,'rgba(56,232,248,0)');
  ctx.fillStyle=grd; ctx.fillRect(x-22*SCALE,y-30*SCALE,44*SCALE,44*SCALE);
}
function drawDummy(wx,wy){
  const x=w2sx(wx), y=w2sy(wy);
  ctx.fillStyle='#241407'; ctx.fillRect(x-SCALE,y-10*SCALE,2*SCALE,10*SCALE);
  ctx.fillStyle='#5a4210'; ctx.fillRect(x-5*SCALE,y-15*SCALE,10*SCALE,7*SCALE);
  ctx.fillStyle='#8a6a1f'; ctx.fillRect(x-3*SCALE,y-13*SCALE,6*SCALE,3*SCALE);
}
function drawGate(wx,wy,tm,discovered){
  const x=w2sx(wx), y=w2sy(wy);
  const rot=tm/900, gl=(discovered?0.9:0.35)*glowMul();
  ctx.strokeStyle=`rgba(192,255,56,${Math.min(1,gl)})`; ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(x, y-2, 9*SCALE, 4*SCALE, 0, 0, 7); ctx.stroke();
  for(let i=0;i<4;i++){
    const a=rot+i*Math.PI/2;
    ctx.fillStyle=`rgba(192,255,56,${Math.min(1,gl)})`;
    ctx.fillRect(x+Math.cos(a)*8*SCALE-1.5, y-2+Math.sin(a)*3.6*SCALE-1.5, 3, 3);
  }
  if (discovered){
    const grd=ctx.createLinearGradient(0,y-30*SCALE,0,y);
    grd.addColorStop(0,'rgba(192,255,56,0)');
    grd.addColorStop(1,`rgba(192,255,56,${0.12*glowMul()})`);
    ctx.fillStyle=grd; ctx.fillRect(x-7*SCALE, y-30*SCALE, 14*SCALE, 30*SCALE);
  }
}

/* ---------- naga (pemain / NPC / remote) — animasi prosedural ---------- */
function drawDragon(p, tm, isMe=false){
  const a = p.anim || (p.anim={ lastTm:tm, px:p.x, py:p.y, vx:0, vy:0, phase:0,
    face:p.dir||1, sq:1, sqV:0, sitE:0, wasMove:false,
    blinkAt:tm+1500+Math.random()*3000, blinking:false, blinkEnd:0 });
  let adt = clamp((tm-a.lastTm)/1000, 0.001, 0.06); a.lastTm=tm;
  const evx=clamp((p.x-a.px)/adt,-520,520), evy=clamp((p.y-a.py)/adt,-520,520);
  a.px=p.x; a.py=p.y;
  const kk=Math.min(1,adt*14);
  a.vx+=(evx-a.vx)*kk; a.vy+=(evy-a.vy)*kk;
  const spd=Math.hypot(a.vx,a.vy), run=clamp(spd/96,0,1.3), moving=spd>13;
  if (moving && !a.wasMove) a.sqV += 2.2;
  if (!moving && a.wasMove && run>0.25){ a.sqV -= 3.0; dustAt(p.x,p.y,3); }
  a.wasMove=moving;
  const pPh=a.phase; a.phase += spd*adt*0.085;
  const cyc=Math.sin(a.phase*Math.PI*2);
  const hop=Math.abs(cyc)*3.6*clamp(run+0.1,0,1);
  if (moving && Math.floor(a.phase*2)!==Math.floor(pPh*2)){
    a.sqV -= 1.5*run;
    dustAt(p.x,p.y, run>0.75?2:1);
    if (isMe) SFX.step(Math.floor(a.phase*2)%2);
  }
  a.face += ((p.dir||1)-a.face)*Math.min(1,adt*13);
  a.sqV += (1-a.sq)*150*adt;
  a.sqV *= Math.exp(-11*adt);
  a.sq  = clamp(a.sq + a.sqV*adt, 0.72, 1.25);
  const breath = moving ? 1 : 1+Math.sin(tm/1250*2.2)*0.015;
  if (!a.blinking && tm>a.blinkAt){ a.blinking=true; a.blinkEnd=tm+140; }
  if (a.blinking && tm>a.blinkEnd){ a.blinking=false; a.blinkAt=tm+1600+Math.random()*4200; }
  a.sitE += ((p.sit?1:0)-a.sitE)*Math.min(1,adt*8);
  const lean = clamp(a.vx*0.0015,-0.13,0.13)
             + (moving ? cyc*0.028*run : Math.sin(tm/1500)*0.006);

  const blink = a.blinking && OPTS.acc[p.skin.acc]!=='Kacamata';
  const cvs = blink ? (p._cvB||(p._cvB=skinCanvas(p.skin,true)))
                    : (p._cv ||(p._cv =skinCanvas(p.skin)));
  const PS=2*(SCALE/3), w=24*PS, h=cvs.height*PS;
  const fxp=w2sx(p.x), fyp=w2sy(p.y);
  const shs=1-hop*0.05;
  ctx.fillStyle=`rgba(0,0,0,${0.34*shs+0.06})`;
  ctx.beginPath(); ctx.ellipse(fxp, fyp+2, w*0.36*(1.9-shs), 3.2*PS*shs, 0,0,7); ctx.fill();
  if (isMe && now()<me.shieldUntil){
    ctx.strokeStyle=`rgba(56,189,248,${0.4+0.15*Math.sin(tm/90)})`; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(fxp, fyp-h/2, w*0.72, 0, 7); ctx.stroke();
  }
  const faceS = a.face>=0 ? Math.max(0.1,a.face) : Math.min(-0.1,a.face);
  const sy2 = a.sq*breath*(1-0.06*a.sitE);
  const sx2 = (1+(1-a.sq)*0.85)*(2-breath);
  ctx.save();
  ctx.translate(fxp, fyp + 3*PS*a.sitE);
  ctx.rotate(lean*0.7);
  ctx.scale(faceS*sx2, sy2);
  ctx.drawImage(cvs, -w/2, -h-hop*PS, w, h);
  if (isMe && me.hurtT>0){
    ctx.globalAlpha=clamp(me.hurtT*3,0,0.65);
    ctx.drawImage(p._cvR||(p._cvR=tintCanvas(cvs,'#ff5470')), -w/2, -h-hop*PS, w, h);
    ctx.globalAlpha=1;
  }
  ctx.restore();
  ctx.font=`bold ${Math.round(3.4*SCALE)}px monospace`; ctx.textAlign='center';
  const ny = fyp - h - 6;
  ctx.fillStyle='rgba(0,2,4,0.6)';
  const nw = ctx.measureText(p.nick).width;
  ctx.fillRect(fxp-nw/2-4, ny-3.4*SCALE, nw+8, 3.4*SCALE+4);
  ctx.fillStyle = isMe ? '#C0FF38' : (p.npc?'#8fd426':'#FDFDFF');
  ctx.fillText((p.lv?('Lv'+p.lv+' '):'')+p.nick, fxp, ny);
  if (p.bubble && now()<p.bubble.until){
    if (!p.bubble.start) p.bubble.start=tm;
    const pop=easeOutBack(clamp((tm-p.bubble.start)/170,0.01,1));
    const bcx=fxp, bcy=ny-4.2*SCALE;
    ctx.save();
    ctx.translate(bcx,bcy); ctx.scale(pop,pop); ctx.translate(-bcx,-bcy);
    ctx.font=`${Math.round(3.6*SCALE)}px monospace`;
    const txt=p.bubble.txt, tw=Math.min(ctx.measureText(txt).width, 60*SCALE);
    ctx.fillStyle='rgba(253,253,255,0.94)';
    const pad=2.4*SCALE;
    roundRect(bcx-tw/2-pad, bcy-5.4*SCALE, tw+pad*2, 6.4*SCALE, 4); ctx.fill();
    ctx.fillStyle='#000204'; ctx.fillText(txt, bcx, bcy-1.2*SCALE, 60*SCALE);
    ctx.restore();
  } else if (p.bubble && now()>=p.bubble.until) p.bubble=null;
}
function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function drawMob(m,tm){
  if (m.dead>0) return;
  m.sq = m.sq===undefined ? 1 : m.sq+(1-m.sq)*0.16;
  const PS=2*(SCALE/3)*(m.ps||1);
  const w=m.cv.width*PS, h=m.cv.height*PS;
  let alpha=1, sq=m.sq, bob=Math.sin(tm/140+m.t*7)*2;
  if (m.dying>0){ const pr=m.dying/0.38; alpha=pr; sq=Math.min(sq,0.25+0.75*pr); bob=0; }
  const w2=w*(1+(1-sq)*0.8), h2=h*sq;
  const sx=w2sx(m.x)-w2/2, sy=w2sy(m.y)-h2+bob;
  ctx.fillStyle=`rgba(0,0,0,${0.4*alpha})`;
  ctx.beginPath(); ctx.ellipse(w2sx(m.x), w2sy(m.y)+2, w2*0.4, 4, 0,0,7); ctx.fill();
  ctx.globalAlpha = alpha*(m.ghost?0.85:1);
  ctx.drawImage(m.cv, Math.round(sx), Math.round(sy), Math.round(w2), Math.round(h2));
  if (m.flash>0){
    ctx.globalAlpha=Math.min(1,m.flash)*alpha;
    ctx.drawImage(m._fl||(m._fl=tintCanvas(m.cv,'#ffffff')), Math.round(sx), Math.round(sy), Math.round(w2), Math.round(h2));
    m.flash-=0.12;
  }
  ctx.globalAlpha=1;
  if (m.hp<m.maxHp && !(m.dying>0)){
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx, sy-6, w2, 4);
    ctx.fillStyle=m.boss?'#ffd166':'#ff5470'; ctx.fillRect(sx+1, sy-5, (w2-2)*Math.max(0,m.hp/m.maxHp), 2);
  }
  if (m.boss){
    ctx.font=`bold ${Math.round(3*SCALE)}px monospace`; ctx.textAlign='center';
    ctx.fillStyle='#ffd166'; ctx.fillText('★ CONGESTION KRAKEN Lv.'+m.lv, w2sx(m.x), sy-10);
  }
}

/* ---------- loop utama ---------- */
let lastT = 0;
function loop(tm){
  requestAnimationFrame(loop);
  if (!$('gameScreen').classList.contains('active')) return;
  const dt = Math.min(0.05, (tm-lastT)/1000||0.016); lastT=tm;
  update(dt, tm);
  render(tm);
}
requestAnimationFrame(loop);

function render(tm){
  ctx.fillStyle='#050a05'; ctx.fillRect(0,0,cvW.width,cvW.height);
  ctx.save();
  if (shake>0){ shake*=0.87; if(shake<.4)shake=0;
    ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake); }
  const x0=Math.floor(camX/TILE)-1, y0=Math.floor(camY/TILE)-1;
  const x1=Math.ceil((camX+VW2)/TILE)+1, y1=Math.ceil((camY+VH2)/TILE)+2;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++) drawTile(x,y,mget(x,y),tm);
  const draws=[];
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const t=mget(x,y), wx=x*TILE+8, wy=y*TILE+16;
    if(t===T.TREE) draws.push({y:wy,f:()=>drawTree(wx,wy)});
    else if(t===T.DTREE) draws.push({y:wy,f:()=>drawTree(wx,wy,true)});
    else if(t===T.ROCK) draws.push({y:wy,f:()=>drawRock(wx,wy)});
    else if(t===T.CACTUS) draws.push({y:wy,f:()=>drawCactus(wx,wy)});
    else if(t===T.LANTERN) draws.push({y:wy,f:()=>drawLantern(wx,wy,tm)});
    else if(t===T.FIRE&&mget(x-1,y)!==T.FIRE) draws.push({y:wy,f:()=>drawFire(wx+8,wy,tm)});
    else if(t===T.SIGN) draws.push({y:wy,f:()=>drawSign(wx,wy, x<120?'TRAINING':'CHILL ZONE')});
    else if(t===T.STATUE&&mget(x-1,y)!==T.STATUE&&mget(x,y-1)!==T.STATUE) draws.push({y:wy+16,f:()=>drawStatue(wx+8,wy+16,tm)});
    else if(t===T.BENCH) draws.push({y:wy,f:()=>drawBench(wx,wy)});
    else if(t===T.CRYSTAL) draws.push({y:wy,f:()=>drawCrystal(wx,wy,tm)});
    else if(t===T.DUMMY) draws.push({y:wy,f:()=>drawDummy(wx,wy)});
    else if(t===T.GATE){
      const g=GATES.find(g=>g.x===x&&g.y===y);
      draws.push({y:wy-8,f:()=>drawGate(wx,wy,tm, g&&me.wps[g.id])});
    }
  }
  for(const m of mobs) if(m.dead<=0) draws.push({y:m.y,f:()=>drawMob(m,tm)});
  for(const n of npcs) draws.push({y:n.y,f:()=>drawDragon(n,tm)});
  for(const [,o] of others) draws.push({y:o.y,f:()=>drawDragon(o,tm)});
  if(!me.dead) draws.push({y:me.y,f:()=>drawDragon(me,tm,true)});
  draws.sort((a,b)=>a.y-b.y).forEach(d=>d.f());
  for(const p of projectiles){
    ctx.fillStyle='#38e8f8';
    ctx.fillRect(w2sx(p.x)-3,w2sy(p.y)-3,6,6);
    ctx.fillStyle='rgba(56,232,248,0.4)';
    ctx.fillRect(w2sx(p.x-p.vx*0.02)-2,w2sy(p.y-p.vy*0.02)-2,4,4);
  }
  for(const f of fxs){
    const pr=1-f.t/f.dur;
    if(f.type==='ring'||f.type==='roar'){
      ctx.strokeStyle=f.col; ctx.lineWidth=3*(1-pr)+1; ctx.globalAlpha=1-pr;
      ctx.beginPath(); ctx.arc(w2sx(f.x),w2sy(f.y),f.r*pr*SCALE,0,7); ctx.stroke(); ctx.globalAlpha=1;
    } else if(f.type==='slash'){
      ctx.strokeStyle=f.col; ctx.lineWidth=4; ctx.globalAlpha=1-pr;
      ctx.beginPath(); ctx.arc(w2sx(f.x),w2sy(f.y)-16, 22*SCALE/3*2, f.dirr-0.9+pr*.5, f.dirr+0.9+pr*.5); ctx.stroke();
      ctx.globalAlpha=1;
    } else if(f.type==='heal'){
      ctx.strokeStyle='#C0FF38'; ctx.globalAlpha=1-pr; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(w2sx(f.x),w2sy(f.y)-20-pr*22,8+pr*6,0,7); ctx.stroke(); ctx.globalAlpha=1;
    }
  }
  for(const p of particles){ ctx.globalAlpha=clamp(p.t*2,0,1); ctx.fillStyle=p.col; ctx.fillRect(w2sx(p.x),w2sy(p.y),p.sz*SCALE/1.5,p.sz*SCALE/1.5); ctx.globalAlpha=1; }
  ctx.font=`bold ${Math.round(4.4*SCALE)}px monospace`; ctx.textAlign='center';
  for(const f of floats){ ctx.globalAlpha=clamp(f.t*1.6,0,1);
    ctx.fillStyle='#000'; ctx.fillText(f.txt,w2sx(f.x)+1,w2sy(f.y)+1);
    ctx.fillStyle=f.col; ctx.fillText(f.txt,w2sx(f.x),w2sy(f.y)); ctx.globalAlpha=1; }
  ctx.restore();
  // siklus siang-malam
  const nf=nightF();
  if (nf>0.01){ ctx.fillStyle=`rgba(6,10,34,${nf})`; ctx.fillRect(0,0,cvW.width,cvW.height); }
  if (flashA>0){ ctx.globalAlpha=flashA; ctx.fillStyle=flashCol; ctx.fillRect(0,0,cvW.width,cvW.height); ctx.globalAlpha=1; flashA-=0.04; }
  renderMinimap();
}

/* ---------- minimap ---------- */
const mmBase = document.createElement('canvas'); mmBase.width=MW; mmBase.height=MH;
(function(){
  const g=mmBase.getContext('2d');
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const t=map[y*MW+x];
    g.fillStyle = t===T.WATER?'#0a2b3d': t===T.TREE?'#0d2b12': t===T.STONE||t===T.GATE?'#3a4148':
      t===T.WOOD?'#2c2013': t===T.DIRT?'#241d10': t===T.SAND?'#3a3420':
      t===T.SNOW||t===T.ICE?'#9db8c8': t===T.LAVA?'#c8501e': t===T.VROCK?'#1a1416':
      t===T.SWAMP||t===T.DTREE?'#1e2a12': '#12240f';
    g.fillRect(x,y,1,1);
  }
})();
const mm=$('minimap'), mmc=mm.getContext('2d');
function renderMinimap(){
  mmc.imageSmoothingEnabled=false;
  mmc.drawImage(mmBase,0,0,120,80);
  mmc.fillStyle='#8fd426';
  for(const [,o] of others) mmc.fillRect(o.x/TILE/2-1,o.y/TILE/2-1,2,2);
  mmc.fillStyle='#FDFDFF';
  for(const n of npcs) mmc.fillRect(n.x/TILE/2-0.5,n.y/TILE/2-0.5,1,1);
  mmc.fillStyle='#C0FF38';
  mmc.fillRect(me.x/TILE/2-1.5, me.y/TILE/2-1.5, 3,3);
}
