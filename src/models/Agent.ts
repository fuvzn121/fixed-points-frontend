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