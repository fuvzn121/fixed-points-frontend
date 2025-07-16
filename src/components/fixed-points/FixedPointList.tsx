import React from 'react'
import { FixedPoint, Agent, Map } from '../../models'
import FixedPointCard from './FixedPointCard'

interface FixedPointListProps {
  fixedPoints: FixedPoint[]
  agents: Agent[]
  maps: Map[]
  onFavoriteToggle: (id: number, isFavorited: boolean) => void
  onViewDetail: (id: number) => void
  isAuthenticated: boolean
  isLoading: boolean
}

const FixedPointList: React.FC<FixedPointListProps> = ({
  fixedPoints,
  agents,
  maps,
  onFavoriteToggle,
  onViewDetail,
  isAuthenticated,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#b0b8c1' }}>
        <p style={{ fontSize: '18px' }}>Loading fixed points...</p>
      </div>
    )
  }

  if (fixedPoints.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <p style={{ fontSize: '18px', color: '#8a919e', margin: '0 0 8px 0' }}>
          No fixed points found
        </p>
        <p style={{ fontSize: '14px', color: '#6a737d', margin: 0 }}>
          Be the first to share a tactical position!
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px',
        width: '100%',
      }}
    >
      {fixedPoints.map((fixedPoint) => (
        <FixedPointCard
          key={fixedPoint.id}
          fixedPoint={fixedPoint}
          agents={agents}
          maps={maps}
          onFavoriteToggle={onFavoriteToggle}
          onViewDetail={onViewDetail}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}

export default FixedPointList