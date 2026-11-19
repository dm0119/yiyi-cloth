<template>
  <div class="after-sale-apply-page">
    <van-nav-bar title="申请售后" left-arrow @click-left="router.back()" fixed placeholder />
    
    <!-- 商品信息 -->
    <div class="product-section">
      <div class="section-title">售后商品</div>
      <div class="product-card">
        <img :src="orderItem.image || '/placeholder.png'" class="product-image" />
        <div class="product-info">
          <div class="product-name">{{ orderItem.name }}</div>
          <div class="product-spec">{{ orderItem.color }} {{ orderItem.size }}</div>
          <div class="product-price">¥{{ orderItem.price }} x {{ orderItem.quantity }}</div>
        </div>
      </div>
    </div>
    
    <!-- 售后类型 -->
    <div class="type-section">
      <div class="section-title">售后类型</div>
      <div class="type-options">
        <div v-for="type in afterSaleTypes" :key="type.value" class="type-option" 
             :class="{ active: form.type === type.value }" @click="form.type = type.value">
          <div class="type-name">{{ type.label }}</div>
          <div class="type-desc">{{ type.desc }}</div>
        </div>
      </div>
    </div>
    
    <!-- 换货规格 -->
    <div v-if="form.type === 'exchange'" class="exchange-spec-section">
      <div class="section-title">换货规格（至少选一项）</div>
      <van-cell-group inset>
        <van-cell title="新颜色" :value="form.new_color || '请选择'" is-link @click="showColorPicker = true" />
        <van-cell title="新尺码" :value="form.new_size || '请选择'" is-link @click="showSizePicker = true" />
      </van-cell-group>
    </div>
    
    <!-- 申请原因 -->
    <div class="reason-section">
      <div class="section-title">申请原因</div>
      <van-cell-group inset>
        <van-field v-model="form.reason" rows="3" autosize type="textarea" maxlength="200"
          placeholder="请详细描述问题，如商品质量问题、尺码不合适等" show-word-limit />
      </van-cell-group>
    </div>
    
    <!-- 补充说明和上传图片（可折叠） -->
    <div class="optional-section">
      <div class="section-title collapsible" @click="showOptional = !showOptional">
        <span>补充说明和凭证图片（选填）</span>
        <span class="arrow" :class="{ open: showOptional }">▼</span>
      </div>
      <div v-show="showOptional" class="optional-content">
        <div class="description-section">
          <van-cell-group inset>
            <van-field v-model="form.description" rows="2" autosize type="textarea" maxlength="100"
              placeholder="其他需要说明的情况" show-word-limit />
          </van-cell-group>
        </div>
        <div class="images-section">
          <van-uploader v-model="fileList" multiple :max-count="4" :after-read="afterRead" />
          <div class="images-tip">最多4张，每张不超过5MB</div>
        </div>
      </div>
    </div>
    
    <!-- 提交按钮 -->
    <div class="submit-bar">
      <van-button block type="primary" size="large" :loading="submitting" :disabled="!canSubmit" @click="handleSubmit">
        提交申请
      </van-button>
    </div>
    
    <!-- 选择器 -->
    <van-popup v-model:show="showColorPicker" position="bottom">
      <van-picker :columns="colorColumns" @confirm="onColorConfirm" @cancel="showColorPicker = false" show-toolbar title="选择颜色" />
    </van-popup>
    <van-popup v-model:show="showSizePicker" position="bottom">
      <van-picker :columns="sizeColumns" @confirm="onSizeConfirm" @cancel="showSizePicker = false" show-toolbar title="选择尺码" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { request } from '@/utils/api'

const route = useRoute()
const router = useRouter()

const orderItem = ref({})
const orderId = ref('')
const form = ref({ type: 'return_refund', reason: '', description: '', new_color: '', new_size: '', images: [] })
const afterSaleTypes = [
  { value: 'return_refund', label: '退货退款', desc: '退回商品并获得退款' },
  { value: 'exchange', label: '换货', desc: '更换商品的尺码或颜色' }
]
const fileList = ref([])
const submitting = ref(false)
const showOptional = ref(false)
const showColorPicker = ref(false)
const showSizePicker = ref(false)
const colorColumns = ref(['黑色', '白色', '红色', '蓝色', '藏蓝色'])
const sizeColumns = ref(['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL'])

const canSubmit = computed(() => {
  if (!form.value.reason.trim()) return false
  if (form.value.type === 'exchange' && !form.value.new_color && !form.value.new_size) return false
  return true
})

const loadOrderItem = async () => {
  try {
    const { orderId: oid, itemId } = route.query
    orderId.value = oid
    const res = await request(`/mobile/orders/${oid}`)
    if (res.success) {
      const order = res.data
      let item = null
      if (order.sub_orders) {
        for (const sub of order.sub_orders) {
          item = sub.items.find(i => i.id == itemId)
          if (item) break
        }
      } else {
        item = order.items.find(i => i.id == itemId)
      }
      if (item) {
        orderItem.value = item
        loadProductSpecs(item.product_id)
      }
    }
  } catch (error) {
    showToast('加载失败')
  }
}

const loadProductSpecs = async (pid) => {
  try {
    const res = await request(`/mobile/products/${pid}`)
    if (res.success && res.data) {
      if (res.data.colors?.length) colorColumns.value = res.data.colors
      if (res.data.sizes?.length) sizeColumns.value = res.data.sizes
    }
  } catch (e) {}
}

const afterRead = async (file) => {
  file.status = 'uploading'
  try {
    const formData = new FormData()
    formData.append('file', file.file)
    const res = await request('/upload/product', { method: 'POST', body: formData })
    if (res.success) {
      file.url = res.url
      file.status = 'done'
      form.value.images.push(res.url)
    } else {
      file.status = 'failed'
      showToast('上传失败')
    }
  } catch (e) {
    file.status = 'failed'
    showToast('上传失败')
  }
}

const onColorConfirm = ({ selectedOptions }) => {
  form.value.new_color = selectedOptions[0].text
  showColorPicker.value = false
}

const onSizeConfirm = ({ selectedOptions }) => {
  form.value.new_size = selectedOptions[0].text
  showSizePicker.value = false
}

const handleSubmit = async () => {
  if (!form.value.reason.trim()) {
    showToast('请填写申请原因')
    return
  }
  if (form.value.type === 'exchange' && !form.value.new_color && !form.value.new_size) {
    showToast('请选择换货规格')
    return
  }
  
  submitting.value = true
  try {
    const res = await request(`/mobile/orders/${orderId.value}/after-sale`, {
      method: 'POST',
      body: {
        type: form.value.type,
        reason: form.value.reason,
        description: form.value.description,
        new_color: form.value.new_color,
        new_size: form.value.new_size,
        images: form.value.images
      }
    })
    if (res.success) {
      showDialog({
        title: '申请成功',
        message: '售后申请已提交，请等待商家处理',
        confirmButtonText: '查看售后记录'
      }).then(() => {
        router.push('/mobile/after-sales')
      })
    } else {
      showToast(res.message || '申请失败')
    }
  } catch (error) {
    showToast('申请失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(loadOrderItem)
</script>

<style scoped>
.after-sale-apply-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}
.section-title {
  font-size: 13px;
  color: #666;
  padding: 8px 12px;
}
.product-section {
  background: white;
  margin-bottom: 8px;
}
.product-card {
  display: flex;
  gap: 10px;
  padding: 0 12px 12px;
}
.product-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
}
.product-info {
  flex: 1;
}
.product-name {
  font-size: 13px;
  margin-bottom: 3px;
}
.product-spec {
  font-size: 11px;
  color: #999;
  margin-bottom: 3px;
}
.product-price {
  color: #ff6b6b;
  font-size: 13px;
}
.type-section {
  background: white;
  margin-bottom: 8px;
}
.type-options {
  padding: 0 12px 12px;
  display: flex;
  gap: 10px;
}
.type-option {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
}
.type-option.active {
  border-color: #07c160;
  background: #f0fff5;
}
.type-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 2px;
}
.type-desc {
  font-size: 11px;
  color: #999;
}
.exchange-spec-section, .reason-section {
  background: white;
  margin-bottom: 8px;
}
.optional-section {
  background: white;
  margin-bottom: 8px;
}
.section-title.collapsible {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.section-title .arrow {
  font-size: 12px;
  color: #999;
  transition: transform 0.3s ease;
}
.section-title .arrow.open {
  transform: rotate(180deg);
}
.optional-content {
  padding: 0 12px 12px;
}
.description-section, .images-section {
  margin-top: 8px;
}
.images-uploader {
  padding: 0 12px;
}
.images-tip {
  font-size: 11px;
  color: #999;
  padding: 6px 12px;
}
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}
</style>
