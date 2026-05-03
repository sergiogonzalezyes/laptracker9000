import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
import { useDriverTheme } from '../../hooks/useDriverTheme';
import { useIsMobile } from '../../hooks/useBreakpoint';
import LoginModal from '../LoginModal';

const NAV_LINKS = [
  { to: '/live',        label: 'Live' },
  { to: '/history',     label: 'History' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/drivers',     label: 'Drivers' },
];

export default function NavBar() {
  const { isConnected, acStatus } = useLiveStore();
  const { me, logout } = useDriverTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const accentColor = me?.color ?? '#cc0000';

  const AccountWidget = (
    <div style={{ position: 'relative' }}>
      {me ? (
        <>
          {/* Logged-in avatar */}
          <button
            onClick={() => setShowAccountMenu(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: '4px 6px', borderRadius: 4,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: `radial-gradient(circle at 35% 35%, ${me.color}cc, ${me.color}55)`,
              border: `2px solid ${me.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11,
              color: '#fff',
            }}>
              {me.name.slice(0, 2).toUpperCase()}
            </div>
            {!isMobile && (
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {me.name}
              </span>
            )}
          </button>

          {/* Account dropdown */}
          {showAccountMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                onClick={() => setShowAccountMenu(false)}
              />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderTop: `2px solid ${me.color}`,
                borderRadius: 6, minWidth: 180, zIndex: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}>
                {/* Profile header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{me.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Signed in</div>
                </div>

                <button
                  onClick={() => { navigate(`/drivers/${encodeURIComponent(me.name)}`); setShowAccountMenu(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '11px 16px',
                    textAlign: 'left', fontSize: 13, fontWeight: 500,
                    color: 'var(--text-primary)', cursor: 'pointer',
                    background: 'transparent', borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  My Profile
                </button>

                <button
                  onClick={() => { logout(); setShowAccountMenu(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '11px 16px',
                    textAlign: 'left', fontSize: 13, color: 'var(--text-muted)',
                    cursor: 'pointer', background: 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <button
          onClick={() => setShowLogin(true)}
          style={{
            fontSize: 13, fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'transparent', border: 'none',
            cursor: 'pointer', padding: '4px 8px',
            borderRadius: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Sign in
        </button>
      )}
    </div>
  );

  const LiveIndicator = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
      <span className={`dot ${isConnected ? 'dot-green' : 'dot-grey'}`} />
      {!isMobile && (isConnected ? 'Live' : 'Connecting')}
    </span>
  );

  return (
    <>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Accent stripe — uses logged-in driver's color */}
        <div style={{ height: 2, background: accentColor, transition: 'background 0.4s' }} />

        {isMobile ? (
          <>
            {/* Mobile top row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, letterSpacing: '0.05em', userSelect: 'none', marginRight: 'auto' }}>
                <span className="chrome">LAP</span>
                <span style={{ color: 'var(--accent)' }}>TRACKER</span>
              </span>

              {acStatus && acStatus.clients > 0 && (
                <span style={{ fontSize: 10, color: 'var(--accent-hot)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="dot dot-red" />{acStatus.clients}
                </span>
              )}

              {AccountWidget}
              {LiveIndicator}
            </div>

            {/* Mobile nav row */}
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
          </>
        ) : (
          /* Desktop single row */
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 32px', height: 54 }}>
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

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
              {acStatus && acStatus.clients > 0 && (
                <span className="tag">
                  <span className="dot dot-red" />
                  {acStatus.clients} on track
                </span>
              )}
              {AccountWidget}
              {LiveIndicator}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
