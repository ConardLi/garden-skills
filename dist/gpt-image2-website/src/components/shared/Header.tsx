import { useEffect, useState } from 'react';
import type { Route } from '../../types';
import './Header.css';

interface Props {
  route: Route;
  navigate: (r: Route) => void;
}

export function Header({ route, navigate }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onHome = route.name === 'home';

  return (
    <header className={`hdr ${scrolled ? 'hdr-scrolled' : ''}`}>
      <div className="hdr-inner">
        <button
          className="hdr-brand"
          onClick={() => navigate({ name: 'home' })}
          aria-label="Back to home"
        >
          <span className="hdr-mark" aria-hidden="true">
            <em>g</em>
          </span>
          <span className="hdr-wordmark">
            <span className="hdr-wm-1">GPT</span>
            <span className="hdr-wm-x">·</span>
            <span className="hdr-wm-2">IMAGE 2</span>
          </span>
          <span className="hdr-tag mono">CASE STUDIES</span>
        </button>

        <nav className="hdr-nav">
          <button
            className={`hdr-link ${onHome ? 'hdr-link-active' : ''}`}
            onClick={() => {
              navigate({ name: 'home' });
              setTimeout(() => {
                document
                  .getElementById('hero')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
          >
            概覽
          </button>
          <button
            className="hdr-link"
            onClick={() => {
              if (route.name !== 'home') navigate({ name: 'home' });
              setTimeout(() => {
                document
                  .getElementById('gallery')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }, 60);
            }}
          >
            圖集
          </button>
          <button
            className={`hdr-link ${route.name === 'skills' ? 'hdr-link-active' : ''}`}
            onClick={() => navigate({ name: 'skills' })}
          >
            Skill
          </button>
          <a
            className="hdr-link hdr-ext"
            href="https://github.com/ConardLi/garden-skills/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View garden-skills on GitHub"
          >
            <svg
              className="hdr-gh"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.96 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.08-1.87 3.76-3.65 3.96.29.25.54.74.54 1.49v2.21c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
            </svg>
            <span>GitHub</span>
            <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
