import type { 
  Flag, 
  NormalizedInputs, 
  Metrics, 
  SubscriptionNormalizedInputs 
} from './types';

interface FlagRule {
  id: string;
  check: (inputs: NormalizedInputs, metrics: Metrics) => boolean;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

// ============================================================================
// УНИВЕРСАЛЬНЫЕ ФЛАГИ (для всех моделей)
// ============================================================================

const universalFlags: FlagRule[] = [
  // 🔥 CRITICAL: Модель УБЫТОЧНА - никогда не окупится
  {
    id: "ltv_less_than_cac",
    check: (_, metrics) => Boolean(metrics.ltvCacRatio && metrics.ltvCacRatio.value < 1),
    severity: "critical",
    message: "🚨 УБЫТОЧНАЯ МОДЕЛЬ! LTV < CAC — вы теряете деньги на каждом клиенте",
    recommendation: "Срочно: увеличить lifetime в 2+ раза или снизить CAC на 50%+, или повысить цену"
  },
  
  // 🔥 CRITICAL: Модель окупается слишком долго
  {
    id: "ltv_cac_critical",
    check: (_, metrics) => Boolean(metrics.ltvCacRatio && metrics.ltvCacRatio.value >= 1 && metrics.ltvCacRatio.value < 2),
    severity: "critical",
    message: "LTV/CAC критически низкий (1-2x). Модель окупается, но очень плохо",
    recommendation: "Увеличить lifetime или снизить CAC на 30-50%"
  },
  
  // ⚠️ WARNING: Ниже нормы
  {
    id: "ltv_cac_low",
    check: (_, metrics) => Boolean(metrics.ltvCacRatio && metrics.ltvCacRatio.value >= 2 && metrics.ltvCacRatio.value < 3),
    severity: "warning",
    message: "LTV/CAC ниже нормы (норма >3x)",
    recommendation: "Улучшить retention: реактивация, программа лояльности"
  },
  
  // ⚠️ WARNING: Маржа низкая
  {
    id: "low_margin",
    check: (_, metrics) => metrics.contributionMargin.percent > 0 && metrics.contributionMargin.percent < 40,
    severity: "warning",
    message: "Низкая маржа (<40%)",
    recommendation: "Увеличить цену или снизить себестоимость"
  },
  
  // 🔥 CRITICAL: Маржа очень низкая
  {
    id: "very_low_margin",
    check: (_, metrics) => metrics.contributionMargin.percent > 0 && metrics.contributionMargin.percent < 20,
    severity: "critical",
    message: "Критически низкая маржа (<20%)",
    recommendation: "Срочно пересмотреть ценообразование или себестоимость"
  },
];

// ============================================================================
// ФЛАГИ ДЛЯ SUBSCRIPTION
// ============================================================================

const subscriptionFlags: FlagRule[] = [
  {
    id: "churn_critical",
    check: (inputs) => {
      const sub = inputs as SubscriptionNormalizedInputs;
      return sub.churnRate != null && sub.churnRate > 10;
    },
    severity: "critical",
    message: "Критический Churn (>10%)",
    recommendation: "Exit-интервью + реактивационная воронка"
  },
  {
    id: "churn_high",
    check: (inputs) => {
      const sub = inputs as SubscriptionNormalizedInputs;
      return sub.churnRate != null && sub.churnRate > 5 && sub.churnRate <= 10;
    },
    severity: "warning",
    message: "Churn выше нормы (норма 2-5%)",
    recommendation: "Улучшить онбординг первых 30 дней"
  },
  {
    id: "payback_long",
    check: (_, metrics) => (metrics.payback.months || 0) > 12,
    severity: "warning",
    message: "Долгий срок окупаемости (>12 мес)",
    recommendation: "Снизить CAC или повысить ARPU"
  },
];

// ============================================================================
// ФЛАГИ ДЛЯ TRANSACTION (ДОБАВЛЕНО!)
// ============================================================================

const transactionFlags: FlagRule[] = [
  {
    id: "low_repeat_frequency",
    check: (inputs) => (inputs.repeatFrequency || 0) < 3,
    severity: "warning",
    message: "Низкая частота повторных покупок (<3 раз/год)",
    recommendation: "Улучшить программу лояльности и email-маркетинг"
  },
  {
    id: "very_low_repeat_frequency",
    check: (inputs) => (inputs.repeatFrequency || 0) < 1,
    severity: "critical",
    message: "Критически низкая частота покупок (<1 раз/год)",
    recommendation: "Пересмотреть бизнес-модель: как увеличить повторные покупки?"
  },
  {
    id: "high_cac_for_transaction",
    check: (inputs, metrics) => {
      const avgOrderValue = inputs.revenue;
      const cac = inputs.cac;
      // CAC больше 50% от чека - очень плохо
      return cac > avgOrderValue * 0.5;
    },
    severity: "warning",
    message: "CAC слишком высокий относительно чека (>50% от чека)",
    recommendation: "Оптимизировать каналы привлечения или повысить средний чек"
  },
];

// ============================================================================
// ФЛАГИ ДЛЯ PROJECTS
// ============================================================================

const projectsFlags: FlagRule[] = [
  {
    id: "capacity_low",
    check: (_, metrics) => {
      return Boolean(metrics.breakEven && metrics.breakEven.gap && metrics.breakEven.gap > 0);
    },
    severity: "critical",
    message: "Capacity не покрывает ФОТ",
    recommendation: "Увеличить параллельность или цену проектов"
  },
  {
    id: "low_project_margin",
    check: (_, metrics) => metrics.contributionMargin.percent < 50,
    severity: "warning",
    message: "Низкая маржа проекта (<50%)",
    recommendation: "Снизить переменные затраты или повысить чек"
  },
  {
    id: "very_low_project_margin",
    check: (_, metrics) => metrics.contributionMargin.percent < 30,
    severity: "critical",
    message: "Критически низкая маржа проекта (<30%)",
    recommendation: "Срочно пересмотреть pricing или субподряд"
  },
];

// ============================================================================
// РЕЕСТР ФЛАГОВ ПО ШАБЛОНАМ
// ============================================================================

const templateFlags: Record<string, FlagRule[]> = {
  subscription: subscriptionFlags,
  transaction: transactionFlags,  // ✅ ИСПРАВЛЕНО! Добавлен transaction
  project: projectsFlags,
};

// ============================================================================
// ГЕНЕРАЦИЯ ФЛАГОВ
// ============================================================================

export function generateFlags(inputs: NormalizedInputs, metrics: Metrics): Flag[] {
  const flags: Flag[] = [];
  
  // Проверяем универсальные флаги (для всех моделей)
  for (const rule of universalFlags) {
    if (rule.check(inputs, metrics)) {
      flags.push({
        id: rule.id,
        severity: rule.severity,
        message: rule.message,
        recommendation: rule.recommendation
      });
    }
  }
  
  // Проверяем специфичные для шаблона
  const specificFlags = templateFlags[inputs.templateId] || [];
  for (const rule of specificFlags) {
    if (rule.check(inputs, metrics)) {
      flags.push({
        id: rule.id,
        severity: rule.severity,
        message: rule.message,
        recommendation: rule.recommendation
      });
    }
  }
  
  return flags;
}