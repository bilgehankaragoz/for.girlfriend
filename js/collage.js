/**
 * Vertical Marquee Photo Collage Engine
 * High-performance, zero-flicker infinite vertical scrolling columns
 */

class CollageRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.photos = [];
    this.currentColCount = 0;
    this.resizeDebounceTimer = null;
    this.onPhotoClickCallback = null;
    
    // Bind resize handler (only re-renders if column count changes)
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = setTimeout(() => {
        const newCols = this.calcColumnCount();
        if (newCols !== this.currentColCount) {
          this.render();
        }
      }, 300);
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

    this.currentColCount = this.calcColumnCount();
    const fragment = document.createDocumentFragment();

    // Staggered durations for columns (seconds)
    const baseDurations = [44, 52, 40, 48, 46, 54];

    for (let c = 0; c < this.currentColCount; c++) {
      const columnEl = document.createElement('div');
      columnEl.className = 'band-column';

      const trackEl = document.createElement('div');
      const isUp = c % 2 === 1; // Alternate scroll directions
      trackEl.className = `band-track ${isUp ? 'scroll-up' : 'scroll-down'}`;

      const duration = baseDurations[c % baseDurations.length];
      trackEl.style.animationDuration = `calc(${duration}s / var(--scroll-speed-mult))`;

      const columnPhotos = this.getColumnPhotoList(c);

      // Create SET 1
      trackEl.appendChild(this.createCardSet(columnPhotos));
      // Create SET 2 (duplicate for seamless infinite loop)
      trackEl.appendChild(this.createCardSet(columnPhotos));

      columnEl.appendChild(trackEl);
      fragment.appendChild(columnEl);
    }

    this.container.innerHTML = '';
    this.container.appendChild(fragment);
  }

  getColumnPhotoList(colIndex) {
    const totalPhotos = this.photos.length;
    const minItemsPerSet = 6;
    const items = [];

    let idx = (colIndex * 3) % totalPhotos;
    while (items.length < minItemsPerSet) {
      items.push(this.photos[idx % totalPhotos]);
      idx = (idx + 1) % totalPhotos;
    }

    return items;
  }

  createCardSet(photoList) {
    const fragment = document.createDocumentFragment();

    photoList.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'collage-card';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'collage-img-wrap';

      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.caption || 'Fotoğraf';
      img.loading = 'lazy';
      img.decoding = 'async';

      img.onerror = () => {
        img.src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80';
      };

      imgWrap.appendChild(img);
      card.appendChild(imgWrap);

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
