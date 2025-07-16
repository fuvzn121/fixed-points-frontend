import React from 'react'
import { Agent } from '../../types'

interface AgentSelectorProps {
  agents: Agent[]
  selectedAgent: string
  onAgentSelect: (agentId: string) => void
  processImageUrl: (url: string) => string
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  onAgentSelect,
  processImageUrl,
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ 
        fontSize: '18px', 
        fontWeight: '700', 
        color: '#ff4655',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        display: 'block',
        marginBottom: '16px'
      }}>
        Select Agent <span style={{ color: '#ff4655' }}>*</span>
      </label>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
        gap: '16px',
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {agents.map(agent => (
          <div
            key={agent.uuid}
            onClick={() => onAgentSelect(agent.uuid)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '12px',
              overflow: 'hidden',
              border: selectedAgent === agent.uuid ? '3px solid #ff4655' : '2px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
              backfaceVisibility: 'hidden',
              transform: selectedAgent === agent.uuid ? 'scale(1.05) translateZ(0)' : 'scale(1) translateZ(0)',
              boxShadow: selectedAgent === agent.uuid ? '0 0 20px rgba(255, 70, 85, 0.5)' : '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (selectedAgent !== agent.uuid) {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedAgent !== agent.uuid) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <img
              src={processImageUrl(agent.displayIcon)}
              alt={agent.displayName}
              loading="lazy"
              style={{
                width: '100%',
                height: '80px',
                objectFit: 'cover',
                display: 'block',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            />
            <div style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              background: 'rgba(0, 0, 0, 0.7)'
            }}>
              {agent.displayName}
            </div>
            {selectedAgent === agent.uuid && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ff4655',
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

export default AgentSelector