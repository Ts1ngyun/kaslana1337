/* Local generated chibi atlas. Browser global + CommonJS for file:// and tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KianaCharacter = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const expressions = ['happy', 'violet', 'cat'];
  const frames = [[[25,13,167,237],[206,8,178,242],[403,11,164,239],[581,12,168,238]],[[24,268,168,238],[206,263,178,243],[403,265,164,241],[581,267,168,239]],[[24,523,168,239],[206,519,178,243],[403,521,164,241],[582,523,167,239]]];
  const scale = 96 / 240;
  function pickExpression(random = Math.random) {
    return Math.min(2, Math.max(0, Math.floor(random() * expressions.length)));
  }
  function runningFrame(elapsed, moving, grounded, reducedMotion = false) {
    if (!grounded) return 1;
    if (!moving || reducedMotion) return 0;
    return Math.floor(elapsed * 9) % 4;
  }
  function draw(ctx, atlas, { x, y, expression, elapsed, moving, grounded, reducedMotion }) {
    if (!atlas.complete || !atlas.naturalWidth) return;
    const frame = runningFrame(elapsed, moving, grounded, reducedMotion);
    const [sx, sy, sw, sh] = frames[expression][frame];
    const width = sw * scale, height = sh * scale;
    const bob = moving && !reducedMotion && frame % 2 ? -1 : 0;
    // Every frame has its own measured alpha bounds; feet share the physics baseline.
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(atlas, sx, sy, sw, sh, Math.round(x + 24 - width / 2), Math.round(y + 64 - height + bob), width, height);
    ctx.restore();
  }
  return { expressions, frames, pickExpression, runningFrame, draw };
});
