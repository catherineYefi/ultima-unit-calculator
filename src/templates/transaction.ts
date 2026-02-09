import { z } from 'zod';
import type { Template, Field } from './types';
import type { NormalizedInputs, CalculationError } from '../engine/types';

interface TransactionRawInputs {
  avg_check: number;
  variable_cost: number;
  cac: number;
  repeat_frequency: number;
  fot_monthly?: number;
  current_clients?: number;
}

const transactionSchema = z.object({
  avg_check: z.number().positive('Средний чек должен быть больше 0'),
  variable_cost: z.number().min(0, 'Переменные затраты не могут быть отрицательными'),
  cac: z.number().positive('CAC должен быть больше 0'),
  repeat_frequency: z.number().positive('Укажите частоту покупок в год'),
  fot_monthly: z.number().min(0).optional(),
  current_clients: z.number().int().min(0).optional(),
});

const fields: Field[] = [
  {
    id: 'avg_check',
    label: 'Средний чек',
    type: 'number',
    unit: '₽',
    required: true,
    tooltip: 'Средняя сумма покупки',
  },
  {
    id: 'variable_cost',
    label: 'Переменные затраты на 1 покупку',
    type: 'number',
    unit: '₽',
    required: true,
    tooltip: 'Себестоимость товара + логистика + упаковка',
  },
  {
    id: 'cac',
    label: 'CAC (стоимость привлечения)',
    type: 'number',
    unit: '₽',
    required: true,
    tooltip: 'Сколько стоит привлечь 1 покупателя',
  },
  {
    id: 'repeat_frequency',
    label: 'Частота покупок в год',
    type: 'number',
    unit: 'раз/год',
    required: true,
    tooltip: 'Сколько раз в среднем клиент покупает за год (например, 6 = раз в 2 месяца)',
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
    label: 'Текущая база клиентов (опционально)',
    type: 'number',
    unit: 'шт',
    required: false,
    tooltip: 'Сколько активных клиентов покупают сейчас',
  },
];

function normalize(inputs: any): NormalizedInputs | CalculationError {
  // Для транзакционной модели lifetime считаем в годах
  // Если клиент покупает 6 раз в год, то за год он принесет выручку
  const lifetimeMonths = 12;
  
  return {
    templateId: 'transaction',
    unitType: 'transaction',
    revenue: inputs.avg_check,
    variableCost: inputs.variable_cost,
    cac: inputs.cac,
    lifetime: lifetimeMonths,
    repeatFrequency: inputs.repeat_frequency,
    fixedCostsMonthly: inputs.fot_monthly,
    currentVolume: inputs.current_clients,
  };
}

export const transactionTemplate: Template = {
  id: 'transaction',
  name: 'Transaction / Разовые продажи',
  description: 'Для маркетплейсов, e-commerce, розницы с повторными покупками',
  icon: '💰',
  
  fields,
  validate: (inputs: any) => transactionSchema.safeParse(inputs),
  normalize,
  
  calculations: {
    contributionMargin: true,
    ltv: true,
    payback: true,
    breakEven: true,
  },
};