<script setup lang="ts">
import { ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '车主服务大厅',
    navigationBarBackgroundColor: '#f8f8f8',
  },
})

const banners = ref([
  { title: '全天候道路救援 · 15分钟极速响应', bg: 'bg-blue-600' },
  { title: '原厂品质正品配件 · 直供保障', bg: 'bg-emerald-600' },
])

const quickActions = ref([
  { title: '道路救援', icon: 'i-carbon-warning-alt', color: 'text-red-500' },
  { title: '配件商城', icon: 'i-carbon-shopping-bag', color: 'text-blue-500' },
  { title: '车辆档案', icon: 'i-carbon-delivery-truck', color: 'text-amber-500' },
  { title: '我的工单', icon: 'i-carbon-document', color: 'text-emerald-500' },
])
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-8">
    <!-- 头部卡片 -->
    <view class="border-b border-gray-100 bg-white p-4">
      <view class="text-xl text-gray-900 font-bold">
        卡车汇 · 车主服务中心
      </view>
      <view class="mt-1 text-xs text-gray-500">
        为全国卡友提供全生命周期后市场协同保障
      </view>
    </view>

    <!-- 轮播图区域 -->
    <view class="p-4">
      <swiper class="h-36 overflow-hidden rounded-xl shadow-sm" :indicator-dots="true" :autoplay="true">
        <swiper-item v-for="(banner, idx) in banners" :key="idx">
          <view class="h-full w-full flex items-center justify-center text-lg text-white font-bold" :class="[banner.bg]">
            {{ banner.title }}
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 快捷入口网格 -->
    <view class="mx-4 rounded-xl bg-white p-4 shadow-sm">
      <view class="mb-3 text-sm text-gray-800 font-bold">
        高频服务
      </view>
      <view class="grid grid-cols-4 gap-4 text-center">
        <view
          v-for="(action, idx) in quickActions"
          :key="idx"
          class="flex flex-col items-center justify-center rounded-lg p-2 transition active:scale-95 hover:bg-gray-50"
        >
          <view class="mb-1 h-10 w-10 flex items-center justify-center rounded-full bg-gray-50" :class="[action.color]">
            <text class="text-xl" :class="[action.icon]" />
          </view>
          <text class="text-xs text-gray-700 font-medium">{{ action.title }}</text>
        </view>
      </view>
    </view>
  </view>
</template>
