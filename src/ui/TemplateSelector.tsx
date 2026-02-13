import { Calendar, ShoppingCart, Briefcase } from 'lucide-react';
import type { Template } from '../templates/types';

interface TemplateSelectorProps {
  templates: Template[];
  selected: string;
  onChange: (id: string) => void;
}

const iconMap: Record<string, any> = {
  subscription: Calendar,
  transaction: ShoppingCart,
  project: Briefcase,
};

export function TemplateSelector({ templates, selected, onChange }: TemplateSelectorProps) {
  return (
    <div className="card-premium mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Выберите тип бизнеса</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map(template => {
          const Icon = iconMap[template.id] || Calendar;
          const isSelected = selected === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => onChange(template.id)}
              className={`
                group relative overflow-hidden
                p-6 rounded-2xl 
                border-2 transition-all duration-300
                ${isSelected
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 via-white to-primary-50 shadow-xl scale-105'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg hover:scale-102'
                }
              `}
            >
              {/* Gradient overlay on hover */}
              <div className={`
                absolute inset-0 opacity-0 transition-opacity duration-300
                bg-gradient-to-br from-primary-100/20 to-transparent
                ${!isSelected && 'group-hover:opacity-100'}
              `} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className={`
                  inline-flex items-center justify-center
                  w-14 h-14 rounded-xl mb-4
                  transition-all duration-300
                  ${isSelected
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/50'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-primary-100 group-hover:to-primary-200'
                  }
                `}>
                  <Icon 
                    className={`w-7 h-7 transition-colors ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'}`}
                    strokeWidth={2.5}
                  />
                </div>

                {/* Title */}
                <h3 className={`
                  font-semibold text-lg mb-2 transition-colors
                  ${isSelected ? 'text-primary-700' : 'text-gray-900'}
                `}>
                  {template.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {template.description}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}