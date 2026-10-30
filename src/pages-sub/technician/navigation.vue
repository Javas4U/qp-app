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
  <view class="tech-nav-page min-h-screen flex flex-col justify-between bg-[#0f172a] pb-6 text-slate-100">
    <!-- 1. 顶部技师状态条 (工业刚性顶栏) -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] px-4 pb-4 pt-3">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view class="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          <text class="text-xs text-slate-100 font-bold">{{ technicianInfo.name }} · {{ technicianInfo.stationName }}</text>
        </view>
        <view
          class="cursor-pointer border border-slate-700 rounded-sm bg-slate-800 px-2.5 py-1 text-[20rpx] text-slate-300 transition-colors active:bg-slate-700"
          @click="switchToDriverView"
        >
          切回司机端
        </view>
      </view>
    </view>

    <!-- 2. 工单机能卡片 -->
    <view class="z-10 mx-4 mt-3 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4 text-xs">
      <view class="flex items-center justify-between border-b border-slate-700 pb-2.5">
        <view class="flex items-center gap-1.5 text-slate-100 font-bold font-mono">
          <text class="i-carbon-ticket text-[#0284c7]" />
          <text>工单 {{ currentTicket?.ticketId || 'RC202610120001' }}</text>
        </view>
        <text class="border border-rose-500/40 rounded-sm bg-rose-500/20 px-2 py-0.5 text-[20rpx] text-rose-400 font-bold">紧急救援</text>
      </view>

      <view class="py-2.5 text-slate-300 space-y-1.5">
        <view class="flex items-center justify-between">
          <text class="text-slate-400">求援司机</text>
          <text class="text-slate-100 font-bold font-mono">{{ currentTicket?.driverName }} ({{ currentTicket?.plateNo }})</text>
        </view>
        <view class="flex items-center justify-between">
          <text class="text-slate-400">报案故障</text>
          <text class="text-amber-400 font-bold">{{ currentTicket?.rescueTypeName }}</text>
        </view>
        <view class="flex items-start justify-between">
          <text class="shrink-0 text-slate-400">现场位置</text>
          <text class="line-clamp-2 pl-3 text-right text-slate-200 font-medium font-mono">
            {{ currentTicket?.location.address }}
          </text>
        </view>
      </view>

      <view class="flex items-center justify-between border-t border-slate-700 pt-2">
        <view class="text-[20rpx] text-slate-400">
          直线距离约 12.6km · 预计耗时 18分钟
        </view>
        <button
          class="m-0 min-h-[64rpx] flex items-center gap-1 border border-slate-700 rounded-md bg-slate-800 px-3 text-xs text-emerald-400 font-bold transition-colors active:bg-slate-700"
          @click="callDriver"
        >
          <text class="i-carbon-phone-filled text-xs" />
          <text>联系求援司机</text>
        </button>
      </view>
    </view>

    <!-- 3. 中间路网仿真地图 (深碳工业边框) -->
    <view class="mx-4 my-3 min-h-[360rpx] flex-1 overflow-hidden border border-slate-700/80 rounded-lg bg-slate-900">
      <SimulatedMap
        height="100%"
        :truck-pos="{ x: 30, y: 70 }"
        status-text="导航规划：沿G107国道北向孝感方向行驶"
      />
    </view>

    <!-- 4. 底部开始导航按钮（手套防误触 ≥ 44px） -->
    <view class="px-4">
      <button
        class="min-h-[88rpx] w-full flex items-center justify-center gap-2 rounded-lg border-none bg-[#0284c7] text-sm text-white font-bold transition-colors active:bg-[#0369a1]"
        @click="startNavigation"
      >
        <text class="i-carbon-navigation text-base" />
        <text>开始路线导航并赶赴现场</text>
      </button>
    </view>
  </view>
</template>
