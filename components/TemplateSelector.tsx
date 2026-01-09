
import React from 'react';
import { type Template } from '../types';

interface TemplateSelectorProps {
  selectedTemplate: Template;
  onTemplateChange: (template: Template) => void;
}

const templates: { value: Template; label: string }[] = [
  { value: 'modern-tech', label: 'Modern Tech' },
  { value: 'junior', label: 'Junior' },
  { value: 'creative', label: 'Mid-Level' },
  { value: 'classic', label: 'Classic' },
  { value: 'custom', label: 'Custom' },
  { value: 'faang', label: 'FAANG' },
  { value: 'consultant', label: 'Consultant' },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onTemplateChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onTemplateChange(event.target.value as Template);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="template-select" className="text-sm font-medium text-muted-foreground hidden sm:block">Template:</label>
      <select
        id="template-select"
        value={selectedTemplate}
        onChange={handleChange}
        className="bg-card text-foreground border border-input rounded-md py-1.5 pl-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
      >
        {templates.map((template) => (
          <option key={template.value} value={template.value}>
            {template.label}
          </option>
        ))}
      </select>
    </div>
  );
};
