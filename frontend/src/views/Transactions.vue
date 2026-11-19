<template>
  <div class="transactions-container">
    <div class="header">
      <h1>交易记录</h1>
      <div class="date-range">
        <input type="date" v-model="startDate" class="date-input">
        <span>至</span>
        <input type="date" v-model="endDate" class="date-input">
      </div>
    </div>
    
    <div class="filter-section">
      <div class="filter-item">
        <label>交易ID</label>
        <input type="text" v-model="filters.transactionId" class="filter-input">
      </div>
      <div class="filter-item">
        <label>交易类型</label>
        <select v-model="filters.transactionType" class="filter-select">
          <option value="">全部</option>
          <option value="payment">支付</option>
          <option value="refund">退款</option>
          <option value="recharge">充值</option>
        </select>
      </div>
      <div class="filter-item">
        <label>订单状态</label>
        <select v-model="filters.orderStatus" class="filter-select">
          <option value="">全部</option>
          <option value="success">已完成</option>
          <option value="pending">待处理</option>
          <option value="failed">失败</option>
        </select>
      </div>
      <button @click="applyFilters" class="filter-button">筛选</button>
    </div>
    
    <div class="transactions-table">
      <table>
        <thead>
          <tr>
            <th>交易ID</th>
            <th>交易类型</th>
            <th>订单状态</th>
            <th>金额</th>
            <th>描述</th>
            <th>交易时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in filteredTransactions" :key="transaction.id">
            <td>{{ transaction.id }}</td>
            <td>{{ getTransactionTypeLabel(transaction.type) }}</td>
            <td>{{ getStatusLabel(transaction.status) }}</td>
            <td :class="transaction.type === 'recharge' || transaction.type === 'refund' ? 'positive-amount' : 'negative-amount'">
              {{ transaction.type === 'recharge' || transaction.type === 'refund' ? '+' : '-' }}¥{{ transaction.amount.toFixed(2) }}
            </td>
            <td>{{ transaction.description }}</td>
            <td>{{ formatDate(transaction.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="filteredTransactions.length === 0" class="empty-state">
      <p>暂无交易记录</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      startDate: '',
      endDate: '',
      filters: {
        transactionId: '',
        transactionType: '',
        orderStatus: ''
      },
      transactions: [
        {
          id: 1,
          type: 'payment',
          status: 'success',
          amount: 120.00,
          description: '订单ORD202603157748支付',
          created_at: '2026-03-15 17:25:00'
        },
        {
          id: 2,
          type: 'payment',
          status: 'pending',
          amount: 120.00,
          description: '订单ORD202603154678待支付',
          created_at: '2026-03-15 17:25:00'
        },
        {
          id: 3,
          type: 'payment',
          status: 'pending',
          amount: 120.00,
          description: '订单ORD202603155069待支付',
          created_at: '2026-03-15 17:25:00'
        }
      ]
    }
  },
  computed: {
    filteredTransactions() {
      return this.transactions.filter(transaction => {
        const matchesId = !this.filters.transactionId || transaction.id.toString().includes(this.filters.transactionId)
        const matchesType = !this.filters.transactionType || transaction.type === this.filters.transactionType
        const matchesStatus = !this.filters.orderStatus || transaction.status === this.filters.orderStatus
        return matchesId && matchesType && matchesStatus
      })
    }
  },
  methods: {
    applyFilters() {
      // 实际应用中，这里可以调用API获取过滤后的交易记录
    },
    getTransactionTypeLabel(type) {
      const labels = {
        payment: '支付',
        refund: '退款',
        recharge: '充值'
      }
      return labels[type] || type
    },
    getStatusLabel(status) {
      const labels = {
        success: '已完成',
        pending: '待处理',
        failed: '失败'
      }
      return labels[status] || status
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    }
  }
}
</script>

<style scoped>
.transactions-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.header h1 {
  margin: 0 0 20px 0;
  font-size: 38px;
  color: #333;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: end;
}

.filter-item {
  flex: 1;
}

.filter-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 18px;
  color: #666;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-button {
  padding: 8px 20px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  height: 36px;
}

.filter-button:hover {
  background-color: #66b1ff;
}

.transactions-table {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.transactions-table table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th,
.transactions-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.transactions-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #333;
}

.transactions-table tr:hover {
  background-color: #f5f5f5;
}

.positive-amount {
  color: #67c23a;
  font-weight: 500;
}

.negative-amount {
  color: #f56c6c;
  font-weight: 500;
}

.empty-state {
  background-color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #999;
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .filter-button {
    width: 100%;
  }
  
  .transactions-table {
    overflow-x: auto;
  }
}
</style>
