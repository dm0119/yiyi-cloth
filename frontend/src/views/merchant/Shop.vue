<template>
  <div class="merchant-shop">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>店铺信息</span>
          <el-button type="primary" @click="editShop" v-if="!isEditing">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <template v-else>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="saveShop" :loading="saving">保存</el-button>
          </template>
        </div>
      </template>

      <el-form :model="shopForm" label-width="100px" v-if="shop" class="shop-form">
        <!-- 店铺名称 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="店铺名称">
              <el-input v-if="isEditing" v-model="shopForm.name" />
              <span v-else class="info-value">{{ shopForm.name || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名">
              <el-input v-if="isEditing" v-model="shopForm.legal_person" />
              <span v-else class="info-value">{{ shopForm.legal_person || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 店铺描述 -->
        <el-form-item label="店铺描述">
          <el-input
            v-if="isEditing"
            v-model="shopForm.description"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 6 }"
            placeholder="请输入店铺描述"
          />
          <span v-else class="info-value multiline">{{ shopForm.description || '-' }}</span>
        </el-form-item>

        <!-- 联系电话 & 联系邮箱 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-if="isEditing" v-model="shopForm.contact_phone" />
              <span v-else class="info-value">{{ shopForm.contact_phone || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系邮箱">
              <el-input v-if="isEditing" v-model="shopForm.contact_email" />
              <span v-else class="info-value">{{ shopForm.contact_email || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 退货地址 -->
        <el-form-item label="退货地址">
          <el-input
            v-if="isEditing"
            v-model="shopForm.return_address"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="买家退货时显示的收货地址"
          />
          <span v-else class="info-value multiline">{{ shopForm.return_address || '-' }}</span>
        </el-form-item>



        <!-- 营业执照号 & 店铺状态 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营业执照号">
              <el-input v-if="isEditing" v-model="shopForm.license_no" />
              <span v-else class="info-value">{{ shopForm.license_no || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="店铺状态">
              <el-tag :type="getStatusType(shopForm.status)">
                {{ getStatusText(shopForm.status) }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 创建时间 & 更新时间 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间">
              <span class="info-value">{{ formatDateTime(shopForm.created_at) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间">
              <span class="info-value">{{ formatDateTime(shopForm.updated_at) }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 资质图片显示区域 -->
        <el-divider content-position="left">资质认证</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="店铺资格证">
              <div class="cert-image-container">
                <el-image 
                  v-if="shopForm.license_image"
                  :src="shopForm.license_image" 
                  fit="contain" 
                  class="cert-image"
                  :preview-src-list="[shopForm.license_image]"
                />
                <span v-else class="no-image">未上传</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="身份证正面">
              <div class="cert-image-container">
                <el-image 
                  v-if="shopForm.id_card_front"
                  :src="shopForm.id_card_front" 
                  fit="contain" 
                  class="cert-image"
                  :preview-src-list="[shopForm.id_card_front]"
                />
                <span v-else class="no-image">未上传</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="身份证反面">
              <div class="cert-image-container">
                <el-image 
                  v-if="shopForm.id_card_back"
                  :src="shopForm.id_card_back" 
                  fit="contain" 
                  class="cert-image"
                  :preview-src-list="[shopForm.id_card_back]"
                />
                <span v-else class="no-image">未上传</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="shop-card" v-loading="loading">
      <template #header>
        <span>店铺统计</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="stat-card" shadow="hover">
            <el-statistic title="商品总数" :value="stats.productCount" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card" shadow="hover">
            <el-statistic title="订单总数" :value="stats.orderCount" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card" shadow="hover">
            <el-statistic title="销售额" :value="formattedTotalSales" prefix="¥" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { merchantApi } from '../../services/api'
import { formatDateTime } from '../../utils/dateFormatter'

const loading = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const shop = ref(null)
const shopForm = reactive({
  name: '',
  description: '',
  legal_person: '',
  contact_phone: '',
  contact_email: '',
  license_no: '',
  status: '',
  created_at: '',
  updated_at: '',
  license_image: '',
  id_card_front: '',
  id_card_back: '',
  return_address: ''
})

const stats = reactive({
  productCount: 0,
  orderCount: 0,
  totalSales: 0
})

// 格式化销售额为固定小数点
const formattedTotalSales = computed(() => {
  return Number(stats.totalSales || 0).toFixed(2)
})

// 加载店铺信息
const loadShop = async () => {
  loading.value = true
  try {
    const response = await merchantApi.getShop()
    if (response.success && response.data) {
      shop.value = response.data
      Object.assign(shopForm, {
        name: response.data.name || '',
        description: response.data.description || '',
        legal_person: response.data.legal_person || '',
        contact_phone: response.data.contact_phone || '',
        contact_email: response.data.contact_email || '',
        license_no: response.data.license_no || '',
        status: response.data.status || '',
        created_at: response.data.created_at || '',
        updated_at: response.data.updated_at || '',
        license_image: response.data.license_image || '',
        id_card_front: response.data.id_card_front || '',
        id_card_back: response.data.id_card_back || '',
        return_address: response.data.return_address || ''
      })

      // 加载统计数据
      await loadShopStats(response.data.id)
    }
  } catch (error) {
    console.error('加载店铺信息失败:', error)
    ElMessage.error('加载店铺信息失败')
  } finally {
    loading.value = false
  }
}

// 加载店铺统计
const loadShopStats = async (shopId) => {
  try {
    // 获取商品数
    const productRes = await merchantApi.getShopProducts(shopId)
    if (productRes.success) {
      stats.productCount = productRes.data?.length || 0
    }

    // 获取订单数和销售额
    const orderRes = await merchantApi.getShopOrders({ page: 1, pageSize: 1000 })
    if (orderRes.success) {
      const orders = orderRes.data || []
      // 订单总数显示所有订单
      stats.orderCount = orders.length
      // 销售额只统计已完成订单（状态 4 和 5）
      const validOrders = orders.filter(o => o.status === 4 || o.status === 5)
      stats.totalSales = validOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
    }
  } catch (error) {
    console.error('加载店铺统计失败:', error)
  }
}

// 编辑店铺
const editShop = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  Object.assign(shopForm, {
    name: shop.value.name || '',
    description: shop.value.description || '',
    legal_person: shop.value.legal_person || '',
    contact_phone: shop.value.contact_phone || '',
    contact_email: shop.value.contact_email || '',
    license_no: shop.value.license_no || '',
    status: shop.value.status || '',
    created_at: shop.value.created_at || '',
    updated_at: shop.value.updated_at || '',
    license_image: shop.value.license_image || '',
    id_card_front: shop.value.id_card_front || '',
    id_card_back: shop.value.id_card_back || '',
    return_address: shop.value.return_address || ''
  })
}

// 保存店铺
const saveShop = async () => {
  saving.value = true
  try {
    const response = await merchantApi.updateShop(shopForm)
    if (response.success) {
      ElMessage.success('保存成功')
      isEditing.value = false
      await loadShop()
    }
  } catch (error) {
    console.error('保存店铺失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    inactive: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    active: '启用',
    inactive: '禁用'
  }
  return textMap[status] || status
}

onMounted(() => {
  loadShop()
})
</script>

<style scoped>
.merchant-shop {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shop-card {
  margin-top: 20px;
}

.stat-card {
  text-align: center;
}

:deep(.el-statistic__head) {
  margin-bottom: 10px;
}

:deep(.el-statistic__content) {
  font-size: 38px;
  font-weight: bold;
}

/* 表单样式优化 */
.shop-form {
  max-width: 900px;
}

.shop-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.shop-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 信息值展示样式 */
.info-value {
  display: inline-block;
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #303133;
  font-size: 14px;
  line-height: 1.5;
  min-width: 120px;
  max-width: 100%;
  word-break: break-all;
}

.info-value.multiline {
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 600px;
}

.cert-image-container {
  width: 120px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f5f5f5;
}

.cert-image {
  width: 100%;
  height: 100%;
}

.no-image {
  color: #999;
  font-size: 14px;
}
</style>
