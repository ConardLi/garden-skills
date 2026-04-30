export interface CategoryMeta {
  key: string;
  label: string;
  cn: string;
  accent: string;
  templates: string[];
  total: number;
  ready: number;
}

export interface TemplateMeta {
  key: string;
  category: string;
  name: string;
  label: string;
  md_path: string;
  description: string | null;
  content: string | null;
  cases_count: number;
}

export interface PromptCase {
  id: string;
  category: string;
  category_label: string;
  category_accent: string;
  template_key: string;
  template_label: string;
  idx: number;
  title: string;
  brief: string;
  format: 'json' | 'txt';
  prompt_path: string;
  prompt_url: string;
  prompt_content: string | null;
  /** Full-resolution original PNG. Only loaded when a case detail opens. */
  image_url: string | null;
  /** Compressed 800px WebP thumbnail used in galleries / hero / strips. */
  thumb_url: string | null;
  has_image: boolean;
}

export interface CasesManifest {
  generated_at: string;
  summary: { templates: number; cases: number };
  categories: Record<string, CategoryMeta>;
  templates: Record<string, TemplateMeta>;
  cases: PromptCase[];
}

export interface DocsManifest {
  skill_md: string | null;
  intro_md: string | null;
  generated_at: string;
}

export type Route =
  | { name: 'home' }
  | { name: 'case'; id: string }
  | { name: 'skills' }
  | { name: 'workbench'; templateId?: string }
  | { name: 'promptStudio' }
  | { name: 'uiuxStudio' };
