import { useState } from 'react';
import { subscriptionTemplate, transactionTemplate, projectsTemplate } from './templates';
import type { Template } from './templates';
import { TemplateSelector } from './ui/TemplateSelector';
import { calculate } from './engine';
import type { CalculationResult, CalculationError } from './engine/types';
import { TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Калькулятор Юнит-Экономики
            <span className="block text-3xl bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mt-2">
              ULTIMA
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Профессиональный анализ бизнес-модели
          </p>
        </div>

        {/* Template Selector */}
        <TemplateSelector
          templates={templates}
          selected={selectedTemplateId}
          onChange={handleTemplateChange}
        />

        {/* Input Form */}
        <div className="card-premium mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Введите данные</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentTemplate.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <label className="label">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="input-premium"
                    value={inputs[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.tooltip}
                    min={field.min}
                    max={field.max}
                  />
                  {field.unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {field.unit}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{field.tooltip}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleCalculate}
            className="btn-premium w-full mt-8 flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Рассчитать
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {'error' in result ? (
              <div className="card-premium status-critical">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-lg mb-1">Ошибка</p>
                    <p className="text-red-800">{result.message}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Verdict */}
                <div className={`card-premium ${
                  result.verdict.status === 'healthy' ? 'status-healthy' :
                  result.verdict.status === 'warning' ? 'status-warning' :
                  'status-critical'
                }`}>
                  <div className="flex items-center gap-3">
                    {result.verdict.status === 'healthy' ? (
                      <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium opacity-80 mb-1">Вердикт</p>
                      <p className="text-xl font-bold">{result.verdict.message}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="metric-card">
                    <p className="text-sm text-gray-600 font-medium mb-1">Contribution Margin</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {result.metrics.contributionMargin.formatted}
                    </p>
                  </div>

                  {result.metrics.ltv && (
                    <div className="metric-card">
                      <p className="text-sm text-gray-600 font-medium mb-1">LTV</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {result.metrics.ltv.formatted}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {result.metrics.ltv.formula}
                      </p>
                    </div>
                  )}

                  {result.metrics.ltvCacRatio && (
                    <div className="metric-card">
                      <p className="text-sm text-gray-600 font-medium mb-1">LTV/CAC Ratio</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {result.metrics.ltvCacRatio.formatted}
                      </p>
                      <p className={`text-sm font-semibold mt-2 ${
                        result.metrics.ltvCacRatio.benchmark.includes('УБЫТОК') ? 'text-red-600' :
                        result.metrics.ltvCacRatio.benchmark === 'Критично' ? 'text-orange-600' :
                        result.metrics.ltvCacRatio.benchmark === 'Ниже нормы' ? 'text-yellow-600' :
                        result.metrics.ltvCacRatio.benchmark === 'Хорошо' ? 'text-green-600' :
                        'text-emerald-600'
                      }`}>
                        {result.metrics.ltvCacRatio.benchmark}
                      </p>
                    </div>
                  )}

                  <div className="metric-card">
                    <p className="text-sm text-gray-600 font-medium mb-1">Payback</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.metrics.payback.unit}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {result.metrics.payback.benchmark}
                    </p>
                  </div>

                  {result.metrics.breakEven && (
                    <div className="metric-card md:col-span-2">
                      <p className="text-sm text-gray-600 font-medium mb-1">Break-even</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {result.metrics.breakEven.status}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Нужно единиц: {result.metrics.breakEven.unitsNeeded}
                      </p>
                    </div>
                  )}
                </div>

                {/* Flags */}
                {result.flags.length > 0 && (
                  <div className="card-premium">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Рекомендации</h3>
                    <div className="space-y-4">
                      {result.flags.map((flag: any, idx: number) => (
                        <div
                          key={idx}
                          className={`flag-card ${
                            flag.severity === 'critical' ? 'flag-critical' :
                            flag.severity === 'warning' ? 'flag-warning' :
                            'flag-info'
                          }`}
                        >
                          <p className="font-semibold mb-2 flex items-center gap-2">
                            {flag.severity === 'critical' ? '🚨' :
                             flag.severity === 'warning' ? '⚠️' : 'ℹ️'}
                            {flag.message}
                          </p>
                          <p className="text-sm opacity-90 flex items-start gap-2">
                            <span className="text-lg">💡</span>
                            <span>{flag.recommendation}</span>
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