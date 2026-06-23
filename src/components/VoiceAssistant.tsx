import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, HelpCircle, CornerDownLeft } from 'lucide-react';

interface VoiceAssistantProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  speak: (text: string) => void;
  readOnHover: boolean;
  theme: 'standard' | 'high-contrast-dark' | 'yellow-on-black' | 'cream-soft';
}

// Extend Window interface for WebkitSpeechRecognition
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeech {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

export default function VoiceAssistant({ currentTab, setCurrentTab, speak, readOnHover, theme }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Sesli yönetim kapalı. Komutları denemek için mikrofonu açın veya yazın.');
  const [typedCommand, setTypedCommand] = useState('');
  const recognitionRef = useRef<any>(null);

  const getBoxStylesOnTheme = (themeName: string) => {
    switch (themeName) {
      case 'high-contrast-dark':
        return {
          card: 'bg-[#181d24] border-2 border-slate-600 text-[#f8fafc]',
          textMuted: 'text-slate-300',
          inputs: 'bg-[#0f1115] border-slate-600 text-[#f8fafc] placeholder:text-slate-500',
          badge: 'bg-[#0f1115] text-[#f8fafc] hover:bg-slate-800'
        };
      case 'yellow-on-black':
        return {
          card: 'bg-black border-4 border-yellow-400 text-yellow-400',
          textMuted: 'text-yellow-400/85',
          inputs: 'bg-black border-2 border-yellow-400 text-yellow-400 placeholder:text-yellow-400/50',
          badge: 'bg-black border border-yellow-400 text-yellow-400 hover:bg-zinc-900'
        };
      case 'cream-soft':
        return {
          card: 'bg-[#faf7f0] border border-amber-200 text-[#3c2a1a]',
          textMuted: 'text-[#715945]',
          inputs: 'bg-[#fdfaf2] border-amber-300 text-[#432c0c] placeholder:text-[#3c2a1a]/50',
          badge: 'bg-[#f4ebe1] text-[#715945] hover:bg-[#eadecc]'
        };
      case 'standard':
      default:
        return {
          card: 'bg-[#141743] border border-indigo-500/25 text-white shadow-xl',
          textMuted: 'text-slate-300',
          inputs: 'bg-[#0f1133] border-indigo-500/20 text-white placeholder:text-slate-400',
          badge: 'bg-[#191c4d] text-slate-200 hover:bg-[#20256e]'
        };
    }
  };

  const themeStyles = getBoxStylesOnTheme(theme);

  useEffect(() => {
    const speechWindow = window as unknown as WindowWithSpeech;
    const SpeechRecognitionClass = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    
    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'tr-TR';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Dinliyorum... (Örn: "kütüphane", "gönüllü", "destek iste", "yardım")');
        speak('Sesli komut dinleyici açıldı, sizi dinliyorum.');
      };

      recognition.onresult = (event: any) => {
        const currentResultIndex = event.resultIndex;
        const speechToText = event.results[currentResultIndex][0].transcript.toLowerCase().trim();
        setTranscript(speechToText);
        processCommand(speechToText);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        if (event.error === 'not-allowed') {
          setFeedback('Mikrofon izni verilmedi. Aşağıdaki kutuya komut yazabilirsiniz.');
        } else {
          setFeedback(`Hata oluştu: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const processCommand = (command: string) => {
    const normalized = command.toLowerCase();
    
    if (normalized.includes('ana sayfa') || normalized.includes('giriş') || normalized.includes('anasayfa')) {
      setCurrentTab('landing');
      speak('Ana sayfaya yönlendiriliyorsunuz.');
      setFeedback('Komut algılandı: Ana sayfaya gidildi.');
    } else if (normalized.includes('kütüphane') || normalized.includes('arşiv') || normalized.includes('dinle')) {
      setCurrentTab('library');
      speak('Sesli kütüphaneye yönlendiriliyorsunuz. Daha önce seslendirilmiş eserleri dinleyebilirsiniz.');
      setFeedback('Komut algılandı: Kütüphane açıldı.');
    } else if (normalized.includes('destek iste') || normalized.includes('istek yap') || normalized.includes('pano') || normalized.includes('yükle') || normalized.includes('istek panosu')) {
      setCurrentTab('request');
      speak('Destek paneline yönlendiriliyorsunuz. Kayıt yapabilir veya dosya yükleme açabilirsiniz.');
      setFeedback('Komut algılandı: Destek Pano açıldı.');
    } else if (normalized.includes('gönüllü') || normalized.includes('görev') || normalized.includes('bekleyen')) {
      setCurrentTab('volunteer');
      speak('Gönüllü görev paneline yönlendiriliyorsunuz. Bekleyen talepleri burada bulabilirsiniz.');
      setFeedback('Komut algılandı: Gönüllü paneli açıldı.');
    } else if (normalized.includes('yardım') || normalized.includes('neler yapabilirim') || normalized.includes('nasıl kullanılır')) {
      speak('Bu platform görme ve işitme engelliler için tasarlanmıştır. "kütüphane", "destek iste", "gönüllü ol" diyerek menüler arasında gezinebilirsiniz.');
      setFeedback('Yardım bilgisi okundu.');
    } else {
      setFeedback(`"${command}" komutu anlaşılamadı. Listeden kontrol edin.`);
      speak('Anlaşılamayan komut: ' + command);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tarayıcınız konuşma tanıma özelliğini desteklemiyor. Aşağıdaki kutuya komut yazabilirsiniz.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      speak('Ses algılayıcı kapatıldı.');
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    processCommand(typedCommand);
    setTranscript(typedCommand);
    setTypedCommand('');
  };

  return (
    <div 
      className={`p-5 rounded-2xl shadow-xl relative overflow-hidden transition-all duration-300 ${themeStyles.card}`}
      id="voice-assistant-orb"
    >
      {/* Background glow animation */}
      {isListening && (
        <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={toggleListening}
              className={`p-3.5 rounded-full flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' 
                  : 'bg-primary hover:bg-primary/95 text-primary-foreground'
              }`}
              title={isListening ? "Ses Tanımayı Durdur" : "Sesli Komut Yardımcısını Başlat"}
              aria-label={isListening ? "Sesli komut algılayıcıyı durdur" : "Mikrofonu aç ve sesli komut ver"}
              id="voice-mic-trigger"
            >
              {isListening ? <MicOff className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
            </button>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <h3 className="font-bold flex items-center gap-1.5 text-sm" id="voice-assistant-title">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Sesli Komut & Asistan</span>
            </h3>
            <p className={`text-xs mt-1 font-medium transition-colors duration-300 ${themeStyles.textMuted}`} id="voice-assistant-feedback">
              {feedback}
            </p>
          </div>
        </div>

        <button
          onClick={() => speak('Asistanımız sesli çalışır. Mikrofon düğmesine basıp "kütüphane", "gönüllü", "ana sayfa", ya da "destek" diyerek sesle kontrol edebilirsiniz.')}
          className="p-1 hover:opacity-80 rounded text-amber-500"
          title="Asistan Yardımı Oku"
          aria-label="Asistan hakkında sesli bilgi"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {transcript && (
        <div className={`mt-4 p-2 rounded-lg text-xs flex gap-2 items-center border ${themeStyles.inputs}`} id="voice-transcript-wrapper">
          <span className="font-semibold shrink-0">ALINAN SES:</span>
          <span className="font-mono italic">"{transcript}"</span>
        </div>
      )}

      {/* Interactive text command inputs if mic is preferred or fallback offline */}
      <form onSubmit={handleCommandSubmit} className="mt-3.5 flex gap-2" id="text-command-form">
        <input
          type="text"
          value={typedCommand}
          onChange={(e) => setTypedCommand(e.target.value)}
          placeholder='Komut veya sayfa adı yazın...'
          className={`flex-1 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary border transition-colors duration-300 ${themeStyles.inputs}`}
          aria-label="Ses yardımı komutu giriş kutusu"
          id="text-command-input"
        />
        <button
          type="submit"
          className="p-2 rounded-lg text-xs flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/95 transition-all"
          title="Komutu Çalıştır"
          id="text-command-submit"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Cheat-sheet trigger info */}
      <div className="mt-3 grid grid-cols-4 gap-1 text-[10px] font-medium">
        <span className={`rounded px-1 py-1 text-center cursor-pointer transition-all ${themeStyles.badge}`} onClick={() => processCommand('ana sayfa')}>"ana sayfa"</span>
        <span className={`rounded px-1 py-1 text-center cursor-pointer transition-all ${themeStyles.badge}`} onClick={() => processCommand('kütüphane')}>"kütüphane"</span>
        <span className={`rounded px-1 py-1 text-center cursor-pointer transition-all ${themeStyles.badge}`} onClick={() => processCommand('destek iste')}>"destek iste"</span>
        <span className={`rounded px-1 py-1 text-center cursor-pointer transition-all ${themeStyles.badge}`} onClick={() => processCommand('gönüllü')}>"gönüllü"</span>
      </div>
    </div>
  );
}
