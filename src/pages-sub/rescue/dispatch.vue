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
    navigationBarBackgroundColor: '#0f172a',
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
  }
  else {
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
  if (!currentOrderNo.value)
    return
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
  if (!currentOrderNo.value)
    return
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
  if (!currentOrderNo.value)
    return
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
  <view class="dispatch-page min-h-screen flex flex-col justify-between bg-[#0f172a] pb-8 text-slate-100">
    <!-- 1. 顶部工单简报（刚性实线+深碳机能卡片） -->
    <view class="z-10 px-4 pt-3">
      <view class="flex items-center justify-between border border-slate-700/80 rounded-lg bg-[#1e293b] p-3">
        <view class="flex items-center gap-2">
          <view class="h-2.5 w-2.5 animate-ping rounded-full bg-amber-400" />
          <view class="text-xs">
            <text class="text-slate-100 font-bold font-mono">工单 {{ displayOrderNo }}</text>
            <text v-if="orderDetail?.dispatchMode === 'ASSIGNED_STATION'" class="ml-1.5 text-amber-400 font-bold">
              [客户指定网点]
            </text>
            <text v-else class="ml-1.5 text-sky-400 font-bold">
              [智能广播调度]
            </text>
          </view>
        </view>
        <view class="border border-slate-700 rounded-sm bg-slate-900 px-2 py-0.5 text-[20rpx] text-amber-400 font-bold font-mono">
          {{ displayPlateNo }}
        </view>
      </view>
    </view>

    <!-- 2. 中间：轻量矢量仿真地图 + 雷达脉冲扩散层 (工业硬派风) -->
    <view class="relative my-3 flex flex-1 items-center justify-center overflow-hidden">
      <!-- 底图仿真路网 -->
      <view class="absolute inset-x-4 inset-y-0 overflow-hidden border border-slate-700/80 rounded-lg bg-slate-900 opacity-75">
        <SimulatedMap
          height="100%"
          :truck-pos="{ x: 50, y: 50 }"
          :status-text="displayAddress"
        />
      </view>

      <!-- 雷达波纹动画与中心倒计时 -->
      <view class="pointer-events-none relative z-10 flex flex-col items-center justify-center">
        <RadarScanPulse size="240px" pulse-color="rgba(2, 132, 199, 0.45)" />

        <!-- 倒计时数字卡片 -->
        <view class="absolute flex flex-col items-center justify-center text-center">
          <text class="text-[20rpx] text-sky-300 font-bold tracking-widest uppercase">全网极速智能调度中</text>
          <text class="mt-0.5 text-3xl text-white font-black tracking-tight font-mono">
            {{ formattedCountdown }}
          </text>
          <view class="mt-2 flex items-center gap-1.5 border border-slate-700 rounded-sm bg-slate-900/90 px-2.5 py-1">
            <view class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <text class="text-[18rpx] text-slate-300 font-medium">已扫测周边 {{ scannedStationsCount }} 家认证特约站</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 底部操作区与调度说明卡片 -->
    <view class="z-10 px-4 space-y-3">
      <view class="border border-slate-700/80 rounded-lg bg-[#1e293b] p-3.5 text-xs">
        <view class="mb-1 flex items-center gap-2 text-sky-400 font-bold">
          <text class="i-carbon-radar animate-spin text-base" />
          <text>{{ orderDetail?.dispatchMode === 'ASSIGNED_STATION' ? '已定向指派至指定合作站调度中枢' : '智能就近派工机制全速匹配中' }}</text>
        </view>
        <view class="text-[22rpx] text-slate-400 leading-relaxed">
          {{ orderDetail?.dispatchMode === 'ASSIGNED_STATION'
            ? '工单已精准投递至您指定的网点调度中心，服务商主管正在分配当班出警技师与专业清障车。'
            : '系统正向周边 15km 内评分 4.8 以上的认证重卡服务商推送该工单，通常将在 120 秒内完成接单派工。' }}
        </view>
      </view>

      <!-- 原型快速演示：模拟技师立即接单 (保留供随时演练) -->
      <button
        class="min-h-[88rpx] w-full flex items-center justify-center gap-2 rounded-lg border-none bg-[#0284c7] text-sm text-white font-bold transition-colors active:bg-[#0369a1]"
        @click="handleOrderAccepted()"
      >
        <text class="i-carbon-checkmark-filled text-base" />
        <text>一键模拟服务商接单与技师派工</text>
      </button>

      <!-- 取消救援 -->
      <button
        class="min-h-[80rpx] w-full flex items-center justify-center border border-slate-700 rounded-lg bg-slate-800 text-xs text-slate-300 font-medium transition-colors active:bg-slate-700"
        @click="handleCancel"
      >
        取消本次呼救
      </button>
    </view>

    <!-- 4. 10分钟超时转平台智能调度提示对话框 (工业机能硬核弹窗) -->
    <view
      v-if="showTimeoutDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6"
    >
      <view class="max-w-xs w-full border border-slate-600 rounded-lg bg-[#1e293b] p-5 text-center shadow-2xl space-y-3">
        <view class="mx-auto h-12 w-12 flex items-center justify-center border border-amber-500/30 rounded-lg bg-amber-500/20 text-2xl text-amber-400">
          <text class="i-carbon-warning-alt-filled" />
        </view>
        <view class="text-sm text-white font-bold">
          指定网点响应超时提示
        </view>
        <view class="border border-slate-700 rounded-md bg-slate-900 p-3 text-left text-xs text-slate-300 leading-relaxed">
          您指定的特约服务站超过 10 分钟未接单响应，可能正处于抢险繁忙状态。为保障您的行车安全，建议立即转为【平台就近智能极速调度】向周边其他认证服务商广播。
        </view>
        <button
          class="min-h-[80rpx] w-full flex items-center justify-center rounded-lg border-none bg-[#0284c7] text-xs text-white font-bold active:bg-[#0369a1]"
          :disabled="transferring"
          @click="handleTransferToBroadcast"
        >
          {{ transferring ? '正在转单...' : '立即转为平台智能调度' }}
        </button>
        <button
          class="min-h-[72rpx] w-full flex items-center justify-center border-none bg-transparent text-xs text-slate-400 font-medium active:text-slate-200"
          @click="showTimeoutDialog = false"
        >
          继续等待该网点
        </button>
      </view>
    </view>
  </view>
</template>
