/**
 * 商家后台菜单配置
 */

export const merchantMenu = [
  {
    id: 1,
    label: '数据统计',
    path: '/merchant/dashboard',
    icon: 'DataAnalysis',
    permission: 'product:view'
  },
  // 商品中心
  {
    id: 2,
    label: '商品中心',
    path: '/merchant/product',
    icon: 'Goods',
    children: [
      {
        id: 21,
        label: '商品管理',
        path: '/merchant/products',
        permission: 'product:view'
      },
      // {
      //   id: 22,
      //   label: '热门推荐',
      //   path: '/merchant/hot-products',
      //   permission: 'hot_product:view'
      // },
      // {
      //   id: 23,
      //   label: '新品推荐',
      //   path: '/merchant/new-products',
      //   permission: 'new_product:manage'
      // },
    ]
  },
  // 订单中心
  {
    id: 3,
    label: '订单中心',
    path: '/merchant/order',
    icon: 'ShoppingCart',
    children: [
      {
        id: 31,
        label: '订单管理',
        path: '/merchant/orders',
        permission: 'order:view'
      },
      {
        id: 34,
        label: '售后管理',
        path: '/merchant/after-sales',
        permission: 'order:view'
      },
      {
        id: 32,
        label: '评价管理',
        path: '/merchant/reviews',
        permission: 'review:view'
      },
      {
        id: 33,
        label: '优惠券管理',
        path: '/merchant/coupons',
        permission: 'coupon:view'
      }
    ]
  },
  // 店铺管理
  {
    id: 5,
    label: '店铺中心',
    path: '/merchant/shop',
    icon: 'Shop',
    permission: 'shop:view'
  }
]

export const iconMap = {
  DataAnalysis: 'DataAnalysis',
  Goods: 'Goods',
  ShoppingCart: 'ShoppingCart',
  TrendCharts: 'TrendCharts',
  Shop: 'Shop',
  Star: 'Star',
  Discount: 'Discount',
  HotWater: 'HotWater',
  Crown: 'Crown'
}

export default merchantMenu
