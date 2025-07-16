import React from 'react'
import { FixedPoint, Agent, Map } from '../../types'
import Button from '../common/Button'

interface FixedPointCardProps {
  fixedPoint: FixedPoint
  agents: Agent[]
  maps: Map[]
  onFavoriteToggle: (id: number, isFavorited: boolean) => void
  onViewDetail: (id: number) => void
  isAuthenticated: boolean
}

const FixedPointCard: React.FC<FixedPointCardProps> = ({
  fixedPoint,
  agents,
  maps,
  onFavoriteToggle,
  onViewDetail,
  isAuthenticated,
}) => {
  const agent = agents.find((a) => a.uuid === fixedPoint.character_id)
  const map = maps.find((m) => m.uuid === fixedPoint.map_id)

  return (
    <div
      style={{
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)'
        e.currentTarget.style.borderColor = 'rgba(255, 70, 85, 0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
      }}
      onClick={() => onViewDetail(fixedPoint.id)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '20px',
              color: '#ffffff',
              fontWeight: '600',
            }}
          >
            {fixedPoint.title}
          </h3>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
            {agent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={agent.displayIcon}
                  alt={agent.displayName}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                  }}
                />
                <span style={{ color: '#b0b8c1', fontSize: '14px' }}>{agent.displayName}</span>
              </div>
            )}
            {map && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#00d4ff', fontSize: '14px' }}>📍 {map.displayName}</span>
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '14px',
              color: '#8a919e',
            }}
          >
            <span>by {fixedPoint.username}</span>
            <span>
              {new Date(fixedPoint.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onFavoriteToggle(fixedPoint.id, fixedPoint.is_favorited)}
            disabled={!isAuthenticated}
            style={{
              background: 'none',
              border: 'none',
              cursor: isAuthenticated ? 'pointer' : 'not-allowed',
              fontSize: '24px',
              transition: 'transform 0.2s ease',
              opacity: isAuthenticated ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (isAuthenticated) {
                e.currentTarget.style.transform = 'scale(1.2)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {fixedPoint.is_favorited ? '❤️' : '🤍'}
          </button>
          <span style={{ fontSize: '14px', color: '#8a919e' }}>{fixedPoint.favorites_count}</span>
        </div>
      </div>
      {fixedPoint.steps && fixedPoint.steps.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#b0b8c1',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: '#ff4655' }}>📋</span>
            {fixedPoint.steps.length} steps
          </p>
        </div>
      )}
    </div>
  )
}

export default FixedPointCard