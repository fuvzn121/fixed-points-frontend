import { useState } from 'react'

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

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<{ message: string; isError: boolean } | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [maps, setMaps] = useState<Map[]>([])
  const [showData, setShowData] = useState<'none' | 'agents' | 'maps'>('none')

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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <h1 style={{ fontSize: '48px', margin: 0 }}>
          Fixed Points Frontend
        </h1>
        <p style={{ fontSize: '18px', textAlign: 'center', margin: 0 }}>
          React + TypeScript + Chakra UIで構築されたフロントエンドアプリケーション
        </p>
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
      </div>
    </div>
  )
}

export default App