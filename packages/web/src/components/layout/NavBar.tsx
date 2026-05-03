import { NavLink } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';

const linkStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 13,
  color: active ? 'var(--accent)' : 'var(--text-secondary)',
  background: active ? 'rgba(232,176,0,0.08)' : 'transparent',
  transition: 'color 0.15s, background 0.15s',
});

export default function NavBar() {
  const { isConnected, acStatus } = useLiveStore();

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 52,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', fontSize: 15, marginRight: 16, letterSpacing: '0.02em' }}>
        LAP<span style={{ color: 'var(--text-secondary)' }}>TRACKER</span>
      </span>

      <nav style={{ display: 'flex', gap: 4 }}>
        <NavLink to="/"           end style={({ isActive }) => linkStyle(isActive)}>Live</NavLink>
        <NavLink to="/history"        style={({ isActive }) => linkStyle(isActive)}>History</NavLink>
        <NavLink to="/leaderboard"    style={({ isActive }) => linkStyle(isActive)}>Leaderboard</NavLink>
      </nav>

      {/* Status */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {acStatus && acStatus.clients > 0 && (
          <span className="tag">
            <span className="dot dot-green" />
            {acStatus.clients} on track
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span className={`dot ${isConnected ? 'dot-green' : 'dot-grey'}`} />
          {isConnected ? 'live' : 'connecting...'}
        </span>
      </div>
    </header>
  );
}
