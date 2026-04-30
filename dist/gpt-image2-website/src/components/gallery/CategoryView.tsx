import { useMemo } from 'react';
import type { PromptCase, Route } from '../../types';
import { cases, ORDERED_CATEGORIES } from '../../lib/data';
import { CaseCard } from './CaseCard';

interface Props {
  all: PromptCase[];
  filter: 'all' | 'ready';
  query: string;
  navigate: (r: Route) => void;
}

export function CategoryView({ all, filter, query, navigate }: Props) {
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byCat: Record<string, PromptCase[]> = {};
    for (const c of all) {
      if (filter === 'ready' && !c.has_image) continue;
      if (q) {
        const blob = `${c.title} ${c.brief} ${c.template_label} ${c.category_label}`.toLowerCase();
        if (!blob.includes(q)) continue;
      }
      (byCat[c.category] = byCat[c.category] || []).push(c);
    }
    return byCat;
  }, [all, filter, query]);

  const cats = ORDERED_CATEGORIES.filter((k) => grouped[k] && grouped[k].length);

  if (cats.length === 0) {
    return (
      <div className="gal-empty">
        <div className="serif gal-empty-title">暫無匹配的案例</div>
        <div className="gal-empty-hint">試試其他關鍵詞或切換到「全部」篩選。</div>
      </div>
    );
  }

  return (
    <div className="cat-view">
      {cats.map((catKey, ci) => {
        const meta = cases.categories[catKey];
        const items = grouped[catKey];
        return (
          <section key={catKey} className="cat-sec">
            <header
              className="cat-sec-head"
              style={{ '--ca': meta.accent } as React.CSSProperties}
            >
              <div className="cat-sec-head-l">
                <div className="mono cat-sec-num">
                  {String(ci + 1).padStart(2, '0')} / CATEGORY
                </div>
                <h3 className="cat-sec-title serif">{meta.cn}</h3>
                <div className="mono cat-sec-en">{meta.label}</div>
              </div>
              <div className="cat-sec-head-r">
                <div className="cat-sec-stats">
                  <span className="cat-sec-stats-num serif">{items.length}</span>
                  <span className="mono cat-sec-stats-of">/{meta.total} cases</span>
                </div>
                <div className="cat-sec-line" />
              </div>
            </header>
            <div className="cat-sec-grid">
              {items.map((c) => (
                <CaseCard key={c.id} c={c} navigate={navigate} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
