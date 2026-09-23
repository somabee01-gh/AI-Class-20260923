import React, { useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Info,
  Layers,
  Sparkles,
  QrCode
} from 'lucide-react';
import { WeightComparisonResult, ComplianceStatus } from '../types';
import { formatWeight } from '../utils/weightCalculator';
import { sounds } from '../utils/qrHelper';
import { useLanguage } from '../i18n/LanguageContext';

interface WeightComparisonCardProps {
  comparison: WeightComparisonResult;
  containerCount: number;
  expectedContainers?: number;
  equipmentName?: string;
  onCompleteAndScanNext?: () => void;
}

export const WeightComparisonCard: React.FC<WeightComparisonCardProps> = ({
  comparison,
  containerCount,
  expectedContainers,
  equipmentName,
  onCompleteAndScanNext
}) => {
  const { t } = useLanguage();
  const prevStatusRef = useRef<ComplianceStatus>(comparison.status);

  // Trigger audio feedback when status changes to MATCH
  useEffect(() => {
    if (comparison.status === 'MATCH' && prevStatusRef.current !== 'MATCH') {
      sounds.beepSuccess();
    } else if (
      (comparison.status === 'UNDERWEIGHT' || comparison.status === 'OVERWEIGHT') &&
      prevStatusRef.current !== comparison.status &&
      comparison.totalWeighed > 0
    ) {
      sounds.beepWarning();
    }
    prevStatusRef.current = comparison.status;
  }, [comparison.status, comparison.totalWeighed]);

  const {
    expectedWeight,
    totalWeighed,
    difference,
    differencePercent,
    completionPercent,
    toleranceKg,
    minAcceptable,
    maxAcceptable,
    status
  } = comparison;

  // Range displayed: from (expected - 3*tolerance) to (expected + 3*tolerance)
  const rangeSpan = Math.max(toleranceKg * 6, expectedWeight * 0.1);
  const gaugeMin = Math.max(0, expectedWeight - rangeSpan / 2);
  const gaugeMax = expectedWeight + rangeSpan / 2;
  const currentRatio = Math.min(100, Math.max(0, ((totalWeighed - gaugeMin) / (gaugeMax - gaugeMin)) * 100));
  const minRatio = Math.min(100, Math.max(0, ((minAcceptable - gaugeMin) / (gaugeMax - gaugeMin)) * 100));
  const maxRatio = Math.min(100, Math.max(0, ((maxAcceptable - gaugeMin) / (gaugeMax - gaugeMin)) * 100));
  const targetRatio = Math.min(100, Math.max(0, ((expectedWeight - gaugeMin) / (gaugeMax - gaugeMin)) * 100));

  // Average per bucket
  const avgBucket = containerCount > 0 ? (totalWeighed / containerCount).toFixed(1) : '0.0';

  const statusText = 
    status === 'MATCH' ? t('status.match') :
    status === 'OVERWEIGHT' ? t('status.overweight') :
    status === 'UNDERWEIGHT' ? t('status.underweight') :
    status === 'WEIGHING' ? `${t('status.weighing')} (${completionPercent}%)` : t('status.pending');

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
      
      {/* Header Bar with Overall Compliance Decision Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 px-5 py-3 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {t('comparison.title')}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {t('comparison.subtitle')}
            </p>
          </div>
        </div>

        {/* Status Badge Tag */}
        <div>
          {status === 'MATCH' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{statusText}</span>
            </div>
          )}
          {status === 'UNDERWEIGHT' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{statusText}</span>
            </div>
          )}
          {status === 'OVERWEIGHT' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 text-xs font-bold">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>{statusText}</span>
            </div>
          )}
          {status === 'WEIGHING' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/50 text-xs font-bold">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{statusText}</span>
            </div>
          )}
          {status === 'PENDING' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{statusText}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        
        {/* TOP: Big Comparison Split Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Current Weighed Total */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                {t('comparison.totalNet')}
              </span>
              <span className="text-[10px] font-mono text-slate-400">TOTAL WEIGHED</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                {formatWeight(totalWeighed)}
              </span>
              <span className="text-base font-bold text-amber-500/90 font-mono">kg</span>
            </div>

            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>
                  {t('monitor.weighedBuckets', {
                    count: containerCount,
                    expected: expectedContainers ? `/ ${expectedContainers}` : ''
                  })}
                </span>
              </span>
              <span className="text-slate-400 font-mono">
                Avg: {avgBucket} kg/bkt
              </span>
            </div>
          </div>

          {/* Variance & Difference Result */}
          <div className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between ${
            status === 'MATCH' 
              ? 'bg-emerald-950/30 border-emerald-500/50' 
              : status === 'OVERWEIGHT'
              ? 'bg-rose-950/30 border-rose-500/50'
              : status === 'UNDERWEIGHT'
              ? 'bg-amber-950/30 border-amber-500/50'
              : 'bg-slate-900/80 border-slate-700/80'
          }`}>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">
                  {t('comparison.variance')}
                </span>
                <span className="text-[10px] font-mono text-slate-400">VARIANCE</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                  status === 'MATCH'
                    ? 'text-emerald-400'
                    : status === 'OVERWEIGHT'
                    ? 'text-rose-400'
                    : status === 'UNDERWEIGHT'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}>
                  {difference > 0 ? `+${formatWeight(difference)}` : formatWeight(difference)}
                </span>
                <span className="text-base font-bold text-slate-400 font-mono">kg</span>
                
                {/* Difference Percentage */}
                <span className={`ml-auto text-sm font-bold font-mono px-2 py-0.5 rounded ${
                  status === 'MATCH'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : status === 'OVERWEIGHT'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {differencePercent > 0 ? `+${differencePercent}%` : `${differencePercent}%`}
                </span>
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-300 flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span>{t('comparison.expected')}：<strong className="text-white font-mono">{formatWeight(expectedWeight)}</strong> kg</span>
              <span>{t('monitor.rate', { percent: completionPercent })}</span>
            </div>
          </div>

        </div>

        {/* MIDDLE: Visual Tolerance Band Gauge */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>{t('comparison.tolerance')} (±{comparison.expectedWeight > 0 ? ((toleranceKg / expectedWeight) * 100).toFixed(1) : '1.0'}%)</span>
              <span className="text-slate-400 font-mono font-normal">
                [{minAcceptable} ~ {maxAcceptable} kg]
              </span>
            </span>
            <span className="text-[11px] font-mono text-amber-400">
              ±{toleranceKg} kg
            </span>
          </div>

          {/* Graphical Gauge Track */}
          <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            
            {/* Acceptable Safe Green Band */}
            <div 
              className="absolute top-0 bottom-0 bg-emerald-500/30 border-x border-emerald-400/80 transition-all duration-300"
              style={{
                left: `${minRatio}%`,
                width: `${Math.max(2, maxRatio - minRatio)}%`
              }}
              title={`Safe Range: ${minAcceptable} kg ~ ${maxAcceptable} kg`}
            />

            {/* Target Ideal Center Line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
              style={{ left: `${targetRatio}%` }}
              title={`Target: ${expectedWeight} kg`}
            />

            {/* Current Total Weighed Pointer Needle / Bar */}
            {totalWeighed > 0 && (
              <div 
                className={`absolute top-0 bottom-0 w-2 -ml-1 rounded-full shadow-lg transition-all duration-300 ${
                  status === 'MATCH'
                    ? 'bg-emerald-400 shadow-emerald-400/50 ring-2 ring-emerald-300'
                    : status === 'OVERWEIGHT'
                    ? 'bg-rose-400 shadow-rose-400/50 ring-2 ring-rose-300'
                    : 'bg-amber-400 shadow-amber-400/50 ring-2 ring-amber-300'
                }`}
                style={{ left: `${currentRatio}%` }}
                title={`Total: ${totalWeighed} kg`}
              />
            )}
          </div>

          {/* Scale Legend Markers */}
          <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>Min: {minAcceptable} kg</span>
            <span className="text-white font-bold">{expectedWeight} kg</span>
            <span>Max: {maxAcceptable} kg</span>
          </div>
        </div>

        {/* BOTTOM: Detailed Verification Narrative & Decision Recommendation */}
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
          status === 'MATCH'
            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
            : status === 'OVERWEIGHT'
            ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
            : status === 'UNDERWEIGHT'
            ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
            : 'bg-slate-900/60 border-slate-700/60 text-slate-300'
        }`}>
          <div className="shrink-0 mt-0.5">
            {status === 'MATCH' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {status === 'OVERWEIGHT' && <XCircle className="w-5 h-5 text-rose-400" />}
            {status === 'UNDERWEIGHT' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {(status === 'WEIGHING' || status === 'PENDING') && <Info className="w-5 h-5 text-blue-400" />}
          </div>

          <div className="flex-1 space-y-1">
            <div className="font-bold text-sm text-white">
              {status === 'MATCH' && t('comparison.matchMsg')}
              {status === 'OVERWEIGHT' && t('comparison.overweightMsg')}
              {status === 'UNDERWEIGHT' && t('comparison.underweightMsg')}
              {status === 'WEIGHING' && `${t('status.weighing')} (${containerCount} containers)`}
              {status === 'PENDING' && t('status.pending')}
            </div>

            <p className="text-slate-300 leading-relaxed">
              {status === 'MATCH' && (
                `Total: ${formatWeight(totalWeighed)} kg / Target: ${formatWeight(expectedWeight)} kg. Diff: ${difference >= 0 ? '+' : ''}${difference} kg (${differencePercent}%). Within ±${toleranceKg} kg.`
              )}
              {status === 'OVERWEIGHT' && (
                `Total: ${formatWeight(totalWeighed)} kg > Target: ${formatWeight(expectedWeight)} kg by +${difference} kg (+${differencePercent}%). Exceeds ${maxAcceptable} kg.`
              )}
              {status === 'UNDERWEIGHT' && (
                `Total: ${formatWeight(totalWeighed)} kg < Target: ${formatWeight(expectedWeight)} kg by ${Math.abs(difference)} kg (${differencePercent}%). Below ${minAcceptable} kg.`
              )}
              {status === 'WEIGHING' && (
                `Accumulated ${containerCount} containers (avg ${avgBucket} kg). Continue inputting readings.`
              )}
              {status === 'PENDING' && (
                'Place container on scale and input reading to begin.'
              )}
            </p>
          </div>
        </div>

        {/* Core Requirement: Finish Order & Scan Next Data Button */}
        {onCompleteAndScanNext && (
          <div className="pt-2">
            <button
              id="finish-order-and-scan-next-btn"
              type="button"
              onClick={onCompleteAndScanNext}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
                status === 'MATCH'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 ring-2 ring-emerald-400/50 shadow-emerald-500/25 animate-pulse'
                  : totalWeighed > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 ring-1 ring-amber-400/40'
                  : 'bg-slate-700 hover:bg-slate-650 text-slate-200 border border-slate-600'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span className="text-base tracking-wide">
                {t('monitor.completeAndScan')}
              </span>
              <QrCode className="w-4 h-4 ml-1 opacity-80" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
