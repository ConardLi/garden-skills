import { useEffect, useState } from "react";

/**
 * Compute the scale needed to fit a 1920x1080 stage inside the current
 * viewport, leaving `marginX` / `marginY` of breathing room around it
 * (so absolutely-positioned UI like the progress bar isn't cropped).
 */
export function useStageScale(
  baseW = 1920,
  baseH = 1080,
  marginX = 80,
  marginY = 100,
) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      const usefulW = Math.max(320, window.innerWidth - marginX * 2);
      const usefulH = Math.max(180, window.innerHeight - marginY * 2);
      setScale(Math.min(usefulW / baseW, usefulH / baseH));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [baseW, baseH, marginX, marginY]);

  return scale;
}
