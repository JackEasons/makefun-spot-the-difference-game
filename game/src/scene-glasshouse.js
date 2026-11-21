// Scene 1 — The Glasshouse. A botanist's greenhouse at golden hour: an arched
// window, shelves of jars and books, potted plants, a watering can and a
// butterfly that will not sit still. Eight differences hide in plain sight.
import { disc, ellipse, floorboards, roundRect, shelf, wallClock, wallWash } from './scenes.js';

const DIFFS = [
  { id: 'sun-rays', name: 'Sun rays', x: 366, y: 82, r: 30 },
  { id: 'butterfly-spots', name: 'Butterfly spots', x: 330, y: 150, r: 26 },
  { id: 'rose-colour', name: 'Rose colour', x: 300, y: 348, r: 24 },
  { id: 'water-drops', name: 'Water drops', x: 285, y: 385, r: 26 },
  { id: 'middle-jar', name: 'Middle jar', x: 98, y: 108, r: 22 },
  { id: 'clock-hands', name: 'Clock hands', x: 522, y: 62, r: 28 },
  { id: 'hanging-leaf', name: 'Hanging leaf', x: 92, y: 72, r: 26 },
  { id: 'shelf-books', name: 'Shelf books', x: 472, y: 218, r: 24 },
];

function drawWindow(ctx, diffs, t) {
  // Arched window with sky, sun, clouds and hills.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(190, 300);
  ctx.lineTo(190, 120);
  ctx.arc(300, 120, 110, Math.PI, 0);
  ctx.lineTo(410, 300);
  ctx.closePath();
  ctx.clip();
  const sky = ctx.createLinearGradient(0, 20, 0, 300);
  sky.addColorStop(0, '#a8d8e8');
  sky.addColorStop(1, '#f6e3ac');
  ctx.fillStyle = sky;
  ctx.fillRect(180, 10, 240, 300);
  // Hills.
  ctx.fillStyle = '#7ba05b';
  ctx.beginPath();
  ctx.moveTo(180, 300);
  ctx.quadraticCurveTo(260, 220, 340, 272);
  ctx.quadraticCurveTo(390, 300, 420, 286);
  ctx.lineTo(420, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5d8448';
  ctx.beginPath();
  ctx.moveTo(180, 300);
  ctx.quadraticCurveTo(280, 252, 420, 292);
  ctx.lineTo(420, 300);
  ctx.closePath();
  ctx.fill();
  // Clouds drift slowly.
  const drift = Math.sin(t * 0.1) * 8;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ellipse(ctx, 250 + drift, 90, 34, 12, 'rgba(255,255,255,0.9)');
  ellipse(ctx, 268 + drift, 84, 24, 10, 'rgba(255,255,255,0.9)');
  ellipse(ctx, 330 - drift, 130, 28, 10, 'rgba(255,255,255,0.85)');
  // Sun: rays only on the left picture.
  const sx = 366;
  const sy = 82;
  if (!diffs.has('sun-rays')) {
    ctx.strokeStyle = '#e8a93c';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2 + t * 0.05;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * 24, sy + Math.sin(a) * 24);
      ctx.lineTo(sx + Math.cos(a) * 33, sy + Math.sin(a) * 33);
      ctx.stroke();
    }
  }
  disc(ctx, sx, sy, 20, '#f7c948');
  disc(ctx, sx, sy, 14, '#f9d976');
  ctx.restore();
  // Frame.
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(190, 300);
  ctx.lineTo(190, 120);
  ctx.arc(300, 120, 110, Math.PI, 0);
  ctx.lineTo(410, 300);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 14);
  ctx.lineTo(300, 300);
  ctx.moveTo(190, 200);
  ctx.lineTo(410, 200);
  ctx.stroke();
}

function drawButterfly(ctx, diffs, t) {
  const x = 330;
  const y = 150 + Math.sin(t * 1.4) * 4;
  const flap = Math.sin(t * 9) * 0.45;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.25);
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side * (1 - flap * 0.4), 1);
    ctx.fillStyle = '#e8862e';
    ctx.beginPath();
    ctx.ellipse(0, -8, 10, 14, side * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 10, 8, 11, -side * 0.4, 0, Math.PI * 2);
    ctx.fill();
    if (!diffs.has('butterfly-spots')) {
      disc(ctx, side * 4, -10, 3, '#2b2118');
      disc(ctx, side * 3, 10, 2.5, '#2b2118');
    }
    ctx.restore();
  }
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(-1.5, -14, 3, 28);
  ctx.restore();
}

function drawHangingPlant(ctx, diffs) {
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(92, 0);
  ctx.lineTo(92, 34);
  ctx.stroke();
  ctx.fillStyle = '#a85f2e';
  ctx.beginPath();
  ctx.moveTo(72, 34);
  ctx.lineTo(112, 34);
  ctx.lineTo(106, 56);
  ctx.lineTo(78, 56);
  ctx.closePath();
  ctx.fill();
  // Five leaves on the left, four on the right.
  const leaves = diffs.has('hanging-leaf') ? 4 : 5;
  ctx.fillStyle = '#4d7c4a';
  for (let i = 0; i < leaves; i += 1) {
    const a = -Math.PI / 2 + (i - 2) * 0.42;
    const lx = 92 + Math.cos(a) * 26;
    const ly = 56 + Math.sin(a) * 26 + 10;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 7, 16, a + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPottedPlant(ctx, x, y, s, leaf, pot) {
  ctx.fillStyle = pot;
  ctx.beginPath();
  ctx.moveTo(x - 16 * s, y);
  ctx.lineTo(x + 16 * s, y);
  ctx.lineTo(x + 12 * s, y + 20 * s);
  ctx.lineTo(x - 12 * s, y + 20 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = leaf;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x + i * 9 * s, y - 14 * s - Math.abs(i) * -2, 6 * s, 16 * s, i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const Glasshouse = {
  id: 'glasshouse',
  name: 'The Glasshouse',
  tagline: 'Golden hour in the botanist’s greenhouse',
  diffs: DIFFS,

  draw(ctx, diffs, t) {
    wallWash(ctx, '#f3dfba', '#e8c795');
    floorboards(ctx, 430, '#a97c50', '#8a5f3a');
    drawWindow(ctx, diffs, t);
    drawHangingPlant(ctx, diffs);

    // Left shelves: jars and a small book row.
    shelf(ctx, 24, 130, 150);
    shelf(ctx, 24, 240, 150);
    const jarCols = ['#c96f4a', '#7ba05b', '#5b7fa6'];
    [58, 98, 138].forEach((jx, i) => {
      if (i === 1 && diffs.has('middle-jar')) return; // the missing jar
      ctx.fillStyle = jarCols[i];
      roundRect(ctx, jx - 13, 96, 26, 34, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(jx - 8, 101, 5, 22);
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(jx - 13, 90, 26, 7);
    });
    // Books on the lower left shelf.
    const bookCols = ['#a63a2e', '#2e5a8a', '#4d7c4a', '#d9a441'];
    bookCols.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(34 + i * 16, 208, 13, 32);
    });

    // Right shelves: potted plants and books (four on the left, three on the right).
    shelf(ctx, 426, 130, 150);
    shelf(ctx, 426, 240, 150);
    drawPottedPlant(ctx, 462, 108, 0.9, '#4d7c4a', '#a85f2e');
    drawPottedPlant(ctx, 522, 108, 1.0, '#6a9a58', '#8a5f3a');
    const shelfBooks = diffs.has('shelf-books') ? 3 : 4;
    const sCols = ['#7a3b8a', '#c96f4a', '#2e5a8a', '#4d7c4a'];
    for (let i = 0; i < shelfBooks; i += 1) {
      ctx.fillStyle = sCols[i];
      ctx.fillRect(442 + i * 17, 206, 14, 34);
    }
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.arc(548, 226, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b2118';
    ctx.beginPath();
    ctx.arc(544, 223, 2, 0, Math.PI * 2);
    ctx.arc(552, 223, 2, 0, Math.PI * 2);
    ctx.fill();

    // Wall clock, top right: 3:00 on the left, 4:30 on the right.
    const hands = diffs.has('clock-hands')
      ? [(4.5 / 12) * Math.PI * 2, (30 / 60) * Math.PI * 2]
      : [(3 / 12) * Math.PI * 2, 0];
    wallClock(ctx, 522, 62, 26, hands);

    // Rug.
    ellipse(ctx, 300, 462, 130, 18, '#a63a2e');
    ellipse(ctx, 300, 462, 104, 13, '#d9a441');
    ellipse(ctx, 300, 462, 76, 9, '#a63a2e');

    // Table with watering can and a rose in a vase.
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(196, 356, 208, 12);
    ctx.fillStyle = '#54341a';
    ctx.fillRect(210, 368, 10, 62);
    ctx.fillRect(380, 368, 10, 62);
    // Watering can.
    ctx.fillStyle = '#5b7fa6';
    roundRect(ctx, 214, 322, 52, 36, 8);
    ctx.fill();
    ctx.fillRect(214, 310, 30, 14);
    ctx.strokeStyle = '#5b7fa6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(266, 330);
    ctx.quadraticCurveTo(288, 330, 288, 352);
    ctx.stroke();
    ctx.fillStyle = '#5b7fa6';
    ctx.beginPath();
    ctx.arc(288, 356, 7, 0, Math.PI * 2);
    ctx.fill();
    // Falling drops only on the left picture.
    if (!diffs.has('water-drops')) {
      ctx.fillStyle = '#7fb3d9';
      const fall = (t * 60) % 34;
      [[284, 368 + fall], [292, 362 + ((fall + 12) % 34)], [278, 372 + ((fall + 24) % 34)]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.ellipse(dx, dy, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    // Vase with a rose: red on the left, pink on the right.
    ctx.strokeStyle = '#4d7c4a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 402);
    ctx.lineTo(300, 356);
    ctx.stroke();
    ctx.fillStyle = '#4d7c4a';
    ctx.beginPath();
    ctx.ellipse(290, 382, 12, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(310, 392, 12, 6, 0.5, 0, Math.PI * 2);
    ctx.fill();
    const rose = diffs.has('rose-colour') ? '#e87aa0' : '#c62f3b';
    disc(ctx, 300, 348, 13, rose);
    disc(ctx, 292, 344, 7, rose);
    disc(ctx, 308, 344, 7, rose);
    disc(ctx, 300, 340, 6, '#e2603f');
    ctx.fillStyle = '#7fb3d9';
    roundRect(ctx, 288, 402, 24, 30, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(292, 407, 4, 20);

    drawButterfly(ctx, diffs, t);
  },
};
