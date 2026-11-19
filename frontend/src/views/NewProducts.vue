<template>
  <div class="new-products-view">
    <div class="page-header">
      <el-button type="primary" @click="openAddModal">
        + 添加新品商品
      </el-button>
    </div>
    
    <div class="card">
      <el-table :data="newProducts" style="width: 100%" stripe>
        <el-table-column label="排序" prop="sort_order" width="120" sortable>
          <template #default="{ row }">
            <el-input-number 
              v-model="row.sort_order" 
              :min="0" 
              size="small" 
              @change="updateSortOrder(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div class="product-info">
              <div class="image-wrapper">
                <el-image 
                  :src="getImageUrl(row.image)" 
                  fit="cover"
                  class="product-image"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="product-details">
                <p class="product-name">{{ row.name }}</p>
                <p class="product-price">¥{{ row.price.toFixed(2) }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="销量" prop="sales_count" width="100" sortable />
        <el-table-column label="评分" width="100" sortable>
          <template #default="{ row }">
            <el-rate 
              v-model="row.avg_rating" 
              disabled 
              show-score 
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column label="库存" prop="stock" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.product_status === 1 ? 'success' : 'info'">
              {{ row.product_status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              size="small" 
              @click="handleRemove(row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-dialog 
      v-model="addModalVisible" 
      title="添加新品商品" 
      width="70%"
    >
      <div class="search-box">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索商品名称" 
          clearable
          @keyup.enter="loadAvailableProducts"
        >
          <template #append>
            <el-button @click="loadAvailableProducts">搜索</el-button>
          </template>
        </el-input>
      </div>
      
      <el-table 
        :data="availableProducts" 
        style="width: 100%; margin-top: 20px;" 
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div class="product-info">
              <div class="image-wrapper">
                <el-image 
                  :src="getImageUrl(row.image)" 
                  fit="cover"
                  class="product-image"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="product-details">
                <p class="product-name">{{ row.name }}</p>
                <p class="product-price">¥{{ row.price.toFixed(2) }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="销量" prop="sales_count" width="100" sortable />
        <el-table-column label="评分" width="100" sortable>
          <template #default="{ row }">
            <el-rate 
              v-model="row.avg_rating" 
              disabled 
              show-score 
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column label="库存" prop="stock" width="100" />
        <el-table-column label="创建时间" prop="created_at" width="180" sortable />
      </el-table>
      
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd" :disabled="!selectedProduct">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { newProductApi } from '../services/api'

const API_BASE = 'http://localhost:3000'

const newProducts = ref([])
const addModalVisible = ref(false)
const availableProducts = ref([])
const searchKeyword = ref('')
const selectedProduct = ref(null)

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/60x60'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    return `${API_BASE}${url}`
  }
  return url
}

async function loadNewProducts() {
  try {
    const res = await newProductApi.getList()
    if (res.success) {
      newProducts.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载新品商品失败')
  }
}

async function loadAvailableProducts() {
  try {
    const res = await newProductApi.getAvailable({ keyword: searchKeyword.value })
    if (res.success) {
      availableProducts.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  }
}

function openAddModal() {
  searchKeyword.value = ''
  availableProducts.value = []
  selectedProduct.value = null
  loadAvailableProducts()
  addModalVisible.value = true
}

function handleSelectionChange(selection) {
  if (selection.length > 0) {
    selectedProduct.value = selection[selection.length - 1]
  } else {
    selectedProduct.value = null
  }
}

async function handleAdd() {
  if (!selectedProduct.value) {
    ElMessage.warning('请选择商品')
    return
  }
  
  try {
    const res = await newProductApi.add({
      product_id: selectedProduct.value.id,
      sort_order: newProducts.value.length
    })
    if (res.success) {
      ElMessage.success('添加成功')
      addModalVisible.value = false
      loadNewProducts()
    }
  } catch (error) {
    ElMessage.error(error.message || '添加失败')
  }
}

async function updateSortOrder(row) {
  try {
    const res = await newProductApi.updateSortOrder(row.id, row.sort_order)
    if (res.success) {
      ElMessage.success('排序更新成功')
      loadNewProducts()
    }
  } catch (error) {
    ElMessage.error('更新排序失败')
  }
}

async function handleRemove(row) {
  try {
    await ElMessageBox.confirm('确定要移除该新品商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await newProductApi.remove(row.id)
    if (res.success) {
      ElMessage.success('移除成功')
      loadNewProducts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

onMounted(() => {
  loadNewProducts()
})
</script>

<style scoped>
.new-products-view {
  padding: var(--page-padding);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: var(--spacing-lg);
}

.product-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.image-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 38px;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  font-weight: 600;
}

.search-box {
  margin-bottom: var(--spacing-md);
}
</style>
