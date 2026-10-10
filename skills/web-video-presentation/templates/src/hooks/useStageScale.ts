import { useEffect, useState } from "react";
import { STAGE_W, STAGE_H } from "../stage.config";

/**
 * Compute the scale needed to fit the stage (STAGE_W×STAGE_H, defined in
 * stage.config.ts) inside the current viewport, leaving `marginX` /
 * `marginY` of breathing room around it (so absolutely-positioned UI
 * like the progress bar isn't cropped).
 */
export function useStageScale(marginX = 80, marginY = 100) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      const usefulW = Math.max(320, window.innerWidth - marginX * 2);
      const usefulH = Math.max(180, window.innerHeight - marginY * 2);
      setScale(Math.min(usefulW / STAGE_W, usefulH / STAGE_H));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [marginX, marginY]);

  return scale;
}
