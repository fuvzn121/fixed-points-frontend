import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered ? '#ff4655' : 'rgba(255, 70, 85, 0.1)',
          color: isHovered ? 'white' : '#ff4655',
          border: '1px solid #ff4655',
        }
      case 'secondary':
        return {
          backgroundColor: isHovered ? '#00d4ff' : 'rgba(0, 212, 255, 0.1)',
          color: isHovered ? 'white' : '#00d4ff',
          border: '1px solid #00d4ff',
        }
      case 'accent':
        return {
          backgroundColor: isHovered ? '#9f7aea' : 'rgba(159, 122, 234, 0.1)',
          color: isHovered ? 'white' : '#9f7aea',
          border: '1px solid #9f7aea',
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { padding: '8px 16px', fontSize: '14px' }
      case 'medium':
        return { padding: '12px 24px', fontSize: '16px' }
      case 'large':
        return { padding: '16px 32px', fontSize: '16px', minWidth: '180px' }
    }
  }

  const baseStyles: React.CSSProperties = {
    borderRadius: size === 'large' ? '10px' : '8px',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    opacity: loading || disabled ? 0.6 : 1,
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(5px)',
    transform: isHovered && !loading && !disabled ? 'translateY(-2px)' : 'translateY(0)',
    width: fullWidth ? '100%' : 'auto',
    boxShadow: size === 'large' 
      ? `0 4px 15px ${variant === 'primary' ? 'rgba(255, 70, 85, 0.2)' : variant === 'secondary' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(159, 122, 234, 0.2)'}`
      : undefined,
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={baseStyles}
      onMouseEnter={(e) => {
        setIsHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setIsHovered(false)
        onMouseLeave?.(e)
      }}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button