import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_REQUESTS, INITIAL_LIBRARY_ITEMS } from './data/mockData';
import { AccessibleRequest, LibraryItem, AccessibilitySettings, AccessibilityTheme, ZoomLevel } from './types';
import LandingPage from './components/LandingPage';
import RequestBoard from './components/RequestBoard';
import VolunteerDashboard from './components/VolunteerDashboard';
import LibraryArchive from './components/LibraryArchive';
import ThemeCustomizer from './components/ThemeCustomizer';
import VoiceAssistant from './components/VoiceAssistant';
import MembershipPanel from './components/MembershipPanel';

// Icons
import { 
  Accessibility, 
  Info, 
  BookOpen, 
  HeartHandshake, 
  Layers, 
  Volume2, 
  Keyboard, 
  PhoneCall, 
  CircleAlert, 
  UserPlus, 
  PlusCircle, 
  Home 
} from 'lucide-react';

export default function App() {
  // Global Platform state
  const [requests, setRequests] = useState<AccessibleRequest[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [showDirectHelpDialog, setShowDirectHelpDialog] = useState(false);
  const [userAccount, setUserAccount] = useState<{
    fullName: string;
    email: string;
    role: 'gorme_engelli' | 'gonullu_seslendirmen' | 'diger';
    phone?: string;
    isRegistered: boolean;
    xpPoints?: number;
    badge?: string;
  } | null>(null);

  // Global Accessibility configuration
  const [settings, setSettings] = useState<AccessibilitySettings>({
    zoomLevel: 'normal',
    theme: 'standard',
    dyslexicFont: false,
    readOnHover: false,
    narratorVolume: 1.0,
    narratorSpeed: 1.0
  });

  // State of whether native TTS speech synthesis is actively reading
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // 1. Initialize state from LocalStorage or mock data on load
  useEffect(() => {
    // Web Speech API initialization
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }

    const savedRequests = localStorage.getItem('erisim_requests');
    const savedLibrary = localStorage.getItem('erisim_library');
    const savedSettings = localStorage.getItem('erisim_acc_settings');
    const savedUser = localStorage.getItem('sesol_user_account');

    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    } else {
      setRequests(INITIAL_REQUESTS);
      localStorage.setItem('erisim_requests', JSON.stringify(INITIAL_REQUESTS));
    }

    if (savedLibrary) {
      setLibraryItems(JSON.parse(savedLibrary));
    } else {
      setLibraryItems(INITIAL_LIBRARY_ITEMS);
      localStorage.setItem('erisim_library', JSON.stringify(INITIAL_LIBRARY_ITEMS));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    if (savedUser) {
      setUserAccount(JSON.parse(savedUser));
    }
  }, []);

  const handleUpdateAccount = (account: typeof userAccount) => {
    setUserAccount(account);
    if (account) {
      localStorage.setItem('sesol_user_account', JSON.stringify(account));
    } else {
      localStorage.removeItem('sesol_user_account');
    }
  };

  // Update localStorage when lists change
  const saveRequestsToStorage = (newRequests: AccessibleRequest[]) => {
    setRequests(newRequests);
    localStorage.setItem('erisim_requests', JSON.stringify(newRequests));
  };

  const saveLibraryToStorage = (newItems: LibraryItem[]) => {
    setLibraryItems(newItems);
    localStorage.setItem('erisim_library', JSON.stringify(newItems));
  };

  // Save settings when changed
  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem('erisim_acc_settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Adjust HTML root font size dynamically to make zoom settings fully functional and responsive
  useEffect(() => {
    try {
      const htmlElement = document.documentElement;
      if (settings.zoomLevel === 'large') {
        htmlElement.style.fontSize = '19px';
      } else if (settings.zoomLevel === 'extra-large') {
        htmlElement.style.fontSize = '23px';
      } else {
        htmlElement.style.fontSize = '15px'; // Standard normal size
      }
    } catch (e) {
      console.error('Error modifying document root size:', e);
    }
  }, [settings.zoomLevel]);

  // 2. High performance, cancellation-backed Speech synthesis engine
  const speak = (
    text: string, 
    onBoundary?: (charIndex: number) => void, 
    onEnd?: () => void
  ) => {
    if (!synthRef.current) return;
    
    // Snappy feedback: Cancel previous speak queues immediately
    synthRef.current.cancel();

    // Slay markdown or weird symbols before reading
    const cleanText = text
      .replace(/[\*\#\_\[\]\(\)\-\+]/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = settings.narratorSpeed;
    utterance.volume = settings.narratorVolume;
    
    utterance.onstart = () => {
      setIsSynthesizing(true);
    };

    utterance.onboundary = (event) => {
      if (onBoundary) {
        onBoundary(event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsSynthesizing(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSynthesizing(false);
      if (onEnd) onEnd();
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeak = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSynthesizing(false);
    }
  };

  // 3. Hover speak assistant handler
  const handleHoverSpeak = (text: string) => {
    if (settings.readOnHover) {
      speak(text);
    }
  };

  // 3.5 Global mouse pointer word-reader effect ("okun üstünde olduğu kelimeyi seslendirsin yapay zeka")
  useEffect(() => {
    let hoverTimer: NodeJS.Timeout | null = null;
    let lastWord = '';

    const handleMouseMove = (e: MouseEvent) => {
      if (!settings.readOnHover) return;

      if (hoverTimer) clearTimeout(hoverTimer);

      hoverTimer = setTimeout(() => {
        const word = getWordAtPoint(e.clientX, e.clientY);
        if (word && word.length > 1 && word !== lastWord) {
          lastWord = word;
          speak(word);
        }
      }, 300); // 300ms hover delay
    };

    const getWordAtPoint = (x: number, y: number): string => {
      try {
        let textNode: Node | null = null;
        let offset = 0;
        const doc = document as any;
        
        if (doc.caretPositionFromPoint) {
          const pos = doc.caretPositionFromPoint(x, y);
          if (pos) {
            textNode = pos.offsetNode;
            offset = pos.offset;
          }
        } else if (doc.caretRangeFromPoint) {
          const range = doc.caretRangeFromPoint(x, y);
          if (range) {
            textNode = range.startContainer;
            offset = range.startOffset;
          }
        }
        
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const data = (textNode as any).data;
          let start = offset;
          while (start > 0 && !/\s/.test(data[start - 1])) {
            start--;
          }
          let end = offset;
          while (end < data.length && !/\s/.test(data[end])) {
            end++;
          }
          const word = data.slice(start, end).trim();
          return word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
        }
      } catch (err) {
        // Fallback or ignore
      }
      return '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hoverTimer) clearTimeout(hoverTimer);
    };
  }, [settings.readOnHover, settings.narratorSpeed, settings.narratorVolume]);

  // 4. Keyboard Shortcuts listener (ALT + capital letter Turkish navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Must hold ALT key
      if (!e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'å') {
        e.preventDefault();
        setCurrentTab('landing');
        speak('Ana Sayfa Sekmesi Açıldı.');
      } else if (key === 'k') {
        e.preventDefault();
        setCurrentTab('library');
        speak('Kütüphane Sekmesi Açıldı.');
      } else if (key === 'd') {
        e.preventDefault();
        setCurrentTab('request');
        speak('Destek İstek Sekmesi Açıldı.');
      } else if (key === 'g') {
        e.preventDefault();
        setCurrentTab('volunteer');
        speak('Gönüllü Görev Sekmesi Açıldı.');
      } else if (key === 's') {
        e.preventDefault();
        const newVal = !settings.readOnHover;
        setSettings(prev => ({ ...prev, readOnHover: newVal }));
        speak(newVal ? 'Sesli asistan açıldı.' : 'Sesli asistan kapatıldı.');
      } else if (key === 'h') {
        e.preventDefault();
        setShowDirectHelpDialog(prev => !prev);
        speak('Yardım paneli açıldı.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.readOnHover]);

  // 5. Creating new Request
  const handleCreateRequest = (newReq: AccessibleRequest) => {
    const updated = [newReq, ...requests];
    saveRequestsToStorage(updated);
  };

  // 6. Gönüllü completes request with voice record
  const handleCompleteRequest = (requestId: string, audioUrl: string, volunteerName: string) => {
    // Find request to transition status and add to public library archive
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const newRecordInfo = {
      id: `record_${Date.now()}`,
      volunteerName: volunteerName.trim() || 'Gizli Kahraman (Gönüllü)',
      audioUrl: audioUrl,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // A. Transition status to completed
    const updatedRequests = requests.map((r) => {
      if (r.id === requestId) {
        const currentRecordings = r.recordings || [];
        return {
          ...r,
          status: 'completed' as const,
          completedAt: newRecordInfo.createdAt,
          completedBy: newRecordInfo.volunteerName,
          audioUrl: audioUrl,
          recordings: [...currentRecordings, newRecordInfo]
        };
      }
      return r;
    });
    saveRequestsToStorage(updatedRequests);

    // B. Inject into the public catalog
    const libraryEntry: LibraryItem = {
      id: `lib_${Date.now()}`,
      title: targetReq.title,
      description: `Gönüllümüz tarafından yapılan seslendirme. Orijinal Talep: ${targetReq.description}`,
      category: targetReq.category,
      itemType: targetReq.requestType === 'vocal_reading' ? 'sesli_makale' : 'betimleme',
      narrator: volunteerName,
      audioUrl: audioUrl,
      textBody: targetReq.contentBody,
      duration: '02:00', // Mock estimation
      views: 1,
      likes: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updatedLibrary = [libraryEntry, ...libraryItems];
    saveLibraryToStorage(updatedLibrary);
  };

  // Dynamic contrast layouts mapper
  const getThemeClasses = (theme: AccessibilityTheme) => {
    switch (theme) {
      case 'high-contrast-dark':
        return {
          root: 'bg-[#0f1115] text-[#f8fafc] border-slate-700 font-sans selection:bg-yellow-500 selection:text-black',
          header: 'bg-[#181d24] border-b-2 border-slate-600 text-white',
          card: 'bg-[#181d24] border-2 border-slate-600 text-white',
          tabActive: 'bg-[#1e293b] text-yellow-400 border-2 border-yellow-400 shadow-md',
          tabInactive: 'bg-[#12151b] text-slate-300 border border-transparent hover:bg-slate-700/50',
          footer: 'bg-[#181d24] border-t border-slate-700 text-slate-400'
        };
      case 'yellow-on-black':
        return {
          root: 'bg-black text-yellow-400 border-yellow-400 font-sans selection:bg-yellow-400 selection:text-black',
          header: 'bg-black border-b-4 border-yellow-400 text-yellow-400',
          card: 'bg-black border-4 border-yellow-400 text-yellow-400',
          tabActive: 'bg-yellow-400 text-black border-4 border-black font-black',
          tabInactive: 'bg-black text-yellow-400 border-2 border-yellow-400 hover:bg-zinc-900',
          footer: 'bg-black border-t-2 border-yellow-400 text-yellow-400'
        };
      case 'cream-soft':
        return {
          root: 'bg-[#f8f5eb] text-[#3c2a1a] border-amber-200 font-sans selection:bg-amber-100 selection:text-amber-900',
          header: 'bg-[#f0e6cf] border-b border-amber-300 text-[#3c2a1a]',
          card: 'bg-[#faf7f0] border border-amber-200 text-[#3c2a1a]',
          tabActive: 'bg-[#e2d3b2] text-amber-900 border border-amber-400 font-bold shadow-xs',
          tabInactive: 'bg-[#f4ebe1] text-[#715945] hover:bg-[#eadecc]',
          footer: 'bg-[#f0e6cf] border-t border-amber-300 text-[#715945]'
        };
      case 'standard':
      default:
        return {
          root: 'bg-gradient-to-br from-[#090a1f] via-[#140b24] to-[#06081c] text-[#f1f5f9] border-slate-800 font-sans selection:bg-pink-500 selection:text-white',
          header: 'bg-[#0b0c26]/95 backdrop-blur-md border-[#2f3380] border-b text-white shadow-xl',
          card: 'bg-[#121540] border-2 border-[#3b409c] text-white shadow-xl hover:border-pink-500/50 transition-colors',
          tabActive: 'bg-gradient-to-r from-pink-500 via-[#502bb2] to-blue-600 text-white border border-pink-400 font-extrabold shadow-lg shadow-pink-500/10',
          tabInactive: 'bg-[#171a4f] text-slate-300 border border-transparent hover:bg-[#20246a] hover:text-white',
          footer: 'bg-[#060717] border-t border-indigo-900/45 text-slate-400'
        };
    }
  };

  const themeClasses = getThemeClasses(settings.theme);

  // Dynamic font sizing multiplier
  const getZoomClasses = (zoom: ZoomLevel) => {
    switch (zoom) {
      case 'large':
        return 'text-[17px]';
      case 'extra-large':
        return 'text-[20px]';
      case 'normal':
      default:
        return 'text-[15px]';
    }
  };

  const zoomClass = getZoomClasses(settings.zoomLevel);

  // Dyslexia text manipulation string helper (highly spaced and heavy weighted)
  const dyslexicClass = settings.dyslexicFont 
    ? 'font-serif tracking-widest leading-[1.8] font-bold text-lg' 
    : '';

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-300 ${themeClasses.root} ${zoomClass} ${dyslexicClass}`} id="app-root-container">
      
      {/* HEADER SECTION */}
      <header className={`py-4 px-6 sticky top-0 z-40 transition-all duration-300 ${themeClasses.header}`} id="main-app-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setCurrentTab('landing');
              speak('SesOl ana sayfa.');
            }}
            onMouseEnter={() => handleHoverSpeak('SesOl Engelsiz Platformu Logo başlığı')}
            id="brand-logo-area"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight block leading-none text-foreground flex items-center gap-1">
                <span>SesOl</span>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground block mt-1.5">ENGELSİZ YARDIMLAŞMA PLATFORMU</span>
            </div>
          </div>

          {/* Sitemide Tabs */}
          <nav className="flex flex-row md:flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none select-none scroll-smooth" role="tablist" aria-label="Ana Gezinti">
            <button
              onClick={() => {
                setCurrentTab('landing');
                speak('Ana sayfa seçildi.');
              }}
              onMouseEnter={() => handleHoverSpeak('Ana Sayfaya Git (ALT A)')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                currentTab === 'landing' ? themeClasses.tabActive : themeClasses.tabInactive
              }`}
              role="tab"
              aria-selected={currentTab === 'landing'}
              id="nav-tab-landing"
            >
              <Home className="w-4 h-4" />
              <span>Ana Sayfa</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('library');
                speak('Sesli Kütüphane Arşivi seçildi.');
              }}
              onMouseEnter={() => handleHoverSpeak('Kütüphane ve Arşiv (ALT K)')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                currentTab === 'library' ? themeClasses.tabActive : themeClasses.tabInactive
              }`}
              role="tab"
              aria-selected={currentTab === 'library'}
              id="nav-tab-library"
            >
              <BookOpen className="w-4 h-4" />
              <span>Sesli Kütüphane</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('request');
                speak('Destek İstek Panosu seçildi.');
              }}
              onMouseEnter={() => handleHoverSpeak('Destek İstek Panosu (ALT D)')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                currentTab === 'request' ? themeClasses.tabActive : themeClasses.tabInactive
              }`}
              role="tab"
              aria-selected={currentTab === 'request'}
              id="nav-tab-request"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Destek İste</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('volunteer');
                speak('Gönüllü Görev Ekranı seçildi.');
              }}
              onMouseEnter={() => handleHoverSpeak('Gönüllü Ol ve Görevi Al (ALT G)')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                currentTab === 'volunteer' ? themeClasses.tabActive : themeClasses.tabInactive
              }`}
              role="tab"
              aria-selected={currentTab === 'volunteer'}
              id="nav-tab-volunteer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Gönüllü Görevleri</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('membership');
                speak('Üyelik ve Hesap Portalı seçildi.');
              }}
              onMouseEnter={() => handleHoverSpeak('Üyelik oluşturma yeri')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                currentTab === 'membership' ? themeClasses.tabActive : themeClasses.tabInactive
              }`}
              role="tab"
              aria-selected={currentTab === 'membership'}
              id="nav-tab-membership"
            >
              <UserPlus className="w-4 h-4" />
              <span>{userAccount?.isRegistered ? 'Hesabım' : 'Üye Ol / Giriş'}</span>
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setShowDirectHelpDialog(true);
                speak('Yardım paneli açıldı. Telefon numaralarımız ve canlı destek hattımız listelendi.');
              }}
              className="p-2 bg-rose-500/15 text-rose-500 border border-rose-500/20 hover:bg-rose-500/25 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
              id="direct-emergency-call-btn"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Acil Canlı Destek</span>
            </button>
          </div>
        </div>
      </header>

      {/* EMERGENCY HELP DIALOG MODAL */}
      {showDirectHelpDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#eab308] text-slate-950 border-4 border-slate-950 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-950/25 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-1.5 text-slate-950">
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Acil Sesli & Telefon Desteği</span>
              </h3>
              <button 
                onClick={() => {
                  setShowDirectHelpDialog(false);
                  speak('Destek penceresi kapatıldı.');
                }}
                className="text-xs bg-slate-950 text-white font-bold p-1 px-3 rounded hover:bg-slate-800 transition-colors"
              >
                Kapat
              </button>
            </div>
            
            <p className="text-sm font-extrabold leading-relaxed text-slate-950 bg-white/20 p-3 rounded-xl border border-slate-950/10">
              İnternet arayüzünü kullanmakta veya istek eklemekte zorlanıyorsanız ücretsiz telefon hattımız üzerinden 7/24 operatörümüze metin dikte edebilir ya da yardım alabilirsiniz.
            </p>
            
            <div className="p-4 bg-slate-950 text-yellow-400 rounded-xl text-center space-y-1.5 border border-slate-900 shadow-md">
              <span className="block text-[10px] font-black tracking-wider">TÜRKİYE ENGELSİZ DESTEK HATTI</span>
              <span className="block text-2xl font-black tracking-widest text-[#eab308]">0850 440 20 20</span>
            </div>
            
            <p className="text-[11px] text-slate-950 select-none font-bold italic text-center">
              * Gönüllü koordinatörlerimiz dilediğiniz her ders ödevini seslendirip hesabınıza yükleyebilir.
            </p>
          </div>
        </div>
      )}

      {/* ACCESSIBILITY FLOATING NOTIFICATION BANNER */}
      {settings.readOnHover && (
        <div className="bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2" id="voice-mode-ticker">
          <Volume2 className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>SESLİ DESTEK AKTİF - ÜZERİNE GELDİĞİNİZ HER MENÜ SESLİ OLARAK OKUNUR</span>
        </div>
      )}

      {/* CORE CONTENT LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8" id="primary-grid-body">
        
        {/* LEFT COLUMN/MAIN WORKSPACE (col-span-9) */}
        <div className="lg:col-span-8 space-y-6" id="primary-view-container">
          {currentTab === 'landing' && (
            <LandingPage 
              setCurrentTab={setCurrentTab} 
              speak={speak} 
              requests={requests}
              onCreateRequest={handleCreateRequest}
              libraryItems={libraryItems}
            />
          )}

          {currentTab === 'request' && (
            <RequestBoard 
              requests={requests} 
              onCreateRequest={handleCreateRequest} 
              speak={speak} 
              userAccount={userAccount}
            />
          )}

          {currentTab === 'volunteer' && (
            <VolunteerDashboard 
              pendingRequests={requests.filter((r) => r.status === 'pending')} 
              onCompleteRequest={handleCompleteRequest} 
              speak={speak} 
              userAccount={userAccount}
            />
          )}

          {currentTab === 'library' && (
            <LibraryArchive 
              items={libraryItems} 
              speak={speak} 
              stopSpeak={stopSpeak} 
              isSynthesizing={isSynthesizing} 
              settingsSpeed={settings.narratorSpeed}
            />
          )}

          {currentTab === 'membership' && (
            <MembershipPanel
              userAccount={userAccount}
              onUpdateAccount={handleUpdateAccount}
              speak={speak}
            />
          )}
        </div>

        {/* RIGHT COLUMN/SIDEBAR ACCESSIBILITY UTILS (col-span-3) */}
        <div className="lg:col-span-4 space-y-6" id="secondary-sidebar-container">
          
          {/* VOICE CHANNELS ASSISTANT PANEL */}
          <VoiceAssistant 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
            speak={speak} 
            readOnHover={settings.readOnHover}
            theme={settings.theme}
          />

          {/* VISUAL & FONT TUNER CONTROLLER */}
          <ThemeCustomizer 
            settings={settings} 
            setSettings={setSettings} 
            speak={speak} 
          />

          {/* SHORT TIPS PANEL */}
          <div className="p-5 rounded-2xl border bg-card space-y-4 shadow-sm" id="tips-panel">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-foreground leading-none">
              <Keyboard className="w-4 h-4 text-primary" />
              <span>Hızlı Klavye Kılavuzu</span>
            </h3>
            
            <div className="text-xs space-y-2 text-muted-foreground leading-relaxed">
              <p>Görme engelli kullanıcılarımızın arayüzde zorlanmadan uçtan uca dolaşması için tarayıcıda <kbd className="font-mono bg-muted border px-1 rounded font-bold">ALT</kbd> tuşuna basılı tutarak gezinti yapılabilir.</p>
              <div className="p-3 bg-muted/60 rounded-xl space-y-1.5 font-sans" id="shortcut-quicklist">
                <div className="flex justify-between items-center"><span>Ana Sayfa:</span> <kbd className="font-semibold bg-background border px-1.5 py-0.5 rounded text-[10px]">Alt + A</kbd></div>
                <div className="flex justify-between items-center"><span>Kütüphane / Oynatıcı:</span> <kbd className="font-semibold bg-background border px-1.5 py-0.5 rounded text-[10px]">Alt + K</kbd></div>
                <div className="flex justify-between items-center"><span>Destek Talebi Yap:</span> <kbd className="font-semibold bg-background border px-1.5 py-0.5 rounded text-[10px]">Alt + D</kbd></div>
                <div className="flex justify-between items-center"><span>Gönüllü İşleri Al:</span> <kbd className="font-semibold bg-background border px-1.5 py-0.5 rounded text-[10px]">Alt + G</kbd></div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER RAILS */}
      <footer className={`py-6 px-6 mt-16 text-center transition-all duration-300 ${themeClasses.footer}`} id="main-app-footer">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <span>© 2026</span>
            <strong className="text-foreground">SesOl Projesi</strong>
            <span>• Bilgi Herkes İçin Eşit Olmalı.</span>
          </div>
          
          <div className="flex gap-4 text-muted-foreground font-semibold" id="footer-links">
            <button className="hover:underline" onClick={() => speak('Kullanım şartları sözleşmesi: Bu platform kâr amacı gütmeyen eğitim projesidir.')}>Koşullar</button>
            <span>•</span>
            <button className="hover:underline" onClick={() => speak('Gizlilik sözleşmesi: Engelli bireylerin verileri şifrelenerek yerel depolama dahilinde saklanır.')}>Gizlilik Politikası</button>
            <span>•</span>
            <button className="hover:underline" onClick={() => speak('Bizimle oguzhanmutlu yirmi üç doksan yedi et gmail adresi üzerinden iletişime geçebilirsiniz.')}>İletişim</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
