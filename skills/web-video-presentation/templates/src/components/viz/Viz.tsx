/**
 * viz — 章节视觉元素库（2026-10-19 新增，治"画面空洞 / 内容只占屏幕三分之一"）
 *
 * 为什么存在：观众看到的应该是**被讲解的东西在屏幕上**（浏览器窗、文件夹、
 * 终端、文档堆、流程、时间轴…），而不是只有几行大字浮在一片空色上。
 * 口播讲到什么，画面就挂出对应的具象元素 —— 这是"视频感"的主要来源。
 *
 * 规则（与 CHAPTER-CRAFT.md 配套，硬约束）：
 *   1. **每步至少挂 1 个**（复杂节拍 2~3 个）来自本库的元素；整章只用
 *      "标题 + 一段文字" = 验收不过。
 *   2. 元素必须**与当拍口播内容相关**（讲到检索就挂 Magnifier，讲到流程
 *      就挂 PipelineFlow）。不许为了填画面挂无关元素。
 *   3. 元素一律 **SVG + 主题 token**（颜色/字体全部走 var(--…)），
 *      禁止硬编码 hex、禁止 emoji 当图标、禁止位图、禁止假数据
 *      （数字一律由调用方传入真实值）。
 *   4. 主视觉放 `.band-main`（≥55% 舞台高），用 `.viz-fill` 撑满。
 *
 * 用法：
 *   import { BrowserWindow, PipelineFlow } from "../components/viz";
 *   <div className="band-main viz-fill">
 *     <PipelineFlow steps={["上传", "切块", "检索", "生成"]} activeIndex={step} />
 *   </div>
 *
 * 动作原语见 viz.css：`.viz-draw` / `.viz-grow` / `.viz-pop` / `.viz-rise`。
 */
import type { CSSProperties } from "react";
import "./viz.css";

export interface VizProps {
  className?: string;
  style?: CSSProperties;
}

/* ── token 取色（一律走 CSS 变量，换主题不破） ── */
const INK: CSSProperties = { fill: "var(--text)" };
const MUTE: CSSProperties = { fill: "var(--text-mute)" };
const FAINT: CSSProperties = { fill: "var(--text-faint)" };
const SURF: CSSProperties = { fill: "var(--surface-2)" };
const SURF2: CSSProperties = { fill: "var(--surface-3)" };
const INK_BG: CSSProperties = { fill: "var(--text)" };
const ACCENT: CSSProperties = { fill: "var(--accent)" };
const ACCENT_SOFT: CSSProperties = { fill: "var(--accent-soft)" };
const ACCENT_STROKE: CSSProperties = {
  stroke: "var(--accent)",
  strokeWidth: 3,
  fill: "none",
};
const HAIR: CSSProperties = {
  stroke: "var(--rule)",
  strokeWidth: 3,
  fill: "none",
};
const HAIR_THIN: CSSProperties = {
  stroke: "var(--rule)",
  strokeWidth: 2,
  fill: "none",
};
const SLAB: CSSProperties = {
  ...SURF,
  stroke: "var(--rule)",
  strokeWidth: 2,
};
const MONO: CSSProperties = { fontFamily: "var(--font-mono)" };
const CN: CSSProperties = { fontFamily: "var(--font-display-cn)", fontWeight: 700 };
const CN_MUTE: CSSProperties = {
  fontFamily: "var(--font-display-cn)",
  fontWeight: 500,
  fill: "var(--text-mute)",
};

function box(w: number, h: number) {
  return { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "xMidYMid meet" as const };
}

/* ══════════════════════════════════════════════════════════════════════
 * 1. BrowserWindow — 浏览器窗（讲网页 / 在线工具 / 搜索结果 / 网页数据）
 * ══════════════════════════════════════════════════════════════════════ */
export function BrowserWindow({
  url = "",
  highlight = 0,
  className,
  style,
}: VizProps & { url?: string; highlight?: number }) {
  const lines = [
    { w: 640, on: highlight === 0 },
    { w: 500, on: highlight === 1 },
    { w: 560, on: highlight === 2 },
    { w: 380, on: highlight === 3 },
  ];
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(900, 800)}>
      <rect x={16} y={16} width={868} height={768} rx={30} style={SLAB} />
      {/* tab / toolbar */}
      <path d="M16 118 H884" style={HAIR_THIN} />
      <circle cx={70} cy={68} r={11} style={FAINT} />
      <circle cx={106} cy={68} r={11} style={FAINT} />
      <circle cx={142} cy={68} r={11} style={FAINT} />
      <rect x={196} y={44} width={460} height={50} rx={25} style={SURF2} />
      {url ? (
        <text x={222} y={79} fontSize={28} style={{ ...MONO, ...MUTE }}>
          {url}
        </text>
      ) : null}
      {/* content */}
      {lines.map((l, i) => (
        <g key={i} className={l.on ? "viz-on" : "viz-dim"}>
          {l.on ? (
            <rect x={60} y={170 + i * 150} width={780} height={96} rx={18} style={ACCENT_SOFT} />
          ) : null}
          <rect
            x={92}
            y={212 + i * 150}
            width={l.w}
            height={22}
            rx={11}
            style={l.on ? ACCENT : FAINT}
          />
        </g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 2. Terminal — 终端窗（讲命令行 / 跑代码 / 部署 / 报错）
 * ══════════════════════════════════════════════════════════════════════ */
export function Terminal({
  title = "shell",
  lines = [],
  className,
  style,
}: VizProps & { title?: string; lines?: string[] }) {
  const shown = lines.length ? lines : ["", "", ""];
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(900, 620)}>
      <rect x={16} y={16} width={868} height={588} rx={26} style={INK_BG} />
      <path d="M16 100 H884" style={{ stroke: "rgba(255,255,255,0.16)", strokeWidth: 2, fill: "none" }} />
      <circle cx={68} cy={58} r={10} style={{ fill: "rgba(255,255,255,0.28)" }} />
      <circle cx={102} cy={58} r={10} style={{ fill: "rgba(255,255,255,0.28)" }} />
      <circle cx={136} cy={58} r={10} style={{ fill: "rgba(255,255,255,0.28)" }} />
      <text x={190} y={68} fontSize={26} style={{ ...MONO, fill: "var(--surface-3)" }}>
        {title}
      </text>
      {shown.map((t, i) => (
        <g key={i}>
          <text x={68} y={190 + i * 96} fontSize={34} style={{ ...MONO, ...ACCENT }}>
            $
          </text>
          <text x={112} y={190 + i * 96} fontSize={32} style={{ ...MONO, fill: "var(--surface-3)" }}>
            {t}
          </text>
        </g>
      ))}
      <rect x={68} y={190 + shown.length * 96 - 26} width={26} height={34} style={{ fill: "var(--surface-3)" }} opacity={0.5} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 3. FolderTree — 文件夹 / 目录树（讲文件、仓库结构、数据集、知识库）
 * ══════════════════════════════════════════════════════════════════════ */
export function FolderTree({
  items = [],
  activeIndex = 0,
  className,
  style,
}: VizProps & { items?: string[]; activeIndex?: number }) {
  const rows = items.length ? items : ["", "", "", ""];
  const top = 150;
  const rowH = Math.floor((756 - top) / rows.length);
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(900, 800)}>
      {/* folder tab + body */}
      <path
        d="M30 74 q0 -22 22 -22 h150 l34 34 h612 q22 0 22 22 v626 q0 22 -22 22 H52 q-22 0 -22 -22 z"
        style={SLAB}
      />
      <path d="M30 140 H870" style={HAIR_THIN} />
      {rows.map((r, i) => {
        const y = top + i * rowH;
        const on = i === activeIndex;
        return (
          <g key={i} className={on ? "viz-on" : "viz-dim"}>
            {on ? <rect x={54} y={y + 6} width={792} height={rowH - 12} rx={14} style={ACCENT_SOFT} /> : null}
            {/* folder glyph */}
            <path
              d={`M${82} ${y + rowH * 0.22} h34 l12 12 h30 v34 h-76 z`}
              style={{ fill: "none", stroke: on ? "var(--accent)" : "var(--text-faint)", strokeWidth: 3 }}
            />
            {r ? (
              <text x={186} y={y + rowH * 0.62} fontSize={30} style={{ ...MONO, ...(on ? INK : MUTE) }}>
                {r}
              </text>
            ) : (
              <rect x={186} y={y + rowH * 0.4} width={430} height={20} rx={10} style={FAINT} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 4. DocStack — 文档堆（讲资料 / 文档 / 知识库 / 上下文注入）
 * ══════════════════════════════════════════════════════════════════════ */
export function DocStack({ label = "", className, style }: VizProps & { label?: string }) {
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(720, 700)}>
      <g transform="translate(150 96) rotate(-7 210 250)">
        <rect x={0} y={0} width={420} height={500} rx={18} style={{ ...SURF2, stroke: "var(--rule)", strokeWidth: 2 }} />
      </g>
      <g transform="translate(150 76) rotate(-3 210 250)">
        <rect x={0} y={0} width={420} height={500} rx={18} style={SLAB} />
        <rect x={48} y={70} width={250} height={22} rx={11} style={MUTE} />
        <rect x={48} y={130} width={324} height={14} rx={7} style={FAINT} />
        <rect x={48} y={176} width={300} height={14} rx={7} style={FAINT} />
        <rect x={48} y={222} width={330} height={14} rx={7} style={FAINT} />
        <rect x={48} y={296} width={210} height={14} rx={7} style={ACCENT_SOFT} />
      </g>
      {label ? (
        <text x={360} y={636} fontSize={30} textAnchor="middle" style={CN_MUTE}>
          {label}
        </text>
      ) : null}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 5. ChatBubbles — 对话气泡（讲对话 / 提示词 / 追问 / AI 交互）
 * ══════════════════════════════════════════════════════════════════════ */
export function ChatBubbles({
  messages = [],
  activeIndex = -1,
  className,
  style,
}: VizProps & { messages?: { role: "user" | "ai"; text?: string }[]; activeIndex?: number }) {
  const msgs = messages.length
    ? messages
    : ([{ role: "user" }, { role: "ai" }, { role: "user" }, { role: "ai" }] as {
        role: "user" | "ai";
        text?: string;
      }[]);
  let y = 60;
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(900, 680)}>
      {msgs.map((m, i) => {
        const h = 108;
        const w = i % 2 === 0 ? 520 : 620;
        const x = m.role === "user" ? 900 - 40 - w : 40;
        const cur = y;
        y += h + 34;
        const on = activeIndex < 0 || activeIndex === i;
        return (
          <g key={i} className={on ? "viz-on" : "viz-dim"}>
            <rect
              x={x}
              y={cur}
              width={w}
              height={h}
              rx={26}
              style={m.role === "user" ? SLAB : { ...ACCENT_SOFT, stroke: "var(--accent-glow)", strokeWidth: 2 }}
            />
            {m.text ? (
              <text x={x + 34} y={cur + 66} fontSize={30} style={CN}>
                {m.text}
              </text>
            ) : (
              <>
                <rect x={x + 34} y={cur + 34} width={w - 180} height={20} rx={10} style={MUTE} />
                <rect x={x + 34} y={cur + 68} width={w - 250} height={20} rx={10} style={FAINT} />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 6. CardGrid — 卡片网格（讲并列的几项 / 清单 / 多种能力）
 * ══════════════════════════════════════════════════════════════════════ */
export function CardGrid({
  items = [],
  cols = 2,
  activeIndex = 0,
  className,
  style,
}: VizProps & { items?: string[]; cols?: number; activeIndex?: number }) {
  const list = items.length ? items : ["", "", "", ""];
  const gap = 28;
  const W = 900;
  const cardW = (W - gap * (cols + 1)) / cols;
  const rows = Math.ceil(list.length / cols);
  const cardH = Math.min(200, (660 - gap * (rows + 1)) / rows);
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(900, 660)}>
      {list.map((t, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = gap + c * (cardW + gap);
        const y = gap + r * (cardH + gap);
        const on = i === activeIndex;
        return (
          <g key={i} className={on ? "viz-on" : "viz-dim"}>
            <rect
              x={x}
              y={y}
              width={cardW}
              height={cardH}
              rx={24}
              style={on ? { ...SURF, stroke: "var(--accent)", strokeWidth: 4 } : SLAB}
            />
            <text x={x + 34} y={y + 78} fontSize={44} style={{ ...MONO, ...(on ? ACCENT : FAINT) }}>
              {String(i + 1).padStart(2, "0")}
            </text>
            {t ? (
              <text x={x + 34} y={y + 138} fontSize={32} style={CN}>
                {t}
              </text>
            ) : (
              <rect x={x + 34} y={y + 120} width={cardW - 120} height={20} rx={10} style={FAINT} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 7. PipelineFlow — 流程管道（讲步骤 / 链路 / 数据流；节点自上而下依次点亮）
 *    竖排设计：3:4 竖版视频的中部盒接近方形，横排流程会被压扁留大空。
 * ══════════════════════════════════════════════════════════════════════ */
export function PipelineFlow({
  steps = [],
  activeIndex = 0,
  className,
  style,
}: VizProps & { steps?: string[]; activeIndex?: number }) {
  const list = steps.length ? steps : ["", "", "", ""];
  const n = list.length;
  const W = 720;
  const H = 900;
  const padTop = 40;
  const gap = 40;
  const nodeH = (H - padTop * 2 - gap * (n - 1)) / n;
  const nodeW = 600;
  const x = (W - nodeW) / 2;
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(W, H)}>
      {list.map((t, i) => {
        const y = padTop + i * (nodeH + gap);
        const done = i < activeIndex;
        const on = i === activeIndex;
        const linkTop = y + nodeH;
        const linkBottom = y + nodeH + gap;
        return (
          <g key={i}>
            {i < n - 1 ? (
              <g className={i < activeIndex ? "viz-on" : "viz-dim"}>
                <path
                  className={i < activeIndex ? "viz-draw" : undefined}
                  d={`M${W / 2} ${linkTop + 6} V${linkBottom - 18}`}
                  style={{ ...HAIR, stroke: i < activeIndex ? "var(--accent)" : "var(--rule)" }}
                />
                <path
                  d={`M${W / 2} ${linkBottom - 2} l-13 -18 h26 z`}
                  style={{ fill: i < activeIndex ? "var(--accent)" : "var(--text-faint)" }}
                />
              </g>
            ) : null}
            <g className={on || done ? "viz-on" : "viz-dim"}>
              <rect
                x={x}
                y={y}
                width={nodeW}
                height={nodeH}
                rx={26}
                style={
                  on
                    ? { ...SURF, stroke: "var(--accent)", strokeWidth: 5 }
                    : done
                      ? ACCENT_SOFT
                      : SLAB
                }
              />
              {t ? (
                <text x={W / 2} y={y + nodeH / 2 + 14} fontSize={36} textAnchor="middle" style={CN}>
                  {t}
                </text>
              ) : (
                <rect x={x + 60} y={y + nodeH / 2 - 12} width={nodeW - 120} height={24} rx={12} style={FAINT} />
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 8. TimelineRail — 时间轴（讲时间 / 版本 / 迭代历史 / 知识截止）
 * ══════════════════════════════════════════════════════════════════════ */
export function TimelineRail({
  ticks = [],
  activeIndex = 0,
  className,
  style,
}: VizProps & { ticks?: string[]; activeIndex?: number }) {
  const list = ticks.length ? ticks : ["", "", "", "", ""];
  const n = list.length;
  const W = 900;
  const y = 210;
  const span = W - 160;
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(900, 400)}>
      <path d={`M80 ${y} H820`} style={HAIR_THIN} />
      {list.map((t, i) => {
        const x = 80 + (span * i) / Math.max(1, n - 1);
        const on = i === activeIndex;
        const before = i < activeIndex;
        return (
          <g key={i} className={on || before ? "viz-on" : "viz-dim"}>
            <path d={`M${x} ${y} v-50`} style={{ ...HAIR_THIN, stroke: on ? "var(--accent)" : "var(--rule)" }} />
            <circle cx={x} cy={y} r={on ? 18 : 12} style={on ? ACCENT : before ? ACCENT_SOFT : FAINT} />
            {on ? <circle cx={x} cy={y} r={34} style={{ ...ACCENT_STROKE, opacity: 0.45 }} /> : null}
            {t ? (
              <text
                x={x}
                y={y + 72}
                fontSize={26}
                textAnchor="middle"
                style={on ? { ...MONO, ...INK } : { ...MONO, ...MUTE }}
              >
                {t}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 9. BarChart — 数据条（讲数字对比；值一律由调用方传入真实值）
 * ══════════════════════════════════════════════════════════════════════ */
export function BarChart({
  bars = [],
  activeIndex = -1,
  className,
  style,
}: VizProps & { bars?: { label: string; value: number }[]; activeIndex?: number }) {
  const list = bars.length ? bars : [{ label: "", value: 0 }];
  const max = Math.max(...list.map((b) => b.value), 1);
  const W = 900;
  const baseY = 540;
  const topY = 90;
  const gap = 46;
  const barW = Math.min(150, (W - 120 - gap * (list.length - 1)) / list.length);
  const totalW = list.length * barW + (list.length - 1) * gap;
  const x0 = (W - totalW) / 2;
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(900, 620)}>
      <path d={`M60 ${baseY} H840`} style={HAIR} />
      {list.map((b, i) => {
        const h = Math.max(6, ((b.value / max) * (baseY - topY)));
        const x = x0 + i * (barW + gap);
        const on = activeIndex < 0 || activeIndex === i;
        return (
          <g key={i} className={on ? "viz-on" : "viz-dim"}>
            <rect
              className="viz-grow"
              x={x}
              y={baseY - h}
              width={barW}
              height={h}
              rx={14}
              style={on && i === activeIndex ? ACCENT : on ? ACCENT_SOFT : FAINT}
            />
            <text x={x + barW / 2} y={baseY - h - 22} fontSize={32} textAnchor="middle" style={{ ...MONO, ...INK }}>
              {b.value || ""}
            </text>
            {b.label ? (
              <text x={x + barW / 2} y={baseY + 52} fontSize={28} textAnchor="middle" style={CN_MUTE}>
                {b.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 10. LoopArrow — 循环箭头（讲 loop / 迭代 / 反复调试 / 反馈回路）
 * ══════════════════════════════════════════════════════════════════════ */
export function LoopArrow({
  label = "",
  sublabel = "",
  className,
  style,
}: VizProps & { label?: string; sublabel?: string }) {
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(620, 620)}>
      <path
        className="viz-draw"
        style={{ ...ACCENT_STROKE, strokeWidth: 10 }}
        d="M310 96 a214 214 0 1 1 -152 63"
      />
      <path d="M310 96 l-30 -44 h60 z" style={ACCENT} />
      {label ? (
        <text x={310} y={300} fontSize={52} textAnchor="middle" style={CN}>
          {label}
        </text>
      ) : null}
      {sublabel ? (
        <text x={310} y={368} fontSize={28} textAnchor="middle" style={CN_MUTE}>
          {sublabel}
        </text>
      ) : null}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 11. Magnifier — 放大镜 / 检索（讲搜索、检索、召回、查资料）
 * ══════════════════════════════════════════════════════════════════════ */
export function Magnifier({ label = "", className, style }: VizProps & { label?: string }) {
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(620, 620)}>
      <circle cx={268} cy={248} r={170} style={{ ...SURF, stroke: "var(--accent)", strokeWidth: 12 }} />
      <path d="M392 372 L540 520" style={{ stroke: "var(--text)", strokeWidth: 28, strokeLinecap: "round", fill: "none" }} />
      {/* 镜筒里的"命中项" */}
      <rect x={180} y={182} width={176} height={18} rx={9} style={MUTE} />
      <rect x={180} y={224} width={132} height={14} rx={7} style={FAINT} />
      <rect x={180} y={258} width={160} height={14} rx={7} style={ACCENT} />
      <rect x={180} y={292} width={104} height={14} rx={7} style={FAINT} />
      {label ? (
        <text x={310} y={592} fontSize={32} textAnchor="middle" style={CN}>
          {label}
        </text>
      ) : null}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * 12. ListStack — 竖版并列清单（纵排 N 条：序号 + 标签 + 可选数值/说明）
 *     横版类元素（CardGrid / BarChart）在 3:4 竖版舞台里填不满；本元素的
 *     viewBox 880×935 ≈ band-main(竖版) 的比例，单挂即纵向撑满中部。
 * ══════════════════════════════════════════════════════════════════════ */
export function ListStack({
  items = [],
  activeIndex = 0,
  className,
  style,
}: VizProps & {
  items?: { label: string; value?: string }[];
  activeIndex?: number;
}) {
  const list = items.length
    ? items
    : [{ label: "" }, { label: "" }, { label: "" }, { label: "" }];
  const W = 880;
  const H = 935;
  const padY = 26;
  const gap = 22;
  const n = list.length;
  const rowH = (H - padY * 2 - gap * (n - 1)) / n;
  return (
    <svg className={["viz", className].filter(Boolean).join(" ")} style={style} {...box(W, H)}>
      {list.map((it, i) => {
        const y = padY + i * (rowH + gap);
        const on = i === activeIndex;
        return (
          <g key={i} className={on ? "viz-on" : "viz-dim"}>
            <rect
              x={0}
              y={y}
              width={W}
              height={rowH}
              rx={26}
              style={on ? { ...SURF, stroke: "var(--accent)", strokeWidth: 5 } : SLAB}
            />
            <text
              x={46}
              y={y + rowH / 2 + 14}
              fontSize={38}
              className="viz-num"
              style={{ ...MONO, ...(on ? ACCENT : FAINT) }}
            >
              {String(i + 1).padStart(2, "0")}
            </text>
            {it.label ? (
              <text x={156} y={y + rowH / 2 + 14} fontSize={40} style={CN}>
                {it.label}
              </text>
            ) : (
              <rect x={156} y={y + rowH / 2 - 12} width={W - 300} height={24} rx={12} style={FAINT} />
            )}
            {it.value ? (
              <text
                x={W - 44}
                y={y + rowH / 2 + 14}
                fontSize={36}
                textAnchor="end"
                className="viz-num"
                style={{ ...MONO, ...INK }}
              >
                {it.value}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

