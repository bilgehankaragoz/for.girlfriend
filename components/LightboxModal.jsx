'use client';

import React from 'react';
import { X } from 'lucide-react';

export default function LightboxModal({ photo, onClose }) {
  if (!photo) return null;

  return (
    <div className="lightbox-backdrop active" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Kapat">
        <X size={24} />
      </button>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.url}
          alt={photo.caption || 'Büyütülmüş Fotoğraf'}
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80';
          }}
        />
        {photo.caption && <div className="lightbox-caption">{photo.caption}</div>}
      </div>
    </div>
  );
}
