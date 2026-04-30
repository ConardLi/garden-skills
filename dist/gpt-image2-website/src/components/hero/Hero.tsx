import { useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from '../../types';
import { cases } from '../../lib/data';
import { ModelCard } from './ModelCard';
import { AutomationPanel } from '../shared/AutomationPanel';
import './Hero.css';

interface Props {
  navigate: (r: Route) => void;
}

const TICKER = [
  'TEXT RENDERING',
  '多語言版式',
  'IMAGE EDITING',
  '高保真參考圖',
  'POSTER · UI · INFOGRAPHIC',
  '4K 輸出',
  'API · CHATGPT · LOVART',
  '70+ STRUCTURED TEMPLATES',
];

const TILES = 8;

// Per-tile parallax multipliers (in px). Kept consistent with the original
// hand-tuned mosaic layout so the eye still falls into the headline.
const PARALLAX: Array<[number, number]> = [
  [-22, -14],
  [20, -16],
  [-12, 8],
  [18, 10],
  [-16, 14],
  [14, 18],
  [-8, -10],
  [8, 12],
];
const ROTS = [-6, 4, -3, 7, -5, 5, -4, 6];

interface TileState {
  a: string;
  b: string;
  topIsA: boolean;
  rotKey: number; // bumped each rotation so the consumer can pulse
}

export function Hero({ navigate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // === Curated pool ===
  // We hand-pick a lead order so the first paint is intentional, then fill
  // the remainder of the pool with diverse ready images. Tiles will rotate
  // through this pool, never repeating an image that's already on screen.
  const pool = useMemo(() => {
    const ready = cases.cases.filter((c) => c.has_image && c.image_url);
    const preferred = [
      'product-visuals/exploded-view-poster/1',
      'poster-and-campaigns/banner-hero/2',
      'avatars-and-profile/cultural-portrait-series/2',
      'storyboards-and-sequences/four-panel-comic/1',
      'academic-figures/method-pipeline-overview/2',
      'grids-and-collages/banner-grid-2x2/1',
      'infographics/bento-grid-infographic/1',
      'portraits-and-characters/professional-portrait/1',
    ];

    const picked: typeof ready = [];
    const pickedIds = new Set<string>();

    for (const id of preferred) {
      const m = ready.find((r) => r.id === id);
      if (m && !pickedIds.has(m.id)) {
        picked.push(m);
        pickedIds.add(m.id);
      }
    }
    // Round-robin by category to keep the pool visually diverse.
    const byCat: Record<string, typeof ready> = {};
    for (const r of ready) (byCat[r.category] ||= []).push(r);
    const cats = Object.keys(byCat);
    let cycleSafety = 0;
    while (picked.length < 32 && cycleSafety < cats.length * 8) {
      for (const cat of cats) {
        if (picked.length >= 32) break;
        const next = byCat[cat].find((r) => !pickedIds.has(r.id));
        if (next) {
          picked.push(next);
          pickedIds.add(next.id);
        }
      }
      cycleSafety++;
    }
    // Prefer the compressed thumbnail — the hero mosaic only ever renders
    // each tile at ~280px so the 800px WebP is plenty.
    return picked.map((p) => p.thumb_url ?? p.image_url ?? '').filter(Boolean);
  }, []);

  // === Initial tile state ===
  // Each tile shows one image on layer A; layer B is pre-loaded with a
  // different image so the very first crossfade is seamless.
  const [tiles, setTiles] = useState<TileState[]>(() => {
    if (pool.length === 0) {
      return Array.from({ length: TILES }, () => ({
        a: '',
        b: '',
        topIsA: true,
        rotKey: 0,
      }));
    }
    return Array.from({ length: TILES }, (_, i) => ({
      a: pool[i % pool.length],
      b: pool[(i + TILES) % pool.length],
      topIsA: true,
      rotKey: 0,
    }));
  });

  // Track currently-shown pool indices per layer so we can avoid repeats.
  const tilePoolIdx = useRef<{ a: number; b: number }[]>(
    Array.from({ length: TILES }, (_, i) => ({
      a: i % Math.max(pool.length, 1),
      b: (i + TILES) % Math.max(pool.length, 1),
    })),
  );

  // Per-tile "first image is decoded" flag — flips true the first time any
  // image in the tile fires onLoad. Until then we render a friendly skeleton.
  const [tilesReady, setTilesReady] = useState<boolean[]>(() =>
    Array.from({ length: TILES }, () => false),
  );
  const markTileReady = (i: number) => {
    setTilesReady((prev) => {
      if (prev[i]) return prev;
      const next = prev.slice();
      next[i] = true;
      return next;
    });
  };
  const lastRotatedRef = useRef<number>(-1);

  // === The organic rotator ===
  // Every ~3.5s, pick one tile (never the same as last time) and swap its
  // currently-hidden layer to a fresh image from the pool, then flip which
  // layer is on top. CSS handles the crossfade. This is intentionally NOT
  // a synchronized carousel: tiles change one at a time, in a non-repeating
  // random order, with a slight rhythmic jitter.
  useEffect(() => {
    if (pool.length <= TILES) return;

    let timer: number;

    const schedule = () => {
      // 3.2-4.2s jitter so it never feels metronomic
      const delay = 3200 + Math.random() * 1000;
      timer = window.setTimeout(rotate, delay);
    };

    const rotate = () => {
      let ti: number;
      do {
        ti = Math.floor(Math.random() * TILES);
      } while (ti === lastRotatedRef.current && TILES > 1);
      lastRotatedRef.current = ti;

      // Avoid any pool index currently visible on any tile.
      const used = new Set<number>();
      for (const s of tilePoolIdx.current) {
        used.add(s.a);
        used.add(s.b);
      }
      let pi = -1;
      for (let attempt = 0; attempt < 24; attempt++) {
        const candidate = Math.floor(Math.random() * pool.length);
        if (!used.has(candidate)) {
          pi = candidate;
          break;
        }
      }
      if (pi === -1) pi = Math.floor(Math.random() * pool.length);

      const newSrc = pool[pi];

      setTiles((prev) =>
        prev.map((t, i) => {
          if (i !== ti) return t;
          if (t.topIsA) {
            tilePoolIdx.current[i] = {
              a: tilePoolIdx.current[i].a,
              b: pi,
            };
            return { ...t, b: newSrc, topIsA: false, rotKey: t.rotKey + 1 };
          } else {
            tilePoolIdx.current[i] = {
              a: pi,
              b: tilePoolIdx.current[i].b,
            };
            return { ...t, a: newSrc, topIsA: true, rotKey: t.rotKey + 1 };
          }
        }),
      );

      schedule();
    };

    schedule();
    return () => window.clearTimeout(timer);
  }, [pool]);

  // === Parallax ===
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--mx', `${x}`);
      el.style.setProperty('--my', `${y}`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      <div className="hero-ticker" aria-hidden="true">
        <div className="hero-ticker-track mono">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="hero-ticker-item">
              <span className="hero-ticker-dot" /> {t}
            </span>
          ))}
        </div>
      </div>

      <section className="hero" id="hero" ref={heroRef}>
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />

        {/* === Floating mosaic — drifts behind the headline === */}
        <div className="hero-mosaic" aria-hidden="true">
          {tiles.map((t, i) => (
            <div
              key={i}
              className={`hero-mosaic-slot hero-mosaic-slot-${i}`}
              style={{ '--i': i } as React.CSSProperties}
            >
              <figure
                className="hero-mosaic-tile"
                data-rotkey={t.rotKey}
                style={
                  {
                    '--rot': `${ROTS[i]}deg`,
                    '--px': `${PARALLAX[i][0]}px`,
                    '--py': `${PARALLAX[i][1]}px`,
                  } as React.CSSProperties
                }
              >
                {!tilesReady[i] && (
                  <span className="cs-skel hero-mosaic-skel" aria-hidden="true">
                    <svg
                      className="cs-skel-icon"
                      viewBox="0 0 32 32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      aria-hidden="true"
                    >
                      <rect x="3" y="6" width="26" height="20" rx="2" />
                      <circle cx="11" cy="13" r="2" />
                      <path d="M3 22l7-7 6 5 5-4 8 6" />
                    </svg>
                  </span>
                )}
                <img
                  className={`hero-mosaic-img ${t.topIsA ? 'hero-mosaic-img-on' : ''}`}
                  src={t.a}
                  alt=""
                  loading={i < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  onLoad={() => markTileReady(i)}
                />
                <img
                  className={`hero-mosaic-img ${!t.topIsA ? 'hero-mosaic-img-on' : ''}`}
                  src={t.b}
                  alt=""
                  loading={i < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  onLoad={() => markTileReady(i)}
                />
                <span className="hero-mosaic-frame" aria-hidden="true" />
              </figure>
            </div>
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-meta mono">
            <span>OPENAI · CHATGPT IMAGES 2.0</span>
            <span className="hero-meta-sep" />
            <span>RELEASED 2026.04.21</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-title-row hero-title-row-1">
              <span className="serif-italic hero-title-the">The</span>
              <span className="serif hero-title-visual">Visual</span>
            </span>
            <span className="hero-title-row hero-title-row-2">
              <span className="serif hero-title-prod">
                <span className="hero-title-prod-prod">Production</span>
                <span className="hero-title-prod-amp serif-italic">&</span>
                <span className="hero-title-prod-prod">Editing</span>
              </span>
            </span>
            <span className="hero-title-row hero-title-row-3">
              <span className="hero-title-model serif">Model.</span>
            </span>
          </h1>

          <p className="hero-lede">
            從「猜一張好看的圖」走到「理解一個視覺任務，並交付成品」。
            <span className="hero-lede-em">GPT‑Image‑2</span>{' '}
            把文字渲染、指令遵循、參考圖編輯與跨語言版式打包成一個可被工作流真正使用的視覺模型。
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num serif">{cases.summary.cases}</div>
              <div className="hero-stat-label mono">CASE STUDIES</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num serif">
                {cases.summary.templates}
              </div>
              <div className="hero-stat-label mono">PROMPT TEMPLATES</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num serif">
                {Object.keys(cases.categories).length}
              </div>
              <div className="hero-stat-label mono">CATEGORIES</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num serif">
                4K<span className="hero-stat-sup">*</span>
              </div>
              <div className="hero-stat-label mono">MAX OUTPUT</div>
            </div>
          </div>

          <div className="hero-cta">
            <button
              className="btn btn-primary"
              onClick={() => navigate({ name: 'promptStudio' })}
            >
              <span>進入 Prompt Studio</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => navigate({ name: 'workbench' })}
            >
              <span>進入提示詞工作台 (Legacy)</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                document
                  .getElementById('gallery')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>瀏覽圖集</span>
              <span className="btn-arrow" aria-hidden="true">
                ↓
              </span>
            </button>
            <button
              className="btn btn-ghost-2"
              onClick={() => navigate({ name: 'skills' })}
            >
              <span>檢視技能知識庫</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>

          {expanded && <AutomationPanel />}

          <div className="hero-scroll-hint mono" aria-hidden="true">
            <span className="hero-scroll-line" />
            SCROLL · 滾動瀏覽
          </div>
        </div>

        <ModelCard expanded={expanded} onClose={() => setExpanded(false)} />
      </section>
    </>
  );
}
