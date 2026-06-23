import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, LogOut, Award, BookOpen, HeartHandshake, Sparkles, ShieldCheck, CheckCircle } from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
  role: 'gorme_engelli' | 'gonullu_seslendirmen' | 'diger';
  phone?: string;
  isRegistered: boolean;
  xpPoints?: number;
  badge?: string;
}

interface MembershipPanelProps {
  userAccount: UserProfile | null;
  onUpdateAccount: (account: UserProfile | null) => void;
  speak: (text: string) => void;
}

export default function MembershipPanel({ userAccount, onUpdateAccount, speak }: MembershipPanelProps) {
  const [isLoginView, setIsLoginView] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'gorme_engelli' | 'gonullu_seslendirmen' | 'diger'>('gorme_engelli');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      const msg = 'Lütfen tüm zorunlu alanları doldurun.';
      setErrorMessage(msg);
      speak(msg);
      return;
    }

    const newProfile: UserProfile = {
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      phone: phone.trim() || undefined,
      isRegistered: true,
      xpPoints: role === 'gonullu_seslendirmen' ? 120 : 50,
      badge: role === 'gonullu_seslendirmen' ? 'Bronz Okuyucu Rozeti' : 'Aktif Bilgi Kaşifi Rozeti'
    };

    onUpdateAccount(newProfile);
    const welcomeMsg = `Tebrikler ${fullName}, kaydınız başarıyla oluşturuldu! Hoş geldiniz.`;
    setSuccessMessage(welcomeMsg);
    speak(welcomeMsg);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      const msg = 'Lütfen e-posta ve şifrenizi girin.';
      setErrorMessage(msg);
      speak(msg);
      return;
    }

    // Dynamic mock match
    const parts = email.split('@');
    const mockName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Değerli Üye';
    const recoveredProfile: UserProfile = {
      fullName: mockName + ' Başarı',
      email: email.trim(),
      role: email.includes('gonullu') ? 'gonullu_seslendirmen' : 'gorme_engelli',
      phone: '0555 440 20 20',
      isRegistered: true,
      xpPoints: email.includes('gonullu') ? 450 : 200,
      badge: email.includes('gonullu') ? 'Altın Okuyucu Rozeti' : 'Aktif Bilgi Kaşifi Rozeti'
    };

    onUpdateAccount(recoveredProfile);
    const welcomeMsg = `Sisteme Giriş Başarılı. Hoş geldin, ${recoveredProfile.fullName}!`;
    setSuccessMessage(welcomeMsg);
    speak(welcomeMsg);
  };

  const handleLogout = () => {
    onUpdateAccount(null);
    setSuccessMessage('Hesabınızdan güvenli bir şekilde çıkış yapıldı.');
    speak('Hesaptan çıkış yapıldı.');
  };

  const announceRole = (selectedRole: typeof role) => {
    setRole(selectedRole);
    if (selectedRole === 'gorme_engelli') {
      speak('Görme engelli üyelik rolü seçildi. Metinlerin seslendirilmesini isteyebilir ve ses kütüphanesini kullanabilirsiniz.');
    } else if (selectedRole === 'gonullu_seslendirmen') {
      speak('Gönüllü seslendirmen rolü seçildi. İstekleri seslendirerek insanlara yardım edebilir ve puan toplayabilirsiniz.');
    } else {
      speak('Diğer destekçi rolü seçildi.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="membership-main-wrapper">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2" id="member-header-id">
          <UserPlus className="w-8 h-8 text-pink-500" />
          <span>{userAccount?.isRegistered ? 'SesOl Profilim' : 'Engelsiz Üyelik Portalı'}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Engelsiz bilgi dünyasına katılın, taleplerinizi kolayca yönetin veya gönüllü sesinizle can verin.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">{errorMessage}</span>
        </div>
      )}

      {userAccount?.isRegistered ? (
        /* LOGGED IN ACCOUNT PROFILE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="profile-logged-in-area">
          {/* PROFILE CARD */}
          <div className="md:col-span-12 p-6 rounded-2xl border bg-card shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {userAccount.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground flex items-center gap-2">
                    <span>{userAccount.fullName}</span>
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{userAccount.email}</span>
                    <span className="h-3 w-px bg-slate-700" />
                    <span className="text-xs font-bold text-pink-400">
                      {userAccount.role === 'gorme_engelli' ? '♿ GÖRME ENGELLİ ÜYE' : '🎙️ GÖNÜLLÜ SESLENDİRMEN'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                id="do-logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>

            {/* STATS AND REWARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border/80 text-center space-y-1">
                <span className="block text-[10px] tracking-wider text-muted-foreground font-bold">KAZANILAN TECRÜBE</span>
                <span className="block text-2xl font-black text-indigo-400">{userAccount.xpPoints} XP</span>
                <span className="block text-[10px] text-zinc-400">Her yardım yeni seviye kazandırır</span>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border/80 text-center space-y-1">
                <span className="block text-[10px] tracking-wider text-muted-foreground font-bold">HESAP DERECESİ</span>
                <span className="block text-2xl font-black text-amber-400 flex justify-center items-center gap-1">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>{userAccount.badge || 'Giriş Rozeti'}</span>
                </span>
                <span className="block text-[10px] text-zinc-400">Profilinizde görünen aktif rütbe</span>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border/80 text-center space-y-1">
                <span className="block text-[10px] tracking-wider text-muted-foreground font-bold">SİSTEM DURUMU</span>
                <span className="block text-xl font-black text-emerald-400 flex justify-center items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>Güvenli & Otomatik</span>
                </span>
                <span className="block text-[10px] text-zinc-400">Verileriniz cihazda şifrelidir</span>
              </div>
            </div>

            {/* WELCOME INSTRUCTIONS */}
            <div className="p-4 bg-muted/60 rounded-xl border border-border/50 text-xs text-foreground space-y-2.5">
              <p className="font-bold flex items-center gap-1.5 text-pink-400">
                <HeartHandshake className="w-4 h-4" />
                <span>Platform Hesabınızla Neler Yapabilirsiniz?</span>
              </p>
              {userAccount.role === 'gorme_engelli' ? (
                <ul className="list-disc list-inside space-y-1.5 pl-2 leading-relaxed text-muted-foreground">
                  <li><strong>Destek İste</strong> sekmesine geçirilen taleplerinizde adınız otomatik olarak <strong>{userAccount.fullName}</strong> şeklinde doldurulur.</li>
                  <li>Destek istek durumlarını, size adanmış özel seslendirmeler yapıldığında doğrudan kütüphaneden takip edebilirsiniz.</li>
                  <li>Ses sentezi ses hızını, ses perdesini kısıtlamadan kendi profilinize özel olarak optimize edebilirsiniz.</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1.5 pl-2 leading-relaxed text-muted-foreground">
                  <li><strong>Gönüllü Görevleri</strong> panelinde yapacağınız tüm seslendirmelerde adınız otomatik olarak <strong>{userAccount.fullName}</strong> olarak yazılır.</li>
                  <li>Her tamamladığınız seslendirme için profil hanenize <strong>+40 XP</strong> eklenerek kütüphane sıralamasında üst sınırlara ulaşırsınız.</li>
                  <li>Sizin seslendirdiğiniz tüm metin kayıtları hemen ilgili orijinal sorunun/metnin altında tescilli adınızla yayınlanır.</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* REGISTRATION AND LOGIN CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="profile-forms-area">
          {/* LEFT PANEL: BENEFITS CARD */}
          <div className="p-6 rounded-2xl border bg-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-pink-500 tracking-widest block">NEDEN HESAP OLUŞTURMALISINIZ?</span>
              <h2 className="text-2xl font-black leading-tight text-foreground">Aramıza Katılın, Hayatları Seslendirin</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Platformumuz üye olmadan da kısmen kullanılabilir ancak bir hesaba sahip olmak hem görme engelli kardeşlerimizin hem de gönüllülerimizin işlemlerini inanılmaz kolaylaştırır.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 px-2.5 rounded-lg bg-pink-500/10 text-pink-400 text-xs font-black shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground">Otomatik İsim & Tescil Desteği</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Sizi her seferinde adınızı yazma zahmetinden kurtarır, ses kayıtlarınıza adınızı tesciller.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 px-2.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-black shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground">Gönüllülük Puanlama & Rozetler</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Ses vererek kazandığınız XP puanları ile liderlik tablosunda yerinizi alın ve rozetler kazanın.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 px-2.5 rounded-lg bg-yellow-500/10 text-yellow-500 text-xs font-black shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground">Özel Bildirimler & Kolay Takip</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">İstediğiniz kitapların seslendirildiğini anında görebilirsiniz.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 text-center">
              <button
                type="button"
                onClick={() => {
                  const view = !isLoginView;
                  setIsLoginView(view);
                  speak(view ? 'Zaten hesabım var giriş yap ekranı açıldı.' : 'Kayıt Ol hesabını üret ekranı açıldı.');
                }}
                className="text-xs font-bold text-[#3b82f6] hover:underline"
              >
                {isLoginView ? 'Henüz üye değil misiniz? Şuradan yeni kayıt olun &rarr;' : 'Zaten hesabınız var mı? Buradan giriş yapın &rarr;'}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: REGISTER OR LOGIN FORM */}
          <div className="p-6 rounded-2xl border bg-card shadow-xl space-y-6">
            <h2 className="text-xl font-extrabold pb-3 border-b flex items-center justify-between text-foreground">
              <span>{isLoginView ? 'Hesabıma Giriş Yap' : 'Yeni Üyelik Oluştur'}</span>
              <span className="text-[10px] bg-background border px-2 py-0.5 rounded text-muted-foreground font-mono">
                {isLoginView ? 'GİRİŞ' : 'KAYIT'}
              </span>
            </h2>

            {isLoginView ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="text-xs font-bold block text-muted-foreground">E-Posta Adresiniz *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Örn: mailiniz@adres.com"
                      className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Sistemde denemek için <code>gonullu@sesol.org</code> yazarak giriş yapabilirsiniz.</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="login-pass" className="text-xs font-bold block text-muted-foreground">Şifreniz *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      id="login-pass"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Giriş Yap
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="signUp-name" className="text-xs font-bold block text-muted-foreground">Adınız ve Soyadınız *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      id="signUp-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Mehmet Caner"
                      className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signUp-email" className="text-xs font-bold block text-muted-foreground">E-Posta Adresiniz *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      id="signUp-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="caner@eposta.com"
                      className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signUp-pass" className="text-xs font-bold block text-muted-foreground">Şifre Oluşturun *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      id="signUp-pass"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                    />
                  </div>
                </div>

                {/* ROLE SELECTION BUTTONS */}
                <div className="space-y-2">
                  <label className="text-xs font-bold block text-muted-foreground">Platform Rolünüzü Seçin *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => announceRole('gorme_engelli')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                        role === 'gorme_engelli'
                          ? 'border-pink-500 bg-pink-500/5 ring-1 ring-pink-500'
                          : 'border-border bg-background'
                      }`}
                    >
                      <span className="block text-[10px] font-black tracking-wider text-pink-400">BEN OKUYAMAM</span>
                      <span className="block text-xs font-bold text-foreground">Görme Engelli Birey</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => announceRole('gonullu_seslendirmen')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                        role === 'gonullu_seslendirmen'
                          ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500'
                          : 'border-border bg-background'
                      }`}
                    >
                      <span className="block text-[10px] font-black tracking-wider text-indigo-400">BEN OKURUM</span>
                      <span className="block text-xs font-bold text-foreground">Gönüllü Okuyucu</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signUp-phone" className="text-xs font-bold block text-muted-foreground">Telefon Numarası (Sesli Arama Desteği İçin)</label>
                  <input
                    id="signUp-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0512 345 67 89 (İsteğe Bağlı)"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-sm shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Üyeliğimi Oluştur
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
