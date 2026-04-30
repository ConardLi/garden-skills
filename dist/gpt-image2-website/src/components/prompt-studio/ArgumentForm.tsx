import React, { useState, useEffect } from 'react';
import { PromptTemplate, ArgumentValue } from '../../types/prompt';

interface ArgumentFormProps {
  template: PromptTemplate;
  placeholders: string[];
  args: Record<string, ArgumentValue>;
  onArgsChange: (newArgs: Record<string, ArgumentValue>) => void;
  onNext: () => void;
}

export const ArgumentForm: React.FC<ArgumentFormProps> = ({ template, placeholders, args, onArgsChange, onNext }) => {
  const [currentArgs, setCurrentArgs] = useState<Record<string, ArgumentValue>>(args);

  useEffect(() => {
    // Initialize args if they are empty or template changes
    if (Object.keys(currentArgs).length === 0 || template.id !== args.__templateId) {
      const initialArgs: Record<string, ArgumentValue> = { __templateId: template.id };
      placeholders.forEach(ph => {
        // Attempt to extract default values from placeholder syntax like {key:default_value}
        const match = template.description.match(new RegExp(`{\\s*${ph}\\s*:\\s*([^}]+)}`));
        initialArgs[ph] = match ? match[1].trim() : ""; // Default to empty string if no default provided
      });
      setCurrentArgs(initialArgs);
      onArgsChange(initialArgs);
    }
  }, [template, placeholders, onArgsChange, args]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newArgs = { ...currentArgs, [name]: value };
    setCurrentArgs(newArgs);
    onArgsChange(newArgs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="argument-form" onSubmit={handleSubmit}>
      <h2>填寫參數 for {template.name}</h2>
      {placeholders.map(placeholder => (
        <div className="form-group" key={placeholder}>
          <label htmlFor={placeholder}>{placeholder}</label>
          {/* Basic input for now, can be extended with type detection later */}
          <textarea
            id={placeholder}
            name={placeholder}
            value={currentArgs[placeholder] as string || ""}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
      ))}
      <button type="submit" className="primary-button">預覽提示詞</button>
    </form>
  );
};
