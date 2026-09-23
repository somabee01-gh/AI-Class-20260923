import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../i18n/LanguageContext';

interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'zh-TW', label: '繁體中文', nativeLabel: '繁體中文 (台灣)', flag: '🇹🇼' },
  { code: 'vi', label: 'Tiếng Việt', nativeLabel: 'Tiếng Việt (Việt Nam)', flag: '🇻🇳' },
  { code: 'id', label: 'Indonesia', nativeLabel: 'Bahasa Indonesia', flag: '🇮🇩' },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = LANGUAGE_OPTIONS.find(opt => opt.code === language) || LANGUAGE_OPTIONS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="language-selector-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 hover:border-slate-600 transition cursor-pointer text-xs font-semibold shadow-sm"
        title="切換語言 / Chọn ngôn ngữ / Pilih Bahasa"
      >
        <span className="text-base leading-none">{currentOption.flag}</span>
        <span className="hidden sm:inline text-xs">{currentOption.label}</span>
        <Globe className="w-3.5 h-3.5 text-amber-400 sm:hidden" />
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-slate-900 border border-slate-700/90 shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
            語言選擇 / Ngôn ngữ / Bahasa
          </div>
          <div className="py-1">
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLanguage(opt.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{opt.flag}</span>
                    <div>
                      <div className="leading-tight">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{opt.nativeLabel}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
