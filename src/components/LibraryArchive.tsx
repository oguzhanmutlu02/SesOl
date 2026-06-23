import React, { useState } from 'react';
import { LibraryItem, RequestCategory } from '../types';
import { Search, Eye, ThumbsUp, Calendar, Headset, BookOpen, Layers, Sparkles, Volume2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface LibraryArchiveProps {
  items: LibraryItem[];
  speak: (text: string) => void;
  stopSpeak: () => void;
  isSynthesizing: boolean;
  settingsSpeed: number;
}

export default function LibraryArchive({ items, speak, stopSpeak, isSynthesizing, settingsSpeed }: LibraryArchiveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RequestCategory | 'Tümü'>('Tümü');
  const [activePlayItem, setActivePlayItem] = useState<LibraryItem | null>(null);
  const [expandedTextIds, setExpandedTextIds] = useState<Record<string, boolean>>({});

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.narrator || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectItem = (item: LibraryItem) => {
    setActivePlayItem(item);
    speak(`${item.title} adlı eseri seçtiniz. Dinlemek için oynatıcıdaki başlat butonuna tıklayın ya da ALT+S kısayoluyla sesli asistanı kullanın.`);
  };

  const categories: (RequestCategory | 'Tümü')[] = ['Tümü', 'Ders Notu', 'Kitap', 'Makale', 'Günlük Hayat', 'Diğer'];

  return (
    <div className="space-y-8 animate-fade-in" id="library-archive-wrapper">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2" id="lib-title-hdr">
            <BookOpen className="w-8 h-8 text-indigo-500" />
            <span>Ortak Sesli Kütüphane Arşivi</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gönüllülerimizin sesleriyle canlandırdığı ders notlarını, kitap özetlerini ve rehberleri sınırsız dinleyin.
          </p>
        </div>
      </div>

      {/* AUDIO PLAYER STAGE (if an item is playing) */}
      {activePlayItem ? (
        <div className="space-y-2" id="active-play-section">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#f59e0b] tracking-wider flex items-center gap-1">
              <Headset className="w-4 h-4 animate-bounce" />
              <span>ŞU ANDA AKTİF OYNATICI:</span>
            </span>
            <button
              onClick={() => {
                setActivePlayItem(null);
                stopSpeak();
                speak('Oynatıcı kapatıldı.');
              }}
              className="text-xs font-bold text-rose-500 hover:underline"
              id="close-player-btn"
            >
              Oynatıcıyı Kapat
            </button>
          </div>
          <AudioPlayer 
            item={activePlayItem} 
            speak={speak} 
            stopSpeak={stopSpeak} 
            isSynthesizing={isSynthesizing} 
            settingsSpeed={settingsSpeed}
          />
        </div>
      ) : (
        <div className="p-8 border border-dashed rounded-3xl text-center bg-muted/20 text-muted-foreground flex items-center justify-center gap-3" id="player-idle-box">
          <Volume2 className="w-5 h-5 text-indigo-500 animate-pulse" />
          <span className="text-sm font-semibold">Aşağıdaki arşiv listesinden dinlemek istediğiniz eserin "Oynat" veya "Seç" butonuna basın.</span>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-card p-4 rounded-2xl border" id="filter-controls">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Başlık, konu veya gönüllü adı arayın..."
            className="w-full bg-background border border-input rounded-xl pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground text-foreground"
            aria-label="Kütüphanede arama yapın"
            id="lib-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                speak('Kütüphane araması temizlendi.');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold p-1"
              title="Aramayı Temizle"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="md:col-span-8 flex flex-wrap gap-1.5 overflow-x-auto" role="group" aria-label="Kategori filtreleri">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                speak(`${cat} kategorisi listeleniyor.`);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground font-extrabold shadow-sm'
                  : 'bg-muted hover:bg-muted/80 text-foreground border border-transparent'
              }`}
              id={`filter-chip-${cat.replace(' ', '-')}`}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ARCHIVE ITEMS LIST */}
      {filteredItems.length === 0 ? (
        <div className="p-16 border rounded-3xl text-center space-y-3 bg-muted/10">
          <Layers className="w-12 h-12 text-muted-foreground/35 mx-auto" />
          <p className="font-bold text-base text-foreground">Herhangi Bir Yayın Bulunamadı</p>
          <p className="text-xs text-muted-foreground">Yazdığınız arama kriterine veya seçtiğiniz kategoriye uyan yayınlanmış kayıt yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="archive-items-grid">
          {filteredItems.map((item) => {
            const isPlayingThis = activePlayItem?.id === item.id;
            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border bg-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-5 relative overflow-hidden ${
                  isPlayingThis ? 'border-amber-400 ring-2 ring-amber-400/10' : 'hover:border-border'
                }`}
                id={`archive-card-${item.id}`}
              >
                {isPlayingThis && (
                  <span className="absolute top-0 right-0 bg-amber-400 text-slate-950 px-3 py-1 rounded-bl-xl text-[9px] font-extrabold tracking-widest flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3 fill-current" />
                    ŞU AN ÇALIYOR
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[10px] bg-slate-100 dark:bg-zinc-800 border px-2 py-0.5 rounded-full text-foreground/80">
                      {item.category}
                    </span>
                    <span className="text-muted-foreground text-[10px] font-mono">{item.duration} dk</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-foreground line-clamp-1 leading-tight">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">"{item.description}"</p>
                  </div>

                  {/* Collapsible Transcript Text Box */}
                  {expandedTextIds[item.id] && (
                    <div className="mt-2.5 p-3.5 bg-muted/60 rounded-xl text-xs space-y-1.5 border border-border/30 select-text transition-all animate-slide-down">
                      <span className="font-mono text-[9px] text-indigo-400 tracking-widest font-bold block">YAZILI MATBU METİN:</span>
                      <p className="leading-relaxed text-foreground max-h-40 overflow-y-auto pr-1 whitespace-pre-wrap select-text">{item.textBody}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  <div className="text-[11px] text-muted-foreground space-y-1.5">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Oynatım:</span>
                      <strong className="text-foreground">{item.views}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Gönüllü:</span>
                      <strong className="text-emerald-500">{item.narrator}</strong>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        const nextState = !expandedTextIds[item.id];
                        setExpandedTextIds(prev => ({ ...prev, [item.id]: nextState }));
                        speak(nextState ? 'Kitap metni aşağıda açıldı.' : 'Kitap metni kapatıldı.');
                      }}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        expandedTextIds[item.id]
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35'
                          : 'bg-muted hover:bg-indigo-500/10 text-muted-foreground border border-transparent'
                      }`}
                      title="Metni Oku (Yazılı Metni Göster/Gizle)"
                      aria-label={`${item.title} metnini oku`}
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSelectItem(item)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isPlayingThis 
                          ? 'bg-amber-400 text-slate-950 font-extrabold' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                      id={`play-trigger-btn-${item.id}`}
                      aria-label={`${item.title} eserini dinle`}
                    >
                      <Headset className="w-3.5 h-3.5" />
                      <span>{isPlayingThis ? 'Dinleniyor' : 'Dinle'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
