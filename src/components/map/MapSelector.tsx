import React from 'react'
import { Map } from '../../types'

interface MapSelectorProps {
  maps: Map[]
  selectedMap: string
  onMapSelect: (mapId: string) => void
  processImageUrl: (url: string) => string
}

const MapSelector: React.FC<MapSelectorProps> = ({
  maps,
  selectedMap,
  onMapSelect,
  processImageUrl,
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ 
        fontSize: '18px', 
        fontWeight: '700', 
        color: '#00d4ff',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        display: 'block',
        marginBottom: '16px'
      }}>
        Select Map <span style={{ color: '#00d4ff' }}>*</span>
      </label>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '16px',
        maxHeight: '500px',
        overflowY: 'auto',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        willChange: 'scroll-position',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}>
        {maps.map(map => (
          <div
            key={map.uuid}
            onClick={() => onMapSelect(map.uuid)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '12px',
              overflow: 'hidden',
              border: selectedMap === map.uuid ? '3px solid #00d4ff' : '2px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
              backfaceVisibility: 'hidden',
              transform: selectedMap === map.uuid ? 'scale(1.05) translateZ(0)' : 'scale(1) translateZ(0)',
              boxShadow: selectedMap === map.uuid ? '0 0 20px rgba(0, 212, 255, 0.5)' : '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (selectedMap !== map.uuid) {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedMap !== map.uuid) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <img
              src={processImageUrl(map.splash)}
              alt={map.displayName}
              loading="lazy"
              style={{
                width: '100%',
                height: '100px',
                objectFit: 'cover',
                display: 'block',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            />
            <div style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              background: 'rgba(0, 0, 0, 0.7)'
            }}>
              {map.displayName}
            </div>
            {selectedMap === map.uuid && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#00d4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MapSelector