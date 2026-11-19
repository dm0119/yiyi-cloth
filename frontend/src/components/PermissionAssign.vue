<template>
  <div class="permission-assign-new">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <div class="search-box">
        <el-input
          v-model="searchText"
          placeholder="搜索权限名称或代码..."
          clearable
          :prefix-icon="Search"
          size="default"
        />
      </div>
      <div class="action-buttons">
        <el-button @click="expandAll" :icon="SortDown">展开全部</el-button>
        <el-button @click="collapseAll" :icon="SortUp">折叠全部</el-button>
        <el-button type="primary" @click="selectAll" :icon="Check">全选</el-button>
        <el-button type="danger" @click="clearAll" :icon="Close">清空</el-button>
      </div>
    </div>

    <!-- 权限树 -->
    <div class="permission-tree-container">
      <el-tree
        ref="treeRef"
        :data="filteredPermissionTree"
        :props="treeProps"
        show-checkbox
        node-key="code"
        default-expand-all
        :default-checked-keys="selectedPermissions"
        @check="handleCheck"
        :filter-node-method="filterNode"
        class="permission-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node-content">
            <span class="node-label">{{ data.label }}</span>
            <span v-if="data.code" class="node-code">{{ data.code }}</span>
            <el-tag v-if="data.type === 'menu'" size="small" type="info" effect="plain">菜单</el-tag>
            <el-tag v-if="data.type === 'button'" size="small" type="success" effect="plain">按钮</el-tag>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 已选权限统计 -->
    <div class="selected-summary">
      <div class="summary-info">
        <span class="summary-label">已选择权限：</span>
        <span class="summary-count">{{ selectedPermissions.length }}</span>
        <span class="summary-unit">个</span>
      </div>
      <div class="selected-list" v-if="selectedPermissions.length > 0">
        <el-tag
          v-for="code in selectedPermissions"
          :key="code"
          closable
          @close="removePermission(code)"
          size="small"
          type="success"
          class="selected-tag"
        >
          {{ getPermissionLabel(code) }}
        </el-tag>
      </div>
      <div class="empty-hint" v-else>
        <el-icon><InfoFilled /></el-icon>
        <span>请在上方权限树中勾选需要的权限</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Search, SortDown, SortUp, Check, Close, InfoFilled } from '@element-plus/icons-vue'

// 权限树数据（与后端 config/permissions.js 同步）
const permissionTreeData = [
  {
    code: 'dashboard',
    label: '控制台',
    type: 'menu',
    children: [
      { code: 'dashboard:view', label: '查看控制台', type: 'button' }
    ]
  },
  {
    code: 'product:center',
    label: '商品中心',
    type: 'menu',
    children: [
      {
        code: 'products',
        label: '商品管理',
        type: 'menu',
        children: [
          { code: 'product:view', label: '查看商品', type: 'button' },
          { code: 'product:create', label: '新增商品', type: 'button' },
          { code: 'product:edit', label: '编辑商品', type: 'button' },
          { code: 'product:delete', label: '删除商品', type: 'button' },
          { code: 'product:status', label: '上架/下架', type: 'button' }
        ]
      },
      {
        code: 'categories',
        label: '分类管理',
        type: 'menu',
        children: [
          { code: 'category:view', label: '查看分类', type: 'button' },
          { code: 'category:create', label: '新增分类', type: 'button' },
          { code: 'category:edit', label: '编辑分类', type: 'button' },
          { code: 'category:delete', label: '删除分类', type: 'button' }
        ]
      },
      {
        code: 'hot_products',
        label: '热门推荐',
        type: 'menu',
        children: [
          { code: 'hot_product:view', label: '查看推荐', type: 'button' },
          { code: 'hot_product:manage', label: '管理推荐', type: 'button' }
        ]
      },
      {
        code: 'new_products',
        label: '新品推荐',
        type: 'menu',
        children: [
          { code: 'new_product:view', label: '查看新品', type: 'button' },
          { code: 'new_product:manage', label: '管理新品', type: 'button' }
        ]
      }
    ]
  },
  {
    code: 'order:center',
    label: '订单中心',
    type: 'menu',
    children: [
      {
        code: 'orders',
        label: '订单管理',
        type: 'menu',
        children: [
          { code: 'order:view', label: '查看订单', type: 'button' },
          { code: 'order:detail', label: '订单详情', type: 'button' },
          { code: 'order:edit', label: '编辑订单', type: 'button' },
          { code: 'order:ship', label: '订单发货', type: 'button' },
          { code: 'order:refund', label: '订单退款', type: 'button' },
          { code: 'order:close', label: '关闭订单', type: 'button' },
          { code: 'order:logistics', label: '物流管理', type: 'button' }
        ]
      },
      {
        code: 'coupons',
        label: '优惠券管理',
        type: 'menu',
        children: [
          { code: 'coupon:view', label: '查看优惠券', type: 'button' },
          { code: 'coupon:create', label: '新增优惠券', type: 'button' },
          { code: 'coupon:edit', label: '编辑优惠券', type: 'button' },
          { code: 'coupon:delete', label: '删除优惠券', type: 'button' },
          { code: 'coupon:issue', label: '发放优惠券', type: 'button' }
        ]
      },
      {
        code: 'reviews',
        label: '评价管理',
        type: 'menu',
        children: [
          { code: 'review:view', label: '查看评价', type: 'button' },
          { code: 'review:audit', label: '评价审核', type: 'button' },
          { code: 'review:delete', label: '删除评价', type: 'button' }
        ]
      }
    ]
  },
  {
    code: 'user:center',
    label: '用户中心',
    type: 'menu',
    children: [
      {
        code: 'users',
        label: '用户管理',
        type: 'menu',
        children: [
          { code: 'user:view', label: '查看用户', type: 'button' },
          { code: 'user:detail', label: '用户详情', type: 'button' },
          { code: 'user:edit', label: '编辑用户', type: 'button' },
          { code: 'user:freeze', label: '冻结/解冻', type: 'button' },
          { code: 'user:delete', label: '删除用户', type: 'button' }
        ]
      },
      {
        code: 'roles',
        label: '角色管理',
        type: 'menu',
        children: [
          { code: 'role:view', label: '查看角色', type: 'button' },
          { code: 'role:create', label: '新增角色', type: 'button' },
          { code: 'role:edit', label: '编辑角色', type: 'button' },
          { code: 'role:delete', label: '删除角色', type: 'button' }
        ]
      }
    ]
  },
  {
    code: 'shop:center',
    label: '店铺中心',
    type: 'menu',
    children: [
      {
        code: 'merchants',
        label: '商家管理',
        type: 'menu',
        children: [
          { code: 'merchant:view', label: '查看商家', type: 'button' },
          { code: 'merchant:review', label: '审核商家', type: 'button' },
          { code: 'merchant:edit', label: '编辑商家', type: 'button' },
          { code: 'merchant:delete', label: '删除商家', type: 'button' }
        ]
      },
      {
        code: 'shops',
        label: '店铺管理',
        type: 'menu',
        children: [
          { code: 'shop:view', label: '查看店铺', type: 'button' },
          { code: 'shop:edit', label: '编辑店铺', type: 'button' }
        ]
      }
    ]
  },
  {
    code: 'community:center',
    label: '社区中心',
    type: 'menu',
    children: [
      {
        code: 'discussions',
        label: '社区管理',
        type: 'menu',
        children: [
          { code: 'discussion:view', label: '查看社区', type: 'button' },
          { code: 'discussion:audit', label: '帖子审核', type: 'button' },
          { code: 'discussion:delete', label: '删除帖子', type: 'button' }
        ]
      },
      {
        code: 'zones',
        label: '专区管理',
        type: 'menu',
        children: [
          { code: 'zone:view', label: '查看专区', type: 'button' },
          { code: 'zone:manage', label: '管理专区', type: 'button' }
        ]
      }
    ]
  },
  {
    code: 'service:center',
    label: '客服中心',
    type: 'menu',
    children: [
      {
        code: 'conversations',
        label: '会话管理',
        type: 'menu',
        children: [
          { code: 'conversation:view', label: '查看会话', type: 'button' },
          { code: 'conversation:chat', label: '在线沟通', type: 'button' },
          { code: 'conversation:history', label: '会话记录', type: 'button' }
        ]
      }
    ]
  },
  {
    code: 'statistics:center',
    label: '数据统计',
    type: 'menu',
    children: [
      {
        code: 'statistics',
        label: '数据统计',
        type: 'menu',
        children: [
          { code: 'statistics:view', label: '查看统计', type: 'button' },
          { code: 'statistics:export', label: '数据导出', type: 'button' }
        ]
      }
    ]
  }
]

// 构建权限码 → 名称的映射
const permissionLabelMap = {}
const buildLabelMap = (nodes) => {
  nodes.forEach(node => {
    if (node.code && !node.children) {
      permissionLabelMap[node.code] = node.label
    }
    if (node.children) {
      buildLabelMap(node.children)
    }
  })
}
buildLabelMap(permissionTreeData)

// 响应式数据
const treeRef = ref(null)
const searchText = ref('')
const selectedPermissions = ref([])

// 树配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 过滤后的权限树
const filteredPermissionTree = computed(() => {
  if (!searchText.value) {
    return permissionTreeData
  }
  
  const filterTree = (nodes) => {
    return nodes.reduce((result, node) => {
      const labelMatch = node.label.toLowerCase().includes(searchText.value.toLowerCase())
      const codeMatch = node.code && node.code.toLowerCase().includes(searchText.value.toLowerCase())
      
      if (node.children) {
        const filteredChildren = filterTree(node.children)
        if (filteredChildren.length > 0 || labelMatch || codeMatch) {
          result.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children
          })
        }
      } else if (labelMatch || codeMatch) {
        result.push(node)
      }
      
      return result
    }, [])
  }
  
  return filterTree(permissionTreeData)
})

// 监听搜索文本变化
watch(searchText, (val) => {
  if (treeRef.value) {
    treeRef.value.filter(val)
  }
})

// 过滤节点方法
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase()) ||
         (data.code && data.code.toLowerCase().includes(value.toLowerCase()))
}

// 处理勾选
const handleCheck = (data, checkedInfo) => {
  selectedPermissions.value = checkedInfo.checkedKeys.filter(key => !key.includes(':') || !permissionTreeData.some(n => n.code === key))
  
  // 只保留叶子节点（按钮权限）
  const getAllLeafCodes = (nodes) => {
    const codes = []
    const traverse = (nodeList) => {
      nodeList.forEach(node => {
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        } else if (node.code) {
          codes.push(node.code)
        }
      })
    }
    traverse(nodes)
    return codes
  }
  
  const allLeafCodes = getAllLeafCodes(permissionTreeData)
  selectedPermissions.value = checkedInfo.checkedKeys.filter(key => allLeafCodes.includes(key))
}

// 展开全部
const expandAll = () => {
  if (treeRef.value) {
    const nodes = treeRef.value.store.root.childNodes
    const expandNode = (node) => {
      node.expanded = true
      if (node.childNodes) {
        node.childNodes.forEach(expandNode)
      }
    }
    nodes.forEach(expandNode)
  }
}

// 折叠全部
const collapseAll = () => {
  if (treeRef.value) {
    const nodes = treeRef.value.store.root.childNodes
    const collapseNode = (node) => {
      node.expanded = false
      if (node.childNodes) {
        node.childNodes.forEach(collapseNode)
      }
    }
    nodes.forEach(collapseNode)
  }
}

// 全选
const selectAll = () => {
  if (treeRef.value) {
    const getAllLeafCodes = (nodes) => {
      const codes = []
      const traverse = (nodeList) => {
        nodeList.forEach(node => {
          if (node.children && node.children.length > 0) {
            traverse(node.children)
          } else if (node.code) {
            codes.push(node.code)
          }
        })
      }
      traverse(nodes)
      return codes
    }
    
    const allLeafCodes = getAllLeafCodes(permissionTreeData)
    treeRef.value.setCheckedKeys(allLeafCodes)
    selectedPermissions.value = allLeafCodes
  }
}

// 清空
const clearAll = () => {
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([])
    selectedPermissions.value = []
  }
}

// 移除单个权限
const removePermission = (code) => {
  if (treeRef.value) {
    treeRef.value.setChecked(code, false)
  }
  const index = selectedPermissions.value.indexOf(code)
  if (index > -1) {
    selectedPermissions.value.splice(index, 1)
  }
}

// 获取权限标签
const getPermissionLabel = (code) => {
  return permissionLabelMap[code] || code
}

// 设置权限（供父组件调用）
const setPermissions = (permissions) => {
  if (!permissions || !Array.isArray(permissions)) {
    selectedPermissions.value = []
    if (treeRef.value) {
      treeRef.value.setCheckedKeys([])
    }
    return
  }
  
  const validCodes = Object.keys(permissionLabelMap)
  selectedPermissions.value = permissions.filter(p => validCodes.includes(p))
  
  nextTick(() => {
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(selectedPermissions.value)
    }
  })
}

// 获取权限（供父组件调用）
const getPermissions = () => {
  return [...selectedPermissions.value]
}

defineExpose({
  setPermissions,
  getPermissions
})
</script>

<style scoped>
.permission-assign-new {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

/* 顶部操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 权限树容器 */
.permission-tree-container {
  flex: 1;
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  background: white;
}

.permission-tree {
  background: transparent;
}

/* 树节点样式 */
:deep(.el-tree-node__content) {
  height: 36px;
  padding: 4px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-label {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.node-code {
  font-size: 12px;
  color: #909399;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 已选权限统计 */
.selected-summary {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.summary-info {
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.summary-label {
  font-weight: 500;
}

.summary-count {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  margin: 0 4px;
}

.summary-unit {
  color: #909399;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.selected-tag {
  flex-shrink: 0;
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #c0c4cc;
  font-size: 14px;
}

.empty-hint .el-icon {
  font-size: 20px;
}
</style>
