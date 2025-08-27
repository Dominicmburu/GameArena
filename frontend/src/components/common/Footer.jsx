import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, PlusCircle, Dumbbell } from 'lucide-react';

const Footer = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Desktop Footer */}
            <footer className="d-lg-block d-none">
                {/* Line above content */}
                <div 
                    style={{
                        width: '100%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.5), transparent)',
                        marginBottom: '20px'
                    }}
                ></div>
                
                <div 
                    className="footer-content"
                    style={{
                        color: '#FFFFFF',
                        textAlign: 'center',
                        padding: '20px 0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '40px',
                        flexWrap: 'wrap'
                    }}
                >
                    <p style={{ margin: '0', fontSize: '14px' }}>
                        &copy; {new Date().getFullYear()} GameArena. All rights reserved.
                    </p>
                    <div style={{ margin: '0', fontSize: '14px' }}>
                        <a 
                            href="/privacy-policy" 
                            style={{ 
                                color: '#FFFFFF', 
                                textDecoration: 'none',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#00F0FF'}
                            onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
                        >
                            Privacy Policy
                        </a>
                        <span style={{ margin: '0 10px', color: '#666' }}>|</span>
                        <a 
                            href="/terms-of-service" 
                            style={{ 
                                color: '#FFFFFF', 
                                textDecoration: 'none',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#00F0FF'}
                            onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
                        >
                            Terms of Service
                        </a>
                    </div>
                </div>
            </footer>

            {/* Mobile Bottom Navigation */}
            <nav 
                className="mobile-bottom-nav d-lg-none"
                style={{
                    position: 'fixed',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'rgba(14, 14, 16, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid rgba(0, 240, 255, 0.3)',
                    boxShadow: '0 -2px 20px rgba(0, 240, 255, 0.1)',
                    zIndex: 1030,
                    padding: '8px 0'
                }}
            >
                <div className="d-flex justify-content-around align-items-center">
                    <Link 
                        to="/" 
                        className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: isActive('/') ? '#00F0FF' : '#F5F5F5',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            background: isActive('/') ? 'rgba(0, 240, 255, 0.1)' : 'transparent'
                        }}
                    >
                        <Home size={24} />
                        <span style={{ 
                            fontSize: '0.7rem', 
                            marginTop: '4px',
                            fontWeight: isActive('/') ? 'bold' : 'normal'
                        }}>
                            Home
                        </span>
                    </Link>

                    <Link 
                        to="/play" 
                        className={`mobile-nav-item ${isActive('/play') ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: isActive('/play') ? '#00F0FF' : '#F5F5F5',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            background: isActive('/play') ? 'rgba(0, 240, 255, 0.1)' : 'transparent'
                        }}
                    >
                        <Gamepad2 size={24} />
                        <span style={{ 
                            fontSize: '0.7rem', 
                            marginTop: '4px',
                            fontWeight: isActive('/play') ? 'bold' : 'normal'
                        }}>
                            Play
                        </span>
                    </Link>

                    <Link 
                        to="/create" 
                        className={`mobile-nav-item ${isActive('/create') ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: isActive('/create') ? '#00F0FF' : '#F5F5F5',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            background: isActive('/create') ? 'rgba(0, 240, 255, 0.1)' : 'transparent'
                        }}
                    >
                        <PlusCircle size={24} />
                        <span style={{ 
                            fontSize: '0.7rem', 
                            marginTop: '4px',
                            fontWeight: isActive('/create') ? 'bold' : 'normal'
                        }}>
                            Create
                        </span>
                    </Link>

                    <Link 
                        to="/train" 
                        className={`mobile-nav-item ${isActive('/train') ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: isActive('/train') ? '#00F0FF' : '#F5F5F5',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            background: isActive('/train') ? 'rgba(0, 240, 255, 0.1)' : 'transparent'
                        }}
                    >
                        <Dumbbell size={24} />
                        <span style={{ 
                            fontSize: '0.7rem', 
                            marginTop: '4px',
                            fontWeight: isActive('/train') ? 'bold' : 'normal'
                        }}>
                            Train
                        </span>
                    </Link>
                </div>
            </nav>

            <style jsx>{`
                .mobile-nav-item:hover {
                    color: #00F0FF !important;
                    background: rgba(0, 240, 255, 0.1) !important;
                    transform: scale(1.05);
                }

                .mobile-nav-item.active {
                    box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
                }
            `}</style>
        </>
    );
};

export default Footer;