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
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
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
  <view class="tech-nav-page min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-between pb-6">
    <!-- 1. 顶部技师状态条 (工业刚性顶栏) -->
    <view class="bg-[#1e293b] border-b border-slate-700/80 px-4 pt-3 pb-4">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <text class="text-xs font-bold text-slate-100">{{ technicianInfo.name }} · {{ technicianInfo.stationName }}</text>
        </view>
        <view
          class="bg-slate-800 border border-slate-700 text-slate-300 text-[20rpx] px-2.5 py-1 rounded-sm cursor-pointer active:bg-slate-700 transition-colors"
          @click="switchToDriverView"
        >
          切回司机端
        </view>
      </view>
    </view>

    <!-- 2. 工单机能卡片 -->
    <view class="mx-4 mt-3 bg-[#1e293b] rounded-lg p-4 border border-slate-700/80 z-10 text-xs">
      <view class="flex items-center justify-between pb-2.5 border-b border-slate-700">
        <view class="flex items-center gap-1.5 font-bold text-slate-100 font-mono">
          <text class="i-carbon-ticket text-[#0284c7]" />
          <text>工单 {{ currentTicket?.ticketId || 'RC202610120001' }}</text>
        </view>
        <text class="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[20rpx] px-2 py-0.5 rounded-sm font-bold">紧急救援</text>
      </view>

      <view class="py-2.5 space-y-1.5 text-slate-300">
        <view class="flex items-center justify-between">
          <text class="text-slate-400">求援司机</text>
          <text class="font-bold text-slate-100 font-mono">{{ currentTicket?.driverName }} ({{ currentTicket?.plateNo }})</text>
        </view>
        <view class="flex items-center justify-between">
          <text class="text-slate-400">报案故障</text>
          <text class="font-bold text-amber-400">{{ currentTicket?.rescueTypeName }}</text>
        </view>
        <view class="flex items-start justify-between">
          <text class="text-slate-400 shrink-0">现场位置</text>
          <text class="text-right text-slate-200 font-medium pl-3 line-clamp-2 font-mono">
            {{ currentTicket?.location.address }}
          </text>
        </view>
      </view>

      <view class="pt-2 border-t border-slate-700 flex items-center justify-between">
        <view class="text-[20rpx] text-slate-400">
          直线距离约 12.6km · 预计耗时 18分钟
        </view>
        <button
          class="bg-slate-800 border border-slate-700 text-emerald-400 text-xs px-3 min-h-[64rpx] rounded-md font-bold m-0 flex items-center gap-1 active:bg-slate-700 transition-colors"
          @click="callDriver"
        >
          <text class="i-carbon-phone-filled text-xs" />
          <text>联系求援司机</text>
        </button>
      </view>
    </view>

    <!-- 3. 中间路网仿真地图 (深碳工业边框) -->
    <view class="mx-4 my-3 flex-1 rounded-lg overflow-hidden border border-slate-700/80 min-h-[360rpx] bg-slate-900">
      <SimulatedMap
        height="100%"
        :truck-pos="{ x: 30, y: 70 }"
        status-text="导航规划：沿G107国道北向孝感方向行驶"
      />
    </view>

    <!-- 4. 底部开始导航按钮（手套防误触 ≥ 44px） -->
    <view class="px-4">
      <button
        class="w-full bg-[#0284c7] active:bg-[#0369a1] text-white min-h-[88rpx] rounded-lg font-bold text-sm flex items-center justify-center gap-2 border-none transition-colors"
        @click="startNavigation"
      >
        <text class="i-carbon-navigation text-base" />
        <text>开始路线导航并赶赴现场</text>
      </button>
    </view>
  </view>
</template>
