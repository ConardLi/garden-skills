import { useEffect, useState, useCallback } from 'react';
import type { Route } from '../types';

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (!h) return { name: 'home' };
  if (h === 'skills') return { name: 'skills' };
  if (h === 'workbench') return { name: 'workbench' };
  if (h.startsWith('workbench/')) {
    const templateId = decodeURIComponent(h.slice('workbench/'.length));
    return { name: 'workbench', templateId };
  }
  if (h === 'prompt-studio') return { name: 'promptStudio' };
  if (h === 'prompt-studio/uiux') return { name: 'uiuxStudio' };
  if (h.startsWith('case/')) {
    const id = decodeURIComponent(h.slice('case/'.length));
    return { name: 'case', id };
  }
  return { name: 'home' };
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '';
    case 'skills':
      return '#/skills';
    case 'workbench':
      return route.templateId ? `#/workbench/${encodeURIComponent(route.templateId)}` : '#/workbench';
    case 'promptStudio':
      return '#/prompt-studio';
    case 'uiuxStudio':
      return '#/prompt-studio/uiux';
    case 'case':
      return `#/case/${encodeURIComponent(route.id)}`;
  }
}

export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('popstate', onChange);
    };
  }, []);

  // Use history.pushState rather than assigning to window.location.hash.
  //
  // Why this matters: when you set `window.location.hash = ''`, the browser
  // treats it as a fragment navigation and will scroll the document to the
  // top (since there is no anchor target). That makes the page snap back to
  // the Hero whenever a case-detail overlay is closed. history.pushState
  // changes the URL without any auto-scroll, and we then dispatch our own
  // synthetic hashchange so the rest of the app reacts the usual way.
  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next);
    const targetUrl =
      window.location.pathname +
      window.location.search +
      hash;
    const currentUrl =
      window.location.pathname +
      window.location.search +
      window.location.hash;

    if (targetUrl === currentUrl) {
      // Same URL — just sync state (also covers the empty-hash equality case).
      setRoute(next);
      return;
    }

    window.history.pushState(null, '', targetUrl);
    // Synchronously update React state; we don't rely on hashchange because
    // pushState alone doesn't fire it.
    setRoute(next);
  }, []);

  return [route, navigate];
}
