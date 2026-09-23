import React from 'react';
import { 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  QrCode, 
  Scale, 
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  Layers,
  Activity
} from 'lucide-react';
import { EquipmentLine } from '../types';
import { calculateWeightComparison, formatWeight } from '../utils/weightCalculator';
import { useLanguage } from '../i18n/LanguageContext';

interface EquipmentMonitorBarProps {
  equipmentLines: EquipmentLine[];
  activeEquipmentId: string;
  onSelectEquipment: (id: string) => void;
  onCompleteAndScanNext: (equipmentId: string) => void;
  onQuickSimulate: (equipmentId: string) => void;
}

export const EquipmentMonitorBar: React.FC<EquipmentMonitorBarProps> = ({
  equipmentLines,
  activeEquipmentId,
  onSelectEquipment,
  onCompleteAndScanNext,
  onQuickSimulate,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2.5">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              {t('monitor.title')}
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                {t('monitor.badge')}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {t('monitor.desc')}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t('monitor.network')}</span>
        </div>
      </div>

      {/* 3 Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {equipmentLines.map((eq) => {
          const isActive = eq.id === activeEquipmentId;
          const weighings = eq.weighings || [];
          const totalWeighed = weighings.length > 0 ? weighings[weighings.length - 1].cumulativeWeight : 0;
          const comparison = calculateWeightComparison(
            eq.activeOrder.expectedWeight,
            totalWeighed,
            eq.activeOrder.tolerancePercent
          );

          const { status, completionPercent, difference } = comparison;

          // Equipment theme color accent
          const lineTheme = eq.lineNo === 1 
            ? { border: 'border-amber-500', glow: 'shadow-amber-500/10', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', bar: 'bg-amber-400' }
            : eq.lineNo === 2
            ? { border: 'border-cyan-500', glow: 'shadow-cyan-500/10', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', bar: 'bg-cyan-400' }
            : { border: 'border-orange-500', glow: 'shadow-orange-500/10', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', bar: 'bg-orange-400' };

          const statusText = 
            status === 'MATCH' ? t('status.match') :
            status === 'OVERWEIGHT' ? t('status.overweight') :
            status === 'UNDERWEIGHT' ? t('status.underweight') :
            status === 'WEIGHING' ? t('status.weighing') : t('status.pending');

          return (
            <div
              key={eq.id}
              id={`equipment-card-${eq.id}`}
              className={`relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isActive
                  ? `bg-slate-850/95 ${lineTheme.border} ring-2 ring-amber-500/30 shadow-lg ${lineTheme.glow}`
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
              }`}
            >
              {/* Active Corner Ribbon Indicator */}
              {isActive && (
                <div className="absolute top-0 right-0">
                  <div className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-bl-lg shadow flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                    {t('monitor.currentWorkstation')}
                  </div>
                </div>
              )}

              {/* Card Header */}
              <div className="p-3.5 pb-2 border-b border-slate-800/80">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${lineTheme.badge}`}>
                      {eq.shortName}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-[160px]" title={eq.name}>
                      {eq.name}
                    </span>
                  </div>

                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => onSelectEquipment(eq.id)}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 transition cursor-pointer"
                    >
                      <span>{t('monitor.switch')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Customer & Spec */}
                <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[170px]" title={eq.activeOrder.customerName}>
                      {eq.activeOrder.customerName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {eq.activeOrder.batchNo}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate" title={eq.activeOrder.screwSpec}>
                    {eq.activeOrder.screwSpec}
                  </div>
                </div>
              </div>

              {/* Live Weight Progress Metric */}
              <div className="p-3.5 pt-2.5 space-y-2 flex-1 flex flex-col justify-center">
                {/* Weight numbers */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('monitor.cumWeight')}</span>
                    <span className="text-base font-black font-mono text-amber-400">
                      {formatWeight(totalWeighed)}
                    </span>
                    <span className="text-xs font-mono text-slate-400 ml-1">
                      / {formatWeight(eq.activeOrder.expectedWeight)} kg
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {t('monitor.weighedBuckets', { 
                        count: weighings.length, 
                        expected: eq.activeOrder.expectedContainers ? `/ ${eq.activeOrder.expectedContainers}` : '' 
                      })}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      status === 'MATCH'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : status === 'OVERWEIGHT'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : status === 'UNDERWEIGHT'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : status === 'WEIGHING'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {status === 'MATCH' && <CheckCircle2 className="w-3 h-3" />}
                      {status === 'OVERWEIGHT' && <XCircle className="w-3 h-3" />}
                      {status === 'UNDERWEIGHT' && <AlertTriangle className="w-3 h-3" />}
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        status === 'MATCH' ? 'bg-emerald-400' :
                        status === 'OVERWEIGHT' ? 'bg-rose-400' :
                        completionPercent >= 90 ? 'bg-amber-400' : 'bg-blue-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, completionPercent))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>{t('monitor.rate', { percent: completionPercent })}</span>
                    <span>
                      {difference === 0 ? t('monitor.exactMatch') : difference > 0 ? `+${difference} kg` : `${difference} kg`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2">
                {/* 1. Complete & Scan Next Order Button */}
                <button
                  id={`complete-scan-btn-${eq.id}`}
                  type="button"
                  onClick={() => onCompleteAndScanNext(eq.id)}
                  title={t('monitor.completeAndScanTooltip', { name: eq.shortName })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer shadow ${
                    status === 'MATCH'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
                      : weighings.length > 0
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t('monitor.completeAndScan')}</span>
                </button>

                {/* 2. Switch button or quick simulate */}
                {!isActive ? (
                  <button
                    type="button"
                    onClick={() => onSelectEquipment(eq.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer shrink-0"
                    title={t('monitor.enterScale')}
                  >
                    {t('monitor.enterScale')}
                  </button>
                ) : weighings.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onQuickSimulate(eq.id)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 border border-slate-700 text-[11px] transition cursor-pointer shrink-0"
                    title={t('monitor.quickSim')}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
