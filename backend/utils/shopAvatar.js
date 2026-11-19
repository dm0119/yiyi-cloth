/**
 * 店铺头像工具函数
 * 用于生成默认头像的渐变色
 */

/**
 * 根据店铺 ID 生成默认头像的渐变色
 * @param {number} shopId - 店铺 ID
 * @returns {Object} - 包含渐变 CSS 和主色调
 */
function generateAvatarGradient(shopId) {
  const colors = [
    { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
    { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f093fb' },
    { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#4facfe' },
    { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#43e97b' },
    { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#fa709a' },
    { gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#a8edea' },
    { gradient: 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)', color: '#fdcbf1' },
    { gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: '#ff9a9e' },
    { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
    { gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', color: '#e0c3fc' }
  ]
  
  // 根据 shopId 选择固定颜色
  const index = shopId ? shopId % colors.length : 0
  return colors[index]
}

/**
 * 获取店铺名称首字
 * @param {string} shopName - 店铺名称
 * @returns {string} - 首字
 */
function getShopNameFirstChar(shopName) {
  if (!shopName) return '店'
  // 去除空格和特殊字符
  const cleanName = shopName.trim()
  if (cleanName.length === 0) return '店'
  return cleanName.charAt(0)
}

/**
 * 生成店铺头像数据
 * @param {Object} shop - 店铺对象
 * @returns {Object} - 头像数据
 */
function generateShopAvatarData(shop) {
  const { id, name, logo_url } = shop
  
  if (logo_url) {
    return {
      type: 'image',
      url: logo_url
    }
  }
  
  const gradient = generateAvatarGradient(id)
  const firstChar = getShopNameFirstChar(name)
  
  return {
    type: 'default',
    gradient: gradient.gradient,
    color: gradient.color,
    text: firstChar
  }
}

module.exports = {
  generateAvatarGradient,
  getShopNameFirstChar,
  generateShopAvatarData
}
