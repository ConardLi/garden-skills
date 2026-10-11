import type { CSSProperties, ReactNode } from "react";
import { useStageScale } from "../hooks/useStageScale";
import { STAGE_W, STAGE_H } from "../stage.config";

interface Props {
  onAdvance(): void;
  children: ReactNode;
}

/**
 * The presentation stage. Click anywhere except interactive children = advance.
 * Stage size (STAGE_W×STAGE_H) lives in stage.config.ts — single source of truth.
 *
 * Layout structure (3 nested elements):
 *   .app-shell    ← full viewport, flex-centers the fitter
 *   .stage-fitter ← sized to ACTUAL VISIBLE px (STAGE_W*scale × STAGE_H*scale)
 *                   so the layout system honestly sees what's on screen
 *                   and centers it bulletproof on every viewport / DPR.
 *   .stage-frame  ← raw STAGE_W×STAGE_H box, scaled from top-left into the fitter.
 *
 * Surface colors come from the active theme's CSS custom properties
 * (var(--shell), var(--surface)) — see themes/<id>/tokens.css.
 */
export function Stage({ onAdvance, children }: Props) {
  const scale = useStageScale();
  const fitterStyle: CSSProperties = {
    width: STAGE_W * scale,
    height: STAGE_H * scale,
  };
  const frameStyle: CSSProperties = {
    width: `${STAGE_W}px`,
    height: `${STAGE_H}px`,
    transform: `scale(${scale})`,
  };
  return (
    <div className="app-shell">
      <div className="stage-fitter" style={fitterStyle}>
        <div
          className="stage-frame"
          style={frameStyle}
          onClick={(e) => {
            const t = e.target as HTMLElement;
            if (t.closest("button, a, input, [data-no-advance]")) return;
            onAdvance();
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
