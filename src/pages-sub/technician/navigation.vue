<script lang="ts" setup>
import SimulatedMap from '@/components/SimulatedMap.vue'
import { useRescueSessionStore } from '@/store/rescueSession'
import { useUserSessionStore } from '@/store/userSession'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'TechnicianNavPage',
})

definePage({
  style: {
    navigationBarTitleText: '技师工作台 - 导航赴援',
    navigationBarBackgroundColor: '#f8fafc',
    navigationBarTextStyle: 'black',
  },
})

const rescueStore = useRescueSessionStore()
const userStore = useUserSessionStore()
const { currentTicket } = storeToRefs(rescueStore)
const { technicianInfo } = storeToRefs(userStore)

function startNavigation() {
  uni.showLoading({ title: '正在规划最优路线...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.navigateTo({
      url: '/pages-sub/technician/arrive',
    })
  }, 500)
}

function callDriver() {
  const phone = currentTicket.value?.driverPhone || '13800138000'
  uni.makePhoneCall({
    phoneNumber: phone,
    fail: () => {
      uni.showToast({ title: `拨打司机电话: ${phone}`, icon: 'none' })
    },
  })
}

function switchToDriverView() {
  userStore.switchRole('DRIVER')
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<template>
  <view class="tech-nav-page min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between pb-6">
    <!-- 1. 顶部技师状态条 (工业高可视顶栏) -->
    <view class="bg-white border-b border-slate-200 px-4 pt-3 pb-4 shadow-sm">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <text class="text-xs font-bold text-slate-900">{{ technicianInfo.name }} · {{ technicianInfo.stationName }}</text>
        </view>
        <view
          class="bg-slate-100 border border-slate-300 text-slate-700 text-[20rpx] px-2.5 py-1 rounded-sm cursor-pointer active:bg-slate-200 transition-colors"
          @click="switchToDriverView"
        >
          切回司机端
        </view>
      </view>
    </view>

    <!-- 2. 工单机能卡片 -->
    <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm z-10 text-xs">
      <view class="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <view class="flex items-center gap-1.5 font-bold text-slate-900 font-mono">
          <text class="i-carbon-ticket text-[#0284c7]" />
          <text>工单 {{ currentTicket?.ticketId || 'RC202610120001' }}</text>
        </view>
        <text class="bg-rose-50 text-rose-700 border border-rose-300 text-[20rpx] px-2 py-0.5 rounded-sm font-bold">紧急救援</text>
      </view>

      <view class="py-2.5 space-y-1.5 text-slate-700">
        <view class="flex items-center justify-between">
          <text class="text-slate-500">求援司机</text>
          <text class="font-bold text-slate-900 font-mono">{{ currentTicket?.driverName }} ({{ currentTicket?.plateNo }})</text>
        </view>
        <view class="flex items-center justify-between">
          <text class="text-slate-500">报案故障</text>
          <text class="font-bold text-amber-600">{{ currentTicket?.rescueTypeName }}</text>
        </view>
        <view class="flex items-start justify-between">
          <text class="text-slate-500 shrink-0">现场位置</text>
          <text class="text-right text-slate-800 font-medium pl-3 line-clamp-2 font-mono">
            {{ currentTicket?.location.address }}
          </text>
        </view>
      </view>

      <view class="pt-2 border-t border-slate-100 flex items-center justify-between">
        <view class="text-[20rpx] text-slate-500">
          直线距离约 12.6km · 预计耗时 18分钟
        </view>
        <button
          class="bg-emerald-600 active:bg-emerald-700 text-white text-xs px-3 min-h-[64rpx] rounded-md font-bold m-0 flex items-center gap-1 border-none transition-colors shadow-xs"
          @click="callDriver"
        >
          <text class="i-carbon-phone-filled text-xs" />
          <text>联系求援司机</text>
        </button>
      </view>
    </view>

    <!-- 3. 中间路网仿真地图 (工业浅灰边框) -->
    <view class="mx-4 my-3 flex-1 rounded-lg overflow-hidden border border-slate-200 min-h-[360rpx] bg-slate-100 shadow-inner">
      <SimulatedMap
        height="100%"
        :truck-pos="{ x: 30, y: 70 }"
        status-text="导航规划：沿G107国道北向孝感方向行驶"
      />
    </view>

    <!-- 4. 底部开始导航按钮（手套防误触 ≥ 44px） -->
    <view class="px-4">
      <button
        class="w-full bg-[#0284c7] active:bg-[#0369a1] text-white min-h-[88rpx] rounded-lg font-bold text-sm flex items-center justify-center gap-2 border-none transition-colors shadow-sm"
        @click="startNavigation"
      >
        <text class="i-carbon-navigation text-base" />
        <text>开始路线导航并赶赴现场</text>
      </button>
    </view>
  </view>
</template>
