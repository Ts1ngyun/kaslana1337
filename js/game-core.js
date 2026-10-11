/* Browser global + CommonJS export: works directly from file:// with no build. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KianaRunner = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PLAYER_HEIGHT = 64;
  const GRAVITY = 1750;
  const JUMP_SPEED = -625;
  const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

  class Runner {
    constructor({ width = 960, height = 340, random = Math.random } = {}) {
      this.random = random;
      this.width = Math.max(280, width);
      this.height = height;
      this.reset();
    }
    get ground() { return this.height - 49; }
    get speedScale() { return Math.min(1, this.width / 600); }
    get playerX() { return Math.min(118, Math.max(44, this.width * 0.12)); }
    reset() {
      this.state = 'ready';
      this.elapsed = 0;
      this.distance = 0;
      this.score = 0;
      this.bonus = 0;
      this.speed = 245 * this.speedScale;
      this.spawnIn = 1.4;
      this.obstacles = [];
      this.stars = [];
      this.player = { x: this.playerX, y: this.ground - PLAYER_HEIGHT, velocity: 0, grounded: true };
    }
    resize(width, height) {
      const oldGround = this.ground;
      this.width = Math.max(280, width);
      this.height = height;
      this.player.x = this.playerX;
      this.player.y += this.ground - oldGround;
    }
    start() {
      if (this.state !== 'ready' && this.state !== 'over') return false;
      this.reset();
      this.state = 'running';
      return true;
    }
    jump() {
      if (this.state !== 'running' || !this.player.grounded) return false;
      this.player.velocity = JUMP_SPEED;
      this.player.grounded = false;
      return true;
    }
    pause() {
      if (this.state !== 'running') return false;
      this.state = 'paused';
      return true;
    }
    resume() {
      if (this.state !== 'paused') return false;
      this.state = 'running';
      return true;
    }
    playerBox() {
      // Deliberately inset from the hair and hands for forgiving collisions.
      return { x: this.player.x + 12, y: this.player.y + 10, width: 24, height: 50 };
    }
    spawn() {
      const height = 28 + Math.floor(this.random() * 3) * 9;
      const width = 22 + Math.floor(this.random() * 3) * 7;
      const x = this.width + 40;
      this.obstacles.push({ x, y: this.ground - height, width, height });
      if (this.random() > 0.2) {
        this.stars.push({ x: x + width / 2 - 9, y: this.ground - 105, width: 18, height: 18 });
      }
      // At top speed there is still enough space to land and jump again.
      this.spawnIn = (this.speed * 0.88 + 145 + this.random() * 115) / this.speed;
    }
    advance(seconds) {
      if (this.state !== 'running' || !Number.isFinite(seconds) || seconds <= 0) return [];
      // Bounded simulation steps prevent tunnelling across thin crystals.
      let remaining = Math.min(seconds, 0.25);
      const events = [];
      while (remaining > 0 && this.state === 'running') {
        const dt = Math.min(remaining, 1 / 120);
        remaining -= dt;
        this.elapsed += dt;
        this.speed = Math.min(430, 245 + this.elapsed * 2.4) * this.speedScale;
        this.distance += this.speed * dt;
        const player = this.player;
        if (!player.grounded) {
          player.velocity += GRAVITY * dt;
          player.y += player.velocity * dt;
          if (player.y >= this.ground - PLAYER_HEIGHT) {
            player.y = this.ground - PLAYER_HEIGHT;
            player.velocity = 0;
            player.grounded = true;
          }
        }
        this.spawnIn -= dt;
        if (this.spawnIn <= 0) this.spawn();
        const movement = this.speed * dt;
        for (const obstacle of this.obstacles) obstacle.x -= movement;
        for (const star of this.stars) star.x -= movement;
        const hitbox = this.playerBox();
        if (this.obstacles.some(obstacle => overlaps(hitbox, { x: obstacle.x + 4, y: obstacle.y + 6, width: obstacle.width - 8, height: obstacle.height - 6 }))) {
          this.state = 'over';
          events.push({ type: 'over', score: this.score });
          break;
        }
        this.stars = this.stars.filter(star => {
          if (!overlaps(hitbox, star)) return star.x > -star.width;
          this.bonus += 25;
          events.push({ type: 'star', x: star.x + 9, y: star.y + 9 });
          return false;
        });
        this.obstacles = this.obstacles.filter(obstacle => obstacle.x > -obstacle.width);
        this.score = Math.floor(this.elapsed * 10) + this.bonus;
      }
      return events;
    }
  }
  return { Runner, overlaps, PLAYER_HEIGHT, GRAVITY, JUMP_SPEED };
});
