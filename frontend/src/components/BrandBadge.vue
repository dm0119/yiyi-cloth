<template>
  <div v-if="isBrand" class="brand-badge" :title="tooltip">
    <span class="brand-icon">⭐</span>
    <span class="brand-text">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  isBrand: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '品牌'
  },
  tooltip: {
    type: String,
    default: '品牌店铺'
  }
})
</script>

<style scoped>
.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
  color: #f4c542;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(244, 197, 66, 0.1);
  border: 1px solid #f4c54233;
  transition: all 0.3s ease;
}

.brand-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(244, 197, 66, 0.2);
}

.brand-icon {
  font-size: 14px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  animation: sparkle 2s ease-in-out infinite;
}

.brand-text {
  background: linear-gradient(135deg, #f4c542 0%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@keyframes sparkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
</style>
