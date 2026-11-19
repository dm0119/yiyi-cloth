<template>
  <div class="permission-dialog-container">
    <el-dialog
      v-model="dialogVisible"
      title="分配权限"
      width="700px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchText"
          placeholder="搜索权限..."
          prefix-icon="Search"
          clearable
        />
      </div>

      <!-- 权限树 -->
      <div class="permission-tree-container">
        <el-tree
          ref="treeRef"
          :data="permissionTree"
          :props="{ label: 'label', children: 'children' }"
          node-key="code"
          show-checkbox
          :filter-node-method="filterNode"
          :expand-on-click-node="true"
          :check-on-click-node="true"
          :check-strictly="false"
          @check="handleCheck"
        >
          <template #default="{ node, data }">
            <span class="tree-node-label">
              <el-tag v-if="data.type === 'parent'" size="small" type="info" style="margin-right: 5px;">
                目录
              </el-tag>
              <el-tag v-else-if="data.type === 'menu'" size="small" style="margin-right: 5px;">
                菜单
              </el-tag>
              <el-tag v-else size="small" type="success" style="margin-right: 5px;">
                按钮
              </el-tag>
              {{ node.label }}
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 底部操作栏 -->
      <div class="dialog-footer">
        <div class="quick-actions">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">
            全选所有权限
          </el-checkbox>
          <el-button link type="primary" @click="expandAll">
            展开全部
          </el-button>
          <el-button link type="primary" @click="collapseAll">
            收起全部
          </el-button>
        </div>
        <div class="stats">
          已选择 <el-tag type="primary">{{ selectedPermissions.length }}</el-tag> 项权限
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer-buttons">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="loading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { permissionTree as defaultPermissionTree } from '../config/permissions'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  roleId: {
    type: [Number, String],
    default: ''
  },
  currentPermissions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'save'])

// 状态
const dialogVisible = ref(false)
const searchText = ref('')
const selectedPermissions = ref([])
const selectAll = ref(false)
const loading = ref(false)
const treeRef = ref(null)

// 权限树（响应式）
const permissionTree = ref(defaultPermissionTree)

// 监听对话框显示
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    // 初始化选中权限（只包含按钮权限）
    const buttonPermissions = props.currentPermissions.filter(code => {
      const node = findNodeByCode(permissionTree.value, code)
      return !node || node.type === 'button' || code === 'all'
    })
    
    selectedPermissions.value = buttonPermissions
    selectAll.value = buttonPermissions.includes('all')
    
    // 使用 nextTick 确保树组件已经渲染完成
    nextTick(() => {
      // 清空所有选中状态
      treeRef.value?.setCheckedKeys([])
      
      // 如果有 'all' 权限，勾选所有节点
      if (selectAll.value) {
        const allCodes = getAllButtonCodes(permissionTree.value)
        allCodes.forEach(code => {
          treeRef.value?.setChecked(code, true, false)
        })
      } else {
        // 设置初始选中状态（只设置按钮权限）
        buttonPermissions.forEach(code => {
          if (code !== 'all') {
            treeRef.value?.setChecked(code, true, false)
          }
        })
      }
    })
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 监听搜索
watch(searchText, (val) => {
  treeRef.value?.filter(val)
})

// 过滤节点
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value) || data.code.includes(value)
}

// 处理 checkbox 选择
const handleCheck = () => {
  // 获取当前选中的 keys（包括半选中的）
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []
  
  // 合并所有选中的权限
  const allSelectedPermissions = [...new Set([...checkedKeys, ...halfCheckedKeys])]
  
  // 更新全选状态：检查是否选中了所有按钮权限
  const allButtonCodes = getAllButtonCodes(permissionTree.value)
  const isAllButtonsSelected = allButtonCodes.every(code => checkedKeys.includes(code))
  
  // 如果选中了所有按钮权限，则设置为 'all' 权限
  if (isAllButtonsSelected) {
    selectedPermissions.value = ['all']
    selectAll.value = true
  } else {
    selectedPermissions.value = allSelectedPermissions
    selectAll.value = false
  }
}

// 全选/取消全选
const handleSelectAll = (checked) => {
  if (checked) {
    // 全选时只设置 'all' 权限，不选中所有按钮
    selectedPermissions.value = ['all']
    selectAll.value = true
    
    // 更新树的选中状态：选中所有按钮权限
    const allButtonCodes = getAllButtonCodes(permissionTree.value)
    allButtonCodes.forEach(code => {
      treeRef.value?.setChecked(code, true, false)
    })
  } else {
    // 取消全选时清空所有权限
    selectedPermissions.value = []
    selectAll.value = false
    
    // 更新树的选中状态
    treeRef.value?.setCheckedKeys([])
  }
}

// 获取所有按钮权限代码
const getAllButtonCodes = (tree) => {
  const codes = []
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'button') {
        codes.push(node.code)
      }
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  traverse(tree)
  return codes
}

// 展开全部
const expandAll = () => {
  const expandNode = (nodes) => {
    nodes.forEach(node => {
      treeRef.value.store.nodesMap[node.code].expanded = true
      if (node.children) {
        expandNode(node.children)
      }
    })
  }
  expandNode(permissionTree.value)
}

// 收起全部
const collapseAll = () => {
  const collapseNode = (nodes) => {
    nodes.forEach(node => {
      treeRef.value.store.nodesMap[node.code].expanded = false
      if (node.children) {
        collapseNode(node.children)
      }
    })
  }
  collapseNode(permissionTree.value)
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  searchText.value = ''
}

// 保存权限
const handleSave = async () => {
  loading.value = true
  try {
    // 验证权限数据
    const validationErrors = validatePermissions(selectedPermissions.value, permissionTree.value)
    if (validationErrors.length > 0) {
      ElMessage.error(`权限验证失败：${validationErrors.join('，')}`)
      return
    }
    
    // 如果选择了 'all' 权限，则只保存 'all'，不保存其他权限
    const finalPermissions = selectedPermissions.value.includes('all') 
      ? ['all'] 
      : selectedPermissions.value
    
    emit('save', {
      roleId: props.roleId,
      permissions: finalPermissions
    })
    
    ElMessage.success('权限分配成功')
    handleClose()
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 根据 code 查找节点
const findNodeByCode = (nodes, code) => {
  for (const node of nodes) {
    if (node.code === code) {
      return node
    }
    if (node.children) {
      const found = findNodeByCode(node.children, code)
      if (found) return found
    }
  }
  return null
}

// 验证权限数据
const validatePermissions = (permissions, permissionTree) => {
  const errors = []
  const allValidCodes = getAllCodes(permissionTree)
  
  // 检查权限代码有效性
  permissions.forEach(code => {
    if (code !== 'all' && !allValidCodes.includes(code)) {
      errors.push(`无效的权限代码: ${code}`)
    }
  })
  
  // 检查权限冲突：如果包含 'all'，则不能包含其他权限
  if (permissions.includes('all') && permissions.length > 1) {
    errors.push('选择 "all" 权限时不能选择其他权限')
  }
  
  return errors
}

// 获取所有权限代码（包括菜单和按钮）
const getAllCodes = (tree) => {
  const codes = []
  const traverse = (nodes) => {
    for (const node of nodes) {
      codes.push(node.code)
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  traverse(tree)
  return codes
}
</script>

<style scoped>
.permission-dialog-container {
  .search-box {
    margin-bottom: 15px;
  }

  .permission-tree-container {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 15px;

    :deep(.el-tree) {
      background: transparent;
      
      .el-tree-node__content {
        height: auto;
        padding: 5px 0;
      }
    }

    :deep(.el-checkbox) {
      display: flex;
      align-items: flex-start;
      
      .el-checkbox__label {
        line-height: 1.5;
        padding-left: 8px;
      }
    }

    .tree-node-label {
      display: flex;
      align-items: center;
      font-size: 13px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid #e4e7ed;

    .quick-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stats {
      font-size: 13px;
      color: #606266;
    }
  }

  .dialog-footer-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
