<template>
  <div class="brand-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>品牌管理</span>
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 左侧：所有店铺 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>所有店铺</span>
                <el-input
                  v-model="allShopsKeyword"
                  placeholder="搜索店铺"
                  clearable
                  size="small"
                  style="width: 200px"
                  @input="handleAllShopsSearch"
                />
              </div>
            </template>

            <el-table
              :data="allShopsList"
              style="width: 100%"
              max-height="500"
              border
              @selection-change="handleAllShopsSelection"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="店铺名称" />
              <el-table-column prop="owner_username" label="店主" />
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <div class="table-footer">
              <el-pagination
                v-model:current-page="allShopsPage"
                v-model:page-size="allShopsPageSize"
                :total="allShopsTotal"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                @current-change="loadAllShops"
                @size-change="loadAllShops"
              />
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：品牌店铺 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>品牌店铺</span>
                <el-input
                  v-model="brandShopsKeyword"
                  placeholder="搜索品牌店铺"
                  clearable
                  size="small"
                  style="width: 200px"
                  @input="handleBrandShopsSearch"
                />
              </div>
            </template>

            <el-table
              :data="brandShopsList"
              style="width: 100%"
              max-height="500"
              border
              @selection-change="handleBrandShopsSelection"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="店铺名称">
                <template #default="scope">
                  <div class="shop-name-with-brand">
                    <span>{{ scope.row.name }}</span>
                    <BrandBadge />
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="owner_username" label="店主" />
              <el-table-column label="认证时间" width="160">
                <template #default="scope">
                  {{ formatDate(scope.row.brand_certified_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleRemoveBrand(scope.row)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="table-footer">
              <el-pagination
                v-model:current-page="brandShopsPage"
                v-model:page-size="brandShopsPageSize"
                :total="brandShopsTotal"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                @current-change="loadBrandShops"
                @size-change="loadBrandShops"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 批量操作按钮 -->
      <div class="batch-operations">
        <el-button
          type="primary"
          :disabled="selectedAllShops.length === 0"
          @click="handleBatchAddBrand"
        >
          <el-icon><CirclePlus /></el-icon>
          批量添加为品牌 ({{ selectedAllShops.length }})
        </el-button>

        <el-button
          type="danger"
          :disabled="selectedBrandShops.length === 0"
          @click="handleBatchRemoveBrand"
        >
          <el-icon><Delete /></el-icon>
          批量移除品牌 ({{ selectedBrandShops.length }})
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, CirclePlus, Delete } from '@element-plus/icons-vue'
import BrandBadge from '../../components/BrandBadge.vue'
import { merchantApi } from '../../services/api'

// 所有店铺相关
const allShopsPage = ref(1)
const allShopsPageSize = ref(10)
const allShopsTotal = ref(0)
const allShopsKeyword = ref('')
const allShopsList = ref([])
const selectedAllShops = ref([])

// 品牌店铺相关
const brandShopsPage = ref(1)
const brandShopsPageSize = ref(10)
const brandShopsTotal = ref(0)
const brandShopsKeyword = ref('')
const brandShopsList = ref([])
const selectedBrandShops = ref([])

// 加载所有店铺
const loadAllShops = async () => {
  try {
    const response = await merchantApi.getNonBrandShops({
      page: allShopsPage.value,
      pageSize: allShopsPageSize.value,
      keyword: allShopsKeyword.value
    })
    allShopsList.value = response.data || []
    allShopsTotal.value = response.total || 0
  } catch (error) {
    console.error('加载所有店铺失败:', error)
    ElMessage.error('加载店铺列表失败')
  }
}

// 加载品牌店铺
const loadBrandShops = async () => {
  try {
    const response = await merchantApi.getBrandShops({
      page: brandShopsPage.value,
      pageSize: brandShopsPageSize.value,
      keyword: brandShopsKeyword.value
    })
    brandShopsList.value = response.data || []
    brandShopsTotal.value = response.total || 0
  } catch (error) {
    console.error('加载品牌店铺失败:', error)
    ElMessage.error('加载品牌店铺列表失败')
  }
}

// 处理所有店铺搜索
const handleAllShopsSearch = () => {
  allShopsPage.value = 1
  loadAllShops()
}

// 处理品牌店铺搜索
const handleBrandShopsSearch = () => {
  brandShopsPage.value = 1
  loadBrandShops()
}

// 处理所有店铺选择
const handleAllShopsSelection = (selection) => {
  selectedAllShops.value = selection.filter(shop => !shop.is_brand)
}

// 处理品牌店铺选择
const handleBrandShopsSelection = (selection) => {
  selectedBrandShops.value = selection
}

// 添加单个品牌店铺
const handleAddBrand = async (shop) => {
  try {
    await ElMessageBox.confirm(
      `确定要将"${shop.name}"添加为品牌店铺吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    await merchantApi.addBrandShop(shop.id)
    ElMessage.success('添加成功')
    await Promise.all([loadAllShops(), loadBrandShops()])
  } catch (error) {
    if (error !== 'cancel') {
      console.error('添加品牌店铺失败:', error)
      ElMessage.error(error.message || '添加失败')
    }
  }
}

// 移除单个品牌店铺
const handleRemoveBrand = async (shop) => {
  try {
    await ElMessageBox.confirm(
      `确定要将"${shop.name}"移除品牌标识吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    await merchantApi.removeBrandShop(shop.id)
    ElMessage.success('移除成功')
    await Promise.all([loadAllShops(), loadBrandShops()])
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除品牌店铺失败:', error)
      ElMessage.error(error.message || '移除失败')
    }
  }
}

// 批量添加品牌
const handleBatchAddBrand = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedAllShops.value.length} 个店铺添加为品牌店铺吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    for (const shop of selectedAllShops.value) {
      await merchantApi.addBrandShop(shop.id)
    }
    
    ElMessage.success(`成功添加 ${selectedAllShops.value.length} 个品牌店铺`)
    selectedAllShops.value = []
    await Promise.all([loadAllShops(), loadBrandShops()])
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量添加品牌失败:', error)
      ElMessage.error('批量添加失败')
    }
  }
}

// 批量移除品牌
const handleBatchRemoveBrand = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedBrandShops.value.length} 个店铺移除品牌标识吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    for (const shop of selectedBrandShops.value) {
      await merchantApi.removeBrandShop(shop.id)
    }
    
    ElMessage.success(`成功移除 ${selectedBrandShops.value.length} 个品牌店铺`)
    selectedBrandShops.value = []
    await Promise.all([loadAllShops(), loadBrandShops()])
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量移除品牌失败:', error)
      ElMessage.error('批量移除失败')
    }
  }
}

// 刷新数据
const refreshData = () => {
  loadAllShops()
  loadBrandShops()
}

// 辅助函数
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    active: 'success',
    suspended: 'danger',
    closed: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待审核',
    active: '营业中',
    suspended: '已暂停',
    closed: '已关闭'
  }
  return texts[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadAllShops()
  loadBrandShops()
})
</script>

<style scoped>
.brand-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.batch-operations {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.shop-name-with-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
