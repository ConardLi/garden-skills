import { useEffect, useRef, useState, useMemo } from 'react';
import { chapters } from '../chapters';
import { useStep } from '../store/useStep';

/**
 * 装载当前章节，并处理章节间的极轻交叉转场。
 * Updated: Added dynamic style injection and transition safety.
 */
export function ChapterHost() {
  const { chapterIndex, localStep, direction } = useStep();
  const [renderedIdx, setRenderedIdx] = useState(chapterIndex);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const pendingRef = useRef<number | null>(null);

  useEffect(() => {
    if (chapterIndex === renderedIdx) return;
    
    pendingRef.current = chapterIndex;
    setPhase('out');

    const timer = setTimeout(() => {
      setRenderedIdx(pendingRef.current!);
      setPhase('in');
    }, 220);

    return () => clearTimeout(timer);
  }, [chapterIndex, renderedIdx]);

  // Memoize active chapter to prevent unnecessary re-computations
  const Active = useMemo(() => chapters[renderedIdx] ?? chapters[chapterIndex], [renderedIdx, chapterIndex]);
  
  // New Feature: Composite styles for chapter-specific branding
  const compositeStyles = {
    position: 'absolute' as const,
    inset: 0,
    background: 'var(--bg)',
    color: 'var(--fg)',
    opacity: phase === 'in' ? 1 : 0,
    transform: `translateY(${phase === 'in' ? '0' : '12px'})`,
    transition: 'opacity 220ms ease, transform 220ms ease, background 480ms ease',
    ...Active.styles // Allows chapters to inject specific CSS variables (e.g., --accent)
  };

  return (
    <div
      className={`chapter-host theme-${Active.theme ?? 'default'}`}
      data-phase={phase}
      data-chapter-id={Active.id}
      style={compositeStyles}
    >
      <Active.Component
        localStep={renderedIdx === chapterIndex ? localStep : (direction === 'prev' ? 0 : Active.steps - 1)}
        steps={Active.steps}
        direction={direction}
      />
    </div>
  );
}
