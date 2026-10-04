/**
 * Eda & Bilgehan - Romantik & Şık Web Uygulaması
 * Vanilla JavaScript (HTML, CSS, JS) + Vercel Blob Entegrasyonu
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. ARKA PLAN SLIDESHOW (VERCEL BLOB CLOUD PHOTOS)
     ========================================================================== */
  const fallbackPhotos = ['bg1.jpg', 'bg2.jpg', 'bg3.jpg'];
  let cloudPhotos = [];
  let currentPhotoIndex = 0;
  let activeLayerIndex = 1; // 1 veya 2
  const slideLayer1 = document.getElementById('slide-layer-1');
  const slideLayer2 = document.getElementById('slide-layer-2');
  const slideIntervalMs = 6500;

  // Başlangıç katmanını ayarla
  if (slideLayer1) {
    slideLayer1.style.backgroundImage = `url('${fallbackPhotos[0]}')`;
  }

  function getActivePhotoList() {
    return cloudPhotos.length > 0 ? cloudPhotos : fallbackPhotos;
  }

  function transitionToNextSlide() {
    const list = getActivePhotoList();
    if (list.length <= 1) return;

    currentPhotoIndex = (currentPhotoIndex + 1) % list.length;
    const nextPhotoUrl = list[currentPhotoIndex];

    const currentLayer = activeLayerIndex === 1 ? slideLayer1 : slideLayer2;
    const nextLayer = activeLayerIndex === 1 ? slideLayer2 : slideLayer1;

    if (!currentLayer || !nextLayer) return;

    // Bir sonraki katmanın görselini ayarla
    nextLayer.style.backgroundImage = `url('${nextPhotoUrl}')`;
    nextLayer.classList.add('slide-active');
    currentLayer.classList.remove('slide-active');

    activeLayerIndex = activeLayerIndex === 1 ? 2 : 1;
  }

  // Slayt geçiş zamanlayıcısı
  setInterval(transitionToNextSlide, slideIntervalMs);

  // Vercel Blob'dan fotoğrafları çek
  async function loadCloudPhotos() {
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      if (data.success && Array.isArray(data.photos) && data.photos.length > 0) {
        cloudPhotos = data.photos.map(p => p.url);
        // İlk slayt katmanını hemen Vercel Blob fotoğrafı ile besle
        if (slideLayer1 && cloudPhotos[0]) {
          slideLayer1.style.backgroundImage = `url('${cloudPhotos[0]}')`;
        }
      }
    } catch (err) {
      console.warn('Vercel Blob fotoğrafları yüklenirken yedek fotoğraflar devrede:', err);
    }
  }

  loadCloudPhotos();


  /* ==========================================================================
     2. GÖRÜNÜM YÖNETİCİSİ (SPA SAYFA GEÇİŞLERİ)
     ========================================================================== */
  const viewMenu = document.getElementById('view-menu');
  const viewRelationship = document.getElementById('view-relationship');
  const viewSpecial = document.getElementById('view-special');
  const viewAdmin = document.getElementById('view-admin');

  const btnToRelationship = document.getElementById('btn-to-relationship');
  const btnToSpecial = document.getElementById('btn-to-special');
  const btnOpenAdmin = document.getElementById('btn-open-admin');
  const backButtons = document.querySelectorAll('.back-to-menu-btn');

  function switchView(targetSection) {
    const allViews = [viewMenu, viewRelationship, viewSpecial, viewAdmin];
    allViews.forEach(view => {
      if (view) view.classList.remove('active');
    });

    setTimeout(() => {
      if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  }

  if (btnToRelationship) {
    btnToRelationship.addEventListener('click', () => switchView(viewRelationship));
  }

  if (btnToSpecial) {
    btnToSpecial.addEventListener('click', () => switchView(viewSpecial));
  }

  if (btnOpenAdmin) {
    btnOpenAdmin.addEventListener('click', () => {
      switchView(viewAdmin);
      checkAdminAuthStatus();
    });
  }

  backButtons.forEach(btn => {
    btn.addEventListener('click', () => switchView(viewMenu));
  });


  /* ==========================================================================
     3. SAYFA 2: İLİŞKİ SAYACI (SABİT BAŞLANGIÇ: 24 Kasım 2024)
     ========================================================================== */
  const relDaysEl = document.getElementById('rel-days');
  const relHoursEl = document.getElementById('rel-hours');
  const relMinutesEl = document.getElementById('rel-minutes');
  const relSecondsEl = document.getElementById('rel-seconds');

  // SABİT BAŞLANGIÇ TARİHİ: 24 Kasım 2024, 00:00:00 (Kasım = 10)
  const relationshipStartDate = new Date(2024, 10, 24, 0, 0, 0);

  function updateRelationshipTimer() {
    const now = new Date();
    const diffMs = now.getTime() - relationshipStartDate.getTime();

    if (diffMs < 0) {
      if (relDaysEl) relDaysEl.textContent = '0';
      if (relHoursEl) relHoursEl.textContent = '00';
      if (relMinutesEl) relMinutesEl.textContent = '00';
      if (relSecondsEl) relSecondsEl.textContent = '00';
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (relDaysEl) relDaysEl.textContent = days.toLocaleString('tr-TR');
    if (relHoursEl) relHoursEl.textContent = String(hours).padStart(2, '0');
    if (relMinutesEl) relMinutesEl.textContent = String(minutes).padStart(2, '0');
    if (relSecondsEl) relSecondsEl.textContent = String(seconds).padStart(2, '0');
  }


  /* ==========================================================================
     4. SAYFA 3: ÖZEL GÜN SAYACI (COUNTDOWN TIMER)
     ========================================================================== */
  const specialSelectEl = document.getElementById('special-event-select');
  const targetDateTextEl = document.getElementById('target-date-text');
  const cdDaysEl = document.getElementById('countdown-days');
  const cdHoursEl = document.getElementById('countdown-hours');
  const cdMinutesEl = document.getElementById('countdown-minutes');
  const cdSecondsEl = document.getElementById('countdown-seconds');
  const statusMsgEl = document.getElementById('countdown-status-msg');

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

  function getNextOccurrence(monthIndex, day) {
    const now = new Date();
    const currentYear = now.getFullYear();
    let target = new Date(currentYear, monthIndex, day, 0, 0, 0);

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

    const formattedTarget = targetDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (targetDateTextEl) {
      targetDateTextEl.textContent = formattedTarget;
    }

    if (diffMs <= 0) {
      if (cdDaysEl) cdDaysEl.textContent = '0';
      if (cdHoursEl) cdHoursEl.textContent = '00';
      if (cdMinutesEl) cdMinutesEl.textContent = '00';
      if (cdSecondsEl) cdSecondsEl.textContent = '00';
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

    if (cdDaysEl) cdDaysEl.textContent = days.toLocaleString('tr-TR');
    if (cdHoursEl) cdHoursEl.textContent = String(hours).padStart(2, '0');
    if (cdMinutesEl) cdMinutesEl.textContent = String(minutes).padStart(2, '0');
    if (cdSecondsEl) cdSecondsEl.textContent = String(seconds).padStart(2, '0');

    if (statusMsgEl) {
      statusMsgEl.innerHTML = `<p>${eventConfig.quote}</p>`;
    }
  }

  if (specialSelectEl) {
    specialSelectEl.addEventListener('change', updateSpecialCountdown);
  }


  /* ==========================================================================
     5. SAYFA 4: YÖNETİCİ / ADMIN PANELİ MANTIĞI
     ========================================================================== */
  const adminLoginBox = document.getElementById('admin-login-box');
  const adminDashboardBox = document.getElementById('admin-dashboard-box');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminPasswordInput = document.getElementById('admin-password-input');
  const adminLoginError = document.getElementById('admin-login-error');
  const btnAdminLogout = document.getElementById('btn-admin-logout');

  const uploadDropzone = document.getElementById('upload-dropzone');
  const adminFileInput = document.getElementById('admin-file-input');
  const uploadProgressContainer = document.getElementById('upload-progress-container');
  const uploadProgressFill = document.getElementById('upload-progress-fill');
  const uploadStatusText = document.getElementById('upload-status-text');

  const adminPhotoGrid = document.getElementById('admin-photo-grid');
  const galleryCountEl = document.getElementById('gallery-count');

  function getSavedAdminPassword() {
    return sessionStorage.getItem('gf_admin_password') || '';
  }

  function setSavedAdminPassword(pwd) {
    sessionStorage.setItem('gf_admin_password', pwd);
  }

  function clearSavedAdminPassword() {
    sessionStorage.removeItem('gf_admin_password');
  }

  function checkAdminAuthStatus() {
    const pwd = getSavedAdminPassword();
    if (pwd) {
      adminLoginBox.style.display = 'none';
      adminDashboardBox.style.display = 'block';
      loadAdminGallery();
    } else {
      adminLoginBox.style.display = 'block';
      adminDashboardBox.style.display = 'none';
      if (adminPasswordInput) adminPasswordInput.focus();
    }
  }

  // Giriş Yap
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const enteredPassword = adminPasswordInput.value.trim();
      if (!enteredPassword) return;

      adminLoginError.style.display = 'none';

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: enteredPassword })
        });
        const data = await res.json();

        if (data.success) {
          setSavedAdminPassword(enteredPassword);
          adminPasswordInput.value = '';
          checkAdminAuthStatus();
        } else {
          adminLoginError.textContent = data.error || 'Şifre hatalı.';
          adminLoginError.style.display = 'block';
        }
      } catch (err) {
        adminLoginError.textContent = 'Giriş sırasında sunucu hatası oluştu.';
        adminLoginError.style.display = 'block';
      }
    });
  }

  // Çıkış Yap
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      clearSavedAdminPassword();
      checkAdminAuthStatus();
    });
  }

  // Admin Galerisini Yükle
  async function loadAdminGallery() {
    if (!adminPhotoGrid) return;
    adminPhotoGrid.innerHTML = '<div class="gallery-loading">Vercel Blob fotoğrafları listeleniyor...</div>';

    try {
      const res = await fetch('/api/photos');
      const data = await res.json();

      if (!data.success || !Array.isArray(data.photos) || data.photos.length === 0) {
        adminPhotoGrid.innerHTML = '<div class="gallery-empty">Henüz yüklenmiş fotoğraf yok. Yukarıdan ilk fotoğrafı yükleyebilirsiniz.</div>';
        if (galleryCountEl) galleryCountEl.textContent = '0';
        cloudPhotos = [];
        return;
      }

      cloudPhotos = data.photos.map(p => p.url);
      if (galleryCountEl) galleryCountEl.textContent = String(data.photos.length);

      adminPhotoGrid.innerHTML = '';
      data.photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'photo-card';

        const dateStr = photo.uploadedAt
          ? new Date(photo.uploadedAt).toLocaleDateString('tr-TR')
          : '';

        card.innerHTML = `
          <div class="photo-thumb-wrap">
            <img src="${photo.url}" alt="Fotoğraf" class="photo-thumb" loading="lazy">
          </div>
          <div class="photo-card-info">
            <span class="photo-name" title="${photo.pathname || 'Fotoğraf'}">${dateStr || photo.pathname || 'Fotoğraf'}</span>
            <button class="btn-delete-photo" type="button" data-url="${photo.url}">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 1-2h6c1 0 2 1 2 2v2"/></svg>
              <span>Sil</span>
            </button>
          </div>
        `;

        const deleteBtn = card.querySelector('.btn-delete-photo');
        deleteBtn.addEventListener('click', () => handleDeletePhoto(photo.url));

        adminPhotoGrid.appendChild(card);
      });

    } catch (err) {
      adminPhotoGrid.innerHTML = '<div class="gallery-empty" style="color: #f87171;">Fotoğraflar yüklenirken hata oluştu.</div>';
    }
  }

  // Fotoğraf Sil
  async function handleDeletePhoto(url) {
    if (!confirm('Bu fotoğrafı Vercel bulut deposundan silmek istediğinize emin misiniz?')) {
      return;
    }

    const password = getSavedAdminPassword();
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, password })
      });
      const data = await res.json();

      if (data.success) {
        await loadAdminGallery();
      } else {
        alert(data.error || 'Silme işlemi başarısız oldu.');
      }
    } catch (err) {
      alert('Silme sırasında bağlantı hatası oluştu.');
    }
  }

  // Fotoğraf Yükleme (Vercel Blob)
  async function uploadFiles(files) {
    if (!files || files.length === 0) return;

    const password = getSavedAdminPassword();
    uploadProgressContainer.style.display = 'block';
    uploadProgressFill.style.width = '0%';
    uploadStatusText.textContent = `0 / ${files.length} fotoğraf yükleniyor...`;

    let uploadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      uploadStatusText.textContent = `${file.name} Vercel Blob'a aktarılıyor (${i + 1}/${files.length})...`;

      try {
        const base64Data = await readFileAsBase64(file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileBase64: base64Data,
            password
          })
        });

        const data = await res.json();
        if (data.success) {
          uploadedCount++;
        } else {
          console.error('Yükleme hatası:', data.error);
        }
      } catch (err) {
        console.error('Dosya okuma/gönderme hatası:', err);
      }

      const percent = Math.round(((i + 1) / files.length) * 100);
      uploadProgressFill.style.width = `${percent}%`;
    }

    uploadStatusText.textContent = `${uploadedCount} fotoğraf başarıyla Vercel Blob'a kaydedildi! ✨`;
    setTimeout(() => {
      uploadProgressContainer.style.display = 'none';
      uploadProgressFill.style.width = '0%';
    }, 2500);

    // Galeriyi ve slaytı anında tazele
    await loadAdminGallery();
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Sürükle & Bırak Dinleyicileri
  if (uploadDropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadDropzone.classList.remove('dragover');
      });
    });

    uploadDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        uploadFiles(files);
      }
    });
  }

  if (adminFileInput) {
    adminFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFiles(e.target.files);
        e.target.value = '';
      }
    });
  }


  /* ==========================================================================
     6. SAYAÇ DÖNGÜSÜ
     ========================================================================== */
  updateRelationshipTimer();
  updateSpecialCountdown();

  setInterval(() => {
    updateRelationshipTimer();
    updateSpecialCountdown();
  }, 1000);

});
