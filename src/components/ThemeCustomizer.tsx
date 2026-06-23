import React from 'react';
import { AccessibilitySettings, AccessibilityTheme, ZoomLevel } from '../types';
import { Settings, Eye, Type, Volume2, HelpCircle } from 'lucide-react';

interface ThemeCustomizerProps {
  settings: AccessibilitySettings;
  setSettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  speak: (text: string) => void;
}

export default function ThemeCustomizer({ settings, setSettings, speak }: ThemeCustomizerProps) {
  const updateTheme = (theme: AccessibilityTheme) => {
    setSettings((prev) => ({ ...prev, theme }));
    const titles: Record<AccessibilityTheme, string> = {
      standard: 'Standart Tema Etkinleştirildi',
      'high-contrast-dark': 'Yüksek Kontrast Siyah Tema Etkinleştirildi',
      'yellow-on-black': 'Yüksek Kontrast Sarı-Siyah Tema Etkinleştirildi',
      'cream-soft': 'Yumuşak Krem Tema Etkinleştirildi',
    };
    speak(titles[theme]);
  };

  const updateZoom = (zoomLevel: ZoomLevel) => {
    setSettings((prev) => ({ ...prev, zoomLevel }));
    const zoomTitles: Record<ZoomLevel, string> = {
      normal: 'Normal yazı boyutu etkin',
      large: 'Büyük yazı boyutu etkin',
      'extra-large': 'Çok büyük yazı boyutu etkin',
    };
    speak(zoomTitles[zoomLevel]);
  };

  const toggleDyslexic = () => {
    const newVal = !settings.dyslexicFont;
    setSettings((prev) => ({ ...prev, dyslexicFont: newVal }));
    speak(newVal ? 'Disleksi dostu yazı tipi etkin' : 'Standart yazı tipi etkin');
  };

  const toggleReadOnHover = () => {
    const newVal = !settings.readOnHover;
    setSettings((prev) => ({ ...prev, readOnHover: newVal }));
    speak(newVal ? 'Sesli seslendirme etkin. Fareyle üzerine geldiğiniz öğeler seslendirilecektir.' : 'Sesli seslendirme kapatıldı.');
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setSettings((prev) => ({ ...prev, narratorSpeed: speed }));
  };

  const testSpeech = () => {
    speak('SesOl Platformu sesli asistanı kontrol ediliyor. Ses seviyesi ve hızı uygun mu?');
  };

  return (
    <div 
      className="p-6 rounded-2xl border bg-card text-card-foreground shadow-lg transition-all duration-300"
      id="accessibility-panel"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h2 className="text-xl font-bold flex items-center gap-2" id="acc-settings-title">
          <Settings className="w-5 h-5 text-primary" />
          <span>Erişilebilirlik Paneli</span>
        </h2>
        <button
          onClick={() => speak('Erişilebilirlik kontrol panelindesiniz. Buradan renkleri, yazı boyutlarını ve sesli asistan ayarlarını değiştirebilirsiniz.')}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          title="Yardım Oku"
          aria-label="Ayarlar hakkında sesli bilgi ver"
        >
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div>
          <label className="text-sm font-semibold mb-3 block flex items-center gap-1.5" id="label-theme">
            <Eye className="w-4 h-4 text-primary" />
            <span>Görsel Tema / Renk Düzeni</span>
          </label>
          <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="label-theme">
            <button
              onClick={() => updateTheme('standard')}
              className={`p-3.5 rounded-xl border-2 text-sm flex items-center gap-2 justify-center transition-all ${
                settings.theme === 'standard'
                  ? 'border-pink-500 ring-4 ring-pink-500/25 bg-slate-100 text-slate-950 font-black scale-[1.02] shadow-md'
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800 font-bold shadow-xs'
              }`}
              id="theme-btn-standard"
              aria-pressed={settings.theme === 'standard'}
            >
              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 border border-slate-400 inline-block"></span>
              <span>Standart / Aydınlık</span>
            </button>

            <button
              onClick={() => updateTheme('high-contrast-dark')}
              className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 justify-center transition-all ${
                settings.theme === 'high-contrast-dark'
                  ? 'border-yellow-500 ring-2 ring-yellow-500/30 bg-black text-white'
                  : 'bg-black text-white border-zinc-800 hover:bg-neutral-900'
              }`}
              id="theme-btn-contrast"
              aria-pressed={settings.theme === 'high-contrast-dark'}
            >
              <span className="w-4 h-4 rounded-full bg-white border border-black inline-block"></span>
              <span>Yüksek Kontrast</span>
            </button>

            <button
              onClick={() => updateTheme('yellow-on-black')}
              className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 justify-center transition-all ${
                settings.theme === 'yellow-on-black'
                  ? 'border-yellow-400 ring-2 ring-yellow-400/30 bg-black text-yellow-400'
                  : 'bg-neutral-900 text-yellow-400 border-zinc-700 hover:bg-black'
              }`}
              id="theme-btn-yellow"
              aria-pressed={settings.theme === 'yellow-on-black'}
            >
              <span className="w-4 h-3.5 rounded bg-yellow-400 border border-black inline-block"></span>
              <span>Sarı Üzeri Siyah</span>
            </button>

            <button
              onClick={() => updateTheme('cream-soft')}
              className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 justify-center transition-all ${
                settings.theme === 'cream-soft'
                  ? 'border-amber-700 ring-2 ring-amber-700/30 bg-[#fdfaf2] text-[#432c0c]'
                  : 'bg-[#faf6eb] text-[#5c3e16] border-amber-100 hover:bg-[#f3edd9]'
              }`}
              id="theme-btn-cream"
              aria-pressed={settings.theme === 'cream-soft'}
            >
              <span className="w-4 h-4 rounded-full bg-amber-100 border border-amber-800 inline-block"></span>
              <span>Yumuşak Krem</span>
            </button>
          </div>
        </div>

        {/* Font Zoom Settings */}
        <div>
          <label className="text-sm font-semibold mb-3 block flex items-center gap-1.5" id="label-zoom">
            <Type className="w-4 h-4 text-primary" />
            <span>Yazı Boyutu (Ekran Yakınlaştırma)</span>
          </label>
          <div className="flex gap-2" role="group" aria-labelledby="label-zoom">
            {(['normal', 'large', 'extra-large'] as ZoomLevel[]).map((level) => {
              const labelMap = { normal: 'Normal', large: 'Büyük', 'extra-large': 'Çok Büyük' };
              const sizeClasses = { normal: 'text-sm', large: 'text-base', 'extra-large': 'text-lg' };
              return (
                <button
                  key={level}
                  onClick={() => updateZoom(level)}
                  className={`flex-1 p-2.5 rounded-xl border font-bold transition-all ${sizeClasses[level]} ${
                    settings.zoomLevel === level
                      ? 'border-primary bg-primary text-primary-foreground font-extrabold shadow-sm'
                      : 'bg-muted border-transparent hover:bg-muted-foreground/10 text-muted-foreground'
                  }`}
                  id={`zoom-btn-${level}`}
                  aria-pressed={settings.zoomLevel === level}
                >
                  {labelMap[level]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dyslexia Switch & Read On Hover Switch */}
        <div className="space-y-3 pt-2">
          {/* Dyslexia mode */}
          <button
            onClick={toggleDyslexic}
            className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              settings.dyslexicFont 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-border hover:bg-muted'
            }`}
            id="dyslexic-toggle-btn"
            aria-pressed={settings.dyslexicFont}
          >
            <div>
              <span className="font-bold block text-sm">Disleksi Dostu Yazım Formatı</span>
              <span className="text-xs opacity-85 block mt-0.5">Harfler arası geniş boşluklar ve ağırlıklı taban çizgileri.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded font-black ${
                settings.dyslexicFont 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-zinc-700/30 text-zinc-400'
              }`}>
                {settings.dyslexicFont ? 'AÇIK' : 'KAPALI'}
              </span>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${settings.dyslexicFont ? 'bg-emerald-500' : 'bg-muted-foreground/35'}`}>
                <div className={`bg-white w-4 h-4 rounded-full transition-transform duration-200 ${settings.dyslexicFont ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          </button>

          {/* Read on hover mode */}
          <button
            onClick={toggleReadOnHover}
            className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              settings.readOnHover 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-border hover:bg-muted'
            }`}
            id="hover-read-toggle-btn"
            aria-pressed={settings.readOnHover}
          >
            <div>
              <span className="font-bold block text-sm">Fare ve Odak Üzeri Seslendirme</span>
              <span className="text-xs opacity-85 block mt-0.5">Seçilen veya dokunulan menüleri otomatik seslendirir.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded font-black ${
                settings.readOnHover 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-zinc-700/30 text-zinc-400'
              }`}>
                {settings.readOnHover ? 'AÇIK' : 'KAPALI'}
              </span>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${settings.readOnHover ? 'bg-emerald-500' : 'bg-muted-foreground/35'}`}>
                <div className={`bg-white w-4 h-4 rounded-full transition-transform duration-200 ${settings.readOnHover ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          </button>
        </div>

        {/* Screen Reader Voice Customizers */}
        <div className="pt-3 border-t border-border space-y-4">
          <label className="text-sm font-semibold block flex items-center gap-1.5" id="label-vocal">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Sesli Asistan Hızı: <span className="font-mono text-emerald-400 font-bold">{settings.narratorSpeed}x</span></span>
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.narratorSpeed}
              onChange={handleSpeedChange}
              className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              aria-labelledby="label-vocal"
              id="slider-sound-speed"
              list="speed-dimensions"
            />
            <button
              onClick={testSpeech}
              className="py-1.5 px-3 rounded-lg border text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/40 whitespace-nowrap"
              id="test-sound-btn"
            >
              Test Et
            </button>
          </div>

          {/* Datalist slider ticks indicator/dimension labels */}
          <div className="flex justify-between px-1 text-[10px] text-zinc-400 font-mono">
            <span>0.5x (Yavaş)</span>
            <span>1.0x (Normal)</span>
            <span>1.5x (Hızlı)</span>
            <span>2.0x (Çok Hızlı)</span>
          </div>

          {/* Preset Buttons for speed choice dimension selection */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {([0.5, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0] as number[]).map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => {
                  setSettings((prev) => ({ ...prev, narratorSpeed: sp }));
                  speak(`Hız ${sp} katına ayarlandı.`);
                }}
                className={`px-2.5 py-1 rounded text-xs font-extrabold transition-all duration-150 ${
                  settings.narratorSpeed === sp
                    ? 'bg-emerald-500 text-slate-900 border border-emerald-300'
                    : 'bg-[#191c4d] hover:bg-[#20256e] text-slate-300 border border-indigo-900'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>

        <div className="bg-muted p-3.5 rounded-xl space-y-1" id="keyboard-shortcut-info">
          <span className="font-bold text-xs block text-muted-foreground tracking-wider">KLAVYE KISAYOLLARI (ERİŞİM KOLAYLIĞI)</span>
          <div className="text-xs space-y-1 text-muted-foreground/90">
            <div className="flex justify-between"><span>Ana Sayfa:</span> <kbd className="font-mono bg-background border px-1.5 rounded text-[10px] font-bold">ALT + A</kbd></div>
            <div className="flex justify-between"><span>Kütüphane / Arşiv:</span> <kbd className="font-mono bg-background border px-1.5 rounded text-[10px] font-bold">ALT + K</kbd></div>
            <div className="flex justify-between"><span>Destek İste / Pano:</span> <kbd className="font-mono bg-background border px-1.5 rounded text-[10px] font-bold">ALT + D</kbd></div>
            <div className="flex justify-between"><span>Gönüllü Ekranı:</span> <kbd className="font-mono bg-background border px-1.5 rounded text-[10px] font-bold">ALT + G</kbd></div>
            <div className="flex justify-between"><span>Sesli Asistan Kapa/Aç:</span> <kbd className="font-mono bg-background border px-1.5 rounded text-[10px] font-bold">ALT + S</kbd></div>
          </div>
        </div>
      </div>
    </div>
  );
}
