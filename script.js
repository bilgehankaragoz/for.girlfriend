/**
 * Eda & Bilgehan - Romantik & Şık Web Uygulaması
 * Vanilla JavaScript (HTML, CSS, JS)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. ARKA PLAN SLIDESHOW (bg1.jpg, bg2.jpg, bg3.jpg) & FADE GEÇİŞLERİ
     ========================================================================== */
  const slides = document.querySelectorAll('.slideshow-container .slide');
  let currentSlideIndex = 0;
  const slideIntervalMs = 6000; // 6 saniyede bir değişim

  function showNextSlide() {
    if (slides.length <= 1) return;
    
    slides[currentSlideIndex].classList.remove('slide-active');
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    slides[currentSlideIndex].classList.add('slide-active');
  }

  // Otomatik geçiş döngüsü
  setInterval(showNextSlide, slideIntervalMs);


  /* ==========================================================================
     2. SAYFALAR ARASI PÜRÜZSÜZ GEÇİŞ (SPA GÖRÜNÜM YÖNETİCİSİ)
     ========================================================================== */
  const viewMenu = document.getElementById('view-menu');
  const viewRelationship = document.getElementById('view-relationship');
  const viewSpecial = document.getElementById('view-special');

  const btnToRelationship = document.getElementById('btn-to-relationship');
  const btnToSpecial = document.getElementById('btn-to-special');
  const backButtons = document.querySelectorAll('.back-to-menu-btn');

  function switchView(targetSection) {
    const allViews = [viewMenu, viewRelationship, viewSpecial];
    
    allViews.forEach(view => {
      view.classList.remove('active');
    });

    // Pürüzsüz animasyon için küçük bir zamanlama payı
    setTimeout(() => {
      targetSection.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 80);
  }

  // Buton dinleyicileri
  if (btnToRelationship) {
    btnToRelationship.addEventListener('click', () => switchView(viewRelationship));
  }

  if (btnToSpecial) {
    btnToSpecial.addEventListener('click', () => switchView(viewSpecial));
  }

  backButtons.forEach(btn => {
    btn.addEventListener('click', () => switchView(viewMenu));
  });


  /* ==========================================================================
     3. SAYFA 2: İLİŞKİ SAYACI (COUNT-UP TIMER)
     Başlangıç: 24 Kasım 2024, 00:00:00
     ========================================================================== */
  const relDaysEl = document.getElementById('rel-days');
  const relHoursEl = document.getElementById('rel-hours');
  const relMinutesEl = document.getElementById('rel-minutes');
  const relSecondsEl = document.getElementById('rel-seconds');

  // JavaScript'te aylar 0-indekslidir: Kasım = 10
  const relationshipStartDate = new Date(2024, 10, 24, 0, 0, 0);

  function updateRelationshipTimer() {
    const now = new Date();
    const diffMs = now.getTime() - relationshipStartDate.getTime();

    if (diffMs < 0) {
      // Başlangıç tarihi henüz gelmediyse
      relDaysEl.textContent = '0';
      relHoursEl.textContent = '00';
      relMinutesEl.textContent = '00';
      relSecondsEl.textContent = '00';
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    relDaysEl.textContent = days.toLocaleString('tr-TR');
    relHoursEl.textContent = String(hours).padStart(2, '0');
    relMinutesEl.textContent = String(minutes).padStart(2, '0');
    relSecondsEl.textContent = String(seconds).padStart(2, '0');
  }


  /* ==========================================================================
     4. SAYFA 3: ÖZEL GÜN SAYACI (COUNTDOWN TIMER)
     - Yıl Dönümümüz (24 Kasım)
     - Eda'nın Doğum Günü (18 Temmuz)
     - Bilgehan'ın Doğum Günü (28 Mayıs)
     Gelecekteki en yakın ilk tarihe geri sayım yapar.
     ========================================================================== */
  const specialSelectEl = document.getElementById('special-event-select');
  const targetDateTextEl = document.getElementById('target-date-text');
  const cdDaysEl = document.getElementById('countdown-days');
  const cdHoursEl = document.getElementById('countdown-hours');
  const cdMinutesEl = document.getElementById('countdown-minutes');
  const cdSecondsEl = document.getElementById('countdown-seconds');
  const statusMsgEl = document.getElementById('countdown-status-msg');

  // Özel Gün Tanımları (Ay: 0-indeksli)
  const SPECIAL_EVENTS = {
    'anniversary': {
      title: 'Yıl Dönümümüz',
      month: 10, // Kasım
      day: 24,
      quote: '“Kavuştuğumuz her yeni gün aşkımızı daha da güzelleştiriyor.”'
    },
    'eda-birthday': {
      title: "Eda'nın Doğum Günü",
      month: 6, // Temmuz
      day: 18,
      quote: '“Dünyaya gelişinle hayatıma en güzel baharı getirdin.”'
    },
    'bilgehan-birthday': {
      title: "Bilgehan'ın Doğum Günü",
      month: 4, // Mayıs
      day: 28,
      quote: '“Her yeni yaşında yan yana, el ele, sonsuza dek.”'
    }
  };

  /**
   * Belirtilen ay ve gün için GELECEKTEKİ ilk tarihi hesaplar.
   * Tarih bu yıl geçmişse bir sonraki yıla hedefler.
   */
  function getNextOccurrence(monthIndex, day) {
    const now = new Date();
    const currentYear = now.getFullYear();
    let target = new Date(currentYear, monthIndex, day, 0, 0, 0);

    // Eğer tarih bu yıl için çoktan geçmişse, bir sonraki yıla aktar
    if (target.getTime() <= now.getTime()) {
      target = new Date(currentYear + 1, monthIndex, day, 0, 0, 0);
    }
    return target;
  }

  function updateSpecialCountdown() {
    const selectedKey = specialSelectEl ? specialSelectEl.value : 'anniversary';
    const eventConfig = SPECIAL_EVENTS[selectedKey] || SPECIAL_EVENTS['anniversary'];

    const targetDate = getNextOccurrence(eventConfig.month, eventConfig.day);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    // Hedef tarih metnini göster (örn: "24 Kasım 2026")
    const formattedTarget = targetDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (targetDateTextEl) {
      targetDateTextEl.textContent = formattedTarget;
    }

    if (diffMs <= 0) {
      // Hedef anındayız
      cdDaysEl.textContent = '0';
      cdHoursEl.textContent = '00';
      cdMinutesEl.textContent = '00';
      cdSecondsEl.textContent = '00';
      if (statusMsgEl) {
        statusMsgEl.innerHTML = `<p style="color: var(--accent-gold); font-weight: 600;">🎉 Bugün ${eventConfig.title}! İyi ki varsın! ❤️</p>`;
      }
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    cdDaysEl.textContent = days.toLocaleString('tr-TR');
    cdHoursEl.textContent = String(hours).padStart(2, '0');
    cdMinutesEl.textContent = String(minutes).padStart(2, '0');
    cdSecondsEl.textContent = String(seconds).padStart(2, '0');

    if (statusMsgEl) {
      statusMsgEl.innerHTML = `<p>${eventConfig.quote}</p>`;
    }
  }

  // Seçim değiştiğinde hemen güncelle
  if (specialSelectEl) {
    specialSelectEl.addEventListener('change', updateSpecialCountdown);
  }


  /* ==========================================================================
     5. DÖNGÜLERİ BAŞLAT
     ========================================================================== */
  // İlk çalıştırmalar
  updateRelationshipTimer();
  updateSpecialCountdown();

  // Her saniye güncelle
  setInterval(() => {
    updateRelationshipTimer();
    updateSpecialCountdown();
  }, 1000);

});
