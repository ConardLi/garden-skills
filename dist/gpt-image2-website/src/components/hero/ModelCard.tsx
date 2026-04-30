import { useEffect } from 'react';
import './ModelCard.css';

interface Props {
  expanded: boolean;
  onClose: () => void;
}

const STRENGTHS = [
  {
    n: '01',
    title: '文字渲染',
    en: 'Text Rendering',
    body: '海報、選單、招牌、UI 標籤、資訊圖——畫面裡的中文 / 日文 / 韓文 / 印地文都被當作核心能力訓練，告別上一代 AI 圖最大的「文字翻車」問題。',
  },
  {
    n: '02',
    title: '指令遵循',
    en: 'Instruction Following',
    body: '可以非常具體地告訴它：主體放哪裡、文案怎麼排、風格偏雜誌還是電商、哪些元素必須保留。比上一代真正接近"按 brief 出圖"。',
  },
  {
    n: '03',
    title: '編輯能力',
    en: 'Image Editing',
    body: '吃進參考圖、產品圖、Logo、草稿，做背景替換、區域性重繪、風格統一、Logo / 包裝保留——是「視覺工作流引擎」而不只是抽卡。',
  },
  {
    n: '04',
    title: '尺寸自由',
    en: 'Resolution Flexibility',
    body: '1024 方圖 · 1536×1024 · 1024×1536 · 2K · 4K 橫豎圖都可。超過 2560×1440 的輸出仍標為實驗性（experimental）。',
  },
];

const SURFACES = [
  { name: 'ChatGPT', tag: 'Images 2.0', body: '所有計劃可用；Images with Thinking 需要 Plus / Pro / Business。' },
  { name: 'OpenAI API', tag: 'gpt-image-2', body: '/images/generations & /images/edits，能接進自己的產品。' },
  { name: 'Codex', tag: 'via tooling', body: '取決於環境是否接入影象工具；可讓 Codex 寫 prompt + 呼叫工具一氣呵成。' },
  { name: 'Lovart', tag: 'design-grade', body: '商業視覺、UI mockup、多語言海報等工作流，包裝為設計平臺。' },
  { name: 'OpenRouter', tag: 'gpt-5.4-image-2', body: '把 GPT-5.4 推理 + Image 2 影象組合起來的對話式生成。' },
  { name: '302.ai', tag: '相容閘道器', body: '提供 gpt-image-2 的生成 / 編輯介面，第三方閘道器入口。' },
];

export function ModelCard({ expanded, onClose }: Props) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expanded) onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [expanded, onClose]);

  return (
    <div className={`mc-overlay ${expanded ? 'mc-overlay-open' : ''}`}>
      <button
        className="mc-backdrop"
        onClick={onClose}
        aria-label="Close model card"
      />
      <div className="mc-card" role="dialog" aria-modal="true" aria-labelledby="mc-title">
        <header className="mc-head">
          <div>
            <div className="mono mc-eyebrow">MODEL CARD · 2026 EDITION</div>
            <h2 id="mc-title" className="mc-title serif">
              <span className="serif-italic">gpt</span>‑image‑2
            </h2>
            <p className="mc-sub">
              OpenAI 2026 年 4 月 21 日釋出的視覺生產模型。它強的地方不是「更炫」，
              而是「更能用」——把文字渲染、參考圖編輯、跨語言版式、靈活尺寸打包
              成一個能塞進真實工作流的多模態影象模型。
            </p>
          </div>
          <button className="mc-close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <section className="mc-section">
          <div className="mc-sec-label mono">01 · 關鍵能力</div>
          <div className="mc-strengths">
            {STRENGTHS.map((s) => (
              <article key={s.n} className="mc-strength">
                <div className="mc-strength-head">
                  <span className="mono mc-strength-n">{s.n}</span>
                  <h3 className="mc-strength-title serif">{s.title}</h3>
                  <span className="mono mc-strength-en">/ {s.en}</span>
                </div>
                <p className="mc-strength-body">{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mc-section">
          <div className="mc-sec-label mono">02 · 入口分佈</div>
          <div className="mc-surfaces">
            {SURFACES.map((s) => (
              <article key={s.name} className="mc-surface">
                <div className="mc-surface-head">
                  <span className="mc-surface-name">{s.name}</span>
                  <span className="mono mc-surface-tag">{s.tag}</span>
                </div>
                <p className="mc-surface-body">{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mc-section">
          <div className="mc-sec-label mono">03 · 一句話總結</div>
          <blockquote className="mc-quote serif">
            <span className="mc-quote-mark">"</span>
            <span>
              GPT-Image-2 的強，不只是「畫得更像」，而是它開始接近一個能理解
              <span className="mc-em">文案、佈局、品牌、參考圖和最終用途</span>
              的視覺生產模型。
            </span>
          </blockquote>
        </section>

        <footer className="mc-foot">
          <div className="mono mc-foot-info">
            <span>SOURCE</span>
            <span>OpenAI Platform · Image API · Lovart</span>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            <span>收起卡片</span>
            <span className="btn-arrow">↑</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
