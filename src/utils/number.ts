export function roundMoney(value: number): number {
  return Math.round(value);
}

export function ceilNumber(value: number): number {
  return Math.ceil(value);
}

export function parseNumberInput(value: string | number | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? undefined : num;
}