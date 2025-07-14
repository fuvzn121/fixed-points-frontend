import { Box, Container, Heading, Text, Stack, Button } from '@chakra-ui/react'
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
    <Container maxW="container.xl" py={10}>
      <Stack gap={8}>
        <Heading as="h1" size="2xl">
          Fixed Points Frontend
        </Heading>
        <Text fontSize="lg" textAlign="center">
          React + TypeScript + Chakra UIで構築されたフロントエンドアプリケーション
        </Text>
        <Stack direction="row" gap={4} justifyContent="center">
          <Button 
            colorScheme="blue" 
            onClick={checkBackendConnection}
            isLoading={isLoading}
            loadingText="接続中..."
          >
            バックエンド接続テスト
          </Button>
          <Button 
            colorScheme="purple" 
            onClick={fetchAgents}
            isLoading={isLoading}
            loadingText="取得中..."
          >
            エージェント一覧
          </Button>
          <Button 
            colorScheme="green" 
            onClick={fetchMaps}
            isLoading={isLoading}
            loadingText="取得中..."
          >
            マップ一覧
          </Button>
        </Stack>
        {apiStatus && (
          <Box 
            p={4} 
            borderRadius="md" 
            bg={apiStatus.isError ? 'red.50' : 'green.50'}
            borderWidth={1}
            borderColor={apiStatus.isError ? 'red.200' : 'green.200'}
          >
            <Text 
              fontSize="md" 
              textAlign="center" 
              color={apiStatus.isError ? 'red.600' : 'green.600'}
              fontWeight="medium"
            >
              {apiStatus.message}
            </Text>
          </Box>
        )}
        
        {/* エージェント表示 */}
        {showData === 'agents' && agents.length > 0 && (
          <Box>
            <Heading as="h2" size="lg" mb={4}>エージェント一覧</Heading>
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {agents.map((agent) => (
                <Box
                  key={agent.uuid}
                  p={5}
                  borderWidth={1}
                  borderRadius="lg"
                  boxShadow="sm"
                  bg="white"
                  _hover={{ boxShadow: "md" }}
                >
                  <Stack gap={3}>
                    <Box
                      as="img"
                      src={agent.displayIcon}
                      alt={agent.displayName}
                      borderRadius="lg"
                      boxSize="100px"
                      objectFit="cover"
                      mx="auto"
                    />
                    <Heading size="md" textAlign="center">{agent.displayName}</Heading>
                    {agent.role && (
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        {agent.role.displayName}
                      </Text>
                    )}
                    <Text fontSize="sm" noOfLines={3}>{agent.description}</Text>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
        {/* マップ表示 */}
        {showData === 'maps' && maps.length > 0 && (
          <Box>
            <Heading as="h2" size="lg" mb={4}>マップ一覧</Heading>
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {maps.map((map) => (
                <Box
                  key={map.uuid}
                  p={5}
                  borderWidth={1}
                  borderRadius="lg"
                  boxShadow="sm"
                  bg="white"
                  _hover={{ boxShadow: "md" }}
                >
                  <Stack gap={3}>
                    <Box
                      as="img"
                      src={map.splash}
                      alt={map.displayName}
                      borderRadius="lg"
                      height="200px"
                      width="100%"
                      objectFit="cover"
                    />
                    <Heading size="md">{map.displayName}</Heading>
                    <Text fontSize="sm" color="gray.600">{map.coordinates}</Text>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Stack>
    </Container>
  )
}

export default App