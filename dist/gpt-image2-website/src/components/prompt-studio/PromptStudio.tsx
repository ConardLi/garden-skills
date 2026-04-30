import React, { useState } from 'react';
import { TemplatePicker } from './TemplatePicker';
import { ArgumentForm } from './ArgumentForm';
import { PromptPreview } from './PromptPreview';
import { ArchiveBrowser } from './ArchiveBrowser';
import { PromptTemplate, ArgumentValue } from '../../types/prompt';
import { parseTemplate, renderPrompt } from '../../lib/prompt-engine';
import { loadTemplateMarkdown, savePrompt } from '../../lib/archive-client';

import './prompt-studio.css';

type StudioStage = 'category-select' | 'template-select' | 'argument-form' | 'preview';

export const PromptStudio: React.FC = () => {
  const [stage, setStage] = useState<StudioStage>('category-select');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateMarkdown, setTemplateMarkdown] = useState<string>('');
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [args, setArgs] = useState<Record<string, ArgumentValue>>({});
  const [renderedPrompt, setRenderedPrompt] = useState<string>('');
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStage('template-select');
  };

  const handleTemplateSelect = async (template: PromptTemplate) => {
    setSelectedTemplate(template);
    if (template.category && template.id) {
      const { md, placeholders: extractedPlaceholders } = await loadTemplateMarkdown(template.category, template.id);
      setTemplateMarkdown(md);
      setPlaceholders(extractedPlaceholders);
      setArgs({}); // Reset args for new template
      setStage('argument-form');
    }
  };

  const handleArgsChange = (newArgs: Record<string, ArgumentValue>) => {
    setArgs(newArgs);
    setRenderedPrompt(renderPrompt(templateMarkdown, newArgs));
  };

  const handleSavePrompt = async (format: 'structured' | 'json-flat', tags?: string[]) => {
    if (selectedCategory && selectedTemplate && renderedPrompt) {
      const response = await savePrompt({
        category: selectedCategory,
        template: selectedTemplate.id,
        args,
        prompt: renderedPrompt,
        format,
        tags,
      });
      if (response.ok) {
        alert('Prompt saved successfully!');
      } else {
        alert(`Failed to save prompt: ${response.error}`);
      }
    }
  };

  return (
    <div className="prompt-studio-container">
      <h1>Prompt Studio <span className="badge">PROMPT ONLY · 不會自動執行</span></h1>
      <button className="archive-toggle-button" onClick={() => setIsArchiveOpen(!isArchiveOpen)}>
        {isArchiveOpen ? '關閉歸檔' : '開啟歸檔'}
      </button>

      {stage === 'category-select' && (
        <TemplatePicker
          onSelectCategory={handleCategorySelect}
          onSelectTemplate={handleTemplateSelect}
          filterCategory={null}
        />
      )}

      {stage === 'template-select' && selectedCategory && (
        <TemplatePicker
          onSelectCategory={handleCategorySelect} // Allow changing category
          onSelectTemplate={handleTemplateSelect}
          filterCategory={selectedCategory}
        />
      )}

      {stage === 'argument-form' && selectedTemplate && (
        <ArgumentForm
          template={selectedTemplate}
          placeholders={placeholders}
          args={args}
          onArgsChange={handleArgsChange}
          onNext={() => setStage('preview')}
        />
      )}

      {stage === 'preview' && selectedTemplate && (
        <PromptPreview
          template={selectedTemplate}
          renderedPrompt={renderedPrompt}
          sourceTemplate={templateMarkdown}
          onBack={() => setStage('argument-form')}
          onSave={handleSavePrompt}
        />
      )}

      <ArchiveBrowser isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
    </div>
  );
};
