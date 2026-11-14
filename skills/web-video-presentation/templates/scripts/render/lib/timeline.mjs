/**
 * Timeline builder: reads audio-segments.json (the extract-narrations output)
 * and probes each mp3 to build a start/end timeline for subtitles + recording.
 *
 * audio-segments.json shape (see templates/scripts/extract-narrations.ts):
 *   [ { chapter: "intro", step: 1, text: "...", audio: "intro/1.mp3" }, ... ]
 *
 * Audio files live at public/audio/<audio>.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDuration } from './ffmpeg.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// templates/scripts/render/lib/ -> project root = ../../../../..
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

/**
 * Build a timeline from audio-segments.json + real mp3 durations.
 * @returns {Promise<Array<{chapter:string, step:number, start:number, end:number, duration:number, narration:string}>>}
 */
export async function buildTimeline() {
  const segmentsPath = path.join(PROJECT_ROOT, 'audio-segments.json');
  if (!fs.existsSync(segmentsPath)) {
    throw new Error(
      `audio-segments.json not found at ${segmentsPath}\n` +
      `Run \`npm run extract-narrations\` first.`,
    );
  }
  const segments = JSON.parse(fs.readFileSync(segmentsPath, 'utf-8'));
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error('audio-segments.json is empty — no narration segments.');
  }

  const entries = [];
  let cursor = 0;
  for (const seg of segments) {
    const audioPath = path.join(PROJECT_ROOT, 'public', 'audio', seg.audio);
    if (!fs.existsSync(audioPath)) {
      throw new Error(`AUDIO_MISSING: ${audioPath} (segment ${seg.chapter}/${seg.step})`);
    }
    const duration = await getDuration(audioPath);
    entries.push({
      chapter: seg.chapter,
      step: seg.step,
      start: cursor,
      end: cursor + duration,
      duration,
      narration: seg.text,
    });
    cursor += duration;
  }
  return entries;
}
