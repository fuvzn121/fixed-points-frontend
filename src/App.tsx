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
  updated_at: string
  steps: FixedPointStep[]
  favorites_count: number
  is_favorited: boolean
  username: string
}

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<{ message: string; isError: boolean } | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [maps, setMaps] = useState<Map[]>([])
  const [showData, setShowData] = useState<'none' | 'agents' | 'maps' | 'fixed-points'>('none')
  const [showAuth, setShowAuth] = useState<'none' | 'login' | 'register'>('none')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [fixedPoints, setFixedPoints] = useState<FixedPoint[]>([])

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <h1 style={{ fontSize: '48px', margin: 0 }}>
          Fixed Points Frontend
        </h1>
        <p style={{ fontSize: '18px', textAlign: 'center', margin: 0 }}>
          React + TypeScript + Chakra UIで構築されたフロントエンドアプリケーション
        </p>
        
        {/* ユーザー情報と認証ボタン */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <p style={{ margin: 0 }}>ようこそ、{currentUser.username}さん！</p>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
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
                  backgroundColor: '#3182ce',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ログイン
              </button>
              <button
                onClick={() => setShowAuth(showAuth === 'register' ? 'none' : 'register')}
                style={{
                  backgroundColor: '#38a169',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                新規登録
              </button>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={checkBackendConnection}
            disabled={isLoading}
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '接続中...' : 'バックエンド接続テスト'}
          </button>
          <button 
            onClick={fetchAgents}
            disabled={isLoading}
            style={{
              backgroundColor: '#805ad5',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '取得中...' : 'エージェント一覧'}
          </button>
          <button 
            onClick={fetchMaps}
            disabled={isLoading}
            style={{
              backgroundColor: '#38a169',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '取得中...' : 'マップ一覧'}
          </button>
          <button 
            onClick={fetchFixedPoints}
            disabled={isLoading}
            style={{
              backgroundColor: '#e53e3e',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '取得中...' : '定点一覧'}
          </button>
        </div>
        {apiStatus && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: apiStatus.isError ? '#fed7d7' : '#c6f6d5',
            border: `1px solid ${apiStatus.isError ? '#fc8181' : '#68d391'}`,
            color: apiStatus.isError ? '#c53030' : '#276749',
            textAlign: 'center',
            fontWeight: 500
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
                          <h3 style={{ fontSize: '20px', margin: 0 }}>{fixedPoint.title}</h3>
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
                          <p style={{ margin: '4px 0' }}>
                            ステップ数: {fixedPoint.steps.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App