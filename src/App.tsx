import { Box, Container, Heading, Text, Stack, Button } from '@chakra-ui/react'
import { useState } from 'react'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<{ message: string; isError: boolean } | null>(null)

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

  return (
    <Container maxW="container.xl" py={10}>
      <Stack gap={8}>
        <Heading as="h1" size="2xl">
          Fixed Points Frontend
        </Heading>
        <Text fontSize="lg" textAlign="center">
          React + TypeScript + Chakra UIで構築されたフロントエンドアプリケーション
        </Text>
        <Box>
          <Button 
            colorScheme="blue" 
            onClick={checkBackendConnection}
            isLoading={isLoading}
            loadingText="接続中..."
          >
            バックエンド接続テスト
          </Button>
        </Box>
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
      </Stack>
    </Container>
  )
}

export default App