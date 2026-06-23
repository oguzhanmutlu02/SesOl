import { AccessibleRequest, LibraryItem } from '../types';

export const INITIAL_REQUESTS: AccessibleRequest[] = [
  {
    id: 'req_1',
    title: '9. Sınıf Tarih Notu: Coğrafi Keşifler',
    description: 'Yarınki tarih sınavım için Coğrafi Keşifler konusundaki kısa özetin seslendirilmesini rica ediyorum. Toplamda 3 kısa paragraftır.',
    category: 'Ders Notu',
    requestType: 'vocal_reading',
    contentBody: 'Coğrafi Keşifler, 15. ve 16. yüzyıllarda Avrupalılar tarafından yeni ticaret yollarının, okyanusların ve kıtaların bulunması amacıyla gerçekleştirilen keşif seyahatleridir. Bu keşifler sonucunda Amerika kıtası, Ümit Burnu ve deniz yoluyla Hindistan rotası keşfedilmiştir. Keşiflerin başlıca sebepleri pusulanın geliştirilmesi, gemicilik teknolojisindeki ilerlemeler ve ipek ile baharat yollarının kontrolünü elinde tutan Osmanlı Devleti\'ne alternatif yollar aranmasıdır. Sonuç olarak sömürgecilik imparatorlukları kurulmuş ve dünyadaki ekonomik dengeler tamamen değişmiştir.',
    urgency: 'high',
    submittedBy: 'Ahmet Yılmaz',
    submittedAt: '2026-06-21 14:30',
    status: 'pending'
  },
  {
    id: 'req_2',
    title: 'Göz Damlası Kutu Arkasındaki Reçete ve Kullanım Şekli',
    description: 'Eczaneden aldığım göz damlasının kutu arkasındaki talimatları okuyamıyorum. Dozaj ve saklama koşullarını sesli okur veya betimler misiniz?',
    category: 'Günlük Hayat',
    requestType: 'image_description',
    contentBody: 'Kullanım Talimatı: Günde 3 defa, göze 1\'er damla uygulanmalıdır. Açıldıktan sonra 28 gün içinde tüketilmelidir. 25 derecenin altında, oda sıcaklığında saklayınız. Çocukların erişemeyeceği yerlerde muhafaza ediniz. Her kullanımdan sonra kapağı sıkıca kapatınız. Gözde kızarıklık veya kaşıntı artarsa derhal doktorunuza başvurunuz.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    urgency: 'high',
    submittedBy: 'Ayşe Demir',
    submittedAt: '2026-06-22 09:15',
    status: 'pending'
  },
  {
    id: 'req_3',
    title: 'Modern Türkiye\'nin İktisadi Tarihi Makalesi Giriş Kısmı',
    description: 'Üniversite ödevim için kaynak oluşturacak bu akademik makalenin ilk sayfasını bir gönüllümüzün seslendirmesini rica ediyorum.',
    category: 'Makale',
    requestType: 'vocal_reading',
    contentBody: 'Türkiye Cumhuriyeti\'nin kuruluş yıllarında iktisat politikaları, savaştan yeni çıkmış bir ülkenin küllerinden doğma çabasını simgeler. 1923 yılında toplanan İzmir İktisat Kongresi, milli bir ekonomi modeli oluşturmanın ilk somut adımıdır. Kongrede alınan kararlar doğrultusunda yerli üretimin teşviki, kapitülasyonların kesin olarak kaldırılması ve milli bankacılık sisteminin geliştirilmesi hedeflenmiştir. 1930\'lu yıllarda ise dünyada yaşanan Büyük Buhran\'ın etkisiyle devletçilik ilkesi benimsenmiş ve sanayileşme hamleleri devlet eliyle hızlandırılmıştır.',
    urgency: 'normal',
    submittedBy: 'Caner Öz',
    submittedAt: '2026-06-20 18:00',
    status: 'pending'
  },
  {
    id: 'req_4',
    title: 'Kumbara İşitme Engelli Eğitim Broşürü',
    description: 'Lütfen bu broşürdeki görselleri ve mesajı işaret dili anlatımıyla veya detaylı betimlemeyle aktarır mısınız?',
    category: 'Diğer',
    requestType: 'sign_language',
    contentBody: 'Broşür Başlığı: "Küçük Birikimler, Büyük Yarınlar". Görselde bir çocuk elindeki madeni parayı sevimli bir tavşan şeklindeki kumbaraya atıyor. Tavşanın üzerinde "Eğitim İçin Umut" yazısı bulunmakta. Arka planda rengarenk balonlar ve bir okul binası resmi var. Altındaki metinde ise tasarruf bilincinin küçük yaşta kazanılması gerektiği ve her atılan kuruşun geleceğe yatırılan bir tuğla olduğu vurgulanıyor.',
    urgency: 'normal',
    submittedBy: 'Zeynep Ak',
    submittedAt: '2026-06-21 11:20',
    status: 'pending'
  }
];

export const INITIAL_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'lib_1',
    title: 'Kürk Mantolu Madonna - Bölüm 1',
    description: 'Sabahattin Ali\'nin ölümsüz eseri Kürk Mantolu Madonna Romanı\'nın ilk beş sayfasının sesli kitap formatı.',
    category: 'Kitap',
    itemType: 'sesli_kitap',
    narrator: 'Elif Şahin (Gönüllü)',
    audioUrl: '', // Will be driven by text-to-speech visual audio
    textBody: 'Şimdiye kadar tesadüf ettiğim insanlardan bir tanesi benim üzerimde fevkalade büyük bir iz bırakmıştır. Aradan seneler geçtiği halde her gün onu bir kere olsun düşünmekten kendimi alamıyorum. Bu, Ankara\'da, bir kereste şirketinde muhasebecilik eden Raif Efendi idi. Onu her gün iş yerinde, masasının başında, sessizce dosyaları incelerken görürdüm. Kimseyle konuşmaz, kimsenin işine karışmaz, adeta bir gölge gibi yaşar giderdi. Fakat arkasındaki bu sessizliğin altında nasıl derin bir fırtına yattığını kimse bilmezdi.',
    duration: '02:40',
    views: 128,
    likes: 45,
    createdAt: '2026-06-15 10:00'
  },
  {
    id: 'lib_2',
    title: 'Mona Lisa Tablosu Detaylı Sesli Betimlemesi',
    description: 'Leonardo da Vinci\'nin ünlü eseri Mona Lisa tablosunun görme engelli sanatseverler için detaylı sanatsal tasviri.',
    category: 'Diğer',
    itemType: 'betimleme',
    narrator: 'Aras Karasu (Gönüllü)',
    audioUrl: '',
    textBody: 'Mona Lisa, ahşap üzerine yağlı boya ile yapılmış bir portredir. Resimde, ellerini önünde kavuşturmuş oturmakta olan bir kadın tasvir edilmiştir. Kadının gizemli bir gülümsemesi vardır ve gözleri izleyiciyi hangi açıdan bakarsa baksın takip ediyormuş hissi uyandırır. Kadının arkasında puslu, kayalık dağlar ve kıvrımlı akan bir nehir manzarası yer alır. Renk tonlarında kahverengi ve yeşilin yumuşak geçişleri hâkimdir. Portredeki sfumato tekniği sayesinde kenar çizgileri belirsizleştirilmiş, derin bir gerçeklik hissi verilmiştir.',
    duration: '03:15',
    views: 245,
    likes: 89,
    createdAt: '2026-06-18 14:20'
  },
  {
    id: 'lib_3',
    title: 'Yapay Zeka ve Çağdaş Sanat Makalesi',
    description: 'TÜBİTAK Bilim Genç dergisinden alınan makalenin sesli okuması.',
    category: 'Makale',
    itemType: 'sesli_makale',
    narrator: 'Selim Akın (Gönüllü)',
    audioUrl: '',
    textBody: 'Yapay zeka modellerinin görsel sanatlar alanındaki hızı, sanat dünyasını derin tartışmalara sürüklemektedir. Üretken yapay zeka araçları, basit metin komutlarıyla karmaşık dijital tablolar üretebilmektedir. Bazı otoriteler bunu insan yaratıcılığının yeni bir evresi olarak tanımlarken, diğerleri telif hakları ve sanatta özgünlük tartışmalarını ön plana çıkarmaktadır. Ancak kesin olan şu ki, yapay zeka artık bir araç olmaktan çıkıp sanat üreticilerinden biri haline gelmiştir.',
    duration: '01:50',
    views: 94,
    likes: 31,
    createdAt: '2026-06-19 16:45'
  }
];
