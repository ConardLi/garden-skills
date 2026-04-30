import type { PromptCase, Route } from '../../types';
import { SkeletonImg } from '../shared/SkeletonImg';

interface Props {
  c: PromptCase;
  navigate: (r: Route) => void;
  /** When set, the card lays out at a deterministic aspect-ratio for skeletons. */
  ratio?: number;
}

export function CaseCard({ c, navigate, ratio }: Props) {
  const onOpen = () => navigate({ name: 'case', id: c.id });

  return (
    <article
      className={`cc ${!c.has_image ? 'cc-empty' : ''}`}
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={ratio ? ({ '--ratio': String(ratio) } as React.CSSProperties) : undefined}
    >
      <div className="cc-frame">
        {c.has_image ? (
          <SkeletonImg
            src={c.thumb_url ?? c.image_url ?? ''}
            alt={c.title}
            loading="lazy"
            decoding="async"
            className="cc-img"
            accent={c.category_accent}
          />
        ) : (
          <div className="cc-placeholder">
            <div className="cc-placeholder-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="6" width="26" height="20" rx="2" />
                <circle cx="11" cy="13" r="2" />
                <path d="M3 22l7-7 6 5 5-4 8 6" />
              </svg>
            </div>
            <div className="cc-placeholder-tag mono">PROMPT ONLY · 待生成</div>
          </div>
        )}

        <div className="cc-overlay">
          <div className="cc-overlay-tags">
            <span
              className="cc-tag-cat"
              style={{ '--ca': c.category_accent } as React.CSSProperties}
            >
              {c.category_label}
            </span>
            <span className="cc-tag-tpl mono">{c.template_label}</span>
          </div>
          <h3 className="cc-overlay-title serif">{c.title}</h3>
          <div className="cc-overlay-cta mono">
            <span>檢視詳情</span>
            <span aria-hidden="true">→</span>
          </div>
        </div>
      </div>

      <footer className="cc-foot">
        <h4 className="cc-foot-title">{c.title}</h4>
        <div className="cc-foot-meta">
          <span className="cc-foot-cat" style={{ '--ca': c.category_accent } as React.CSSProperties}>
            <span className="cc-foot-dot" /> {c.category_label}
          </span>
          <span className="mono cc-foot-fmt">.{c.format}</span>
        </div>
      </footer>
    </article>
  );
}
