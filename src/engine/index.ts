import {
  NormalizedInputs,
  CalculationResult,
  CalculationError,
  Metrics,
  SubscriptionNormalizedInputs,
} from './types';
import {
  calculateCM,
  calculateCMPercent,
  calculateLTV,
  calculatePayback,
  calculateBreakEven,
  calculateLTVCACRatio,
} from './core';
import { runGuards } from './guards';
import { formatMoney, formatPercent, formatRatio, formatPayback } from './format';
import { generateFlags } from './flags';
import { generateVerdict } from './verdict';

// ============================================================================
// MAIN CALCULATOR
// ============================================================================

export function calculate(
  inputs: NormalizedInputs
): CalculationResult | CalculationError {
  // 1. Guards
  const guardError = runGuards(inputs);
  if (guardError) return guardError;

  // 2. Calculate CM
  const CM = calculateCM(inputs);
  const CMPercent = calculateCMPercent(CM, inputs.revenue);

  // 3. Build metrics
  const metrics: Metrics = {
    contributionMargin: {
      value: Math.round(CM),
      percent: parseFloat(CMPercent.toFixed(1)),
      formatted: `${formatMoney(CM)} (${formatPercent(CMPercent)})`,
    },
    payback: {
      value: 0,
      unit: '',
      benchmark: '',
    },
  };

  // 4. LTV (if applicable)
  if (inputs.lifetime) {
    const ltv = calculateLTV(CM, inputs.lifetime);
    const ltvCacRatio = calculateLTVCACRatio(ltv, inputs.cac);

    metrics.ltv = {
      value: Math.round(ltv),
      formula: `${formatMoney(CM)} × ${inputs.lifetime} мес = ${formatMoney(ltv)}`,
      formatted: formatMoney(ltv),
    };

    metrics.ltvCacRatio = {
      value: parseFloat(ltvCacRatio.toFixed(2)),
      benchmark:
        ltvCacRatio > 5
          ? 'Отлично'
          : ltvCacRatio > 3
          ? 'Хорошо'
          : 'Ниже нормы',
      formatted: formatRatio(ltvCacRatio),
    };
  }

  // 5. Payback
  const paybackValue = calculatePayback(inputs.cac, CM);
  
  let paybackMonths: number | undefined;
  let paybackUnit: string;
  
  switch (inputs.unitType) {
    case 'subscription':
      paybackMonths = paybackValue;
      paybackUnit = formatPayback(paybackValue, 'months');
      break;
    case 'transaction':
      paybackMonths = inputs.repeatFrequency 
        ? paybackValue / (inputs.repeatFrequency / 12)
        : undefined;
      paybackUnit = paybackMonths
        ? `${paybackValue.toFixed(2)} транзакций (≈ ${paybackMonths.toFixed(1)} мес)`
        : formatPayback(paybackValue, 'transactions');
      break;
    case 'project':
      paybackMonths = inputs.durationDays
        ? paybackValue * (inputs.durationDays / 30)
        : undefined;
      paybackUnit = paybackMonths
        ? `${paybackValue.toFixed(2)} проектов (≈ ${paybackMonths.toFixed(1)} мес)`
        : formatPayback(paybackValue, 'projects');
      break;
    case 'deal':
      paybackMonths = inputs.repeatFrequency
        ? paybackValue / (inputs.repeatFrequency / 12)
        : undefined;
      paybackUnit = paybackMonths
        ? `${paybackValue.toFixed(2)} сделок (≈ ${paybackMonths.toFixed(1)} мес)`
        : formatPayback(paybackValue, 'deals');
      break;
  }

  metrics.payback = {
    value: parseFloat(paybackValue.toFixed(2)),
    months: paybackMonths ? parseFloat(paybackMonths.toFixed(2)) : undefined,
    unit: paybackUnit,
    benchmark:
      paybackMonths
        ? paybackMonths < 6
          ? 'Быстро'
          : paybackMonths < 12
          ? 'Норма'
          : 'Долго'
        : paybackValue < 2
        ? 'Быстро'
        : 'Медленно',
  };

  // 6. Break-even
  if (inputs.fixedCostsMonthly) {
    const unitsNeeded = calculateBreakEven(inputs.fixedCostsMonthly, CM);
    
    metrics.breakEven = {
      unitsNeeded,
      currentVolume: inputs.currentVolume,
      gap: inputs.currentVolume ? unitsNeeded - inputs.currentVolume : undefined,
      status: inputs.currentVolume
        ? unitsNeeded <= inputs.currentVolume
          ? 'Покрыто ✓'
          : `Нужно еще ${unitsNeeded - inputs.currentVolume}`
        : `Нужно ${unitsNeeded} единиц для покрытия ФОТ`,
    };
  }

  // 7. Flags
  const flags = generateFlags(inputs, metrics);

  // 8. Verdict
  const verdict = generateVerdict(metrics, flags);

  return {
    metrics,
    flags,
    verdict,
  };
}