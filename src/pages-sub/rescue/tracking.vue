<script lang="ts" setup>
import type { RescueOrderExtraItemVo, RescueOrderPartItemVo, RescueOrderStatus, RescueOrderVo } from '@/types/rescue'
import {
  confirmRescueExtraItem,
  confirmRescuePart,
  evaluateRescueOrder,
  getActiveRescueOrder,
  getRescueOrderDetail,
  mockPayRescueOrder,
  reportRescueProgress,
} from '@/api/rescue'
import SimulatedMap from '@/components/SimulatedMap.vue'
import { useRescueSessionStore } from '@/store/rescueSession'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, onUnmounted, ref } from 'vue'

defineOptions({
  name: 'RescueTrackingPage',
})

definePage({
  style: {
    navigationBarTitleText: '救援实时跟踪',
    navigationBarBackgroundColor: '#0284c7',
    navigationBarTextStyle: 'white',
  },
})

const rescueStore = useRescueSessionStore()

const orderNo = ref<string>('')
const orderDetail = ref<RescueOrderVo | null>(null)
const loading = ref<boolean>(false)
const initializing = ref<boolean>(false)
const hasActiveOrder = ref<boolean>(true)
let pollTimer: ReturnType<typeof setInterval> | null = null

// 1. 到场后智能差异折叠控制 (US3)
const isMapCollapsed = ref<boolean>(false)
const isTimelineCollapsed = ref<boolean>(false)
const mapManuallyToggled = ref<boolean>(false)
const timelineManuallyToggled = ref<boolean>(false)

function toggleMapCollapse() {
  isMapCollapsed.value = !isMapCollapsed.value
  mapManuallyToggled.value = true
}

function toggleTimelineCollapse() {
  isTimelineCollapsed.value = !isTimelineCollapsed.value
  timelineManuallyToggled.value = true
}

function checkArrivalCollapse(status?: string) {
  if (['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(status || '')) {
    if (!mapManuallyToggled.value) {
      isMapCollapsed.value = true
    }
    if (!timelineManuallyToggled.value) {
      isTimelineCollapsed.value = true
    }
  }
}

// 2. 申报配件与服务增项费用动态统计 (US5)
const selfPartsAmount = computed(() => {
  const parts = orderDetail.value?.partItems || []
  const sum = parts
    .filter(p => p.sourceType === 'SELF_PROVIDED' && p.driverConfirmStatus === 1)
    .reduce((acc, cur) => acc + (Number(cur.partTotalAmount) || 0), 0)
  return sum.toFixed(2)
})

const mallPartsAmount = computed(() => {
  const parts = orderDetail.value?.partItems || []
  const sum = parts
    .filter(p => p.sourceType === 'MALL_PURCHASE' && p.driverConfirmStatus === 1)
    .reduce((acc, cur) => acc + (Number(cur.partTotalAmount) || 0), 0)
  return sum.toFixed(2)
})

const partsLaborAmount = computed(() => {
  const parts = orderDetail.value?.partItems || []
  const sum = parts
    .filter(p => p.driverConfirmStatus === 1)
    .reduce((acc, cur) => acc + (Number(cur.laborFee) || 0), 0)
  return sum.toFixed(2)
})

const extraItemsApprovedAmount = computed(() => {
  const items = orderDetail.value?.extraItems || []
  const sum = items
    .filter(i => i.driverConfirmStatus === 1)
    .reduce((acc, cur) => acc + (Number(cur.totalAmount) || 0), 0)
  return sum.toFixed(2)
})

const pendingConfirmAmount = computed(() => {
  const parts = orderDetail.value?.partItems || []
  const extra = orderDetail.value?.extraItems || []
  const partPending = parts
    .filter(p => p.driverConfirmStatus === 0)
    .reduce((acc, cur) => acc + (Number(cur.totalAmount) || 0), 0)
  const extraPending = extra
    .filter(i => i.driverConfirmStatus === 0)
    .reduce((acc, cur) => acc + (Number(cur.totalAmount) || 0), 0)
  return (partPending + extraPending).toFixed(2)
})

const pendingCount = computed(() => {
  const pCount = (orderDetail.value?.partItems || []).filter(p => p.driverConfirmStatus === 0).length
  const eCount = (orderDetail.value?.extraItems || []).filter(e => e.driverConfirmStatus === 0).length
  return pCount + eCount
})

// 3. 授权确认与拒绝弹窗状态及交互 (US2)
const showApproveModal = ref<boolean>(false)
const approveTarget = ref<{
  type: 'PART' | 'EXTRA'
  id: number
  title: string
  spec?: string
  materialFee?: number
  laborFee?: number
  totalAmount: number
} | null>(null)
const approving = ref<boolean>(false)

const showRejectModal = ref<boolean>(false)
const rejectTarget = ref<{
  type: 'PART' | 'EXTRA'
  id: number
  title: string
} | null>(null)
const selectedRejectQuickReason = ref<string>('报价过高')
const customRejectReason = ref<string>('')
const quickRejectOptions = ['报价过高', '暂不需要更换', '自备配件/自行解决', '对方案存疑']
const rejecting = ref<boolean>(false)

function openApproveModal(item: RescueOrderPartItemVo | RescueOrderExtraItemVo, type: 'PART' | 'EXTRA') {
  if (type === 'PART') {
    const p = item as RescueOrderPartItemVo
    approveTarget.value = {
      type: 'PART',
      id: p.id,
      title: p.partName,
      spec: p.brandName ? `${p.brandName} ${p.specification || ''}`.trim() : p.specification,
      materialFee: p.partTotalAmount,
      laborFee: p.laborFee,
      totalAmount: p.totalAmount,
    }
  }
  else {
    const e = item as RescueOrderExtraItemVo
    approveTarget.value = {
      type: 'EXTRA',
      id: e.id,
      title: e.itemName,
      spec: e.itemType,
      totalAmount: e.totalAmount,
    }
  }
  showApproveModal.value = true
}

async function handleConfirmApprove() {
  if (!approveTarget.value) return
  approving.value = true
  uni.showLoading({ title: '授权提交中...' })
  try {
    if (approveTarget.value.type === 'PART') {
      await confirmRescuePart({ id: approveTarget.value.id, approved: true })
    }
    else {
      await confirmRescueExtraItem(approveTarget.value.id, { agreed: true })
    }
    uni.hideLoading()
    uni.showToast({ title: '已成功授权！', icon: 'success' })
    showApproveModal.value = false
    await fetchOrderDetail(false)
  }
  catch (err: any) {
    uni.hideLoading()
    console.error('授权确认失败:', err)
    uni.showToast({ title: err?.message || '授权提交失败，请重试', icon: 'none' })
  }
  finally {
    approving.value = false
  }
}

function openRejectModal(item: RescueOrderPartItemVo | RescueOrderExtraItemVo, type: 'PART' | 'EXTRA') {
  rejectTarget.value = {
    type,
    id: item.id,
    title: type === 'PART' ? (item as RescueOrderPartItemVo).partName : (item as RescueOrderExtraItemVo).itemName,
  }
  selectedRejectQuickReason.value = '报价过高'
  customRejectReason.value = ''
  showRejectModal.value = true
}

async function handleConfirmReject() {
  if (!rejectTarget.value) return
  const finalReason = customRejectReason.value.trim() || selectedRejectQuickReason.value || '司机现场拒绝更换'
  rejecting.value = true
  uni.showLoading({ title: '提交拒绝处理中...' })
  try {
    if (rejectTarget.value.type === 'PART') {
      await confirmRescuePart({ id: rejectTarget.value.id, approved: false, rejectReason: finalReason })
    }
    else {
      await confirmRescueExtraItem(rejectTarget.value.id, { agreed: false, rejectReason: finalReason })
    }
    uni.hideLoading()
    uni.showToast({ title: '已拒绝该项目', icon: 'none' })
    showRejectModal.value = false
    await fetchOrderDetail(false)
  }
  catch (err: any) {
    uni.hideLoading()
    console.error('拒绝提交失败:', err)
    uni.showToast({ title: err?.message || '拒绝提交失败，请重试', icon: 'none' })
  }
  finally {
    rejecting.value = false
  }
}

// 4. 图片预览方法 (US4)
function previewImages(urls?: string[], current = 0) {
  if (!urls || urls.length === 0) return
  uni.previewImage({
    urls,
    current,
  })
}

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
  // SWR 第一帧优先消费：检查 Store 中是否存有当前工单快照（毫秒级秒开渲染）
  const targetNo = query?.orderNo || uni.getStorageSync('current_rescue_order_no')
  if (targetNo) {
    orderNo.value = targetNo
    if (rescueStore.activeOrderDetail?.orderNo === targetNo) {
      orderDetail.value = rescueStore.activeOrderDetail
      hasActiveOrder.value = true
      checkArrivalCollapse(rescueStore.activeOrderDetail?.orderStatus)
    }
  }
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

// 精准直达 + 兜底探测策略（FR-024，Q29）
async function initOrder(queryOrderNo?: string) {
  // 1. 精准直达模式：有 orderNo 显式传入，直接启动直达跟踪与周期轮询，跳过一切降级探测
  if (queryOrderNo) {
    orderNo.value = queryOrderNo
    uni.setStorageSync('current_rescue_order_no', queryOrderNo)
    hasActiveOrder.value = true
    startPolling()
    // 静默拉取最新全息数据（SWR 策略，不阻断首帧）
    await fetchOrderDetail(false)
    return
  }

  // 2. 本地缓存直达
  const cachedNo = uni.getStorageSync('current_rescue_order_no')
  if (cachedNo) {
    orderNo.value = cachedNo
    hasActiveOrder.value = true
    startPolling()
    const success = await fetchOrderDetail(false)
    if (success) {
      return
    }
  }

  // 3. 兜底探测模式：仅在完全未传参且无有效缓存时，调用后端探测最新活跃单
  initializing.value = true
  try {
    const activeOrder = await getActiveRescueOrder()
    if (activeOrder && activeOrder.orderNo) {
      orderNo.value = activeOrder.orderNo
      orderDetail.value = activeOrder
      rescueStore.setActiveOrderDetail(activeOrder)
      checkArrivalCollapse(activeOrder.orderStatus)
      uni.setStorageSync('current_rescue_order_no', activeOrder.orderNo)
      hasActiveOrder.value = true
      startPolling()
      return
    }
    hasActiveOrder.value = false
  }
  catch (err) {
    console.error('兜底探测活跃救援工单失败:', err)
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
      hasActiveOrder.value = true
      rescueStore.setActiveOrderDetail(res)
      checkArrivalCollapse(res.orderStatus)
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
    speedScore: evalForm.value.speedScore || 5,
    qualityScore: evalForm.value.qualityScore || 5,
    attitudeScore: evalForm.value.attitudeScore || 5,
    tags: [...(evalForm.value.tags || [])],
    commentContent: evalForm.value.commentContent ? evalForm.value.commentContent.trim() : '',
    anonymous: evalForm.value.anonymous ? 1 : 0,
  }

  try {
    await evaluateRescueOrder(orderNo.value, evalSnapshot)
    uni.hideLoading()
    submittingEval.value = false
    uni.showToast({ title: '感谢您的评价！', icon: 'success' })
    await fetchOrderDetail(false)
  }
  catch (err: any) {
    uni.hideLoading()
    submittingEval.value = false
    console.error('提交评价失败:', err)
    uni.showToast({
      title: err?.message || '评价提交失败，请重试',
      icon: 'none',
    })
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
  <view class="tracking-page min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
    <!-- 0. 兜底探测态：仅在未传递单号且正在探测最新活跃工单时轻量呈现 -->
    <view v-if="!hasActiveOrder && initializing" class="p-12 text-center text-slate-500 text-xs">
      <view class="inline-block animate-spin i-carbon-progress-bar-round text-2xl text-[#0284c7] mb-2" />
      <view>正在获取救援订单最新进展...</view>
    </view>

    <!-- 0. 空状态引导 (若当前司机名下确无活跃救援工单) -->
    <view
      v-else-if="!hasActiveOrder"
      class="mx-4 mt-8 bg-white rounded-lg p-8 border border-slate-200/90 text-center flex flex-col items-center justify-center shadow-sm"
    >
      <view class="w-16 h-16 rounded-lg bg-slate-50 border border-slate-200 text-[#0284c7] flex items-center justify-center mb-4">
        <text class="i-carbon-radar text-3xl" />
      </view>
      <view class="text-base font-bold text-slate-900">当前暂无进行中的道路救援</view>
      <view class="text-xs text-slate-500 mt-1.5 max-w-64 leading-relaxed">
        如果您正处于高速公路或国道路段车辆突发故障，请立即发起一键极速呼叫
      </view>

      <view class="mt-6 w-full space-y-3">
        <button
          class="w-full bg-[#0284c7] active:bg-[#0369a1] text-white text-sm min-h-[88rpx] rounded-lg font-bold flex items-center justify-center gap-1.5 border-none transition-colors"
          @click="gotoCallRescue"
        >
          <text class="i-carbon-phone-filled text-base" />
          <text>立即呼叫道路救援</text>
        </button>

        <button
          class="w-full bg-white active:bg-slate-100 border border-slate-200 text-slate-700 text-xs min-h-[80rpx] rounded-lg font-medium flex items-center justify-center transition-colors"
          @click="gotoHome"
        >
          返回首页
        </button>
      </view>
    </view>

    <!-- 正常履约跟踪内容 -->
    <template v-else>
      <!-- 1. 顶部责任技师信息卡片 -->
      <view class="bg-white border-b border-slate-200/90 px-4 pt-3 pb-4">
        <view class="bg-slate-50 rounded-lg p-3.5 border border-slate-200 flex items-center justify-between">
          <view class="flex items-center gap-3">
            <image
              :src="orderDetail?.technicianAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'"
              class="w-13 h-13 rounded-lg border border-emerald-500 bg-white object-cover"
            />
            <view>
              <view class="flex items-center gap-1.5">
                <text class="text-sm font-bold text-slate-900">
                  {{ orderDetail?.technicianName || '出警技师指派中...' }}
                </text>
                <view v-if="orderDetail?.technicianName" class="bg-amber-50 border border-amber-200 text-amber-600 text-[18rpx] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5">
                  <text class="i-carbon-star-filled text-xs text-amber-500" />
                  <text>4.9 分</text>
                </view>
              </view>
              <view class="text-[20rpx] text-slate-500 mt-0.5 truncate max-w-44">
                {{ orderDetail?.stationName || orderDetail?.assignedStationName || '服务商特约救援站' }}
              </view>
              <view class="text-[18rpx] text-emerald-600 font-medium mt-1">
                ✓ 官方认证技师 · 携专业工具备件
              </view>
            </view>
          </view>

          <!-- 右侧操作: 刷新与电话联系 -->
          <view class="flex items-center gap-2">
            <button
              class="w-9 h-9 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center active:bg-slate-100 m-0"
              title="刷新"
              @click="handleRefresh"
            >
              <text class="i-carbon-renew text-sm" />
            </button>
            <button
              class="w-9 h-9 rounded-md bg-emerald-600 active:bg-emerald-700 text-white flex items-center justify-center m-0 border-none"
              :class="!orderDetail?.technicianPhone ? 'opacity-50' : ''"
              @click="callTechnician"
            >
              <text class="i-carbon-phone-filled text-base" />
            </button>
          </view>
        </view>

        <!-- 车辆与救援状态卡片 (出警车辆、工单号、履约状态) -->
        <view class="mt-3 grid grid-cols-3 bg-slate-50 rounded-lg p-2.5 text-center text-xs border border-slate-200 divide-x divide-slate-200">
          <view class="px-1">
            <text class="text-slate-500 block text-[20rpx]">出警车辆</text>
            <text class="text-xs font-black font-mono text-emerald-600 mt-0.5 block truncate">
              {{ orderDetail?.technicianPlateNo || '专车整备中' }}
            </text>
          </view>
          <view class="px-1">
            <text class="text-slate-500 block text-[20rpx]">工单号</text>
            <text class="text-xs font-bold font-mono text-slate-800 mt-0.5 block truncate">{{ orderDetail?.orderNo || orderNo || '--' }}</text>
          </view>
          <view class="px-1">
            <text class="text-slate-500 block text-[20rpx]">履约状态</text>
            <text class="text-xs font-bold text-amber-600 mt-0.5 block truncate">
              {{ orderDetail?.orderStatus === 'ACCEPTED' ? '已接单待出发' :
                orderDetail?.orderStatus === 'DEPARTED' ? '全速赶赴中' :
                orderDetail?.orderStatus === 'ARRIVED' || orderDetail?.orderStatus === 'IN_PROGRESS' ? '已抵达抢修中' :
                orderDetail?.orderStatus === 'COMPLETED' ? '救援已完工' : '快速调度中' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 2. 中间：轻量矢量仿真地图与路线轨迹 (支持到场后折叠 US3) -->
      <view class="mx-4 mt-3 rounded-lg overflow-hidden border border-slate-200/90 bg-white shadow-sm">
        <view class="p-3 border-b border-slate-200 flex items-center justify-between text-xs bg-slate-50">
          <view class="flex items-center gap-1.5 font-bold text-slate-900">
            <text class="i-carbon-map text-[#0284c7]" />
            <text>实时路网轨迹监控</text>
            <text v-if="isMapCollapsed" class="text-[18rpx] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded-sm font-normal">
              现场就位
            </text>
          </view>
          <view class="flex items-center gap-2">
            <text class="text-[20rpx] text-slate-500 truncate max-w-36 font-mono">
              {{ orderDetail?.rescueAddress || '现场救援路段' }}
            </text>
            <!-- 工业机能主义折叠切换按钮 (手套大热区) -->
            <view
              class="flex items-center gap-0.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 active:bg-slate-100 active:text-[#0284c7] text-[20rpx] cursor-pointer shadow-2xs font-medium"
              @click="toggleMapCollapse"
            >
              <text>{{ isMapCollapsed ? '展开地图' : '收起' }}</text>
              <text :class="isMapCollapsed ? 'i-carbon-chevron-down' : 'i-carbon-chevron-up'" class="text-xs" />
            </view>
          </view>
        </view>

        <!-- 地图折叠态摘要 -->
        <view v-if="isMapCollapsed" class="p-3 bg-slate-50 text-[22rpx] text-slate-600 flex items-center justify-between">
          <view class="flex items-center gap-2">
            <text class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <text class="text-slate-800">救援专车已抵达抢修现场 · 地图已折叠</text>
          </view>
          <text class="text-[#0284c7] font-medium underline" @click="toggleMapCollapse">查看路网轨迹</text>
        </view>

        <!-- 展开态完整地图 -->
        <view v-else class="h-64 relative bg-slate-100">
          <SimulatedMap
            height="100%"
            :truck-pos="truckPosition"
            :status-text="statusDesc"
          />
        </view>
      </view>

      <!-- 3. 救援全流程进度时间轴 (支持到场智能折叠 US3) -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm">
        <!-- 头部标题栏：支持点击整栏或右侧按钮切换展开/收起 -->
        <view
          class="flex items-center justify-between text-xs pb-2 border-b border-slate-100 cursor-pointer active:opacity-80"
          :class="{ 'mb-3': !isTimelineCollapsed }"
          @click="toggleTimelineCollapse"
        >
          <view class="font-bold text-slate-900 flex items-center gap-1.5">
            <text class="i-carbon-time text-[#0284c7]" />
            <text>救援进度全息时间轴</text>
            <text
              v-if="isTimelineCollapsed"
              class="text-[18rpx] text-[#0284c7] bg-sky-50 border border-sky-200 px-1 py-0.2 rounded-sm font-normal"
            >
              已折叠
            </text>
          </view>
          <!-- 工业机能手套优先大热区切换按钮 -->
          <view
            class="flex items-center gap-1 px-3 py-1.5 rounded bg-white border border-slate-200 text-[#0284c7] active:bg-slate-100 text-xs font-bold transition-all shadow-2xs"
            @click.stop="toggleTimelineCollapse"
          >
            <text>{{ isTimelineCollapsed ? '展开全息进度' : '收起时间轴' }}</text>
            <text :class="isTimelineCollapsed ? 'i-carbon-chevron-down' : 'i-carbon-chevron-up'" class="text-xs" />
          </view>
        </view>

        <!-- 折叠态极简摘要 (点击整行直接平滑展开) -->
        <view
          v-if="isTimelineCollapsed"
          class="text-[22rpx] text-slate-700 flex items-center justify-between pt-2 cursor-pointer active:opacity-80"
          @click="toggleTimelineCollapse"
        >
          <view class="flex items-center gap-2">
            <text class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <text class="text-slate-900 font-medium truncate max-w-56">当前进度: {{ statusDesc }}</text>
          </view>
          <view class="flex items-center gap-1 text-slate-500 font-mono text-[20rpx] shrink-0">
            <text>{{ formatTimelineTime(orderDetail?.finishTime || orderDetail?.arriveTime || orderDetail?.departTime || orderDetail?.createTime) }}</text>
            <text class="text-[#0284c7] font-medium ml-1">展开详情 ▾</text>
          </view>
        </view>

        <!-- 展开态全量时间轴 -->
        <view v-else class="space-y-3.5 pl-1 text-xs">
          <!-- 节点 1: 报案发布 -->
          <view class="flex items-start gap-2.5">
            <view class="w-2.5 h-2.5 rounded-sm bg-emerald-500 mt-1 shrink-0" />
            <view class="flex-1">
              <view class="font-bold text-slate-900 flex items-center justify-between">
                <text>司机报案呼叫成功</text>
                <text class="text-[20rpx] text-slate-500 font-mono">
                  {{ formatTimelineTime(orderDetail?.createTime) || '已受理' }}
                </text>
              </view>
              <view class="text-[20rpx] text-slate-500 mt-0.5">
                现场：{{ orderDetail?.rescueAddress || '已上报GPS坐标' }}
              </view>
            </view>
          </view>

          <!-- 节点 2: 网点接单派工 -->
          <view class="flex items-start gap-2.5">
            <view
              class="w-2.5 h-2.5 rounded-sm mt-1 shrink-0"
              :class="orderDetail?.orderStatus !== 'PENDING_DISPATCH' && orderDetail?.orderStatus !== 'DISPATCHING' ? 'bg-emerald-500' : 'bg-slate-300'"
            />
            <view class="flex-1">
              <view class="font-bold text-slate-900 flex items-center justify-between">
                <text>服务网点响应并派工</text>
                <text class="text-[20rpx] text-slate-500 font-mono">
                  {{ formatTimelineTime(orderDetail?.acceptTime) || (orderDetail?.orderStatus !== 'PENDING_DISPATCH' && orderDetail?.orderStatus !== 'DISPATCHING' ? '已派工' : '调度中') }}
                </text>
              </view>
              <view class="text-[20rpx] text-slate-500 mt-0.5">
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
              class="w-2.5 h-2.5 rounded-sm mt-1 shrink-0"
              :class="['DEPARTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(orderDetail?.orderStatus || '') ? 'bg-emerald-500' : 'bg-slate-300'"
            />
            <view class="flex-1">
              <view class="font-bold text-slate-900 flex items-center justify-between">
                <text>技师接单出发，全速赶赴现场</text>
                <text class="text-[20rpx] text-slate-500 font-mono">
                  {{ formatTimelineTime(orderDetail?.departTime) || '等待出发' }}
                </text>
              </view>
              <view class="text-[20rpx] text-slate-500 mt-0.5">
                携专业故障诊断仪与原厂纯正备件
              </view>
            </view>
          </view>

          <!-- 节点 4: 到场打卡 -->
          <view class="flex items-start gap-2.5">
            <view
              class="w-2.5 h-2.5 rounded-sm mt-1 shrink-0"
              :class="['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(orderDetail?.orderStatus || '') ? 'bg-emerald-500' : 'bg-slate-300'"
            />
            <view class="flex-1">
              <view class="font-bold text-slate-900 flex items-center justify-between">
                <text>技师到达现场打卡抢修</text>
                <text class="text-[20rpx] text-slate-500 font-mono">
                  {{ formatTimelineTime(orderDetail?.arriveTime) || '途中' }}
                </text>
              </view>
              <view class="text-[20rpx] text-slate-500 mt-0.5">
                现场故障排除与维修作业
              </view>
            </view>
          </view>

          <!-- 节点 5: 完工交付 -->
          <view class="flex items-start gap-2.5">
            <view
              class="w-2.5 h-2.5 rounded-sm mt-1 shrink-0"
              :class="orderDetail?.orderStatus === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-300'"
            />
            <view class="flex-1">
              <view class="font-bold text-slate-900 flex items-center justify-between">
                <text>抢修完工交付与确认</text>
                <text class="text-[20rpx] text-slate-500 font-mono">
                  {{ formatTimelineTime(orderDetail?.finishTime) || '进行中' }}
                </text>
              </view>
              <view class="text-[20rpx] text-slate-500 mt-0.5">
                车辆故障排除，恢复正常干线运行
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 3.5 现场拆装更换配件卡片 (US1, US2, US4, US5) -->
      <view
        v-if="orderDetail?.partItems && orderDetail.partItems.length > 0"
        class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm"
      >
        <!-- 卡片头部标题与待确认警示 -->
        <view class="flex items-center justify-between pb-3 border-b border-slate-200">
          <view class="flex items-center gap-2">
            <view class="w-7 h-7 rounded bg-sky-50 border border-sky-200 text-[#0284c7] flex items-center justify-center">
              <text class="i-carbon-tools text-base" />
            </view>
            <view>
              <view class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <text>现场拆装更换配件</text>
                <text class="text-[20rpx] px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  共 {{ orderDetail.partItems.length }} 件
                </text>
              </view>
              <view class="text-[20rpx] text-slate-500 mt-0.5">
                技师现场提报故障零部件拆装与全新配件更换清单
              </view>
            </view>
          </view>

          <!-- 待确认数量徽标 -->
          <view
            v-if="orderDetail.partItems.some(p => p.driverConfirmStatus === 0)"
            class="bg-amber-50 text-amber-600 border border-amber-200 text-[20rpx] px-2 py-0.5 rounded-sm font-bold flex items-center gap-1 animate-pulse"
          >
            <text class="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <text>待您授权</text>
          </view>
          <view
            v-else
            class="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[20rpx] px-2 py-0.5 rounded-sm font-medium"
          >
            已全额核验
          </view>
        </view>

        <!-- 顶部费用分类统计摘要 (US5) -->
        <view class="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 text-center text-xs divide-x divide-slate-200">
          <view class="px-1">
            <text class="text-slate-500 block text-[20rpx]">随车材料费</text>
            <text class="font-mono font-bold text-slate-900 mt-0.5 block text-xs">¥{{ selfPartsAmount }}</text>
          </view>
          <view class="px-1">
            <text class="text-slate-500 block text-[20rpx]">商城调拨件</text>
            <text class="font-mono font-bold text-slate-900 mt-0.5 block text-xs">¥{{ mallPartsAmount }}</text>
          </view>
          <view class="px-1">
            <text class="text-slate-500 block text-[20rpx]">拆装工时费</text>
            <text class="font-mono font-bold text-amber-600 mt-0.5 block text-xs">¥{{ partsLaborAmount }}</text>
          </view>
        </view>

        <!-- 待确认警报栏 (US5) -->
        <view
          v-if="Number(pendingConfirmAmount) > 0"
          class="mt-2 px-3 py-1.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[20rpx] flex items-center justify-between"
        >
          <view class="flex items-center gap-1.5">
            <text class="i-carbon-warning-alt-filled text-amber-500" />
            <text>尚有 {{ pendingCount }} 项申报待您决策确认</text>
          </view>
          <text class="font-mono font-bold text-amber-700">待决断金额 ¥{{ pendingConfirmAmount }}</text>
        </view>

        <!-- 配件逐项明细列表 (US1, US2, US4) -->
        <view class="mt-3 space-y-3">
          <view
            v-for="part in orderDetail.partItems"
            :key="part.id"
            class="bg-white rounded-lg p-3.5 border transition-all shadow-2xs"
            :class="part.driverConfirmStatus === 0 ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'"
          >
            <!-- 项头部：零件名与状态徽标 -->
            <view class="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <view class="flex-1">
                <view class="flex items-center gap-2 flex-wrap">
                  <text class="font-bold text-slate-900 text-sm leading-snug">{{ part.partName }}</text>
                  <!-- 来源标签 -->
                  <text
                    class="text-[18rpx] px-1.5 py-0.5 rounded-sm font-medium border"
                    :class="part.sourceType === 'SELF_PROVIDED' ? 'bg-sky-50 text-[#0284c7] border-sky-200' : 'bg-purple-50 text-purple-700 border-purple-200'"
                  >
                    {{ part.sourceType === 'SELF_PROVIDED' ? '随车现货' : '商城调拨' }}
                  </text>
                  <!-- 商城供应商说明 -->
                  <text v-if="part.sourceType === 'MALL_PURCHASE' && part.supplierName" class="text-[18rpx] text-slate-500">
                    ({{ part.supplierName }})
                  </text>
                </view>
                <!-- 规格品牌OE码 (US1) -->
                <view class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[20rpx] text-slate-500 mt-1 font-mono">
                  <text v-if="part.brandName">品牌: <text class="text-slate-800">{{ part.brandName }}</text></text>
                  <text v-if="part.specification">规格: <text class="text-slate-800">{{ part.specification }}</text></text>
                  <text v-if="part.oeCode">OE码: <text class="text-slate-800">{{ part.oeCode }}</text></text>
                </view>
              </view>

              <!-- 司机授权确认状态 Badge (US2, 工业机能主义信标色彩) -->
              <view class="shrink-0">
                <view
                  v-if="part.driverConfirmStatus === 0"
                  class="bg-amber-50 text-amber-600 border border-amber-200 text-[20rpx] px-2 py-0.5 rounded-sm font-bold flex items-center gap-1"
                >
                  <text class="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <text>待您授权</text>
                </view>
                <view
                  v-else-if="part.driverConfirmStatus === 1"
                  class="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[20rpx] px-2 py-0.5 rounded-sm font-bold flex items-center gap-1"
                >
                  <text class="i-carbon-checkmark text-xs" />
                  <text>已同意更换</text>
                </view>
                <view
                  v-else-if="part.driverConfirmStatus === 2"
                  class="bg-rose-50 text-rose-600 border border-rose-200 text-[20rpx] px-2 py-0.5 rounded-sm font-bold flex items-center gap-1"
                >
                  <text class="i-carbon-close text-xs" />
                  <text>已拒绝</text>
                </view>
              </view>
            </view>

            <!-- 物流履约状态徽标 (US4, T014) -->
            <view
              v-if="part.sourceType === 'MALL_PURCHASE' && part.deliveryStatusName"
              class="mt-2 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-[20rpx] flex items-center justify-between"
            >
              <view class="flex items-center gap-1.5 text-purple-700">
                <text class="i-carbon-delivery-parcel text-xs" />
                <text>商城备件配送状态：</text>
                <text class="font-bold text-slate-900">{{ part.deliveryStatusName }}</text>
              </view>
              <text class="text-slate-500 font-mono text-[18rpx]">专线冷链/汽配仓配</text>
            </view>

            <!-- 费用构成明细网格 (US1) -->
            <view class="mt-2.5 grid grid-cols-4 bg-slate-50 rounded p-2 text-center text-xs border border-slate-200 divide-x divide-slate-200">
              <view class="px-1">
                <text class="text-slate-500 block text-[18rpx]">单价</text>
                <text class="font-mono text-slate-800 text-[22rpx] mt-0.5 block">¥{{ part.partUnitPrice }}</text>
              </view>
              <view class="px-1">
                <text class="text-slate-500 block text-[18rpx]">数量</text>
                <text class="font-mono text-slate-800 text-[22rpx] mt-0.5 block">{{ part.quantity }} 件</text>
              </view>
              <view class="px-1">
                <text class="text-slate-500 block text-[18rpx]">拆装工时费</text>
                <text class="font-mono text-slate-800 text-[22rpx] mt-0.5 block">¥{{ part.laborFee }}</text>
              </view>
              <view class="px-1">
                <text class="text-slate-600 block text-[18rpx] font-bold">单项总计</text>
                <text class="font-mono font-bold text-rose-600 text-xs mt-0.5 block">¥{{ part.totalAmount }}</text>
              </view>
            </view>

            <!-- 更换申报原因 (US1) -->
            <view v-if="part.reason" class="mt-2.5 p-2 rounded bg-slate-50 border border-slate-200 text-[20rpx] text-slate-700 leading-relaxed">
              <text class="text-slate-500 font-bold">申报原因：</text>
              <text>{{ part.reason }}</text>
            </view>

            <!-- 双重存证对比 (US4, T013) -->
            <view
              v-if="(part.damageImages && part.damageImages.length > 0) || (part.installImages && part.installImages.length > 0)"
              class="mt-2.5 p-2 rounded bg-slate-50 border border-slate-200 space-y-2"
            >
              <view class="text-[20rpx] text-slate-700 font-bold flex items-center gap-1">
                <text class="i-carbon-image-search text-[#0284c7]" />
                <text>双重实景照片存证对比（点击放大核验）</text>
              </view>
              <view class="grid grid-cols-2 gap-2 text-xs">
                <!-- 旧件受损存证 -->
                <view class="bg-white rounded p-1.5 border border-slate-200">
                  <view class="text-[18rpx] text-rose-600 font-medium mb-1 flex items-center gap-0.5">
                    <text class="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <text>旧件损坏存证 ({{ part.damageImages ? part.damageImages.length : 0 }})</text>
                  </view>
                  <view v-if="part.damageImages && part.damageImages.length > 0" class="flex gap-1.5 overflow-x-auto pb-0.5">
                    <image
                      v-for="(img, idx) in part.damageImages"
                      :key="idx"
                      :src="img"
                      mode="aspectFill"
                      class="w-16 h-16 rounded bg-slate-100 border border-slate-200 shrink-0"
                      @click="previewImages(part.damageImages, idx)"
                    />
                  </view>
                  <view v-else class="text-[18rpx] text-slate-400 py-3 text-center">暂无旧件照片</view>
                </view>

                <!-- 新件装车存证 -->
                <view class="bg-white rounded p-1.5 border border-slate-200">
                  <view class="text-[18rpx] text-emerald-600 font-medium mb-1 flex items-center gap-0.5">
                    <text class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <text>新件装车存证 ({{ part.installImages ? part.installImages.length : 0 }})</text>
                  </view>
                  <view v-if="part.installImages && part.installImages.length > 0" class="flex gap-1.5 overflow-x-auto pb-0.5">
                    <image
                      v-for="(img, idx) in part.installImages"
                      :key="idx"
                      :src="img"
                      mode="aspectFill"
                      class="w-16 h-16 rounded bg-slate-100 border border-slate-200 shrink-0"
                      @click="previewImages(part.installImages, idx)"
                    />
                  </view>
                  <view v-else class="text-[18rpx] text-slate-400 py-3 text-center">待安装后上传</view>
                </view>
              </view>
            </view>

            <!-- 司机授权交互操作栏 (US2: 手套优先大热区，高度 >= 88rpx) -->
            <view v-if="part.driverConfirmStatus === 0" class="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                class="bg-white active:bg-rose-50 text-rose-600 border border-rose-200 text-xs min-h-[88rpx] rounded-lg font-bold flex items-center justify-center gap-1 transition-colors m-0"
                @click="openRejectModal(part, 'PART')"
              >
                <text class="i-carbon-close text-sm" />
                <text>拒绝更换</text>
              </button>
              <button
                class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs min-h-[88rpx] rounded-lg font-bold border-none flex items-center justify-center gap-1 transition-colors m-0 shadow-md"
                @click="openApproveModal(part, 'PART')"
              >
                <text class="i-carbon-checkmark text-sm" />
                <text>同意授权更换</text>
              </button>
            </view>

            <!-- 已决断状态结果说明 -->
            <view
              v-else-if="part.driverConfirmStatus === 2"
              class="mt-2.5 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex flex-col gap-1"
            >
              <view class="flex items-center justify-between font-bold text-rose-600 text-xs">
                <view class="flex items-center gap-1">
                  <text class="i-carbon-close-filled text-sm" />
                  <text>您已拒绝此配件更换</text>
                </view>
                <text class="text-[20rpx] text-slate-400 font-mono font-normal">{{ formatTimelineTime(part.confirmTime) }}</text>
              </view>
              <view class="text-[20rpx] text-rose-800 leading-relaxed pl-4">
                拒绝原因：{{ part.rejectReason || '司机现场拒绝更换' }}
              </view>
            </view>
            <view
              v-else-if="part.driverConfirmStatus === 1"
              class="mt-2 text-[20rpx] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded flex items-center justify-between"
            >
              <text>您已在线授权同意更换，配件总额已计入工单账单</text>
              <text class="text-slate-400 font-mono">{{ formatTimelineTime(part.confirmTime) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 3.6 现场服务增项申报卡片 (US1, US2, US5) -->
      <view
        v-if="orderDetail?.extraItems && orderDetail.extraItems.length > 0"
        class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm"
      >
        <view class="flex items-center justify-between pb-3 border-b border-slate-200">
          <view class="flex items-center gap-2">
            <view class="w-7 h-7 rounded bg-amber-50 border border-amber-300 text-amber-600 flex items-center justify-center">
              <text class="i-carbon-add-alt text-base" />
            </view>
            <view>
              <view class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <text>现场服务增项申报</text>
                <text class="text-[20rpx] px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-700 border border-slate-300 font-mono">
                  共 {{ orderDetail.extraItems.length }} 项
                </text>
              </view>
              <view class="text-[20rpx] text-slate-500 mt-0.5">
                救援技师现场追加的辅助作业、特殊工况附加服务
              </view>
            </view>
          </view>

          <!-- 已确认增项小计 -->
          <view class="text-right">
            <text class="text-[18rpx] text-slate-500 block">已授权增项额</text>
            <text class="text-xs font-mono font-bold text-emerald-600">¥{{ extraItemsApprovedAmount }}</text>
          </view>
        </view>

        <!-- 增项明细列表 -->
        <view class="mt-3 space-y-3">
          <view
            v-for="item in orderDetail.extraItems"
            :key="item.id"
            class="bg-white rounded-lg p-3.5 border transition-all"
            :class="item.driverConfirmStatus === 0 ? 'border-amber-400 bg-amber-50/20 shadow-sm' : 'border-slate-200'"
          >
            <view class="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <view class="flex-1">
                <view class="flex items-center gap-2">
                  <text class="font-bold text-slate-900 text-sm">{{ item.itemName }}</text>
                  <text
                    class="text-[18rpx] px-1.5 py-0.5 rounded-sm font-medium"
                    :class="item.itemType === 'LABOR' ? 'bg-amber-50 text-amber-700 border border-amber-300' : 'bg-purple-50 text-purple-700 border border-purple-300'"
                  >
                    {{ item.itemType === 'LABOR' ? '检修工时' : item.itemType === 'EXPENSE' ? '服务杂费' : (item.itemType || '服务增项') }}
                  </text>
                </view>
                <view class="text-[20rpx] text-slate-500 mt-1 font-mono">
                  单价: ¥{{ item.unitPrice }} × 数量: {{ item.quantity }}
                </view>
              </view>

              <view class="text-right shrink-0">
                <view class="text-sm font-bold font-mono text-amber-600">
                  ¥{{ item.totalAmount }}
                </view>
                <!-- 状态 Badge -->
                <view class="mt-1">
                  <text
                    v-if="item.driverConfirmStatus === 0"
                    class="text-[18rpx] px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-300 font-bold"
                  >
                    待授权
                  </text>
                  <text
                    v-else-if="item.driverConfirmStatus === 1"
                    class="text-[18rpx] px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold"
                  >
                    已同意
                  </text>
                  <text
                    v-else-if="item.driverConfirmStatus === 2"
                    class="text-[18rpx] px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-300 font-bold"
                  >
                    已拒绝
                  </text>
                </view>
              </view>
            </view>

            <!-- 现场凭证照片 (选填 US6) -->
            <view v-if="item.evidenceImages && item.evidenceImages.length > 0" class="mt-2.5">
              <view class="text-[20rpx] text-slate-600 font-bold mb-1.5 flex items-center gap-1">
                <text class="i-carbon-image text-[#0284c7]" />
                <text>现场凭证照片：</text>
              </view>
              <view class="flex flex-wrap gap-2">
                <view
                  v-for="(img, imgIdx) in item.evidenceImages"
                  :key="imgIdx"
                  class="relative w-20 h-20 rounded-md overflow-hidden border border-slate-200 bg-slate-100 active:scale-95 transition-transform"
                  @click.stop="previewImages(item.evidenceImages, imgIdx)"
                >
                  <image
                    :src="img"
                    mode="aspectFill"
                    class="w-full h-full"
                  />
                  <view class="absolute bottom-0 inset-x-0 bg-black/60 text-[16rpx] text-white text-center py-0.5">
                    查看大图
                  </view>
                </view>
              </view>
            </view>

            <!-- 增项原因/备注说明 (选填) -->
            <view v-if="item.reason" class="mt-2.5 p-2 rounded bg-slate-50 border border-slate-200 text-[20rpx] text-slate-700 leading-relaxed">
              <text class="text-slate-500 font-bold">备注说明：</text>
              <text>{{ item.reason }}</text>
            </view>

            <!-- 司机授权交互操作栏 (US2: 手套优先大热区，高度 >= 88rpx) -->
            <view v-if="item.driverConfirmStatus === 0" class="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                class="bg-slate-100 active:bg-slate-200 text-rose-600 border border-slate-300 text-xs min-h-[88rpx] rounded-lg font-bold flex items-center justify-center gap-1 transition-colors m-0"
                @click="openRejectModal(item, 'EXTRA')"
              >
                <text class="i-carbon-close text-sm" />
                <text>拒绝该项</text>
              </button>
              <button
                class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs min-h-[88rpx] rounded-lg font-bold border-none flex items-center justify-center gap-1 transition-colors m-0 shadow-sm"
                @click="openApproveModal(item, 'EXTRA')"
              >
                <text class="i-carbon-checkmark text-sm" />
                <text>同意授权增项</text>
              </button>
            </view>

            <!-- 已决断状态结果说明 -->
            <view
              v-else-if="item.driverConfirmStatus === 2"
              class="mt-2.5 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex flex-col gap-1"
            >
              <view class="flex items-center justify-between font-bold text-rose-600 text-xs">
                <view class="flex items-center gap-1">
                  <text class="i-carbon-close-filled text-sm" />
                  <text>您已拒绝此服务增项</text>
                </view>
                <text class="text-[20rpx] text-slate-400 font-mono font-normal">{{ formatTimelineTime(item.confirmTime) }}</text>
              </view>
              <view class="text-[20rpx] text-rose-700 leading-relaxed pl-4">
                拒绝原因：{{ item.rejectReason || '司机现场拒绝增项' }}
              </view>
            </view>
            <view
              v-else-if="item.driverConfirmStatus === 1"
              class="mt-2 text-[20rpx] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded flex items-center justify-between"
            >
              <text>您已在线授权同意，增项费用已计入结算账单</text>
              <text class="text-slate-400 font-mono">{{ formatTimelineTime(item.confirmTime) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 4. 完工费用结算账单卡片 (FR-017, US5) -->
      <view
        v-if="orderDetail?.orderStatus === 'COMPLETED'"
        class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm"
      >
        <view class="flex items-center justify-between pb-3 border-b border-slate-200">
          <view class="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <text class="i-carbon-receipt text-[#0284c7]" />
            <text>救援费用结算账单</text>
          </view>
          <view
            class="text-[20rpx] px-2 py-0.5 rounded-sm font-bold border"
            :class="orderDetail?.paymentStatus === 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'"
          >
            {{ orderDetail?.paymentStatus === 1 ? '✓ 已完成支付' : '待司机确认支付' }}
          </view>
        </view>

        <!-- 费用明细清单 -->
        <view class="py-3 space-y-2 text-xs border-b border-slate-200 text-slate-700">
          <view class="flex justify-between items-center">
            <text class="text-slate-500">基础救援出警服务费</text>
            <text class="font-mono font-medium text-slate-900">¥{{ orderDetail?.estimatedAmount || '400.00' }}</text>
          </view>
          <view class="flex justify-between items-center">
            <text class="text-slate-500">现场维修/换件增项费</text>
            <text class="font-mono font-medium text-slate-900">¥{{ orderDetail?.extraAmount || '0.00' }}</text>
          </view>
          <!-- 增项细分微缩展示 (若存在增项总额) -->
          <view
            v-if="Number(orderDetail?.extraAmount || 0) > 0"
            class="p-2 rounded bg-slate-50 border border-slate-200 text-[20rpx] space-y-1 text-slate-600"
          >
            <view class="flex justify-between">
              <text>└ 授权更换配件材料费</text>
              <text class="font-mono text-slate-800">¥{{ (Number(selfPartsAmount) + Number(mallPartsAmount)).toFixed(2) }}</text>
            </view>
            <view class="flex justify-between">
              <text>└ 授权配件拆装工时费</text>
              <text class="font-mono text-slate-800">¥{{ partsLaborAmount }}</text>
            </view>
            <view class="flex justify-between">
              <text>└ 现场授权附加服务增项</text>
              <text class="font-mono text-slate-800">¥{{ extraItemsApprovedAmount }}</text>
            </view>
          </view>
          <view v-if="orderDetail?.finishRemark" class="text-[20rpx] text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
            检修说明：{{ orderDetail.finishRemark }}
          </view>
          <view class="flex justify-between items-baseline pt-1">
            <text class="font-bold text-slate-900 text-sm">应付总计金额</text>
            <view class="text-rose-600 font-mono font-black text-lg">
              ¥{{ orderDetail?.finalAmount || '400.00' }}
            </view>
          </view>
        </view>

        <!-- 支付操作或已支付提示 -->
        <view class="mt-3">
          <view v-if="orderDetail?.paymentStatus === 1" class="text-center text-[22rpx] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded py-1.5 font-medium">
            已于 {{ formatTimelineTime(orderDetail?.paymentTime) || '刚刚' }} 支付成功
          </view>
          <button
            v-else
            class="w-full bg-[#0284c7] active:bg-[#0369a1] text-white text-xs min-h-[88rpx] rounded-lg font-bold flex items-center justify-center gap-1.5 border-none transition-colors"
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
        class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm"
      >
        <!-- 5.1 已经评价过：只读展示态 (以后端实际返回 evaluation 为准) -->
        <view v-if="orderDetail?.evaluation" class="space-y-3">
          <view class="flex items-center justify-between pb-2 border-b border-slate-200">
            <view class="flex items-center gap-1.5 font-bold text-emerald-600 text-sm">
              <text class="i-carbon-checkmark-filled text-emerald-600" />
              <text>服务评价已完成</text>
            </view>
            <text class="text-[20rpx] text-slate-400 font-mono">
              {{ formatTimelineTime(orderDetail.evaluation.createTime) || '已提交' }}
            </text>
          </view>

          <!-- 评价星级与得分 (真实反显) -->
          <view class="flex items-center gap-2">
            <text class="text-xs text-slate-600">综合满意度:</text>
            <view class="flex text-amber-500 text-base">
              <text
                v-for="i in 5"
                :key="i"
                :class="i <= (orderDetail.evaluation.overallScore || 5) ? 'i-carbon-star-filled' : 'i-carbon-star text-slate-300'"
              />
            </view>
            <text class="text-xs font-bold text-amber-600">
              {{ orderDetail.evaluation.overallScore || 5 }} 星
            </text>
          </view>

          <!-- 真实已选标签 (仅展示司机实际勾选的标签) -->
          <view v-if="orderDetail.evaluation.tags && orderDetail.evaluation.tags.length > 0" class="flex flex-wrap gap-1.5">
            <text
              v-for="(tag, idx) in orderDetail.evaluation.tags"
              :key="idx"
              class="text-[20rpx] bg-slate-50 text-sky-700 border border-slate-200 px-2 py-0.5 rounded-sm font-medium"
            >
              # {{ tag }}
            </text>
          </view>

          <!-- 评语内容: 若司机未填文字评语则显示“（司机未填写文字评价）”，彻底杜绝虚假造假 -->
          <view
            class="text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200 leading-relaxed"
            :class="orderDetail.evaluation.commentContent ? 'text-slate-800' : 'text-slate-400 italic'"
          >
            {{ orderDetail.evaluation.commentContent ? `“${orderDetail.evaluation.commentContent}”` : '（司机未填写文字评价）' }}
          </view>

          <!-- 查看官方全息电子凭证按钮 -->
          <button
            class="w-full bg-emerald-600 active:bg-emerald-700 text-white text-xs min-h-[88rpx] rounded-lg font-bold border-none flex items-center justify-center gap-1.5 transition-colors"
            @click="gotoVoucher"
          >
            <text class="i-carbon-certificate-check text-sm" />
            <text>查看全息电子凭证与官方质保卡</text>
          </button>

          <view class="grid grid-cols-2 gap-2 pt-1">
            <button
              class="bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-300 text-xs min-h-[80rpx] rounded-lg font-bold flex items-center justify-center transition-colors"
              @click="gotoHome"
            >
              返回首页
            </button>
            <button
              class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs min-h-[80rpx] rounded-lg font-bold border-none flex items-center justify-center transition-colors"
              @click="gotoCallRescue"
            >
              再次呼叫救援
            </button>
          </view>
        </view>

        <!-- 5.2 尚未评价：交互表单态 -->
        <view v-else class="space-y-3.5">
          <view class="flex items-center justify-between pb-2 border-b border-slate-200">
            <view class="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <text class="i-carbon-thumbs-up text-[#0284c7]" />
              <text>服务满意度评价</text>
            </view>
            <text class="text-[20rpx] text-slate-500">匿名评价保障隐私</text>
          </view>

          <!-- 总体星级打分 -->
          <view class="text-center py-1">
            <text class="text-xs text-slate-500 block mb-2">点击星星为本次救援打分</text>
            <view class="flex items-center justify-center gap-2 text-3xl">
              <text
                v-for="star in 5"
                :key="star"
                class="cursor-pointer active:scale-125 transition-transform"
                :class="star <= evalForm.overallScore ? 'i-carbon-star-filled text-amber-500' : 'i-carbon-star text-slate-300'"
                @click="setScore('overallScore', star)"
              />
            </view>
            <text class="text-xs font-bold text-amber-600 mt-1 block">
              {{ evalForm.overallScore === 5 ? '非常满意 (5星)' : evalForm.overallScore === 4 ? '比较满意 (4星)' : evalForm.overallScore === 3 ? '一般 (3星)' : '不满意' }}
            </text>
          </view>

          <!-- 快捷服务标签 -->
          <view>
            <text class="text-[20rpx] text-slate-500 block mb-1.5">快捷服务标签</text>
            <view class="flex flex-wrap gap-1.5">
              <view
                v-for="tag in quickTags"
                :key="tag"
                class="text-[20rpx] px-2.5 py-1 rounded-sm cursor-pointer transition-colors border"
                :class="evalForm.tags.includes(tag) ? 'bg-[#0284c7] text-white border-[#0284c7] font-bold' : 'bg-slate-50 text-slate-700 border-slate-300'"
                @click="toggleTag(tag)"
              >
                {{ evalForm.tags.includes(tag) ? '✓ ' : '+ ' }}{{ tag }}
              </view>
            </view>
          </view>

          <!-- 评语心得多行输入 -->
          <view class="bg-slate-50 rounded-md p-2.5 border border-slate-300">
            <textarea
              v-model="evalForm.commentContent"
              class="w-full text-xs text-slate-900 h-16 leading-relaxed"
              placeholder="请写下您对出警技师服务态度、抢修效率的评价与建议（选填）..."
              placeholder-class="text-slate-400"
              :maxlength="200"
            />
          </view>

          <!-- 匿名选项与提交按钮 -->
          <view class="flex items-center justify-between pt-1">
            <view
              class="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"
              @click="evalForm.anonymous = evalForm.anonymous ? 0 : 1"
            >
              <text :class="evalForm.anonymous ? 'i-carbon-checkbox-checked text-[#0284c7]' : 'i-carbon-checkbox text-slate-400'" />
              <text>匿名评价</text>
            </view>
            <button
              class="bg-emerald-600 active:bg-emerald-700 text-white text-xs px-5 min-h-[72rpx] rounded-lg font-bold border-none flex items-center justify-center transition-colors"
              :disabled="submittingEval"
              @click="handleSubmitEvaluation"
            >
              提交服务评价
            </button>
          </view>
        </view>
      </view>

      <!-- 6. 双端联调辅助操作区 -->
      <view class="mx-4 mt-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
        <view class="text-xs font-bold text-sky-700 flex items-center gap-1">
          <text class="i-carbon-play-filled-alt text-[#0284c7]" />
          <text>双端协同与联调测试控制台</text>
        </view>
        <view class="grid grid-cols-2 gap-2">
          <button
            class="bg-white border border-slate-300 text-slate-700 text-xs min-h-[72rpx] rounded-lg font-bold active:bg-slate-100 flex items-center justify-center transition-colors"
            @click="handleMockArrived"
          >
            模拟技师到场打卡
          </button>
          <button
            class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs min-h-[72rpx] rounded-lg font-bold border-none flex items-center justify-center transition-colors"
            @click="handleMockComplete"
          >
            模拟完工流转结算
          </button>
        </view>
        <button
          class="w-full bg-white border border-slate-300 text-emerald-700 text-xs min-h-[72rpx] rounded-lg font-bold active:bg-slate-100 flex items-center justify-center transition-colors"
          @click="gotoTechnicianDesk"
        >
          进入技师工作台（接收任务/出发打卡）
        </button>
      </view>
    </template>

    <!-- 7. 模拟支付弹窗 Modal (工业高可视亮色风) -->
    <view
      v-if="showPayModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
      @click.self="closePayModal"
    >
      <view class="bg-white rounded-lg p-5 w-full max-w-sm border border-slate-200 shadow-2xl space-y-4">
        <view class="text-center pb-2 border-b border-slate-200">
          <view class="text-sm font-bold text-slate-900">救援费用结算确认</view>
          <view class="text-[20rpx] text-slate-500 mt-0.5 font-mono">工单号: {{ orderNo }}</view>
        </view>

        <!-- 应付金额大字展示 -->
        <view class="text-center py-2 bg-slate-50 rounded-md border border-slate-200">
          <text class="text-xs text-slate-500 block">待付总金额</text>
          <text class="text-2xl font-black font-mono text-rose-600 mt-1 block">
            ¥{{ orderDetail?.finalAmount || '400.00' }}
          </text>
        </view>

        <!-- 模拟支付通道选择 -->
        <view class="space-y-2 text-xs">
          <text class="text-[20rpx] text-slate-600 block font-bold">请选择模拟支付通道</text>
          <view
            class="p-3 rounded-md border flex items-center justify-between cursor-pointer transition-colors"
            :class="payChannel === 'MOCK_WECHAT' ? 'border-[#0284c7] bg-sky-50 text-slate-900' : 'border-slate-200 bg-white text-slate-700'"
            @click="payChannel = 'MOCK_WECHAT'"
          >
            <view class="flex items-center gap-2">
              <text class="i-carbon-logo-wechat text-emerald-600 text-lg" />
              <view>
                <view class="font-bold">微信支付 (沙箱模拟通道)</view>
                <view class="text-[20rpx] text-slate-500">推荐公路运输司机使用</view>
              </view>
            </view>
            <text :class="payChannel === 'MOCK_WECHAT' ? 'i-carbon-radio-button-checked text-[#0284c7]' : 'i-carbon-radio-button text-slate-400'" />
          </view>

          <view
            class="p-3 rounded-md border flex items-center justify-between cursor-pointer transition-colors"
            :class="payChannel === 'ACCOUNT_BALANCE' ? 'border-[#0284c7] bg-sky-50 text-slate-900' : 'border-slate-200 bg-white text-slate-700'"
            @click="payChannel = 'ACCOUNT_BALANCE'"
          >
            <view class="flex items-center gap-2">
              <text class="i-carbon-wallet text-amber-600 text-lg" />
              <view>
                <view class="font-bold">卡车汇司机钱包记账</view>
                <view class="text-[20rpx] text-slate-500">大客户与熟客月结通道</view>
              </view>
            </view>
            <text :class="payChannel === 'ACCOUNT_BALANCE' ? 'i-carbon-radio-button-checked text-[#0284c7]' : 'i-carbon-radio-button text-slate-400'" />
          </view>
        </view>

        <!-- 弹窗操作按钮 -->
        <view class="grid grid-cols-2 gap-2 pt-2">
          <button
            class="bg-slate-100 border border-slate-300 text-slate-700 text-xs min-h-[80rpx] rounded-lg font-bold flex items-center justify-center active:bg-slate-200 transition-colors"
            :disabled="paying"
            @click="closePayModal"
          >
            取消
          </button>
          <button
            class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs min-h-[80rpx] rounded-lg font-bold border-none flex items-center justify-center gap-1 transition-colors"
            :disabled="paying"
            @click="handleConfirmPay"
          >
            <text v-if="paying" class="inline-block animate-spin i-carbon-progress-bar-round" />
            <text>确认模拟支付</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 8. 同意授权二次确认弹窗 (US2, T008) -->
    <view
      v-if="showApproveModal"
      class="fixed inset-0 z-50 flex items-center justify-center px-6"
    >
      <!-- 半透明背景遮罩 (点击遮罩关闭) -->
      <view
        class="absolute inset-0 bg-black/50"
        @click="showApproveModal = false"
      />

      <!-- 弹窗主体卡片 (阻止冒泡) -->
      <view
        class="relative z-10 bg-white rounded-lg p-5 w-full max-w-sm border border-slate-200 shadow-2xl space-y-4"
        @click.stop
      >
        <view class="text-center pb-2 border-b border-slate-200">
          <view class="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
            <text class="i-carbon-security-check text-[#0284c7] text-lg" />
            <text>确认授权更换/增项</text>
          </view>
          <view class="text-[20rpx] text-slate-500 mt-0.5">请司机师傅仔细核对费用构成与明细</view>
        </view>

        <!-- 项目卡片摘要 -->
        <view class="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2 text-xs">
          <view class="flex items-center justify-between">
            <text class="text-slate-500">项目名称</text>
            <text class="font-bold text-slate-900">{{ approveTarget?.title }}</text>
          </view>
          <view v-if="approveTarget?.spec" class="flex items-center justify-between">
            <text class="text-slate-500">品牌/规格</text>
            <text class="text-slate-700 font-mono text-[20rpx]">{{ approveTarget?.spec }}</text>
          </view>
          <view v-if="approveTarget?.type === 'PART'" class="flex items-center justify-between">
            <text class="text-slate-500">配件材料费</text>
            <text class="text-slate-800 font-mono">¥{{ approveTarget?.materialFee?.toFixed(2) }}</text>
          </view>
          <view v-if="approveTarget?.type === 'PART'" class="flex items-center justify-between">
            <text class="text-slate-500">拆装工时费</text>
            <text class="text-slate-800 font-mono">¥{{ approveTarget?.laborFee?.toFixed(2) }}</text>
          </view>
          <view class="flex items-center justify-between pt-2 border-t border-slate-200">
            <text class="font-bold text-slate-900">本次授权金额</text>
            <text class="text-lg font-black font-mono text-amber-600">¥{{ approveTarget?.totalAmount?.toFixed(2) }}</text>
          </view>
        </view>

        <!-- 工业机能安全提示 -->
        <view class="text-[20rpx] text-slate-600 bg-sky-50 p-2.5 rounded border border-sky-200 leading-relaxed">
          ℹ️ <text class="text-sky-700 font-medium">司机须知：</text>确认授权后，此金额将正式计入本次救援完工结算总账单，出警技师将立即展开规范拆装施工。
        </view>

        <!-- 弹窗底部操作按钮 (手套优先大热区 >= 88rpx) -->
        <view class="grid grid-cols-2 gap-2 pt-1">
          <button
            class="bg-slate-100 border border-slate-300 text-slate-700 text-xs min-h-[88rpx] rounded-lg font-bold flex items-center justify-center active:bg-slate-200 transition-colors m-0"
            :disabled="approving"
            @click.stop="showApproveModal = false"
          >
            返回考虑
          </button>
          <button
            class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs min-h-[88rpx] rounded-lg font-bold border-none flex items-center justify-center gap-1 transition-colors m-0 shadow-sm"
            :disabled="approving"
            @click.stop="handleConfirmApprove"
          >
            <text v-if="approving" class="inline-block animate-spin i-carbon-progress-bar-round" />
            <text>确认同意授权</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 9. 拒绝授权原因选择弹窗 (US2, T009) -->
    <view
      v-if="showRejectModal"
      class="fixed inset-0 z-50 flex items-center justify-center px-6"
    >
      <!-- 半透明背景遮罩 (点击遮罩关闭) -->
      <view
        class="absolute inset-0 bg-black/50"
        @click="showRejectModal = false"
      />

      <!-- 弹窗主体卡片 (阻止冒泡) -->
      <view
        class="relative z-10 bg-white rounded-lg p-5 w-full max-w-sm border border-slate-200 shadow-2xl space-y-4"
        @click.stop
      >
        <view class="text-center pb-2 border-b border-slate-200">
          <view class="text-sm font-bold text-rose-600 flex items-center justify-center gap-1.5">
            <text class="i-carbon-warning text-rose-600 text-lg" />
            <text>拒绝更换/增项确认</text>
          </view>
          <view class="text-[20rpx] text-slate-500 mt-0.5 truncate">针对项目：{{ rejectTarget?.title }}</view>
        </view>

        <!-- 快捷原因选择 (单选) -->
        <view class="space-y-2 text-xs">
          <text class="text-[20rpx] text-slate-600 block font-bold">请选择拒绝原因：</text>
          <view class="grid grid-cols-2 gap-2">
            <view
              v-for="opt in quickRejectOptions"
              :key="opt"
              class="p-2.5 rounded border text-center text-xs font-medium cursor-pointer transition-colors"
              :class="selectedRejectQuickReason === opt ? 'bg-rose-50 text-rose-700 border-rose-400 font-bold' : 'bg-slate-50 text-slate-700 border-slate-200'"
              @click.stop="selectedRejectQuickReason = opt"
            >
              {{ opt }}
            </view>
          </view>
        </view>

        <!-- 补充原因输入 -->
        <view class="bg-slate-50 rounded p-2 border border-slate-300" @click.stop>
          <textarea
            v-model="customRejectReason"
            class="w-full text-xs text-slate-900 h-14 leading-relaxed"
            placeholder="其他详细原因或沟通说明（选填）..."
            placeholder-class="text-slate-400"
            :maxlength="100"
          />
        </view>

        <!-- 风险警示 -->
        <view class="text-[20rpx] text-rose-700 bg-rose-50 p-2.5 rounded border border-rose-200 leading-relaxed">
          ⚠️ <text class="text-rose-600 font-bold">特别警示：</text>拒绝后技师将不更换该配件，若涉及核心行车安全部件，可能影响车辆正常安全行驶，请与技师充分确认！
        </view>

        <!-- 弹窗底部操作按钮 (手套优先大热区 >= 88rpx) -->
        <view class="grid grid-cols-2 gap-2 pt-1">
          <button
            class="bg-slate-100 border border-slate-300 text-slate-700 text-xs min-h-[88rpx] rounded-lg font-bold flex items-center justify-center active:bg-slate-200 transition-colors m-0"
            :disabled="rejecting"
            @click.stop="showRejectModal = false"
          >
            暂不拒绝
          </button>
          <button
            class="bg-rose-600 active:bg-rose-700 text-white text-xs min-h-[88rpx] rounded-lg font-bold border-none flex items-center justify-center gap-1 transition-colors m-0 shadow-sm"
            :disabled="rejecting"
            @click.stop="handleConfirmReject"
          >
            <text v-if="rejecting" class="inline-block animate-spin i-carbon-progress-bar-round" />
            <text>确认拒绝更换</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>
