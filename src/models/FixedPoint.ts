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