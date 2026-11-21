// The game itself: screens, scoring, timer, hints, combo, magnifier and the
// shot staging used for screenshots. Rendering lives in render.js, input in
// input.js; this file only decides what happens.
import { COMBO_CAP, DIFFS_PER_SCENE, FIND_BASE, HINT_COST, MAX_HINTS, MISS_PENALTY, TIMER_START } from './config.js';
import { SCENES } from './scenes.js';

export const SCREENS = {
  TITLE: 'title',
  PLAY: 'play',
  SCENE_CLEAR: 'sceneClear',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
};

function loadBest() {
  try {
    return Number(window.localStorage.getItem('twin-glasshouse-best') || 0) || 0;
  } catch (e) {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage.setItem('twin-glasshouse-best', String(score));
  } catch (e) { /* private mode: no persistence, the game still plays */ }
}

export class Game {
  constructor(sound) {
    this.sound = sound;
    this.screen = SCREENS.TITLE;
    this.sceneIndex = 0;
    this.found = new Set();
    this.combo = 0;
    this.score = 0;
    this.totalScore = 0;
    this.hintsLeft = MAX_HINTS;
    this.timeLeft = TIMER_START[0];
    this.paused = false;
    this.muted = false;
    this.best = loadBest();
    this.cursor = { x: 324, y: 336, panel: 'left' };
    this.magnifier = false;
    this.hintPulse = null; // { id, until }
    this.floats = []; // { x, y, text, until, color }
    this.missMarks = []; // { x, y, panel, until }
    this.shakeUntil = 0;
    this.now = 0;
    this.lastTickSecond = -1;
    this.shotMode = false; // screenshots: timer frozen, animation time fixed
    this.sceneBonus = 0;
    this.stars = 0;
    this.misses = 0;
    this.hintsUsed = 0;
    this.uiButtons = []; // rebuilt by render.js each frame
    this.message = '';
    this.messageUntil = 0;
  }

  get scene() {
    return SCENES[this.sceneIndex];
  }

  get foundCount() {
    return this.found.size;
  }

  get remaining() {
    return DIFFS_PER_SCENE - this.found.size;
  }

  toTitle() {
    this.screen = SCREENS.TITLE;
    this.sound.stopPad();
    this.sound.startPad();
  }

  startScene(index) {
    this.sceneIndex = index;
    this.found = new Set();
    this.combo = 0;
    this.score = 0;
    this.hintsLeft = MAX_HINTS;
    this.timeLeft = TIMER_START[index];
    this.paused = false;
    this.hintPulse = null;
    this.floats = [];
    this.missMarks = [];
    this.misses = 0;
    this.hintsUsed = 0;
    this.lastTickSecond = -1;
    this.screen = SCREENS.PLAY;
    this.sound.stopPad();
    this.setMessage(`${this.scene.name} — find ${DIFFS_PER_SCENE} differences!`, 3);
  }

  startRun(index) {
    this.totalScore = 0;
    this.startScene(index);
  }

  // A click inside a panel, in scene coordinates (600x500). Returns true
  // when it landed on an unfound difference.
  clickAt(panel, sx, sy) {
    if (this.screen !== SCREENS.PLAY || this.paused) return false;
    this.sound.ensure();
    for (const diff of this.scene.diffs) {
      if (this.found.has(diff.id)) continue;
      const dx = sx - diff.x;
      const dy = sy - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        this.found.add(diff.id);
        this.combo = Math.min(this.combo + 1, COMBO_CAP);
        const points = FIND_BASE * this.combo;
        this.score += points;
        this.totalScore += points;
        this.floats.push({
          x: sx, y: sy - 34, panel, text: `+${points}`, until: this.now + 1.2, color: '#f4c95d',
        });
        this.sound.find();
        if (this.found.size === DIFFS_PER_SCENE) this.clearScene();
        return true;
      }
    }
    // A miss: points off, combo lost, a red mark where the click landed.
    this.combo = 0;
    this.misses += 1;
    this.score = Math.max(0, this.score - MISS_PENALTY);
    this.totalScore = Math.max(0, this.totalScore - MISS_PENALTY);
    this.missMarks.push({ x: sx, y: sy, panel, until: this.now + 0.9 });
    this.shakeUntil = this.now + 0.3;
    this.sound.miss();
    return false;
  }

  useHint() {
    if (this.screen !== SCREENS.PLAY || this.paused) return;
    if (this.hintsLeft <= 0) {
      this.setMessage('No hints left — trust your eyes!', 2);
      return;
    }
    const unfound = this.scene.diffs.filter((d) => !this.found.has(d.id));
    if (unfound.length === 0) return;
    this.hintsLeft -= 1;
    this.hintsUsed += 1;
    this.score = Math.max(0, this.score - HINT_COST);
    this.totalScore = Math.max(0, this.totalScore - HINT_COST);
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    this.hintPulse = { id: pick.id, until: this.now + 3 };
    this.setMessage(`Hint: look near “${pick.name}”…`, 3);
    this.sound.hint();
  }

  clearScene() {
    this.sceneBonus = Math.round(this.timeLeft) * 10 + 250;
    this.score += this.sceneBonus;
    this.totalScore += this.sceneBonus;
    this.stars = this.hintsUsed === 0 && this.misses === 0 ? 3 : this.hintsUsed <= 1 ? 2 : 1;
    if (this.timeLeft < TIMER_START[this.sceneIndex] * 0.25) this.stars = Math.min(this.stars, 2);
    this.sound.fanfare();
    this.screen = this.sceneIndex === SCENES.length - 1 ? SCREENS.VICTORY : SCREENS.SCENE_CLEAR;
    if (this.screen === SCREENS.VICTORY) {
      if (this.totalScore > this.best) {
        this.best = this.totalScore;
        saveBest(this.best);
      }
    }
  }

  nextScene() {
    if (this.sceneIndex < SCENES.length - 1) this.startScene(this.sceneIndex + 1);
  }

  retryScene() {
    this.totalScore = Math.max(0, this.totalScore - this.score);
    this.startScene(this.sceneIndex);
  }

  togglePause() {
    if (this.screen !== SCREENS.PLAY) return;
    this.paused = !this.paused;
  }

  toggleMute() {
    this.muted = !this.muted;
    this.sound.setMuted(this.muted);
  }

  setMessage(text, seconds) {
    this.message = text;
    this.messageUntil = this.now + seconds;
  }

  tick(dt) {
    this.now += dt;
    if (this.screen === SCREENS.PLAY && !this.paused && !this.shotMode) {
      this.timeLeft -= dt;
      const whole = Math.ceil(this.timeLeft);
      if (whole !== this.lastTickSecond) {
        this.lastTickSecond = whole;
        if (whole <= 10 && whole > 0) this.sound.tick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.screen = SCREENS.GAME_OVER;
        this.sound.miss();
      }
    }
    this.floats = this.floats.filter((f) => f.until > this.now);
    this.missMarks = this.missMarks.filter((m) => m.until > this.now);
    if (this.hintPulse && this.hintPulse.until <= this.now) this.hintPulse = null;
  }

  // Screenshot staging: play the real rules forward from a fresh scene and
  // freeze the clock, so the frame is a genuine mid-game render.
  stageShot(name) {
    this.shotMode = true;
    if (name === 'play') {
      this.startRun(0);
      this.applyFinds(0, 3);
      this.timeLeft = 142;
    } else if (name === 'scene2') {
      this.startRun(1);
      this.applyFinds(1, 5);
      this.timeLeft = 87;
    } else if (name === 'scene3') {
      this.startRun(2);
      this.applyFinds(2, 4);
      this.timeLeft = 100;
    } else if (name === 'end') {
      this.startRun(0);
      this.timeLeft = 96;
      this.applyFinds(0, 8);
    } else {
      this.toTitle();
    }
  }

  // Find the first `count` differences by clicking their real centres,
  // alternating panels the way a player would.
  applyFinds(sceneIndex, count) {
    const diffs = SCENES[sceneIndex].diffs;
    for (let i = 0; i < count; i += 1) {
      const d = diffs[i];
      this.clickAt(i % 2 === 0 ? 'left' : 'right', d.x, d.y);
    }
  }
}
