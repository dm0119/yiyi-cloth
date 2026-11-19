import { createRouter, createWebHistory } from 'vue-router'

// 移动端页面
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import OrderDetailPage from '../views/OrderDetailPage.vue'
import ShopPage from '../views/ShopPage.vue'
import AfterSaleApplyPage from '../views/AfterSaleApplyPage.vue'
import AfterSaleListPage from '../views/AfterSaleListPage.vue'
import AfterSaleLogisticsPage from '../views/AfterSaleLogisticsPage.vue'

const routes = [
  {
    path: '/mobile',
    redirect: '/mobile/login'
  },
  {
    path: '/mobile/login',
    name: 'MobileLogin',
    component: LoginPage,
    meta: { title: '登录' }
  },
  {
    path: '/mobile/register',
    name: 'MobileRegister',
    component: RegisterPage,
    meta: { title: '注册' }
  },
  {
    path: '/mobile/order/:id',
    name: 'OrderDetail',
    component: OrderDetailPage,
    meta: { title: '订单详情' }
  },
  {
    path: '/mobile/shop/:id',
    name: 'Shop',
    component: ShopPage,
    meta: { title: '店铺详情' }
  },
  {
    path: '/mobile/after-sale/apply',
    name: 'AfterSaleApply',
    component: AfterSaleApplyPage,
    meta: { title: '申请售后' }
  },
  {
    path: '/mobile/after-sales',
    name: 'AfterSaleList',
    component: AfterSaleListPage,
    meta: { title: '售后记录' }
  },
  {
    path: '/mobile/after-sale/logistics',
    name: 'AfterSaleLogistics',
    component: AfterSaleLogisticsPage,
    meta: { title: '填写退货物流' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
