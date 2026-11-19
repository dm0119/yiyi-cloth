import { ElMessage } from 'element-plus'

export const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  // 根据不同类型的请求使用不同的 token
  let token
  
  // 调试日志：显示每个请求使用的 token
  console.log(`🔵 请求: ${endpoint}`, {
    method: options.method || 'GET',
    'admin_token 存在': !!localStorage.getItem('admin_token'),
    'merchant_token 存在': !!localStorage.getItem('merchant_token'),
    'user_token 存在': !!localStorage.getItem('user_token')
  })
  
  // 优先检查是否是商家审核相关的 API（需要管理员权限）
  if (endpoint.startsWith('/merchants/pending') || endpoint.startsWith('/merchants/reviewed') || (endpoint.startsWith('/merchants/review') && !endpoint.startsWith('/merchants/reviews'))) {
    // 商家审核相关的 API 需要管理员权限，使用 admin_token
    // 注意：/merchants/reviews（商家查看自己的评价）不在此列
    token = localStorage.getItem('admin_token')
  } else if (endpoint.startsWith('/merchants/apply') || endpoint.startsWith('/merchants/status')) {
    // 商家申请相关 API（不需要登录或商家登录）
    token = localStorage.getItem('merchant_token')
  } else if (endpoint.startsWith('/merchants/shops/') || endpoint.startsWith('/merchants/shop/')) {
    // 商家访问自己店铺的资源（商品、订单等）使用 merchant_token
    // 管理员访问特定店铺资源使用 admin_token
    // 优先检查是否有 admin_token，没有则使用 merchant_token
    token = localStorage.getItem('admin_token') || localStorage.getItem('merchant_token')
  } else if (endpoint === '/merchants/shops' || endpoint.startsWith('/merchants/shops?') || endpoint === '/merchants/non-brand-shops' || endpoint.startsWith('/merchants/non-brand-shops?')) {
    // 管理员获取所有店铺列表，使用 admin_token（支持带查询参数的 URL）
    token = localStorage.getItem('admin_token')
  } else if (endpoint === '/merchants/shop') {
    // 商家获取自己店铺信息，使用 merchant_token
    token = localStorage.getItem('merchant_token')
  } else if (endpoint.startsWith('/merchants/')) {
    // 商家自身的 API（如订单、商品管理、评价查看），使用 merchant_token
    token = localStorage.getItem('merchant_token')
  } else if (endpoint.startsWith('/reviews/') || endpoint.startsWith('/coupons')) {
    // 评价管理和优惠券管理 API（商家管理自己店铺的资源，管理员管理所有资源）
    // 优先使用 merchant_token，如果没有则使用 admin_token
    token = localStorage.getItem('merchant_token') || localStorage.getItem('admin_token')
  } else if (endpoint.startsWith('/products/') || endpoint === '/products' || endpoint.startsWith('/categories/') || endpoint === '/categories') {
    // 商品和分类管理 API（商家管理自己店铺的商品，管理员管理所有商品）
    // 优先使用 merchant_token，如果没有则使用 admin_token
    token = localStorage.getItem('merchant_token') || localStorage.getItem('admin_token')
  } else if (endpoint.startsWith('/upload/')) {
    // 上传接口（商家和管理员都需要使用）
    // 优先使用 merchant_token，如果没有则使用 admin_token
    token = localStorage.getItem('merchant_token') || localStorage.getItem('admin_token')
  } else if (endpoint.startsWith('/mobile/')) {
    // 移动端 API 使用 user_token
    token = localStorage.getItem('user_token')
  } else {
    // 其他 API，使用 admin_token
    token = localStorage.getItem('admin_token')
  }
  
  const isFormData = options.body instanceof FormData

  // 参数验证（跳过 FormData）
  if (options.body && typeof options.body === 'object' && !isFormData) {
    // 验证必填字段
    if (options.method === 'POST' || options.method === 'PUT') {
      validateRequestData(options.body, endpoint)
    }
    // 转换数据类型
    options.body = convertDataTypes(options.body)
  }
  
  const headers = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  }

  // 非 FormData 请求才设置 Content-Type（FormData 由浏览器自动设置含 boundary）
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...options
  }

  if (options.body && typeof options.body === 'object' && !isFormData) {
    config.body = JSON.stringify(options.body)
  }

  // 无条件输出所有请求日志，便于调试
  console.log('🔵 API请求:', {
    url,
    endpoint,
    method: config.method,
    token: token ? `存在 (${token.substring(0, 20)}...)` : '❌ 不存在',
    'admin_token in localStorage': !!localStorage.getItem('admin_token'),
    'merchant_token in localStorage': !!localStorage.getItem('merchant_token'),
    'user_token in localStorage': !!localStorage.getItem('user_token'),
    headers: config.headers
  })

  try {
    // 添加超时处理
    const controller = new AbortController()
    // 图片上传设置更长的超时时间（60 秒），因为需要压缩处理
    const timeout = endpoint.startsWith('/upload/') ? 60000 : 30000
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // 尝试解析响应体
    let data = null
    try {
      const text = await response.text()
      if (text) {
        data = JSON.parse(text)
      }
    } catch (e) {
      // 响应体解析失败，使用默认错误消息
    }

    // 检查 HTTP 状态码
    if (!response.ok) {
      const status = response.status
      let errorMessage = `请求失败 (${status})`

      // 尝试从响应体中获取错误消息
      if (data && data.message) {
        errorMessage = data.message
      }

      // 创建包含状态码和错误消息的 Error
      const httpError = new Error(errorMessage)
      httpError.status = status
      httpError.isAuthError = status === 401 || status === 403
      throw httpError
    }

    // 只在开发环境输出日志
    if (import.meta.env.MODE === 'development') {
      console.log('API响应:', data)
    }

    // 如果 data 为 null，说明响应体为空，但状态码是 200
    if (data === null) {
      return { success: true, data: null }
    }

    // 兼容两种响应格式：
    // 1. {success: true, data: ...} - 新格式
    // 2. {data: ...} 或 {error: ...} - 旧格式（向后兼容）
    if (data.success !== undefined && !data.success) {
      throw new Error(data.message || '请求失败')
    }

    // 如果是旧格式且有 error 字段，说明是错误响应
    if (data.error && data.success === undefined) {
      throw new Error(data.error || '请求失败')
    }

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('请求超时:', error)
      throw new Error('请求超时，请稍后重试')
    }

    console.error('API请求错误:', error.message, '状态码:', error.status, error)

    // 检查是否是 401 认证错误（只有当 HTTP 状态码明确是 401 时才清除 token）
    if (error.isAuthError) {
      const status = error.status
      const isPermissionError = error.message.includes('权限') ||
        error.message.includes('permission') ||
        error.message.includes('没有') ||
        error.message.includes('禁止') ||
        error.message.includes('无权')

      // 检查是否是公开接口（不需要登录的接口）
      const publicEndpoints = ['/apply', '/status', '/login', '/register']
      const isPublicEndpoint = publicEndpoints.some(publicEndpoint => endpoint.includes(publicEndpoint))

      if (isPublicEndpoint) {
        // 公开接口返回认证错误通常是业务逻辑问题，不跳转
        console.error('公开接口返回认证错误，业务逻辑问题:', error)
        throw error
      }

      // 403 权限错误 - 尝试刷新权限
      if (status === 403 || isPermissionError) {
        console.error('权限不足，尝试刷新权限:', error)
        
        // 尝试刷新权限
        try {
          const refreshRes = await fetch(`${API_BASE}/users/info/permissions`, {
            headers: { 'Authorization': headers['Authorization'] }
          })
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json()
            if (refreshData.success && refreshData.data?.permissions) {
              // 更新本地权限缓存
              const isMerchant = !!localStorage.getItem('merchant_token')
              const storageKey = isMerchant ? 'merchant_permissions' : 'admin_permissions'
              localStorage.setItem(storageKey, JSON.stringify(refreshData.data.permissions))
              console.log('✅ 权限已刷新:', refreshData.data.permissions)
              ElMessage.success('权限已更新，请重新操作')
            }
          }
        } catch (refreshErr) {
          console.error('刷新权限失败:', refreshErr)
        }
        
        ElMessage.error(error.message || '您没有权限执行此操作')
        throw error
      }

      // 只有在 401 认证错误时才清除 token 并跳转
      // 确保状态码明确是 401，而不是仅仅因为错误消息中包含 '401'
      if (status === 401) {
        console.error('🔴 检测到 401 认证错误!!!', {
          endpoint,
          method: options.method || 'GET',
          status,
          errorMessage: error.message,
          '当前 admin_token': localStorage.getItem('admin_token') ? '存在' : '不存在',
          '当前 merchant_token': localStorage.getItem('merchant_token') ? '存在' : '不存在',
          '实际使用的 token': token ? token.substring(0, 30) + '...' : '无'
        })
        
        // 【调试模式】不跳转，让用户查看控制台日志
        console.log('⚠️ 调试模式：暂不跳转，请查看上方错误信息')
        
        // 注释掉跳转逻辑，便于调试
        /*
        // 检查是否已经在登录页，避免无限循环
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && currentPath !== '/') {
          // 【优化】根据当前使用的 token 类型，只清除对应的 token
          // 商家接口只清除商家 token，管理员接口只清除管理员 token
          if (localStorage.getItem('merchant_token')) {
            // 如果使用的是商家 token，只清除商家相关 token
            localStorage.removeItem('merchant_token')
            localStorage.removeItem('merchant_user')
            localStorage.removeItem('merchant_permissions')
            console.log('已清除商家登录态')
          } else {
            // 否则清除管理员相关 token
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_permissions')
            localStorage.removeItem('admin_user')
            console.log('已清除管理员登录态')
          }
          // 通用 token
          localStorage.removeItem('user_token')
          localStorage.removeItem('user_info')

          ElMessage.error('登录已过期，请重新登录')
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
        }
        */
      }
    }

    // 其他错误直接抛出
    throw error
  }
}

// 验证请求数据
function validateRequestData(data, endpoint) {
  // 只有商品和专区的创建/更新接口需要验证 name 和 price 字段
  // 其他所有接口都不需要验证
  const needValidation = endpoint.startsWith('/products') && !endpoint.includes('/skus') && !endpoint.includes('/tags') && !endpoint.includes('/search') && !endpoint.includes('/sales-stats') && !endpoint.includes('/status')
  
  if (!needValidation) {
    return
  }
  
  // 只验证必填字段，跳过可选字段
  const requiredFields = ['name', 'price']
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new Error(`字段 ${field} 不能为空`)
    }
  }
  
  // 验证价格不能为负数
  if (data.price !== undefined && data.price !== null && data.price !== '') {
    const price = parseFloat(data.price)
    if (price < 0) {
      throw new Error('价格不能为负数')
    }
  }
  
  // 验证库存不能为负数
  if (data.stock !== undefined && data.stock !== null && data.stock !== '') {
    const stock = parseInt(data.stock)
    if (stock < 0) {
      throw new Error('库存不能为负数')
    }
  }
}

// 转换数据类型
function convertDataTypes(data) {
  const result = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === 'true') {
      result[key] = true
    } else if (value === 'false') {
      result[key] = false
    } else if (Array.isArray(value)) {
      // 保持数组类型不变
      result[key] = value
    } else if (!isNaN(value) && value !== '' && typeof value !== 'object') {
      result[key] = Number(value)
    } else {
      result[key] = value
    }
  }
  return result
}

// 网络错误处理
function handleNetworkError(error) {
  console.error('网络错误:', error)
  // 这里可以添加更多的错误处理逻辑，比如显示错误提示
  // ElMessage.error('网络错误，请检查网络连接')
}

// 导出API方法
export const productApi = {
  // 获取商品列表
  getList(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/products?${queryString}`)
  },
  
  // 获取所有商品（不分页）
  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/products/all?${queryString}` : '/products/all'
    return request(url)
  },
  
  // 获取商品详情
  getDetail(id) {
    return request(`/products/${id}`)
  },
  
  // 添加商品
  add(data) {
    return request('/products', { method: 'POST', body: data })
  },
  
  // 更新商品
  update(id, data) {
    return request(`/products/${id}`, { method: 'PUT', body: data })
  },
  
  // 删除商品
  delete(id) {
    return request(`/products/${id}`, { method: 'DELETE' })
  },
  
  // 上下架商品
  toggleStatus(id, status) {
    return request(`/products/${id}/status`, { 
      method: 'PUT', 
      body: { status } 
    })
  },
  
  // 获取商品分类
  getCategories() {
    return request('/categories')
  },
  
  // 搜索商品
  search(keyword) {
    return request(`/products/search?keyword=${encodeURIComponent(keyword)}`)
  },
  
  // 获取销售统计
  getSalesStats(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/products/sales-stats?${queryString}`)
  },

  // 获取商品SKU列表
  getSkus(productId) {
    return request(`/products/${productId}/skus`)
  },

  // 创建商品SKU
  createSku(productId, data) {
    return request(`/products/${productId}/skus`, { method: 'POST', body: data })
  },

  // 更新商品SKU
  updateSku(skuId, data) {
    return request(`/products/skus/${skuId}`, { method: 'PUT', body: data })
  },

  // 批量更新商品SKU
  batchUpdateSkus(productId, data) {
    return request(`/products/${productId}/skus/batch`, { method: 'PUT', body: data })
  },

  // 删除商品 SKU
  deleteSku(skuId) {
    return request(`/products/skus/${skuId}`, { method: 'DELETE' })
  },
  
  // 获取系统标签
  getSystemTags() {
    return request('/products/tags/system')
  },
  
  // 获取热门标签
  getPopularTags(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/products/tags/popular?${queryString}`)
  },
  
  // 按标签筛选商品
  getByTag(tag, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/products/tag/${tag}?${queryString}`)
  }
}

export const hotProductApi = {
  // 获取热门推荐列表（超管/运营）
  getList() {
    return request('/hot-products')
  },
  
  // 获取可添加的商品列表
  getAvailable(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/hot-products/available?${queryString}`)
  },
  
  // 添加热门推荐
  add(data) {
    return request('/hot-products', { method: 'POST', body: data })
  },
  
  // 更新排序
  updateSortOrder(id, sortOrder) {
    return request(`/hot-products/${id}/sort`, { 
      method: 'PUT', 
      body: { sort_order: sortOrder } 
    })
  },
  
  // 移除热门推荐
  remove(id) {
    return request(`/hot-products/${id}`, { method: 'DELETE' })
  }
}

export const newProductApi = {
  // 获取新品推荐列表（超管/运营）
  getList() {
    return request('/new-products')
  },
  
  // 获取可添加的商品列表
  getAvailable(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/new-products/available?${queryString}`)
  },
  
  // 添加新品推荐
  add(data) {
    return request('/new-products', { method: 'POST', body: data })
  },
  
  // 更新排序
  updateSortOrder(id, sortOrder) {
    return request(`/new-products/${id}/sort`, { 
      method: 'PUT', 
      body: { sort_order: sortOrder } 
    })
  },
  
  // 移除新品推荐
  remove(id) {
    return request(`/new-products/${id}`, { method: 'DELETE' })
  }
}

export const orderApi = {
  // 获取订单列表
  getList(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/orders?${queryString}`)
  },
  
  // 获取订单详情
  getDetail(id) {
    return request(`/orders/${id}`)
  },
  
  // 更新订单状态
  updateStatus(id, status) {
    return request(`/orders/${id}/status`, { 
      method: 'PUT', 
      body: { status } 
    })
  },
  
  // 发货
  ship(id, trackingInfo) {
    return request(`/orders/${id}/ship`, { 
      method: 'POST', 
      body: trackingInfo 
    })
  },
  
  // 更新物流信息
  updateLogistics(id, logisticsInfo) {
    return request(`/orders/${id}/ship`, { 
      method: 'POST', 
      body: logisticsInfo 
    })
  },
  
  // 设为待收货
  setAwaitingReceipt(id) {
    return request(`/orders/${id}/set-awaiting-receipt`, { 
      method: 'POST'
    })
  },
  
  // 确认收货
  confirmReceipt(id) {
    return request(`/orders/${id}/confirm-receipt`, { 
      method: 'POST'
    })
  },
  
  // 取消订单
  cancel(id, reason) {
    return request(`/orders/${id}/cancel`, { 
      method: 'POST', 
      body: { reason } 
    })
  },
  
  // 获取订单状态分布
  getStatusDistribution() {
    return request('/statistics/status-distribution')
  },

  // 获取订单趋势
  getOrderTrend(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/statistics/trend?${queryString}`)
  },

  // 获取尺码分布
  getSizeDistribution(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/statistics/size-distribution?${queryString}`)
  },

  // 获取统计概览
  getStats() {
    return request('/statistics')
  }
}

export const userApi = {
  // 登录
  login(username, password) {
    return request('/auth/login', { 
      method: 'POST', 
      body: { username, password } 
    })
  },
  
  // 注册
  register(data) {
    return request('/auth/register', { 
      method: 'POST', 
      body: data 
    })
  },
  
  // 获取用户信息
  getInfo() {
    return request('/users/info')
  },

  // 获取用户总数
  getUserCount() {
    return request('/users/count')
  },

  // 获取用户注册趋势
  getRegistrationTrend(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/users/registration-trend?${queryString}`)
  },
  
  // 更新用户信息
  updateInfo(data) {
    return request('/users/info', { 
      method: 'PUT', 
      body: data 
    })
  },
  
  // 重置密码
  resetPassword(oldPassword, newPassword) {
    return request('/users/password', { 
      method: 'PUT', 
      body: { oldPassword, newPassword } 
    })
  },
  
  // 获取用户列表
  getList(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/users?${queryString}` : '/users'
    return request(url)
  },
  
  // 获取用户详情
  getDetail(id) {
    return request(`/users/${id}`)
  },
  
  // 更新用户信息（管理员）
  updateUser(id, data) {
    return request(`/users/${id}`, { 
      method: 'PUT', 
      body: data 
    })
  },
  
  // 删除用户
  delete(id) {
    return request(`/users/${id}`, { method: 'DELETE' })
  },
  
  // 禁用/启用用户
  toggleStatus(id, status) {
    return request(`/users/${id}/status`, { 
      method: 'PUT', 
      body: { status } 
    })
  },
  
  // 获取用户数量
  getCount(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/users/count?${queryString}`)
  }
}

export const authApi = userApi

export const merchantApi = {
  // 申请入驻
  apply(data) {
    return request('/merchants/apply', { method: 'POST', body: data })
  },
  
  // 获取入驻状态
  getStatus() {
    return request('/merchants/status')
  },
  
  // 获取待审核列表（管理员）
  getPendingList() {
    return request('/merchants/pending')
  },
  
  // 获取已审核列表（管理员）
  getReviewedList() {
    return request('/merchants/reviewed')
  },

  // 审核入驻申请（管理员）
  review(applicationId, status, reviewNotes) {
    const body = {
      applicationId,
      status
    }
    if (reviewNotes) {
      body.reviewNotes = reviewNotes
    }
    return request('/merchants/review', {
      method: 'POST',
      body: body
    })
  },
  
  // 获取店铺信息
  getShop() {
    return request('/merchants/shop')
  },
  
  // 更新店铺信息
  updateShop(data) {
    return request('/merchants/shop', { method: 'PUT', body: data })
  },

  // 获取店铺商品列表
  getShopProducts(shopId) {
    return request(`/merchants/shops/${shopId}/products`)
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
  },

  // 获取店铺订单列表
  getShopOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/merchants/orders?${queryString}` : '/merchants/orders'
    return request(url)
  },

  // 更新订单状态
  updateOrderStatus(orderId, status) {
    return request(`/merchants/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status }
    })
  },

  // 获取订单详情
  getOrderDetail(orderId) {
    return request(`/merchants/orders/${orderId}`)
  },

  // 获取所有店铺列表（管理员）
  getAllShops(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/merchants/shops?${queryString}` : '/merchants/shops'
    return request(url)
  },

  // 获取未品牌化的店铺列表（用于品牌管理）
  getNonBrandShops(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/merchants/non-brand-shops?${queryString}` : '/merchants/non-brand-shops'
    return request(url)
  },

  // 获取店铺列表（通用）
  getShops(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/merchants/shops?${queryString}` : '/merchants/shops'
    return request(url)
  },

  // 删除店铺（管理员）
  deleteShop(id) {
    return request(`/merchants/shops/${id}`, { method: 'DELETE' })
  },

  // 更新店铺信息（管理员）
  updateShopInfo(id, data) {
    return request(`/merchants/shops/${id}`, { method: 'PUT', body: data })
  },

  // 获取商家评价列表
  getReviews(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/merchants/reviews?${queryString}` : '/merchants/reviews'
    return request(url)
  },

  // 获取退货原因统计
  getReturnReasons() {
    return request('/merchants/stats/return-reasons')
  },

  // 获取尺码分布统计
  getSizeDistribution() {
    return request('/merchants/stats/size-distribution')
  },

  // 更新评价状态
  updateReviewStatus(id, status) {
    return request(`/reviews/${id}/status`, {
      method: 'PUT',
      body: { status }
    })
  },

  // 获取品牌店铺列表
  getBrandShops(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/brands?${queryString}` : '/brands'
    return request(url)
  },

  // 添加品牌店铺
  addBrandShop(shopId) {
    return request('/brands', {
      method: 'POST',
      body: { shopId }
    })
  },

  // 移除品牌店铺
  removeBrandShop(shopId) {
    return request(`/brands/${shopId}`, { method: 'DELETE' })
  }
}

export const uploadApi = {
  // 上传图片
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return request('/upload/product', {
      method: 'POST',
      body: formData
    })
  }
}

export const categoryApi = {
  // 获取分类列表
  getList() {
    return request('/categories')
  },
  
  // 获取分类树
  getTree() {
    return request('/categories/tree')
  },
  
  // 添加分类
  add(data) {
    return request('/categories', { method: 'POST', body: data })
  },
  
  // 更新分类
  update(id, data) {
    return request(`/categories/${id}`, { method: 'PUT', body: data })
  },
  
  // 删除分类
  delete(id) {
    return request(`/categories/${id}`, { method: 'DELETE' })
  }
}

export const reviewApi = {
  // 获取评价列表
  getList(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/reviews?${queryString}`)
  },
  
  // 获取所有评价（包含未审核的）
  getAllReviews(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/reviews/all?${queryString}`)
  },
  
  // 回复评价
  reply(id, reply) {
    return request(`/reviews/${id}/reply`, { 
      method: 'POST', 
      body: { reply } 
    })
  },
  
  // 删除评价
  delete(id) {
    return request(`/reviews/${id}`, { method: 'DELETE' })
  }
}

export const couponApi = {
  // 获取优惠券列表
  getList(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/coupons?${queryString}`)
  },
  
  // 添加优惠券
  add(data) {
    return request('/coupons', { method: 'POST', body: data })
  },
  
  // 更新优惠券
  update(id, data) {
    return request(`/coupons/${id}`, { method: 'PUT', body: data })
  },
  
  // 删除优惠券
  delete(id) {
    return request(`/coupons/${id}`, { method: 'DELETE' })
  }
}

export const roleApi = {
  // 获取角色列表
  getList() {
    return request('/roles')
  },
  
  // 获取单个角色信息
  getInfo(id) {
    return request(`/roles/${id}`)
  },
  
  // 创建角色
  create(data) {
    return request('/roles', { method: 'POST', body: data })
  },

  // 添加角色（别名）
  add(data) {
    return request('/roles', { method: 'POST', body: data })
  },
  
  // 更新角色
  update(id, data) {
    return request(`/roles/${id}`, { method: 'PUT', body: data })
  },
  
  // 删除角色
  delete(id, data) {
    return request(`/roles/${id}`, { method: 'DELETE', body: data })
  },
  
  // 分配权限
  updatePermissions(roleId, permissions) {
    return request(`/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: { permissions }
    })
  },
  
  // 获取权限树
  getPermissionTree() {
    return request('/roles/permission-tree')
  },
  
  // 获取角色默认权限
  getDefaultPermissions(roleCode) {
    return request(`/roles/default-permissions/${roleCode}`)
  },
  
  // 获取审计日志
  getAuditLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/roles/audit-logs?${queryString}`)
  }
}

export const zoneApi = {
  // 获取专区列表
  getList() {
    return request('/zones')
  },
  
  // 获取所有专区（不分页）
  getAll() {
    return request('/zones/all')
  },
  
  // 创建专区
  create(data) {
    return request('/zones', { method: 'POST', body: data })
  },
  
  // 更新专区
  update(id, data) {
    return request(`/zones/${id}`, { method: 'PUT', body: data })
  },
  
  // 删除专区
  delete(id) {
    return request(`/zones/${id}`, { method: 'DELETE' })
  },
  
  // 添加商品到专区
  addProductToZone(data) {
    return request('/zones/add-product', { method: 'POST', body: data })
  },
  
  // 获取专区商品列表
  getZoneProducts(zoneId) {
    return request(`/zones/${zoneId}/products`)
  },
  
  // 从专区移除商品
  removeProductFromZone(zoneId, productId) {
    return request('/zones/remove-product', { method: 'POST', body: { zone_id: zoneId, product_id: productId } })
  }
}

export const conversationApi = {
  // 获取会话列表
  getList(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/conversations?${queryString}`)
  },
  
  // 获取会话详情
  getDetail(id) {
    return request(`/conversations/${id}`)
  },
  
  // 获取消息列表
  getMessages(id, params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/conversations/${id}/messages?${queryString}`)
  },
  
  // 发送消息
  sendMessage(id, message) {
    return request(`/conversations/${id}/messages`, { 
      method: 'POST', 
      body: { message } 
    })
  },
  
  // 关闭/开启会话
  closeConversation(id, status) {
    return request(`/conversations/${id}/close`, { 
      method: 'PUT', 
      body: { status } 
    })
  },
  
  // 删除会话
  delete(id) {
    return request(`/conversations/${id}`, { method: 'DELETE' })
  },
  
  // 标记消息为已读
  markMessagesAsRead(id, data) {
    return request(`/conversations/${id}/messages/read`, { 
      method: 'PUT', 
      body: data 
    })
  },
  
  // 标记已读（旧方法，保留兼容）
  markAsRead(id) {
    return request(`/conversations/${id}/read`, { method: 'PUT' })
  }
}

export const discussionApi = {
  // 获取社区讨论列表
  getList(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/discussions?${queryString}` : '/discussions'
    return request(url)
  },
  
  // 获取讨论详情
  getDetail(id) {
    return request(`/discussions/${id}`)
  },
  
  // 发布讨论
  create(data) {
    return request('/discussions', { method: 'POST', body: data })
  },
  
  // 更新讨论
  update(id, data) {
    return request(`/discussions/${id}`, { method: 'PUT', body: data })
  },
  
  // 删除讨论
  delete(id) {
    return request(`/discussions/${id}`, { method: 'DELETE' })
  },
  
  // 置顶讨论
  pin(id) {
    return request(`/discussions/${id}/pin`, { method: 'PUT' })
  },
  
  // 取消置顶讨论
  unpin(id) {
    return request(`/discussions/${id}/unpin`, { method: 'PUT' })
  },
  
  // 回复讨论
  reply(id, content) {
    return request(`/discussions/${id}/replies`, { 
      method: 'POST', 
      body: { content } 
    })
  }
}

export const reportApi = {
  // 获取举报列表
  getList(params) {
    const queryString = new URLSearchParams(params).toString()
    return request(`/reports?${queryString}`)
  },
  
  // 更新举报状态
  updateStatus(id, status) {
    return request(`/reports/${id}/status`, { 
      method: 'PUT', 
      body: { status } 
    })
  },
  
  // 删除举报
  delete(id) {
    return request(`/reports/${id}`, { method: 'DELETE' })
  }
}

export const shopApi = {
  // 获取所有店铺列表
  getList() {
    return request('/shops')
  },
  
  // 获取店铺详情
  getDetail(id) {
    return request(`/shops/${id}`)
  },
  
  // 更新店铺信息
  update(id, data) {
    return request(`/shops/${id}`, { method: 'PUT', body: data })
  },
  
  // 删除店铺
  delete(id) {
    return request(`/shops/${id}`, { method: 'DELETE' })
  }
}

export const statisticsApi = {
  // 获取综合统计数据
  getOverview(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics?${queryString}` : '/statistics'
    return request(url)
  },
  
  // 获取订单状态分布
  getStatusDistribution(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/status-distribution?${queryString}` : '/statistics/status-distribution'
    return request(url)
  },
  
  // 获取订单趋势
  getOrderTrend(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/trend?${queryString}` : '/statistics/trend'
    return request(url)
  },
  
  // 获取尺码分布
  getSizeDistribution(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/size-distribution?${queryString}` : '/statistics/size-distribution'
    return request(url)
  },
  
  // 获取退货原因分布
  getReturnReasonDistribution(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/return-reason-distribution?${queryString}` : '/statistics/return-reason-distribution'
    return request(url)
  },
  
  // 获取销售趋势
  getSalesTrend(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/sales-trend?${queryString}` : '/statistics/sales-trend'
    return request(url)
  },
  
  // 获取用户注册趋势
  getUserRegistrationTrend(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/user-registration-trend?${queryString}` : '/statistics/user-registration-trend'
    return request(url)
  },
  
  // 获取产品销量分布
  getProductSalesDistribution(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/product-sales-distribution?${queryString}` : '/statistics/product-sales-distribution'
    return request(url)
  },
  
  // 获取商家统计数据
  getMerchantStats(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/merchant?${queryString}` : '/statistics/merchant'
    return request(url)
  },
  
  // 获取热销商品
  getHotProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/hot-products?${queryString}` : '/statistics/hot-products'
    return request(url)
  },
  
  // 获取订单详情统计
  getOrderDetails(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/statistics/order-details?${queryString}` : '/statistics/order-details'
    return request(url)
  }
}

export default {
  auth: userApi,
  product: productApi,
  hotProduct: hotProductApi,
  newProduct: newProductApi,
  order: orderApi,
  user: userApi,
  merchant: merchantApi,
  shop: shopApi,
  category: categoryApi,
  review: reviewApi,
  coupon: couponApi,
  role: roleApi,
  zone: zoneApi,
  conversation: conversationApi,
  discussion: discussionApi,
  report: reportApi,
  upload: uploadApi,
  statistics: statisticsApi
}