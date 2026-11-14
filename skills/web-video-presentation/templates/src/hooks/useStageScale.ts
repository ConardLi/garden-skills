import { useEffect, useState } from "react";
import { STAGE_W, STAGE_H } from "../stage.config";

/**
 * Compute the scale needed to fit the stage (STAGE_W×STAGE_H, defined in
 * stage.config.ts) inside the current viewport.
 *
 * IMPORTANT — 默认 margin 为 0：录制视口 = 舞台尺寸（1080×1440 / 1920×1080），
 * margin 非 0 会让舞台被等比缩小后四周露出 --shell 底色（letterbox），
 * 屏幕录制出来的成片就带着一圈"外壳"，画面有效面积白白缩水到 ~85%
 * （ep07 实测踩坑：内容看着只占屏幕 2/3，底部一条米色空边）。
 * 因此默认满幅（scale = min(vw/STAGE_W, vh/STAGE_H)），录制即像素对齐，
 * 不产生任何缩放重采样与 letterbox。
 *
 * marginX / marginY 只在 **实时预览**（浏览器窗口不是舞台比例、且想留出
 * 进度条等 chrome 的呼吸位）时才需要显式传入 > 0 的值。
 */
export function useStageScale(marginX = 0, marginY = 0) {
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
