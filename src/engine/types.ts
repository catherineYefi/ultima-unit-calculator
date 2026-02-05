// ============================================================================
// BASE TYPES
// ============================================================================

export type TemplateId = 
  | 'subscription' 
  | 'one_time_sales' 
  | 'projects' 
  | 'commission'
  | 'custom';

export type UnitType = 
  | 'subscription'  // месяцы
  | 'transaction'   // покупки
  | 'project'       // проекты
  | 'deal';         // сделки

export type Severity = 'info' | 'warning' | 'critical';
export type VerdictStatus = 'healthy' | 'warning' | 'critical';

// ============================================================================
// INPUTS
// ============================================================================

export type RawInputs = Record<string, number | string | undefined>;

export interface BaseNormalizedInputs {
  revenue: number;
  variableCost: number;
  cac: number;
  
  lifetime?: number;
  repeatFrequency?: number;
  
  parallelUnits?: number;
  durationDays?: number;
  
  fixedCostsMonthly?: number;
  currentVolume?: number;
  
  templateId: TemplateId;
  unitType: UnitType;
}

export interface SubscriptionNormalizedInputs extends BaseNormalizedInputs {
  templateId: 'subscription';
  unitType: 'subscription';
  churnRate?: number;
  originalLifetime?: number;
}

export interface OneTimeNormalizedInputs extends BaseNormalizedInputs {
  templateId: 'one_time_sales';
  unitType: 'transaction';
}

export interface ProjectsNormalizedInputs extends BaseNormalizedInputs {
  templateId: 'projects';
  unitType: 'project';
}

export interface CommissionNormalizedInputs extends BaseNormalizedInputs {
  templateId: 'commission';
  unitType: 'deal';
  commissionPercent: number;
  avgDealSize: number;
}

export type NormalizedInputs = 
  | SubscriptionNormalizedInputs
  | OneTimeNormalizedInputs
  | ProjectsNormalizedInputs
  | CommissionNormalizedInputs;

// ============================================================================
// OUTPUTS
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

export interface LTVCACMetric {
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
  ltvCacRatio?: LTVCACMetric;
  payback: PaybackMetric;
  breakEven?: BreakEvenMetric;
  
  [key: string]: any;
}

export interface Flag {
  severity: Severity;
  message: string;
  recommendation: string;
}

export interface Verdict {
  status: VerdictStatus;
  message: string;
}

export interface CalculationResult {
  metrics: Metrics;
  flags: Flag[];
  verdict: Verdict;
}

export interface CalculationError {
  error: true;
  message: string;
  field?: string;
}

// ============================================================================
// SCENARIO
// ============================================================================

export interface ScenarioOverride {
  field: string;
  value: number;
  operator: 'set' | 'multiply' | 'add';
}

export interface Scenario {
  id: string;
  name: string;
  overrides: ScenarioOverride[];
}