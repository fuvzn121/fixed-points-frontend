import { useRef, useEffect } from 'react'

interface MapPosition {
  x: number
  y: number
}

interface MapDisplayProps {
  mapImageUrl: string
  mapName: string
  startPosition?: MapPosition | null
  skillPosition?: MapPosition | null
}

export default function MapDisplay({
  mapImageUrl,
  mapName,
  startPosition,
  skillPosition
}: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Map Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '12px 20px',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
        zIndex: 10
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '700',
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#ff4655' }}>🗺️</span>
          FIXED POINT LOCATION
          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>
            - {mapName}
          </span>
        </h3>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '100%', // 1:1 aspect ratio
          overflow: 'hidden'
        }}
      >
        {/* Map Image */}
        <img
          src={mapImageUrl}
          alt={mapName}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Grid Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '10% 10%',
          pointerEvents: 'none'
        }} />

        {/* Start Position Marker */}
        {startPosition && (
          <div
            style={{
              position: 'absolute',
              left: `${startPosition.x * 100}%`,
              top: `${startPosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#ff4655',
              border: '3px solid #ffffff',
              boxShadow: '0 4px 12px rgba(255, 70, 85, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: '#ffffff',
              fontWeight: 'bold',
              zIndex: 5,
              animation: 'pulse 2s infinite'
            }}
          >
            📍
          </div>
        )}

        {/* Skill Position Marker */}
        {skillPosition && (
          <>
            {/* Line from start to skill */}
            {startPosition && (
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 3
                }}
              >
                <defs>
                  <marker
                    id="arrowhead-display"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#00d4ff"
                    />
                  </marker>
                </defs>
                <line
                  x1={`${startPosition.x * 100}%`}
                  y1={`${startPosition.y * 100}%`}
                  x2={`${skillPosition.x * 100}%`}
                  y2={`${skillPosition.y * 100}%`}
                  stroke="#00d4ff"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  markerEnd="url(#arrowhead-display)"
                  opacity="0.9"
                />
              </svg>
            )}

            {/* Skill impact area */}
            <div
              style={{
                position: 'absolute',
                left: `${skillPosition.x * 100}%`,
                top: `${skillPosition.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 212, 255, 0.4), transparent)',
                border: '2px dashed #00d4ff',
                animation: 'rotate 8s linear infinite',
                zIndex: 4
              }}
            />

            {/* Skill center marker */}
            <div
              style={{
                position: 'absolute',
                left: `${skillPosition.x * 100}%`,
                top: `${skillPosition.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#00d4ff',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 12px rgba(0, 212, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#ffffff',
                fontWeight: 'bold',
                zIndex: 5,
                animation: 'pulse 2s infinite'
              }}
            >
              💥
            </div>
          </>
        )}

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ff4655', fontSize: '14px' }}>📍</span>
            <span>Starting Position</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00d4ff', fontSize: '14px' }}>💥</span>
            <span>Skill Target</span>
          </div>
        </div>
      </div>

      {/* Add keyframe animations */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes rotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}