/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  QrCode, 
  Sparkles, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  FileText,
  Flame,
  Info,
  Check,
  Layers,
  Activity
} from 'lucide-react';
import { ScrewOrder, WeighingItem, FinalizedReceivingRecord, EquipmentLine } from './types';
import { INITIAL_ORDERS, DEFAULT_EQUIPMENT_LINES } from './data/mockOrders';
import { calculateWeightComparison, roundToHalfKg } from './utils/weightCalculator';
import { sounds } from './utils/qrHelper';
import { Navbar } from './components/Navbar';
import { EquipmentMonitorBar } from './components/EquipmentMonitorBar';
import { OrderInfoCard } from './components/OrderInfoCard';
import { ScaleInputPanel } from './components/ScaleInputPanel';
import { WeightComparisonCard } from './components/WeightComparisonCard';
import { WeighingLogTable } from './components/WeighingLogTable';
import { QrScannerModal } from './components/QrScannerModal';
import { ReceivingSummaryModal } from './components/ReceivingSummaryModal';
import { HistoryRecordsModal } from './components/HistoryRecordsModal';
import { useLanguage } from './i18n/LanguageContext';

const STORAGE_KEY_LINES = 'ht_screw_equipment_lines_v2';
const STORAGE_KEY_ACTIVE_EQ = 'ht_screw_active_equipment_id_v2';
const STORAGE_KEY_HISTORY = 'ht_screw_receiving_history_v2';

export default function App() {
  const { t } = useLanguage();
  // 1. Concurrent 3 Equipment Lines State
  const [equipmentLines, setEquipmentLines] = useState<EquipmentLine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LINES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed.map((eq: EquipmentLine) => {
            const activeOrder = eq.activeOrder ? {
              ...eq.activeOrder,
              tolerancePercent: eq.activeOrder.tolerancePercent ? eq.activeOrder.tolerancePercent : 1.5
            } : eq.activeOrder;

            if (eq.id === 'eq-1') {
              return {
                ...eq,
                activeOrder,
                name: 'A爐連續式滲碳爐',
                shortName: eq.shortName === '設備 #1' || !eq.shortName ? 'A爐' : eq.shortName
              };
            }
            if (eq.id === 'eq-2') {
              return {
                ...eq,
                activeOrder,
                name: 'B爐連續式滲碳爐',
                shortName: eq.shortName === '設備 #2' || !eq.shortName ? 'B爐' : eq.shortName
              };
            }
            if (eq.id === 'eq-3') {
              return {
                ...eq,
                activeOrder,
                name: 'C爐連續式滲碳爐',
                shortName: eq.shortName === '設備 #3' || !eq.shortName ? 'C爐' : eq.shortName
              };
            }
            return { ...eq, activeOrder };
          });
        }
      } catch {}
    }
    return DEFAULT_EQUIPMENT_LINES;
  });

  // 2. Currently selected/focused equipment line for the scale workstation
  const [activeEquipmentId, setActiveEquipmentId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_EQ);
    return saved || 'eq-1';
  });

  // 3. Saved History Records
  const [historyRecords, setHistoryRecords] = useState<FinalizedReceivingRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  // 4. Modal Dialog States
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scanTargetEqId, setScanTargetEqId] = useState<string | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // 5. Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LINES, JSON.stringify(equipmentLines));
  }, [equipmentLines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_EQ, activeEquipmentId);
  }, [activeEquipmentId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyRecords));
  }, [historyRecords]);

  // Current active equipment line
  const activeEquipment: EquipmentLine = useMemo(() => {
    return equipmentLines.find(e => e.id === activeEquipmentId) || equipmentLines[0];
  }, [equipmentLines, activeEquipmentId]);

  // Current order and weighings derived from active equipment
  const currentOrder = activeEquipment.activeOrder;
  const weighings = activeEquipment.weighings;

  // Total Weighed Net Weight for current equipment
  const totalWeighedNet = useMemo(() => {
    if (weighings.length === 0) return 0;
    return weighings[weighings.length - 1].cumulativeWeight;
  }, [weighings]);

  // Compute Full Comparison Result for current equipment
  const comparison = useMemo(() => {
    return calculateWeightComparison(
      currentOrder.expectedWeight,
      totalWeighedNet,
      currentOrder.tolerancePercent
    );
  }, [currentOrder.expectedWeight, currentOrder.tolerancePercent, totalWeighedNet]);

  // Add a new scale weighing reading to the active equipment line
  const handleAddWeighing = (grossWeight: number, tareWeight: number, containerType: string) => {
    const gross = roundToHalfKg(grossWeight);
    const tare = roundToHalfKg(tareWeight);
    const netWeight = Math.max(0, roundToHalfKg(gross - tare));
    const prevCumulative = weighings.length > 0 ? weighings[weighings.length - 1].cumulativeWeight : 0;
    const newCumulative = roundToHalfKg(prevCumulative + netWeight);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newItem: WeighingItem = {
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemNumber: weighings.length + 1,
      grossWeight: gross,
      tareWeight: tare,
      netWeight,
      cumulativeWeight: newCumulative,
      timestamp: timeStr,
      containerType
    };

    setEquipmentLines(prev => prev.map(line => {
      if (line.id === activeEquipmentId) {
        return {
          ...line,
          weighings: [...line.weighings, newItem]
        };
      }
      return line;
    }));
  };

  // Delete a weighing item and recalculate all cumulative totals for active equipment
  const handleDeleteWeighing = (id: string) => {
    setEquipmentLines(prev => prev.map(line => {
      if (line.id === activeEquipmentId) {
        const filtered = line.weighings.filter(w => w.id !== id);
        let runningCumulative = 0;
        const recalculated = filtered.map((item, index) => {
          runningCumulative = roundToHalfKg(runningCumulative + item.netWeight);
          return {
            ...item,
            itemNumber: index + 1,
            cumulativeWeight: runningCumulative
          };
        });
        return {
          ...line,
          weighings: recalculated
        };
      }
      return line;
    }));
  };

  // Clear all weighings on active equipment
  const handleClearAll = () => {
    setEquipmentLines(prev => prev.map(line => {
      if (line.id === activeEquipmentId) {
        return {
          ...line,
          weighings: []
        };
      }
      return line;
    }));
  };

  // Switch Order (from QR Scanner) for a designated or active equipment
  const handleSelectOrder = (order: ScrewOrder) => {
    const targetId = scanTargetEqId || activeEquipmentId;

    setEquipmentLines(prev => prev.map(line => {
      if (line.id === targetId) {
        return {
          ...line,
          activeOrder: order,
          weighings: []
        };
      }
      return line;
    }));

    setActiveEquipmentId(targetId);
    setScanTargetEqId(null);
    showToast(`已成功為設備載入工單：${order.customerName} (${order.id})`);
  };

  // Update tolerance on active order
  const handleUpdateTolerance = (tol: number) => {
    setEquipmentLines(prev => prev.map(line => {
      if (line.id === activeEquipmentId) {
        return {
          ...line,
          activeOrder: {
            ...line.activeOrder,
            tolerancePercent: tol
          }
        };
      }
      return line;
    }));
  };

  // Save finalized receiving record to history
  const handleSaveRecord = () => {
    const record: FinalizedReceivingRecord = {
      id: `REC-${Date.now().toString().slice(-6)}`,
      order: currentOrder,
      weighings,
      totalWeighed: totalWeighedNet,
      comparison,
      completedAt: new Date().toLocaleString('zh-TW'),
      operator: activeEquipment.operator,
      scaleId: activeEquipment.scaleName,
      equipmentId: activeEquipment.id,
      equipmentName: `${activeEquipment.shortName} (${activeEquipment.name})`
    };

    setHistoryRecords(prev => [record, ...prev]);
    showToast(`已成功保存【${activeEquipment.shortName}】收料過磅存檔！`);
  };

  // CORE USER REQUIREMENT: Finish Order & Scan Next
  // "新增該筆訂單完成後要設定一個完成按鍵並掃描下一筆資料，而且同時間有三台設備在產出。"
  const handleCompleteAndScanNext = (equipmentId?: string) => {
    const targetId = equipmentId || activeEquipmentId;
    const targetLine = equipmentLines.find(l => l.id === targetId);

    if (!targetLine) return;

    // If this equipment line already has weighings, automatically finalize and save to history
    if (targetLine.weighings.length > 0) {
      const lineTotal = targetLine.weighings[targetLine.weighings.length - 1].cumulativeWeight;
      const lineComparison = calculateWeightComparison(
        targetLine.activeOrder.expectedWeight,
        lineTotal,
        targetLine.activeOrder.tolerancePercent
      );

      const record: FinalizedReceivingRecord = {
        id: `REC-${Date.now().toString().slice(-6)}`,
        order: targetLine.activeOrder,
        weighings: [...targetLine.weighings],
        totalWeighed: lineTotal,
        comparison: lineComparison,
        completedAt: new Date().toLocaleString('zh-TW'),
        operator: targetLine.operator,
        scaleId: targetLine.scaleName,
        equipmentId: targetLine.id,
        equipmentName: `${targetLine.shortName} (${targetLine.name})`
      };

      setHistoryRecords(prev => [record, ...prev]);
      sounds.beepSuccess();

      // Clear the finished line's weighings
      setEquipmentLines(prev => prev.map(line => {
        if (line.id === targetId) {
          return {
            ...line,
            weighings: []
          };
        }
        return line;
      }));

      showToast(`已完成【${targetLine.shortName}】工單過磅並存檔！請立即掃描下一筆工單。`);
    } else {
      showToast(`已為【${targetLine.shortName}】開啟掃描器，請載入下一筆工單。`);
    }

    // Switch focus to this equipment and open scanner
    setActiveEquipmentId(targetId);
    setScanTargetEqId(targetId);
    setIsScannerOpen(true);
  };

  // One-click quick simulation of full order containers for an equipment line
  const handleSimulateForEquipment = (targetId: string) => {
    const targetLine = equipmentLines.find(l => l.id === targetId);
    if (!targetLine) return;

    const order = targetLine.activeOrder;
    const targetNet = order.expectedWeight;
    const containerCount = order.expectedContainers || Math.max(8, Math.round(targetNet / 25));
    const tare = 10.0; // Standard iron drum (10 kg)
    
    const baseBucket = roundToHalfKg(targetNet / containerCount);
    let accumulated = 0;
    const simulatedList: WeighingItem[] = [];

    for (let i = 1; i <= containerCount; i++) {
      let bucketNet: number;
      if (i === containerCount) {
        const remaining = targetNet - accumulated;
        // Keep within 1.5% tolerance
        const smallJitter = (Math.random() - 0.5) * (targetNet * 0.005);
        bucketNet = Math.max(0.5, roundToHalfKg(remaining + smallJitter));
      } else {
        const jitter = (Math.random() - 0.5) * 1.5;
        bucketNet = Math.max(0.5, roundToHalfKg(baseBucket + jitter));
      }

      accumulated = roundToHalfKg(accumulated + bucketNet);
      const gross = roundToHalfKg(bucketNet + tare);
      
      const time = new Date(Date.now() - (containerCount - i) * 65000);
      const timeStr = time.toTimeString().split(' ')[0];

      simulatedList.push({
        id: `sim-${i}-${Date.now()}`,
        itemNumber: i,
        grossWeight: gross,
        tareWeight: tare,
        netWeight: bucketNet,
        cumulativeWeight: accumulated,
        timestamp: timeStr,
        containerType: '標準鐵桶'
      });
    }

    setEquipmentLines(prev => prev.map(line => {
      if (line.id === targetId) {
        return {
          ...line,
          weighings: simulatedList
        };
      }
      return line;
    }));

    sounds.beepSuccess();
    showToast(`已為【${targetLine.shortName}】模擬完成整單過磅！判定：符合重量`);
  };

  const targetEqForModal = scanTargetEqId 
    ? equipmentLines.find(e => e.id === scanTargetEqId) 
    : activeEquipment;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 shadow-2xl backdrop-blur">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Global Navigation Bar */}
      <Navbar
        onOpenScanner={() => {
          setScanTargetEqId(activeEquipmentId);
          setIsScannerOpen(true);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSlip={() => setIsSlipOpen(true)}
        hasWeighings={weighings.length > 0}
        orderId={currentOrder?.id}
        activeEquipmentName={activeEquipment.shortName}
      />

      {/* 2. Main Workstation Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* CORE REQUIREMENT: 3-Equipment Concurrent Production Monitor Bar */}
        <EquipmentMonitorBar
          equipmentLines={equipmentLines}
          activeEquipmentId={activeEquipmentId}
          onSelectEquipment={setActiveEquipmentId}
          onCompleteAndScanNext={handleCompleteAndScanNext}
          onQuickSimulate={handleSimulateForEquipment}
        />

        {/* 3. Core Requirement Part 1: Order Information Card (入貨日期、客戶名稱、螺絲規格、入貨重量) */}
        <OrderInfoCard
          order={currentOrder}
          onOpenScanner={() => {
            setScanTargetEqId(activeEquipmentId);
            setIsScannerOpen(true);
          }}
          onUpdateTolerance={handleUpdateTolerance}
          equipmentName={`${activeEquipment.shortName} (${activeEquipment.name})`}
          onCompleteAndScanNext={() => handleCompleteAndScanNext(activeEquipment.id)}
        />

        {/* 4. Core Requirement Part 2 & 3: Direct Scale Input + Weight Summation & Compliance Judgment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (6 cols on lg): Scale Reading Direct Input Panel */}
          <div className="lg:col-span-6 flex flex-col">
            <ScaleInputPanel
              onAddWeighing={handleAddWeighing}
              currentContainerNumber={weighings.length + 1}
              totalWeighedSoFar={totalWeighedNet}
              expectedTotalWeight={currentOrder.expectedWeight}
              expectedContainers={currentOrder.expectedContainers}
            />
          </div>

          {/* Right Column (6 cols on lg): Real-Time Weight Summation & Compliance Comparison */}
          <div className="lg:col-span-6 flex flex-col">
            <WeightComparisonCard
              comparison={comparison}
              containerCount={weighings.length}
              expectedContainers={currentOrder.expectedContainers}
              onCompleteAndScanNext={() => handleCompleteAndScanNext(activeEquipment.id)}
              equipmentName={activeEquipment.shortName}
            />
          </div>

        </div>

        {/* 5. Detailed Weighing Log Table */}
        <WeighingLogTable
          weighings={weighings}
          onDeleteWeighing={handleDeleteWeighing}
          onClearAll={handleClearAll}
          onSimulateAll={() => handleSimulateForEquipment(activeEquipmentId)}
          expectedWeight={currentOrder.expectedWeight}
          expectedContainers={currentOrder.expectedContainers}
          onCompleteAndScanNext={() => handleCompleteAndScanNext(activeEquipment.id)}
        />

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>{t('app.title')} • {t('monitor.title')} • FASTENER SCALE VERIFICATION</div>
          <div>{t('monitor.completeAndScan')}</div>
        </div>
      </footer>

      {/* MODAL 1: QR Code Scanner & Sample Selector */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false);
          setScanTargetEqId(null);
        }}
        onSelectOrder={handleSelectOrder}
        currentOrder={currentOrder}
        targetEquipmentName={targetEqForModal ? `${targetEqForModal.shortName} (${targetEqForModal.name})` : undefined}
      />

      {/* MODAL 2: Printable Receiving Slip */}
      <ReceivingSummaryModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        order={currentOrder}
        weighings={weighings}
        comparison={comparison}
        onSaveRecord={handleSaveRecord}
        equipmentName={`${activeEquipment.shortName} (${activeEquipment.name})`}
        onCompleteAndScanNext={() => handleCompleteAndScanNext(activeEquipment.id)}
      />

      {/* MODAL 3: Saved History Records */}
      <HistoryRecordsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={historyRecords}
        onClearHistory={() => setHistoryRecords([])}
        onSelectHistoryRecord={(rec) => {
          setEquipmentLines(prev => prev.map(line => {
            if (line.id === activeEquipmentId) {
              return {
                ...line,
                activeOrder: rec.order,
                weighings: rec.weighings
              };
            }
            return line;
          }));
        }}
      />

    </div>
  );
}
