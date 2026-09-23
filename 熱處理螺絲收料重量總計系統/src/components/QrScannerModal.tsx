import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  Upload, 
  QrCode, 
  Check, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  Printer,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ScrewOrder } from '../types';
import { INITIAL_ORDERS } from '../data/mockOrders';
import { decodeQrPayloadToOrder, encodeOrderToQrPayload, generateQrDataUrl, sounds } from '../utils/qrHelper';
import { useLanguage } from '../i18n/LanguageContext';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: ScrewOrder) => void;
  currentOrder?: ScrewOrder;
  targetEquipmentName?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
  currentOrder,
  targetEquipmentName
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples' | 'sticker'>('camera');
  const [scannerError, setScannerError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [generatedQrMap, setGeneratedQrMap] = useState<Record<string, string>>({});
  const [selectedSampleForSticker, setSelectedSampleForSticker] = useState<ScrewOrder>(INITIAL_ORDERS[0]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pre-generate QR code images for the sample orders
  useEffect(() => {
    async function prepareSampleQrs() {
      const map: Record<string, string> = {};
      for (const ord of INITIAL_ORDERS) {
        const payload = encodeOrderToQrPayload(ord);
        const dataUrl = await generateQrDataUrl(payload);
        map[ord.id] = dataUrl;
      }
      setGeneratedQrMap(map);
    }
    prepareSampleQrs();
  }, []);

  // Initialize camera scanner when tab is camera and modal is open
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCameraScanner();
      return;
    }

    let isMounted = true;
    const scannerId = 'qr-reader-viewport';

    const startScanner = async () => {
      setScannerError('');
      try {
        const html5QrCode = new Html5Qrcode(scannerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            handleScannedResult(decodedText);
          },
          (errorMessage) => {
            // normal frame scan failures are ignored
          }
        );
        if (isMounted) setIsScanning(true);
      } catch (err: unknown) {
        console.warn('Camera start error:', err);
        if (isMounted) {
          setIsScanning(false);
          setScannerError('Camera not accessible or permission denied. Please use "Upload" or click "Sample Orders" to test.');
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCameraScanner();
    };
  }, [isOpen, activeTab]);

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error clearing scanner', e);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleScannedResult = (decodedText: string) => {
    sounds.beepScan();
    const order = decodeQrPayloadToOrder(decodedText);
    if (order) {
      stopCameraScanner();
      onSelectOrder(order);
      onClose();
    } else {
      setScannerError(`QR Code error: ${decodedText.slice(0, 50)}...`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerError('');
    try {
      const html5QrCode = new Html5Qrcode('qr-file-dummy-container', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      const result = await html5QrCode.scanFile(file, true);
      handleScannedResult(result);
    } catch (err) {
      console.error(err);
      setScannerError('Unable to detect a valid QR Code from this image.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const order = decodeQrPayloadToOrder(manualInput);
    if (order) {
      sounds.beepScan();
      onSelectOrder(order);
      onClose();
    } else {
      setScannerError('Unable to parse input into a valid order.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {t('scanner.title')}
                {targetEquipmentName && (
                  <span className="text-xs font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {targetEquipmentName}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {targetEquipmentName 
                  ? `${targetEquipmentName}: ${t('scanner.desc')}`
                  : t('scanner.desc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2 gap-2 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition cursor-pointer ${
              activeTab === 'camera'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t('scanner.cameraTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition cursor-pointer ${
              activeTab === 'samples'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t('scanner.samplesTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition cursor-pointer ${
              activeTab === 'upload'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t('scanner.uploadTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('sticker')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition cursor-pointer ${
              activeTab === 'sticker'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{t('scanner.printTab')}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Error Banner */}
          {scannerError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <p>{scannerError}</p>
              </div>
            </div>
          )}

          {/* TAB 1: Camera Scanner */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700 aspect-video max-h-[320px] flex items-center justify-center">
                <div id="qr-reader-viewport" className="w-full h-full" />
                
                {/* Visual scan frame overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-amber-400/80 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -mt-0.5 -ml-0.5"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 -mt-0.5 -mr-0.5"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -mb-0.5 -ml-0.5"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 -mb-0.5 -mr-0.5"></div>
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
                  </div>
                </div>

                {!isScanning && !scannerError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-4">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                    <p className="text-sm font-medium text-slate-200">Starting Camera...</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                <span>{t('scanner.tip')}</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('samples')}
                  className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                >
                  {t('scanner.noBarcodeHint')}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Fast Sample Orders */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                {t('scanner.noBarcodeHint')}:
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {INITIAL_ORDERS.map((ord) => {
                  const isCurrent = currentOrder?.id === ord.id;
                  const qrUrl = generatedQrMap[ord.id];
                  return (
                    <div
                      key={ord.id}
                      onClick={() => {
                        sounds.beepScan();
                        onSelectOrder(ord);
                        onClose();
                      }}
                      className={`group p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isCurrent 
                          ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40' 
                          : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {qrUrl && (
                          <img 
                            src={qrUrl} 
                            alt="QR Code" 
                            className="w-12 h-12 rounded bg-white p-0.5 shrink-0" 
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm group-hover:text-amber-300 transition">
                              {ord.customerName}
                            </span>
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                              {ord.id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5 font-medium">
                            {ord.screwSpec}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3 font-mono">
                            <span>{ord.date}</span>
                            <span>•</span>
                            <span className="text-amber-300 font-bold">
                              {ord.expectedWeight} kg
                            </span>
                            <span>•</span>
                            <span>{ord.expectedContainers} containers</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isCurrent ? (
                          <span className="text-xs px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {t('scanner.loadedBadge')}
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded bg-slate-700 text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-950 font-medium transition">
                            {t('scanner.selectOrder')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: File Upload & Manual Input */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Hidden dummy container for html5qrcode file scan */}
              <div id="qr-file-dummy-container" className="hidden" />

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-800/40 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
              >
                <div className="p-3 rounded-full bg-slate-800 text-amber-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-slate-200">
                  {t('scanner.dragDrop')}
                </div>
                <p className="text-xs text-slate-400">JPG, PNG, WEBP</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Manual String Form */}
              <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('scanner.manualInput')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. WO-20250518-01"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition cursor-pointer"
                  >
                    {t('scanner.parseBtn')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: Sticker Display / Print */}
          {activeTab === 'sticker' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Select Order Label:</label>
                <select
                  value={selectedSampleForSticker.id}
                  onChange={(e) => {
                    const found = INITIAL_ORDERS.find(o => o.id === e.target.value);
                    if (found) setSelectedSampleForSticker(found);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-md text-xs px-2.5 py-1 text-white focus:outline-none"
                >
                  {INITIAL_ORDERS.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {o.customerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fastener Heat Treatment Physical Label Mockup */}
              <div className="bg-white text-slate-900 p-5 rounded-xl border border-slate-300 shadow-md font-sans">
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 mb-3">
                  <div>
                    <div className="text-xs font-bold text-amber-700 tracking-wider">
                      ★ FASTENER HT RECEIVING TAG ★
                    </div>
                    <div className="text-base font-black text-slate-900">
                      {selectedSampleForSticker.customerName}
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-700">
                    <div>Order: <span className="font-bold text-slate-900">{selectedSampleForSticker.id}</span></div>
                    <div>Batch: {selectedSampleForSticker.batchNo}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 space-y-1 text-xs">
                    <div className="flex">
                      <span className="text-slate-500 w-24 shrink-0">Date:</span>
                      <span className="font-bold text-slate-900">{selectedSampleForSticker.date}</span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-500 w-24 shrink-0">Spec:</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedSampleForSticker.screwSpec}</span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-500 w-24 shrink-0">Weight:</span>
                      <span className="font-black text-amber-600 text-base">
                        {selectedSampleForSticker.expectedWeight} kg
                      </span>
                      <span className="ml-2 text-slate-600">({selectedSampleForSticker.expectedContainers} containers)</span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-500 w-24 shrink-0">Process:</span>
                      <span className="text-slate-800">{selectedSampleForSticker.heatTreatmentType}</span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-500 w-24 shrink-0">Tolerance:</span>
                      <span className="font-semibold text-slate-700">±{selectedSampleForSticker.tolerancePercent}%</span>
                    </div>
                  </div>

                  {/* QR Code Graphic */}
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                    {generatedQrMap[selectedSampleForSticker.id] ? (
                      <img
                        src={generatedQrMap[selectedSampleForSticker.id]}
                        alt="Order QR Code"
                        className="w-32 h-32"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        Generating...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.beepScan();
                    onSelectOrder(selectedSampleForSticker);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('scanner.selectOrder')}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>QR Code / Barcode / JSON</span>
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            {t('scanner.close')}
          </button>
        </div>

      </div>
    </div>
  );
};
