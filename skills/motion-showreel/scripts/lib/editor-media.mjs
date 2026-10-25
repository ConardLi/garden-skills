import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { digest, localFile, isOriginalSession, sessionKey, validateSession, atomicJSON } from './editor-model.mjs';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const q = n => String(+n.toFixed(6));
export function runProcess(command, argv, job, { binary = false, maxBytes = 16 * 1024 * 1024, stdoutFile = null } = {}) {
  if (job.cancelled) return Promise.reject(new Error('任务已取消'));
  return new Promise((resolve, reject) => {
    if (stdoutFile) fs.writeFileSync(stdoutFile, '');
    const child = spawn(command, argv, { detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    job.child = child;
    let chunks = [], bytes = 0, stderr = '', stdout = '', settled = false;
    const done = (error, data) => { if (settled) return; settled = true; if (job.child === child) job.child = null; error ? reject(error) : resolve(data); };
    child.stdout.on('data', b => {
      if (stdoutFile && !settled) {
        try { fs.appendFileSync(stdoutFile, b); }
        catch (error) { stopProcess(child); return done(error); }
      }
      if (binary) { bytes += b.length; if (bytes > maxBytes) { stopProcess(child); return done(new Error('Media output exceeded its limit')); } chunks.push(b); }
      else { stdout = (stdout + b.toString()).slice(-16000); job.log = (job.log + b.toString()).slice(-32000); }
    });
    child.stderr.on('data', b => { stderr = (stderr + b.toString()).slice(-12000); if (!binary) job.log = (job.log + b.toString()).slice(-32000); });
    child.once('error', error => done(error));
    child.once('close', code => {
      if (job.cancelled) done(new Error('任务已取消'));
      else if (code !== 0) done(new Error(`${path.basename(command)} failed (${code}): ${stderr.slice(-2000) || stdout.slice(-1000)}`));
      else done(null, binary ? Buffer.concat(chunks) : stdout);
    });
  });
}
export function stopProcess(child) {
  if (!child) return;
  try { process.platform === 'win32' ? child.kill('SIGTERM') : process.kill(-child.pid, 'SIGTERM'); } catch {}
}
export function newJob(type) { return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, status: 'running', phase: '准备', progress: 0, log: '', child: null, cancelled: false, result: null, error: null }; }

export async function waveform(root, track) {
  const file = localFile(root, track.file), stat = fs.statSync(file);
  const key = digest(JSON.stringify(['peak-envelope-v2', track.file, stat.size, stat.mtimeMs]));
  const cache = path.join(root, '.showreel-editor', 'waves', `${key}.json`);
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache));
  const job = newJob('waveform');
  // Measure peaks before reducing to display bins. Downsampling the audio itself
  // would filter out treble and incorrectly draw high-frequency SFX as silence.
  const data = await runProcess('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-map', '0:a:0', '-af', 'aresample=48000,asetnsamples=n=2400:p=1,astats=metadata=1:reset=1,ametadata=mode=print:key=lavfi.astats.Overall.Peak_level:file=-', '-f', 'null', '-'], job, { binary: true });
  const peaks = [...data.toString().matchAll(/lavfi\.astats\.Overall\.Peak_level=([-\d.inf]+)/g)].map(m => Number.isFinite(+m[1]) ? +(10 ** (+m[1] / 20)).toFixed(5) : 0);
  const result = { duration: track.sourceDuration, interval: 0.05, peaks };
  atomicJSON(cache, result); return result;
}

export async function prepareEditorAudio(root, project, input, job) {
  const session = validateSession(input, project);
  if (isOriginalSession(session, project) && project.originalAudio) return { file: project.originalAudio, original: true, key: sessionKey(session, project) };
  if (!session.tracks.some(t => !t.mute && t.gain > 0 && t.clips.some(c => c.gain > 0))) return { file: null, original: false, key: sessionKey(session, project) };
  const key = sessionKey(session, project), relative = `.showreel-editor/audio/${key}.wav`, out = path.join(root, relative);
  if (fs.existsSync(out)) return { file: relative, original: false, key };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const tmp = `${out}.${job.id}.tmp.wav`, args = [], filters = [], labels = [];
  try {
    let sourceIndex = 0;
    for (const track of session.tracks) {
      if (track.mute || track.gain === 0) continue;
      // One decoder per source, then asplit: splitting a long track doesn't open it 256 times.
      const active = track.clips.filter(c => c.gain > 0);
      if (!active.length) continue;
      const index = sourceIndex++; args.push('-i', localFile(root, track.file));
      filters.push(`[${index}:a:0]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,asplit=${active.length}${active.map((_, i) => `[s${index}_${i}]`).join('')}`);
      for (const [i, c] of active.entries()) {
        const label = `c${index}_${i}`;
        let f = `[s${index}_${i}]atrim=start=${q(c.in)}:duration=${q(c.duration)},asetpts=PTS-STARTPTS,volume=${q(track.gain * c.gain)}`;
        if (c.fadeIn) f += `,afade=t=in:st=0:d=${q(c.fadeIn)}`;
        if (c.fadeOut) f += `,afade=t=out:st=${q(c.duration - c.fadeOut)}:d=${q(c.fadeOut)}`;
        // Rebuild PTS from emitted samples after padding. Some ffmpeg versions
        // emit NOPTS on adelay's leading silence after a mid-packet atrim.
        f += `,adelay=${q(c.start * 1000)}:all=1,asetpts=N/SR/TB,apad,atrim=duration=${q(project.duration)}`;
        if (['bgm', 'sfx'].includes(track.kind) && project.duckDb < 0 && project.intervals.length) {
          const mask = project.intervals.map(v => `between(t,${q(v.start)},${q(v.end)})`).join('+');
          f += `,volume='if(gt(${mask},0),${q(10 ** (project.duckDb / 20))},1)':eval=frame`;
        }
        filters.push(`${f}[${label}]`); labels.push(`[${label}]`);
      }
    }
    if (!labels.length) { args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'); filters.push(`[0:a]atrim=duration=${q(project.duration)}[silent]`); labels.push('[silent]'); }
    // This is the canonical edited mix: the browser plays this very file and export muxes it.
    filters.push(`${labels.join('')}amix=inputs=${labels.length}:duration=longest:normalize=0,alimiter=limit=0.84:level=0:latency=1,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,apad,atrim=duration=${q(project.duration)}[final]`);
    const graph = filters.join(';');
    if (graph.length > 100000) throw new Error('音轨编辑较复杂，请按章节编辑或减少重复切分');
    job.phase = '重新混音（不渲染视频）';
    await runProcess('ffmpeg', ['-v', 'error', '-nostdin', '-y', ...args, '-filter_complex', graph, '-map', '[final]', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', tmp], job);
    if (job.cancelled) throw new Error('任务已取消');
    fs.renameSync(tmp, out); return { file: relative, original: false, key };
  } finally { fs.rmSync(tmp, { force: true }); }
}

export async function exportEditor(root, project, session, job, quality = {}) {
  const dir = path.join(root, '.showreel-editor', 'exports', job.id);
  fs.mkdirSync(dir, { recursive: true });
  atomicJSON(path.join(dir, 'session.json'), session);
  if (fs.existsSync(path.join(root, 'audio/narration.json')) && session.tracks.some(t => !t.mute && ['voice', 'mix'].includes(t.kind))) {
    job.phase = '口播时间轴检查';
    await runProcess(process.execPath, [path.join(SCRIPTS, 'narration.mjs'), 'check', root, '--duration', String(project.duration), ...(isOriginalSession(session, project) && project.originalAudio ? ['--audio', localFile(root, project.originalAudio)] : [])], job);
  }
  const audio = await prepareEditorAudio(root, project, session, job);
  const common = [path.join(root, project.page), '--size', project.size, '--fps', String(project.fps)];
  const call = (file, argv, options) => runProcess(process.execPath, [path.join(SCRIPTS, file), ...argv], job, options);
  job.phase = '确定性检查'; job.progress = 0.08;
  await call('render.mjs', [...common, '--determinism']);
  job.phase = '渲染画面'; job.progress = 0.15;
  const candidate = path.join(dir, 'video.mp4');
  const options = Object.entries(quality).flatMap(([k, v]) => ['--' + k, String(v)]);
  await call('render.mjs', [...common, '--duration', String(project.duration), '--out', candidate, ...(audio.file ? ['--audio', localFile(root, audio.file)] : []), ...options]);
  job.phase = '技术验收'; job.progress = 0.9;
  // The candidate lives below .showreel-editor/exports, outside inspect's usual
  // <project>/out lookup. Keep the scene's actual clock for SHOTS / HOLDS / DROPS.
  const timeline = fs.existsSync(path.join(root, 'timeline.js')) ? path.join(root, 'timeline.js') : null;
  await call('inspect.mjs', ['qa', candidate, '--out', path.join(dir, 'qa'), '--expect-size', project.size, '--expect-fps', String(project.fps), '--expect-duration', String(project.duration), '--audio', audio.file ? 'required' : 'none', ...(timeline ? ['--timeline', timeline] : [])], { stdoutFile: path.join(dir, 'qa.log') });
  // Keep text framing as review material, exactly as in the existing build path.
  job.phase = '文字审片材料';
  try { await call('render.mjs', [...common, '--text-check', '--out', path.join(dir, 'text')]); }
  catch (error) { if (job.cancelled) throw error; job.log += `\n文字审片材料未生成：${error.message}\n`; }
  if (job.cancelled) throw new Error('任务已取消');
  const relative = `out/editor-${job.id}.mp4`, output = path.join(root, relative);
  fs.mkdirSync(path.dirname(output), { recursive: true }); fs.renameSync(candidate, output);
  atomicJSON(path.join(dir, 'receipt.json'), { version: 1, output: relative, audio: audio.file, session: 'session.json', qa: 'qa.log', timeline: timeline ? 'timeline.js' : null, size: project.size, fps: project.fps, duration: project.duration, quality, sourceSignature: project.sourceSignature, key: audio.key });
  job.progress = 1;
  return { file: relative, audio: audio.file, key: audio.key, review: `.showreel-editor/exports/${job.id}`, session: `.showreel-editor/exports/${job.id}/session.json` };
}
