// API工具函数
const API_BASE = 'http://localhost:3000/api'

// 获取token
function getToken(url) {
  // 优先使用 mobile_token
  if (url.startsWith('/mobile/')) {
    return localStorage.getItem('mobile_token') || localStorage.getItem('user_token')
  }
  return localStorage.getItem('admin_token')
}

// 统一的 request 函数
export async function request(url, options = {}) {
  const token = getToken(url)

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` })
  }

  // 处理请求体
  let body = options.body || options.data
  const isFormData = body instanceof FormData
  const config = {
    method: options.method || (body ? 'POST' : 'GET'),
    headers: isFormData ? { ...options.headers, ...(token && { 'Authorization': `Bearer ${token}` }) } : headers,
    ...options
  }

  // FormData 不需要 JSON.stringify
  if (body && !isFormData && typeof body === 'object') {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, config)
    return await response.json()
  } catch (error) {
    console.error('API 请求失败:', error)
    throw error
  }
}

export const api = {
  async get(url) {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      return await response.json()
    } catch (error) {
      console.error('API GET请求失败:', error)
      throw error
    }
  },

  async post(url, data) {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error('API POST请求失败:', error)
      throw error
    }
  },

  async put(url, data) {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error('API PUT请求失败:', error)
      throw error
    }
  },

  async delete(url) {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      return await response.json()
    } catch (error) {
      console.error('API DELETE请求失败:', error)
      throw error
    }
  }
}