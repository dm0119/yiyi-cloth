<template>
  <div class="merchant-product-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button 
            v-permission="['product:create']"
            type="primary" 
            @click="openAddModal"
          >
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>
      </template>

      <!-- 查询过滤器 -->
      <div class="filter-section">
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

      <!-- 商品列表 -->
      <el-table :data="products" stripe v-loading="loading" class="product-table">
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="商品图片" width="120" align="center">
          <template #default="{ row }">
            <div class="image-wrapper">
              <el-image 
                :src="getImageUrl(row.image)" 
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
        <el-table-column label="价格" width="100" align="center">
          <template #default="{ row }">
            <span>¥{{ (parseFloat(row.price) || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="200" align="center">
          <template #default="{ row }">
            <div v-if="row.skus && row.skus.length > 0" class="sku-stock-cell">
              <el-select 
                v-model="selectedSkuIndex[row.id]" 
                placeholder="选择规格"
                size="small"
                @change="handleSkuChange(row)"
                class="sku-select"
                style="width: 150px"
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
          </template>
        </el-table-column>
        <el-table-column label="销量" width="100" align="center" prop="sales_count" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              v-permission="['product:edit']"
              type="primary" 
              size="small"
              @click="openEditModal(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-permission="['product:delete']"
              type="danger" 
              size="small"
              @click="deleteProduct(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="products.length === 0" description="暂无商品" />
    </el-card>

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="showModal"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="800px"
      :close-on-click-modal="false"
      class="product-form-dialog"
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
                
                <div v-if="form.skus && form.skus.length > 0">
                  <div class="sku-color-images">
                    <div class="color-images-title">颜色图片批量上传(按颜色维度)</div>
                    <div class="color-images-container">
                      <div 
                        v-for="(color, colorIndex) in uniqueColors" 
                        :key="colorIndex" 
                        class="color-image-item"
                      >
                        <div class="color-indicator">
                          <span class="color-dot" :style="{ backgroundColor: getColorValue(color) }"></span>
                          <span class="color-name">{{ color }}</span>
                        </div>
                        <div class="color-image-upload">
                          <el-upload
                            class="image-uploader"
                            :show-file-list="false"
                            :auto-upload="false"
                            accept="image/*"
                            :on-change="(file) => handleColorImageChange(file, color)"
                          >
                            <el-image 
                              v-if="getColorImageUrl(color)" 
                              :src="getColorImageUrl(color)" 
                              fit="cover"
                              class="color-image-preview"
                            />
                            <div v-else class="upload-placeholder">
                              <el-icon><Plus /></el-icon>
                              <span>上传</span>
                            </div>
                          </el-upload>
                        </div>
                        <div class="color-image-info">
                          <span class="sku-count">应用到 {{ getColorSkuCount(color) }} 个SKU</span>
                          <el-button 
                            v-if="getColorImageUrl(color)" 
                            type="danger" 
                            size="small" 
                            link 
                            @click="removeColorImage(color)"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </div>
                    <div class="form-tip">上传的颜色图片将自动应用到该颜色的所有尺码SKU上</div>
                  </div>
                  
                  <div class="sku-list">
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
                    <el-tag type="success">总库存:{{ totalSkuStock }}</el-tag>
                  </div>
                </div>
                </div>
                
                <el-empty v-else description="暂无 SKU，请先生成 SKU 组合" :image-size="80" />
              </div>
            </el-form-item>
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

            <el-form-item label="商品标签">
              <div class="tag-selector">
                <div v-for="(tagGroup, category) in systemTags" :key="category" class="tag-category">
                  <div class="tag-category-title">{{ category }}</div>
                  <div class="tag-group">
                    <el-tag
                      v-for="tag in tagGroup"
                      :key="tag"
                      :type="isTagSelected(tag) ? 'primary' : 'info'"
                      class="system-tag"
                      @click="toggleSystemTag(tag)"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="custom-tags">
                  <div class="tag-category-title">自定义标签（最多 5 个）</div>
                  <div class="custom-tag-list">
                    <el-tag
                      v-for="tag in customTags"
                      :key="tag"
                      closable
                      type="success"
                      @close="removeCustomTag(tag)"
                      @click="toggleSystemTag(tag)"
                    >
                      {{ tag }}
                    </el-tag>
                    <el-input
                      v-if="tagInputVisible"
                      ref="tagInputRef"
                      v-model="customTagInput"
                      size="small"
                      @keyup.enter="addCustomTag"
                      @blur="addCustomTag"
                      style="width: 120px; margin-left: 8px"
                    />
                    <el-button v-else size="small" @click="tagInputVisible = true">
                      <el-icon><Plus /></el-icon>
                      添加标签
                    </el-button>
                  </div>
                </div>
              </div>
              <div class="form-tip">选择或添加标签，帮助客户更好地了解商品特点，如：遮肚子、显瘦、梨型等</div>
            </el-form-item>

            <el-form-item label="尺码参考表">
              <el-input
                v-model="form.size_recommendations"
                type="textarea"
                placeholder="请输入尺码参考说明，方便客户选择合适的尺码，例如：&#10;&#10;【衣服尺码参考】&#10;S码：适合身高155-160cm，体重45-50kg&#10;M码：适合身高160-165cm，体重50-55kg&#10;L码：适合身高165-170cm，体重55-60kg&#10;XL码：适合身高170-175cm，体重60-65kg&#10;&#10;【裤子尺码参考】&#10;28码：腰围2尺1，适合体重45-50kg&#10;29码：腰围2尺2，适合体重50-55kg&#10;&#10;【温馨提示】&#10;以上数据仅供参考，不同版型可能有差异"
                :rows="10"
                maxlength="1000"
                show-word-limit
              />
              <div class="form-tip">
                💡 支持换行，建议按"尺码：适用范围"格式填写，可按衣服/裤子/鞋子分类说明
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
import { Picture, Close, Plus, ArrowDown } from '@element-plus/icons-vue'
import { productApi, categoryApi, uploadApi, merchantApi } from '../../services/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermission } from '../../mixins/permission'

const { hasPermission } = usePermission()

const API_BASE = ''

const products = ref([])
const categories = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const editingProduct = ref(null)
const formRef = ref(null)
const selectedSkuIndex = ref({})
const loading = ref(false)
const activeTab = ref('basic')

const filters = ref({
  name: '',
  category_id: '',
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
  skus: [],
  tags: [],
  size_chart: null,
  size_recommendations: ''
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
  category_ids: [
    { required: true, type: 'array', min: 1, message: '请选择商品分类', trigger: 'change' }
  ]
}

const commonSizes = ['3XL', '4XL', '5XL', '6XL', '7XL']
const shoeSizes = ['39', '40', '41', '42', '43', '44', '45', '46']
const currentSizes = ref(commonSizes)

// 折叠状态管理
const collapsedSections = ref({
  basicInfo: false,
  images: false,
  attributes: false,
  tags: false,
  sku: false,
  advanced: false
})

const isShoeCategory = computed(() => {
  if (!selectedCategory1.value) return false
  const selectedCategory = categoryTree.value.find(cat => cat.id === selectedCategory1.value)
  return selectedCategory && selectedCategory.name === '鞋类'
})

const totalSkuStock = computed(() => {
  if (!form.value.skus || form.value.skus.length === 0) return 0
  return form.value.skus.reduce((sum, sku) => sum + (sku.stock || 0), 0)
})

const uniqueColors = computed(() => {
  if (!form.value.skus || form.value.skus.length === 0) return []
  const colors = [...new Set(form.value.skus.map(sku => sku.color))]
  return colors.sort()
})

const colorImages = ref({})

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

// 系统预设标签
const systemTags = ref({})
const customTagInput = ref('')
const customTags = ref([])
const tagInputVisible = ref(false)

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/60x60'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${API_BASE}${url}`
}

// 加载系统标签
async function loadSystemTags() {
  try {
    const response = await productApi.getSystemTags()
    if (response.success) {
      systemTags.value = response.data
    }
  } catch (error) {
    console.error('加载系统标签失败:', error)
  }
}

// 切换系统标签选中状态
function toggleSystemTag(tag) {
  const index = form.value.tags.indexOf(tag)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  } else {
    form.value.tags.push(tag)
  }
}

// 判断标签是否已选中
function isTagSelected(tag) {
  return form.value.tags.includes(tag)
}

// 添加自定义标签
function addCustomTag() {
  if (customTagInput.value.trim() && customTags.value.length < 5) {
    if (!form.value.tags.includes(customTagInput.value.trim())) {
      form.value.tags.push(customTagInput.value.trim())
      customTags.value.push(customTagInput.value.trim())
    }
    customTagInput.value = ''
  }
  tagInputVisible.value = false
}

// 移除自定义标签
function removeCustomTag(tag) {
  const index = form.value.tags.indexOf(tag)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  }
  const customIndex = customTags.value.indexOf(tag)
  if (customIndex > -1) {
    customTags.value.splice(customIndex, 1)
  }
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
  if (!hasPermission('product:create') && !hasPermission('product:edit')) {
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

function getColorValue(colorName) {
  const colorObj = commonColors.find(c => c.name === colorName)
  return colorObj ? colorObj.value : '#999999'
}

function getColorImageUrl(colorName) {
  return colorImages.value[colorName] || ''
}

function getColorSkuCount(colorName) {
  if (!form.value.skus || form.value.skus.length === 0) return 0
  return form.value.skus.filter(sku => sku.color === colorName).length
}

async function handleColorImageChange(file, color) {
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
    if (res.data.url) {
      colorImages.value[color] = res.data.url
      
      const colorSkus = form.value.skus.filter(sku => sku.color === color)
      colorSkus.forEach(sku => {
        sku.image = res.data.url
      })
      
      ElMessage.success(`上传成功，已应用到 ${colorSkus.length} 个 ${color} SKU`)
    }
  } catch (error) {
    ElMessage.error('上传失败: ' + error.message)
  }
}

function removeColorImage(color) {
  delete colorImages.value[color]
  const colorSkus = form.value.skus.filter(sku => sku.color === color)
  colorSkus.forEach(sku => {
    sku.image = ''
  })
  ElMessage.success('已删除该颜色图片')
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
      ElMessage.success('上传成功')
    }
  } catch (error) {
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
  loading.value = true
  try {
    // 获取商家店铺信息
    const shopResponse = await merchantApi.getShop()
    if (!shopResponse.success || !shopResponse.data) {
      products.value = []
      return
    }

    const shopId = shopResponse.data.id

    // 获取该店铺的商品
    const response = await merchantApi.getShopProducts(shopId)
    if (response.success) {
      let filteredData = Array.isArray(response.data) ? response.data : []
      
      // 加载每个商品的 SKU
      for (const product of filteredData) {
        try {
          const skuRes = await productApi.getSkus(product.id)
          if (skuRes.success && skuRes.data) {
            product.skus = Array.isArray(skuRes.data) ? skuRes.data : []
            selectedSkuIndex.value[product.id] = 0
          }
        } catch (error) {
          product.skus = []
        }
      }
      
      // 应用过滤器
      if (filters.value.name) {
        filteredData = filteredData.filter(product => 
          product.name.toLowerCase().includes(filters.value.name.toLowerCase())
        )
      }
      
      if (filters.value.category_id) {
        filteredData = filteredData.filter(product => 
          product.category_ids && product.category_ids.includes(parseInt(filters.value.category_id))
        )
      }
      
      if (filters.value.status !== undefined && filters.value.status !== '') {
        filteredData = filteredData.filter(product => product.status === parseInt(filters.value.status))
      }
      
      products.value = filteredData
    }
  } catch (error) {
    console.error('加载商品失败:', error)
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const res = await categoryApi.getList()
    if (res.success) {
      categories.value = res.data
      buildCategoryTree(res.data)
    }
  } catch (error) {
    console.error('加载分类失败:', error)
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
    form.value.category_ids = [categoryId]
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
    skus: [],
    tags: [],
    size_chart: null,
    size_recommendations: ''
  }
  customTags.value = []
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
    price: parseFloat(product.price) || 0,
    category_ids: product.categories ? product.categories.map(c => c.id) : [],
    skus: [],
    tags: product.tags || [],
    size_chart: product.size_chart || null,
    size_recommendations: product.size_recommendations || ''
  }
  
  if (product.tags && Array.isArray(product.tags)) {
    customTags.value = [...product.tags]
  }
  
  resetCategorySelection()
  activeTab.value = 'basic'
  
  // 加载已选择的分类
  if (product.categories && product.categories.length > 0) {
    // 获取最后一级分类（最深的分类）
    const lastCategory = product.categories[product.categories.length - 1]
    
    // 查找分类在树中的位置
    for (const cat1 of categoryTree.value) {
      if (cat1.id === lastCategory.id) {
        // 最后一级就是一级分类
        selectedCategory1.value = lastCategory.id
        secondLevelCategories.value = cat1.children || []
        thirdLevelCategories.value = []
        updateProductCategory(lastCategory.id)
        break
      } else if (cat1.children) {
        // 检查二级分类
        const cat2 = cat1.children.find(c => c.id === lastCategory.id)
        if (cat2) {
          selectedCategory1.value = cat1.id
          selectedCategory2.value = cat2.id
          secondLevelCategories.value = cat1.children
          thirdLevelCategories.value = cat2.children || []
          updateProductCategory(lastCategory.id)
          break
        }
        
        // 检查三级分类
        for (const cat2 of cat1.children) {
          if (cat2.children) {
            const cat3 = cat2.children.find(c => c.id === lastCategory.id)
            if (cat3) {
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
      
      if (selectedCategory3.value || selectedCategory2.value || (selectedCategory1.value && secondLevelCategories.value.length === 0)) {
        break
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
    ElMessage.info('正在上传...')
    const res = await uploadApi.uploadImage(file.raw)
    form.value.images.push(res.data.url)
    ElMessage.success('上传成功')
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
    ElMessage.info('正在上传...')
    const res = await uploadApi.uploadImage(file.raw)
    form.value.image = res.data.url
    ElMessage.success('上传成功')
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
      
      // 获取商家店铺信息，设置 shop_id
      const shopResponse = await merchantApi.getShop()
      if (!shopResponse.success || !shopResponse.data) {
        ElMessage.error('未找到店铺信息，请先完善店铺信息')
        return
      }
      
      const shopId = shopResponse.data.id
      console.log('提交的商品数据:', { ...form.value, shop_id: shopId })
      await productApi.add({ ...form.value, shop_id: shopId })
    }
    
    closeModal()
    await loadProducts()
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
  } catch (error) {
    console.error('操作失败:', error)
    // 如果是验证错误，显示详细的错误信息
    if (error.fields) {
      const errorMessages = Object.keys(error.fields).map(field => {
        return `${field}: ${error.fields[field].join(', ')}`
      }).join('; ')
      ElMessage.error('表单验证失败：' + errorMessages)
    } else {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

async function applyFilters() {
  await loadProducts()
}

function resetFilters() {
  filters.value = {
    name: '',
    category_id: '',
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
  loadSystemTags()
})
</script>

<style scoped>
.merchant-product-manage {
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

/* 图片样式 */
.image-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
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

.product-name {
  margin: 0;
  font-size: 18px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* SKU 选择器样式 */
.sku-stock-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sku-select {
  width: 150px;
}

.current-stock-info {
  margin-top: 4px;
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
  color: #909399;
  margin-top: 4px;
}

/* 标签选择器样式 */
.tag-selector {
  width: 100%;
}

.tag-category {
  margin-bottom: 16px;
}

.tag-category-title {
  font-size: 18px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 8px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.system-tag {
  cursor: pointer;
  margin: 0;
}

.custom-tags {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.custom-tag-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* SKU 管理样式 */
.sku-manager {
  margin-bottom: 20px;
}

.sku-header {
  margin-bottom: 12px;
}

.sku-tip {
  margin-bottom: 12px;
}

.sku-list {
  margin-top: 12px;
}

.sku-table-header {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.header-cell {
  flex: 1;
  font-weight: 600;
  font-size: 18px;
  color: #606266;
}

.sku-item {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #e8e8e8;
  align-items: center;
}

.sku-cell {
  flex: 1;
  font-size: 18px;
  color: #606266;
}

.sku-image-upload {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.sku-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sku-stock-input {
  width: 80px;
}

.sku-total {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 标签组样式 */
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.size-tag,
.color-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.size-tag:hover,
.color-tag:hover {
  transform: translateY(-2px);
}

.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

/* 颜色图片批量上传样式 */
.sku-color-images {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.color-images-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.color-images-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.color-image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background-color: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  width: 160px;
  transition: box-shadow 0.2s ease;
}

.color-image-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.color-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-name {
  font-size: 18px;
  color: #374151;
  font-weight: 500;
}

.color-image-upload {
  width: 120px;
  height: 120px;
  overflow: hidden;
  border-radius: 8px;
}

.color-image-upload .image-uploader {
  width: 100% !important;
  height: 100% !important;
  border-radius: 8px;
}

.color-image-upload :deep(.el-upload) {
  width: 100%;
  height: 100%;
}

.color-image-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.color-image-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 2px;
}

.sku-count {
  font-size: 18px;
  color: #9ca3af;
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
  
  .sku-table-header,
  .sku-item {
    flex-wrap: wrap;
  }
  
  .header-cell,
  .sku-cell {
    flex: 1 1 30%;
  }
}

/* 商品表单对话框样式 - 解决截图问题 */
:deep(.product-form-dialog .el-dialog) {
  display: flex;
  flex-direction: column;
  max-height: 90vh !important;
  margin-top: 5vh !important;
}

:deep(.product-form-dialog .el-dialog__body) {
  flex: 1;
  overflow-y: auto;
  max-height: calc(90vh - 120px); /* 减去标题和底部高度 */
  padding: 20px;
}

:deep(.product-form-dialog .el-form) {
  max-height: none;
}

/* 可选：添加折叠功能样式 */
.collapsible-section {
  margin-bottom: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: background-color 0.3s;
}

.section-header:hover {
  background-color: #ebedf0;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #606266;
}

.section-icon {
  transition: transform 0.3s;
}

.section-icon.collapsed {
  transform: rotate(-180deg);
}

.section-content {
  padding: 16px;
  background-color: white;
}

/* 推荐：最简解决方案 - 直接调整对话框高度 */
.product-form-dialog :deep(.el-dialog) {
  max-height: 90vh;
  overflow: hidden;
}

.product-form-dialog :deep(.el-dialog__body) {
  max-height: 65vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.product-tabs {
  margin-bottom: 20px;
}

.product-tabs .el-tab-pane {
  padding-top: 16px;
}
</style>
