/**
 * Database & Storage Module using IndexedDB with LocalStorage fallback
 * Stores uploaded photos (base64 / blob URLs) and romantic configuration
 */

const DB_NAME = 'ForGirlfriendDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';
const SETTINGS_STORE = 'settings';

// Default curated romantic photos to make the website breathtaking out-of-the-box
const DEFAULT_ROMANTIC_PHOTOS = [
  {
    id: 'default-1',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=700&q=80',
    caption: 'İlk bakış, ilk heyecan ✨',
    date: 'Unutulmaz An',
    isDefault: true
  },
  {
    id: 'default-2',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80',
    caption: 'Kahve kokulu sohbetlerimiz ☕',
    date: 'Birlikte Güzel',
    isDefault: true
  },
  {
    id: 'default-3',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80',
    caption: 'Seninle gün batımı 🌅',
    date: 'Huzur',
    isDefault: true
  },
  {
    id: 'default-4',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80',
    caption: 'Gözlerinin içi güldüğünde...',
    date: 'En Güzel Gülüş',
    isDefault: true
  },
  {
    id: 'default-5',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    caption: 'Birlikte kaybolduğumuz sokaklar 🍂',
    date: 'Tatlı Hatıralar',
    isDefault: true
  },
  {
    id: 'default-6',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80',
    caption: 'En sevdiğim melodi senin sesin 🎶',
    date: 'Aşkla Dolu',
    isDefault: true
  },
  {
    id: 'default-7',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80',
    caption: 'Ellerimiz hiç ayrılmasın 🕊️',
    date: 'Sonsuza Dek',
    isDefault: true
  },
  {
    id: 'default-8',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80',
    caption: 'Dünyanın en tatlı anı 💫',
    date: 'Canım Sevgilim',
    isDefault: true
  },
  {
    id: 'default-9',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=700&q=80',
    caption: 'Yıldızların altında baş başa 🌌',
    date: 'Büyülü Gece',
    isDefault: true
  },
  {
    id: 'default-10',
    url: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=700&q=80',
    caption: 'Papatyalar ve sen 🌼',
    date: 'Bahar Masalı',
    isDefault: true
  },
  {
    id: 'default-11',
    url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=700&q=80',
    caption: 'Yağmurlu günlerde sarılmak 🌧️',
    date: 'Sıcak Bir Yuva',
    isDefault: true
  },
  {
    id: 'default-12',
    url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=700&q=80',
    caption: 'Her anımız bir şiir gibi 📖',
    date: 'Bizim Masalımız',
    isDefault: true
  }
];

class MemoryDB {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to LocalStorage');
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(true);
      };

      request.onerror = (e) => {
        console.error('IndexedDB open error:', e);
        resolve(false);
      };
    });
  }

  // ================= PHOTOS OPERATIONS =================
  async getAllPhotos() {
    if (!this.db) {
      const stored = localStorage.getItem('gf_photos');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { }
      }
      return [...DEFAULT_ROMANTIC_PHOTOS];
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(PHOTO_STORE, 'readonly');
        const store = tx.objectStore(PHOTO_STORE);
        const req = store.getAll();

        req.onsuccess = () => {
          let list = req.result || [];
          if (list.length === 0) {
            // Seed with default photos
            this.seedDefaults(DEFAULT_ROMANTIC_PHOTOS).then(() => {
              resolve([...DEFAULT_ROMANTIC_PHOTOS]);
            });
          } else {
            resolve(list);
          }
        };

        req.onerror = () => {
          resolve([...DEFAULT_ROMANTIC_PHOTOS]);
        };
      } catch (err) {
        resolve([...DEFAULT_ROMANTIC_PHOTOS]);
      }
    });
  }

  async seedDefaults(defaults) {
    if (!this.db) {
      localStorage.setItem('gf_photos', JSON.stringify(defaults));
      return;
    }
    const tx = this.db.transaction(PHOTO_STORE, 'readwrite');
    const store = tx.objectStore(PHOTO_STORE);
    defaults.forEach(p => store.put(p));
    return new Promise((res) => { tx.oncomplete = () => res(); });
  }

  async addPhotos(newPhotos) {
    if (!this.db) {
      const all = await this.getAllPhotos();
      const updated = [...newPhotos, ...all];
      localStorage.setItem('gf_photos', JSON.stringify(updated));
      return updated;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      newPhotos.forEach(photo => store.put(photo));

      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }

  async deletePhoto(photoId) {
    if (!this.db) {
      const all = await this.getAllPhotos();
      const filtered = all.filter(p => p.id !== photoId);
      localStorage.setItem('gf_photos', JSON.stringify(filtered));
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      store.delete(photoId);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }

  async resetPhotosToDefault() {
    if (!this.db) {
      localStorage.removeItem('gf_photos');
      return [...DEFAULT_ROMANTIC_PHOTOS];
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      store.clear();
      tx.oncomplete = async () => {
        await this.seedDefaults(DEFAULT_ROMANTIC_PHOTOS);
        resolve([...DEFAULT_ROMANTIC_PHOTOS]);
      };
    });
  }

  // ================= SETTINGS OPERATIONS =================
  async getSettings() {
    const defaultSettings = {
      partnerName: 'Bilgehan',
      girlfriendName: 'Sevgilim',
      startDate: '2024-01-01T00:00:00',
      romanticQuote: 'Seninle geçen her saniye, ömrüme değer bir hatıra...',
      letterTitle: 'Canım Sevgilime...',
      letterBody: 'Hayatıma girdiğin andan itibaren her günüm bir masalın en tatlı sayfasına dönüştü.\n\nArka planda dikey bir şerit gibi akan her bir fotoğraf, seninle geçirdiğim en kıymetli anların birer yankısı. İyi ki varsın, iyi ki yanımdasın.',
      letterSignature: 'Seni Çok Seven Biri ❤️',
      filter: 'romantic',
      speed: 'normal'
    };

    if (!this.db) {
      const local = localStorage.getItem('gf_settings');
      if (local) {
        try { return { ...defaultSettings, ...JSON.parse(local) }; } catch (e) { }
      }
      return defaultSettings;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(SETTINGS_STORE, 'readonly');
        const store = tx.objectStore(SETTINGS_STORE);
        const req = store.get('app_settings');
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve({ ...defaultSettings, ...req.result.data });
          } else {
            resolve(defaultSettings);
          }
        };
        req.onerror = () => resolve(defaultSettings);
      } catch (e) {
        resolve(defaultSettings);
      }
    });
  }

  async saveSettings(settings) {
    if (!this.db) {
      localStorage.setItem('gf_settings', JSON.stringify(settings));
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(SETTINGS_STORE, 'readwrite');
      const store = tx.objectStore(SETTINGS_STORE);
      store.put({ key: 'app_settings', data: settings });
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }
}

// Global DB instance
window.memoryDB = new MemoryDB();
