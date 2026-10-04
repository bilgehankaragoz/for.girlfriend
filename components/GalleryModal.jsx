'use client';

import React from 'react';
import { X, Images, Plus, Trash2, Eye } from 'lucide-react';

export default function GalleryModal({
  isOpen,
  onClose,
  photos,
  onDeletePhoto,
  onOpenUpload,
  onViewPhoto
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Images size={20} />
            <h3>Kolajdaki Fotoğraflar ({photos.length})</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="gallery-toolbar">
            <span>Fotoğrafları inceleyebilir veya silebilirsiniz:</span>
            <div className="gallery-actions">
              <button
                className="btn-secondary-sm"
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
              >
                <Plus size={14} style={{ display: 'inline', marginRight: 4 }} /> Fotoğraf Ekle
              </button>
            </div>
          </div>

          <div className="gallery-cards-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="gallery-item">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Fotoğraf'}
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80';
                  }}
                />
                <div className="gallery-item-actions">
                  <button
                    className="gallery-btn-action"
                    onClick={() => onViewPhoto(photo)}
                    title="Büyüt"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="gallery-btn-action delete"
                    onClick={() => {
                      if (photos.length <= 1) {
                        alert('Kolajda en az bir fotoğraf bulunmalıdır.');
                        return;
                      }
                      onDeletePhoto(photo.id);
                    }}
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
