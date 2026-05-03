import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
import { useDriverTheme } from '../../hooks/useDriverTheme';

export default function NavBar() {
  const { isConnected, acStatus } = useLiveStore();
  const { drivers, selected, selectDriver } = useDriverTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigate = useNavigate();
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const accentColor = selected?.color ?? '#cc0000';

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 54,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Accent stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accentColor,
        transition: 'background 0.4s',
      }} />

      {/* Logo */}
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, marginRight: 24, letterSpacing: '0.06em', userSelect: 'none' }}>
        <span className="chrome">LAP</span>
        <span style={{ color: 'var(--accent)', transition: 'color 0.4s' }}>TRACKER</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }}>9000</span>
      </span>

      <nav style={{ display: 'flex', gap: 2 }}>
        {[
          { to: '/live', label: 'Live', end: false },
          { to: '/history', label: 'History', end: false },
          { to: '/leaderboard', label: 'Leaderboard', end: false },
          { to: '/drivers', label: 'Drivers', end: false },
        ].map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            padding: '6px 14px',
            fontSize: 13, fontWeight: 600,
            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: isActive ? `2px solid var(--accent)` : '2px solid transparent',
            transition: 'color 0.15s',
            textDecoration: 'none',
            display: 'block',
          })}>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {acStatus && acStatus.clients > 0 && (
          <span className="tag">
            <span className="dot dot-red" />
            {acStatus.clients} ON TRACK
          </span>
        )}

        {/* Driver picker */}
        <div ref={pickerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* Avatar — navigates to profile */}
          {selected && (
            <button
              onClick={() => navigate(`/drivers/${encodeURIComponent(selected.name)}`)}
              title="Go to your profile"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32,
                background: `radial-gradient(circle at 35% 35%, ${selected.color}cc, ${selected.color}55)`,
                border: `1px solid ${selected.color}`,
                borderRight: 'none',
                borderRadius: 0, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11, color: '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 10px ${selected.color}88`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              {selected.name.slice(0, 2).toUpperCase()}
            </button>
          )}

          {/* Name + dropdown toggle */}
          <button
            onClick={() => setPickerOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px',
              background: 'var(--bg-elevated)',
              border: `1px solid ${selected ? accentColor + '66' : 'var(--border-bright)'}`,
              borderRadius: 3,
              cursor: 'pointer',
              height: 32,
            }}
          >
            {selected ? (
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                {selected.name.toUpperCase()}
              </span>
            ) : (
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                WHO ARE YOU?
              </span>
            )}
            <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>▼</span>
          </button>

          {/* Dropdown */}
          {pickerOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4,
              background: '#0f0f0f',
              border: '1px solid #2a2a2a',
              borderTop: `2px solid var(--accent)`,
              minWidth: 180, zIndex: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            }}>
              {drivers.map(d => (
                <button
                  key={d.name}
                  onClick={() => { selectDriver(d); setPickerOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 14px',
                    background: selected?.name === d.name ? `${d.color}18` : 'transparent',
                    borderBottom: '1px solid #1a1a1a',
                    borderLeft: selected?.name === d.name ? `2px solid ${d.color}` : '2px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${d.color}18`)}
                  onMouseLeave={e => (e.currentTarget.style.background = selected?.name === d.name ? `${d.color}18` : 'transparent')}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 2, flexShrink: 0,
                    background: `radial-gradient(circle at 35% 35%, ${d.color}cc, ${d.color}55)`,
                    border: `1px solid ${d.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11, color: '#fff',
                    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                  }}>
                    {d.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
                      {d.name}
                    </div>
                    {d.tagline && (
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{d.tagline}</div>
                    )}
                  </div>
                  {selected?.name === d.name && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: d.color }}>✓</span>
                  )}
                </button>
              ))}
              {selected && (
                <div style={{ borderTop: '1px solid #1a1a1a' }}>
                  <button
                    onClick={() => { navigate(`/drivers/${encodeURIComponent(selected.name)}`); setPickerOpen(false); }}
                    style={{
                      width: '100%', padding: '9px 14px', textAlign: 'left',
                      fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.08em',
                      color: 'var(--accent-hot)', cursor: 'pointer', background: 'transparent',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 12 }}>✎</span> EDIT MY PROFILE
                  </button>
                  <button
                    onClick={() => { selectDriver(null); setPickerOpen(false); }}
                    style={{
                      width: '100%', padding: '8px 14px', textAlign: 'center',
                      fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.1em',
                      color: '#333', cursor: 'pointer', background: 'transparent',
                      borderTop: '1px solid #111',
                    }}
                  >
                    RESET THEME
                  </button>
                </div>
              )}
              {drivers.length === 0 && (
                <div style={{ padding: '12px 14px', fontSize: 10, color: '#333', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
                  NO DRIVERS YET
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live indicator */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          <span className={`dot ${isConnected ? 'dot-green' : 'dot-grey'}`} />
          {isConnected ? 'LIVE' : 'CONNECTING'}
        </span>
      </div>
    </header>
  );
}
