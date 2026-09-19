type CityTranslation = {
  subtitle: string;
  water: string;
  transit: string;
  weather: string;
  districts: [string, string][];
  landmarks: [string, string][];
};
export const citiesTr: Record<string, CityTranslation> = {
  ist: {
    subtitle: "İki kıta. Birbirine bağlı tek şehir.",
    water: "İSTANBUL BOĞAZI",
    transit: "Vapurlar · tramvaylar · köprü trafiği",
    weather: "Deniz meltemi",
    districts: [
      [
        "Tarihi Yarımada",
        "Kubbeler, avlulu çarşılar ve sık sokaklar Haliç'e bakıyor.",
      ],
      [
        "Galata ve Karaköy",
        "Depolar, dik sokaklar ve ticaret ofisleri kıyıyı Galata'ya bağlıyor.",
      ],
      [
        "Boğaziçi",
        "Vapurlar Avrupa ve Asya kıyılarını birleştiriyor. İki köprü hattı karayolu trafiğini taşıyor.",
      ],
    ],
    landmarks: [
      [
        "Galata Kulesi",
        "Taş kule Karaköy'ün kiremit çatıları üzerinde yükseliyor.",
      ],
      [
        "Tarihi Yarımada",
        "Kubbeli cami külliyesi eski şehrin siluetini belirliyor.",
      ],
      ["Boğaz Köprüsü", "Asma köprü iki kıyıyı birleştiriyor."],
    ],
  },
  lon: {
    subtitle: "Thames çevresinde kurulan şehir.",
    water: "THAMES NEHRİ",
    transit: "Çift katlı otobüsler · nehir tekneleri · trenler",
    weather: "Alçak bulutlar",
    districts: [
      [
        "Westminster",
        "Parlamentonun saat kulesi, taş kıyılarla çevrili nehre bakıyor.",
      ],
      [
        "Finans merkezi",
        "Cam ofisler eski tuğla sokakların ve finans bölgesinin arkasında yükseliyor.",
      ],
      [
        "Güney kıyısı",
        "Nehir tekneleri, dönme dolap ve köprüler iki kıyıyı birleştiriyor.",
      ],
    ],
    landmarks: [
      [
        "Westminster",
        "Saat kulesi ve uzun taş cephe, parlamento bölgesini belirliyor.",
      ],
      [
        "London Eye",
        "Seyir dönme dolabı güney kıyısı üzerinde yavaşça dönüyor.",
      ],
      ["Tower Bridge", "İkiz kuleler işlek nehir geçişini çerçeveliyor."],
    ],
  },
  par: {
    subtitle: "Bulvarlar, kireçtaşı ve Sen Nehri.",
    water: "SEN NEHRİ",
    transit: "Nehir tekneleri · otobüsler · bulvarlar",
    weather: "Yer yer açık",
    districts: [
      [
        "Sol kıyı",
        "Eyfel Kulesi yakınındaki nehir boyunca kireçtaşı binalar ve avlular uzanıyor.",
      ],
      ["Sağ kıyı", "Alışveriş pasajları ve ofisler geniş caddelere yayılıyor."],
      [
        "Sen rıhtımları",
        "Yolcu tekneleri iki kıyı arasındaki köprülerin altından geçiyor.",
      ],
    ],
    landmarks: [
      [
        "Eyfel Kulesi",
        "Sol kıyının üzerinde demir kafesli bir simge yükseliyor.",
      ],
      [
        "Zafer Takı",
        "Anıtsal kemer, geniş bir şehir aksının odağını oluşturuyor.",
      ],
    ],
  },
  tok: {
    subtitle: "Demiryolu hatları işlek bir körfezle buluşuyor.",
    water: "TOKYO KÖRFEZİ",
    transit: "Banliyö trenleri · yük gemileri · taksiler",
    weather: "Kıyı sisi",
    districts: [
      [
        "Asakusa",
        "Tapınak alanı, sık ve alçak yapılaşmış mahallelerin arasında yer alıyor.",
      ],
      [
        "Minato",
        "Ofis kuleleri ve yükseltilmiş demiryolları Tokyo Kulesi yakınında birleşiyor.",
      ],
      [
        "Tokyo Körfezi",
        "Konteyner trafiği üretim ve yarı iletken tedarik zincirlerini besliyor.",
      ],
    ],
    landmarks: [
      [
        "Tokyo Kulesi",
        "Kırmızı-beyaz kafes kule ofislerin üzerinde yükseliyor.",
      ],
      [
        "Asakusa Tapınağı",
        "Katmanlı çatılar ve avlu, şehir yaşamının farklı bir ölçeğini koruyor.",
      ],
    ],
  },
  nyc: {
    subtitle: "Caddelerin ve gökdelenlerin adası.",
    water: "HUDSON / EAST NEHRİ",
    transit: "Sarı taksiler · vapurlar · caddeler",
    weather: "Atlantik meltemi",
    districts: [
      [
        "Midtown",
        "Kademeli kuleler ve düzenli sokak adaları merkezi iş bölgesini çevreliyor.",
      ],
      ["Aşağı Manhattan", "Finans bölgesi limana doğru daralıyor."],
      [
        "Özgürlük Limanı",
        "Yolcu vapurları liman adalarının ve kıyının yanından geçiyor.",
      ],
    ],
    landmarks: [
      [
        "Midtown silueti",
        "Basamaklı Art Deco kule, Midtown siluetini belirliyor.",
      ],
      [
        "Özgürlük Adası",
        "Bakır yeşili liman anıtı kendi adasının kıyısında duruyor.",
      ],
    ],
  },
  nai: {
    subtitle: "Açık arazinin yanındaki yayla başkenti.",
    water: "NAIROBI NEHRİ",
    transit: "Matatu minibüsleri · otobüsler · bölgesel yük taşımacılığı",
    weather: "Yayla güneşi",
    districts: [
      [
        "Kent merkezi",
        "Kamu binaları ve ticari sokaklar yeşil nehir koridorunun üzerinde yer alıyor.",
      ],
      ["Upper Hill", "Yüksek ofisler şehrin büyüyen ulaşım ağına bakıyor."],
      [
        "Nehir ve sulak alanlar",
        "Yeni haritalanan sular güzergâhları, arazi değerlerini ve kaynaklara erişimi değiştiriyor.",
      ],
    ],
    landmarks: [
      [
        "Kent kulesi",
        "Silindirik kule ve dairesel toplantı salonu, merkezin odağını oluşturuyor.",
      ],
    ],
  },
  fra: {
    subtitle: "Main kıyısında bir bankacılık silueti.",
    water: "MAIN NEHRİ",
    transit: "Tramvaylar · nehir mavnaları · banliyö trenleri",
    weather: "Parçalı bulutlu",
    districts: [
      [
        "Römer bölgesi",
        "Eğimli çatılar ve kent meydanları modern ticaret merkeziyle buluşuyor.",
      ],
      ["Bankalar bölgesi", "Cam kuleler nehrin kuzeyinde kümeleniyor."],
      [
        "Main kıyısı",
        "Yük mavnaları ve köprüler şehri Avrupa'nın iç kesimlerine bağlıyor.",
      ],
    ],
    landmarks: [
      [
        "Banka kuleleri",
        "Eski şehrin üzerinde kademeli bir finans silueti yükseliyor.",
      ],
      [
        "Eski şehir",
        "Kırmızı taş kilise kulesi eğimli çatıların üzerinde yükseliyor.",
      ],
    ],
  },
  hkg: {
    subtitle: "Tepelerle liman arasında sık kuleler.",
    water: "VICTORIA LİMANI",
    transit: "Vapurlar · tramvaylar · yamaç yolları",
    weather: "Liman sisi",
    districts: [
      [
        "Central",
        "Yüksek ve dar ofisler tepe ile deniz arasındaki kısıtlı alanı dolduruyor.",
      ],
      ["Kowloon", "Yoğun ticaret blokları limanın karşısındaki adaya bakıyor."],
      [
        "Victoria Limanı",
        "Vapurlar birbirine yakın kıyı terminalleri arasında geçiş yapıyor.",
      ],
    ],
    landmarks: [
      [
        "Central silueti",
        "Çok yüzeyli cam kule finans merkezinin siluetini belirliyor.",
      ],
    ],
  },
  sha: {
    subtitle: "Bund kıyısı yeni bir siluete bakıyor.",
    water: "HUANGPU NEHRİ",
    transit: "Nehir trafiği · metro · elektrikli otobüsler",
    weather: "Nehir sisi",
    districts: [
      ["Bund", "Taş kıyı şeridi Huangpu üzerinden Pudong'a bakıyor."],
      ["Pudong", "Çok yüksek ofisler kendine özgü seyir kulesini çevreliyor."],
      [
        "Huangpu",
        "Yük gemileri ve yolcu tekneleri aynı nehir koridorunu kullanıyor.",
      ],
    ],
    landmarks: [
      [
        "Doğu'nun İncisi",
        "Küresel seyir katları Pudong'un siluetini oluşturuyor.",
      ],
    ],
  },
  sin: {
    subtitle: "Körfezin çevresinde kurulan tropik liman.",
    water: "MARINA BAY",
    transit: "Liman gemileri · metro · otobüsler",
    weather: "Tropik bulutlar",
    districts: [
      [
        "Yönetim bölgesi",
        "Tarihi kamu yapıları yoğun ticaret kıyısıyla buluşuyor.",
      ],
      [
        "Marina Bay",
        "Üç kule körfezin üzerinde uzun bir çatı siluetini taşıyor.",
      ],
      [
        "Bahçeler ve liman",
        "Bahçe yapıları gemi rotalarını ve kıyı altyapısını çevreliyor.",
      ],
    ],
    landmarks: [
      [
        "Marina Bay kuleleri",
        "Kesintisiz çatı terası, kıyıdaki üç kuleyi birbirine bağlıyor.",
      ],
      [
        "Körfez bahçeleri",
        "Dallanan yüksek bahçe yapıları tropik örtünün üzerinde yükseliyor.",
      ],
    ],
  },
  dub: {
    subtitle: "Çöl ve deniz arasında dikey bir siluet.",
    water: "ARAP KÖRFEZİ",
    transit: "Yükseltilmiş metro · otoyol trafiği · tekneler",
    weather: "Çöl pusları",
    districts: [
      [
        "Şehir merkezi",
        "İğne biçimli kule geniş yol ağının üzerinde yükseliyor.",
      ],
      [
        "Şeyh Zayed hattı",
        "Yüksek ofisler yükseltilmiş demiryolu ve karayolu hattı boyunca sıralanıyor.",
      ],
      ["Jumeirah", "Yelken biçimli otel ve kıyı yerleşimi Körfez'e bakıyor."],
    ],
    landmarks: [
      [
        "Merkez kulesi",
        "Kademeli cepheler siluetin en yüksek noktasında birleşiyor.",
      ],
      ["Jumeirah kıyısı", "Yelken biçimli kıyı simgesi Körfez'e bakıyor."],
    ],
  },
  syd: {
    subtitle: "Mahallelerin arasına uzanan bir liman.",
    water: "SİDNEY LİMANI",
    transit: "Liman vapurları · trenler · otobüsler",
    weather: "Deniz meltemi",
    districts: [
      [
        "Circular Quay",
        "Vapur terminalleri koylar ve burunlarla dolu limana bakıyor.",
      ],
      ["Merkez bölgesi", "Ticaret kuleleri kıyıya doğru alçalıyor."],
      [
        "Opera ve liman",
        "Yelken biçimli çatılar ve kemerli köprü liman manzarasını belirliyor.",
      ],
    ],
    landmarks: [
      ["Opera Binası", "Kabuk biçimli çatılar kıyıdaki burunda yer alıyor."],
      ["Liman Köprüsü", "Geniş kemer, trafiği limanın karşısına taşıyor."],
    ],
  },
  tor: {
    subtitle: "Demiryollarıyla örülü göl kıyısı silueti.",
    water: "ONTARIO GÖLÜ",
    transit: "Tramvaylar · banliyö trenleri · vapurlar",
    weather: "Göl meltemi",
    districts: [
      [
        "Eski Toronto",
        "Tuğla bloklar ve tramvay yolları iş merkezinin yanında uzanıyor.",
      ],
      [
        "Finans bölgesi",
        "Ofis kuleleri göl kıyısından içeriye doğru yükseliyor.",
      ],
      ["Liman kıyısı", "Seyir kulesi vapurlara ve adaların kıyısına bakıyor."],
    ],
    landmarks: [
      ["CN Kulesi", "İnce beton kulenin tepesinde bir seyir diski bulunuyor."],
    ],
  },
  mum: {
    subtitle: "Demiryolu ve musonun şekillendirdiği yarımada.",
    water: "ARAP DENİZİ",
    transit: "Banliyö trenleri · taksiler · liman tekneleri",
    weather: "Muson bulutları",
    districts: [
      ["Fort bölgesi", "Taş kamu binaları ve sık sokaklar limana bağlanıyor."],
      ["Ticaret merkezi", "Ofis kuleleri şehrin ulaşım koridorlarını izliyor."],
      [
        "Apollo kıyısı",
        "Kemerli geçit vapurlara ve işlek liman rotalarına bakıyor.",
      ],
    ],
    landmarks: [
      [
        "Hindistan Geçidi kıyısı",
        "Anıtsal kemer ve köşe kuleleri Arap Denizi'ne bakıyor.",
      ],
    ],
  },
  sao: {
    subtitle: "Sırtların ve caddelerin iç kesim metropolü.",
    water: "TIETÊ NEHRİ",
    transit: "Otobüsler · metro · yük yolları",
    weather: "Yayla bulutları",
    districts: [
      [
        "Paulista",
        "Sık ticaret binalarından oluşan sırt, merkez caddeyi izliyor.",
      ],
      [
        "Finans hattı",
        "Modern ofisler metropolün ulaşım ağı boyunca yayılıyor.",
      ],
      [
        "Ibirapuera",
        "Parklar ve rezervuarlar çevredeki yüksek yapılaşmanın arasında nefes aldırıyor.",
      ],
    ],
    landmarks: [
      [
        "Paulista Müzesi",
        "Asılı sergi alanı iki kırmızı desteğin arasında duruyor.",
      ],
      ["Sé bölgesi", "İkiz kuleler eski kent merkezinin üzerinde yükseliyor."],
    ],
  },
};
