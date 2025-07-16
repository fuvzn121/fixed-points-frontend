import React from 'react'

const Header: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <h1
        style={{
          fontSize: '64px',
          margin: 0,
          background: 'linear-gradient(45deg, #ff4655, #00d4ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '900',
          textShadow: '0 0 30px rgba(255, 70, 85, 0.5)',
        }}
      >
        VALORANT
      </h1>
      <h2
        style={{
          fontSize: '32px',
          margin: '10px 0 0 0',
          color: '#ff4655',
          fontWeight: '700',
          letterSpacing: '2px',
        }}
      >
        FIXED POINTS
      </h2>
      <p
        style={{
          fontSize: '18px',
          textAlign: 'center',
          margin: '20px 0 0 0',
          color: '#b0b8c1',
          fontWeight: '500',
        }}
      >
        戦術的定点を共有して、チームの勝利に貢献しよう
      </p>
    </div>
  )
}

export default Header