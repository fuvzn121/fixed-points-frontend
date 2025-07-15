import { useState, useEffect } from 'react'
import InteractiveMap from './InteractiveMap'
import MapDisplay from './MapDisplay'

interface User {
  id: number
  username: string
  email: string
  auth_provider: string
  avatar_url?: string
  created_at: string
}

interface Agent {
  uuid: string
  displayName: string
  description: string
  displayIcon: string
  role: {
    uuid: string
    displayName: string
  } | null
}

interface Map {
  uuid: string
  displayName: string
  coordinates: string
  displayIcon: string
  splash: string
}

interface FixedPointStep {
  id: number
  fixed_point_id: number
  step_order: number
  image_url?: string
  description?: string
  position_x?: number
  position_y?: number
  skill_position_x?: number
  skill_position_y?: number
  created_at: string
}

interface FixedPoint {
  id: number
  user_id: number
  title: string
  character_id: string
  map_id: string
  created_at: string
  updated_at?: string
  steps?: FixedPointStep[]
  favorites_count: number
  is_favorited: boolean
  username: string
}

function App() {
  // 画像URLを処理するヘルパー関数
  const processImageUrl = (url: string) => {
    if (!url) return url
    // ローカルパス（/static/で始まる）の場合はAPIのベースURLを追加
    if (url.startsWith('/static/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      return `${apiUrl}${url}`
    }
    return url
  }

  // プレースホルダーのグローバルスタイルを適用
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

  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<{ message: string; isError: boolean } | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [maps, setMaps] = useState<Map[]>([])
  const [showData, setShowData] = useState<'none' | 'fixed-points' | 'create-fixed-point'>('none')
  const [showAuth, setShowAuth] = useState<'none' | 'login' | 'register'>('none')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [fixedPoints, setFixedPoints] = useState<FixedPoint[]>([])
  const [selectedFixedPoint, setSelectedFixedPoint] = useState<FixedPoint | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [selectedMap, setSelectedMap] = useState<string>('')
  const [stepPreviews, setStepPreviews] = useState<{ [key: number]: string }>({})
  const [dragActive, setDragActive] = useState<{ [key: number]: boolean }>({})
  // マップ座標情報（定点全体で1つ）
  const [startPosition, setStartPosition] = useState<{ x: number; y: number } | null>(null)
  const [skillPosition, setSkillPosition] = useState<{ x: number; y: number } | null>(null)
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapMode, setMapMode] = useState<'start' | 'skill'>('start')

  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMapModal) {
        setShowMapModal(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [showMapModal])

  // モーダルが開いたときのbodyスクロール制御
  useEffect(() => {
    if (showMapModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMapModal])

  // ファイルハンドリング関数
  const handleFileChange = (stepNumber: number, file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setStepPreviews(prev => ({ ...prev, [stepNumber]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } else if (!file) {
      setStepPreviews(prev => {
        const newPreviews = { ...prev }
        delete newPreviews[stepNumber]
        return newPreviews
      })
    }
  }

  const handleDrag = (e: React.DragEvent, stepNumber: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [stepNumber]: true }))
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [stepNumber]: false }))
    }
  }

  const handleDrop = (e: React.DragEvent, stepNumber: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [stepNumber]: false }))
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileChange(stepNumber, file)
      // inputタグにもファイルをセット
      const input = document.getElementById(`step${stepNumber}_image`) as HTMLInputElement
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
      }
    }
  }


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        setAccessToken(data.access_token)
        setShowAuth('none')
        setApiStatus({
          message: 'Successfully logged in!',
          isError: false
        })
        fetchCurrentUser(data.access_token)
      } else {
        setApiStatus({
          message: 'Login failed. Please check your email and password.',
          isError: true
        })
      }
    } catch (error) {
      setApiStatus({
        message: 'Login error',
        isError: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password')
        })
      })
      
      if (response.ok) {
        setShowAuth('login')
        setApiStatus({
          message: 'Account created successfully! Please log in.',
          isError: false
        })
      } else {
        const data = await response.json()
        setApiStatus({
          message: data.detail || 'Account creation failed',
          isError: true
        })
      }
    } catch (error) {
      setApiStatus({
        message: 'Registration error',
        isError: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCurrentUser = async (token?: string) => {
    const authToken = token || accessToken
    if (!authToken) return
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setAccessToken(null)
    setCurrentUser(null)
    setApiStatus({
      message: 'Successfully logged out',
      isError: false
    })
  }

  const fetchFixedPoints = async () => {
    setIsLoading(true)
    setShowData('fixed-points')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const headers: HeadersInit = {}
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
      
      const response = await fetch(`${apiUrl}/api/fixed-points/`, { headers })
      const data = await response.json()
      
      if (response.ok) {
        setFixedPoints(data)
        setApiStatus({
          message: `Successfully loaded ${data.length} fixed points!`,
          isError: false
        })
      } else {
        setApiStatus({
          message: 'Failed to load fixed points',
          isError: true
        })
      }
    } catch (error) {
      console.error('Error fetching fixed points:', error)
      setApiStatus({
        message: 'Fixed points loading error',
        isError: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (fixedPointId: number, isFavorited: boolean) => {
    if (!accessToken) {
      setApiStatus({
        message: 'Login required for favorites',
        isError: true
      })
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const method = isFavorited ? 'DELETE' : 'POST'
      const response = await fetch(`${apiUrl}/api/fixed-points/${fixedPointId}/favorite`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        // 定点リストを更新
        setFixedPoints(prevPoints => 
          prevPoints.map(point => 
            point.id === fixedPointId 
              ? {
                  ...point,
                  is_favorited: !isFavorited,
                  favorites_count: isFavorited ? point.favorites_count - 1 : point.favorites_count + 1
                }
              : point
          )
        )
        setApiStatus({
          message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
          isError: false
        })
      }
    } catch (error) {
      setApiStatus({
        message: 'Favorite operation error',
        isError: true
      })
    }
  }

  const fetchFixedPointDetail = async (fixedPointId: number) => {
    setIsLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const headers: HeadersInit = {}
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
      
      const response = await fetch(`${apiUrl}/api/fixed-points/${fixedPointId}`, { headers })
      const data = await response.json()
      
      if (response.ok) {
        setSelectedFixedPoint(data)
        setShowData('none')
      } else {
        setApiStatus({
          message: 'Failed to load fixed point details',
          isError: true
        })
      }
    } catch (error) {
      console.error('Error fetching fixed point detail:', error)
      setApiStatus({
        message: 'Fixed point details loading error',
        isError: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createFixedPoint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!accessToken) {
      setApiStatus({
        message: 'Login required to post fixed points',
        isError: true
      })
      return
    }

    setIsLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    
    // バリデーション
    if (!selectedAgent) {
      setApiStatus({
        message: 'Please select an agent',
        isError: true
      })
      setIsLoading(false)
      return
    }
    
    if (!selectedMap) {
      setApiStatus({
        message: 'Please select a map',
        isError: true
      })
      setIsLoading(false)
      return
    }
    
    // ステップデータを収集
    const steps = []
    for (let i = 1; i <= 5; i++) {
      const description = formData.get(`step${i}_description`)
      const imageFile = formData.get(`step${i}_image`) as File
      
      if (description || (imageFile && imageFile.size > 0)) {
        let imageUrl = null
        
        // 画像がある場合はアップロード
        if (imageFile && imageFile.size > 0) {
          try {
            const uploadFormData = new FormData()
            uploadFormData.append('file', imageFile)
            
            const uploadResponse = await fetch(`${apiUrl}/api/upload/image`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`
              },
              body: uploadFormData
            })
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json()
              imageUrl = uploadData.url
            } else {
              setApiStatus({
                message: `Failed to upload image for step ${i}`,
                isError: true
              })
              setIsLoading(false)
              return
            }
          } catch (error) {
            setApiStatus({
              message: 'Image upload error',
              isError: true
            })
            setIsLoading(false)
            return
          }
        }
        
        const stepData = {
          step_order: i,
          description: description || '',
          image_url: imageUrl,
          // 最初のステップに座標情報を追加
          ...(i === 1 && startPosition ? {
            position_x: startPosition.x,
            position_y: startPosition.y
          } : {}),
          ...(i === 1 && skillPosition ? {
            skill_position_x: skillPosition.x,
            skill_position_y: skillPosition.y
          } : {})
        }
        
        if (i === 1) {
          console.log('Step 1 data with positions:', stepData)
          console.log('Start position:', startPosition)
          console.log('Skill position:', skillPosition)
        }
        
        steps.push(stepData)
      }
    }

    if (steps.length === 0) {
      setApiStatus({
        message: 'Please provide at least one step',
        isError: true
      })
      setIsLoading(false)
      return
    }

    const requestData = {
      title: formData.get('title'),
      character_id: selectedAgent,
      map_id: selectedMap,
      steps: steps
    }
    console.log('Sending fixed point data:', requestData)
    
    try {
      const response = await fetch(`${apiUrl}/api/fixed-points/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestData)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        setApiStatus({
          message: 'Fixed point posted successfully!',
          isError: false
        })
        // フォームをリセット
        form.reset()
        setSelectedAgent('')
        setSelectedMap('')
        setStepPreviews({})
        setStartPosition(null)
        setSkillPosition(null)
        // Reload fixed points list
        await fetchFixedPoints()
        setShowData('fixed-points')
      } else {
        const data = await response.json()
        setApiStatus({
          message: data.detail || 'Failed to post fixed point',
          isError: true
        })
      }
    } catch (error) {
      console.error('Error during fixed point creation:', error)
      setApiStatus({
        message: 'Fixed point posting error',
        isError: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 初回読み込み時の処理
  useState(() => {
    // ユーザー情報を取得
    if (accessToken) {
      fetchCurrentUser()
    }
    // エージェントとマップ情報を事前に取得
    const loadInitialData = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      // エージェント情報を取得
      try {
        const agentsResponse = await fetch(`${apiUrl}/api/valorant/agents`)
        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json()
          setAgents(agentsData)
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error)
      }
      
      // マップ情報を取得
      try {
        const mapsResponse = await fetch(`${apiUrl}/api/valorant/maps`)
        if (mapsResponse.ok) {
          const mapsData = await mapsResponse.json()
          setMaps(mapsData)
        }
      } catch (error) {
        console.error('Failed to fetch maps:', error)
      }
    }
    
    loadInitialData()
  })

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0f1419 100%)',
      color: '#ffffff'
    }}>
      <div style={{ 
        maxWidth: '1920px', 
        margin: '0 auto', 
        padding: '40px 20px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ 
              fontSize: '64px', 
              margin: 0, 
              background: 'linear-gradient(45deg, #ff4655, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '900',
              textShadow: '0 0 30px rgba(255, 70, 85, 0.5)'
            }}>
              VALORANT
            </h1>
            <h2 style={{ 
              fontSize: '32px', 
              margin: '10px 0 0 0',
              color: '#ff4655',
              fontWeight: '700',
              letterSpacing: '2px'
            }}>
              FIXED POINTS
            </h2>
          </div>
          <p style={{ 
            fontSize: '18px', 
            textAlign: 'center', 
            margin: 0,
            color: '#b0b8c1',
            fontWeight: '500'
          }}>
            戦術的定点を共有して、チームの勝利に貢献しよう
          </p>
        
        {/* ユーザー情報と認証ボタン */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          {currentUser ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              alignItems: 'center',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 70, 85, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '18px', 
                color: '#00d4ff',
                fontWeight: '600'
              }}>
                ようこそ、{currentUser.username}さん！
              </p>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'rgba(255, 70, 85, 0.1)',
                  color: '#ff4655',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #ff4655',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement
                  target.style.backgroundColor = '#ff4655'
                  target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement
                  target.style.backgroundColor = 'rgba(255, 70, 85, 0.1)'
                  target.style.color = '#ff4655'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setShowAuth(showAuth === 'login' ? 'none' : 'login')}
                style={{
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  color: '#00d4ff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #00d4ff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement
                  target.style.backgroundColor = '#00d4ff'
                  target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement
                  target.style.backgroundColor = 'rgba(0, 212, 255, 0.1)'
                  target.style.color = '#00d4ff'
                }}
              >
                Login
              </button>
              <button
                onClick={() => setShowAuth(showAuth === 'register' ? 'none' : 'register')}
                style={{
                  backgroundColor: 'rgba(255, 70, 85, 0.1)',
                  color: '#ff4655',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #ff4655',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement
                  target.style.backgroundColor = '#ff4655'
                  target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement
                  target.style.backgroundColor = 'rgba(255, 70, 85, 0.1)'
                  target.style.color = '#ff4655'
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          marginBottom: '24px' 
        }}>
          <button 
            onClick={fetchFixedPoints}
            disabled={isLoading}
            style={{
              backgroundColor: 'rgba(255, 70, 85, 0.1)',
              color: '#ff4655',
              padding: '16px 32px',
              minWidth: '180px',
              borderRadius: '10px',
              border: '1px solid #ff4655',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 4px 15px rgba(255, 70, 85, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = '#ff4655'
                target.style.color = 'white'
                target.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = 'rgba(255, 70, 85, 0.1)'
                target.style.color = '#ff4655'
                target.style.transform = 'translateY(0)'
              }
            }}
          >
            {isLoading ? 'Loading...' : '📋 Fixed Points'}
          </button>
          {currentUser && (
            <button 
              onClick={() => setShowData('create-fixed-point')}
              style={{
                backgroundColor: 'rgba(159, 122, 234, 0.1)',
                color: '#9f7aea',
                padding: '16px 32px',
              minWidth: '180px',
                borderRadius: '10px',
                border: '1px solid #9f7aea',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 15px rgba(159, 122, 234, 0.2)'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = '#9f7aea'
                target.style.color = 'white'
                target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = 'rgba(159, 122, 234, 0.1)'
                target.style.color = '#9f7aea'
                target.style.transform = 'translateY(0)'
              }}
            >
              ✨ New Fixed Point
            </button>
          )}
        </div>
        {apiStatus && (
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: apiStatus.isError ? 'rgba(255, 70, 85, 0.1)' : 'rgba(0, 212, 255, 0.1)',
            border: `1px solid ${apiStatus.isError ? '#ff4655' : '#00d4ff'}`,
            color: apiStatus.isError ? '#ff4655' : '#00d4ff',
            textAlign: 'center',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 4px 15px ${apiStatus.isError ? 'rgba(255, 70, 85, 0.2)' : 'rgba(0, 212, 255, 0.2)'}`
          }}>
            {apiStatus.message}
          </div>
        )}
        
        {/* ログインフォーム */}
        {showAuth === 'login' && (
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '48px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', textAlign: 'center' }}>Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '4px' }}>Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#3182ce',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        )}
        
        {/* 新規登録フォーム */}
        {showAuth === 'register' && (
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '48px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', textAlign: 'center' }}>Sign Up</h2>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '4px' }}>Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  minLength={3}
                  maxLength={50}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '4px' }}>Password (8+ characters)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#38a169',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          </div>
        )}
        
        
        
        {/* Fixed Points List Display */}
        {showData === 'fixed-points' && (
          <div>
            <div style={{
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{ 
                fontSize: '48px', 
                margin: '0 0 8px 0',
                background: 'linear-gradient(45deg, #ff4655, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}>
                📋 Fixed Points
              </h2>
              <div style={{
                height: '3px',
                background: 'linear-gradient(90deg, #ff4655, #00d4ff)',
                borderRadius: '2px',
                margin: '0 auto',
                width: '200px',
                boxShadow: '0 0 20px rgba(255, 70, 85, 0.5)'
              }}></div>
            </div>
            
            {fixedPoints.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '18px',
                padding: '60px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                🎯 No fixed points posted yet. Be the first to share your setup!
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '20px',
                width: '100%' 
              }}>
                {fixedPoints.map((fixedPoint) => {
                  // エージェントとマップ情報を取得
                  const agent = agents.find(a => a.uuid === fixedPoint.character_id)
                  const map = maps.find(m => m.uuid === fixedPoint.map_id)
                  
                  return (
                    <div
                      key={fixedPoint.id}
                      style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.borderColor = '#ff4655'
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 70, 85, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {/* Top Section with Map Background */}
                      <div style={{
                        position: 'relative',
                        height: '120px',
                        background: map ? `url(${processImageUrl(map.displayIcon)})` : 'linear-gradient(45deg, #1a2332, #0f1419)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)'
                        }} />
                        
                        {/* Agent Icon */}
                        {agent && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-20px',
                            left: '20px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            background: '#1a2332',
                            border: '3px solid #ff4655',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                          }}>
                            <img 
                              src={processImageUrl(agent.displayIcon)} 
                              alt={agent.displayName}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(fixedPoint.id, fixedPoint.is_favorited)
                          }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            const target = e.target as HTMLButtonElement
                            target.style.background = 'rgba(255, 70, 85, 0.5)'
                          }}
                          onMouseLeave={(e) => {
                            const target = e.target as HTMLButtonElement
                            target.style.background = 'rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          {fixedPoint.is_favorited ? '❤️' : '🤍'} {fixedPoint.favorites_count}
                        </button>
                      </div>
                      
                      {/* Content Section */}
                      <div 
                        style={{ 
                          padding: '40px 20px 20px 20px',
                          cursor: 'pointer'
                        }}
                        onClick={() => fetchFixedPointDetail(fixedPoint.id)}
                      >
                        <h3 style={{ 
                          fontSize: '20px', 
                          margin: '0 0 16px 0',
                          color: '#ffffff',
                          fontWeight: '700',
                          lineHeight: '1.4'
                        }}>
                          {fixedPoint.title}
                        </h3>
                        
                        <div style={{ 
                          display: 'flex', 
                          gap: '16px', 
                          alignItems: 'center',
                          marginBottom: '16px'
                        }}>
                          {agent && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              color: '#00d4ff',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}>
                              🎯 {agent.displayName}
                            </div>
                          )}
                          {map && (
                            <div style={{ 
                              color: '#ff4655',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}>
                              🗺️ {map.displayName}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ 
                          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                          paddingTop: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ 
                            fontSize: '13px', 
                            color: 'rgba(255, 255, 255, 0.6)'
                          }}>
                            <div style={{ marginBottom: '4px' }}>
                              👤 {fixedPoint.username}
                            </div>
                            <div>
                              📅 {new Date(fixedPoint.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                          
                          {fixedPoint.steps && (
                            <div style={{
                              background: 'rgba(159, 122, 234, 0.2)',
                              border: '1px solid #9f7aea',
                              borderRadius: '20px',
                              padding: '4px 12px',
                              fontSize: '12px',
                              color: '#9f7aea',
                              fontWeight: '600'
                            }}>
                              {fixedPoint.steps.length} Steps
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        
        {/* 定点投稿フォーム */}
        {showData === 'create-fixed-point' && currentUser && (
          <div style={{
            maxWidth: '1600px',
            margin: '0 auto',
            padding: '48px',
            background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{ 
                fontSize: '36px', 
                margin: '0 0 8px 0',
                background: 'linear-gradient(45deg, #ff4655, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '900',
                textShadow: '0 0 30px rgba(255, 70, 85, 0.5)'
              }}>
                ⚡ POST FIXED POINT
              </h2>
              <div style={{
                height: '3px',
                background: 'linear-gradient(90deg, #ff4655, #00d4ff)',
                borderRadius: '2px',
                margin: '0 auto',
                width: '200px',
                boxShadow: '0 0 20px rgba(255, 70, 85, 0.5)'
              }}></div>
            </div>
            <form onSubmit={createFixedPoint} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <label htmlFor="title" style={{ 
                  display: 'block', 
                  marginBottom: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>📝 TITLE</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  maxLength={255}
                  placeholder="e.g., Haven A Site Retake Setup"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#ffffff',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(5px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff4655'
                    e.target.style.boxShadow = '0 0 20px rgba(255, 70, 85, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              
              {/* Agent Selection */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>🎯 SELECT AGENT</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                  gap: '16px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '8px',
                  // スクロールパフォーマンス改善
                  willChange: 'scroll-position',
                  transform: 'translateZ(0)', // GPU アクセラレーション
                  backfaceVisibility: 'hidden',
                  WebkitOverflowScrolling: 'touch' // iOS Safari でのスムーズスクロール
                }}>
                  {agents.map(agent => (
                    <div
                      key={agent.uuid}
                      onClick={() => setSelectedAgent(agent.uuid)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: selectedAgent === agent.uuid ? '3px solid #ff4655' : '2px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        transition: 'border-color 0.2s ease, transform 0.2s ease',  // 軽量化
                        // GPU アクセラレーション
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
                        loading="lazy"  // 遅延読み込み
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover',
                          display: 'block',
                          // 画像の GPU アクセラレーション
                          transform: 'translateZ(0)',
                          backfaceVisibility: 'hidden'
                        }}
                      />
                      <div style={{
                        padding: '8px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#ffffff',
                        background: 'rgba(0, 0, 0, 0.5)'
                      }}>
                        {agent.displayName}
                      </div>
                      {selectedAgent === agent.uuid && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#ff4655',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
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

              {/* Map Selection */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>🗺️ SELECT MAP</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                  gap: '16px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  padding: '8px',
                  // スクロールパフォーマンス改善
                  willChange: 'scroll-position',
                  transform: 'translateZ(0)', // GPU アクセラレーション
                  backfaceVisibility: 'hidden',
                  WebkitOverflowScrolling: 'touch' // iOS Safari でのスムーズスクロール
                }}>
                  {maps.map(map => (
                    <div
                      key={map.uuid}
                      onClick={() => setSelectedMap(map.uuid)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: selectedMap === map.uuid ? '3px solid #00d4ff' : '2px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        transition: 'border-color 0.2s ease, transform 0.2s ease',  // 軽量化
                        // GPU アクセラレーション
                        backfaceVisibility: 'hidden',
                        transform: selectedMap === map.uuid ? 'scale(1.05) translateZ(0)' : 'scale(1) translateZ(0)',
                        boxShadow: selectedMap === map.uuid ? '0 0 20px rgba(0, 212, 255, 0.5)' : '0 4px 15px rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedMap !== map.uuid) {
                          e.currentTarget.style.transform = 'scale(1.02)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedMap !== map.uuid) {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        }
                      }}
                    >
                      <img
                        src={processImageUrl(map.splash)}
                        alt={map.displayName}
                        loading="lazy"  // 遅延読み込み
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          display: 'block',
                          // 画像の GPU アクセラレーション
                          transform: 'translateZ(0)',
                          backfaceVisibility: 'hidden'
                        }}
                      />
                      <div style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#ffffff',
                        background: 'rgba(0, 0, 0, 0.7)'
                      }}>
                        {map.displayName}
                      </div>
                      {selectedMap === map.uuid && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#00d4ff',
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
              
              {/* Map Position Setup */}
              {selectedMap && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  marginTop: '20px'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    margin: '0 0 16px 0',
                    color: '#ffffff',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>🎯 MAP POSITIONS</h3>
                  
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setMapMode('start')
                        setShowMapModal(true)
                      }}
                      style={{
                        flex: '1',
                        minWidth: '200px',
                        padding: '16px 20px',
                        background: startPosition 
                          ? 'linear-gradient(135deg, rgba(255, 70, 85, 0.3), rgba(255, 70, 85, 0.2))'
                          : 'rgba(255, 255, 255, 0.1)',
                        border: startPosition
                          ? '2px solid #ff4655'
                          : '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.borderColor = '#ff4655'
                        ;(e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(255, 70, 85, 0.3), rgba(255, 70, 85, 0.2))'
                        ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                        ;(e.target as HTMLButtonElement).style.boxShadow = '0 5px 20px rgba(255, 70, 85, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        if (!startPosition) {
                          (e.target as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'
                          ;(e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)'
                        }
                        (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                        ;(e.target as HTMLButtonElement).style.boxShadow = 'none'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>📍</span>
                      {startPosition ? '✓ Starting Position Set' : 'Set Starting Position'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setMapMode('skill')
                        setShowMapModal(true)
                      }}
                      style={{
                        flex: '1',
                        minWidth: '200px',
                        padding: '16px 20px',
                        background: skillPosition 
                          ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.2))'
                          : 'rgba(255, 255, 255, 0.1)',
                        border: skillPosition
                          ? '2px solid #00d4ff'
                          : '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.borderColor = '#00d4ff'
                        ;(e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.2))'
                        ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                        ;(e.target as HTMLButtonElement).style.boxShadow = '0 5px 20px rgba(0, 212, 255, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        if (!skillPosition) {
                          (e.target as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'
                          ;(e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)'
                        }
                        (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                        ;(e.target as HTMLButtonElement).style.boxShadow = 'none'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>💥</span>
                      {skillPosition ? '✓ Skill Target Set' : 'Set Skill Target Position'}
                    </button>
                  </div>
                  
                  {startPosition && skillPosition && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: 'rgba(0, 255, 0, 0.1)',
                      border: '1px solid rgba(0, 255, 0, 0.3)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      textAlign: 'center'
                    }}>
                      ✅ Both positions set! Ready to create your fixed point.
                    </div>
                  )}
                </div>
              )}
              
              {/* Steps Section */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    margin: '0',
                    color: '#ffffff',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>⚡ STEPS (1-5 REQUIRED)</h3>
                  <div style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, #ff4655, #00d4ff)',
                    borderRadius: '2px',
                    marginLeft: '16px',
                    flex: 1,
                    maxWidth: '100px'
                  }}></div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                  gap: '24px'
                }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ 
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '20px',
                      background: i === 1 ? '#ff4655' : '#00d4ff',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      Step {i} {i === 1 && '*'}
                    </div>
                    
                    <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        fontWeight: '600'
                      }}>
                        📸 Image Upload
                      </label>
                      
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        id={`step${i}_image`}
                        name={`step${i}_image`}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          handleFileChange(i, file)
                        }}
                      />
                      
                      {/* Custom Upload Area */}
                      <div
                        onClick={() => {
                          const input = document.getElementById(`step${i}_image`)
                          input?.click()
                        }}
                        onDragEnter={(e) => handleDrag(e, i)}
                        onDragLeave={(e) => handleDrag(e, i)}
                        onDragOver={(e) => handleDrag(e, i)}
                        onDrop={(e) => handleDrop(e, i)}
                        style={{
                          position: 'relative',
                          width: '100%',
                          minHeight: stepPreviews[i] ? '200px' : '120px',
                          background: dragActive[i] 
                            ? 'linear-gradient(135deg, rgba(159, 122, 234, 0.2), rgba(255, 70, 85, 0.2))'
                            : 'rgba(255, 255, 255, 0.05)',
                          border: dragActive[i]
                            ? '3px dashed #9f7aea'
                            : stepPreviews[i]
                            ? '2px solid #00d4ff'
                            : '2px dashed rgba(255, 255, 255, 0.3)',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (!stepPreviews[i]) {
                            e.currentTarget.style.borderColor = '#9f7aea'
                            e.currentTarget.style.background = 'rgba(159, 122, 234, 0.1)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!stepPreviews[i] && !dragActive[i]) {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      >
                        {stepPreviews[i] ? (
                          <>
                            <img
                              src={stepPreviews[i]}
                              alt={`Preview ${i}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.7) 100%)',
                              display: 'flex',
                              alignItems: 'flex-end',
                              padding: '16px'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center'
                              }}>
                                <span style={{
                                  color: 'white',
                                  fontSize: '16px',
                                  fontWeight: '600'
                                }}>
                                  ✅ Image uploaded
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleFileChange(i, null)
                                    const input = document.getElementById(`step${i}_image`) as HTMLInputElement
                                    if (input) input.value = ''
                                  }}
                                  style={{
                                    background: 'rgba(255, 70, 85, 0.2)',
                                    border: '1px solid #ff4655',
                                    borderRadius: '8px',
                                    padding: '4px 12px',
                                    color: '#ff4655',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    const target = e.target as HTMLButtonElement
                                    target.style.background = '#ff4655'
                                    target.style.color = 'white'
                                  }}
                                  onMouseLeave={(e) => {
                                    const target = e.target as HTMLButtonElement
                                    target.style.background = 'rgba(255, 70, 85, 0.2)'
                                    target.style.color = '#ff4655'
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: dragActive[i] ? '#9f7aea' : 'rgba(255, 255, 255, 0.7)'
                          }}>
                            <div style={{
                              fontSize: '36px',
                              marginBottom: '8px',
                              filter: dragActive[i] ? 'brightness(1.5)' : 'brightness(1)'
                            }}>
                              {dragActive[i] ? '🎯' : '📷'}
                            </div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              marginBottom: '4px'
                            }}>
                              {dragActive[i] ? 'Drop image here!' : 'Click or drag image'}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              opacity: 0.7
                            }}>
                              JPG, PNG, GIF up to 10MB
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor={`step${i}_description`} style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        fontWeight: '600'
                      }}>
                        📝 Description
                      </label>
                      <textarea
                        id={`step${i}_description`}
                        name={`step${i}_description`}
                        rows={3}
                        placeholder={i === 1 ? "Enter step description (image or description required)" : "Additional step description (optional)"}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          fontSize: '16px',
                          color: '#ffffff',
                          outline: 'none',
                          resize: 'vertical',
                          transition: 'all 0.3s ease',
                          minHeight: '80px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#9f7aea'
                          e.target.style.boxShadow = '0 0 15px rgba(159, 122, 234, 0.3)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  </div>
                ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
                <button
                  type="submit"
                  disabled={isLoading || !selectedAgent || !selectedMap}
                  style={{
                    flex: 1,
                    background: isLoading || !selectedAgent || !selectedMap 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'linear-gradient(135deg, #ff4655, #00d4ff)',
                    color: 'white',
                    padding: '18px 32px',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: isLoading || !selectedAgent || !selectedMap ? 'not-allowed' : 'pointer',
                    opacity: isLoading || !selectedAgent || !selectedMap ? 0.5 : 1,
                    fontSize: '18px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                    boxShadow: isLoading || !selectedAgent || !selectedMap 
                      ? 'none' 
                      : '0 8px 25px rgba(255, 70, 85, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && selectedAgent && selectedMap) {
                      const target = e.target as HTMLButtonElement
                      target.style.transform = 'translateY(-2px)'
                      target.style.boxShadow = '0 12px 35px rgba(255, 70, 85, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && selectedAgent && selectedMap) {
                      const target = e.target as HTMLButtonElement
                      target.style.transform = 'translateY(0)'
                      target.style.boxShadow = '0 8px 25px rgba(255, 70, 85, 0.3)'
                    }
                  }}
                >
                  {isLoading ? '⏳ POSTING...' : '🚀 POST FIXED POINT'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowData('fixed-points')
                    setSelectedAgent('')
                    setSelectedMap('')
                    setStartPosition(null)
                    setSkillPosition(null)
                    setStepPreviews({})
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    padding: '18px 32px',
                    borderRadius: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement
                    target.style.borderColor = '#ff4655'
                    target.style.background = 'rgba(255, 70, 85, 0.1)'
                    target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement
                    target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    target.style.background = 'rgba(255, 255, 255, 0.1)'
                    target.style.transform = 'translateY(0)'
                  }}
                >
                  ❌ CANCEL
                </button>
              </div>
            </form>
            
            {/* Interactive Map Modal */}
            {showMapModal && selectedMap && (
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.9)', // 元の黒色に戻す
                  zIndex: 9999, // より高いzIndex
                  padding: '20px',
                  overflowY: 'auto',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '5vh',
                  paddingBottom: '5vh'
                }}
                onClick={(e) => {
                  // モーダル背景をクリックしたときに閉じる
                  if (e.target === e.currentTarget) {
                    setShowMapModal(false)
                  }
                }}
              >
                <div style={{
                  position: 'relative',
                  maxWidth: '1000px',
                  width: '90%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}>
                  {/* Close button */}
                  <button
                    onClick={() => setShowMapModal(false)}
                    style={{
                      position: 'absolute',
                      top: '-50px',
                      right: '0',
                      background: 'rgba(255, 70, 85, 0.2)',
                      border: '2px solid #ff4655',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.background = '#ff4655'
                      ;(e.target as HTMLButtonElement).style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.background = 'rgba(255, 70, 85, 0.2)'
                      ;(e.target as HTMLButtonElement).style.transform = 'scale(1)'
                    }}
                  >
                    ✕ Close
                  </button>
                  
                  <InteractiveMap
                      mapImageUrl={processImageUrl(maps.find(m => m.uuid === selectedMap)?.displayIcon || '')}
                      mapName={maps.find(m => m.uuid === selectedMap)?.displayName || ''}
                      mode={mapMode}
                      startPosition={startPosition}
                      skillPosition={skillPosition}
                      onPositionSelect={(pos) => {
                        setStartPosition(pos)
                        // 自動的にスキルモードに切り替え
                        if (!skillPosition) {
                          setMapMode('skill')
                        } else {
                          setShowMapModal(false)
                        }
                      }}
                      onSkillPositionSelect={(pos) => {
                        setSkillPosition(pos)
                        setShowMapModal(false)
                      }}
                    />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 定点詳細表示 */}
        {selectedFixedPoint && showData === 'none' && (
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '32px',
            background: 'rgba(20, 30, 45, 0.95)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            {/* ヘッダー部分 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'start', 
              marginBottom: '32px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '24px'
            }}>
              <h2 style={{ 
                fontSize: '36px', 
                margin: 0,
                background: 'linear-gradient(135deg, #ff4655, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '800',
                letterSpacing: '-1px'
              }}>{selectedFixedPoint.title}</h2>
              <button
                onClick={() => {
                  setSelectedFixedPoint(null)
                  setShowData('fixed-points')
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.2), rgba(255, 70, 85, 0.3))',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 70, 85, 0.5)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(255, 70, 85, 0.3), rgba(255, 70, 85, 0.4))'
                  ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(255, 70, 85, 0.7)'
                  ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                  ;(e.target as HTMLButtonElement).style.boxShadow = '0 5px 20px rgba(255, 70, 85, 0.3)'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(255, 70, 85, 0.2), rgba(255, 70, 85, 0.3))'
                  ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(255, 70, 85, 0.5)'
                  ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                  ;(e.target as HTMLButtonElement).style.boxShadow = 'none'
                }}
              >
                ← Back to List
              </button>
            </div>
            
            {/* メタ情報 */}
            <div style={{ 
              marginBottom: '32px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                {agents.find(a => a.uuid === selectedFixedPoint.character_id) && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    background: 'rgba(255, 70, 85, 0.1)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 70, 85, 0.3)'
                  }}>
                    <img 
                      src={agents.find(a => a.uuid === selectedFixedPoint.character_id)?.displayIcon} 
                      alt={agents.find(a => a.uuid === selectedFixedPoint.character_id)?.displayName}
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px',
                        border: '2px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: '700',
                      color: '#ff4655',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {agents.find(a => a.uuid === selectedFixedPoint.character_id)?.displayName}
                    </span>
                  </div>
                )}
                {maps.find(m => m.uuid === selectedFixedPoint.map_id) && (
                  <div style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 212, 255, 0.3)'
                  }}>
                    <span style={{ 
                      fontSize: '16px', 
                      color: '#00d4ff',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      📍 {maps.find(m => m.uuid === selectedFixedPoint.map_id)?.displayName}
                    </span>
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '20px',
                fontSize: '16px', 
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ff4655' }}>👤</span>
                  <span>Posted by <strong style={{ color: '#ffffff' }}>{selectedFixedPoint.username}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#00d4ff' }}>📅</span>
                  <span>{new Date(selectedFixedPoint.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
            
            {/* マップ表示セクション */}
            {selectedFixedPoint.steps && selectedFixedPoint.steps.length > 0 && (() => {
              const firstStep = selectedFixedPoint.steps.find(s => s.step_order === 1)
              console.log('First step data:', firstStep)
              const hasPositions = firstStep && (firstStep.position_x !== null || firstStep.skill_position_x !== null)
              console.log('Has positions:', hasPositions)
              
              if (!hasPositions) return null
              
              return (
                <div style={{
                  marginBottom: '32px'
                }}>
                  <h3 style={{ 
                    fontSize: '24px', 
                    marginBottom: '24px',
                    color: '#ffffff',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #ff4655, #00d4ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      🗺️ TACTICAL MAP VIEW
                    </span>
                  </h3>
                  
                  <MapDisplay
                    mapImageUrl={processImageUrl(maps.find(m => m.uuid === selectedFixedPoint.map_id)?.displayIcon || '')}
                    mapName={maps.find(m => m.uuid === selectedFixedPoint.map_id)?.displayName || ''}
                    startPosition={
                      firstStep.position_x !== null && firstStep.position_x !== undefined && 
                      firstStep.position_y !== null && firstStep.position_y !== undefined
                        ? { x: firstStep.position_x, y: firstStep.position_y }
                        : null
                    }
                    skillPosition={
                      firstStep.skill_position_x !== null && firstStep.skill_position_x !== undefined && 
                      firstStep.skill_position_y !== null && firstStep.skill_position_y !== undefined
                        ? { x: firstStep.skill_position_x, y: firstStep.skill_position_y }
                        : null
                    }
                  />
                </div>
              )
            })()}
            
            {/* ステップセクション */}
            <div>
              <h3 style={{ 
                fontSize: '24px', 
                marginBottom: '24px',
                color: '#ffffff',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #ff4655, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  📋 STEP-BY-STEP GUIDE
                </span>
              </h3>
              {selectedFixedPoint.steps && selectedFixedPoint.steps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {selectedFixedPoint.steps
                    .sort((a, b) => a.step_order - b.step_order)
                    .map((step, index) => (
                    <div 
                      key={step.id} 
                      style={{ 
                        position: 'relative',
                        padding: '24px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                        e.currentTarget.style.borderColor = 'rgba(255, 70, 85, 0.3)'
                        e.currentTarget.style.transform = 'translateX(10px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }}
                    >
                      {/* ステップ番号 */}
                      <div style={{
                        position: 'absolute',
                        top: '24px',
                        left: '24px',
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #ff4655, #ff4655)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '800',
                        color: '#ffffff',
                        boxShadow: '0 8px 24px rgba(255, 70, 85, 0.4)',
                        zIndex: 1
                      }}>
                        {step.step_order}
                      </div>
                      
                      <div style={{ marginLeft: '100px' }}>
                        {step.image_url && (
                          <div style={{ 
                            marginBottom: '16px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                          }}>
                            <img 
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${step.image_url}`}
                              alt={`Step ${step.step_order}`}
                              style={{ 
                                width: '100%',
                                maxWidth: '100%',
                                display: 'block',
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLImageElement).style.transform = 'scale(1.02)'
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLImageElement).style.transform = 'scale(1)'
                              }}
                            />
                          </div>
                        )}
                        {step.description && (
                          <p style={{ 
                            margin: 0, 
                            whiteSpace: 'pre-wrap',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '16px',
                            lineHeight: '1.6'
                          }}>{step.description}</p>
                        )}
                      </div>
                      
                      {/* コネクター線 */}
                      {selectedFixedPoint.steps && index < selectedFixedPoint.steps.length - 1 && (
                        <div style={{
                          position: 'absolute',
                          left: '52px',
                          bottom: '-20px',
                          width: '2px',
                          height: '40px',
                          background: 'linear-gradient(180deg, rgba(255, 70, 85, 0.3), transparent)'
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  padding: '40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  No steps found for this fixed point
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

export default App