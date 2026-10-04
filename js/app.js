/**
 * Main Application Controller for for.girlfriend
 * Orchestrates Collage, Audio, Counter, Uploads, Settings and Interactions
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Database
  await window.memoryDB.init();

  // App State
  let state = {
    photos: [],
    settings: {},
    uploadQueue: [],
    counterTimer: null,
    isFocusMode: false
  };

  // DOM Elements
  const el = {
    // Nav & Badges
    navCoupleNames: document.getElementById('nav-couple-names'),
    photoCountBadge: document.getElementById('photo-count-badge'),
    btnToggleMusic: document.getElementById('btn-toggle-music'),
    btnUploadTrigger: document.getElementById('btn-upload-trigger'),
    btnGalleryManager: document.getElementById('btn-gallery-manager'),
    btnOpenSettings: document.getElementById('btn-open-settings'),
    btnToggleFocus: document.getElementById('btn-toggle-focus'),
    btnExitFocus: document.getElementById('btn-exit-focus'),

    // Hero
    displayCoupleNames: document.getElementById('display-couple-names'),
    displayRomanticQuote: document.getElementById('display-romantic-quote'),
    displayStartDate: document.getElementById('display-start-date'),
    timeDays: document.getElementById('time-days'),
    timeHours: document.getElementById('time-hours'),
    timeMinutes: document.getElementById('time-minutes'),
    timeSeconds: document.getElementById('time-seconds'),
    btnOpenLetter: document.getElementById('btn-open-letter'),
    btnQuickUpload: document.getElementById('btn-quick-upload'),
    filterDropdown: document.getElementById('filter-dropdown'),
    speedChips: document.querySelectorAll('.speed-chip'),

    // Modals
    uploadModal: document.getElementById('upload-modal'),
    galleryModal: document.getElementById('gallery-modal'),
    letterModal: document.getElementById('letter-modal'),
    settingsModal: document.getElementById('settings-modal'),
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

    // Letter Elements
    letterTitle: document.getElementById('letter-title'),
    letterBody: document.getElementById('letter-body'),
    letterSignatureDisplay: document.getElementById('letter-signature-display'),
    letterDateDisplay: document.getElementById('letter-date-display'),
    btnEditLetter: document.getElementById('btn-edit-letter'),

    // Settings Form Elements
    settingsForm: document.getElementById('settings-form'),
    inputPartnerName: document.getElementById('input-partner-name'),
    inputGirlfriendName: document.getElementById('input-girlfriend-name'),
    inputAnniversaryDate: document.getElementById('input-anniversary-date'),
    inputCustomQuote: document.getElementById('input-custom-quote'),
    inputLetterText: document.getElementById('input-letter-text'),
    inputLetterSignature: document.getElementById('input-letter-signature'),
    btnSaveSettings: document.getElementById('btn-save-settings'),

    // Lightbox
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxDate: document.getElementById('lightbox-date'),
    lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
    lightboxHeartBtn: document.getElementById('lightbox-heart-btn'),

    // Particles
    particlesContainer: document.getElementById('particles-container')
  };

  // ==========================================
  // INITIALIZATION & DATA LOADING
  // ==========================================
  async function initApp() {
    state.settings = await window.memoryDB.getSettings();
    state.photos = await window.memoryDB.getAllPhotos();

    applySettingsToUI();
    applySpeed(state.settings.speed || 'normal');
    applyFilter(state.settings.filter || 'romantic');

    // Setup Collage
    window.collageRenderer.setOnPhotoClick(openLightbox);
    refreshCollage();

    // Start Live Anniversary Counter
    startCounter();

    // Floating heart ambient particles
    startAmbientParticles();

    // Event Listeners
    setupEventListeners();
  }

  // ==========================================
  // COLLAGE & GALLERY REFRESH
  // ==========================================
  function refreshCollage() {
    window.collageRenderer.setPhotos(state.photos);
    el.photoCountBadge.textContent = state.photos.length;
    el.galleryTotalCount.textContent = state.photos.length;
  }

  // ==========================================
  // SETTINGS & UI BINDING
  // ==========================================
  function applySettingsToUI() {
    const s = state.settings;
    const coupleText = `${s.partnerName} & ${s.girlfriendName}`;

    el.navCoupleNames.textContent = coupleText;
    el.displayCoupleNames.textContent = coupleText;
    el.displayRomanticQuote.textContent = `"${s.romanticQuote}"`;

    // Form inputs
    el.inputPartnerName.value = s.partnerName || '';
    el.inputGirlfriendName.value = s.girlfriendName || '';
    el.inputAnniversaryDate.value = s.startDate ? s.startDate.substring(0, 16) : '';
    el.inputCustomQuote.value = s.romanticQuote || '';
    el.inputLetterText.value = s.letterBody || '';
    el.inputLetterSignature.value = s.letterSignature || '';

    // Letter
    el.letterTitle.textContent = `${s.girlfriendName}'e Sevgilerimle...`;
    el.letterSignatureDisplay.textContent = s.letterSignature || coupleText;
    
    // Format letter paragraphs
    const paragraphs = (s.letterBody || '').split('\n').filter(p => p.trim());
    el.letterBody.innerHTML = paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');

    // Format start date label
    try {
      const d = new Date(s.startDate);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      el.displayStartDate.textContent = d.toLocaleDateString('tr-TR', options);
    } catch (e) {
      el.displayStartDate.textContent = s.startDate;
    }
  }

  // ==========================================
  // REAL-TIME ANNIVERSARY COUNTER
  // ==========================================
  function startCounter() {
    if (state.counterTimer) clearInterval(state.counterTimer);

    function update() {
      const startDate = new Date(state.settings.startDate);
      const now = new Date();
      let diffMs = now - startDate;

      if (diffMs < 0) {
        // If date is in the future
        diffMs = 0;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      el.timeDays.textContent = days.toLocaleString();
      el.timeHours.textContent = String(hours).padStart(2, '0');
      el.timeMinutes.textContent = String(minutes).padStart(2, '0');
      el.timeSeconds.textContent = String(seconds).padStart(2, '0');
    }

    update();
    state.counterTimer = setInterval(update, 1000);
  }

  // ==========================================
  // SPEED & FILTER CONTROLS
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

  function applyFilter(filterName) {
    document.body.className = document.body.className.replace(/\bfilter-\w+/g, '');
    document.body.classList.add(`filter-${filterName}`);
    el.filterDropdown.value = filterName;

    state.settings.filter = filterName;
    window.memoryDB.saveSettings(state.settings);
  }

  // ==========================================
  // FLOATING PARTICLES (HEARTS)
  // ==========================================
  function startAmbientParticles() {
    const heartIcons = ['fa-heart', 'fa-sparkle'];
    
    function spawnHeart() {
      if (document.hidden) return;
      const heart = document.createElement('i');
      heart.className = `fa-solid fa-heart floating-heart`;
      
      const left = Math.random() * 100;
      const size = 10 + Math.random() * 16;
      const duration = 6 + Math.random() * 6;
      const delay = Math.random() * 2;

      heart.style.left = `${left}vw`;
      heart.style.fontSize = `${size}px`;
      heart.style.animationDuration = `${duration}s`;
      heart.style.animationDelay = `${delay}s`;

      el.particlesContainer.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, (duration + delay) * 1000);
    }

    // Initial batch
    for (let i = 0; i < 7; i++) {
      spawnHeart();
    }
    // Periodic spawn
    setInterval(spawnHeart, 2200);
  }

  // ==========================================
  // LIGHTBOX VIEWER
  // ==========================================
  function openLightbox(photo) {
    el.lightboxImg.src = photo.url;
    el.lightboxDate.textContent = photo.caption || photo.date || 'Sonsuz Anımız';
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

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // ==========================================
  // PHOTO UPLOAD HANDLING (FILES & DRAG-AND-DROP)
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
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Aşk Hatıramız',
          date: new Date().toLocaleDateString('tr-TR')
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

    // Save to Database
    await window.memoryDB.addPhotos(state.uploadQueue);
    state.photos = await window.memoryDB.getAllPhotos();
    refreshCollage();

    // Reset queue and close modal
    state.uploadQueue = [];
    renderUploadQueue();
    closeModal(el.uploadModal);

    // Cute celebration effect
    createHeartConfetti();
  }

  function addUrlPhoto() {
    const url = el.imageUrlInput.value.trim();
    if (!url) return;

    const item = {
      id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      url: url,
      caption: 'Özel Anımız ✨',
      date: new Date().toLocaleDateString('tr-TR')
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
      img.alt = photo.caption || 'Hatıra';

      const actions = document.createElement('div');
      actions.className = 'gallery-item-actions';

      // View Button
      const viewBtn = document.createElement('button');
      viewBtn.className = 'gallery-btn-action';
      viewBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
      viewBtn.title = 'Büyüt';
      viewBtn.onclick = () => openLightbox(photo);

      // Delete Button
      const delBtn = document.createElement('button');
      delBtn.className = 'gallery-btn-action delete';
      delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      delBtn.title = 'Kolajdan Sil';
      delBtn.onclick = async () => {
        if (state.photos.length <= 1) {
          alert('Kolajda en az bir fotoğraf bulunmalıdır!');
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
  // CELEBRATION CONFETTI
  // ==========================================
  function createHeartConfetti() {
    for (let i = 0; i < 20; i++) {
      const heart = document.createElement('i');
      heart.className = 'fa-solid fa-heart floating-heart';
      heart.style.left = `${30 + Math.random() * 40}vw`;
      heart.style.fontSize = `${18 + Math.random() * 20}px`;
      heart.style.color = '#f43f5e';
      heart.style.animationDuration = '3.5s';
      heart.style.animationDelay = `${Math.random() * 0.4}s`;
      el.particlesContainer.appendChild(heart);

      setTimeout(() => heart.remove(), 4000);
    }
  }

  // Escape HTML helper
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // ==========================================
  // EVENT LISTENERS SETUP
  // ==========================================
  function setupEventListeners() {
    // Music Toggle
    el.btnToggleMusic.addEventListener('click', () => {
      const playing = window.romanticAudio.toggle();
      el.btnToggleMusic.classList.toggle('playing', playing);
      const text = el.btnToggleMusic.querySelector('.btn-text');
      if (text) text.textContent = playing ? 'Çalıyor...' : 'Melodi';
    });

    // Modals Openers
    el.btnUploadTrigger.addEventListener('click', () => openModal(el.uploadModal));
    el.btnQuickUpload.addEventListener('click', () => openModal(el.uploadModal));
    el.btnGalleryManager.addEventListener('click', openGalleryManager);
    el.btnGalleryAddMore.addEventListener('click', () => {
      closeModal(el.galleryModal);
      openModal(el.uploadModal);
    });

    el.btnResetDefaultPhotos.addEventListener('click', async () => {
      if (confirm('Fotoğrafları varsayılan romantik koleksiyona sıfırlamak istiyor musunuz?')) {
        state.photos = await window.memoryDB.resetPhotosToDefault();
        refreshCollage();
        renderGalleryCards();
      }
    });

    el.btnOpenLetter.addEventListener('click', () => openModal(el.letterModal));
    el.btnEditLetter.addEventListener('click', () => {
      closeModal(el.letterModal);
      openModal(el.settingsModal);
    });

    el.btnOpenSettings.addEventListener('click', () => openModal(el.settingsModal));

    // Focus / Zen Mode (Fullscreen Infinite Collage View)
    function toggleFocusMode() {
      state.isFocusMode = !state.isFocusMode;
      document.body.classList.toggle('focus-mode', state.isFocusMode);
    }

    el.btnToggleFocus.addEventListener('click', toggleFocusMode);
    el.btnExitFocus.addEventListener('click', toggleFocusMode);

    // ESC to exit Focus Mode or Lightbox
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.isFocusMode) toggleFocusMode();
        closeLightbox();
        closeModal(el.uploadModal);
        closeModal(el.galleryModal);
        closeModal(el.letterModal);
        closeModal(el.settingsModal);
      }
    });

    // Speed Chips
    el.speedChips.forEach(chip => {
      chip.addEventListener('click', () => {
        applySpeed(chip.dataset.speed);
      });
    });

    // Color Filters
    el.filterDropdown.addEventListener('change', (e) => {
      applyFilter(e.target.value);
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

    // Confirm Upload Queue
    el.btnConfirmUpload.addEventListener('click', confirmUploadQueue);

    // Save Settings
    el.btnSaveSettings.addEventListener('click', async (e) => {
      e.preventDefault();
      const updated = {
        ...state.settings,
        partnerName: el.inputPartnerName.value.trim() || 'Ben',
        girlfriendName: el.inputGirlfriendName.value.trim() || 'Sevgilim',
        startDate: el.inputAnniversaryDate.value || state.settings.startDate,
        romanticQuote: el.inputCustomQuote.value.trim() || state.settings.romanticQuote,
        letterBody: el.inputLetterText.value || state.settings.letterBody,
        letterSignature: el.inputLetterSignature.value.trim() || state.settings.letterSignature
      };

      await window.memoryDB.saveSettings(updated);
      state.settings = updated;
      applySettingsToUI();
      startCounter();
      closeModal(el.settingsModal);
      createHeartConfetti();
    });

    // Lightbox Controls
    el.lightboxCloseBtn.addEventListener('click', closeLightbox);
    el.lightboxModal.addEventListener('click', (e) => {
      if (e.target === el.lightboxModal) closeLightbox();
    });

    el.lightboxHeartBtn.addEventListener('click', () => {
      createHeartConfetti();
      el.lightboxHeartBtn.style.transform = 'scale(1.4)';
      setTimeout(() => el.lightboxHeartBtn.style.transform = 'scale(1)', 300);
    });
  }

  // Run initialization
  await initApp();
});
