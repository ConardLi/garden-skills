import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChapterDef } from "../registry/types";

/**
 * Bump this when chapter step counts / structure change so old persisted
 * cursors don't land mid-removed-step.
 */
const STORAGE_KEY = "presentation-cursor-v3";

export type Cursor = { chapter: number; step: number };

export interface StepperState {
  cursor: Cursor;
  totalChapters: number;
  chapterTotalSteps: number;
  globalIndex: number;
  totalGlobal: number;
  next(): void;
  prev(): void;
  jumpToChapter(idx: number, step?: number): void;
  jumpToGlobal(globalIdx: number): void;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

export function useStepper(chapters: ChapterDef[]): StepperState {
  const [cursor, setCursor] = useState<Cursor>(() => {
    if (typeof window === "undefined") return { chapter: 0, step: 0 };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return { chapter: 0, step: 0 };
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cursor));
    } catch {
      /* ignore */
    }
  }, [cursor]);

  const offsets = useMemo(() => {
    const arr: number[] = [];
    let acc = 0;
    for (const c of chapters) {
      arr.push(acc);
      acc += c.totalSteps;
    }
    return arr;
  }, [chapters]);
  const totalGlobal = useMemo(
    () => chapters.reduce((s, c) => s + c.totalSteps, 0),
    [chapters],
  );
  const globalIndex = (offsets[cursor.chapter] ?? 0) + cursor.step;

  const next = useCallback(() => {
    setCursor((cur) => {
      const c = chapters[cur.chapter]!;
      if (cur.step < c.totalSteps - 1) return { ...cur, step: cur.step + 1 };
      if (cur.chapter < chapters.length - 1)
        return { chapter: cur.chapter + 1, step: 0 };
      return cur;
    });
  }, [chapters]);

  const prev = useCallback(() => {
    setCursor((cur) => {
      if (cur.step > 0) return { ...cur, step: cur.step - 1 };
      if (cur.chapter > 0) {
        const p = chapters[cur.chapter - 1]!;
        return { chapter: cur.chapter - 1, step: p.totalSteps - 1 };
      }
      return cur;
    });
  }, [chapters]);

  const jumpToChapter = useCallback(
    (idx: number, step = 0) => {
      const ch = clamp(idx, 0, chapters.length - 1);
      const c = chapters[ch]!;
      setCursor({ chapter: ch, step: clamp(step, 0, c.totalSteps - 1) });
    },
    [chapters],
  );

  const jumpToGlobal = useCallback(
    (g: number) => {
      const target = clamp(g, 0, totalGlobal - 1);
      let acc = 0;
      for (let i = 0; i < chapters.length; i++) {
        const t = chapters[i]!.totalSteps;
        if (target < acc + t) {
          setCursor({ chapter: i, step: target - acc });
          return;
        }
        acc += t;
      }
    },
    [chapters, totalGlobal],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        jumpToChapter(0, 0);
      } else if (e.key === "End") {
        const last = chapters.length - 1;
        jumpToChapter(last, chapters[last]!.totalSteps - 1);
      } else if (e.key >= "1" && e.key <= "9") {
        const n = Number(e.key) - 1;
        if (n < chapters.length) jumpToChapter(n, 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, jumpToChapter, chapters]);

  const ch = chapters[cursor.chapter]!;
  return {
    cursor,
    totalChapters: chapters.length,
    chapterTotalSteps: ch.totalSteps,
    globalIndex,
    totalGlobal,
    next,
    prev,
    jumpToChapter,
    jumpToGlobal,
  };
}
