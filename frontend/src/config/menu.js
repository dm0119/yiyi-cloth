export const menuItems = [
  {
    index: '/admin',
    title: '数据统计',
    icon: 'DataAnalysis',
    permission: 'dashboard:view'
  },
  // 商品中心
  {
    index: '/product',
    title: '商品中心',
    icon: 'Goods',
    children: [
      {
        index: '/admin/products',
        title: '商品管理',
        permission: 'product:view'
      },
      {
        index: '/admin/categories',
        title: '分类管理',
        permission: 'category:view'
      },
      {
        index: '/admin/hot-products',
        title: '热门推荐',
        permission: 'hot_product:view'
      },
      {
        index: '/admin/new-products',
        title: '新品推荐',
        permission: 'new_product:view'
      }
    ]
  },
  // 订单中心
  {
    index: '/order',
    title: '订单中心',
    icon: 'ShoppingCart',
    children: [
      {
        index: '/admin/orders',
        title: '订单管理',
        permission: 'order:view'
      },
      {
        index: '/admin/after-sales',
        title: '售后管理',
        permission: 'order:view'
      },
      {
        index: '/admin/reviews',
        title: '评价管理',
        permission: 'review:view'
      },
      {
        index: '/admin/coupons',
        title: '优惠券管理',
        permission: 'coupon:view'
      }
    ]
  },
  // 用户中心
  {
    index: '/user',
    title: '用户中心',
    icon: 'User',
    children: [
      {
        index: '/admin/users',
        title: '用户管理',
        permission: 'user:view'
      },
      {
        index: '/admin/roles',
        title: '角色管理',
        permission: 'role:view'
      }
    ]
  },
  // 店铺中心
  {
    index: '/shop',
    title: '店铺中心',
    icon: 'Grid',
    children: [
      {
        index: '/admin/merchant-applications',
        title: '入驻申请审核',
        permission: 'merchant:review'
      },
      {
        index: '/admin/shops',
        title: '店铺管理',
        permission: 'shop:view'
      },
      {
        index: '/admin/brands',
        title: '品牌管理',
        permission: 'shop:manage'
      }
    ]
  },
  // 社区中心
  {
    index: '/community',
    title: '社区中心',
    icon: 'ChatRound',
    children: [
      {
        index: '/admin/discussions',
        title: '社区管理',
        permission: 'discussion:view'
      },
      {
        index: '/admin/zones',
        title: '专区管理',
        permission: 'zone:view'
      }
    ]
  },
  // 客服中心
  {
    index: '/service',
    title: '客服中心',
    icon: 'ChatDotRound',
    children: [
      {
        index: '/admin/conversations',
        title: '会话管理',
        permission: 'conversation:view'
      }
    ]
  }
]

export const iconMap = {
  DataAnalysis: 'DataAnalysis',
  Goods: 'Goods',
  ShoppingCart: 'ShoppingCart',
  User: 'User',
  ChatRound: 'ChatRound',
  ChatDotRound: 'ChatDotRound',
  Grid: 'Grid'
}
