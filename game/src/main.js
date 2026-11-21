// Bootstrap: a 2x backing store for crisp text, the animation loop, and the
// ?shot= staging for screenshots. Animation time freezes in shot mode so a
// screenshot is the same frame every time.
import { VIEW } from './config.js';
import { Game } from './game.js';
import { SoundEngine } from './audio.js';
import { attachInput } from './input.js';
import { render } from './render.js';
import { stageShotFromQuery } from './shots.js';

const canvas = document.getElementById('game');
const SCALE = 2;
canvas.width = VIEW.width * SCALE;
canvas.height = VIEW.height * SCALE;
const ctx = canvas.getContext('2d');
ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

const sound = new SoundEngine();
const game = new Game(sound);
attachInput(canvas, game);

const isShot = stageShotFromQuery(game);
const FROZEN_T = 1.6;
let last = performance.now();
let t = 0;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  game.tick(dt);
  if (!isShot) t += dt;
  else t = FROZEN_T;
  render(ctx, game, t);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
