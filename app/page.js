'use client';

import React, { useState, useEffect } from 'react';
import CollageCanvas from '../components/CollageCanvas';
import MainMenuButton from '../components/MainMenuButton';
import SideDrawer from '../components/SideDrawer';
import UploadModal from '../components/UploadModal';
import GalleryModal from '../components/GalleryModal';
import LightboxModal from '../components/LightboxModal';
import {
  getStoredPhotos,
  saveStoredPhotos,
  resetStoredPhotos,
  getStoredSettings,
  saveStoredSettings
} from '../lib/storage';

export default function HomePage() {
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState({
    speed: 'normal',
    startDate: '2024-01-01T00:00',
    targetTitle: 'Yıldönümümüz',
    targetDate: '2026-10-04T00:00',
    specialEventKey: 'anniversary'
  });
  const [speed, setSpeed] = useState('normal');

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  useEffect(() => {
    const loadedPhotos = getStoredPhotos();
    const loadedSettings = getStoredSettings();

    setPhotos(loadedPhotos);
    setSettings(loadedSettings);
    if (loadedSettings.speed) {
      setSpeed(loadedSettings.speed);
      applySpeedToDom(loadedSettings.speed);
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsUploadOpen(false);
        setIsGalleryOpen(false);
        setActiveLightboxPhoto(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function applySpeedToDom(s) {
    const multipliers = { slow: 0.55, normal: 1, fast: 1.85 };
    const mult = multipliers[s] || 1;
    document.documentElement.style.setProperty('--scroll-speed-mult', mult);
  }

  function handleSpeedChange(newSpeed) {
    setSpeed(newSpeed);
    applySpeedToDom(newSpeed);
    const updated = { ...settings, speed: newSpeed };
    setSettings(updated);
    saveStoredSettings(updated);
  }

  function handleSaveSettings(updated) {
    setSettings(updated);
    saveStoredSettings(updated);
  }

  function handleAddPhotos(newPhotos) {
    const updated = [...newPhotos, ...photos];
    setPhotos(updated);
    saveStoredPhotos(updated);
  }

  function handleDeletePhoto(id) {
    if (photos.length <= 1) {
      alert('Kolajda en az bir fotoğraf bulunmalıdır.');
      return;
    }
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    saveStoredPhotos(updated);
  }

  function handleResetPhotos() {
    const defaults = resetStoredPhotos();
    setPhotos(defaults);
  }

  return (
    <main>
      {/* Background Vertical Collage Stream */}
      <CollageCanvas
        photos={photos}
        onPhotoClick={(p) => setActiveLightboxPhoto(p)}
        speed={speed}
      />

      {/* Top-Left Floating Menu Button */}
      <MainMenuButton onOpen={() => setIsDrawerOpen(true)} />

      {/* Unified Side Drawer (Sayaçlar, Özel Günler, Fotoğraf İşlemleri, Ayarlar) */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        photoCount={photos.length}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onResetPhotos={handleResetPhotos}
        speed={speed}
        onSpeedChange={handleSpeedChange}
      />

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddPhotos={handleAddPhotos}
      />

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        photos={photos}
        onDeletePhoto={handleDeletePhoto}
        onOpenUpload={() => setIsUploadOpen(true)}
        onViewPhoto={(p) => setActiveLightboxPhoto(p)}
      />

      <LightboxModal
        photo={activeLightboxPhoto}
        onClose={() => setActiveLightboxPhoto(null)}
      />
    </main>
  );
}
