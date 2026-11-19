<template>
  <div class="after-sale-logistics-page">
    <van-nav-bar title="填写退货物流" left-arrow @click-left="router.back()" fixed placeholder />
    
    <!-- 提示信息 -->
    <van-notice-bar color="#1989fa" background="#ecf9ff" left-icon="info-o">
      商家已同意售后申请，请填写退货物流信息
    </van-notice-bar>
    
    <!-- 退货地址 -->
    <div class="address-section">
      <div class="section-title">商家退货地址</div>
      <van-cell-group inset>
        <van-cell>
          <template #title>
            <div class="address-info">
              <div class="address-name">商家收货地址</div>
              <div class="address-detail">{{ merchantAddress }}</div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <!-- 物流信息表单 -->
    <div class="form-section">
      <div class="section-title">退货物流信息</div>
      <van-cell-group inset>
        <van-field
          v-model="form.logistics_company"
          label="物流公司"
          placeholder="请选择物流公司"
          readonly
          is-link
          @click="showCompanyPicker = true"
          :rules="[{ required: true, message: '请选择物流公司' }]"
        />
        <van-field
          v-model="form.tracking_number"
          label="快递单号"
          placeholder="请输入快递单号"
          :rules="[{ required: true, message: '请输入快递单号' }]"
          class="tracking-input"
        />
      </van-cell-group>
    </div>
    
    <!-- 温馨提示 -->
    <div class="tips-section">
      <div class="section-title">温馨提示</div>
      <div class="tips-content">
        <p>1. 请确保商品包装完好，配件齐全</p>
        <p>2. 建议使用有物流跟踪的快递方式</p>
        <p>3. 保留好快递单号以便查询</p>
        <p>4. 商家确认收货后将为您处理退款/换货</p>
      </div>
    </div>
    
    <!-- 提交按钮 -->
    <div class="submit-bar">
      <van-button block type="primary" size="large" :loading="submitting" :disabled="!canSubmit" @click="handleSubmit">
        提交物流信息
      </van-button>
    </div>
    
    <!-- 物流公司选择器 -->
    <van-popup v-model:show="showCompanyPicker" position="bottom">
      <van-picker
        :columns="logisticsCompanies"
        @confirm="onCompanyConfirm"
        @cancel="showCompanyPicker = false"
        show-toolbar
        title="选择物流公司"
      />
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

const orderId = ref('')
const afterSaleId = ref('')
const merchantAddress = ref('')

const form = ref({
  logistics_company: '',
  tracking_number: ''
})

const submitting = ref(false)
const showCompanyPicker = ref(false)

const logisticsCompanies = [
  { text: '顺丰速运', value: 'SF' },
  { text: '圆通速递', value: 'YT' },
  { text: '中通快递', value: 'ZT' },
  { text: '申通快递', value: 'STO' },
  { text: '韵达速递', value: 'YD' },
  { text: 'EMS', value: 'EMS' },
  { text: '京东物流', value: 'JD' },
  { text: '德邦快递', value: 'DB' },
  { text: '极兔速递', value: 'JT' },
  { text: '邮政快递', value: 'YZ' }
]

const canSubmit = computed(() => {
  return form.value.logistics_company && form.value.tracking_number.trim()
})

const onCompanyConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0]
  form.value.logistics_company = selected.text
  // 自动添加快递单号前缀
  const prefix = selected.value
  if (prefix && !form.value.tracking_number.startsWith(prefix)) {
    form.value.tracking_number = prefix + form.value.tracking_number.replace(/^[A-Z]+/, '')
  }
  showCompanyPicker.value = false
}

const handleSubmit = async () => {
  if (!form.value.logistics_company) {
    showToast('请选择物流公司')
    return
  }
  if (!form.value.tracking_number.trim()) {
    showToast('请输入快递单号')
    return
  }
  
  submitting.value = true
  try {
    const res = await request(`/mobile/orders/${orderId.value}/after-sale/return-logistics`, {
      method: 'POST',
      body: {
        logistics_company: form.value.logistics_company,
        tracking_number: form.value.tracking_number
      }
    })
    
    if (res.success) {
      showDialog({
        title: '提交成功',
        message: '退货物流信息已提交，商家确认收货后将为您处理退款/换货',
        confirmButtonText: '查看售后进度'
      }).then(() => {
        router.push('/mobile/after-sales')
      })
    } else {
      showToast(res.message || '提交失败')
    }
  } catch (error) {
    showToast('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  orderId.value = route.query.orderId
  afterSaleId.value = route.query.afterSaleId
  
  // 加载商家退货地址
  const shopId = route.query.shopId
  if (shopId) {
    request(`/mobile/merchants/${shopId}`).then(res => {
      if (res.success && res.data?.return_address) {
        merchantAddress.value = res.data.return_address
      } else {
        merchantAddress.value = '商家暂未设置退货地址，请联系客服'
      }
    }).catch(() => {
      merchantAddress.value = '商家暂未设置退货地址，请联系客服'
    })
  }
})
</script>

<style scoped>
.after-sale-logistics-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.section-title {
  font-size: 14px;
  color: #666;
  padding: 12px 16px;
}

.address-section {
  margin-bottom: 12px;
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.address-detail {
  font-size: 13px;
  color: #666;
}

.form-section {
  background: white;
  margin-bottom: 12px;
}

.tips-section {
  background: white;
  margin-bottom: 12px;
}

.tips-content {
  padding: 0 16px 16px;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.tips-content p {
  margin: 0;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

/* 快递单号输入框样式 */
.tracking-input :deep(.van-field__control) {
  min-height: 44px;
  line-height: 44px;
  font-size: 16px;
}
</style>
