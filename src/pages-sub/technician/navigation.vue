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
    navigationBarBackgroundColor: '#00b578',
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
  <view class="tech-nav-page min-h-screen bg-[#f5f7fa] flex flex-col justify-between pb-6">
    <!-- 1. 顶部技师状态条 (对标 救援6.jpeg 顶部) -->
    <view class="bg-[#00b578] text-white px-4 pt-3 pb-5 rounded-b-3xl shadow-sm">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view class="w-3 h-3 rounded-full bg-white animate-pulse" />
          <text class="text-xs font-bold">{{ technicianInfo.name }} · {{ technicianInfo.stationName }}</text>
        </view>
        <view
          class="bg-white/20 text-white text-[20rpx] px-2.5 py-1 rounded-full cursor-pointer active:opacity-80"
          @click="switchToDriverView"
        >
          切回司机端
        </view>
      </view>
    </view>

    <!-- 2. 工单悬浮卡片 -->
    <view class="mx-4 -mt-3 bg-white rounded-2xl p-4 shadow-md border border-gray-100 z-10 text-xs">
      <view class="flex items-center justify-between pb-2.5 border-b border-gray-100">
        <view class="flex items-center gap-1.5 font-bold text-gray-900">
          <text class="i-carbon-ticket text-emerald-600" />
          <text>工单 {{ currentTicket?.ticketId || 'RC202610120001' }}</text>
        </view>
        <text class="bg-red-50 text-red-600 text-[20rpx] px-2 py-0.5 rounded-full font-bold">紧急救援</text>
      </view>

      <view class="py-2.5 space-y-1.5 text-gray-600">
        <view class="flex items-center justify-between">
          <text class="text-gray-400">求援司机</text>
          <text class="font-bold text-gray-900">{{ currentTicket?.driverName }} ({{ currentTicket?.plateNo }})</text>
        </view>
        <view class="flex items-center justify-between">
          <text class="text-gray-400">报案故障</text>
          <text class="font-bold text-amber-600">{{ currentTicket?.rescueTypeName }}</text>
        </view>
        <view class="flex items-start justify-between">
          <text class="text-gray-400 shrink-0">现场位置</text>
          <text class="text-right text-gray-800 font-medium pl-3 line-clamp-2">
            {{ currentTicket?.location.address }}
          </text>
        </view>
      </view>

      <view class="pt-2 border-t border-gray-100 flex items-center justify-between">
        <view class="text-[20rpx] text-gray-400">
          直线距离约 12.6km · 预计耗时 18分钟
        </view>
        <button
          class="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-lg font-bold m-0 flex items-center gap-1"
          @click="callDriver"
        >
          <text class="i-carbon-phone-filled text-xs" />
          <text>联系求援司机</text>
        </button>
      </view>
    </view>

    <!-- 3. 中间路网仿真地图 (对标 救援6.jpeg 地图展示) -->
    <view class="mx-4 my-3 flex-1 rounded-2xl overflow-hidden shadow-sm border border-gray-100 min-h-[360rpx] bg-white">
      <SimulatedMap
        height="100%"
        :truck-pos="{ x: 30, y: 70 }"
        status-text="导航规划：沿G107国道北向孝感方向行驶"
      />
    </view>

    <!-- 4. 底部开始导航按钮 (对标 救援6.jpeg 底部主操作) -->
    <view class="px-4">
      <button
        class="w-full bg-[#00b578] text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:opacity-90 flex items-center justify-center gap-2 border-none"
        @click="startNavigation"
      >
        <text class="i-carbon-navigation text-base" />
        <text>开始路线导航并赶赴现场</text>
      </button>
    </view>
  </view>
</template>
