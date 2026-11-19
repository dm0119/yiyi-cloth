<template>
  <div class="after-sale-list-page">
    <van-nav-bar title="售后记录" left-arrow @click-left="router.back()" fixed placeholder />
    
    <van-tabs v-model:active="activeTab" sticky offset-top="46" @change="onTabChange">
      <van-tab title="全部" name=""></van-tab>
      <van-tab title="待处理" name="1"></van-tab>
      <van-tab title="处理中" name="2,3,4"></van-tab>
      <van-tab title="已完成" name="5,6"></van-tab>
    </van-tabs>
    
    <div class="after-sale-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <div v-for="item in list" :key="item.id" class="after-sale-card" @click="goToDetail(item)">
            <div class="card-header">
              <span class="order-no">订单号：{{ item.order_no }}</span>
              <van-tag :type="getStatusType(item.status)">{{ getStatusText(item.status) }}</van-tag>
            </div>
            
            <div class="product-info">
              <img :src="item.product_image || '/placeholder.png'" class="product-image" />
              <div class="product-detail">
                <div class="product-name">{{ item.product_name }}</div>
                <div class="product-spec">{{ item.color }} {{ item.size }}</div>
                <div class="after-sale-type">
                  <van-tag plain size="small">{{ getTypeText(item.type) }}</van-tag>
                  <span v-if="item.new_color || item.new_size" class="exchange-spec">换为：{{ item.new_color }} {{ item.new_size }}</span>
                </div>
              </div>
            </div>
            
            <div class="after-sale-info">
              <div class="info-row"><span class="label">申请原因：</span><span class="value">{{ item.reason }}</span></div>
              <div class="info-row"><span class="label">申请时间：</span><span class="value">{{ item.created_at }}</span></div>
              <div v-if="item.refund_amount > 0" class="info-row"><span class="label">退款金额：</span><span class="value price">¥{{ item.refund_amount }}</span></div>
            </div>
            
            <div class="card-actions">
              <van-button v-if="item.status === 2" size="small" type="primary" @click.stop="goToFillLogistics(item)">填写退货物流</van-button>
              <van-button v-if="item.status >= 3 && item.return_logistics_company" size="small" plain @click.stop="viewLogistics(item)">查看退货物流</van-button>
              <van-button v-if="item.status === 5 && item.type === 'exchange' && item.reship_logistics_company" size="small" type="primary" @click.stop="confirmReceived(item)">确认收货</van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
    
    <van-empty v-if="!loading && list.length === 0" description="暂无售后记录" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { request } from '@/utils/api'

const router = useRouter()
const activeTab = ref('')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)

const getStatusType = (status) => {
  const types = { 1: 'warning', 2: 'primary', 3: 'primary', 4: 'success', 5: 'success', 6: 'danger' }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = { 1: '待处理', 2: '已同意', 3: '退货中', 4: '待退款', 5: '已完成', 6: '已拒绝' }
  return texts[status] || status
}

const getTypeText = (type) => {
  const texts = { refund: '急速退款', return_refund: '退货退款', exchange: '换货' }
  return texts[type] || type
}

const loadList = async (isRefresh = false) => {
  if (isRefresh) { page.value = 1; finished.value = false }
  try {
    const params = new URLSearchParams({ page: page.value, limit: 10 })
    if (activeTab.value) params.append('status', activeTab.value)
    const res = await request(`/mobile/after-sales?${params}`)
    if (res.success) {
      const records = res.data.list || []
      if (isRefresh) list.value = records
      else list.value.push(...records)
      if (records.length < 10) finished.value = true
      page.value++
    }
  } catch (error) { showToast('加载失败') }
}

const onLoad = () => { loading.value = true; loadList().finally(() => { loading.value = false; refreshing.value = false }) }
const onRefresh = () => { refreshing.value = true; loadList(true).finally(() => { refreshing.value = false }) }
const onTabChange = () => { list.value = []; finished.value = false; page.value = 1; onLoad() }
const goToDetail = (item) => { router.push(`/mobile/after-sale/${item.id}`) }
const goToFillLogistics = (item) => { router.push({ path: '/mobile/after-sale/logistics', query: { orderId: item.order_id, afterSaleId: item.id } }) }
const viewLogistics = (item) => { showDialog({ title: '退货物流信息', message: `物流公司：${item.return_logistics_company}\n快递单号：${item.return_tracking_number}`, confirmButtonText: '知道了' }) }
const confirmReceived = async (item) => {
  try {
    await showDialog({ title: '确认收货', message: '确认已收到换货商品？', showCancelButton: true })
    const res = await request(`/mobile/orders/${item.order_id}/confirm-receipt`, { method: 'POST' })
    if (res.success) { showToast('确认收货成功'); onRefresh() }
    else showToast(res.message || '操作失败')
  } catch (e) {}
}
onMounted(() => { onLoad() })
</script>

<style scoped>
.after-sale-list-page { min-height: 100vh; background: #f5f5f5; }
.after-sale-list { padding: 12px; }
.after-sale-card { background: white; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.order-no { font-size: 13px; color: #666; }
.product-info { display: flex; gap: 12px; margin-bottom: 12px; }
.product-image { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; }
.product-detail { flex: 1; }
.product-name { font-size: 14px; margin-bottom: 4px; }
.product-spec { font-size: 12px; color: #999; margin-bottom: 4px; }
.after-sale-type { display: flex; align-items: center; gap: 8px; }
.exchange-spec { font-size: 12px; color: #666; }
.after-sale-info { background: #f9f9f9; padding: 12px; border-radius: 4px; margin-bottom: 12px; }
.info-row { display: flex; margin-bottom: 4px; font-size: 13px; }
.info-row:last-child { margin-bottom: 0; }
.label { color: #999; width: 80px; }
.value { color: #333; flex: 1; }
.value.price { color: #ff6b6b; font-weight: bold; }
.card-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
