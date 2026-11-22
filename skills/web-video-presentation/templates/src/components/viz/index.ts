/**
 * 章节视觉元素库 —— 统一出口。
 *
 *   import { BrowserWindow, PipelineFlow } from "../components/viz";
 *
 * 元素清单与选用场景见 ./README.md；规则见本目录 Viz.tsx 头部注释。
 */
export {
  BrowserWindow,
  Terminal,
  FolderTree,
  DocStack,
  ChatBubbles,
  CardGrid,
  PipelineFlow,
  TimelineRail,
  BarChart,
  LoopArrow,
  Magnifier,
  ListStack,
} from "./Viz";
export type { VizProps } from "./Viz";
