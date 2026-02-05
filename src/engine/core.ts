import { NormalizedInputs } from './types';

// ============================================================================
// CONTRIBUTION MARGIN
// ============================================================================

export function calculateCM(inputs: NormalizedInputs): number {
  return inputs.revenue - inputs.variableCost;
}

export function calculateCMPercent(CM: number, revenue: number): number {
  return (CM / revenue) * 100;
}

// ============================================================================
// LTV (Lifetime Value)
// ============================================================================

export function calculateLTV(CM: number, lifetime: number): number {
  return CM * lifetime;
}

// ============================================================================
// PAYBACK
// ============================================================================

export function calculatePayback(cac: number, CM: number): number {
  return cac / CM;
}

// ============================================================================
// BREAK-EVEN
// ============================================================================

export function calculateBreakEven(
  fixedCosts: number,
  CM: number
): number {
  return Math.ceil(fixedCosts / CM);
}

// ============================================================================
// LTV/CAC RATIO
// ============================================================================

export function calculateLTVCACRatio(ltv: number, cac: number): number {
  return ltv / cac;
}