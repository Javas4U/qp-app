<script lang="ts" setup>
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'PackageSelectPage',
})

definePage({
  style: {
    navigationBarTitleText: '维保套餐定制选配',
    navigationBarBackgroundColor: '#f8fafc',
    navigationBarTextStyle: 'black',
  },
})

const mallStore = useMallSessionStore()
const {
  selectedModel,
  maintenancePackages,
  selectedPackagesTotal,
  selectedStation,
} = storeToRefs(mallStore)

function toggleItem(id: string) {
  mallStore.toggleMaintenancePackage(id)
}

function handleConfirmBooking() {
  uni.showModal({
    title: '确认预约维保套餐',
    content: `合计费用：¥${selectedPackagesTotal.value} 元，预约网点：${selectedStation.value.name}`,
    confirmText: '立即预约',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '维保预约成功！', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/order/index' })
        }, 600)
      }
    },
  })
}
</script>

<template>
  <view class="package-select-page min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
    <!-- 1. 顶部适配车型卡片 (工业刚性顶栏) -->
    <view class="bg-white border-b border-slate-200/90 pt-3 pb-3.5 px-4 shadow-sm">
      <view class="bg-slate-50 rounded-lg p-3 flex items-center justify-between border border-slate-200">
        <view class="flex items-center gap-2">
          <text class="i-carbon-delivery-truck text-amber-500 text-lg" />
          <view>
            <view class="text-[20rpx] text-slate-500">
              维保适配车型
            </view>
            <view class="text-xs font-bold text-slate-900 font-mono">
              {{ selectedModel.name }}
            </view>
          </view>
        </view>
        <view class="text-[20rpx] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-sm font-bold">
          原厂专业养护
        </view>
      </view>
    </view>

    <!-- 2. 维保套餐多选项列表 -->
    <view class="mx-4 mt-3 space-y-3">
      <view class="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
        <text>精选原厂维保升级包 (可多选组合)</text>
        <text class="text-[20rpx] text-sky-600 font-semibold">已选金额联动计算</text>
      </view>

      <view
        v-for="pkg in maintenancePackages"
        :key="pkg.id"
        class="bg-white rounded-lg p-4 border transition-all cursor-pointer flex items-start gap-3 shadow-sm"
        :class="pkg.selected ? 'border-[#0284c7] bg-sky-50/60 ring-1 ring-[#0284c7]/30' : 'border-slate-200/90 hover:border-slate-300'"
        @click="toggleItem(pkg.id)"
      >
        <!-- 复选框图标 -->
        <view class="mt-0.5">
          <view
            class="w-5 h-5 rounded-sm flex items-center justify-center text-xs transition-colors"
            :class="pkg.selected ? 'bg-[#0284c7] text-white' : 'border border-slate-300 bg-white'"
          >
            <text v-if="pkg.selected" class="i-carbon-checkmark" />
          </view>
        </view>

        <!-- 套餐详情 -->
        <view class="flex-1 overflow-hidden">
          <view class="flex items-center justify-between">
            <text class="text-xs font-bold text-slate-900">{{ pkg.name }}</text>
            <text class="text-sm font-black text-rose-600 font-mono">¥{{ pkg.price }}</text>
          </view>
          <view class="text-[20rpx] text-slate-500 mt-1 leading-relaxed">
            {{ pkg.desc }}
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 预约进站服务站卡片 -->
    <view class="mx-4 mt-4 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm">
      <view class="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
        <view class="flex items-center gap-1.5">
          <text class="i-carbon-store text-emerald-600" />
          <text>指定进站维保服务站</text>
        </view>
        <text class="text-[20rpx] text-sky-600 font-bold">切换网点</text>
      </view>
      <view class="text-xs font-bold text-slate-900">
        {{ selectedStation.name }}
      </view>
      <view class="text-[20rpx] text-slate-500 mt-0.5 font-mono">
        {{ selectedStation.address }} · 距您 {{ selectedStation.distanceKm }}km
      </view>
    </view>

    <!-- 4. 底部固定结算条 (工业亮色白底浮条) -->
    <view class="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between z-30 shadow-lg">
      <view class="pl-3">
        <text class="text-xs text-slate-500">已选套餐总计：</text>
        <text class="text-xl font-black text-rose-600 font-mono">¥{{ selectedPackagesTotal }}</text>
      </view>

      <button
        class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs px-6 min-h-[80rpx] rounded-lg font-bold border-none flex items-center justify-center transition-colors m-0 shadow-sm shadow-sky-600/20"
        @click="handleConfirmBooking"
      >
        确认套餐并预约进站
      </button>
    </view>
  </view>
</template>
