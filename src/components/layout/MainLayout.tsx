import React from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0f1419 100%)',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          maxWidth: '1920px',
          margin: '0 auto',
          padding: '40px 20px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default MainLayout