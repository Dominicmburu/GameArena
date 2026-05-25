import React, { useState } from 'react'
import { NavDropdown, Button, Modal } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trophy, Wallet, User, Settings, History, LogOut, AlertTriangle, Home, Gamepad2, PlusCircle, Dumbbell, LogIn } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/play', label: 'Play', Icon: Gamepad2 },
  { to: '/create', label: 'Create', Icon: PlusCircle },
  { to: '/train', label: 'Train', Icon: Dumbbell },
]

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userScore] = useState(15420)
  const [userRank] = useState(42)

  const isActive = (path) => location.pathname === path

  const handleLogoutClick = () => setShowLogoutModal(true)
  const handleLogoutCancel = () => setShowLogoutModal(false)

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      setShowLogoutModal(false)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      setShowLogoutModal(false)
      navigate('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const ProfileMenu = ({ id }) => (
    <NavDropdown
      title={
        <div className="ga-avatar">
          <User size={18} color="#fff" />
        </div>
      }
      id={id}
      align="end"
      className="ga-profile-dropdown no-caret"
      renderMenuOnMount={true}
    >
      {user?.username && (
        <NavDropdown.Header className="ga-dropdown-user">
          {user.username}
        </NavDropdown.Header>
      )}
      <NavDropdown.Item as={Link} to="/profile">
        <Settings size={15} className="me-2" /> Settings
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/history">
        <History size={15} className="me-2" /> Game History
      </NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={handleLogoutClick} className="ga-logout-item">
        <LogOut size={15} className="me-2" /> Logout
      </NavDropdown.Item>
    </NavDropdown>
  )

  return (
    <>
      {/* ── Desktop Header ── */}
      <header className="ga-header d-none d-lg-block">
        <div className="ga-header-inner">
          <Link to="/" className="ga-logo">
            <div className="ga-logo-icon">
              <Trophy size={20} color="#fff" />
            </div>
            <span className="ga-logo-text">GameArena</span>
          </Link>

          <nav className="ga-nav">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`ga-nav-link${isActive(to) ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ga-header-right">
            {isAuthenticated ? (
              <>
                <div className="ga-score">
                  <Trophy size={14} color="#C53030" />
                  <span className="ga-score-value">{userScore.toLocaleString()}</span>
                  <span className="ga-rank">#{userRank}</span>
                </div>

                <Button as={Link} to="/deposit" className="btn-cyber ga-deposit-btn">
                  <Wallet size={15} className="me-2" />
                  Deposit
                </Button>

                <ProfileMenu id="profile-dropdown" />
              </>
            ) : (
              <>
                <Link to="/auth" className="ga-guest-link">Log In</Link>
                <Button as={Link} to="/auth" className="btn-cyber ga-signup-btn">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Top Bar ── */}
      <header className="ga-mobile-top d-lg-none">
        <Link to="/" className="ga-logo">
          <div className="ga-logo-icon ga-logo-icon--sm">
            <Trophy size={15} color="#fff" />
          </div>
          <span className="ga-logo-text ga-logo-text--sm">GameArena</span>
        </Link>

        <div className="ga-header-right">
          {isAuthenticated ? (
            <>
              <div className="ga-score ga-score--sm">
                <Trophy size={13} color="#C53030" />
                <span className="ga-score-value">{userScore.toLocaleString()}</span>
              </div>

              <Link to="/deposit" className="ga-icon-btn">
                <Wallet size={17} color="#C53030" />
              </Link>

              <ProfileMenu id="mobile-profile-dropdown" />
            </>
          ) : (
            <Link to="/auth" className="btn-cyber ga-signup-btn ga-signup-btn--sm">
              <LogIn size={14} className="me-1" />
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="ga-mobile-bottom d-lg-none">
        {NAV_LINKS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className={`ga-tab${isActive(to) ? ' active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Logout Modal ── */}
      <Modal show={showLogoutModal} onHide={handleLogoutCancel} centered className="cyber-modal">
        <Modal.Header
          closeButton
          style={{ background: 'rgba(31,31,35,0.95)', borderBottom: '1px solid rgba(49,130,206,0.3)' }}
        >
          <Modal.Title className="d-flex align-items-center text-white">
            <AlertTriangle size={24} className="me-2 text-warning" />
            Confirm Logout
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ background: 'rgba(31,31,35,0.95)', color: 'white' }}>
          <div className="text-center py-3">
            <div
              style={{
                width: '60px', height: '60px',
                background: 'linear-gradient(135deg, #C53030, #805AD5)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <LogOut size={28} color="#F5F5F5" />
            </div>
            <h5 className="mb-3 text-white">Ready to leave the arena?</h5>
            <p className="text-secondary mb-0">
              You'll be signed out of your GameArena account.
              Your progress and achievements will be saved.
            </p>
            {user?.username && (
              <p className="text-neon mt-2 mb-0">
                See you later, <strong>{user.username}</strong>!
              </p>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer style={{ background: 'rgba(31,31,35,0.95)', borderTop: '1px solid rgba(49,130,206,0.3)' }}>
          <Button
            variant="outline-secondary"
            onClick={handleLogoutCancel}
            disabled={isLoggingOut}
            style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#F5F5F5' }}
          >
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} disabled={isLoggingOut} className="btn-cyber">
            {isLoggingOut ? (
              <div className="d-flex align-items-center justify-content-center">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  style={{ width: '16px', height: '16px', borderColor: 'rgba(245,245,245,0.3)', borderTopColor: '#F5F5F5' }}
                />
                Signing Out...
              </div>
            ) : (
              <><LogOut size={16} className="me-2" />Logout</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        /* ════════════════════════════════
           Desktop Header
        ════════════════════════════════ */
        .ga-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 64px;
          background: rgba(14, 14, 16, 0.97);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(197, 48, 48, 0.18);
          z-index: 1030;
        }

        .ga-header-inner {
          width: 100%;
          height: 100%;
          padding: 0 clamp(28px, 5vw, 80px);
          display: flex;
          align-items: center;
        }

        /* Logo */
        .ga-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
          margin-right: 28px;
        }

        .ga-logo:hover { text-decoration: none; }

        .ga-logo-icon {
          width: 36px;
          height: 36px;
          background: #C53030;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ga-logo-icon--sm {
          width: 28px;
          height: 28px;
        }

        .ga-logo-text {
          font-family: 'Orbitron', monospace;
          font-size: 1.1rem;
          font-weight: 700;
          color: #F5F5F5;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .ga-logo-text--sm {
          font-size: 0.9rem;
          letter-spacing: 1.5px;
        }

        /* Nav links */
        .ga-nav {
          display: flex;
          align-items: stretch;
          height: 100%;
          flex: 1;
        }

        .ga-nav-link {
          display: flex;
          align-items: center;
          padding: 0 16px;
          height: 100%;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #7A7A7A;
          text-decoration: none;
          border-bottom: 2px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease;
          white-space: nowrap;
        }

        .ga-nav-link:hover {
          color: #F5F5F5;
          text-decoration: none;
        }

        .ga-nav-link.active {
          color: #F5F5F5;
          border-bottom-color: #C53030;
        }

        /* Right section */
        .ga-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        /* Score */
        .ga-score {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 14px 0 0;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          margin-right: 2px;
        }

        .ga-score--sm {
          border-right: none;
          padding: 0;
          margin-right: 0;
        }

        .ga-score-value {
          font-family: 'Orbitron', monospace;
          font-size: 0.82rem;
          font-weight: 700;
          color: #F5F5F5;
          letter-spacing: 0.5px;
        }

        .ga-rank {
          font-size: 0.68rem;
          font-weight: 700;
          color: #C53030;
          background: rgba(197, 48, 48, 0.12);
          border: 1px solid rgba(197, 48, 48, 0.35);
          border-radius: 3px;
          padding: 1px 5px;
          letter-spacing: 0.5px;
          line-height: 1.5;
        }

        /* Deposit button */
        .ga-deposit-btn {
          padding: 6px 14px !important;
          font-size: 0.78rem !important;
          letter-spacing: 1px;
        }

        /* Guest (non-authenticated) buttons */
        .ga-guest-link {
          color: #B0B0B0;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 4px;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .ga-guest-link:hover {
          color: #F5F5F5;
          background: rgba(255,255,255,0.05);
          text-decoration: none;
        }
        .ga-signup-btn {
          padding: 6px 16px !important;
          font-size: 0.78rem !important;
          letter-spacing: 1px;
        }
        .ga-signup-btn--sm {
          padding: 6px 12px !important;
          font-size: 0.74rem !important;
          display: inline-flex !important;
          align-items: center;
        }

        /* Avatar */
        .ga-avatar {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #C53030 0%, #805AD5 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ga-avatar:hover {
          transform: scale(1.08);
          box-shadow: 0 0 14px rgba(197, 48, 48, 0.55);
        }

        /* Dropdown */
        .ga-profile-dropdown .dropdown-menu {
          background: rgba(18, 18, 20, 0.98) !important;
          border: 1px solid rgba(197, 48, 48, 0.22) !important;
          backdrop-filter: blur(14px);
          border-radius: 8px;
          min-width: 175px;
          margin-top: 10px;
          padding: 4px 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .ga-dropdown-user {
          color: #7A7A7A !important;
          font-size: 0.72rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 8px 16px 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 4px;
        }

        .ga-profile-dropdown .dropdown-item {
          color: #D0D0D0 !important;
          font-size: 0.87rem;
          padding: 9px 16px;
          display: flex;
          align-items: center;
          transition: background 0.15s ease;
        }

        .ga-profile-dropdown .dropdown-item:hover {
          background: rgba(197, 48, 48, 0.1) !important;
          color: #F5F5F5 !important;
        }

        .ga-logout-item {
          color: #C87070 !important;
        }

        .ga-logout-item:hover {
          background: rgba(197, 48, 48, 0.14) !important;
          color: #E08888 !important;
        }

        /* Remove Bootstrap dropdown caret */
        .no-caret .dropdown-toggle::after { display: none !important; }
        .no-caret .dropdown-toggle {
          border: none !important;
          background: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .no-caret .dropdown-toggle:focus { box-shadow: none !important; }

        /* ════════════════════════════════
           Mobile Top Bar
        ════════════════════════════════ */
        .ga-mobile-top {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: rgba(14, 14, 16, 0.97);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(197, 48, 48, 0.18);
          z-index: 1030;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ga-icon-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: rgba(197, 48, 48, 0.08);
          border: 1px solid rgba(197, 48, 48, 0.22);
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .ga-icon-btn:hover {
          background: rgba(197, 48, 48, 0.18);
        }

        /* ════════════════════════════════
           Mobile Bottom Tab Bar
        ════════════════════════════════ */
        .ga-mobile-bottom {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 60px;
          background: rgba(14, 14, 16, 0.97);
          backdrop-filter: blur(14px);
          border-top: 1px solid rgba(197, 48, 48, 0.25);
          z-index: 1030;
          display: flex;
          align-items: stretch;
        }

        .ga-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-decoration: none;
          color: #7A7A7A;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          transition: color 0.2s ease, border-color 0.2s ease;
          border-top: 2px solid transparent;
          padding-top: 2px;
        }

        .ga-tab:hover {
          color: #B0B0B0;
          text-decoration: none;
        }

        .ga-tab.active {
          color: #C53030;
          border-top-color: #C53030;
        }

        .ga-tab.active svg {
          color: #C53030;
          stroke: #C53030;
        }
      `}</style>
    </>
  )
}

export default Header
