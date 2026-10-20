/* Original Brick Breaker implementation for Anirudh Unblocked. */
(() => {
  'use strict';
  const W=720,H=480,R=7,PW=106,PH=12,PY=443,KEY='anirudh-brick-breaker-v1.run',BEST='anirudh-brick-breaker-v1.best';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const bricks=level=>Array.from({length:48},(_,i)=>({x:32+(i%8)*84,y:57+Math.floor(i/8)*30,w:76,h:20,alive:true,color:(Math.floor(i/8)+level-1)%3}));
  function resetBall(s){s.ball={x:s.paddle+PW/2,y:PY-R-2,vx:160+15*s.level,vy:-(270+20*s.level)};}
  function fresh(){const s={version:1,mode:'ready',level:1,score:0,lives:3,paddle:(W-PW)/2,ball:null,bricks:bricks(1)};resetBall(s);return s;}
  function restore(raw){
    try{
      const s=typeof raw==='string'?JSON.parse(raw):JSON.parse(JSON.stringify(raw));
      if(!s||s.version!==1||!['ready','running','paused','won','over'].includes(s.mode)||!Number.isInteger(s.level)||s.level<1||s.level>3||!Number.isInteger(s.score)||s.score<0||!Number.isInteger(s.lives)||s.lives<0||s.lives>3||!Number.isFinite(s.paddle)||s.paddle<0||s.paddle>W-PW||!s.ball||!['x','y','vx','vy'].every(k=>Number.isFinite(s.ball[k]))||Math.abs(s.ball.vx)>1200||Math.abs(s.ball.vy)>1200||s.ball.x< -20||s.ball.x>W+20||s.ball.y< -20||s.ball.y>H+30||!Array.isArray(s.bricks)||s.bricks.length!==48)return null;
      const layout=bricks(s.level);
      if(!s.bricks.every((b,i)=>b&&typeof b.alive==='boolean'&&b.x===layout[i].x&&b.y===layout[i].y&&b.w===layout[i].w&&b.h===layout[i].h))return null;
      // A restored run always waits for an explicit resume.
      if(s.mode==='running')s.mode='paused';
      return s;
    }catch{return null;}
  }
  function start(s){if(['over','won'].includes(s.mode))return fresh();if(s.mode==='ready'||s.mode==='paused')s.mode='running';else if(s.mode==='running')s.mode='paused';return s;}
  function step(s,dt,input={}){
    if(s.mode!=='running')return '';
    dt=clamp(dt,0,1/120);
    const oldPaddle=s.paddle;
    if(Number.isFinite(input.target))s.paddle=clamp(input.target-PW/2,0,W-PW);
    else s.paddle=clamp(s.paddle+((input.right?1:0)-(input.left?1:0))*450*dt,0,W-PW);
    const ball=s.ball,px=ball.x,py=ball.y;
    ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
    if(ball.x<R){ball.x=R;ball.vx=Math.abs(ball.vx);}
    if(ball.x>W-R){ball.x=W-R;ball.vx=-Math.abs(ball.vx);}
    if(ball.y<R){ball.y=R;ball.vy=Math.abs(ball.vy);}
    if(ball.vy>0&&py+R<=PY+5&&ball.y+R>=PY&&ball.x+R>=s.paddle&&ball.x-R<=s.paddle+PW){
      const hit=clamp((ball.x-(s.paddle+PW/2))/(PW/2),-1,1),speed=Math.min(510,330+s.level*25+Math.floor(s.score/50)*4);
      const angle=hit*1.08;
      ball.vx=Math.sin(angle)*speed+(s.paddle-oldPaddle)*7;
      ball.vx=clamp(ball.vx,-speed*.94,speed*.94);
      ball.vy=-Math.sqrt(Math.max(90*90,speed*speed-ball.vx*ball.vx));ball.y=PY-R-.1;
    }
    for(const b of s.bricks){
      if(!b.alive)continue;
      const nx=clamp(ball.x,b.x,b.x+b.w),ny=clamp(ball.y,b.y,b.y+b.h);
      if((ball.x-nx)**2+(ball.y-ny)**2>R*R)continue;
      b.alive=false;s.score+=10;
      if(py+R<=b.y+.1){ball.y=b.y-R-.1;ball.vy=-Math.abs(ball.vy);}
      else if(py-R>=b.y+b.h-.1){ball.y=b.y+b.h+R+.1;ball.vy=Math.abs(ball.vy);}
      else if(px+R<=b.x+.1){ball.x=b.x-R-.1;ball.vx=-Math.abs(ball.vx);}
      else if(px-R>=b.x+b.w-.1){ball.x=b.x+b.w+R+.1;ball.vx=Math.abs(ball.vx);}
      else{
        const dl=Math.abs(ball.x-b.x),dr=Math.abs(ball.x-b.x-b.w),du=Math.abs(ball.y-b.y),dd=Math.abs(ball.y-b.y-b.h),m=Math.min(dl,dr,du,dd);
        if(m===dl){ball.x=b.x-R-.1;ball.vx=-Math.abs(ball.vx);}else if(m===dr){ball.x=b.x+b.w+R+.1;ball.vx=Math.abs(ball.vx);}else if(m===du){ball.y=b.y-R-.1;ball.vy=-Math.abs(ball.vy);}else{ball.y=b.y+b.h+R+.1;ball.vy=Math.abs(ball.vy);}
      }
      if(s.bricks.every(b=>!b.alive)){
        if(s.level===3){s.mode='won';return 'won';}
        s.level++;s.bricks=bricks(s.level);s.mode='ready';resetBall(s);return 'level';
      }
      return 'brick';
    }
    if(ball.y-R>H){
      s.lives--;
      if(!s.lives){s.mode='over';return 'over';}
      s.mode='ready';resetBall(s);return 'life';
    }
    return '';
  }
  const Core={fresh,restore,start,step,bricks,W,H,R,PW,PY,KEY,BEST};
  if(typeof document==='undefined'){globalThis.BrickBreakerCore=Core;return;}
  const $=id=>document.getElementById(id),canvas=$('board'),ctx=canvas.getContext('2d');
  if(!ctx){$('status').textContent='Canvas is unavailable in this browser.';return;}
  let s=fresh(),best=0,storageOK=true,keys={left:false,right:false},target=null,last=0,acc=0,saveAge=0;
  try{const n=Number(localStorage.getItem(BEST));best=Number.isFinite(n)?Math.max(0,n):0;const r=restore(localStorage.getItem(KEY));if(r)s=r;localStorage.setItem('anirudh-brick-breaker-v1.check','1');localStorage.removeItem('anirudh-brick-breaker-v1.check');}catch{storageOK=false;}
  function save(){
    best=Math.max(best,s.score);
    if(storageOK)try{localStorage.setItem(KEY,JSON.stringify(s));localStorage.setItem(BEST,String(best));}catch{storageOK=false;}
    $('save-note').textContent=storageOK?'Your exact run and best score save in this browser.':'Browser storage is unavailable. This run will not be saved.';
  }
  function ui(){
    $('score').textContent=s.score;$('best').textContent=Math.max(best,s.score);
    const over=s.mode==='over',won=s.mode==='won',paused=s.mode==='paused',ready=s.mode==='ready';
    $('overlay').hidden=s.mode==='running';
    $('overlay-title').textContent=won?'All clear!':over?'One more round?':paused?'Take a breath.':s.level>1?`Level ${s.level}`:s.lives<3?'Keep it going.':'Ready to play?';
    $('overlay-copy').textContent=won?`Three levels cleared. Final score: ${s.score}.`:over?`Final score: ${s.score}. Your best is saved.`:paused?'Your ball, bricks, and lives are saved. Resume when you’re ready.':`Clear every brick. Level ${s.level} of 3 · ${s.lives} ${s.lives===1?'life':'lives'} remaining.`;
    const label=over||won?'Play again':paused?'Resume game':ready?'Launch ball':'Pause game';
    $('toggle').textContent=label;$('overlay-start').textContent=label;
    $('status').textContent=`Level ${s.level} / 3 · ${s.lives} ${s.lives===1?'life':'lives'} · ${s.bricks.filter(b=>b.alive).length} bricks left. Move with arrows / A and D, or drag the paddle.`;
  }
  function draw(){
    ctx.fillStyle='#101719';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#202d2a';ctx.lineWidth=1;
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    const colors=['#d4ff58','#a692ff','#728b67'];
    for(const b of s.bricks)if(b.alive){ctx.fillStyle=colors[b.color];ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle='#ffffff24';ctx.fillRect(b.x,b.y,b.w,3);}
    ctx.fillStyle='#d4ff58';ctx.shadowColor='#d4ff58';ctx.shadowBlur=13;ctx.fillRect(s.paddle,PY,PW,PH);ctx.shadowBlur=0;
    ctx.fillStyle='#f5f6ef';ctx.beginPath();ctx.arc(s.ball.x,s.ball.y,R,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c1cec2';ctx.font='11px system-ui';ctx.textAlign='left';ctx.fillText(`LEVEL ${s.level}`,32,29);ctx.textAlign='right';ctx.fillText(`${'● '.repeat(s.lives).trim()}  LIVES`,W-32,29);
  }
  function activate(){if(s.mode==='won'||s.mode==='over')s=fresh();s=start(s);keys={left:false,right:false};target=null;last=0;acc=0;save();ui();draw();canvas.focus({preventScroll:true});}
  function pause(){keys={left:false,right:false};target=null;if(s.mode==='running'){s.mode='paused';save();ui();draw();}else save();last=0;acc=0;}
  $('toggle').addEventListener('click',activate);$('overlay-start').addEventListener('click',activate);
  $('restart').addEventListener('click',()=>{s=fresh();keys={left:false,right:false};target=null;save();ui();draw();});
  document.addEventListener('keydown',e=>{
    if(e.target instanceof HTMLElement&&e.target.closest('button,a,input,select,textarea'))return;
    const k=e.key.toLowerCase();
    if(['arrowleft','arrowright','a','d',' ','p'].includes(k))e.preventDefault();
    if(k==='arrowleft'||k==='a'){keys.left=true;target=null;}if(k==='arrowright'||k==='d'){keys.right=true;target=null;}
    if((k===' '||k==='p')&&!e.repeat)activate();
  });
  document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.left=false;if(k==='arrowright'||k==='d')keys.right=false;});
  function point(e){const r=canvas.getBoundingClientRect();target=clamp((e.clientX-r.left)*W/r.width,0,W);}
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);point(e);canvas.focus({preventScroll:true});});
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons)point(e);});
  canvas.addEventListener('pointerup',e=>{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});
  document.querySelectorAll('[data-hold]').forEach(b=>{const dir=b.dataset.hold;const clear=()=>{keys[dir]=false;};b.addEventListener('pointerdown',e=>{e.preventDefault();target=null;keys[dir]=true;b.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});});b.addEventListener('pointerup',clear);b.addEventListener('pointercancel',clear);b.addEventListener('lostpointercapture',clear);});
  window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',save);window.addEventListener('beforeunload',save);
  function frame(t){
    const elapsed=last?Math.min(.05,(t-last)/1000):0;last=t;
    if(s.mode==='running'){
      acc+=elapsed;saveAge+=elapsed;
      while(acc>=1/120&&s.mode==='running'){const event=step(s,1/120,{...keys,target});acc-=1/120;if(event){save();ui();}}
      if(saveAge>=.75){saveAge=0;save();}
    }else acc=0;
    draw();requestAnimationFrame(frame);
  }
  save();ui();draw();requestAnimationFrame(frame);
})();
