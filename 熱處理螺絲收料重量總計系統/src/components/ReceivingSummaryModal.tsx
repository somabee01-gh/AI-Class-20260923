import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Save, 
  Building2, 
  Calendar, 
  Tag, 
  Scale, 
  Flame 
} from 'lucide-react';
import { ScrewOrder, WeighingItem, WeightComparisonResult } from '../types';
import { formatWeight } from '../utils/weightCalculator';
import { useLanguage } from '../i18n/LanguageContext';

interface ReceivingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ScrewOrder;
  weighings: WeighingItem[];
  comparison: WeightComparisonResult;
  onSaveRecord: () => void;
  equipmentName?: string;
  onCompleteAndScanNext?: () => void;
}

export const ReceivingSummaryModal: React.FC<ReceivingSummaryModalProps> = ({
  isOpen,
  onClose,
  order,
  weighings,
  comparison,
  onSaveRecord,
  equipmentName,
  onCompleteAndScanNext
}) => {
  const { t } = useLanguage();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const { status, totalWeighed, expectedWeight, difference, differencePercent, toleranceKg } = comparison;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('summary.title')}</h3>
              <p className="text-xs text-slate-400">{t('summary.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Printable Sheet */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40">
          <div 
            ref={printAreaRef}
            className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 max-w-2xl mx-auto font-sans text-xs sm:text-sm"
          >
            {/* Header Document Title */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest">
                <Flame className="w-4 h-4" />
                <span>FASTENER HEAT TREATMENT INCOMING AUDIT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-1">
                {t('summary.docTitle')}
              </h2>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono flex-wrap gap-1">
                <span>Order: {order.id}</span>
                {equipmentName && <span className="font-bold text-slate-700">Line: {equipmentName}</span>}
                <span>Scale: #01</span>
                <span>Time: {new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Core 4 Fields Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4">
              <div>
                <span className="text-slate-500 text-[11px] block">{t('order.field.customer')}:</span>
                <span className="font-bold text-slate-950 text-sm">{order.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">{t('order.field.date')}:</span>
                <span className="font-bold text-slate-950 font-mono text-sm">{order.date}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">{t('order.field.spec')}:</span>
                <span className="font-bold text-slate-950">{order.screwSpec}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">{t('order.field.expectedWeight')}:</span>
                <span className="font-black text-amber-700 font-mono text-base">
                  {formatWeight(order.expectedWeight)} kg
                </span>
                <span className="text-slate-500 text-xs ml-1">({order.expectedContainers || '—'} {t('order.field.bucket')})</span>
              </div>
            </div>

            {/* Heat treatment specifications */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 border-b border-slate-200 pb-3 mb-4">
              <div><span className="text-slate-400">Batch: </span>{order.batchNo}</div>
              <div><span className="text-slate-400">Process: </span>{order.heatTreatmentType || 'Carburizing'}</div>
              <div><span className="text-slate-400">Hardness: </span>{order.hardnessRequirement || 'HRC 32-39'}</div>
            </div>

            {/* Weight Audit Summary Box */}
            <div className="border-2 border-slate-900 rounded-xl p-4 mb-4 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <span className="font-black text-slate-900 text-sm">{t('comparison.title')}</span>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-500">{t('order.field.tolerance')}: </span>
                  <span className="font-bold">±{order.tolerancePercent}% (±{toleranceKg} kg)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">{t('comparison.expected')}</span>
                  <span className="text-lg font-bold font-mono text-slate-800">
                    {formatWeight(expectedWeight)} kg
                  </span>
                </div>

                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">{t('comparison.totalNet')}</span>
                  <span className="text-lg font-black font-mono text-amber-700">
                    {formatWeight(totalWeighed)} kg
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">({weighings.length} {t('order.field.bucket')})</span>
                </div>

                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">{t('comparison.variance')}</span>
                  <span className={`text-lg font-bold font-mono ${
                    difference === 0 ? 'text-slate-800' : difference > 0 ? 'text-amber-700' : 'text-slate-800'
                  }`}>
                    {difference > 0 ? `+${difference}` : difference} kg
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">({differencePercent}%)</span>
                </div>
              </div>

              {/* Compliance Stamp / Seal */}
              <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">{t('summary.auditConclusion')}:</span>
                  <span className="text-xs text-slate-600 block mt-0.5">
                    {status === 'MATCH' && (t('comparison.matchMsg'))}
                    {status === 'UNDERWEIGHT' && (t('comparison.underweightMsg'))}
                    {status === 'OVERWEIGHT' && (t('comparison.overweightMsg'))}
                    {status === 'WEIGHING' && (t('status.weighing'))}
                  </span>
                </div>

                <div className="shrink-0 pl-3">
                  {status === 'MATCH' ? (
                    <div className="border-2 border-emerald-600 text-emerald-700 px-3 py-1.5 rounded-lg font-black text-center rotate-[-3deg] uppercase tracking-wider bg-emerald-50">
                      <div className="text-[10px]">WEIGHT AUDIT</div>
                      <div className="text-base">{t('summary.pass')}</div>
                    </div>
                  ) : (
                    <div className="border-2 border-amber-600 text-amber-800 px-3 py-1.5 rounded-lg font-black text-center rotate-[-3deg] uppercase tracking-wider bg-amber-50">
                      <div className="text-[10px]">AUDIT NOTICE</div>
                      <div className="text-base">{t('summary.fail')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weighing Details Condensed List */}
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-700 mb-1.5">{t('table.title')}:</div>
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-1.5">#</th>
                      <th className="p-1.5">{t('table.col.container')}</th>
                      <th className="p-1.5 text-right">{t('table.col.gross')}</th>
                      <th className="p-1.5 text-right">{t('table.col.net')}</th>
                      <th className="p-1.5 text-right font-bold">{t('table.col.cumNet')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weighings.slice(0, 15).map((w) => (
                      <tr key={w.id}>
                        <td className="p-1">#{w.itemNumber}</td>
                        <td className="p-1">{w.containerType}</td>
                        <td className="p-1 text-right">{formatWeight(w.grossWeight)} kg</td>
                        <td className="p-1 text-right text-emerald-700 font-bold">{formatWeight(w.netWeight)} kg</td>
                        <td className="p-1 text-right font-bold">{formatWeight(w.cumulativeWeight)} kg</td>
                      </tr>
                    ))}
                    {weighings.length > 15 && (
                      <tr>
                        <td colSpan={5} className="p-1 text-center text-slate-400">
                          ... {weighings.length - 15} more containers ...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-300 text-xs text-slate-600">
              <div className="border-b border-slate-400 pb-1">
                <span>{t('summary.operator')}: </span>
                <span className="font-mono text-slate-900 ml-1">OP-01</span>
              </div>
              <div className="border-b border-slate-400 pb-1">
                <span>{t('summary.qc')}: </span>
                <span className="text-slate-400 ml-1">_____________</span>
              </div>
              <div className="border-b border-slate-400 pb-1">
                <span>{t('summary.manager')}: </span>
                <span className="text-slate-400 ml-1">_____________</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            {t('scanner.close')}
          </button>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => {
                onSaveRecord();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>{t('summary.saveAndClose')}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{t('summary.print')}</span>
            </button>
            {onCompleteAndScanNext && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCompleteAndScanNext();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black transition shadow shadow-emerald-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>{t('monitor.completeAndScan')}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
