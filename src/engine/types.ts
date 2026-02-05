import type { z } from 'zod';
import type { 
  TemplateId, 
  RawInputs, 
  NormalizedInputs, 
  CalculationError 
} from '../engine/types';

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
  
  validate: (inputs: T) => z.SafeParseReturnType<T, T>;
  
  normalize: (inputs: T) => NormalizedInputs | CalculationError;
  
  calculations: TemplateCalculationConfig;
  
  customMetrics?: (normalized: NormalizedInputs) => Record<string, any>;
}

export type TemplateRegistry = {
  [K in TemplateId]?: Template;
};