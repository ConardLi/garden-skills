import { MaskReveal } from "../../components/MaskReveal";
import type { ChapterStepProps } from "../../registry/types";
import "./Example.css";

/**
 * Reference chapter — replace with your own.
 *
 * Demonstrates the per-step takeover pattern AND the design-token system:
 * each step uses SEMANTIC tokens (--text, --accent, --t-*, --space-*) so
 * you can swap themes without editing the chapter at all.
 *
 * See SKILL.md "non-negotiable #3" for why each step is its own layout.
 */
export default function ExampleChapter({ step }: ChapterStepProps) {
  /* Step 0 — magazine cover, headline + kicker + click cue */
  if (step === 0) {
    return (
      <div className="ex-scene scene-pad">
        <header className="masthead">
          <span className="brand">Your Presentation</span>
          <span className="issue">Issue · 01 — Replace this</span>
        </header>
        <hr className="rule" style={{ marginTop: "var(--space-5)" }} />

        <div className="ex-cover-body">
          <div className="kicker">Chapter 01 — Example</div>
          <h1 className="ex-cover-h">
            <MaskReveal show duration={900}>
              <span className="serif-cn">这是&nbsp;</span>
            </MaskReveal>
            <MaskReveal show delay={300} duration={900}>
              <span className="serif-it ex-em">first&nbsp;step</span>
            </MaskReveal>
            <MaskReveal show delay={650} duration={900}>
              <span className="serif-cn">.</span>
            </MaskReveal>
          </h1>
          <div className="ex-cover-foot label-mono">
            <span className="dot-accent" /> &nbsp;Tap anywhere to advance
          </div>
        </div>
      </div>
    );
  }

  /* Step 1 — split layout: hero number + body */
  if (step === 1) {
    return (
      <div className="ex-scene scene-pad">
        <header className="masthead">
          <span className="brand">Your Presentation</span>
          <span className="issue">Issue · 01</span>
        </header>
        <hr className="rule" style={{ marginTop: "var(--space-5)" }} />

        <div className="ex-split">
          <div className="ex-split-num hero-num">02</div>
          <div className="ex-split-body">
            <div className="kicker">每一步</div>
            <h2 className="ex-split-h">
              <MaskReveal show duration={900}>
                <span className="serif-cn">独占&nbsp;</span>
              </MaskReveal>
              <MaskReveal show delay={300} duration={900}>
                <span className="serif-it ex-em">整个屏幕</span>
              </MaskReveal>
              <MaskReveal show delay={650} duration={900}>
                <span className="serif-cn">.</span>
              </MaskReveal>
            </h2>
            <p className="ex-split-p">
              The current theme controls every visual detail — palette,
              fonts, hero-number style, rule weight, decoration, motion.
              The chapter code is theme-agnostic.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* Step 2 — pull-quote close */
  return (
    <div className="ex-scene scene-pad ex-close">
      <div className="ex-close-inner">
        <div className="kicker">Now</div>
        <div className="pull-quote ex-quote">
          <MaskReveal show duration={1100}>
            <span className="serif-cn">Replace this with </span>
          </MaskReveal>
          <MaskReveal show delay={400} duration={1100}>
            <span className="serif-it ex-em">your own&nbsp;</span>
          </MaskReveal>
          <MaskReveal show delay={760} duration={1100}>
            <span className="serif-cn">chapters.</span>
          </MaskReveal>
        </div>
        <div className="ex-close-foot label-mono">
          See SKILL.md / PATTERNS.md / THEMES.md
        </div>
      </div>
    </div>
  );
}
