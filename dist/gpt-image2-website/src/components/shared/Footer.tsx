import type { Route } from '../../types';
import { cases } from '../../lib/data';
import './Footer.css';

interface Props {
  navigate: (r: Route) => void;
}

export function Footer({ navigate }: Props) {
  return (
    <footer className="ftr">
      <div className="ftr-inner">
        <div className="ftr-cta">
          <div className="eyebrow">03 / NEXT</div>
          <h2 className="ftr-cta-title serif">
            想知道每張圖<span className="serif-italic"> 怎麼 </span>來的？
          </h2>
          <p className="ftr-cta-sub">
            這些案例並不是手寫 prompt 湊出來的，而是由 <strong>gpt-image-2 Skill</strong>
            統一排程——選模板、問關鍵引數、渲染最終 prompt、呼叫影象工具。
            點開 Skill 工程介紹，看完整工作流。
          </p>
          <div className="ftr-cta-btns">
            <button
              className="btn btn-primary"
              onClick={() => navigate({ name: 'skills' })}
            >
              <span>檢視 Skill 工程</span>
              <span className="btn-arrow">→</span>
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>回到首頁</span>
              <span className="btn-arrow">↑</span>
            </button>
          </div>
        </div>

        <div className="ftr-stats">
          <Stat n={String(cases.summary.cases)} l="cases" />
          <Stat n={String(cases.summary.templates)} l="templates" />
          <Stat n="17" l="categories" />
          <Stat n="3" l="run modes" />
        </div>
      </div>

      <div className="ftr-bottom">
        <div className="ftr-bottom-inner">
          <div className="mono ftr-meta">
            <span>GPT‑IMAGE 2 · CASE STUDIES</span>
            <span className="ftr-meta-sep" />
            <span>BUILT WITH VITE + REACT</span>
            <span className="ftr-meta-sep" />
            <a
              className="ftr-meta-link"
              href="https://github.com/ConardLi/garden-skills"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Powered by ConardLi/garden-skills"
            >
              POWERED BY <span className="ftr-meta-link-em">garden-skills</span>
            </a>
            <span className="ftr-meta-sep" />
            <span>2026 EDITION</span>
          </div>
          <div className="mono ftr-credit">
            Curated · Indexed · Open for remix.
          </div>
        </div>
      </div>
    </footer>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="ftr-stat">
      <div className="ftr-stat-n serif">{n}</div>
      <div className="mono ftr-stat-l">{l}</div>
    </div>
  );
}
