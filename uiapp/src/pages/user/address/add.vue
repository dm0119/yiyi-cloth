<template>
  <view class="container">
    <view class="header">
      <van-button
        type="default"
        plain
        @click="goBack"
      >
        <van-icon name="arrow-left" />
      </van-button>
      <text class="title">新增地址</text>
      <van-button
        type="primary"
        plain
        @click="saveAddress"
      >
        保存
      </van-button>
    </view>

    <van-cell-group class="form-group">
      <van-field
        v-model="form.name"
        placeholder="请输入收货人姓名"
        label="收货人"
        required
      />
      <van-field
        v-model="form.phone"
        placeholder="请输入手机号码"
        label="手机号"
        type="tel"
        maxlength="11"
        required
      />
      
      <van-cell
        title="省市区"
        :value="regionText"
        is-link
        @click="showRegionPicker = true"
        placeholder="请选择省市区"
        required
      />
      
      <van-field
        v-model="form.detailAddress"
        placeholder="请输入详细地址（街道、门牌号等）"
        label="详细地址"
        type="textarea"
        :rows="3"
        required
      />
      
      <van-cell title="设为默认地址" />
      <van-switch
        v-model="form.isDefault"
        class="default-switch"
      />
    </van-cell-group>
    
    <!-- 省市区选择器 -->
    <van-popup
      v-model:show="showRegionPicker"
      position="bottom"
    >
      <van-picker
        title="请选择省市区"
        :columns="regionColumns"
        @confirm="onRegionConfirm"
        @cancel="showRegionPicker = false"
        @change="onRegionChange"
      />
    </van-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createAddress } from '../../../services/api'
import { provinces, getCities, getDistricts } from '../../../utils/region-data-complete-fixed'

const showRegionPicker = ref(false)
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')
const selectMode = ref(false)

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false
})

// 处理页面加载参数
onLoad((options) => {
  if (options.selectMode === 'true') {
    selectMode.value = true
  }
})

// 省市区文本显示
const regionText = computed(() => {
  const parts = []
  if (form.province) parts.push(form.province)
  if (form.city) parts.push(form.city)
  if (form.district) parts.push(form.district)
  return parts.join('') || '请选择省市区'
})

// 列数据 - 使用 ref 以便动态修改
const regionColumns = ref([
  provinces.map(p => ({ text: p.text, value: p.value })),
  [],
  []
])

// 更新列数据的函数
function updateCityColumn(provinceCode) {
  const cityOptions = getCities(provinceCode).map(c => ({ text: c.text, value: c.value }))
  
  // 强制触发响应式更新
  regionColumns.value = [
    [...regionColumns.value[0]], // 复制省份数组
    cityOptions,
    [] // 清空区县列
  ]
}

function updateDistrictColumn(cityCode) {
  const districtOptions = getDistricts(cityCode).map(d => ({ text: d.text, value: d.value }))
  
  // 强制触发响应式更新
  regionColumns.value = [
    [...regionColumns.value[0]], // 复制省份数组
    [...regionColumns.value[1]], // 复制城市数组
    districtOptions
  ]
}



// 省市区选择器变化事件
function onRegionChange(event) {
  // Vant Picker 4.x 的 change 事件传递的是对象：
  // { columnIndex, selectedValues, selectedOptions, selectedIndexes }
  const { selectedValues, selectedOptions, columnIndex } = event
  
  // 安全检查：确保 selectedValues 是数组
  if (!selectedValues || !Array.isArray(selectedValues)) {
    console.log('Invalid selectedValues:', event)
    return
  }
  
  // 安全检查：确保 selectedOptions 存在且有足够长度
  if (!selectedOptions || selectedOptions.length < columnIndex + 1) {
    return
  }
  
  // 使用 selectedOptions 获取完整的选项信息，添加空值检查
  const provinceOption = selectedOptions[0]
  const cityOption = selectedOptions[1] || null
  const districtOption = selectedOptions[2] || null
  
  // 当省份变化时，更新选中的省份，并动态更新城市和区县列
  if (columnIndex === 0 && provinceOption) {
    selectedProvince.value = provinceOption.value
    selectedCity.value = ''
    selectedDistrict.value = ''
    form.province = provinceOption.text
    form.city = ''
    form.district = ''
    
    // 动态更新城市列和清空区县列
    updateCityColumn(provinceOption.value)
  }
  
  // 当城市变化时，更新选中的城市，并动态更新区县列
  if (columnIndex === 1 && cityOption) {
    selectedCity.value = cityOption.value
    selectedDistrict.value = ''
    form.city = cityOption.text
    form.district = ''
    
    // 动态更新区县列
    updateDistrictColumn(cityOption.value)
  }
  
  // 当区县变化时，更新选中的区县
  if (columnIndex === 2 && districtOption) {
    selectedDistrict.value = districtOption.value
    form.district = districtOption.text
  }
}

// 省市区确认选择
function onRegionConfirm(event) {
  // Vant Picker 4.x 的 confirm 事件传递的是 { selectedValues, selectedOptions } 对象
  const { selectedValues, selectedOptions } = event
  
  // 安全检查
  if (!selectedValues || !Array.isArray(selectedValues)) {
    console.log('Invalid selectedValues in confirm:', event)
    return
  }
  
  const province = selectedOptions[0]
  const city = selectedOptions[1]
  const district = selectedOptions[2]
  
  if (province) {
    form.province = province.text
    selectedProvince.value = province.value
  }
  if (city) {
    form.city = city.text
    selectedCity.value = city.value
  }
  if (district) {
    form.district = district.text
    selectedDistrict.value = district.value
  }
  showRegionPicker.value = false
}

// 保存地址
async function saveAddress() {
  // 表单验证
  if (!form.name || !form.phone || !form.province || !form.city || !form.district || !form.detailAddress) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  
  // 手机号格式验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(form.phone)) {
    uni.showToast({
      title: '手机号格式不正确',
      icon: 'none'
    })
    return
  }
  
  try {
    // 获取用户 ID，这里假设从本地存储中获取
    const userInfo = uni.getStorageSync('userInfo')
    const userId = userInfo.id || 1 // 默认用户 ID 为 1
    
    // 组合完整地址用于显示
    const fullAddress = `${form.province}${form.city}${form.district}${form.detailAddress}`
    
    const response = await createAddress({
      userId: userId,
      name: form.name,
      phone: form.phone,
      address: fullAddress,
      province: form.province,
      city: form.city,
      district: form.district,
      isDefault: form.isDefault
    })
    
    if (response.success) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      // 返回上一页
      setTimeout(() => {
        if (selectMode.value) {
          // 选择模式下，将地址数据存储到全局数据
          const app = getApp()
          if (app) {
            app.globalData = app.globalData || {}
            app.globalData.selectedAddress = response.data
          }
          uni.navigateBack({
            delta: 2 // 返回到订单确认页面
          })
        } else {
          uni.navigateBack()
        }
      }, 1500)
    } else {
      uni.showToast({
        title: '保存失败',
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

// 返回上一页
function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.container {
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
}

.form-group {
  margin: 20rpx;
  background: #fff;
  border-radius: 10rpx;
  overflow: hidden;
}

.default-switch {
  margin-right: 20rpx;
}
</style>