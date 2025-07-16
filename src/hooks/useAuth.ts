import { useState, useEffect, useCallback } from 'react'
import { User, ApiStatus } from '../types'
import { authService, LoginData, RegisterData } from '../services/auth.service'

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('access_token')
  )
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)

  useEffect(() => {
    if (accessToken) {
      authService
        .getCurrentUser(accessToken)
        .then(setCurrentUser)
        .catch(() => {
          // Token might be invalid
          handleLogout()
        })
    }
  }, [accessToken])

  const handleLogin = useCallback(async (data: LoginData) => {
    setIsLoading(true)
    try {
      const response = await authService.login(data)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
      setAccessToken(response.access_token)
      
      const user = await authService.getCurrentUser(response.access_token)
      setCurrentUser(user)
      
      setApiStatus({
        message: 'Successfully logged in!',
        isError: false,
      })
    } catch (error) {
      setApiStatus({
        message: 'Login failed. Please check your email and password.',
        isError: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRegister = useCallback(async (data: RegisterData) => {
    setIsLoading(true)
    try {
      await authService.register(data)
      setApiStatus({
        message: 'Account created successfully! Please log in.',
        isError: false,
      })
    } catch (error) {
      setApiStatus({
        message: error instanceof Error ? error.message : 'Registration failed',
        isError: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLogout = useCallback(() => {
    authService.logout()
    setAccessToken(null)
    setCurrentUser(null)
    setApiStatus({
      message: 'Successfully logged out',
      isError: false,
    })
  }, [])

  return {
    currentUser,
    accessToken,
    isLoading,
    apiStatus,
    handleLogin,
    handleRegister,
    handleLogout,
    setApiStatus,
  }
}