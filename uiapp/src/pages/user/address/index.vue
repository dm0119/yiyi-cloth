<template>
  <view class="container">
    <view class="address-list" v-if="addresses.length > 0">
      <van-cell-group>
        <van-cell
          v-for="address in addresses"
          :key="address.id"
          class="address-item"
          @click="handleAddressClick(address)"
        >
          <view class="address-info">
            <view class="address-header">
              <text class="consignee">{{ address.name }}</text>
              <text class="phone">{{ address.phone }}</text>
              <van-tag size="small" color="#1989fa" v-if="address.is_default">默认</van-tag>
            </view>
            <text class="full-address">{{ address.address }}</text>
          </view>
          <view class="address-actions" v-if="!selectMode">
            <van-button
              type="primary"
              size="small"
              plain
              @click.stop="setDefault(address)"
              v-if="!address.is_default"
            >设为默认</van-button>
            <van-button
              type="warning"
              size="small"
              plain
              @click.stop="editAddress(address)"
            >编辑</van-button>
            <van-button
              type="danger"
              size="small"
              plain
              @click.stop="handleDeleteAddress(address)"
            >删除</van-button>
          </view>
          <van-icon 
            v-else 
            name="checked" 
            size="20" 
            color="#1989fa"
            v-if="selectedAddressId === address.id"
          />
        </van-cell>
      </van-cell-group>
    </view>

    <view class="empty-state" v-else>
      <van-icon name="location-o" size="100" color="#c8c9cc" />
      <text class="empty-text">暂无收货地址</text>
    </view>

    <van-button
      type="primary"
      round
      class="add-btn"
      @click="addAddress"
    >
      <van-icon name="plus" />
      新增地址
    </van-button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { getAddresses, deleteAddress as deleteAddressApi, setDefaultAddress } from '../../../services/api'

const addresses = ref([])
const selectMode = ref(false)
const selectedAddressId = ref(null)

// 获取当前登录用户 ID
function getCurrentUserId() {
  const userInfo = uni.getStorageSync('userInfo')
  return userInfo && userInfo.id
}

// 加载地址列表
async function loadAddresses() {
  try {
    const response = await getAddresses()
    if (response.success) {
      addresses.value = response.data
    } else {
      uni.showToast({
        title: response.message || '获取地址失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载地址失败:', error)
    const errorMessage = error.message || '网络错误'
    
    if (errorMessage.includes('用户 ID 不能为空') || errorMessage.includes('请先登录')) {
      uni.showModal({
        title: '提示',
        content: '请先登录后再查看地址',
        showCancel: false,
        success: () => {
          uni.navigateTo({
            url: '/pages/user/login'
          })
        }
      })
    } else {
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
    }
  }
}

// 处理地址点击
function handleAddressClick(address) {
  if (selectMode.value) {
    // 选择模式，将地址数据存储到全局数据
    const app = getApp()
    if (app) {
      app.globalData = app.globalData || {}
      app.globalData.selectedAddress = address
    }
    uni.navigateBack({
      delta: 1
    })
  } else {
    // 编辑模式
    editAddress(address)
  }
}

// 新增地址
function addAddress() {
  const userId = uni.getStorageSync('userId')
  if (!userId) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再添加地址',
      showCancel: false,
      success: () => {
        uni.navigateTo({
          url: '/pages/user/login'
        })
      }
    })
    return
  }
  
  if (selectMode.value) {
    // 选择模式下，跳转到新增页面，添加成功后返回
    uni.navigateTo({
      url: `/pages/user/address/add?selectMode=true`
    })
  } else {
    uni.navigateTo({
      url: '/pages/user/address/add'
    })
  }
}

// 编辑地址
function editAddress(address) {
  if (selectMode.value) {
    uni.navigateTo({
      url: `/pages/user/address/edit?id=${address.id}&selectMode=true`
    })
  } else {
    uni.navigateTo({
      url: `/pages/user/address/edit?id=${address.id}`
    })
  }
}

// 设置默认地址
async function setDefault(address) {
  try {
    const response = await setDefaultAddress(address.id)
    if (response.success) {
      uni.showToast({
        title: '设置成功',
        icon: 'success'
      })
      // 重新加载地址列表
      await loadAddresses()
    } else {
      uni.showToast({
        title: '设置失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  }
}

// 删除地址
async function handleDeleteAddress(address) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await deleteAddressApi(address.id)
          if (response.success) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            // 重新加载地址列表
            await loadAddresses()
          } else {
            uni.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 处理页面加载参数
onLoad((options) => {
  if (options.selectMode === 'true') {
    selectMode.value = true
    if (options.selectedAddressId) {
      selectedAddressId.value = parseInt(options.selectedAddressId)
    }
  }
})

onShow(() => {
  loadAddresses()
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}



.address-list {
  padding: 10px;
}

.address-item {
  margin-bottom: 10px;
  padding: 15px;
  background-color: #fff;
}

.address-info {
  margin-bottom: 10px;
  text-align: left;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
}

.consignee {
  font-size: 16px;
  font-weight: bold;
}

.phone {
  font-size: 14px;
  color: #666;
}

.full-address {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  text-align: left;
}

.address-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
}

.empty-text {
  margin-top: 20px;
  color: #999;
  font-size: 14px;
}

.add-btn {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
}
</style>
