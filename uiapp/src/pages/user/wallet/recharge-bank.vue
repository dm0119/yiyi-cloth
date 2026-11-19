<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">选择银行卡</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 充值金额展示 -->
    <view class="amount-display">
      <text class="label">充值金额</text>
      <text class="amount">¥{{ amount }}</text>
    </view>

    <!-- 银行卡列表 -->
    <view class="bank-section">
      <view class="section-header">
        <text class="section-title">选择银行卡</text>
        <text class="add-btn" @click="showAddBank = true">+ 添加新卡</text>
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
          </view>
          <view class="bank-actions">
            <view class="check-icon" v-if="selectedBankIndex === index">✓</view>
            <view class="delete-icon" @click.stop="deleteBank(index)">🗑</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部确认按钮 -->
    <view class="bottom-bar">
      <button class="confirm-btn" :class="{ disabled: selectedBankIndex === -1 }" @click="handleRecharge">
        确认充值
      </button>
    </view>

    <!-- 支付密码弹窗 -->
    <view class="password-modal-mask" v-if="showPasswordModal" @touchmove.stop.prevent="return"></view>
    <view class="password-modal-container" v-if="showPasswordModal">
      <!-- 密码输入显示区 -->
      <view class="password-display-area">
        <view class="password-header">
          <text class="password-title">输入支付密码</text>
          <text class="password-close" @click="closePasswordModal">✕</text>
        </view>
        <view class="password-inputs">
          <view 
            class="password-dot" 
            v-for="i in 6" 
            :key="i"
            :class="{ filled: i <= paymentPassword.length }"
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

    <!-- 余额不足提示弹窗 -->
    <view class="balance-error-modal-mask" v-if="showBalanceErrorModal">
      <view class="balance-error-modal-content">
        <view class="error-icon">⚠️</view>
        <view class="error-title">余额不足</view>
        <view class="error-message">
          <text>当前银行卡余额：¥{{ currentBalance.toFixed(2) }}</text>
          <text>充值金额：¥{{ rechargeAmount.toFixed(2) }}</text>
          <text class="error-tip">请先向银行卡存入足够金额后再充值</text>
        </view>
        <view class="error-footer">
          <button class="error-confirm-btn" @click="showBalanceErrorModal = false">知道了</button>
        </view>
      </view>
    </view>

    <!-- 添加银行卡弹窗 -->
    <view class="add-bank-modal-mask" v-if="showAddBank">
      <view class="add-bank-modal-content">
        <view class="modal-header">
          <text class="modal-title">添加银行卡</text>
          <text class="modal-close" @click="showAddBank = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">银行卡号</text>
            <input
              class="form-input"
              v-model="newBank.cardNo"
              placeholder="请输入银行卡号（16-19 位）"
              :maxlength="19"
              type="text"
            />
          </view>

          <view class="form-item">
            <text class="form-label">持卡人姓名</text>
            <input
              class="form-input"
              v-model="newBank.holderName"
              placeholder="请输入持卡人姓名"
              :maxlength="20"
              type="text"
            />
          </view>

          <view class="form-item">
            <text class="form-label">银行名称</text>
            <view class="bank-selector">
              <view 
                class="bank-option" 
                v-for="(bank, index) in bankOptions" 
                :key="index"
                :class="{ selected: newBank.bankName === bank }"
                @click="selectBankOption(bank)"
              >
                <text>{{ bank }}</text>
                <text class="check-icon" v-if="newBank.bankName === bank">✓</text>
              </view>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">银行卡密码</text>
            <input
              class="form-input"
              v-model="newBank.password"
              placeholder="请输入 6 位数字密码"
              :maxlength="6"
              type="number"
            />
          </view>

          <view class="form-item">
            <text class="form-label">初始余额</text>
            <input
              class="form-input"
              v-model="newBank.balance"
              placeholder="请输入初始金额（可选）"
              type="digit"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="showAddBank = false">取消</button>
          <button class="confirm-btn" @click="handleAddBank">确定添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      amount: '',
      method: 'bank',
      selectedBankIndex: -1,
      showAddBank: false,
      showPasswordModal: false,
      showBalanceErrorModal: false,
      paymentPassword: '',
      currentBalance: 0,
      rechargeAmount: 0,
      bankList: [],
      bankOptions: ['工商银行', '建设银行', '招商银行', '农业银行', '中国银行', '交通银行'],
      newBank: {
        cardNo: '',
        holderName: '',
        bankName: '',
        bankCode: '',
        password: '',
        balance: ''
      }
    }
  },
  onLoad(options) {
    if (options.amount) {
      this.amount = options.amount
    }
    // 加载用户银行卡列表
    this.loadBankCards()
  },
  methods: {
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

        // 在 H5 端，uni.request 返回的是 [error, response] 还是 {statusCode, data} 需要验证
        console.log('请求响应:', res)
        
        // 适配不同端的返回格式
        let responseData
        if (Array.isArray(res)) {
          // 如果是数组格式 [error, response]
          const [error, response] = res
          if (error) throw error
          responseData = response.data
        } else if (res && res.data) {
          // 如果是对象格式 {statusCode, data}
          responseData = res.data
        } else {
          throw new Error('响应格式异常')
        }

        if (responseData && responseData.success) {
          const bankCards = responseData.data || []
          console.log('后端返回的原始数据:', bankCards);
          
          // 格式化银行卡数据
          this.bankList = bankCards.map(card => ({
            id: card.id,
            name: card.bank_name,
            cardNo: card.card_no,
            cardNoFull: card.card_no_full,
            color: this.getBankColor(card.bank_name),
            bankCode: card.bank_code,
            balance: parseFloat(card.balance || 0), // 包含余额字段
            password: card.password || '' // 从后端获取密码用于验证
          }))
          
          console.log('格式化后的银行卡列表:', this.bankList);
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
    async deleteBank(index) {
      const bank = this.bankList[index]
      
      try {
        const res = await uni.request({
          url: `http://localhost:3000/api/wallets/banks/${bank.id}`,
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
        } else {
          throw new Error('响应格式异常')
        }

        if (responseData && responseData.success) {
          this.bankList.splice(index, 1)
          if (this.selectedBankIndex === index) {
            this.selectedBankIndex = -1
          }
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } else {
          throw new Error(responseData?.message || '删除失败')
        }
      } catch (error) {
        console.error('删除银行卡失败:', error)
        uni.showToast({
          title: error.message || '删除失败，请重试',
          icon: 'none'
        })
      }
    },
    selectBankOption(bankName) {
      this.newBank.bankName = bankName
      this.newBank.bankCode = bankName.toUpperCase().substring(0, 4)
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
          // 添加到本地列表
          const maskedCardNo = this.newBank.cardNo.replace(/(\d{4})\d+(\d{4})/, '$1 **** $2')
          this.bankList.push({
            name: this.newBank.bankName,
            cardNo: maskedCardNo,
            color: this.getBankColor(this.newBank.bankName),
            bankCode: this.newBank.bankCode,
            password: this.newBank.password
          })

          this.selectedBankIndex = this.bankList.length - 1
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
    handleRecharge() {
      if (this.selectedBankIndex === -1) {
        uni.showToast({
          title: '请选择银行卡',
          icon: 'none'
        })
        return
      }

      this.showPasswordModal = true
      this.paymentPassword = ''
    },
    inputNumber(num) {
      if (this.paymentPassword.length < 6) {
        this.paymentPassword += num
        // 输入完成后自动验证
        if (this.paymentPassword.length === 6) {
          setTimeout(() => {
            this.confirmPayment()
          }, 300)
        }
      }
    },
    deleteNumber() {
      if (this.paymentPassword.length > 0) {
        this.paymentPassword = this.paymentPassword.slice(0, -1)
      }
    },
    closePasswordModal() {
      this.showPasswordModal = false
      this.paymentPassword = ''
    },
    confirmPayment() {
      if (!this.paymentPassword || this.paymentPassword.length !== 6) {
        uni.showToast({
          title: '请输入 6 位数字密码',
          icon: 'none'
        })
        return
      }

      const selectedBank = this.bankList[this.selectedBankIndex]
      console.log('=== 密码验证调试 ===');
      console.log('输入的密码:', this.paymentPassword, '类型:', typeof this.paymentPassword);
      console.log('银行卡密码:', selectedBank.password, '类型:', typeof selectedBank.password);
      console.log('密码是否匹配:', this.paymentPassword === selectedBank.password);
      
      if (this.paymentPassword !== selectedBank.password) {
        uni.showToast({
          title: '密码错误，请重试',
          icon: 'none'
        })
        this.paymentPassword = ''
        return
      }

      // 验证银行卡初始余额是否足够充值
      const rechargeAmount = parseFloat(this.amount)
      const bankBalance = parseFloat(selectedBank.balance || 0)
      
      if (bankBalance < rechargeAmount) {
        // 显示余额不足弹窗
        this.currentBalance = bankBalance
        this.rechargeAmount = rechargeAmount
        this.showBalanceErrorModal = true
        this.showPasswordModal = false
        this.paymentPassword = ''
        return
      }

      this.showPasswordModal = false
      this.paymentPassword = ''

      uni.navigateTo({
        url: `/pages/user/wallet/recharge-processing?amount=${this.amount}&bankIndex=${this.selectedBankIndex}&bankBalance=${bankBalance}`
      })
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

.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
  padding-top: 88rpx;
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
  opacity: 0.9;
}

.amount-display .amount {
  font-size: 64rpx;
  font-weight: bold;
  display: block;
  margin-top: 20rpx;
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
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.add-btn {
  font-size: 28rpx;
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
  border-radius: 12rpx;
  border: 2rpx solid transparent;
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

.bank-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
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

.delete-icon {
  width: 40rpx;
  height: 40rpx;
  background: #fff;
  border: 2rpx solid #ff6b6b;
  color: #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  transition: all 0.2s ease;
}

.delete-icon:active {
  background: #ff6b6b;
  color: #fff;
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

.password-input-wrapper {
  padding: 20rpx 0;
}

.password-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 36rpx;
  text-align: center;
  letter-spacing: 8rpx;
}

.password-tips {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
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
  margin-bottom: 30rpx;
}

.form-item:last-child {
  margin-bottom: 0;
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
  border: 2rpx solid transparent;
  transition: all 0.2s ease;
  height: 88rpx;
  box-sizing: border-box;
  width: 100%;
}

.form-input:focus {
  background: #fff;
  border-color: #4a90e2;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  height: 88rpx;
  box-sizing: border-box;
}

/* 银行选择器样式 */
.bank-selector {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 16rpx;
  max-height: 400rpx;
  overflow-y: auto;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.bank-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  transition: all 0.2s ease;
  border: 2rpx solid transparent;
}

.bank-option:active {
  background: #f0f0f0;
}

.bank-option.selected {
  background: #e8f4ff;
  border-color: #4a90e2;
  color: #4a90e2;
}

.bank-option .check-icon {
  color: #4a90e2;
  font-size: 32rpx;
  font-weight: bold;
}

.placeholder {
  color: #999;
}

.picker-arrow {
  font-size: 32rpx;
  color: #ccc;
}

.form-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  line-height: 1.4;
}

/* 余额不足提示弹窗样式 - 最高优先级 */
.balance-error-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.balance-error-modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-100rpx) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.error-icon {
  font-size: 100rpx;
  text-align: center;
  margin-top: 60rpx;
  margin-bottom: 20rpx;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10rpx); }
  75% { transform: translateX(10rpx); }
}

.error-title {
  font-size: 40rpx;
  color: #ff6b6b;
  text-align: center;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.error-message {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 0 60rpx 40rpx;
  align-items: center;
}

.error-message text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.error-message .error-tip {
  color: #ff6b6b;
  font-weight: bold;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  width: 100%;
  text-align: center;
}

.error-footer {
  padding: 30rpx 60rpx 60rpx;
}

.error-confirm-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.4);
}

.error-confirm-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 添加银行卡弹窗样式 */
.add-bank-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-bank-modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
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
  line-height: 1;
}

.modal-body {
  padding: 40rpx;
  max-height: 60vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-footer {
  display: flex;
  padding: 30rpx 40rpx;
  gap: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  line-height: 0;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn::after {
  border: none;
}

.confirm-btn {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.confirm-btn::after {
  border: none;
}
</style>
