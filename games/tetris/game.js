/*
 * Falling Blocks — adapted from javascript-tetris by Jake Gordon & contributors.
 * Copyright (c) 2011–2016 Jake Gordon and contributors. MIT; see LICENSE.
 * Original source: https://github.com/jakesgordon/javascript-tetris
 * Changes: local-only UI, touch controls, pause/resume, state persistence,
 * seven-piece bag, hard drop, wall adjustments, and ghost piece.
 */
(() => {
  'use strict';
  const WIDTH = 10, HEIGHT = 20;
  const STATE_KEY = 'anirudh.falling-blocks.state.v1';
  const BEST_KEY = 'anirudh.falling-blocks.best.v1';
  const types = {
    i: { size:4, blocks:[0x0F00,0x2222,0x00F0,0x4444], color:'#62d6eb' },
    j: { size:3, blocks:[0x44C0,0x8E00,0x6440,0x0E20], color:'#718eff' },
    l: { size:3, blocks:[0x4460,0x0E80,0xC440,0x2E00], color:'#ffa65e' },
    o: { size:2, blocks:[0xCC00,0xCC00,0xCC00,0xCC00], color:'#f5d76b' },
    s: { size:3, blocks:[0x06C0,0x8C40,0x6C00,0x4620], color:'#78d8a5' },
    t: { size:3, blocks:[0x0E40,0x4C40,0x4E00,0x4640], color:'#bb8cfa' },
    z: { size:3, blocks:[0x0C60,0x4C80,0xC600,0x2640], color:'#f57b96' }
  };
  const ids = Object.keys(types);
  const get = id => document.getElementById(id);
  const canvas = get('canvas'), context = canvas.getContext('2d');
  const preview = get('upcoming'), previewContext = preview.getContext('2d');
  let board, current, next, bag = [], score = 0, rows = 0, best = 0;
  let started = false, playing = false, ended = false, elapsed = 0;
  let saveAvailable = true, lastFrame = 0, repeatTimer, repeatDelay;

  // These shape masks and the bit iterator originate in Jake Gordon's source.
  function eachBlock(piece, fn) {
    let row = 0, col = 0;
    const mask = types[piece.id].blocks[piece.dir];
    for (let bit = 0x8000; bit > 0; bit >>= 1) {
      if (mask & bit) fn(piece.x + col, piece.y + row);
      if (++col === 4) { col = 0; row++; }
    }
  }
  function collides(piece) {
    let hit = false;
    eachBlock(piece, (x,y) => {
      if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT || board[y][x]) hit = true;
    });
    return hit;
  }
  function fillBag() {
    bag = ids.slice();
    for (let n = bag.length - 1; n > 0; n--) {
      const k = Math.floor(Math.random() * (n + 1));
      [bag[n],bag[k]] = [bag[k],bag[n]];
    }
  }
  function randomPiece() {
    if (!bag.length) fillBag();
    const id = bag.pop();
    return { id, dir:0, x:Math.floor((WIDTH - types[id].size)/2), y:0 };
  }
  function emptyBoard() { return Array.from({length:HEIGHT}, () => Array(WIDTH).fill(null)); }
  function storageFail() {
    saveAvailable = false;
    get('save-note').textContent = 'Saving is unavailable in this browser. Keep this tab open to continue.';
  }
  function persist() {
    best = Math.max(best,score);
    get('best').textContent = best.toLocaleString();
    try {
      localStorage.setItem(BEST_KEY, String(best));
      if (started && !ended) {
        localStorage.setItem(STATE_KEY, JSON.stringify({
          version:1, board, current, next, bag, score, rows, elapsed
        }));
      } else localStorage.removeItem(STATE_KEY);
    } catch { storageFail(); }
  }
  function validPiece(piece) {
    return piece && ids.includes(piece.id) && Number.isInteger(piece.dir) &&
      piece.dir >= 0 && piece.dir <= 3 && Number.isInteger(piece.x) &&
      piece.x >= -3 && piece.x < WIDTH && Number.isInteger(piece.y) &&
      piece.y >= 0 && piece.y < HEIGHT;
  }
  function restore() {
    try {
      const savedBest = Number(localStorage.getItem(BEST_KEY));
      best = Number.isSafeInteger(savedBest) && savedBest >= 0 ? savedBest : 0;
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== 1 || !Array.isArray(saved.board) ||
          saved.board.length !== HEIGHT || !saved.board.every(row =>
            Array.isArray(row) && row.length === WIDTH &&
            row.every(cell => cell === null || ids.includes(cell))) ||
          !validPiece(saved.current) || !validPiece(saved.next) ||
          !Array.isArray(saved.bag) || saved.bag.length > 7 ||
          !saved.bag.every(id => ids.includes(id)) ||
          !Number.isSafeInteger(saved.score) || saved.score < 0 ||
          !Number.isSafeInteger(saved.rows) || saved.rows < 0 ||
          !Number.isFinite(saved.elapsed) || saved.elapsed < 0 || saved.elapsed > 1) {
        localStorage.removeItem(STATE_KEY); return false;
      }
      board = saved.board;
      if (collides(saved.current)) { localStorage.removeItem(STATE_KEY); return false; }
      current = saved.current; next = saved.next; bag = saved.bag;
      score = saved.score; rows = saved.rows; elapsed = saved.elapsed;
      started = true; playing = false; ended = false;
      best = Math.max(best,score);
      return true;
    } catch { return false; }
  }
  function updateUI() {
    get('score').textContent = score.toLocaleString();
    get('best').textContent = best.toLocaleString();
    get('rows').textContent = rows.toLocaleString();
    get('start').textContent = playing ? 'Pause' : started && !ended ? 'Resume' : 'Start';
    get('overlay').hidden = playing;
    get('overlay-title').textContent = ended ? 'Game over' : started ? 'Paused' : 'Ready to play?';
    get('overlay-note').textContent = ended ? 'Press Start for another game' : started ? 'Your game is saved. Press Resume.' : 'Press Start or Space';
  }
  function startNew() {
    board = emptyBoard(); bag = []; score = 0; rows = 0; elapsed = 0;
    current = randomPiece(); next = randomPiece();
    started = true; playing = true; ended = false;
    persist(); updateUI(); draw(); canvas.focus({preventScroll:true});
  }
  function pause() {
    if (!playing) return;
    playing = false; stopRepeat(); persist(); updateUI(); draw();
  }
  function togglePlay() {
    if (playing) pause();
    else if (started && !ended) {
      playing = true; updateUI(); canvas.focus({preventScroll:true});
    } else startNew();
  }
  function move(dx,dy) {
    const proposal = {...current,x:current.x+dx,y:current.y+dy};
    if (collides(proposal)) return false;
    current = proposal; return true;
  }
  function rotate() {
    const dir = (current.dir + 1) % 4;
    for (const offset of [0,-1,1,-2,2]) {
      const proposal = {...current,dir,x:current.x+offset};
      if (!collides(proposal)) { current = proposal; return; }
    }
  }
  function lock() {
    eachBlock(current,(x,y) => { board[y][x] = current.id; });
    score += 10;
    const retained = board.filter(row => !row.every(Boolean));
    const cleared = HEIGHT - retained.length;
    if (cleared) {
      rows += cleared; score += 100 * Math.pow(2,cleared-1);
      board = Array.from({length:cleared},() => Array(WIDTH).fill(null)).concat(retained);
    }
    current = next; next = randomPiece(); elapsed = 0;
    if (collides(current)) {
      playing = false; ended = true; stopRepeat();
    }
    persist(); updateUI();
  }
  function drop() { if (!move(0,1)) lock(); }
  function act(action) {
    if (!playing) return;
    if (action === 'left') move(-1,0);
    if (action === 'right') move(1,0);
    if (action === 'rotate') rotate();
    if (action === 'down') { if (move(0,1)) score++; else lock(); elapsed = 0; }
    if (action === 'drop') { while (move(0,1)) score += 2; lock(); }
    persist(); updateUI(); draw();
  }
  function block(ctx,x,y,color,size,alpha=1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x*size+1,y*size+1,size-2,size-2);
    ctx.fillStyle = '#ffffff30';
    ctx.fillRect(x*size+2,y*size+2,size-4,3);
    ctx.globalAlpha = 1;
  }
  function draw() {
    const unit = canvas.width / WIDTH;
    context.clearRect(0,0,canvas.width,canvas.height);
    context.strokeStyle = '#18243b'; context.lineWidth = 1;
    for (let x=1;x<WIDTH;x++) {
      context.beginPath(); context.moveTo(x*unit+.5,0); context.lineTo(x*unit+.5,canvas.height); context.stroke();
    }
    for (let y=1;y<HEIGHT;y++) {
      context.beginPath(); context.moveTo(0,y*unit+.5); context.lineTo(canvas.width,y*unit+.5); context.stroke();
    }
    board.forEach((row,y) => row.forEach((id,x) => { if (id) block(context,x,y,types[id].color,unit); }));
    if (started && !ended) {
      let ghost = {...current};
      while (!collides({...ghost,y:ghost.y+1})) ghost.y++;
      eachBlock(ghost,(x,y) => block(context,x,y,types[current.id].color,unit,.18));
      eachBlock(current,(x,y) => block(context,x,y,types[current.id].color,unit));
    }
    previewContext.clearRect(0,0,preview.width,preview.height);
    if (next) {
      const occupied=[];
      eachBlock({...next,x:0,y:0},(x,y) => occupied.push([x,y]));
      const minX=Math.min(...occupied.map(c=>c[0])), maxX=Math.max(...occupied.map(c=>c[0]));
      const minY=Math.min(...occupied.map(c=>c[1])), maxY=Math.max(...occupied.map(c=>c[1]));
      const px=24, offsetX=(5-(maxX-minX+1))/2-minX, offsetY=(5-(maxY-minY+1))/2-minY;
      occupied.forEach(([x,y])=>block(previewContext,x+offsetX,y+offsetY,types[next.id].color,px));
    }
  }
  function stopRepeat() { clearTimeout(repeatDelay); clearInterval(repeatTimer); }
  get('start').addEventListener('click',togglePlay);
  get('restart').addEventListener('click',startNew);
  document.addEventListener('keydown',event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.target.tagName === 'BUTTON' && (event.key === ' ' || event.key === 'Enter')) return;
    const keys = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'rotate',ArrowDown:'down',' ':'drop'};
    if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') {
      if (!event.repeat) { event.preventDefault(); if (started && !ended) togglePlay(); }
    } else if (keys[event.key]) {
      event.preventDefault();
      if (event.key === ' ' && !playing) { if (!event.repeat) togglePlay(); }
      else if (!(event.repeat && (event.key === ' ' || event.key === 'ArrowUp'))) act(keys[event.key]);
    }
  });
  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('pointerdown',event => {
      event.preventDefault(); stopRepeat();
      if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
      const action = button.dataset.action; act(action);
      if (['left','right','down'].includes(action)) repeatDelay=setTimeout(()=>{
        repeatTimer=setInterval(()=>act(action),90);
      },220);
    });
    button.addEventListener('pointerup',stopRepeat);
    button.addEventListener('pointercancel',stopRepeat);
    button.addEventListener('lostpointercapture',stopRepeat);
  });
  window.addEventListener('blur',pause);
  window.addEventListener('pagehide',()=>{ pause(); persist(); });
  document.addEventListener('visibilitychange',()=>{ if (document.hidden) pause(); });
  board = emptyBoard();
  const restored = restore();
  if (!restored) { board=emptyBoard(); current=randomPiece(); next=randomPiece(); }
  try {
    const probe=BEST_KEY+'.probe'; localStorage.setItem(probe,'1'); localStorage.removeItem(probe);
  } catch { storageFail(); }
  updateUI(); draw();
  function frame(time) {
    const delta = lastFrame ? Math.min(.1,(time-lastFrame)/1000) : 0; lastFrame=time;
    if (playing) {
      elapsed += delta;
      const step = Math.max(.1,.6-.005*rows);
      if (elapsed >= step) { elapsed-=step; drop(); persist(); updateUI(); draw(); }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
