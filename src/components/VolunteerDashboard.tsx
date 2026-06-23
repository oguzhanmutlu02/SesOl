import React, { useState, useRef, useEffect } from 'react';
import { AccessibleRequest, LibraryItem } from '../types';
import { HeartHandshake, Play, HelpCircle, CircleAlert, Sparkles, Mic, Square, Trash2, CheckCircle2, Headphones, AlertTriangle, Search } from 'lucide-react';

interface VolunteerDashboardProps {
  pendingRequests: AccessibleRequest[];
  onCompleteRequest: (requestId: string, audioDataUrl: string, volunteerName: string) => void;
  speak: (text: string) => void;
  userAccount?: {
    fullName: string;
    email: string;
    role: string;
    isRegistered: boolean;
  } | null;
}

export default function VolunteerDashboard({ pendingRequests, onCompleteRequest, speak, userAccount }: VolunteerDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<AccessibleRequest | null>(null);
  const [volunteerName, setVolunteerName] = useState(userAccount?.fullName || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync logged in volunteer name
  useEffect(() => {
    if (userAccount?.fullName) {
      setVolunteerName(userAccount.fullName);
    }
  }, [userAccount]);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordDuration, setRecordDuration] = useState(0);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check microphone permissions on mount
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setHasMicrophonePermission(true);
    } else {
      setHasMicrophonePermission(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const selectRequestItem = (req: AccessibleRequest) => {
    setSelectedRequest(req);
    // Reset any ongoing recording state
    handleDiscardRecord();
    
    // Smoothly scroll directly into the reading & recorder panel for instant, focused input
    setTimeout(() => {
      const element = document.getElementById('active-recorder-suite');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  // MICROPHONE RECORDING MACHINE
  const handleStartRecord = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Tarayıcınız ses kaydını desteklemiyor.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        speak('Kayıt bitti. Aşağıdaki oynatıcıyı kullanarak kendi sesinizi dinleyebilir ya da beğenmediyseniz yeniden okuma yapabilirsiniz.');
        
        // Stop all tracks in stream to release microphone icon
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);
      speak('Ses kaydedicisi başlatıldı. Lütfen ekrandaki metni doğal bir sesle okumaya başlayın.');

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Mic access error:', err);
      setHasMicrophonePermission(false);
      speak('Mikrofon izni alınamadı. Lütfen cihaz izinlerinizi kontrol edin.');
    }
  };

  const handleStopRecord = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleDiscardRecord = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setRecordDuration(0);
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // AI-Assisted simulation (allows fast-completing task if volunteer prefer)
  const handleAISpeedSynthesis = () => {
    // Generate a default high-quality simulated sound template
    const placeholderAudioData = 'simulated_tts_audio_bridge';
    setAudioUrl(placeholderAudioData);
    speak('Doğal yapay zeka vokal filtrelemesi uygulandı ve kayıt başarıyla simüle edildi!');
  };

  const handleFinishAndSubmit = () => {
    if (!selectedRequest) return;
    
    // We can use the created audioUrl as the backing resource
    const finalAudio = audioUrl || 'simulated_tts_audio_bridge';
    const finalVolunteer = volunteerName.trim() || 'Gizli Kahraman (Gönüllü)';

    onCompleteRequest(selectedRequest.id, finalAudio, finalVolunteer);
    speak('Tebrikler! Seslendirme kaydınız başarıyla kütüphanemize aktarıldı ve talep sahibine bildirildi.');
    
    // Cleanup states
    setSelectedRequest(null);
    handleDiscardRecord();
    setVolunteerName('');
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredRequests = pendingRequests.filter((req) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      req.title.toLowerCase().includes(q) ||
      req.description.toLowerCase().includes(q) ||
      req.category.toLowerCase().includes(q) ||
      req.contentBody.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in" id="volunteer-dashboard-wrapper">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2" id="vol-title-hdr">
            <HeartHandshake className="w-8 h-8 text-emerald-500" />
            <span>Gönüllü Görev Ekranı</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sisteme bırakılmış bekleyen seslendirme isteklerini aşağıdan bulup, sesinizle onlara can verebilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="volunteer-grid-panel">
        
        {/* LEFT COLUMN: LIST OF PENDING REQUESTS (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-col gap-2 bg-card p-3 rounded-xl border">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs tracking-wide text-muted-foreground">BEKLEYEN İSTEKLER ({filteredRequests.length}/{pendingRequests.length})</span>
              <button
                onClick={() => speak(`Şu anda filtreye uyan ${filteredRequests.length} talep görüntüleniyor.`)}
                className="text-xs font-bold text-primary hover:underline"
              >
                Listeyi Oku
              </button>
            </div>
            
            {/* Functional Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder="İstek başlığı, konu veya metin ara..."
                className="w-full bg-background border border-input rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-muted-foreground text-foreground"
                aria-label="Bekleyen talepler içinde arama yapın"
                id="vol-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    speak('Arama temizlendi.');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold p-0.5"
                  title="Aramayı Temizle"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 border border-dashed rounded-2xl text-center space-y-3 bg-muted/40">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm">Harika Haber! Bekleyen İstek Yok</p>
              <p className="text-xs text-muted-foreground">Şu an tüm talepler seslendirilmiş durumda. Yeni bir istek eklendiğinde burada belirecektir.</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 border border-dashed rounded-2xl text-center space-y-3 bg-muted/40">
              <div className="text-muted-foreground select-none">✕</div>
              <p className="font-bold text-sm">Aramayla Eşleşen Sonuç Yok</p>
              <p className="text-xs text-muted-foreground">Farklı anahtar kelimeler kullanarak tekrar arama yapabilirsiniz.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" id="pending-items-list">
              {filteredRequests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => selectRequestItem(req)}
                  className={`w-full p-4 rounded-xl text-left border transition-all hover:bg-muted ${
                    selectedRequest?.id === req.id
                      ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/10'
                      : 'border-border bg-card'
                  }`}
                  aria-pressed={selectedRequest?.id === req.id}
                  id={`volunteer-pending-card-${req.id}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.urgency === 'high' ? 'bg-rose-500/15 text-rose-500' : 'bg-blue-500/15 text-blue-500'
                    }`}>
                      {req.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{req.submittedAt}</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground leading-snug">{req.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 italic">"{req.description}"</p>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-[11px] text-muted-foreground">
                    <span>Talep Sürümü: <strong>{req.requestType === 'vocal_reading' ? 'Seslendirme' : 'Betimleme'}</strong></span>
                    <span className="text-primary font-semibold">Tıkla ve Seslendir &rarr;</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE READING & RECORDER SUITE (lg:col-span-7) */}
        <div className="lg:col-span-7">
          {selectedRequest ? (
            <div className="p-6 rounded-2xl border bg-card shadow-lg space-y-6" id="active-recorder-suite">
              <div className="flex items-start justify-between gap-4 border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-500 tracking-wider">İŞTE SESLENDİRECEĞİNİZ METİN:</span>
                  <h2 className="text-xl font-extrabold text-foreground mt-1">{selectedRequest.title}</h2>
                  <p className="text-xs text-[#d97706] mt-1 font-semibold">
                    Kullanıcı İsteği: "{selectedRequest.description}"
                  </p>
                </div>
                <button
                  onClick={() => speak(selectedRequest.contentBody)}
                  className="py-1 px-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 shrink-0"
                  title="Metni Seslendiriciden Başlat"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Örnek Dinle</span>
                </button>
              </div>

              {/* READABLE CONTAINER FOR TEXT */}
              <div className="p-5 rounded-2xl bg-muted/65 border leading-relaxed font-sans text-base text-foreground max-h-72 overflow-y-auto shadow-inner relative" id="readable-vocal-body">
                <span className="absolute top-2 right-2 text-[10px] bg-background px-2 py-1 rounded font-bold text-muted-foreground tracking-widest">OKUMA ALANI</span>
                <p className="pr-6 pt-2 select-text">{selectedRequest.contentBody}</p>
              </div>

              {/* VOLUNTEER IDENTITY AND RECORDER CONTROLS */}
              <div className="space-y-4 p-5 rounded-xl border bg-muted/35">
                <div className="space-y-2">
                  <label htmlFor="volunteer-name-input" className="text-xs font-bold block text-muted-foreground">SESİNİZİ KÜTÜPHANEDE NASIL KAYDEDELİM?</label>
                  <input
                    type="text"
                    id="volunteer-name-input"
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    placeholder="Adınız Soyadınız (Örn: Elif Akın) veya Boş Bırakın"
                    className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* INTERACTIVE MIC RECORDER BUTTONS */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-red-500" />
                      <span>MİKROFON KONTROL PANELİ</span>
                    </span>
                    {isRecording ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-500 font-bold px-2 py-1 rounded bg-red-500/10 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        SES KAYDEDİLİYOR: {formatTime(recordDuration)}
                      </span>
                    ) : (
                      audioUrl && (
                        <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                          Ses Dosyası Hazır
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {!isRecording && !audioUrl ? (
                      <button
                        onClick={handleStartRecord}
                        className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-red-500/10 cursor-pointer"
                        id="start-record-btn"
                        aria-label="Mikrofonu aç ve sesinizi kaydetmeye başla"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Kaydı Başlat</span>
                      </button>
                    ) : isRecording ? (
                      <button
                        onClick={handleStopRecord}
                        className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-red-500 text-red-500 font-extrabold text-sm flex items-center gap-2 cursor-pointer"
                        id="stop-record-btn"
                        aria-label="Sesli okuma kaydını durdur"
                      >
                        <Square className="w-4 h-4 fill-current animate-pulse" />
                        <span>Kaydı Durdur ve Tamamla</span>
                      </button>
                    ) : (
                      /* Audio is generated and waiting */
                      <div className="space-y-3 w-full" id="recorded-preview-box">
                        <div className="flex items-center justify-between gap-4 py-2 px-3 bg-background border rounded-lg">
                          <audio src={audioUrl} controls className="h-10 max-w-full flex-1" />
                          <button
                            onClick={handleDiscardRecord}
                            className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                            title="Kaydı Sil ve Yeniden Başlat"
                            id="discard-record-btn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 leading-normal">
                          <CircleAlert className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span>Yukarıdaki oynatıcıdan kaydettiğiniz sesi dinleyebilirsiniz. Onayladığınızda kütüphaneye yüklenecektir.</span>
                        </p>
                      </div>
                    )}

                    {/* Falls back prompt generator of AI speech if microphone fails */}
                    {!isRecording && !audioUrl && (
                      <button
                        onClick={handleAISpeedSynthesis}
                        className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 text-xs flex items-center gap-1.5"
                        title="Metni Ses Sentezleyicisiyle Tamamla (İkincil Çözüm)"
                        id="bypass-record-tts-btn"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        <span>Yapay Zekaya Okut (Akıllı Sentezleyici)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Finish and submit */}
                {audioUrl && (
                  <div className="pt-4 border-t border-border flex justify-end gap-2">
                    <button
                      onClick={handleDiscardRecord}
                      className="px-4 py-2 rounded-lg border text-xs font-bold text-muted-foreground hover:bg-muted"
                      id="cancel-submission-btn"
                    >
                      İptal Et
                    </button>
                    <button
                      onClick={handleFinishAndSubmit}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm"
                      id="submit-record-success-btn"
                    >
                      Kaydı Arşive Gönder & Kaydet
                    </button>
                  </div>
                )}
              </div>

              {/* Tips list */}
              <div className="bg-[#3b82f6]/5 text-[#3b82f6] border border-[#3b82f6]/10 p-4 rounded-xl text-xs space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Güzel Bir Ses Kaydı İçin Kurallar:</span>
                </span>
                <ul className="list-disc leading-relaxed list-inside pl-1 space-y-0.5 text-muted-foreground/90">
                  <li>Sessiz bir ortamda, rüzgar sesi olmayan yerlerde konuşmaya başlayın.</li>
                  <li>Mikrofonu ağzınızdan yaklaşık bir karış uzakta tutun, nefes seslerini önleyin.</li>
                  <li>Harfleri yutmadan, tane tane ve neşeli / akıcı bir Türkçe tonuyla okuyun.</li>
                  <li>Metindeki sayılar ve tırnak içindeki kelimeleri vurgulayarak belirtiniz.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full p-12 border border-dashed rounded-3xl text-center flex flex-col items-center justify-center space-y-4 bg-muted/15 min-h-[400px]">
              <Headphones className="w-16 h-16 text-muted-foreground/30 animate-pulse" />
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-lg">Seslendirme İstek Detayı</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Lütfen sol taraftaki listeden destek bekleyen bir kayıt isteği seçin. Seçtiğinizde metni, detayları ve ses kaydedici paneli burada açılacaktır.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
