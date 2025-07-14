import { Box, Container, Heading, Text, Stack, Button, useToast } from '@chakra-ui/react'
import { useState } from 'react'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<string | null>(null)
  const toast = useToast()

  const checkBackendConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/health')
      const data = await response.json()
      
      if (response.ok) {
        setApiStatus(`バックエンド接続成功！ ステータス: ${data.status}`)
        toast({
          title: 'API接続成功',
          description: 'バックエンドとの通信が確認できました！',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      setApiStatus('バックエンド接続エラー')
      toast({
        title: 'API接続エラー',
        description: 'バックエンドサーバーが起動していることを確認してください',
        status: 'error',
        duration: 5000,
        isClosable: true,
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
          <Text fontSize="md" textAlign="center" color={apiStatus.includes('成功') ? 'green.500' : 'red.500'}>
            {apiStatus}
          </Text>
        )}
      </Stack>
    </Container>
  )
}

export default App