import { useState, useEffect, useCallback } from 'react'
import { FixedPoint, Agent, Map, ApiStatus } from '../models'
import { fixedPointsService } from '../services/fixedPoints.service'

export const useFixedPoints = (accessToken: string | null) => {
  const [fixedPoints, setFixedPoints] = useState<FixedPoint[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [maps, setMaps] = useState<Map[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)

  // Load agents and maps on mount
  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const [agentsData, mapsData] = await Promise.all([
          fixedPointsService.getAgents(),
          fixedPointsService.getMaps(),
        ])
        
        if (isMounted) {
          setAgents(agentsData)
          setMaps(mapsData)
        }
      } catch (error) {
        console.error('Failed to load initial data:', error)
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [])

  const fetchFixedPoints = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fixedPointsService.getAll(accessToken)
      setFixedPoints(data)
      setApiStatus({
        message: `Successfully loaded ${data.length} fixed points!`,
        isError: false,
      })
    } catch (error) {
      setApiStatus({
        message: 'Failed to load fixed points',
        isError: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  const toggleFavorite = useCallback(
    async (fixedPointId: number, isFavorited: boolean) => {
      if (!accessToken) {
        setApiStatus({
          message: 'Login required for favorites',
          isError: true,
        })
        return
      }

      try {
        await fixedPointsService.toggleFavorite(fixedPointId, isFavorited, accessToken)
        
        // Update local state
        setFixedPoints((prevPoints) =>
          prevPoints.map((point) =>
            point.id === fixedPointId
              ? {
                  ...point,
                  is_favorited: !isFavorited,
                  favorites_count: isFavorited
                    ? point.favorites_count - 1
                    : point.favorites_count + 1,
                }
              : point
          )
        )
        
        setApiStatus({
          message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
          isError: false,
        })
      } catch (error) {
        setApiStatus({
          message: 'Favorite operation error',
          isError: true,
        })
      }
    },
    [accessToken]
  )

  const processImageUrl = useCallback((url: string) => {
    if (!url) return url
    // Handle local paths (starting with /static/)
    if (url.startsWith('/static/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      return `${apiUrl}${url}`
    }
    return url
  }, [])

  return {
    fixedPoints,
    agents,
    maps,
    isLoading,
    apiStatus,
    fetchFixedPoints,
    toggleFavorite,
    processImageUrl,
    setApiStatus,
  }
}