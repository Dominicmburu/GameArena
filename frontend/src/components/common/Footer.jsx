import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="d-none d-lg-block ga-footer">
      <div className="ga-footer-inner">
        <p className="ga-footer-copy">
          &copy; {new Date().getFullYear()} GameArena. All rights reserved.
        </p>
        <div className="ga-footer-links">
          <Link to="/privacy-policy" className="ga-footer-link">Privacy Policy</Link>
          <span className="ga-footer-sep" />
          <Link to="/terms-of-service" className="ga-footer-link">Terms of Service</Link>
        </div>
      </div>

      <style jsx>{`
        .ga-footer {
          border-top: 1px solid rgba(197, 48, 48, 0.12);
          padding: 20px 0;
        }

        .ga-footer-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          padding: 0 28px;
        }

        .ga-footer-copy {
          margin: 0;
          font-size: 0.82rem;
          color: #505050;
        }

        .ga-footer-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ga-footer-link {
          font-size: 0.82rem;
          color: #505050;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .ga-footer-link:hover {
          color: #C53030;
          text-decoration: none;
        }

        .ga-footer-sep {
          width: 1px;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          display: inline-block;
        }
      `}</style>
    </footer>
  )
}

export default Footer
