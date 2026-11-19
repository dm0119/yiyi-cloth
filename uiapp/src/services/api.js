import config from '../config.js'

const API_BASE = config.API_BASE_URL

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  // 获取认证令牌
  const token = uni.getStorageSync('user_token')
  
  // 参数验证和数据类型转换
  let requestData = null
  if (options.data && typeof options.data === 'object') {
    // 验证必填字段
    if (options.method === 'POST' || options.method === 'PUT') {
      validateRequestData(options.data)
    }
    // 转换数据类型
    requestData = convertDataTypes(options.data)
  } else if (options.body && typeof options.body === 'object') {
    // 验证必填字段
    if (options.method === 'POST' || options.method === 'PUT') {
      validateRequestData(options.body)
    }
    // 转换数据类型
    requestData = convertDataTypes(options.body)
  }
  
  const config = {
    method: options.method || 'GET',
    header: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  }

  // 如果是FormData，不要设置Content-Type，让浏览器自动设置
  if (options.data instanceof FormData) {
    config.data = options.data
  } else if (requestData) {
    config.header['Content-Type'] = 'application/json'
    config.data = requestData
  }

  // 输出日志
  console.log('API请求:', { url, method: config.method, data: config.data })

  try {
    const res = await uni.request({ url, ...config })
    
    // 输出日志
    console.log('API响应:', res)
    
    // uni.request返回格式：对象包含data、statusCode等字段
    if (res.statusCode < 200 || res.statusCode >= 300) {
      console.error('HTTP错误:', res.statusCode, res.data)
      // 处理认证错误
      if (res.statusCode === 403 || res.statusCode === 401) {
        // 清除过期的token和用户信息
        uni.removeStorageSync('user_token')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('userId')
        uni.removeStorageSync('isLoggedIn')
        // 提示用户重新登录
        uni.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none',
          duration: 2000
        })
        // 延迟跳转到登录页
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/user/login'
          })
        }, 1500)
      } else {
        // 其他错误，显示详细错误信息
        handleApiError(res.data, res.statusCode)
      }
      // 返回错误信息而不是抛出异常，让调用者处理
      return res.data
    }
    return res.data
  } catch (error) {
    console.error('请求异常:', error)
    // 网络错误时，返回更详细的错误信息
    handleNetworkError(error)
    return { success: false, message: error.errMsg || error.message || '网络请求失败' }
  }
}

// 验证请求数据
function validateRequestData(data) {
  // 订单创建验证
  if (data.items && Array.isArray(data.items)) {
    data.items.forEach((item, index) => {
      if (!item.product_name) {
        uni.showToast({
          title: `第${index + 1}个商品缺少商品名称`,
          icon: 'none',
          duration: 2000
        })
        throw new Error(`第${index + 1}个商品缺少商品名称`)
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        uni.showToast({
          title: `第${index + 1}个商品价格必须大于0`,
          icon: 'none',
          duration: 2000
        })
        throw new Error(`第${index + 1}个商品价格必须大于0`)
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        uni.showToast({
          title: `第${index + 1}个商品数量必须大于0`,
          icon: 'none',
          duration: 2000
        })
        throw new Error(`第${index + 1}个商品数量必须大于0`)
      }
    })
  }
}

// 转换数据类型
function convertDataTypes(data) {
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => convertDataTypes(item))
    } else {
      const converted = {}
      for (const [key, value] of Object.entries(data)) {
        if (key === 'price' || key === 'quantity' || key === 'total_amount' || key === 'original_amount') {
          converted[key] = parseFloat(value) || 0
        } else if (key === 'product_id' || key === 'coupon_id' || key === 'status') {
          converted[key] = parseInt(value) || 0
        } else {
          converted[key] = convertDataTypes(value)
        }
      }
      return converted
    }
  }
  return data
}

// 处理API错误
function handleApiError(errorData, statusCode) {
  const errorMessage = errorData?.message || `请求失败 (${statusCode})`
  // 根据错误码进行不同处理
  switch (statusCode) {
    case 401:
      // 未授权，跳转到登录页
      uni.removeStorageSync('user_token')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('userId')
      uni.removeStorageSync('isLoggedIn')
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/user/login'
        })
      }, 1500)
      break
    case 403:
      // 权限不足
      uni.showToast({
        title: '权限不足，请联系管理员',
        icon: 'none',
        duration: 2000
      })
      break
    case 404:
      // 资源不存在
      uni.showToast({
        title: '请求的资源不存在',
        icon: 'none',
        duration: 2000
      })
      break
    default:
      // 其他错误
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
  }
}

// 处理网络错误
function handleNetworkError(error) {
  console.error('网络错误:', error)
  if (error.errMsg && error.errMsg.includes('timeout')) {
    uni.showToast({
      title: '请求超时，请稍后重试',
      icon: 'none',
      duration: 2000
    })
  } else if (error.errMsg && error.errMsg.includes('network')) {
    uni.showToast({
      title: '网络连接失败，请检查网络设置',
      icon: 'none',
      duration: 2000
    })
  } else {
    uni.showToast({
      title: error.errMsg || error.message || '网络请求失败',
      icon: 'none',
      duration: 2000
    })
  }
}

export const productApi = {
  getList() {
    return request('/mobile/products')
  },
  getById(id) {
    return request(`/mobile/products/${id}`)
  },
  getSkus(productId) {
    return request(`/mobile/products/${productId}/skus`)
  },
  getByCategory(categoryId, sort = 'newest', includeChildren = false) {
    return request(`/mobile/products/category/${categoryId}?sort=${sort}&include_children=${includeChildren}`)
  },
  search(keyword) {
    return request(`/mobile/products/search?keyword=${encodeURIComponent(keyword)}`)
  },
  // 获取热门标签
  getPopularTags(params = {}) {
    return request(`/products/tags/popular`, params)
  },
  // 按标签筛选商品
  getByTag(tag, params = {}) {
    return request(`/products/tag/${encodeURIComponent(tag)}`, params)
  }
}

export const categoryApi = {
  getList() {
    return request('/mobile/categories')
  },
  getById(id) {
    return request(`/mobile/categories/${id}`)
  },
  getTree() {
    return request('/mobile/categories/tree')
  },
  getChildren(parentId) {
    return request(`/mobile/categories/children/${parentId}`)
  }
}

export const orderApi = {
  create(data) {
    return request('/mobile/orders', { method: 'POST', body: data })
  },
  getList(status = null) {
    let url = '/mobile/orders'
    if (status !== null) {
      url += `?status=${status}`
    }
    return request(url)
  },
  getById(id) {
    return request(`/mobile/orders/${id}`)
  },
  updateStatus(id, status) {
    return request(`/mobile/orders/${id}/status`, { method: 'PUT', body: { status } })
  },
  getReviewable(id) {
    return request(`/mobile/orders/${id}/reviewable`)
  },
  // 交易记录
  getTransactions(page = 1, limit = 20) {
    return request(`/mobile/orders/transactions?page=${page}&limit=${limit}`)
  }
}

export const reviewApi = {
  create(data) {
    return request('/mobile/reviews', { method: 'POST', body: data })
  },
  getByProduct(productId) {
    return request(`/mobile/reviews/product/${productId}`)
  },
  getByOrder(orderId) {
    return request(`/mobile/reviews/order/${orderId}`)
  },
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return request('/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
  },
  uploadReviewImages(files) {
    // 由于 uni-app 的限制，我们需要使用 uni.uploadFile 来上传文件
    // 这里我们返回一个 Promise，以便在前端使用 async/await
    return new Promise((resolve, reject) => {
      if (files.length === 0) {
        resolve({ success: true, data: [] })
        return
      }
      
      // 获取认证 token（移动端存储的 key 是 user_token）
      const token = uni.getStorageSync('user_token') || uni.getStorageSync('token') || uni.getStorageSync('admin_token')
      
      // 对于单个文件上传
      const file = files[0]
      uni.uploadFile({
        url: `${config.API_BASE_URL}/upload/review`,
        filePath: file.path,
        name: 'images',
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        formData: {},
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data)
            if (data.success) {
              resolve(data)
            } else {
              reject(new Error(data.message || '图片上传失败'))
            }
          } catch (e) {
            reject(new Error('上传响应解析失败'))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '上传失败'))
        }
      })
    })
  },
  getAll(params = {}) {
    let url = '/reviews'
    const queryParams = []
    
    if (params.page) queryParams.push(`page=${params.page}`)
    if (params.limit) queryParams.push(`limit=${params.limit}`)
    if (params.status !== undefined) queryParams.push(`status=${params.status}`)
    if (params.product_id) queryParams.push(`product_id=${params.product_id}`)
    if (params.order_id) queryParams.push(`order_id=${params.order_id}`)
    
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&')
    }
    
    return request(url)
  },
  updateStatus(id, status) {
    return request(`/reviews/${id}/status`, { method: 'PUT', body: { status } })
  },
  delete(id) {
    return request(`/reviews/${id}`, { method: 'DELETE' })
  },
  getStatsByProduct(productId) {
    return request(`/mobile/reviews/stats/product/${productId}`)
  }
}

export const userApi = {
  // 注册
  register(data) {
    return request('/mobile/users/register', { method: 'POST', body: data })
  },
  
  // 登录
  login(data) {
    return request('/mobile/users/login', { method: 'POST', body: data })
  },
  
  // 获取用户信息
  getUserInfo(userId) {
    return request(`/mobile/users/${userId}`)
  },
  
  // 更新用户信息
  updateUserInfo(userId, data) {
    return request(`/mobile/users/${userId}`, { method: 'PUT', body: data })
  },
  
  // 修改密码
  changePassword(userId, data) {
    return request(`/mobile/users/${userId}/password`, { method: 'PUT', body: data })
  },
  
  // 忘记密码：验证用户名和姓名
  verifyUserInfo(data) {
    return request('/mobile/users/verify-info', { method: 'POST', body: data })
  },
  
  // 忘记密码：重置密码
  resetPassword(userId, data) {
    return request(`/mobile/users/${userId}/reset-password`, { method: 'PUT', body: data })
  }
}

export const hotProductApi = {
  // 获取热门推荐商品（移动端）
  getHotProducts(sort) {
    let url = '/mobile/products/hot-products'
    if (sort) {
      url += `?sort=${sort}`
    }
    return request(url)
  }
}

export const newProductApi = {
  // 获取新品推荐商品（移动端）
  getNewProducts(sort) {
    let url = '/mobile/products/new-products'
    if (sort) {
      url += `?sort=${sort}`
    }
    return request(url)
  }
}

export const conversationApi = {
  // 创建会话
  createConversation(data) {
    return request('/conversations', { method: 'POST', body: data })
  },
  
  // 获取会话列表
  getConversations(params = {}) {
    let url = '/conversations'
    const queryParams = []
    
    if (params.userId) queryParams.push(`userId=${params.userId}`)
    if (params.role) queryParams.push(`role=${params.role}`)
    if (params.status) queryParams.push(`status=${params.status}`)
    
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&')
    }
    
    return request(url)
  },
  
  // 获取会话详情
  getConversationDetail(conversationId) {
    return request(`/conversations/${conversationId}`)
  },
  
  // 发送消息
  sendMessage(conversationId, data) {
    return request(`/conversations/${conversationId}/messages`, { method: 'POST', body: data })
  },
  
  // 获取消息历史
  getMessageHistory(conversationId, params = {}) {
    let url = `/conversations/${conversationId}/messages`
    const queryParams = []
    
    if (params.page) queryParams.push(`page=${params.page}`)
    if (params.pageSize) queryParams.push(`pageSize=${params.pageSize}`)
    
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&')
    }
    
    return request(url)
  },
  
  // 标记消息为已读
  markMessagesAsRead(conversationId, data) {
    return request(`/conversations/${conversationId}/messages/read`, { method: 'PUT', body: data })
  },
  
  // 关闭会话
  closeConversation(conversationId) {
    return request(`/conversations/${conversationId}/close`, { method: 'PUT' })
  }
}

export const couponApi = {
  // 获取可领取优惠券
  getAvailable(userId) {
    return request(`/mobile/coupons/available?userId=${userId}`)
  },
  
  // 领取优惠券
  receive(data) {
    return request('/mobile/coupons/receive', { method: 'POST', body: data })
  },
  
  // 获取用户优惠券
  getUserCoupons(userId, status = '') {
    let url = `/mobile/coupons/user?userId=${userId}`
    if (status) {
      url += `&status=${status}`
    }
    return request(url)
  },
  
  // 检查商品可用优惠券
  checkProductCoupons(userId, productId) {
    return request(`/mobile/coupons/check-product?userId=${userId}&productId=${productId}`)
  },
  
  // 推荐最优优惠券
  recommendBestCoupon(data) {
    return request('/mobile/coupons/recommend', { method: 'POST', body: data })
  },

  // 获取优惠券关联的商品详情
  getCouponProducts(couponId) {
    return request(`/mobile/coupons/${couponId}/products`)
  },
  
  // 使用优惠券
  useCoupon(data) {
    return request('/mobile/coupons/use', { method: 'POST', body: data })
  }
}

export const favoritesApi = {
  // 获取收藏列表
  getList(params = {}) {
    const userId = uni.getStorageSync('userId');
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return Promise.reject(new Error('用户ID不能为空'));
    }
    let url = `/mobile/favorites?userId=${userId}`
    const queryParams = []
    
    if (params.page) queryParams.push(`page=${params.page}`)
    if (params.limit) queryParams.push(`limit=${params.limit}`)
    if (params.sort) queryParams.push(`sort=${params.sort}`)
    
    if (queryParams.length > 0) {
      url += '&' + queryParams.join('&')
    }
    
    return request(url)
  },
  
  // 添加收藏
  add(productId) {
    const userId = uni.getStorageSync('userId');
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return Promise.reject(new Error('用户ID不能为空'));
    }
    return request('/mobile/favorites', { method: 'POST', body: { product_id: productId, userId } })
  },
  
  // 取消收藏
  remove(productId) {
    const userId = uni.getStorageSync('userId');
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return Promise.reject(new Error('用户ID不能为空'));
    }
    return request(`/mobile/favorites/${productId}?userId=${userId}`, { method: 'DELETE' })
  },
  
  // 检查是否已收藏
  check(productId) {
    const userId = uni.getStorageSync('userId');
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return Promise.reject(new Error('用户ID不能为空'));
    }
    return request(`/mobile/favorites/check/${productId}?userId=${userId}`)
  }
}

// 地址相关API
export const addressApi = {
  // 获取地址列表
  getList(userId) {
    return request(`/mobile/addresses?userId=${userId}`)
  },
  
  // 获取地址详情
  getById(id, userId) {
    return request(`/mobile/addresses/${id}?userId=${userId}`)
  },
  
  // 新增地址
  create(data) {
    return request('/mobile/addresses', { method: 'POST', body: data })
  },
  
  // 更新地址
  update(id, data) {
    return request(`/mobile/addresses/${id}`, { method: 'PUT', body: data })
  },
  
  // 删除地址
  delete(id, userId) {
    return request(`/mobile/addresses/${id}?userId=${userId}`, { method: 'DELETE' })
  },
  
  // 设置默认地址
  setDefault(id, userId) {
    return request(`/mobile/addresses/${id}/default?userId=${userId}`, { method: 'PUT' })
  }
}

// 简化的地址API调用方法，方便在组件中直接使用
export function getAddresses(userId) {
  // 优先使用传递的userId，其次从本地存储中获取
  let currentUserId = userId || uni.getStorageSync('userId');
  // 校验用户ID是否存在
  if (!currentUserId) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return Promise.reject(new Error('用户ID不能为空'));
  }
  return request(`/mobile/addresses?userId=${currentUserId}`)
}

export function getAddressDetail(id, userId) {
  // 优先使用传递的userId，其次从本地存储中获取
  let currentUserId = userId || uni.getStorageSync('userId');
  // 校验用户ID是否存在
  if (!currentUserId) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return Promise.reject(new Error('用户ID不能为空'));
  }
  return request(`/mobile/addresses/${id}?userId=${currentUserId}`)
}

export function createAddress(data) {
  // 优先使用传递的userId，其次从本地存储中获取
  let userId = data.userId || uni.getStorageSync('userId');
  // 校验用户ID是否存在
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return Promise.reject(new Error('用户ID不能为空'));
  }
  // 将userId添加到数据中
  return request('/mobile/addresses', { method: 'POST', body: { ...data, userId } })
}

export function updateAddress(data) {
  // 优先使用传递的userId，其次从本地存储中获取
  let userId = data.userId || uni.getStorageSync('userId');
  // 校验用户ID是否存在
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return Promise.reject(new Error('用户ID不能为空'));
  }
  // 将userId添加到数据中
  return request(`/mobile/addresses/${data.id}`, { method: 'PUT', body: { ...data, userId } })
}

export function deleteAddress(id, userId) {
  // 优先使用传递的userId，其次从本地存储中获取
  let currentUserId = userId || uni.getStorageSync('userId');
  // 校验用户ID是否存在
  if (!currentUserId) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return Promise.reject(new Error('用户ID不能为空'));
  }
  return request(`/mobile/addresses/${id}?userId=${currentUserId}`, { method: 'DELETE' })
}

export function setDefaultAddress(id, userId) {
  // 优先使用传递的userId，其次从本地存储中获取
  let currentUserId = userId || uni.getStorageSync('userId');
  // 校验用户ID是否存在
  if (!currentUserId) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return Promise.reject(new Error('用户ID不能为空'));
  }
  return request(`/mobile/addresses/${id}/default?userId=${currentUserId}`, { method: 'PUT' })
}

// 默认导出所有API
export const historyApi = {
  // 创建浏览记录
  create(data) {
    const userId = uni.getStorageSync('userId');
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return Promise.reject(new Error('用户ID不能为空'));
    }
    return request('/history', { method: 'POST', body: { ...data, user_id: userId } })
  },
  
  // 获取用户的浏览记录
  getByUser() {
    const userId = uni.getStorageSync('userId');
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return Promise.reject(new Error('用户ID不能为空'));
    }
    return request(`/history/user/${userId}`)
  },
  
  // 清空用户的浏览记录
  clear() {
    const userId = uni.getStorageSync('userId');
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return Promise.reject(new Error('用户ID不能为空'));
    }
    return request('/history/clear', { method: 'POST', body: { user_id: userId } })
  },
  
  // 同步浏览记录
  sync(data) {
    const userId = uni.getStorageSync('userId');
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return Promise.reject(new Error('用户ID不能为空'));
    }
    return request('/history/sync', { method: 'POST', body: { ...data, user_id: userId } })
  }
}

export const zoneApi = {
  // 获取专区列表
  getList() {
    return request('/mobile/zones')
  },
  
  // 获取专区详情
  getById(id) {
    return request(`/mobile/zones/${id}`)
  },
  
  // 获取专区商品列表
  getZoneProducts(zoneId) {
    return request(`/mobile/zones/${zoneId}/products`)
  }
}

export const walletApi = {
  // 获取钱包信息
  getWallet(userId) {
    return request(`/mobile/wallets/${userId}`)
  },
  
  // 获取交易记录
  getTransactions(userId) {
    return request(`/mobile/wallets/${userId}/transactions`)
  },
  
  // 钱包充值
  recharge(userId, amount, description) {
    return request('/mobile/wallets/recharge', { method: 'POST', body: { user_id: userId, amount, description } })
  },
  
  // 钱包提现
  withdraw(userId, amount) {
    return request('/mobile/wallets/withdraw', { method: 'POST', body: { user_id: userId, amount } })
  },
  
  // 钱包支付
  pay(userId, orderId, amount) {
    return request('/mobile/wallets/pay', { method: 'POST', body: { user_id: userId, order_id: orderId, amount } })
  },
  
  // 模拟支付宝/微信支付
  simulatePay(userId, orderId, amount, paymentMethod) {
    return request('/mobile/payments/simulate', { method: 'POST', body: { user_id: userId, order_id: orderId, amount, payment_method: paymentMethod } })
  }
}

export const discussionApi = {
  // 获取讨论列表
  getDiscussions() {
    return request('/mobile/discussions')
  },
  // 创建讨论
  createDiscussion(data) {
    return request('/mobile/discussions', { method: 'POST', body: data })
  },

  // 获取讨论详情
  getDiscussionDetail(id) {
    return request(`/mobile/discussions/${id}`)
  },

  // 删除讨论
  deleteDiscussion(id) {
    return request(`/mobile/discussions/${id}`, { method: 'DELETE' })
  },

  // 获取评论列表
  getComments(discussionId) {
    return request(`/mobile/discussions/${discussionId}/comments`)
  },

  // 创建评论
  createComment(discussionId, data) {
    return request(`/mobile/discussions/${discussionId}/comments`, { method: 'POST', body: data })
  },

  // 删除评论
  deleteComment(id) {
    return request(`/mobile/discussions/comments/${id}`, { method: 'DELETE' })
  },

  // 举报讨论
  reportDiscussion(data) {
    return request('/mobile/reports', { method: 'POST', body: data })
  },

  // 上传评论图片
  uploadCommentImage(file) {
    return new Promise((resolve, reject) => {
      // 获取认证令牌
      const token = uni.getStorageSync('userToken') || uni.getStorageSync('token')

      uni.uploadFile({
        url: `${config.API_BASE_URL}/upload/review`,
        filePath: file,
        name: 'images',
        header: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        formData: {},
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data)
            if (data.success && data.data && data.data.length > 0) {
              resolve(data.data[0])
            } else {
              reject(new Error(data.message || '图片上传失败'))
            }
          } catch (e) {
            reject(new Error('上传响应解析失败'))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '上传失败'))
        }
      })
    })
  }
}

// 店铺关注（收藏）API
export const shopFollowApi = {
  // 获取关注的店铺列表
  getList(params = {}) {
    const userId = uni.getStorageSync('userId')
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return Promise.reject(new Error('用户ID不能为空'))
    }
    let url = `/mobile/shop-follows?userId=${userId}`
    const queryParams = []

    if (params.page) queryParams.push(`page=${params.page}`)
    if (params.limit) queryParams.push(`limit=${params.limit}`)

    if (queryParams.length > 0) {
      url += '&' + queryParams.join('&')
    }

    return request(url)
  },

  // 关注店铺
  add(shopId) {
    const userId = uni.getStorageSync('userId')
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return Promise.reject(new Error('用户ID不能为空'))
    }
    return request('/mobile/shop-follows', { method: 'POST', body: { shop_id: shopId, userId } })
  },

  // 取消关注
  remove(shopId) {
    const userId = uni.getStorageSync('userId')
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return Promise.reject(new Error('用户ID不能为空'))
    }
    return request(`/mobile/shop-follows/${shopId}?userId=${userId}`, { method: 'DELETE' })
  },

  // 检查是否已关注
  check(shopId) {
    const userId = uni.getStorageSync('userId')
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return Promise.reject(new Error('用户ID不能为空'))
    }
    return request(`/mobile/shop-follows/check/${shopId}?userId=${userId}`)
  }
}

// 店铺搜索 API
export const shopApi = {
  // 搜索店铺
  search(keyword) {
    return request(`/mobile/merchants/search?keyword=${keyword}`)
  },
  
  // 获取店铺信息
  getShopInfo(shopId) {
    return request(`/mobile/merchants/${shopId}`)
  },
  
  // 获取店铺商品列表
  getShopProducts(shopId, params = {}) {
    let url = `/mobile/merchants/${shopId}/products`
    const queryParams = []

    if (params.sort) queryParams.push(`sort=${params.sort}`)
    if (params.page) queryParams.push(`page=${params.page}`)
    if (params.pageSize) queryParams.push(`pageSize=${params.pageSize}`)
    if (params.categoryId) queryParams.push(`categoryId=${params.categoryId}`)

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&')
    }

    return request(url)
  }
}

// 店铺相关 API
export const merchantApi = {
  // 获取店铺信息
  getShopInfo(shopId) {
    return request(`/mobile/merchants/${shopId}`)
  },

  // 获取店铺商品列表
  getShopProducts(shopId, params = {}) {
    let url = `/mobile/merchants/${shopId}/products`
    const queryParams = []

    if (params.sort) queryParams.push(`sort=${params.sort}`)
    if (params.page) queryParams.push(`page=${params.page}`)
    if (params.pageSize) queryParams.push(`pageSize=${params.pageSize}`)
    if (params.categoryId) queryParams.push(`categoryId=${params.categoryId}`)

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&')
    }

    return request(url)
  },

  // 获取店铺分类
  getShopCategories(shopId) {
    return request(`/mobile/merchants/${shopId}/categories`)
  },

  // 合并支付
  mergePay(orderIds) {
    return request('/mobile/orders/merge-pay', { method: 'POST', body: { order_ids: orderIds } })
  },

  // 获取入驻申请公告列表（登录页使用）
  getAnnouncements(params = {}) {
    let url = '/merchants/announcements'
    const queryParams = []

    if (params.status) queryParams.push(`status=${params.status}`)
    if (params.limit) queryParams.push(`limit=${params.limit}`)

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&')
    }

    return request(url)
  }
}

// 售后 API
export const afterSaleApi = {
  // 申请售后
  apply(orderId, data) {
    return request(`/mobile/orders/${orderId}/after-sale`, { method: 'POST', body: data })
  },
  // 取消售后
  cancel(orderId) {
    return request(`/mobile/orders/${orderId}/after-sale/cancel`, { method: 'POST' })
  },
  // 填写退货物流
  fillReturnLogistics(orderId, data) {
    return request(`/mobile/orders/${orderId}/after-sale/return-logistics`, { method: 'POST', body: data })
  },
  // 获取售后记录列表
  getList(status) {
    let url = '/mobile/after-sales'
    if (status !== undefined && status !== '') {
      url += `?status=${status}`
    }
    return request(url)
  },
  // 获取售后详情
  getById(id) {
    return request(`/mobile/after-sales/${id}`)
  }
}

// 支付密码 API
export const payPasswordApi = {
  // 获取支付密码状态
  getStatus() {
    return request('/mobile/pay-password/status')
  },
  
  // 设置支付密码
  set(password, oldPassword = null) {
    return request('/mobile/pay-password/set', { 
      method: 'POST', 
      body: { pay_password: password, confirm_password: password, old_password: oldPassword } 
    })
  },
  
  // 验证支付密码
  verify(password) {
    return request('/mobile/pay-password/verify', { 
      method: 'POST', 
      body: { pay_password: password } 
    })
  }
}

// 实名认证 API
export const realNameApi = {
  // 获取实名认证状态
  getStatus() {
    return request('/real-name-applications/status')
  },
  
  // 获取我的实名认证信息
  getMyInfo() {
    return request('/real-name-applications/my')
  },
  
  // 提交实名认证申请
  apply(data) {
    return request('/real-name-applications/apply', { method: 'POST', body: data })
  },
  
  // 取消待审核的申请
  cancelPending() {
    return request('/real-name-applications/pending', { method: 'DELETE' })
  },
  
  // 上传图片
  uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('user_token') || uni.getStorageSync('token')
      
      uni.uploadFile({
        url: `${config.API_BASE_URL}/upload/single`,
        filePath: filePath,
        name: 'file',
        header: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        formData: {
          type: 'realname'
        },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data)
            if (data.success && data.data) {
              resolve(data.data.url || data.data.path)
            } else {
              reject(new Error(data.message || '图片上传失败'))
            }
          } catch (e) {
            reject(new Error('上传响应解析失败'))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '上传失败'))
        }
      })
    })
  }
}

// 站内信相关API
export const messageApi = {
  // 发送站内信
  sendMessage: (data) => request('/messages/send', { method: 'POST', body: data }),
  
  // 获取我的站内信列表
  getMessages: (params = {}) => request('/messages/list', params),
  
  // 获取消息详情
  getMessageDetail: (id) => request(`/messages/${id}`),
  
  // 标记消息为已读
  markAsRead: (id) => request(`/messages/${id}/read`, { method: 'PUT' }),
  
  // 标记消息为重要
  markAsImportant: (id) => request(`/messages/${id}/important`, { method: 'PUT' }),
  
  // 删除消息
  deleteMessage: (id) => request(`/messages/${id}`, { method: 'DELETE' }),
  
  // 获取未读消息数
  getUnreadCount: () => request('/messages/unread/count'),
  
  // 获取买家列表（仅运营人员）
  getBuyers: (params = {}) => request('/messages/buyers/list', params),
  
  // 获取最近消息
  getRecentMessages: (limit = 5) => request(`/messages/recent?limit=${limit}`),
  
  // 检查新消息
  checkNewMessages: () => request('/messages/unread/count')
}

export default {
  productApi,
  categoryApi,
  orderApi,
  reviewApi,
  userApi,
  hotProductApi,
  newProductApi,
  conversationApi,
  couponApi,
  favoritesApi,
  shopFollowApi,
  addressApi,
  historyApi,
  walletApi,
  zoneApi,
  discussionApi,
  merchantApi,
  payPasswordApi,
  afterSaleApi,
  messageApi
}
