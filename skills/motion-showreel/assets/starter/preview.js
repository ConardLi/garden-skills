// Optional preview controls. Import this module freely: render=1 never touches the DOM.
// ?preview=1&audio=audio/final.wav&fps=30&t=2
const query = new URLSearchParams(location.search);
const enabled = query.get('preview') === '1' && query.get('render') !== '1';
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function localAudio(value) {
  if (typeof value !== 'string' || !value || value.startsWith('/') || value.includes('\\') || /^[a-z][a-z\d+.-]*:/i.test(value) || value.split('/').some(s => s === '..') || /[?#]/.test(value)) throw new Error('Audio must be a project-relative file path');
  return new URL(value.split('/').map(encodeURIComponent).join('/'), location.href);
}

async function waitForPicture() {
  const deadline = performance.now() + 180000;
  while (typeof window.render !== 'function' || window.READY === false || !(Number.isFinite(window.DUR) && window.DUR > 0)) {
    if (performance.now() > deadline) throw new Error('Preview needs window.render(t), window.DUR, and loaded assets');
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  if (document.fonts) await document.fonts.ready;
}

async function findAudio(explicit) {
  const candidates = explicit ? [explicit] : ['audio/final.wav', 'audio/narration.wav', 'audio/music.wav'];
  for (const candidate of candidates) {
    const url = localAudio(candidate);
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' }).catch(() => null);
    if (response?.ok) return { url: url.href, label: candidate };
  }
  if (explicit) throw new Error(`Audio file not found: ${explicit}`);
  return null;
}

function fitPicture(host) {
  // Scale the complete scene, rather than individual canvases. Keeping the original
  // DOM tree also keeps body > ... selectors and retained canvas/WebGL references.
  // Individual CSS scale leaves the scene's own transform property untouched.
  const width = +query.get('w') || innerWidth, height = +query.get('h') || innerHeight;
  const body = document.body, original = body.getAttribute('data-showreel-preview-stage');
  const style = document.createElement('style'); style.id = 'showreel-preview-fit';
  body.setAttribute('data-showreel-preview-stage', ''); document.head.appendChild(style);
  const fit = () => {
    const gap = 12, bar = host.getBoundingClientRect().height;
    const availableW = Math.max(1, innerWidth - gap * 2), availableH = Math.max(1, innerHeight - bar - gap * 2);
    const scale = Math.min(1, availableW / width, availableH / height);
    const x = gap + (availableW - width * scale) / 2, y = gap + (availableH - height * scale) / 2;
    const css = `html{overflow:hidden!important}body[data-showreel-preview-stage]{position:fixed!important;left:${x}px!important;top:${y}px!important;width:${width}px!important;height:${height}px!important;margin:0!important;overflow:hidden!important;transform-origin:0 0!important;scale:${scale}!important;z-index:0!important}`;
    if (style.textContent !== css) style.textContent = css;
  };
  fit();
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
  observer?.observe(host); addEventListener('resize', fit); window.visualViewport?.addEventListener('resize', fit);
  return () => {
    observer?.disconnect(); removeEventListener('resize', fit); window.visualViewport?.removeEventListener('resize', fit); style.remove();
    if (original === null) body.removeAttribute('data-showreel-preview-stage'); else body.setAttribute('data-showreel-preview-stage', original);
  };
}

export async function installPreview() {
  if (!enabled) return null;
  if (window.__showreelPreview) return window.__showreelPreview;
  await waitForPicture();
  // The CLI can inject this module even when the project already imports its own copy.
  if (window.__showreelPreview) return window.__showreelPreview;
  const duration = window.DUR;
  const requestedFps = +(query.get('fps') || window.FPS || 30);
  const fps = Number.isFinite(requestedFps) && requestedFps > 0 && requestedFps <= 240 ? requestedFps : 30;
  let time = clamp(+(query.get('t') || 0) || 0, 0, duration), rate = 1, playing = false, frameRequest = 0;
  let originTime = time, originNow = performance.now(), drawJob = null, pending = null, destroyed = false;
  const host = document.createElement('showreel-preview');
  host.id = 'showreel-preview';
  host.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;display:block;';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>
    :host{color-scheme:dark;font:13px/1.3 system-ui,sans-serif;color:#f3f3f3}
    *{box-sizing:border-box} .bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;background:#17191ef2;border-top:1px solid #49515c;box-shadow:0 -4px 24px #0004}
    button,select{font:inherit;color:inherit;background:#282d35;border:1px solid #69717e;border-radius:5px;min-height:32px;padding:4px 9px}button{cursor:pointer}button:disabled{opacity:.5;cursor:default}
    button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #7fc5ff;outline-offset:2px}.seek{flex:1;min-width:120px;accent-color:#7fc5ff}.clock{font-variant-numeric:tabular-nums;white-space:nowrap}.status{flex-basis:100%;color:#bbc5d3;font-size:12px;overflow-wrap:anywhere}.error{color:#ffb5b5}label{display:flex;align-items:center;gap:5px}
  </style><div class="bar" role="region" aria-label="Video preview">
    <button type="button" id="play" aria-label="Play preview">Play</button>
    <button type="button" id="back" aria-label="Previous frame" title="Previous frame (Left arrow)">◀</button>
    <button type="button" id="next" aria-label="Next frame" title="Next frame (Right arrow)">▶</button>
    <input class="seek" id="seek" type="range" min="0" value="0" aria-label="Preview time">
    <output class="clock" id="clock" role="timer" aria-live="off"></output>
    <label>Speed <select id="speed" aria-label="Preview speed"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>
    <span class="status" id="status" role="status">Loading audio…</span>
  </div>`;
  const get = id => shadow.getElementById(id), playButton = get('play'), seekInput = get('seek'), clock = get('clock'), status = get('status');
  seekInput.max = String(duration); seekInput.step = String(1 / fps);
  // Controls sit outside the scaled scene so fixed DOM/SVG overlays scale with the
  // picture while transport controls keep their normal size and remain reachable.
  document.documentElement.appendChild(host);
  const removeFit = fitPicture(host);
  let audio = null, audioInfo = null, error = null, ready = false;
  playButton.disabled = true;

  function syncControls() {
    seekInput.value = String(time);
    clock.value = `${time.toFixed(2)} / ${duration.toFixed(2)} s`;
    playButton.textContent = playing ? 'Pause' : 'Play'; playButton.setAttribute('aria-label', playing ? 'Pause preview' : 'Play preview');
  }
  function pause() {
    playing = false; cancelAnimationFrame(frameRequest); frameRequest = 0;
    audio?.pause(); syncControls();
  }
  function fail(reason) {
    error = reason instanceof Error ? reason : new Error(String(reason)); pause();
    status.textContent = error.message; status.classList.add('error'); playButton.disabled = true;
  }
  function draw(t) {
    pending = Math.min(t, Math.max(0, duration - 1 / fps));
    if (drawJob) return drawJob;
    drawJob = Promise.resolve().then(async () => {
      while (pending !== null && !destroyed) { const next = pending; pending = null; await window.render(next); }
    }).finally(() => {
      drawJob = null;
      if (pending !== null && !destroyed) return draw(pending);
    });
    return drawJob;
  }
  async function seek(t) {
    time = clamp(Number(t) || 0, 0, duration); originTime = time; originNow = performance.now();
    if (audio) audio.currentTime = Math.min(time, Number.isFinite(audio.duration) ? audio.duration : time);
    syncControls(); await draw(time);
  }
  function tick(now) {
    if (!playing || destroyed) return;
    time = clamp(audio ? audio.currentTime : originTime + (now - originNow) / 1000 * rate, 0, duration);
    syncControls(); draw(time).catch(fail);
    if (time >= duration) pause(); else frameRequest = requestAnimationFrame(tick);
  }
  async function play() {
    if (destroyed || error || playing || !ready) return;
    if (time >= duration) await seek(0);
    playing = true; originTime = time; originNow = performance.now(); syncControls();
    try {
      if (audio) { audio.currentTime = Math.min(time, Number.isFinite(audio.duration) ? audio.duration : time); audio.playbackRate = rate; await audio.play(); }
      if (playing) frameRequest = requestAnimationFrame(tick);
    } catch (e) { if (playing) fail(e); } // Pausing while play() is pending can reject its promise normally.
  }
  async function step(direction) { pause(); await seek(time + direction / fps); }
  function changeRate(value) {
    const next = +value; if (![0.5, 0.75, 1, 1.25, 1.5, 2].includes(next)) return;
    if (playing && !audio) time = clamp(originTime + (performance.now() - originNow) / 1000 * rate, 0, duration);
    rate = next; originTime = time; originNow = performance.now(); if (audio) audio.playbackRate = rate;
    get('speed').value = String(rate); syncControls();
  }
  const onKey = event => {
    const target = event.composedPath()[0];
    if (target?.matches?.('input,select,textarea,[contenteditable]')) return;
    if (event.code === 'Space' && target?.matches?.('button')) return;
    if (event.code === 'Space') { event.preventDefault(); (playing ? Promise.resolve(pause()) : play()).catch(fail); }
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') { event.preventDefault(); step(event.code === 'ArrowRight' ? 1 : -1).catch(fail); }
  };
  playButton.onclick = () => (playing ? Promise.resolve(pause()) : play()).catch(fail);
  get('back').onclick = () => step(-1).catch(fail); get('next').onclick = () => step(1).catch(fail);
  seekInput.oninput = () => { seek(seekInput.value).catch(fail); };
  get('speed').onchange = event => changeRate(event.target.value);
  addEventListener('keydown', onKey);
  const api = {
    host, play, pause, seek, step, changeRate,
    get currentTime() { return time; }, get playing() { return playing; }, get audio() { return audio; }, get rate() { return rate; }, get error() { return error; }, get ready() { return ready; },
    destroy() { pause(); destroyed = true; audio?.removeAttribute('src'); audio?.load(); removeEventListener('keydown', onKey); removeFit(); host.remove(); if (window.__showreelPreview === api) delete window.__showreelPreview; },
  };
  window.__showreelPreview = api;
  syncControls();
  try {
    audioInfo = await findAudio(query.get('audio'));
    if (audioInfo) {
      audio = new Audio(); audio.preload = 'metadata'; audio.src = audioInfo.url;
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { cleanup(); reject(new Error(`Audio metadata timed out: ${audioInfo.label}`)); }, 10000);
        const loaded = () => { cleanup(); resolve(); }, failed = () => { cleanup(); reject(new Error(`Audio could not be decoded: ${audioInfo.label}`)); };
        const cleanup = () => { clearTimeout(timer); audio.removeEventListener('loadedmetadata', loaded); audio.removeEventListener('error', failed); };
        audio.addEventListener('loadedmetadata', loaded); audio.addEventListener('error', failed); audio.load();
      });
      audio.currentTime = Math.min(time, audio.duration);
      audio.addEventListener('error', () => fail(new Error(`Audio playback failed: ${audioInfo.label}`)));
      audio.addEventListener('ended', () => { time = Math.min(duration, audio.currentTime); pause(); draw(time).catch(fail); });
      status.textContent = `Audio: ${audioInfo.label} · Click Play · ← / →: one frame · Speed affects preview only`;
    } else status.textContent = 'No audio · Click Play · ← / →: one frame · Speed affects preview only';
    await draw(time);
    ready = true; playButton.disabled = false;
  } catch (e) { fail(e); }
  dispatchEvent(new CustomEvent('showreel-preview-ready', { detail: api }));
  return api;
}

if (enabled && !window.__showreelPreviewLoading) {
  window.__showreelPreviewLoading = installPreview().catch(error => { console.error(`Preview: ${error.message}`); return null; });
}
