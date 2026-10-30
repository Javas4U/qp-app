<script lang="ts" setup>
import { getActiveRescueOrder } from '@/api/rescue'
import OrderTimelineModal from '@/components/OrderTimelineModal.vue'
import OrderVoucherVerifyModal from '@/components/OrderVoucherVerifyModal.vue'
import { GUEST_PLACEHOLDERS } from '@/constants/guest'
import { useMallSessionStore } from '@/store/mallSession'
import { useRescueSessionStore } from '@/store/rescueSession'
import { useTokenStore } from '@/store/token'
import type { DemoMaintenanceOrderItem, DemoMallOrderItem } from '@/types/demo'
import type { RescueOrderVo, RescueTicket } from '@/types/rescue'
import { toLoginPage } from '@/utils/toLoginPage'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'OrderHallPage',
})

definePage({
  style: {
    navigationBarTitleText: '综合订单大厅',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

const tokenStore = useTokenStore()
const rescueStore = useRescueSessionStore()
const mallStore = useMallSessionStore()

const hasLogin = computed(() => tokenStore.updateNowTime().hasLogin)
const { currentTicket, historyTickets } = storeToRefs(rescueStore)
const { mallOrdersList, maintenanceOrdersList } = storeToRefs(mallStore)

// 基准历史结算完成救援工单
const defaultHistoryTicket: RescueTicket = {
  ticketId: 'RC202610120001',
  driverId: 'D10001',
  driverName: '李师傅',
  driverPhone: '13800138000',
  plateNo: '鄂A·88888',
  rescueType: 'ENGINE',
  rescueTypeName: '发动机故障',
  status: 'PAID',
  location: {
    address: 'G107国道孝感段K128+500处',
    lat: 30.92,
    lng: 113.91,
  },
  faultImages: [
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80',
  ],
  faultDescription: '重载爬坡时发动机水温爆表报警，熄火后伴有异响无法启动',
  estimatedFee: 600,
  paidAmount: 1000,
  createTime: '2026-10-12 14:32:00',
  technicianId: 'T8801',
  technicianName: '张建军师傅',
  technicianPhone: '13911223344',
  technicianRating: 4.9,
  stationName: '卡车汇东风商用车孝感特约救援站',
  replacedParts: [
    {
      partName: '原厂节温器总成 (东风康明斯ISZ13)',
      partCode: 'OE-5345091',
      isOriginal: true,
      price: 580,
      laborFee: 220,
    },
    {
      partName: '原厂重负荷防冻冷却液 10kg',
      partCode: 'OE-8821903',
      isOriginal: true,
      price: 200,
      laborFee: 0,
    },
  ],
}

function convertVoToTicket(vo: RescueOrderVo): RescueTicket {
  return {
    ticketId: vo.orderNo,
    driverName: vo.driverName || '卡车司机',
    driverPhone: vo.driverPhone || '--',
    plateNo: vo.plateNo || '鄂A·88888',
    rescueType: (vo.serviceType || 'ENGINE') as any,
    rescueTypeName: vo.serviceType === 'ENGINE' ? '发动机故障' : (vo.serviceType || '道路紧急救援'),
    status: vo.orderStatus,
    location: {
      address: vo.rescueAddress || '现场救援位置',
      lat: vo.rescueLatitude || 30.92,
      lng: vo.rescueLongitude || 113.91,
    },
    faultDescription: vo.faultDescription || '车辆突发故障急需救援',
    estimatedFee: vo.estimatedAmount || 600,
    paidAmount: vo.orderStatus === 'PAID' ? ((vo.estimatedAmount || 600) + (vo.extraAmount || 0)) : undefined,
    createTime: new Date().toLocaleString(),
    technicianName: vo.technicianName,
    technicianPhone: vo.technicianPhone,
    stationName: vo.stationName || vo.assignedStationName || '卡车汇特约技术服务站',
  }
}

onShow(() => {
  fetchRescueOrders()
})

async function fetchRescueOrders() {
  if (!hasLogin.value)
    return

  try {
    const res = await getActiveRescueOrder()
    if (res && res.orderNo) {
      rescueStore.setActiveOrderDetail(res)
      currentTicket.value = convertVoToTicket(res)
    }
    else {
      if (!currentTicket.value && historyTickets.value.length === 0) {
        historyTickets.value = [{ ...defaultHistoryTicket }]
      }
    }
  }
  catch {
    if (!currentTicket.value && historyTickets.value.length === 0) {
      historyTickets.value = [{ ...defaultHistoryTicket }]
    }
  }
}

function handleGoLogin() {
  toLoginPage({
    redirectUrl: '/pages/order/index',
    noticeMessage: '请先登录查看全部订单与救援进度',
  })
}

// 选中的 Tab 类别：RESCUE (救援) | MALL (商城配件) | MAINTENANCE (维保预约)
const activeTab = ref<'RESCUE' | 'MALL' | 'MAINTENANCE'>('RESCUE')

// 合并的救援工单列表（当前在途工单在首位）
const rescueList = computed(() => {
  const list = [...historyTickets.value]
  if (currentTicket.value) {
    list.unshift(currentTicket.value)
  }
  return list
})

// 物流时间轴弹窗状态
const showTimelineModal = ref(false)
const selectedMallOrder = ref<DemoMallOrderItem | null>(null)

function openTimeline(order: DemoMallOrderItem) {
  selectedMallOrder.value = order
  showTimelineModal.value = true
}

function handleConfirmReceipt(orderNo: string) {
  mallStore.updateMallOrderStatus(orderNo, 'COMPLETED')
  showTimelineModal.value = false
  uni.showToast({ title: '已确认收货，交易完成', icon: 'success' })
}

// 维保进站核销凭证弹窗状态
const showVoucherModal = ref(false)
const selectedMaintenanceOrder = ref<DemoMaintenanceOrderItem | null>(null)

function openVoucher(order: DemoMaintenanceOrderItem) {
  selectedMaintenanceOrder.value = order
  showVoucherModal.value = true
}

function handleVerifyMaintenance(orderNo: string) {
  mallStore.updateMaintenanceOrderStatus(orderNo, 'FINISHED')
  showVoucherModal.value = false
  uni.showToast({ title: '已成功核销进站保养凭证', icon: 'success' })
}

// 状态名称与颜色映射
function getStatusBadge(status: string) {
  switch (status) {
    case 'DISPATCHING':
    case 'PENDING_DISPATCH':
      return { text: '雷达调度中', bg: 'bg-amber-500/20 text-amber-400 border border-amber-400/40' }
    case 'ACCEPTED':
    case 'DEPARTED':
      return { text: '技师赶赴中', bg: 'bg-sky-500/20 text-sky-400 border border-sky-400/40' }
    case 'ARRIVED':
    case 'IN_PROGRESS':
      return { text: '现场抢修中', bg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/40' }
    case 'SERVICING':
      return { text: '检修换件中', bg: 'bg-purple-500/20 text-purple-400 border border-purple-400/40' }
    case 'COMPLETED':
      return { text: '待司机结算', bg: 'bg-orange-500/20 text-orange-400 border border-orange-400/40' }
    case 'PAID':
      return { text: '已结算完成', bg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' }
    case 'CANCELLED':
      return { text: '已取消', bg: 'bg-slate-700/60 text-slate-400 border border-slate-600' }
    default:
      return { text: status, bg: 'bg-slate-700/60 text-slate-300 border border-slate-600' }
  }
}

function handleViewTracking() {
  uni.navigateTo({ url: '/pages-sub/rescue/tracking' })
}

function handlePayTicket() {
  uni.navigateTo({ url: '/pages-sub/rescue/success' })
}

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

function callPhone(phoneNumber: string) {
  uni.makePhoneCall({
    phoneNumber,
    fail: () => {
      uni.showToast({ title: `拨打电话: ${phoneNumber}`, icon: 'none' })
    },
  })
}
</script>

<template>
  <view class="order-page min-h-screen bg-[#0f172a] pb-24 text-slate-100">
    <!-- 1. 顶部 Tab 切换栏：深碳底色与机能高亮下划线 -->
    <view class="sticky top-0 z-20 border-b border-slate-700/80 bg-[#1e293b]">
      <view class="flex items-center justify-around text-sm font-medium">
        <view
          class="relative cursor-pointer px-4 py-3.5 transition-colors"
          :class="activeTab === 'RESCUE' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="activeTab = 'RESCUE'"
        >
          <text>道路救援工单</text>
          <view
            v-if="activeTab === 'RESCUE'"
            class="absolute bottom-0 left-1/2 h-1 w-8 rounded-sm bg-sky-400 -translate-x-1/2"
          />
        </view>

        <view
          class="relative cursor-pointer px-4 py-3.5 transition-colors"
          :class="activeTab === 'MALL' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="activeTab = 'MALL'"
        >
          <text>商城配件订单</text>
          <view
            v-if="activeTab === 'MALL'"
            class="absolute bottom-0 left-1/2 h-1 w-8 rounded-sm bg-sky-400 -translate-x-1/2"
          />
        </view>

        <view
          class="relative cursor-pointer px-4 py-3.5 transition-colors"
          :class="activeTab === 'MAINTENANCE' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="activeTab = 'MAINTENANCE'"
        >
          <text>维保预约单</text>
          <view
            v-if="activeTab === 'MAINTENANCE'"
            class="absolute bottom-0 left-1/2 h-1 w-8 rounded-sm bg-sky-400 -translate-x-1/2"
          />
        </view>
      </view>
    </view>

    <!-- 2. 未登录统一工业风空态占位引导卡片 -->
    <view
      v-if="!hasLogin"
      class="flex flex-col items-center justify-center px-6 pt-24 text-center"
    >
      <view class="mb-4 h-16 w-16 flex items-center justify-center border border-slate-700/80 rounded-xl bg-[#1e293b] text-3xl text-slate-500 shadow-sm">
        <text class="i-carbon-document-unknown" />
      </view>
      <view class="mb-1.5 text-sm text-slate-200 font-bold">
        您当前处于未登录状态
      </view>
      <view class="mb-6 max-w-[480rpx] text-xs text-slate-400 leading-relaxed">
        {{ GUEST_PLACEHOLDERS.emptyOrderText }}
      </view>
      <button
        class="h-11 min-h-[88rpx] flex items-center justify-center rounded-md border-none bg-[#0284c7] px-8 text-xs text-white font-bold shadow-sm active:bg-[#0369a1]"
        @click="handleGoLogin"
      >
        立即登录
      </button>
    </view>

    <!-- 3. 已登录状态：按 Tab 渲染各业务订单 -->
    <template v-else>
      <!-- 救援工单列表 -->
      <view v-if="activeTab === 'RESCUE'" class="p-4 space-y-3">
        <view
          v-if="rescueList.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <text class="i-carbon-ticket mb-2 text-3xl text-slate-600" />
          <text class="text-xs text-slate-400">暂无道路救援工单记录</text>
        </view>

        <view
          v-for="ticket in rescueList"
          :key="ticket.ticketId"
          class="border border-slate-700/80 rounded-lg bg-[#1e293b] p-4"
        >
          <view class="flex items-center justify-between border-b border-slate-700/80 pb-2.5 text-xs">
            <view class="flex items-center gap-1.5 text-slate-400 font-mono">
              <text class="i-carbon-ticket text-sm text-sky-400" />
              <text class="text-slate-200 font-bold">{{ ticket.ticketId }}</text>
            </view>
            <view
              class="rounded-sm px-2 py-0.5 text-[20rpx] font-bold"
              :class="getStatusBadge(ticket.status).bg"
            >
              {{ getStatusBadge(ticket.status).text }}
            </view>
          </view>

          <view class="py-3 text-xs text-slate-300 space-y-1.5">
            <view class="flex items-center justify-between text-slate-100 font-bold">
              <view class="flex items-center gap-1.5">
                <text class="i-carbon-delivery-truck text-base text-amber-400" />
                <text>{{ ticket.plateNo }} · {{ ticket.rescueTypeName }}</text>
              </view>
              <view class="text-sm text-rose-400 font-extrabold font-mono">
                ¥{{ ticket.paidAmount || ticket.estimatedFee || 600 }}
              </view>
            </view>

            <view class="flex items-start gap-1 text-[22rpx] text-slate-400">
              <text class="i-carbon-location mt-0.5 text-red-500" />
              <text class="line-clamp-1">{{ ticket.location.address }}</text>
            </view>

            <view v-if="ticket.technicianName" class="flex items-center gap-1 text-[22rpx] text-emerald-400 font-medium">
              <text class="i-carbon-user text-xs" />
              <text>技师：{{ ticket.technicianName }} ({{ ticket.technicianPhone }})</text>
            </view>

            <view class="text-[20rpx] text-slate-400 font-medium">
              报案时间：{{ ticket.createTime }}
            </view>
          </view>

          <!-- 操作按钮行 (触控热区 >= 88rpx / h-10) -->
          <view class="flex items-center justify-end gap-2 border-t border-slate-700/80 pt-2.5 text-xs">
            <button
              v-if="ticket.status === 'DISPATCHING' || ticket.status === 'PENDING_DISPATCH'"
              class="h-10 min-h-[80rpx] flex items-center justify-center border border-amber-500/40 rounded-md bg-amber-500/15 px-3.5 text-xs text-amber-400 font-bold active:bg-amber-500/30"
              @click="navigateTo('/pages-sub/rescue/dispatch')"
            >
              查看派单雷达
            </button>
            <button
              v-if="['ACCEPTED', 'ARRIVED', 'SERVICING', 'DEPARTED', 'IN_PROGRESS'].includes(ticket.status)"
              class="h-10 min-h-[80rpx] flex items-center justify-center rounded-md border-none bg-[#0284c7] px-3.5 text-xs text-white font-bold active:bg-[#0369a1]"
              @click="handleViewTracking"
            >
              跟踪轨迹
            </button>
            <button
              v-if="ticket.status === 'COMPLETED'"
              class="h-10 min-h-[80rpx] flex items-center justify-center rounded-md border-none bg-red-600 px-3.5 text-xs text-white font-bold active:bg-red-700"
              @click="handlePayTicket"
            >
              立即支付 ¥{{ ticket.paidAmount || 1000 }}
            </button>
            <button
              v-if="ticket.status === 'PAID'"
              class="h-10 min-h-[80rpx] flex items-center justify-center border border-slate-600 rounded-md bg-slate-800 px-3.5 text-xs text-slate-300 font-bold active:bg-slate-700"
              @click="navigateTo('/pages-sub/rescue/success')"
            >
              结算凭据
            </button>
          </view>
        </view>
      </view>

      <!-- 商城配件订单列表 (动态响应 Store) -->
      <view v-else-if="activeTab === 'MALL'" class="p-4 space-y-3">
        <view
          v-if="mallOrdersList.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <text class="i-carbon-box mb-2 text-3xl text-slate-600" />
          <text class="text-xs text-slate-400">暂无商城配件订单记录</text>
        </view>

        <view
          v-for="order in mallOrdersList"
          :key="order.orderNo"
          class="border border-slate-700/80 rounded-lg bg-[#1e293b] p-4"
        >
          <view class="flex items-center justify-between border-b border-slate-700/80 pb-2.5 text-xs">
            <text class="text-slate-400 font-mono">{{ order.orderNo }}</text>
            <view
              class="rounded-sm px-2 py-0.5 text-[20rpx] font-bold"
              :class="order.badgeBg"
            >
              {{ order.statusText }}
            </view>
          </view>

          <view class="flex gap-3 py-3">
            <image
              :src="order.image"
              mode="aspectFill"
              class="h-20 w-20 shrink-0 border border-slate-700 rounded-md bg-slate-900"
            />
            <view class="flex flex-1 flex-col justify-between text-xs">
              <view>
                <view class="line-clamp-1 text-slate-100 font-bold">
                  {{ order.partName }}
                </view>
                <view class="mt-1 text-[20rpx] text-slate-400">
                  {{ order.spec }}
                </view>
                <view class="mt-1 inline-block border border-sky-400/30 rounded-sm bg-sky-500/15 px-1.5 py-0.5 text-[18rpx] text-sky-400 font-bold">
                  {{ order.channelText }}
                </view>
              </view>
              <view class="mt-2 flex items-center justify-between">
                <text class="text-slate-400">数量 × {{ order.quantity }}</text>
                <text class="text-sm text-rose-400 font-extrabold font-mono">¥{{ order.totalPrice }}</text>
              </view>
            </view>
          </view>

          <view class="flex items-center justify-between border-t border-slate-700/80 pt-2.5 text-xs">
            <text class="text-[20rpx] text-slate-400">履约站：{{ order.stationName }}</text>
            <button
              class="h-10 min-h-[80rpx] flex items-center justify-center rounded-md border-none bg-[#0284c7] px-3.5 text-xs text-white font-bold active:bg-[#0369a1]"
              @click="openTimeline(order)"
            >
              查看履约进度
            </button>
          </view>
        </view>
      </view>

      <!-- 维保预约单列表 (动态响应 Store) -->
      <view v-else class="p-4 space-y-3">
        <view
          v-if="maintenanceOrdersList.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <text class="i-carbon-tools mb-2 text-3xl text-slate-600" />
          <text class="text-xs text-slate-400">暂无维保预约记录</text>
        </view>

        <view
          v-for="order in maintenanceOrdersList"
          :key="order.orderNo"
          class="border border-slate-700/80 rounded-lg bg-[#1e293b] p-4"
        >
          <view class="flex items-center justify-between border-b border-slate-700/80 pb-2.5 text-xs">
            <text class="text-slate-400 font-mono">{{ order.orderNo }}</text>
            <view
              class="rounded-sm px-2 py-0.5 text-[20rpx] font-bold"
              :class="order.isOngoing ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30' : 'bg-slate-700/60 text-slate-300 border border-slate-600'"
            >
              {{ order.statusText }}
            </view>
          </view>

          <view class="py-3 text-xs text-slate-300 space-y-1.5">
            <view class="text-sm text-slate-100 font-bold">
              {{ order.packageName }}
            </view>
            <view class="text-[22rpx] text-slate-400">
              预约服务站：{{ order.stationName }}
            </view>
            <view class="text-[22rpx] text-slate-400">
              进站时间：{{ order.serviceTime }}
            </view>
            <view class="text-[22rpx] text-slate-400">
              服务地址：{{ order.address }}
            </view>
          </view>

          <view class="flex items-center justify-end gap-2 border-t border-slate-700/80 pt-2.5 text-xs">
            <button
              class="h-10 min-h-[80rpx] flex items-center justify-center border border-amber-500/40 rounded-md bg-amber-500/15 px-3.5 text-xs text-amber-400 font-bold active:bg-amber-500/30"
              @click="openVoucher(order)"
            >
              进站凭据 / 核销码
            </button>
            <button
              class="h-10 min-h-[80rpx] flex items-center justify-center rounded-md border-none bg-[#0284c7] px-3.5 text-xs text-white font-bold active:bg-[#0369a1]"
              @click="callPhone(order.phone)"
            >
              联系服务站
            </button>
          </view>
        </view>
      </view>
    </template>

    <!-- 4. 物流时间轴追踪弹窗 -->
    <OrderTimelineModal
      v-model:visible="showTimelineModal"
      :order="selectedMallOrder"
      @confirm-receipt="handleConfirmReceipt"
    />

    <!-- 5. 进站核销条码凭证弹窗 -->
    <OrderVoucherVerifyModal
      v-model:visible="showVoucherModal"
      :order="selectedMaintenanceOrder"
      @verify-order="handleVerifyMaintenance"
    />
  </view>
</template>
