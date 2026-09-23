export interface ScrewOrder {
  id: string;              // 訂單編號 (e.g. WO-20250518-001)
  batchNo: string;         // 爐批號 / 客戶批號 (e.g. HT-25B088)
  date: string;            // 入貨日期 (e.g. 2025-05-18)
  customerName: string;    // 客戶名稱 (e.g. 晉禾企業股份有限公司)
  screwSpec: string;       // 螺絲規格 (e.g. M6 x 25 圓頭十字 10B21)
  expectedWeight: number;  // 入貨重量 (kg, e.g. 520.0)
  expectedContainers?: number; // 預計桶/箱數 (e.g. 26 桶)
  material?: string;       // 線材材質 (e.g. 10B21 / SCM435 / SUS410)
  heatTreatmentType?: string; // 熱處理工藝 (e.g. 滲碳淬火硬化 / 調質處理)
  hardnessRequirement?: string; // 硬度要求 (e.g. HRC 32-39, 芯部 HV 300)
  tolerancePercent: number; // 允收公差百分比 (例如 1.0 代表 ±1.0%)
  remarks?: string;        // 備註說明
}

export interface WeighingItem {
  id: string;
  itemNumber: number;      // 桶號/箱號 (第幾桶)
  grossWeight: number;     // 磅秤顯示數值 (毛重, kg)
  tareWeight: number;      // 扣重 (空籃/空桶重, kg)
  netWeight: number;       // 當筆實重 / 淨重 (kg)
  cumulativeWeight: number;// 累計總重 (kg)
  timestamp: string;       // 過磅時間
  containerType?: string;  // 容器類型 (鐵桶/膠籃/木箱)
}

export type ComplianceStatus = 
  | 'PENDING'      // 尚未開始過磅
  | 'WEIGHING'     // 過磅進行中 (未達應收重量門檻)
  | 'MATCH'        // 完全符合/合格 (在允收公差內)
  | 'UNDERWEIGHT'  // 重量不足 (超出負公差)
  | 'OVERWEIGHT';  // 重量超重 (超出正公差)

export interface WeightComparisonResult {
  expectedWeight: number;
  totalWeighed: number;
  difference: number;           // totalWeighed - expectedWeight
  differencePercent: number;    // (difference / expectedWeight) * 100
  completionPercent: number;    // (totalWeighed / expectedWeight) * 100
  toleranceKg: number;          // expectedWeight * (tolerancePercent / 100)
  minAcceptable: number;
  maxAcceptable: number;
  status: ComplianceStatus;
  statusLabel: string;
  statusColor: string;
}

export interface EquipmentLine {
  id: string;               // 'eq-1' | 'eq-2' | 'eq-3'
  lineNo: number;           // 1, 2, 3
  name: string;             // 設備名稱 (e.g. A爐連續式滲碳爐 / B爐連續式滲碳爐 / C爐連續式滲碳爐)
  shortName: string;        // 簡稱 (e.g. A爐 / B爐 / C爐)
  scaleName: string;        // 對應磅秤 (e.g. 電子地磅 #01)
  activeOrder: ScrewOrder;  // 當前產出/過磅訂單
  weighings: WeighingItem[];// 當前過磅明細
  operator: string;         // 現場負責人員
}

export interface FinalizedReceivingRecord {
  id: string;
  order: ScrewOrder;
  weighings: WeighingItem[];
  totalWeighed: number;
  comparison: WeightComparisonResult;
  completedAt: string;
  operator: string;
  scaleId: string;
  equipmentId?: string;
  equipmentName?: string;
  notes?: string;
}
