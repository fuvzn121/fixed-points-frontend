export const processImageUrl = (url: string): string => {
  if (!url) return url
  
  // ローカルパス（/static/や/api/で始まる）の場合はAPIのベースURLを追加
  if (url.startsWith('/static/') || url.startsWith('/api/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return `${apiUrl}${url}`
  }
  
  return url
}