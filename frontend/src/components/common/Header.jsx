import React, { useState } from 'react'
import { Navbar, Nav, NavDropdown, Container, Badge, Button, Modal } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trophy, Wallet, User, Settings, History, LogOut, AlertTriangle, Menu, Home, Gamepad2, PlusCircle, Dumbbell } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Header = () => {
  const location = useLocation()

  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [userScore] = useState(15420) // Mock user score
  const [userRank] = useState(42) // Mock user rank

  const isActive = (path) => location.pathname === path

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      setShowLogoutModal(false)

      navigate('/auth')

    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, we still want to redirect
      setShowLogoutModal(false)
      navigate('/auth')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  return (
    <>
      {/* Desktop Header */}
      <Navbar
        expand="lg"
        fixed="top"
        className="cyber-navbar d-lg-flex d-none"
        style={{
          background: 'rgba(14, 14, 16, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 2px 20px rgba(0, 240, 255, 0.1)'
        }}
      >
        <Container fluid>
          {/* Logo */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <div className="logo-container d-flex align-items-center">
              <div
                className="logo-icon me-2"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)'
                }}
              >
                <Trophy size={24} color="#0E0E10" />
              </div>
              <span
                className="cyber-text fw-bold"
                style={{
                  fontSize: '1.8rem',
                  background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                GameArena
              </span>
            </div>
          </Navbar.Brand>

          {/* Navigation Links - Desktop Only */}
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={`cyber-nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <Home size={18} className="me-2" />
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/play"
              className={`cyber-nav-link ${isActive('/play') ? 'active' : ''}`}
            >
              <Gamepad2 size={18} className="me-2" />
              Play
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/create"
              className={`cyber-nav-link ${isActive('/create') ? 'active' : ''}`}
            >
              <PlusCircle size={18} className="me-2" />
              Create
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/train"
              className={`cyber-nav-link ${isActive('/train') ? 'active' : ''}`}
            >
              <Dumbbell size={18} className="me-2" />
              Train
            </Nav.Link>
          </Nav>

          {/* User Info & Actions */}
          <Nav className="align-items-center">
            {/* User Score Display */}
            <div
              className="user-score-display me-3 px-3 py-2"
              style={{
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Trophy size={18} color="#00F0FF" />
              <div className="score-info">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-neon fw-bold">{userScore.toLocaleString()}</span>
                  <Badge
                    bg=""
                    className="rank-badge"
                    style={{
                      background: 'linear-gradient(45deg, #9B00FF, #FF003C)',
                      fontSize: '0.7rem'
                    }}
                  >
                    #{userRank}
                  </Badge>
                </div>
                <small className="text-white">Global Rank</small>
              </div>
            </div>

            {/* Deposit Button */}
            <Button
              as={Link}
              to="/deposit"
              className="btn-cyber me-3"
              style={{ minWidth: '120px' }}
            >
              <Wallet size={18} className="me-2" />
              Deposit
            </Button>

            {/* Profile Dropdown - Desktop */}
            <NavDropdown
              title={
                <div className="d-flex align-items-center">
                  <div
                    className="profile-avatar me-2"
                    style={{
                      width: '35px',
                      height: '35px',
                      background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <User size={20} color="#0E0E10" />
                  </div>
                </div>
              }
              id="profile-dropdown"
              align="end"
              className="profile-dropdown no-caret"
              renderMenuOnMount={true}
            >
              <NavDropdown.Item as={Link} to="/profile">
                <Settings size={16} className="me-2" />
                Settings
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/profile">
                <History size={16} className="me-2" />
                Game History
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item
                onClick={handleLogoutClick}
                style={{ cursor: 'pointer' }}>
                <LogOut size={16} className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>

      {/* Mobile Header */}
      <Navbar
        fixed="top"
        className="mobile-navbar d-lg-none"
        style={{
          background: 'rgba(14, 14, 16, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 2px 20px rgba(0, 240, 255, 0.1)',
          padding: '8px 0'
        }}
      >
        <Container fluid className="d-flex align-items-center justify-content-between">
          {/* Mobile Logo */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <div
              className="logo-icon me-2"
              style={{
                width: '30px',
                height: '30px',
                background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
              }}
            >
              <Trophy size={18} color="#0E0E10" />
            </div>
            <span
              className="cyber-text fw-bold"
              style={{
                fontSize: '1.2rem',
                background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              GameArena
            </span>
          </Navbar.Brand>

          {/* Mobile User Info */}
          <div className="d-flex align-items-center gap-2">
            {/* Mobile Score Display */}
            <div
              className="mobile-score-display px-2 py-1"
              style={{
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem'
              }}
            >
              <Trophy size={14} color="#00F0FF" />
              <span className="text-neon fw-bold">{userScore.toLocaleString()}</span>
            </div>

            {/* Mobile Deposit Button */}
            <Button
              as={Link}
              to="/deposit"
              className="mobile-deposit-btn"
              style={{
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0'
              }}
            >
              <Wallet size={18} color="#00F0FF" />
            </Button>

            {/* Mobile Profile Dropdown */}
            <NavDropdown
              title={
                <div
                  className="profile-avatar"
                  style={{
                    width: '35px',
                    height: '35px',
                    background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <User size={18} color="#0E0E10" />
                </div>
              }
              id="mobile-profile-dropdown"
              align="end"
              className="profile-dropdown no-caret"
              renderMenuOnMount={true}
            >
              <NavDropdown.Item as={Link} to="/profile">
                <Settings size={16} className="me-2" />
                Settings
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/profile">
                <History size={16} className="me-2" />
                Game History
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item
                onClick={handleLogoutClick}
                style={{ cursor: 'pointer' }}
              >
                <LogOut size={16} className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </div>
        </Container>
      </Navbar>

      {/* Logout Confirmation Modal */}
      <Modal
        show={showLogoutModal}
        onHide={handleLogoutCancel}
        centered
        className="cyber-modal"
      >
        <Modal.Header
          closeButton
          style={{
            background: 'rgba(31, 31, 35, 0.95)',
            border: 'none',
            borderBottom: '1px solid rgba(0, 240, 255, 0.3)'
          }}
        >
          <Modal.Title className="d-flex align-items-center text-white">
            <AlertTriangle size={24} className="me-2 text-warning" />
            Confirm Logout
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            background: 'rgba(31, 31, 35, 0.95)',
            color: 'white'
          }}
        >
          <div className="text-center py-3">
            <div
              className="mb-3"
              style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
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

        <Modal.Footer
          style={{
            background: 'rgba(31, 31, 35, 0.95)',
            border: 'none',
            borderTop: '1px solid rgba(0, 240, 255, 0.3)'
          }}
        >
          <Button
            variant="outline-secondary"
            onClick={handleLogoutCancel}
            disabled={isLoggingOut}
            style={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#F5F5F5'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            disabled={isLoggingOut}
            style={{
              background: 'linear-gradient(45deg, #FF003C, #9B00FF)',
              border: 'none',
              color: '#F5F5F5',
              minWidth: '100px'
            }}
          >
            {isLoggingOut ? (
              <div className="d-flex align-items-center justify-content-center">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderColor: 'rgba(245, 245, 245, 0.3)',
                    borderTopColor: '#F5F5F5'
                  }}
                />
                Signing Out...
              </div>
            ) : (
              <>
                <LogOut size={16} className="me-2" />
                Logout
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>


      <style jsx>{`
        .cyber-nav-link {
          color: #F5F5F5 !important;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 10px;
          padding: 8px 15px !important;
          border-radius: 20px;
          transition: all 0.3s ease;
          position: relative;
        }

        .cyber-nav-link:hover {
          color: #00F0FF !important;
          background: rgba(0, 240, 255, 0.1);
        }

        .cyber-nav-link.active {
          color: #00F0FF !important;
          background: rgba(0, 240, 255, 0.2);
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        }

        /* Remove dropdown caret/arrow */
        .no-caret .dropdown-toggle::after {
          display: none !important;
        }

        .no-caret .dropdown-toggle {
          border: none !important;
          background: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        .no-caret .dropdown-toggle:focus {
          box-shadow: none !important;
        }

        /* Profile dropdown hover behavior */
        .profile-dropdown:hover .dropdown-menu {
          display: block;
        }

        .profile-dropdown .dropdown-menu {
          background: rgba(31, 31, 35, 0.95) !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
          backdrop-filter: blur(10px);
          margin-top: 5px;
        }

        .profile-dropdown .dropdown-item {
          color: #F5F5F5 !important;
          transition: all 0.3s ease;
        }

        .profile-dropdown .dropdown-item:hover {
          background: rgba(0, 240, 255, 0.1) !important;
          color: #00F0FF !important;
        }

        .mobile-deposit-btn:hover {
          background: rgba(0, 240, 255, 0.2) !important;
          transform: scale(1.05);
        }

        /* Profile avatar hover effect */
        .profile-avatar {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .profile-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.7);
        }
      `}</style>
    </>
  )
}

export default Header