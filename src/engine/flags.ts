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

const universalFlags: FlagRule[] = [
  {
    id: "ltv_cac_critical",
    check: (_, metrics) => Boolean(metrics.ltvCacRatio && metrics.ltvCacRatio.value < 2),
    severity: "critical",
    message: "LTV/CAC критически низкий (<2)",
    recommendation: "Увеличить lifetime или снизить CAC на 30-40%"
  },
  {
    id: "ltv_cac_low",
    check: (_, metrics) => Boolean(metrics.ltvCacRatio && metrics.ltvCacRatio.value >= 2 && metrics.ltvCacRatio.value < 3),
    severity: "warning",
    message: "LTV/CAC ниже нормы (норма >3)",
    recommendation: "Улучшить retention: реактивация, программа лояльности"
  },
  {
    id: "low_margin",
    check: (_, metrics) => metrics.contributionMargin.percent < 40,
    severity: "warning",
    message: "Низкая маржа (<40%)",
    recommendation: "Увеличить цену или снизить себестоимость"
  },
];

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
];

const templateFlags: Record<string, FlagRule[]> = {
  subscription: subscriptionFlags,
  projects: projectsFlags,
};

export function generateFlags(inputs: NormalizedInputs, metrics: Metrics): Flag[] {
  const flags: Flag[] = [];
  
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