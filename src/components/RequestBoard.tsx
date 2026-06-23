import React, { useState, useRef } from 'react';
import { AccessibleRequest, RequestCategory, RequestType } from '../types';
import { PlusCircle, HelpCircle, FileText, Sparkles, Image, CheckCircle, ShieldAlert, Play, Clock, Eye, Mic, Search, Volume2 } from 'lucide-react';

interface RequestBoardProps {
  requests: AccessibleRequest[];
  onCreateRequest: (req: AccessibleRequest) => void;
  speak: (text: string, onBoundary?: (charIndex: number) => void, onEnd?: () => void) => void;
  userAccount?: {
    fullName: string;
    email: string;
    role: string;
    isRegistered: boolean;
  } | null;
}

export default function RequestBoard({ requests, onCreateRequest, speak, userAccount }: RequestBoardProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RequestCategory>('Ders Notu');
  const [requestType, setRequestType] = useState<RequestType>('vocal_reading');
  const [contentBody, setContentBody] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'high'>('normal');
  const [name, setName] = useState(userAccount?.fullName || '');
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search & Filter state for board
  const [boardSearch, setBoardSearch] = useState('');
  const [boardStatusFilter, setBoardStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Interactive local play controls for volunteer recordings
  const [playingRecId, setPlayingRecId] = useState<string | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayRecording = (recId: string, audioUrl: string, textBody: string) => {
    if (playingRecId === recId) {
      // Pause current
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
      speak(''); // Cancels synthesis
      setPlayingRecId(null);
    } else {
      // Stop ongoing
      if (localAudioRef.current) {
        localAudioRef.current.pause();
        localAudioRef.current = null;
      }
      speak(''); // Stops speech synthesis queue

      if (audioUrl && audioUrl !== 'simulated_tts_audio_bridge') {
        try {
          const audio = new Audio(audioUrl);
          localAudioRef.current = audio;
          audio.play().then(() => {
            setPlayingRecId(recId);
          }).catch((err) => {
            console.error('Local play failed, falling back to synthesis:', err);
            speak(`Gönüllü seslendirmesi yapay zeka ile okunuyor: ${textBody}`, undefined, () => {
              setPlayingRecId(null);
            });
            setPlayingRecId(recId);
          });

          audio.onended = () => {
            setPlayingRecId(null);
          };
        } catch (e) {
          speak(textBody, undefined, () => {
            setPlayingRecId(null);
          });
          setPlayingRecId(recId);
        }
      } else {
        speak(`Gönüllü seslendirmesi yapay zeka ile okunuyor: ${textBody}`, undefined, () => {
          setPlayingRecId(null);
        });
        setPlayingRecId(recId);
      }
    }
  };

  // Cleanup on unmount or tab switch
  React.useEffect(() => {
    return () => {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
      speak('');
    };
  }, []);

  // Sync logged in user name
  React.useEffect(() => {
    if (userAccount?.fullName) {
      setName(userAccount.fullName);
    }
  }, [userAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !contentBody.trim()) {
      speak('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    const newReq: AccessibleRequest = {
      id: `req_${Date.now()}`,
      title,
      description,
      category,
      requestType,
      contentBody,
      urgency,
      submittedBy: name.trim() || 'Gizli Destek İsteyen',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending'
    };

    onCreateRequest(newReq);
    speak('Talebiniz başarıyla yayınlandı. Gönüllülerimiz en kısa sürede seslendirip kütüphaneye ekleyecektir.');
    setSuccessMsg('Destek isteğiniz sisteme yüklendi ve Gönüllü Panosuna aktarıldı!');
    
    // Clear Form
    setTitle('');
    setDescription('');
    setContentBody('');
    setName('');
    setTimeout(() => {
      setSuccessMsg('');
      setShowForm(false);
    }, 4000);
  };

  const readRequestStatusSummary = (req: AccessibleRequest) => {
    const statusText = req.status === 'completed' 
      ? 'Gönüllümüz tarafından seslendirildi ve kütüphaneye yüklendi.' 
      : 'Gönüllü seslendirmesi bekliyor.';
    speak(`Talep başlığı ${req.title}. Kategori ${req.category}. Durum: ${statusText}`);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="request-board-wrapper">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" id="request-title-main">
            Destek İstek Panosu
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Okunacak dökümanlarınızı, resim tanımlamalarınızı veya özel destek taleplerinizi buradan sisteme kaydedin.
          </p>
        </div>

        <button
          onClick={() => {
            const state = !showForm;
            setShowForm(state);
            speak(state ? 'Yeni destek formu açıldı. Alanları doldurabilirsiniz.' : 'Destek formu kapatıldı.');
          }}
          className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          id="toggle-request-form-btn"
          aria-expanded={showForm}
        >
          <PlusCircle className="w-5 h-5" />
          <span>{showForm ? 'Formu Kapat' : 'Yeni Destek İsteği Yap'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 animate-pulse" id="success-message">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      {/* RENDER FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border bg-card shadow-xl space-y-6" id="new-request-form">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-3" id="form-heading">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Destek Talep Bilgileri</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold block" htmlFor="req-title-input">Talebinizin Başlığı *</label>
              <input
                id="req-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 10. Sınıf Biyoloji Sindirim Notu"
                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-muted-foreground block">Talebi tanımlayan kısa ve net bir başlık.</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold block" htmlFor="req-name-input">Adınız veya Takma Adınız</label>
              <input
                id="req-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Mehmet Caner (İsteğe Bağlı)"
                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-bold block text-foreground">Kategori</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" role="group" aria-label="Kategori seçimi">
                {(['Ders Notu', 'Kitap', 'Makale', 'Günlük Hayat', 'Diğer'] as RequestCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      speak(`${cat} kategorisi seçildi.`);
                    }}
                    className={`px-3 py-2.5 text-xs rounded-xl border-2 text-center transition-all duration-150 font-bold ${
                      category === cat
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold ring-4 ring-indigo-500/15'
                        : 'border-slate-300 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Assistance Type */}
            <div className="space-y-2">
              <label className="text-sm font-bold block text-foreground">İstenen Destek Türü</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="İstenen destek türü seçimi">
                {[
                  { value: 'vocal_reading', label: 'Sesli Okuma (Vokal)' },
                  { value: 'image_description', label: 'Görsel Betimleme (Resim Açıklama)' },
                  { value: 'sign_language', label: 'İşaret Dili Çevirisi' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setRequestType(type.value as RequestType);
                      speak(`${type.label} destek türü seçildi.`);
                    }}
                    className={`px-3 py-2.5 text-xs rounded-xl border-2 text-center transition-all duration-150 font-bold ${
                      requestType === type.value
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold ring-4 ring-indigo-500/15'
                        : 'border-slate-300 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:text-foreground'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <label className="text-sm font-bold block text-foreground">Aciliyet Durumu</label>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Aciliyet önceliği seçimi">
                {[
                  { value: 'normal', label: 'Normal Süreç' },
                  { value: 'high', label: 'Yüksek (Sınav/Acil Reçete)' }
                ].map((urg) => (
                  <button
                    key={urg.value}
                    type="button"
                    onClick={() => {
                      setUrgency(urg.value as 'normal' | 'high');
                      speak(`${urg.label} seçildi.`);
                    }}
                    className={`px-3 py-2.5 text-xs rounded-xl border-2 text-center transition-all duration-150 font-bold ${
                      urgency === urg.value
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

          <div className="space-y-2">
            <label className="text-sm font-bold block" htmlFor="req-desc-input">Gönüllü İçin Açıklama (Seslendirme Talimatı) *</label>
            <textarea
              id="req-desc-input"
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Gönüllünün nelere dikkat etmesini istersiniz? Örn: Yavaş tempoda ve her noktalama işaretinde durarak okumanızı rica ederim."
              className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold block" htmlFor="req-body-input">Seslendirilecek veya Betimlenecek Metin İçeriği *</label>
            <textarea
              id="req-body-input"
              rows={6}
              required
              value={contentBody}
              onChange={(e) => setContentBody(e.target.value)}
              placeholder="Gönüllünün seslendirmesini istediğiniz metni buraya yapıştırın veya yazın. Eğer resim betimlemesi istiyorsanız resme ait detayları veya resmi betimleyin."
              className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border hover:bg-muted text-sm font-bold"
              id="cancel-form-btn"
            >
              İptal Et
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm"
              id="submit-request-btn"
            >
              İsteği Yayınla
            </button>
          </div>
        </form>
      )}

      {/* TRACKING REQUEST STATUSES */}
      <section className="space-y-4" id="tracking-portal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold" id="tracking-title-list">Aktif Destek İstekleri ve Süreç Takibi</h2>
          </div>
          <span className="text-xs text-muted-foreground font-bold bg-muted px-3 py-1.5 rounded-xl self-start md:self-auto">
            Görüntülenen: {
              requests.filter((req) => {
                const q = boardSearch.trim().toLowerCase();
                const matchesSearch = !q || (
                  req.title.toLowerCase().includes(q) ||
                  req.description.toLowerCase().includes(q) ||
                  req.category.toLowerCase().includes(q) ||
                  req.contentBody.toLowerCase().includes(q) ||
                  req.submittedBy.toLowerCase().includes(q)
                );
                const matchesStatus = boardStatusFilter === 'all' || req.status === boardStatusFilter;
                return matchesSearch && matchesStatus;
              }).length
            } / {requests.length} İstek
          </span>
        </div>

        {/* Search Bar and Status Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-muted/40 p-3 rounded-2xl border">
          {/* Search box */}
          <div className="md:col-span-7 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              value={boardSearch}
              onChange={(e) => setBoardSearch(e.target.value)}
              placeholder="İstek başlığı, açıklama, kategori veya kişi adı ara..."
              className="w-full bg-background border border-input rounded-xl pl-10 pr-8 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-muted-foreground text-foreground"
              aria-label="Süreç takibinde arama yapın"
              id="board-search-input"
            />
            {boardSearch && (
              <button
                onClick={() => {
                  setBoardSearch('');
                  speak('Durum takibi araması temizlendi.');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
                title="Aramayı Temizle"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status buttons group */}
          <div className="md:col-span-5 flex bg-background p-1 rounded-xl border border-input">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'pending', label: 'Bekleyenler' },
              { id: 'completed', label: 'Seslendirilenler' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setBoardStatusFilter(st.id as any);
                  speak(`${st.label} seçildi.`);
                }}
                className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all ${
                  boardStatusFilter === st.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {requests.filter((req) => {
          const q = boardSearch.trim().toLowerCase();
          const matchesSearch = !q || (
            req.title.toLowerCase().includes(q) ||
            req.description.toLowerCase().includes(q) ||
            req.category.toLowerCase().includes(q) ||
            req.contentBody.toLowerCase().includes(q) ||
            req.submittedBy.toLowerCase().includes(q)
          );
          const matchesStatus = boardStatusFilter === 'all' || req.status === boardStatusFilter;
          return matchesSearch && matchesStatus;
        }).length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center bg-muted/10 text-muted-foreground" id="no-search-results-board">
            <p className="font-bold text-sm">Aradığınız kriterlere uygun aktif destek isteği yok.</p>
            <p className="text-xs mt-1">Lütfen arama dizesini veya durum filtresini değiştirmeyi deneyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="tracking-grid">
            {requests
              .filter((req) => {
                const q = boardSearch.trim().toLowerCase();
                const matchesSearch = !q || (
                  req.title.toLowerCase().includes(q) ||
                  req.description.toLowerCase().includes(q) ||
                  req.category.toLowerCase().includes(q) ||
                  req.contentBody.toLowerCase().includes(q) ||
                  req.submittedBy.toLowerCase().includes(q)
                );
                const matchesStatus = boardStatusFilter === 'all' || req.status === boardStatusFilter;
                return matchesSearch && matchesStatus;
              })
              .map((req) => (
            <div 
              key={req.id}
              className="p-5 rounded-2xl border bg-card hover:shadow-md transition-all flex flex-col justify-between gap-4"
              id={`request-track-card-${req.id}`}
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                    req.urgency === 'high' 
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                      : 'bg-[#3b82f6]/10 text-[#3b82f6]'
                  }`}>
                    {(req.category === 'Ders Notu' ? 'DERS NOTU' : req.category === 'Kitap' ? 'KİTAP' : req.category === 'Makale' ? 'MAKALE' : req.category === 'Günlük Hayat' ? 'GÜNLÜK HAYAT' : req.category === 'Diğer' ? 'DİĞER' : req.category)} • {req.urgency === 'high' ? 'ACİL' : 'NORMAL'}
                  </span>
                  
                  {req.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5 fill-current" />
                      Seslendirildi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      Bekliyor
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base leading-snug">{req.title}</h3>
                  <p className="text-xs text-muted-foreground italic">Talep: {req.description}</p>
                </div>

                <details className="text-xs bg-muted/50 rounded-xl p-3 border border-border cursor-pointer group" open>
                  <summary className="font-bold flex items-center justify-between text-[11px] text-muted-foreground group-open:mb-2 select-none">
                    <span>Talep Edilen Metin Detayı</span>
                    <span className="text-[10px] bg-background border px-1.5 py-0.5 rounded">Gizle/Göster</span>
                  </summary>
                  <p className="text-muted-foreground leading-relaxed mt-2 p-2.5 bg-background rounded-lg border max-h-48 overflow-y-auto font-sans select-text whitespace-pre-wrap">{req.contentBody}</p>

                  {/* RECORDED VOICE SESSIONS PUBLISHED UNDER THE TEXT (yapılan seslendirmelerin kaydını tut ve yayınla) */}
                  {((req.recordings && req.recordings.length > 0) || (req.status === 'completed' && req.audioUrl)) ? (
                    <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl space-y-2 select-none" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold tracking-wide text-[10px]">
                        <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>YAYINLANAN GÖNÜLLÜ SESLENDİRMELERİ</span>
                      </div>
                      <div className="space-y-2">
                        {req.recordings && req.recordings.length > 0 ? (
                          req.recordings.map((rec) => (
                            <div 
                              key={rec.id} 
                              onClick={() => handlePlayRecording(rec.id, rec.audioUrl || '', req.contentBody)}
                              className={`p-2.5 rounded-xl bg-background hover:bg-emerald-500/5 border ${playingRecId === rec.id ? 'border-emerald-400 bg-emerald-500/10 shadow-sm animate-pulse' : 'border-emerald-500/20'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer group/rec`}
                              title="Tıklayınca seslendirmeyi dinlemeye başlamak veya duraklatmak için tıklayın."
                            >
                              <div className="flex items-center gap-2.5 text-left">
                                <div className={`p-1.5 rounded-full ${playingRecId === rec.id ? 'bg-emerald-500 text-slate-950 animate-bounce' : 'bg-muted text-emerald-400 group-hover/rec:bg-emerald-500/15 transition-all'}`}>
                                  {playingRecId === rec.id ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-extrabold text-foreground">
                                    Seslendiren: <strong className="text-emerald-400 font-black">{rec.volunteerName}</strong>
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-muted-foreground">Yayınlanma: {rec.createdAt}</span>
                                    {(!rec.audioUrl || rec.audioUrl === 'simulated_tts_audio_bridge') && (
                                      <span className="text-[8px] bg-sky-500/10 text-sky-400 px-1 py-0 rounded font-bold font-mono">Yapım: Yapay Zeka</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 text-right">
                                <span className={`text-[10px] font-black tracking-widest ${playingRecId === rec.id ? 'text-rose-500 animate-pulse' : 'text-emerald-400'} uppercase group-hover/rec:translate-x-0.5 transition-transform`}>
                                  {playingRecId === rec.id ? '■ SESİ DURDUR' : '▶ ŞİMDİ DİNLE'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div 
                            onClick={() => handlePlayRecording(req.id, req.audioUrl || '', req.contentBody)}
                            className={`p-2.5 rounded-xl bg-background hover:bg-emerald-500/5 border ${playingRecId === req.id ? 'border-emerald-400 bg-emerald-500/10 shadow-sm animate-pulse' : 'border-emerald-500/20'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer group/rec`}
                            title="Tıklayınca seslendirmeyi dinlemeye başlamak veya duraklatmak için tıklayın."
                          >
                            <div className="flex items-center gap-2.5 text-left">
                              <div className={`p-1.5 rounded-full ${playingRecId === req.id ? 'bg-emerald-500 text-slate-950 animate-bounce' : 'bg-muted text-emerald-400 group-hover/rec:bg-emerald-500/15 transition-all'}`}>
                                {playingRecId === req.id ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-extrabold text-foreground">
                                  Seslendiren: <strong className="text-emerald-400 font-black">{req.completedBy || 'Gönüllü'}</strong>
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-muted-foreground">Yayınlanma: {req.completedAt || 'Şimdi'}</span>
                                  {(!req.audioUrl || req.audioUrl === 'simulated_tts_audio_bridge') && (
                                    <span className="text-[8px] bg-sky-500/10 text-sky-400 px-1 py-0 rounded font-bold font-mono">Yapım: Yapay Zeka</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 text-right">
                              <span className={`text-[10px] font-black tracking-widest ${playingRecId === req.id ? 'text-rose-500 animate-pulse' : 'text-emerald-400'} uppercase group-hover/rec:translate-x-0.5 transition-transform`}>
                                {playingRecId === req.id ? '■ SESİ DURDUR' : '▶ ŞİMDİ DİNLE'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-[#eab308] bg-[#eab308]/10 p-2 rounded-lg border border-[#eab308]/20 font-semibold flex items-center gap-1 select-none">
                      ⚠️ Henüz gönüllü ses kaydı yapılmamış. İlk okumayı yapmak için Gönüllü Görevleri tabına geçebilirsiniz!
                    </p>
                  )}
                </details>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">İsteyen: </span>
                  <span className="font-semibold text-foreground">{req.submittedBy}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => readRequestStatusSummary(req)}
                    className="p-1 px-2.5 rounded bg-muted hover:bg-muted/80 text-[11px] font-bold text-muted-foreground flex items-center gap-1"
                    title="Durumu Sesli Oku"
                    aria-label={`${req.title} durumu hakkında sesli bilgi edin`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Konuş</span>
                  </button>

                  {req.status === 'completed' && req.audioUrl && (
                    <button
                      onClick={() => {
                        speak('Gönüllünün hazırladığı ses dosyası oynatılıyor.');
                        // Trigger synthetic voice audio speech of content directly
                        speak(req.contentBody);
                      }}
                      className="p-1 px-3 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1"
                      title="Ses Dosyasını Dinle"
                      aria-label="Tamamlanmış ses kaydını dinle"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Dinle</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </section>
    </div>
  );
}
