const test = require('node:test');
const assert = require('node:assert/strict');
const { Runner } = require('../js/game-core.js');
const advance = (runner, seconds) => { for (let t = 0; t < seconds; t += 1 / 120) runner.advance(1 / 120); };

test('one jump, no midair jump, and exact landing', () => {
  const runner = new Runner();
  assert.equal(runner.jump(), false);
  runner.start();
  assert.equal(runner.jump(), true);
  assert.equal(runner.jump(), false);
  advance(runner, 0.3);
  assert.ok(runner.player.y < runner.ground - 64 - 85);
  advance(runner, 0.5);
  assert.equal(runner.player.grounded, true);
  assert.equal(runner.player.y, runner.ground - 64);
  assert.equal(runner.jump(), true);
});

test('collision ends a run, and an actual jump clears the same crystal', () => {
  const runner = new Runner();
  runner.start();
  const obstacle = () => ({ x: runner.player.x + 38, y: runner.ground - 46, width: 36, height: 46 });
  runner.obstacles.push(obstacle());
  const events = runner.advance(0.1);
  assert.equal(runner.state, 'over');
  assert.equal(events[0].type, 'over');
  runner.start();
  runner.obstacles.push({ ...obstacle(), x: runner.player.x + 110 });
  runner.jump();
  advance(runner, 0.72);
  assert.equal(runner.state, 'running');
  assert.equal(runner.player.grounded, true);
});

test('pause freezes score, objects, time and jump physics', () => {
  const runner = new Runner({ random: () => 0.5 });
  runner.start(); runner.jump(); advance(runner, 0.2);
  assert.equal(runner.pause(), true);
  const before = JSON.stringify(runner);
  assert.equal(runner.jump(), false);
  assert.deepEqual(runner.advance(10), []);
  assert.equal(JSON.stringify(runner), before);
  runner.resume(); runner.advance(0.02);
  assert.equal(runner.state, 'running');
  assert.ok(runner.elapsed > 0.2);
});

test('star is awarded exactly once, including score bonus', () => {
  const runner = new Runner();
  runner.start();
  const box = runner.playerBox();
  runner.stars.push({ x: box.x + 3, y: box.y + 4, width: 18, height: 18 });
  const events = runner.advance(0.01);
  assert.equal(events.filter(e => e.type === 'star').length, 1);
  assert.equal(runner.bonus, 25);
  assert.equal(runner.score, 25);
  assert.equal(runner.stars.length, 0);
  assert.equal(runner.advance(0.01).length, 0);
});

test('restart clears previous progress, obstacles and player momentum', () => {
  const runner = new Runner();
  runner.start(); runner.jump(); advance(runner, 0.2);
  runner.state = 'over'; runner.bonus = 25;
  runner.start();
  assert.equal(runner.elapsed, 0);
  assert.equal(runner.score, 0);
  assert.equal(runner.bonus, 0);
  assert.equal(runner.player.velocity, 0);
  assert.equal(runner.player.grounded, true);
  assert.deepEqual(runner.obstacles, []);
});

test('resizing preserves jump height relative to the ground', () => {
  const runner = new Runner();
  runner.start(); runner.jump(); advance(runner, 0.2); runner.pause();
  const altitude = runner.ground - runner.player.y;
  runner.resize(480, 300);
  assert.equal(runner.ground - runner.player.y, altitude);
  assert.ok(runner.player.x > 0 && runner.player.x < runner.width / 2);
  runner.resume(); advance(runner, 0.6);
  assert.equal(runner.player.y, runner.ground - 64);
});

test('spawn gaps remain jumpable at every supported speed', () => {
  for (const speed of [245, 350, 430]) {
    const runner = new Runner({ width: 480, random: () => 0 });
    runner.start(); runner.speed = speed; runner.spawn();
    assert.ok(runner.spawnIn > 1.2);
    assert.equal(runner.obstacles[0].x, 520);
    assert.ok(runner.obstacles[0].height < 64);
  }
});

test('large or invalid time deltas cannot skip collisions or break state', () => {
  const runner = new Runner(); runner.start();
  assert.deepEqual(runner.advance(NaN), []);
  assert.deepEqual(runner.advance(-1), []);
  assert.deepEqual(runner.advance(Infinity), []);
  runner.obstacles.push({ x: runner.player.x + 40, y: runner.ground - 46, width: 22, height: 46 });
  runner.advance(100);
  assert.equal(runner.state, 'over');
  assert.ok(runner.elapsed < 0.25);
});

test('the minimum mobile viewport leaves a visible reaction window', () => {
  const runner = new Runner({ width: 320 });
  runner.start(); runner.spawn();
  const distance = runner.obstacles[0].x - runner.playerBox().x;
  assert.ok(distance / (430 * runner.speedScale) > 0.9);
});


test('mobile speeds scale with viewport width without distorting the character', () => {
  const mobile = new Runner({ width: 320 });
  const desktop = new Runner({ width: 960 });
  mobile.start(); desktop.start();
  mobile.advance(0.1); desktop.advance(0.1);
  assert.equal(mobile.width, 320);
  assert.ok(mobile.speed < desktop.speed);
  assert.equal(mobile.speed / mobile.speedScale, desktop.speed);
  mobile.jump(); desktop.jump();
  mobile.advance(0.2); desktop.advance(0.2);
  assert.equal(mobile.player.velocity, desktop.player.velocity);
});
