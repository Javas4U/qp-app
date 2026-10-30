<script setup lang="ts">
import type { RescueOrderVo } from '@/types/rescue'
import { getMyRescueTasks, reportRescueProgress } from '@/api/rescue'
import { useRescueTaskStore } from '@/store/rescueTask'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '救援技师工作台',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true,
  },
  needLogin: true,
})

const rescueTaskStore = useRescueTaskStore()

const activeTab = ref<'pending' | 'ongoing' | 'finished'>('pending')
const loading = ref<boolean>(false)
const taskList = ref<RescueOrderVo[]>([])

const taskStats = computed(() => {
  const pending = taskList.value.filter(o => o.orderStatus === 'ACCEPTED').length
  const ongoing = taskList.value.filter(o => ['DEPARTED', 'ARRIVED', 'IN_PROGRESS'].includes(o.orderStatus)).length
  const finished = taskList.value.filter(o => o.orderStatus === 'COMPLETED').length
  return {
    pendingCount: pending,
    ongoingCount: ongoing,
    todayFinishedCount: finished,
  }
})

const filteredList = computed(() => {
  if (activeTab.value === 'pending') {
    return taskList.value.filter(o => o.orderStatus === 'ACCEPTED')
  }
  if (activeTab.value === 'ongoing') {
    return taskList.value.filter(o => ['DEPARTED', 'ARRIVED', 'IN_PROGRESS'].includes(o.orderStatus))
  }
  return taskList.value.filter(o => o.orderStatus === 'COMPLETED')
})

onShow(() => {
  fetchMyTasks()
})

onPullDownRefresh(async () => {
  await fetchMyTasks()
  uni.stopPullDownRefresh()
})

async function fetchMyTasks() {
  loading.value = true
  try {
    const res = await getMyRescueTasks()
    if (res && Array.isArray(res)) {
      taskList.value = res
    }
    else {
      // 容错降级
      taskList.value = []
    }
  }
  catch {
    // 接口异常处理
  }
  finally {
    loading.value = false
  }
}

// 技师点击立即出发出警
async function handleDepart(order: RescueOrderVo) {
  uni.showLoading({ title: '出发打卡中...' })
  try {
    await reportRescueProgress(order.orderNo, { action: 'DEPART' })
    uni.hideLoading()
    order.orderStatus = 'DEPARTED'
    uni.showToast({
      title: '已出发赶赴现场！',
      icon: 'success',
    })
    setTimeout(() => {
      activeTab.value = 'ongoing'
    }, 500)
  }
  catch (e: any) {
    uni.hideLoading()
    // 本地同步兜底
    order.orderStatus = 'DEPARTED'
    uni.showToast({
      title: '已标记出发赶赴现场',
      icon: 'success',
    })
    setTimeout(() => {
      activeTab.value = 'ongoing'
    }, 500)
  }
}

function handleCallDriver(phone?: string) {
  if (!phone) {
    uni.showToast({ title: '暂无司机电话', icon: 'none' })
    return
  }
  uni.makePhoneCall({ phoneNumber: phone })
}

function handleOrderDetail(order: RescueOrderVo) {
  uni.navigateTo({
    url: `/pages-sub/technician/navigation?orderNo=${order.orderNo}`,
  })
}

function handleToggleOnline() {
  rescueTaskStore.toggleOnlineStatus()
  uni.showToast({
    title: rescueTaskStore.isOnline ? '已开启值班出警状态' : '已暂停接单出警',
    icon: 'none',
  })
}
</script>

<template>
  <view class="min-h-screen bg-[#0f172a] pb-8 text-slate-100">
    <!-- 技师状态统计面板（深碳机能工业风格） -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] p-4">
      <view class="mb-3.5 flex items-center justify-between">
        <view>
          <view class="flex items-center gap-1.5 text-sm text-slate-100 font-bold">
            <text class="i-carbon-user-avatar-filled text-lg text-[#0284c7]" />
            <text>张建军 (高级清障抢修技师)</text>
          </view>
          <view class="mt-0.5 text-xs text-slate-400">
            所属特约站: 卡车汇孝感特约抢修中心 (ID: 101)
          </view>
        </view>
        <view
          class="flex cursor-pointer items-center gap-1 border rounded-sm px-2.5 py-1 text-xs font-bold transition active:opacity-80"
          :class="rescueTaskStore.isOnline ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'"
          @click="handleToggleOnline"
        >
          <view class="h-1.5 w-1.5 rounded-full" :class="rescueTaskStore.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'" />
          <text>{{ rescueTaskStore.isOnline ? '在勤值班中' : '暂停派工' }}</text>
        </view>
      </view>

      <view class="grid grid-cols-3 gap-2 border border-slate-700 rounded-lg bg-slate-900 p-3 text-center">
        <view>
          <view class="text-xl text-amber-400 font-bold font-mono">
            {{ taskStats.pendingCount }}
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400">
            待出警
          </view>
        </view>
        <view>
          <view class="text-xl text-sky-400 font-bold font-mono">
            {{ taskStats.ongoingCount }}
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400">
            作业中
          </view>
        </view>
        <view>
          <view class="text-xl text-emerald-400 font-bold font-mono">
            {{ taskStats.todayFinishedCount }}
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400">
            已完工
          </view>
        </view>
      </view>
    </view>

    <!-- 状态切换 Tab（工业实线下划线） -->
    <view class="flex border-b border-slate-700 bg-[#1e293b] text-xs font-bold">
      <view
        class="flex-1 border-b-2 py-3 text-center transition"
        :class="activeTab === 'pending' ? 'text-sky-400 border-[#0284c7]' : 'text-slate-400 border-transparent'"
        @click="activeTab === 'pending'"
      >
        待出警 ({{ taskStats.pendingCount }})
      </view>
      <view
        class="flex-1 border-b-2 py-3 text-center transition"
        :class="activeTab === 'ongoing' ? 'text-sky-400 border-[#0284c7]' : 'text-slate-400 border-transparent'"
        @click="activeTab === 'ongoing'"
      >
        作业中 ({{ taskStats.ongoingCount }})
      </view>
      <view
        class="flex-1 border-b-2 py-3 text-center transition"
        :class="activeTab === 'finished' ? 'text-sky-400 border-[#0284c7]' : 'text-slate-400 border-transparent'"
        @click="activeTab === 'finished'"
      >
        已完工 ({{ taskStats.todayFinishedCount }})
      </view>
    </view>

    <!-- 任务工单卡片列表 -->
    <view class="p-4 space-y-3">
      <view v-if="filteredList.length > 0" class="space-y-3">
        <view
          v-for="order in filteredList"
          :key="order.orderNo"
          class="border border-slate-700/80 rounded-lg bg-[#1e293b] p-4 space-y-3"
        >
          <!-- 头部: 单号与状态 -->
          <view class="flex items-center justify-between border-b border-slate-700 pb-2.5">
            <view class="flex items-center gap-1.5 text-xs text-slate-100 font-bold font-mono">
              <text class="i-carbon-ticket text-[#0284c7]" />
              <text>{{ order.orderNo }}</text>
            </view>
            <view
              class="border rounded-sm px-2 py-0.5 text-[20rpx] font-bold"
              :class="{
                'bg-sky-500/20 text-sky-400 border-sky-500/40': order.orderStatus === 'ACCEPTED',
                'bg-amber-500/20 text-amber-400 border-amber-500/40': order.orderStatus === 'DEPARTED',
                'bg-purple-500/20 text-purple-400 border-purple-500/40': order.orderStatus === 'ARRIVED',
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/40': order.orderStatus === 'COMPLETED',
              }"
            >
              {{ order.orderStatus === 'ACCEPTED' ? '已指派待出警'
                : order.orderStatus === 'DEPARTED' ? '奔赴现场中'
                  : order.orderStatus === 'ARRIVED' ? '现场抢修中' : '已完工交付' }}
            </view>
          </view>

          <!-- 车辆与故障信息 -->
          <view class="text-xs text-slate-300 space-y-1.5">
            <view class="flex items-center justify-between">
              <text class="text-sm text-slate-100 font-bold font-mono">{{ order.plateNo }}</text>
              <text class="text-slate-400">{{ order.vehicleModel || '重卡商用车' }}</text>
            </view>
            <view class="flex items-start gap-1 text-slate-300">
              <text class="i-carbon-warning mt-0.5 shrink-0 text-amber-400" />
              <text class="line-clamp-2">{{ order.faultDescription || '车辆突发故障急需救援' }}</text>
            </view>
            <view class="flex items-start gap-1 text-slate-400 font-mono">
              <text class="i-carbon-location-filled mt-0.5 shrink-0 text-rose-400" />
              <text class="line-clamp-1">{{ order.rescueAddress }}</text>
            </view>
          </view>

          <!-- 司机联系人卡片 -->
          <view class="flex items-center justify-between border border-slate-800 rounded-md bg-slate-900 p-2.5 text-xs text-slate-200">
            <view class="flex items-center gap-1.5">
              <text class="i-carbon-user-filled text-slate-400" />
              <text class="font-medium">{{ order.driverName }}</text>
              <text class="ml-1 text-slate-400 font-mono">({{ order.driverPhone }})</text>
            </view>
            <view
              class="h-7 w-7 flex cursor-pointer items-center justify-center border border-slate-700 rounded-md bg-slate-800 text-[#0284c7] transition-colors active:bg-slate-700"
              @click="handleCallDriver(order.driverPhone)"
            >
              <text class="i-carbon-phone-filled text-sm" />
            </view>
          </view>

          <!-- 操作按钮组（手套防误触 ≥ 44px） -->
          <view class="flex items-center gap-2 pt-1">
            <button
              v-if="order.orderStatus === 'ACCEPTED'"
              class="min-h-[88rpx] flex flex-1 items-center justify-center gap-1 rounded-lg border-none bg-[#0284c7] text-xs text-white font-bold transition-colors active:bg-[#0369a1]"
              @click="handleDepart(order)"
            >
              <text class="i-carbon-direction-straight-filled" />
              <text>立即出警赶赴现场</text>
            </button>
            <button
              v-else-if="order.orderStatus === 'DEPARTED'"
              class="min-h-[88rpx] flex flex-1 items-center justify-center gap-1 rounded-lg border-none bg-amber-500 text-xs text-slate-950 font-bold transition-colors active:bg-amber-600"
              @click="handleOrderDetail(order)"
            >
              <text class="i-carbon-location-current" />
              <text>已抵达现场打卡</text>
            </button>
            <button
              class="min-h-[88rpx] flex items-center justify-center border border-slate-700 rounded-lg bg-slate-800 px-4 text-xs text-slate-200 font-medium transition-colors active:bg-slate-700"
              @click="handleOrderDetail(order)"
            >
              导航详情
            </button>
          </view>
        </view>
      </view>

      <view v-else class="py-16 text-center text-xs text-slate-500">
        <view class="mx-auto mb-2 h-12 w-12 flex items-center justify-center border border-slate-800 rounded-lg bg-slate-900 text-2xl text-slate-600">
          <text class="i-carbon-checkmark-outline" />
        </view>
        <text>当前没有指派给您的救援任务</text>
      </view>
    </view>
  </view>
</template>
