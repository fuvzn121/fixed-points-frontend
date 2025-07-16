import { useState, useEffect } from 'react'
import { MapPosition, FixedPoint } from './models'
import { useAuth } from './hooks/useAuth'
import { useFixedPoints } from './hooks/useFixedPoints'
import { fixedPointsService, CreateFixedPointData } from './services/fixedPoints.service'
import MainLayout from './components/layout/MainLayout'
import Header from './components/common/Header'
import StatusMessage from './components/common/StatusMessage'
import Button from './components/common/Button'
import UserInfo from './components/auth/UserInfo'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import FixedPointList from './components/fixed-points/FixedPointList'
import FixedPointDetail from './components/fixed-points/FixedPointDetail'
import CreateFixedPointForm from './components/fixed-points/CreateFixedPointForm'
import InteractiveMap from './InteractiveMap'

function App() {
  // Auth state
  const {
    currentUser,
    accessToken,
    isLoading: authLoading,
    apiStatus: authApiStatus,
    handleLogin,
    handleRegister,
    handleLogout,
    setApiStatus: setAuthApiStatus,
  } = useAuth()

  // Fixed points state
  const {
    fixedPoints,
    agents,
    maps,
    isLoading: fixedPointsLoading,
    apiStatus: fixedPointsApiStatus,
    fetchFixedPoints,
    toggleFavorite,
    processImageUrl,
    setApiStatus: setFixedPointsApiStatus,
  } = useFixedPoints(accessToken)

  // UI state
  const [showData, setShowData] = useState<'none' | 'fixed-points' | 'create-fixed-point'>('none')
  const [showAuth, setShowAuth] = useState<'none' | 'login' | 'register'>('none')
  const [selectedFixedPoint, setSelectedFixedPoint] = useState<FixedPoint | null>(null)
  
  // Form state
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [selectedMap, setSelectedMap] = useState<string>('')
  const [startPosition, setStartPosition] = useState<MapPosition | null>(null)
  const [skillPosition, setSkillPosition] = useState<MapPosition | null>(null)
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapMode, setMapMode] = useState<'start' | 'skill'>('start')
  const [isCreating, setIsCreating] = useState(false)

  // Combine API statuses
  const apiStatus = authApiStatus || fixedPointsApiStatus

  // Auto-hide API status messages
  useEffect(() => {
    if (apiStatus) {
      const timer = setTimeout(() => {
        if (authApiStatus) setAuthApiStatus(null)
        if (fixedPointsApiStatus) setFixedPointsApiStatus(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [apiStatus, authApiStatus, fixedPointsApiStatus, setAuthApiStatus, setFixedPointsApiStatus])

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMapModal) {
        setShowMapModal(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showMapModal])

  // Load initial styles
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      input::placeholder,
      textarea::placeholder {
        color: rgba(255, 255, 255, 0.6) !important;
        opacity: 1 !important;
      }
      input:focus::placeholder,
      textarea:focus::placeholder {
        color: rgba(255, 255, 255, 0.4) !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await handleLogin({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (currentUser) {
      setShowAuth('none')
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await handleRegister({
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    // Switch to login form after successful registration
    const status = authApiStatus
    if (status && !status.isError) {
      setShowAuth('login')
    }
  }

  const handleFetchFixedPoints = async () => {
    setShowData('fixed-points')
    await fetchFixedPoints()
  }

  const handleViewDetail = async (fixedPointId: number) => {
    try {
      const detail = await fixedPointsService.getById(fixedPointId, accessToken)
      setSelectedFixedPoint(detail)
      setShowData('none')
    } catch (error) {
      setFixedPointsApiStatus({
        message: 'Failed to load fixed point details',
        isError: true,
      })
    }
  }

  const handleCreateFixedPoint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!accessToken) {
      setFixedPointsApiStatus({
        message: 'Login required to post fixed points',
        isError: true,
      })
      return
    }

    setIsCreating(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    // Validation
    if (!selectedAgent || !selectedMap) {
      setFixedPointsApiStatus({
        message: 'Please select an agent and map',
        isError: true,
      })
      setIsCreating(false)
      return
    }

    try {
      // Collect step data
      const steps = []
      for (let i = 1; i <= 5; i++) {
        const description = formData.get(`step${i}_description`) as string
        const imageFile = formData.get(`step${i}_image`) as File

        if (description || (imageFile && imageFile.size > 0)) {
          let imageUrl = null

          // Upload image if present
          if (imageFile && imageFile.size > 0) {
            imageUrl = await fixedPointsService.uploadImage(imageFile, accessToken)
          }

          const stepData: any = {
            step_order: i,
            description: description || '',
            image_url: imageUrl,
          }

          // Add position data to first step
          if (i === 1) {
            if (startPosition) {
              stepData.position_x = startPosition.x
              stepData.position_y = startPosition.y
            }
            if (skillPosition) {
              stepData.skill_position_x = skillPosition.x
              stepData.skill_position_y = skillPosition.y
            }
          }

          steps.push(stepData)
        }
      }

      if (steps.length === 0) {
        setFixedPointsApiStatus({
          message: 'Please provide at least one step',
          isError: true,
        })
        setIsCreating(false)
        return
      }

      const requestData: CreateFixedPointData = {
        title: formData.get('title') as string,
        character_id: selectedAgent,
        map_id: selectedMap,
        steps: steps,
      }

      await fixedPointsService.create(requestData, accessToken)

      setFixedPointsApiStatus({
        message: 'Fixed point posted successfully!',
        isError: false,
      })

      // Reset form
      form.reset()
      setSelectedAgent('')
      setSelectedMap('')
      setStartPosition(null)
      setSkillPosition(null)

      // Reload fixed points list
      await fetchFixedPoints()
      setShowData('fixed-points')
    } catch (error) {
      setFixedPointsApiStatus({
        message: error instanceof Error ? error.message : 'Fixed point posting error',
        isError: true,
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenMapModal = (mode: 'start' | 'skill') => {
    setMapMode(mode)
    setShowMapModal(true)
  }

  const handleClearPosition = (type: 'start' | 'skill') => {
    if (type === 'start') {
      setStartPosition(null)
    } else {
      setSkillPosition(null)
    }
  }

  const isLoading = authLoading || fixedPointsLoading || isCreating

  return (
    <MainLayout>
      <Header />

      {/* User authentication section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        {currentUser ? (
          <UserInfo user={currentUser} onLogout={handleLogout} />
        ) : (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button
              onClick={() => setShowAuth(showAuth === 'login' ? 'none' : 'login')}
              variant="secondary"
            >
              Login
            </Button>
            <Button
              onClick={() => setShowAuth(showAuth === 'register' ? 'none' : 'register')}
              variant="primary"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        <Button
          onClick={handleFetchFixedPoints}
          disabled={isLoading}
          variant="primary"
          size="large"
          loading={fixedPointsLoading}
        >
          📋 Fixed Points
        </Button>
        {currentUser && (
          <Button
            onClick={() => setShowData('create-fixed-point')}
            variant="accent"
            size="large"
          >
            ✨ New Fixed Point
          </Button>
        )}
      </div>

      {/* API Status */}
      <StatusMessage status={apiStatus} />

      {/* Auth forms */}
      {showAuth === 'login' && (
        <LoginForm onSubmit={handleLoginSubmit} isLoading={authLoading} />
      )}
      {showAuth === 'register' && (
        <RegisterForm onSubmit={handleRegisterSubmit} isLoading={authLoading} />
      )}

      {/* Fixed point detail view */}
      {selectedFixedPoint && (
        <FixedPointDetail
          fixedPoint={selectedFixedPoint}
          agents={agents}
          maps={maps}
          onBack={() => setSelectedFixedPoint(null)}
          processImageUrl={processImageUrl}
        />
      )}

      {/* Fixed points list */}
      {showData === 'fixed-points' && !selectedFixedPoint && (
        <FixedPointList
          fixedPoints={fixedPoints}
          agents={agents}
          maps={maps}
          onFavoriteToggle={toggleFavorite}
          onViewDetail={handleViewDetail}
          isAuthenticated={!!currentUser}
          isLoading={fixedPointsLoading}
        />
      )}

      {/* Create fixed point form */}
      {showData === 'create-fixed-point' && currentUser && (
        <div>
          <h2
            style={{
              fontSize: '28px',
              marginBottom: '24px',
              color: '#ff4655',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textAlign: 'center',
            }}
          >
            Create New Fixed Point
          </h2>
          <CreateFixedPointForm
            agents={agents}
            maps={maps}
            onSubmit={handleCreateFixedPoint}
            isLoading={isCreating}
            selectedAgent={selectedAgent}
            selectedMap={selectedMap}
            onAgentChange={setSelectedAgent}
            onMapChange={setSelectedMap}
            startPosition={startPosition}
            skillPosition={skillPosition}
            onOpenMapModal={handleOpenMapModal}
            onClearPosition={handleClearPosition}
          />
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && selectedMap && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowMapModal(false)}
        >
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMapModal(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              ✕ Close (ESC)
            </button>
            <InteractiveMap
              mapImageUrl={maps.find((m) => m.uuid === selectedMap)?.splash || ''}
              mapName={maps.find((m) => m.uuid === selectedMap)?.displayName || ''}
              onPositionSelect={(position) => {
                if (mapMode === 'start') {
                  setStartPosition(position)
                }
                setShowMapModal(false)
              }}
              onSkillPositionSelect={(position) => {
                if (mapMode === 'skill') {
                  setSkillPosition(position)
                }
                setShowMapModal(false)
              }}
              startPosition={startPosition}
              skillPosition={skillPosition}
              mode={mapMode}
            />
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default App