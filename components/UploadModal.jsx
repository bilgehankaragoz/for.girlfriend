'use client';

import React, { useState, useRef } from 'react';
import { X, UploadCloud, Images, Link as LinkIcon, Check } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onAddPhotos }) {
  const [queue, setQueue] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  function handleFiles(files) {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) return;

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const item = {
          id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
          url: e.target.result,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Fotoğraf'
        };
        setQueue((prev) => [...prev, item]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const item = {
      id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      url: trimmed,
      caption: 'Eklenen Fotoğraf'
    };
    setQueue((prev) => [...prev, item]);
    setUrlInput('');
  }

  function handleRemoveFromQueue(idx) {
    setQueue((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleConfirm() {
    if (queue.length === 0) return;
    onAddPhotos(queue);
    setQueue([]);
    onClose();
  }

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <UploadCloud size={20} />
            <h3>Fotoğraf Ekle</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Fotoğraflarınızı sürükleyip bırakın veya cihazınızdan seçin. Fotoğraflar doğrudan dikey
            bant kolajına eklenecektir.
          </p>

          <div
            className={`drop-zone ${isDragOver ? 'dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="file-input-hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
            />
            <div className="drop-zone-icon">
              <Images size={36} />
            </div>
            <div className="drop-zone-text">
              <strong>Fotoğrafları buraya sürükleyin</strong>
              <span>
                veya dosya seçmek için <em>tıklayın</em>
              </span>
            </div>
            <span className="file-hints">JPG, PNG, WEBP, GIF desteklenir • Çoklu seçim</span>
          </div>

          <div className="url-upload-row">
            <div className="input-with-icon">
              <LinkIcon size={16} className="input-with-icon-svg" />
              <input
                type="url"
                placeholder="Veya doğrudan fotoğraf URL'si yapıştırın..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
              />
            </div>
            <button className="btn-secondary-sm" onClick={handleAddUrl}>
              Ekle
            </button>
          </div>

          {queue.length > 0 && (
            <div className="upload-queue-container">
              <h4>Yüklenecek Fotoğraflar ({queue.length})</h4>
              <div className="upload-queue-grid">
                {queue.map((item, idx) => (
                  <div key={item.id} className="queue-item">
                    <img src={item.url} alt="Önizleme" />
                    <button
                      className="queue-item-remove"
                      onClick={() => handleRemoveFromQueue(idx)}
                      title="Kaldır"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            İptal
          </button>
          <button
            className="btn-primary"
            disabled={queue.length === 0}
            onClick={handleConfirm}
          >
            <Check size={16} />
            <span>Kolaja Ekle</span>
          </button>
        </div>
      </div>
    </div>
  );
}
