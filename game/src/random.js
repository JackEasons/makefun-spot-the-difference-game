// A tiny seeded generator (mulberry32) so decorative scatter in a scene is
// identical on every run: the two panels, the screenshots and the grader all
// see the same picture.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick a stable seed per scene so each scene has its own scatter.
export function sceneSeed(index) {
  return 0x9e3779b9 + index * 1013904223;
}
