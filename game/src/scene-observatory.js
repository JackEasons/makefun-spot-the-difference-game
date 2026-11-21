// Scene 2 — The Observatory. A star-gazer's attic after midnight: a domed
// window full of stars, a brass telescope, a sleeping cat and a lantern that
// burns low. Eight differences hide among the constellations.
import { disc, ellipse, floorboards, roundRect, shelf, star, wallWash } from './scenes.js';

const DIFFS = [
  { id: 'moon-crater', name: 'Moon crater', x: 352, y: 92, r: 26 },
  { id: 'bright-star', name: 'Bright star', x: 232, y: 92, r: 22 },
  { id: 'telescope-angle', name: 'Telescope angle', x: 300, y: 330, r: 30 },
  { id: 'globe-land', name: 'Globe land', x: 482, y: 382, r: 28 },
  { id: 'lantern-flame', name: 'Lantern flame', x: 92, y: 352, r: 26 },
  { id: 'book-stack', name: 'Book stack', x: 92, y: 432, r: 24 },
  { id: 'cat-tail', name: 'Cat tail', x: 502, y: 432, r: 26 },
  { id: 'comet', name: 'Comet', x: 432, y: 132, r: 26 },
];

function drawSky(ctx, diffs, t) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(180, 300);
  ctx.lineTo(180, 130);
  ctx.arc(300, 130, 120, Math.PI, 0);
  ctx.lineTo(420, 300);
  ctx.closePath();
  ctx.clip();
  const sky = ctx.createLinearGradient(0, 10, 0, 300);
  sky.addColorStop(0, '#0e1a33');
  sky.addColorStop(1, '#2c4a7a');
  ctx.fillStyle = sky;
  ctx.fillRect(170, 0, 260, 310);
  // Fixed star field with a slow twinkle.
  const stars = [
    [210, 70, 2], [250, 50, 1.6], [290, 80, 2.2], [330, 55, 1.5], [380, 75, 2],
    [220, 140, 1.6], [270, 120, 1.4], [310, 160, 2], [360, 140, 1.5], [395, 120, 1.8],
    [240, 200, 1.5], [300, 210, 1.7], [350, 200, 1.4], [390, 190, 1.6], [205, 240, 1.5],
  ];
  stars.forEach(([sx, sy, sr], i) => {
    const tw = 0.6 + 0.4 * Math.sin(t * 2 + i * 1.7);
    ctx.globalAlpha = tw;
    disc(ctx, sx, sy, sr, '#f4e9c8');
  });
  ctx.globalAlpha = 1;
  // The bright star of the little dipper: gone on the right.
  if (!diffs.has('bright-star')) {
    star(ctx, 232, 92, 7, '#ffe9a8');
    ctx.strokeStyle = 'rgba(244,233,200,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(232, 92);
    ctx.lineTo(250, 50);
    ctx.moveTo(232, 92);
    ctx.lineTo(210, 70);
    ctx.moveTo(232, 92);
    ctx.lineTo(270, 120);
    ctx.stroke();
  }
  // Moon: craters only on the left.
  disc(ctx, 352, 92, 26, '#f4ead0');
  disc(ctx, 352, 92, 20, '#f8f1dc');
  if (!diffs.has('moon-crater')) {
    disc(ctx, 344, 84, 5, '#d8cbb0');
    disc(ctx, 360, 98, 4, '#d8cbb0');
    disc(ctx, 356, 80, 3, '#d8cbb0');
  }
  // Comet streaks across only on the left.
  if (!diffs.has('comet')) {
    const cx = 432 + Math.sin(t * 0.2) * 4;
    const cy = 132;
    const g = ctx.createLinearGradient(cx, cy, cx - 60, cy + 26);
    g.addColorStop(0, 'rgba(255,240,200,0.95)');
    g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 60, cy + 26);
    ctx.stroke();
    disc(ctx, cx, cy, 4, '#fff3c8');
  }
  // Distant rooftops.
  ctx.fillStyle = '#101c30';
  ctx.beginPath();
  ctx.moveTo(180, 300);
  ctx.lineTo(180, 262);
  ctx.lineTo(230, 262);
  ctx.lineTo(230, 240);
  ctx.lineTo(280, 240);
  ctx.lineTo(280, 272);
  ctx.lineTo(340, 272);
  ctx.lineTo(340, 248);
  ctx.lineTo(390, 248);
  ctx.lineTo(390, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f7c948';
  [[196, 272], [250, 252], [360, 260]].forEach(([wx, wy]) => {
    ctx.fillRect(wx, wy, 7, 9);
  });
  ctx.restore();
  // Dome frame.
  ctx.strokeStyle = '#5d3f24';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(180, 300);
  ctx.lineTo(180, 130);
  ctx.arc(300, 130, 120, Math.PI, 0);
  ctx.lineTo(420, 300);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 12);
  ctx.lineTo(300, 300);
  ctx.moveTo(180, 200);
  ctx.lineTo(420, 200);
  ctx.stroke();
}

function drawTelescope(ctx, diffs) {
  const up = !diffs.has('telescope-angle'); // left: up-left, right: up-right
  ctx.save();
  ctx.translate(300, 430);
  // Tripod.
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 6;
  [[-46, 66], [0, 70], [46, 66]].forEach(([tx, ty]) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  });
  // Tube.
  ctx.rotate(up ? -0.55 : 0.55);
  ctx.fillStyle = '#b08a2e';
  roundRect(ctx, -14, -150, 28, 150, 10);
  ctx.fill();
  ctx.fillStyle = '#8a6d1f';
  ctx.fillRect(-14, -150, 28, 22);
  ctx.fillStyle = '#d9b45a';
  ctx.beginPath();
  ctx.arc(0, -150, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9fc4d8';
  ctx.beginPath();
  ctx.arc(0, -150, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Eyepiece.
  disc(ctx, 300, 432, 7, '#5d3f24');
}

function drawCat(ctx, diffs, t) {
  const x = 502;
  const y = 448;
  const sway = Math.sin(t * 1.1) * 3;
  ctx.save();
  ctx.translate(x, y);
  // Body, curled asleep on the chair cushion.
  ctx.fillStyle = '#3a3a3a';
  ellipse(ctx, 0, 0, 34, 18, '#3a3a3a');
  ctx.beginPath();
  ctx.arc(-26, -12, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-36, -22);
  ctx.lineTo(-32, -30);
  ctx.lineTo(-28, -22);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-20, -23);
  ctx.lineTo(-16, -31);
  ctx.lineTo(-12, -22);
  ctx.closePath();
  ctx.fill();
  // Tail: curled up on the left, drooping on the right.
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (!diffs.has('cat-tail')) {
    ctx.moveTo(30, 2);
    ctx.quadraticCurveTo(48, -6, 42, -24 + sway);
  } else {
    ctx.moveTo(30, 2);
    ctx.quadraticCurveTo(46, 10, 40, 26);
  }
  ctx.stroke();
  ctx.restore();
}

export const Observatory = {
  id: 'observatory',
  name: 'The Observatory',
  tagline: 'Midnight under the dome, the cat asleep',
  diffs: DIFFS,

  draw(ctx, diffs, t) {
    wallWash(ctx, '#232c4a', '#1a2140');
    floorboards(ctx, 440, '#6b4a2f', '#54371f');
    drawSky(ctx, diffs, t);

    // Star chart poster on the right wall.
    ctx.fillStyle = '#f3e3c2';
    roundRect(ctx, 446, 40, 110, 130, 6);
    ctx.fill();
    ctx.strokeStyle = '#8a6b3f';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#1d2b4a';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('STAR CHART', 501, 62);
    ctx.strokeStyle = '#1d2b4a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(501, 108, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(470, 100);
    ctx.lineTo(500, 88);
    ctx.lineTo(528, 104);
    ctx.lineTo(512, 128);
    ctx.lineTo(486, 126);
    ctx.closePath();
    ctx.stroke();
    [[470, 100], [500, 88], [528, 104], [512, 128], [486, 126]].forEach(([px, py]) => disc(ctx, px, py, 2.5, '#c62f3b'));

    // Desk, left: lantern and a stack of books.
    shelf(ctx, 40, 380, 140);
    const lit = !diffs.has('lantern-flame');
    if (lit) {
      const glow = ctx.createRadialGradient(92, 352, 4, 92, 352, 70);
      glow.addColorStop(0, 'rgba(247,201,72,0.5)');
      glow.addColorStop(1, 'rgba(247,201,72,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(12, 272, 160, 160);
    }
    ctx.fillStyle = '#2e2a26';
    roundRect(ctx, 76, 322, 32, 48, 6);
    ctx.fill();
    ctx.fillStyle = lit ? '#f7c948' : '#8a8578';
    const flick = lit ? Math.sin(t * 7) * 2 : 0;
    ctx.beginPath();
    ctx.ellipse(92, 340 + flick * 0.3, 7, 11 + flick, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2e2a26';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(92, 318, 10, Math.PI, 0);
    ctx.stroke();
    // Book stack: five on the left, four on the right.
    const stack = diffs.has('book-stack') ? 4 : 5;
    const bCols = ['#a63a2e', '#2e5a8a', '#4d7c4a', '#d9a441', '#7a3b8a'];
    for (let i = 0; i < stack; i += 1) {
      ctx.fillStyle = bCols[i];
      ctx.fillRect(56, 424 - i * 11, 76 - i * 4, 10);
    }

    drawTelescope(ctx, diffs);

    // Globe on its stand, right.
    ctx.fillStyle = '#5d3f24';
    ctx.fillRect(476, 424, 12, 22);
    ctx.beginPath();
    ctx.ellipse(482, 448, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    disc(ctx, 482, 382, 34, '#3a6ea6');
    ctx.strokeStyle = '#5d3f24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(482, 382, 34, 0, Math.PI * 2);
    ctx.stroke();
    if (!diffs.has('globe-land')) {
      ctx.fillStyle = '#6a9a58';
      ctx.beginPath();
      ctx.ellipse(474, 372, 14, 10, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(494, 394, 10, 7, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(244,233,200,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(482, 382, 34, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rug and the sleeping cat's chair.
    ellipse(ctx, 300, 472, 120, 14, '#5d3f6e');
    ellipse(ctx, 300, 472, 92, 10, '#8a6bb0');
    ctx.fillStyle = '#6b4423';
    roundRect(ctx, 452, 420, 100, 14, 5);
    ctx.fill();
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(458, 434, 8, 40);
    ctx.fillRect(538, 434, 8, 40);
    drawCat(ctx, diffs, t);
  },
};
