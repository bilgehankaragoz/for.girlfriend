/**
 * Main Application Controller for for.girlfriend
 * Clean, fast, zero-flicker photo upload, gallery manager, and live counters
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Database
  await window.memoryDB.init();

  // App State
  let state = {
    photos: [],
    settings: {},
    uploadQueue: [],
    elapsedTimer: null,
    countdownTimer: null
  };

  // DOM Elements
  const el = {
    photoCountBadge: document.getElementById('photo-count-badge'),
    btnUploadTrigger: document.getElementById('btn-upload-trigger'),
    btnGalleryManager: document.getElementById('btn-gallery-manager'),
    btnToggleFullscreen: document.getElementById('btn-toggle-fullscreen'),
    btnToggleDrawer: document.getElementById('btn-toggle-drawer'),
    speedChips: document.querySelectorAll('.speed-chip'),

    // Drawer Elements
    sideDrawer: document.getElementById('side-drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    drawerTabBtns: document.querySelectorAll('.drawer-tab-btn'),
    drawerTabPanes: document.querySelectorAll('.drawer-tab-pane'),

    // Elapsed Counter Elements
    elapsedDays: document.getElementById('elapsed-days'),
    elapsedHours: document.getElementById('elapsed-hours'),
    elapsedMinutes: document.getElementById('elapsed-minutes'),
    elapsedSeconds: document.getElementById('elapsed-seconds'),
    inputRelationshipStart: document.getElementById('input-relationship-start'),
    btnSaveStartDate: document.getElementById('btn-save-start-date'),

    // Countdown Elements
    countdownDays: document.getElementById('countdown-days'),
    countdownHours: document.getElementById('countdown-hours'),
    countdownMinutes: document.getElementById('countdown-minutes'),
    countdownSeconds: document.getElementById('countdown-seconds'),
    displayTargetName: document.getElementById('display-target-name'),
    countdownBadgeTitle: document.getElementById('countdown-badge-title'),
    selectSpecialEvent: document.getElementById('select-special-event'),
    inputTargetTitle: document.getElementById('input-target-title'),
    inputTargetDate: document.getElementById('input-target-date'),
    btnSaveTargetDate: document.getElementById('btn-save-target-date'),

    // Modals
    uploadModal: document.getElementById('upload-modal'),
    galleryModal: document.getElementById('gallery-modal'),
    lightboxModal: document.getElementById('lightbox-modal'),

    // Upload Elements
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    imageUrlInput: document.getElementById('image-url-input'),
    btnAddUrl: document.getElementById('btn-add-url'),
    uploadQueueContainer: document.getElementById('upload-queue-container'),
    uploadQueueGrid: document.getElementById('upload-queue-grid'),
    queueCount: document.getElementById('queue-count'),
    btnConfirmUpload: document.getElementById('btn-confirm-upload'),

    // Gallery Elements
    galleryCardsGrid: document.getElementById('gallery-cards-grid'),
    galleryTotalCount: document.getElementById('gallery-total-count'),
    btnGalleryAddMore: document.getElementById('btn-gallery-add-more'),
    btnResetDefaultPhotos: document.getElementById('btn-reset-default-photos'),

    // Lightbox
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxDate: document.getElementById('lightbox-date'),
    lightboxCloseBtn: document.getElementById('lightbox-close-btn')
  };

  // ==========================================
  // INITIALIZATION
  // ==========================================
  async function initApp() {
    state.settings = await window.memoryDB.getSettings();
    state.photos = await window.memoryDB.getAllPhotos();

    applySpeed(state.settings.speed || 'normal');

    // Populate Drawer Inputs
    setupDrawerData();

    // Start Live Timers
    startElapsedTimer();
    startCountdownTimer();

    // Setup Collage
    window.collageRenderer.setOnPhotoClick(openLightbox);
    refreshCollage();

    // Event Listeners
    setupEventListeners();
  }

  function refreshCollage() {
    window.collageRenderer.setPhotos(state.photos);
    el.photoCountBadge.textContent = state.photos.length;
    el.galleryTotalCount.textContent = state.photos.length;
  }

  // ==========================================
  // DRAWER & TAB MANAGEMENT
  // ==========================================
  function openDrawer() {
    el.sideDrawer.classList.add('active');
    el.drawerBackdrop.classList.add('active');
    el.sideDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    el.sideDrawer.classList.remove('active');
    el.drawerBackdrop.classList.remove('active');
    el.sideDrawer.setAttribute('aria-hidden', 'true');
  }

  function switchDrawerTab(targetTabId) {
    el.drawerTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetTabId);
    });
    el.drawerTabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === targetTabId);
    });
  }

  function setupDrawerData() {
    const s = state.settings;

    // Start Date Input
    if (s.startDate) {
      el.inputRelationshipStart.value = s.startDate.substring(0, 16);
    }

    // Countdown Inputs
    el.displayTargetName.textContent = s.targetTitle || 'Özel Gün';
    el.inputTargetTitle.value = s.targetTitle || '';
    if (s.targetDate) {
      el.inputTargetDate.value = s.targetDate.substring(0, 16);
    }
    if (s.specialEventKey) {
      el.selectSpecialEvent.value = s.specialEventKey;
    }
  }

  // ==========================================
  // LIVE ELAPSED TIMER (İLİŞKİ SAYACI)
  // ==========================================
  function startElapsedTimer() {
    if (state.elapsedTimer) clearInterval(state.elapsedTimer);

    function update() {
      const start = new Date(state.settings.startDate);
      const now = new Date();
      let diffMs = now - start;

      if (isNaN(diffMs) || diffMs < 0) diffMs = 0;

      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / (3600 * 24));
      const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      el.elapsedDays.textContent = days.toLocaleString('tr-TR');
      el.elapsedHours.textContent = String(hours).padStart(2, '0');
      el.elapsedMinutes.textContent = String(minutes).padStart(2, '0');
      el.elapsedSeconds.textContent = String(seconds).padStart(2, '0');
    }

    update();
    state.elapsedTimer = setInterval(update, 1000);
  }

  // ==========================================
  // LIVE COUNTDOWN TIMER (ÖZEL GÜNLER GERİ SAYIMI)
  // ==========================================
  function startCountdownTimer() {
    if (state.countdownTimer) clearInterval(state.countdownTimer);

    function update() {
      const target = new Date(state.settings.targetDate);
      const now = new Date();
      let diffMs = target - now;

      if (isNaN(diffMs)) return;

      if (diffMs <= 0) {
        el.countdownBadgeTitle.textContent = 'Günün Kutlu Olsun!';
        el.countdownDays.textContent = '0';
        el.countdownHours.textContent = '00';
        el.countdownMinutes.textContent = '00';
        el.countdownSeconds.textContent = '00';
        return;
      }

      el.countdownBadgeTitle.textContent = 'Geri Sayım';
      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / (3600 * 24));
      const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      el.countdownDays.textContent = days.toLocaleString('tr-TR');
      el.countdownHours.textContent = String(hours).padStart(2, '0');
      el.countdownMinutes.textContent = String(minutes).padStart(2, '0');
      el.countdownSeconds.textContent = String(seconds).padStart(2, '0');
    }

    update();
    state.countdownTimer = setInterval(update, 1000);
  }

  // Handle preset special day selection
  function handlePresetEventChange(preset) {
    const now = new Date();
    const currentYear = now.getFullYear();

    let title = '';
    let target = new Date();

    switch (preset) {
      case 'anniversary':
        title = 'Yıldönümümüz';
        const start = new Date(state.settings.startDate);
        const annMonth = start.getMonth();
        const annDay = start.getDate();
        target = new Date(currentYear, annMonth, annDay, 0, 0, 0);
        if (target < now) {
          target.setFullYear(currentYear + 1);
        }
        break;

      case 'birthday':
        title = 'Doğum Günü';
        // Defaults to current month + 1
        target = new Date(currentYear, (now.getMonth() + 1) % 12, 15, 0, 0, 0);
        if (target < now) {
          target.setFullYear(currentYear + 1);
        }
        break;

      case 'valentines':
        title = '14 Şubat Sevgililer Günü';
        target = new Date(currentYear, 1, 14, 0, 0, 0); // Feb 14
        if (target < now) {
          target.setFullYear(currentYear + 1);
        }
        break;

      case 'newyear':
        title = 'Yeni Yıl Kutlaması';
        target = new Date(currentYear + 1, 0, 1, 0, 0, 0); // Jan 1
        break;

      case 'custom':
      default:
        title = el.inputTargetTitle.value || 'Özel Gün';
        return; // Keep existing date
    }

    el.inputTargetTitle.value = title;
    el.inputTargetDate.value = target.toISOString().substring(0, 16);
  }

  // ==========================================
  // SPEED CONTROL
  // ==========================================
  function applySpeed(speed) {
    const multipliers = { slow: 0.55, normal: 1, fast: 1.85 };
    const mult = multipliers[speed] || 1;
    document.documentElement.style.setProperty('--scroll-speed-mult', mult);

    el.speedChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.speed === speed);
    });

    state.settings.speed = speed;
    window.memoryDB.saveSettings(state.settings);
  }

  // ==========================================
  // LIGHTBOX VIEWER
  // ==========================================
  function openLightbox(photo) {
    el.lightboxImg.src = photo.url;
    el.lightboxDate.textContent = photo.caption || '';
    el.lightboxModal.classList.add('active');
    el.lightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    el.lightboxModal.classList.remove('active');
    el.lightboxModal.setAttribute('aria-hidden', 'true');
  }

  // ==========================================
  // MODAL MANAGEMENT
  // ==========================================
  function openModal(modalEl) {
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      const target = document.getElementById(modalId);
      if (target) closeModal(target);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // ==========================================
  // PHOTO UPLOADS
  // ==========================================
  function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const item = {
          id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
          url: e.target.result,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Fotoğraf'
        };
        state.uploadQueue.push(item);
        renderUploadQueue();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderUploadQueue() {
    el.uploadQueueGrid.innerHTML = '';
    el.queueCount.textContent = state.uploadQueue.length;

    if (state.uploadQueue.length > 0) {
      el.uploadQueueContainer.classList.remove('hidden');
      el.btnConfirmUpload.disabled = false;

      state.uploadQueue.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'queue-item';

        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.caption;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'queue-item-remove';
        removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        removeBtn.title = 'Kaldır';
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          state.uploadQueue.splice(idx, 1);
          renderUploadQueue();
        };

        card.appendChild(img);
        card.appendChild(removeBtn);
        el.uploadQueueGrid.appendChild(card);
      });
    } else {
      el.uploadQueueContainer.classList.add('hidden');
      el.btnConfirmUpload.disabled = true;
    }
  }

  async function confirmUploadQueue() {
    if (state.uploadQueue.length === 0) return;

    await window.memoryDB.addPhotos(state.uploadQueue);
    state.photos = await window.memoryDB.getAllPhotos();
    refreshCollage();

    state.uploadQueue = [];
    renderUploadQueue();
    closeModal(el.uploadModal);
  }

  function addUrlPhoto() {
    const url = el.imageUrlInput.value.trim();
    if (!url) return;

    const item = {
      id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      url: url,
      caption: 'Eklenen Fotoğraf'
    };

    state.uploadQueue.push(item);
    renderUploadQueue();
    el.imageUrlInput.value = '';
  }

  // ==========================================
  // GALLERY MANAGER
  // ==========================================
  function openGalleryManager() {
    renderGalleryCards();
    openModal(el.galleryModal);
  }

  function renderGalleryCards() {
    el.galleryCardsGrid.innerHTML = '';
    el.galleryTotalCount.textContent = state.photos.length;

    state.photos.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.caption || 'Fotoğraf';

      const actions = document.createElement('div');
      actions.className = 'gallery-item-actions';

      const viewBtn = document.createElement('button');
      viewBtn.className = 'gallery-btn-action';
      viewBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
      viewBtn.title = 'Büyüt';
      viewBtn.onclick = () => openLightbox(photo);

      const delBtn = document.createElement('button');
      delBtn.className = 'gallery-btn-action delete';
      delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      delBtn.title = 'Sil';
      delBtn.onclick = async () => {
        if (state.photos.length <= 1) {
          alert('Kolajda en az bir fotoğraf bulunmalıdır.');
          return;
        }
        await window.memoryDB.deletePhoto(photo.id);
        state.photos = await window.memoryDB.getAllPhotos();
        refreshCollage();
        renderGalleryCards();
      };

      actions.appendChild(viewBtn);
      actions.appendChild(delBtn);
      item.appendChild(img);
      item.appendChild(actions);
      el.galleryCardsGrid.appendChild(item);
    });
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  function setupEventListeners() {
    // Drawer open/close
    el.btnToggleDrawer.addEventListener('click', openDrawer);
    el.drawerCloseBtn.addEventListener('click', closeDrawer);
    el.drawerBackdrop.addEventListener('click', closeDrawer);

    // Drawer Tabs
    el.drawerTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        switchDrawerTab(btn.dataset.tab);
      });
    });

    // Save Start Date (İlişki Sayacı)
    el.btnSaveStartDate.addEventListener('click', async () => {
      const val = el.inputRelationshipStart.value;
      if (!val) return;
      state.settings.startDate = val;
      await window.memoryDB.saveSettings(state.settings);
      startElapsedTimer();
      el.btnSaveStartDate.textContent = 'Kaydedildi!';
      setTimeout(() => { el.btnSaveStartDate.textContent = 'Kaydet'; }, 1500);
    });

    // Preset Special Day Change
    el.selectSpecialEvent.addEventListener('change', (e) => {
      handlePresetEventChange(e.target.value);
    });

    // Save Target Date (Geri Sayım)
    el.btnSaveTargetDate.addEventListener('click', async () => {
      const title = el.inputTargetTitle.value.trim() || 'Özel Gün';
      const dateVal = el.inputTargetDate.value;
      if (!dateVal) return;

      state.settings.targetTitle = title;
      state.settings.targetDate = dateVal;
      state.settings.specialEventKey = el.selectSpecialEvent.value;

      el.displayTargetName.textContent = title;
      await window.memoryDB.saveSettings(state.settings);
      startCountdownTimer();

      el.btnSaveTargetDate.textContent = 'Uygulandı!';
      setTimeout(() => { el.btnSaveTargetDate.textContent = 'Uygula'; }, 1500);
    });

    // Modal Triggers
    el.btnUploadTrigger.addEventListener('click', () => openModal(el.uploadModal));
    el.btnGalleryManager.addEventListener('click', openGalleryManager);
    el.btnGalleryAddMore.addEventListener('click', () => {
      closeModal(el.galleryModal);
      openModal(el.uploadModal);
    });

    el.btnResetDefaultPhotos.addEventListener('click', async () => {
      if (confirm('Fotoğrafları varsayılan koleksiyona sıfırlamak istiyor musunuz?')) {
        state.photos = await window.memoryDB.resetPhotosToDefault();
        refreshCollage();
        renderGalleryCards();
      }
    });

    // Fullscreen toggle
    el.btnToggleFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Escape closes everything
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDrawer();
        closeLightbox();
        closeModal(el.uploadModal);
        closeModal(el.galleryModal);
      }
    });

    // Speed chips
    el.speedChips.forEach(chip => {
      chip.addEventListener('click', () => {
        applySpeed(chip.dataset.speed);
      });
    });

    // Dropzone & File Pick
    el.dropZone.addEventListener('click', () => el.fileInput.click());
    el.fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    ['dragenter', 'dragover'].forEach(eventName => {
      el.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      el.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.dropZone.classList.remove('dragover');
      });
    });

    el.dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    });

    // Add Photo via URL
    el.btnAddUrl.addEventListener('click', addUrlPhoto);
    el.imageUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addUrlPhoto();
      }
    });

    // Confirm Upload
    el.btnConfirmUpload.addEventListener('click', confirmUploadQueue);

    // Lightbox Close
    el.lightboxCloseBtn.addEventListener('click', closeLightbox);
    el.lightboxModal.addEventListener('click', (e) => {
      if (e.target === el.lightboxModal) closeLightbox();
    });
  }

  // Run initialization
  await initApp();
});
