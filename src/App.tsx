import { Box, Container, Heading, Text, Stack, Button } from '@chakra-ui/react'

function App() {
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
          <Button colorScheme="blue">
            はじめる
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}

export default App