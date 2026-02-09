import { z } from 'zod';
import type { Template, Field } from './types';
import type { SubscriptionNormalizedInputs, CalculationError } from '../engine/types';

interface SubscriptionRawInputs {
  arpu: number;
  variable_cost: number;
  cac: number;
  avg_lifetime_months?: number;
  churn_rate?: number;
  fot_monthly?: number;
  current_clients?: number;
}

const subscriptionSchema = z
  .object({
    arpu: z.number().positive('ARPU должен быть больше 0'),
    variable_cost: z.number().min(0, 'Переменные затраты не могут быть отрицательными'),
    cac: z.number().positive('CAC должен быть больше 0'),
    avg_lifetime_months: z.number().positive().optional(),
    churn_rate: z.number().min(0).max(100).optional(),
    fot_monthly: z.number().min(0).optional(),
    current_clients: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => data.avg_lifetime_months || data.churn_rate != null,
    {
      message: 'Укажите либо средний срок жизни, либо Churn rate',
      path: ['avg_lifetime_months'],
    }
  );

const fields: Field[] = [
  {
    id: 'arpu',
    label: 'Средний чек (ARPU)',
    type: 'number',
    unit: '₽',
    required: true,
    tooltip: 'Цена абонемента или подписки в месяц',
  },
  {
    id: 'variable_cost',
    label: 'Переменные затраты на клиента',
    type: 'number',
    unit: '₽',
    required: true,
    tooltip: 'Себестоимость на 1 клиента в месяц',
  },
  {
    id: 'cac',
    label: 'CAC (стоимость привлечения)',
    type: 'number',
    unit: '₽',
    required: true,
    tooltip: 'Сколько стоит привлечь 1 клиента',
  },
  {
    id: 'avg_lifetime_months',
    label: 'Средний срок жизни клиента',
    type: 'number',
    unit: 'мес',
    required: false,
    tooltip: 'Сколько месяцев в среднем остается клиент',
  },
  {
    id: 'churn_rate',
    label: 'Churn rate',
    type: 'percentage',
    unit: '%',
    required: false,
    tooltip: '% клиентов, которые уходят каждый месяц',
    max: 100,
  },
  {
    id: 'fot_monthly',
    label: 'ФОТ в месяц (опционально)',
    type: 'number',
    unit: '₽',
    required: false,
    tooltip: 'Зарплаты команды для расчета break-even',
  },
  {
    id: 'current_clients',
    label: 'Текущее количество клиентов (опционально)',
    type: 'number',
    unit: 'шт',
    required: false,
    tooltip: 'Текущая база клиентов',
  },
];

function normalize(inputs: any): SubscriptionNormalizedInputs | CalculationError {
  let lifetime: number;
  let originalLifetime: number | undefined;
  
  if (inputs.avg_lifetime_months) {
    lifetime = inputs.avg_lifetime_months;
    originalLifetime = inputs.avg_lifetime_months;
  } else if (inputs.churn_rate != null && inputs.churn_rate > 0) {
    lifetime = 1 / (inputs.churn_rate / 100);
  } else if (inputs.churn_rate === 0) {
    lifetime = 60;
  } else {
    return {
      error: true,
      message: 'Укажите либо средний срок жизни, либо Churn rate',
    };
  }
  
  return {
    templateId: 'subscription',
    unitType: 'subscription',
    revenue: inputs.arpu,
    variableCost: inputs.variable_cost,
    cac: inputs.cac,
    lifetime,
    originalLifetime,
    churnRate: inputs.churn_rate,
    fixedCostsMonthly: inputs.fot_monthly,
    currentVolume: inputs.current_clients,
  };
}

export const subscriptionTemplate: Template = {
  id: 'subscription',
  name: 'Subscription / Абонементы',
  description: 'Для фитнеса, онлайн-школ, SaaS, клубов',
  icon: '📅',
  
  fields,
  
  validate: (inputs: any) => subscriptionSchema.safeParse(inputs),
  
  normalize,
  
  calculations: {
    contributionMargin: true,
    ltv: true,
    payback: true,
    breakEven: true,
  },
};