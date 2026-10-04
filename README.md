# for.girlfriend ✨ | Sonsuz Dikey Fotoğraf Kolajı & Aşk Hatırası

Sevgiliniz için özel olarak tasarlanmış; arka planda anı fotoğraflarınızın **dikey akan bantlar (infinite vertical marquee collage)** halinde sürekli döndüğü, cam efekti (glassmorphism), canlı ilişki sayacı, romantik mektup ve ambiyans müziği içeren modern web sitesi projesi.

---

## 🌟 Öne Çıkan Özellikler

1. **Sonsuz Dikey Kayan Kolaj Bantları (Vertical Photo Bands):**
   - Arka planda ekran çözünürlüğüne göre 3 ila 6 adet dikey sütun (bant) halinde fotoğraflar akar.
   - Sütunlar zıt yönlerde (biri yukarı, diğeri aşağı) ve farklı tatlı hızlarda kesintisiz (infinite seamless loop) döner.
   - Polaroid kart tarzı tasarım, estetik bant çıkartmaları, hafif açılı duruşlar ve üzerine gelindiğinde ince yavaşlama.
   - Herhangi bir fotoğrafa tıklandığında tam ekran polaroid lightbox açılır.

2. **Gelişmiş Fotoğraf Yönetimi & Yükleme (IndexedDB):**
   - Sürükle & bırak (Drag and Drop) veya dosya seçici ile tek seferde birden fazla fotoğraf yükleme.
   - Fotoğraf bağlantısı (URL) ile doğrudan ekleme.
   - Tarayıcı içi `IndexedDB` veritabanı sayesinde yüklediğiniz fotoğraflar sayfa yenilense bile silinmez.
   - **Galeri Yöneticisi:** Kolajdaki fotoğrafları listeleme, istenen fotoğrafı kolajdan çıkarma veya tek tıkla varsayılan romantik koleksiyona sıfırlama.

3. **Canlı Yıldönümü / Zaman Sayacı:**
   - İlişkinizin başladığı andan bugüne kadar geçen süreyi gün, saat, dakika ve saniye olarak canlı sayar.
   - Başlangıç tarihi ayarlar panelinden kolayca değiştirilebilir.

4. **Kişiselleştirilebilir Romantik Mektup:**
   - Sevgilinize özel zarf / mektup açılır penceresi.
   - İstediğiniz an ayarlar panelinden mektubun içeriğini, başlığını ve imzasını düzenleyebilirsiniz.

5. **Web Audio API Romantik Melodi (Offline & Lisanssız):**
   - Dışarıdan MP3 indirmeye gerek kalmadan, doğrudan tarayıcının Web Audio motoruyla üretilen dinlendirici lofi/piyano melodi kutusu.

6. **Odak Modu (Zen / Tam Ekran Kolaj Modu):**
   - Sağ üstteki genişletme ikonuna veya "Odak Modu" butonuna basıldığında ortadaki kart gizlenir; tüm ekranı yalnızca büyüleyici dikey fotoğraf akışı kaplar.

7. **Romantik Renk Modları:**
   - Gül Kurusu & Romantik, Sıcak & Altın Güneş, Nostaljik Vintage, Masalsı Glow, Siyah & Beyaz veya Orijinal.

---

## 🚀 Nasıl Çalıştırılır?

Proje saf HTML5, CSS3 ve modern JavaScript ile yazılmıştır; hiçbir ek derleyici (Node.js/npm) kurulumu gerektirmez.

### 1. Yerel Olarak Çalıştırma:
- `index.html` dosyasını doğrudan herhangi bir web tarayıcısında (Chrome, Brave, Edge, Safari vb.) çift tıklayarak açabilirsiniz.
- Veya VS Code kullanıyorsanız "Live Server" eklentisiyle açabilirsiniz.

### 2. GitHub Pages ile Canlıya Alma (Ücretsiz):
Bu repo GitHub'da `for.girlfriend` ismiyle açıldığı için saniyeler içinde sevgilinizin telefonundan veya bilgisayarından erişebileceği canlı bir link haline getirebilirsiniz:

1. Bu klasördeki dosyaları GitHub reponuza push edin:
   ```bash
   git init
   git add .
   git commit -m "feat: sonsuz dikey kolaj ve aşk hatırası sitesi"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/for.girlfriend.git
   git push -u origin main
   ```
2. GitHub'da deponuzun sayfasına gidin (`https://github.com/KULLANICI_ADINIZ/for.girlfriend`).
3. **Settings** (Ayarlar) > **Pages** menüsüne gelin.
4. **Build and deployment** kısmında **Branch** olarak `main` ve `/ (root)` seçip **Save** butonuna tıklayın.
5. Birkaç dakika içinde `https://KULLANICI_ADINIZ.github.io/for.girlfriend/` adresinde siteniz yayında olacaktır! ❤️

---

## 📁 Proje Dizin Yapısı

```
d:/gf/
├── index.html         # Ana sayfa, şablon, modal pencereleri ve arayüz
├── README.md          # Dokümantasyon ve GitHub Pages rehberi
├── css/
│   └── style.css      # Sonsuz dikey bant animasyonları, glassmorphism, responsive tasarım
└── js/
    ├── db.js          # IndexedDB / LocalStorage depolama motoru & varsayılan fotoğraflar
    ├── audio.js       # Web Audio API ile üretilen romantik fon müziği
    ├── collage.js     # Dinamik dikey sütunları hesaplayan ve sonsuz akışı sağlayan motor
    └── app.js         # Sayaç, modal yönetimi, sürükle-bırak yükleme ve ayarlar
```

---

## 💡 İpuçları & Kişiselleştirme

- **Kendi Fotoğraflarınızı Yükleyin:** Sağ üstteki *"Fotoğraf Ekle"* veya ana karttaki *"Anı Fotoğraflarımızı Yükle"* butonuna tıklayıp birlikte çekildiğiniz fotoğrafları bırakın.
- **İsimleri ve Tarihi Değiştirin:** Sağ üstteki dişli çark simgesine (Ayarlar) tıklayarak sevgilinizin adını, ilişkinizin başlangıç tarihini ve özel notunuzu güncelleyin.
- **Müzik:** Üst bardaki *"Melodi"* butonuna tıklayarak romantik ortam sesini başlatıp durdurabilirsiniz.
