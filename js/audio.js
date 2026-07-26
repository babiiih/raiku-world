/* ============================================================
   RAIKU WORLD — audio.js : WebAudio SFX retro
   ============================================================ */
let audioCtx=null, muted=false;
function ac(){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function tone(freq,dur,type='square',vol=.06,slide=0){
  if(muted) return;
  try{
    const c=ac(),o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,c.currentTime);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),c.currentTime+dur);
    g.gain.setValueAtTime(vol,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);
    o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+dur);
  }catch(e){}
}
const SFX={
  hit:()=>tone(180,.1,'square',.07,-110),
  slash:()=>tone(420,.07,'square',.05,-200),
  bolt:()=>tone(600,.12,'sawtooth',.05,300),
  nova:()=>{tone(220,.25,'sawtooth',.07,300);},
  roar:()=>{tone(80,.5,'sawtooth',.1,40);setTimeout(()=>tone(60,.5,'square',.08,30),120);},
  shield:()=>tone(300,.22,'sine',.07,200),
  heal:()=>{tone(520,.1,'sine',.07);setTimeout(()=>tone(700,.12,'sine',.07),100);},
  dash:()=>tone(200,.15,'square',.06,500),
  lvup:()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.13,'square',.07),i*95)),
  hurt:()=>tone(140,.16,'sawtooth',.07,-90),
  die:()=>[330,247,165].forEach((f,i)=>setTimeout(()=>tone(f,.2,'sawtooth',.06),i*140)),
  msg:()=>tone(880,.05,'sine',.04),
  click:()=>tone(700,.04,'square',.04),
  emote:()=>tone(660,.08,'sine',.05,120),
  step:(i)=>tone(i?152:128,.035,'triangle',.028,-40),
  skid:()=>tone(100,.14,'sawtooth',.035,-55),
  gate:()=>[392,523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.12,'sine',.06),i*80)),
  tp:()=>tone(900,.3,'sine',.06,-600),
  sizzle:()=>tone(90,.2,'sawtooth',.05,-30),
};
document.addEventListener('pointerdown',()=>{ try{ac().resume();}catch(e){} },{once:true});
