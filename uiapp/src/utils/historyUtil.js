// 浏览记录工具函数

const HISTORY_KEY = 'browseHistory'
const MAX_HISTORY_COUNT = 50 // 最多保存50条浏览记录

/**
 * 保存浏览记录
 * @param {Object} product - 商品信息
 * @param {string} product.id - 商品ID
 * @param {string} product.name - 商品名称
 * @param {number} product.price - 商品价格
 * @param {string} product.image - 商品图片
 */
export function saveBrowseHistory(product) {
  try {
    const history = uni.getStorageSync(HISTORY_KEY) || []
    
    // 移除已存在的相同商品记录
    const filteredHistory = history.filter(item => item.product_id !== product.id)
    
    // 创建新的浏览记录
    const newRecord = {
      id: Date.now().toString(),
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      image: product.image,
      viewed_at: new Date().toISOString()
    }
    
    // 添加到历史记录开头
    filteredHistory.unshift(newRecord)
    
    // 限制历史记录数量
    const limitedHistory = filteredHistory.slice(0, MAX_HISTORY_COUNT)
    
    // 保存到本地存储
    uni.setStorageSync(HISTORY_KEY, limitedHistory)
    
    return true
  } catch (error) {
    console.error('保存浏览记录失败:', error)
    return false
  }
}

/**
 * 获取浏览记录
 * @returns {Array} 浏览记录列表
 */
export function getBrowseHistory() {
  try {
    const history = uni.getStorageSync(HISTORY_KEY) || []
    // 按浏览时间倒序排序
    return history.sort((a, b) => new Date(b.viewed_at) - new Date(a.viewed_at))
  } catch (error) {
    console.error('获取浏览记录失败:', error)
    return []
  }
}

/**
 * 清空浏览记录
 * @returns {boolean} 是否清空成功
 */
export function clearBrowseHistory() {
  try {
    uni.removeStorageSync(HISTORY_KEY)
    return true
  } catch (error) {
    console.error('清空浏览记录失败:', error)
    return false
  }
}

/**
 * 删除单条浏览记录
 * @param {string} recordId - 记录ID
 * @returns {boolean} 是否删除成功
 */
export function deleteBrowseHistory(recordId) {
  try {
    const history = uni.getStorageSync(HISTORY_KEY) || []
    const filteredHistory = history.filter(item => item.id !== recordId)
    uni.setStorageSync(HISTORY_KEY, filteredHistory)
    return true
  } catch (error) {
    console.error('删除浏览记录失败:', error)
    return false
  }
}

/**
 * 获取浏览记录数量
 * @returns {number} 浏览记录数量
 */
export function getBrowseHistoryCount() {
  try {
    const history = uni.getStorageSync(HISTORY_KEY) || []
    return history.length
  } catch (error) {
    console.error('获取浏览记录数量失败:', error)
    return 0
  }
}