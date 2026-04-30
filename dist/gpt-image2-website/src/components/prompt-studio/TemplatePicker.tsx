import React from 'react';
import { categories } from '../../data/cases.json';
import { PromptTemplate } from '../../types/prompt';

interface TemplatePickerProps {
  onSelectCategory: (category: string) => void;
  onSelectTemplate: (template: PromptTemplate) => void;
  filterCategory: string | null;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ onSelectCategory, onSelectTemplate, filterCategory }) => {
  const allCategories = categories as unknown as Record<string, { id: string; name: string; description: string; accent: string; templates: PromptTemplate[] }>;

  const displayedCategories = filterCategory
    ? { [filterCategory]: allCategories[filterCategory] }
    : allCategories;

  return (
    <div className="template-picker">
      {!filterCategory ? (
        <div className="category-grid">
          {Object.values(displayedCategories).map(category => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => onSelectCategory(category.id)}
              style={{ borderColor: category.accent }}
            >
              <h2>{category.name}</h2>
              <p>{category.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="template-list">
          <h2 className="template-list-title">選擇 {allCategories[filterCategory]?.name} 模板</h2>
          {allCategories[filterCategory]?.templates.map(template => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => onSelectTemplate(template)}
            >
              <img src={template.image} alt={template.name} className="template-thumbnail" />
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              {template.ready && <span className="badge ready">Ready</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
