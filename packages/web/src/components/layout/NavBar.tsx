import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
import { useDriverTheme } from '../../hooks/useDriverTheme';
import { useIsMobile } from '../../hooks/useBreakpoint';
import LoginModal from '../LoginModal';

const NAV_LINKS = [
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/drivers',     label: 'Drivers' },
  { to: '/tracks',      label: 'Tracks' },
  { to: '/sessions',    label: 'Sessions' },
  { to: '/stats',       label: 'Stats' },
];

export default function NavBar() {
  const { isConnected, acStatus } = useLiveStore();
  const { me, logout } = useDriverTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const accentColor = me?.color ?? '#cc0000';

  return (
    <>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ height: 2, background: accentColor, transition: 'background 0.4s' }} />

        {isMobile ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
              <span onClick={() => navigate('/live')} style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, letterSpacing: '0.05em', userSelect: 'none', marginRight: 'auto', cursor: 'pointer' }}>
                <span className="chrome">Lap</span><span style={{ color: accentColor }}>Tracker</span><span style={{ color: 'var(--text-muted)', fontSize: 10 }}>9000</span>
              </span>
              {acStatus && acStatus.clients > 0 && (
                <span style={{ fontSize: 10, color: 'var(--accent-hot)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="dot dot-red" />{acStatus.clients}
                </span>
              )}
              <AccountWidget me={me} onLogin={() => setShowLogin(true)} onLogout={logout} navigate={navigate} showAccountMenu={showAccountMenu} setShowAccountMenu={setShowAccountMenu} accentColor={accentColor} />
              <LiveDot isConnected={isConnected} />
            </div>
            <nav style={{ display: 'flex', borderTop: '1px solid var(--border)', overflowX: 'auto' }}>
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} style={({ isActive }) => ({
                  padding: '9px 14px', fontSize: 11, fontWeight: 600,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                  whiteSpace: 'nowrap', textDecoration: 'none', flexShrink: 0,
                })}>
                  {label}
                </NavLink>
              ))}
            </nav>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 28px', gap: 0 }}>
            {/* Logo */}
            <span onClick={() => navigate('/live')} style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, letterSpacing: '0.06em', userSelect: 'none', cursor: 'pointer', marginRight: 32, whiteSpace: 'nowrap' }}>
              <span className="chrome">Lap</span><span style={{ color: accentColor, transition: 'color 0.4s' }}>Tracker</span><span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 2 }}>9000</span>
            </span>

            {/* Nav links — centered */}
            <nav style={{ display: 'flex', gap: 0, flex: 1 }}>
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} style={({ isActive }) => ({
                  padding: '0 16px', height: 52, display: 'flex', alignItems: 'center',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                  transition: 'color 0.15s', textDecoration: 'none',
                  textTransform: 'uppercase',
                })}>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right: live indicator + account */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
              {acStatus && acStatus.clients > 0 && (
                <span className="tag" style={{ fontSize: 11 }}>
                  <span className="dot dot-red" />
                  {acStatus.clients} on track
                </span>
              )}

              <LiveDot isConnected={isConnected} />

              <AccountWidget me={me} onLogin={() => setShowLogin(true)} onLogout={logout} navigate={navigate} showAccountMenu={showAccountMenu} setShowAccountMenu={setShowAccountMenu} accentColor={accentColor} />
            </div>
          </div>
        )}
      </header>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LiveDot({ isConnected }: { isConnected: boolean }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
      <span className={`dot ${isConnected ? 'dot-green' : 'dot-grey'}`} />
      {isConnected ? 'Live' : ''}
    </span>
  );
}

function AccountWidget({ me, onLogin, onLogout, navigate, showAccountMenu, setShowAccountMenu, accentColor }: {
  me: any; onLogin: () => void; onLogout: () => void; navigate: any;
  showAccountMenu: boolean; setShowAccountMenu: (v: boolean) => void; accentColor: string;
}) {
  if (!me) {
    return (
      <button onClick={onLogin} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
        Sign in
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setShowAccountMenu(!showAccountMenu)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${me.color}cc, ${me.color}55)`,
          border: `2px solid ${me.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 10, color: '#fff',
        }}>
          {me.name.slice(0, 2).toUpperCase()}
        </div>
      </button>

      {showAccountMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowAccountMenu(false)} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 6px)',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderTop: `2px solid ${me.color}`, borderRadius: 8,
            minWidth: 160, zIndex: 200, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{me.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Signed in</div>
            </div>
            <button onClick={() => { navigate(`/drivers/${encodeURIComponent(me.name)}`); setShowAccountMenu(false); }}
              style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', background: 'transparent', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              My Profile
            </button>
            <button onClick={() => { onLogout(); setShowAccountMenu(false); }}
              style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
