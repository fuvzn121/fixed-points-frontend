import React from 'react'
import { User } from '../../types'
import Button from '../common/Button'

interface UserInfoProps {
  user: User
  onLogout: () => void
}

const UserInfo: React.FC<UserInfoProps> = ({ user, onLogout }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'center',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 70, 85, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '18px',
          color: '#00d4ff',
          fontWeight: '600',
        }}
      >
        ようこそ、{user.username}さん！
      </p>
      <Button onClick={onLogout} variant="primary" size="medium">
        Logout
      </Button>
    </div>
  )
}

export default UserInfo