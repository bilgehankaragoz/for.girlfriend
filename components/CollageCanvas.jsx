'use client';

import React, { useState, useEffect, useMemo } from 'react';

export default function CollageCanvas({ photos, onPhotoClick, speed = 'normal' }) {
  const [colCount, setColCount] = useState(4);

  useEffect(() => {
    function updateCols() {
      const w = window.innerWidth;
      if (w > 1500) setColCount(6);
      else if (w > 1150) setColCount(5);
      else if (w > 800) setColCount(4);
      else setColCount(3);
    }
    updateCols();

    let timer;
    function handleResize() {
      clearTimeout(timer);
      timer = setTimeout(updateCols, 250);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const baseDurations = [44, 52, 40, 48, 46, 54];

  // Distribute photos into columns
  const columnsData = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    const cols = [];
    const minItems = 6;

    for (let c = 0; c < colCount; c++) {
      let idx = (c * 3) % photos.length;
      const items = [];
      while (items.length < minItems) {
        items.push(photos[idx % photos.length]);
        idx = (idx + 1) % photos.length;
      }
      cols.push(items);
    }
    return cols;
  }, [photos, colCount]);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="collage-canvas" aria-hidden="true">
      {columnsData.map((colPhotos, c) => {
        const isUp = c % 2 === 1;
        const duration = baseDurations[c % baseDurations.length];

        return (
          <div key={c} className="band-column">
            <div
              className={`band-track ${isUp ? 'scroll-up' : 'scroll-down'}`}
              style={{
                animationDuration: `calc(${duration}s / var(--scroll-speed-mult, 1))`
              }}
            >
              {/* Set 1 */}
              {colPhotos.map((photo, i) => (
                <div
                  key={`s1-${photo.id}-${i}`}
                  className="collage-card"
                  onClick={() => onPhotoClick(photo)}
                >
                  <div className="collage-img-wrap">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Fotoğraf'}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80';
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Set 2 (Duplicate for seamless loop) */}
              {colPhotos.map((photo, i) => (
                <div
                  key={`s2-${photo.id}-${i}`}
                  className="collage-card"
                  onClick={() => onPhotoClick(photo)}
                >
                  <div className="collage-img-wrap">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Fotoğraf'}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
