const { query } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')

// 递归获取分类的子分类ID列表
function getSubCategoryIds(categories, parentId) {
  const subCategoryIds = []
  const children = categories.filter(cat => cat.parent_id === parentId)
  children.forEach(child => {
    subCategoryIds.push(child.id)
    const grandChildrenIds = getSubCategoryIds(categories, child.id)
    subCategoryIds.push(...grandChildrenIds)
  })
  return subCategoryIds
}

const categoryController = {
  
  // 获取分类树（带层级结构）
  async getTree(req, res) {
    try {
      // 获取所有分类并按层级排序
      const sql = 'SELECT * FROM categories ORDER BY parent_id ASC, sort_order ASC, id ASC'
      const categories = await query(sql)
      
      // 构建层级结构
      const categoryMap = {}
      const rootCategories = []
      
      // 先建立所有分类的映射并格式化日期
      categories.forEach(cat => {
        // 格式化日期时间
        cat.created_at = formatDate(cat.created_at)
        cat.updated_at = formatDate(cat.updated_at)
        cat.children = []
        categoryMap[cat.id] = cat
      })
      
      // 然后建立父子关系
      categories.forEach(cat => {
        if (cat.parent_id === null || cat.parent_id === 0) {
          // 一级分类
          rootCategories.push(cat)
        } else {
          // 子分类
          const parent = categoryMap[cat.parent_id]
          if (parent) {
            parent.children.push(cat)
          }
        }
      })
      
      res.json({ success: true, data: rootCategories })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 获取所有分类（平铺）
  async getList(req, res) {
    try {
      const sql = 'SELECT *, (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) as product_count FROM categories c ORDER BY parent_id ASC, sort_order ASC, id ASC'
      const categories = await query(sql)
      
      // 构建分类映射
      const categoryMap = {}
      categories.forEach(cat => {
        categoryMap[cat.id] = cat
      })
      
      // 为每个分类计算总商品数量（包括子分类）
      categories.forEach(cat => {
        const subCategoryIds = getSubCategoryIds(categories, cat.id)
        if (subCategoryIds.length > 0) {
          // 获取子分类的商品数量
          const subProductCount = categories.filter(c => subCategoryIds.includes(c.id)).reduce((sum, c) => sum + (c.product_count || 0), 0)
          cat.total_product_count = (cat.product_count || 0) + subProductCount
        } else {
          cat.total_product_count = cat.product_count || 0
        }
      })
      
      // 格式化日期时间字段
      const formattedCategories = categories.map(cat => ({
        ...cat,
        created_at: formatDate(cat.created_at),
        updated_at: formatDate(cat.updated_at)
      }))
      
      res.json({ success: true, data: formattedCategories })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 获取指定父分类的子分类
  async getChildren(req, res) {
    try {
      const { parentId } = req.params
      const parent_id = parentId === 'null' ? null : parseInt(parentId)
      
      const sql = 'SELECT *, (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) as product_count FROM categories c WHERE parent_id = ? ORDER BY sort_order ASC, id ASC'
      const categories = await query(sql, [parent_id])
      
      // 构建分类映射
      const categoryMap = {}
      categories.forEach(cat => {
        categoryMap[cat.id] = cat
      })
      
      // 为每个分类计算总商品数量（包括子分类）
      categories.forEach(cat => {
        const subCategoryIds = getSubCategoryIds(categories, cat.id)
        if (subCategoryIds.length > 0) {
          const subProductCount = categories.filter(c => subCategoryIds.includes(c.id)).reduce((sum, c) => sum + (c.product_count || 0), 0)
          cat.total_product_count = (cat.product_count || 0) + subProductCount
        } else {
          cat.total_product_count = cat.product_count || 0
        }
      })
      
      // 格式化日期时间字段
      const formattedCategories = categories.map(cat => ({
        ...cat,
        created_at: formatDate(cat.created_at),
        updated_at: formatDate(cat.updated_at)
      }))
      
      res.json({ success: true, data: formattedCategories })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 获取分类详情
  async getById(req, res) {
    try {
      const { id } = req.params
      const sql = 'SELECT * FROM categories WHERE id = ?'
      const categories = await query(sql, [id])
      if (!categories || categories.length === 0) {
        return res.status(404).json({ success: false, message: '分类不存在' })
      }
      
      // 格式化日期时间字段
      const formattedCategory = {
        ...categories[0],
        created_at: formatDate(categories[0].created_at),
        updated_at: formatDate(categories[0].updated_at)
      }
      
      res.json({ success: true, data: formattedCategory })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 创建分类
  async create(req, res) {
    try {
      const { name, sort_order, parent_id } = req.body
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: '分类名称不能为空' })
      }
      
      // 检查父分类是否存在，且不是二级分类
      if (parent_id && parent_id !== 0) {
        const parentCheck = await query('SELECT id, parent_id FROM categories WHERE id = ?', [parent_id])
        if (!parentCheck || parentCheck.length === 0) {
          return res.status(400).json({ success: false, message: '父分类不存在' })
        }
        
        // 检查父分类是否已经是三级分类（即父分类的父分类有自己的父分类）
        if (parentCheck[0].parent_id !== null && parentCheck[0].parent_id !== 0) {
          // 检查父分类的父分类
          const grandParentCheck = await query('SELECT parent_id FROM categories WHERE id = ?', [parentCheck[0].parent_id])
          if (grandParentCheck && grandParentCheck.length > 0 && grandParentCheck[0].parent_id !== null && grandParentCheck[0].parent_id !== 0) {
            return res.status(400).json({ success: false, message: '最多只能创建三级分类' })
          }
        }
      }
      
      // 检查同级分类是否重名
      let checkSql, checkParams
      if (parent_id === null || parent_id === undefined || parent_id === 0) {
        // 一级分类
        checkSql = 'SELECT id FROM categories WHERE name = ? AND (parent_id IS NULL OR parent_id = 0)'
        checkParams = [name.trim()]
      } else {
        // 子分类
        checkSql = 'SELECT id FROM categories WHERE name = ? AND parent_id = ?'
        checkParams = [name.trim(), parent_id]
      }
      
      const existing = await query(checkSql, checkParams)
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: `同级分类"${name}"已存在` })
      }
      
      const sql = 'INSERT INTO categories (name, sort_order, parent_id) VALUES (?, ?, ?)'
      const result = await query(sql, [name.trim(), sort_order || 0, parent_id || null])
      res.json({ success: true, message: '创建成功', data: { id: result.insertId } })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 更新分类
  async update(req, res) {
    try {
      const { id } = req.params
      const { name, sort_order, parent_id } = req.body
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: '分类名称不能为空' })
      }
      
      // 检查父分类是否存在，且不是二级分类
      if (parent_id && parent_id !== 0) {
        const parentCheck = await query('SELECT id, parent_id FROM categories WHERE id = ?', [parent_id])
        if (!parentCheck || parentCheck.length === 0) {
          return res.status(400).json({ success: false, message: '父分类不存在' })
        }
        
        // 检查父分类是否已经是三级分类（即父分类的父分类有自己的父分类）
        if (parentCheck[0].parent_id !== null && parentCheck[0].parent_id !== 0) {
          // 检查父分类的父分类
          const grandParentCheck = await query('SELECT parent_id FROM categories WHERE id = ?', [parentCheck[0].parent_id])
          if (grandParentCheck && grandParentCheck.length > 0 && grandParentCheck[0].parent_id !== null && grandParentCheck[0].parent_id !== 0) {
            return res.status(400).json({ success: false, message: '最多只能创建三级分类' })
          }
        }
      }
      
      // 检查同级分类是否重名
      let checkSql, checkParams
      if (parent_id === null || parent_id === undefined || parent_id === 0) {
        // 一级分类
        checkSql = 'SELECT id FROM categories WHERE name = ? AND id != ? AND (parent_id IS NULL OR parent_id = 0)'
        checkParams = [name.trim(), id]
      } else {
        // 子分类
        checkSql = 'SELECT id FROM categories WHERE name = ? AND id != ? AND parent_id = ?'
        checkParams = [name.trim(), id, parent_id]
      }
      
      const existing = await query(checkSql, checkParams)
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: `同级分类"${name}"已存在` })
      }
      
      const sql = 'UPDATE categories SET name=?, sort_order=?, parent_id=? WHERE id=?'
      await query(sql, [name.trim(), sort_order || 0, parent_id || null, id])
      res.json({ success: true, message: '更新成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 删除分类
  async delete(req, res) {
    try {
      const { id } = req.params
      
      // 直接删除分类，暂时跳过子分类检查和关联关系删除
      await query('DELETE FROM categories WHERE id=?', [id])
      res.json({ success: true, message: '删除成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = categoryController