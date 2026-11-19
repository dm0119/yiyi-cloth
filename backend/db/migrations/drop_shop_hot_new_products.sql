-- 删除店铺热门商品推荐表和新品推荐表
-- 执行时间：2026-04-06
-- 原因：恢复移动端商品详情中店铺详情的自动排序功能

-- 删除店铺热门商品推荐表
DROP TABLE IF EXISTS `shop_hot_products`;

-- 删除店铺新品推荐表
DROP TABLE IF EXISTS `shop_new_products`;
