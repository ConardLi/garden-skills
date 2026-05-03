// ⚠️ 这是 anchor 参考代码，不会被任何项目编译。
//    抄到真实项目时（presentation/src/chapters/NN-hook/），
//    把下面两个 import 改成：
//      import { MaskReveal } from "../../components/MaskReveal";
//      import type { ChapterStepProps } from "../../registry/types";
import { MaskReveal } from "../../../templates/src/components/MaskReveal";
import type { ChapterStepProps } from "../../../templates/src/registry/types";
import "./chapter.css";

/**
 * hook-chapter · 完整章节示例
 * ─────────────────────────────────────────
 * 默认绑 newsroom 主题（serif + 报头红 + 印刷盖章 motion）。
 *
 * 关键手段：
 * - 真素材：<img src="/hook/{name}.png" /> 而不是 placeholder
 * - 字号狠对比：hero 用 --t-display-1（≥ 144px）+ 微微负字距
 * - 主导动作：mask reveal + 印章砸下（贴 newsroom 印刷气质）
 * - takeover：三张图缩入 + 巨字爆出 + accent 红条贯穿
 * - 收束：brush 划掉旧概念
 *
 * 切其它主题时按那个主题的气质自由换"印章砸下 / brush"等效动作，
 * 结构和字号节奏保持。
 */
export default function HookChapter({ step }: ChapterStepProps) {
  // step 1 — 三张 ghost（精修：加 kicker 引子 + accent 红条）
  if (step === 0) {
    return (
      <div className="hk-scene scene-pad">
        <div className="hk-kicker">
          <span className="hk-kicker-line" />
          <span className="hk-kicker-text">这几天</span>
        </div>
        <div className="hk-grid" key={step}>
          {["01", "02", "03"].map((i, idx) => (
            <MaskReveal show key={i} delay={idx * 200} duration={900}>
              <div className="hk-ghost">
                <span className="hk-ghost-num">{i}</span>
                <span className="hk-ghost-label">image</span>
              </div>
            </MaskReveal>
          ))}
        </div>
      </div>
    );
  }

  // step 2-4 — 每张图独占（真素材 + 角章 + 旁白）
  // ⚠️ 这是结构示例。具体反例 caption / src 应该来自 outline.md 本章
  //    article 补字段（双源原则）—— 别照抄下面这些占位字符串。
  const reveals: Array<{ src: string; label: string; caption: string }> = [
    {
      src: "/hook/<asset-1>.png",
      label: "01 / 03",
      caption: "<反例 1 caption，来自 article §X>",
    },
    {
      src: "/hook/<asset-2>.png",
      label: "02 / 03",
      caption: "<反例 2 caption>",
    },
    {
      src: "/hook/<asset-3>.png",
      label: "03 / 03",
      caption: "<反例 3 caption>",
    },
  ];
  if (step >= 1 && step <= 3) {
    const r = reveals[step - 1];
    return (
      <div className="hk-scene scene-pad" key={step}>
        <div className="hk-solo-frame">
          <MaskReveal show duration={1100}>
            <div className="hk-solo-img-wrap">
              <img className="hk-solo-img" src={r.src} alt={r.caption} />
              <div className="hk-stamp">FAKE?</div>
            </div>
          </MaskReveal>
          <MaskReveal show delay={400} duration={900}>
            <div className="hk-solo-meta">
              <span className="hk-solo-label">{r.label}</span>
              <span className="hk-solo-caption">{r.caption}</span>
            </div>
          </MaskReveal>
        </div>
      </div>
    );
  }

  // step 5 — takeover：三张缩入 + 巨字爆出 + accent 红条
  if (step === 4) {
    return (
      <div className="hk-scene scene-pad hk-takeover" key={step}>
        <div className="hk-mini-row">
          {reveals.map((r, idx) => (
            <img
              key={r.src}
              className="hk-mini"
              src={r.src}
              alt={r.caption}
              style={{ animationDelay: `${idx * 80}ms` }}
            />
          ))}
        </div>
        <span className="hk-accent-bar" />
        <h1 className="hk-hero">
          <MaskReveal show duration={1100}>
            {/* hero 文案来自 outline 本章 step 5；这里只是占位 */}
            &lt;主题大字 takeover&gt;
          </MaskReveal>
        </h1>
      </div>
    );
  }

  // step 6 — 钩子收束：brush 划掉
  return (
    <div className="hk-scene scene-pad hk-close" key={step}>
      <div className="hk-quote-wrap">
        <h2 className="hk-quote">&lt;下一句钩子&gt;</h2>
        <span className="hk-brush" aria-hidden />
      </div>
    </div>
  );
}
