import React from 'react'

interface StepInputProps {
  stepNumber: number
  preview?: string
  dragActive?: boolean
  onFileChange: (stepNumber: number, file: File | null) => void
  onDrag: (e: React.DragEvent, stepNumber: number) => void
  onDrop: (e: React.DragEvent, stepNumber: number) => void
}

const StepInput: React.FC<StepInputProps> = ({
  stepNumber,
  preview,
  dragActive = false,
  onFileChange,
  onDrag,
  onDrop,
}) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        padding: '24px',
        border: `1px solid ${dragActive ? '#ff4655' : 'rgba(255, 255, 255, 0.1)'}`,
        transition: 'all 0.3s ease',
      }}
    >
      <h4
        style={{
          margin: '0 0 16px 0',
          color: '#ff4655',
          fontSize: '16px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        Step {stepNumber}
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Description input */}
        <div>
          <label
            htmlFor={`step${stepNumber}_description`}
            style={{
              display: 'block',
              marginBottom: '8px',
              color: '#b0b8c1',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Description
          </label>
          <textarea
            id={`step${stepNumber}_description`}
            name={`step${stepNumber}_description`}
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#ffffff',
              resize: 'vertical',
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

        {/* Image upload */}
        <div>
          <label
            htmlFor={`step${stepNumber}_image`}
            style={{
              display: 'block',
              marginBottom: '8px',
              color: '#b0b8c1',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Screenshot
          </label>
          <div
            onDragEnter={(e) => onDrag(e, stepNumber)}
            onDragLeave={(e) => onDrag(e, stepNumber)}
            onDragOver={(e) => onDrag(e, stepNumber)}
            onDrop={(e) => onDrop(e, stepNumber)}
            style={{
              position: 'relative',
              border: `2px dashed ${dragActive ? '#ff4655' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: '8px',
              padding: preview ? '0' : '40px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              background: dragActive ? 'rgba(255, 70, 85, 0.05)' : 'transparent',
              overflow: 'hidden',
            }}
          >
            {preview ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={preview}
                  alt={`Step ${stepNumber} preview`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '6px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    onFileChange(stepNumber, null)
                    const input = document.getElementById(`step${stepNumber}_image`) as HTMLInputElement
                    if (input) input.value = ''
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(255, 70, 85, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ff4655'
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 70, 85, 0.9)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id={`step${stepNumber}_image`}
                  name={`step${stepNumber}_image`}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    onFileChange(stepNumber, file)
                  }}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor={`step${stepNumber}_image`}
                  style={{
                    cursor: 'pointer',
                    color: dragActive ? '#ff4655' : '#8a919e',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>📸</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Drag & drop or click to upload
                  </p>
                </label>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepInput