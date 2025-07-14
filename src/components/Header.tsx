import { Box, Flex, Heading, Spacer, Button } from '@chakra-ui/react'

export const Header = () => {
  return (
    <Box bg="gray.100" px={4} py={3}>
      <Flex alignItems="center">
        <Heading size="lg">Fixed Points</Heading>
        <Spacer />
        <Button variant="ghost" size="sm">
          Menu
        </Button>
      </Flex>
    </Box>
  )
}