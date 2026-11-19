const { query, withTransaction } = require('../db/connection')
const { createValidationError, createNotFoundError, createInternalError } = require('../utils/errorHandler')

// 检查地址是否存在且属于该用户
async function checkAddressExists(connection, addressId, userId) {
  const [result] = await connection.execute(
    'SELECT id, user_id, name, phone, detail as address, is_default, created_at, updated_at FROM addresses WHERE id = ? AND user_id = ?',
    [addressId, userId]
  )
  return result[0]
}

// 获取用户ID（支持从多个来源获取，方便测试）
function getUserId(req) {
  return req.user?.id || req.body?.userId || req.query?.userId
}

// 获取用户地址列表
exports.getAddresses = async (req, res, next) => {
  try {
    const userId = getUserId(req)
    
    if (!userId) {
      return next(createValidationError('用户ID不能为空', { userId }))
    }
    
    const addresses = await query(
    'SELECT id, user_id, name, phone, detail as address, is_default, created_at, updated_at FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
    [userId]
  )
  
  if (!addresses) {
    return next(createInternalError('查询地址列表失败'))
  }
  
    res.json({ success: true, data: addresses || [] })
  } catch (error) {
    next(createInternalError('获取地址列表失败', { error: error.message }))
  }
}

// 获取单个地址详情
exports.getAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id
    const userId = getUserId(req)
    
    if (!userId) {
      return next(createValidationError('用户 ID 不能为空', { userId }))
    }
    
    if (!addressId || isNaN(parseInt(addressId))) {
      return next(createValidationError('无效的地址 ID', { addressId }))
    }
    
    const result = await query(
      'SELECT id, user_id, name, phone, detail as address, is_default, province, city, district, created_at, updated_at FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    )
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      return next(createNotFoundError('地址不存在或不属于该用户', { addressId, userId }))
    }
    
    const address = result[0]
    res.json({ success: true, data: address })
  } catch (error) {
    next(createInternalError('获取地址详情失败', { error: error.message }))
  }
}

// 新增地址
exports.createAddress = async (req, res, next) => {
  try {
    const userId = getUserId(req)
    const { name, phone, address, province = '', city = '', district = '', isDefault = false } = req.body

    // 验证必填字段
    if (!userId) {
      return next(createValidationError('用户 ID 不能为空', { userId }))
    }
    
    if (!name || !phone || !address) {
      return next(createValidationError('所有字段都是必填项', { name, phone, address }))
    }
    
    // 验证字段长度
    if (name.length > 50) {
      return next(createValidationError('姓名长度不能超过 50 个字符', { name }))
    }
    
    if (address.length > 200) {
      return next(createValidationError('地址长度不能超过 200 个字符', { address }))
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return next(createValidationError('手机号格式不正确', { phone }))
    }
    
    // 检查地址数量限制
    const addressCountResult = await query(
      'SELECT COUNT(*) as count FROM addresses WHERE user_id = ?',
      [userId]
    )
    
    if (!addressCountResult || !Array.isArray(addressCountResult) || addressCountResult.length === 0) {
      return next(createInternalError('查询地址数量失败'))
    }
    
    const addressCount = addressCountResult[0].count
    if (addressCount >= 10) {
      return next(createValidationError('地址数量已达上限', { count: addressCount }))
    }
    
    // 使用事务处理
    const result = await withTransaction(async (connection) => {
      // 如果设置为默认地址，先将该用户其他地址设为非默认
      if (isDefault) {
        await connection.execute(
          'UPDATE addresses SET is_default = false WHERE user_id = ?',
          [userId]
        )
      }
      
      // 插入新地址
      const [insertResult] = await connection.execute(
        'INSERT INTO addresses (user_id, name, phone, detail, is_default, province, city, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, name, phone, address, isDefault, province, city, district]
      )
      
      // 获取刚插入的地址
      const [newAddress] = await connection.execute(
        'SELECT id, user_id, name, phone, detail as address, is_default, province, city, district, created_at, updated_at FROM addresses WHERE id = ?',
        [insertResult.insertId]
      )
      
      return newAddress[0]
    })
    
    res.json({ success: true, message: '地址添加成功', data: result })
  } catch (error) {
    next(createInternalError('新增地址失败', { error: error.message }))
  }
}

// 编辑地址
exports.updateAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id
    const userId = getUserId(req)
    const { name, phone, address, province = '', city = '', district = '', isDefault = false } = req.body

    // 验证必填字段
    if (!userId) {
      return next(createValidationError('用户 ID 不能为空', { userId }))
    }
    
    if (!addressId || isNaN(parseInt(addressId))) {
      return next(createValidationError('无效的地址 ID', { addressId }))
    }
    
    if (!name || !phone || !address) {
      return next(createValidationError('所有字段都是必填项', { name, phone, address }))
    }
    
    // 验证字段长度
    if (name.length > 50) {
      return next(createValidationError('姓名长度不能超过 50 个字符', { name }))
    }
    
    if (address.length > 200) {
      return next(createValidationError('地址长度不能超过 200 个字符', { address }))
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return next(createValidationError('手机号格式不正确', { phone }))
    }
    
    // 使用事务处理
    const result = await withTransaction(async (connection) => {
      // 检查地址是否存在且属于该用户
      const existingAddress = await checkAddressExists(connection, addressId, userId)
      
      if (!existingAddress) {
        throw new Error('地址不存在或不属于该用户')
      }
      
      // 如果设置为默认地址，先将该用户其他地址设为非默认
      if (isDefault) {
        await connection.execute(
          'UPDATE addresses SET is_default = false WHERE user_id = ?',
          [userId]
        )
      }
      
      // 更新地址
      const [updateResult] = await connection.execute(
        'UPDATE addresses SET name = ?, phone = ?, detail = ?, is_default = ?, province = ?, city = ?, district = ? WHERE id = ? AND user_id = ?',
        [name, phone, address, isDefault, province, city, district, addressId, userId]
      )
      
      if (updateResult.affectedRows === 0) {
        throw new Error('地址不存在或不属于该用户')
      }
      
      // 获取更新后的地址
      const [updatedAddress] = await connection.execute(
        'SELECT id, user_id, name, phone, detail as address, is_default, province, city, district, created_at, updated_at FROM addresses WHERE id = ?',
        [addressId]
      )
      
      return updatedAddress[0]
    })
    
    res.json({ success: true, message: '地址更新成功', data: result })
  } catch (error) {
    if (error.message === '地址不存在或不属于该用户') {
      return next(createNotFoundError('地址不存在或不属于该用户', { addressId, userId }))
    }
    next(createInternalError('更新地址失败', { error: error.message }))
  }
}

// 删除地址
exports.deleteAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id
    const userId = getUserId(req)
    
    if (!userId) {
      return next(createValidationError('用户ID不能为空', { userId }))
    }
    
    if (!addressId || isNaN(parseInt(addressId))) {
      return next(createValidationError('无效的地址ID', { addressId }))
    }
    
    // 使用事务处理
    await withTransaction(async (connection) => {
      // 检查地址是否存在且属于该用户
      const existingAddress = await checkAddressExists(connection, addressId, userId)
      
      if (!existingAddress) {
        throw new Error('地址不存在或不属于该用户')
      }
      
      // 检查是否为默认地址
      if (existingAddress.is_default) {
        throw new Error('默认地址不可删除，请先设置其他地址为默认')
      }
      
      // 删除地址
      const [result] = await connection.execute(
        'DELETE FROM addresses WHERE id = ? AND user_id = ?',
        [addressId, userId]
      )
      
      if (result.affectedRows === 0) {
        throw new Error('地址不存在或不属于该用户')
      }
    })
    
    res.json({ success: true, message: '地址删除成功' })
  } catch (error) {
    if (error.message === '地址不存在或不属于该用户') {
      return next(createNotFoundError('地址不存在或不属于该用户', { addressId, userId }))
    }
    if (error.message === '默认地址不可删除，请先设置其他地址为默认') {
      return next(createBusinessError('默认地址不可删除，请先设置其他地址为默认', {}))
    }
    next(createInternalError('删除地址失败，默认地址不可删除，请先设置其他地址为默认', { error: error.message }))
  }
}

// 设置默认地址
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id
    const userId = getUserId(req)
    
    if (!userId) {
      return next(createValidationError('用户ID不能为空', { userId }))
    }
    
    if (!addressId || isNaN(parseInt(addressId))) {
      return next(createValidationError('无效的地址ID', { addressId }))
    }
    
    // 使用事务处理
    await withTransaction(async (connection) => {
      // 检查地址是否存在且属于该用户
      const existingAddress = await checkAddressExists(connection, addressId, userId)
      
      if (!existingAddress) {
        throw new Error('地址不存在或不属于该用户')
      }
      
      // 先将该用户所有地址设为非默认
      await connection.execute(
        'UPDATE addresses SET is_default = false WHERE user_id = ?',
        [userId]
      )
      
      // 将指定地址设为默认
      const [result] = await connection.execute(
        'UPDATE addresses SET is_default = true WHERE id = ? AND user_id = ?',
        [addressId, userId]
      )
      
      if (result.affectedRows === 0) {
        throw new Error('地址不存在或不属于该用户')
      }
    })
    
    res.json({ success: true, message: '默认地址设置成功' })
  } catch (error) {
    if (error.message === '地址不存在或不属于该用户') {
      return next(createNotFoundError('地址不存在或不属于该用户', { addressId, userId }))
    }
    next(createInternalError('设置默认地址失败', { error: error.message }))
  }
}