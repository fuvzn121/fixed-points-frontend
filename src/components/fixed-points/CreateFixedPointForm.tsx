import React, { useState } from 'react'
import { Agent, Map, MapPosition } from '../../types'
import Button from '../common/Button'
import StepInput from './StepInput'
import MapPositionSelector from './MapPositionSelector'
import AgentSelector from '../agent/AgentSelector'
import MapSelector from '../map/MapSelector'
import { processImageUrl } from '../../utils/imageUrl'

interface CreateFixedPointFormProps {
  agents: Agent[]
  maps: Map[]
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  isLoading: boolean
  selectedAgent: string
  selectedMap: string
  onAgentChange: (agentId: string) => void
  onMapChange: (mapId: string) => void
  startPosition: MapPosition | null
  skillPosition: MapPosition | null
  onOpenMapModal: (mode: 'start' | 'skill') => void
  onClearPosition: (type: 'start' | 'skill') => void
}

const CreateFixedPointForm: React.FC<CreateFixedPointFormProps> = ({
  agents,
  maps,
  onSubmit,
  isLoading,
  selectedAgent,
  selectedMap,
  onAgentChange,
  onMapChange,
  startPosition,
  skillPosition,
  onOpenMapModal,
  onClearPosition,
}) => {
  const [stepPreviews, setStepPreviews] = useState<{ [key: number]: string }>({})
  const [dragActive, setDragActive] = useState<{ [key: number]: boolean }>({})

  const handleFileChange = (stepNumber: number, file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setStepPreviews((prev) => ({ ...prev, [stepNumber]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } else if (!file) {
      setStepPreviews((prev) => {
        const newPreviews = { ...prev }
        delete newPreviews[stepNumber]
        return newPreviews
      })
    }
  }

  const handleDrag = (e: React.DragEvent, stepNumber: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive((prev) => ({ ...prev, [stepNumber]: true }))
    } else if (e.type === 'dragleave') {
      setDragActive((prev) => ({ ...prev, [stepNumber]: false }))
    }
  }

  const handleDrop = (e: React.DragEvent, stepNumber: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive((prev) => ({ ...prev, [stepNumber]: false }))

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileChange(stepNumber, file)
      // Set file to input element
      const input = document.getElementById(`step${stepNumber}_image`) as HTMLInputElement
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
      }
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Input */}
      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="title"
          style={{
            display: 'block',
            marginBottom: '8px',
            color: '#b0b8c1',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={100}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '16px',
            color: '#ffffff',
            outline: 'none',
            transition: 'all 0.3s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#ff4655'
            e.target.style.boxShadow = '0 0 0 3px rgba(255, 70, 85, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Agent Selector */}
      <AgentSelector
        agents={agents}
        selectedAgent={selectedAgent}
        onAgentSelect={onAgentChange}
        processImageUrl={processImageUrl}
      />

      {/* Map Selector */}
      <MapSelector
        maps={maps}
        selectedMap={selectedMap}
        onMapSelect={onMapChange}
        processImageUrl={processImageUrl}
      />

      {/* Map Position Selector */}
      {selectedMap && (
        <MapPositionSelector
          startPosition={startPosition}
          skillPosition={skillPosition}
          onOpenMapModal={onOpenMapModal}
          onClearPosition={onClearPosition}
        />
      )}

      {/* Steps */}
      <div>
        <h3
          style={{
            margin: '0 0 20px 0',
            color: '#ff4655',
            fontSize: '20px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Steps
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <StepInput
              key={stepNumber}
              stepNumber={stepNumber}
              preview={stepPreviews[stepNumber]}
              dragActive={dragActive[stepNumber]}
              onFileChange={handleFileChange}
              onDrag={handleDrag}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Button type="submit" variant="accent" size="large" loading={isLoading}>
          {isLoading ? 'Posting...' : '✨ Post Fixed Point'}
        </Button>
      </div>
    </form>
  )
}

export default CreateFixedPointForm