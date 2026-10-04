'use client';

import React from 'react';
import { Menu } from 'lucide-react';

export default function MainMenuButton({ onOpen }) {
  return (
    <button
      id="btn-main-menu"
      className="floating-menu-btn"
      onClick={onOpen}
      title="Menüyü Aç"
      aria-label="Menü"
    >
      <Menu size={18} />
      <span>Menü</span>
    </button>
  );
}
