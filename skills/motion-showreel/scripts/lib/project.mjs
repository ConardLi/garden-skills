// Read a project's shared clock (timeline.js) from Node, so the QA tools know what was *intended*:
//   DUR    seconds
//   BEAT   seconds per beat
//   HOLDS  [[t0, t1], …]  deliberate still moments (end card, a held breath): not reported as dead air
//   DROPS  [t, …]         hits that should follow a breath of silence (audio check measures the dip before each)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** The timeline for a file inside a project: <proj>/out/x.mp4 or <proj>/audio/x.wav → <proj>/timeline.js.
 *  `explicit` = a --timeline value: a path, or 'none' to switch the lookup off. */
export function findTimeline(media, explicit) {
  if (explicit === 'none' || explicit === false) return null;
  if (typeof explicit === 'string') return path.resolve(explicit);
  const f = path.join(path.dirname(path.resolve(media)), '..', 'timeline.js');
  return fs.existsSync(f) ? f : null;
}

/** Import timeline.js → { file, DUR, BEAT, HOLDS, DROPS } (normalised), or null when there is none.
 *  Never throws: a timeline that fails to import is reported as { file, error }. */
export async function loadTimeline(file) {
  if (!file) return null;
  if (!fs.existsSync(file)) return { file, error: 'not found' };
  let m;
  try { m = await import(pathToFileURL(file).href); }
  catch (e1) {
    // a project without "type": "module" in package.json: evaluate the source as a module anyway (timeline.js has no imports)
    try { m = await import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(file, 'utf8')).toString('base64')); }
    catch { return { file, error: String(e1.message || e1).split('\n')[0] }; }
  }
  const num = v => (Number.isFinite(+v) ? +v : null);
  const holds = (Array.isArray(m.HOLDS) ? m.HOLDS : [])
    .map(h => (Array.isArray(h) ? [num(h[0]), num(h[1])] : [num(h?.t0), num(h?.t1)]))
    .filter(([a, b]) => a != null && b != null && b > a);
  const drops = (Array.isArray(m.DROPS) ? m.DROPS : []).map(num).filter(v => v != null);
  return { file, DUR: num(m.DUR), BEAT: num(m.BEAT), HOLDS: holds, DROPS: drops, hasHolds: Array.isArray(m.HOLDS), hasDrops: Array.isArray(m.DROPS) };
}

/** A timeline only describes a video of the same length (a --start/--duration segment is on a different clock). */
export const sameClock = (tl, dur) => !!tl && !tl.error && tl.DUR != null && Math.abs(tl.DUR - dur) < 0.1;
