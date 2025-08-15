import React, { useState } from 'react'
import { Navbar, Nav, NavDropdown, Container, Badge, Button } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { Trophy, Wallet, User, Settings, History, LogOut, Menu } from 'lucide-react'

const Header = () => {
  const location = useLocation()
  const [userScore] = useState(15420) // Mock user score
  const [userRank] = useState(42) // Mock user rank

  const isActive = (path) => location.pathname === path

  return (
    <Navbar 
      expand="lg" 
      fixed="top" 
      className="cyber-navbar"
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

        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <Menu color="#00F0FF" />
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          {/* Navigation Links */}
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`cyber-nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <i className="fas fa-home me-2"></i>
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/play" 
              className={`cyber-nav-link ${isActive('/play') ? 'active' : ''}`}
            >
              <i className="fas fa-gamepad me-2"></i>
              Play
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/create" 
              className={`cyber-nav-link ${isActive('/create') ? 'active' : ''}`}
            >
              <i className="fas fa-plus-circle me-2"></i>
              Create
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/train" 
              className={`cyber-nav-link ${isActive('/train') ? 'active' : ''}`}
            >
              <i className="fas fa-dumbbell me-2"></i>
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
                <small className="text-muted">Global Rank</small>
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

            {/* Profile Dropdown */}
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
                  <span className="d-none d-md-inline">ProGamer_2024</span>
                </div>
              }
              id="profile-dropdown"
              align="end"
              className="profile-dropdown"
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
              <NavDropdown.Item>
                <LogOut size={16} className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>

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

        .profile-dropdown .dropdown-menu {
          background: rgba(31, 31, 35, 0.95) !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
          backdrop-filter: blur(10px);
        }

        .profile-dropdown .dropdown-item {
          color: #F5F5F5 !important;
          transition: all 0.3s ease;
        }

        .profile-dropdown .dropdown-item:hover {
          background: rgba(0, 240, 255, 0.1) !important;
          color: #00F0FF !important;
        }

        @media (max-width: 768px) {
          .user-score-display {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </Navbar>
  )
}

export default Header