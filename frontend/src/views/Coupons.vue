<template>
  <div class="coupons-view">
    <div class="page-header">
      <el-button type="primary" @click="openAddModal">
        + 添加优惠券
      </el-button>
    </div>
    
    <div class="card">
      <el-table :data="coupons" style="width: 100%" stripe>
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="优惠券名称" prop="name" min-width="150" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠值" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 'percentage'">{{ row.value }}%</span>
            <span v-else>¥{{ row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最低消费" width="120">
          <template #default="{ row }">
            <span v-if="row.min_amount">¥{{ row.min_amount }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="使用范围" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getScopeName(row.scope) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠券类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.shop_id ? 'warning' : 'success'" size="small">
              {{ row.shop_id ? '店铺券' : '平台券' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="领取/发放" width="120">
          <template #default="{ row }">
            {{ row.received_quantity }} / {{ row.total_quantity }}
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="280">
          <template #default="{ row }">
            <div class="date-range">
              <div>{{ formatDate(row.valid_from) }}</div>
              <div>至</div>
              <div>{{ formatDate(row.valid_to) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditModal(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="deleteCoupon(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="coupons.length === 0" description="暂无优惠券" />
    </div>

    <el-dialog
      v-model="showModal"
      :title="isEdit ? '编辑优惠券' : '添加优惠券'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="coupon-form"
      >
        <el-form-item label="优惠券名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入优惠券名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="优惠券描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入优惠券描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="优惠类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择优惠类型" style="width: 100%">
            <el-option label="固定金额" value="fixed_amount" />
            <el-option label="百分比折扣" value="percentage" />
          </el-select>
        </el-form-item>

        <el-form-item label="优惠值" prop="value">
          <el-input-number 
            v-model="form.value" 
            :min="0"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
          <div class="form-tip">
            {{ form.type === 'percentage' ? '折扣百分比（%）' : '优惠金额（元）' }}
          </div>
        </el-form-item>

        <el-form-item label="使用门槛" prop="min_amount">
          <el-input-number 
            v-model="form.min_amount" 
            :min="0" 
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
          <div class="form-tip">
            <span v-if="form.min_amount > 0">订单金额 ≥ ¥{{ form.min_amount }} 才可使用</span>
            <span v-else>0 表示无门槛限制</span>
          </div>
        </el-form-item>

        <el-form-item label="优惠券适用范围" prop="scope">
          <el-select v-model="form.scope" placeholder="请选择使用范围" style="width: 100%">
            <el-option :label="isMerchant ? '本店全场通用' : '平台全场通用'" :value="isMerchant ? 'shop_all' : 'all'" />
            <el-option label="指定商品" value="specific_product" />
          </el-select>
          <div class="form-tip" v-if="isMerchant && form.scope === 'shop_all'">
            ✅ 本店全场通用：仅适用于您店铺内的所有商品，订单中本店商品总金额需达到使用门槛
          </div>
          <div class="form-tip" v-else-if="!isMerchant && form.scope === 'all'">
            ✅ 平台全场通用：适用于平台所有店铺的商品，订单总金额需达到使用门槛
          </div>
          <div class="form-tip" v-if="form.scope === 'specific_product'">
            ⚠️ 指定商品：仅适用于选中的商品，请至少选择一个商品
          </div>
        </el-form-item>

        <el-form-item v-if="form.scope === 'specific_product'" label="指定商品" prop="productIds">
          <el-select 
            v-model="form.productIds" 
            multiple 
            filterable 
            placeholder="请选择商品"
            style="width: 100%"
          >
            <el-option 
              v-for="product in productList" 
              :key="product.id" 
              :label="product.name" 
              :value="product.id" 
            />
          </el-select>
          <div class="form-tip">已选择 {{ form.productIds.length }} 个商品</div>
        </el-form-item>

        <el-form-item label="发放数量" prop="total_quantity">
          <el-input-number 
            v-model="form.total_quantity" 
            :min="1" 
            :max="100000"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="有效期开始" prop="valid_from">
          <el-date-picker
            v-model="form.valid_from"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="有效期结束" prop="valid_to">
          <el-date-picker
            v-model="form.valid_to"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <div class="form-actions">
          <el-button @click="closeModal">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '立即创建' }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { couponApi, merchantApi, productApi } from '../services/api.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const coupons = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const editingCoupon = ref(null)
const formRef = ref(null)
const currentShop = ref(null)
const productList = ref([])
const loadingProducts = ref(false)

const form = ref({
  name: '',
  description: '',
  type: 'fixed_amount',
  value: 0,
  min_amount: 0,
  scope: 'all',
  productIds: [],
  total_quantity: 100,
  valid_from: '',
  valid_to: '',
  status: 1
})

const rules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
    { min: 1, max: 50, message: '优惠券名称长度在 1-50 个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择优惠券类型', trigger: 'change' }
  ],
  value: [
    { required: true, message: '请输入优惠值', trigger: 'blur' },
    { type: 'number', min: 0, message: '优惠值不能小于 0', trigger: 'blur' }
  ],
  scope: [
    { required: true, message: '请选择使用范围', trigger: 'change' }
  ],
  total_quantity: [
    { required: true, message: '请输入发放数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '发放数量不能小于 1', trigger: 'blur' }
  ],
  valid_from: [
    { required: true, message: '请选择有效期开始时间', trigger: 'change' }
  ],
  valid_to: [
    { required: true, message: '请选择有效期结束时间', trigger: 'change' }
  ]
}

const loadProducts = async () => {
  try {
    loadingProducts.value = true
    const { data } = await productApi.getAll()
    productList.value = data || []
  } catch (error) {
    ElMessage.error('加载商品列表失败：' + error.message)
  } finally {
    loadingProducts.value = false
  }
}

const loadCoupons = async () => {
  try {
    const { data } = await couponApi.getList()
    coupons.value = data || []
  } catch (error) {
    ElMessage.error('加载优惠券列表失败：' + error.message)
  }
}

const openAddModal = () => {
  isEdit.value = false
  editingCoupon.value = null
  resetForm()
  loadProducts()
  showModal.value = true
}

const openEditModal = (coupon) => {
  isEdit.value = true
  editingCoupon.value = coupon
  loadProducts()
  Object.assign(form.value, {
    id: coupon.id,
    name: coupon.name,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value ? Number(coupon.value) : 0,
    min_amount: coupon.min_amount ? Number(coupon.min_amount) : 0,
    scope: coupon.scope,
    productIds: coupon.productIds || [],
    total_quantity: coupon.total_quantity,
    valid_from: coupon.valid_from,
    valid_to: coupon.valid_to,
    status: coupon.status
  })

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    type: 'fixed_amount',
    value: 0,
    min_amount: 0,
    scope: 'all',
    productIds: [],
    total_quantity: 100,
    valid_from: '',
    valid_to: '',
    status: 1
  }
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 指定商品时必须选择至少一个商品
        if (form.value.scope === 'specific_product' && (!form.value.productIds || form.value.productIds.length === 0)) {
          ElMessage.warning('请选择至少一个商品')
          return
        }

        // 商家创建优惠券时，自动添加 shop_id
        const submitData = { ...form.value }
        if (isMerchant.value && currentShop.value) {
          submitData.shop_id = currentShop.value.id
        }

        if (isEdit.value) {
          await couponApi.update(editingCoupon.value.id, submitData)
          ElMessage.success('优惠券更新成功')
        } else {
          await couponApi.add(submitData)
          ElMessage.success('优惠券创建成功')
        }
        closeModal()
        loadCoupons()
      } catch (error) {
        ElMessage.error((isEdit.value ? '更新' : '创建') + '优惠券失败：' + error.message)
      }
    }
  })
}

const deleteCoupon = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个优惠券吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await couponApi.delete(id)
    ElMessage.success('优惠券删除成功')
    loadCoupons()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除优惠券失败：' + error.message)
    }
  }
}

const getTypeName = (type) => {
  const typeMap = {
    fixed_amount: '固定金额',
    percentage: '百分比折扣',
    threshold: '满减优惠',
    free_shipping: '免运费'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type) => {
  const typeMap = {
    fixed_amount: 'primary',
    percentage: 'success',
    threshold: 'warning',
    free_shipping: 'info'
  }
  return typeMap[type] || ''
}

const isMerchant = computed(() => {
  const merchantUserStr = localStorage.getItem('merchant_user')
  return !!merchantUserStr
})

const getScopeName = (scope) => {
  const scopeMap = {
    all: '平台全场通用',
    shop_all: '本店全场通用',
    specific_product: '指定商品'
  }
  return scopeMap[scope] || scope
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped>
.coupons-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.date-range {
  font-size: 18px;
  line-height: 1.5;
  color: #666;
}

.form-tip {
  font-size: 18px;
  color: #909399;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.coupon-form {
  max-height: 60vh;
  overflow-y: auto;
}

.stat-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 18px;
  border-radius: 4px;
  background: #f5f7fa;
  color: #606266;
}
</style>
