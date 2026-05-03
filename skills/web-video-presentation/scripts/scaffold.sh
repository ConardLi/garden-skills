#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# scaffold.sh —— 一键脚手架，创建一个 video-presentation 项目。
#
# 用法：
#   bash scripts/scaffold.sh <target-dir> [--theme=<id>]
#   bash scripts/scaffold.sh --list-themes
#
# 例子：
#   bash .cursor/skills/web-video-presentation/scripts/scaffold.sh ./presentation
#   bash .cursor/skills/web-video-presentation/scripts/scaffold.sh ./talk --theme=paper-press
#   bash .cursor/skills/web-video-presentation/scripts/scaffold.sh --list-themes
#
# 跑完后，看 SKILL.md "Phase 2.4 实现单章" + references/CHAPTER-CRAFT.md
# 了解每章怎么写。卡壳时翻 references/EXAMPLES/ 找完整章节 anchor。
#
# 之后切换主题，覆盖一个文件即可：
#   cp .cursor/skills/web-video-presentation/themes/<id>/tokens.css \
#      <project>/src/styles/tokens.css
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES="$SKILL_DIR/templates"
THEMES_DIR="$SKILL_DIR/themes"
DEFAULT_THEME="midnight-press"

list_themes() {
  echo "可用主题（来自 $THEMES_DIR）:"
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
  echo "用 --theme=<id> 选定一个。默认：$DEFAULT_THEME。"
}

# ── 解析参数 ──
TARGET=""
THEME="$DEFAULT_THEME"
for arg in "$@"; do
  case "$arg" in
    --list-themes)
      list_themes
      exit 0
      ;;
    --theme=*)
      THEME="${arg#--theme=}"
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
THEME_DIR="$THEMES_DIR/$THEME"
THEME_TOKENS="$THEME_DIR/tokens.css"

if [[ ! -d "$THEME_DIR" || ! -f "$THEME_TOKENS" ]]; then
  echo "✗ 找不到主题 '$THEME'。可用主题：" >&2
  echo >&2
  for dir in "$THEMES_DIR"/*/; do
    [[ -d "$dir" ]] || continue
    echo "    • $(basename "$dir")" >&2
  done
  exit 1
fi

if [[ -d "$TARGET" && -n "$(ls -A "$TARGET" 2>/dev/null || true)" ]]; then
  echo "✗ 目标目录 '$TARGET' 已存在且非空，已中止。" >&2
  exit 1
fi

if ! command -v npm >/dev/null; then
  echo "✗ 需要 npm，但在 PATH 里没找到。" >&2
  exit 1
fi

echo "▸ 在 $TARGET 创建 Vite + React + TS 项目"
echo "▸ 使用主题：$THEME"
npm create vite@latest "$TARGET" -- --template react-ts >/dev/null

cd "$TARGET"
echo "▸ 安装依赖（可能要等一会）..."
npm install >/dev/null 2>&1

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
  public

cp "$TEMPLATES/vite.config.ts" .
cp "$TEMPLATES/index.html" .

cp "$TEMPLATES/src/main.tsx" src/main.tsx
cp "$TEMPLATES/src/App.tsx"  src/App.tsx

# tokens.css 来自所选主题
cp "$THEME_TOKENS"                          src/styles/tokens.css
cp "$TEMPLATES/src/styles/base.css"         src/styles/base.css
cp "$TEMPLATES/src/styles/animations.css"   src/styles/animations.css
cp "$TEMPLATES/src/styles/fonts.css"        src/styles/fonts.css

cp "$TEMPLATES/src/hooks/useStageScale.ts" src/hooks/useStageScale.ts
cp "$TEMPLATES/src/hooks/useStepper.ts"    src/hooks/useStepper.ts

cp "$TEMPLATES/src/components/Stage.tsx"        src/components/Stage.tsx
cp "$TEMPLATES/src/components/MaskReveal.tsx"   src/components/MaskReveal.tsx
cp "$TEMPLATES/src/components/ProgressBar.tsx"  src/components/ProgressBar.tsx
cp "$TEMPLATES/src/components/ProgressBar.css"  src/components/ProgressBar.css

cp "$TEMPLATES/src/registry/types.ts"    src/registry/types.ts
cp "$TEMPLATES/src/registry/chapters.ts" src/registry/chapters.ts

cp "$TEMPLATES/src/chapters/01-example/Example.tsx" src/chapters/01-example/Example.tsx
cp "$TEMPLATES/src/chapters/01-example/Example.css" src/chapters/01-example/Example.css

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

当前主题：$THEME（见 .theme）

然后：

  • 点舞台任意位置推进全局 step 计数器。
  • 鼠标移到底部边缘可显出进度条。
  • 把 src/chapters/01-example/ 替换成你自己的章节
    （流程见 SKILL.md "Phase 2.4 实现单章" —— 每章一次到位完整版本，
     不分骨架 / 精修两步；动画选型由 chapter agent 按 CHAPTER-CRAFT.md
     Part 0 原则 7 + Part 1 五问决定）。
  • 在 src/registry/chapters.ts 注册每个新章节。
  • 章节改了就 bump src/hooks/useStepper.ts 的 STORAGE_KEY 末尾版本号。

写章节时必读（单一入口，路径在 SKILL 仓库内）：

  • $SKILL_DIR/references/CHAPTER-CRAFT.md
      Part 0 十条原则 / Part 1 开工 5 问 / Part 2 关系→动作决策树 /
      Part 3 视觉工具箱 / Part 4 时长 / Part 5 反 AI 味反模式 /
      Part 6 代码硬规则 / Part 7 完工自检 / Part 8 反馈速查
  • $SKILL_DIR/themes/$THEME/theme.json
      看 descriptionZh / mood / bestFor —— 参考主题气质
      （动画 / 时长 / 字号 / emoji 由 chapter agent 在每章自由决定）

卡壳时可翻：

  • $SKILL_DIR/references/EXAMPLES/
      完整章节 anchor（钩子型 / 列举型）—— 看"形"，不要照搬

要换一个主题，覆盖 tokens.css 即可：
  cp $SKILL_DIR/themes/<id>/tokens.css src/styles/tokens.css

想自创主题，看 $SKILL_DIR/references/THEMES.md。

EOF
