<script lang="ts" setup>
import { useMallSessionStore } from '@/store/mallSession'
import { useRescueSessionStore } from '@/store/rescueSession'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'OrderHallPage',
})

definePage({
  style: {
    navigationBarTitleText: '订单大厅',
    navigationBarBackgroundColor: '#0284c7',
    navigationBarTextStyle: 'white',
  },
})

const rescueStore = useRescueSessionStore()
const mallStore = useMallSessionStore()

const { currentTicket, historyTickets } = storeToRefs(rescueStore)
const { currentPart, selectedStation } = storeToRefs(mallStore)

// 选中的 Tab 类别：RESCUE (救援) | MALL (商城配件) | MAINTENANCE (维保预约)
const activeTab = ref<'RESCUE' | 'MALL' | 'MAINTENANCE'>('RESCUE')

// 合并的救援工单列表（当前工单在首位）
const rescueList = computed(() => {
  const list = [...historyTickets.value]
  if (currentTicket.value) {
    list.unshift(currentTicket.value)
  }
  return list
})

// 状态名称与颜色映射
function getStatusBadge(status: string) {
  switch (status) {
    case 'DISPATCHING':
      return { text: '雷达调度中', bg: 'bg-amber-500/15 text-amber-500 border border-amber-400/30' }
    case 'ACCEPTED':
      return { text: '技师已接单', bg: 'bg-sky-500/15 text-[#0284c7] border border-sky-400/30' }
    case 'ARRIVED':
      return { text: '已到场打卡', bg: 'bg-indigo-500/15 text-indigo-500 border border-indigo-400/30' }
    case 'SERVICING':
      return { text: '检修换件中', bg: 'bg-purple-500/15 text-purple-500 border border-purple-400/30' }
    case 'COMPLETED':
      return { text: '待司机结算', bg: 'bg-orange-500/15 text-orange-500 border border-orange-400/30' }
    case 'PAID':
      return { text: '已结算完成', bg: 'bg-emerald-500/15 text-emerald-600 border border-emerald-400/30' }
    case 'CANCELLED':
      return { text: '已取消', bg: 'bg-slate-100 text-slate-500 border border-slate-200' }
    default:
      return { text: status, bg: 'bg-slate-100 text-slate-600 border border-slate-200' }
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
  <view class="order-page min-h-screen bg-[#f8fafc] pb-24">
    <!-- 1. 顶部 Tab 切换栏：规整机能实线下划线 -->
    <view class="sticky top-0 z-20 bg-white border-b border-slate-200/90">
      <view class="flex items-center justify-around text-sm font-medium">
        <view
          class="py-3 px-4 relative cursor-pointer"
          :class="activeTab === 'RESCUE' ? 'text-[#0284c7] font-bold' : 'text-slate-500'"
          @click="activeTab = 'RESCUE'"
        >
          <text>道路救援工单</text>
          <view
            v-if="activeTab === 'RESCUE'"
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#0284c7] rounded-sm"
          />
        </view>

        <view
          class="py-3 px-4 relative cursor-pointer"
          :class="activeTab === 'MALL' ? 'text-[#0284c7] font-bold' : 'text-slate-500'"
          @click="activeTab = 'MALL'"
        >
          <text>商城配件订单</text>
          <view
            v-if="activeTab === 'MALL'"
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#0284c7] rounded-sm"
          />
        </view>

        <view
          class="py-3 px-4 relative cursor-pointer"
          :class="activeTab === 'MAINTENANCE' ? 'text-[#0284c7] font-bold' : 'text-slate-500'"
          @click="activeTab = 'MAINTENANCE'"
        >
          <text>维保预约单</text>
          <view
            v-if="activeTab === 'MAINTENANCE'"
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#0284c7] rounded-sm"
          />
        </view>
      </view>
    </view>

    <!-- 2. 救援工单列表 -->
    <view v-if="activeTab === 'RESCUE'" class="p-4 space-y-3">
      <view
        v-for="ticket in rescueList"
        :key="ticket.ticketId"
        class="bg-white rounded-lg p-4 border border-slate-200/80"
      >
        <view class="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
          <view class="flex items-center gap-1.5 text-slate-500 font-mono">
            <text class="i-carbon-ticket text-sm text-[#0284c7]" />
            <text class="font-bold text-slate-700">{{ ticket.ticketId }}</text>
          </view>
          <view
            class="px-2 py-0.5 rounded-sm text-[20rpx] font-bold"
            :class="getStatusBadge(ticket.status).bg"
          >
            {{ getStatusBadge(ticket.status).text }}
          </view>
        </view>

        <view class="py-3 space-y-1.5 text-xs text-slate-600">
          <view class="flex items-center justify-between text-slate-900 font-bold">
            <view class="flex items-center gap-1.5">
              <text class="i-carbon-delivery-truck text-base text-slate-700" />
              <text>{{ ticket.plateNo }} · {{ ticket.rescueTypeName }}</text>
            </view>
            <view class="text-sm text-red-600 font-extrabold font-mono">
              ¥{{ ticket.paidAmount || ticket.estimatedFee || 600 }}
            </view>
          </view>

          <view class="flex items-start gap-1 text-[22rpx] text-slate-500">
            <text class="i-carbon-location text-red-600 mt-0.5" />
            <text class="line-clamp-1">{{ ticket.location.address }}</text>
          </view>

          <view v-if="ticket.technicianName" class="flex items-center gap-1 text-[22rpx] text-emerald-600 font-medium">
            <text class="i-carbon-user text-xs" />
            <text>技师：{{ ticket.technicianName }} ({{ ticket.technicianPhone }})</text>
          </view>

          <view class="text-[20rpx] text-slate-400 font-medium">
            报案时间：{{ ticket.createTime }}
          </view>
        </view>

        <!-- 操作按钮行：符合手套热区与触感设计 -->
        <view class="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
          <button
            v-if="ticket.status === 'DISPATCHING'"
            class="bg-sky-50 border border-sky-200/80 text-[#0284c7] px-3.5 h-8 rounded-md text-xs font-bold m-0 flex items-center justify-center active:bg-sky-100"
            @click="navigateTo('/pages-sub/rescue/dispatch')"
          >
            查看派单雷达
          </button>
          <button
            v-if="['ACCEPTED', 'ARRIVED', 'SERVICING'].includes(ticket.status)"
            class="bg-[#0284c7] text-white px-3.5 h-8 rounded-md text-xs font-bold m-0 flex items-center justify-center active:bg-[#0369a1]"
            @click="handleViewTracking"
          >
            跟踪轨迹
          </button>
          <button
            v-if="ticket.status === 'COMPLETED'"
            class="bg-red-600 text-white px-3.5 h-8 rounded-md text-xs font-bold m-0 flex items-center justify-center active:bg-red-700"
            @click="handlePayTicket"
          >
            立即支付 ¥{{ ticket.paidAmount || 1000 }}
          </button>
          <button
            v-if="ticket.status === 'PAID'"
            class="bg-slate-100 border border-slate-200 text-slate-700 px-3.5 h-8 rounded-md text-xs font-bold m-0 flex items-center justify-center active:bg-slate-200"
            @click="navigateTo('/pages-sub/rescue/success')"
          >
            结算凭据
          </button>
        </view>
      </view>
    </view>

    <!-- 2. 商城配件订单列表 -->
    <view v-else-if="activeTab === 'MALL'" class="p-4 space-y-3">
      <view class="bg-white rounded-lg p-4 border border-slate-200/80">
        <view class="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
          <text class="text-slate-400 font-mono">OD-20261012-0992</text>
          <text class="text-[#059669] font-bold">待收货 / 待到店安装</text>
        </view>

        <view class="py-3 flex gap-3">
          <image
            :src="currentPart.image"
            mode="aspectFill"
            class="w-20 h-20 rounded-md bg-slate-100 shrink-0"
          />
          <view class="flex-1 flex flex-col justify-between text-xs">
            <view>
              <view class="font-bold text-slate-900 line-clamp-1">
                {{ currentPart.name }}
              </view>
              <view class="text-[20rpx] text-slate-400 mt-1">
                规格：11L / 460Ps · 原厂国六B
              </view>
              <view class="inline-block mt-1 bg-sky-50 border border-sky-200/70 text-[#0284c7] text-[18rpx] px-1.5 py-0.5 rounded-sm font-bold">
                履约通道：到店特约站专业安装 (含¥1200工时费)
              </view>
            </view>
            <view class="flex items-center justify-between mt-2">
              <text class="text-slate-500">数量 × 1</text>
              <text class="text-sm font-extrabold text-red-600 font-mono">¥14,000</text>
            </view>
          </view>
        </view>

        <view class="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <text class="text-slate-400 text-[20rpx]">指定服务站：{{ selectedStation.name }}</text>
          <button
            class="bg-[#0284c7] text-white px-3.5 h-8 rounded-md text-xs font-bold m-0 flex items-center justify-center active:bg-[#0369a1]"
            @click="navigateTo('/pages-sub/mall/checkout')"
          >
            查看履约进度
          </button>
        </view>
      </view>
    </view>

    <!-- 3. 维保预约单列表 -->
    <view v-else class="p-4 space-y-3">
      <view class="bg-white rounded-lg p-4 border border-slate-200/80">
        <view class="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
          <text class="text-slate-400 font-mono">YY-20261015-001</text>
          <text class="text-[#0284c7] font-bold">预约成功 · 待进站</text>
        </view>

        <view class="py-3 space-y-1.5 text-xs text-slate-600">
          <view class="text-sm font-bold text-slate-900">
            东风天龙旗舰 小保养基础套餐 + 36项底盘巡检
          </view>
          <view class="text-[22rpx] text-slate-500">
            预约服务站：{{ selectedStation.name }}
          </view>
          <view class="text-[22rpx] text-slate-500">
            进站时间：2026年10月15日 14:00
          </view>
          <view class="text-[22rpx] text-slate-500">
            服务地址：{{ selectedStation.address }}
          </view>
        </view>

        <view class="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
          <button
            class="bg-sky-50 border border-sky-200/80 text-[#0284c7] px-3.5 h-8 rounded-md text-xs font-bold m-0 flex items-center justify-center active:bg-sky-100"
            @click="navigateTo('/pages-sub/mall/package-select')"
          >
            增补维保项目
          </button>
          <button
            class="bg-[#0284c7] text-white px-3.5 h-8 rounded-md text-xs font-bold m-0 flex items-center justify-center active:bg-[#0369a1]"
            @click="callPhone(selectedStation.phone)"
          >
            联系服务站
          </button>
        </view>
      </view>
    </view>
  </view>
</template>
