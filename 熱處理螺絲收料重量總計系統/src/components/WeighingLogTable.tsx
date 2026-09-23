import React from 'react';
import { 
  Trash2, 
  Clock, 
  RotateCcw, 
  Sparkles, 
  FileSpreadsheet, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { WeighingItem } from '../types';
import { formatWeight } from '../utils/weightCalculator';
import { useLanguage } from '../i18n/LanguageContext';

interface WeighingLogTableProps {
  weighings: WeighingItem[];
  onDeleteWeighing: (id: string) => void;
  onClearAll: () => void;
  onSimulateAll: () => void;
  expectedWeight: number;
  expectedContainers?: number;
  onCompleteAndScanNext?: () => void;
}

export const WeighingLogTable: React.FC<WeighingLogTableProps> = ({
  weighings,
  onDeleteWeighing,
  onClearAll,
  onSimulateAll,
  expectedWeight,
  expectedContainers,
  onCompleteAndScanNext
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      
      {/* Table Header & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 px-5 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {t('table.title')}
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                {weighings.length} {t('order.field.bucket')}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {t('table.desc')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Finish & Scan Next Button */}
          {onCompleteAndScanNext && (
            <button
              id="table-complete-and-scan-next-btn"
              type="button"
              onClick={onCompleteAndScanNext}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition active:scale-95 cursor-pointer"
              title={t('monitor.completeAndScan')}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('monitor.completeAndScan')}</span>
            </button>
          )}

          {/* Quick 1-Click Simulation */}
          <button
            id="simulate-all-btn"
            type="button"
            onClick={onSimulateAll}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition active:scale-95 cursor-pointer"
            title={t('table.simulateAll')}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('table.simulateAll')}</span>
          </button>

          {/* Reset All Weighings */}
          {weighings.length > 0 && (
            <button
              id="clear-all-weighings-btn"
              type="button"
              onClick={() => {
                onClearAll();
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 text-xs transition cursor-pointer"
              title={t('table.clear')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('table.clear')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        {weighings.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-700/50 flex items-center justify-center text-slate-500">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-300">{t('table.noRecords')}</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t('scale.desc')}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/95 sticky top-0 z-10 border-b border-slate-700 text-slate-400 font-mono">
              <tr>
                <th className="py-2.5 px-3">{t('table.col.bucket')}</th>
                <th className="py-2.5 px-3">{t('table.col.container')}</th>
                <th className="py-2.5 px-3 text-right">{t('table.col.gross')}</th>
                <th className="py-2.5 px-3 text-right">{t('table.col.tare')}</th>
                <th className="py-2.5 px-3 text-right">{t('table.col.net')}</th>
                <th className="py-2.5 px-3 text-right font-bold text-amber-300">{t('table.col.cumNet')}</th>
                <th className="py-2.5 px-3 text-center">{t('table.col.time')}</th>
                <th className="py-2.5 px-3 text-center">{t('table.col.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {weighings.map((item, idx) => {
                const isLast = idx === weighings.length - 1;
                return (
                  <tr
                    key={item.id}
                    className={`transition hover:bg-slate-700/40 ${
                      isLast ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Bucket Number */}
                    <td className="py-2.5 px-3 font-bold text-white">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-amber-300 text-xs">
                        #{item.itemNumber}
                      </span>
                    </td>

                    {/* Container */}
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      <span className="truncate max-w-[120px] inline-block" title={item.containerType}>
                        {item.containerType || 'Standard'}
                      </span>
                    </td>

                    {/* Gross */}
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {formatWeight(item.grossWeight)}
                    </td>

                    {/* Tare */}
                    <td className="py-2.5 px-3 text-right text-rose-400">
                      -{formatWeight(item.tareWeight)}
                    </td>

                    {/* Net */}
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {formatWeight(item.netWeight)}
                    </td>

                    {/* Cum Net */}
                    <td className="py-2.5 px-3 text-right font-black text-amber-400 text-sm">
                      {formatWeight(item.cumulativeWeight)}
                    </td>

                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-center text-slate-400 text-[11px]">
                      {item.timestamp}
                    </td>

                    {/* Delete Action */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteWeighing(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Footer Summary Bar */}
      {weighings.length > 0 && (
        <div className="bg-slate-900/90 px-5 py-3 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>{t('history.table.containers')}：<strong className="text-white font-bold">{weighings.length}</strong></span>
            <span>Avg/Bkt：<strong className="text-amber-300 font-bold">{formatWeight(weighings[weighings.length - 1].cumulativeWeight / weighings.length)}</strong> kg</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">{t('comparison.totalNet')}：</span>
            <span className="text-base sm:text-lg font-black font-mono text-amber-400">
              {formatWeight(weighings[weighings.length - 1].cumulativeWeight)} kg
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
