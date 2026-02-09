import { z } from 'zod';
import type { Template, Field } from './types';
import type { NormalizedInputs, CalculationError } from '../engine/types';

interface ProjectsRawInputs {
  project_revenue: number;
  project_cost: number;
  cac: number;
  project_duration_days: number;
  parallel_projects: number;
  fot_monthly?: number;
  current_projects?: number;
}

const projectsSchema = z.object({
  project_revenue: z.number().positive('Выручка проекта должна быть больше 0'),
  project_cost: z.number().min(0, 'Себестоимость не может быть отрицательной'),
  cac: z.number().positive('CAC должен быть больше 0'),
  project_duration_days: z.number().positive('Длительность должна быть больше 0'),
  parallel_projects: z.number().positive('Укажите количество параллельных проектов'),
  fot_monthly: z.number().min(0).optional(),
  current_projects: z.number().int().min(0).optional(),
});

const fields: Field[] = [
  {
    id: 'project_revenue',
    label: 'Выручка проекта',
    type: 'number',
    unit: '₽',
    required: true,
    tooltip: 'Средняя стоимость одного проекта',
  },
  {
    id: 'project_cost',
    label: 'Себестоимость проекта',
    type: 'number',
    unit: '₽',
    required: true,
    tooltip: 'Переменные затраты на проект (субподряд, материалы, софт)',
  },
  {
    id: 'cac',
    label: 'CAC (стоимость привлечения)',
    type: 'number',
    unit: '₽',
    required: true,
    tooltip: 'Сколько стоит привлечь 1 клиента на проект',
  },
  {
    id: 'project_duration_days',
    label: 'Длительность проекта',
    type: 'number',
    unit: 'дней',
    required: true,
    tooltip: 'Сколько дней в среднем делается проект',
  },
  {
    id: 'parallel_projects',
    label: 'Параллельных проектов',
    type: 'number',
    unit: 'шт',
    required: true,
    tooltip: 'Сколько проектов команда ведет одновременно',
    min: 1,
  },
  {
    id: 'fot_monthly',
    label: 'ФОТ в месяц',
    type: 'number',
    unit: '₽',
    required: false,
    tooltip: 'Зарплаты команды для расчета break-even',
  },
  {
    id: 'current_projects',
    label: 'Текущих проектов в месяц',
    type: 'number',
    unit: 'шт',
    required: false,
    tooltip: 'Сколько проектов делаете сейчас в месяц',
  },
];

function normalize(inputs: ProjectsRawInputs): NormalizedInputs | CalculationError {
  // Capacity в месяц = (30 дней / длительность одного проекта) * количество параллельных
  const projectsPerMonth = (30 / inputs.project_duration_days) * inputs.parallel_projects;
  
  // Для проектной работы lifetime не считаем (нет повторных покупок)
  // Но можем использовать как "capacity за год"
  const lifetimeMonths = undefined;
  
  return {
    templateId: 'project',
    unitType: 'project',
    revenue: inputs.project_revenue,
    variableCost: inputs.project_cost,
    cac: inputs.cac,
    lifetime: lifetimeMonths,
    durationDays: inputs.project_duration_days,
    parallelUnits: inputs.parallel_projects,
    fixedCostsMonthly: inputs.fot_monthly,
    currentVolume: inputs.current_projects,
  };
}

export const projectsTemplate: Template<ProjectsRawInputs> = {
  id: 'project',
  name: 'Projects / Проектная работа',
  description: 'Для агентств, консалтинга, дизайна, разработки',
  icon: '📊',
  
  fields,
  validate: (inputs) => projectsSchema.safeParse(inputs),
  normalize,
  
  calculations: {
    contributionMargin: true,
    ltv: false,  // для проектов LTV не считаем
    payback: true,
    breakEven: true,
  },
};