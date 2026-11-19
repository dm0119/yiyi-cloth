<template>
  <div class="products-view">
    <div class="page-header">
      <el-button 
        v-permission="['product:create']"
        type="primary" 
        @click="openAddModal"
      >
        + 添加商品
      </el-button>
    </div>
    
    <!-- 查询过滤器 -->
    <div class="filters">
      <el-form inline class="filter-form">
        <el-form-item label="商品名称">
          <el-input 
            v-model="filters.name" 
            placeholder="请输入商品名称" 
            clearable
            @keyup.enter="applyFilters"
          />
        </el-form-item>
        
        <el-form-item label="分类">
          <el-select 
            v-model="filters.category_id" 
            placeholder="请选择分类" 
            clearable
            @change="applyFilters"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="价格范围">
          <el-input 
            v-model="filters.min_price" 
            placeholder="最低价" 
            style="width: 100px;"
            @keyup.enter="applyFilters"
          />
          <span style="margin: 0 5px;">-</span>
          <el-input 
            v-model="filters.max_price" 
            placeholder="最高价" 
            style="width: 100px;"
            @keyup.enter="applyFilters"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select 
            v-model="filters.status" 
            placeholder="请选择状态" 
            clearable
            @change="applyFilters"
          >
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilters">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="card">
      <el-table :data="products" style="width: 100%" stripe>
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="商品图片" width="120" align="center">
          <template #default="{ row }">
            <div class="image-wrapper">
              <el-image 
                :src="getImageUrl(row.image_url || row.image)" 
                fit="cover"
                class="product-image"
                style="width: 80px; height: 80px;"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div v-if="row.images && row.images.length > 1" class="image-badge">
                {{ row.images.length }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="200">
          <template #default="{ row }">
            <p class="product-name">{{ row.name }}</p>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" size="small" type="success">
              上架
            </el-tag>
            <el-tag v-else size="small" type="info">
              下架
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属分类" min-width="180">
          <template #default="{ row }">
            <div class="category-tags" v-if="row.categories && row.categories.length">
              <el-tag 
                v-for="cat in row.categories" 
                :key="cat.id" 
                size="small" 
                type="info"
                class="category-tag"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ cat.name }}
              </el-tag>
            </div>
            <el-tag v-else size="small" type="info">未分类</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属店铺" min-width="150">
          <template #default="{ row }">
            <span v-if="row.shop_name" class="shop-name">
              <el-icon><Shop /></el-icon>
              {{ row.shop_name }}
            </span>
            <el-tag v-else size="small" type="info">平台商品</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100" align="center">
          <template #default="{ row }">
            <div class="price-cell">
              <span class="price">¥{{ row.price.toFixed(2) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="200" align="center">
          <template #default="{ row }">
            <div class="sku-stock-cell">
              <div v-if="row.skus && row.skus.length > 0" class="sku-selector">
                <el-select 
                  v-model="selectedSkuIndex[row.id]" 
                  placeholder="选择规格"
                  size="small"
                  @change="handleSkuChange(row)"
                  class="sku-select"
                >
                  <el-option
                    v-for="(sku, index) in row.skus"
                    :key="index"
                    :label="`${sku.color} / ${sku.size} - 库存：${sku.stock}`"
                    :value="index"
                  />
                </el-select>
                <div class="current-stock-info">
                  <el-tag :type="getStockType(getCurrentSkuStock(row))">
                    {{ getCurrentSkuStockDisplay(row) }}
                  </el-tag>
                </div>
              </div>
              <el-tag v-else :type="getStockType(row.stock)">
                {{ row.stock }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right" v-permission="['product:manage']">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              @click="openEditModal(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="deleteProduct(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="products.length === 0" description="暂无商品" />
    </div>

    <el-dialog
        v-model="showModal"
        :title="isEdit ? '编辑商品' : '添加商品'"
        width="800px"
        :close-on-click-modal="false"
      >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="product-form"
      >
        <el-tabs v-model="activeTab" class="product-tabs">
          <el-tab-pane label="基础信息" name="basic">
            <el-form-item label="商品名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入商品名称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="所属分类" prop="category_ids">
              <div class="category-selector">
                <el-select
                  v-model="selectedCategory1"
                  placeholder="请选择一级分类"
                  @change="handleCategory1Change"
                  clearable
                >
                  <el-option
                    v-for="cat in categoryTree"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  />
                </el-select>
                
                <el-select
                  v-model="selectedCategory2"
                  placeholder="请选择二级分类"
                  @change="handleCategory2Change"
                  clearable
                  :disabled="!selectedCategory1"
                >
                  <el-option
                    v-for="cat in secondLevelCategories"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  />
                </el-select>
                
                <el-select
                  v-model="selectedCategory3"
                  placeholder="请选择三级分类"
                  @change="handleCategory3Change"
                  clearable
                  :disabled="!selectedCategory2"
                >
                  <el-option
                    v-for="cat in thirdLevelCategories"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  />
                </el-select>
              </div>
            </el-form-item>

            <el-form-item label="价格" prop="price">
              <el-input-number 
                v-model="form.price" 
                :precision="2" 
                :step="0.01" 
                :min="0"
                :controls="false"
                placeholder="0.00"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="商品描述">
              <el-input
                v-model="form.description"
                type="textarea"
                placeholder="请输入商品描述，让客户更好地了解商品特点..."
                :rows="4"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="版型" v-if="!isShoeCategory">
              <el-radio-group v-model="form.fit_type">
                <el-radio :value="'loose'">宽松版型</el-radio>
                <el-radio :value="'regular'">标准版型</el-radio>
                <el-radio :value="'slim'">修身版型</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="库存管理" name="inventory">
            <el-row :gutter="20">
              <el-col :span="10">
                <el-form-item label="尺码">
                  <div class="tag-group">
                    <el-tag
                      v-for="size in currentSizes"
                      :key="size"
                      :type="isSizeSelected(size) ? 'primary' : 'info'"
                      class="size-tag"
                      @click="toggleSize(size)"
                    >
                      {{ size }}
                    </el-tag>
                  </div>
                  <el-input 
                    v-model="form.sizes" 
                    placeholder="或自定义尺码，使用英文逗号分隔"
                    style="margin-top: 8px"
                  />
                </el-form-item>

                <el-form-item label="颜色">
                  <div class="tag-group">
                    <el-tag
                      v-for="color in commonColors"
                      :key="color.name"
                      :type="isColorSelected(color.name) ? 'primary' : 'info'"
                      class="color-tag"
                      @click="toggleColor(color.name)"
                    >
                      <span class="color-dot" :style="{ backgroundColor: color.value }"></span>
                      {{ color.name }}
                    </el-tag>
                  </div>
                  <el-input 
                    v-model="form.colors" 
                    placeholder="或自定义颜色，逗号分隔"
                    style="margin-top: 8px"
                  />
                </el-form-item>

                <el-form-item label="总库存（自动计算）">
                  <el-input-number 
                    :model-value="calculateTotalStock()" 
                    :min="0" 
                    :controls="false"
                    :disabled="true"
                    placeholder="0"
                    style="width: 100%"
                    class="total-stock-display"
                  />
                  <div class="form-tip">总库存 = 所有 SKU 库存之和</div>
                </el-form-item>
              </el-col>

              <el-col :span="14">
                <el-form-item label="SKU 库存管理">
                  <div class="sku-manager">
                    <div class="sku-header">
                      <el-alert
                        title="自动生成 SKU"
                        type="info"
                        :closable="false"
                        show-icon
                        class="sku-tip"
                      >
                        <template #title>
                          <div class="sku-tip-content">
                            <span>根据选择的颜色和尺码自动生成 SKU 组合，然后为每个组合设置库存</span>
                            <el-button type="primary" size="small" @click="generateSkus" class="generate-btn">
                              生成 SKU
                            </el-button>
                          </div>
                        </template>
                      </el-alert>
                    </div>
                    
                    <div v-if="form.skus && form.skus.length > 0" class="sku-list">
                      <div class="sku-table-header">
                        <span class="header-cell">颜色</span>
                        <span class="header-cell">尺码</span>
                        <span class="header-cell">图片</span>
                        <span class="header-cell">库存</span>
                        <span class="header-cell">状态</span>
                        <span class="header-cell">操作</span>
                      </div>
                      <div v-for="(sku, index) in form.skus" :key="index" class="sku-item">
                        <span class="sku-cell">{{ sku.color }}</span>
                        <span class="sku-cell">{{ sku.size }}</span>
                        <span class="sku-cell">
                          <div class="sku-image-upload">
                            <el-upload
                              class="image-uploader"
                              :show-file-list="false"
                              :auto-upload="false"
                              accept="image/*"
                              :on-change="(file) => handleSkuImageChange(file, index)"
                            >
                              <el-image 
                                v-if="sku.image" 
                                :src="getImageUrl(sku.image)" 
                                fit="cover"
                                class="sku-image-preview"
                              />
                              <div v-else class="upload-placeholder">
                                <el-icon><Plus /></el-icon>
                                <span>上传</span>
                              </div>
                            </el-upload>
                          </div>
                        </span>
                        <span class="sku-cell">
                          <el-input-number 
                            v-model="sku.stock" 
                            :min="0" 
                            size="small" 
                            :controls="true"
                            class="sku-stock-input"
                          />
                        </span>
                        <span class="sku-cell">
                          <el-switch v-model="sku.status" :active-value="1" :inactive-value="0" size="small" />
                        </span>
                        <span class="sku-cell">
                          <el-button type="danger" size="small" link @click="removeSku(index)">
                            删除
                          </el-button>
                        </span>
                      </div>
                      <div class="sku-total">
                        <el-tag type="success">总库存：{{ totalSkuStock }}</el-tag>
                      </div>
                    </div>
                    
                    <el-empty v-else description="暂无 SKU，请先生成 SKU 组合" :image-size="80" />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="其他设置" name="other">
            <el-form-item label="主图">
              <div class="main-image-upload">
                <el-upload
                  class="main-image-uploader"
                  :show-file-list="false"
                  :auto-upload="false"
                  accept="image/*"
                  :on-change="handleMainImageChange"
                >
                  <el-image 
                    v-if="form.image" 
                    :src="getImageUrl(form.image)" 
                    fit="cover"
                    class="main-image-preview"
                  />
                  <div v-else class="main-image-placeholder">
                    <el-icon><Plus /></el-icon>
                    <span>上传主图</span>
                  </div>
                </el-upload>
                <div class="form-tip">主图将作为商品的主要展示图片，建议尺寸 800x800 像素</div>
              </div>
            </el-form-item>

            <el-form-item label="商品图片（多图）">
              <div class="image-upload-container">
                <div class="image-list">
                  <div 
                    v-for="(img, index) in form.images" 
                    :key="index" 
                    class="image-item"
                  >
                    <el-image :src="getImageUrl(img)" fit="cover" class="uploaded-image" />
                    <div class="image-remove" @click="removeImage(index)">
                      <el-icon><Close /></el-icon>
                    </div>
                  </div>
                  <el-upload
                    class="image-uploader"
                    :show-file-list="false"
                    :auto-upload="false"
                    accept="image/*"
                    :on-change="handleImageChange"
                  >
                    <div class="upload-placeholder">
                      <el-icon><Plus /></el-icon>
                      <span>本地上传</span>
                    </div>
                  </el-upload>
                </div>
                <div class="form-tip">支持添加多张图片，第一张将作为主图</div>
              </div>
            </el-form-item>

            <el-form-item label="上架状态">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">立即上架</el-radio>
                <el-radio :value="0">暂不上架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

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
import { ref, onMounted, computed } from 'vue'
import { Picture, Close, Plus, Shop } from '@element-plus/icons-vue'
import { productApi, categoryApi, uploadApi } from '../services/api.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermission } from '../mixins/permission'

const { hasPermission } = usePermission()

const API_BASE = ''

const products = ref([])
const categories = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const editingProduct = ref(null)
const formRef = ref(null)
const selectedSkuIndex = ref({})
const activeTab = ref('basic')

const filters = ref({
  name: '',
  category_id: '',
  min_price: '',
  max_price: '',
  status: ''
})

const form = ref({
  name: '',
  price: 0,
  image: '',
  images: [],
  description: '',
  stock: 0,
  sizes: '',
  colors: '',
  category_ids: [],
  fit_type: 'regular',
  status: 1,
  skus: []
})

const selectedCategory1 = ref('')
const selectedCategory2 = ref('')
const selectedCategory3 = ref('')
const categoryTree = ref([])
const firstLevelCategories = ref([])
const secondLevelCategories = ref([])
const thirdLevelCategories = ref([])

const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在2-100个字符之间', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ],
  category_ids: [
    { required: true, type: 'array', min: 1, message: '请选择商品分类', trigger: 'change' }
  ]
}

const commonSizes = ['3XL', '4XL', '5XL', '6XL', '7XL']
const shoeSizes = ['39', '40', '41', '42', '43', '44', '45', '46']
const currentSizes = ref(commonSizes)

const isShoeCategory = computed(() => {
  if (!selectedCategory1.value) return false
  const selectedCategory = categoryTree.value.find(cat => cat.id === selectedCategory1.value)
  return selectedCategory && selectedCategory.name === '鞋类'
})

const totalSkuStock = computed(() => {
  if (!form.value.skus || form.value.skus.length === 0) return 0
  return form.value.skus.reduce((sum, sku) => sum + (sku.stock || 0), 0)
})

const commonColors = [
  { name: '黑色', value: '#000000' },
  { name: '白色', value: '#FFFFFF' },
  { name: '灰色', value: '#9CA3AF' },
  { name: '红色', value: '#DC2626' },
  { name: '蓝色', value: '#2563EB' },
  { name: '绿色', value: '#16A34A' },
  { name: '黄色', value: '#EAB308' },
  { name: '橙色', value: '#EA580C' },
  { name: '紫色', value: '#9333EA' },
  { name: '粉色', value: '#EC4899' },
  { name: '棕色', value: '#92400E' },
  { name: '米色', value: '#F5F5DC' }
]

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

function getStockType(stock) {
  if (stock <= 0) return 'danger'
  if (stock <= 10) return 'warning'
  return 'success'
}

function getCurrentSku(row) {
  if (!row.skus || row.skus.length === 0) return null
  const index = selectedSkuIndex.value[row.id]
  if (index === undefined || index === null) {
    return row.skus[0]
  }
  return row.skus[index]
}

function getCurrentSkuStock(row) {
  const sku = getCurrentSku(row)
  return sku ? sku.stock : row.stock
}

function getCurrentSkuStockDisplay(row) {
  const sku = getCurrentSku(row)
  if (!sku) return `${row.stock}件`
  return `${sku.color}/${sku.size} ${sku.stock}件`
}

function handleSkuChange(row) {
  console.log('选中 SKU:', getCurrentSku(row))
}

function generateSkus() {
  if (!hasPermission('product:edit')) {
    ElMessage.warning('您没有编辑商品的权限')
    return
  }
  const colors = form.value.colors.split(',').map(c => c.trim()).filter(c => c)
  const sizes = form.value.sizes.split(',').map(s => s.trim()).filter(s => s)
  
  if (colors.length === 0 || sizes.length === 0) {
    ElMessage.warning('请先选择颜色和尺码')
    return
  }
  
  form.value.skus = []
  for (const color of colors) {
    for (const size of sizes) {
      form.value.skus.push({
        color,
        size,
        image: '',
        stock: 10,
        status: 1
      })
    }
  }
  
  ElMessage.success(`已生成 ${form.value.skus.length} 个 SKU 组合`)
}

async function handleSkuImageChange(file, index) {
  const isImage = file.raw.type.startsWith('image/')
  const isLt5M = file.raw.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return
  }

  try {
    ElMessage.info('正在上传...')
    const res = await uploadApi.uploadImage(file.raw)
    if (form.value.skus && form.value.skus[index]) {
      form.value.skus[index].image = res.data.url
      console.log('SKU图片上传成功:', form.value.skus[index])
      console.log('图片URL:', res.data.url)
      ElMessage.success('上传成功')
    } else {
      console.error('SKU数组不存在或索引无效')
      ElMessage.error('上传失败: SKU数据不存在')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败: ' + error.message)
  }
}

function calculateTotalStock() {
  if (!form.value.skus || form.value.skus.length === 0) {
    return form.value.stock || 0
  }
  return form.value.skus.reduce((sum, sku) => sum + (sku.stock || 0), 0)
}

function removeSku(index) {
  form.value.skus.splice(index, 1)
}

function loadSkusFromProduct(product) {
  if (product.skus && product.skus.length > 0) {
    form.value.skus = product.skus.map(sku => ({
      ...sku,
      id: sku.id,
      color: sku.color,
      size: sku.size,
      image: sku.image || '',
      stock: sku.stock,
      status: sku.status ?? 1
    }))
    console.log('加载的SKU数据:', form.value.skus)
  } else if (product.colors && product.sizes) {
    const colors = product.colors.split(',').map(c => c.trim()).filter(c => c)
    const sizes = product.sizes.split(',').map(s => s.trim()).filter(s => s)
    const totalStock = product.stock || 0
    const stockPerSku = colors.length * sizes.length > 0 
      ? Math.floor(totalStock / (colors.length * sizes.length)) 
      : 0
    
    form.value.skus = []
    for (const color of colors) {
      for (const size of sizes) {
        form.value.skus.push({
          color,
          size,
          image: '',
          stock: stockPerSku,
          status: 1
        })
      }
    }
  } else {
    form.value.skus = []
  }
}

function toggleSize(size) {
  const sizes = form.value.sizes.split(',').map(s => s.trim()).filter(s => s)
  const index = sizes.indexOf(size)
  
  if (index > -1) {
    sizes.splice(index, 1)
  } else {
    sizes.push(size)
  }
  
  form.value.sizes = sizes.join(', ')
}

function toggleColor(color) {
  const colors = (form.value.colors || '').split(',').map(c => c.trim()).filter(c => c)
  const index = colors.indexOf(color)
  
  if (index > -1) {
    colors.splice(index, 1)
  } else {
    colors.push(color)
  }
  
  form.value.colors = colors.join(', ')
}

function isSizeSelected(size) {
  if (!form.value.sizes) return false
  const sizes = form.value.sizes.split(',').map(s => s.trim()).filter(s => s)
  return sizes.includes(size)
}

function isColorSelected(color) {
  const colors = form.value.colors.split(',').map(c => c.trim()).filter(c => c)
  return colors.includes(color)
}

async function loadProducts() {
  try {
    const params = {}
    if (filters.value.category_id) {
      params.category_id = filters.value.category_id
    }
    
    const res = await productApi.getList(params)
    if (res.success) {
      let filteredData = res.data || []
      
      for (const product of filteredData) {
        try {
          const skuRes = await productApi.getSkus(product.id)
          if (skuRes.success && skuRes.data) {
            product.skus = skuRes.data
            selectedSkuIndex.value[product.id] = 0
          }
        } catch (error) {
          console.error(`加载商品 ${product.id} 的 SKU 失败:`, error)
          product.skus = []
        }
      }
      
      if (filters.value.name) {
        filteredData = filteredData.filter(product => 
          product.name.toLowerCase().includes(filters.value.name.toLowerCase())
        )
      }
      
      if (filters.value.min_price) {
        const minPrice = parseFloat(filters.value.min_price)
        filteredData = filteredData.filter(product => product.price >= minPrice)
      }
      
      if (filters.value.max_price) {
        const maxPrice = parseFloat(filters.value.max_price)
        filteredData = filteredData.filter(product => product.price <= maxPrice)
      }
      
      products.value = filteredData
    }
  } catch (error) {
    console.error('加载商品失败:', error)
    ElMessage.error('加载商品失败')
  }
}

async function loadCategories() {
  try {
    const res = await categoryApi.getList()
    if (res.success) {
      categories.value = res.data
      buildCategoryTree(res.data)
    } else {
      console.error('分类API返回失败:', res.message)
      ElMessage.error('加载分类失败: ' + (res.message || '未知错误'))
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载分类失败: ' + error.message)
  }
}

function buildCategoryTree(categoryList) {
  const categoryMap = {}
  categoryList.forEach(cat => {
    categoryMap[cat.id] = {
      ...cat,
      children: []
    }
  })
  
  const tree = []
  categoryList.forEach(cat => {
    const parentId = cat.parent_id || 0
    if (parentId === 0) {
      tree.push(categoryMap[cat.id])
    } else if (categoryMap[parentId]) {
      categoryMap[parentId].children.push(categoryMap[cat.id])
    }
  })
  
  categoryTree.value = tree
}

function handleCategory1Change(value) {
  selectedCategory1.value = value
  selectedCategory2.value = ''
  selectedCategory3.value = ''
  
  const selectedCategory = categoryTree.value.find(cat => cat.id === value)
  secondLevelCategories.value = selectedCategory ? selectedCategory.children : []
  thirdLevelCategories.value = []
  
  if (selectedCategory && selectedCategory.name === '鞋类') {
    currentSizes.value = shoeSizes
  } else {
    currentSizes.value = commonSizes
  }
  
  updateProductCategory(value)
}

function handleCategory2Change(value) {
  selectedCategory2.value = value
  selectedCategory3.value = ''
  
  const selectedCategory = categoryTree.value.find(cat => cat.id === selectedCategory1.value)
  if (selectedCategory) {
    const secondCategory = selectedCategory.children.find(cat => cat.id === value)
    thirdLevelCategories.value = secondCategory ? secondCategory.children : []
  } else {
    thirdLevelCategories.value = []
  }
  
  updateProductCategory(value)
}

function handleCategory3Change(value) {
  selectedCategory3.value = value
  
  updateProductCategory(value)
}

function updateProductCategory(categoryId) {
  if (categoryId) {
    if (!form.value.category_ids.includes(categoryId)) {
      form.value.category_ids = [categoryId]
    } else {
      form.value.category_ids = [categoryId]
    }
  } else {
    form.value.category_ids = []
  }
}

function resetCategorySelection() {
  selectedCategory1.value = ''
  selectedCategory2.value = ''
  selectedCategory3.value = ''
  secondLevelCategories.value = []
  thirdLevelCategories.value = []
  form.value.category_ids = []
  currentSizes.value = commonSizes
}

function openAddModal() {
  if (!hasPermission('product:create')) {
    ElMessage.warning('您没有添加商品的权限')
    return
  }
  isEdit.value = false
  editingProduct.value = null
  form.value = {
    name: '',
    price: 0,
    image: '',
    images: [],
    description: '',
    stock: 0,
    sizes: '',
    colors: '',
    category_ids: [],
    fit_type: 'regular',
    status: 1,
    skus: []
  }
  resetCategorySelection()
  activeTab.value = 'basic'
  showModal.value = true
}

function openEditModal(product) {
  if (!hasPermission('product:edit')) {
    ElMessage.warning('您没有编辑商品的权限')
    return
  }
  isEdit.value = true
  editingProduct.value = { ...product }
  const productImages = product.images && Array.isArray(product.images) ? product.images : []
  form.value = { 
    ...product,
    images: [...productImages],
    fit_type: product.fit_type || 'regular',
    category_ids: product.categories ? product.categories.map(c => c.id) : [],
    skus: []
  }
  
  resetCategorySelection()
  activeTab.value = 'basic'
  
  if (product.categories && product.categories.length > 0) {
    const lastCategory = product.categories[product.categories.length - 1]
    
    for (const cat1 of categoryTree.value) {
      if (cat1.id === lastCategory.id) {
        selectedCategory1.value = lastCategory.id
        secondLevelCategories.value = cat1.children || []
        thirdLevelCategories.value = []
        updateProductCategory(lastCategory.id)
        break
      } else if (cat1.children) {
        for (const cat2 of cat1.children) {
          if (cat2.id === lastCategory.id) {
            selectedCategory1.value = cat1.id
            selectedCategory2.value = cat2.id
            secondLevelCategories.value = cat1.children
            thirdLevelCategories.value = cat2.children || []
            updateProductCategory(lastCategory.id)
            break
          } else if (cat2.children) {
            for (const cat3 of cat2.children) {
              if (cat3.id === lastCategory.id) {
                selectedCategory1.value = cat1.id
                selectedCategory2.value = cat2.id
                selectedCategory3.value = cat3.id
                secondLevelCategories.value = cat1.children
                thirdLevelCategories.value = cat2.children || []
                updateProductCategory(lastCategory.id)
                break
              }
            }
          }
        }
      }
    }
  }
  
  loadSkusFromProduct(product)
  
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
}

async function handleImageChange(file) {
  if (!hasPermission('product:edit')) {
    ElMessage.warning('您没有编辑商品的权限')
    return
  }
  const isImage = file.raw.type.startsWith('image/')
  const isLt5M = file.raw.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return
  }

  try {
    const loadingMsg = ElMessage({
      message: '正在上传并优化图片...',
      type: 'info',
      duration: 0
    })
    
    const res = await uploadApi.uploadImage(file.raw)
    loadingMsg.close()
    
    form.value.images.push(res.data.url)
    const sizeInfo = res.data.message ? ` (${res.data.message})` : ''
    ElMessage.success(`上传成功${sizeInfo}`)
  } catch (error) {
    ElMessage.error('上传失败: ' + error.message)
  }
}

async function handleMainImageChange(file) {
  if (!hasPermission('product:edit')) {
    ElMessage.warning('您没有编辑商品的权限')
    return
  }
  const isImage = file.raw.type.startsWith('image/')
  const isLt5M = file.raw.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return
  }

  try {
    const loadingMsg = ElMessage({
      message: '正在上传并优化图片...',
      type: 'info',
      duration: 0
    })
    
    const res = await uploadApi.uploadImage(file.raw)
    loadingMsg.close()
    
    form.value.image = res.data.url
    const sizeInfo = res.data.message ? ` (${res.data.message})` : ''
    ElMessage.success(`上传成功${sizeInfo}`)
  } catch (error) {
    ElMessage.error('上传失败: ' + error.message)
  }
}

function removeImage(index) {
  form.value.images.splice(index, 1)
}

async function handleSubmit() {
  if (!formRef.value) return
  
  if (!hasPermission('product:edit') && !hasPermission('product:create')) {
    ElMessage.warning('您没有编辑或创建商品的权限')
    return
  }
  
  try {
    await formRef.value.validate()
    
    form.value.stock = totalSkuStock.value
    
    console.log('提交的商品数据:', form.value)
    console.log('提交的SKU数据:', form.value.skus)
    form.value.skus.forEach((sku, index) => {
      console.log(`SKU ${index} image:`, sku.image)
    })
    
    if (isEdit.value) {
      if (!hasPermission('product:edit')) {
        ElMessage.warning('您没有编辑商品的权限')
        return
      }
      await productApi.update(form.value.id, form.value)
    } else {
      if (!hasPermission('product:create')) {
        ElMessage.warning('您没有添加商品的权限')
        return
      }
      await productApi.create(form.value)
    }
    
    closeModal()
    await loadProducts()
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

async function applyFilters() {
  await loadProducts()
}

function resetFilters() {
  filters.value = {
    name: '',
    category_id: '',
    min_price: '',
    max_price: '',
    status: ''
  }
  loadProducts()
}

async function deleteProduct(id) {
  if (!hasPermission('product:delete')) {
    ElMessage.warning('您没有删除商品的权限')
    return
  }
  try {
    await ElMessageBox.confirm(
      '确定要删除这个商品吗？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await productApi.delete(id)
    await loadProducts()
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<style scoped>
.products-view {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-lg);
}

.filters {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

/* 分类选择器样式 */
.category-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.category-selector .el-select {
  flex: 1;
  min-width: 180px;
}

/* 店铺名称样式 */
.shop-name {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-primary);
  font-weight: 500;
}

.shop-name .el-icon {
  color: var(--primary-color);
}

/* 主图上传样式 */
.main-image-upload {
  margin-bottom: 20px;
}

.main-image-uploader {
  display: block;
  width: 200px;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.main-image-uploader:hover {
  border-color: #409EFF;
}

.main-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  background-color: #fafafa;
}

.main-image-placeholder .el-icon {
  font-size: 38px;
  margin-bottom: 8px;
}

/* 多图上传样式 */
.image-upload-container {
  margin-bottom: 20px;
}

.image-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.image-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
}

.image-remove:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.image-uploader {
  width: 120px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  background-color: #fafafa;
  transition: all 0.3s;
  cursor: pointer;
}

.image-uploader:hover {
  border-color: #409EFF;
}

.upload-placeholder .el-icon {
  font-size: 30px;
  margin-bottom: 6px;
}

/* 表单提示文字 */
.form-tip {
  font-size: 18px;
  color: #999;
  margin-top: 8px;
}

.product-tabs {
  margin-bottom: 20px;
}

.product-tabs .el-tab-pane {
  padding-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-selector {
    flex-direction: column;
    align-items: stretch;
  }
  
  .category-selector .el-select {
    width: 100%;
  }
  
  .main-image-uploader {
    width: 150px;
    height: 150px;
  }
  
  .image-item,
  .image-uploader {
    width: 100px;
    height: 100px;
  }
}
</style>
