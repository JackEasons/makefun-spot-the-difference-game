// Mouse and keyboard play. Clicks land on canvas buttons first, then on a
// panel (mapped into 600x500 scene coordinates); arrow keys move the
// crosshair, Enter marks where it stands.
import { PANEL, VIEW } from './config.js';
import { SCREENS } from './game.js';

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (VIEW.width / rect.width),
    y: (event.clientY - rect.top) * (VIEW.height / rect.height),
  };
}

function panelAt(x, y) {
  if (y >= PANEL.top && y <= PANEL.top + PANEL.height) {
    if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) return 'left';
    if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) return 'right';
  }
  return null;
}

function panelScenePoint(panel, x, y) {
  const px = panel === 'left' ? PANEL.leftX : PANEL.rightX;
  return { x: x - (px + 2), y: y - (PANEL.top + 2) };
}

export function attachInput(canvas, game) {
  canvas.addEventListener('mousemove', (event) => {
    const p = canvasPoint(canvas, event);
    game.cursor = { ...p, panel: panelAt(p.x, p.y) || game.cursor.panel };
  });

  canvas.addEventListener('click', (event) => {
    const p = canvasPoint(canvas, event);
    game.cursor = { ...p, panel: panelAt(p.x, p.y) || game.cursor.panel };
    game.sound.ensure();
    // Buttons first.
    for (const b of game.uiButtons) {
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
        handleButton(game, b.id);
        return;
      }
    }
    if (game.screen === SCREENS.PLAY && !game.paused) {
      const panel = panelAt(p.x, p.y);
      if (panel) {
        const s = panelScenePoint(panel, p.x, p.y);
        game.clickAt(panel, s.x, s.y);
      }
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat && !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    const step = event.shiftKey ? 40 : 12;
    switch (event.key) {
      case 'ArrowLeft':
        game.cursor.x = Math.max(0, game.cursor.x - step);
        event.preventDefault();
        break;
      case 'ArrowRight':
        game.cursor.x = Math.min(VIEW.width, game.cursor.x + step);
        event.preventDefault();
        break;
      case 'ArrowUp':
        game.cursor.y = Math.max(0, game.cursor.y - step);
        event.preventDefault();
        break;
      case 'ArrowDown':
        game.cursor.y = Math.min(VIEW.height, game.cursor.y + step);
        event.preventDefault();
        break;
      case 'Enter':
      case ' ': {
        if (game.screen === SCREENS.PLAY && !game.paused) {
          const panel = panelAt(game.cursor.x, game.cursor.y);
          if (panel) {
            const s = panelScenePoint(panel, game.cursor.x, game.cursor.y);
            game.clickAt(panel, s.x, s.y);
          }
        } else if (game.screen === SCREENS.SCENE_CLEAR) {
          game.nextScene();
        }
        event.preventDefault();
        break;
      }
      case 'h':
      case 'H':
        game.useHint();
        break;
      case 'm':
      case 'M':
        game.magnifier = !game.magnifier;
        break;
      case 'p':
      case 'P':
        game.togglePause();
        break;
      case 's':
      case 'S':
        game.toggleMute();
        break;
      case 'n':
      case 'N':
        if (game.screen === SCREENS.SCENE_CLEAR) game.nextScene();
        break;
      case 'r':
      case 'R':
        if (game.screen === SCREENS.GAME_OVER) game.retryScene();
        break;
      case 'Escape':
        if (game.screen === SCREENS.PLAY) game.togglePause();
        else if (game.screen !== SCREENS.TITLE) game.toTitle();
        break;
      default:
        break;
    }
  });
}

function handleButton(game, id) {
  game.sound.ensure();
  game.sound.click();
  if (id.startsWith('scene-')) {
    game.startRun(Number(id.slice('scene-'.length)));
  } else if (id === 'hint') {
    game.useHint();
  } else if (id === 'sound') {
    game.toggleMute();
  } else if (id === 'pause') {
    game.togglePause();
  } else if (id === 'menu') {
    game.toTitle();
  } else if (id === 'next') {
    game.nextScene();
  } else if (id === 'retry') {
    game.retryScene();
  } else if (id === 'again') {
    game.startRun(0);
  }
}
