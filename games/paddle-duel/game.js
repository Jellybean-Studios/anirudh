(function () {
  'use strict';
  const KEY = 'anirudh-paddle-duel-v1';
  const WIDTH = 720, HEIGHT = 440, RADIUS = 7, PADDLE = 84;
  const LEFT_EDGE = 40, RIGHT_EDGE = 680, TARGET = 7;
  const clamp = (v, low, high) => Math.max(low, Math.min(high, v));

  function fresh(records = { wins: 0, losses: 0, bestRally: 0 }) {
    return {
      status: 'ready', you: 0, ai: 0, humanY: 178, aiY: 178,
      ball: { x: 360, y: 220, vx: 310, vy: 115 },
      serve: .65, phase: 0, rally: 0, recorded: false,
      records: { ...records }
    };
  }

  function valid(raw) {
    if (!raw || !['ready', 'running', 'paused', 'over'].includes(raw.status)) return null;
    if (![raw.you, raw.ai].every(n => Number.isInteger(n) && n >= 0 && n <= TARGET)) return null;
    if (raw.you === TARGET && raw.ai === TARGET) return null;
    if ((raw.you === TARGET || raw.ai === TARGET) !== (raw.status === 'over')) return null;
    if (![raw.humanY, raw.aiY].every(n => Number.isFinite(n) && n >= 0 && n <= HEIGHT - PADDLE)) return null;
    const ball = raw.ball;
    if (!ball || !['x', 'y', 'vx', 'vy'].every(k => Number.isFinite(ball[k]))) return null;
    if (ball.x < -30 || ball.x > WIDTH + 30 || ball.y < RADIUS || ball.y > HEIGHT - RADIUS) return null;
    if (Math.abs(ball.vx) < 50 || Math.abs(ball.vx) > 700 || Math.abs(ball.vy) > 700) return null;
    if (!Number.isFinite(raw.serve) || raw.serve < 0 || raw.serve > 1) return null;
    if (!Number.isFinite(raw.phase) || raw.phase < 0 || raw.phase > 1e9) return null;
    if (!Number.isInteger(raw.rally) || raw.rally < 0 || raw.rally > 1e6) return null;
    if (!raw.records || !['wins', 'losses', 'bestRally'].every(k => Number.isInteger(raw.records[k]) && raw.records[k] >= 0 && raw.records[k] < 1e9)) return null;
    return {
      status: raw.status === 'running' ? 'paused' : raw.status,
      you: raw.you, ai: raw.ai, humanY: raw.humanY, aiY: raw.aiY,
      ball: { ...ball }, serve: raw.serve, phase: raw.phase,
      rally: raw.rally, recorded: raw.status === 'over' && raw.recorded === true,
      records: { ...raw.records }
    };
  }

  function start(s) {
    if (s.status !== 'ready' && s.status !== 'paused') return false;
    s.status = 'running';
    return true;
  }

  function pause(s) {
    if (s.status !== 'running') return false;
    s.status = 'paused';
    return true;
  }

  function recordEnd(s) {
    if (s.status !== 'over' || s.recorded) return;
    s.records[s.you === TARGET ? 'wins' : 'losses']++;
    s.recorded = true;
  }

  function point(s, player) {
    s[player]++;
    s.records.bestRally = Math.max(s.records.bestRally, s.rally);
    s.rally = 0;
    if (s[player] === TARGET) {
      s.status = 'over';
      recordEnd(s);
      return;
    }
    // A short, deterministic serve makes reloads preserve the same next ball.
    const towardHuman = (s.you + s.ai) % 2 === 1;
    s.ball = { x: 360, y: 220, vx: towardHuman ? -310 : 310, vy: (s.you + s.ai) % 3 === 0 ? -115 : 115 };
    s.serve = .65;
  }

  function bounce(s, paddleY, direction) {
    const impact = clamp((s.ball.y - (paddleY + PADDLE / 2)) / (PADDLE / 2), -1, 1);
    const speed = Math.min(640, Math.hypot(s.ball.vx, s.ball.vy) * 1.045 + 4);
    const angle = impact * 1.03;
    s.ball.vx = direction * speed * Math.cos(angle);
    s.ball.vy = speed * Math.sin(angle);
    s.rally++;
    s.records.bestRally = Math.max(s.records.bestRally, s.rally);
  }

  function step(s, input, dt) {
    if (s.status !== 'running' || !Number.isFinite(dt) || dt <= 0) return;
    // The browser calls this at 120 Hz; the cap also keeps accidental large steps safe.
    dt = Math.min(dt, 1 / 60);
    s.phase += dt;
    if (Number.isFinite(input.target)) {
      const delta = input.target - PADDLE / 2 - s.humanY;
      s.humanY += clamp(delta, -600 * dt, 600 * dt);
    } else {
      s.humanY += clamp(input.direction || 0, -1, 1) * 440 * dt;
    }
    s.humanY = clamp(s.humanY, 0, HEIGHT - PADDLE);
    // The computer has a speed limit, tracking error, and no future trajectory knowledge.
    const tracking = s.ball.vx > 0 && s.ball.x > 180;
    const target = tracking ? s.ball.y + Math.sin(s.phase * 2.4) * 23 : HEIGHT / 2;
    const aiDelta = target - PADDLE / 2 - s.aiY;
    s.aiY = clamp(s.aiY + clamp(aiDelta, -260 * dt, 260 * dt), 0, HEIGHT - PADDLE);
    if (s.serve > 0) {
      s.serve = Math.max(0, s.serve - dt);
      return;
    }
    const b = s.ball, oldX = b.x;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.y < RADIUS) { b.y = 2 * RADIUS - b.y; b.vy = Math.abs(b.vy); }
    if (b.y > HEIGHT - RADIUS) { b.y = 2 * (HEIGHT - RADIUS) - b.y; b.vy = -Math.abs(b.vy); }
    if (b.vx < 0 && oldX - RADIUS >= LEFT_EDGE && b.x - RADIUS <= LEFT_EDGE && b.y >= s.humanY - RADIUS && b.y <= s.humanY + PADDLE + RADIUS) {
      b.x = LEFT_EDGE + RADIUS;
      bounce(s, s.humanY, 1);
    } else if (b.vx > 0 && oldX + RADIUS <= RIGHT_EDGE && b.x + RADIUS >= RIGHT_EDGE && b.y >= s.aiY - RADIUS && b.y <= s.aiY + PADDLE + RADIUS) {
      b.x = RIGHT_EDGE - RADIUS;
      bounce(s, s.aiY, -1);
    }
    if (b.x < -RADIUS) point(s, 'ai');
    else if (b.x > WIDTH + RADIUS) point(s, 'you');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KEY, fresh, valid, start, pause, step, point, recordEnd, bounce };
    if (typeof document === 'undefined') return;
  }

  const $ = selector => document.querySelector(selector);
  const canvas = $('#court'), ctx = canvas.getContext('2d');
  let state = fresh(), storageOK = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = valid(JSON.parse(raw)) || fresh();
  } catch (error) { storageOK = false; }
  recordEnd(state);
  const keys = new Set();
  let pointerTarget = null, lastTime = 0, accumulator = 0, saveClock = 0;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; }
    catch (error) { storageOK = false; }
    $('#save-note').textContent = storageOK
      ? 'Your match and records save in this browser. Reloaded matches start paused.'
      : 'Saving is unavailable in this browser. Keep this tab open to keep your match.';
    $('#save-note').classList.toggle('error', !storageOK);
  }

  function renderUI() {
    $('#you-score').textContent = state.you;
    $('#ai-score').textContent = state.ai;
    $('#record').textContent = state.records.wins;
    $('#record').title = state.records.losses + ' losses · best rally ' + state.records.bestRally;
    const running = state.status === 'running', over = state.status === 'over', paused = state.status === 'paused';
    $('#overlay').hidden = running;
    $('#toggle').textContent = running ? 'Pause match' : over ? 'Play again' : paused ? 'Resume match' : 'Start match';
    $('#overlay-start').textContent = over ? 'Play again' : paused ? 'Resume match' : 'Start match';
    $('#overlay-title').textContent = over ? (state.you === TARGET ? 'Match is yours!' : 'Computer takes it.') : paused ? 'Match paused.' : 'Ready to rally?';
    $('#overlay-copy').textContent = over ? 'Final score ' + state.you + ' – ' + state.ai + '. Your win record is saved.' : paused ? 'Your court, score, and ball are saved. Resume when ready.' : 'Move the lime paddle. First to seven takes the match.';
    $('#status').textContent = over ? (state.you === TARGET ? 'You win the match! ' : 'Computer wins. ') + state.you + ' – ' + state.ai + '. Start a new match to play again.' : running ? 'W / S or ↑ / ↓ to move. Space pauses. Drag anywhere on the court to aim your paddle.' : paused ? 'Paused. Resume to continue from this position.' : 'W / S or ↑ / ↓ to move. Space to start. Drag anywhere on the court with a finger or mouse.';
    save();
  }

  function draw() {
    ctx.fillStyle = '#111917'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = '#24362d'; ctx.lineWidth = 1;
    for (let y = 22; y < HEIGHT; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
    ctx.setLineDash([6, 12]); ctx.strokeStyle = '#516053'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(WIDTH / 2, 14); ctx.lineTo(WIDTH / 2, HEIGHT - 14); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#293d30'; ctx.beginPath(); ctx.arc(WIDTH / 2, HEIGHT / 2, 60, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 16; ctx.shadowColor = '#d4ff5835'; ctx.fillStyle = '#d4ff58'; ctx.fillRect(27, state.humanY, 13, PADDLE);
    ctx.shadowColor = '#ba9aff35'; ctx.fillStyle = '#ba9aff'; ctx.fillRect(RIGHT_EDGE, state.aiY, 13, PADDLE);
    ctx.shadowColor = '#ffffff55'; ctx.fillStyle = '#f5f5f2'; ctx.beginPath(); ctx.arc(state.ball.x, state.ball.y, RADIUS, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    if (state.serve > 0 && state.status === 'running') { ctx.fillStyle = '#a9b4a9'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('NEXT SERVE', WIDTH / 2, HEIGHT / 2 + 37); }
  }

  function frame(time) {
    if (!lastTime) lastTime = time;
    const elapsed = Math.min(.05, (time - lastTime) / 1000); lastTime = time;
    if (state.status === 'running') {
      accumulator += elapsed;
      const previousYou = state.you, previousAi = state.ai;
      const direction = Number(keys.has('ArrowDown') || keys.has('s')) - Number(keys.has('ArrowUp') || keys.has('w'));
      while (accumulator >= 1 / 120) { step(state, { direction, target: pointerTarget }, 1 / 120); accumulator -= 1 / 120; }
      if (state.you !== previousYou || state.ai !== previousAi) renderUI();
      saveClock += elapsed;
      if (saveClock >= .4) { save(); saveClock = 0; }
    } else accumulator = 0;
    draw(); requestAnimationFrame(frame);
  }

  function toggle() {
    if (state.status === 'over') state = fresh(state.records);
    if (!pause(state)) start(state);
    lastTime = 0; renderUI(); canvas.focus();
  }
  function pauseForFocus() { keys.clear(); pointerTarget = null; if (pause(state)) renderUI(); else save(); }
  $('#toggle').addEventListener('click', toggle);
  $('#overlay-start').addEventListener('click', toggle);
  $('#restart').addEventListener('click', () => { state = fresh(state.records); keys.clear(); pointerTarget = null; renderUI(); draw(); });
  window.addEventListener('keydown', event => {
    if (event.target && /^(SELECT|INPUT|TEXTAREA)$/.test(event.target.tagName)) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(key)) { event.preventDefault(); keys.add(key); pointerTarget = null; }
    if (key === ' ' && event.target.tagName !== 'BUTTON') { event.preventDefault(); if (!event.repeat) toggle(); }
  });
  window.addEventListener('keyup', event => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
  function track(event) { const rect = canvas.getBoundingClientRect(); pointerTarget = clamp((event.clientY - rect.top) * HEIGHT / rect.height, 0, HEIGHT); }
  canvas.addEventListener('pointerdown', event => { event.preventDefault(); canvas.focus(); canvas.setPointerCapture(event.pointerId); track(event); });
  canvas.addEventListener('pointermove', event => { if (event.pointerType === 'mouse' || canvas.hasPointerCapture(event.pointerId)) track(event); });
  canvas.addEventListener('pointerup', event => { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); });
  canvas.addEventListener('pointercancel', () => { pointerTarget = null; });
  window.addEventListener('blur', pauseForFocus);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseForFocus(); });
  window.addEventListener('pagehide', save);
  renderUI(); draw(); requestAnimationFrame(frame);
})();
