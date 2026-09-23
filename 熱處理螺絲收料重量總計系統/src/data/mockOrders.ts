import { ScrewOrder } from '../types';

export const INITIAL_ORDERS: ScrewOrder[] = [
  {
    id: 'WO-20250518-01',
    batchNo: 'HT-25B088-A',
    date: '2025-05-18',
    customerName: '晉禾企業股份有限公司',
    screwSpec: 'M6 × 25mm 圓頭十字自攻螺絲 (10B21)',
    expectedWeight: 520.0,
    expectedContainers: 26,
    material: '10B21 硼鋼',
    heatTreatmentType: '滲碳淬火 (Carburizing)',
    hardnessRequirement: '表面 HRC 45~50 / 心部 HRC 32~39',
    tolerancePercent: 1.5,
    remarks: '出口歐美外銷單，入料前務必核對桶數與過磅淨重'
  },
  {
    id: 'WO-20250518-02',
    batchNo: 'HT-25B089-K',
    date: '2025-05-18',
    customerName: '春雨工廠股份有限公司',
    screwSpec: '5/16-18 × 1-1/2" 六角法蘭面螺栓 8.8級',
    expectedWeight: 840.5,
    expectedContainers: 28,
    material: 'SCM435 鉻鉬鋼',
    heatTreatmentType: '調質淬火+回火 (Quench & Temper)',
    hardnessRequirement: 'HRC 28~34 / 抗拉強度 ≥ 800 MPa',
    tolerancePercent: 1.5,
    remarks: '重型機具專用螺栓，禁止油污混入'
  },
  {
    id: 'WO-20250518-03',
    batchNo: 'HT-25B090-S',
    date: '2025-05-19',
    customerName: '世豐螺絲股份有限公司',
    screwSpec: '#8 × 1-1/4" 喇叭頭黑化細牙乾牆釘',
    expectedWeight: 320.0,
    expectedContainers: 16,
    material: 'SAE 1022 低碳鋼',
    heatTreatmentType: '滲碳表面硬化處理',
    hardnessRequirement: '表面硬度 HV 550 min / 心部 HV 280-360',
    tolerancePercent: 1.5,
    remarks: '木工乾牆釘，檢查防鏽防潮包裝'
  },
  {
    id: 'WO-20250518-04',
    batchNo: 'HT-25B091-T',
    date: '2025-05-19',
    customerName: '恆耀工業股份有限公司',
    screwSpec: 'M10 × 1.25 × 45mm 汽車底盤高張力輪轂螺栓 10.9級',
    expectedWeight: 1150.0,
    expectedContainers: 46,
    material: 'SCM440 合金結構鋼',
    heatTreatmentType: '高溫連續式網帶爐調質',
    hardnessRequirement: 'HRC 33~39 / 脫碳層 ≤ 0.015mm',
    tolerancePercent: 1.5,
    remarks: 'Tier-1 汽車安全件，允收公差 ±1.5%'
  },
  {
    id: 'WO-20250518-05',
    batchNo: 'HT-25B092-B',
    date: '2025-05-20',
    customerName: '安億螺絲工業社',
    screwSpec: 'M4 × 12mm 沉頭內梅花不銹鋼熱處理螺釘',
    expectedWeight: 180.0,
    expectedContainers: 12,
    material: 'SUS410 馬氏體不銹鋼',
    heatTreatmentType: '真空光輝淬火 + 低溫回火',
    hardnessRequirement: 'HRC 38~42',
    tolerancePercent: 1.5,
    remarks: '電子產品精密外殼螺絲'
  }
];

export const CONTAINER_PRESETS = [
  { id: 'standard_iron_drum', name: '標準鐵桶', weight: 10.0, icon: 'Drum' },
  { id: 'medium_boat_drum', name: '中型船桶', weight: 43.0, icon: 'Box' },
  { id: 'large_boat_drum', name: '大型船桶', weight: 53.0, icon: 'Layers' },
  { id: 'xlarge_boat_drum', name: '特大型船桶', weight: 60.0, icon: 'Package' },
  { id: 'none', name: '免扣重 (淨重直讀)', weight: 0.0, icon: 'CircleSlash' },
];

export const DEFAULT_EQUIPMENT_LINES = [
  {
    id: 'eq-1',
    lineNo: 1,
    name: 'A爐連續式滲碳爐',
    shortName: 'A爐',
    scaleName: '電子地磅 #01 (入料A台)',
    activeOrder: INITIAL_ORDERS[0], // 晉禾企業 520kg
    weighings: [],
    operator: '王大明 (OP-02)'
  },
  {
    id: 'eq-2',
    lineNo: 2,
    name: 'B爐連續式滲碳爐',
    shortName: 'B爐',
    scaleName: '電子地磅 #02 (入料B台)',
    activeOrder: INITIAL_ORDERS[1], // 春雨工廠 840.5kg
    weighings: [],
    operator: '陳建忠 (OP-05)'
  },
  {
    id: 'eq-3',
    lineNo: 3,
    name: 'C爐連續式滲碳爐',
    shortName: 'C爐',
    scaleName: '電子地磅 #03 (入料C台)',
    activeOrder: INITIAL_ORDERS[3], // 恆耀工業 1150kg
    weighings: [],
    operator: '林志豪 (OP-08)'
  }
];
