import { useEffect, useState } from 'react';
import { api, DriverSummary } from '../api/client';

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

function applyTheme(color: string) {
  const root = document.documentElement;
  root.style.setProperty('--accent',     color);
  root.style.setProperty('--accent-hot', lighten(color, 40));
  root.style.setProperty('--accent-dim', darken(color, 0.15));
}

function resetTheme() {
  const root = document.documentElement;
  root.style.setProperty('--accent',     '#cc0000');
  root.style.setProperty('--accent-hot', '#ff2020');
  root.style.setProperty('--accent-dim', '#2a0000');
}

export interface StoredDriver { name: string; color: string; }

export function useDriverTheme() {
  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
  const [selected, setSelected] = useState<StoredDriver | null>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null'); } catch { return null; }
  });

  // Apply theme on mount from localStorage immediately
  useEffect(() => {
    if (selected?.color) applyTheme(selected.color);
  }, []);

  // Load driver list
  useEffect(() => {
    api.allDrivers().then(setDrivers);
  }, []);

  const selectDriver = (d: DriverSummary | null) => {
    if (d) {
      const stored: StoredDriver = { name: d.name, color: d.color };
      localStorage.setItem(LS_KEY, JSON.stringify(stored));
      setSelected(stored);
      applyTheme(d.color);
    } else {
      localStorage.removeItem(LS_KEY);
      setSelected(null);
      resetTheme();
    }
  };

  // If a driver updates their profile color, refresh
  const refreshColor = (name: string, color: string) => {
    if (selected?.name === name) {
      const updated = { name, color };
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      setSelected(updated);
      applyTheme(color);
    }
  };

  return { drivers, selected, selectDriver, refreshColor };
}
