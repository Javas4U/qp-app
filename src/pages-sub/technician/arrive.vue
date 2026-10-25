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
    navigationBarBackgroundColor: '#f8fafc',
    navigationBarTextStyle: 'black',
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
  <view class="tech-arrive-page min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between pb-8">
    <view>
      <!-- 1. 顶部定位与围栏校验条 (工业高可视顶栏) -->
      <view class="bg-white border-b border-slate-200 px-4 pt-4 pb-5 shadow-sm">
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <text class="text-sm font-bold text-slate-900">已进入故障现场 50m 电子围栏范围</text>
        </view>
        <view class="mt-1.5 text-xs text-slate-500 leading-relaxed font-mono">
          现场定位：{{ currentTicket?.location.address }}
        </view>
      </view>

      <!-- 2. 到达打卡卡片 -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm text-xs text-slate-700 space-y-3">
        <view class="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <text class="font-bold text-slate-900 text-sm">救援目标核对</text>
          <text class="text-emerald-700 font-bold font-mono bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-sm">核验一致 ✓</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-slate-500">求援车辆</text>
          <text class="font-bold text-slate-900 text-sm font-mono">{{ currentTicket?.plateNo }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-slate-500">现场司机</text>
          <text class="font-bold text-slate-900">{{ currentTicket?.driverName }} ({{ currentTicket?.driverPhone }})</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-slate-500">打卡时刻</text>
          <text class="font-mono text-slate-700">{{ arriveTime }}</text>
        </view>

        <!-- 打卡主触发按钮 (手套防误触 ≥ 44px) -->
        <view class="pt-2">
          <button
            class="w-full min-h-[88rpx] rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border-none"
            :class="isArrived ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-emerald-600 active:bg-emerald-700 text-white shadow-sm'"
            @click="handleArriveCheckin"
          >
            <text :class="isArrived ? 'i-carbon-checkmark-filled' : 'i-carbon-location-filled'" class="text-base" />
            <text>{{ isArrived ? '已成功完成现场电子打卡' : '点击打卡：确认已到故障现场' }}</text>
          </button>
        </view>
      </view>

      <!-- 3. 重卡道路救援安全作业规程规范 (高可视工业警示框) -->
      <view class="mx-4 mt-3 bg-amber-50 rounded-lg p-3.5 border border-amber-300 text-xs text-slate-700 space-y-2">
        <view class="font-bold flex items-center gap-1.5 text-amber-800">
          <text class="i-carbon-warning-alt-filled text-base" />
          <text>重卡道路作业现场安全三严禁</text>
        </view>
        <view class="pl-2 space-y-1 text-[22rpx] text-slate-700 leading-relaxed">
          <view>1. 必须在故障车后方 150 米外摆放标准反光三角警示架；</view>
          <view>2. 作业技师必须全程穿戴高亮反光背心与安全绝缘鞋；</view>
          <view>3. 下车排查前必须确认重卡已拉紧断气刹手刹并打上三角木。</view>
        </view>
      </view>
    </view>

    <!-- 4. 底部下一步按钮 (手套防误触 ≥ 44px) -->
    <view class="px-4">
      <button
        class="w-full bg-[#0284c7] active:bg-[#0369a1] text-white min-h-[88rpx] rounded-lg font-bold text-sm flex items-center justify-center gap-2 border-none transition-colors shadow-sm"
        @click="gotoPartsConfirm"
      >
        <text class="i-carbon-tools text-base" />
        <text>现场勘查完毕，进入换件核算</text>
      </button>
    </view>
  </view>
</template>
