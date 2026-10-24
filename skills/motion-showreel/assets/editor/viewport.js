/** Preview-only controls. They never change scene timing, render size or session data. */
export function setupViewport({ project, scene, viewer, frameWrap, workspace, divider, zoomOut, zoomIn, zoomSelect, fit, maximize }) {
  const [width, height] = String(project.size).split('x').map(Number);
  if (!(width > 0 && height > 0)) throw new Error('预览画面尺寸无效');

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const padding = 16, zoomStops = [.1, .125, .1667, .25, .3333, .5, .6667, .75, 1, 1.25, 1.5, 2, 3, 4];
  const cleanup = [];
  let fitted = true, scale = 1, panX = 0, panY = 0, panning = null, resizing = null, resizeFrame = 0;
  let timelineHeight = null, disposed = false;
  const on = (target, type, listener, options) => {
    if (!target) return;
    target.addEventListener(type, listener, options);
    cleanup.push(() => target.removeEventListener(type, listener, options));
  };
  const fitScale = () => Math.max(.001, Math.min((Math.max(1, viewer.clientWidth - padding * 2)) / width, (Math.max(1, viewer.clientHeight - padding * 2)) / height));
  const panLimits = () => ({ x: Math.max(0, (width * scale - viewer.clientWidth) / 2 + padding), y: Math.max(0, (height * scale - viewer.clientHeight) / 2 + padding) });

  function updateZoomControls() {
    zoomOut && (zoomOut.disabled = scale <= .05001);
    zoomIn && (zoomIn.disabled = scale >= 3.9999);
    if (!zoomSelect) return;
    const value = fitted ? 'fit' : String(Math.round(scale * 100));
    const dynamic = zoomSelect.querySelector('option[data-current-zoom]');
    if (dynamic && dynamic.value !== value) dynamic.remove();
    if (![...zoomSelect.options].some(option => option.value === value)) {
      const option = document.createElement('option');
      option.value = value; option.textContent = `${value}%`; option.dataset.currentZoom = '';
      zoomSelect.append(option);
    }
    zoomSelect.value = value;
    zoomSelect.title = fitted ? `适应窗口 · ${Math.round(scale * 100)}%` : `${Math.round(scale * 100)}%`;
  }

  function render() {
    if (disposed || !viewer.clientWidth || !viewer.clientHeight) return;
    if (fitted) { scale = fitScale(); panX = panY = 0; }
    const limits = panLimits();
    panX = clamp(panX, -limits.x, limits.x); panY = clamp(panY, -limits.y, limits.y);
    frameWrap.style.width = `${width * scale}px`; frameWrap.style.height = `${height * scale}px`;
    frameWrap.style.left = `${(viewer.clientWidth - width * scale) / 2 + panX}px`;
    frameWrap.style.top = `${(viewer.clientHeight - height * scale) / 2 + panY}px`;
    scene.style.width = `${width}px`; scene.style.height = `${height}px`; scene.style.transform = `scale(${scale})`;
    viewer.classList.toggle('viewport-pannable', limits.x > .5 || limits.y > .5);
    updateZoomControls();
  }

  function setZoom(value, anchor) {
    const next = clamp(value, .05, 4);
    const centerX = viewer.clientWidth / 2, centerY = viewer.clientHeight / 2;
    // Keep the same scene pixel under the pointer while zooming.
    const x = anchor?.x ?? centerX, y = anchor?.y ?? centerY;
    panX = x - centerX - (x - centerX - panX) * next / scale;
    panY = y - centerY - (y - centerY - panY) * next / scale;
    fitted = false; scale = next; render();
  }

  function stepZoom(direction) {
    const value = direction > 0
      ? zoomStops.find(stop => stop > scale + .002) ?? 4
      : [...zoomStops].reverse().find(stop => stop < scale - .002) ?? .05;
    setZoom(value);
  }

  function fitScene() { fitted = true; panX = panY = 0; render(); }

  function setMaximized(value) {
    document.body.classList.toggle('preview-maximized', value);
    maximize?.setAttribute('aria-pressed', String(value));
    if (maximize) { maximize.title = value ? '还原布局（Esc）' : '最大化预览'; maximize.setAttribute('aria-label', value ? '还原布局' : '最大化预览'); }
    requestLayout();
  }

  function timelineBounds() {
    const available = workspace.clientHeight - (divider?.getBoundingClientRect().height || 8);
    return { min: Math.min(120, Math.max(0, available - 140)), max: Math.max(0, available - 140) };
  }

  function setTimelineHeight(value) {
    const bounds = timelineBounds();
    const next = Math.round(clamp(value, bounds.min, bounds.max));
    timelineHeight = next;
    if (workspace.style.getPropertyValue('--timeline-height') !== `${next}px`) workspace.style.setProperty('--timeline-height', `${next}px`);
    divider?.setAttribute('aria-valuemin', String(Math.round(bounds.min)));
    divider?.setAttribute('aria-valuemax', String(Math.round(bounds.max)));
    divider?.setAttribute('aria-valuenow', String(next));
    divider?.setAttribute('aria-valuetext', `时间线高度 ${next} 像素`);
  }

  function readTimelineHeight() {
    return workspace.querySelector('.timeline-panel')?.getBoundingClientRect().height || timelineHeight || 250;
  }

  function requestLayout() {
    if (resizeFrame || disposed) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      if (timelineHeight !== null && !document.body.classList.contains('preview-maximized')) setTimelineHeight(timelineHeight);
      render();
    });
  }

  function finishPan(event) {
    if (!panning || event.pointerId !== panning.id) return;
    if (viewer.hasPointerCapture?.(event.pointerId)) viewer.releasePointerCapture(event.pointerId);
    panning = null; viewer.classList.remove('viewport-panning');
  }

  function finishResize(event) {
    if (!resizing || event.pointerId !== resizing.id) return;
    if (divider.hasPointerCapture?.(event.pointerId)) divider.releasePointerCapture(event.pointerId);
    resizing = null; document.body.classList.remove('viewport-resizing');
  }

  on(zoomOut, 'click', () => stepZoom(-1));
  on(zoomIn, 'click', () => stepZoom(1));
  on(fit, 'click', fitScene);
  on(zoomSelect, 'change', () => {
    if (zoomSelect.value === 'fit') fitScene();
    else if (Number.isFinite(Number(zoomSelect.value)) && Number(zoomSelect.value) > 0) setZoom(Number(zoomSelect.value) / 100);
  });
  on(maximize, 'click', () => setMaximized(!document.body.classList.contains('preview-maximized')));
  on(document, 'keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('preview-maximized')) { event.preventDefault(); setMaximized(false); }
  });
  on(viewer, 'wheel', event => {
    if (event.target.closest('#artifact-view')) return;
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    const rect = viewer.getBoundingClientRect();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewer.clientHeight : 1);
    setZoom(scale * Math.exp(-clamp(delta, -300, 300) * .005), { x: event.clientX - rect.left, y: event.clientY - rect.top });
  }, { passive: false });
  on(viewer, 'dblclick', event => {
    if (!event.target.closest('button, input, select, textarea, a, audio, video, #artifact-view')) fitScene();
  });
  on(viewer, 'pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button, input, select, textarea, a, audio, video, #artifact-view') || !viewer.classList.contains('viewport-pannable')) return;
    event.preventDefault();
    panning = { id: event.pointerId, x: event.clientX, y: event.clientY, panX, panY };
    viewer.setPointerCapture(event.pointerId); viewer.classList.add('viewport-panning');
  });
  on(viewer, 'pointermove', event => {
    if (!panning || event.pointerId !== panning.id) return;
    panX = panning.panX + event.clientX - panning.x; panY = panning.panY + event.clientY - panning.y; render();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) on(viewer, type, finishPan);
  on(viewer, 'keydown', event => {
    if (event.target !== viewer) return;
    if (event.key === '+' || event.key === '=') { event.preventDefault(); stepZoom(1); }
    if (event.key === '-') { event.preventDefault(); stepZoom(-1); }
    if (event.key === '0') { event.preventDefault(); fitScene(); }
  });

  if (divider) {
    divider.setAttribute('role', 'separator'); divider.setAttribute('aria-orientation', 'horizontal');
    if (!divider.hasAttribute('tabindex')) divider.tabIndex = 0;
    if (!divider.hasAttribute('aria-label')) divider.setAttribute('aria-label', '调整预览与时间线高度');
    on(divider, 'pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      resizing = { id: event.pointerId, y: event.clientY, height: readTimelineHeight() };
      divider.setPointerCapture(event.pointerId); document.body.classList.add('viewport-resizing');
    });
    on(divider, 'pointermove', event => {
      if (resizing && event.pointerId === resizing.id) setTimelineHeight(resizing.height + resizing.y - event.clientY);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) on(divider, type, finishResize);
    on(divider, 'dblclick', () => setTimelineHeight(250));
    on(divider, 'keydown', event => {
      const step = event.shiftKey ? 60 : 20;
      if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const { min, max } = timelineBounds();
        setTimelineHeight(event.key === 'Home' ? min : event.key === 'End' ? max : readTimelineHeight() + (event.key === 'ArrowUp' ? step : -step));
      }
    });
    const bounds = timelineBounds();
    divider.setAttribute('aria-valuemin', String(Math.round(bounds.min)));
    divider.setAttribute('aria-valuemax', String(Math.round(bounds.max)));
    divider.setAttribute('aria-valuenow', String(Math.round(readTimelineHeight())));
  }

  const observer = new ResizeObserver(requestLayout);
  observer.observe(viewer); observer.observe(workspace);
  on(window, 'resize', requestLayout);
  if (!viewer.hasAttribute('tabindex')) viewer.tabIndex = 0;
  maximize?.setAttribute('aria-pressed', String(document.body.classList.contains('preview-maximized')));
  fitScene();

  return {
    fitScene,
    destroy() {
      disposed = true; cancelAnimationFrame(resizeFrame); observer.disconnect(); cleanup.forEach(dispose => dispose());
      viewer.classList.remove('viewport-panning', 'viewport-pannable'); document.body.classList.remove('viewport-resizing');
    },
  };
}
