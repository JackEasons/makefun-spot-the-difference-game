// Screenshot scenes behind ?shot=start|play|scene2|end, following the kit's
// starter pattern: each one plays the real rules forward from a fresh scene
// (a fixed number of genuine clicks through the same handler a player uses)
// and then freezes the clock, so the frame is what the game really looks
// like at that moment, with the same seed every time.
export function stageShotFromQuery(game) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  game.stageShot(shot);
  return true;
}

export const SHOTS = [
  { name: '1-play.jpg', query: '?shot=play&seed=1' },
  { name: '2-start.jpg', query: '?shot=start&seed=1' },
  { name: '3-scene2.jpg', query: '?shot=scene2&seed=1' },
  { name: '4-complete.jpg', query: '?shot=end&seed=1' },
];
