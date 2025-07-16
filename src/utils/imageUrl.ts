export const processImageUrl = (url: string): string => {
  console.log('[processImageUrl] Input:', url)
  if (!url) return url
  
  // ローカルパス（/static/や/api/で始まる）の場合はAPIのベースURLを追加
  if (url.startsWith('/static/') || url.startsWith('/api/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const result = `${apiUrl}${url}`
    console.log('[processImageUrl] Output:', result)
    return result
  }
  
  console.log('[processImageUrl] No processing needed')
  return url
}