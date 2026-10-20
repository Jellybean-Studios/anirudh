(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SnakeCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SIZE = 20;
  const same = (a, b) => a.x === b.x && a.y === b.y;
  function foodFor(snake, random = Math.random) {
    const free = [];
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      if (!snake.some(p => p.x === x && p.y === y)) free.push({x, y});
    }
    return free.length ? free[Math.min(free.length - 1, Math.floor(random() * free.length))] : null;
  }
  function fresh(random) {
    const snake = [{x: 7, y: 10}, {x: 6, y: 10}, {x: 5, y: 10}];
    return {version: 1, snake, direction: {x: 1, y: 0}, queued: null, food: foodFor(snake, random), score: 0, status: 'ready'};
  }
  function turn(state, direction) {
    if (!direction || Math.abs(direction.x) + Math.abs(direction.y) !== 1 || state.queued || state.status === 'dead' || state.status === 'won') return false;
    if (direction.x === -state.direction.x && direction.y === -state.direction.y) return false;
    state.queued = {x: direction.x, y: direction.y};
    return true;
  }
  function step(state, random) {
    if (state.status !== 'running') return state;
    const direction = state.queued || state.direction;
    const head = {x: state.snake[0].x + direction.x, y: state.snake[0].y + direction.y};
    const eats = state.food && same(head, state.food);
    const body = eats ? state.snake : state.snake.slice(0, -1);
    state.direction = direction;
    state.queued = null;
    if (head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE || body.some(p => same(p, head))) {
      state.status = 'dead';
      return state;
    }
    state.snake.unshift(head);
    if (eats) {
      state.score += 10;
      state.food = foodFor(state.snake, random);
      if (!state.food) state.status = 'won';
    } else state.snake.pop();
    return state;
  }
  function restore(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.snake) || value.snake.length < 3 || value.snake.length > SIZE * SIZE || !Number.isInteger(value.score) || value.score < 0 || !['ready', 'running', 'paused'].includes(value.status)) return null;
    const point = p => p && Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x < SIZE && p.y < SIZE;
    const direction = d => d && Number.isInteger(d.x) && Number.isInteger(d.y) && Math.abs(d.x) + Math.abs(d.y) === 1;
    if (!value.snake.every(point) || new Set(value.snake.map(p => p.x + ',' + p.y)).size !== value.snake.length || !direction(value.direction) || !point(value.food) || value.snake.some(p => same(p, value.food))) return null;
    if (value.queued !== null && (!direction(value.queued) || (value.queued.x === -value.direction.x && value.queued.y === -value.direction.y))) return null;
    const restored = JSON.parse(JSON.stringify(value));
    restored.status = 'paused';
    return restored;
  }
  return {SIZE, fresh, turn, step, restore};
});
