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
          <view class="remove-btn" @click.stop="removeBank(index, bank.id)">
            <text>移除</text>
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

    <!-- 添加银行卡弹窗 - 使用 uni-popup -->
    <uni-popup ref="addBankPopup" type="center" @change="onPopupChange">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">添加银行卡</text>
          <text class="popup-close" @click="closePopup">✕</text>
        </view>
        
        <view class="popup-body">
          <!-- 银行卡号 -->
          <view class="uni-form-item">
            <view class="uni-form-item__label">
              <text>银行卡号</text>
            </view>
            <view class="uni-form-item__content">
              <input 
                class="uni-input" 
                v-model="newBank.cardNo" 
                placeholder="请输入银行卡号" 
                :maxlength="19" 
                type="number"
              />
            </view>
          </view>

          <!-- 持卡人姓名 -->
          <view class="uni-form-item">
            <view class="uni-form-item__label">
              <text>持卡人姓名</text>
            </view>
            <view class="uni-form-item__content">
              <input 
                class="uni-input" 
                v-model="newBank.holderName" 
                placeholder="请输入持卡人姓名" 
                :maxlength="20"
              />
            </view>
          </view>

          <!-- 银行名称 -->
          <view class="uni-form-item">
            <view class="uni-form-item__label">
              <text>银行名称</text>
            </view>
            <view class="uni-form-item__content">
              <picker :range="bankOptions" @change="onBankChange">
                <view class="uni-input uni-picker">
                  <text :class="{ 'uni-input-placeholder': !newBank.bankName }">
                    {{ newBank.bankName || '请选择银行' }}
                  </text>
                </view>
              </picker>
            </view>
          </view>

          <!-- 银行卡密码 -->
          <view class="uni-form-item">
            <view class="uni-form-item__label">
              <text>银行卡密码</text>
            </view>
            <view class="uni-form-item__content">
              <input 
                class="uni-input" 
                v-model="newBank.password" 
                placeholder="请输入 6 位数字密码" 
                :maxlength="6" 
                type="number"
              />
            </view>
          </view>

          <!-- 初始余额 -->
          <view class="uni-form-item">
            <view class="uni-form-item__label">
              <text>初始余额（测试用）</text>
            </view>
            <view class="uni-form-item__content">
              <input 
                class="uni-input" 
                v-model="newBank.balance" 
                placeholder="请输入初始余额" 
                type="digit"
              />
            </view>
          </view>
        </view>

        <view class="popup-footer">
          <button class="popup-btn popup-btn-cancel" @click="closePopup">取消</button>
          <button class="popup-btn popup-btn-confirm" @click="handleAddBank">确定添加</button>
        </view>
      </view>
    </uni-popup>
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
      bankPassword: ''
    }
  },
  onLoad(options) {
    this.amount = options.amount || '0'
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
      this.$refs.addBankPopup.open()
    },
    // 弹窗状态变化
    onPopupChange(e) {
      this.showAddBank = e.show
    },
    // 关闭弹窗
    closePopup() {
      this.$refs.addBankPopup.close()
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
        }
      } catch (error) {
        console.error('移除银行卡失败:', error)
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

        let responseData
        if (Array.isArray(res)) {
          const [error, response] = res
          if (error) throw error
          responseData = response.data
        } else if (res && res.data) {
          responseData = res.data
        }

        if (responseData && responseData.success) {
          const bankCards = responseData.data || []
          this.bankList = bankCards.map(card => ({
            id: card.id,
            name: card.bank_name,
            cardNo: card.card_no,
            cardNoFull: card.card_no_full,
            color: this.getBankColor(card.bank_name),
            bankCode: card.bank_code,
            balance: card.balance || 0
          }))
        }
      } catch (error) {
        console.error('加载银行卡列表失败:', error)
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

        let responseData
        if (Array.isArray(res)) {
          const [error, response] = res
          if (error) throw error
          responseData = response.data
        } else if (res && res.data) {
          responseData = res.data
        }

        if (responseData && responseData.success) {
          await this.loadBankCards()
          this.newBank = { cardNo: '', holderName: '', bankName: '', bankCode: '', password: '', balance: '' }
          this.closePopup()

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

        let responseData
        if (Array.isArray(res)) {
          const [error, response] = res
          if (error) throw error
          responseData = response.data
        } else if (res && res.data) {
          responseData = res.data
        }

        if (responseData && responseData.success) {
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

.remove-btn {
  position: absolute;
  right: 120rpx;
  top: 50%;
  transform: translateY(-50%);
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

/* uni-popup 弹窗样式 */
.popup-content {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.popup-close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.popup-body {
  padding: 40rpx;
  max-height: 800rpx;
}

.uni-form-item {
  display: flex;
  margin-bottom: 30rpx;
  align-items: center;
}

.uni-form-item__label {
  width: 200rpx;
  font-size: 28rpx;
  color: #666;
}

.uni-form-item__content {
  flex: 1;
}

.uni-input {
  height: 80rpx;
  padding: 0 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 30rpx;
  line-height: 80rpx;
}

.uni-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.uni-input-placeholder {
  color: #999;
}

.popup-footer {
  display: flex;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
  gap: 20rpx;
}

.popup-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.popup-btn-confirm {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: #fff;
}
</style>
