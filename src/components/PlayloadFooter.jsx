import React, { useState } from 'react';

const PlayloadFooter = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100vw',
      backgroundColor: '#000000',
      padding: '0.4rem 0',
      zIndex: 9999,
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <a
          href="https://playloadorg.github.io/landing-main-1/"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            color: '#ffffff',
            fontSize: '0.75rem',
            textDecoration: 'none',
            transition: 'opacity 0.3s ease',
            opacity: isHovered ? 0.7 : 1,
            whiteSpace: 'nowrap'
          }}
        >
          POWERED BY PLAYLOAD.ORG
        </a>
        
        <span style={{
          color: '#ffffff',
          fontSize: '0.65rem',
          opacity: isHovered ? 0.6 : 0,
          transition: 'opacity 0.3s ease',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          playloadorg.github.io/landing-main-1
        </span>
      </div>
    </footer>
  );
};

export default PlayloadFooter;