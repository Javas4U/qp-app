<script lang="ts" setup>
import { useRescueSessionStore } from '@/store/rescueSession'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineOptions({
  name: 'TechnicianArrivePage',
})

definePage({
  style: {
    navigationBarTitleText: '技师工作台 - 现场打卡',
    navigationBarBackgroundColor: '#00b578',
    navigationBarTextStyle: 'white',
  },
})

const rescueStore = useRescueSessionStore()
const { currentTicket } = storeToRefs(rescueStore)

const arriveTime = ref(new Date().toLocaleTimeString())
const isArrived = ref(false)

function handleArriveCheckin() {
  rescueStore.arriveAtScene()
  isArrived.value = true
  uni.showToast({
    title: '到达现场打卡成功！',
    icon: 'success',
  })
}

function gotoPartsConfirm() {
  rescueStore.startService()
  uni.navigateTo({
    url: '/pages-sub/technician/parts-confirm',
  })
}
</script>

<template>
  <view class="tech-arrive-page min-h-screen bg-[#f5f7fa] flex flex-col justify-between pb-8">
    <view>
      <!-- 1. 顶部定位与围栏校验条 (对标 救援7.jpg) -->
      <view class="bg-[#00b578] text-white px-4 pt-4 pb-10 rounded-b-[40rpx]">
        <view class="flex items-center gap-2">
          <view class="w-3 h-3 rounded-full bg-emerald-300 animate-ping" />
          <text class="text-sm font-bold">已进入故障现场 50m 电子围栏</text>
        </view>
        <view class="mt-2 text-xs opacity-90 leading-relaxed">
          现场定位：{{ currentTicket?.location.address }}
        </view>
      </view>

      <!-- 2. 到达打卡卡片 (对标 救援7.jpg) -->
      <view class="mx-4 -mt-6 bg-white rounded-2xl p-5 shadow-md border border-gray-100 text-xs text-gray-700 space-y-3">
        <view class="flex items-center justify-between pb-3 border-b border-gray-100">
          <text class="font-bold text-gray-900 text-sm">救援目标核对</text>
          <text class="text-emerald-600 font-bold font-mono">核验一致 ✓</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-gray-400">求援车辆</text>
          <text class="font-bold text-gray-900 text-sm">{{ currentTicket?.plateNo }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-gray-400">现场司机</text>
          <text class="font-bold text-gray-800">{{ currentTicket?.driverName }} ({{ currentTicket?.driverPhone }})</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-gray-400">打卡时刻</text>
          <text class="font-mono text-gray-700">{{ arriveTime }}</text>
        </view>

        <!-- 打卡主触发按钮 -->
        <view class="pt-2">
          <button
            class="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            :class="isArrived ? 'bg-emerald-100 text-emerald-800' : 'bg-[#00b578] text-white shadow-md active:opacity-90'"
            @click="handleArriveCheckin"
          >
            <text :class="isArrived ? 'i-carbon-checkmark-filled' : 'i-carbon-location-filled'" class="text-base" />
            <text>{{ isArrived ? '已成功完成现场电子打卡' : '点击打卡：确认已到故障现场' }}</text>
          </button>
        </view>
      </view>

      <!-- 3. 重卡道路救援安全作业规程规范 -->
      <view class="mx-4 mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 space-y-2">
        <view class="font-bold flex items-center gap-1.5 text-amber-800">
          <text class="i-carbon-warning-alt-filled text-base" />
          <text>重卡道路作业现场安全三严禁</text>
        </view>
        <view class="pl-2 space-y-1 text-[22rpx] text-amber-800/90 leading-relaxed">
          <view>1. 必须在故障车后方 150 米外摆放标准反光三角警示架；</view>
          <view>2. 作业技师必须全程穿戴高亮反光背心与安全绝缘鞋；</view>
          <view>3. 下车排查前必须确认重卡已拉紧断气刹手刹并打上三角木。</view>
        </view>
      </view>
    </view>

    <!-- 4. 底部下一步按钮 -->
    <view class="px-4">
      <button
        class="w-full bg-[#1677ff] text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:opacity-90 flex items-center justify-center gap-2 border-none"
        @click="gotoPartsConfirm"
      >
        <text class="i-carbon-tools text-base" />
        <text>现场勘查完毕，进入换件核算</text>
      </button>
    </view>
  </view>
</template>
