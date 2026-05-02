import type { ChapterDef } from "../registry/types";
import "./ProgressBar.css";

interface Props {
  chapters: ChapterDef[];
  cursor: { chapter: number; step: number };
  onJumpChapter(idx: number, step?: number): void;
}

/**
 * Hidden-on-hover progress bar, fixed to the bottom of the viewport.
 * Click chapter pill or pip to jump.
 */
export function ProgressBar({ chapters, cursor, onJumpChapter }: Props) {
  return (
    <div className="pb-hover" data-no-advance>
      <div className="pb">
        {chapters.map((c, i) => {
          const isActive = i === cursor.chapter;
          return (
            <button
              key={c.id}
              className={`pb-chapter ${isActive ? "pb-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onJumpChapter(i, 0);
              }}
            >
              <span className="pb-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="pb-title">{c.title}</span>
              {isActive && (
                <div className="pb-pips">
                  {Array.from({ length: c.totalSteps }, (_, s) => (
                    <span
                      key={s}
                      className={`pb-pip ${
                        s <= cursor.step ? "pb-pip-on" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpChapter(i, s);
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
