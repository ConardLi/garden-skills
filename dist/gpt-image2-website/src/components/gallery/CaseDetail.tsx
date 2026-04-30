import { useEffect, useMemo, useState } from 'react';
import type { Route } from '../../types';
import { cases, getCase, getRelatedCases } from '../../lib/data';
import { SkeletonImg } from '../shared/SkeletonImg';
import './CaseDetail.css';

interface Props {
  id: string;
  navigate: (r: Route) => void;
}

type Tab = 'prompt' | 'template' | 'usage';

export function CaseDetail({ id, navigate }: Props) {
  const c = getCase(id);
  const tpl = c ? cases.templates[c.template_key] : null;
  const related = c ? getRelatedCases(c.id) : [];
  const [tab, setTab] = useState<Tab>('prompt');
  const [copied, setCopied] = useState(false);
  // Progressive image load: show the (already-cached) thumb instantly, then
  // crossfade to the full PNG once it decodes. Reset on case change.
  const [fullLoaded, setFullLoaded] = useState(false);
  useEffect(() => {
    setFullLoaded(false);
  }, [id]);

  // Prev / next within the same flat list (filtered by has_image to keep
  // browsing usable when toggling between cases).
  const [prev, next] = useMemo(() => {
    if (!c) return [null, null];
    const list = cases.cases;
    const idx = list.findIndex((x) => x.id === c.id);
    return [list[idx - 1] || null, list[idx + 1] || null];
  }, [c]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate({ name: 'home' });
      if (e.key === 'ArrowLeft' && prev) navigate({ name: 'case', id: prev.id });
      if (e.key === 'ArrowRight' && next) navigate({ name: 'case', id: next.id });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, prev, next]);

  // Reset tab + scroll on case change.
  useEffect(() => {
    setTab('prompt');
    setCopied(false);
  }, [id]);

  if (!c || !tpl) {
    return (
      <div className="cd-overlay cd-overlay-open">
        <div className="cd-card">
          <p>找不到案例 {id}</p>
          <button className="btn btn-primary" onClick={() => navigate({ name: 'home' })}>
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  const usageDialog = buildUsageDialog(c, tpl.label);

  const onCopy = async () => {
    if (!c.prompt_content) return;
    try {
      await navigator.clipboard.writeText(c.prompt_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="cd-overlay cd-overlay-open" role="dialog" aria-modal="true">
      <button
        className="cd-backdrop"
        onClick={() => navigate({ name: 'home' })}
        aria-label="Close detail"
      />

      <div className="cd-card">
        {/* === LEFT: hero image === */}
        <div className="cd-media">
          <div className="cd-media-frame">
            {c.has_image ? (
              <div className={`cd-media-stack ${fullLoaded ? 'cd-media-loaded' : ''}`}>
                {!fullLoaded && !c.thumb_url && (
                  <span
                    className="cs-skel cd-media-skel"
                    aria-hidden="true"
                    style={{ ['--cs-accent' as never]: c.category_accent }}
                  >
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
                {c.thumb_url && (
                  <img
                    className="cd-media-thumb"
                    src={c.thumb_url}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                  />
                )}
                <img
                  className="cd-media-full"
                  src={c.image_url ?? ''}
                  alt={c.title}
                  loading="eager"
                  decoding="async"
                  onLoad={() => setFullLoaded(true)}
                  // @ts-expect-error: fetchpriority is a valid HTML hint, not yet in DOM types
                  fetchpriority="high"
                />
              </div>
            ) : (
              <div className="cd-media-empty">
                <div className="serif cd-media-empty-title">提示詞已就緒 · 圖片待生成</div>
                <p className="cd-media-empty-hint">
                  這條案例的最終 prompt 已經寫好，但還沒有跑過一次生成。
                  你可以把右側 prompt 直接餵給 GPT‑Image‑2 / DALL·E 3 / Midjourney 等任意工具。
                </p>
              </div>
            )}
          </div>

          {/* Thumbnail row of related cases */}
          {related.length > 0 && (
            <div className="cd-related">
              <div className="mono cd-related-label">同模板其他案例</div>
              <div className="cd-related-grid">
                {related.slice(0, 6).map((r) => (
                  <button
                    key={r.id}
                    className="cd-related-tile"
                    onClick={() => navigate({ name: 'case', id: r.id })}
                    title={r.title}
                  >
                    {r.has_image ? (
                      <SkeletonImg
                        src={r.thumb_url ?? r.image_url ?? ''}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        accent={r.category_accent}
                      />
                    ) : (
                      <div className="cd-related-empty mono">PROMPT</div>
                    )}
                    <span className="cd-related-tile-title">{r.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* === RIGHT: meta + tabs === */}
        <aside className="cd-side">
          <header className="cd-side-head">
            <div className="cd-side-tags">
              <span
                className="cd-tag-cat"
                style={{ '--ca': c.category_accent } as React.CSSProperties}
              >
                {c.category_label}
              </span>
              <span className="cd-tag-tpl mono">{tpl.label}</span>
              <span className="cd-tag-id mono">#{c.idx.toString().padStart(2, '0')}</span>
            </div>
            <button
              className="cd-close"
              onClick={() => navigate({ name: 'home' })}
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <h1 className="cd-title serif">{c.title}</h1>
          <p className="cd-brief">{c.brief}</p>

          <div className="cd-meta">
            <div className="cd-meta-row">
              <span className="mono cd-meta-key">FORMAT</span>
              <span className="cd-meta-val mono">.{c.format}</span>
            </div>
            <div className="cd-meta-row">
              <span className="mono cd-meta-key">TEMPLATE</span>
              <span className="cd-meta-val">{tpl.label}</span>
            </div>
            <div className="cd-meta-row">
              <span className="mono cd-meta-key">PATH</span>
              <span className="cd-meta-val mono cd-meta-path">{c.prompt_path}</span>
            </div>
          </div>

          {/* === Tabs === */}
          <div className="cd-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'prompt'}
              className={`cd-tab ${tab === 'prompt' ? 'cd-tab-on' : ''}`}
              onClick={() => setTab('prompt')}
            >
              <span className="mono cd-tab-num">01</span> Prompt
            </button>
            <button
              role="tab"
              aria-selected={tab === 'template'}
              className={`cd-tab ${tab === 'template' ? 'cd-tab-on' : ''}`}
              onClick={() => setTab('template')}
            >
              <span className="mono cd-tab-num">02</span> 模板說明
            </button>
            <button
              role="tab"
              aria-selected={tab === 'usage'}
              className={`cd-tab ${tab === 'usage' ? 'cd-tab-on' : ''}`}
              onClick={() => setTab('usage')}
            >
              <span className="mono cd-tab-num">03</span> 如何用 Skill
            </button>
          </div>

          <div className="cd-tab-body">
            {tab === 'prompt' && (
              <div className="cd-prompt">
                <div className="cd-prompt-head">
                  <span className="mono cd-prompt-label">
                    {c.format === 'json' ? 'JSON · 渲染後的提示詞' : 'TEXT · 自然語言提示詞'}
                  </span>
                  <div className="cd-prompt-actions">
                    <button 
                      className="cd-act"
                      style={{ background: '#34D399', color: '#0F172A', fontWeight: 600 }}
                      onClick={async () => {
                        const btn = document.getElementById('gen-btn-' + c.id);
                        if (btn) btn.innerText = 'Generating...';
                        try {
                          const res = await fetch('/api/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              prompt: c.prompt_content, 
                              category: c.category, 
                              template: c.template_key, 
                              idx: c.idx 
                            })
                          });
                          if (!res.ok) throw new Error('Generation failed');
                          if (btn) btn.innerText = '✅ Success';
                        } catch (err) {
                          if (btn) btn.innerText = '❌ Error';
                        }
                      }}
                      id={'gen-btn-' + c.id}
                    >
                      <span aria-hidden="true">✨</span>
                      Run in Browser (Playwright)
                    </button>
                    <button className="cd-act" onClick={onCopy}>
                      <span aria-hidden="true">
                        {copied ? '✓' : '⧉'}
                      </span>
                      {copied ? '已複製' : '複製'}
                    </button>
                    <a
                      className="cd-act"
                      href={c.prompt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span aria-hidden="true">↗</span>
                      原始檔
                    </a>
                  </div>
                </div>
                <pre className="cd-code mono">
                  <code>{c.prompt_content || '— 載入失敗 —'}</code>
                </pre>

                {/* CLI Command Section */}
                <div className="cd-prompt-head" style={{ marginTop: '24px' }}>
                  <span className="mono cd-prompt-label" style={{ color: '#38BDF8' }}>
                    CLI COMMAND · 終端直接執行命令
                  </span>
                  <div className="cd-prompt-actions">
                    <button 
                      className="cd-act" 
                      onClick={() => {
                        const cmd = `ADAPTER=playwright node scripts/automation/run-single.mjs --prompt ${JSON.stringify(c.prompt_content)} --category "${c.category}" --template "${c.template_key}" --idx "${c.idx}"`;
                        navigator.clipboard.writeText(cmd);
                        const btn = document.getElementById('copy-cmd-btn-' + c.id);
                        if (btn) {
                          btn.innerText = '已複製';
                          setTimeout(() => { btn.innerText = '複製命令'; }, 1800);
                        }
                      }}
                      id={'copy-cmd-btn-' + c.id}
                    >
                      <span aria-hidden="true">⧉</span>
                      複製命令
                    </button>
                  </div>
                </div>
                <p className="cd-media-empty-hint" style={{ marginTop: 0, marginBottom: '12px' }}>
                  如果您希望在終端直接執行此任務，可複製以下命令並在 <code>dist/gpt-image2-website</code> 目錄下執行。確保您的 Playwright/OpenCLI 環境已配置。
                </p>
                <pre className="cd-code mono" style={{ background: '#0F172A', border: '1px solid #1E293B', color: '#94A3B8' }}>
                  <code>{`ADAPTER=playwright node scripts/automation/run-single.mjs \\\n  --category "${c.category}" \\\n  --template "${c.template_key}" \\\n  --idx "${c.idx}" \\\n  --prompt ${JSON.stringify(c.prompt_content)}`}</code>
                </pre>

              </div>
            )}

            {tab === 'template' && (
              <div className="cd-template">
                <div className="cd-template-head">
                  <span className="mono cd-template-label">SKILL 模板</span>
                  <div className="cd-template-actions">
                    <a
                      className="cd-act cd-act-ghost"
                      href={`https://github.com/ConardLi/garden-skills/blob/main/skills/gpt-image-2/${tpl.md_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="在 garden-skills 倉庫中檢視模板原文"
                    >
                      <span aria-hidden="true">↗</span>
                      GitHub
                    </a>
                    <button
                      className="cd-act"
                      onClick={() => navigate({ name: 'skills' })}
                    >
                      完整 Skill 檔案 →
                    </button>
                  </div>
                </div>
                <h3 className="cd-template-name serif">{tpl.label}</h3>
                <div className="mono cd-template-path">{tpl.md_path}</div>
                {tpl.description && (
                  <div className="cd-template-desc">
                    {tpl.description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
                <div className="cd-template-summary">
                  <Bullet n="01" k="分類">
                    {c.category_label} · {cases.categories[c.category]?.label}
                  </Bullet>
                  <Bullet n="02" k="模板路徑">
                    <code className="mono">{tpl.md_path}</code>
                  </Bullet>
                  <Bullet n="03" k="同模板案例">
                    {tpl.cases_count} 條（含本條）
                  </Bullet>
                </div>
              </div>
            )}

            {tab === 'usage' && (
              <div className="cd-usage">
                <div className="cd-usage-head">
                  <span className="mono cd-usage-label">如何在 Skill 中復現這張圖</span>
                </div>
                <p className="cd-usage-intro">
                  這是一段你可以直接對帶 GPT‑Image‑2 Skill 的 Agent 說的話——
                  它會自動從 <code className="mono">references/</code> 找到對應模板，
                  把引數填進去，渲染最終 prompt 並出圖。
                </p>
                <div className="cd-chat">
                  {usageDialog.map((m, i) => (
                    <ChatBubble key={i} m={m} />
                  ))}
                </div>
                <div className="cd-usage-tips">
                  <div className="mono cd-usage-tips-label">三種執行模式</div>
                  <div className="cd-usage-tips-list">
                    <ModeRow tag="A" name="Garden 本地" body="完整跑通：渲染 prompt → 調 generate.js → 出圖落盤" />
                    <ModeRow tag="B" name="Host-Native" body="渲染 prompt → 呼叫宿主自帶的影象工具（ChatGPT / Cursor / Codex / Gemini）" />
                    <ModeRow tag="C" name="Advisor 顧問" body="只渲染 prompt 給你；你拿去任意 GPT-Image-2 / DALL·E 3 / Midjourney 中執行" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* === Nav (prev / next) === */}
          <nav className="cd-nav">
            {prev ? (
              <button
                className="cd-nav-btn"
                onClick={() => navigate({ name: 'case', id: prev.id })}
              >
                <span className="cd-nav-arrow">←</span>
                <span className="cd-nav-stack">
                  <span className="mono cd-nav-label">PREV</span>
                  <span className="cd-nav-title">{prev.title}</span>
                </span>
              </button>
            ) : (
              <div />
            )}
            {next ? (
              <button
                className="cd-nav-btn cd-nav-btn-r"
                onClick={() => navigate({ name: 'case', id: next.id })}
              >
                <span className="cd-nav-stack cd-nav-stack-r">
                  <span className="mono cd-nav-label">NEXT</span>
                  <span className="cd-nav-title">{next.title}</span>
                </span>
                <span className="cd-nav-arrow">→</span>
              </button>
            ) : (
              <div />
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}

function Bullet({ n, k, children }: { n: string; k: string; children: React.ReactNode }) {
  return (
    <div className="cd-bullet">
      <span className="mono cd-bullet-n">{n}</span>
      <span className="cd-bullet-k">{k}</span>
      <span className="cd-bullet-v">{children}</span>
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMsg }) {
  return (
    <div className={`cd-msg cd-msg-${m.role}`}>
      <div className="cd-msg-meta">
        <span className="mono cd-msg-role">{m.role === 'user' ? 'YOU' : 'AGENT'}</span>
      </div>
      <div className="cd-msg-bubble">{m.body}</div>
    </div>
  );
}

function ModeRow({ tag, name, body }: { tag: string; name: string; body: string }) {
  return (
    <div className="cd-mode">
      <span className="cd-mode-tag mono">MODE {tag}</span>
      <span className="cd-mode-name">{name}</span>
      <span className="cd-mode-body">{body}</span>
    </div>
  );
}

interface ChatMsg {
  role: 'user' | 'agent';
  body: React.ReactNode;
}

function buildUsageDialog(c: { title: string; brief: string; template_label: string; category_label: string }, tplLabel: string): ChatMsg[] {
  return [
    {
      role: 'user',
      body: (
        <>
          幫我用 gpt-image-2 Skill 出一張圖：<strong>{c.title}</strong>。
          <br />
          風格 / 場景參考你的 <code className="mono">{c.category_label}</code> 分類下的{' '}
          <code className="mono">{tplLabel}</code> 模板。
        </>
      ),
    },
    {
      role: 'agent',
      body: (
        <>
          收到。第一步先跑 <code className="mono">scripts/check-mode.js</code> 確認執行模式，
          然後從 <code className="mono">references/{c.category_label}/</code>
          下讀取 <code className="mono">{tplLabel}.md</code> 模板。
          <br />
          <br />
          目標識別為：<em>{c.brief}</em>
          <br />
          模板裡有幾個關鍵欄位需要確認（主體 / 文案 / 配色 / 比例…），
          這些都已經在右側 JSON 中填好。
        </>
      ),
    },
    {
      role: 'user',
      body: <>就用現成的 JSON，直接出圖。</>,
    },
    {
      role: 'agent',
      body: (
        <>
          好。三種模式分支：
          <ul>
            <li><strong>Mode A</strong>：儲存 prompt → 調 <code className="mono">generate.js</code> → 圖片落到 <code className="mono">garden-gpt-image-2/image/</code>。</li>
            <li><strong>Mode B</strong>：把 JSON 渲染成最終 prompt，呼叫我自己環境裡的 image 工具。</li>
            <li><strong>Mode C</strong>：只把 prompt 寫好交給你，由你拿去任意 GPT-Image-2 / DALL·E 3 / Midjourney 中執行。</li>
          </ul>
          完成後會用一句話告訴你：當前模式、prompt 落在哪、圖（如有）落在哪。
        </>
      ),
    },
  ];
}
