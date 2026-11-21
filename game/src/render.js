// Everything the player sees: header, the two panels with their markers,
// footer buttons, and the title / clear / over / victory screens. Panels are
// rendered to offscreen canvases first, so the magnifier can zoom them.
import { COLORS, FOOTER, HEADER, MARK, PANEL, SCENE, TIMER_START, VIEW } from './config.js';
import { SCENES } from './scenes.js';
import { SCREENS } from './game.js';
import { roundRect, star } from './scenes.js';

const leftCanvas = document.createElement('canvas');
leftCanvas.width = SCENE.width;
leftCanvas.height = SCENE.height;
const rightCanvas = document.createElement('canvas');
rightCanvas.width = SCENE.width;
rightCanvas.height = SCENE.height;

function panelRect(panel) {
  return {
    x: panel === 'left' ? PANEL.leftX : PANEL.rightX,
    y: PANEL.top,
    w: PANEL.width,
    h: PANEL.height,
  };
}

function sceneToCanvas(panel, sx, sy) {
  const r = panelRect(panel);
  return { x: r.x + 2 + sx, y: r.y + 2 + sy };
}

function drawPanels(ctx, game, t) {
  const leftCtx = leftCanvas.getContext('2d');
  const rightCtx = rightCanvas.getContext('2d');
  const diffsRight = new Set(game.scene.diffs.map((d) => d.id));
  game.scene.draw(leftCtx, new Set(), t);
  game.scene.draw(rightCtx, diffsRight, t);
  const shake = game.now < game.shakeUntil ? Math.sin(game.now * 90) * 4 : 0;
  for (const [panel, off] of [['left', leftCanvas], ['right', rightCanvas]]) {
    const r = panelRect(panel);
    ctx.save();
    ctx.translate(shake, 0);
    ctx.fillStyle = '#0e0a05';
    ctx.fillRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4);
    ctx.drawImage(off, r.x + 2, r.y + 2);
    ctx.strokeStyle = COLORS.panelEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.restore();
  }
}

function drawMarkers(ctx, game) {
  game.scene.diffs.forEach((diff, i) => {
    if (!game.found.has(diff.id)) return;
    for (const panel of ['left', 'right']) {
      const p = sceneToCanvas(panel, diff.x, diff.y);
      ctx.save();
      ctx.strokeStyle = MARK.ring;
      ctx.lineWidth = MARK.ringWidth;
      ctx.beginPath();
      ctx.arc(p.x, p.y, MARK.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(244,201,93,0.25)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, MARK.radius - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = MARK.text;
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), p.x, p.y + 1);
      ctx.restore();
    }
  });
  // Miss marks: fading red crosses where a click found nothing.
  for (const m of game.missMarks) {
    const p = sceneToCanvas(m.panel, m.x, m.y);
    const alpha = Math.max(0, (m.until - game.now) / 0.9);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = COLORS.miss;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(p.x - 12, p.y - 12);
    ctx.lineTo(p.x + 12, p.y + 12);
    ctx.moveTo(p.x + 12, p.y - 12);
    ctx.lineTo(p.x - 12, p.y + 12);
    ctx.stroke();
    ctx.restore();
  }
  // Hint pulse: a breathing ring around one unfound difference, both panels.
  if (game.hintPulse) {
    const diff = game.scene.diffs.find((d) => d.id === game.hintPulse.id);
    if (diff) {
      const pulse = 26 + Math.sin(game.now * 6) * 6;
      for (const panel of ['left', 'right']) {
        const p = sceneToCanvas(panel, diff.x, diff.y);
        ctx.save();
        ctx.strokeStyle = '#f7c948';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function drawCursor(ctx, game) {
  if (game.screen !== SCREENS.PLAY || game.paused) return;
  const c = game.cursor;
  ctx.save();
  ctx.strokeStyle = COLORS.goldBright;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(c.x - 20, c.y);
  ctx.lineTo(c.x - 8, c.y);
  ctx.moveTo(c.x + 8, c.y);
  ctx.lineTo(c.x + 20, c.y);
  ctx.moveTo(c.x, c.y - 20);
  ctx.lineTo(c.x, c.y - 8);
  ctx.moveTo(c.x, c.y + 8);
  ctx.lineTo(c.x, c.y + 20);
  ctx.stroke();
  ctx.restore();
}

function drawMagnifier(ctx, game) {
  if (!game.magnifier || game.screen !== SCREENS.PLAY || game.paused) return;
  const c = game.cursor;
  const panel = c.x < VIEW.width / 2 ? 'left' : 'right';
  const r = panelRect(panel);
  if (c.x < r.x || c.x > r.x + r.w || c.y < r.y || c.y > r.y + r.h) return;
  const off = panel === 'left' ? leftCanvas : rightCanvas;
  const sx = c.x - (r.x + 2);
  const sy = c.y - (r.y + 2);
  const R = 85;
  const zoom = 2;
  const half = R / zoom;
  ctx.save();
  ctx.beginPath();
  ctx.arc(c.x, c.y, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(off, sx - half, sy - half, half * 2, half * 2, c.x - R, c.y - R, R * 2, R * 2);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = COLORS.goldBright;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(c.x, c.y, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(c.x - R, c.y);
  ctx.lineTo(c.x + R, c.y);
  ctx.moveTo(c.x, c.y - R);
  ctx.lineTo(c.x, c.y + R);
  ctx.stroke();
  ctx.restore();
}

function drawHeader(ctx, game) {
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(0, 0, VIEW.width, HEADER.height);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, HEADER.height - 3, VIEW.width, 3);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('TWIN GLASSHOUSE', 24, 32);
  ctx.font = 'italic 14px Georgia, serif';
  ctx.fillStyle = '#cbb98a';
  ctx.fillText('Spot the Difference', 24, 52);

  // Centre: scene name and the found counter with pips.
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText(game.scene.name.toUpperCase(), VIEW.width / 2, 26);
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillStyle = COLORS.goldBright;
  ctx.fillText(`FOUND ${game.foundCount} / ${game.scene.diffs.length}`, VIEW.width / 2, 52);

  // Right: timer bar, score, combo, hints.
  const tx = VIEW.width - 300;
  const total = TIMER_START[game.sceneIndex];
  const frac = Math.max(0, game.timeLeft / total);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#cbb98a';
  ctx.font = '13px Georgia, serif';
  ctx.fillText('TIME', tx, 22);
  ctx.fillStyle = 'rgba(247,234,210,0.2)';
  roundRect(ctx, tx + 46, 10, 150, 14, 7);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#7ba05b' : frac > 0.25 ? COLORS.gold : COLORS.coral;
  if (frac > 0) {
    roundRect(ctx, tx + 46, 10, 150 * frac, 14, 7);
    ctx.fill();
  }
  const mm = Math.floor(Math.max(0, game.timeLeft) / 60);
  const ss = Math.floor(Math.max(0, game.timeLeft) % 60);
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(`${mm}:${String(ss).padStart(2, '0')}`, tx + 204, 23);
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillStyle = COLORS.goldBright;
  ctx.fillText(`SCORE ${game.totalScore}`, tx, 52);
  ctx.fillStyle = '#cbb98a';
  ctx.font = '13px Georgia, serif';
  ctx.fillText(`HINTS ${game.hintsLeft}`, tx + 125, 52);
  if (game.combo > 1) {
    ctx.fillStyle = COLORS.coral;
    ctx.font = 'bold 17px Georgia, serif';
    ctx.fillText(`COMBO ×${game.combo}`, tx + 195, 52);
  }
}

function drawButton(ctx, b, active) {
  ctx.save();
  ctx.fillStyle = active ? '#8a6d1f' : '#2c4a44';
  roundRect(ctx, b.x, b.y, b.w, b.h, 8);
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
  ctx.restore();
}

function drawFooter(ctx, game) {
  ctx.textBaseline = 'alphabetic';
  const buttons = [
    { id: 'hint', label: `Hint  (H)  −${150}`, x: 24, y: 624, w: 170, h: 44 },
    { id: 'sound', label: game.muted ? 'Sound: Off  (S)' : 'Sound: On  (S)', x: 206, y: 624, w: 170, h: 44 },
    { id: 'pause', label: game.paused ? 'Resume  (P)' : 'Pause  (P)', x: 388, y: 624, w: 150, h: 44 },
    { id: 'menu', label: 'Menu', x: 550, y: 624, w: 110, h: 44 },
  ];
  game.uiButtons = buttons;
  for (const b of buttons) drawButton(ctx, b, b.id === 'hint' && game.hintsLeft === 0);

  // Scene progress dots, right side.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#cbb98a';
  ctx.font = '14px Georgia, serif';
  ctx.fillText(`SCENE ${game.sceneIndex + 1} OF ${SCENES.length}`, VIEW.width - 24, 640);
  SCENES.forEach((s, i) => {
    const px = VIEW.width - 24 - (SCENES.length - 1 - i) * 22;
    ctx.fillStyle = i < game.sceneIndex ? COLORS.goldBright : i === game.sceneIndex ? COLORS.cream : 'rgba(247,234,210,0.25)';
    ctx.beginPath();
    ctx.arc(px, 660, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  // Toast message.
  if (game.now < game.messageUntil && game.message) {
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.cream;
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText(game.message, VIEW.width / 2, 700);
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(203,185,138,0.8)';
    ctx.font = '13px Georgia, serif';
    ctx.fillText('Click a difference on either picture  ·  Arrow keys + Enter work too  ·  M magnifier', VIEW.width / 2, 700);
  }
  // Floating score text, in canvas coordinates per panel.
  for (const f of game.floats) {
    const p = sceneToCanvas(f.panel, f.x, f.y - (1.2 - (f.until - game.now)) * 24);
    ctx.save();
    ctx.globalAlpha = Math.min(1, (f.until - game.now) / 0.6);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, p.x, p.y);
    ctx.restore();
  }
}

function drawPanelLabels(ctx, game) {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#cbb98a';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText('◀  LEFT PICTURE', PANEL.leftX, 78);
  ctx.textAlign = 'right';
  ctx.fillText('RIGHT PICTURE  ▶', PANEL.rightX + PANEL.width, 78);
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(14,10,5,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function card(ctx, x, y, w, h) {
  ctx.fillStyle = '#f7ead2';
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawTitle(ctx, game, t) {
  // The first scene glows faintly behind the title card.
  const leftCtx = leftCanvas.getContext('2d');
  const rightCtx = rightCanvas.getContext('2d');
  SCENES[0].draw(leftCtx, new Set(), t);
  SCENES[0].draw(rightCtx, new Set(SCENES[0].diffs.map((d) => d.id)), t);
  ctx.drawImage(leftCanvas, PANEL.leftX + 2, PANEL.top + 2);
  ctx.drawImage(rightCanvas, PANEL.rightX + 2, PANEL.top + 2);
  dim(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.goldBright;
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText('TWIN GLASSHOUSE', VIEW.width / 2, 130);
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillText('A spot-the-difference hunt in three hand-painted rooms', VIEW.width / 2, 168);
  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = '#cbb98a';
  ctx.fillText('Two pictures side by side. Eight differences hiding in each. Find them all before the clock runs out.', VIEW.width / 2, 198);

  const cards = SCENES.map((s, i) => ({
    id: `scene-${i}`,
    x: 90 + i * 380,
    y: 250,
    w: 340,
    h: 210,
    label: s.name,
  }));
  game.uiButtons = cards;
  cards.forEach((c, i) => {
    const s = SCENES[i];
    card(ctx, c.x, c.y, c.w, c.h);
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(s.name, c.x + c.w / 2, c.y + 52);
    ctx.font = 'italic 15px Georgia, serif';
    ctx.fillStyle = '#6b5a3a';
    ctx.fillText(s.tagline, c.x + c.w / 2, c.y + 82);
    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = COLORS.ink;
    const mm = Math.floor(TIMER_START[i] / 60);
    const ss = TIMER_START[i] % 60;
    ctx.fillText(`8 differences  ·  ${mm}:${String(ss).padStart(2, '0')}`, c.x + c.w / 2, c.y + 118);
    ctx.fillStyle = COLORS.teal;
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText('▶  PLAY THIS ROOM', c.x + c.w / 2, c.y + 164);
  });
  ctx.fillStyle = '#cbb98a';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Click a room to begin  ·  Click a difference on either picture  ·  H hint (−150)  ·  M magnifier  ·  P pause', VIEW.width / 2, 520);
  ctx.fillText(`Best total score: ${game.best}`, VIEW.width / 2, 548);
  ctx.font = 'italic 13px Georgia, serif';
  ctx.fillText('An original game — every scene drawn in code, no borrowed art.', VIEW.width / 2, 580);
}

function drawSceneClear(ctx, game) {
  dim(ctx);
  const w = 560;
  const h = 380;
  const x = (VIEW.width - w) / 2;
  const y = 150;
  card(ctx, x, y, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText('Scene Complete!', VIEW.width / 2, y + 62);
  for (let i = 0; i < 3; i += 1) {
    star(ctx, VIEW.width / 2 + (i - 1) * 64, y + 118, 24, i < game.stars ? COLORS.gold : '#d8cbb0');
  }
  ctx.font = '17px Georgia, serif';
  ctx.fillStyle = '#4a3a22';
  ctx.fillText(`All 8 differences found in ${game.scene.name}`, VIEW.width / 2, y + 172);
  ctx.fillText(`Scene score ${game.score}  ·  time bonus +${game.sceneBonus}`, VIEW.width / 2, y + 204);
  ctx.fillText(`Total score ${game.totalScore}`, VIEW.width / 2, y + 236);
  const b = { id: 'next', label: 'Next Scene  →', x: VIEW.width / 2 - 110, y: y + 268, w: 220, h: 48 };
  game.uiButtons = [b];
  drawButton(ctx, b, false);
}

function drawGameOver(ctx, game) {
  dim(ctx);
  const w = 560;
  const h = 340;
  const x = (VIEW.width - w) / 2;
  const y = 170;
  card(ctx, x, y, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText('Time’s Up!', VIEW.width / 2, y + 62);
  ctx.font = '17px Georgia, serif';
  ctx.fillStyle = '#4a3a22';
  ctx.fillText(`You found ${game.foundCount} of ${game.scene.diffs.length} differences in ${game.scene.name}.`, VIEW.width / 2, y + 112);
  ctx.fillText('The missing ones were there all along — look again.', VIEW.width / 2, y + 142);
  const buttons = [
    { id: 'retry', label: 'Try Again', x: VIEW.width / 2 - 230, y: y + 200, w: 210, h: 48 },
    { id: 'menu', label: 'Menu', x: VIEW.width / 2 + 20, y: y + 200, w: 210, h: 48 },
  ];
  game.uiButtons = buttons;
  for (const b of buttons) drawButton(ctx, b, false);
}

function drawVictory(ctx, game) {
  dim(ctx);
  const w = 620;
  const h = 400;
  const x = (VIEW.width - w) / 2;
  const y = 140;
  card(ctx, x, y, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText('You Found Them All!', VIEW.width / 2, y + 64);
  for (let i = 0; i < 3; i += 1) {
    star(ctx, VIEW.width / 2 + (i - 1) * 64, y + 118, 24, COLORS.gold);
  }
  ctx.font = '18px Georgia, serif';
  ctx.fillStyle = '#4a3a22';
  ctx.fillText('24 differences across three rooms — every last one.', VIEW.width / 2, y + 172);
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillStyle = COLORS.teal;
  ctx.fillText(`Total score ${game.totalScore}`, VIEW.width / 2, y + 214);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#4a3a22';
  ctx.fillText(`Best total score ${game.best}`, VIEW.width / 2, y + 246);
  const buttons = [
    { id: 'again', label: 'Play Again', x: VIEW.width / 2 - 230, y: y + 292, w: 210, h: 48 },
    { id: 'menu', label: 'Menu', x: VIEW.width / 2 + 20, y: y + 292, w: 210, h: 48 },
  ];
  game.uiButtons = buttons;
  for (const b of buttons) drawButton(ctx, b, false);
}

export function render(ctx, game, t) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#171208';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  if (game.screen === SCREENS.TITLE) {
    drawTitle(ctx, game, t);
    return;
  }
  drawHeader(ctx, game);
  drawPanelLabels(ctx, game);
  drawPanels(ctx, game, t);
  drawMarkers(ctx, game);
  drawCursor(ctx, game);
  drawMagnifier(ctx, game);
  drawFooter(ctx, game);
  if (game.screen === SCREENS.SCENE_CLEAR) drawSceneClear(ctx, game);
  else if (game.screen === SCREENS.GAME_OVER) drawGameOver(ctx, game);
  else if (game.screen === SCREENS.VICTORY) drawVictory(ctx, game);
  else if (game.paused) {
    dim(ctx);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.cream;
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('Paused', VIEW.width / 2, VIEW.height / 2);
    ctx.font = '17px Georgia, serif';
    ctx.fillText('Press P or click Resume to carry on.', VIEW.width / 2, VIEW.height / 2 + 40);
  }
}
