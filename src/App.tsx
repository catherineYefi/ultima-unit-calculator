import { useState } from 'react';
import { subscriptionTemplate } from './templates';
import { calculate } from './engine';
import { CalculationResult, CalculationError } from './engine/types';

function App() {
  const [inputs, setInputs] = useState<Record<string, number>>({
    arpu: 5000,
    variable_cost: 1500,
    cac: 3000,
    avg_lifetime_months: 12,
  });

  const [result, setResult] = useState<CalculationResult | CalculationError | null>(null);

  const handleInputChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    setInputs(prev => ({
      ...prev,
      [id]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleCalculate = () => {
    // Валидация
    const validation = subscriptionTemplate.validate(inputs);
    
    if (!validation.success) {
      alert('Ошибка валидации: ' + validation.error.errors[0].message);
      return;
    }

    // Нормализация
    const normalized = subscriptionTemplate.normalize(inputs);
    
    if ('error' in normalized) {
      setResult(normalized);
      return;
    }

    // Расчет
    const calcResult = calculate(normalized);
    setResult(calcResult);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Калькулятор Юнит-Экономики ULTIMA
        </h1>

        {/* Template Info */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{subscriptionTemplate.icon}</span>
            <div>
              <h2 className="text-xl font-semibold">{subscriptionTemplate.name}</h2>
              <p className="text-gray-600">{subscriptionTemplate.description}</p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Введите данные</h3>
          
          <div className="space-y-4">
            {subscriptionTemplate.fields.map(field => (
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
                {/* Verdict */}
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

                {/* Metrics */}
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

                {/* Flags */}
                {result.flags.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-3">Рекомендации</h3>
                    <div className="space-y-3">
                      {result.flags.map((flag, idx) => (
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