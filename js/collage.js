/**
 * Vertical Marquee Photo Collage Engine
 * Renders multiple infinite vertical scrolling columns (bands)
 * Seamlessly loops photos with alternating directions and staggered romantic speeds
 */

class CollageRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.photos = [];
    this.currentColCount = 0;
    this.resizeDebounceTimer = null;
    this.onPhotoClickCallback = null;
    
    // Bind resize handler
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = setTimeout(() => {
        const newCols = this.calcColumnCount();
        if (newCols !== this.currentColCount) {
          this.render();
        }
      }, 250);
    });
  }

  setPhotos(photos) {
    this.photos = photos || [];
    this.render();
  }

  setOnPhotoClick(callback) {
    this.onPhotoClickCallback = callback;
  }

  calcColumnCount() {
    const width = window.innerWidth;
    if (width > 1500) return 6;
    if (width > 1150) return 5;
    if (width > 800) return 4;
    return 3;
  }

  render() {
    if (!this.container || this.photos.length === 0) return;

    this.container.innerHTML = '';
    this.currentColCount = this.calcColumnCount();

    // Staggered duration presets for columns (seconds)
    const baseDurations = [46, 54, 42, 50, 48, 56];

    for (let c = 0; c < this.currentColCount; c++) {
      const columnEl = document.createElement('div');
      columnEl.className = 'band-column';
      columnEl.setAttribute('data-col-index', c);

      const trackEl = document.createElement('div');
      const isUp = c % 2 === 1; // Alternate scroll directions
      trackEl.className = `band-track ${isUp ? 'scroll-up' : 'scroll-down'}`;

      // Set unique staggered duration
      const duration = baseDurations[c % baseDurations.length];
      trackEl.style.animationDuration = `calc(${duration}s / var(--scroll-speed-mult))`;

      // Select photos for this column with offset to avoid identical parallel columns
      const columnPhotos = this.getColumnPhotoList(c, this.currentColCount);

      // Create SET 1
      const set1Fragment = this.createCardSet(columnPhotos, c, 1);
      trackEl.appendChild(set1Fragment);

      // Create SET 2 (exact duplicate for seamless infinite loop)
      const set2Fragment = this.createCardSet(columnPhotos, c, 2);
      trackEl.appendChild(set2Fragment);

      columnEl.appendChild(trackEl);
      this.container.appendChild(columnEl);
    }
  }

  /**
   * Distribute photos across columns ensuring variety and repetition if photo count is small
   */
  getColumnPhotoList(colIndex, totalCols) {
    const totalPhotos = this.photos.length;
    // We want at least 6 photos per column track to fill viewport vertically
    const minItemsPerSet = 6;
    const items = [];

    // Starting offset for this column
    let idx = (colIndex * 3) % totalPhotos;

    while (items.length < minItemsPerSet) {
      items.push(this.photos[idx % totalPhotos]);
      idx = (idx + 1) % totalPhotos;
    }

    return items;
  }

  /**
   * Creates a DocumentFragment containing photo cards with romantic styling
   */
  createCardSet(photoList, colIndex, setNumber) {
    const fragment = document.createDocumentFragment();

    const rotationPresets = [-2.2, 1.8, -1.4, 2.5, -2.8, 1.2, -1.6, 2.0];

    photoList.forEach((photo, idx) => {
      const card = document.createElement('div');
      card.className = 'collage-card';
      
      // Pseudo-random rotation based on index and column
      const rot = rotationPresets[(idx + colIndex * 2) % rotationPresets.length];
      card.style.setProperty('--rot', `${rot}deg`);

      // 1 in 3 cards has a cute decorative tape sticker
      if ((idx + colIndex) % 3 === 0) {
        card.classList.add('has-tape');
      }

      const imgWrap = document.createElement('div');
      imgWrap.className = 'collage-img-wrap';

      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.caption || 'Aşk Hatırası';
      img.loading = 'lazy';
      img.decoding = 'async';

      // Fallback if image fails to load
      img.onerror = () => {
        img.src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80';
      };

      imgWrap.appendChild(img);
      card.appendChild(imgWrap);

      // Meta info (caption + heart)
      const meta = document.createElement('div');
      meta.className = 'collage-meta';

      const captionSpan = document.createElement('span');
      captionSpan.className = 'card-caption';
      captionSpan.textContent = photo.caption || 'Bizim Anımız';

      const heartIcon = document.createElement('i');
      heartIcon.className = 'fa-solid fa-heart card-heart-badge';

      meta.appendChild(captionSpan);
      meta.appendChild(heartIcon);
      card.appendChild(meta);

      // Click to open in Lightbox
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onPhotoClickCallback) {
          this.onPhotoClickCallback(photo);
        }
      });

      fragment.appendChild(card);
    });

    return fragment;
  }
}

// Global Collage Engine Instance
window.collageRenderer = new CollageRenderer('collage-canvas');
