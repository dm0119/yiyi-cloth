// 判断环境：如果是H5开发环境，直接使用后端地址
const isH5Dev = typeof window !== 'undefined' && import.meta.env.DEV

export const config = {
  // H5开发环境直接访问后端，其他环境使用代理
  API_BASE_URL: isH5Dev ? 'http://localhost:3000/api' : '/api',
  IMAGE_BASE_URL: isH5Dev ? 'http://localhost:3000/api' : '/api',
  BASE_URL: isH5Dev ? 'http://localhost:3000' : '',

  getFullImageUrl(path) {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    return this.IMAGE_BASE_URL + path
  }
}

export default config
