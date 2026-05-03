import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
import { useDriverTheme } from '../../hooks/useDriverTheme';
import { useIsMobile } from '../../hooks/useBreakpoint';

const NAV_LINKS = [
  { to: '/live',        label: 'Live' },
  { to: '/history',     label: 'History' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/drivers',     label: 'Drivers' },
];

export default function NavBar() {
  const { isConnected, acStatus } = useLiveStore();
  const { drivers, selected, selectDriver } = useDriverTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigate = useNavigate();
  const pickerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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

  // ── Picker dropdown (shared between mobile + desktop) ───────────────────
  const PickerDropdown = pickerOpen ? (
    <div style={{
      position: 'absolute', right: 0, top: '100%', marginTop: 4,
      background: '#0f0f0f', border: '1px solid #2a2a2a',
      borderTop: `2px solid var(--accent)`,
      minWidth: 190, zIndex: 300,
      boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
    }}>
      {drivers.map(d => (
        <button key={d.name}
          onClick={() => { selectDriver(d); setPickerOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '11px 14px',
            background: selected?.name === d.name ? `${d.color}18` : 'transparent',
            borderBottom: '1px solid #1a1a1a',
            borderLeft: selected?.name === d.name ? `2px solid ${d.color}` : '2px solid transparent',
            cursor: 'pointer', textAlign: 'left',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = `${d.color}18`)}
          onMouseLeave={e => (e.currentTarget.style.background = selected?.name === d.name ? `${d.color}18` : 'transparent')}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 3, flexShrink: 0,
            background: `radial-gradient(circle at 35% 35%, ${d.color}cc, ${d.color}55)`,
            border: `1px solid ${d.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11, color: '#fff',
          }}>
            {d.name.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.name}
            </div>
            {d.tagline && (
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{d.tagline}</div>
            )}
          </div>
          {selected?.name === d.name && <span style={{ fontSize: 12, color: d.color }}>✓</span>}
        </button>
      ))}
      {selected && (
        <div style={{ borderTop: '1px solid #1a1a1a' }}>
          <button onClick={() => { navigate(`/drivers/${encodeURIComponent(selected.name)}`); setPickerOpen(false); }}
            style={{ width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--accent-hot)', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
            ✎ Edit My Profile
          </button>
          <button onClick={() => { selectDriver(null); setPickerOpen(false); }}
            style={{ width: '100%', padding: '8px 14px', textAlign: 'center', fontSize: 11, color: '#444', cursor: 'pointer', background: 'transparent', borderTop: '1px solid #111' }}>
            Reset Theme
          </button>
        </div>
      )}
      {drivers.length === 0 && (
        <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>No drivers yet</div>
      )}
    </div>
  ) : null;

  // ── Driver avatar button ─────────────────────────────────────────────────
  const AvatarBtn = selected ? (
    <button onClick={() => navigate(`/drivers/${encodeURIComponent(selected.name)}`)}
      style={{
        width: 32, height: 32, borderRadius: 3,
        background: `radial-gradient(circle at 35% 35%, ${selected.color}cc, ${selected.color}55)`,
        border: `1px solid ${selected.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11, color: '#fff',
        flexShrink: 0, cursor: 'pointer',
      }}>
      {selected.name.slice(0, 2).toUpperCase()}
    </button>
  ) : null;

  // ── Live dot ─────────────────────────────────────────────────────────────
  const LiveDot = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
      <span className={`dot ${isConnected ? 'dot-green' : 'dot-grey'}`} />
      {isMobile ? '' : (isConnected ? 'Live' : 'Connecting')}
    </span>
  );

  if (isMobile) {
    return (
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Accent stripe */}
        <div style={{ height: 2, background: accentColor, transition: 'background 0.4s' }} />

        {/* Top row: logo + picker + live */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, letterSpacing: '0.05em', userSelect: 'none', marginRight: 'auto' }}>
            <span className="chrome">LAP</span>
            <span style={{ color: 'var(--accent)' }}>TRACKER</span>
          </span>

          {acStatus && acStatus.clients > 0 && (
            <span style={{ fontSize: 10, color: 'var(--accent-hot)', fontWeight: 600 }}>
              <span className="dot dot-red" style={{ marginRight: 4 }} />
              {acStatus.clients}
            </span>
          )}

          {/* Driver picker */}
          <div ref={pickerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
            {AvatarBtn}
            <button onClick={() => setPickerOpen(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', height: 32,
              background: 'var(--bg-elevated)',
              border: `1px solid ${selected ? accentColor + '66' : 'var(--border-bright)'}`,
              borderRadius: 3, cursor: 'pointer',
            }}>
              {selected ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selected.name}
                </span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Who?</span>
              )}
              <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>▼</span>
            </button>
            {PickerDropdown}
          </div>

          {LiveDot}
        </div>

        {/* Bottom row: nav links */}
        <nav style={{ display: 'flex', borderTop: '1px solid var(--border)', overflowX: 'auto' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              padding: '10px 16px', fontSize: 12, fontWeight: 600,
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              whiteSpace: 'nowrap', textDecoration: 'none', flexShrink: 0,
            })}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
    );
  }

  // ── Desktop ──────────────────────────────────────────────────────────────
  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex', alignItems: 'center', gap: 8,
      height: 54, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor, transition: 'background 0.4s' }} />

      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, marginRight: 24, letterSpacing: '0.06em', userSelect: 'none' }}>
        <span className="chrome">LAP</span>
        <span style={{ color: 'var(--accent)', transition: 'color 0.4s' }}>TRACKER</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }}>9000</span>
      </span>

      <nav style={{ display: 'flex', gap: 2 }}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            padding: '6px 14px', fontSize: 13, fontWeight: 600,
            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'color 0.15s', textDecoration: 'none', display: 'block',
          })}>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {acStatus && acStatus.clients > 0 && (
          <span className="tag">
            <span className="dot dot-red" />
            {acStatus.clients} on track
          </span>
        )}

        <div ref={pickerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
          {AvatarBtn}
          <button onClick={() => setPickerOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', height: 32,
            background: 'var(--bg-elevated)',
            border: `1px solid ${selected ? accentColor + '66' : 'var(--border-bright)'}`,
            borderRadius: 3, cursor: 'pointer',
          }}>
            {selected ? (
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name}</span>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Who are you?</span>
            )}
            <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>▼</span>
          </button>
          {PickerDropdown}
        </div>

        {LiveDot}
      </div>
    </header>
  );
}
