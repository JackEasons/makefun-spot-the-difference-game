// Shared drawing helpers and the scene registry. Every scene draws itself
// into a 600x500 space twice: once plain (left panel) and once with a set of
// differences applied (right panel). A difference is a named branch inside
// the scene's draw function, so the two pictures are near-identical by
// construction and every difference is fair.
import { SCENE } from './config.js';
import { Glasshouse } from './scene-glasshouse.js';
import { Observatory } from './scene-observatory.js';
import { Atelier } from './scene-atelier.js';

export const SCENES = [Glasshouse, Observatory, Atelier];

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function disc(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

// A soft vertical wash for a wall.
export function wallWash(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE.height);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);
}

// Wooden floorboards along the bottom of the scene.
export function floorboards(ctx, y, base, line) {
  ctx.fillStyle = base;
  ctx.fillRect(0, y, SCENE.width, SCENE.height - y);
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const yy = y + 8 + i * ((SCENE.height - y - 8) / 5);
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo(SCENE.width, yy);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  for (let x = 60; x < SCENE.width; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 14, SCENE.height);
    ctx.stroke();
  }
}

// A wooden shelf plank with a soft shadow under it.
export function shelf(ctx, x, y, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x + 4, y + 8, w, 6);
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(x, y, w, 10);
  ctx.fillStyle = '#96683d';
  ctx.fillRect(x, y, w, 4);
}

// A round wall clock; handsAt is [hourAngle, minuteAngle] in radians.
export function wallClock(ctx, x, y, r, handsAt, face) {
  disc(ctx, x, y, r + 4, '#5d3f24');
  disc(ctx, x, y, r, face || '#fdf6e3');
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(a) * (r - 6), y - Math.cos(a) * (r - 6));
    ctx.lineTo(x + Math.sin(a) * (r - 2), y - Math.cos(a) * (r - 2));
    ctx.stroke();
  }
  const [ha, ma] = handsAt;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.sin(ha) * r * 0.5, y - Math.cos(ha) * r * 0.5);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.sin(ma) * r * 0.78, y - Math.cos(ma) * r * 0.78);
  ctx.stroke();
  disc(ctx, x, y, 3, '#2b2118');
}

// Five-point star, used for night skies and rating stars.
export function star(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
