import React from 'react'
import Button from '../common/Button'

interface RegisterFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  isLoading: boolean
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading }) => {
  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '32px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <h2
        style={{
          fontSize: '28px',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#ff4655',
          fontWeight: '700',
          letterSpacing: '1px',
        }}
      >
        SIGN UP
      </h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label
            htmlFor="username"
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
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={50}
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
        <div>
          <label
            htmlFor="email"
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
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
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
        <div>
          <label
            htmlFor="password"
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
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
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
        <Button
          type="submit"
          variant="primary"
          size="medium"
          fullWidth
          loading={isLoading}
          style={{ marginTop: '8px' }}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
    </div>
  )
}

export default RegisterForm