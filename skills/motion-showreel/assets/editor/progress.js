// The progress drawer lives in the editor itself. A published revision opens as
// the top-level workspace; the only embedded page is the original animation.
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const labels = { pending: '未开始', running: '制作中', ready: '已就绪', failed: '待修正', skipped: '不需要', waiting: '待你确认' };

export function setupProgress({ url, hasProject = false, revision = null, pause = () => {}, replay = () => {}, isBusy = () => false, isSaved = () => true }) {
  const endpoint = new URL(url, location.href);
  if (endpoint.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(endpoint.hostname) || endpoint.pathname !== '/api/progress') throw new Error('制作进度地址无效');
  const parentOrigin = endpoint.origin;
  let stopped = false, timer, newest = null, state = null, stageSignature = '', pickerSignature = '', lastArtifact = null, navigating = false;
  const auto = $('auto'), panel = $('progress-panel'), toggle = $('toggle-progress'), switchButton = $('switch');
  const finalRevision = !!revision?.final;
  auto.checked = !finalRevision && new URL(location.href).searchParams.get('follow') !== '0';
  toggle.hidden = false;
  $('stage-label').textContent = hasProject ? `正在看：${revision?.name || (finalRevision ? '最终预览' : '制作预览')}` : '等待首个成果';
  $('stage-label').title = $('stage-label').textContent;
  function setPanel(open) { panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); }
  toggle.addEventListener('click', () => setPanel(panel.hidden));
  $('close-progress').addEventListener('click', () => setPanel(false));
  if (!hasProject) setPanel(true);
  function closeArtifact() {
    artifactGeneration++;
    for (const audio of $('artifact-content').querySelectorAll('audio')) audio.pause();
    $('artifact-view').hidden = true;
  }
  let artifactGeneration = 0;
  async function showArtifact(artifact) {
    if (!artifact || !['image', 'audio', 'document'].includes(artifact.type) || !/^\/artifact\/[a-f0-9]{64}\.[a-z0-9]+$/.test(artifact.url)) return;
    closeArtifact(); pause(); setPanel(false);
    const generation = artifactGeneration;
    const media = document.createElement(artifact.type === 'image' ? 'img' : artifact.type === 'audio' ? 'audio' : 'pre');
    const source = new URL(artifact.url, parentOrigin).href;
    if (artifact.type === 'audio') { media.src = source; media.controls = true; media.preload = 'metadata'; media.addEventListener('play', pause); }
    else if (artifact.type === 'image') { media.src = source; media.alt = artifact.name; }
    else {
      media.className = 'document-result'; media.textContent = '正在载入成果…'; media.tabIndex = 0;
      fetch(source, { credentials: 'omit' }).then(async response => {
        if (!response.ok) throw new Error('文档无法载入');
        const text = await response.text(); if (generation === artifactGeneration) media.textContent = text;
      }).catch(error => { if (generation === artifactGeneration) media.textContent = error.message; });
    }
    const title = document.createElement('p'); title.textContent = artifact.name;
    $('artifact-content').replaceChildren(media, title); $('artifact-view').hidden = false;
  }
  $('close-artifact').addEventListener('click', closeArtifact);
  window.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!$('artifact-view').hidden) closeArtifact();
    else setPanel(false);
  });
  function isCurrent(preview) { return !!preview && (revision?.id ? revision.id === preview.id : hasProject && new URL(preview.url).origin === location.origin); }
  function deferReason() {
    if (isBusy()) return '新版本已就绪，当前任务结束后可切换';
    if (!isSaved()) return '新版本已就绪，保存当前调整后可切换';
    return '';
  }
  function navigate(preview, manual = false) {
    if (manual) auto.checked = false;
    if (!preview || navigating) return;
    if (isCurrent(preview)) {
      if (manual) { setPanel(false); Promise.resolve(replay()).catch(error => { $('progress-message').textContent = error.message; }); }
      return;
    }
    let next;
    try { next = new URL(preview.url); } catch { return; }
    if (next.protocol !== 'http:' || next.hostname !== endpoint.hostname || !next.port || next.pathname !== '/editor' || next.username || next.password) return;
    const reason = deferReason();
    if (reason) { $('progress-message').textContent = reason; switchButton.hidden = false; return; }
    pause(); closeArtifact(); navigating = true;
    // Carry the user's follow preference between local revision origins.
    next.searchParams.set('follow', auto.checked && !preview.final ? '1' : '0');
    location.assign(next.href);
  }
  async function openResult(id) {
    const reason = deferReason();
    if (reason) { $('progress-message').textContent = reason; setPanel(true); return; }
    const response = await fetch(new URL(`/api/preview/${id}`, parentOrigin), { credentials: 'omit' });
    if (!response.ok) throw new Error('这个阶段的预览暂时无法打开，当前版本保留');
    navigate(await response.json(), true);
  }
  $('shot-picker').onchange = async event => {
    try { await openResult(event.target.value); }
    catch (error) { $('progress-message').textContent = error.message; setPanel(true); }
    finally { $('shot-picker').value = revision?.id || ''; }
  };
  function considerPreview() {
    if (!newest || isCurrent(newest)) { switchButton.hidden = true; return; }
    const reason = deferReason();
    switchButton.hidden = false;
    if (!$('current-stage').textContent.includes('新版本可用')) $('current-stage').textContent += ' · 新版本可用';
    if (reason) $('progress-message').textContent = reason;
    else if (auto.checked) navigate(newest);
    else $('progress-message').textContent = '新版本已就绪';
  }
  switchButton.addEventListener('click', () => navigate(newest));
  auto.addEventListener('change', considerPreview);
  function render(data) {
    state = data;
    const active = data.stages?.find(stage => stage.id === data.current);
    $('current-stage').textContent = active ? `${active.name}${active.total ? ` ${active.done}/${active.total}` : ''} · ${labels[active.status] || ''}` : '制作进度';
    $('current-stage').title = active?.message || labels[active?.status] || '';
    $('progress-message').textContent = data.error ? `新版未载入：${data.error}` : active?.message || '';
    const age = Date.now() - Date.parse(active?.updatedAt || data.updatedAt);
    const stale = age > 180000 && ['running', 'waiting'].includes(active?.status);
    const warning = data.syncWarning || (stale ? active.status === 'waiting'
      ? `该待确认状态已 ${Math.floor(age / 60000)} 分钟未更新；如果你已回复，制作端可能还没同步。`
      : `制作进度已 ${Math.floor(age / 60000)} 分钟未上报，当前画面保留已发布版本。` : '');
    $('progress-sync-warning').textContent = warning;
    $('progress-sync-warning').hidden = !warning;
    toggle.dataset.stale = String(!!warning);
    if (warning) $('current-stage').textContent += ' · 状态未更新';
    const previews = [...(data.previews || [])];
    if (data.preview && !previews.some(p => p.id === data.preview.id)) previews.push(data.preview);
    const artifacts = data.artifacts || [], shots = data.shots || [];
    const nextStageSignature = JSON.stringify([data.stages, artifacts, previews, shots]);
    if (stageSignature !== nextStageSignature) {
      stageSignature = nextStageSignature;
      const resultButtons = stage => {
        const media = artifacts.filter(a => a.stage === stage.id).map(a => `<button class="stage-result" data-id="${esc(a.id)}"><span aria-hidden="true">${a.type === 'audio' ? '♫' : a.type === 'document' ? '▤' : '▧'}</span>${esc(a.name)}<span class="result-action">${a.type === 'audio' ? '试听' : '查看'}</span></button>`);
        if (stage.id === 'scenes') return '';
        const versions = previews.filter(p => p.stage === stage.id && !p.shot).slice(-3).reverse().map((p, i) => `<button class="stage-result" data-preview="${esc(p.id)}"><span aria-hidden="true">▶</span>${esc(p.name || (p.final ? '最终预览' : '阶段动画'))}<span class="result-action">${isCurrent(p) ? '当前' : i ? '回看' : '播放'}</span></button>`);
        return [...media, ...versions].join('');
      };
      $('stages').innerHTML = (data.stages || []).map((stage, index) => `<section class="stage ${esc(stage.status)} ${stage.id === data.current ? 'current' : ''}" data-stage="${esc(stage.id)}" aria-busy="${stage.status === 'running'}"><span class="stage-icon" aria-hidden="true">${stage.status === 'running' ? '' : stage.status === 'ready' ? '✓' : stage.status === 'waiting' ? '◷' : stage.status === 'failed' ? '!' : index + 1}</span><div class="stage-body"><div class="stage-heading"><span class="stage-name">${esc(stage.name)}</span><span class="stage-status">${esc(labels[stage.status] || '')}</span></div>${stage.total ? `<div class="stage-count">${stage.done} / ${stage.total} 已发布</div><progress max="${stage.total}" value="${stage.done}"></progress>` : ''}<div class="stage-results">${resultButtons(stage)}</div></div></section>`).join('');
      for (const button of $('stages').querySelectorAll('[data-id]')) button.onclick = () => showArtifact(state.artifacts.find(a => a.id === button.dataset.id));
      for (const button of $('stages').querySelectorAll('[data-preview]')) button.onclick = async () => {
        const reason = deferReason(); if (reason) { $('progress-message').textContent = reason; return; }
        button.disabled = true;
        try {
          await openResult(button.dataset.preview);
        } catch (error) { $('progress-message').textContent = error.message; }
        finally { button.disabled = false; }
      };
    }
    const whole = previews.filter(p => !p.shot).at(-1);
    const choices = [...(whole ? [{ id: whole.id, name: `完整预览 · ${whole.name || '当前版本'}` }] : []), ...shots.map(shot => ({ id: shot.preview.id, name: shot.name, shot: shot.id }))];
    if (revision?.id && !choices.some(p => p.id === revision.id)) choices.unshift({ id: revision.id, name: `当前版本 · ${revision.name || '预览'}` });
    const signature = JSON.stringify(choices);
    const picker = $('shot-picker');
    if (signature !== pickerSignature) {
      pickerSignature = signature;
      picker.innerHTML = choices.map(p => `<option value="${esc(p.id)}"${p.shot ? ` data-shot="${esc(p.shot)}"` : ''}>${esc(p.name)}</option>`).join('');
      picker.value = revision?.id || '';
    }
    picker.hidden = !shots.length;
    $('stage-label').hidden = !!shots.length;
    const latest = artifacts.at(-1);
    if (!hasProject && latest && latest.id !== lastArtifact && !data.preview) { lastArtifact = latest.id; showArtifact(latest); }
    toggle.dataset.state = active?.status || 'pending';
    const updated = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : '';
    $('progress-connection').textContent = updated ? `最近更新 ${updated}` : '等待制作开始';
    newest = data.preview || null;
    considerPreview();
  }
  async function poll() {
    if (stopped) return;
    try {
      const response = await fetch(endpoint.href, { cache: 'no-store', credentials: 'omit' });
      if (!response.ok) throw new Error('进度连接中断');
      render(await response.json());
    } catch {
      $('progress-connection').textContent = '重新连接中';
      $('progress-message').textContent = '进度暂时无法更新，当前画面可继续预览';
    }
    if (!stopped) timer = setTimeout(poll, 1000);
  }
  const stop = () => { stopped = true; clearTimeout(timer); };
  window.addEventListener('pagehide', stop, { once: true });
  poll();
  return { stop, showArtifact, closeArtifact };
}
