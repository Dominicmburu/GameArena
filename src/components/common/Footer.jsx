import React from 'react';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} GameArena. All rights reserved.</p>
                <p>
                    <a href="/privacy-policy">Privacy Policy</a> | <a href="/terms-of-service">Terms of Service</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;