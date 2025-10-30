-- İletişim mesajları tablosu
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'processed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- RLS politikaları
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all messages"
  ON public.contact_messages
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update messages"
  ON public.contact_messages
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete messages"
  ON public.contact_messages
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Statik sayfalar tablosu
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS politikaları
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages"
  ON public.pages
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all pages"
  ON public.pages
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert pages"
  ON public.pages
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pages"
  ON public.pages
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pages"
  ON public.pages
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated at trigger
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Gerekli statik sayfaları ekle
INSERT INTO public.pages (slug, title, content, meta_description) VALUES
('hakkimizda', 'Hakkımızda', '<h1>Hakkımızda</h1><p>Firmam.org, Türkiye''nin en kapsamlı firma rehberi platformudur. Amacımız, kullanıcılarımızın güvenilir ve kaliteli firmalara kolayca ulaşmasını sağlamaktır.</p><p>Misyonumuz, iş dünyasını dijitalleştirerek müşteriler ve firmalar arasında güvenilir bir köprü oluşturmaktır.</p>', 'Firmam.org hakkında bilgi edinin. Türkiye''nin en kapsamlı firma rehberi platformu.'),
('gizlilik-politikasi', 'Gizlilik Politikası', '<h1>Gizlilik Politikası</h1><p>Firmam.org olarak, kullanıcılarımızın gizliliğine önem veriyoruz. Bu gizlilik politikası, kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.</p><h2>Toplanan Bilgiler</h2><p>Sitemizi ziyaret ettiğinizde, IP adresiniz, tarayıcı bilgileri ve site kullanım verileri otomatik olarak toplanır.</p><h2>Bilgilerin Kullanımı</h2><p>Toplanan bilgiler, hizmetlerimizi geliştirmek ve kullanıcı deneyimini iyileştirmek için kullanılır.</p><h2>Çerezler</h2><p>Sitemizde kullanıcı deneyimini geliştirmek için çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.</p>', 'Firmam.org gizlilik politikası. Kişisel verilerinizin korunması ve kullanımı hakkında bilgi.'),
('kullanim-kosullari', 'Kullanım Koşulları', '<h1>Kullanım Koşulları</h1><p>Firmam.org platformunu kullanarak aşağıdaki şartları kabul etmiş olursunuz.</p><h2>Genel Kurallar</h2><p>Platform, firma arama ve listeleme hizmeti sunmaktadır. Kullanıcılar, platform üzerinden yaptıkları işlemlerde dürüst ve gerçek bilgiler vermelidir.</p><h2>Sorumluluklar</h2><p>Platform üzerinde listelenen firmaların bilgilerinin doğruluğundan firmalar sorumludur. Firmam.org, listelenen firmaların hizmet kalitesinden sorumlu değildir.</p><h2>Yasaklar</h2><p>Platform üzerinde yanıltıcı bilgi paylaşmak, spam göndermek veya yasalara aykırı içerik paylaşmak yasaktır.</p>', 'Firmam.org kullanım koşulları. Platform kullanım kuralları ve sorumluluklar.'),
('cerez-politikasi', 'Çerez Politikası', '<h1>Çerez Politikası</h1><p>Firmam.org, web sitemizde çerezler kullanmaktadır. Bu politika, çerezlerin nasıl kullanıldığını açıklamaktadır.</p><h2>Çerez Nedir?</h2><p>Çerezler, web sitelerinin ziyaretçilerin tarayıcılarına yerleştirdiği küçük metin dosyalarıdır. Bu dosyalar, kullanıcı deneyimini iyileştirmek için kullanılır.</p><h2>Kullanılan Çerez Türleri</h2><ul><li><strong>Zorunlu Çerezler:</strong> Sitenin çalışması için gerekli çerezlerdir.</li><li><strong>Analitik Çerezler:</strong> Site kullanımını analiz etmek için kullanılır.</li><li><strong>Reklam Çerezleri:</strong> Google AdSense gibi reklam platformları tarafından kullanılır.</li></ul><h2>Çerezleri Yönetme</h2><p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Ancak bu durumda bazı site özellikleri düzgün çalışmayabilir.</p>', 'Firmam.org çerez politikası. Web sitemizde kullanılan çerezler hakkında detaylı bilgi.'),
('iletisim', 'İletişim', '<h1>İletişim</h1><p>Firmam.org ile iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.</p><h2>E-posta</h2><p>info@firmam.org</p><h2>Telefon</h2><p>+90 (555) 123 45 67</p><h2>Adres</h2><p>İstanbul, Türkiye</p><h2>Çalışma Saatleri</h2><p>Pazartesi - Cuma: 09:00 - 18:00<br>Cumartesi - Pazar: Kapalı</p>', 'Firmam.org iletişim bilgileri. Bize ulaşın.');

CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_published ON public.pages(is_published);