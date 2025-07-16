import React from 'react'
import { ApiStatus } from '../../types'

interface StatusMessageProps {
  status: ApiStatus | null
}

const StatusMessage: React.FC<StatusMessageProps> = ({ status }) => {
  if (!status) return null

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: status.isError
          ? 'rgba(255, 70, 85, 0.1)'
          : 'rgba(0, 212, 255, 0.1)',
        border: `1px solid ${status.isError ? '#ff4655' : '#00d4ff'}`,
        color: status.isError ? '#ff4655' : '#00d4ff',
        textAlign: 'center',
        fontWeight: 600,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 4px 15px ${
          status.isError ? 'rgba(255, 70, 85, 0.2)' : 'rgba(0, 212, 255, 0.2)'
        }`,
      }}
    >
      {status.message}
    </div>
  )
}

export default StatusMessage