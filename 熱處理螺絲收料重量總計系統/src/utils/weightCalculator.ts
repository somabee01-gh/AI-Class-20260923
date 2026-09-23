import { ComplianceStatus, WeightComparisonResult } from '../types';

/**
 * Ensures weight is rounded to 1 decimal place with only .0 or .5 (multiples of 0.5 kg)
 */
export function roundToHalfKg(val: number): number {
  if (isNaN(val) || val <= 0) return 0;
  return Math.round(val * 2) / 2;
}

/**
 * Validates whether an input string conforms to:
 * Optional digits, optional dot, and if a dot is present, at most 1 decimal digit which must be '0' or '5'
 */
export function isValidWeightInputString(val: string): boolean {
  if (val === '') return true;
  return /^\d*(\.[05]?)?$/.test(val);
}

export function calculateWeightComparison(
  expectedWeight: number,
  totalWeighed: number,
  tolerancePercent: number = 1.5
): WeightComparisonResult {
  const safeExpected = Math.max(0.1, roundToHalfKg(expectedWeight));
  const roundedTotal = roundToHalfKg(totalWeighed);
  const diff = Number((roundedTotal - safeExpected).toFixed(1));
  const diffPercent = Number(((diff / safeExpected) * 100).toFixed(1));
  const completionPercent = Number(((roundedTotal / safeExpected) * 100).toFixed(1));
  
  const toleranceKg = Number((safeExpected * (tolerancePercent / 100)).toFixed(1));
  const minAcceptable = Number((safeExpected - toleranceKg).toFixed(1));
  const maxAcceptable = Number((safeExpected + toleranceKg).toFixed(1));

  let status: ComplianceStatus = 'PENDING';
  let statusLabel = '尚未開始過磅';
  let statusColor = 'text-slate-400 bg-slate-800 border-slate-700';

  if (roundedTotal <= 0) {
    status = 'PENDING';
    statusLabel = '待過磅';
    statusColor = 'text-slate-400 bg-slate-800/80 border-slate-700';
  } else if (roundedTotal >= minAcceptable && roundedTotal <= maxAcceptable) {
    status = 'MATCH';
    statusLabel = '符合入貨重量 (合格允收)';
    statusColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/60';
  } else if (roundedTotal > maxAcceptable) {
    status = 'OVERWEIGHT';
    statusLabel = `重量超重 (超出 +${Math.abs(diff)} kg)`;
    statusColor = 'text-rose-400 bg-rose-950/60 border-rose-500/60';
  } else {
    // roundedTotal < minAcceptable
    if (completionPercent < 85) {
      status = 'WEIGHING';
      statusLabel = `過磅進行中 (目前進度 ${completionPercent}%)`;
      statusColor = 'text-amber-400 bg-amber-950/60 border-amber-500/60';
    } else {
      status = 'UNDERWEIGHT';
      statusLabel = `重量不足 (短少 ${Math.abs(diff)} kg)`;
      statusColor = 'text-amber-400 bg-amber-950/60 border-amber-500/60';
    }
  }

  return {
    expectedWeight: safeExpected,
    totalWeighed: Number(roundedTotal.toFixed(1)),
    difference: diff,
    differencePercent: diffPercent,
    completionPercent,
    toleranceKg,
    minAcceptable,
    maxAcceptable,
    status,
    statusLabel,
    statusColor
  };
}

export function formatWeight(val: number, decimals: number = 1): string {
  return val.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
