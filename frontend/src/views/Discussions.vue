<template>
  <div class="discussions-container">
    <h1>社区管理</h1>
    
    <div class="tab-container">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'discussions' }"
        @click="activeTab = 'discussions'"
      >
        社区列表
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'reports' }"
        @click="activeTab = 'reports'"
      >
        举报管理
      </button>
    </div>
    
    <div v-if="activeTab === 'discussions'">
      <div class="action-bar">
        <div class="search-bar">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索社区标题"
            class="search-input"
            @input="handleSearchInput"
          />
          <button class="search-btn" @click="searchDiscussions">搜索</button>
        </div>
        <div class="filter-bar">
          <div class="time-filter">
            <span class="filter-label">时间范围:</span>
            <div class="time-options">
              <button 
                v-for="option in timeOptions" 
                :key="option.value"
                :class="['time-option', { active: selectedTimeOption === option.value }]"
                @click="selectTimeOption(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <div class="custom-date" v-if="selectedTimeOption === 'custom'">
              <input type="date" v-model="customStartDate" @change="applyFilters" />
              <span class="date-separator">至</span>
              <input type="date" v-model="customEndDate" @change="applyFilters" />
            </div>
          </div>
          <div class="filter-type">
            <span class="filter-label">筛选类型:</span>
            <select v-model="filterType" @change="applyFilters" class="filter-select">
              <option value="created_at">发布时间</option>
              <option value="comment_time">评论时间</option>
            </select>
          </div>
        </div>
        <button class="create-btn" @click="showCreateDialog = true">创建社区内容</button>
      </div>
      
      <div class="community-list">
        <div 
          v-for="discussion in discussions" 
          :key="discussion.id"
          class="community-item"
        >
        <div class="community-header">
          <h3 class="community-title">{{ discussion.title }}</h3>
          <div class="community-actions">
            <button v-if="!discussion.is_pinned" class="action-btn pin-btn" @click="pinDiscussion(discussion.id)">置顶</button>
            <button v-else class="action-btn unpin-btn" @click="unpinDiscussion(discussion.id)">取消置顶</button>
            <button class="action-btn delete-btn" @click="deleteDiscussion(discussion.id)">删除</button>
          </div>
        </div>
        <div class="community-meta">
          <span class="user-name">作者: {{ discussion.user_name }}</span>
          <span class="create-time">{{ formatTime(discussion.created_at) }}</span>
          <span class="view-count">浏览: {{ discussion.view_count || 0 }}</span>
          <span class="comment-count">评论: {{ discussion.comments ? discussion.comments.length : 0 }}</span>
        </div>
        <div class="community-content">
          {{ discussion.content }}
        </div>
        <div v-if="discussion.products && discussion.products.length > 0" class="community-products">
          <h4>关联商品:</h4>
          <div class="products-list">
            <div 
              v-for="product in discussion.products" 
              :key="product.id"
              class="product-item"
            >
              <img :src="getImageUrl(product.image)" alt="product.image" class="product-image" />
              <span class="product-name">{{ product.name }}</span>
              <span class="product-price">¥{{ (parseFloat(product.price) || 0).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 评论区域 -->
        <div class="community-comments">
          <h4 class="comments-title" @click="toggleComments(discussion.id)">
            <span>评论 ({{ discussion.comments ? discussion.comments.length : 0 }})</span>
            <span class="toggle-icon">{{ expandedDiscussions[discussion.id] ? '▼' : '▶' }}</span>
          </h4>
          <div class="comments-list" v-if="expandedDiscussions[discussion.id] && discussion.comments && discussion.comments.length > 0">
            <div 
              v-for="comment in discussion.comments" 
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <span class="comment-user">{{ comment.user_name }}</span>
                <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <img v-if="comment.image" :src="getImageUrl(comment.image)" class="comment-image" />
            </div>
          </div>
          <div v-else-if="expandedDiscussions[discussion.id]" class="no-comments">暂无评论</div>
        </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="!loading && discussions.length === 0" class="empty">暂无社区内容</div>
    </div>
    
    <!-- 举报管理区域 -->
    <div v-if="activeTab === 'reports'" class="reports-section">
      <div v-if="loadingReports" class="loading">加载中...</div>
      <div v-else-if="!loadingReports && reports.length === 0" class="empty">暂无举报</div>
      <div v-else class="reports-list">
        <div 
          v-for="report in reports" 
          :key="report.id"
          class="report-item"
        >
          <div class="report-header">
            <h3 class="report-title">举报: {{ report.discussion_title }}</h3>
            <div class="report-status" :class="`status-${report.status}`">
              {{ getStatusText(report.status) }}
            </div>
          </div>
          <div class="report-meta">
            <span class="reporter">举报人: {{ report.user_name }}</span>
            <span class="report-time">{{ formatTime(report.created_at) }}</span>
          </div>
          <div class="report-reason">
            <strong>举报原因:</strong>
            <p>{{ report.reason }}</p>
          </div>
          <div class="report-actions">
            <button v-if="report.status === 0" class="action-btn process-btn" @click="updateReportStatus(report.id, 1)">已处理</button>
            <button v-if="report.status === 0" class="action-btn reject-btn" @click="updateReportStatus(report.id, 2)">驳回</button>
            <button class="action-btn delete-btn" @click="deleteReport(report.id)">删除</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 创建社区内容对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>创建社区内容</h3>
          <button class="close-btn" @click="showCreateDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>标题</label>
            <input v-model="newDiscussion.title" type="text" placeholder="请输入社区标题" class="form-input" />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="newDiscussion.content" rows="4" placeholder="请输入社区内容" class="form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label>图片</label>
            <div class="image-upload">
              <div v-for="(image, index) in newDiscussion.images" :key="index" class="image-item">
                <img :src="image" class="uploaded-image" />
                <button class="delete-image-btn" @click="removeImage(index)">×</button>
              </div>
              <button class="upload-btn" @click="uploadImage">
                <span class="upload-icon">+</span>
                <span>添加图片</span>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>关联商品</label>
            <div class="product-selector">
              <div v-for="product in selectedProducts" :key="product.id" class="selected-product">
                <span>{{ product.name }}</span>
                <button class="remove-product-btn" @click="removeProduct(product.id)">×</button>
              </div>
              <button class="select-btn" @click="showProductSelector = true; loadProducts()">选择商品</button>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showCreateDialog = false">取消</button>
          <button class="submit-btn" @click="createDiscussion" :disabled="isSubmitting">
            {{ isSubmitting ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 商品选择对话框 -->
    <div v-if="showProductSelector" class="dialog-overlay" @click="showProductSelector = false">
      <div class="dialog-content product-selector-dialog" @click.stop>
        <div class="dialog-header">
          <h3>选择商品</h3>
          <button class="close-btn" @click="showProductSelector = false">×</button>
        </div>
        <div class="dialog-body">
          <div v-if="loadingProducts" class="loading">加载中...</div>
          <div v-else-if="products.length === 0" class="empty">暂无商品</div>
          <div v-else class="products-grid">
            <div 
              v-for="product in products" 
              :key="product.id"
              class="product-card"
              :class="{ selected: selectedProducts.some(p => p.id === product.id) }"
              @click="addProduct(product)"
            >
              <img :src="getImageUrl(product.image)" class="product-card-image" />
              <div class="product-card-info">
                <span class="product-card-name">{{ product.name }}</span>
                <span class="product-card-price">¥{{ product.price.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showProductSelector = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { discussionApi, reportApi } from '../services/api'
import { API_BASE } from '../services/api'
import { ElMessage } from 'element-plus'
import { usePermission } from '../mixins/permission'

export default {
  name: 'Discussions',
  setup() {
    const discussions = ref([])
    const loading = ref(false)
    const searchKeyword = ref('')
    const expandedDiscussions = ref({})
    const activeTab = ref('discussions')
    const reports = ref([])
    const loadingReports = ref(false)
    const showCreateDialog = ref(false)
    const newDiscussion = ref({ title: '', content: '', images: [] })
    const isSubmitting = ref(false)
    const showProductSelector = ref(false)
    const selectedProducts = ref([])
    const products = ref([])
    const loadingProducts = ref(false)
    const { hasPermission } = usePermission()
    
    // 时间筛选相关变量
    const timeOptions = [
      { label: '全部', value: 'all' },
      { label: '今天', value: 'today' },
      { label: '昨天', value: 'yesterday' },
      { label: '近7天', value: 'last7days' },
      { label: '近30天', value: 'last30days' },
      { label: '自定义', value: 'custom' }
    ]
    const selectedTimeOption = ref('all')
    const customStartDate = ref('')
    const customEndDate = ref('')
    const filterType = ref('created_at')
    
    // API_BASE is defined in api.js
    
    function getImageUrl(url) {
      if (!url) return 'https://via.placeholder.com/100x100'
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      if (url.startsWith('/uploads/')) {
        return `${API_BASE}${url}`
      }
      return url
    }
    
    function formatTime(time) {
      const date = new Date(time)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    async function loadDiscussions() {
      loading.value = true
      try {
        const res = await discussionApi.getList()
        if (res.success) {
          const data = res.data || []
          discussions.value = data
          originalDiscussions.value = data // 保存原始数据用于搜索
          // 初始化所有讨论的折叠状态为 true（折叠），并确保必要字段存在
          discussions.value.forEach(discussion => {
            expandedDiscussions.value[discussion.id] = false
            if (discussion.sort_order === undefined) {
              discussion.sort_order = 0
            }
            if (discussion.is_pinned === undefined) {
              discussion.is_pinned = false
            }
          })
        } else {
          discussions.value = []
          originalDiscussions.value = []
        }
      } catch (error) {
        console.error('加载讨论列表失败:', error)
        discussions.value = []
        originalDiscussions.value = []
      } finally {
        loading.value = false
      }
    }
    
    // 保存原始讨论列表用于搜索过滤
    const originalDiscussions = ref([])
    
    async function searchDiscussions() {
      applyFilters()
    }
    
    // 实时搜索
    function handleSearchInput() {
      applyFilters()
    }
    
    // 选择时间范围选项
    function selectTimeOption(option) {
      selectedTimeOption.value = option
      if (option === 'custom') {
        // 设置默认自定义日期范围为最近7天
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        customStartDate.value = startDate.toISOString().split('T')[0]
        customEndDate.value = endDate.toISOString().split('T')[0]
      }
      applyFilters()
    }
    
    // 应用筛选条件
    function applyFilters() {
      loading.value = true
      try {
        let filteredDiscussions = [...originalDiscussions.value]
        
        // 应用搜索关键词筛选
        if (searchKeyword.value.trim()) {
          filteredDiscussions = filteredDiscussions.filter(discussion => 
            discussion.title.includes(searchKeyword.value.trim())
          )
        }
        
        // 应用时间范围筛选
        if (selectedTimeOption.value !== 'all') {
          filteredDiscussions = filteredDiscussions.filter(discussion => {
            return isDateInRange(discussion)
          })
        }
        
        discussions.value = filteredDiscussions
      } catch (error) {
        console.error('筛选失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    // 判断日期是否在指定范围内
    function isDateInRange(discussion) {
      let targetDate
      if (filterType.value === 'created_at') {
        targetDate = new Date(discussion.created_at)
      } else if (filterType.value === 'comment_time') {
        // 获取最后一条评论的时间
        if (discussion.comments && discussion.comments.length > 0) {
          const lastComment = discussion.comments[discussion.comments.length - 1]
          targetDate = new Date(lastComment.created_at)
        } else {
          // 没有评论的帖子，不显示
          return false
        }
      }
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (selectedTimeOption.value) {
        case 'today':
          return targetDate >= today
        case 'yesterday':
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          return targetDate >= yesterday && targetDate < today
        case 'last7days':
          const last7Days = new Date(today)
          last7Days.setDate(last7Days.getDate() - 7)
          return targetDate >= last7Days
        case 'last30days':
          const last30Days = new Date(today)
          last30Days.setDate(last30Days.getDate() - 30)
          return targetDate >= last30Days
        case 'custom':
          if (customStartDate.value && customEndDate.value) {
            const startDate = new Date(customStartDate.value)
            const endDate = new Date(customEndDate.value)
            endDate.setHours(23, 59, 59, 999)
            return targetDate >= startDate && targetDate <= endDate
          }
          return true
        default:
          return true
      }
    }
    
    async function deleteDiscussion(id) {
      if (!hasPermission('discussion:delete')) {
        ElMessage.warning('您没有删除社区内容的权限')
        return
      }
      
      if (!confirm('确定要删除这个社区内容吗？')) return
      
      try {
        const res = await discussionApi.delete(id)
        if (res.success) {
          alert('删除成功')
          loadDiscussions()
        }
      } catch (error) {
        console.error('删除社区内容失败:', error)
        alert('删除失败')
      }
    }
    
    function toggleComments(discussionId) {
      expandedDiscussions.value[discussionId] = !expandedDiscussions.value[discussionId]
    }
    
    async function loadReports() {
      loadingReports.value = true
      try {
        const res = await reportApi.getList()
        if (res.success) {
          reports.value = res.data || []
        } else {
          reports.value = []
        }
      } catch (error) {
        console.error('加载举报列表失败:', error)
        reports.value = []
      } finally {
        loadingReports.value = false
      }
    }
    
    async function updateReportStatus(id, status) {
      try {
        const res = await reportApi.updateStatus(id, status)
        if (res.success) {
          alert('举报状态更新成功')
          loadReports()
        }
      } catch (error) {
        console.error('更新举报状态失败:', error)
        alert('更新举报状态失败')
      }
    }
    
    async function deleteReport(id) {
      if (!confirm('确定要删除这个举报吗？')) return
      
      try {
        const res = await reportApi.delete(id)
        if (res.success) {
          alert('举报删除成功')
          loadReports()
        }
      } catch (error) {
        console.error('删除举报失败:', error)
        alert('删除举报失败')
      }
    }
    
    function getStatusText(status) {
      switch (status) {
        case 0:
          return '待审核'
        case 1:
          return '已处理'
        case 2:
          return '驳回'
        default:
          return '未知状态'
      }
    }
    
    async function uploadImage() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = true
      input.onchange = async (e) => {
        const files = e.target.files
        if (files.length > 0) {
          try {
            const formData = new FormData()
            for (let i = 0; i < files.length; i++) {
              formData.append('images', files[i])
            }
            
            const res = await fetch(`${API_BASE}/api/upload`, {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
              }
            })
            
            const data = await res.json()
            if (data.success) {
              newDiscussion.value.images = [...newDiscussion.value.images, ...data.data]
            } else {
              alert('图片上传失败')
            }
          } catch (error) {
            console.error('上传图片失败:', error)
            alert('图片上传失败')
          }
        }
      }
      input.click()
    }
    
    function removeImage(index) {
      newDiscussion.value.images.splice(index, 1)
    }
    
    async function loadProducts() {
      loadingProducts.value = true
      try {
        const token = localStorage.getItem('admin_token')
        const res = await fetch(`${API_BASE}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await res.json()
        if (data.success) {
          products.value = data.data || []
        }
      } catch (error) {
        console.error('加载商品列表失败:', error)
      } finally {
        loadingProducts.value = false
      }
    }
    
    function addProduct(product) {
      if (!selectedProducts.value.some(p => p.id === product.id)) {
        selectedProducts.value.push(product)
      }
    }
    
    function removeProduct(productId) {
      selectedProducts.value = selectedProducts.value.filter(p => p.id !== productId)
    }
    
    async function createDiscussion() {
      if (!hasPermission('discussion:create')) {
        ElMessage.warning('您没有创建社区内容的权限')
        return
      }
      
      if (!newDiscussion.value.title.trim()) {
        alert('请输入社区标题')
        return
      }
      if (!newDiscussion.value.content.trim()) {
        alert('请输入社区内容')
        return
      }
      
      isSubmitting.value = true
      try {
        const res = await discussionApi.create({
          title: newDiscussion.value.title,
          content: newDiscussion.value.content,
          product_ids: selectedProducts.value.map(p => p.id),
          images: newDiscussion.value.images
        })
        if (res.success) {
          alert('社区内容创建成功')
          showCreateDialog.value = false
          newDiscussion.value = { title: '', content: '', images: [] }
          selectedProducts.value = []
          loadDiscussions()
        } else {
          alert('社区内容创建失败')
        }
      } catch (error) {
        console.error('创建社区内容失败:', error)
        alert('社区内容创建失败')
      } finally {
        isSubmitting.value = false
      }
    }
    
    async function pinDiscussion(id) {
      if (!hasPermission('discussion:manage')) {
        ElMessage.warning('您没有置顶社区内容的权限')
        return
      }
      
      try {
        const res = await discussionApi.pin(id)
        if (res.success) {
          ElMessage.success('社区内容置顶成功')
          loadDiscussions()
        } else {
          ElMessage.error(res.message || '置顶失败')
        }
      } catch (error) {
        console.error('置顶社区内容失败:', error)
        ElMessage.error(error.response?.data?.message || '置顶失败')
      }
    }
    
    async function unpinDiscussion(id) {
      if (!hasPermission('discussion:manage')) {
        ElMessage.warning('您没有取消置顶社区内容的权限')
        return
      }
      
      try {
        const res = await discussionApi.unpin(id)
        if (res.success) {
          ElMessage.success('取消置顶成功')
          loadDiscussions()
        } else {
          ElMessage.error(res.message || '取消置顶失败')
        }
      } catch (error) {
        console.error('取消置顶社区内容失败:', error)
        ElMessage.error(error.response?.data?.message || '取消置顶失败')
      }
    }
    
    // 监听tab切换，自动加载对应数据
    watch(activeTab, (newTab) => {
      if (newTab === 'reports') {
        loadReports()
      } else if (newTab === 'discussions') {
        loadDiscussions()
      }
    })
    
    onMounted(() => {
      loadDiscussions()
    })
    
    return {
      discussions,
      loading,
      searchKeyword,
      expandedDiscussions,
      activeTab,
      reports,
      loadingReports,
      showCreateDialog,
      newDiscussion,
      isSubmitting,
      showProductSelector,
      selectedProducts,
      products,
      loadingProducts,
      getImageUrl,
      formatTime,
      searchDiscussions,
      handleSearchInput,
      selectTimeOption,
      applyFilters,
      timeOptions,
      selectedTimeOption,
      customStartDate,
      customEndDate,
      filterType,
      deleteDiscussion,
      toggleComments,
      loadReports,
      updateReportStatus,
      deleteReport,
      getStatusText,
      createDiscussion,
      uploadImage,
      removeImage,
      loadProducts,
      addProduct,
      removeProduct,
      pinDiscussion,
      unpinDiscussion
    }
  }
}
</script>

<style scoped>
.discussions-container {
  padding: 20px;
}

h1 {
  font-size: 38px;
  margin-bottom: 20px;
  color: #333;
}

/* 标签页样式 */
.tab-container {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: #1989fa;
}

.tab-btn.active {
  color: #1989fa;
  border-bottom-color: #1989fa;
}

/* 操作栏样式 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-bar {
  display: flex;
  flex: 1;
  max-width: 500px;
  margin-right: 20px;
}

.create-btn {
  padding: 10px 20px;
  background-color: #1989fa;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  margin-left: 10px;
  align-self: center;
}

.create-btn:hover {
  background-color: #1890ff;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 18px;
}

.search-btn {
  padding: 10px 20px;
  background-color: #1989fa;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.search-btn:hover {
  background-color: #1890ff;
}

/* 筛选栏样式 */
.filter-bar {
  display: flex;
  flex-direction: column;
  margin-right: 20px;
  min-width: 300px;
}

.time-filter {
  margin-bottom: 10px;
}

.filter-label {
  font-size: 18px;
  color: #666;
  margin-right: 10px;
  white-space: nowrap;
}

.time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.time-option {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background-color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-option:hover {
  border-color: #1989fa;
  color: #1989fa;
}

.time-option.active {
  background-color: #1989fa;
  color: white;
  border-color: #1989fa;
}

.custom-date {
  display: flex;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}

.custom-date input[type="date"] {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
}

.date-separator {
  font-size: 18px;
  color: #666;
}

.filter-type {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
  background-color: white;
  cursor: pointer;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .action-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-bar {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
    max-width: none;
  }
  
  .filter-bar {
    margin-right: 0;
    margin-bottom: 10px;
    min-width: none;
    width: 100%;
  }
  
  .create-btn {
    margin-left: 0;
  }
}

.community-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.community-item {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.community-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.community-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}



.action-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
}

.delete-btn:hover {
  background-color: #ff7875;
}

.pin-btn {
  background-color: #52c41a;
  color: white;
}

.pin-btn:hover {
  background-color: #73d13d;
}

.unpin-btn {
  background-color: #faad14;
  color: white;
}

.community-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 18px;
  color: #666;
}

.community-content {
  margin-bottom: 15px;
  line-height: 1.5;
  color: #333;
}

.community-products {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
}

.community-products h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.products-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.product-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  margin-bottom: 5px;
}

.product-name {
  font-size: 18px;
  color: #333;
  margin-bottom: 5px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.product-price {
  font-size: 18px;
  color: #ff4d4f;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 评论区域样式 */
.discussion-comments {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
}

.discussion-comments .comments-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.discussion-comments .comments-title:hover {
  color: #1989fa;
}

.discussion-comments .toggle-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

/* 自定义滚动条 */
.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.comment-item {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 18px;
}

.comment-user {
  font-weight: 600;
  color: #333;
}

.comment-time {
  color: #999;
}

.comment-content {
  font-size: 18px;
  line-height: 1.4;
  color: #333;
  margin-bottom: 5px;
}

.comment-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  margin-top: 5px;
}

.no-comments {
  font-size: 18px;
  color: #999;
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 4px;
}

/* 举报管理样式 */
.reports-section {
  margin-top: 20px;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-item {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.report-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.report-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
}

.status-0 {
  background-color: #fff2e8;
  color: #fa8c16;
}

.status-1 {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-2 {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.report-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 18px;
  color: #666;
}

.report-reason {
  margin-bottom: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.report-reason p {
  margin: 5px 0 0 0;
  line-height: 1.4;
  color: #333;
}

.report-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e8e8e8;
}

.process-btn {
  background-color: #52c41a;
  color: white;
}

.process-btn:hover {
  background-color: #73d13d;
}

.reject-btn {
  background-color: #ff4d4f;
  color: white;
}

.reject-btn:hover {
  background-color: #ff7875;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #fafafa;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 18px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1989fa;
  box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.2);
}

.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 18px;
  resize: vertical;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #1989fa;
  box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  background-color: #fafafa;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background-color: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #1989fa;
  color: #1989fa;
}

.submit-btn {
  padding: 8px 16px;
  background-color: #1989fa;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #1890ff;
}

.submit-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

/* 图片上传样式 */
.image-upload {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: #333;
  transition: all 0.3s ease;
}

.delete-image-btn:hover {
  background-color: #ff4d4f;
  color: white;
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #999;
}

.upload-btn:hover {
  border-color: #1989fa;
  color: #1989fa;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

/* 商品选择器样式 */
.product-selector {
  margin-top: 8px;
}

.selected-product {
  display: inline-block;
  padding: 6px 12px;
  background-color: #f0f9ff;
  border: 1px solid #91d5ff;
  border-radius: 16px;
  margin-right: 8px;
  margin-bottom: 8px;
  font-size: 18px;
  color: #1890ff;
}

.remove-product-btn {
  background: none;
  border: none;
  margin-left: 8px;
  cursor: pointer;
  font-size: 18px;
  color: #1890ff;
}

.remove-product-btn:hover {
  color: #ff4d4f;
}

.select-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background-color: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.select-btn:hover {
  border-color: #1989fa;
  color: #1989fa;
}

/* 商品选择对话框样式 */
.product-selector-dialog {
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.product-selector-dialog .dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.product-card {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.product-card:hover {
  border-color: #1989fa;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.1);
}

.product-card.selected {
  border-color: #1989fa;
  background-color: #f0f9ff;
}

.product-card-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

.product-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-card-name {
  font-size: 18px;
  color: #333;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-card-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
  margin-top: 4px;
}

/* 自定义滚动条 */
.product-selector-dialog .dialog-body::-webkit-scrollbar {
  width: 6px;
}

.product-selector-dialog .dialog-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.product-selector-dialog .dialog-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.product-selector-dialog .dialog-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>