/**
 * Main Application Controller for for.girlfriend
 * Clean, fast, zero-flicker photo upload, gallery manager, and speed controls
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Database
  await window.memoryDB.init();

  // App State
  let state = {
    photos: [],
    settings: {},
    uploadQueue: []
  };

  // DOM Elements
  const el = {
    photoCountBadge: document.getElementById('photo-count-badge'),
    btnUploadTrigger: document.getElementById('btn-upload-trigger'),
    btnGalleryManager: document.getElementById('btn-gallery-manager'),
    btnToggleFullscreen: document.getElementById('btn-toggle-fullscreen'),
    speedChips: document.querySelectorAll('.speed-chip'),

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

    // Escape closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
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
