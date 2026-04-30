import { useMemo, useState } from 'react';
import { cases, ORDERED_CATEGORIES } from '../../lib/data';
import type { PromptCase, Route } from '../../types';
import { MasonryView } from './MasonryView';
import { CategoryView } from './CategoryView';
import './Gallery.css';

type Mode = 'masonry' | 'category';
type Filter = 'all' | 'ready';

interface Props {
  navigate: (r: Route) => void;
}

export function Gallery({ navigate }: Props) {
  const [mode, setMode] = useState<Mode>('masonry');
  const [filter, setFilter] = useState<Filter>('ready');
  const [activeCat, setActiveCat] = useState<string>('all');
  const [query, setQuery] = useState('');

  const allReady = cases.cases.filter((c) => c.has_image);

  const filtered = useMemo<PromptCase[]>(() => {
    let result = filter === 'ready' ? allReady : cases.cases;
    if (activeCat !== 'all') result = result.filter((c) => c.category === activeCat);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.brief.toLowerCase().includes(q) ||
          c.template_label.toLowerCase().includes(q) ||
          c.category_label.toLowerCase().includes(q),
      );
    }
    return result;
  }, [filter, activeCat, query, allReady]);

  return (
    <section className="gal" id="gallery">
      <header className="gal-head">
        <div className="gal-head-left">
          <div className="eyebrow">02 / GALLERY · 案例圖集</div>
          <h2 className="gal-title serif">
            <span>{cases.summary.cases}</span>
            <span className="serif-italic gal-title-em"> handcrafted </span>
            <span>cases</span>
            <span className="gal-title-acc">.</span>
          </h2>
          <p className="gal-sub">
            每個案例都對應 Skill 中的一份模板，引數已經填好；可以直接交給影象
            模型出圖，也可以拿來比較模板的邊界。
          </p>
        </div>

        <div className="gal-head-right">
          <div className="gal-progress">
            <div className="gal-progress-num serif">
              {allReady.length}
              <span className="gal-progress-num-total">/{cases.summary.cases}</span>
            </div>
            <div className="mono gal-progress-label">IMAGES READY · 已生成</div>
            <div className="gal-progress-bar">
              <div
                className="gal-progress-bar-fill"
                style={{ width: `${(allReady.length / cases.summary.cases) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* === Sticky control rail === */}
      <div className="gal-rail">
        <div className="gal-rail-inner">
          {/* Mode toggle */}
          <div className="gal-toggle" role="tablist" aria-label="View mode">
            <button
              role="tab"
              aria-selected={mode === 'masonry'}
              className={`gal-toggle-btn ${mode === 'masonry' ? 'gal-toggle-on' : ''}`}
              onClick={() => setMode('masonry')}
            >
              <ToggleIcon kind="masonry" /> 瀑布流
            </button>
            <button
              role="tab"
              aria-selected={mode === 'category'}
              className={`gal-toggle-btn ${mode === 'category' ? 'gal-toggle-on' : ''}`}
              onClick={() => setMode('category')}
            >
              <ToggleIcon kind="category" /> 分類檢視
            </button>
          </div>

          {/* Filter chips */}
          <div className="gal-chips">
            <button
              className={`gal-chip ${filter === 'ready' ? 'gal-chip-on' : ''}`}
              onClick={() => setFilter('ready')}
            >
              <span className="gal-chip-dot" /> 已生成
              <span className="gal-chip-count mono">{allReady.length}</span>
            </button>
            <button
              className={`gal-chip ${filter === 'all' ? 'gal-chip-on' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部
              <span className="gal-chip-count mono">{cases.summary.cases}</span>
            </button>
          </div>

          {/* Search */}
          <label className="gal-search">
            <SearchIcon />
            <input
              type="search"
              placeholder="搜尋標題 / 模板 / 分類…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="gal-search-clear"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>
        </div>

        {/* Category strip — only in masonry mode. Sits in its own
            max-width 1480px container so it aligns with the head/title and
            wraps to a new row when there are too many categories to fit. */}
        {mode === 'masonry' && (
          <div className="gal-cat-wrap">
            <div className="gal-cat-strip">
              <button
                className={`gal-cat ${activeCat === 'all' ? 'gal-cat-on' : ''}`}
                onClick={() => setActiveCat('all')}
              >
                全部
                <span className="mono gal-cat-num">{filter === 'ready' ? allReady.length : cases.summary.cases}</span>
              </button>
              {ORDERED_CATEGORIES.map((key) => {
                const c = cases.categories[key];
                if (!c) return null;
                const count = filter === 'ready' ? c.ready : c.total;
                return (
                  <button
                    key={key}
                    className={`gal-cat ${activeCat === key ? 'gal-cat-on' : ''}`}
                    onClick={() => setActiveCat(key)}
                    style={{ '--cat-acc': c.accent } as React.CSSProperties}
                  >
                    {c.cn}
                    <span className="mono gal-cat-num">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* === Body === */}
      {mode === 'masonry' ? (
        <MasonryView items={filtered} navigate={navigate} />
      ) : (
        <CategoryView
          all={cases.cases}
          filter={filter}
          query={query}
          navigate={navigate}
        />
      )}
    </section>
  );
}

function ToggleIcon({ kind }: { kind: 'masonry' | 'category' }) {
  return kind === 'masonry' ? (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="0" width="6" height="9" rx="1" />
      <rect x="8" y="0" width="6" height="6" rx="1" />
      <rect x="0" y="11" width="6" height="3" rx="1" />
      <rect x="8" y="8" width="6" height="6" rx="1" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="1" width="14" height="2" rx="1" />
      <rect x="0" y="6" width="14" height="2" rx="1" />
      <rect x="0" y="11" width="14" height="2" rx="1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="4.5" />
      <path d="M9.5 9.5 13 13" strokeLinecap="round" />
    </svg>
  );
}
