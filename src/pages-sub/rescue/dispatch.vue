<script lang="ts" setup>
import type { RescueOrderVo } from '@/types/rescue'
import { getRescueOrderDetail, transferToBroadcast } from '@/api/rescue'
import RadarScanPulse from '@/components/RadarScanPulse.vue'
import SimulatedMap from '@/components/SimulatedMap.vue'
import { useRescueSessionStore } from '@/store/rescueSession'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'

defineOptions({
  name: 'RescueDispatchPage',
})

definePage({
  style: {
    navigationBarTitleText: '智能调度中',
    navigationBarBackgroundColor: '#0e2238',
    navigationBarTextStyle: 'white',
  },
})

const rescueStore = useRescueSessionStore()
const { currentTicket } = storeToRefs(rescueStore)

const currentOrderNo = ref<string>('')
const orderDetail = ref<RescueOrderVo | null>(null)

// 120秒倒计时与超时判定
const countdownSeconds = ref<number>(120)
const elapsedSeconds = ref<number>(0)
const scannedStationsCount = ref<number>(6)

// 10分钟超时转单弹窗
const showTimeoutDialog = ref<boolean>(false)
const transferring = ref<boolean>(false)

let countdownTimer: ReturnType<typeof setInterval> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

const formattedCountdown = computed(() => {
  const m = Math.floor(countdownSeconds.value / 60)
  const s = countdownSeconds.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const displayOrderNo = computed(() => {
  return currentOrderNo.value || currentTicket.value?.ticketId || 'RES202610130001'
})

const displayPlateNo = computed(() => {
  return orderDetail.value?.plateNo || currentTicket.value?.plateNo || '鄂A·88888'
})

const displayAddress = computed(() => {
  return orderDetail.value?.rescueAddress || currentTicket.value?.location?.address || 'G107国道孝感段K128+500'
})

onLoad((query) => {
  if (query?.orderNo) {
    currentOrderNo.value = query.orderNo
    uni.setStorageSync('current_rescue_order_no', query.orderNo)
  } else {
    const cachedNo = uni.getStorageSync('current_rescue_order_no')
    if (cachedNo) {
      currentOrderNo.value = cachedNo
    }
  }
})

onMounted(() => {
  // 1. 首次立即查询一次工单真实详情
  if (currentOrderNo.value) {
    fetchOrderDetail()
  }

  // 2. 启动 1s 倒计时器
  countdownTimer = setInterval(() => {
    elapsedSeconds.value += 1
    if (countdownSeconds.value > 0) {
      countdownSeconds.value -= 1
      if (countdownSeconds.value % 15 === 0) {
        scannedStationsCount.value += 1
      }
    }

    // 若为客户指定网点且等待超过 600 秒 (10分钟) 则触发超时转单对话框
    if (orderDetail.value?.dispatchMode === 'ASSIGNED_STATION' && elapsedSeconds.value >= 600) {
      showTimeoutDialog.value = true
    }
  }, 1000)

  // 3. 启动 2.5 秒轻量 HTTP 短轮询
  pollTimer = setInterval(() => {
    pollOrderStatus()
  }, 2500)
})

onUnmounted(() => {
  clearAllTimers()
})

function clearAllTimers() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function fetchOrderDetail() {
  if (!currentOrderNo.value) return
  try {
    const res = await getRescueOrderDetail(currentOrderNo.value)
    if (res) {
      orderDetail.value = res
      if (res.orderStatus === 'ACCEPTED') {
        handleOrderAccepted(res)
      }
    }
  }
  catch {
    // 静默忽略
  }
}

async function pollOrderStatus() {
  if (!currentOrderNo.value) return
  try {
    const res = await getRescueOrderDetail(currentOrderNo.value)
    if (res) {
      orderDetail.value = res
      // 核心流转：检测到服务商已接单并指派技师
      if (res.orderStatus === 'ACCEPTED') {
        handleOrderAccepted(res)
      }
    }
  }
  catch {
    // 短轮询网络异常静默重试，不打断雷达动效
  }
}

function handleOrderAccepted(detail?: RescueOrderVo) {
  clearAllTimers()
  const techName = detail?.technicianName || '张建军'
  uni.showToast({
    title: `${techName}师傅已接单！`,
    icon: 'success',
  })

  // 同步本地 store
  rescueStore.mockAcceptTicket()

  setTimeout(() => {
    uni.redirectTo({
      url: `/pages-sub/rescue/tracking?orderNo=${currentOrderNo.value}`,
    })
  }, 800)
}

// 客户指定网点超时一键转平台智能就近调度
async function handleTransferToBroadcast() {
  if (!currentOrderNo.value) return
  transferring.value = true
  uni.showLoading({ title: '转入平台调度中...' })

  try {
    await transferToBroadcast(currentOrderNo.value)
    uni.hideLoading()
    transferring.value = false
    showTimeoutDialog.value = false

    // 重置倒计时，继续雷达波纹扫描
    countdownSeconds.value = 120
    elapsedSeconds.value = 0
    if (orderDetail.value) {
      orderDetail.value.dispatchMode = 'BROADCAST_GRAB'
      orderDetail.value.orderStatus = 'DISPATCHING'
    }

    uni.showToast({
      title: '已转为全网极速智能调度',
      icon: 'success',
    })
  }
  catch (e: any) {
    uni.hideLoading()
    transferring.value = false
    uni.showToast({
      title: e?.message || '转单失败',
      icon: 'none',
    })
  }
}

function handleCancel() {
  uni.showModal({
    title: '确认取消救援？',
    content: '取消后将终止调度，如有紧急需要可随时重新发起。',
    confirmText: '确定取消',
    cancelText: '继续等待',
    confirmColor: '#ff4d4f',
    success: (res) => {
      if (res.confirm) {
        clearAllTimers()
        rescueStore.cancelTicket()
        uni.showToast({ title: '已取消救援', icon: 'none' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/rescue/index' })
        }, 500)
      }
    },
  })
}
</script>

<template>
  <view class="dispatch-page min-h-screen bg-[#0e2238] text-white flex flex-col justify-between pb-8">
    <!-- 1. 顶部工单简报 -->
    <view class="pt-3 px-4 z-10">
      <view class="bg-white/10 backdrop-blur rounded-2xl p-3 flex items-center justify-between border border-white/10">
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <view class="text-xs">
            <text class="font-bold font-mono">工单 {{ displayOrderNo }}</text>
            <text v-if="orderDetail?.dispatchMode === 'ASSIGNED_STATION'" class="text-amber-300 ml-1.5 font-bold">
              [客户指定网点]
            </text>
            <text v-else class="text-blue-300 ml-1.5">
              [智能广播调度]
            </text>
          </view>
        </view>
        <text class="text-[20rpx] text-amber-300 font-mono">{{ displayPlateNo }}</text>
      </view>
    </view>

    <!-- 2. 中间：轻量矢量仿真地图 + 雷达脉冲扩散层 (对标 救援4.jpeg) -->
    <view class="relative flex-1 my-3 flex items-center justify-center overflow-hidden">
      <!-- 底图仿真路网 -->
      <view class="absolute inset-x-4 inset-y-0 rounded-3xl overflow-hidden opacity-75 shadow-inner border border-white/10">
        <SimulatedMap
          height="100%"
          :truck-pos="{ x: 50, y: 50 }"
          :status-text="displayAddress"
        />
      </view>

      <!-- 雷达波纹动画与中心倒计时 -->
      <view class="relative z-10 flex flex-col items-center justify-center pointer-events-none">
        <RadarScanPulse size="240px" pulse-color="rgba(22, 119, 255, 0.45)" />

        <!-- 倒计时数字卡片 -->
        <view class="absolute flex flex-col items-center justify-center text-center">
          <text class="text-[20rpx] uppercase tracking-widest text-blue-200 font-medium">调度等待中</text>
          <text class="text-3xl font-black font-mono tracking-tight text-white drop-shadow-md">
            {{ formattedCountdown }}
          </text>
          <view class="mt-1 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur">
            <view class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <text class="text-[18rpx] text-white/80">已扫描周边 {{ scannedStationsCount }} 家特约站</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 底部操作区与调度说明卡片 -->
    <view class="px-4 space-y-3 z-10">
      <view class="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 text-xs">
        <view class="flex items-center gap-2 font-bold text-blue-300 mb-1">
          <text class="i-carbon-radar text-base animate-spin" />
          <text>{{ orderDetail?.dispatchMode === 'ASSIGNED_STATION' ? '已定向指派至指定合作站PC端' : '智能就近派单机制生效中' }}</text>
        </view>
        <view class="text-[22rpx] text-white/70 leading-relaxed">
          {{ orderDetail?.dispatchMode === 'ASSIGNED_STATION'
            ? '工单已精准投递至您指定的网点调度中心，服务商主管正在分配当班出警技师与清障车。'
            : '系统正向周边 15km 内评分 4.8 以上的认证重卡服务商推送该工单，通常将在 120 秒内完成接单派工。' }}
        </view>
      </view>

      <!-- 原型快速演示：模拟技师立即接单 (保留供随时演练) -->
      <button
        class="w-full bg-[#1677ff] hover:bg-blue-600 text-white font-bold text-sm py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 border-none active:opacity-90"
        @click="handleOrderAccepted()"
      >
        <text class="i-carbon-checkmark-filled text-base" />
        <text>一键模拟服务商PC接单与技师派工</text>
      </button>

      <!-- 取消救援 -->
      <button
        class="w-full bg-white/10 text-white/80 font-medium text-xs py-2.5 rounded-xl border border-white/15 active:bg-white/20"
        @click="handleCancel"
      >
        取消救援
      </button>
    </view>

    <!-- 4. 10分钟超时转平台智能调度提示对话框 -->
    <view
      v-if="showTimeoutDialog"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <view class="bg-[#132d4a] rounded-3xl p-5 border border-white/20 shadow-2xl w-full max-w-xs text-center space-y-3">
        <view class="w-12 h-12 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto text-2xl">
          <text class="i-carbon-warning-alt-filled" />
        </view>
        <view class="text-sm font-bold text-white">指定网点响应超时提示</view>
        <view class="text-xs text-white/70 leading-relaxed text-left bg-white/5 p-3 rounded-xl border border-white/10">
          您指定的特约服务站超过 10 分钟未接单响应，可能正处于抢险繁忙状态。为保障您的行车安全，建议立即转为【平台就近智能极速调度】向周边其他服务商广播。
        </view>
        <button
          class="w-full bg-[#1677ff] text-white font-bold py-2.5 rounded-xl text-xs border-none active:opacity-90"
          :disabled="transferring"
          @click="handleTransferToBroadcast"
        >
          {{ transferring ? '正在转单...' : '立即转为平台智能调度' }}
        </button>
        <button
          class="w-full bg-transparent text-white/60 font-medium py-1.5 text-xs border-none"
          @click="showTimeoutDialog = false"
        >
          继续等待该网点
        </button>
      </view>
    </view>
  </view>
</template>
