import { useEffect, useMemo, useState } from 'react';
import type { Route } from '../../types';
import { cases, ORDERED_CATEGORIES } from '../../lib/data';
import './SkillsPage.css';

interface Props {
  navigate: (r: Route) => void;
}

const REPO_URL = 'https://github.com/ConardLi/garden-skills';
const SKILL_TREE_URL = `${REPO_URL}/tree/main/skills/gpt-image-2`;

const MODES = [
  {
    tag: 'A',
    name: 'Garden 本地',
    eyebrow: 'FULL CONTROL',
    trigger: (
      <>
        <code>ENABLE_GARDEN_IMAGEGEN=1</code>
        <span className="and">AND</span>
        <code>Playwright / OpenCLI</code>
      </>
    ),
    body: '完整跑通 選模板 → 渲染 prompt → 調自動化指令碼（無 API Key，由 Playwright 自動操作瀏覽器抓取） → 出圖落盤。',
    flow: [
      'scripts/check-mode.js',
      'references/<cat>/<tpl>.md',
      'npm run auto:single:pw',
      'public/case/<cat>/<tpl>/*.png',
    ],
  },
  {
    tag: 'B',
    name: 'Host‑Native',
    eyebrow: 'DELEGATED',
    trigger: (
      <>
        <code>ENABLE_GARDEN_IMAGEGEN</code>
        <span className="and">未啟用</span>
        <span>·</span>
        <span>宿主自帶 image_generation</span>
      </>
    ),
    body: '本 Skill 退化成提示詞工程指引；最終 prompt 交給 ChatGPT / Codex / Gemini / Cursor 等宿主自己的 image 工具。',
    flow: [
      'scripts/check-mode.js',
      'references/<cat>/<tpl>.md',
      '宿主 image_generation()',
      '由宿主決定儲存位置',
    ],
  },
  {
    tag: 'C',
    name: 'Advisor 顧問',
    eyebrow: 'PROMPT ONLY',
    trigger: (
      <>
        <code>ENABLE_GARDEN_IMAGEGEN</code>
        <span className="and">未啟用</span>
        <span>·</span>
        <span>宿主無影象工具</span>
      </>
    ),
    body: '退化成 prompt 顧問。最終 prompt 寫好後，交給使用者在 ChatGPT / Midjourney / DALL·E / Sora / Nano Banana 等任意工具中執行。',
    flow: [
      'scripts/check-mode.js',
      'references/<cat>/<tpl>.md',
      '渲染後的 prompt（儲存 + 展示）',
      '由使用者拿去執行',
    ],
  },
];

const STEPS = [
  {
    n: '01',
    title: '探測執行模式',
    body: '任何任務的第一步：跑 check-mode.js，得到 A / B / C，決定後續走哪條分支。',
    code: 'node skills/gpt-image-2/scripts/check-mode.js --json',
  },
  {
    n: '02',
    title: '識別視覺型別',
    body: '判斷任務屬於 18 個分類中的哪一個（海報 / UI / 產品 / 學術圖 / 資訊圖 / 編輯工作流 …）。',
    code: null,
  },
  {
    n: '03',
    title: '只讀最近的一份模板',
    body: '從 references/ 中按 <category>/<template>.md 的層級，僅開啟當前任務最貼近的那一份模板。',
    code: 'references/poster-and-campaigns/banner-hero.md',
  },
  {
    n: '04',
    title: '把使用者輸入對映到欄位',
    body: 'JSON 模板裡 {argument …} 是可填空位；使用者給了什麼填什麼，default 可兜底，關鍵資訊缺失時才發起精確詢問。',
    code: null,
  },
  {
    n: '05',
    title: '渲染最終 prompt',
    body: '拍平 JSON 或保留結構化自然語言段落（部分 hand-drawn / scientific 模板），輸出可直接餵給影象模型的字串。',
    code: null,
  },
  {
    n: '06',
    title: '按模式分叉執行',
    body: 'Mode A 調指令碼出圖、Mode B 調宿主工具、Mode C 把 prompt 給使用者。一句話總結：當前模式 / prompt 落點 / 圖片落點。',
    code: null,
  },
];

const CONSTRAINTS = [
  {
    eyebrow: '保持',
    title: '嚴格按模板格式渲染',
    body: 'JSON 模板就按 JSON 輸出；結構化自然語言模板按段落輸出。不要把 SKILL.md 裡的"模式說明"塞進最終 prompt——那是給 Agent 看的元資訊。',
  },
  {
    eyebrow: '禁止',
    title: '虛構定量資料',
    body: '學術配圖 / 技術圖示中，數值、座標軸、等值線、色標範圍、公式必須真實，沒有資料就直接交白圖、不杜撰。',
  },
  {
    eyebrow: '推薦',
    title: '只讀取最近的一份模板',
    body: '不要一次性讀整個 references/。按 <category>/<template>.md 的兩級層級，只開啟當前任務最貼近的那一份。',
  },
  {
    eyebrow: '推薦',
    title: 'Prompt 永遠落盤',
    body: 'A 必須、B 推薦、C 必須，命名形如 garden-gpt-image-2/prompt/<task-slug>-<YYYYMMDD-HHMMSS>.md，方便複用與版本管理。',
  },
];

export function SkillsPage({ navigate }: Props) {
  const [activeMode, setActiveMode] = useState<'A' | 'B' | 'C'>('A');

  useEffect(() => {
    document.title = 'Skill · GPT‑IMAGE 2 Toolkit';
    return () => {
      document.title = 'GPT-IMAGE 2 · The Visual Production Model';
    };
  }, []);

  const tplsByCat = useMemo(() => {
    const map: Record<string, { label: string; key: string }[]> = {};
    for (const t of Object.values(cases.templates)) {
      (map[t.category] ||= []).push({ label: t.label, key: t.key });
    }
    return map;
  }, []);

  return (
    <main className="sp">
      {/* === HERO === */}
      <header className="sp-hero">
        <button className="sp-back" onClick={() => navigate({ name: 'home' })}>
          <span aria-hidden="true">←</span> Back to Gallery
        </button>

        <div className="sp-hero-meta mono">
          <span>03 / SKILL DOCS</span>
          <span className="sp-meta-sep" />
          <span>GPT‑IMAGE 2 TOOLKIT</span>
          <span className="sp-meta-sep" />
          <span>v1 · {new Date().getFullYear()}</span>
          <span className="sp-meta-sep" />
          <a
            className="sp-hero-source"
            href={SKILL_TREE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub: ConardLi/garden-skills"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.96 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.08-1.87 3.76-3.65 3.96.29.25.54.74.54 1.49v2.21c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            <span>SOURCE · ConardLi/garden-skills</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <h1 className="sp-hero-title serif">
          A <span className="serif-italic">focused</span> Skill
          <br />
          for one model. Three runtimes.
        </h1>

        <p className="sp-hero-lede">
          這是一個面向 GPT‑Image‑2 的<strong>聚焦型</strong>技能。它只做兩件事——
          生成 (<code className="mono">/images/generations</code>) 和編輯
          (<code className="mono">/images/edits</code>)；
          但能在 Garden 本地、Host‑Native 委託、Advisor 顧問 三種環境下自適應地工作，
          並把 {Object.keys(cases.categories).length} 大類、{cases.summary.templates}+ 個結構化模板沉澱到 <code className="mono">references/</code> 裡。
        </p>

        <dl className="sp-hero-stats">
          <div className="sp-hero-stat">
            <dt className="mono">RUNTIME MODES</dt>
            <dd className="serif">3</dd>
          </div>
          <div className="sp-hero-stat">
            <dt className="mono">CATEGORIES</dt>
            <dd className="serif">{Object.keys(cases.categories).length}</dd>
          </div>
          <div className="sp-hero-stat">
            <dt className="mono">TEMPLATES</dt>
            <dd className="serif">{cases.summary.templates}</dd>
          </div>
          <div className="sp-hero-stat">
            <dt className="mono">CASES SHIPPED</dt>
            <dd className="serif">{cases.summary.cases}</dd>
          </div>
        </dl>

        <div className="sp-hero-divider" />

        <p className="sp-hero-quote serif-italic">
          “最終交給影象模型的，永遠是渲染後的 prompt 字串本身——
          可以是拍平的 JSON，也可以是結構化自然語言段落。”
        </p>
      </header>

      {/* === MODES === */}
      <section className="sp-section sp-modes">
        <div className="sp-section-head">
          <span className="eyebrow">01 · RUNTIME MODES</span>
          <h2 className="serif sp-section-title">第一步永遠是 check‑mode.js</h2>
          <p className="sp-section-sub">
            同一份 Skill，在三種環境下行為差異顯著。模式由兩個環境變數與宿主能力共同決定，
            check‑mode.js 給出 <code className="mono">mode = A / A? / B-or-C</code> 與建議下一步。
          </p>
        </div>

        <div className="sp-mode-tabs" role="tablist">
          {MODES.map((m) => (
            <button
              key={m.tag}
              role="tab"
              aria-selected={activeMode === m.tag}
              className={`sp-mode-tab ${activeMode === m.tag ? 'sp-mode-tab-on' : ''}`}
              onClick={() => setActiveMode(m.tag as 'A' | 'B' | 'C')}
            >
              <span className="sp-mode-tab-tag mono">MODE {m.tag}</span>
              <span className="sp-mode-tab-name">{m.name}</span>
            </button>
          ))}
        </div>

        <div className="sp-mode-cards">
          {MODES.map((m) => (
            <article
              key={m.tag}
              className={`sp-mode-card ${activeMode === m.tag ? 'sp-mode-card-on' : ''}`}
              onMouseEnter={() => setActiveMode(m.tag as 'A' | 'B' | 'C')}
            >
              <header className="sp-mode-card-head">
                <span className="sp-mode-card-tag mono">{m.tag}</span>
                <div>
                  <div className="mono sp-mode-card-eyebrow">{m.eyebrow}</div>
                  <div className="serif sp-mode-card-name">{m.name}</div>
                </div>
              </header>
              <div className="sp-mode-card-trigger mono">{m.trigger}</div>
              <p className="sp-mode-card-body">{m.body}</p>
              <ol className="sp-mode-card-flow">
                {m.flow.map((step, i) => (
                  <li key={i} className="sp-mode-card-flow-item">
                    <span className="mono sp-mode-card-flow-n">{String(i + 1).padStart(2, '0')}</span>
                    <code className="mono">{step}</code>
                  </li>
                ))}
              </ol>
              {m.tag === 'C' && (
                <button 
                  className="sp-mode-card-try-it-btn"
                  onClick={() => navigate({ name: 'promptStudio' })}
                >
                  <span>立即試用 Prompt Studio</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* === WORKFLOW === */}
      <section className="sp-section sp-workflow">
        <div className="sp-section-head">
          <span className="eyebrow">02 · WORKFLOW</span>
          <h2 className="serif sp-section-title">六步通用 · 第七步分叉</h2>
          <p className="sp-section-sub">
            無論 A / B / C，前 6 步完全一致；區別只在第 7‑8 步如何把渲染好的 prompt
            送進影象模型，以及落盤到哪裡。
          </p>
        </div>

        <ol className="sp-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="sp-step">
              <div className="sp-step-meta">
                <span className="mono sp-step-n">{s.n}</span>
                <span className="sp-step-line" />
              </div>
              <div className="sp-step-body">
                <h3 className="serif sp-step-title">{s.title}</h3>
                <p className="sp-step-desc">{s.body}</p>
                {s.code && (
                  <pre className="mono sp-step-code"><code>{s.code}</code></pre>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="sp-fork">
          <div className="sp-fork-head">
            <span className="eyebrow">FORK · STEP 07</span>
            <h3 className="serif sp-fork-title">prompt 渲染好之後，按模式分發</h3>
          </div>
          <div className="sp-fork-grid">
            <div className="sp-fork-cell">
              <span className="mono sp-fork-tag">07‑A</span>
              <h4 className="serif sp-fork-name">儲存 + 調指令碼</h4>
              <p>把最終 prompt 儲存到 <code className="mono">prompt/</code>，調 <code className="mono">generate.js</code> / <code className="mono">edit.js</code>，圖片落到 <code className="mono">image/</code>。</p>
            </div>
            <div className="sp-fork-cell">
              <span className="mono sp-fork-tag">07‑B</span>
              <h4 className="serif sp-fork-name">交給宿主工具</h4>
              <p>不要調 <code className="mono">generate.js</code>（必失敗）。直接把 prompt 喂進宿主自帶的 <code className="mono">image_generation</code> 類工具。</p>
            </div>
            <div className="sp-fork-cell">
              <span className="mono sp-fork-tag">07‑C</span>
              <h4 className="serif sp-fork-name">寫給使用者</h4>
              <p>必須儲存 prompt 到 <code className="mono">prompt/</code> 並在對話中完整展示，附一句"如何使用 / 推薦工具"。</p>
            </div>
          </div>
        </div>
      </section>

      {/* === TEMPLATE INDEX === */}
      <section className="sp-section sp-index">
        <div className="sp-section-head">
          <span className="eyebrow">03 · TEMPLATE INDEX</span>
          <h2 className="serif sp-section-title">
            {Object.keys(cases.categories).length} 個分類 · {cases.summary.templates} 個結構化模板
          </h2>
          <p className="sp-section-sub">
            每個模板都是一份 Markdown 檔案，裡面定義了 JSON / 結構化自然語言模板、
            引數列、變體說明、典型案例。點任意模板可以跳到使用了它的圖集。
          </p>
        </div>

        <div className="sp-index-grid">
          {ORDERED_CATEGORIES.map((catKey, idx) => {
            const cat = cases.categories[catKey];
            if (!cat) return null;
            const tpls = tplsByCat[catKey] || [];
            return (
              <article
                key={catKey}
                className="sp-cat"
                style={{ '--cat-acc': cat.accent } as React.CSSProperties}
              >
                <header className="sp-cat-head">
                  <span className="mono sp-cat-n">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="sp-cat-stack">
                    <h3 className="serif sp-cat-name">{cat.cn}</h3>
                    <span className="mono sp-cat-en">{cat.label}</span>
                  </div>
                  <div className="sp-cat-stat mono">
                    <span className="sp-cat-stat-num">{tpls.length}</span>
                    <span className="sp-cat-stat-x">×</span>
                    <span className="sp-cat-stat-num">{cat.total}</span>
                  </div>
                </header>
                <ul className="sp-cat-tpls">
                  {tpls.map((t) => (
                    <li key={t.key} className="sp-cat-tpl">
                      <span className="sp-cat-tpl-bullet" />
                      <span className="sp-cat-tpl-label">{t.label}</span>
                      <button 
                        className="sp-cat-tpl-wb" 
                        onClick={() => navigate({ name: 'workbench', templateId: t.key })}
                        title="在工作台中開啟"
                      >
                        🛠️
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* === CONSTRAINTS === */}
      <section className="sp-section sp-rules">
        <div className="sp-section-head">
          <span className="eyebrow">04 · GUARDRAILS</span>
          <h2 className="serif sp-section-title">讓 Skill 始終保持穩定的幾條硬約束</h2>
        </div>
        <div className="sp-rules-grid">
          {CONSTRAINTS.map((c, i) => (
            <article key={i} className="sp-rule">
              <span className="mono sp-rule-eyebrow">{c.eyebrow}</span>
              <h3 className="serif sp-rule-title">{c.title}</h3>
              <p className="sp-rule-body">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* === CTA === */}
      <section className="sp-cta">
        <div className="sp-cta-text">
          <h3 className="serif sp-cta-title">
            準備好了？回去看 <span className="serif-italic">{cases.summary.cases} 張</span> 已經跑通的圖。
          </h3>
          <p className="sp-cta-sub">
            想自己跑這個 Skill？原始碼 / 模板 / 三種執行模式都開源在 <code className="mono">ConardLi/garden-skills</code>。
          </p>
        </div>
        <div className="sp-cta-actions">
          <button
            className="sp-cta-btn"
            onClick={() => navigate({ name: 'home' })}
          >
            <span>瀏覽圖集</span>
            <span className="sp-cta-btn-arrow" aria-hidden="true">→</span>
          </button>
          <a
            className="sp-cta-btn sp-cta-btn-ghost"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.96 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.08-1.87 3.76-3.65 3.96.29.25.54.74.54 1.49v2.21c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            <span>Star on GitHub</span>
            <span className="sp-cta-btn-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}
