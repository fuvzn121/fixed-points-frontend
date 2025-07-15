import { useState, useRef } from 'react'

interface MapPosition {
  x: number
  y: number
}

interface InteractiveMapProps {
  mapImageUrl: string
  mapName: string
  onPositionSelect?: (position: MapPosition) => void
  onSkillPositionSelect?: (position: MapPosition) => void
  startPosition?: MapPosition | null
  skillPosition?: MapPosition | null
  mode: 'start' | 'skill'
}

export default function InteractiveMap({
  mapImageUrl,
  mapName,
  onPositionSelect,
  onSkillPositionSelect,
  startPosition,
  skillPosition,
  mode
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [hoveredPosition, setHoveredPosition] = useState<MapPosition | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const position = { x, y }

    if (mode === 'start' && onPositionSelect) {
      onPositionSelect(position)
    } else if (mode === 'skill' && onSkillPositionSelect) {
      onSkillPositionSelect(position)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setHoveredPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setHoveredPosition(null)
  }

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
          fontSize: '18px',
          fontWeight: '700',
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: mode === 'start' ? '#ff4655' : '#00d4ff' }}>
            {mode === 'start' ? '📍' : '💥'}
          </span>
          {mode === 'start' ? 'Select Start Position' : 'Select Skill Target'}
          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>
            - {mapName}
          </span>
        </h3>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '100%', // 1:1 aspect ratio
          cursor: 'crosshair',
          overflow: 'hidden'
        }}
      >
        {/* Map Image */}
        <img
          src={mapImageUrl}
          alt={mapName}
          onLoad={() => setIsMapLoaded(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isMapLoaded ? 'none' : 'blur(10px)',
            transition: 'filter 0.3s ease'
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
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '10% 10%',
          pointerEvents: 'none'
        }} />

        {/* Hover Indicator */}
        {hoveredPosition && (
          <div
            style={{
              position: 'absolute',
              left: `${hoveredPosition.x * 100}%`,
              top: `${hoveredPosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: mode === 'start' 
                ? 'radial-gradient(circle, rgba(255, 70, 85, 0.8), rgba(255, 70, 85, 0.2))'
                : 'radial-gradient(circle, rgba(0, 212, 255, 0.8), rgba(0, 212, 255, 0.2))',
              border: `2px solid ${mode === 'start' ? '#ff4655' : '#00d4ff'}`,
              pointerEvents: 'none',
              animation: 'pulse 1.5s infinite',
              boxShadow: `0 0 20px ${mode === 'start' ? 'rgba(255, 70, 85, 0.6)' : 'rgba(0, 212, 255, 0.6)'}`
            }}
          />
        )}

        {/* Start Position Marker */}
        {startPosition && (
          <div
            style={{
              position: 'absolute',
              left: `${startPosition.x * 100}%`,
              top: `${startPosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#ff4655',
              border: '3px solid #ffffff',
              boxShadow: '0 4px 12px rgba(255, 70, 85, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#ffffff',
              fontWeight: 'bold',
              zIndex: 5
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
                    id="arrowhead"
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
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead)"
                  opacity="0.8"
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
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent)',
                border: '2px dashed #00d4ff',
                animation: 'rotate 10s linear infinite',
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
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#00d4ff',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 12px rgba(0, 212, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#ffffff',
                fontWeight: 'bold',
                zIndex: 5
              }}
            >
              💥
            </div>
          </>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 20px',
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        Click on the map to place {mode === 'start' ? 'your starting position' : 'the skill target location'}
      </div>

      {/* Add keyframe animations */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
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