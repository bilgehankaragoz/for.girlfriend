'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Clock,
  Heart,
  Hourglass,
  CalendarCheck,
  ListFilter,
  UploadCloud,
  Images,
  RotateCcw,
  Gauge,
  Maximize2,
  ChevronRight
} from 'lucide-react';

export default function SideDrawer({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  photoCount,
  onOpenUpload,
  onOpenGallery,
  onResetPhotos,
  speed,
  onSpeedChange
}) {
  const [activeTab, setActiveTab] = useState('tab-elapsed');
  
  // Elapsed Counter State
  const [elapsed, setElapsed] = useState({ days: 0, hours: '00', minutes: '00', seconds: '00' });
  const [startDateInput, setStartDateInput] = useState(settings.startDate || '');
  const [startSavedMsg, setStartSavedMsg] = useState(false);

  // Countdown Counter State
  const [countdown, setCountdown] = useState({ days: 0, hours: '00', minutes: '00', seconds: '00' });
  const [countdownName, setCountdownName] = useState(settings.targetTitle || 'Yıldönümümüz');
  const [targetTitleInput, setTargetTitleInput] = useState(settings.targetTitle || '');
  const [targetDateInput, setTargetDateInput] = useState(settings.targetDate || '');
  const [specialEventKey, setSpecialEventKey] = useState(settings.specialEventKey || 'anniversary');
  const [targetSavedMsg, setTargetSavedMsg] = useState(false);

  useEffect(() => {
    if (settings.startDate) setStartDateInput(settings.startDate.substring(0, 16));
    if (settings.targetTitle) {
      setTargetTitleInput(settings.targetTitle);
      setCountdownName(settings.targetTitle);
    }
    if (settings.targetDate) setTargetDateInput(settings.targetDate.substring(0, 16));
    if (settings.specialEventKey) setSpecialEventKey(settings.specialEventKey);
  }, [settings]);

  // Live Elapsed Timer
  useEffect(() => {
    function tickElapsed() {
      if (!settings.startDate) return;
      const start = new Date(settings.startDate);
      const now = new Date();
      let diffMs = now - start;
      if (isNaN(diffMs) || diffMs < 0) diffMs = 0;

      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / (3600 * 24));
      const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setElapsed({
        days,
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      });
    }

    tickElapsed();
    const interval = setInterval(tickElapsed, 1000);
    return () => clearInterval(interval);
  }, [settings.startDate]);

  // Live Countdown Timer
  useEffect(() => {
    function tickCountdown() {
      if (!settings.targetDate) return;
      const target = new Date(settings.targetDate);
      const now = new Date();
      let diffMs = target - now;

      if (isNaN(diffMs)) return;

      if (diffMs <= 0) {
        setCountdown({ days: 0, hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / (3600 * 24));
      const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setCountdown({
        days,
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      });
    }

    tickCountdown();
    const interval = setInterval(tickCountdown, 1000);
    return () => clearInterval(interval);
  }, [settings.targetDate]);

  function handlePresetChange(val) {
    setSpecialEventKey(val);
    const now = new Date();
    const currentYear = now.getFullYear();
    let title = '';
    let target = new Date();

    switch (val) {
      case 'anniversary':
        title = 'Yıldönümümüz';
        const start = new Date(settings.startDate);
        target = new Date(currentYear, start.getMonth(), start.getDate(), 0, 0, 0);
        if (target < now) target.setFullYear(currentYear + 1);
        break;
      case 'birthday':
        title = 'Sevgilimin Doğum Günü';
        target = new Date(currentYear, (now.getMonth() + 1) % 12, 15, 0, 0, 0);
        if (target < now) target.setFullYear(currentYear + 1);
        break;
      case 'valentines':
        title = '14 Şubat Sevgililer Günü';
        target = new Date(currentYear, 1, 14, 0, 0, 0);
        if (target < now) target.setFullYear(currentYear + 1);
        break;
      case 'newyear':
        title = 'Yeni Yıl (1 Ocak)';
        target = new Date(currentYear + 1, 0, 1, 0, 0, 0);
        break;
      case 'custom':
      default:
        return;
    }

    setTargetTitleInput(title);
    setTargetDateInput(target.toISOString().substring(0, 16));
  }

  function handleSaveStartDate() {
    if (!startDateInput) return;
    onSaveSettings({ ...settings, startDate: startDateInput });
    setStartSavedMsg(true);
    setTimeout(() => setStartSavedMsg(false), 1500);
  }

  function handleSaveTargetDate() {
    if (!targetDateInput) return;
    const title = targetTitleInput.trim() || 'Özel Gün';
    setCountdownName(title);
    onSaveSettings({
      ...settings,
      targetTitle: title,
      targetDate: targetDateInput,
      specialEventKey
    });
    setTargetSavedMsg(true);
    setTimeout(() => setTargetSavedMsg(false), 1500);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  return (
    <>
      <div
        className={`drawer-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`side-drawer ${isOpen ? 'active' : ''}`} aria-hidden={!isOpen}>
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <Layers size={18} />
            <h3>for.girlfriend</h3>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {/* BÖLÜM 1: SAYAÇLAR */}
          <div className="drawer-group">
            <span className="group-title">
              <Clock size={14} /> Sayaçlar & Zaman
            </span>

            <div className="drawer-tabs">
              <button
                className={`drawer-tab-btn ${activeTab === 'tab-elapsed' ? 'active' : ''}`}
                onClick={() => setActiveTab('tab-elapsed')}
              >
                <Heart size={14} />
                <span>İlişki Sayacı</span>
              </button>
              <button
                className={`drawer-tab-btn ${activeTab === 'tab-countdown' ? 'active' : ''}`}
                onClick={() => setActiveTab('tab-countdown')}
              >
                <Hourglass size={14} />
                <span>Özel Günler</span>
              </button>
            </div>

            {/* TAB 1: GEÇEN ZAMAN */}
            {activeTab === 'tab-elapsed' && (
              <div className="drawer-tab-pane active">
                <div className="counter-card">
                  <span className="counter-badge">Birlikte Geçen Süre</span>
                  <div className="counter-display-grid">
                    <div className="count-box">
                      <span className="count-value">{elapsed.days.toLocaleString('tr-TR')}</span>
                      <span className="count-label">Gün</span>
                    </div>
                    <div className="count-box">
                      <span className="count-value">{elapsed.hours}</span>
                      <span className="count-label">Saat</span>
                    </div>
                    <div className="count-box">
                      <span className="count-value">{elapsed.minutes}</span>
                      <span className="count-label">Dakika</span>
                    </div>
                    <div className="count-box">
                      <span className="count-value">{elapsed.seconds}</span>
                      <span className="count-label">Saniye</span>
                    </div>
                  </div>
                </div>

                <div className="drawer-section">
                  <label className="section-label">
                    <CalendarCheck size={14} /> Başlangıç Tarihi:
                  </label>
                  <div className="date-input-wrap">
                    <input
                      type="datetime-local"
                      className="clean-input"
                      value={startDateInput}
                      onChange={(e) => setStartDateInput(e.target.value)}
                    />
                    <button className="btn-primary-sm" onClick={handleSaveStartDate}>
                      {startSavedMsg ? 'Kaydedildi!' : 'Kaydet'}
                    </button>
                  </div>
                  <small className="helper-text">
                    Sayacınız bu tarihten itibaren geçen zamanı anlık olarak hesaplar.
                  </small>
                </div>
              </div>
            )}

            {/* TAB 2: GERİ SAYIM */}
            {activeTab === 'tab-countdown' && (
              <div className="drawer-tab-pane active">
                <div className="counter-card">
                  <span className="counter-badge">Geri Sayım</span>
                  <h4 className="countdown-target-name">{countdownName}</h4>
                  <div className="counter-display-grid">
                    <div className="count-box">
                      <span className="count-value">{countdown.days.toLocaleString('tr-TR')}</span>
                      <span className="count-label">Gün</span>
                    </div>
                    <div className="count-box">
                      <span className="count-value">{countdown.hours}</span>
                      <span className="count-label">Saat</span>
                    </div>
                    <div className="count-box">
                      <span className="count-value">{countdown.minutes}</span>
                      <span className="count-label">Dakika</span>
                    </div>
                    <div className="count-box">
                      <span className="count-value">{countdown.seconds}</span>
                      <span className="count-label">Saniye</span>
                    </div>
                  </div>
                </div>

                <div className="drawer-section">
                  <label className="section-label">
                    <ListFilter size={14} /> Hazır Özel Günler:
                  </label>
                  <select
                    className="clean-select"
                    value={specialEventKey}
                    onChange={(e) => handlePresetChange(e.target.value)}
                  >
                    <option value="anniversary">Yıldönümümüz</option>
                    <option value="birthday">Sevgilimin Doğum Günü</option>
                    <option value="valentines">14 Şubat Sevgililer Günü</option>
                    <option value="newyear">Yılbaşı (1 Ocak)</option>
                    <option value="custom">Özel Bir Gün Belirle...</option>
                  </select>
                </div>

                <div className="drawer-section">
                  <label className="section-label">Özel Günün Adı:</label>
                  <input
                    type="text"
                    className="clean-input"
                    placeholder="Örn: Yıldönümümüz"
                    value={targetTitleInput}
                    onChange={(e) => setTargetTitleInput(e.target.value)}
                  />
                </div>

                <div className="drawer-section">
                  <label className="section-label">Hedef Tarih & Saat:</label>
                  <div className="date-input-wrap">
                    <input
                      type="datetime-local"
                      className="clean-input"
                      value={targetDateInput}
                      onChange={(e) => setTargetDateInput(e.target.value)}
                    />
                    <button className="btn-primary-sm" onClick={handleSaveTargetDate}>
                      {targetSavedMsg ? 'Uygulandı!' : 'Uygula'}
                    </button>
                  </div>
                  <small className="helper-text">
                    Seçilen gün için kalan süre saniye saniye geri sayılır.
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* BÖLÜM 2: FOTOĞRAFLAR */}
          <div className="drawer-group">
            <span className="group-title">
              <Images size={14} /> Fotoğraf İşlemleri
            </span>
            <div className="menu-action-stack">
              <button
                className="menu-action-row primary"
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
              >
                <div className="row-info">
                  <UploadCloud size={16} />
                  <span>Yeni Fotoğraf Yükle</span>
                </div>
                <ChevronRight size={14} className="row-arrow" />
              </button>

              <button
                className="menu-action-row"
                onClick={() => {
                  onClose();
                  onOpenGallery();
                }}
              >
                <div className="row-info">
                  <Images size={16} />
                  <span>Fotoğraflar & Galeri</span>
                </div>
                <span className="badge-count">{photoCount}</span>
              </button>

              <button
                className="menu-action-row danger"
                onClick={() => {
                  if (confirm('Fotoğrafları varsayılan koleksiyona sıfırlamak istiyor musunuz?')) {
                    onResetPhotos();
                  }
                }}
              >
                <div className="row-info">
                  <RotateCcw size={16} />
                  <span>Fotoğrafları Sıfırla</span>
                </div>
              </button>
            </div>
          </div>

          {/* BÖLÜM 3: KOLAJ AYARLARI */}
          <div className="drawer-group">
            <span className="group-title">
              <Gauge size={14} /> Kolaj Ayarları
            </span>
            <div className="drawer-setting-row">
              <label>
                <Gauge size={14} /> Akış Hızı:
              </label>
              <div className="speed-selector">
                <button
                  className={`speed-chip ${speed === 'slow' ? 'active' : ''}`}
                  onClick={() => onSpeedChange('slow')}
                >
                  Yavaş
                </button>
                <button
                  className={`speed-chip ${speed === 'normal' ? 'active' : ''}`}
                  onClick={() => onSpeedChange('normal')}
                >
                  Normal
                </button>
                <button
                  className={`speed-chip ${speed === 'fast' ? 'active' : ''}`}
                  onClick={() => onSpeedChange('fast')}
                >
                  Hızlı
                </button>
              </div>
            </div>

            <div className="drawer-setting-row">
              <label>
                <Maximize2 size={14} /> Tam Ekran:
              </label>
              <button className="btn-secondary-sm" onClick={toggleFullscreen}>
                Aç / Kapat
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
