import type { Template } from '../templates/types';

interface TemplateSelectorProps {
  templates: Template[];
  selected: string;
  onChange: (id: string) => void;
}

export function TemplateSelector({ templates, selected, onChange }: TemplateSelectorProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Выберите тип бизнеса</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${selected === template.id
                ? 'border-primary-600 bg-primary-50 shadow-md'
                : 'border-gray-200 hover:border-primary-300 hover:shadow'
              }
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{template.icon}</span>
              <h3 className="font-semibold text-base">{template.name}</h3>
            </div>
            <p className="text-sm text-gray-600 leading-snug">
              {template.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}