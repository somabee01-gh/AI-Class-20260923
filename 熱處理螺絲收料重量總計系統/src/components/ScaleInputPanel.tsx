import React, { useState, useRef, useEffect } from 'react';
import { 
  Scale, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Layers, 
  CornerDownLeft, 
  Sparkles, 
  Check, 
  AlertTriangle,
  Radio,
  ArrowRight
} from 'lucide-react';
import { CONTAINER_PRESETS } from '../data/mockOrders';
import { sounds } from '../utils/qrHelper';
import { formatWeight, roundToHalfKg, isValidWeightInputString } from '../utils/weightCalculator';
import { useLanguage } from '../i18n/LanguageContext';

interface ScaleInputPanelProps {
  onAddWeighing: (grossWeight: number, tareWeight: number, containerType: string) => void;
  currentContainerNumber: number;
  totalWeighedSoFar: number;
  expectedTotalWeight: number;
  expectedContainers?: number;
}

export const ScaleInputPanel: React.FC<ScaleInputPanelProps> = ({
  onAddWeighing,
  currentContainerNumber,
  totalWeighedSoFar,
  expectedTotalWeight,
  expectedContainers
}) => {
  const { t } = useLanguage();
  const [readingInput, setReadingInput] = useState<string>('');
  const [selectedTare, setSelectedTare] = useState<number>(10.0); // Default to standard iron drum 10kg
  const [selectedContainerName, setSelectedContainerName] = useState<string>('標準鐵桶');
  const [customTare, setCustomTare] = useState<string>('');
  const [isCustomTare, setIsCustomTare] = useState<boolean>(false);
  const [scaleStatus, setScaleStatus] = useState<'STABLE' | 'HOLD'>('STABLE');

  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on scale input for seamless barcode scanner / numpad entry
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentContainerNumber]);

  const rawGross = parseFloat(readingInput) || 0;
  const currentGross = roundToHalfKg(rawGross);
  const rawTare = isCustomTare ? (parseFloat(customTare) || 0) : selectedTare;
  const activeTare = roundToHalfKg(rawTare);
  const currentNet = Math.max(0, roundToHalfKg(currentGross - activeTare));

  const getContainerTranslatedName = (id: string, defaultName: string) => {
    if (id === 'std_iron_drum') return t('scale.preset.iron');
    if (id === 'mid_boat_drum') return t('scale.preset.midBoat');
    if (id === 'large_boat_drum') return t('scale.preset.largeBoat');
    if (id === 'xlarge_boat_drum') return t('scale.preset.xlargeBoat');
    if (id === 'none') return t('scale.preset.none');
    return defaultName;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (isValidWeightInputString(val)) {
      setReadingInput(val);
    }
  };

  const handleAdd = () => {
    const parsed = parseFloat(readingInput);
    if (isNaN(parsed) || parsed <= 0) {
      inputRef.current?.focus();
      return;
    }
    const finalGross = roundToHalfKg(parsed);
    const finalTare = roundToHalfKg(activeTare);
    sounds.beepAdd();
    const containerLabel = isCustomTare ? `自訂容器 (扣${finalTare.toFixed(1)}kg)` : selectedContainerName;
    onAddWeighing(finalGross, finalTare, containerLabel);
    setReadingInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
      return;
    }
    // Block non-allowed character keys when typing after decimal point
    if (
      !e.ctrlKey && !e.metaKey && !e.altKey &&
      e.key.length === 1 &&
      /^[0-9.]$/.test(e.key)
    ) {
      const input = e.currentTarget;
      const start = input.selectionStart ?? readingInput.length;
      const end = input.selectionEnd ?? readingInput.length;
      const nextVal = readingInput.slice(0, start) + e.key + readingInput.slice(end);
      if (!isValidWeightInputString(nextVal)) {
        e.preventDefault();
      }
    }
  };

  const handleNumpadPress = (char: string) => {
    if (char === 'C') {
      setReadingInput('');
    } else if (char === 'BACK') {
      setReadingInput(prev => prev.slice(0, -1));
    } else if (char === '.0') {
      setReadingInput(prev => {
        if (!prev) return '0.0';
        const intPart = prev.split('.')[0] || '0';
        return `${intPart}.0`;
      });
    } else if (char === '.5') {
      setReadingInput(prev => {
        if (!prev) return '0.5';
        const intPart = prev.split('.')[0] || '0';
        return `${intPart}.5`;
      });
    } else if (char === '.') {
      setReadingInput(prev => {
        if (prev.includes('.')) return prev;
        return prev === '' ? '0.' : `${prev}.`;
      });
    } else {
      setReadingInput(prev => {
        const next = prev + char;
        return isValidWeightInputString(next) ? next : prev;
      });
    }
    inputRef.current?.focus();
  };

  // Simulation: Quick test button that suggests realistic bucket weight based on remaining expected weight
  const handleSimulateOneBucket = () => {
    const remaining = expectedTotalWeight - totalWeighedSoFar;
    const remainingBuckets = expectedContainers 
      ? Math.max(1, expectedContainers - (currentContainerNumber - 1))
      : 10;
    
    // Average bucket net
    const avgNet = remaining > 0 ? (remaining / remainingBuckets) : 25;
    // Add realistic factory scale noise
    const jitter = (Math.random() - 0.5) * 1.0;
    const rawNet = Math.max(1, avgNet + jitter);
    const simulatedNet = roundToHalfKg(rawNet);
    const simulatedGross = roundToHalfKg(simulatedNet + activeTare);

    setReadingInput(simulatedGross.toFixed(1));
    inputRef.current?.focus();
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      
      {/* Scale Panel Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 px-5 py-3 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {t('scale.title')}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-amber-300 font-mono">
                {t('scale.currentBucket', { num: currentContainerNumber })}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {t('scale.desc')}
            </p>
          </div>
        </div>

        {/* Live Scale Indicator */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            STABLE
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5 flex-1 flex flex-col justify-between">
        
        {/* TOP: Scale Digital Display (High-Contrast Industrial Terminal) */}
        <div className="relative rounded-2xl bg-black/90 p-5 border-2 border-slate-700 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-mono font-semibold tracking-wider">
                DIGITAL SCALE INDICATOR
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">
                {t('scale.tareWeight')}: <span className="text-amber-300 font-bold">{selectedContainerName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                .0 / .5 專用
              </span>
              <span className="font-mono text-slate-400">
                Tare: -{activeTare.toFixed(1)} kg
              </span>
            </div>
          </div>

          {/* Large Scale Display Input */}
          <div className="relative flex items-center">
            <input
              id="scale-reading-input"
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={readingInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="0.0"
              className="w-full bg-transparent text-right text-4xl sm:text-5xl font-black font-mono tracking-tight text-amber-400 placeholder:text-slate-700 focus:outline-none focus:text-amber-300 pr-14 select-all"
            />
            <span className="absolute right-0 text-xl sm:text-2xl font-black text-amber-500/80 font-mono">
              kg
            </span>
          </div>

          {/* Net Weight Breakdown Live Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4 text-slate-400">
              <span>{t('scale.grossWeight')}: <strong className="text-slate-200">{rawGross > 0 ? currentGross.toFixed(1) : '0.0'}</strong> kg</span>
              <span>-</span>
              <span>{t('scale.tareWeight')}: <strong className="text-rose-400">{activeTare.toFixed(1)}</strong> kg</span>
              <span>=</span>
              <span className="text-emerald-300 font-bold text-sm bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                {t('scale.netWeight')}: {currentNet.toFixed(1)} kg
              </span>
            </div>

            {/* Quick Helper to simulate this bucket */}
            <button
              type="button"
              onClick={handleSimulateOneBucket}
              className="text-amber-400 hover:text-amber-300 text-[11px] underline flex items-center gap-1 cursor-pointer transition"
            >
              <Sparkles className="w-3 h-3" />
              <span>{t('scale.quickValues')}</span>
            </button>
          </div>
        </div>

        {/* MIDDLE: Container Tare Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              {t('scale.quickPresets')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {CONTAINER_PRESETS.map((preset) => {
              const displayName = getContainerTranslatedName(preset.id, preset.name);
              const isSelected = !isCustomTare && selectedTare === preset.weight && selectedContainerName === preset.name;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setIsCustomTare(false);
                    setSelectedTare(preset.weight);
                    setSelectedContainerName(preset.name);
                    inputRef.current?.focus();
                  }}
                  className={`p-2 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/70 ring-1 ring-amber-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-850 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="truncate">{displayName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                    {preset.weight > 0 ? `-${preset.weight.toFixed(1)} kg` : t('scale.preset.none')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Tare Toggle */}
          <div className="flex items-center gap-2 pt-1 text-xs">
            <label className="text-slate-400 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isCustomTare}
                onChange={(e) => {
                  setIsCustomTare(e.target.checked);
                  inputRef.current?.focus();
                }}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 bg-slate-900"
              />
              <span>{t('order.customTol')} Tare:</span>
            </label>
            {isCustomTare && (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={customTare}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    if (isValidWeightInputString(v)) {
                      setCustomTare(v);
                    }
                  }}
                  placeholder="0.0"
                  className="w-20 bg-slate-900 border border-amber-500 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none"
                />
                <span className="text-slate-400 font-mono">kg</span>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM: Action Controls + Touch Numpad */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          
          {/* Touch Screen Numpad */}
          <div className="md:col-span-7 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-mono mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span>NUMPAD</span>
                <span className="text-amber-400 font-semibold">• 小數點限 .0 或 .5</span>
              </span>
              <span className="text-slate-500">[Enter]</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {['7', '8', '9', 'C', '4', '5', '6', 'BACK', '1', '2', '3', '.0', '0', '.', '.5', '+20'].map((btn) => {
                const isSpecial = btn === 'C' || btn === 'BACK';
                const isPointDigit = btn === '.0' || btn === '.5';
                const isQuickAdd = btn === '+20';
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (isQuickAdd) {
                        const cur = parseFloat(readingInput || '0');
                        const next = roundToHalfKg(cur + 20);
                        setReadingInput(next.toFixed(1));
                      } else {
                        handleNumpadPress(btn);
                      }
                    }}
                    className={`py-2 rounded-lg text-sm font-mono font-bold transition active:scale-95 cursor-pointer ${
                      btn === 'C'
                        ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 border border-rose-800/40'
                        : btn === 'BACK'
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        : isPointDigit
                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/50 shadow-sm'
                        : isQuickAdd
                        ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-500/30 text-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80'
                    }`}
                  >
                    {btn === 'BACK' ? '←' : btn === 'C' ? 'C' : btn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Large "+ 加入總計 (Enter)" Button */}
          <div className="md:col-span-5 flex flex-col justify-between gap-2">
            <button
              id="add-weighing-btn"
              type="button"
              onClick={handleAdd}
              disabled={rawGross <= 0}
              className={`w-full flex-1 min-h-[72px] rounded-xl flex flex-col items-center justify-center p-3 text-center transition active:scale-[0.98] cursor-pointer shadow-lg ${
                rawGross > 0
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-amber-500/25 ring-2 ring-amber-400'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>{t('scale.confirmAdd', { num: currentContainerNumber })}</span>
              </div>
              <div className="text-xs font-mono font-semibold opacity-90 mt-0.5 flex items-center gap-1">
                <span>[ Enter ]</span>
                {currentNet > 0 && <span>• Net +{currentNet.toFixed(1)} kg</span>}
              </div>
            </button>

            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 text-center font-mono">
              {t('scale.estCumulative', { weight: roundToHalfKg(totalWeighedSoFar + currentNet).toFixed(1) })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
