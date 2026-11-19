<template>
  <div class="hot-products-view">
    <div class="page-header">
      <el-button type="primary" @click="openAddModal">
        + 添加热门商品
      </el-button>
    </div>
    
    <div class="card">
      <el-table :data="hotProducts" style="width: 100%" stripe>
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
        <el-table-column label="创建时间" prop="created_at" width="180" sortable />
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
      title="添加热门商品" 
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
      </el-table>
      
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd" :disabled="selectedProducts.length === 0">
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
import { hotProductApi } from '../services/api'
import { API_BASE } from '../services/api'

const hotProducts = ref([])
const addModalVisible = ref(false)
const availableProducts = ref([])
const searchKeyword = ref('')
const selectedProducts = ref([])

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

async function loadHotProducts() {
  try {
    const res = await hotProductApi.getList()
    if (res.success) {
      hotProducts.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载热门商品失败')
  }
}

async function loadAvailableProducts() {
  try {
    // 添加时间戳避免浏览器缓存
    const timestamp = new Date().getTime()
    const keyword = searchKeyword.value.trim()
    // 构建查询参数
    const params = new URLSearchParams()
    params.append('_t', timestamp)
    if (keyword) {
      params.append('keyword', keyword)
    }
    
    // 获取认证 token
    const token = localStorage.getItem('admin_token')
    
    // 使用 fetch 直接请求
    const response = await fetch(`${API_BASE}/hot-products/available?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })
    
    const res = await response.json()
    
    if (res.success) {
      availableProducts.value = res.data
    }
  } catch (error) {
    console.error('加载商品列表失败:', error)
    ElMessage.error('加载商品列表失败')
  }
}

function openAddModal() {
  searchKeyword.value = ''
  availableProducts.value = []
  selectedProducts.value = []
  addModalVisible.value = true
  // Dialog 打开后再加载数据，确保显示最新数据
  setTimeout(() => {
    loadAvailableProducts()
  }, 100)
}

function handleSelectionChange(selection) {
  selectedProducts.value = selection
}

async function handleAdd() {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择商品')
    return
  }
  
  try {
    let addedCount = 0
    for (let i = 0; i < selectedProducts.value.length; i++) {
      const product = selectedProducts.value[i]
      const res = await hotProductApi.add({
        product_id: product.id,
        sort_order: hotProducts.value.length + i
      })
      if (res.success) {
        addedCount++
      }
    }
    
    if (addedCount > 0) {
      ElMessage.success(`成功添加 ${addedCount} 个商品`)
      addModalVisible.value = false
      loadHotProducts()
    }
  } catch (error) {
    ElMessage.error(error.message || '添加失败')
  }
}

async function updateSortOrder(row) {
  try {
    const res = await hotProductApi.updateSortOrder(row.id, row.sort_order)
    if (res.success) {
      ElMessage.success('排序更新成功')
      loadHotProducts()
    }
  } catch (error) {
    ElMessage.error('更新排序失败')
  }
}

async function handleRemove(row) {
  try {
    await ElMessageBox.confirm('确定要移除该热门商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await hotProductApi.remove(row.id)
    if (res.success) {
      ElMessage.success('移除成功')
      loadHotProducts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

onMounted(() => {
  loadHotProducts()
})
</script>

<style scoped>
.hot-products-view {
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
  font-size: 24px;
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
