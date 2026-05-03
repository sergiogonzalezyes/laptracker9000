import { useEffect, useState } from 'react';
import { api } from '../api/client';
const LS_KEY = 'laptracker_driver';
function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
}
function lighten(hex, amt) {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r + amt, g + amt, b + amt);
}
function darken(hex, pct) {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(Math.round(r * pct), Math.round(g * pct), Math.round(b * pct));
}
function applyTheme(color) {
    const root = document.documentElement;
    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-hot', lighten(color, 40));
    root.style.setProperty('--accent-dim', darken(color, 0.15));
}
function resetTheme() {
    const root = document.documentElement;
    root.style.setProperty('--accent', '#cc0000');
    root.style.setProperty('--accent-hot', '#ff2020');
    root.style.setProperty('--accent-dim', '#2a0000');
}
export function useDriverTheme() {
    const [drivers, setDrivers] = useState([]);
    const [selected, setSelected] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null');
        }
        catch {
            return null;
        }
    });
    useEffect(() => {
        if (selected?.color)
            applyTheme(selected.color);
    }, []);
    useEffect(() => {
        api.allDrivers().then(setDrivers);
    }, []);
    const selectDriver = (d) => {
        if (d) {
            const stored = { name: d.name, color: d.color, claimed: !!d.claimed };
            localStorage.setItem(LS_KEY, JSON.stringify(stored));
            setSelected(stored);
            applyTheme(d.color);
        }
        else {
            localStorage.removeItem(LS_KEY);
            setSelected(null);
            resetTheme();
        }
    };
    const refreshColor = (name, color) => {
        if (selected?.name === name) {
            const updated = { ...selected, color };
            localStorage.setItem(LS_KEY, JSON.stringify(updated));
            setSelected(updated);
            applyTheme(color);
        }
    };
    const markClaimed = (name, color) => {
        const updated = { name, color, claimed: true };
        localStorage.setItem(LS_KEY, JSON.stringify(updated));
        setSelected(updated);
        applyTheme(color);
    };
    return { drivers, selected, selectDriver, refreshColor, markClaimed };
}
