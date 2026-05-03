import { useEffect, useRef } from "react";
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
 *
 * Width is content-adaptive and capped at `100vw - 32px`; if total chapters
 * (or an active chapter's step pips) overflow, the bar scrolls horizontally
 * instead of squeezing items. The active chapter is auto-scrolled into view
 * on chapter change so it's visible the moment hover reveals the bar.
 */
export function ProgressBar({ chapters, cursor, onJumpChapter }: Props) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [cursor.chapter]);

  return (
    <div className="pb-hover" data-no-advance>
      <div className="pb">
        {chapters.map((c, i) => {
          const isActive = i === cursor.chapter;
          return (
            <button
              key={c.id}
              ref={isActive ? activeRef : undefined}
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
