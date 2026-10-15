<script setup lang="ts">
interface Props {
  size?: string
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: '380rpx',
  color: '#1677ff',
})
</script>

<template>
  <view class="radar-wrapper" :style="{ width: size, height: size }">
    <!-- 声纳多重扩散圆环 -->
    <view class="radar-circle circle-1" :style="{ borderColor: color }" />
    <view class="radar-circle circle-2" :style="{ borderColor: color }" />
    <view class="radar-circle circle-3" :style="{ borderColor: color }" />
    <!-- 中心雷达基点 -->
    <view class="radar-core" :style="{ backgroundColor: color }">
      <slot />
    </view>
  </view>
</template>

<style scoped>
.radar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.radar-circle {
  position: absolute;
  border-radius: 50%;
  border-style: solid;
  border-width: 2rpx;
  opacity: 0;
  animation: radar-expand 2.8s cubic-bezier(0.1, 0.45, 0.1, 1) infinite;
}

.circle-1 {
  width: 100%;
  height: 100%;
  animation-delay: 0s;
}

.circle-2 {
  width: 100%;
  height: 100%;
  animation-delay: 0.9s;
}

.circle-3 {
  width: 100%;
  height: 100%;
  animation-delay: 1.8s;
}

.radar-core {
  position: relative;
  z-index: 2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes radar-expand {
  0% {
    transform: scale(0.15);
    opacity: 0.85;
    background-color: rgba(22, 119, 255, 0.15);
  }
  60% {
    opacity: 0.35;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
    background-color: transparent;
  }
}
</style>
