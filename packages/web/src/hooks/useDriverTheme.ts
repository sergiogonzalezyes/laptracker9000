import { useEffect, useState, useCallback } from 'react';

const LS_KEY = 'laptracker_driver';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
}

function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + amt, g + amt, b + amt);
}

function darken(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(Math.round(r * pct), Math.round(g * pct), Math.round(b * pct));
}

export function applyTheme(color: string) {
  const root = document.documentElement;
  root.style.setProperty('--accent',     color);
  root.style.setProperty('--accent-hot', lighten(color, 40));
  root.style.setProperty('--accent-dim', darken(color, 0.15));
}

export function resetTheme() {
  const root = document.documentElement;
  root.style.setProperty('--accent',     '#cc0000');
  root.style.setProperty('--accent-hot', '#ff2020');
  root.style.setProperty('--accent-dim', '#2a0000');
}

export interface StoredDriver {
  name: string;
  color: string;
  claimed: boolean;
}

function readStored(): StoredDriver | null {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null'); } catch { return null; }
}

function writeStored(d: StoredDriver) {
  localStorage.setItem(LS_KEY, JSON.stringify(d));
}

export function useDriverTheme() {
  const [me, setMe] = useState<StoredDriver | null>(readStored);

  // Apply theme on mount
  useEffect(() => {
    if (me?.color) applyTheme(me.color);
  }, []);

  const login = useCallback((name: string, color: string) => {
    const stored: StoredDriver = { name, color, claimed: true };
    writeStored(stored);
    setMe(stored);
    applyTheme(color);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setMe(null);
    resetTheme();
  }, []);

  const refreshColor = useCallback((name: string, color: string) => {
    setMe(prev => {
      if (prev?.name !== name) return prev;
      const updated = { ...prev, color };
      writeStored(updated);
      applyTheme(color);
      return updated;
    });
  }, []);

  return { me, login, logout, refreshColor };
}
