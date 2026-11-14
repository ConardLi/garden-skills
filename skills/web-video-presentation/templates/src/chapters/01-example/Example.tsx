import { MaskReveal } from "../../components/MaskReveal";
import { BrowserWindow, FolderTree, PipelineFlow } from "../../components/viz";
import type { ChapterStepProps } from "../../registry/types";
import "./Example.css";

/**
 * Reference chapter — replace with your own.
 *
 * 这一版演示 **2026-10-19 起的新版式契约**（治「画面空洞 / 内容只占屏幕
 * 三分之一」）：
 *
 *   1. 根节点用 `.stage-3band` —— 顶部钩子行 / 中部主视觉（≥55% 高）/
 *      底部注释行；中部是主角，不许留一大片空色。
 *   2. 每个 step 至少挂 **1 个 `components/viz` 元素**，且与当拍口播内容
 *      相关（讲到文件就挂 FolderTree，讲到流程就挂 PipelineFlow）。
 *   3. 颜色 / 字体全部走主题 token（`--text` / `--accent` / `--t-*`），
 *      换主题不需要动这一章。
 *
 * See CHAPTER-CRAFT.md「视觉演示」+ components/viz/README.md。
 */
export default function ExampleChapter({ step }: ChapterStepProps) {
  /* Step 0 — 封面：顶部钩子行（大标题）+ 中部主视觉（浏览器窗撑满）+ 脚注 */
  if (step === 0) {
    return (
      <div className="ex-scene stage-3band">
        <div className="band-top ex-cover-top">
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
        </div>

        <div className="band-main viz-fill">
          <BrowserWindow url="example.com/first-step" highlight={0} />
        </div>

        <div className="band-foot">
          <span className="label-mono">
            <span className="dot-accent" /> &nbsp;Tap anywhere to advance
          </span>
        </div>
      </div>
    );
  }

  /* Step 1 — 主视觉演示：口播讲什么，画面点亮什么 */
  if (step === 1) {
    return (
      <div className="ex-scene stage-3band">
        <div className="band-top">
          <div className="kicker">每一步</div>
          <h2 className="ex-h2">
            <span className="serif-cn">画面挂出&nbsp;</span>
            <span className="serif-it ex-em">讲的那个东西</span>
          </h2>
        </div>

        <div className="band-main viz-fill">
          <FolderTree
            items={["script.md", "outline.md", "presentation/", "raw/"]}
            activeIndex={2}
          />
        </div>

        <div className="band-foot">
          <p className="ex-p">
            讲到哪个文件，画面就点亮哪一行 —— 逐步揭示，而不是一次全列出来。
          </p>
        </div>
      </div>
    );
  }

  /* Step 2 — 收尾：结论 + 流程回收 */
  return (
    <div className="ex-scene stage-3band">
      {/* 三段式：引文进顶部行（钩子），流程图独占中部（≥55%），来源进脚注。
          引文与流程图挤在同一个中部盒里会互相争高、尾部溢出与脚注重叠
          （2026-10-19 抽帧踩坑）。 */}
      <div className="band-top ex-close-top">
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
      </div>

      <div className="band-main viz-fill">
        <PipelineFlow steps={["写稿", "分镜", "出片", "发布"]} activeIndex={2} />
      </div>

      <div className="band-foot">
        <span className="label-mono">See SKILL.md / CHAPTER-CRAFT.md / viz README</span>
      </div>
    </div>
  );
}
