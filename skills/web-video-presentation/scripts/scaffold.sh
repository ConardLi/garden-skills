#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# scaffold.sh —— 一键脚手架，创建一个 video-presentation 项目。
#
# 用法：
#   bash scripts/scaffold.sh <target-dir> [--theme=<id>] [--ratio=W:H]
#   bash scripts/scaffold.sh --list-themes
#
# 例子：
#   bash <path-to-web-video-presentation>/scripts/scaffold.sh ./presentation
#   bash <path-to-web-video-presentation>/scripts/scaffold.sh ./talk --theme=paper-press
#   bash <path-to-web-video-presentation>/scripts/scaffold.sh ./xhs --ratio=3:4
#   bash <path-to-web-video-presentation>/scripts/scaffold.sh --list-themes
#
# 比例（--ratio，默认 16:9）：
#   16:9  (默认) 1920×1080  —— B站 / YouTube / 抖音
#   3:4          1080×1440  —— 小红书竖版
#   9:16         1080×1920  —— 小红书 / 视频号竖版
#   任意 W:H     以 1080 为基准宽推算高
#
# 跑完后，看 SKILL.md "Phase 2.4 实现单章" + references/CHAPTER-CRAFT.md
# 了解每章怎么写。卡壳时翻 references/EXAMPLES/ 找完整章节 anchor。
#
# 之后切换主题，覆盖一个文件即可：
#   cp <path-to-web-video-presentation>/themes/<id>/tokens.css \
#      <project>/src/styles/tokens.css
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES="$SKILL_DIR/templates"
THEMES_DIR="$SKILL_DIR/themes"
DEFAULT_THEME="midnight-press"

list_themes() {
  echo "可用主题（来自 ${THEMES_DIR}）:"
  echo
  for dir in "$THEMES_DIR"/*/; do
    [[ -d "$dir" ]] || continue
    local meta="$dir/theme.json"
    [[ -f "$meta" ]] || continue
    # 没有 jq，简单 grep + sed 提字段
    local id name desc
    id=$(grep -E '"id"' "$meta" | head -n1 | sed -E 's/.*"id":[[:space:]]*"([^"]+)".*/\1/')
    name=$(grep -E '"nameZh"' "$meta" | head -n1 | sed -E 's/.*"nameZh":[[:space:]]*"([^"]+)".*/\1/')
    desc=$(grep -E '"descriptionZh"' "$meta" | head -n1 | sed -E 's/.*"descriptionZh":[[:space:]]*"([^"]+)".*/\1/')
    printf "  • %-18s %s\n      %s\n\n" "$id" "$name" "$desc"
  done
  echo "用 --theme=<id> 选定一个。默认：${DEFAULT_THEME}。"
}

# ── 解析参数 ──
TARGET=""
THEME="$DEFAULT_THEME"
RATIO=""
for arg in "$@"; do
  case "$arg" in
    --list-themes)
      list_themes
      exit 0
      ;;
    --theme=*)
      THEME="${arg#--theme=}"
      ;;
    --ratio=*)
      RATIO="${arg#--ratio=}"
      ;;
    --portrait|--vertical)
      RATIO="3:4"
      ;;
    --*)
      echo "✗ 未知参数: $arg" >&2
      exit 1
      ;;
    *)
      if [[ -z "$TARGET" ]]; then TARGET="$arg"; fi
      ;;
  esac
done

TARGET="${TARGET:-presentation}"

# ── 解析舞台比例 → STAGE_W / STAGE_H ──
if [[ -z "$RATIO" || "$RATIO" == "16:9" || "$RATIO" == "16x9" ]]; then
  STAGE_W=1920; STAGE_H=1080
elif [[ "$RATIO" == "3:4" || "$RATIO" == "3x4" ]]; then
  STAGE_W=1080; STAGE_H=1440
elif [[ "$RATIO" == "9:16" || "$RATIO" == "9x16" ]]; then
  STAGE_W=1080; STAGE_H=1920
else
  aw="${RATIO%%:*}"; ah="${RATIO##*:}"
  [[ "$RATIO" == *x* ]] && { aw="${RATIO%%x*}"; ah="${RATIO##x*}"; }
  if [[ ! "$aw" =~ ^[0-9]+$ || ! "$ah" =~ ^[0-9]+$ ]]; then
    echo "✗ 无法解析 --ratio=$RATIO（用 W:H，如 3:4 / 9:16）" >&2
    exit 1
  fi
  STAGE_W=1080
  STAGE_H=$(( STAGE_W * ah / aw ))
fi

THEME_DIR="$THEMES_DIR/$THEME"
THEME_TOKENS="$THEME_DIR/tokens.css"

if [[ ! -d "$THEME_DIR" || ! -f "$THEME_TOKENS" ]]; then
  echo "✗ 找不到主题 '${THEME}'。可用主题：" >&2
  echo >&2
  for dir in "$THEMES_DIR"/*/; do
    [[ -d "$dir" ]] || continue
    echo "    • $(basename "$dir")" >&2
  done
  exit 1
fi

if [[ -d "$TARGET" && -n "$(ls -A "$TARGET" 2>/dev/null || true)" ]]; then
  echo "✗ 目标目录 '${TARGET}' 已存在且非空，已中止。" >&2
  exit 1
fi

if ! command -v npm >/dev/null; then
  echo "✗ 需要 npm，但在 PATH 里没找到。" >&2
  exit 1
fi

echo "▸ 在 $TARGET 创建 Vite + React + TS 项目"
echo "▸ 使用主题：$THEME"
echo "▸ 舞台比例：${RATIO:-16:9} (${STAGE_W}×${STAGE_H})"
npm create vite@latest "$TARGET" -- --template react-ts >/dev/null

cd "$TARGET"
echo "▸ 安装依赖（可能要等一会）..."
npm install >/dev/null 2>&1

echo "▸ 安装 tsx（用于 extract-narrations 脚本）..."
npm install --save-dev tsx >/dev/null 2>&1

echo "▸ 用演示骨架替换默认 boilerplate"

# 干掉我们不要的 Vite 默认 boilerplate
rm -f \
  src/App.tsx src/App.css \
  src/main.tsx src/index.css \
  src/assets/react.svg \
  public/vite.svg \
  README.md
rmdir src/assets 2>/dev/null || true

# 把脚手架文件拷到项目根
mkdir -p \
  src/styles src/hooks src/components src/registry \
  src/chapters/01-example \
  public scripts

cp "$TEMPLATES/vite.config.ts" .
cp "$TEMPLATES/index.html" .

cp "$TEMPLATES/src/main.tsx" src/main.tsx
cp "$TEMPLATES/src/App.tsx"  src/App.tsx
cp "$TEMPLATES/src/stage.config.ts"  src/stage.config.ts

# tokens.css 来自所选主题
cp "$THEME_TOKENS"                          src/styles/tokens.css
cp "$TEMPLATES/src/styles/base.css"         src/styles/base.css
cp "$TEMPLATES/src/styles/animations.css"   src/styles/animations.css
cp "$TEMPLATES/src/styles/fonts.css"        src/styles/fonts.css

cp "$TEMPLATES/src/hooks/useStageScale.ts"   src/hooks/useStageScale.ts
cp "$TEMPLATES/src/hooks/useStepper.ts"      src/hooks/useStepper.ts
cp "$TEMPLATES/src/hooks/useAudioPlayer.ts"  src/hooks/useAudioPlayer.ts
cp "$TEMPLATES/src/hooks/useAutoMode.ts"     src/hooks/useAutoMode.ts

cp "$TEMPLATES/src/components/Stage.tsx"          src/components/Stage.tsx
cp "$TEMPLATES/src/components/MaskReveal.tsx"     src/components/MaskReveal.tsx
cp "$TEMPLATES/src/components/ProgressBar.tsx"    src/components/ProgressBar.tsx
cp "$TEMPLATES/src/components/ProgressBar.css"    src/components/ProgressBar.css
cp "$TEMPLATES/src/components/AutoStartGate.tsx"  src/components/AutoStartGate.tsx
cp "$TEMPLATES/src/components/AutoStartGate.css"  src/components/AutoStartGate.css
cp "$TEMPLATES/src/components/AutoToggle.tsx"     src/components/AutoToggle.tsx
cp "$TEMPLATES/src/components/AutoToggle.css"     src/components/AutoToggle.css

cp "$TEMPLATES/src/registry/types.ts"    src/registry/types.ts
cp "$TEMPLATES/src/registry/chapters.ts" src/registry/chapters.ts

# 章节视觉元素库（具象元素：浏览器窗 / 文件夹 / 终端 / 文档堆 / 流程…）
mkdir -p src/components/viz
cp "$TEMPLATES/src/components/viz/Viz.tsx"   src/components/viz/Viz.tsx
cp "$TEMPLATES/src/components/viz/viz.css"   src/components/viz/viz.css
cp "$TEMPLATES/src/components/viz/index.ts"  src/components/viz/index.ts
cp "$TEMPLATES/src/components/viz/README.md" src/components/viz/README.md

cp "$TEMPLATES/src/chapters/01-example/Example.tsx"     src/chapters/01-example/Example.tsx
cp "$TEMPLATES/src/chapters/01-example/Example.css"     src/chapters/01-example/Example.css
cp "$TEMPLATES/src/chapters/01-example/narrations.ts"   src/chapters/01-example/narrations.ts

# Audio pipeline scripts (extract-narrations + synthesize-audio runner +
# pluggable TTS providers under tts-providers/).
cp "$TEMPLATES/scripts/extract-narrations.ts"  scripts/extract-narrations.ts
cp "$TEMPLATES/scripts/synthesize-audio.sh"    scripts/synthesize-audio.sh
chmod +x scripts/synthesize-audio.sh

mkdir -p scripts/tts-providers
cp "$TEMPLATES/scripts/tts-providers/README.md"   scripts/tts-providers/README.md
cp "$TEMPLATES/scripts/tts-providers/minimax.sh"  scripts/tts-providers/minimax.sh
cp "$TEMPLATES/scripts/tts-providers/openai.sh"   scripts/tts-providers/openai.sh

# 无头截图录制（方案 C：零抖动全自动成片，根治 webm 帧抖动）
cp "$SKILL_DIR/scripts/record.mjs"          scripts/record.mjs
cp "$SKILL_DIR/scripts/build_from_shots.py" scripts/build_from_shots.py
chmod +x scripts/record.mjs

# 非 16:9 时把舞台尺寸写进 stage.config.ts（单一真相源）
if [[ "$STAGE_W" != "1920" || "$STAGE_H" != "1080" ]]; then
  echo "▸ 应用舞台尺寸 ${STAGE_W}×${STAGE_H} (--ratio=${RATIO:-自定义})"
  node -e '
    const fs = require("fs");
    const f = "src/stage.config.ts";
    let s = fs.readFileSync(f, "utf8");
    s = s.replace(/export const STAGE_W = [0-9]+;/, "export const STAGE_W = '"$STAGE_W"';");
    s = s.replace(/export const STAGE_H = [0-9]+;/, "export const STAGE_H = '"$STAGE_H"';");
    fs.writeFileSync(f, s);
  '
fi

# Wire the audio scripts into npm so contributors don't have to remember
# the exact command. Uses node to merge into the existing package.json.
node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
p.scripts = Object.assign({}, p.scripts, {
  "extract-narrations": "tsx scripts/extract-narrations.ts",
  "synthesize-audio":   "bash scripts/synthesize-audio.sh",
  "record": "node scripts/record.mjs",
  "build:video": "python scripts/build_from_shots.py",
});
fs.writeFileSync("package.json", JSON.stringify(p, null, 2) + "\n");
'

# 留个标记，以后能查这个项目从哪个主题起步的
{
  echo "$THEME"
} > .theme

# 跑一次 typecheck 确认接线 OK
echo "▸ 跑 typecheck ..."
if npx tsc --noEmit; then
  echo "✓ typecheck 通过"
else
  echo "✗ typecheck 失败 —— 请看上面的错误" >&2
  exit 1
fi

cat <<EOF

✓ 完成。下一步：

  1. cd $TARGET
  2. npm run dev      # 默认 http://localhost:5174（被占会自动换端口）

当前主题：${THEME}（见 .theme）

然后：

  • 点舞台任意位置推进全局 step 计数器。
  • 鼠标移到底部边缘可显出进度条；鼠标移到右上角可显出播放模式切换。
  • 把 src/chapters/01-example/ 替换成你自己的章节
    （流程见 SKILL.md "Phase 2.4 实现单章" —— 每章一次到位完整版本，
     不分骨架 / 精修两步；动画选型由 chapter agent 按 CHAPTER-CRAFT.md
     Part 0 原则 7 + Part 1 五问决定）。
  • 在 src/registry/chapters.ts 注册每个新章节。
  • **每章必须有 narrations.ts**（与 Example.tsx 同目录），
    数组长度 = step 数，是音频合成 + Auto 模式的唯一真相源。
  • 章节改了就 bump src/hooks/useStepper.ts 的 STORAGE_KEY 末尾版本号。

录制：

  • 手动模式：直接打开 http://localhost:5174（点击 / 方向键推进）
  • 半自动：URL 加 ?audio=1 — 音频跟 step 切，但你手动推进
  • 全自动录屏：URL 加 ?auto=1 — 按一次 SPACE 启动，整片自动播 + 推进
                按 M 键随时切换三种模式。
  • 录制视口 = 舞台尺寸 ${STAGE_W}×${STAGE_H}：浏览器全屏 / 录屏窗口设成
    这个数，?auto=1 录出来的成片就是该比例（16:9 即 1920×1080；竖版 3:4 即 1080×1440）。

音频合成（可选，录制前做）：

  npm run extract-narrations    # 扫所有章节 narrations.ts → audio-segments.json
  npm run synthesize-audio      # 默认 minimax provider 合成 → public/audio/<id>/<step>.mp3
                                # 换 provider：PRESENTATION_TTS=<name> npm run synthesize-audio
                                # 自定义 / 没装 mmx 见 scripts/tts-providers/README.md

写章节时必读（单一入口，路径在 SKILL 仓库内）：

  • $SKILL_DIR/references/CHAPTER-CRAFT.md
      Part 0 十条原则 / Part 1 开工 5 问 / Part 2 关系→动作决策树 /
      Part 3 视觉工具箱 / Part 4 时长 / Part 5 反 AI 味反模式 /
      Part 6 代码硬规则 / Part 7 完工自检 / Part 8 反馈速查
  • $SKILL_DIR/themes/$THEME/theme.json
      看 descriptionZh / mood / bestFor —— 参考主题气质
      （动画 / 时长 / 字号 / emoji 由 chapter agent 在每章自由决定）
  • 具象元素库 src/components/viz/（已拷入本工程，含 README.md 选用手册）
      12 个纯 SVG 元素（浏览器窗 / 终端 / 文件夹 / 文档堆 / 对话气泡 /
      卡片网格 / 流程管道 / 时间轴 / 数据条 / 循环箭头 / 检索放大镜 / 竖版清单）
      ★ 每个 step 至少挂 1 个与当拍口播相关的元素；中部主视觉占舞台高
        ≥55%（治"画面空洞 / 内容只占屏幕三分之一"）

卡壳时可翻：

  • $SKILL_DIR/references/EXAMPLES/
      完整章节 anchor（钩子型 / 列举型）—— 看"形"，不要照搬

要换一个主题，覆盖 tokens.css 即可：
  cp $SKILL_DIR/themes/<id>/tokens.css src/styles/tokens.css

想自创主题，看 $SKILL_DIR/references/THEMES.md。

EOF
