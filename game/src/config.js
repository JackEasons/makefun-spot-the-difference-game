// Shared constants for Twin Glasshouse, a spot-the-difference game.
// One canvas, 1280x720, two 600x500 scene panels side by side.
export const VIEW = { width: 1280, height: 720 };
export const HEADER = { height: 64 };
export const PANEL = { width: 604, height: 504, top: 84, leftX: 24, rightX: 652 };
export const SCENE = { width: 600, height: 500 };
export const FOOTER = { top: 604, height: 108 };

export const TIMER_START = [180, 150, 120]; // seconds per scene, easy to hard
export const DIFFS_PER_SCENE = 8;
export const MAX_HINTS = 3;
export const FIND_BASE = 100;
export const MISS_PENALTY = 25;
export const HINT_COST = 150;
export const COMBO_CAP = 3;

export const COLORS = {
  ink: '#2b2118',
  cream: '#f7ead2',
  parchment: '#f3e3c2',
  gold: '#d9a441',
  goldBright: '#f4c95d',
  teal: '#1e5a55',
  tealDark: '#123f3c',
  coral: '#e2603f',
  leaf: '#4d7c4a',
  skyDay: '#bfe3ec',
  night: '#1d2b4a',
  panelEdge: '#8a6b3f',
  found: '#f4c95d',
  miss: '#e2603f',
};

// A found difference is ringed in gold on both panels; the ring carries its number.
export const MARK = { ring: '#f4c95d', ringWidth: 5, text: '#2b2118', radius: 30 };
