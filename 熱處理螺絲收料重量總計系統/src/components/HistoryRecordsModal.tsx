import React from 'react';
import { 
  X, 
  History, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileSpreadsheet,
  Building2,
  Calendar,
  Scale
} from 'lucide-react';
import { FinalizedReceivingRecord } from '../types';
import { formatWeight } from '../utils/weightCalculator';
import { useLanguage } from '../i18n/LanguageContext';

interface HistoryRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: FinalizedReceivingRecord[];
  onClearHistory: () => void;
  onSelectHistoryRecord: (record: FinalizedReceivingRecord) => void;
}

export const HistoryRecordsModal: React.FC<HistoryRecordsModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearHistory,
  onSelectHistoryRecord
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const exportToCsv = () => {
    if (records.length === 0) return;

    const headers = [
      'ID',
      'Equipment',
      'Order ID',
      'Date',
      'Customer',
      'Specification',
      'Expected Wt (kg)',
      'Total Weighed (kg)',
      'Variance (kg)',
      'Variance (%)',
      'Containers',
      'Audit Result',
      'Completed At',
      'Operator'
    ];

    const rows = records.map(r => [
      r.id,
      r.equipmentName || 'N/A',
      r.order.id,
      r.order.date,
      `"${r.order.customerName.replace(/"/g, '""')}"`,
      `"${r.order.screwSpec.replace(/"/g, '""')}"`,
      r.order.expectedWeight,
      r.totalWeighed,
      r.comparison.difference,
      `${r.comparison.differencePercent}%`,
      r.weighings.length,
      r.comparison.status === 'MATCH' ? t('status.match') : r.comparison.status === 'UNDERWEIGHT' ? t('status.underweight') : t('status.overweight'),
      r.completedAt,
      r.operator
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Fastener_Weighing_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('history.title')}</h3>
              <p className="text-xs text-slate-400">{t('history.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {records.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                <History className="w-6 h-6" />
              </div>
              <p className="text-base font-medium text-slate-300">{t('history.noHistory')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{records.length} records</span>
                <div className="flex gap-2">
                  <button
                    onClick={exportToCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{t('history.export')}</span>
                  </button>
                  <button
                    onClick={() => {
                      onClearHistory();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('history.clear')}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {records.map((rec) => {
                  const isMatch = rec.comparison.status === 'MATCH';
                  const isOver = rec.comparison.status === 'OVERWEIGHT';
                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">
                            {rec.order.customerName}
                          </span>
                          {rec.equipmentName && (
                            <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-700/60">
                              {rec.equipmentName}
                            </span>
                          )}
                          <span className="font-mono text-xs text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                            {rec.order.id}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {rec.completedAt}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">
                          {t('order.field.spec')}: {rec.order.screwSpec}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-4 flex-wrap font-mono pt-1">
                          <span>{t('comparison.expected')}: <strong>{formatWeight(rec.order.expectedWeight)}</strong> kg</span>
                          <span>{t('comparison.totalNet')}: <strong className="text-amber-400">{formatWeight(rec.totalWeighed)}</strong> kg</span>
                          <span>{t('comparison.variance')}: <strong className={rec.comparison.difference === 0 ? 'text-white' : rec.comparison.difference > 0 ? 'text-amber-400' : 'text-slate-300'}>
                            {rec.comparison.difference > 0 ? `+${rec.comparison.difference}` : rec.comparison.difference} kg ({rec.comparison.differencePercent}%)
                          </strong></span>
                          <span>{t('history.table.containers')}: {rec.weighings.length}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {isMatch ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t('status.match')}</span>
                          </div>
                        ) : isOver ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>{t('status.overweight')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t('status.underweight')}</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            onSelectHistoryRecord(rec);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-medium transition cursor-pointer"
                        >
                          {t('history.viewDetails')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
          >
            {t('scanner.close')}
          </button>
        </div>

      </div>
    </div>
  );
};
