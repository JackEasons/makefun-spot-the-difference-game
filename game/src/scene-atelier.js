// Scene 3 — The Clockmaker's Atelier. Gears on the pegboard, three wall
// clocks that never agree, a cuckoo clock, a bench lamp and a pocket watch
// waiting for its chain. The hardest hunt of the three.
import { disc, ellipse, floorboards, roundRect, wallClock, wallWash } from './scenes.js';

const DIFFS = [
  { id: 'cuckoo-bird', name: 'Cuckoo bird', x: 300, y: 96, r: 26 },
  { id: 'clock-two', name: 'Middle clock', x: 390, y: 62, r: 28 },
  { id: 'gear-colour', name: 'Gear colour', x: 498, y: 198, r: 30 },
  { id: 'lamp-light', name: 'Lamp light', x: 150, y: 358, r: 28 },
  { id: 'hammer', name: 'Hammer', x: 382, y: 420, r: 26 },
  { id: 'watch-chain', name: 'Watch chain', x: 252, y: 420, r: 24 },
  { id: 'rain-drops', name: 'Rain drops', x: 82, y: 152, r: 26 },
  { id: 'oil-can', name: 'Oil can', x: 462, y: 420, r: 26 },
];

function drawGear(ctx, x, y, r, teeth, fill, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < teeth; i += 1) {
    const a = (i / teeth) * Math.PI * 2;
    const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(a2) * (r + 8), Math.sin(a2) * (r + 8));
  }
  ctx.closePath();
  ctx.fill();
  disc(ctx, 0, 0, r * 0.55, '#2b2118');
  disc(ctx, 0, 0, r * 0.2, fill);
  ctx.restore();
}

function drawRainWindow(ctx, diffs, t) {
  ctx.fillStyle = '#20242e';
  roundRect(ctx, 40, 60, 120, 190, 8);
  ctx.fill();
  const sky = ctx.createLinearGradient(0, 60, 0, 250);
  sky.addColorStop(0, '#3a4a63');
  sky.addColorStop(1, '#6a7a94');
  ctx.fillStyle = sky;
  ctx.fillRect(48, 68, 104, 174);
  // Rain drops on the glass: five on the left, three on the right.
  const drops = diffs.has('rain-drops')
    ? [[70, 120], [110, 170], [90, 210]]
    : [[70, 120], [110, 170], [90, 210], [130, 110], [60, 190]];
  ctx.fillStyle = 'rgba(200,220,240,0.75)';
  drops.forEach(([dx, dy], i) => {
    const slide = (t * 14 + i * 22) % 60;
    ctx.beginPath();
    ctx.ellipse(dx, dy + slide * 0.4, 3, 6 + slide * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 60, 120, 190);
  ctx.beginPath();
  ctx.moveTo(100, 60);
  ctx.lineTo(100, 250);
  ctx.moveTo(40, 155);
  ctx.lineTo(160, 155);
  ctx.stroke();
}

function drawCuckoo(ctx, diffs, t) {
  // Little house clock with a bird that pops out on the left only.
  ctx.fillStyle = '#5d3f24';
  ctx.beginPath();
  ctx.moveTo(262, 96);
  ctx.lineTo(300, 58);
  ctx.lineTo(338, 96);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(266, 96, 68, 66);
  disc(ctx, 300, 122, 20, '#fdf6e3');
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(300, 122, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(300, 122);
  ctx.lineTo(300, 108);
  ctx.moveTo(300, 122);
  ctx.lineTo(312, 126);
  ctx.stroke();
  // Pendulum.
  const swing = Math.sin(t * 2.2) * 0.3;
  ctx.strokeStyle = '#8a6b3f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(300, 142);
  ctx.lineTo(300 + Math.sin(swing) * 14, 158);
  ctx.stroke();
  disc(ctx, 300 + Math.sin(swing) * 14, 160, 5, '#d9a441');
  // The bird.
  if (!diffs.has('cuckoo-bird')) {
    ctx.fillStyle = '#c62f3b';
    ctx.beginPath();
    ctx.ellipse(300, 82, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(300, 68, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.moveTo(305, 68);
    ctx.lineTo(312, 70);
    ctx.lineTo(305, 72);
    ctx.closePath();
    ctx.fill();
    disc(ctx, 298, 66, 1.5, '#2b2118');
  } else {
    ctx.fillStyle = '#2b2118';
    ctx.beginPath();
    ctx.arc(300, 76, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const Atelier = {
  id: 'atelier',
  name: 'The Clockmaker’s Atelier',
  tagline: 'Gears, rain and three clocks that disagree',
  diffs: DIFFS,

  draw(ctx, diffs, t) {
    wallWash(ctx, '#e0c193', '#c9a06b');
    floorboards(ctx, 440, '#8a5f3a', '#6b4423');
    drawRainWindow(ctx, diffs, t);

    // Pegboard with tools and gears, right wall.
    ctx.fillStyle = '#a97c50';
    roundRect(ctx, 440, 60, 130, 260, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let gx = 456; gx < 560; gx += 16) {
      for (let gy = 76; gy < 308; gy += 16) {
        ctx.beginPath();
        ctx.arc(gx, gy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // The big gear: gold on the left, steel on the right.
    const gearFill = diffs.has('gear-colour') ? '#8a8f96' : '#d9a441';
    drawGear(ctx, 498, 198, 34, 10, gearFill, t * 0.15);
    drawGear(ctx, 540, 262, 22, 8, '#7a5230', -t * 0.25);
    drawGear(ctx, 462, 268, 16, 8, '#5b7fa6', t * 0.3);

    // Two wall clocks flank the cuckoo clock: the right one reads 10:10 on
    // the left picture and 10:20 on the right.
    wallClock(ctx, 200, 62, 24, [(10 / 12) * Math.PI * 2, (10 / 60) * Math.PI * 2]);
    const mid = diffs.has('clock-two')
      ? [(10.33 / 12) * Math.PI * 2, (20 / 60) * Math.PI * 2]
      : [(10 / 12) * Math.PI * 2, (10 / 60) * Math.PI * 2];
    wallClock(ctx, 390, 62, 24, mid);
    drawCuckoo(ctx, diffs, t);

    // Workbench across the bottom.
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(180, 392, 400, 14);
    ctx.fillStyle = '#54341a';
    ctx.fillRect(196, 406, 12, 40);
    ctx.fillRect(552, 406, 12, 40);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(180, 406, 400, 6);

    // Bench lamp: lit with a cone of light on the left, dark on the right.
    const lit = !diffs.has('lamp-light');
    if (lit) {
      const cone = ctx.createLinearGradient(0, 360, 0, 440);
      cone.addColorStop(0, 'rgba(247,201,72,0.4)');
      cone.addColorStop(1, 'rgba(247,201,72,0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(140, 352);
      ctx.lineTo(164, 352);
      ctx.lineTo(196, 440);
      ctx.lineTo(108, 440);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = '#2e2a26';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(150, 392);
    ctx.lineTo(150, 350);
    ctx.stroke();
    ctx.fillStyle = lit ? '#f7c948' : '#6b6558';
    ctx.beginPath();
    ctx.moveTo(132, 352);
    ctx.lineTo(168, 352);
    ctx.lineTo(158, 332);
    ctx.lineTo(142, 332);
    ctx.closePath();
    ctx.fill();
    disc(ctx, 150, 354, 4, lit ? '#fff3c8' : '#8a8578');

    // Pocket watch with its chain: long on the left, short on the right.
    ctx.strokeStyle = '#8a6d1f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(252, 392);
    const chainLen = diffs.has('watch-chain') ? 10 : 26;
    ctx.lineTo(252, 392 + chainLen);
    ctx.stroke();
    disc(ctx, 252, 392 + chainLen + 14, 15, '#d9b45a');
    disc(ctx, 252, 392 + chainLen + 14, 11, '#fdf6e3');
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(252, 392 + chainLen + 14);
    ctx.lineTo(252, 392 + chainLen + 5);
    ctx.moveTo(252, 392 + chainLen + 14);
    ctx.lineTo(259, 392 + chainLen + 17);
    ctx.stroke();

    // Hammer: present on the left, missing on the right.
    if (!diffs.has('hammer')) {
      ctx.strokeStyle = '#6b4423';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(368, 388);
      ctx.lineTo(396, 428);
      ctx.stroke();
      ctx.fillStyle = '#5d5d5d';
      ctx.save();
      ctx.translate(366, 388);
      ctx.rotate(0.7);
      ctx.fillRect(-16, -7, 32, 14);
      ctx.restore();
    }

    // Oil can: upright on the left, tipped over on the right.
    ctx.save();
    if (diffs.has('oil-can')) {
      ctx.translate(462, 428);
      ctx.rotate(Math.PI / 2.4);
      ctx.translate(-462, -420);
    }
    ctx.fillStyle = '#3a6ea6';
    roundRect(ctx, 448, 398, 28, 26, 5);
    ctx.fill();
    ctx.fillRect(460, 386, 8, 14);
    ctx.strokeStyle = '#3a6ea6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(448, 408);
    ctx.quadraticCurveTo(436, 410, 436, 398);
    ctx.stroke();
    ctx.restore();

    // Loose gears and a spring on the bench.
    drawGear(ctx, 330, 400, 12, 8, '#8a6d1f', t * 0.2);
    ctx.strokeStyle = '#5d5d5d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      ctx.arc(520, 398, 4 + i * 2, Math.PI, 0);
    }
    ctx.stroke();

    // Rug.
    ellipse(ctx, 300, 470, 120, 13, '#2e5a8a');
    ellipse(ctx, 300, 470, 90, 9, '#d9a441');
  },
};
