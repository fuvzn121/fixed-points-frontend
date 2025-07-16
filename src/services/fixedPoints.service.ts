import { FixedPoint, Agent, Map } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface CreateFixedPointData {
  title: string
  character_id: string
  map_id: string
  steps: {
    step_order: number
    description: string
    image_url?: string | null
    position_x?: number
    position_y?: number
    skill_position_x?: number
    skill_position_y?: number
  }[]
}

export const fixedPointsService = {
  async getAll(token?: string | null): Promise<FixedPoint[]> {
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_URL}/api/fixed-points/`, { headers })
    
    if (!response.ok) {
      throw new Error('Failed to fetch fixed points')
    }
    
    return response.json()
  },

  async getById(id: number, token?: string | null): Promise<FixedPoint> {
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_URL}/api/fixed-points/${id}`, { headers })
    
    if (!response.ok) {
      throw new Error('Failed to fetch fixed point details')
    }
    
    return response.json()
  },

  async create(data: CreateFixedPointData, token: string): Promise<FixedPoint> {
    const response = await fetch(`${API_URL}/api/fixed-points/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to create fixed point')
    }
    
    return response.json()
  },

  async toggleFavorite(id: number, isFavorited: boolean, token: string): Promise<void> {
    const method = isFavorited ? 'DELETE' : 'POST'
    const response = await fetch(`${API_URL}/api/fixed-points/${id}/favorite`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to toggle favorite')
    }
  },

  async uploadImage(file: File, token: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload image')
    }
    
    const data = await response.json()
    return data.url
  },

  async getAgents(): Promise<Agent[]> {
    const response = await fetch(`${API_URL}/api/valorant/agents`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch agents')
    }
    
    return response.json()
  },

  async getMaps(): Promise<Map[]> {
    const response = await fetch(`${API_URL}/api/valorant/maps`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch maps')
    }
    
    return response.json()
  }
}