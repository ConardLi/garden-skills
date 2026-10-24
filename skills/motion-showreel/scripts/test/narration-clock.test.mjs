import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { narrationClock } from '../../assets/starter/narration.js';
import { importNarration, validateSegments } from '../lib/narration.mjs';
import { pcmWav } from '../lib/narration-providers.mjs';

const measured = () => ({ duration: 4, segments: [{
  id: 's1', text: '模型，开始推理。', start: 0.4, end: 3.4, wordTimingSource: 'asr',
  words: [{ text: '模型', start: 0.4, end: 0.9 }, { text: '开始', start: 1.3, end: 1.8 }, { text: '推理', start: 2.6, end: 3.4 }],
}] });

test('sentence-only narration remains usable, but cannot fabricate keyword timing', () => {
  const clock = narrationClock({ segments: [{ id: 'a', text: 'one simple sentence', start: 1, end: 5 }], duration: 6 });
  assert.deepEqual(clock.segment('a'), { id: 'a', text: 'one simple sentence', start: 1, end: 5 });
  assert.equal(clock.duration, 6);
  assert.throws(() => clock.at('a', 'simple'), /no measured word timing/);
  assert.throws(() => clock.segment('missing'), /unknown segment/);
});

test('measured words preserve real gaps and serve identical picture/SFX start/end queries', () => {
  const clock = narrationClock(measured());
  assert.equal(clock.at('s1', '模型'), 0.4);
  assert.equal(clock.end('s1', '模型'), 0.9);
  const range = clock.range('s1', '开始推理');
  assert.equal(range.start, 1.3); assert.equal(range.end, 3.4); assert.equal(range.source, 'asr-words');
  assert.equal(clock.at('s1', '推理'), 2.6, 'do not distribute the sentence duration equally');
  assert.throws(() => clock.at('s1', '型'), /splits an ASR word/);
  assert.throws(() => clock.at('s1', '不存在'), /not found/);
});

test('repeated keywords require an explicit one-based occurrence', () => {
  const clock = narrationClock({ duration: 3, segments: [{ id: 'a', text: '再试，再试。', start: 0, end: 3, wordTimingSource: 'asr', words: [{ text: '再试', start: 0.2, end: 0.7 }, { text: '再试', start: 2.1, end: 2.7 }] }] });
  assert.throws(() => clock.at('a', '再试'), /ambiguous/);
  assert.equal(clock.at('a', '再试', { occurrence: 2 }), 2.1);
  for (const occurrence of [0, 3, 1.5, '2']) assert.throws(() => clock.at('a', '再试', { occurrence }), /occurrence/);
});

test('manual anchors permit precise marked subwords without claiming ASR measurements', () => {
  const clock = narrationClock({ duration: 3, segments: [{ id: 'a', text: 'alpha alpha', start: 0, end: 3, anchors: [{ text: 'alpha', occurrence: 2, start: 1.4, end: 2.2 }, { text: 'pha', occurrence: 1, start: 0.5, end: 0.8 }] }] });
  assert.throws(() => clock.at('a', 'alpha'), /ambiguous/);
  assert.equal(clock.at('a', 'alpha', { occurrence: 2 }), 1.4);
  assert.equal(clock.range('a', 'pha', { occurrence: 1 }).source, 'manual-anchor');
  assert.throws(() => clock.at('a', 'alpha', { occurrence: 1 }), /no measured word timing/);
});

test('word provenance and full text coverage are required; misspelling is not interpolated', () => {
  const noSource = measured(); delete noSource.segments[0].wordTimingSource;
  assert.throws(() => narrationClock(noSource), /wordTimingSource/);
  const mismatch = measured(); mismatch.segments[0].words[1].text = '结束';
  assert.throws(() => narrationClock(mismatch), /do not exactly cover/);
  const missingWord = measured(); missingWord.segments[0].words.splice(1, 1);
  assert.throws(() => narrationClock(missingWord), /do not exactly cover/);
});

test('reject malformed, overlapping, outside-segment and ambiguous duplicate anchor data', () => {
  const backwards = measured(); backwards.segments[0].words[1].start = 0.8;
  assert.throws(() => narrationClock(backwards), /overlap/);
  const outside = measured(); outside.segments[0].words[0].start = 0;
  assert.throws(() => narrationClock(outside), /inside its segment/);
  const anchor = { duration: 2, segments: [{ id: 'a', text: 'x x', start: 0, end: 2, anchors: [{ text: 'x', start: 0.1, end: 0.3 }] }] };
  assert.throws(() => narrationClock(anchor), /ambiguous/);
  anchor.segments[0].anchors = [{ text: 'x', occurrence: 1, start: 0.1, end: 0.3 }, { text: 'x', occurrence: 1, start: 0.4, end: 0.5 }];
  assert.throws(() => narrationClock(anchor), /duplicate manual anchor/);
  assert.throws(() => narrationClock({ ...measured(), duration: 1 }), /duration/);
});

test('Unicode and whitespace tokenization keep measured boundaries without changing spelling', () => {
  const clock = narrationClock({ duration: 2, segments: [{ id: 'u', text: '🧠 Think, clearly!', start: 0, end: 2, wordTimingSource: 'asr', words: [{ text: '🧠', start: 0, end: 0.2 }, { text: 'Think', start: 0.3, end: 0.8 }, { text: 'clearly', start: 1.3, end: 1.9 }] }] });
  assert.equal(clock.at('u', '🧠 Think'), 0); assert.equal(clock.end('u', '🧠 Think'), 0.8);
  assert.equal(clock.at('u', 'clearly'), 1.3);
  assert.throws(() => clock.at('u', 'think'), /not found/);
});

test('validateSegments preserves measured word/anchor fields while keeping sentence JSON compatible', () => {
  const input = measured(); input.segments[0].anchors = [{ text: '模型', start: 0.45, end: 0.85 }];
  const result = validateSegments(input.segments, input.duration);
  assert.deepEqual(result[0].words, input.segments[0].words);
  assert.equal(result[0].wordTimingSource, 'asr'); assert.deepEqual(result[0].anchors, input.segments[0].anchors);
  assert.equal(narrationClock({ duration: 4, segments: result }).at('s1', '模型'), 0.45);
  assert.deepEqual(validateSegments([{ id: 'a', text: 'plain', start: 0, end: 1 }], 1), [{ id: 'a', text: 'plain', start: 0, end: 1 }]);
  const invalid = measured(); invalid.segments[0].words[0].end = 9;
  assert.throws(() => validateSegments(invalid.segments, 4), /inside/);
});

test('clock reads immutable snapshots and does not mutate caller data', () => {
  const input = measured(), before = structuredClone(input), clock = narrationClock(input);
  assert.deepEqual(input, before);
  input.segments[0].words[0].start = 0.8;
  assert.equal(clock.at('s1', '模型'), 0.4);
  assert.throws(() => { clock.segment('s1').start = 12; }, TypeError);
});

test('actual ASR-adapter import retains words and manual anchors in narration.json', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'msr-clock-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const voice = path.join(root, 'voice.wav'), adapter = path.join(root, 'asr.mjs');
  fs.writeFileSync(voice, pcmWav(Buffer.alloc(24000 * 2)));
  const segment = { id: 'a', text: 'real words', start: 0, end: 1, wordTimingSource: 'asr', words: [{ text: 'real', start: 0.05, end: 0.3 }, { text: 'words', start: 0.6, end: 0.9 }], anchors: [{ text: 'real', start: 0.06, end: 0.29 }] };
  // A local deterministic fixture, never a network/ASR/TTS request.
  fs.writeFileSync(adapter, `export async function transcribe() { return ${JSON.stringify({ segments: [segment] })}; }`);
  await importNarration({ root, audio: voice, transcriber: adapter, log: () => {} });
  const saved = JSON.parse(fs.readFileSync(path.join(root, 'audio/narration.json')));
  assert.deepEqual(saved.segments[0].words, segment.words);
  assert.deepEqual(saved.segments[0].anchors, segment.anchors);
  const clock = narrationClock(saved);
  assert.equal(clock.at('a', 'words'), 0.6);
  assert.equal(clock.range('a', 'real').source, 'manual-anchor');
});
