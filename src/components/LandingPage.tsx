import React, { useRef, useState, useEffect } from 'react';
import { 
  Volume2, 
  MessageSquare, 
  BookOpen, 
  HeartHandshake, 
  Mic, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Accessibility, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Clock, 
  Square,
  Play, 
  Trash2, 
  CheckCircle, 
  AudioLines,
  Smile,
  Users,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { AccessibleRequest, LibraryItem, RequestCategory, RequestType } from '../types';

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
  speak: (text: string) => void;
  requests?: AccessibleRequest[];
  onCreateRequest?: (req: AccessibleRequest) => void;
  libraryItems?: LibraryItem[];
}

export default function LandingPage({ 
  setCurrentTab, 
  speak, 
  requests = [], 
  onCreateRequest, 
  libraryItems = [] 
}: LandingPageProps) {
  
  // Quick request form state inputs
  const [quickTitle, setQuickTitle] = useState('');
  const [quickBody, setQuickBody] = useState('');
  const [quickCategory, setQuickCategory] = useState<RequestCategory>('Ders Notu');
  const [quickName, setQuickName] = useState('');
  const [quickUrgency, setQuickUrgency] = useState<'normal' | 'high'>('normal');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Quick mic test / Voice recording state
  const [isQuickRecording, setIsQuickRecording] = useState(false);
  const [quickAudioUrl, setQuickAudioUrl] = useState('');
  const [quickRecordDuration, setQuickRecordDuration] = useState(0);
  
  const quickMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const quickChunksRef = useRef<Blob[]>([]);
  const quickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Carousel ref mapping
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (quickTimerRef.current) clearInterval(quickTimerRef.current);
    };
  }, []);

  // Quick sound generator mock simulation
  const handleAISimulateSound = () => {
    setQuickAudioUrl('simulated_voice_quick_sample');
    speak('Harika! Yapay zeka ses testiniz hazırlandı. Oynatıp deneme kaydınızı dinleyebilirsiniz.');
  };

  // Micro recorder handler
  const startQuickRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Tarayıcınız ses kaydetmeyi desteklemiyor.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      quickMediaRecorderRef.current = mediaRecorder;
      quickChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          quickChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(quickChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setQuickAudioUrl(url);
        speak('Kayıt başarıyla durduruldu. Şimdi aşağıdaki oynatıcıdan sesinizi dinleyebilirsiniz.');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsQuickRecording(true);
      setQuickRecordDuration(0);
      speak('Ses kaydı başlatıldı. Konuşmaya başlayabilirsiniz.');

      if (quickTimerRef.current) clearInterval(quickTimerRef.current);
      quickTimerRef.current = setInterval(() => {
        setQuickRecordDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error(err);
      speak('Mikrofon erişim izni reddedildi veya hata oluştu.');
    }
  };

  const stopQuickRecording = () => {
    if (quickMediaRecorderRef.current && isQuickRecording) {
      quickMediaRecorderRef.current.stop();
      setIsQuickRecording(false);
      if (quickTimerRef.current) clearInterval(quickTimerRef.current);
    }
  };

  const discardQuickRecording = () => {
    setQuickAudioUrl('');
    setIsQuickRecording(false);
    setQuickRecordDuration(0);
    if (quickTimerRef.current) clearInterval(quickTimerRef.current);
    speak('Ses kaydı temizlendi.');
  };

  // Carousel slider navigators
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollVal = 360;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollVal : scrollVal,
        behavior: 'smooth'
      });
      speak(direction === 'left' ? 'Liste sola döndürüldü' : 'Liste sağa döndürüldü');
    }
  };

  // Trigger quick submission
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickBody.trim()) {
      speak('Lütfen başlık ve seslendirilecek metin alanlarını doldurun.');
      return;
    }

    if (onCreateRequest) {
      const newReq: AccessibleRequest = {
        id: `req_${Date.now()}`,
        title: quickTitle,
        description: `Hızlı Ana Sayfa Başvurusu: ${quickCategory} Seslendirme İsteği`,
        category: quickCategory,
        requestType: 'vocal_reading',
        contentBody: quickBody,
        urgency: quickUrgency,
        submittedBy: quickName.trim() || 'Gizli Destek İsteyen (Hızlı Başvuru)',
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'pending'
      };
      
      onCreateRequest(newReq);
      setSubmissionSuccess(true);
      speak('Metin başvurunuz başarıyla alınmıştır. Gönüllülerimizin seslendirmesi için listeye eklendi.');
      
      // Reset inputs
      setQuickTitle('');
      setQuickBody('');
      setQuickName('');
      
      setTimeout(() => {
        setSubmissionSuccess(false);
      }, 5000);
    }
  };

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const triggerTabWithSpeech = (tab: 'request' | 'volunteer' | 'library', speechInfo: string) => {
    speak(speechInfo);
    setCurrentTab(tab);
  };

  return (
    <div className="space-y-12 py-4 animate-fade-in" id="landing-page-v2">
      
      {/* VIBRANT HERO CONTAINER (Daha Canlı Ana Ekran) */}
      <section 
        className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white border-2 border-indigo-400 text-center relative overflow-hidden shadow-2xl"
        id="landing-hero-vivid"
      >
        <div className="absolute top-0 right-0 p-8 opacity-15 animate-pulse hidden md:block">
          <Sparkles className="w-40 h-40 text-yellow-200" />
        </div>
        <div className="absolute -bottom-8 -left-8 bg-white/10 w-48 h-48 rounded-full blur-2xl" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-300 text-slate-900 text-xs font-black tracking-wider shadow-lg animate-bounce duration-1000">
            <Sparkles className="w-4 h-4 text-amber-600 fill-current" />
            <span>ENGELSİZ ERİŞİM & CANLI SES KÖPRÜSÜ</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-md leading-tight" id="hero-title">
            Dünyayı Sesimiz ve Sevginizle <span className="text-yellow-300 underline decoration-wavy decoration-emerald-400 block md:inline">Aydınlatın!</span>
          </h1>
          
          <p className="text-base md:text-lg text-indigo-50 font-medium max-w-2xl mx-auto leading-relaxed">
            SesOl; görme ve işitme kısıtı bulunan dostlarımızla, onlar için kitap özetleri, ders notları seslendirmek veya görselleri betimlemek isteyen yüce gönüllü canları birleştiren canlı bir kütüphane döngüsüdür.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => speak('SesOl modern ana ekranındasınız. Bu ekranda seslendirilecek metin başvuru formu, canlı mikrofon kayıt stüdyosu ve kaydırılabilir popüler eserler bulunmaktadır. Klavyenizin alt tırnak ve yön tuşları ya da sayfa kısayolları ile uçtan uca hızlı gezinebilirsiniz.')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.03] duration-200"
              aria-label="Sesli Başlangıç Kılavuzunu Başlat"
              id="hero-help-sound-btn"
            >
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse font-bold" />
              <span>Sesli Sayfa Kılavuzunu Dinle</span>
            </button>
          </div>
        </div>
      </section>

      {/* THREE MAIN DISTINCT COLORED ACTION BOXES (Kutucukların ise hepsini farklı bi renk yap çok sırıtmasın ve hepsi tek renk olsun) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="primary-action-grids">
        
        {/* BOX 1: SUBTLE UNIFIED DEEP INDIGO (ACİL DESTEK İSTE) */}
        <div 
          className="group relative p-6 rounded-3xl border-2 scale-100 hover:scale-[1.01] transition-all bg-[#141743]/45 border-indigo-500/25 shadow-xl"
          id="cta-box-request"
        >
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-200">YÜKSEK ACİLİYET</span>
          </div>
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Accessibility className="w-8 h-8" />
              </span>
              <h2 className="text-2xl font-black text-indigo-200">Destek İstek Formu</h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Kitap özetleri, sınav notları veya ilaç reçetelerini bizimle paylaşın. Gönüllü ordumuz yazıları sizin yerinize seslendirsin.
              </p>
            </div>
            <button 
              onClick={() => triggerTabWithSpeech('request', 'Destek paneline gidiyorsunuz.')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Destek Taleplerine Git</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOX 2: SUBTLE UNIFIED DEEP INDIGO (GÖNÜLLÜ OLMAK İÇİN SES VER) */}
        <div 
          className="group p-6 rounded-3xl border-2 scale-100 hover:scale-[1.01] transition-all bg-[#141743]/45 border-indigo-500/25 shadow-xl"
          id="cta-box-volunteer"
        >
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <HeartHandshake className="w-8 h-8" />
              </span>
              <h2 className="text-2xl font-black text-indigo-200">Gönüllü Destekçiyiz</h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Sesiniz bir görme engellinin dünyasını aydınlatabilir. Bekleyen ders kitaplarını ve makaleleri kaydedip kütüphaneye kazandırın.
              </p>
            </div>
            <button 
              onClick={() => triggerTabWithSpeech('volunteer', 'Gönüllü görev sayfasına aktarılıyorsunuz.')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Aktif Bekleyen Görevleri Gör</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOX 3: SUBTLE UNIFIED DEEP INDIGO (ORTAK SESLİ ARŞİV KÜTÜPHANESİ) */}
        <div 
          className="group p-6 rounded-3xl border-2 scale-100 hover:scale-[1.01] transition-all bg-[#141743]/45 border-indigo-500/25 shadow-xl"
          id="cta-box-library"
        >
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <BookOpen className="w-8 h-8" />
              </span>
              <h2 className="text-2xl font-black text-indigo-200">Ortak Ses Kütüphanesi</h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Daha önce tamamlanmış binlerce sesli dökümana, popüler romana ve betimleme arşivine sınırsız şekilde erişin ve anında oynatın.
              </p>
            </div>
            <button 
              onClick={() => triggerTabWithSpeech('library', 'Eşsiz kütüphane arşivine yönlendiriliyorsunuz.')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Arşivi Keşfet & Dinle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </section>

      {/* POPULAR WORKS SLIDING CAROUSEL (Kaydırma olsun ve kaydırma butonları renkli olsun) */}
      <section className="p-6 rounded-3xl border bg-card/65 space-y-6 shadow-md" id="highlights-scroll-carousel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black">
              <AudioLines className="w-3.5 h-3.5" />
              <span>DİNAMİK OKUMA AKIŞI</span>
            </div>
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>Popüler Tamamlanan Seslendirmeler</span>
            </h2>
            <p className="text-xs text-muted-foreground">Sağa ve sola döndürme butonlarını kullanarak ses kayıtları arasında gezinebilirsiniz.</p>
          </div>

          {/* COLORFUL CAROUSEL SLIDER CONTROLS REQUESTED IN TASK */}
          <div className="flex items-center gap-2" id="carousel-colorful-triggers">
            <button
              onClick={() => scrollCarousel('left')}
              className="p-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 border-2 border-cyan-200 transition-all shadow-md active:scale-90 flex items-center justify-center cursor-pointer"
              aria-label="Sola doğru kaydır"
              title="Sola Kaydır"
            >
              <ChevronLeft className="w-5 h-5 font-bold stroke-[3px]" />
            </button>

            <button
              onClick={() => scrollCarousel('right')}
              className="p-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-amber-200 transition-all shadow-md active:scale-90 flex items-center justify-center cursor-pointer"
              aria-label="Sağa doğru kaydır"
              title="Sağa Kaydır"
            >
              <ChevronRight className="w-5 h-5 font-bold stroke-[3px]" />
            </button>
          </div>
        </div>

        {/* CONTAINER WITH SCROLL PHYSICAL SNAP */}
        <div 
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          id="carousel-scroller-viewport"
        >
          {libraryItems.length > 0 ? (
            libraryItems.map((item) => (
              <div 
                key={item.id}
                className="min-w-[280px] md:min-w-[340px] max-w-[340px] p-5 rounded-2xl border-2 border-muted-foreground/15 bg-card text-card-foreground snap-start hover:border-primary/40 transition-all flex flex-col justify-between gap-4 shrink-0 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                      {item.category === 'Ders Notu' ? 'DERS NOTU' : item.category === 'Kitap' ? 'KİTAP' : item.category === 'Makale' ? 'MAKALE' : item.category === 'Günlük Hayat' ? 'GÜNLÜK HAYAT' : item.category === 'Diğer' ? 'DİĞER' : item.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{item.duration} dk</span>
                  </div>
                  <h3 className="font-extrabold text-sm line-clamp-1 text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">"{item.description}"</p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Okuyan: </span>
                    <strong className="text-emerald-500">{item.narrator}</strong>
                  </div>
                  <button 
                    onClick={() => {
                      speak(`Seçtiğiniz ${item.title} eseri kütüphane sayfasında başlatılıyor.`);
                      setCurrentTab('library');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-extrabold hover:bg-indigo-500 scale-100 active:scale-95 transition-transform"
                  >
                    Dinle &rarr;
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-xs text-muted-foreground italic">Yüklü kütüphane eseri bulunmamaktadır.</div>
          )}
        </div>
      </section>

      {/* SYSTEM FOR SUBMISSION OF TEXTS TO BE READ ("Seslendirilecek metinler için başvuru yeri") */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="vocal-application-and-recorder-block">
        
        {/* SUBMISSION FORM / APPLICATION ZONE (col-span-6) */}
        <div className="lg:col-span-6 p-6 rounded-3xl border-4 bg-card border-indigo-600 shadow-xl space-y-6" id="quick-submission-block">
          <div className="space-y-1 border-b pb-4 border-indigo-100 dark:border-indigo-950">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-extrabold">
              <Upload className="w-3.5 h-3.5" />
              <span>METİN BAŞVURU MERKEZİ</span>
            </div>
            <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Sesli Okuma Metin Başvurusu</h2>
            <p className="text-xs text-muted-foreground">Seslendirilmesini veya tasvir edilmesini istediğiniz ders yazılarını buradan doğrudan listeye ekleyin.</p>
          </div>

          {submissionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 animate-pulse">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Başvurunuz Başarıyla Gönüllü Görev Havuzuna Eklenmiştir!</span>
            </div>
          )}

          <form onSubmit={handleQuickSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold block text-foreground" htmlFor="quick-title">Başvuru Başlığı *</label>
                <input
                  id="quick-title"
                  type="text"
                  required
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Örn: 9. Sınıf Kimya Özeti"
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold block text-foreground" htmlFor="quick-name">Başvuru Sahibi Adı</label>
                <input
                  id="quick-name"
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Örn: Gizem Ç. (Gizli de kalabilir)"
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold block text-foreground tracking-wide">Kategori</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 animate-fadeIn" role="group" aria-label="Kategori seçimi">
                  {(['Ders Notu', 'Kitap', 'Makale', 'Günlük Hayat', 'Diğer'] as RequestCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setQuickCategory(cat);
                        speak(`${cat} kategorisi seçildi.`);
                      }}
                      className={`px-3 py-2.5 text-xs rounded-xl border-2 text-center transition-all duration-150 font-bold ${
                        quickCategory === cat
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold ring-4 ring-indigo-500/15'
                          : 'border-slate-300 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:text-foreground'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold block text-foreground tracking-wide">Aciliyet Önceliği</label>
                <div className="grid grid-cols-2 gap-2 animate-fadeIn" role="group" aria-label="Aciliyet önceliği seçimi">
                  {[
                    { value: 'normal', label: 'Normal Süreç' },
                    { value: 'high', label: 'Yüksek (Acil Ödev/Sınav)' }
                  ].map((urg) => (
                    <button
                      key={urg.value}
                      type="button"
                      onClick={() => {
                        setQuickUrgency(urg.value as 'normal' | 'high');
                        speak(`${urg.label} önceliği seçildi.`);
                      }}
                      className={`px-3 py-2.5 text-xs rounded-xl border-2 text-center transition-all duration-150 font-bold ${
                        quickUrgency === urg.value
                          ? urg.value === 'high'
                            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-extrabold ring-4 ring-rose-500/15'
                            : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold ring-4 ring-indigo-500/15'
                          : 'border-slate-300 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:text-foreground'
                      }`}
                    >
                      {urg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold block text-foreground" htmlFor="quick-content">Oku/Seslendir Metni İçeriği *</label>
              <textarea
                id="quick-content"
                rows={4}
                required
                value={quickBody}
                onChange={(e) => setQuickBody(e.target.value)}
                placeholder="Seslendirilmesini istediğiniz metin dökümanını buraya yapıştırın veya doğrudan kendi kelimelerinizle yazın..."
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Seslendirme Metnini Havuza Gönder</span>
            </button>
          </form>
        </div>

        {/* VOICE RECORDING STUDIO ZONE ("Kayıt alınma yeri") */}
        <div className="lg:col-span-6 p-6 rounded-3xl border-4 bg-card border-emerald-500 shadow-xl space-y-6" id="quick-recorder-block">
          <div className="space-y-1 border-b pb-4 border-emerald-100 dark:border-emerald-950">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
              <Mic className="w-3.5 h-3.5" />
              <span>SES KAYIT LAB</span>
            </div>
            <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Canlı Mikrofon & Ses Kayıt Odası</h2>
            <p className="text-xs text-muted-foreground">Seslendirme yapmadan önce mikrofon cihazınızı test edin, ses denemeleri yapın ve oynatın.</p>
          </div>

          <div className="p-5 rounded-2xl bg-muted/60 border space-y-4 relative overflow-hidden" id="quick-recording-stage-pad">
            
            {/* WAVEFORM VISUALIZATION ANIMATION */}
            {isQuickRecording ? (
              <div className="flex items-center justify-center gap-1 h-12" id="soundwave-animator">
                <span className="w-1.5 bg-red-500 rounded-full animate-pulse h-10" />
                <span className="w-1.5 bg-red-500 rounded-full animate-pulse h-6 delay-75" />
                <span className="w-1.5 bg-red-500 rounded-full animate-pulse h-8 delay-150" />
                <span className="w-1.5 bg-red-500 rounded-full animate-pulse h-12 delay-200" />
                <span className="w-1.5 bg-red-500 rounded-full animate-pulse h-4 delay-75" />
                <span className="w-1.5 bg-red-500 rounded-full animate-pulse h-8 delay-300" />
                <span className="w-1.5 bg-red-500 rounded-full animate-pulse h-10 delay-150" />
                <span className="w-1.5 bg-red-500 rounded-full animate-pulse h-6" />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 h-12 text-slate-400 dark:text-slate-500" id="soundwave-idle">
                <AudioLines className="w-10 h-10 opacity-30" />
              </div>
            )}

            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-muted-foreground block">
                {isQuickRecording ? 'SESİNİZ AKTİF OLARAK ALINIYOR...' : 'Mikrofonunuz Hazır Durumda'}
              </span>
              {isQuickRecording && (
                <span className="text-lg font-black text-red-500 font-mono">
                  Süre: {formatSecs(quickRecordDuration)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {!isQuickRecording && !quickAudioUrl ? (
                <button
                  onClick={startQuickRecording}
                  className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
                >
                  <Mic className="w-4 h-4 animate-bounce" />
                  <span>Kayıt Almaya Başla</span>
                </button>
              ) : isQuickRecording ? (
                <button
                  onClick={stopQuickRecording}
                  className="px-5 py-3 rounded-xl bg-slate-900 border border-red-500 text-red-500 font-extrabold text-xs flex items-center gap-1.5 animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span>Bitir ve Kaydet</span>
                </button>
              ) : (
                <div className="space-y-4 w-full" id="quick-recording-player-box">
                  <div className="flex items-center justify-between gap-3 bg-background p-2.5 border rounded-xl">
                    <audio src={quickAudioUrl} controls className="h-9 flex-1 max-w-full" />
                    <button
                      onClick={discardQuickRecording}
                      className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg"
                      title="Kaydı Yok Et"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={discardQuickRecording}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80"
                    >
                      Yeni Kayıt Al
                    </button>
                    <button
                      onClick={() => {
                        speak('Tebrikler! Test ses dosyanız bilgisayarınıza indiriliyor.');
                        const link = document.createElement('a');
                        link.href = quickAudioUrl;
                        link.download = `erisim_koprusu_kaydi_${Date.now()}.webm`;
                        link.click();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1"
                    >
                      <span>Kayıt Dosyasını İndir</span>
                    </button>
                  </div>
                </div>
              )}

              {!isQuickRecording && !quickAudioUrl && (
                <button
                  onClick={handleAISimulateSound}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 text-xs flex items-center gap-1"
                  title="Yapay zeka ile ses testi oluştur"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Akıllı Ses Sinyali Simüle Et</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#3b82f6]/5 p-4 rounded-2xl border border-blue-500/10 text-xs text-muted-foreground leading-relaxed flex gap-2">
            <AlertCircle className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
            <span>
              <strong>Gönüllü İpuçları:</strong> Kayıt aldığınızda arka planda ses paraziti olmamasına ve ses seviyenizin yüksekliğine özen göstermeniz engelli arkadaşlarımızın sizi çok daha rahat dinlemesini sağlayacaktır.
            </span>
          </div>
        </div>

      </section>

      {/* FOOTER INFO STATS */}
      <section className="p-6 rounded-2xl border bg-card/45 grid grid-cols-1 md:grid-cols-3 gap-6" id="footer-why">
        <div className="flex gap-3">
          <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 h-fit">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Katı Güvenlik Kontrolü</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Eklenen yazılı ve sesli tüm içerikler, dezenformasyonu önlemek amacıyla yapay zeka ve gönüllü moderatörlerimizce anlık denetlenir.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
            <Users className="w-5 h-5" />
          </span>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Geniş Topluluk Erişimi</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Hazırladığınız materyaller, Türkiye genelindeki yüzlerce görme engelli öğrencinin doğrudan eğitim arşivine dahil edilir.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 h-fit">
            <Smile className="w-5 h-5" />
          </span>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">%100 Reklamsız & Kar Amacı Gütmez</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Platformumuz tamamen gönüllü katkılarıyla büyümekte olup, herhangi bir ticari amaç gütmemektedir.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
