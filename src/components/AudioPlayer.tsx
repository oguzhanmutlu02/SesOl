import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Volume2, FastForward, Info, Heart, Share2, Sparkles, Mic } from 'lucide-react';
import { LibraryItem } from '../types';

interface AudioPlayerProps {
  item: LibraryItem;
  speak: (text: string, onBoundary?: (charIndex: number) => void, onEnd?: () => void) => void;
  stopSpeak: () => void;
  isSynthesizing: boolean;
  settingsSpeed: number;
}

export default function AudioPlayer({ item, speak, stopSpeak, isSynthesizing, settingsSpeed }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(settingsSpeed);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const textBody = item.textBody || '';
  const words = textBody.split(/\s+/);
  const isRealAudioFile = item.audioUrl && item.audioUrl !== 'simulated_tts_audio_bridge';

  // Sync settings speed
  useEffect(() => {
    setPlaybackSpeed(settingsSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = settingsSpeed;
    }
  }, [settingsSpeed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    // If external synthesized state is cut, stop our playing animation unless playing real file
    if (!isRealAudioFile && !isSynthesizing && isPlaying) {
      handleStop();
    }
  }, [isSynthesizing, isRealAudioFile]);

  // Handle auto-stop on item switch
  useEffect(() => {
    handleStop();
  }, [item]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle Play/Pause
  const handlePlayToggle = () => {
    if (isPlaying) {
      if (isRealAudioFile) {
        audioRef.current?.pause();
      } else {
        stopSpeak();
      }
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsPlaying(true);

      if (isRealAudioFile) {
        // Play real volunteer audio recording
        if (audioRef.current) {
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.play().catch(err => {
            console.error('Audio play failed:', err);
          });
        }

        // Interval to highlight approximations of track
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 120;
            const ratio = current / duration;
            setProgress(ratio * 100);

            const approxWordIdx = Math.min(
              words.length - 1,
              Math.floor(ratio * words.length)
            );
            setCurrentWordIndex(approxWordIdx);
          }
        }, 200);

      } else {
        // Fallback speak synthesis
        speak(
          textBody,
          (charIndex) => {
            // Approximate the word index based on character boundary index
            const prefix = textBody.substring(0, charIndex);
            const wordCount = prefix.trim().split(/\s+/).length - 1;
            setCurrentWordIndex(wordCount >= 0 ? wordCount : 0);
          },
          () => {
            // Finished callback
            setIsPlaying(false);
            setCurrentWordIndex(-1);
            setProgress(100);
            if (timerRef.current) clearInterval(timerRef.current);
          }
        );

        // Simulate a moving progress bar based on estimated read speed
        if (timerRef.current) clearInterval(timerRef.current);
        let currentProgress = progress >= 100 ? 0 : progress;
        const totalWords = words.length;
        const msPerWord = (60 * 1000) / (120 * playbackSpeed); // Approx 120 words per minute

        timerRef.current = setInterval(() => {
          currentProgress += (1 / totalWords) * 100;
          if (currentProgress >= 100) {
            setProgress(100);
            setIsPlaying(false);
            setCurrentWordIndex(-1);
            clearInterval(timerRef.current!);
          } else {
            setProgress(currentProgress);
          }
        }, msPerWord);
      }
    }
  };

  const handleStop = () => {
    if (isRealAudioFile) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      stopSpeak();
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setProgress(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleBack10 = () => {
    if (isRealAudioFile) {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
        handleAudioTimeUpdate();
      }
    } else {
      stopSpeak();
      setIsPlaying(false);
      setCurrentWordIndex(Math.max(0, currentWordIndex - 8));
      setProgress(Math.max(0, progress - 10));
    }
    speak('On saniye geriye sarıldı.');
  };

  const handleForward10 = () => {
    if (isRealAudioFile) {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(audioRef.current.duration || 120, audioRef.current.currentTime + 10);
        handleAudioTimeUpdate();
      }
    } else {
      stopSpeak();
      setIsPlaying(false);
      setCurrentWordIndex(Math.min(words.length - 1, currentWordIndex + 8));
      setProgress(Math.min(100, progress + 10));
    }
    speak('On saniye ileriye sarıldı.');
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && isRealAudioFile) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);

      const ratio = current / duration;
      const approxWordIdx = Math.min(
        words.length - 1,
        Math.floor(ratio * words.length)
      );
      setCurrentWordIndex(approxWordIdx);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setProgress(100);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div 
      className="p-6 rounded-2xl border bg-slate-950 text-slate-100 shadow-xl transition-all border-slate-800"
      id={`audio-player-${item.id}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 px-2.5 py-1 rounded-full mb-2 inline-block">
            {(item.category === 'Ders Notu' ? 'DERS NOTU' : item.category === 'Kitap' ? 'KİTAP' : item.category === 'Makale' ? 'MAKALE' : item.category === 'Günlük Hayat' ? 'GÜNLÜK HAYAT' : 'DİĞER')} • {item.itemType === 'sesli_kitap' ? 'SESLİ ROMAN' : item.itemType === 'betimleme' ? 'SESLİ BETİMLEME' : 'SESLİ MAKALE'}
          </span>
          <h3 className="text-xl font-bold font-sans text-white tracking-tight" id="player-item-title">
            {item.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1" id="player-item-narrator">
            Seslendiren: <strong className="text-emerald-400">{item.narrator}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsLiked(!isLiked);
              speak(isLiked ? 'Beğeniniz geri çekildi.' : 'Eser beğenildi, kütüphanenize eklendi.');
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              isLiked 
                ? 'bg-rose-500/10 border-rose-500 text-rose-500' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Beğen"
            aria-label={`${item.title} isimli eseri beğeni listeme ekle`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => {
              speak('Eser bağlantısı panoya kopyalandı.');
              navigator.clipboard?.writeText(window.location.href);
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Paylaş"
            aria-label="Bu sesli yayını paylaş"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dynamic Visual Waveform / Equalizer */}
      <div className="h-20 bg-slate-900/50 rounded-xl mb-4 flex items-center justify-center gap-[3px] px-6 border border-slate-900 overflow-hidden relative">
        {isPlaying ? (
          <div className="flex items-end justify-center gap-[4px] h-12 w-full">
            {[...Array(32)].map((_, i) => {
              const delay = (i % 5) * 0.15;
              const heights = [20, 45, 15, 35, 10];
              const h = heights[i % heights.length];
              return (
                <div
                  key={i}
                  className="w-[3px] bg-emerald-400 rounded-full"
                  style={{
                    height: `${h}%`,
                    animation: `equalizerWave 1.2s ease-in-out infinite alternate`,
                    animationDelay: `${delay}s`
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-[3px] h-1 w-full bg-slate-800 rounded">
            {/* Flat static line */}
          </div>
        )}

        <style>{`
          @keyframes equalizerWave {
            0% { transform: scaleY(0.3); }
            100% { transform: scaleY(1.3); }
          }
        `}</style>

        <div className="absolute bottom-1 right-2 text-[9px] text-slate-500 font-mono tracking-wider flex items-center gap-1 font-semibold">
          {isRealAudioFile ? (
            <>
              <Mic className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-emerald-400">GÖNÜLLÜ KAYDETTİĞİ SES DESTEĞİ</span>
            </>
          ) : (
            <>
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              <span>DOĞAL YAPAY ZEKA SENTEZLEYİCİ AKTİF</span>
            </>
          )}
        </div>
      </div>

      {/* Playback Controls Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>{isPlaying ? 'Oynatılıyor' : progress === 100 ? 'Tamamlandı' : 'Durduruldu'}</span>
          <span>Süre: {item.duration}</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden cursor-pointer" id="player-progress-bar">
          <div 
            className="bg-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Action Buttons panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-900">
        <div className="flex items-center gap-2">
          {/* Back 10s */}
          <button
            onClick={handleBack10}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 font-bold border border-slate-800 text-slate-300 transition-all flex items-center justify-center"
            title="10 Saniye Geri"
            aria-label="Sesli okumayı on saniye geriye sar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* PLAY MAIN BUTTON */}
          <button
            onClick={handlePlayToggle}
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 ${
              isPlaying 
                ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/10'
            }`}
            id="player-play-btn"
            aria-label={isPlaying ? "Sesli okumayı duraklat" : "Sesli okumayı başlat"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Durdur</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Dinle (Başlat)</span>
              </>
            )}
          </button>

          {/* STOP BUTTON */}
          <button
            onClick={handleStop}
            className="p-2.5 rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444]/20 text-[#ef4444] transition-all"
            title="Sıfırla"
            aria-label="Sesli okumayı tamamen durdur ve sıfırla"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          {/* Forward 10s */}
          <button
            onClick={handleForward10}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 font-bold border border-slate-800 text-slate-300 transition-all flex items-center justify-center"
            title="10 Saniye İleri"
            aria-label="Sesli okumayı on saniye ileriye sar"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Adjustment Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Hız:</span>
          <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[0.8, 1.0, 1.3, 1.6].map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  setPlaybackSpeed(speed);
                  speak(`Okuma hızı ${speed} katına ayarlandı.`);
                }}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                  playbackSpeed === speed
                    ? 'bg-emerald-400 text-slate-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title={`${speed}x hızında oynat`}
                id={`playback-speed-${speed}`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accessible visual reader transcript */}
      <div className="mt-5 space-y-2">
        <label className="text-xs font-bold text-slate-400 tracking-widest flex items-center gap-1" id="transcript-heading">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>SESLENDİRİLEN METİN TRANSKRİPTİ (CANLI TAKİP)</span>
        </label>
        
        <div 
          className="p-4 bg-slate-900/40 rounded-xl max-h-48 overflow-y-auto leading-relaxed text-sm font-sans text-slate-300 border border-slate-900 transition-all shadow-inner"
          id="player-transcript-box"
        >
          {words.map((word, idx) => {
            const isWordReading = idx === currentWordIndex;
            return (
              <span 
                key={idx}
                className={`inline-block mr-1.5 px-0.5 rounded transition-all duration-150 ${
                  isWordReading 
                    ? 'bg-amber-400 text-slate-950 font-bold scale-105 shadow-sm px-1' 
                    : idx < currentWordIndex 
                      ? 'text-slate-500 font-medium' 
                      : 'text-slate-300'
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {isRealAudioFile && (
        <audio
          ref={audioRef}
          src={item.audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}
    </div>
  );
}
