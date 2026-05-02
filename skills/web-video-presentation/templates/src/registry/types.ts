import type { ComponentType } from "react";

export interface ChapterStepProps {
  step: number; // 0..(totalSteps - 1)
}

export interface ChapterDef {
  id: string;
  title: string;
  totalSteps: number;
  Component: ComponentType<ChapterStepProps>;
}
