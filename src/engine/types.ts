import type { z } from 'zod';

// Helper type for Zod validation result
export type ZodValidationResult<T> = { success: true; data: T } | { success: false; error: z.ZodError<T> };

// ============================================================================
// TEMPLATE IDENTIFIERS AND INPUT TYPES
// ============================================================================

export type TemplateId = 'subscription' | 'transaction' | 'project' | 'deal';

export interface RawInputs {
  [key: string]: any;
}

export interface NormalizedInputs {
  revenue: number;
  variableCost: number;
  cac: number;
  lifetime?: number;
  fixedCostsMonthly?: number;
  currentVolume?: number;
  unitType: TemplateId;
  templateId: TemplateId;
  repeatFrequency?: number;
  durationDays?: number;
}

export interface SubscriptionNormalizedInputs extends NormalizedInputs {
  churnRate?: number;
  originalLifetime?: number;
}

export interface CalculationError {
  error: true;
  message: string;
}

// ============================================================================
// CALCULATION METRICS AND RESULTS
// ============================================================================

export interface ContributionMarginMetric {
  value: number;
  percent: number;
  formatted: string;
}

export interface LTVMetric {
  value: number;
  formula: string;
  formatted: string;
}

export interface LTVCACRatioMetric {
  value: number;
  benchmark: string;
  formatted: string;
}

export interface PaybackMetric {
  value: number;
  months?: number;
  unit: string;
  benchmark: string;
}

export interface BreakEvenMetric {
  unitsNeeded: number;
  currentVolume?: number;
  gap?: number;
  status: string;
}

export interface Metrics {
  contributionMargin: ContributionMarginMetric;
  ltv?: LTVMetric;
  ltvCacRatio?: LTVCACRatioMetric;
  payback: PaybackMetric;
  breakEven?: BreakEvenMetric;
}

export interface Flag {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

export interface Verdict {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
}

export interface CalculationResult {
  metrics: Metrics;
  flags: Flag[];
  verdict: Verdict;
}

// ============================================================================
// FIELD AND TEMPLATE DEFINITION
// ============================================================================

export type FieldType = 'number' | 'percentage' | 'select';

export interface FieldOption {
  value: string;
  label: string;
}

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  unit?: string;
  required: boolean;
  tooltip: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  options?: FieldOption[];
  dependsOn?: string;
}

export interface TemplateCalculationConfig {
  contributionMargin: boolean;
  ltv: boolean;
  payback: boolean;
  breakEven: boolean;
}

export interface Template<T extends RawInputs = RawInputs> {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  
  fields: Field[];
  
  validate: (inputs: T) => ZodValidationResult<T>;
  
  normalize: (inputs: T) => NormalizedInputs | CalculationError;
  
  calculations: TemplateCalculationConfig;
  
  customMetrics?: (normalized: NormalizedInputs) => Record<string, any>;
}

export type TemplateRegistry = {
  [K in TemplateId]?: Template<any>;
};