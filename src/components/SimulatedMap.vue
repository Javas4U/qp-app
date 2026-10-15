<script setup lang="ts">
interface Props {
  height?: string
  truckPosition?: { top: number; left: number }
  technicianPosition?: { top: number; left: number }
  showRoute?: boolean
  showPulse?: boolean
}

withDefaults(defineProps<Props>(), {
  height: '620rpx',
  truckPosition: () => ({ top: 38, left: 50 }),
  technicianPosition: () => ({ top: 22, left: 46 }),
  showRoute: false,
  showPulse: true,
})
</script>

<template>
  <view class="simulated-map-container" :style="{ height }">
    <!-- 矢量网格与道路纹理底图 -->
    <view class="map-bg">
      <view class="river" />
      <view class="main-road road-h-1" />
      <view class="main-road road-h-2" />
      <view class="main-road road-v-1" />
      <view class="main-road road-diag-1" />
      <view class="block b-1"><text class="poi-label">物流港区</text></view>
      <view class="block b-2"><text class="poi-label">服务区</text></view>
      <view class="block b-3"><text class="poi-label">收费站</text></view>
    </view>

    <!-- 动态行车路线轨迹 (若开启) -->
    <svg v-if="showRoute" class="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        d="M 46 25 Q 48 30, 50 40"
        fill="none"
        stroke="#1677FF"
        stroke-width="2.5"
        stroke-dasharray="3,2"
        stroke-linecap="round"
      />
    </svg>

    <!-- 救援目标卡车标记点 (故障车) -->
    <view
      class="truck-marker"
      :style="{ top: `${truckPosition.top}%`, left: `${truckPosition.left}%` }"
    >
      <view class="truck-box">
        <image
          class="truck-img"
          src="https://img.icons8.com/color/96/truck.png"
          mode="aspectFit"
        />
      </view>
      <!-- 位置光圈脉冲 -->
      <view v-if="showPulse" class="pulse-point">
        <view class="center-dot" />
        <view class="pulse-ring" />
      </view>
    </view>

    <!-- 赶赴技师车辆标记点 (可选) -->
    <view
      v-if="technicianPosition"
      class="tech-marker"
      :style="{ top: `${technicianPosition.top}%`, left: `${technicianPosition.left}%` }"
    >
      <view class="tech-badge">
        <text class="i-carbon-pedestrian text-xs text-white" />
        <text class="tech-name">张师傅</text>
      </view>
      <view class="tech-dot" />
    </view>

    <!-- 地图右侧缩放与定位悬浮小控件 -->
    <view class="map-controls">
      <view class="ctrl-btn"><text class="text-sm font-bold">+</text></view>
      <view class="ctrl-btn"><text class="text-sm font-bold">-</text></view>
    </view>

    <!-- 默认内容插槽 (可放置状态卡片) -->
    <slot />
  </view>
</template>

<style scoped>
.simulated-map-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #e5edf5;
}

.map-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 蓝色水系/河流 */
.river {
  position: absolute;
  top: 0;
  right: 12%;
  width: 18%;
  height: 100%;
  background: linear-gradient(180deg, #b9dbff 0%, #a4cdfc 100%);
  opacity: 0.75;
  transform: skewX(-6deg);
}

/* 主干道路网络 */
.main-road {
  position: absolute;
  background-color: #ffffff;
  box-shadow: 0 0 4rpx rgba(0, 0, 0, 0.08);
}

.road-h-1 {
  top: 32%;
  left: 0;
  width: 100%;
  height: 22rpx;
}

.road-h-2 {
  top: 68%;
  left: 0;
  width: 100%;
  height: 18rpx;
}

.road-v-1 {
  top: 0;
  left: 36%;
  width: 20rpx;
  height: 100%;
}

.road-diag-1 {
  top: -10%;
  left: 10%;
  width: 26rpx;
  height: 120%;
  transform: rotate(38deg);
  background-color: #fce7ba; /* 国道高亮橙黄 */
}

/* 地块与 POI */
.block {
  position: absolute;
  padding: 4rpx 10rpx;
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 6rpx;
}
.b-1 {
  top: 15%;
  left: 12%;
}
.b-2 {
  bottom: 18%;
  left: 20%;
}
.b-3 {
  top: 48%;
  right: 32%;
}
.poi-label {
  font-size: 18rpx;
  color: #718096;
}

/* 路线 SVG */
.route-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 卡车求助点 */
.truck-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.truck-box {
  width: 90rpx;
  height: 90rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #1677ff;
}

.truck-img {
  width: 72rpx;
  height: 72rpx;
}

/* 定位光圈脉冲 */
.pulse-point {
  position: relative;
  width: 40rpx;
  height: 40rpx;
  margin-top: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-dot {
  width: 18rpx;
  height: 18rpx;
  background-color: #1677ff;
  border: 4rpx solid #ffffff;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 2rpx 6rpx rgba(22, 119, 255, 0.4);
}

.pulse-ring {
  position: absolute;
  width: 36rpx;
  height: 36rpx;
  border: 4rpx solid #1677ff;
  border-radius: 50%;
  animation: pulse-ring-anim 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

@keyframes pulse-ring-anim {
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

/* 技师标记 */
.tech-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tech-badge {
  padding: 4rpx 12rpx;
  background: #00b578;
  color: #fff;
  border-radius: 20rpx;
  font-size: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 181, 120, 0.35);
  white-space: nowrap;
}

.tech-dot {
  width: 14rpx;
  height: 14rpx;
  background-color: #00b578;
  border: 3rpx solid #fff;
  border-radius: 50%;
  margin-top: 4rpx;
}

/* 右侧控件 */
.map-controls {
  position: absolute;
  right: 24rpx;
  top: 40%;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  z-index: 4;
}

.ctrl-btn {
  width: 56rpx;
  height: 56rpx;
  background: #ffffff;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
  color: #4a5568;
}
</style>
