import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Volume2, 
  VolumeX, 
  QrCode, 
  History, 
  FileText, 
  Flame, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { sounds } from '../utils/qrHelper';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  onOpenScanner: () => void;
  onOpenHistory: () => void;
  onOpenSlip: () => void;
  hasWeighings: boolean;
  orderId?: string;
  activeEquipmentName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenScanner,
  onOpenHistory,
  onOpenSlip,
  hasWeighings,
  orderId,
  activeEquipmentName
}) => {
  const { t, language } = useLanguage();
  const [time, setTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString(language === 'vi' ? 'vi-VN' : language === 'id' ? 'id-ID' : 'zh-TW', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.beepScan();
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & System Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40 shrink-0">
            <Flame className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {t('app.title')}
              </h1>
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {t('app.tagline')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              {t('app.subtag')}
            </p>
          </div>
        </div>

        {/* Status Indicators, Action Buttons & Language Selector */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* Active Equipment Indicator */}
          {activeEquipmentName && (
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>{t('app.working', { name: activeEquipmentName })}</span>
            </div>
          )}

          {/* Scale Status Indicator */}
          <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">{t('app.online3')}</span>
          </div>

          {/* Real-time Clock */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{time}</span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            title={soundEnabled ? t('app.sound.off') : t('app.sound.on')}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled 
                ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700' 
                : 'bg-slate-800/50 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Scan QR Code Button */}
          <button
            id="open-scanner-btn"
            onClick={onOpenScanner}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
          >
            <QrCode className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">{t('app.scanQr')}</span>
          </button>

          {/* Print/View Receiving Slip */}
          <button
            id="open-slip-btn"
            onClick={onOpenSlip}
            disabled={!hasWeighings}
            title={hasWeighings ? t('app.receipt') : ''}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition ${
              hasWeighings
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer'
                : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{t('app.receipt')}</span>
          </button>

          {/* Historical Records */}
          <button
            id="open-history-btn"
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">{t('app.history')}</span>
          </button>

          {/* Right Corner: Language Selector (Top Right) */}
          <div className="pl-1 sm:pl-1.5 border-l border-slate-800">
            <LanguageSelector />
          </div>

        </div>
      </div>
    </header>
  );
};
