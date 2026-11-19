<template>
  <div class="shop-avatar" :style="avatarStyle" :class="{ [size]: true }">
    <img v-if="shop.logo_url" :src="shop.logo_url" :alt="shop.name" />
    <div v-else class="default-avatar">
      <span>{{ firstChar }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  shop: {
    type: Object,
    default: () => ({})
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const colors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
]

const colorIndex = computed(() => {
  return props.shop.id ? props.shop.id % colors.length : 0
})

const avatarStyle = computed(() => {
  if (props.shop.logo_url) {
    return {}
  }
  return {
    background: colors[colorIndex.value]
  }
})

const firstChar = computed(() => {
  return props.shop.name ? props.shop.name.charAt(0) : '店'
})
</script>

<style scoped>
.shop-avatar {
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

/* 尺寸变体 */
.shop-avatar.small {
  width: 40px;
  height: 40px;
}

.shop-avatar.small .default-avatar {
  font-size: 16px;
}

.shop-avatar.medium {
  width: 60px;
  height: 60px;
}

.shop-avatar.medium .default-avatar {
  font-size: 24px;
}

.shop-avatar.large {
  width: 80px;
  height: 80px;
}

.shop-avatar.large .default-avatar {
  font-size: 32px;
}
</style>
