export interface User {
  id: number
  username: string
  email: string
  auth_provider: string
  avatar_url?: string
  created_at: string
}

export interface Agent {
  uuid: string
  displayName: string
  description: string
  displayIcon: string
  role: {
    uuid: string
    displayName: string
  } | null
}

export interface Map {
  uuid: string
  displayName: string
  coordinates: string
  displayIcon: string
  splash: string
}

export interface FixedPointStep {
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

export interface FixedPoint {
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

export interface MapPosition {
  x: number
  y: number
}

export interface ApiStatus {
  message: string
  isError: boolean
}