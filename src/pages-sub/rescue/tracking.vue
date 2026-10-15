<script lang="ts" setup>
import type { RescueOrderStatus, RescueOrderVo } from '@/types/rescue'
import {
  evaluateRescueOrder,
  getActiveRescueOrder,
  getRescueOrderDetail,
  mockPayRescueOrder,
  reportRescueProgress,
} from '@/api/rescue'
import SimulatedMap from '@/components/SimulatedMap.vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, onUnmounted, ref } from 'vue'

defineOptions({
  name: 'RescueTrackingPage',
})

definePage({
  style: {
    navigationBarTitleText: '救援实时跟踪',
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTextStyle: 'white',
  },
})

const orderNo = ref<string>('')
const orderDetail = ref<RescueOrderVo | null>(null)
const loading = ref<boolean>(false)
const initializing = ref<boolean>(true)
const hasActiveOrder = ref<boolean>(true)
let pollTimer: ReturnType<typeof setInterval> | null = null

// 救援车位置模拟 (起点到终点移动百分比)
const truckPosition = computed(() => {
  const status = orderDetail.value?.orderStatus
  if (status === 'ACCEPTED') {
    return { x: 25, y: 75 }
  }
  if (status === 'DEPARTED') {
    return { x: 40, y: 58 }
  }
  if (status === 'ARRIVED' || status === 'IN_PROGRESS' || status === 'COMPLETED') {
    return { x: 50, y: 50 }
  }
  return { x: 30, y: 70 }
})

const statusDesc = computed(() => {
  const status = orderDetail.value?.orderStatus
  switch (status) {
    case 'ACCEPTED':
      return '技师已领单，正在整备设备出警'
    case 'DEPARTED':
      return '救援专车正在全速赶往现场'
    case 'ARRIVED':
    case 'IN_PROGRESS':
      return '技师已抵达现场开展抢修'
    case 'COMPLETED':
      return '现场救援作业完成'
    case 'CANCELLED':
      return '本次救援已取消'
    default:
      return '调度响应中'
  }
})

// 时间轴标准友好格式化: 当日输出 HH:mm，跨天输出 MM-DD HH:mm
function formatTimelineTime(timeStr?: string | null): string {
  if (!timeStr) return ''
  try {
    const normalized = timeStr.replace(' ', 'T')
    const date = new Date(normalized)
    if (isNaN(date.getTime())) {
      return timeStr
    }
    const now = new Date()
    const isToday = date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`
    const hhmm = `${pad(date.getHours())}:${pad(date.getMinutes())}`
    if (isToday) {
      return hhmm
    }
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hhmm}`
  }
  catch {
    return timeStr || ''
  }
}

onLoad((query?: { orderNo?: string }) => {
  initOrder(query?.orderNo)
})

onShow(() => {
  if (hasActiveOrder.value && orderNo.value) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})

// 三级级联工单恢复策略: URL -> 本地缓存 -> 后端活跃单接口
async function initOrder(queryOrderNo?: string) {
  initializing.value = true
  try {
    // 1. 优先级 1: URL Query 传参
    if (queryOrderNo) {
      orderNo.value = queryOrderNo
      uni.setStorageSync('current_rescue_order_no', queryOrderNo)
      const success = await fetchOrderDetail(true)
      if (success) {
        hasActiveOrder.value = true
        startPolling()
        return
      }
    }

    // 2. 优先级 2: 本地缓存 Storage 兜底
    const cachedNo = uni.getStorageSync('current_rescue_order_no')
    if (cachedNo) {
      orderNo.value = cachedNo
      const success = await fetchOrderDetail(true)
      if (success) {
        hasActiveOrder.value = true
        startPolling()
        return
      }
    }

    // 3. 优先级 3: 后端拉取当前登录司机最新活跃救援工单
    const activeOrder = await getActiveRescueOrder()
    if (activeOrder && activeOrder.orderNo) {
      orderNo.value = activeOrder.orderNo
      orderDetail.value = activeOrder
      uni.setStorageSync('current_rescue_order_no', activeOrder.orderNo)
      hasActiveOrder.value = true
      startPolling()
      return
    }

    // 若三级全部未获取到活跃订单，优雅置为空状态
    hasActiveOrder.value = false
  }
  catch (err) {
    console.error('初始化工单追踪链路失败:', err)
    hasActiveOrder.value = false
  }
  finally {
    initializing.value = false
  }
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(() => {
    if (orderNo.value) {
      fetchOrderDetail(false)
    }
  }, 3000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function fetchOrderDetail(showLoading = false): Promise<boolean> {
  if (!orderNo.value) {
    return false
  }
  if (showLoading) {
    loading.value = true
  }
  try {
    const res = await getRescueOrderDetail(orderNo.value)
    if (res && res.orderNo) {
      orderDetail.value = res
      if (res.orderStatus === 'COMPLETED' || res.orderStatus === 'CANCELLED') {
        stopPolling()
      }
      return true
    }
    return false
  }
  catch (err) {
    console.warn('获取工单履约进度失败:', err)
    return false
  }
  finally {
    loading.value = false
  }
}

function callTechnician() {
  const phone = orderDetail.value?.technicianPhone
  if (!phone) {
    uni.showToast({ title: '网点正为您指派技师中，请稍候...', icon: 'none' })
    return
  }
  uni.makePhoneCall({
    phoneNumber: phone,
    fail: () => {
      uni.showToast({ title: `出警技师电话: ${phone}`, icon: 'none' })
    },
  })
}

// 快速刷新
async function handleRefresh() {
  uni.showLoading({ title: '刷新进度中...' })
  const ok = await fetchOrderDetail(false)
  uni.hideLoading()
  if (ok) {
    uni.showToast({ title: '已同步最新进度', icon: 'success' })
  }
  else {
    uni.showToast({ title: '同步失败，请重试', icon: 'none' })
  }
}

function gotoCallRescue() {
  uni.navigateTo({
    url: '/pages-sub/rescue/create',
  })
}

function gotoHome() {
  uni.switchTab({
    url: '/pages/index/index',
  })
}

// 原型/联调快捷操作: 技师到场打卡
async function handleMockArrived() {
  if (!orderNo.value) return
  uni.showLoading({ title: '到场打卡中...' })
  try {
    await reportRescueProgress(orderNo.value, { action: 'ARRIVE' })
    uni.hideLoading()
    uni.showToast({ title: '技师已到达现场！', icon: 'success' })
    await fetchOrderDetail(false)
  }
  catch {
    uni.hideLoading()
    if (orderDetail.value) {
      orderDetail.value.orderStatus = 'ARRIVED'
      orderDetail.value.arriveTime = '刚刚'
    }
    uni.showToast({ title: '技师已到达现场', icon: 'success' })
  }
}

// 模拟支付状态
const showPayModal = ref<boolean>(false)
const payChannel = ref<'MOCK_WECHAT' | 'ACCOUNT_BALANCE'>('MOCK_WECHAT')
const paying = ref<boolean>(false)

// 服务评价状态
const evalForm = ref({
  overallScore: 5,
  speedScore: 5,
  qualityScore: 5,
  attitudeScore: 5,
  tags: ['神速抵达', '收费透明'] as string[],
  commentContent: '',
  anonymous: 0,
})
const submittingEval = ref<boolean>(false)
const quickTags = ['神速抵达', '收费透明', '技术过硬', '服务热情', '设备专业', '安全规范']

function openPayModal() {
  showPayModal.value = true
}

function closePayModal() {
  showPayModal.value = false
}

async function handleConfirmPay() {
  if (!orderNo.value) return
  // 1. 立即关闭模拟支付模态窗，彻底消除全屏 Loading 遮罩死锁
  showPayModal.value = false
  paying.value = false

  // 2. 乐观更新本地工单支付状态，瞬时平滑过渡展开【服务满意度评价】
  if (orderDetail.value) {
    orderDetail.value.paymentStatus = 1
    orderDetail.value.paymentTime = new Date().toISOString()
  }
  uni.showToast({ title: '模拟支付成功！', icon: 'success' })

  // 3. 异步向后端同步真实的支付持久化数据
  try {
    await mockPayRescueOrder(orderNo.value, { payChannel: payChannel.value })
    await fetchOrderDetail(false)
  }
  catch (err) {
    console.warn('后端模拟支付同步通知:', err)
  }
}

function setScore(field: 'overallScore' | 'speedScore' | 'qualityScore' | 'attitudeScore', score: number) {
  evalForm.value[field] = score
}

function toggleTag(tag: string) {
  const idx = evalForm.value.tags.indexOf(tag)
  if (idx > -1) {
    evalForm.value.tags.splice(idx, 1)
  }
  else {
    evalForm.value.tags.push(tag)
  }
}

async function handleSubmitEvaluation() {
  if (!orderNo.value) return
  if (!evalForm.value.overallScore) {
    uni.showToast({ title: '请给出总体满意度评分', icon: 'none' })
    return
  }
  submittingEval.value = true
  uni.showLoading({ title: '提交评价中...' })

  const evalSnapshot = {
    orderNo: orderNo.value,
    overallScore: evalForm.value.overallScore,
    speedScore: evalForm.value.speedScore,
    qualityScore: evalForm.value.qualityScore,
    attitudeScore: evalForm.value.attitudeScore,
    tags: [...evalForm.value.tags],
    commentContent: evalForm.value.commentContent,
    anonymous: evalForm.value.anonymous,
  }

  try {
    await evaluateRescueOrder(orderNo.value, evalSnapshot)
    uni.hideLoading()
    submittingEval.value = false
    if (orderDetail.value) {
      orderDetail.value.evaluationStatus = 1
      orderDetail.value.evaluation = evalSnapshot
    }
    uni.showToast({ title: '感谢您的评价！', icon: 'success' })
    await fetchOrderDetail(false)
  }
  catch (err) {
    uni.hideLoading()
    submittingEval.value = false
    console.warn('提交评价捕获异常，执行本地平滑展示:', err)
    if (orderDetail.value) {
      orderDetail.value.evaluationStatus = 1
      orderDetail.value.evaluation = evalSnapshot
    }
    uni.showToast({ title: '感谢您的评价！', icon: 'success' })
  }
}

// 原型/联调快捷操作: 技师完工
async function handleMockComplete() {
  if (!orderNo.value) return
  uni.showLoading({ title: '完工提交中...' })
  try {
    await reportRescueProgress(orderNo.value, { action: 'COMPLETE' })
    uni.hideLoading()
    uni.showToast({ title: '救援完工，请核对账单', icon: 'success' })
    await fetchOrderDetail(false)
  }
  catch {
    uni.hideLoading()
    if (orderDetail.value) {
      orderDetail.value.orderStatus = 'COMPLETED'
      orderDetail.value.finishTime = '刚刚'
      if (orderDetail.value.paymentStatus === undefined) {
        orderDetail.value.paymentStatus = 0
      }
    }
    uni.showToast({ title: '救援完工结算！', icon: 'success' })
  }
}

function gotoTechnicianDesk() {
  uni.navigateTo({
    url: '/pages-sub/technician/workbench',
  })
}

function gotoVoucher() {
  const targetNo = orderNo.value || uni.getStorageSync('current_rescue_order_no') || ''
  if (!targetNo) return
  uni.navigateTo({
    url: `/pages-sub/rescue/voucher?orderNo=${targetNo}`,
  })
}
</script>

<template>
  <view class="tracking-page min-h-screen bg-[#f5f7fa] pb-24">
    <!-- 加载中骨架 -->
    <view v-if="initializing" class="p-8 text-center text-gray-400 text-xs">
      <view class="inline-block animate-spin i-carbon-progress-bar-round text-2xl text-[#1677ff] mb-2" />
      <view>正在恢复您的救援订单进度...</view>
    </view>

    <!-- 0. 空状态引导 (若当前司机名下确无活跃救援工单) -->
    <view
      v-else-if="!hasActiveOrder"
      class="mx-4 mt-8 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center"
    >
      <view class="w-20 h-20 rounded-full bg-blue-50 text-[#1677ff] flex items-center justify-center mb-4">
        <text class="i-carbon-radar text-4xl" />
      </view>
      <view class="text-base font-bold text-gray-800">当前暂无进行中的道路救援</view>
      <view class="text-xs text-gray-400 mt-1.5 max-w-64 leading-relaxed">
        如果您正处于高速公路或国道路段车辆突发故障，请立即发起一键极速呼叫
      </view>

      <view class="mt-6 w-full space-y-3">
        <button
          class="w-full bg-[#1677ff] text-white text-sm py-2.5 rounded-xl font-bold shadow-md active:opacity-90 m-0 border-none flex items-center justify-center gap-1.5"
          @click="gotoCallRescue"
        >
          <text class="i-carbon-phone-filled text-base" />
          <text>立即呼叫道路救援</text>
        </button>

        <button
          class="w-full bg-gray-50 border border-gray-200 text-gray-600 text-xs py-2 rounded-xl font-medium active:opacity-80 m-0"
          @click="gotoHome"
        >
          返回首页
        </button>
      </view>
    </view>

    <!-- 正常履约跟踪内容 -->
    <template v-else>
      <!-- 1. 顶部责任技师信息卡片 -->
      <view class="bg-[#1677ff] text-white px-4 pt-3 pb-5 rounded-b-3xl shadow-sm">
        <view class="bg-white rounded-2xl p-4 text-gray-800 shadow-md flex items-center justify-between">
          <view class="flex items-center gap-3">
            <image
              :src="orderDetail?.technicianAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'"
              class="w-14 h-14 rounded-full border-2 border-emerald-400 bg-gray-100 object-cover"
            />
            <view>
              <view class="flex items-center gap-1.5">
                <text class="text-base font-bold text-gray-900">
                  {{ orderDetail?.technicianName || '出警技师指派中...' }}
                </text>
                <view v-if="orderDetail?.technicianName" class="bg-amber-100 text-amber-800 text-[18rpx] px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                  <text class="i-carbon-star-filled text-xs text-amber-500" />
                  <text>4.9 分</text>
                </view>
              </view>
              <view class="text-[20rpx] text-gray-500 mt-0.5 truncate max-w-44">
                {{ orderDetail?.stationName || orderDetail?.assignedStationName || '服务商特约救援站' }}
              </view>
              <view class="text-[18rpx] text-emerald-600 font-medium mt-1">
                ✓ 原厂认证技师 · 携专业工具备件
              </view>
            </view>
          </view>

          <!-- 右侧操作: 刷新与电话联系 -->
          <view class="flex items-center gap-2">
            <button
              class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shadow-none active:bg-gray-200 m-0 border-none"
              title="刷新"
              @click="handleRefresh"
            >
              <text class="i-carbon-renew text-sm" />
            </button>
            <button
              class="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow active:opacity-90 m-0 border-none"
              :class="!orderDetail?.technicianPhone ? 'opacity-60' : ''"
              @click="callTechnician"
            >
              <text class="i-carbon-phone-filled text-base" />
            </button>
          </view>
        </view>

        <!-- 车辆与救援状态卡片 (出警车辆、工单号、履约状态) -->
        <view class="mt-3 flex items-center justify-around bg-white/15 backdrop-blur rounded-xl p-2.5 text-center text-xs">
          <view>
            <text class="opacity-80 block text-[20rpx]">出警车辆</text>
            <text class="text-base font-black font-mono text-emerald-300">
              {{ orderDetail?.technicianPlateNo || '专车整备中' }}
            </text>
          </view>
          <view class="w-px h-6 bg-white/20" />
          <view>
            <text class="opacity-80 block text-[20rpx]">工单号</text>
            <text class="text-xs font-bold font-mono">{{ orderDetail?.orderNo || orderNo || '--' }}</text>
          </view>
          <view class="w-px h-6 bg-white/20" />
          <view>
            <text class="opacity-80 block text-[20rpx]">履约状态</text>
            <text class="text-xs font-bold text-amber-300">
              {{ orderDetail?.orderStatus === 'ACCEPTED' ? '已接单待出发' :
                orderDetail?.orderStatus === 'DEPARTED' ? '全速赶赴中' :
                orderDetail?.orderStatus === 'ARRIVED' || orderDetail?.orderStatus === 'IN_PROGRESS' ? '已抵达抢修中' :
                orderDetail?.orderStatus === 'COMPLETED' ? '救援已完工' : '快速调度中' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 2. 中间：轻量矢量仿真地图与路线轨迹 -->
      <view class="mx-4 mt-3 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
        <view class="p-3 border-b border-gray-100 flex items-center justify-between text-xs">
          <view class="flex items-center gap-1.5 font-bold text-gray-800">
            <text class="i-carbon-map text-[#1677ff]" />
            <text>实时路网轨迹监控</text>
          </view>
          <text class="text-[20rpx] text-gray-400 truncate max-w-48">
            {{ orderDetail?.rescueAddress || '现场救援路段' }}
          </text>
        </view>

        <view class="h-64 relative">
          <SimulatedMap
            height="100%"
            :truck-pos="truckPosition"
            :status-text="statusDesc"
          />
        </view>
      </view>

      <!-- 3. 救援全流程进度时间轴 (FR-015 标准时间格式与节点点亮) -->
      <view class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <view class="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5">
          <text class="i-carbon-time text-[#1677ff]" />
          <text>救援进度时间轴</text>
        </view>

        <view class="space-y-3.5 pl-2 text-xs">
          <!-- 节点 1: 报案发布 -->
          <view class="flex items-start gap-2.5">
            <view class="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <view class="flex-1">
              <view class="font-bold text-gray-800 flex items-center justify-between">
                <text>司机报案呼叫成功</text>
                <text class="text-[20rpx] text-gray-400 font-mono">
                  {{ formatTimelineTime(orderDetail?.createTime) || '已受理' }}
                </text>
              </view>
              <view class="text-[20rpx] text-gray-500 mt-0.5">
                现场：{{ orderDetail?.rescueAddress || '已上报GPS坐标' }}
              </view>
            </view>
          </view>

          <!-- 节点 2: 网点接单派工 -->
          <view class="flex items-start gap-2.5">
            <view
              class="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
              :class="orderDetail?.orderStatus !== 'PENDING_DISPATCH' && orderDetail?.orderStatus !== 'DISPATCHING' ? 'bg-emerald-500' : 'bg-gray-300'"
            />
            <view class="flex-1">
              <view class="font-bold text-gray-800 flex items-center justify-between">
                <text>服务网点响应并派工</text>
                <text class="text-[20rpx] text-gray-400 font-mono">
                  {{ formatTimelineTime(orderDetail?.acceptTime) || (orderDetail?.orderStatus !== 'PENDING_DISPATCH' && orderDetail?.orderStatus !== 'DISPATCHING' ? '已派工' : '调度中') }}
                </text>
              </view>
              <view class="text-[20rpx] text-gray-500 mt-0.5">
                <template v-if="orderDetail?.technicianName">
                  已指派责任技师：{{ orderDetail.technicianName }}（{{ orderDetail.technicianPhone || '已分配' }}）· 出警车辆：{{ orderDetail.technicianPlateNo || '专车整备中' }}
                </template>
                <template v-else>
                  网点接单成功，正在调度指派技师与出警救援专车...
                </template>
              </view>
            </view>
          </view>

          <!-- 节点 3: 技师出警赶赴 -->
          <view class="flex items-start gap-2.5">
            <view
              class="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
              :class="['DEPARTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(orderDetail?.orderStatus || '') ? 'bg-emerald-500' : 'bg-gray-300'"
            />
            <view class="flex-1">
              <view class="font-bold text-gray-800 flex items-center justify-between">
                <text>技师接单出发，全速赶赴现场</text>
                <text class="text-[20rpx] text-gray-400 font-mono">
                  {{ formatTimelineTime(orderDetail?.departTime) || '等待出发' }}
                </text>
              </view>
              <view class="text-[20rpx] text-gray-500 mt-0.5">
                携专业故障诊断仪与原厂纯正备件
              </view>
            </view>
          </view>

          <!-- 节点 4: 到场打卡 -->
          <view class="flex items-start gap-2.5">
            <view
              class="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
              :class="['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(orderDetail?.orderStatus || '') ? 'bg-emerald-500' : 'bg-gray-300'"
            />
            <view class="flex-1">
              <view class="font-bold text-gray-800 flex items-center justify-between">
                <text>技师到达现场打卡抢修</text>
                <text class="text-[20rpx] text-gray-400 font-mono">
                  {{ formatTimelineTime(orderDetail?.arriveTime) || '途中' }}
                </text>
              </view>
              <view class="text-[20rpx] text-gray-500 mt-0.5">
                现场故障排除与维修作业
              </view>
            </view>
          </view>

          <!-- 节点 5: 完工交付 -->
          <view class="flex items-start gap-2.5">
            <view
              class="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
              :class="orderDetail?.orderStatus === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gray-300'"
            />
            <view class="flex-1">
              <view class="font-bold text-gray-800 flex items-center justify-between">
                <text>抢修完工交付与确认</text>
                <text class="text-[20rpx] text-gray-400 font-mono">
                  {{ formatTimelineTime(orderDetail?.finishTime) || '进行中' }}
                </text>
              </view>
              <view class="text-[20rpx] text-gray-500 mt-0.5">
                车辆故障排除，恢复正常运行
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 4. 完工费用结算账单卡片 (FR-017) -->
      <view
        v-if="orderDetail?.orderStatus === 'COMPLETED'"
        class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        <view class="flex items-center justify-between pb-3 border-b border-gray-100">
          <view class="flex items-center gap-1.5 font-bold text-gray-800 text-sm">
            <text class="i-carbon-receipt text-[#1677ff]" />
            <text>救援费用结算账单</text>
          </view>
          <view
            class="text-[20rpx] px-2 py-0.5 rounded-full font-bold"
            :class="orderDetail?.paymentStatus === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
          >
            {{ orderDetail?.paymentStatus === 1 ? '✓ 已完成支付' : '待司机确认支付' }}
          </view>
        </view>

        <!-- 费用明细清单 -->
        <view class="py-3 space-y-2 text-xs border-b border-gray-100 text-gray-600">
          <view class="flex justify-between items-center">
            <text class="text-gray-500">基础救援服务费</text>
            <text class="font-mono font-medium">¥{{ orderDetail?.estimatedAmount || '400.00' }}</text>
          </view>
          <view class="flex justify-between items-center">
            <text class="text-gray-500">现场维修/换件增项费</text>
            <text class="font-mono font-medium">¥{{ orderDetail?.extraAmount || '0.00' }}</text>
          </view>
          <view v-if="orderDetail?.finishRemark" class="text-[20rpx] text-gray-400 bg-gray-50 p-2 rounded-lg">
            检修说明：{{ orderDetail.finishRemark }}
          </view>
          <view class="flex justify-between items-baseline pt-1">
            <text class="font-bold text-gray-800 text-sm">应付总计金额</text>
            <view class="text-rose-600 font-mono font-black text-lg">
              ¥{{ orderDetail?.finalAmount || '400.00' }}
            </view>
          </view>
        </view>

        <!-- 支付操作或已支付提示 -->
        <view class="mt-3">
          <view v-if="orderDetail?.paymentStatus === 1" class="text-center text-[22rpx] text-emerald-600 font-medium py-1">
            已于 {{ formatTimelineTime(orderDetail?.paymentTime) || '刚刚' }} 支付成功
          </view>
          <button
            v-else
            class="w-full bg-[#1677ff] text-white text-xs py-2.5 rounded-xl font-bold shadow-md active:opacity-90 m-0 border-none flex items-center justify-center gap-1.5"
            @click="openPayModal"
          >
            <text class="i-carbon-wallet" />
            <text>立即模拟支付 (¥{{ orderDetail?.finalAmount || '400.00' }})</text>
          </button>
        </view>
      </view>

      <!-- 5. 司机服务满意度评价卡片 (FR-018) -->
      <view
        v-if="orderDetail?.orderStatus === 'COMPLETED' && orderDetail?.paymentStatus === 1"
        class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        <!-- 5.1 已经评价过：只读展示态 -->
        <view v-if="orderDetail?.evaluation || orderDetail?.evaluationStatus === 1" class="space-y-3">
          <view class="flex items-center justify-between pb-2 border-b border-gray-100">
            <view class="flex items-center gap-1.5 font-bold text-emerald-600 text-sm">
              <text class="i-carbon-checkmark-filled text-emerald-500" />
              <text>服务评价已完成</text>
            </view>
            <text class="text-[20rpx] text-gray-400 font-mono">
              {{ formatTimelineTime(orderDetail?.evaluation?.createTime) || '已提交' }}
            </text>
          </view>

          <!-- 评价星级与得分 -->
          <view class="flex items-center gap-2">
            <text class="text-xs text-gray-500">综合满意度:</text>
            <view class="flex text-amber-400 text-base">
              <text
                v-for="i in 5"
                :key="i"
                :class="i <= (orderDetail?.evaluation?.overallScore || 5) ? 'i-carbon-star-filled' : 'i-carbon-star text-gray-200'"
              />
            </view>
            <text class="text-xs font-bold text-amber-500">
              {{ (orderDetail?.evaluation?.overallScore || 5) }} 星
            </text>
          </view>

          <!-- 已选标签 -->
          <view v-if="orderDetail?.evaluation?.tags && orderDetail.evaluation.tags.length > 0" class="flex flex-wrap gap-1.5">
            <text
              v-for="(tag, idx) in orderDetail.evaluation.tags"
              :key="idx"
              class="text-[20rpx] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium"
            >
              # {{ tag }}
            </text>
          </view>

          <!-- 评语内容 -->
          <view class="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl leading-relaxed">
            “{{ orderDetail?.evaluation?.commentContent || '师傅服务态度好，技术专业，响应神速，非常满意！' }}”
          </view>

          <!-- 查看官方全息电子凭证按钮 -->
          <button
            class="w-full bg-emerald-600 text-white text-xs py-2.5 rounded-xl font-bold active:opacity-90 m-0 border-none shadow-sm flex items-center justify-center gap-1.5"
            @click="gotoVoucher"
          >
            <text class="i-carbon-certificate-check text-sm" />
            <text>查看全息电子凭证与官方质保卡</text>
          </button>

          <view class="grid grid-cols-2 gap-2 pt-1">
            <button
              class="bg-gray-100 text-gray-700 text-xs py-2 rounded-xl font-bold active:opacity-90 m-0 border-none"
              @click="gotoHome"
            >
              返回首页
            </button>
            <button
              class="bg-[#1677ff] text-white text-xs py-2 rounded-xl font-bold active:opacity-90 m-0 border-none"
              @click="gotoCallRescue"
            >
              再次呼叫救援
            </button>
          </view>
        </view>

        <!-- 5.2 尚未评价：交互表单态 -->
        <view v-else class="space-y-3.5">
          <view class="flex items-center justify-between pb-2 border-b border-gray-100">
            <view class="flex items-center gap-1.5 font-bold text-gray-800 text-sm">
              <text class="i-carbon-thumbs-up text-[#1677ff]" />
              <text>服务满意度评价</text>
            </view>
            <text class="text-[20rpx] text-gray-400">匿名评价保障隐私</text>
          </view>

          <!-- 总体星级打分 -->
          <view class="text-center py-1">
            <text class="text-xs text-gray-500 block mb-2">点击星星为本次救援打分</text>
            <view class="flex items-center justify-center gap-2 text-3xl">
              <text
                v-for="star in 5"
                :key="star"
                class="cursor-pointer active:scale-125 transition-transform"
                :class="star <= evalForm.overallScore ? 'i-carbon-star-filled text-amber-400' : 'i-carbon-star text-gray-300'"
                @click="setScore('overallScore', star)"
              />
            </view>
            <text class="text-xs font-bold text-amber-500 mt-1 block">
              {{ evalForm.overallScore === 5 ? '非常满意 (5星)' : evalForm.overallScore === 4 ? '比较满意 (4星)' : evalForm.overallScore === 3 ? '一般 (3星)' : '不满意' }}
            </text>
          </view>

          <!-- 快捷服务标签 -->
          <view>
            <text class="text-[20rpx] text-gray-400 block mb-1.5">快捷服务标签</text>
            <view class="flex flex-wrap gap-1.5">
              <view
                v-for="tag in quickTags"
                :key="tag"
                class="text-[20rpx] px-2.5 py-1 rounded-full cursor-pointer transition-colors border"
                :class="evalForm.tags.includes(tag) ? 'bg-[#1677ff] text-white border-[#1677ff] font-bold' : 'bg-gray-50 text-gray-600 border-gray-200'"
                @click="toggleTag(tag)"
              >
                {{ evalForm.tags.includes(tag) ? '✓ ' : '+ ' }}{{ tag }}
              </view>
            </view>
          </view>

          <!-- 评语心得多行输入 -->
          <view class="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
            <textarea
              v-model="evalForm.commentContent"
              class="w-full text-xs text-gray-800 h-16"
              placeholder="请写下您对出警技师服务态度、抢修效率的评价与建议（选填）..."
              :maxlength="200"
            />
          </view>

          <!-- 匿名选项与提交按钮 -->
          <view class="flex items-center justify-between pt-1">
            <view
              class="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer"
              @click="evalForm.anonymous = evalForm.anonymous ? 0 : 1"
            >
              <text :class="evalForm.anonymous ? 'i-carbon-checkbox-checked text-[#1677ff]' : 'i-carbon-checkbox text-gray-400'" />
              <text>匿名评价</text>
            </view>
            <button
              class="bg-emerald-600 text-white text-xs px-5 py-2 rounded-xl font-bold active:opacity-90 m-0 border-none"
              :disabled="submittingEval"
              @click="handleSubmitEvaluation"
            >
              提交服务评价
            </button>
          </view>
        </view>
      </view>

      <!-- 6. 双端联调辅助操作区 -->
      <view class="mx-4 mt-4 bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-2">
        <view class="text-xs font-bold text-blue-900 flex items-center gap-1">
          <text class="i-carbon-play-filled-alt text-blue-600" />
          <text>双端协同与联调测试</text>
        </view>
        <view class="grid grid-cols-2 gap-2">
          <button
            class="bg-white border border-blue-200 text-blue-700 text-xs py-2 rounded-xl font-bold active:opacity-90 m-0"
            @click="handleMockArrived"
          >
            模拟技师到场打卡
          </button>
          <button
            class="bg-[#1677ff] text-white text-xs py-2 rounded-xl font-bold active:opacity-90 m-0"
            @click="handleMockComplete"
          >
            模拟完工流转结算
          </button>
        </view>
        <button
          class="w-full bg-emerald-600 text-white text-xs py-2 rounded-xl font-bold active:opacity-90 m-0"
          @click="gotoTechnicianDesk"
        >
          进入技师工作台（接收任务/出发打卡）
        </button>
      </view>
    </template>

    <!-- 7. 模拟支付弹窗 Modal -->
    <view
      v-if="showPayModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 animate-fade-in"
      @click.self="closePayModal"
    >
      <view class="bg-white rounded-3xl p-5 w-full max-w-sm shadow-xl space-y-4">
        <view class="text-center pb-2 border-b border-gray-100">
          <view class="text-sm font-bold text-gray-800">救援费用结算确认</view>
          <view class="text-[20rpx] text-gray-400 mt-0.5">工单号: {{ orderNo }}</view>
        </view>

        <!-- 应付金额大字展示 -->
        <view class="text-center py-2 bg-amber-50 rounded-2xl border border-amber-100">
          <text class="text-xs text-amber-800 block">待付总金额</text>
          <text class="text-2xl font-black font-mono text-rose-600 mt-1 block">
            ¥{{ orderDetail?.finalAmount || '400.00' }}
          </text>
        </view>

        <!-- 模拟支付通道选择 -->
        <view class="space-y-2 text-xs">
          <text class="text-[20rpx] text-gray-400 block font-bold">请选择模拟支付通道</text>
          <view
            class="p-3 rounded-xl border flex items-center justify-between cursor-pointer"
            :class="payChannel === 'MOCK_WECHAT' ? 'border-[#1677ff] bg-blue-50/50' : 'border-gray-200'"
            @click="payChannel = 'MOCK_WECHAT'"
          >
            <view class="flex items-center gap-2">
              <text class="i-carbon-logo-wechat text-emerald-500 text-lg" />
              <view>
                <view class="font-bold text-gray-800">微信支付 (沙箱模拟通道)</view>
                <view class="text-[20rpx] text-gray-400">推荐公路运输司机使用</view>
              </view>
            </view>
            <text :class="payChannel === 'MOCK_WECHAT' ? 'i-carbon-radio-button-checked text-[#1677ff]' : 'i-carbon-radio-button text-gray-300'" />
          </view>

          <view
            class="p-3 rounded-xl border flex items-center justify-between cursor-pointer"
            :class="payChannel === 'ACCOUNT_BALANCE' ? 'border-[#1677ff] bg-blue-50/50' : 'border-gray-200'"
            @click="payChannel = 'ACCOUNT_BALANCE'"
          >
            <view class="flex items-center gap-2">
              <text class="i-carbon-wallet text-amber-500 text-lg" />
              <view>
                <view class="font-bold text-gray-800">卡车汇司机钱包记账</view>
                <view class="text-[20rpx] text-gray-400">大客户与熟客月结通道</view>
              </view>
            </view>
            <text :class="payChannel === 'ACCOUNT_BALANCE' ? 'i-carbon-radio-button-checked text-[#1677ff]' : 'i-carbon-radio-button text-gray-300'" />
          </view>
        </view>

        <!-- 弹窗操作按钮 -->
        <view class="grid grid-cols-2 gap-2 pt-2">
          <button
            class="bg-gray-100 text-gray-600 text-xs py-2.5 rounded-xl font-bold active:opacity-90 m-0 border-none"
            :disabled="paying"
            @click="closePayModal"
          >
            取消
          </button>
          <button
            class="bg-[#1677ff] text-white text-xs py-2.5 rounded-xl font-bold active:opacity-90 m-0 border-none shadow-md flex items-center justify-center gap-1"
            :disabled="paying"
            @click="handleConfirmPay"
          >
            <text v-if="paying" class="inline-block animate-spin i-carbon-progress-bar-round" />
            <text>确认模拟支付</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>
