#!/usr/bin/env python3
"""
build_from_shots.py —— 从「逐步截图」装配成片（web-video-presentation 标准能力）

根治音画不同步（已踩坑，写进 skill）：
  • 每张 step 截图在页面时钟精确时刻抓取（步切换后 ~200ms，入场动画已定格），
    内容绝对对应「第 i 步」，与录制帧抖动无关。
  • 用「干净累积时长」重建音轨：第 i 段音频摆在
        offset[i] = Σ_{j<i}(durs[j] + GAP)
    即「上一段音频结束 + 运行时 200ms 推进间隙」。完全不引入 webm 抖动。
  • 图片按 durs[i] + GAP 定格（音频播完留 200ms 静态尾帧，与运行时一致），
    与干净音轨共用同一时间轴 → 逐帧对齐。

依赖：
  • record.mjs 已产出 $RAW_DIR/shots/step-<chapterSlug>-<step>.png 与 marks.json
    （marks 的 id = "<chapterSlug>:<step 1-based>"，与 beats.json 的 step_id 同口径）
  • npm run extract-narrations 已产出 $ROOT/audio-segments.json
  • npm run synthesize-audio 已产出 $ROOT/public/audio/<chapter>/<step>.mp3
  • ffmpeg（FFMPEG 环境变量，或 PATH 里的 ffmpeg）

配置（env，可选）：
  PROJECT_ROOT   default = cwd
  RAW_DIR        default = $PROJECT_ROOT/raw
  OUT_NAME       default = <项目目录名>-final.mp4
  SR             默认 24000（与 edge-tts 原生采样率一致，解码无损）
  GAP            默认 0.2（与运行时 audio.ended + 200ms 一致）
"""
import functools
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(os.environ.get("PROJECT_ROOT", os.getcwd())).resolve()
RAW = Path(os.environ.get("RAW_DIR", ROOT / "raw"))
SHOTS = RAW / "shots"
PUBLIC_AUDIO = ROOT / "public" / "audio"
FINAL = ROOT / (os.environ.get("OUT_NAME") or f"{ROOT.name}-final.mp4")

SR = int(os.environ.get("SR", "24000"))
GAP = float(os.environ.get("GAP", "0.2"))

# ── ffmpeg 解析 ───────────────────────────────────────────────────────────
FFMPEG = os.environ.get("FFMPEG")
if not FFMPEG:
    import shutil
    FFMPEG = shutil.which("ffmpeg")
if not FFMPEG:
    # 用户机器上已知的安装位置（兜底）
    cand = (ROOT / ".." / "tools" / "record" / "node_modules"
            / "@ffmpeg-installer" / "win32-x64" / "ffmpeg.exe")
    FFMPEG = str(cand) if cand.exists() else "ffmpeg"
print(f"ffmpeg: {FFMPEG}")

# ── 帧率模式标志（版本自适应）──────────────────────────────────────────────
# ffmpeg ≥ 5.1 用 `-fps_mode cfr`；旧版（含 4.x）只有 `-vsync cfr`。
# 本机已知二进制是 2018 年的 git snapshot（4.x 线），只认 -vsync。
_RELEASE_RE = re.compile(r"ffmpeg version\s+n?(\d+)\.(\d+)")


def _flag_for_version(text: str) -> str:
    """把 `ffmpeg -version` 的首行文本解析成帧率模式的标志名。"""
    m = _RELEASE_RE.search(text or "")
    if m and (int(m.group(1)), int(m.group(2))) >= (5, 1):
        return "-fps_mode"
    return "-vsync"


@functools.lru_cache(maxsize=None)
def _fps_mode_flag(ffmpeg: str) -> str:
    """探测所选 ffmpeg 的版本，返回该用的帧率模式标志。按路径缓存，避免重复起子进程。"""
    try:
        ver = subprocess.run(
            [ffmpeg, "-version"], capture_output=True, text=True).stdout or ""
    except Exception:
        ver = ""
    first = ver.splitlines()[0] if ver else ""
    return _flag_for_version(first)


def decode_mp3(mp3: Path) -> bytes:
    """把 mp3 解码成 s16le PCM 字节（SR/单声道），同时用于测时长与拼轨。"""
    return subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-i", str(mp3),
         "-f", "s16le", "-ar", str(SR), "-ac", "1", "-"],
        capture_output=True,
    ).stdout


def main():
    marks_doc = json.loads((RAW / "marks.json").read_text(encoding="utf-8"))
    segs = json.loads((ROOT / "audio-segments.json").read_text(encoding="utf-8"))
    marks = marks_doc["marks"]
    if not marks:
        print("✗ marks.json 为空，先跑 record.mjs", file=sys.stderr)
        sys.exit(1)

    # 每段音频解码 + 时长（key = (chapterId, step1)）
    audio_map: dict[tuple[str, int], bytes] = {}
    for seg in segs:
        mp3 = PUBLIC_AUDIO / seg["audio"]
        if not mp3.exists():
            print(f"✗ 缺音频: {mp3}", file=sys.stderr)
            sys.exit(1)
        pcm = decode_mp3(mp3)
        audio_map[(seg["chapter"], seg["step"])] = pcm
    print(f"已解码 {len(segs)} 段音频")

    # 按 marks 顺序把每步映射到 (时长, 截图)
    seq = []          # (png_path, pcm_bytes, dur)
    missing = []
    for m in marks:
        # marks id 已是 "<chapterSlug>:<step 1-based>"（record.mjs 直接写这个口径）
        chapter_id, step_str = m["id"].split(":", 1)
        step1 = int(step_str)
        pcm = audio_map.get((chapter_id, step1), b"")
        dur = len(pcm) / (SR * 2)
        png = SHOTS / f"step-{chapter_id}-{step1}.png"
        if not png.exists():
            missing.append(str(png))
        seq.append((png, pcm, dur))

    if missing:
        print(f"✗ 缺截图 {len(missing)} 张，先跑 record.mjs：", file=sys.stderr)
        print("  " + "\n  ".join(missing[:5]), file=sys.stderr)
        sys.exit(1)

    n = len(seq)
    print(f"步数 {n}，截图齐全")

    # ── 1. 干净音轨：纯累积时长，不引入抖动 ───────────────────────────────
    offsets = [0.0]
    for i in range(1, n):
        offsets.append(offsets[-1] + seq[i - 1][2] + GAP)
    total = offsets[-1] + seq[-1][2] + 0.4
    buf = bytearray(int(total * SR) * 2)
    for i, (_, pcm, _) in enumerate(seq):
        if not pcm:
            continue
        at = int(offsets[i] * SR) * 2
        end = at + len(pcm)
        if end > len(buf):
            buf.extend(bytearray(end - len(buf)))
        buf[at:end] = pcm
    clean_pcm = RAW / "narration_clean.pcm"
    clean_pcm.write_bytes(buf)
    clean_wav = RAW / "narration_clean.wav"
    subprocess.run([
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", str(clean_pcm),
        "-ar", "48000", "-c:a", "pcm_s16le", str(clean_wav),
    ], check=True)
    print(f"干净音轨 {total:.1f}s（offset[0..2]={[round(o, 2) for o in offsets[:3]]}）")

    # ── 2. concat 列表：每张图按 dur+GAP 定格 ─────────────────────────────
    list_path = RAW / "shots_concat.txt"
    with list_path.open("w", encoding="utf-8") as f:
        for i, (png, _, dur) in enumerate(seq):
            hold = dur + GAP + (0.4 if i == n - 1 else 0)
            f.write(f"file '{png.as_posix()}'\n")
            f.write(f"duration {hold:.3f}\n")
    print(f"视频总时长(图定格) {sum(d + GAP + (0.4 if i == n - 1 else 0) for i, (_, _, d) in enumerate(seq)):.1f}s")

    # 3) 图 → 静帧视频（CFR 25，拖条精准）
    raw_vid = RAW / "shots_raw.mp4"
    fps_flag = _fps_mode_flag(FFMPEG)
    print(f"帧率模式标志: {fps_flag} cfr（{FFMPEG}）")
    subprocess.run([
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-f", "concat", "-safe", "0", "-i", str(list_path),
        fps_flag, "cfr", "-r", "25", "-pix_fmt", "yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-g", "25", "-keyint_min", "25", str(raw_vid),
    ], check=True)

    # 4) 混音
    subprocess.run([
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(raw_vid), "-i", str(clean_wav),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart", "-shortest", str(FINAL),
    ], check=True)

    out = subprocess.run([FFMPEG, "-hide_banner", "-i", str(FINAL)],
                         capture_output=True, text=True).stderr
    m = re.search(r"Duration: (\d+):(\d\d):(\d\d\.\d+)", out)
    dur = float(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3)) if m else 0
    print(f"\n✓ 成片: {FINAL}")
    print(f"  时长 {dur / 60:.1f} 分 ({dur:.0f}s) ｜ 大小 {FINAL.stat().st_size / 1024 / 1024:.0f} MB")
    print("  同步：截图按干净累积时长定格 + 干净音轨，零录制抖动")


if __name__ == "__main__":
    main()
