import { DEFAULT_PHOTOS } from './defaultPhotos';

const STORAGE_KEY_PHOTOS = 'gf_photos';
const STORAGE_KEY_SETTINGS = 'gf_settings';

export function getStoredPhotos() {
  if (typeof window === 'undefined') return DEFAULT_PHOTOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PHOTOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Storage getPhotos error:', e);
  }
  return DEFAULT_PHOTOS;
}

export function saveStoredPhotos(photos) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
  } catch (e) {
    console.error('Storage savePhotos error:', e);
  }
}

export function resetStoredPhotos() {
  if (typeof window === 'undefined') return DEFAULT_PHOTOS;
  try {
    localStorage.removeItem(STORAGE_KEY_PHOTOS);
  } catch (e) {
    console.error('Storage resetPhotos error:', e);
  }
  return DEFAULT_PHOTOS;
}

export function getStoredSettings() {
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

  if (typeof window === 'undefined') return defaultSettings;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Storage getSettings error:', e);
  }
  return defaultSettings;
}

export function saveStoredSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Storage saveSettings error:', e);
  }
}
