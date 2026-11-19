<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">选择提现银行卡</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 提现金额展示 -->
    <view class="amount-display">
      <text class="label">提现金额</text>
      <text class="amount">¥{{ amount }}</text>
    </view>

    <!-- 银行卡列表 -->
    <view class="bank-section">
      <view class="section-header">
        <text class="section-title">选择银行卡</text>
        <text class="add-btn" @click="checkAndAddBank">+ 添加新卡</text>
      </view>

      <view class="bank-list">
        <view
          class="bank-item"
          v-for="(bank, index) in bankList"
          :key="index"
          :class="{ selected: selectedBankIndex === index }"
          @click="selectBank(index)"
        >
          <view class="bank-logo" :style="{ background: bank.color }">
            <text class="bank-icon">🏦</text>
          </view>
          <view class="bank-info">
            <text class="bank-name">{{ bank.name }}</text>
            <text class="bank-cardNo">{{ bank.cardNo }}</text>
            <text class="bank-balance">余额：¥{{ (bank.balance || 0).toFixed(2) }}</text>
          </view>
          <view class="bank-actions">
            <text class="remove-btn" @click.stop="removeBank(index, bank.id)">移除</text>
          </view>
          <view class="check-icon" v-if="selectedBankIndex === index">✓</view>
        </view>
      </view>
    </view>

    <!-- 底部确认按钮 -->
    <view class="bottom-bar">
      <button class="confirm-btn" :class="{ disabled: selectedBankIndex === -1 }" @click="handleWithdraw">
        确认提现
      </button>
    </view>

    <!-- 支付密码弹窗 -->
    <view class="password-modal-mask" v-if="showPasswordModal" @touchmove.stop.prevent="return"></view>
    <view class="password-modal-container" v-if="showPasswordModal">
      <!-- 密码输入显示区 -->
      <view class="password-display-area">
        <view class="password-header">
          <text class="password-title">输入银行卡密码</text>
          <text class="password-close" @click="closePasswordModal">✕</text>
        </view>
        <view class="password-inputs">
          <view 
            class="password-dot" 
            v-for="i in 6" 
            :key="i"
            :class="{ filled: i <= bankPassword.length }"
          ></view>
        </view>
        <view class="password-tips">请输入 6 位数字密码</view>
      </view>

      <!-- 9 宫格数字键盘 -->
      <view class="number-keyboard">
        <view class="keyboard-row">
          <view class="key-item" @click="inputNumber('1')">1</view>
          <view class="key-item" @click="inputNumber('2')">2</view>
          <view class="key-item" @click="inputNumber('3')">3</view>
        </view>
        <view class="keyboard-row">
          <view class="key-item" @click="inputNumber('4')">4</view>
          <view class="key-item" @click="inputNumber('5')">5</view>
          <view class="key-item" @click="inputNumber('6')">6</view>
        </view>
        <view class="keyboard-row">
          <view class="key-item" @click="inputNumber('7')">7</view>
          <view class="key-item" @click="inputNumber('8')">8</view>
          <view class="key-item" @click="inputNumber('9')">9</view>
        </view>
        <view class="keyboard-row">
          <view class="key-item empty"></view>
          <view class="key-item" @click="inputNumber('0')">0</view>
          <view class="key-item delete-btn" @click="deleteNumber">⌫</view>
        </view>
      </view>
    </view>

    <!-- 添加银行卡弹窗 -->
    <view class="modal-mask" v-if="showAddBank" @click="showAddBank = false"></view>
    <view class="modal-container" v-if="showAddBank">
      <view class="modal-header">
        <text class="modal-title">添加银行卡</text>
        <text class="modal-close" @click="showAddBank = false">✕</text>
      </view>
      <scroll-view scroll-y class="modal-body">
        <view class="modal-form">
          <view class="form-item">
            <text class="form-label">银行卡号</text>
            <input class="form-input" v-model="newBank.cardNo" placeholder="请输入银行卡号" :maxlength="19" type="number" />
          </view>
          <view class="form-item">
            <text class="form-label">持卡人姓名</text>
            <input class="form-input" v-model="newBank.holderName" placeholder="请输入持卡人姓名" :maxlength="20" />
          </view>
          <view class="form-item">
            <text class="form-label">银行名称</text>
            <picker :range="bankOptions" @change="onBankChange">
              <view class="form-picker">
                <text :class="{ placeholder: !newBank.bankName }">{{ newBank.bankName || '请选择银行' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">银行卡密码</text>
            <input class="form-input" v-model="newBank.password" placeholder="请输入 6 位数字密码" :maxlength="6" type="number" />
          </view>
          <view class="form-item">
            <text class="form-label">初始余额（测试用）</text>
            <input class="form-input" v-model="newBank.balance" placeholder="请输入初始余额" type="digit" />
          </view>
        </view>
      </scroll-view>
      <view class="modal-footer">
        <button class="modal-btn cancel-btn" @click="showAddBank = false">取消</button>
        <button class="modal-btn confirm-btn" @click="handleAddBank">确定添加</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      amount: '',
      selectedBankIndex: -1,
      showAddBank: false,
      showPasswordModal: false,
      paymentPassword: '',
      bankList: [],
      bankOptions: ['工商银行', '建设银行', '招商银行', '农业银行', '中国银行', '交通银行'],
      newBank: {
        cardNo: '',
        holderName: '',
        bankName: '',
        bankCode: '',
        password: '',
        balance: ''
      },
      bankPassword: '' // 提现时输入的银行卡密码
    }
  },
  onLoad(options) {
    this.amount = options.amount || '0'
    // 加载用户银行卡列表
    this.loadBankCards()
  },
  methods: {
    // 检查并添加银行卡（限制最多 5 张）
    checkAndAddBank() {
      if (this.bankList.length >= 5) {
        uni.showToast({
          title: '最多只能添加 5 张银行卡',
          icon: 'none'
        })
        return
      }
      this.showAddBank = true
    },
    // 移除银行卡
    async removeBank(index, bankId) {
      try {
        const res = await uni.request({
          url: `http://localhost:3000/api/wallets/banks/${bankId}`,
          method: 'DELETE',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('userToken')}`
          }
        })
        
        let responseData
        if (Array.isArray(res)) {
          const [error, response] = res
          if (error) throw error
          responseData = response.data
        } else if (res && res.data) {
          responseData = res.data
        }
        
        if (responseData && responseData.success) {
          this.bankList.splice(index, 1)
          if (this.selectedBankIndex === index) {
            this.selectedBankIndex = -1
          }
          uni.showToast({
            title: '移除成功',
            icon: 'success'
          })
        } else {
          throw new Error('移除失败')
        }
      } catch (error) {
        console.error('移除银行卡失败:', error)
        // 如果只是前端测试，也从列表中移除
        this.bankList.splice(index, 1)
        if (this.selectedBankIndex === index) {
          this.selectedBankIndex = -1
        }
        uni.showToast({
          title: '移除成功',
          icon: 'success'
        })
      }
    },
    // 加载银行卡列表
    async loadBankCards() {
      try {
        const res = await uni.request({
          url: 'http://localhost:3000/api/wallets/banks/list',
          method: 'GET',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('userToken')}`
          }
        })

        console.log('请求响应:', res)
        
        // 适配不同端的返回格式
        let responseData
        if (Array.isArray(res)) {
          const [error, response] = res
          if (error) throw error
          responseData = response.data
        } else if (res && res.data) {
          responseData = res.data
        } else {
          throw new Error('响应格式异常')
        }

        if (responseData && responseData.success) {
          const bankCards = responseData.data || []
          // 格式化银行卡数据
          this.bankList = bankCards.map(card => ({
            id: card.id,
            name: card.bank_name,
            cardNo: card.card_no,
            cardNoFull: card.card_no_full,
            color: this.getBankColor(card.bank_name),
            bankCode: card.bank_code,
            password: '' // 密码不存储在前端
          }))
        } else {
          console.error('响应数据异常:', responseData)
          throw new Error('响应数据异常')
        }
      } catch (error) {
        console.error('加载银行卡列表失败:', error)
        // 如果加载失败，使用默认数据
        if (this.bankList.length === 0) {
          this.bankList = [
            {
              name: '工商银行',
              cardNo: '6222 **** **** 1234',
              color: '#e53935',
              bankCode: 'ICBC',
              password: '123456'
            },
            {
              name: '建设银行',
              cardNo: '6227 **** **** 5678',
              color: '#1976d2',
              bankCode: 'CCB',
              password: '123456'
            },
            {
              name: '招商银行',
              cardNo: '6225 **** **** 9012',
              color: '#d32f2f',
              bankCode: 'CMB',
              password: '123456'
            }
          ]
        }
      }
    },
    // 获取银行颜色
    getBankColor(bankName) {
      const colors = {
        '工商银行': '#e53935',
        '建设银行': '#1976d2',
        '招商银行': '#d32f2f',
        '农业银行': '#2e7d32',
        '中国银行': '#c62828',
        '交通银行': '#0288d1'
      }
      return colors[bankName] || '#667eea'
    },
    goBack() {
      try {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          uni.navigateBack()
        } else {
          uni.switchTab({
            url: '/pages/user/index'
          })
        }
      } catch (e) {
        uni.switchTab({
          url: '/pages/user/index'
        })
      }
    },
    selectBank(index) {
      this.selectedBankIndex = index
    },
    onBankChange(e) {
      const index = e.detail.value
      this.newBank.bankName = this.bankOptions[index]
      this.newBank.bankCode = this.bankOptions[index].toUpperCase().substring(0, 4)
    },
    async handleAddBank() {
      if (!this.newBank.cardNo || !this.newBank.holderName || !this.newBank.bankName) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      if (!this.newBank.password || this.newBank.password.length !== 6) {
        uni.showToast({
          title: '请输入 6 位数字密码',
          icon: 'none'
        })
        return
      }

      try {
        // 调用后端 API 保存银行卡
        const res = await uni.request({
          url: 'http://localhost:3000/api/wallets/banks/add',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${uni.getStorageSync('userToken')}`
          },
          data: {
            user_id: parseInt(uni.getStorageSync('userId') || '1'),
            card_no: this.newBank.cardNo,
            bank_name: this.newBank.bankName,
            bank_code: this.newBank.bankCode || '',
            holder_name: this.newBank.holderName,
            password: this.newBank.password,
            balance: this.newBank.balance ? parseFloat(this.newBank.balance) : 0
          }
        })

        console.log('添加银行卡响应:', res)

        // 适配不同端的返回格式
        let responseData
        if (Array.isArray(res)) {
          const [error, response] = res
          if (error) throw error
          responseData = response.data
        } else if (res && res.data) {
          responseData = res.data
        } else {
          throw new Error('响应格式异常')
        }

        if (responseData && responseData.success) {
          // 重新加载银行卡列表
          await this.loadBankCards()
          this.newBank = { cardNo: '', holderName: '', bankName: '', bankCode: '', password: '', balance: '' }
          this.showAddBank = false

          uni.showToast({
            title: '添加成功',
            icon: 'success'
          })
        } else {
          throw new Error(responseData?.message || '添加失败')
        }
      } catch (error) {
        console.error('添加银行卡失败:', error)
        uni.showToast({
          title: error.message || '添加失败，请重试',
          icon: 'none'
        })
      }
    },
    handleWithdraw() {
      if (this.selectedBankIndex === -1) {
        uni.showToast({
          title: '请选择银行卡',
          icon: 'none'
        })
        return
      }

      this.showPasswordModal = true
      this.bankPassword = ''
    },
    inputNumber(num) {
      if (this.bankPassword.length < 6) {
        this.bankPassword += num
        if (this.bankPassword.length === 6) {
          setTimeout(() => {
            this.confirmPayment()
          }, 300)
        }
      }
    },
    deleteNumber() {
      if (this.bankPassword.length > 0) {
        this.bankPassword = this.bankPassword.slice(0, -1)
      }
    },
    closePasswordModal() {
      this.showPasswordModal = false
      this.bankPassword = ''
    },
    async confirmPayment() {
      if (!this.bankPassword || this.bankPassword.length !== 6) {
        uni.showToast({
          title: '请输入 6 位数字密码',
          icon: 'none'
        })
        return
      }

      const selectedBank = this.bankList[this.selectedBankIndex]
      
      try {
        // 调用后端 API 验证银行卡密码并提现
        const res = await uni.request({
          url: 'http://localhost:3000/api/wallets/withdraw-to-bank',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${uni.getStorageSync('userToken')}`
          },
          data: {
            amount: parseFloat(this.amount),
            bank_id: selectedBank.id,
            password: this.bankPassword,
            description: `提现到${selectedBank.name}`
          }
        })

        console.log('提现响应:', res)
        
        let responseData
        if (Array.isArray(res)) {
          const [error, response] = res
          if (error) throw error
          responseData = response.data
        } else if (res && res.data) {
          responseData = res.data
        } else {
          throw new Error('响应格式异常')
        }

        if (responseData && responseData.success) {
          // 密码验证成功，跳转到处理页面
          this.showPasswordModal = false
          this.bankPassword = ''
          
          uni.navigateTo({
            url: `/pages/user/wallet/withdraw-processing?amount=${this.amount}&bankIndex=${this.selectedBankIndex}`
          })
        } else {
          throw new Error(responseData?.message || '密码错误或提现失败')
        }
      } catch (error) {
        console.error('提现失败:', error)
        uni.showToast({
          title: error.message || '密码错误或提现失败',
          icon: 'none'
        })
        this.bankPassword = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
  padding-top: 88rpx;
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  z-index: 1000;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.nav-placeholder {
  width: 60rpx;
  height: 60rpx;
}

.amount-display {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 60rpx 40rpx;
  text-align: center;
  color: #333;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.amount-display .label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
}

.amount-display .amount {
  font-size: 72rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.bank-section {
  background: #fff;
  margin-top: 30rpx;
  padding: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.add-btn {
  font-size: 26rpx;
  color: #4a90e2;
}

.bank-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.bank-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  border: 3rpx solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.bank-item.selected {
  border-color: #4a90e2;
  background: #e8f4ff;
}

.bank-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.bank-icon {
  font-size: 40rpx;
}

.bank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bank-name {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.bank-cardNo {
  font-size: 26rpx;
  color: #999;
}

.bank-balance {
  font-size: 24rpx;
  color: #4a90e2;
  font-weight: 600;
  margin-top: 4rpx;
}

.bank-actions {
  position: absolute;
  right: 120rpx;
  top: 50%;
  transform: translateY(-50%);
}

.remove-btn {
  font-size: 24rpx;
  color: #ff4444;
  padding: 8rpx 16rpx;
  background: #fff;
  border-radius: 8rpx;
  border: 1rpx solid #ff4444;
}

.check-icon {
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.3);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 30rpx 40rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.confirm-btn.disabled {
  background: #ccc;
  opacity: 0.6;
}

/* 密码弹窗样式 */
.password-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.password-modal-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 1001;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.password-display-area {
  padding: 40rpx 30rpx 30rpx;
  background: #f8f9fa;
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.password-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.password-close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.password-inputs {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.password-dot {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 3rpx solid #ddd;
  background: #fff;
  transition: all 0.2s ease;
}

.password-dot.filled {
  background: #333;
  border-color: #333;
}

.password-tips {
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

/* 9 宫格数字键盘 */
.number-keyboard {
  background: #f5f5f5;
  padding: 20rpx;
}

.keyboard-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.key-item {
  flex: 1;
  margin: 0 10rpx;
  height: 100rpx;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #333;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
}

.key-item:active {
  background: #e0e0e0;
  transform: scale(0.95);
}

.key-item.empty {
  background: transparent;
  box-shadow: none;
}

.key-item.delete-btn {
  background: #ff6b6b;
  color: #fff;
  font-size: 36rpx;
}

.key-item.delete-btn:active {
  background: #ee5a5a;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  padding: 20rpx 0;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.form-input {
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 30rpx;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.placeholder {
  color: #999;
}

.picker-arrow {
  font-size: 32rpx;
  color: #ccc;
}

/* 自定义弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  z-index: 1001;
  animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 40rpx;
  max-height: 800rpx;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-btn:first-child {
  margin-right: 20rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: #fff;
}
</style>
