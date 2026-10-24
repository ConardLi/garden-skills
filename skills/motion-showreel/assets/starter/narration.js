// Pure narration event clock for render(t), camera moves and sound cues.
// Sentence timings remain useful on their own. Exact keyword queries require
// genuine ASR word intervals or explicitly annotated anchors; never interpolation.
//
// const clock = narrationClock({duration, segments});
// clock.segment('intro');
// clock.range('intro', 'the result', {occurrence: 2}); // 1-based when repeated
// clock.at('intro', 'the result', {occurrence: 2});    // start, in seconds
// clock.end('intro', 'the result', {occurrence: 2});   // end, in seconds
//
// Optional segment fields:
//   wordTimingSource: 'asr', words: [{text, start, end}, ...]
//   anchors: [{text, start, end, occurrence?: 1}, ...] // explicit manual marks

const EPS = 0.000002;
const ignored = /[\p{P}\p{Z}\s]/u;
const fail = message => { throw new Error(`Narration clock: ${message}`); };

// Punctuation and spacing can differ between the ASR tokenizer and the script.
// Preserve the positions of actual characters so a query still needs true word
// boundaries. Do not normalize spelling, case, numbers, or missing ASR words.
function characters(text) {
  const chars = []; let offset = 0;
  for (const char of text) {
    if (!ignored.test(char)) chars.push({ char, offset });
    offset += char.length;
  }
  return chars;
}
function occurrences(text, term) {
  const result = []; let from = 0;
  while (from <= text.length - term.length) {
    const pos = text.indexOf(term, from);
    if (pos < 0) break;
    result.push(pos); from = pos + 1;
  }
  return result;
}
function chooseOccurrence(text, term, occurrence, context) {
  if (typeof term !== 'string' || !term.length || !characters(term).length) fail(`${context}: keyword must contain spoken text`);
  const found = occurrences(text, term);
  if (!found.length) fail(`${context}: keyword ${JSON.stringify(term)} was not found`);
  if (occurrence === undefined) {
    if (found.length !== 1) fail(`${context}: keyword ${JSON.stringify(term)} is ambiguous (${found.length} occurrences); specify {occurrence: 1..${found.length}}`);
    occurrence = 1;
  }
  if (!Number.isInteger(occurrence) || occurrence < 1 || occurrence > found.length) fail(`${context}: occurrence must be an integer from 1 to ${found.length}`);
  return { occurrence, position: found[occurrence - 1] };
}
function interval(item, segment, context) {
  if (!item || typeof item.text !== 'string' || !item.text.trim() || !Number.isFinite(item.start) || !Number.isFinite(item.end) || item.end <= item.start || item.start < segment.start - EPS || item.end > segment.end + EPS) fail(`${context}: expected text and a positive measured interval inside its segment`);
}

export function narrationClock(narration) {
  if (!narration || !Array.isArray(narration.segments) || !narration.segments.length) fail('expected nonempty segments');
  const byId = new Map(); let previousEnd = 0;
  for (const input of narration.segments) {
    if (!input || typeof input.id !== 'string' || !input.id || byId.has(input.id)) fail('segment ids must be nonempty and unique');
    if (typeof input.text !== 'string' || !input.text.trim() || !Number.isFinite(input.start) || !Number.isFinite(input.end) || input.start < previousEnd - EPS || input.end <= input.start) fail(`${input.id}: expected ordered text segments with positive start/end intervals`);
    const s = { id: input.id, text: input.text, start: input.start, end: input.end };
    previousEnd = input.end;
    const entry = { segment: Object.freeze(s), anchors: [], words: [], chars: characters(s.text) };
    if (input.words !== undefined || input.wordTimingSource !== undefined) {
      if (input.wordTimingSource !== 'asr' || !Array.isArray(input.words) || !input.words.length) fail(`${s.id}: words require wordTimingSource: 'asr' and nonempty measured words`);
      let cursor = 0, last = s.start;
      for (const [i, word] of input.words.entries()) {
        interval(word, s, `${s.id} word ${i + 1}`);
        if (word.start < last - EPS) fail(`${s.id}: ASR word intervals overlap or run backwards`);
        const text = characters(word.text).map(c => c.char).join('');
        if (!text.length) fail(`${s.id}: an ASR word must contain spoken text`);
        const count = [...text].length;
        entry.words.push({ text, start: word.start, end: word.end, first: cursor, after: cursor + count });
        cursor += count; last = word.end;
      }
      if (entry.words.map(w => w.text).join('') !== entry.chars.map(c => c.char).join('')) fail(`${s.id}: ASR words do not exactly cover the script text; correct the transcript or supply manual anchors`);
    }
    if (input.anchors !== undefined) {
      if (!Array.isArray(input.anchors)) fail(`${s.id}: anchors must be an array of explicit manual marks`);
      const keys = new Set();
      for (const [i, anchor] of input.anchors.entries()) {
        interval(anchor, s, `${s.id} anchor ${i + 1}`);
        const hit = chooseOccurrence(s.text, anchor.text, anchor.occurrence, `${s.id} anchor ${i + 1}`);
        const key = JSON.stringify([anchor.text, hit.occurrence]);
        if (keys.has(key)) fail(`${s.id}: duplicate manual anchor for ${JSON.stringify(anchor.text)} occurrence ${hit.occurrence}`);
        keys.add(key);
        entry.anchors.push({ text: anchor.text, start: anchor.start, end: anchor.end, occurrence: hit.occurrence });
      }
    }
    byId.set(s.id, entry);
  }
  const duration = narration.duration === undefined ? previousEnd : narration.duration;
  if (!Number.isFinite(duration) || duration <= 0 || duration < previousEnd - EPS) fail('duration must include every segment');
  const get = id => byId.get(id) || fail(`unknown segment ${JSON.stringify(id)}`);
  const range = (id, keyword, options = {}) => {
    const entry = get(id), s = entry.segment;
    if (!options || typeof options !== 'object' || Array.isArray(options)) fail('query options must be an object such as {occurrence: 2}');
    const hit = chooseOccurrence(s.text, keyword, options.occurrence, s.id);
    const marked = entry.anchors.find(a => a.text === keyword && a.occurrence === hit.occurrence);
    if (marked) return Object.freeze({ segmentId: s.id, text: keyword, occurrence: hit.occurrence, start: marked.start, end: marked.end, source: 'manual-anchor' });
    if (!entry.words.length) fail(`${s.id}: no measured word timing or manual anchor for ${JSON.stringify(keyword)}; sentence duration cannot locate a keyword`);
    const offsets = entry.chars.map((c, i) => ({ ...c, i })).filter(c => c.offset >= hit.position && c.offset < hit.position + keyword.length);
    const first = offsets[0].i, after = offsets.at(-1).i + 1;
    const startWord = entry.words.find(w => w.first === first), endWord = entry.words.find(w => w.after === after);
    if (!startWord || !endWord) fail(`${s.id}: keyword ${JSON.stringify(keyword)} splits an ASR word; provide a manual anchor instead of estimating within the word`);
    return Object.freeze({ segmentId: s.id, text: keyword, occurrence: hit.occurrence, start: startWord.start, end: endWord.end, source: 'asr-words' });
  };
  return Object.freeze({
    duration,
    segment: id => get(id).segment,
    range,
    at: (id, keyword, options) => range(id, keyword, options).start,
    end: (id, keyword, options) => range(id, keyword, options).end,
  });
}
