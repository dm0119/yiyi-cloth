<template>
  <div class="zones-container">
    <div class="page-header">
      <h1>专区管理</h1>
      <el-button type="primary" @click="handleAddZone" size="small">
        <el-icon><Plus /></el-icon> 新增专区
      </el-button>
    </div>

    <el-card class="zones-card">
      <el-table :data="zones" style="width: 100%">
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="专区名称" />
        <el-table-column label="封面图片" width="120">
          <template #default="scope">
            <el-image
              v-if="scope.row.cover_image"
              :src="getImageUrl(scope.row.cover_image)"
              fit="cover"
              style="width: 80px; height: 40px; border-radius: 4px"
            />
            <span v-else class="text-muted">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button @click="handleEditZone(scope.row)" size="small" type="primary" plain>
              编辑
            </el-button>
            <el-button @click="handleManageProducts(scope.row)" size="small" type="info" plain>
              管理商品
            </el-button>
            <el-button 
              @click="handleDeleteZone(scope.row.id)" 
              size="small" 
              type="danger" 
              plain
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑专区对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="专区名称" required>
          <el-input v-model="formData.name" placeholder="请输入专区名称" />
        </el-form-item>
        <el-form-item label="专区描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入专区描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="true"
            :on-success="handleImageUploadSuccess"
            :on-error="handleImageUploadError"
            :before-upload="beforeUpload"
            :limit="1"
          >
            <template #default>
              <div v-if="formData.cover_image" class="image-preview">
                <el-image
                  :src="getImageUrl(formData.cover_image)"
                  fit="cover"
                  style="width: 100%; height: 150px; border-radius: 4px"
                />
                <el-button 
                  type="danger" 
                  size="small" 
                  @click.stop="removeImage"
                  style="position: absolute; bottom: 10px; right: 10px"
                >
                  删除
                </el-button>
              </div>
              <el-button v-else type="primary" plain>
                <el-icon><Plus /></el-icon> 上传图片
              </el-button>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort_order" :min="0" size="large" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="true" :inactive-value="false" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 管理商品对话框 -->
    <el-dialog
      v-model="productsDialogVisible"
      :title="`${currentZone?.name || ''} - 商品管理`"
      width="900px"
      top="5vh"
    >
      <div class="products-dialog-content">
        <!-- 搜索区域 -->
        <div class="search-section">
          <el-input
            v-model="productSearchQuery"
            placeholder="搜索商品名称"
            clearable
            @keyup.enter="searchProducts"
            @clear="searchProducts"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 左右分栏布局 -->
        <div class="products-container">
          <!-- 左侧：可选商品 -->
          <div class="available-products-panel">
            <div class="panel-header">
              <span class="panel-title">可选商品</span>
              <span class="panel-count">共 {{ availableProducts.length }} 件</span>
            </div>
            <el-scrollbar class="products-scroll">
              <div v-if="availableProducts.length === 0" class="empty-tip">
                <el-empty description="暂无可选商品" :image-size="80" />
              </div>
              <div v-else class="products-list">
                <div 
                  v-for="product in availableProducts" 
                  :key="product.id"
                  class="product-card"
                  :class="{ 'is-selected': selectedProducts.includes(product.id) }"
                  @click="toggleProductSelection(product.id)"
                >
                  <el-checkbox 
                    :model-value="selectedProducts.includes(product.id)"
                    @click.stop
                    @change="toggleProductSelection(product.id)"
                  />
                  <el-image
                    :src="getImageUrl(product.image)"
                    fit="cover"
                    class="product-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="product-details">
                    <div class="product-name" :title="product.name">{{ product.name }}</div>
                    <div class="product-price">¥{{ parseFloat(product.price || 0).toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>

          <!-- 中间：操作按钮 -->
          <div class="actions-panel">
            <el-button 
              type="primary" 
              :disabled="selectedProducts.length === 0"
              @click="addProductsToZone"
            >
              <el-icon><Right /></el-icon>
              添加
            </el-button>
          </div>

          <!-- 右侧：已选商品 -->
          <div class="selected-products-panel">
            <div class="panel-header">
              <span class="panel-title">已选商品</span>
              <span class="panel-count">共 {{ zoneProducts.length }} 件</span>
            </div>
            <el-scrollbar class="products-scroll">
              <div v-if="zoneProducts.length === 0" class="empty-tip">
                <el-empty description="暂无已选商品" :image-size="80" />
              </div>
              <div v-else class="products-list">
                <div 
                  v-for="product in zoneProducts" 
                  :key="product.id"
                  class="product-card selected"
                >
                  <el-image
                    :src="getImageUrl(product.image)"
                    fit="cover"
                    class="product-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="product-details">
                    <div class="product-name" :title="product.name">{{ product.name }}</div>
                    <div class="product-price">¥{{ parseFloat(product.price || 0).toFixed(2) }}</div>
                  </div>
                  <el-button 
                    type="danger" 
                    size="small"
                    text
                    @click="removeProductFromZone(product.id)"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="productsDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Search, Right, Close, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { zoneApi, productApi } from '../services/api'

const zones = ref([])
const dialogVisible = ref(false)
const productsDialogVisible = ref(false)
const dialogTitle = ref('新增专区')
const formData = ref({
  id: null,
  name: '',
  description: '',
  cover_image: '',
  sort_order: 0,
  status: 1
})
const currentZone = ref(null)
const availableProducts = ref([])
const zoneProducts = ref([])
const selectedProducts = ref([])
const productSearchQuery = ref('')
const uploadUrl = 'http://localhost:3000/api/upload/product'

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`
  }
})

const getImageUrl = (url) => {
  if (!url) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjNmMyIvPjwvc3ZnPg=='
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `http://localhost:3000${url}`
}

const loadZones = async () => {
  try {
    console.log('开始加载专区列表')
    const response = await zoneApi.getAll()
    console.log('加载专区列表响应:', response)
    if (response.success) {
      console.log('专区列表数据:', response.data)
      // 输出每个专区的详细信息，特别是status字段
      response.data.forEach((zone, index) => {
        console.log(`专区 ${index + 1}:`, zone)
        console.log(`专区 ${index + 1} 状态:`, zone.status, typeof zone.status)
      })
      zones.value = response.data
    }
  } catch (error) {
    console.error('加载专区失败:', error)
  }
}

const handleAddZone = () => {
  dialogTitle.value = '新增专区'
  formData.value = {
    id: null,
    name: '',
    description: '',
    cover_image: '',
    sort_order: 0,
    status: 1
  }
  dialogVisible.value = true
}

const handleEditZone = (zone) => {
  dialogTitle.value = '编辑专区'
  // 将数字类型的status转换为布尔值，以便el-switch组件正确显示
  formData.value = {
    ...zone,
    status: zone.status === 1
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    // 准备提交数据，将布尔值的status转换为数字1或0
    const submitData = {
      ...formData.value,
      status: formData.value.status ? 1 : 0
    }
    console.log('提交专区数据:', submitData)
    console.log('提交状态值:', submitData.status, typeof submitData.status)
    let response
    if (submitData.id) {
      console.log('更新专区:', submitData.id, '状态:', submitData.status)
      response = await zoneApi.update(submitData.id, submitData)
    } else {
      console.log('创建专区:', '状态:', submitData.status)
      response = await zoneApi.create(submitData)
    }
    console.log('提交响应:', response)
    if (response.success) {
      dialogVisible.value = false
      loadZones()
    }
  } catch (error) {
    console.error('保存专区失败:', error)
  }
}

const handleDeleteZone = async (id) => {
  try {
    await zoneApi.delete(id)
    loadZones()
  } catch (error) {
    console.error('删除专区失败:', error)
  }
}

const handleManageProducts = async (zone) => {
  currentZone.value = zone
  productsDialogVisible.value = true
  await loadAvailableProducts()
  await loadZoneProducts(zone.id)
}

const loadAvailableProducts = async () => {
  try {
    const response = await productApi.getAll()
    if (response.success) {
      availableProducts.value = response.data
    }
  } catch (error) {
    console.error('加载商品失败:', error)
  }
}

const loadZoneProducts = async (zoneId) => {
  try {
    const response = await zoneApi.getZoneProducts(zoneId)
    if (response.success) {
      zoneProducts.value = response.data
      selectedProducts.value = []
    }
  } catch (error) {
    console.error('加载专区商品失败:', error)
  }
}

const searchProducts = async () => {
  try {
    const response = await productApi.getList({ keyword: productSearchQuery.value })
    if (response.success) {
      availableProducts.value = response.data
    }
  } catch (error) {
    console.error('搜索商品失败:', error)
  }
}

const toggleProductSelection = (productId) => {
  const index = selectedProducts.value.indexOf(productId)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(productId)
  }
}

const addProductsToZone = async () => {
  try {
    for (const productId of selectedProducts.value) {
      await zoneApi.addProductToZone({
        zone_id: currentZone.value.id,
        product_id: productId
      })
    }
    await loadZoneProducts(currentZone.value.id)
    selectedProducts.value = []
  } catch (error) {
    console.error('添加商品到专区失败:', error)
  }
}

const removeProductFromZone = async (productId) => {
  try {
    await zoneApi.removeProductFromZone({
      zone_id: currentZone.value.id,
      product_id: productId
    })
    await loadZoneProducts(currentZone.value.id)
  } catch (error) {
    console.error('从专区移除商品失败:', error)
  }
}

const handleImageUploadSuccess = (response) => {
  if (response.success) {
    formData.value.cover_image = response.data.url
  }
}

const handleImageUploadError = (error) => {
  console.error('上传图片失败:', error)
}

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
  if (!isJpgOrPng) {
    ElMessage.error('只能上传 JPG、PNG 或 WebP 格式的图片')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

const removeImage = () => {
  formData.value.cover_image = ''
}

onMounted(() => {
  loadZones()
})
</script>

<style scoped>
.zones-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
}

.zones-card {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 150px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.products-dialog-content {
  padding: 10px 0;
}

.search-section {
  margin-bottom: 16px;
}

.products-container {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.available-products-panel,
.selected-products-panel {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-count {
  font-size: 12px;
  color: #909399;
}

.products-scroll {
  height: 400px;
}

.products-list {
  padding: 8px;
}

.product-card {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.product-card.is-selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.product-card.selected {
  cursor: default;
}

.product-card .el-checkbox {
  margin-right: 8px;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  margin-right: 10px;
  flex-shrink: 0;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #c0c4cc;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 600;
}

.actions-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>