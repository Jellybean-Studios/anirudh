(function () {
  'use strict';
  const C = SnakeCore, key = 'anirudh-snake-v1', canvas = document.getElementById('board'), ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id), dirs = {up: {x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0}};
  let state = C.fresh(), best = 0, stored = false, last = 0, accumulator = 0;
  function storageFailure() { $('save-note').textContent = 'Browser saving is unavailable. This session still works.'; }
  try {
    const number = Number(localStorage.getItem(key + '.best'));
    if (Number.isFinite(number) && number >= 0) best = number;
    const value = localStorage.getItem(key + '.save');
    if (value) { const restored = C.restore(JSON.parse(value)); if (restored) { state = restored; stored = true; } else localStorage.removeItem(key + '.save'); }
  } catch (_) { storageFailure(); }
  function persist() {
    try {
      localStorage.setItem(key + '.best', String(best));
      if (state.status === 'dead' || state.status === 'won') localStorage.removeItem(key + '.save');
      else localStorage.setItem(key + '.save', JSON.stringify(state));
    } catch (_) { storageFailure(); }
  }
  function update() {
    $('score').textContent = state.score; $('best').textContent = best;
    const paused = state.status === 'paused', ready = state.status === 'ready', running = state.status === 'running', done = state.status === 'dead' || state.status === 'won';
    $('toggle').textContent = running ? 'Pause' : paused ? 'Resume' : done ? 'Play again' : 'Start game';
    $('overlay').hidden = running;
    $('overlay-title').textContent = ready ? 'Ready to roll?' : paused ? (stored ? 'Your run is saved.' : 'Take a breather.') : state.status === 'won' ? 'You filled the board!' : 'That’s a wrap.';
    $('overlay-copy').textContent = ready ? 'Collect the bright dots. Stay in bounds.' : paused ? 'Your snake is right where you left it.' : 'Final score: ' + state.score + '. Ready for another run?';
    $('overlay-start').textContent = paused ? 'Resume game' : done ? 'Play again' : 'Start game';
    $('status').textContent = running ? 'Arrows / WASD to steer. Space to pause.' : paused ? 'Paused. Resume whenever you’re ready.' : done ? (state.status === 'won' ? 'Perfect run! Every square is yours.' : 'Game over. Your best score is saved.') : 'Use arrows or WASD. Space to start.';
    draw();
  }
  function draw() {
    const cell = 30;
    ctx.fillStyle = '#111912'; ctx.fillRect(0,0,600,600);
    ctx.strokeStyle = '#203023'; ctx.lineWidth = .5;
    for (let n = 1; n < C.SIZE; n++) { ctx.beginPath();ctx.moveTo(n*cell,0);ctx.lineTo(n*cell,600);ctx.stroke();ctx.beginPath();ctx.moveTo(0,n*cell);ctx.lineTo(600,n*cell);ctx.stroke(); }
    if (state.food) { const x=state.food.x*cell+15,y=state.food.y*cell+15;ctx.fillStyle='#ffad74';ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe4bf';ctx.beginPath();ctx.arc(x-2,y-3,2,0,Math.PI*2);ctx.fill(); }
    state.snake.forEach((p,i)=> {ctx.fillStyle=i===0?'#e7ff99':'#b9e553';ctx.beginPath();ctx.roundRect(p.x*cell+2,p.y*cell+2,26,26,i===0?7:5);ctx.fill();});
    const head=state.snake[0],d=state.direction;
    ctx.fillStyle='#253319';
    for (const side of [-1,1]) { const x=head.x*cell+15+d.x*6+(d.y!==0?side*5:0);const y=head.y*cell+15+d.y*6+(d.x!==0?side*5:0);ctx.beginPath();ctx.arc(x,y,2.4,0,Math.PI*2);ctx.fill(); }
  }
  function startPause() {
    if (state.status === 'running') state.status = 'paused';
    else {if (state.status === 'dead' || state.status === 'won') state=C.fresh();state.status='running';stored=false;}
    last=0;accumulator=0;persist();update();canvas.focus({preventScroll:true});
  }
  function restart() {state=C.fresh();stored=false;last=0;accumulator=0;persist();update();canvas.focus({preventScroll:true});}
  function steer(direction) {if (state.status==='running' && C.turn(state,direction)) persist();}
  $('toggle').addEventListener('click',startPause);$('overlay-start').addEventListener('click',startPause);$('restart').addEventListener('click',restart);
  document.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>steer(dirs[b.dataset.direction])));
  document.addEventListener('keydown',e=> {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const d={ArrowUp:dirs.up,w:dirs.up,W:dirs.up,ArrowDown:dirs.down,s:dirs.down,S:dirs.down,ArrowLeft:dirs.left,a:dirs.left,A:dirs.left,ArrowRight:dirs.right,d:dirs.right,D:dirs.right}[e.key];
    if(d){e.preventDefault();steer(d);} else if(e.code==='Space' && !['BUTTON','A'].includes(document.activeElement.tagName)){e.preventDefault();if(!e.repeat)startPause();}
  });
  let pointer=null;
  canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointerup',e=>{if(!pointer)return;const x=e.clientX-pointer.x,y=e.clientY-pointer.y;pointer=null;if(Math.max(Math.abs(x),Math.abs(y))<15)return;steer(Math.abs(x)>Math.abs(y)?(x>0?dirs.right:dirs.left):(y>0?dirs.down:dirs.up));});
  canvas.addEventListener('pointercancel',()=>pointer=null);
  document.addEventListener('visibilitychange',()=>{if(document.hidden && state.status==='running'){state.status='paused';last=0;accumulator=0;persist();update();}});
  window.addEventListener('pagehide',()=>{if(state.status==='running')state.status='paused';persist();});
  function frame(time) {
    if(state.status==='running') {
      if(last)accumulator+=Math.min(time-last,250);last=time;
      const period=Math.max(65,145-Math.floor(state.score/30)*5);
      if(accumulator>=period){accumulator-=period;C.step(state);best=Math.max(best,state.score);persist();update();}
    } else last=0;
    requestAnimationFrame(frame);
  }
  update();requestAnimationFrame(frame);
})();
