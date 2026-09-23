import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Tag, 
  Scale, 
  QrCode, 
  Settings2, 
  Check, 
  Info,
  Layers,
  Flame,
  Hash
} from 'lucide-react';
import { ScrewOrder } from '../types';
import { formatWeight } from '../utils/weightCalculator';
import { useLanguage } from '../i18n/LanguageContext';

interface OrderInfoCardProps {
  order: ScrewOrder | null;
  onOpenScanner: () => void;
  onUpdateTolerance: (tolerancePercent: number) => void;
  equipmentName?: string;
  onCompleteAndScanNext?: () => void;
}

export const OrderInfoCard: React.FC<OrderInfoCardProps> = ({
  order,
  onOpenScanner,
  onUpdateTolerance,
  equipmentName,
  onCompleteAndScanNext
}) => {
  const { t } = useLanguage();
  const [isEditingTolerance, setIsEditingTolerance] = useState(false);
  const [toleranceInput, setToleranceInput] = useState<string>(
    order ? order.tolerancePercent.toString() : '1.5'
  );

  useEffect(() => {
    if (order) {
      setToleranceInput(order.tolerancePercent.toString());
    }
  }, [order?.tolerancePercent, order?.id]);

  if (!order) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center shadow-lg">
        <div className="max-w-md mx-auto py-6 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <QrCode className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">{t('order.noOrder')}</h3>
          <p className="text-sm text-slate-400">
            {t('order.noOrderDesc')}
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{t('order.reRead')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleToleranceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(toleranceInput);
    if (!isNaN(val) && val >= 0.1 && val <= 10) {
      onUpdateTolerance(val);
      setIsEditingTolerance(false);
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-3.5 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            {t('order.loaded')}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono font-semibold">
            {order.id}
          </span>
          {equipmentName && (
            <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/60 text-cyan-300 font-semibold font-mono">
              {t('order.outputFurnace', { name: equipmentName })}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onCompleteAndScanNext && (
            <button
              id="order-info-complete-scan-btn"
              onClick={onCompleteAndScanNext}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition cursor-pointer"
              title={t('monitor.completeAndScan')}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('monitor.completeAndScan')}</span>
            </button>
          )}
          <button
            onClick={onOpenScanner}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('order.changeOrder')}</span>
          </button>
        </div>
      </div>

      {/* Main 4 Core Requested Fields */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. 客戶名稱 (Customer Name) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                {t('order.field.customer')}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">CUSTOMER</span>
            </div>
            <div className="text-lg font-bold text-white tracking-tight break-words">
              {order.customerName}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-400" />
              <span>{t('order.field.batch')}：{order.batchNo}</span>
            </div>
          </div>

          {/* 2. 入貨日期 (Receiving Date) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {t('order.field.date')}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">DATE</span>
            </div>
            <div className="text-lg font-bold text-amber-300 font-mono tracking-tight">
              {order.date}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {order.batchNo}
            </div>
          </div>

          {/* 3. 螺絲規格 (Screw Specification) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                {t('order.field.spec')}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">SPECIFICATION</span>
            </div>
            <div className="text-base font-bold text-white line-clamp-2" title={order.screwSpec}>
              {order.screwSpec}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {order.material || 'Standard Fastener'}
            </div>
          </div>

          {/* 4. 入貨重量 (Expected Receiving Weight) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-900/80 border border-amber-500/40 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-300 mb-1">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                {t('order.field.expectedWeight')}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">EXPECTED WT</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {formatWeight(order.expectedWeight)}
              </span>
              <span className="text-sm font-bold text-amber-400">kg</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{order.expectedContainers ? `${order.expectedContainers} containers` : '—'}</span>
              <span className="text-amber-300 font-mono">±{order.tolerancePercent}%</span>
            </div>
          </div>

        </div>

        {/* Secondary Details: Heat Treatment & Tolerance Configuration */}
        <div className="mt-4 pt-3.5 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            {order.heatTreatmentType && (
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-400">{t('order.field.treatment')}：</span>
                <span className="font-semibold text-slate-200">{order.heatTreatmentType}</span>
              </div>
            )}
            {order.hardnessRequirement && (
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">硬度要求 / Hardness:</span>
                <span className="font-semibold text-slate-200">{order.hardnessRequirement}</span>
              </div>
            )}
            {order.remarks && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.remarks}</span>
              </div>
            )}
          </div>

          {/* Tolerance Setting Widget */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{t('order.field.tolerance')}：</span>
            {isEditingTolerance ? (
              <form onSubmit={handleToleranceSubmit} className="flex items-center gap-1">
                <span className="text-slate-400 font-mono">±</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={toleranceInput}
                  onChange={(e) => setToleranceInput(e.target.value)}
                  className="w-16 bg-slate-900 border border-amber-500 rounded px-1.5 py-0.5 text-xs text-white text-center font-mono focus:outline-none"
                  autoFocus
                />
                <span className="text-slate-400 font-mono">%</span>
                <button
                  type="submit"
                  className="p-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  <Check className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-700/80 text-amber-300 font-mono font-bold">
                  ±{order.tolerancePercent}% (約 ±{((order.expectedWeight * order.tolerancePercent) / 100).toFixed(1)} kg)
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTolerance(true)}
                  title={t('order.customTol')}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
