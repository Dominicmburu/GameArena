import React from 'react'

const LoadingSpinner = ({ 
  size = 'large', 
  fullScreen = true 
}) => {
  const sizeMap = {
    small: { width: '32px', height: '32px' },
    medium: { width: '48px', height: '48px' }, 
    large: { width: '64px', height: '64px' },
    xlarge: { width: '96px', height: '96px' }
  }

  const spinnerSize = sizeMap[size]

  const CyberSpinner = () => (
    <div style={{ 
      position: 'relative',
      width: spinnerSize.width,
      height: spinnerSize.height
    }}>
      {/* Outer ring */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '2px solid transparent',
          borderTopColor: '#00F0FF',
          borderRightColor: '#9B00FF',
          borderRadius: '50%',
          animation: 'cyber-spin 1s linear infinite'
        }}
      />
      
      {/* Middle ring */}
      <div 
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          right: '4px',
          bottom: '4px',
          border: '2px solid transparent',
          borderBottomColor: '#00FF85',
          borderLeftColor: '#FF003C',
          borderRadius: '50%',
          animation: 'cyber-spin-reverse 1.5s linear infinite'
        }}
      />
      
      {/* Inner ring */}
      <div 
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          bottom: '12px',
          border: '1px solid transparent',
          borderTopColor: '#00B4FF',
          borderRadius: '50%',
          animation: 'cyber-spin 2s linear infinite'
        }}
      />
      
      {/* Center dot */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '8px',
          height: '8px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #00F0FF, transparent)',
          borderRadius: '50%',
          boxShadow: '0 0 10px #00F0FF',
          animation: 'cyber-pulse 1.5s ease-in-out infinite'
        }}
      />
      
      {/* Glow effect */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1), transparent)',
          borderRadius: '50%',
          animation: 'cyber-ping 2s ease-in-out infinite'
        }}
      />
      
      <style jsx>{`
        @keyframes cyber-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes cyber-spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        
        @keyframes cyber-pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes cyber-ping {
          0% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )

  if (fullScreen) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(14, 14, 16, 0.95), rgba(31, 31, 35, 0.95))',
          backdropFilter: 'blur(10px)'
        }}
      >
        <CyberSpinner />
      </div>
    )
  }

  return <CyberSpinner />
}

export default LoadingSpinner