// ============================================================================
// FORMAT HELPERS - Форматирование для UI
// ============================================================================

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatRatio(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function formatPayback(
  value: number,
  unitType: "months" | "transactions" | "projects" | "deals"
): string {
  const unit = {
    months: "мес",
    transactions: "транзакций",
    projects: "проектов",
    deals: "сделок"
  }[unitType];
  
  return `${value.toFixed(2)} ${unit}`;
}

export function formatBreakEven(
  needed: number,
  current: number | null,
  unitType: "clients" | "sales" | "projects"
): string {
  const unit = {
    clients: "клиентов",
    sales: "продаж",
    projects: "проектов"
  }[unitType];
  
  if (current == null) {
    return `Нужно ${needed} ${unit}`;
  }
  
  const gap = needed - current;
  return gap <= 0 
    ? `Покрыто ✓`
    : `Нужно еще ${gap} ${unit}`;
}