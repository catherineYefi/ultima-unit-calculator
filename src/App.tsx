import { useState } from 'react';
import { subscriptionTemplate, transactionTemplate, projectsTemplate } from './templates';
import type { Template } from './templates';
import { TemplateSelector } from './ui/TemplateSelector';
import { calculate } from './engine';
import type { CalculationResult, CalculationError } from './engine/types';

// Реестр всех доступных шаблонов
const templates: Template[] = [
  subscriptionTemplate,
  transactionTemplate,
  projectsTemplate,
];

function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('subscription');
  const [inputs, setInputs] = useState<Record<string, any>>({
    arpu: 5000,
    variable_cost: 1500,
    cac: 3000,
    avg_lifetime_months: 12,
  });
  const [result, setResult] = useState<CalculationResult | CalculationError | null>(null);

  const currentTemplate = templates.find(t => t.id === selectedTemplateId)!;

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    // Сбрасываем форму при смене шаблона
    setInputs({});
    setResult(null);
  };

  const handleInputChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    setInputs(prev => ({
      ...prev,
      [id]: isNaN(numValue) ? undefined : numValue
    }));
  };

  const handleCalculate = () => {
    const validation = currentTemplate.validate(inputs as any);
    
    if (!validation.success) {
      alert('Ошибка валидации: ' + validation.error.issues[0].message);
      return;
    }

    const normalized = currentTemplate.normalize(inputs as any);
    
    if ('error' in normalized) {
      setResult(normalized);
      return;
    }

    const calcResult = calculate(normalized);
    setResult(calcResult);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Калькулятор Юнит-Экономики ULTIMA
        </h1>

        {/* Template Selector */}
        <TemplateSelector
          templates={templates}
          selected={selectedTemplateId}
          onChange={handleTemplateChange}
        />

        {/* Input Form */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Введите данные</h3>
          
          <div className="space-y-4">
            {currentTemplate.fields.map(field => (
              <div key={field.id}>
                <label className="label">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="input"
                    value={inputs[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.tooltip}
                    min={field.min}
                    max={field.max}
                  />
                  {field.unit && (
                    <span className="absolute right-3 top-2 text-gray-500">
                      {field.unit}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{field.tooltip}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleCalculate}
            className="btn-primary w-full mt-6"
          >
            Рассчитать
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {'error' in result ? (
              <div className="card bg-red-50 border-red-200">
                <p className="text-red-700 font-medium">❌ {result.message}</p>
              </div>
            ) : (
              <>
                <div className={`card ${
                  result.verdict.status === 'healthy' ? 'bg-green-50 border-green-200' :
                  result.verdict.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-2">
                    {result.verdict.status === 'healthy' ? '✅' :
                     result.verdict.status === 'warning' ? '⚠️' : '❌'}
                    {' '}
                    {result.verdict.message}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card">
                    <h4 className="text-sm text-gray-600 mb-1">Contribution Margin</h4>
                    <p className="text-2xl font-bold">
                      {result.metrics.contributionMargin.formatted}
                    </p>
                  </div>

                  {result.metrics.ltv && (
                    <div className="card">
                      <h4 className="text-sm text-gray-600 mb-1">LTV</h4>
                      <p className="text-2xl font-bold">
                        {result.metrics.ltv.formatted}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.metrics.ltv.formula}
                      </p>
                    </div>
                  )}

                  {result.metrics.ltvCacRatio && (
                    <div className="card">
                      <h4 className="text-sm text-gray-600 mb-1">LTV/CAC Ratio</h4>
                      <p className="text-2xl font-bold">
                        {result.metrics.ltvCacRatio.formatted}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.metrics.ltvCacRatio.benchmark}
                      </p>
                    </div>
                  )}

                  <div className="card">
                    <h4 className="text-sm text-gray-600 mb-1">Payback</h4>
                    <p className="text-2xl font-bold">
                      {result.metrics.payback.unit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {result.metrics.payback.benchmark}
                    </p>
                  </div>

                  {result.metrics.breakEven && (
                    <div className="card md:col-span-2">
                      <h4 className="text-sm text-gray-600 mb-1">Break-even</h4>
                      <p className="text-lg font-semibold">
                        {result.metrics.breakEven.status}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Нужно клиентов: {result.metrics.breakEven.unitsNeeded}
                      </p>
                    </div>
                  )}
                </div>

                {result.flags.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-3">Рекомендации</h3>
                    <div className="space-y-3">
                      {result.flags.map((flag: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            flag.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                            flag.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                            'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <p className="font-medium mb-1">
                            {flag.severity === 'critical' ? '🚨' :
                             flag.severity === 'warning' ? '⚠️' : 'ℹ️'}
                            {' '}
                            {flag.message}
                          </p>
                          <p className="text-sm text-gray-700">
                            💡 {flag.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;