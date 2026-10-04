/**
 * Database & Storage Module using IndexedDB with LocalStorage fallback
 * Stores uploaded photos (base64 / blob URLs) and configuration
 */

const DB_NAME = 'ForGirlfriendDB';
const DB_VERSION = 2; // Incremented version to refresh schema cleanly
const PHOTO_STORE = 'photos';
const SETTINGS_STORE = 'settings';

// Default curated aesthetic photos
const DEFAULT_PHOTOS = [
  {
    id: 'photo-1',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 1'
  },
  {
    id: 'photo-2',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 2'
  },
  {
    id: 'photo-3',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 3'
  },
  {
    id: 'photo-4',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 4'
  },
  {
    id: 'photo-5',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 5'
  },
  {
    id: 'photo-6',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 6'
  },
  {
    id: 'photo-7',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 7'
  },
  {
    id: 'photo-8',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 8'
  },
  {
    id: 'photo-9',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 9'
  },
  {
    id: 'photo-10',
    url: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 10'
  },
  {
    id: 'photo-11',
    url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 11'
  },
  {
    id: 'photo-12',
    url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=700&q=80',
    caption: 'Fotoğraf 12'
  }
];

class MemoryDB {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
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

      request.onerror = () => {
        resolve(false);
      };
    });
  }

  async getAllPhotos() {
    if (!this.db) {
      const stored = localStorage.getItem('gf_photos');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { }
      }
      return [...DEFAULT_PHOTOS];
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(PHOTO_STORE, 'readonly');
        const store = tx.objectStore(PHOTO_STORE);
        const req = store.getAll();

        req.onsuccess = () => {
          let list = req.result || [];
          if (list.length === 0) {
            this.seedDefaults(DEFAULT_PHOTOS).then(() => {
              resolve([...DEFAULT_PHOTOS]);
            });
          } else {
            resolve(list);
          }
        };

        req.onerror = () => {
          resolve([...DEFAULT_PHOTOS]);
        };
      } catch (err) {
        resolve([...DEFAULT_PHOTOS]);
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
      return [...DEFAULT_PHOTOS];
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      store.clear();
      tx.oncomplete = async () => {
        await this.seedDefaults(DEFAULT_PHOTOS);
        resolve([...DEFAULT_PHOTOS]);
      };
    });
  }

  async getSettings() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const nextEvent = new Date();
    nextEvent.setMonth(nextEvent.getMonth() + 2);
    nextEvent.setHours(0, 0, 0, 0);

    const defaultSettings = {
      speed: 'normal',
      startDate: oneYearAgo.toISOString().substring(0, 16),
      targetTitle: 'Yıldönümümüz',
      targetDate: nextEvent.toISOString().substring(0, 16),
      specialEventKey: 'anniversary'
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
