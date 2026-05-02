// ⚠️ 这是 anchor 参考代码，不会被任何项目编译。
//    抄到真实项目时（presentation/src/chapters/NN-list/），
//    把下面两个 import 改成：
//      import { MaskReveal } from "../../components/MaskReveal";
//      import type { ChapterStepProps } from "../../registry/types";
import { MaskReveal } from "../../../templates/src/components/MaskReveal";
import type { ChapterStepProps } from "../../../templates/src/registry/types";
import "./chapter.css";

/**
 * list-reveal · 完整章节示例
 * ─────────────────────────────────────────
 * 默认绑 newsroom 主题。
 *
 * 关键手段：
 * - 槽位用 hero-num（serif 巨号）替代普通文字编号
 * - 引子用 masthead 双线规则 + serif 大字
 * - 槽位状态切换有专属动画：
 *     ghost  → active：mask reveal 标题 + 数字砸下（accent 红）
 *     active → past   ：accent 灰化（filter）
 * - 关键：所有槽位的 React 节点位置不重排，只切换 className
 */
const ITEMS = [
  { num: "01", title: "文字渲染", body: "图里的文字也能正确写出来" },
  { num: "02", title: "指令遵循", body: "可以给到非常具体的要求" },
  { num: "03", title: "照片真实感", body: "光影 / 材质 / 人物接近真实" },
];

export default function ListRevealChapter({ step }: ChapterStepProps) {
  // step 1 — 引子
  if (step === 0) {
    return (
      <div className="lr-scene scene-pad lr-intro">
        <header className="lr-masthead">
          <span className="lr-rule" />
          <span className="lr-kicker">第一部分</span>
          <span className="lr-rule" />
        </header>
        <MaskReveal show duration={1100}>
          <h1 className="lr-intro-h">
            强在<span className="lr-em">哪</span>
          </h1>
        </MaskReveal>
        <MaskReveal show delay={400} duration={900}>
          <div className="lr-intro-sub">三件事 —— 一个个看</div>
        </MaskReveal>

        <div className="lr-grid">
          {ITEMS.map((it) => (
            <Slot key={it.num} state="ghost" item={it} />
          ))}
        </div>
      </div>
    );
  }

  const activeIdx = step - 1;
  return (
    <div className="lr-scene scene-pad">
      <header className="lr-masthead">
        <span className="lr-rule" />
        <span className="lr-kicker">第一部分 · 强在哪</span>
        <span className="lr-rule" />
      </header>

      <div className="lr-grid">
        {ITEMS.map((it, i) => {
          const state =
            i < activeIdx ? "past" : i === activeIdx ? "active" : "ghost";
          return <Slot key={it.num} state={state} item={it} />;
        })}
      </div>
    </div>
  );
}

function Slot({
  state,
  item,
}: {
  state: "ghost" | "active" | "past";
  item: { num: string; title: string; body: string };
}) {
  return (
    <div className={`lr-slot lr-slot-${state}`}>
      <div className="lr-slot-num">{item.num}</div>
      <div className="lr-slot-content">
        {state !== "ghost" && (
          <>
            <MaskReveal show duration={900} key={`${item.num}-title`}>
              <div className="lr-slot-title">{item.title}</div>
            </MaskReveal>
            {state === "active" && (
              <MaskReveal show delay={350} duration={900}>
                <div className="lr-slot-body">{item.body}</div>
              </MaskReveal>
            )}
          </>
        )}
      </div>
    </div>
  );
}
