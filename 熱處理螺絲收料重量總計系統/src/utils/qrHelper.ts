import QRCode from 'qrcode';
import { ScrewOrder } from '../types';
import { INITIAL_ORDERS } from '../data/mockOrders';

/**
 * Format order into compact QR payload
 */
export function encodeOrderToQrPayload(order: ScrewOrder): string {
  // Use structured JSON for robust parsing
  const payload = {
    type: 'HT_SCREW_ORDER',
    id: order.id,
    batch: order.batchNo,
    date: order.date,
    customer: order.customerName,
    spec: order.screwSpec,
    weight: order.expectedWeight,
    containers: order.expectedContainers || 0,
    material: order.material || '',
    process: order.heatTreatmentType || '',
    hardness: order.hardnessRequirement || '',
    tol: order.tolerancePercent || 1.0,
    remarks: order.remarks || ''
  };
  return JSON.stringify(payload);
}

/**
 * Parse scanned QR string into ScrewOrder
 */
export function decodeQrPayloadToOrder(qrText: string): ScrewOrder | null {
  const cleanText = qrText.trim();
  if (!cleanText) return null;

  // 1. Try JSON parsing
  try {
    const data = JSON.parse(cleanText);
    if (data.id && (data.customer || data.customerName)) {
      return {
        id: data.id,
        batchNo: data.batch || data.batchNo || 'HT-BATCH-01',
        date: data.date || new Date().toISOString().split('T')[0],
        customerName: data.customer || data.customerName || '未知客戶',
        screwSpec: data.spec || data.screwSpec || '未指定螺絲規格',
        expectedWeight: Number(data.weight || data.expectedWeight || 0),
        expectedContainers: data.containers ? Number(data.containers) : undefined,
        material: data.material || undefined,
        heatTreatmentType: data.process || data.heatTreatmentType || undefined,
        hardnessRequirement: data.hardness || data.hardnessRequirement || undefined,
        tolerancePercent: Number(data.tol || data.tolerancePercent || 1.0),
        remarks: data.remarks || undefined
      };
    }
  } catch {
    // Not standard JSON, proceed to other formats
  }

  // 2. Try pipe-delimited format:
  // ORDER_NO | DATE | CUSTOMER | SPEC | WEIGHT | BATCH | TOLERANCE
  if (cleanText.includes('|')) {
    const parts = cleanText.split('|').map(p => p.trim());
    if (parts.length >= 5) {
      return {
        id: parts[0] || `WO-${Date.now()}`,
        date: parts[1] || new Date().toISOString().split('T')[0],
        customerName: parts[2] || '客戶名稱',
        screwSpec: parts[3] || '螺絲規格',
        expectedWeight: parseFloat(parts[4]) || 0,
        batchNo: parts[5] || 'HT-AUTO-01',
        tolerancePercent: parts[6] ? parseFloat(parts[6]) : 1.0
      };
    }
  }

  // 3. Try matching against existing mock orders by Order ID or Batch
  const matched = INITIAL_ORDERS.find(
    o => o.id.toLowerCase() === cleanText.toLowerCase() || 
         o.batchNo.toLowerCase() === cleanText.toLowerCase()
  );
  if (matched) {
    return matched;
  }

  // 4. Try key-value format (Date: ... Customer: ... Spec: ... Weight: ...)
  const dateMatch = cleanText.match(/(?:入貨日期|日期|Date)[:：]\s*([\d\-/]+)/i);
  const customerMatch = cleanText.match(/(?:客戶名稱|客戶|Customer)[:：]\s*([^\n,;|]+)/i);
  const specMatch = cleanText.match(/(?:螺絲規格|規格|Spec)[:：]\s*([^\n,;|]+)/i);
  const weightMatch = cleanText.match(/(?:入貨重量|重量|Weight)[:：]\s*([\d.]+)/i);

  if (customerMatch || specMatch || weightMatch) {
    return {
      id: `WO-${Date.now().toString().slice(-6)}`,
      batchNo: `HT-${Date.now().toString().slice(-4)}`,
      date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
      customerName: customerMatch ? customerMatch[1].trim() : '現場入庫客戶',
      screwSpec: specMatch ? specMatch[1].trim() : '現場手動規格',
      expectedWeight: weightMatch ? parseFloat(weightMatch[1]) : 100,
      tolerancePercent: 1.0
    };
  }

  return null;
}

/**
 * Generate QR code as Data URL for canvas/img display
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

/**
 * Industrial Web Audio sound effects
 */
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Scan QR beep (clean dual tone)
  beepScan() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  // Weight entry added (solid click/beep)
  beepAdd() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Compliance Pass (pleasant chord)
  beepSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.35);
      });
    } catch {}
  }

  // Weight warning (low double alert)
  beepWarning() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      [350, 300].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.14);
      });
    } catch {}
  }
}

export const sounds = new SoundEffects();
