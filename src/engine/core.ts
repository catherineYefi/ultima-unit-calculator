import type { NormalizedInputs, CalculationError } from './types';

export function guardNegativeCM(CM: number): CalculationError | null {
  if (CM <= 0) {
    return {
      error: true,
      message: "Маржа отрицательная или нулевая. Увеличьте цену или снизьте себестоимость."
    };
  }
  return null;
}

export function guardMissingLifetime(lifetime: number | undefined): CalculationError | null {
  if (!lifetime) {
    return {
      error: true,
      message: "Укажите либо средний срок жизни клиента, либо Churn rate"
    };
  }
  return null;
}

export function guardInvalidCAC(cac: number): CalculationError | null {
  if (cac <= 0) {
    return {
      error: true,
      message: "CAC должен быть больше 0"
    };
  }
  return null;
}

export function runGuards(inputs: NormalizedInputs): CalculationError | null {
  const cacCheck = guardInvalidCAC(inputs.cac);
  if (cacCheck) return cacCheck;
  
  const CM = inputs.revenue - inputs.variableCost;
  const cmCheck = guardNegativeCM(CM);
  if (cmCheck) return cmCheck;
  
  return null;
}