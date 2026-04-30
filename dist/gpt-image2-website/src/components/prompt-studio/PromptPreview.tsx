import React, { useState } from 'react';
import { PromptTemplate } from '../../types/prompt';

interface PromptPreviewProps {
  template: PromptTemplate;
  renderedPrompt: string;
  sourceTemplate: string;
  onBack: () => void;
  onSave: (format: 'structured' | 'json-flat', tags?: string[]) => void;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({ template, renderedPrompt, sourceTemplate, onBack, onSave }) => {
  const [outputFormat, setOutputFormat] = useState<'structured' | 'json-flat'>('structured');
  const [tags, setTags] = useState<string>("");

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutputFormat(e.target.value as 'structured' | 'json-flat');
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  const handleSave = () => {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onSave(outputFormat, tagArray);
  };

  return (
    <div className="prompt-preview-container">
      <h2>預覽提示詞 for {template.name}</h2>
      <div className="preview-controls">
        <button onClick={onBack} className="secondary-button">返回修改參數</button>
        <select value={outputFormat} onChange={handleFormatChange}>
          <option value="structured">Structured Natural Language</option>
          <option value="json-flat">JSON (Flat)</option>
        </select>
        <input
          type="text"
          placeholder="新增標籤 (逗號分隔)"
          value={tags}
          onChange={handleTagsChange}
          className="tag-input"
        />
        <button onClick={handleSave} className="primary-button">儲存 & 複製</button>
      </div>
      <div className="prompt-content-display">
        <div className="prompt-section">
          <h3>原始模板 MD</h3>
          <pre className="code-block">`{sourceTemplate}`</pre>
        </div>
        <div className="prompt-section">
          <h3>渲染後成品 ({outputFormat})</h3>
          <pre className="code-block">`{renderedPrompt}`</pre>
        </div>
      </div>
      <div className="token-estimate">字數: {renderedPrompt.length} / Token 估算: (待實作)</div>
    </div>
  );
};
