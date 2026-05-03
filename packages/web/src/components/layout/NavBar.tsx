import { NavLink } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';

export default function NavBar() {
  const { isConnected, acStatus } = useLiveStore();

  return (
    <header style={{
      background: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
      borderBottom: '1px solid #2a2a2a',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 56,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 20px rgba(0,0,0,0.8)',
    }}>
      {/* Red stripe at very top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 0%, #cc0000 30%, #ff2020 50%, #cc0000 70%, transparent 100%)' }} />

      {/* Logo */}
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 17, marginRight: 24, letterSpacing: '0.08em', userSelect: 'none' }}>
        <span className="chrome">LAP</span>
        <span style={{ color: 'var(--accent)', textShadow: '0 0 12px rgba(204,0,0,0.6)' }}>TRACKER</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }}>9000</span>
      </span>

      <nav style={{ display: 'flex', gap: 2 }}>
        {[
          { to: '/', label: 'Live', end: true },
          { to: '/history', label: 'History', end: false },
          { to: '/leaderboard', label: 'Leaderboard', end: false },
          { to: '/drivers', label: 'Drivers', end: false },
        ].map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            padding: '5px 16px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '0.1em',
            color: isActive ? '#fff' : 'var(--text-muted)',
            background: isActive ? 'linear-gradient(180deg, #1e0000 0%, #110000 100%)' : 'transparent',
            borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 0.15s',
            textDecoration: 'none',
            display: 'block',
          })}>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Status */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {acStatus && acStatus.clients > 0 && (
          <span className="tag">
            <span className="dot dot-red" />
            {acStatus.clients} ON TRACK
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          <span className={`dot ${isConnected ? 'dot-green' : 'dot-grey'}`} />
          {isConnected ? 'LIVE' : 'CONNECTING'}
        </span>
      </div>
    </header>
  );
}
