import { useMemo } from 'react';
import type { PromptCase, Route } from '../../types';
import { CaseCard } from './CaseCard';
import './gallery-views.css';

interface Props {
  items: PromptCase[];
  navigate: (r: Route) => void;
}

export function MasonryView({ items, navigate }: Props) {
  // Distribute into N columns (CSS columns approach for true masonry, but we
  // prefer JS distribution so each column packs tightly without orphan tails).
  const columns = useMemo(() => {
    return items;
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="gal-empty">
        <div className="serif gal-empty-title">暫無匹配的案例</div>
        <div className="gal-empty-hint">試試其他關鍵詞或切換到「全部」篩選。</div>
      </div>
    );
  }

  return (
    <div className="masonry">
      {columns.map((c, i) => (
        <CaseCard
          key={c.id}
          c={c}
          navigate={navigate}
          ratio={ratioFor(c, i)}
        />
      ))}
    </div>
  );
}

// Deterministic pseudo-random ratio so the placeholder layout doesn't reflow.
function ratioFor(c: PromptCase, i: number) {
  const ratios = [4 / 5, 3 / 4, 1 / 1, 4 / 3, 16 / 10];
  // Hash the id to pick stable ratio.
  let h = 0;
  for (let k = 0; k < c.id.length; k++) {
    h = (h * 31 + c.id.charCodeAt(k)) >>> 0;
  }
  return ratios[(h + i) % ratios.length];
}
