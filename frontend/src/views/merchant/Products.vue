<template>
  <div class="merchant-products">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="filters.keyword"
              placeholder="商品名称"
              clearable
              @clear="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.category" placeholder="商品分类" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="商品状态" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="上架" value="active" />
              <el-option label="下架" value="inactive" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 商品列表 -->
      <el-table :data="products" stripe v-loading="loading" class="product-table">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column label="商品图片" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.image || (row.images && row.images[0]) || ''"
              fit="cover"
              style="width: 60px; height: 60px"
              :preview-src-list="[row.image || (row.images && row.images[0]) || '']"
            />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span>¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="sales_count" label="销量" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { merchantApi, productApi, categoryApi } from '../../services/api'
import { formatDateTime } from '../../utils/dateFormatter'

const loading = ref(false)
const products = ref([])
const categories = ref([])

const filters = reactive({
  keyword: '',
  category: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    // 先获取商家的店铺信息
    const shopResponse = await merchantApi.getShop()
    if (!shopResponse.success || !shopResponse.data) {
      products.value = []
      pagination.total = 0
      return
    }

    const shopId = shopResponse.data.id

    // 获取该店铺的商品（这里需要后端支持分页）
    const response = await merchantApi.getShopProducts(shopId)
    if (response.success) {
      products.value = response.data || []
      pagination.total = response.data?.length || 0
    }
  } catch (error) {
    console.error('加载商品列表失败:', error)
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await categoryApi.getList()
    if (response.success) {
      categories.value = response.data || []
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadProducts()
}

// 添加商品
const handleAdd = () => {
  ElMessage.info('添加商品功能开发中')
}

// 编辑商品
const handleEdit = (row) => {
  ElMessage.info('编辑商品功能开发中')
}

// 切换商品状态
const handleToggleStatus = async (row) => {
  const action = row.status === 'active' ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定要${action}该商品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await productApi.toggleStatus(row.id, row.status === 'active' ? 'inactive' : 'active')
    if (response.success) {
      ElMessage.success(`${action}成功`)
      loadProducts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${action}商品失败:`, error)
      ElMessage.error(`${action}失败`)
    }
  }
}

// 删除商品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await productApi.delete(row.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadProducts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadProducts()
}

// 页码改变
const handlePageChange = (page) => {
  pagination.page = page
  loadProducts()
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<style scoped>
.merchant-products {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.product-table {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
