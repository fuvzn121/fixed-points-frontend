import React from 'react'
import { FixedPoint, Agent, Map } from '../../types'
import Button from '../common/Button'
import MapDisplay from '../../MapDisplay'

interface FixedPointDetailProps {
  fixedPoint: FixedPoint
  agents: Agent[]
  maps: Map[]
  onBack: () => void
  processImageUrl: (url: string) => string
}

const FixedPointDetail: React.FC<FixedPointDetailProps> = ({
  fixedPoint,
  agents,
  maps,
  onBack,
  processImageUrl,
}) => {
  const agent = agents.find((a) => a.uuid === fixedPoint.character_id)
  const map = maps.find((m) => m.uuid === fixedPoint.map_id)
  
  // デバッグ用
  console.log('Fixed point detail:', fixedPoint)
  console.log('Steps:', fixedPoint.steps)

  // Get the first step with position data
  const firstStep = fixedPoint.steps?.[0]
  const hasMapData = firstStep && (
    (firstStep.position_x !== null && firstStep.position_y !== null) ||
    (firstStep.skill_position_x !== null && firstStep.skill_position_y !== null)
  )

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Back button */}
      <Button onClick={onBack} variant="secondary" size="medium" style={{ marginBottom: '24px' }}>
        ← Back to List
      </Button>

      {/* Title and meta info */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            margin: '0 0 20px 0',
            fontSize: '32px',
            color: '#ffffff',
            fontWeight: '700',
          }}
        >
          {fixedPoint.title}
        </h2>
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {agent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={processImageUrl(agent.displayIcon)}
                alt={agent.displayName}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              />
              <div>
                <p style={{ margin: 0, color: '#b0b8c1', fontSize: '14px' }}>Agent</p>
                <p style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
                  {agent.displayName}
                </p>
              </div>
            </div>
          )}
          
          {map && (
            <div>
              <p style={{ margin: 0, color: '#b0b8c1', fontSize: '14px' }}>Map</p>
              <p style={{ margin: 0, color: '#00d4ff', fontSize: '18px', fontWeight: '600' }}>
                📍 {map.displayName}
              </p>
            </div>
          )}
          
          <div>
            <p style={{ margin: 0, color: '#b0b8c1', fontSize: '14px' }}>Posted by</p>
            <p style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
              {fixedPoint.username}
            </p>
          </div>
          
          <div>
            <p style={{ margin: 0, color: '#b0b8c1', fontSize: '14px' }}>Date</p>
            <p style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
              {new Date(fixedPoint.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Map Display */}
      {hasMapData && map && (
        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{
              margin: '0 0 16px 0',
              color: '#00d4ff',
              fontSize: '20px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Position Overview
          </h3>
          <MapDisplay
            mapImageUrl={processImageUrl(map.displayIcon)}
            mapName={map.displayName}
            startPosition={
              firstStep.position_x !== null && firstStep.position_y !== null
                ? { x: firstStep.position_x, y: firstStep.position_y }
                : null
            }
            skillPosition={
              firstStep.skill_position_x !== null && firstStep.skill_position_y !== null
                ? { x: firstStep.skill_position_x, y: firstStep.skill_position_y }
                : null
            }
          />
        </div>
      )}

      {/* Steps */}
      {fixedPoint.steps && fixedPoint.steps.length > 0 && (
        <div>
          <h3
            style={{
              margin: '0 0 24px 0',
              color: '#ff4655',
              fontSize: '24px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Steps
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {fixedPoint.steps.map((step) => {
              console.log(`Rendering step ${step.step_order}:`, step)
              return (
              <div
                key={step.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 16px 0',
                    color: '#ff4655',
                    fontSize: '18px',
                    fontWeight: '600',
                  }}
                >
                  Step {step.step_order}
                </h4>
                
                {step.description && (
                  <p
                    style={{
                      margin: '0 0 16px 0',
                      color: '#ffffff',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {step.description}
                  </p>
                )}
                
                {step.image_url && (
                  <img
                    src={processImageUrl(step.image_url)}
                    alt={`Step ${step.step_order}`}
                      onError={(e) => {
                        console.error('Failed to load step image:', step.image_url)
                        console.error('Processed URL:', processImageUrl(step.image_url))
                        console.error('Image element:', e.currentTarget)
                      }}
                    style={{
                      width: '100%',
                      maxWidth: '800px',
                      height: 'auto',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                )}
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  )
}

export default FixedPointDetail