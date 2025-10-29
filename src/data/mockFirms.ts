// Mock firma verileri - Her kategoriden 10'ar adet
export interface Firma {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  category: string;
  description: string;
  slug: string;
}

export const categories = [
  "Elektrikçi",
  "Restoran",
  "Lokanta",
  "Çeşmeci",
  "Tesisatçı",
  "Sıhhi Tesisat"
] as const;

export type Category = typeof categories[number];

export const mockFirms: Firma[] = [
  // Elektrikçi - 10 adet
  {
    id: "1",
    name: "Aydınlatma Elektrik",
    address: "Atatürk Caddesi No:45, Kadıköy/İstanbul",
    phone: "0216 555 01 01",
    website: "www.aydinlatmaelektrik.com",
    rating: 4.8,
    category: "Elektrikçi",
    description: "30 yıllık tecrübesiyle ev ve işyeri elektrik işlerinizde güvenilir çözüm ortağınız.",
    slug: "aydinlatma-elektrik-kadikoy"
  },
  {
    id: "2",
    name: "Parlak Elektrik Ustası",
    address: "Cumhuriyet Bulvarı No:78, Beşiktaş/İstanbul",
    phone: "0212 555 01 02",
    website: "www.parlakelektrik.com",
    rating: 4.9,
    category: "Elektrikçi",
    description: "7/24 acil elektrik arıza servisi ve profesyonel elektrik tesisatı hizmetleri.",
    slug: "parlak-elektrik-ustasi-besiktas"
  },
  {
    id: "3",
    name: "Volt Elektrik Hizmetleri",
    address: "İstiklal Caddesi No:123, Beyoğlu/İstanbul",
    phone: "0212 555 01 03",
    website: "www.voltelektrik.com",
    rating: 4.7,
    category: "Elektrikçi",
    description: "Modern elektrik sistemleri kurulumu ve bakımında uzman ekip.",
    slug: "volt-elektrik-hizmetleri-beyoglu"
  },
  {
    id: "4",
    name: "Enerji Elektrik",
    address: "Bağdat Caddesi No:234, Maltepe/İstanbul",
    phone: "0216 555 01 04",
    website: "www.enerjielektrik.com",
    rating: 4.6,
    category: "Elektrikçi",
    description: "Enerji verimliliği ve güvenli elektrik tesisatları konusunda profesyonel hizmet.",
    slug: "enerji-elektrik-maltepe"
  },
  {
    id: "5",
    name: "Işık Elektrik Ustası",
    address: "Fevzi Paşa Caddesi No:67, Üsküdar/İstanbul",
    phone: "0216 555 01 05",
    website: "www.isikelektrik.com",
    rating: 4.5,
    category: "Elektrikçi",
    description: "Aydınlatma sistemleri ve elektrik panosu montajında uzman kadro.",
    slug: "isik-elektrik-ustasi-uskudar"
  },
  {
    id: "6",
    name: "Şimşek Elektrik",
    address: "Göztepe Mahallesi No:89, Kartal/İstanbul",
    phone: "0216 555 01 06",
    website: "www.simsekelektrik.com",
    rating: 4.8,
    category: "Elektrikçi",
    description: "Hızlı ve kaliteli elektrik arıza çözümleri için tek adres.",
    slug: "simsek-elektrik-kartal"
  },
  {
    id: "7",
    name: "Güç Elektrik Sistemleri",
    address: "Fatih Sultan Mehmet Bulvarı No:156, Ümraniye/İstanbul",
    phone: "0216 555 01 07",
    website: "www.gucelektrik.com",
    rating: 4.7,
    category: "Elektrikçi",
    description: "Endüstriyel ve konut tipi elektrik projelerinde güvenilir partner.",
    slug: "guc-elektrik-sistemleri-umraniye"
  },
  {
    id: "8",
    name: "Ampul Elektrik",
    address: "Yeşilköy Caddesi No:45, Bakırköy/İstanbul",
    phone: "0212 555 01 08",
    website: "www.ampulelektrik.com",
    rating: 4.9,
    category: "Elektrikçi",
    description: "LED aydınlatma ve akıllı ev sistemleri kurulum uzmanı.",
    slug: "ampul-elektrik-bakirkoy"
  },
  {
    id: "9",
    name: "Elektro Teknik",
    address: "Çamlıca Mahallesi No:234, Pendik/İstanbul",
    phone: "0216 555 01 09",
    website: "www.elektroteknik.com",
    rating: 4.6,
    category: "Elektrikçi",
    description: "Elektrik projesi çizimi ve uygulama hizmetlerinde 20 yıllık deneyim.",
    slug: "elektro-teknik-pendik"
  },
  {
    id: "10",
    name: "Yıldırım Elektrik",
    address: "Mecidiyeköy Mahallesi No:89, Şişli/İstanbul",
    phone: "0212 555 01 10",
    website: "www.yildirim-elektrik.com",
    rating: 4.8,
    category: "Elektrikçi",
    description: "Ticari ve endüstriyel elektrik tesisatlarında profesyonel çözümler.",
    slug: "yildirim-elektrik-sisli"
  },

  // Restoran - 10 adet
  {
    id: "11",
    name: "Lezzet Durağı Restaurant",
    address: "Nişantaşı Caddesi No:12, Şişli/İstanbul",
    phone: "0212 555 02 01",
    website: "www.lezzetduragi.com",
    rating: 4.9,
    category: "Restoran",
    description: "Modern Türk mutfağının en lezzetli örneklerini sunan şık restoran.",
    slug: "lezzet-duragi-restaurant-nisantasi"
  },
  {
    id: "12",
    name: "Deniz Restaurant",
    address: "Kuruçeşme Caddesi No:34, Beşiktaş/İstanbul",
    phone: "0212 555 02 02",
    website: "www.denizrestaurant.com",
    rating: 4.8,
    category: "Restoran",
    description: "Boğaz manzaralı, taze deniz ürünleri ve meyhane kültürü bir arada.",
    slug: "deniz-restaurant-kurucesme"
  },
  {
    id: "13",
    name: "Gurme Sofra",
    address: "Bağdat Caddesi No:456, Kadıköy/İstanbul",
    phone: "0216 555 02 03",
    website: "www.gurmesofra.com",
    rating: 4.7,
    category: "Restoran",
    description: "Dünya mutfağından seçkin lezzetler ve özel menüler.",
    slug: "gurme-sofra-kadikoy"
  },
  {
    id: "14",
    name: "Köşe Restaurant",
    address: "Moda Caddesi No:67, Kadıköy/İstanbul",
    phone: "0216 555 02 04",
    website: "www.koserestaurant.com",
    rating: 4.6,
    category: "Restoran",
    description: "Samimi ortamıyla ev yemekleri ve özel tarifler sunan aile restoranı.",
    slug: "kose-restaurant-moda"
  },
  {
    id: "15",
    name: "Şehir Lezzetleri",
    address: "Taksim Meydanı No:23, Beyoğlu/İstanbul",
    phone: "0212 555 02 05",
    website: "www.sehirlezzetleri.com",
    rating: 4.9,
    category: "Restoran",
    description: "İstanbul'un kalbinde, geleneksel lezzetlerle modern sunum.",
    slug: "sehir-lezzetleri-taksim"
  },
  {
    id: "16",
    name: "Bahçe Restaurant",
    address: "Emirgan Korusu Yanı No:5, Sarıyer/İstanbul",
    phone: "0212 555 02 06",
    website: "www.bahcerestaurant.com",
    rating: 4.8,
    category: "Restoran",
    description: "Yeşillikler içinde, doğayla iç içe kahvaltı ve yemek keyfi.",
    slug: "bahce-restaurant-emirgan"
  },
  {
    id: "17",
    name: "Keyif Sofrası",
    address: "Caddebostan Sahil No:89, Kadıköy/İstanbul",
    phone: "0216 555 02 07",
    website: "www.keyifsofrasi.com",
    rating: 4.7,
    category: "Restoran",
    description: "Deniz kenarında, romantik akşam yemekleri ve canlı müzik.",
    slug: "keyif-sofrasi-caddebostan"
  },
  {
    id: "18",
    name: "Mangal Keyfi",
    address: "Florya Sahil Yolu No:123, Bakırköy/İstanbul",
    phone: "0212 555 02 08",
    website: "www.mangalkeyfi.com",
    rating: 4.6,
    category: "Restoran",
    description: "Özel mangal soslu etleri ve mezeler eşliğinde lezzet şöleni.",
    slug: "mangal-keyfi-florya"
  },
  {
    id: "19",
    name: "Anadolu Sofrası",
    address: "Ataşehir Bulvarı No:234, Ataşehir/İstanbul",
    phone: "0216 555 02 09",
    website: "www.anadolusofrasi.com",
    rating: 4.8,
    category: "Restoran",
    description: "Anadolu'nun dört bir yanından geleneksel lezzetler.",
    slug: "anadolu-sofrasi-atasehir"
  },
  {
    id: "20",
    name: "İstanbul Sofrası",
    address: "Sultanahmet Meydanı No:45, Fatih/İstanbul",
    phone: "0212 555 02 10",
    website: "www.istanbulsofrasi.com",
    rating: 4.9,
    category: "Restoran",
    description: "Tarihi yarımadada Osmanlı mutfağının en seçkin örnekleri.",
    slug: "istanbul-sofrasi-sultanahmet"
  },

  // Lokanta - 10 adet
  {
    id: "21",
    name: "Ev Yemekleri Lokantası",
    address: "Tunalı Hilmi Caddesi No:56, Ankara",
    phone: "0312 555 03 01",
    website: "www.evyemekleri.com",
    rating: 4.7,
    category: "Lokanta",
    description: "Anne eli değmiş gibi ev yemekleri ve günlük taze menüler.",
    slug: "ev-yemekleri-lokantasi-tunali"
  },
  {
    id: "22",
    name: "Pişman Olmaz Lokantası",
    address: "Kızılay Caddesi No:78, Ankara",
    phone: "0312 555 03 02",
    website: "www.pismanolmaz.com",
    rating: 4.8,
    category: "Lokanta",
    description: "50 yıllık gelenekle, lezzeti damağınızda kalan ev yemekleri.",
    slug: "pisman-olmaz-lokantasi-kizilay"
  },
  {
    id: "23",
    name: "Huzur Lokantası",
    address: "Bahçelievler Caddesi No:123, Ankara",
    phone: "0312 555 03 03",
    website: "www.huzurlokanta.com",
    rating: 4.6,
    category: "Lokanta",
    description: "Aile ortamında günün sıcak yemekleri ve tatlıları.",
    slug: "huzur-lokantasi-bahcelievler"
  },
  {
    id: "24",
    name: "Kardeşler Lokantası",
    address: "Ulus Meydanı No:34, Ankara",
    phone: "0312 555 03 04",
    website: "www.kardeslerlokanta.com",
    rating: 4.9,
    category: "Lokanta",
    description: "1975'ten beri aynı kalitede hizmet veren geleneksel lokanta.",
    slug: "kardesler-lokantasi-ulus"
  },
  {
    id: "25",
    name: "Memleket Lokantası",
    address: "Çankaya Caddesi No:89, Ankara",
    phone: "0312 555 03 05",
    website: "www.memleketlokanta.com",
    rating: 4.7,
    category: "Lokanta",
    description: "Memleket lezzetleri ve sıcak servis anlayışı.",
    slug: "memleket-lokantasi-cankaya"
  },
  {
    id: "26",
    name: "Usta Eller Lokantası",
    address: "Keçiören Caddesi No:156, Ankara",
    phone: "0312 555 03 06",
    website: "www.ustaellerlokanta.com",
    rating: 4.8,
    category: "Lokanta",
    description: "Usta ellerde hazırlanan özel tarifler ve günlük çorbalar.",
    slug: "usta-eller-lokantasi-kecioren"
  },
  {
    id: "27",
    name: "Aile Lokantası",
    address: "Etimesgut Caddesi No:234, Ankara",
    phone: "0312 555 03 07",
    website: "www.ailelokanta.com",
    rating: 4.6,
    category: "Lokanta",
    description: "Hijyenik ortam, bol porsiyon ve uygun fiyatlarla hizmetinizde.",
    slug: "aile-lokantasi-etimesgut"
  },
  {
    id: "28",
    name: "Lezzet Lokantası",
    address: "Mamak Caddesi No:67, Ankara",
    phone: "0312 555 03 08",
    website: "www.lezzetlokanta.com",
    rating: 4.7,
    category: "Lokanta",
    description: "Her gün farklı menü seçenekleri ve taze malzemeler.",
    slug: "lezzet-lokantasi-mamak"
  },
  {
    id: "29",
    name: "Sofra Lokantası",
    address: "Pursaklar Caddesi No:123, Ankara",
    phone: "0312 555 03 09",
    website: "www.sofralokanta.com",
    rating: 4.8,
    category: "Lokanta",
    description: "Geleneksel pişirme teknikleriyle hazırlanan özel lezzetler.",
    slug: "sofra-lokantasi-pursaklar"
  },
  {
    id: "30",
    name: "Bereket Lokantası",
    address: "Sincan Caddesi No:45, Ankara",
    phone: "0312 555 03 10",
    website: "www.bereketlokanta.com",
    rating: 4.9,
    category: "Lokanta",
    description: "Bereketli sofralar, doyurucu porsiyonlar ve güleryüzlü hizmet.",
    slug: "bereket-lokantasi-sincan"
  },

  // Çeşmeci - 10 adet
  {
    id: "31",
    name: "Sular Çeşmeci",
    address: "Levent Caddesi No:45, Beşiktaş/İstanbul",
    phone: "0212 555 04 01",
    website: "www.sularcesmeci.com",
    rating: 4.8,
    category: "Çeşmeci",
    description: "Musluk tamiri, su kaçağı tespiti ve çeşme montajında profesyonel hizmet.",
    slug: "sular-cesmeci-levent"
  },
  {
    id: "32",
    name: "Damla Çeşmecilik",
    address: "Maltepe Caddesi No:67, Maltepe/İstanbul",
    phone: "0216 555 04 02",
    website: "www.damlacesmeci.com",
    rating: 4.9,
    category: "Çeşmeci",
    description: "Banyo ve mutfak armatürleri konusunda uzman çeşmeci.",
    slug: "damla-cesmecilik-maltepe"
  },
  {
    id: "33",
    name: "Akıllı Çeşme Sistemleri",
    address: "Kartal Caddesi No:123, Kartal/İstanbul",
    phone: "0216 555 04 03",
    website: "www.akillicesmeci.com",
    rating: 4.7,
    category: "Çeşmeci",
    description: "Sensörlü musluk ve modern çeşme sistemleri kurulumu.",
    slug: "akilli-cesme-sistemleri-kartal"
  },
  {
    id: "34",
    name: "Su Ustası Çeşmecilik",
    address: "Üsküdar Caddesi No:89, Üsküdar/İstanbul",
    phone: "0216 555 04 04",
    website: "www.suustasi.com",
    rating: 4.6,
    category: "Çeşmeci",
    description: "7/24 acil çeşme arıza servisi ve tamir hizmetleri.",
    slug: "su-ustasi-cesmecilik-uskudar"
  },
  {
    id: "35",
    name: "Modern Çeşmeci",
    address: "Beyoğlu Caddesi No:234, Beyoğlu/İstanbul",
    phone: "0212 555 04 05",
    website: "www.moderncesmeci.com",
    rating: 4.8,
    category: "Çeşmeci",
    description: "İthal armatür satış ve montaj hizmetlerinde güvenilir adres.",
    slug: "modern-cesmeci-beyoglu"
  },
  {
    id: "36",
    name: "Pratik Çeşme",
    address: "Kadıköy Caddesi No:156, Kadıköy/İstanbul",
    phone: "0216 555 04 06",
    website: "www.pratikcesme.com",
    rating: 4.7,
    category: "Çeşmeci",
    description: "Hızlı ve uygun fiyatlı çeşme tamir ve bakım hizmetleri.",
    slug: "pratik-cesme-kadikoy"
  },
  {
    id: "37",
    name: "Su Dünyası Çeşmecilik",
    address: "Pendik Caddesi No:67, Pendik/İstanbul",
    phone: "0216 555 04 07",
    website: "www.sudunyasi.com",
    rating: 4.9,
    category: "Çeşmeci",
    description: "Gömme rezervuar ve modern banyo sistemleri kurulum uzmanı.",
    slug: "su-dunyasi-cesmecilik-pendik"
  },
  {
    id: "38",
    name: "Çeşme Teknik",
    address: "Ümraniye Caddesi No:123, Ümraniye/İstanbul",
    phone: "0216 555 04 08",
    website: "www.cesmeteknik.com",
    rating: 4.6,
    category: "Çeşmeci",
    description: "Sıhhi tesisat ve çeşme sistemlerinde kapsamlı çözümler.",
    slug: "cesme-teknik-umraniye"
  },
  {
    id: "39",
    name: "Usta Çeşmeci",
    address: "Bakırköy Caddesi No:89, Bakırköy/İstanbul",
    phone: "0212 555 04 09",
    website: "www.ustacesmeci.com",
    rating: 4.8,
    category: "Çeşmeci",
    description: "30 yıllık deneyimle çeşme ve musluk tamirinde uzman.",
    slug: "usta-cesmeci-bakirkoy"
  },
  {
    id: "40",
    name: "Hızlı Çeşme Servisi",
    address: "Şişli Caddesi No:234, Şişli/İstanbul",
    phone: "0212 555 04 10",
    website: "www.hizlicesmeci.com",
    rating: 4.7,
    category: "Çeşmeci",
    description: "Aynı gün servis garantisi ve kaliteli malzeme kullanımı.",
    slug: "hizli-cesme-servisi-sisli"
  },

  // Tesisatçı - 10 adet
  {
    id: "41",
    name: "Master Tesisat",
    address: "Mecidiyeköy Caddesi No:45, Şişli/İstanbul",
    phone: "0212 555 05 01",
    website: "www.mastertesisat.com",
    rating: 4.9,
    category: "Tesisatçı",
    description: "Komple tesisat montajı ve tadilat işlerinde profesyonel ekip.",
    slug: "master-tesisat-mecidiyekoy"
  },
  {
    id: "42",
    name: "Güvenli Tesisat",
    address: "Beşiktaş Caddesi No:67, Beşiktaş/İstanbul",
    phone: "0212 555 05 02",
    website: "www.guvenli-tesisat.com",
    rating: 4.8,
    category: "Tesisatçı",
    description: "Kalorifer, petek ve ısıtma sistemleri kurulumu uzmanı.",
    slug: "guvenli-tesisat-besiktas"
  },
  {
    id: "43",
    name: "Usta Tesisatçı",
    address: "Kadıköy Caddesi No:123, Kadıköy/İstanbul",
    phone: "0216 555 05 03",
    website: "www.ustatesisatci.com",
    rating: 4.7,
    category: "Tesisatçı",
    description: "Pis su ve temiz su tesisatı döşeme ve onarım hizmetleri.",
    slug: "usta-tesisatci-kadikoy"
  },
  {
    id: "44",
    name: "Akıl Tesisat",
    address: "Üsküdar Caddesi No:89, Üsküdar/İstanbul",
    phone: "0216 555 05 04",
    website: "www.akiltesisat.com",
    rating: 4.6,
    category: "Tesisatçı",
    description: "Doğalgaz tesisatı ve kombi bakım servisi.",
    slug: "akil-tesisat-uskudar"
  },
  {
    id: "45",
    name: "Hızlı Tesisat Servisi",
    address: "Maltepe Caddesi No:234, Maltepe/İstanbul",
    phone: "0216 555 05 05",
    website: "www.hizlitesisat.com",
    rating: 4.8,
    category: "Tesisatçı",
    description: "Acil tesisat arızalarında 24 saat hızlı müdahale.",
    slug: "hizli-tesisat-servisi-maltepe"
  },
  {
    id: "46",
    name: "Pro Tesisat",
    address: "Kartal Caddesi No:156, Kartal/İstanbul",
    phone: "0216 555 05 06",
    website: "www.protesisat.com",
    rating: 4.7,
    category: "Tesisatçı",
    description: "Modern tesisat teknolojileri ve akıllı su yönetim sistemleri.",
    slug: "pro-tesisat-kartal"
  },
  {
    id: "47",
    name: "Deneyimli Tesisatçı",
    address: "Bakırköy Caddesi No:67, Bakırköy/İstanbul",
    phone: "0212 555 05 07",
    website: "www.deneyimlitesisatci.com",
    rating: 4.9,
    category: "Tesisatçı",
    description: "40 yıllık deneyimle tüm tesisat işlerinizde yanınızda.",
    slug: "deneyimli-tesisatci-bakirkoy"
  },
  {
    id: "48",
    name: "Pratik Tesisat",
    address: "Pendik Caddesi No:123, Pendik/İstanbul",
    phone: "0216 555 05 08",
    website: "www.pratiktesisat.com",
    rating: 4.6,
    category: "Tesisatçı",
    description: "Uygun fiyatlı ve kaliteli tesisat çözümleri.",
    slug: "pratik-tesisat-pendik"
  },
  {
    id: "49",
    name: "Su Yolu Tesisat",
    address: "Ümraniye Caddesi No:89, Ümraniye/İstanbul",
    phone: "0216 555 05 09",
    website: "www.suyolutesisat.com",
    rating: 4.8,
    category: "Tesisatçı",
    description: "Su kaçağı tespiti ve yeraltı tesisatı onarımında uzman.",
    slug: "su-yolu-tesisat-umraniye"
  },
  {
    id: "50",
    name: "Modern Tesisat",
    address: "Beyoğlu Caddesi No:234, Beyoğlu/İstanbul",
    phone: "0212 555 05 10",
    website: "www.moderntesisat.com",
    rating: 4.7,
    category: "Tesisatçı",
    description: "Yeni nesil tesisat malzemeleri ve uygulama tekniklerinde öncü.",
    slug: "modern-tesisat-beyoglu"
  },

  // Sıhhi Tesisat - 10 adet
  {
    id: "51",
    name: "Sağlık Sıhhi Tesisat",
    address: "Nişantaşı Caddesi No:45, Şişli/İstanbul",
    phone: "0212 555 06 01",
    website: "www.sagliksihhi.com",
    rating: 4.9,
    category: "Sıhhi Tesisat",
    description: "Banyo ve mutfak sıhhi tesisat sistemleri kurulum ve bakımı.",
    slug: "saglik-sihhi-tesisat-nisantasi"
  },
  {
    id: "52",
    name: "Temiz Su Sıhhi Tesisat",
    address: "Kadıköy Caddesi No:67, Kadıköy/İstanbul",
    phone: "0216 555 06 02",
    website: "www.temizsu-sihhi.com",
    rating: 4.8,
    category: "Sıhhi Tesisat",
    description: "Hijyenik su tesisatı ve arıtma sistemleri uzmanı.",
    slug: "temiz-su-sihhi-tesisat-kadikoy"
  },
  {
    id: "53",
    name: "Profesyonel Sıhhi Tesisat",
    address: "Beşiktaş Caddesi No:123, Beşiktaş/İstanbul",
    phone: "0212 555 06 03",
    website: "www.profesyonelsihhi.com",
    rating: 4.7,
    category: "Sıhhi Tesisat",
    description: "Hastane ve okul gibi büyük projelerde sıhhi tesisat çözümleri.",
    slug: "profesyonel-sihhi-tesisat-besiktas"
  },
  {
    id: "54",
    name: "Kaliteli Sıhhi Tesisat",
    address: "Üsküdar Caddesi No:89, Üsküdar/İstanbul",
    phone: "0216 555 06 04",
    website: "www.kalitelisihhi.com",
    rating: 4.6,
    category: "Sıhhi Tesisat",
    description: "Kaliteli malzeme ve uzman kadroyla sıhhi tesisat hizmetleri.",
    slug: "kaliteli-sihhi-tesisat-uskudar"
  },
  {
    id: "55",
    name: "Uzman Sıhhi Tesisat",
    address: "Maltepe Caddesi No:234, Maltepe/İstanbul",
    phone: "0216 555 06 05",
    website: "www.uzmansihhi.com",
    rating: 4.8,
    category: "Sıhhi Tesisat",
    description: "Atık su sistemleri ve drenaj çözümlerinde profesyonel hizmet.",
    slug: "uzman-sihhi-tesisat-maltepe"
  },
  {
    id: "56",
    name: "Garantili Sıhhi Tesisat",
    address: "Kartal Caddesi No:156, Kartal/İstanbul",
    phone: "0216 555 06 06",
    website: "www.garantilisihhi.com",
    rating: 4.7,
    category: "Sıhhi Tesisat",
    description: "5 yıl garanti ile sıhhi tesisat montaj ve onarım.",
    slug: "garantili-sihhi-tesisat-kartal"
  },
  {
    id: "57",
    name: "Hızlı Sıhhi Tesisat",
    address: "Bakırköy Caddesi No:67, Bakırköy/İstanbul",
    phone: "0212 555 06 07",
    website: "www.hizlisihhi.com",
    rating: 4.9,
    category: "Sıhhi Tesisat",
    description: "Acil sıhhi tesisat arızalarında aynı gün çözüm garantisi.",
    slug: "hizli-sihhi-tesisat-bakirkoy"
  },
  {
    id: "58",
    name: "Modern Sıhhi Tesisat",
    address: "Pendik Caddesi No:123, Pendik/İstanbul",
    phone: "0216 555 06 08",
    website: "www.modernsihhi.com",
    rating: 4.6,
    category: "Sıhhi Tesisat",
    description: "Son teknoloji sıhhi tesisat sistemleri ve akıllı banyo çözümleri.",
    slug: "modern-sihhi-tesisat-pendik"
  },
  {
    id: "59",
    name: "Ekonomik Sıhhi Tesisat",
    address: "Ümraniye Caddesi No:89, Ümraniye/İstanbul",
    phone: "0216 555 06 09",
    website: "www.ekonomiksihhi.com",
    rating: 4.8,
    category: "Sıhhi Tesisat",
    description: "Uygun fiyatlarla kaliteli sıhhi tesisat hizmetleri.",
    slug: "ekonomik-sihhi-tesisat-umraniye"
  },
  {
    id: "60",
    name: "Deneyim Sıhhi Tesisat",
    address: "Beyoğlu Caddesi No:234, Beyoğlu/İstanbul",
    phone: "0212 555 06 10",
    website: "www.deneyimsihhi.com",
    rating: 4.7,
    category: "Sıhhi Tesisat",
    description: "35 yıllık tecrübeyle sıhhi tesisat projelerinde güvenilir partner.",
    slug: "deneyim-sihhi-tesisat-beyoglu"
  },
];

// Kategoriye göre firma filtreleme fonksiyonu
export const getFirmsByCategory = (category: Category): Firma[] => {
  return mockFirms.filter(firma => firma.category === category);
};

// Slug'a göre firma bulma fonksiyonu
export const getFirmaBySlug = (slug: string): Firma | undefined => {
  return mockFirms.find(firma => firma.slug === slug);
};

// Rastgele firmalar seçme (internal linking için)
export const getRandomFirms = (count: number, excludeId?: string): Firma[] => {
  const filtered = excludeId 
    ? mockFirms.filter(f => f.id !== excludeId)
    : mockFirms;
  
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
