const { query } = require('../db/connection')

class ZoneController {
  // 获取专区列表
  async getList(req, res) {
    try {
      const rows = await query('SELECT * FROM zones WHERE status = 1 ORDER BY sort_order ASC, id DESC')
      res.json({ success: true, data: rows })
    } catch (error) {
      console.error('获取专区列表失败:', error)
      res.status(500).json({ success: false, message: '获取专区列表失败' })
    }
  }

  // 获取所有专区（包括禁用的）
  async getAll(req, res) {
    try {
      const rows = await query('SELECT * FROM zones ORDER BY sort_order ASC, id DESC')
      res.json({ success: true, data: rows })
    } catch (error) {
      console.error('获取所有专区失败:', error)
      res.status(500).json({ success: false, message: '获取所有专区失败' })
    }
  }

  // 根据ID获取专区
  async getById(req, res) {
    try {
      const { id } = req.params
      const rows = await query('SELECT * FROM zones WHERE id = ?', [id])
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: '专区不存在' })
      }
      res.json({ success: true, data: rows[0] })
    } catch (error) {
      console.error('获取专区详情失败:', error)
      res.status(500).json({ success: false, message: '获取专区详情失败' })
    }
  }

  // 创建专区
  async create(req, res) {
    try {
      const { name, description, cover_image, sort_order, status } = req.body
      const result = await query(
        'INSERT INTO zones (name, description, cover_image, sort_order, status) VALUES (?, ?, ?, ?, ?)',
        [name, description, cover_image, sort_order || 0, status !== undefined ? status : 1]
      )
      res.json({ success: true, data: { id: result.insertId, name, description, cover_image, sort_order: sort_order || 0, status: status !== undefined ? status : 1 } })
    } catch (error) {
      console.error('创建专区失败:', error)
      res.status(500).json({ success: false, message: '创建专区失败' })
    }
  }

  // 更新专区
  async update(req, res) {
    try {
      console.log('接收到更新专区请求:', req.params, req.body)
      const { id } = req.params
      const { name, description, cover_image, sort_order, status } = req.body
      console.log('更新专区状态:', status)
      // 直接使用接收到的status值，不做默认值处理
      const result = await query(
        'UPDATE zones SET name = ?, description = ?, cover_image = ?, sort_order = ?, status = ? WHERE id = ?',
        [name, description, cover_image, sort_order || 0, status, id]
      )
      console.log('更新结果:', result)
      if (result.affectedRows === 0) {
        console.log('专区不存在:', id)
        return res.status(404).json({ success: false, message: '专区不存在' })
      }
      // 检查更新后的数据
      const updatedZone = await query('SELECT * FROM zones WHERE id = ?', [id])
      console.log('更新后的数据:', updatedZone)
      console.log('更新成功:', id)
      res.json({ success: true, message: '更新成功' })
    } catch (error) {
      console.error('更新专区失败:', error)
      res.status(500).json({ success: false, message: '更新专区失败' })
    }
  }

  // 删除专区
  async delete(req, res) {
    try {
      const { id } = req.params
      const result = await query('DELETE FROM zones WHERE id = ?', [id])
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '专区不存在' })
      }
      res.json({ success: true, message: '删除成功' })
    } catch (error) {
      console.error('删除专区失败:', error)
      res.status(500).json({ success: false, message: '删除专区失败' })
    }
  }

  // 获取专区商品列表
  async getZoneProducts(req, res) {
    try {
      const { id } = req.params
      const rows = await query(
        `SELECT p.* FROM products p
         JOIN zone_products zp ON p.id = zp.product_id
         WHERE zp.zone_id = ?
         ORDER BY zp.sort_order ASC, p.id DESC`,
        [id]
      )
      res.json({ success: true, data: rows })
    } catch (error) {
      console.error('获取专区商品列表失败:', error)
      res.status(500).json({ success: false, message: '获取专区商品列表失败' })
    }
  }

  // 添加商品到专区
  async addProductToZone(req, res) {
    try {
      const { zone_id, product_id, sort_order } = req.body
      const result = await query(
        'INSERT IGNORE INTO zone_products (zone_id, product_id, sort_order) VALUES (?, ?, ?)',
        [zone_id, product_id, sort_order || 0]
      )
      res.json({ success: true, message: '添加成功' })
    } catch (error) {
      console.error('添加商品到专区失败:', error)
      res.status(500).json({ success: false, message: '添加商品到专区失败' })
    }
  }

  // 从专区移除商品
  async removeProductFromZone(req, res) {
    try {
      const { zone_id, product_id } = req.body
      const result = await query(
        'DELETE FROM zone_products WHERE zone_id = ? AND product_id = ?',
        [zone_id, product_id]
      )
      res.json({ success: true, message: '移除成功' })
    } catch (error) {
      console.error('从专区移除商品失败:', error)
      res.status(500).json({ success: false, message: '从专区移除商品失败' })
    }
  }
}

module.exports = new ZoneController()