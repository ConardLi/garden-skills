import { setupViewport } from './viewport.js';
import { setupProgress } from './progress.js';
const $ = id => document.getElementById(id);
const clone = value => JSON.parse(JSON.stringify(value));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const colors = { voice: '#78c7ed', bgm: '#c0a2f4', sfx: '#e7bd77', mix: '#9bb2c5' };
const format = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(2).padStart(5, '0')}`;
let viewport, progressView;
let project, session, token, selected = null, selectedTrack = null, audio = null, picture, ready = false;
let time = 0, playing = false, busy = false, frameRequest, originTime = 0, originNow = 0, pending = null, drawJob = null;
let labelWidth = 160, pixels = 50, laneWidth = 600, zoom = 1, history = [], future = [], saved = true, saveTimer, saveChain = Promise.resolve();
let audition = null, currentJob = null, audioDirty = true, audioExhausted = false, peaks = new Map();

function message(text, error = false) { $('message').textContent = text; $('message').title = text; $('message').classList.toggle('error', error); }
async function api(url, data) {
  const response = await fetch(url, data === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Showreel-Token': token }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
  return result;
}
function report(error) { message(error.message || String(error), true); }
function editable(track) { return track && ['bgm', 'sfx'].includes(track.kind); }
function selection() {
  const track = session?.tracks.find(t => t.id === selectedTrack);
  return { track, clip: track?.clips.find(c => c.id === selected) };
}
function updateButtons() {
  const { track, clip } = selection();
  $('undo').disabled = busy || !history.length; $('redo').disabled = busy || !future.length;
  $('split').disabled = busy || !editable(track) || !clip; $('delete').disabled = busy || !editable(track) || !clip;
  $('apply').disabled = busy || !audioDirty; $('export').disabled = busy || !ready || project?.canExport === false; $('save').disabled = busy || saved;
  $('play').disabled = busy || !ready; $('prev').disabled = !ready; $('next').disabled = !ready;
  $('reset').disabled = busy || !project;
  $('toggle-inspector').disabled = !project;
  for (const id of ['viewer-zoom', 'fit-view', 'maximize-view']) $(id).disabled = !project;
  if (!project) { $('zoom-in').disabled = true; $('zoom-out').disabled = true; }
  if (project?.readOnly) {
    for (const el of document.querySelectorAll('#inspector input, [data-mute], #split, #delete, #reset, #undo, #redo')) el.disabled = true;
  }
  document.body.classList.toggle('busy', busy);
}
function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => save().catch(report), 400); }
async function save() {
  clearTimeout(saveTimer);
  const snapshot = clone(session), text = JSON.stringify(snapshot);
  $('save-status').textContent = '保存中…';
  saveChain = saveChain.catch(() => {}).then(() => api('/api/session', snapshot));
  await saveChain;
  saved = JSON.stringify(session) === text;
  $('save-status').textContent = saved ? '已保存' : '有未保存修改'; updateButtons();
}
function changed(previous) {
  if (JSON.stringify(previous) === JSON.stringify(session)) return;
  history.push(previous); if (history.length > 80) history.shift(); future = [];
  audioDirty = true; saved = false; $('audio-state').textContent = '音轨已修改 · 更新试听后播放';
  $('save-status').textContent = '有未保存修改'; renderTracks(); renderInspector(); updateButtons(); queueSave();
}
function edit(action) {
  if (!session || busy || project?.readOnly) return;
  pause(); const previous = clone(session);
  try { action(session); changed(previous); }
  catch (error) { session = previous; report(error); }
}
function undo() {
  if (busy || !history.length) return;
  pause(); future.push(clone(session)); session = history.pop(); restored();
}
function redo() {
  if (busy || !future.length) return;
  pause(); history.push(clone(session)); session = future.pop(); restored();
}
function restored() {
  audioDirty = true; saved = false; $('save-status').textContent = '有未保存修改';
  $('audio-state').textContent = '音轨已修改 · 更新试听后播放'; renderTracks(); renderInspector(); updateButtons(); queueSave();
}
function select(trackId, clipId = null) {
  selectedTrack = trackId; selected = clipId; renderSources(); renderInspector();
  for (const el of document.querySelectorAll('.clip')) el.classList.toggle('selected', el.dataset.track === trackId && el.dataset.clip === clipId);
  updateButtons();
}

function renderSources() {
  $('source-count').textContent = `${project.tracks.length} 项`;
  $('sources').innerHTML = project.tracks.length ? project.tracks.map(t => `<button class="source ${t.id === selectedTrack ? 'active' : ''}" data-id="${esc(t.id)}" style="--track-color:${colors[t.kind]}"><span class="source-top"><span class="source-icon">≋</span>${esc(t.name)}</span><span class="source-file">${esc(t.file)}</span><span class="source-meta">${format(t.sourceDuration)} · ${editable(t) ? '可编辑音频' : '时间已锁定'}</span></button>`).join('') : '<div class="empty-state">无音频素材<br>可直接预览无声画面</div>';
  for (const el of $('sources').querySelectorAll('button')) el.onclick = () => select(el.dataset.id, session.tracks.find(t => t.id === el.dataset.id)?.clips[0]?.id);
}
function renderInspector() {
  const { track, clip } = selection();
  if (!track) { $('inspector').innerHTML = '<div class="hint">选择一条音轨或一个片段，<br>查看声音设置。</div>'; return; }
  const fields = (id, label, value, min, max) => `<label class="field"><span>${label}<span>s</span></span><input id="${id}" type="number" min="${min}" max="${max}" step="0.01" value="${(+value).toFixed(2)}"></label>`;
  $('inspector').innerHTML = `<h3>${esc(track.name)}</h3><div class="sub">${esc(track.file)}</div>
    <label class="field"><span>音轨增益 <output id="gain-label">${track.gain.toFixed(2)}×</output></span><input id="track-gain" aria-label="音轨增益" type="range" min="0" max="4" step="0.01" value="${track.gain}"></label>
    <label class="field-inline">静音此轨<input id="track-mute" aria-label="静音此轨" type="checkbox" ${track.mute ? 'checked' : ''}></label>
    ${!editable(track) ? '<span class="lock-note">🔒 时间位置与画面绑定</span>' : ''}
    ${clip && editable(track) ? `<hr><h3>所选片段</h3><div class="sub">${esc(clip.id)}</div>
      <div class="field-pair">${fields('clip-start', '时间线起点', clip.start, 0, project.duration - clip.duration)}${fields('clip-in', '源音频入点', clip.in, 0, track.sourceDuration - clip.duration)}</div>
      ${fields('clip-duration', '片段时长', clip.duration, 1 / project.fps, Math.min(project.duration - clip.start, track.sourceDuration - clip.in))}
      <div class="field-pair">${fields('clip-fade-in', '淡入', clip.fadeIn, 0, clip.duration)}${fields('clip-fade-out', '淡出', clip.fadeOut, 0, clip.duration)}</div>
      <label class="field"><span>片段增益 <span>${clip.gain.toFixed(2)}×</span></span><input id="clip-gain" aria-label="片段增益" type="range" min="0" max="4" step="0.01" value="${clip.gain}"></label><p class="hint">拖动片段可移动；拖动两侧可裁剪。<br>切分只改变编辑记录，不改原文件。</p>` : '<p class="hint">播放头可自由拖动，画面与口播不会被重新排序。轨道静音和增益会计入导出。</p>'}`;
  $('track-gain').oninput = e => { $('gain-label').textContent = `${(+e.target.value).toFixed(2)}×`; };
  $('track-gain').onchange = e => edit(() => { track.gain = +e.target.value; });
  $('track-mute').onchange = e => edit(() => { track.mute = e.target.checked; });
  if (clip && editable(track)) {
    const bind = (id, prop, min, max) => { $(id).onchange = e => edit(() => {
      const n = +e.target.value; if (!Number.isFinite(n)) throw new Error('请输入有效数值'); clip[prop] = clamp(n, min, max());
      if (prop === 'duration' && clip.fadeIn + clip.fadeOut > clip.duration) { const ratio = clip.duration / (clip.fadeIn + clip.fadeOut); clip.fadeIn *= ratio; clip.fadeOut *= ratio; }
    }); };
    bind('clip-start', 'start', 0, () => project.duration - clip.duration);
    bind('clip-in', 'in', 0, () => track.sourceDuration - clip.duration);
    bind('clip-duration', 'duration', Math.min(1 / project.fps, clip.duration), () => Math.min(project.duration - clip.start, track.sourceDuration - clip.in));
    bind('clip-fade-in', 'fadeIn', 0, () => clip.duration - clip.fadeOut);
    bind('clip-fade-out', 'fadeOut', 0, () => clip.duration - clip.fadeIn);
    $('clip-gain').onchange = e => edit(() => { clip.gain = +e.target.value; });
  }
}

function timelineMetrics() {
  labelWidth = innerWidth < 900 ? 108 : 160;
  document.documentElement.style.setProperty('--label-width', labelWidth + 'px');
  laneWidth = Math.max(180, $('timeline-scroll').clientWidth - labelWidth) * zoom;
  pixels = laneWidth / project.duration;
  $('timeline-content').style.width = `${laneWidth + labelWidth}px`;
}
function renderTracks() {
  if (!project) return;
  timelineMetrics();
  const rough = project.duration / Math.max(1, laneWidth / 90);
  const interval = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 30, 60, 120, 300, 600].find(v => v >= rough) || 1200;
  $('ruler').style.width = `${laneWidth}px`; $('ruler').innerHTML = '';
  for (let t = 0; t < project.duration; t += interval) {
    const tick = document.createElement('span'); tick.className = 'ruler-tick'; tick.style.left = `${t * pixels}px`; tick.textContent = t < 60 ? `${+t.toFixed(1)}` : `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`; $('ruler').append(tick);
  }
  const pictureLane = `<div class="track-row picture-row" style="--track-color:#adc4a2"><div class="track-label"><span><i></i>画面 ⌑</span><small>锁定</small></div><div class="track-lane" style="width:${laneWidth}px;--grid:${interval * pixels}px">${project.shots.map(s => `<div class="picture-clip" style="left:${s.t0 * pixels}px;width:${Math.max(2, (s.t1 - s.t0) * pixels)}px"><span>◫ ${esc(s.id)}</span><small>原始动画 · render(t)</small></div>`).join('')}</div></div>`;
  $('tracks').innerHTML = pictureLane + session.tracks.map(t => `<div class="track-row" style="--track-color:${colors[t.kind]}"><div class="track-label"><span><i></i>${esc(t.name)} ${editable(t) ? '' : '⌑'}</span><button data-mute="${esc(t.id)}" class="${t.mute ? 'active' : ''}" aria-label="${esc(t.name)}静音">M</button></div><div class="track-lane" data-lane="${esc(t.id)}" style="width:${laneWidth}px;--grid:${interval * pixels}px">${t.clips.map(c => `<div class="clip ${editable(t) ? '' : 'locked'} ${t.mute ? 'muted' : ''} ${selected === c.id && selectedTrack === t.id ? 'selected' : ''}" tabindex="0" role="button" aria-label="${esc(t.name)}片段 ${esc(c.id)}" data-track="${esc(t.id)}" data-clip="${esc(c.id)}" style="left:${c.start * pixels}px;width:${Math.max(2, c.duration * pixels)}px"><div class="clip-title">${esc(t.name)} · ${c.duration.toFixed(2)}s</div><canvas></canvas>${editable(t) ? '<span class="handle left" data-handle="left"></span><span class="handle right" data-handle="right"></span>' : ''}</div>`).join('')}</div></div>`).join('');
  for (const button of $('tracks').querySelectorAll('[data-mute]')) button.onclick = () => edit(s => { const t = s.tracks.find(t => t.id === button.dataset.mute); t.mute = !t.mute; });
  for (const el of $('tracks').querySelectorAll('.clip')) {
    el.onpointerdown = e => startDrag(e, el);
    el.onkeydown = e => { if (e.code === 'Enter') select(el.dataset.track, el.dataset.clip); };
    drawWave(el);
  }
  for (const lane of $('tracks').querySelectorAll('.track-lane')) lane.onpointerdown = e => { if (e.target === lane) { pause(); seek((e.clientX - lane.getBoundingClientRect().left) / pixels).catch(report); } };
  updateClock(); updateButtons();
}
function drawWave(el) {
  const track = session.tracks.find(t => t.id === el.dataset.track), clip = track?.clips.find(c => c.id === el.dataset.clip), wave = peaks.get(track?.id);
  const canvas = el.querySelector('canvas'), w = Math.min(4096, Math.max(2, Math.round(el.getBoundingClientRect().width)));
  canvas.width = w; canvas.height = 32; const g = canvas.getContext('2d'); g.fillStyle = colors[track.kind];
  if (!wave || !clip) return;
  for (let x = 0; x < w; x += 3) {
    const a = Math.floor((clip.in + clip.duration * x / w) / wave.interval), b = Math.max(a + 1, Math.ceil((clip.in + clip.duration * (x + 3) / w) / wave.interval));
    let peak = 0; for (let i = a; i < Math.min(b, wave.peaks.length); i++) peak = Math.max(peak, wave.peaks[i]);
    const h = Math.min(30, peak * 34); g.fillRect(x, 16 - h / 2, 1.5, h);
  }
}
function startDrag(e, el) {
  if (busy || e.button !== 0) return;
  e.stopPropagation(); select(el.dataset.track, el.dataset.clip);
  const { track, clip } = selection();
  if (!editable(track) || project.readOnly) return;
  pause(); const previous = clone(session), original = clone(clip), mode = e.target.dataset.handle || 'move';
  const x0 = e.clientX, scroll0 = $('timeline-scroll').scrollLeft;
  el.setPointerCapture(e.pointerId);
  const move = event => {
    const raw = (event.clientX - x0 + $('timeline-scroll').scrollLeft - scroll0) / pixels;
    const delta = Math.round(raw * project.fps) / project.fps;
    if (mode === 'move') clip.start = clamp(original.start + delta, 0, project.duration - original.duration);
    if (mode === 'left') {
      const d = clamp(delta, -Math.min(original.start, original.in), original.duration - 1 / project.fps);
      clip.start = original.start + d; clip.in = original.in + d; clip.duration = original.duration - d;
    }
    if (mode === 'right') clip.duration = clamp(original.duration + delta, Math.min(1 / project.fps, original.duration), Math.min(project.duration - original.start, track.sourceDuration - original.in));
    if (clip.fadeIn + clip.fadeOut > clip.duration) { const f = clip.duration / (original.fadeIn + original.fadeOut); clip.fadeIn = original.fadeIn * f; clip.fadeOut = original.fadeOut * f; }
    el.style.left = `${clip.start * pixels}px`; el.style.width = `${Math.max(2, clip.duration * pixels)}px`; drawWave(el);
  };
  const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', cancel); changed(previous); renderInspector(); };
  const cancel = () => { session = previous; el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', cancel); renderTracks(); renderInspector(); };
  el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', cancel);
}
function split() {
  const { track, clip } = selection(); if (!editable(track) || !clip || busy) return;
  const offset = Math.round((time - clip.start) * project.fps) / project.fps;
  if (offset < 1 / project.fps || offset > clip.duration - 1 / project.fps) { message('请把播放头放在片段内部'); return; }
  if (offset < clip.fadeIn || offset > clip.duration - clip.fadeOut) { message('切分点位于淡入淡出区间，请移到区间之外，以保留原来的声音包络'); return; }
  edit(() => {
    const right = { ...clone(clip), id: `${track.id}-${Date.now().toString(36)}`, start: clip.start + offset, in: clip.in + offset, duration: clip.duration - offset, fadeIn: 0 };
    clip.duration = offset; clip.fadeOut = 0; track.clips.splice(track.clips.indexOf(clip) + 1, 0, right); selected = right.id;
  });
}

function draw(t) {
  pending = clamp(Math.floor((t + 1e-7) * project.fps) / project.fps, 0, Math.max(0, project.duration - 1 / project.fps));
  if (drawJob) return drawJob;
  drawJob = Promise.resolve().then(async () => { while (pending !== null) { const next = pending; pending = null; await picture.render(next); } }).finally(() => { drawJob = null; if (pending !== null) return draw(pending); });
  return drawJob;
}
function updateClock() {
  $('clock').textContent = format(time); $('duration').textContent = `/ ${format(project.duration)}`;
  $('playhead').style.left = `${labelWidth + time * pixels}px`;
  $('play').textContent = playing ? 'Ⅱ' : '▶'; $('play').setAttribute('aria-label', playing ? '暂停' : '播放');
}
async function seek(value) {
  time = clamp(Number(value) || 0, 0, project.duration); originTime = time; originNow = performance.now();
  if (audio) { audio.currentTime = Math.min(time, audio.duration || time); audioExhausted = time >= audio.duration; }
  updateClock(); if (ready) await draw(time);
}
function pause() { playing = false; cancelAnimationFrame(frameRequest); audio?.pause(); if (project) updateClock(); }
function tick(now) {
  if (!playing) return;
  time = clamp(audio && !audioExhausted ? audio.currentTime : originTime + (now - originNow) / 1000, 0, project.duration);
  const a = clamp(+$('range-start').value || 0, 0, project.duration), b = clamp(+$('range-end').value || project.duration, 0, project.duration);
  if ($('loop').checked && b > a && time >= b) { time = a; originTime = a; originNow = now; if (audio) { audio.currentTime = Math.min(a, audio.duration); audioExhausted = a >= audio.duration; if (!audioExhausted && audio.paused) audio.play().catch(report); } }
  updateClock(); draw(time).catch(error => { pause(); report(error); });
  if (time >= project.duration) pause(); else frameRequest = requestAnimationFrame(tick);
}
async function play() {
  if (busy || !ready) return;
  if (playing) { pause(); return; }
  progressView?.closeArtifact();
  if (audioDirty) await applyAudio();
  if (audioDirty || busy) return;
  if (time >= project.duration) await seek(0);
  playing = true; originTime = time; originNow = performance.now();
  try { if (audio) { audio.currentTime = Math.min(time, audio.duration); audioExhausted = time >= audio.duration; if (!audioExhausted) await audio.play(); } if (playing) frameRequest = requestAnimationFrame(tick); updateClock(); }
  catch (error) { pause(); report(error); }
}

async function attachAudio(result) {
  audio?.pause(); audio?.removeAttribute('src'); audio?.load(); audio = null; audioExhausted = false;
  if (result.file) {
    const next = new Audio(); next.preload = 'metadata'; next.src = result.url;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('音频载入超时')), 15000);
      next.onloadedmetadata = () => { clearTimeout(timer); resolve(); }; next.onerror = () => { clearTimeout(timer); reject(new Error('试听音频无法解码')); };
      next.load();
    });
    audio = next;
    audio.addEventListener('ended', () => {
      if (audio.duration >= project.duration - 1 / project.fps && !$('loop').checked) { seek(project.duration).then(pause).catch(report); }
      else { // Original short tracks retain silence to the end of the picture.
        originTime = audio.currentTime; originNow = performance.now(); audioExhausted = true;
      }
    });
    audio.currentTime = Math.min(time, audio.duration);
  }
  audition = JSON.stringify(session); audioDirty = false;
  $('audio-state').textContent = result.original ? '原始声音 · 未重新处理' : '试听已更新 · 导出使用同一混音'; updateButtons();
}
async function startJob(type, existingJob = null) {
  if (busy) throw new Error('请等待当前任务完成');
  pause(); busy = true; updateButtons();
  const panel = $('job-panel'), isExport = type === 'export';
  currentJob = null;
  if (isExport) { panel.hidden = false; $('job-title').textContent = '导出视频'; $('download').hidden = true; $('close-job').hidden = true; $('cancel-job').hidden = false; $('cancel-job').disabled = true; }
  $('audio-state').textContent = isExport ? '导出中…' : '正在更新试听音频…';
  try {
    if (!existingJob) await save();
    currentJob = existingJob || await api('/api/jobs', { type, session: clone(session) });
    $('cancel-job').disabled = false;
    while (currentJob.status === 'running') {
      if (isExport) {
        $('job-phase').textContent = currentJob.phase; $('job-progress').value = currentJob.progress;
        $('job-log').textContent = currentJob.log; $('job-log').scrollTop = $('job-log').scrollHeight;
      }
      await sleep(300); currentJob = await api(`/api/jobs/${currentJob.id}`);
    }
    if (isExport) { $('job-log').textContent = currentJob.log; $('job-phase').textContent = currentJob.phase; $('job-progress').value = currentJob.progress; }
    if (currentJob.status !== 'complete') throw new Error(currentJob.error || '任务已取消');
    if (isExport) {
      $('download').href = currentJob.result.url; $('download').hidden = false;
      message(`导出完成，技术验收通过：${currentJob.result.file}。文字审片材料保存在任务目录。`);
    }
    return currentJob.result;
  } finally {
    busy = false;
    if (isExport) { $('cancel-job').hidden = true; $('close-job').hidden = false; }
    $('audio-state').textContent = audioDirty ? '音轨有修改 · 请更新试听' : '试听已就绪'; updateButtons();
  }
}
async function applyAudio() { const result = await startJob('mix'); await attachAudio(result); return result; }
async function exportVideo() {
  // Reuse the very same audition mix; an export job also rebuilds it if settings changed.
  const result = await startJob('export'); return result;
}

async function init() {
  updateButtons();
  const data = await api('/api/project');
  if (data.progressURL) progressView = setupProgress({ url: data.progressURL, hasProject: !!data.project, revision: data.progressRevision, pause, replay: () => { pause(); return seek(0).then(play); }, isBusy: () => busy || (!!project && !window.__showreelEditor.ready), isSaved: () => saved });
  if (!data.project) {
    document.body.classList.add('waiting-project'); $('loading').hidden = true; $('placeholder').hidden = false;
    message('等待阶段成果'); return;
  }
  project = data.project; session = data.session; token = data.token;
  $('project-name').textContent = project.name === 'project' ? '当前作品' : project.name; document.title = `${project.name} · Motion Studio`;
  $('spec').textContent = `${project.size.replace('x', ' × ')} / ${project.fps} FPS`;
  $('range-end').value = project.duration; $('range-end').max = project.duration; $('range-start').max = project.duration;
  const [w, h] = project.size.split('x');
  const query = new URLSearchParams({ render: '1', w, h });
  const sceneURL = `/project/${project.page.split('/').map(encodeURIComponent).join('/')}?${query}`;
  $('scene-link').href = sceneURL; $('scene').src = sceneURL;
  renderSources(); renderTracks(); updateButtons();
  const timelineHeight = $('tracks').scrollHeight + $('ruler').offsetHeight + document.querySelector('.timeline-toolbar').offsetHeight + document.querySelector('.timeline-footer').offsetHeight + 2;
  $('workspace').style.setProperty('--timeline-height', `${Math.min(300, Math.max(120, timelineHeight), Math.max(120, $('workspace').clientHeight - 150))}px`);
  viewport = setupViewport({ project, scene: $('scene'), viewer: $('viewer'), frameWrap: $('frame-wrap'), workspace: $('workspace'), divider: $('panel-divider'), zoomOut: $('zoom-out'), zoomIn: $('zoom-in'), zoomSelect: $('viewer-zoom'), fit: $('fit-view'), maximize: $('maximize-view') });
  new ResizeObserver(() => renderTracks()).observe($('timeline-scroll'));
  const deadline = performance.now() + 180000;
  while (true) {
    picture = $('scene').contentWindow;
    if (typeof picture?.render === 'function' && picture.READY !== false) break;
    if (performance.now() > deadline) throw new Error('场景载入超时：需要 window.render(t)、DUR 和加载完成的素材');
    await sleep(50);
  }
  await picture.document.fonts.ready;
  if (!Number.isFinite(picture.DUR) || Math.abs(picture.DUR - project.duration) > 1 / project.fps) throw new Error('场景时长与工作区规格不一致，请修正 --duration 或 timeline.js');
  ready = true; $('loading').hidden = true; await seek(0);
  if (project.tracks.length) select(project.tracks[0].id, project.tracks[0].clips[0]?.id);
  for (const track of project.tracks) api(`/api/wave/${track.id}`).then(wave => { peaks.set(track.id, wave); for (const el of document.querySelectorAll('.clip')) if (el.dataset.track === track.id) drawWave(el); }).catch(error => message(`波形未生成：${error.message}`, true));
  if (data.activeJob?.status === 'running') {
    message('正在恢复当前任务的进度…');
    try { await startJob(data.activeJob.type, data.activeJob); } catch (error) { report(error); }
  }
  await applyAudio();
  $('save-status').textContent = '已保存';
  const qualityNotes = (data.quality.grain || data.quality.subframes > 1 || data.quality.dpr > 1) ? '当前导出含额外采样或后期，实时预览未模拟这些导出效果。' : '';
  message([data.restoreWarning, ...project.notes, qualityNotes].filter(Boolean).join(' ') || '就绪');
  if (project.readOnly) message('制作预览 · 最终版本开放调音与导出');
  window.__showreelEditor.ready = true; updateButtons();
}

$('toggle-inspector').onclick = () => { const open = document.querySelector('.inspector').classList.toggle('open'); $('toggle-inspector').setAttribute('aria-expanded', String(open)); };
$('play').onclick = () => play().catch(report); $('prev').onclick = () => { pause(); seek(time - 1 / project.fps).catch(report); }; $('next').onclick = () => { pause(); seek(time + 1 / project.fps).catch(report); };
$('save').onclick = () => save().catch(report); $('undo').onclick = undo; $('redo').onclick = redo; $('split').onclick = split;
$('reset').onclick = () => edit(s => { s.tracks = clone(project.tracks); });
$('delete').onclick = () => { const { track, clip } = selection(); if (editable(track) && clip) edit(() => { track.clips.splice(track.clips.indexOf(clip), 1); selected = null; }); };
$('zoom').oninput = e => { zoom = +e.target.value; renderTracks(); };
$('apply').onclick = () => applyAudio().catch(report); $('export').onclick = () => exportVideo().catch(report);
$('cancel-job').onclick = () => { if (currentJob) api(`/api/jobs/${currentJob.id}/cancel`, {}).catch(report); };
$('close-job').onclick = () => { $('job-panel').hidden = true; };
$('ruler').onpointerdown = e => {
  if (!ready || e.button !== 0) return;
  pause(); const ruler = $('ruler'); ruler.setPointerCapture(e.pointerId);
  const move = event => seek((event.clientX - ruler.getBoundingClientRect().left) / pixels).catch(report);
  const up = () => { ruler.removeEventListener('pointermove', move); ruler.removeEventListener('pointerup', up); ruler.removeEventListener('pointercancel', up); };
  ruler.addEventListener('pointermove', move); ruler.addEventListener('pointerup', up); ruler.addEventListener('pointercancel', up); move(e);
};
document.addEventListener('keydown', e => {
  if (!ready || e.target.closest('input,textarea,select,audio,video,#artifact-view,[role=separator]')) return;
  if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if ((e.metaKey || e.ctrlKey) && e.code === 'KeyS') { e.preventDefault(); save().catch(report); return; }
  if (e.code === 'Space' && e.target.closest('button')) return;
  if (e.code === 'Space') { e.preventDefault(); play().catch(report); }
  if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') { e.preventDefault(); pause(); seek(time + (e.code === 'ArrowRight' ? 1 : -1) / project.fps).catch(report); }
  if (e.code === 'KeyS' && !e.metaKey && !e.ctrlKey) split();
});
window.addEventListener('beforeunload', e => { if (!saved || busy) { e.preventDefault(); e.returnValue = ''; } });
window.__showreelEditor = { ready: false, get project() { return project; }, get session() { return session; }, get audio() { return audio; }, get time() { return time; }, get busy() { return busy; }, get picture() { return picture; }, seek, select, split, undo, redo, edit, save, applyAudio, exportVideo, get audition() { return audition; } };
init().catch(error => { $('loading').textContent = error.message; report(error); });
