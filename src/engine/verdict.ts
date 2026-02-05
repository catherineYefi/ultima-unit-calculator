import { Verdict, Metrics, Flag } from './types';

// ============================================================================
// VERDICT RULES
// ============================================================================

export function generateVerdict(metrics: Metrics, flags: Flag[]): Verdict {
  const criticalFlags = flags.filter(f => f.severity === 'critical');
  const warningFlags = flags.filter(f => f.severity === 'warning');
  
  // Если есть critical флаги
  if (criticalFlags.length > 0) {
    return {
      status: 'critical',
      message: 'Модель требует срочных улучшений'
    };
  }
  
  // Если есть warning флаги
  if (warningFlags.length > 0) {
    return {
      status: 'warning',
      message: 'Модель работает, но есть зоны для улучшения'
    };
  }
  
  // Проверяем основные метрики
  const hasGoodLTVCAC = metrics.ltvCacRatio && metrics.ltvCacRatio.value > 3;
  const hasGoodPayback = metrics.payback.months 
    ? metrics.payback.months < 12 
    : metrics.payback.value < 2;
  const hasGoodMargin = metrics.contributionMargin.percent > 50;
  
  if (hasGoodLTVCAC && hasGoodPayback && hasGoodMargin) {
    return {
      status: 'healthy',
      message: 'Модель здоровая: хорошая маржа, LTV/CAC и payback'
    };
  }
  
  // Дефолт
  return {
    status: 'warning',
    message: 'Модель работает, рекомендуем отслеживать ключевые метрики'
  };
}