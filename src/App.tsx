import { useState } from 'react'

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  username: string
  email: string
  password: string
}

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
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<{ message: string; isError: boolean } | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [maps, setMaps] = useState<Map[]>([])
  const [showData, setShowData] = useState<'none' | 'agents' | 'maps' | 'fixed-points' | 'create-fixed-point'>('none')
  const [showAuth, setShowAuth] = useState<'none' | 'login' | 'register'>('none')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [fixedPoints, setFixedPoints] = useState<FixedPoint[]>([])
  const [selectedFixedPoint, setSelectedFixedPoint] = useState<FixedPoint | null>(null)

  const checkBackendConnection = async () => {
    setIsLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/health`)
      const data = await response.json()
      
      if (response.ok) {
        setApiStatus({
          message: `バックエンド接続成功！ ステータス: ${data.status}`,
          isError: false
        })
      }
    } catch (error) {
      setApiStatus({
        message: 'バックエンド接続エラー: サーバーが起動していることを確認してください',
        isError: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAgents = async () => {
    setIsLoading(true)
    setShowData('agents')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/valorant/agents`)
      const data = await response.json()
      
      if (response.ok) {
        setAgents(data)
        setApiStatus({
          message: `${data.length}人のエージェントを取得しました！`,
          isError: false
        })
      }
    } catch (error) {
      setApiStatus({
        message: 'エージェント取得エラー',
        isError: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMaps = async () => {
    setIsLoading(true)
    setShowData('maps')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/valorant/maps`)
      const data = await response.json()
      
      if (response.ok) {
        setMaps(data)
        setApiStatus({
          message: `${data.length}個のマップを取得しました！`,
          isError: false
        })
      }
    } catch (error) {
      setApiStatus({
        message: 'マップ取得エラー',
        isError: true
      })
    } finally {
      setIsLoading(false)
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
          message: 'ログインに成功しました！',
          isError: false
        })
        fetchCurrentUser(data.access_token)
      } else {
        setApiStatus({
          message: 'ログインに失敗しました。メールアドレスまたはパスワードが正しくありません。',
          isError: true
        })
      }
    } catch (error) {
      setApiStatus({
        message: 'ログインエラー',
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
          message: 'ユーザー登録に成功しました！ログインしてください。',
          isError: false
        })
      } else {
        const data = await response.json()
        setApiStatus({
          message: data.detail || 'ユーザー登録に失敗しました',
          isError: true
        })
      }
    } catch (error) {
      setApiStatus({
        message: 'ユーザー登録エラー',
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
      message: 'ログアウトしました',
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
          message: `${data.length}件の定点を取得しました！`,
          isError: false
        })
      } else {
        setApiStatus({
          message: '定点の取得に失敗しました',
          isError: true
        })
      }
    } catch (error) {
      console.error('Error fetching fixed points:', error)
      setApiStatus({
        message: '定点取得エラー',
        isError: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (fixedPointId: number, isFavorited: boolean) => {
    if (!accessToken) {
      setApiStatus({
        message: 'お気に入りにはログインが必要です',
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
          message: isFavorited ? 'お気に入りから削除しました' : 'お気に入りに追加しました',
          isError: false
        })
      }
    } catch (error) {
      setApiStatus({
        message: 'お気に入り操作エラー',
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
          message: '定点の詳細取得に失敗しました',
          isError: true
        })
      }
    } catch (error) {
      console.error('Error fetching fixed point detail:', error)
      setApiStatus({
        message: '定点詳細取得エラー',
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
        message: '定点の投稿にはログインが必要です',
        isError: true
      })
      return
    }

    setIsLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    
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
                message: `ステップ${i}の画像アップロードに失敗しました`,
                isError: true
              })
              setIsLoading(false)
              return
            }
          } catch (error) {
            setApiStatus({
              message: '画像アップロードエラー',
              isError: true
            })
            setIsLoading(false)
            return
          }
        }
        
        steps.push({
          step_order: i,
          description: description || '',
          image_url: imageUrl
        })
      }
    }

    if (steps.length === 0) {
      setApiStatus({
        message: '少なくとも1つのステップを入力してください',
        isError: true
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${apiUrl}/api/fixed-points/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: formData.get('title'),
          character_id: formData.get('character_id'),
          map_id: formData.get('map_id'),
          steps: steps
        })
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        setApiStatus({
          message: '定点を投稿しました！',
          isError: false
        })
        // フォームをリセット
        form.reset()
        // 定点一覧を再取得
        await fetchFixedPoints()
        setShowData('fixed-points')
      } else {
        const data = await response.json()
        setApiStatus({
          message: data.detail || '定点の投稿に失敗しました',
          isError: true
        })
      }
    } catch (error) {
      console.error('Error during fixed point creation:', error)
      setApiStatus({
        message: '定点投稿エラー',
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
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
                  e.target.style.backgroundColor = '#ff4655'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 70, 85, 0.1)'
                  e.target.style.color = '#ff4655'
                }}
              >
                ログアウト
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
                  e.target.style.backgroundColor = '#00d4ff'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(0, 212, 255, 0.1)'
                  e.target.style.color = '#00d4ff'
                }}
              >
                ログイン
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
                  e.target.style.backgroundColor = '#ff4655'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 70, 85, 0.1)'
                  e.target.style.color = '#ff4655'
                }}
              >
                新規登録
              </button>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={checkBackendConnection}
            disabled={isLoading}
            style={{
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              color: '#00d4ff',
              padding: '14px 20px',
              borderRadius: '10px',
              border: '1px solid #00d4ff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 4px 15px rgba(0, 212, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#00d4ff'
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = 'rgba(0, 212, 255, 0.1)'
                e.target.style.color = '#00d4ff'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            {isLoading ? '接続中...' : '🔗 接続テスト'}
          </button>
          <button 
            onClick={fetchAgents}
            disabled={isLoading}
            style={{
              backgroundColor: 'rgba(128, 90, 213, 0.1)',
              color: '#805ad5',
              padding: '14px 20px',
              borderRadius: '10px',
              border: '1px solid #805ad5',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 4px 15px rgba(128, 90, 213, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#805ad5'
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = 'rgba(128, 90, 213, 0.1)'
                e.target.style.color = '#805ad5'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            {isLoading ? '取得中...' : '🎯 エージェント'}
          </button>
          <button 
            onClick={fetchMaps}
            disabled={isLoading}
            style={{
              backgroundColor: 'rgba(56, 161, 105, 0.1)',
              color: '#38a169',
              padding: '14px 20px',
              borderRadius: '10px',
              border: '1px solid #38a169',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 4px 15px rgba(56, 161, 105, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#38a169'
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = 'rgba(56, 161, 105, 0.1)'
                e.target.style.color = '#38a169'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            {isLoading ? '取得中...' : '🗺️ マップ'}
          </button>
          <button 
            onClick={fetchFixedPoints}
            disabled={isLoading}
            style={{
              backgroundColor: 'rgba(255, 70, 85, 0.1)',
              color: '#ff4655',
              padding: '14px 20px',
              borderRadius: '10px',
              border: '1px solid #ff4655',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 4px 15px rgba(255, 70, 85, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#ff4655'
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = 'rgba(255, 70, 85, 0.1)'
                e.target.style.color = '#ff4655'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            {isLoading ? '取得中...' : '📋 定点一覧'}
          </button>
          {currentUser && (
            <button 
              onClick={() => setShowData('create-fixed-point')}
              style={{
                backgroundColor: 'rgba(159, 122, 234, 0.1)',
                color: '#9f7aea',
                padding: '14px 20px',
                borderRadius: '10px',
                border: '1px solid #9f7aea',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 15px rgba(159, 122, 234, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#9f7aea'
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(159, 122, 234, 0.1)'
                e.target.style.color = '#9f7aea'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              ✨ 定点を投稿
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
            maxWidth: '400px',
            margin: '0 auto',
            padding: '24px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', textAlign: 'center' }}>ログイン</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '4px' }}>メールアドレス</label>
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
                <label htmlFor="password" style={{ display: 'block', marginBottom: '4px' }}>パスワード</label>
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
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>
          </div>
        )}
        
        {/* 新規登録フォーム */}
        {showAuth === 'register' && (
          <div style={{
            maxWidth: '400px',
            margin: '0 auto',
            padding: '24px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', textAlign: 'center' }}>新規登録</h2>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '4px' }}>ユーザー名</label>
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
                <label htmlFor="email" style={{ display: 'block', marginBottom: '4px' }}>メールアドレス</label>
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
                <label htmlFor="password" style={{ display: 'block', marginBottom: '4px' }}>パスワード（8文字以上）</label>
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
                {isLoading ? '登録中...' : '登録'}
              </button>
            </form>
          </div>
        )}
        
        {/* エージェント表示 */}
        {showData === 'agents' && agents.length > 0 && (
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>エージェント一覧</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {agents.map((agent) => (
                <div
                  key={agent.uuid}
                  style={{
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <img
                      src={agent.displayIcon}
                      alt={agent.displayName}
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        margin: '0 auto'
                      }}
                    />
                    <h3 style={{ fontSize: '20px', textAlign: 'center', margin: 0 }}>{agent.displayName}</h3>
                    {agent.role && (
                      <p style={{ fontSize: '14px', color: '#718096', textAlign: 'center', margin: 0 }}>
                        {agent.role.displayName}
                      </p>
                    )}
                    <p style={{ fontSize: '14px', margin: 0 }}>{agent.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* マップ表示 */}
        {showData === 'maps' && maps.length > 0 && (
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>マップ一覧</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
              {maps.map((map) => (
                <div
                  key={map.uuid}
                  style={{
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <img
                      src={map.splash}
                      alt={map.displayName}
                      style={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                    <h3 style={{ fontSize: '20px', margin: 0 }}>{map.displayName}</h3>
                    <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>{map.coordinates}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 定点一覧表示 */}
        {showData === 'fixed-points' && (
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>定点一覧</h2>
            {fixedPoints.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#718096' }}>
                まだ定点が投稿されていません
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                {fixedPoints.map((fixedPoint) => {
                  // エージェントとマップ情報を取得
                  const agent = agents.find(a => a.uuid === fixedPoint.character_id)
                  const map = maps.find(m => m.uuid === fixedPoint.map_id)
                  
                  return (
                    <div
                      key={fixedPoint.id}
                      style={{
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <h3 
                            style={{ 
                              fontSize: '20px', 
                              margin: 0,
                              cursor: 'pointer',
                              color: '#3182ce'
                            }}
                            onClick={() => fetchFixedPointDetail(fixedPoint.id)}
                          >
                            {fixedPoint.title}
                          </h3>
                          <button
                            onClick={() => toggleFavorite(fixedPoint.id, fixedPoint.is_favorited)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '20px',
                              padding: '4px'
                            }}
                          >
                            {fixedPoint.is_favorited ? '❤️' : '🤍'} {fixedPoint.favorites_count}
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {agent && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <img 
                                src={agent.displayIcon} 
                                alt={agent.displayName}
                                style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                              />
                              <span style={{ fontSize: '14px' }}>{agent.displayName}</span>
                            </div>
                          )}
                          {map && (
                            <span style={{ fontSize: '14px', color: '#718096' }}>• {map.displayName}</span>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '14px', color: '#718096' }}>
                          <p style={{ margin: '4px 0' }}>投稿者: {fixedPoint.username}</p>
                          <p style={{ margin: '4px 0' }}>
                            投稿日: {new Date(fixedPoint.created_at).toLocaleDateString('ja-JP')}
                          </p>
                          {fixedPoint.steps && (
                            <p style={{ margin: '4px 0' }}>
                              ステップ数: {fixedPoint.steps.length}
                            </p>
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
            maxWidth: '600px',
            margin: '0 auto',
            padding: '24px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>定点を投稿</h2>
            <form onSubmit={createFixedPoint} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="title" style={{ display: 'block', marginBottom: '4px' }}>タイトル</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  maxLength={255}
                  placeholder="例: ヘイヴンA サイト リテイク用セットアップ"
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
                <label htmlFor="character_id" style={{ display: 'block', marginBottom: '4px' }}>エージェント</label>
                <select
                  id="character_id"
                  name="character_id"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">エージェントを選択</option>
                  {agents.map(agent => (
                    <option key={agent.uuid} value={agent.uuid}>
                      {agent.displayName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="map_id" style={{ display: 'block', marginBottom: '4px' }}>マップ</label>
                <select
                  id="map_id"
                  name="map_id"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">マップを選択</option>
                  {maps.map(map => (
                    <option key={map.uuid} value={map.uuid}>
                      {map.displayName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>ステップ（最低1つ、最大5つ）</h3>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ marginBottom: '20px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      ステップ {i} {i === 1 && <span style={{ color: '#e53e3e' }}>*</span>}
                    </label>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label htmlFor={`step${i}_image`} style={{ display: 'block', marginBottom: '4px' }}>
                        画像
                      </label>
                      <input
                        type="file"
                        id={`step${i}_image`}
                        name={`step${i}_image`}
                        accept="image/*"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`step${i}_description`} style={{ display: 'block', marginBottom: '4px' }}>
                        説明
                      </label>
                      <textarea
                        id={`step${i}_description`}
                        name={`step${i}_description`}
                        rows={3}
                        placeholder={i === 1 ? "ここに手順を記載（画像と説明の少なくとも一方は必須）" : "追加の手順があれば記載"}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          fontSize: '16px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    backgroundColor: '#9f7aea',
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
                  {isLoading ? '投稿中...' : '投稿する'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowData('fixed-points')}
                  style={{
                    backgroundColor: '#e2e8f0',
                    color: '#2d3748',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* 定点詳細表示 */}
        {selectedFixedPoint && showData === 'none' && (
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '24px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '28px', margin: 0 }}>{selectedFixedPoint.title}</h2>
              <button
                onClick={() => {
                  setSelectedFixedPoint(null)
                  setShowData('fixed-points')
                }}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#2d3748',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                一覧に戻る
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px' }}>
                {agents.find(a => a.uuid === selectedFixedPoint.character_id) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={agents.find(a => a.uuid === selectedFixedPoint.character_id)?.displayIcon} 
                      alt={agents.find(a => a.uuid === selectedFixedPoint.character_id)?.displayName}
                      style={{ width: '32px', height: '32px', borderRadius: '4px' }}
                    />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {agents.find(a => a.uuid === selectedFixedPoint.character_id)?.displayName}
                    </span>
                  </div>
                )}
                {maps.find(m => m.uuid === selectedFixedPoint.map_id) && (
                  <span style={{ fontSize: '16px', color: '#718096' }}>
                    • {maps.find(m => m.uuid === selectedFixedPoint.map_id)?.displayName}
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: '14px', color: '#718096' }}>
                <p style={{ margin: '4px 0' }}>投稿者: {selectedFixedPoint.username}</p>
                <p style={{ margin: '4px 0' }}>
                  投稿日: {new Date(selectedFixedPoint.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>ステップ</h3>
              {selectedFixedPoint.steps && selectedFixedPoint.steps.length > 0 ? (
                selectedFixedPoint.steps
                  .sort((a, b) => a.step_order - b.step_order)
                  .map((step, index) => (
                  <div 
                    key={step.id} 
                    style={{ 
                      marginBottom: '24px',
                      padding: '20px',
                      backgroundColor: '#f7fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <h4 style={{ fontSize: '18px', marginTop: 0, marginBottom: '12px' }}>
                      ステップ {step.step_order}
                    </h4>
                    {step.image_url && (
                      <div style={{ marginBottom: '12px' }}>
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${step.image_url}`}
                          alt={`ステップ ${step.step_order}`}
                          style={{ 
                            maxWidth: '100%',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                      </div>
                    )}
                    {step.description && (
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{step.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#718096' }}>
                  ステップが見つかりません
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App