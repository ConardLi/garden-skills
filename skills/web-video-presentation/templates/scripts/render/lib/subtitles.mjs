/**
 * Subtitle generation: turns the narration timeline into SRT + ASS.
 * No ASR — uses the narration text directly, timed by real mp3 durations.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

function splitNarration(text, opts = {}) {
  const maxChars = opts.maxChars || 16;
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed) return [];
  const chunks = trimmed
    .split(/(?<=[，。！？；、,.!?;:…·])/)
    .map((c) => c.trim())
    .filter(Boolean);
  const result = [];
  let buffer = '';
  const flush = () => { if (buffer) { result.push(buffer); buffer = ''; } };
  for (const chunk of chunks) {
    const pieces = breakLongChunk(chunk, maxChars);
    for (const piece of pieces) {
      if (buffer && buffer.length + piece.length > maxChars) flush();
      buffer = buffer ? buffer + piece : piece;
    }
  }
  flush();
  return result;
}

function breakLongChunk(chunk, maxChars) {
  if (chunk.length <= maxChars) return [chunk];
  const words = chunk.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const pieces = [];
    let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (next.length > maxChars && cur) { pieces.push(cur); cur = w; }
      else cur = next;
    }
    if (cur) pieces.push(cur);
    return pieces;
  }
  const pieces = [];
  let cur = '';
  for (const ch of chunk) {
    if (cur.length >= maxChars) { pieces.push(cur); cur = ''; }
    cur += ch;
  }
  if (cur) pieces.push(cur);
  return pieces;
}

function cueWeight(text) {
  return text.length + (/[，。！？；、,.!?;:…·]$/.test(text.trim()) ? 6 : 0);
}

function allocateDurations(total, weights, minD, maxD) {
  const n = weights.length;
  if (n === 0) return [];
  if (n === 1) return [total];
  const sum = weights.reduce((a, b) => a + Math.max(1e-4, b), 0);
  const out = weights.map((w) => (total * Math.max(1e-4, w)) / sum);
  for (let i = 0; i < n; i++) {
    out[i] = Math.max(Math.min(minD, total / n), Math.min(out[i], Math.max(maxD, total / n)));
  }
  out[n - 1] = total - out.slice(0, -1).reduce((a, b) => a + b, 0);
  return out;
}

/**
 * @param {Array<{start:number,end:number,duration:number,narration:string}>} timeline
 */
export function generateCues(timeline, opts = {}) {
  const maxChars = opts.maxChars || 16;
  const minD = opts.minDuration || 0.6;
  const maxD = opts.maxDuration || 6;
  const cues = [];
  let idx = 1;
  for (const entry of timeline) {
    const lines = splitNarration(entry.narration, { maxChars });
    if (!lines.length) continue;
    const weights = lines.map(cueWeight);
    const durs = allocateDurations(entry.duration, weights, minD, maxD);
    let cursor = entry.start;
    for (let i = 0; i < lines.length; i++) {
      const end = i === lines.length - 1 ? entry.end : Math.min(cursor + durs[i], entry.end);
      if (end > cursor + 0.05) cues.push({ index: idx++, start: cursor, end, text: lines[i] });
      cursor = end;
    }
  }
  return cues;
}

function fmtSrt(s) {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
}

function fmtAss(s) {
  const cs = Math.round(s * 100);
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const sec = Math.floor((cs % 6000) / 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
}

function writeSrt(cues, out) {
  fs.writeFileSync(out, cues.map((c) => `${c.index}\n${fmtSrt(c.start)} --> ${fmtSrt(c.end)}\n${c.text}\n`).join('\n'), 'utf-8');
}

function escapeAss(t) {
  return t.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\n/g, '\\N');
}

function writeAss(cues, out) {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans SC,42,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,80,80,120,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const events = cues.map((c) => `Dialogue: 0,${fmtAss(c.start)},${fmtAss(c.end)},Default,,0,0,0,,${escapeAss(c.text)}`);
  fs.writeFileSync(out, header + events.join('\n') + '\n', 'utf-8');
}

export function generateSubtitleFiles(timeline, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const cues = generateCues(timeline);
  const srt = path.join(outDir, 'subtitles.srt');
  const ass = path.join(outDir, 'subtitles.ass');
  writeSrt(cues, srt);
  writeAss(cues, ass);
  return { cues, srt, ass };
}
