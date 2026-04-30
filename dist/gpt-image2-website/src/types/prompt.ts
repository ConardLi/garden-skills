export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  ready: boolean;
  image: string;
  placeholders: string[];
}

export type ArgumentValue = string | number | boolean | string[];

export interface ArchiveEntry {
  category: string;
  template: string;
  slug: string;
  timestamp: string;
  format: 'structured' | 'json-flat';
  tags?: string[];
  args: Record<string, ArgumentValue>;
  renderedPrompt: string;
  sourceTemplate: string;
}