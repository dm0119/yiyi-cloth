/**
 * 库存服务 - 处理库存并发安全问题
 */

const { withTransaction } = require('../db/connection');

class InventoryService {
  /**
   * 安全扣减库存（支持并发控制）
   * @param {Object} connection - 数据库连接
   * @param {Number} productId - 商品ID
   * @param {Number} quantity - 扣减数量
   * @param {String} color - 颜色（可选）
   * @param {String} size - 尺码（可选）
   * @returns {Promise<Boolean>} 扣减是否成功
   */
  static async safeDeductStock(connection, productId, quantity, color = '', size = '') {
    if (quantity <= 0) {
      throw new Error('扣减数量必须大于0');
    }

    // 检查商品是否存在且未删除
    const [product] = await connection.execute(
      'SELECT id, stock, status, deleted FROM products WHERE id = ?',
      [productId]
    );

    if (!product || product.length === 0) {
      throw new Error(`商品 ${productId} 不存在`);
    }

    const productInfo = product[0];
    if (productInfo.deleted !== 0 || productInfo.status !== 1) {
      throw new Error(`商品 ${productId} 已下架或已删除`);
    }

    if (productInfo.stock < quantity) {
      throw new Error(`商品 ${productId} 库存不足，当前库存: ${productInfo.stock}，需要: ${quantity}`);
    }

    // 原子扣减商品总库存
    const [result] = await connection.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, productId, quantity]
    );

    if (result.affectedRows === 0) {
      throw new Error(`商品 ${productId} 库存扣减失败（可能被其他进程占用）`);
    }

    // 如果有规格信息，扣减规格库存
    if (color && size) {
      const [skuResult] = await connection.execute(
        'UPDATE product_skus SET stock = stock - ? WHERE product_id = ? AND color = ? AND size = ? AND stock >= ?',
        [quantity, productId, color, size, quantity]
      );

      if (skuResult.affectedRows === 0) {
        // 如果规格库存扣减失败，回滚商品库存
        await connection.execute(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [quantity, productId]
        );
        throw new Error(`商品 ${productId} 规格 ${color}/${size} 库存不足或扣减失败`);
      }
    }

    return true;
  }

  /**
   * 安全恢复库存（订单取消时使用）
   * @param {Object} connection - 数据库连接
   * @param {Number} productId - 商品ID
   * @param {Number} quantity - 恢复数量
   * @param {String} color - 颜色（可选）
   * @param {String} size - 尺码（可选）
   * @returns {Promise<Boolean>} 恢复是否成功
   */
  static async safeRestoreStock(connection, productId, quantity, color = '', size = '') {
    if (quantity <= 0) {
      throw new Error('恢复数量必须大于0');
    }

    // 原子恢复商品总库存
    const [result] = await connection.execute(
      'UPDATE products SET stock = stock + ? WHERE id = ?',
      [quantity, productId]
    );

    if (result.affectedRows === 0) {
      throw new Error(`商品 ${productId} 库存恢复失败`);
    }

    // 如果有规格信息，恢复规格库存
    if (color && size) {
      await connection.execute(
        'UPDATE product_skus SET stock = stock + ? WHERE product_id = ? AND color = ? AND size = ?',
        [quantity, productId, color, size]
      );
    }

    return true;
  }

  /**
   * 批量扣减库存（用于订单创建）
   * @param {Object} connection - 数据库连接
   * @param {Array} items - 订单商品列表
   * @returns {Promise<Boolean>} 批量扣减是否成功
   */
  static async batchDeductStock(connection, items) {
    for (const item of items) {
      let productId = 0;
      const idValue = item.product_id || item.id || 0;
      
      if (idValue) {
        const parsedId = parseInt(idValue.toString().trim());
        if (!isNaN(parsedId) && parsedId > 0 && parsedId <= 2147483647) {
          productId = parsedId;
          
          await this.safeDeductStock(
            connection,
            productId,
            item.quantity,
            item.color || '',
            item.size || ''
          );
        }
      }
    }
    
    return true;
  }

  /**
   * 批量恢复库存（用于订单取消）
   * @param {Object} connection - 数据库连接
   * @param {Array} items - 订单商品列表
   * @returns {Promise<Boolean>} 批量恢复是否成功
   */
  static async batchRestoreStock(connection, items) {
    for (const item of items) {
      let productId = 0;
      const idValue = item.product_id || item.id || 0;
      
      if (idValue) {
        const parsedId = parseInt(idValue.toString().trim());
        if (!isNaN(parsedId) && parsedId > 0 && parsedId <= 2147483647) {
          productId = parsedId;
          
          await this.safeRestoreStock(
            connection,
            productId,
            item.quantity,
            item.color || '',
            item.size || ''
          );
        }
      }
    }
    
    return true;
  }

  /**
   * 检查库存是否足够（不实际扣减）
   * @param {Number} productId - 商品ID
   * @param {Number} quantity - 需要数量
   * @param {String} color - 颜色（可选）
   * @param {String} size - 尺码（可选）
   * @returns {Promise<Object>} 库存检查结果
   */
  static async checkStockAvailability(productId, quantity, color = '', size = '') {
    if (quantity <= 0) {
      throw new Error('数量必须大于0');
    }

    const { query } = require('../db/connection');
    
    // 检查商品总库存
    const [product] = await query(
      'SELECT id, stock, status, deleted FROM products WHERE id = ?',
      [productId]
    );

    if (!product || product.length === 0) {
      return { available: false, message: `商品 ${productId} 不存在` };
    }

    const productInfo = product[0];
    if (productInfo.deleted !== 0 || productInfo.status !== 1) {
      return { available: false, message: `商品 ${productId} 已下架或已删除` };
    }

    if (productInfo.stock < quantity) {
      return {
        available: false,
        message: `商品 ${productId} 总库存不足`,
        currentStock: productInfo.stock,
        requiredQuantity: quantity
      };
    }

    // 如果有规格信息，检查规格库存
    if (color && size) {
      const [sku] = await query(
        'SELECT id, stock FROM product_skus WHERE product_id = ? AND color = ? AND size = ?',
        [productId, color, size]
      );

      if (!sku || sku.length === 0) {
        return { available: false, message: `商品 ${productId} 规格 ${color}/${size} 不存在` };
      }

      const skuInfo = sku[0];
      if (skuInfo.stock < quantity) {
        return {
          available: false,
          message: `商品 ${productId} 规格 ${color}/${size} 库存不足`,
          currentStock: skuInfo.stock,
          requiredQuantity: quantity
        };
      }
    }

    return {
      available: true,
      message: '库存充足',
      currentStock: productInfo.stock
    };
  }
}

module.exports = InventoryService;