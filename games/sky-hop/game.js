/* Sky Hop: original canvas game and artwork for Anirudh Unblocked. */
(() => {
'use strict';
const WIDTH=480,HEIGHT=600,PLAYER_X=118,RADIUS=14,GAP=176,OBSTACLE_WIDTH=62,SPACING=228,GRAVITY=920,HOP=-330;
const SAVE_KEY='anirudh-sky-hop-v1.save',BEST_KEY='anirudh-sky-hop-v1.best';
function random(state){state.rng=(Math.imul(state.rng,1664525)+1013904223)>>>0;return state.rng/4294967296;}
function addObstacle(state,x){const previous=state.obstacles.length?state.obstacles[state.obstacles.length-1].gap:300;const gap=Math.max(148,Math.min(452,previous+(random(state)-0.5)*170));state.obstacles.push({x,gap,passed:false});}
function newState(seed=1){const state={version:1,status:'ready',y:300,vy:0,score:0,elapsed:0,rng:seed>>>0,obstacles:[]};addObstacle(state,570);addObstacle(state,570+SPACING);return state;}
function restore(raw){
 if(!raw||raw.version!==1||!['ready','playing','paused','over'].includes(raw.status)||!Number.isFinite(raw.y)||raw.y< -100||raw.y>HEIGHT+100||!Number.isFinite(raw.vy)||Math.abs(raw.vy)>4000||!Number.isInteger(raw.score)||raw.score<0||!Number.isFinite(raw.elapsed)||raw.elapsed<0||!Number.isInteger(raw.rng)||raw.rng<0||raw.rng>4294967295||!Array.isArray(raw.obstacles)||raw.obstacles.length<1||raw.obstacles.length>8)return null;
 if(raw.obstacles.some(o=>!o||!Number.isFinite(o.x)||o.x< -OBSTACLE_WIDTH-20||o.x>WIDTH+SPACING*4||!Number.isFinite(o.gap)||o.gap<148||o.gap>452||typeof o.passed!=='boolean'))return null;
 for(let i=1;i<raw.obstacles.length;i++)if(raw.obstacles[i].x<=raw.obstacles[i-1].x)return null;
 return{...raw,status:raw.status==='playing'?'paused':raw.status,obstacles:raw.obstacles.map(o=>({...o}))};
}
function hop(state){if(state.status==='ready')state.status='playing';if(state.status!=='playing')return false;state.vy=HOP;return true;}
function circleHitsRect(cx,cy,r,x,y,w,h){const nearestX=Math.max(x,Math.min(cx,x+w)),nearestY=Math.max(y,Math.min(cy,y+h));return(cx-nearestX)**2+(cy-nearestY)**2<r*r;}
function step(state,dt){
 if(state.status!=='playing'||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,0.05);state.elapsed+=dt;state.vy+=GRAVITY*dt;state.y+=state.vy*dt;const speed=176+Math.min(state.score,30)*1.5;state.obstacles.forEach(o=>o.x-=speed*dt);
 if(state.y-RADIUS<=0||state.y+RADIUS>=HEIGHT){state.status='over';return;}
 for(const o of state.obstacles){const top=o.gap-GAP/2,bottom=o.gap+GAP/2;if(circleHitsRect(PLAYER_X,state.y,RADIUS,o.x,0,OBSTACLE_WIDTH,top)||circleHitsRect(PLAYER_X,state.y,RADIUS,o.x,bottom,OBSTACLE_WIDTH,HEIGHT-bottom)){state.status='over';return;}}
 for(const o of state.obstacles)if(!o.passed&&o.x+OBSTACLE_WIDTH<PLAYER_X-RADIUS){o.passed=true;state.score++;}
 state.obstacles=state.obstacles.filter(o=>o.x+OBSTACLE_WIDTH>=-10);if(!state.obstacles.length)addObstacle(state,WIDTH+30);while(state.obstacles[state.obstacles.length-1].x<WIDTH+SPACING)addObstacle(state,state.obstacles[state.obstacles.length-1].x+SPACING);
}
const Core={WIDTH,HEIGHT,PLAYER_X,RADIUS,GAP,OBSTACLE_WIDTH,SPACING,GRAVITY,HOP,SAVE_KEY,BEST_KEY,newState,restore,hop,step,circleHitsRect};if(typeof module!=='undefined'&&module.exports)module.exports=Core;if(typeof document==='undefined')return;
const $=s=>document.querySelector(s),canvas=$('#board'),ctx=canvas.getContext('2d');let state=null,best=0,previous=0,lastSaved=0;
function storageNotice(){$('#save-note').textContent='Saving is unavailable. Keep this tab open to retain this run.';$('#save-note').classList.add('save-warning');}
try{const b=Number(localStorage.getItem(BEST_KEY));if(Number.isInteger(b)&&b>=0)best=b;state=restore(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'));}catch(_){storageNotice();}
const restored=!!state;state=state||newState(Math.floor(Math.random()*4294967296));
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(_){storageNotice();}}
function record(){if(state.score>best){best=state.score;try{localStorage.setItem(BEST_KEY,String(best));}catch(_){storageNotice();}}}
function message(text){$('#status').textContent=text;}
function updateUI(){const mode=state.status;$('#score').textContent=state.score;$('#best').textContent=best;$('#overlay').hidden=mode==='playing';$('#toggle').textContent=mode==='playing'?'Pause':mode==='paused'?'Resume':mode==='over'?'Try again':'Start game';$('#overlay-start').textContent=mode==='paused'?'Resume game':mode==='over'?'Try again':'Start game';$('#overlay-title').textContent=mode==='paused'?'Hold that thought.':mode==='over'?'One more hop?':'A little lift?';$('#overlay-copy').textContent=mode==='paused'?'Your exact run is saved. Resume when you are ready.':mode==='over'?'You cleared '+state.score+' '+(state.score===1?'gap.':'gaps.')+' Tap Try again for a fresh run.':'Tap to hop. Slip through the gaps. Stay off the edges.';}
function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function draw(){
 const gradient=ctx.createLinearGradient(0,0,0,HEIGHT);gradient.addColorStop(0,'#171b2b');gradient.addColorStop(1,'#13241f');ctx.fillStyle=gradient;ctx.fillRect(0,0,WIDTH,HEIGHT);
 const offset=state.elapsed*24;ctx.fillStyle='#a792ff44';for(let i=0;i<24;i++){const x=((i*173+55-offset)%WIDTH+WIDTH)%WIDTH,y=(i*113+29)%HEIGHT;ctx.beginPath();ctx.arc(x,y,i%3===0?2:1,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle='#a792ff10';ctx.lineWidth=1;for(let y=55;y<HEIGHT;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WIDTH,y);ctx.stroke();}
 for(const o of state.obstacles){const top=o.gap-GAP/2,bottom=o.gap+GAP/2;rounded(o.x,-12,OBSTACLE_WIDTH,top+12,9,'#343341','#796e99');rounded(o.x,bottom,OBSTACLE_WIDTH,HEIGHT-bottom+12,9,'#343341','#796e99');rounded(o.x-4,top-13,OBSTACLE_WIDTH+8,14,5,'#a792ff');rounded(o.x-4,bottom,OBSTACLE_WIDTH+8,14,5,'#a792ff');ctx.fillStyle='#c4b4ff18';ctx.fillRect(o.x+9,8,7,Math.max(0,top-30));ctx.fillRect(o.x+9,bottom+23,7,HEIGHT-bottom-30);}
 ctx.save();ctx.translate(PLAYER_X,state.y);ctx.rotate(Math.max(-.35,Math.min(.65,state.vy/700)));ctx.fillStyle='#d4ff5825';ctx.beginPath();ctx.ellipse(-16,4,22,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d4ff58';ctx.beginPath();ctx.arc(0,0,RADIUS,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#efffb5';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#19211a';ctx.beginPath();ctx.arc(5,-3,2.8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#92a83a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-6,5);ctx.lineTo(-15,10);ctx.stroke();ctx.restore();
 ctx.fillStyle='#d4ff58';ctx.fillRect(0,HEIGHT-3,WIDTH,3);ctx.fillStyle='#a792ff';ctx.fillRect(0,0,WIDTH,2);
}
function fresh(start=false){state=newState(Math.floor(Math.random()*4294967296));if(start)hop(state);previous=0;record();updateUI();draw();save();message(start?'Keep hopping through the gaps. P to pause.':'Fresh run. Tap Start game when you are ready.');}
function act(){if(state.status==='over'){fresh(true);canvas.focus();return;}if(state.status==='paused'){state.status='playing';previous=0;message('Run resumed. Tap, Space or ↑ to hop.');}else{hop(state);message('Keep hopping through the gaps. P to pause.');}updateUI();save();canvas.focus();}
function pause(){if(state.status==='playing'){state.status='paused';previous=0;updateUI();save();message('Paused. Your exact run is saved.');}else if(state.status==='paused'){act();}}
$('#toggle').addEventListener('click',()=>state.status==='playing'?pause():act());$('#overlay-start').addEventListener('click',act);$('#restart').addEventListener('click',()=>fresh(false));canvas.addEventListener('pointerdown',e=>{e.preventDefault();act();});document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;if([' ','ArrowUp'].includes(e.key)){e.preventDefault();if(!e.repeat)act();}else if(e.key.toLowerCase()==='p'){e.preventDefault();pause();}});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.status==='playing')pause();});window.addEventListener('blur',()=>{if(state.status==='playing')pause();});window.addEventListener('pagehide',()=>{if(state.status==='playing')state.status='paused';save();});
function frame(now){if(!previous)previous=now;const dt=(now-previous)/1000;previous=now;if(state.status==='playing'){const before=state.score;step(state,dt);if(state.score!==before){record();updateUI();save();}if(state.status==='over'){updateUI();save();message('Run over. '+state.score+' '+(state.score===1?'gap':'gaps')+' cleared. Try again!');}if(now-lastSaved>750){save();lastSaved=now;}}draw();requestAnimationFrame(frame);}
record();updateUI();draw();message(restored?(state.status==='paused'?'Saved run restored. Resume to continue.':state.status==='over'?'Your previous score is saved. Try again when ready.':'Ready for your first hop. Start when ready.'):'Tap, Space or ↑ to hop. Thread the gaps; avoid the edges.');requestAnimationFrame(frame);
})();
