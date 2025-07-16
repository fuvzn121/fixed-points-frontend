import React from 'react'
import { MapPosition } from '../../types'
import Button from '../common/Button'

interface MapPositionSelectorProps {
  startPosition: MapPosition | null
  skillPosition: MapPosition | null
  onOpenMapModal: (mode: 'start' | 'skill') => void
  onClearPosition: (type: 'start' | 'skill') => void
}

const MapPositionSelector: React.FC<MapPositionSelectorProps> = ({
  startPosition,
  skillPosition,
  onOpenMapModal,
  onClearPosition,
}) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3
        style={{
          margin: '0 0 20px 0',
          color: '#00d4ff',
          fontSize: '18px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        Map Positions
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Start Position */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <label style={{ color: '#b0b8c1', fontSize: '14px', fontWeight: '500' }}>
              📍 Start Position
            </label>
            {startPosition && (
              <button
                type="button"
                onClick={() => onClearPosition('start')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4655',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                }}
              >
                Clear
              </button>
            )}
          </div>
          <Button
            type="button"
            onClick={() => onOpenMapModal('start')}
            variant="primary"
            size="small"
            fullWidth
          >
            {startPosition
              ? `Selected: (${Math.round(startPosition.x * 100)}%, ${Math.round(
                  startPosition.y * 100
                )}%)`
              : 'Select Start Position'}
          </Button>
        </div>

        {/* Skill Position */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <label style={{ color: '#b0b8c1', fontSize: '14px', fontWeight: '500' }}>
              💥 Skill Target Position
            </label>
            {skillPosition && (
              <button
                type="button"
                onClick={() => onClearPosition('skill')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4655',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                }}
              >
                Clear
              </button>
            )}
          </div>
          <Button
            type="button"
            onClick={() => onOpenMapModal('skill')}
            variant="secondary"
            size="small"
            fullWidth
          >
            {skillPosition
              ? `Selected: (${Math.round(skillPosition.x * 100)}%, ${Math.round(
                  skillPosition.y * 100
                )}%)`
              : 'Select Skill Target'}
          </Button>
        </div>
      </div>

      {(startPosition || skillPosition) && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '12px',
            color: '#6a737d',
          }}
        >
          <p style={{ margin: 0 }}>
            ℹ️ Positions will be saved with Step 1
          </p>
        </div>
      )}
    </div>
  )
}

export default MapPositionSelector