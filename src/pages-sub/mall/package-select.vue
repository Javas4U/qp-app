<script lang="ts" setup>
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'PackageSelectPage',
})

definePage({
  style: {
    navigationBarTitleText: '维保套餐定制选配',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
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
  <view class="package-select-page min-h-screen bg-[#0f172a] text-slate-100 pb-24">
    <!-- 1. 顶部适配车型卡片 (工业刚性顶栏) -->
    <view class="bg-[#1e293b] border-b border-slate-700/80 pt-3 pb-3.5 px-4">
      <view class="bg-slate-900 rounded-lg p-3 flex items-center justify-between border border-slate-700">
        <view class="flex items-center gap-2">
          <text class="i-carbon-delivery-truck text-amber-400 text-lg" />
          <view>
            <view class="text-[20rpx] text-slate-400">
              维保适配车型
            </view>
            <view class="text-xs font-bold text-slate-100 font-mono">
              {{ selectedModel.name }}
            </view>
          </view>
        </view>
        <view class="text-[20rpx] bg-slate-800 border border-slate-700 text-emerald-400 px-2 py-0.5 rounded-sm font-bold">
          原厂专业养护
        </view>
      </view>
    </view>

    <!-- 2. 维保套餐多选项列表 -->
    <view class="mx-4 mt-3 space-y-3">
      <view class="flex items-center justify-between text-xs font-bold text-slate-200 px-1">
        <text>精选原厂维保升级包 (可多选组合)</text>
        <text class="text-[20rpx] text-sky-400">已选金额联动计算</text>
      </view>

      <view
        v-for="pkg in maintenancePackages"
        :key="pkg.id"
        class="bg-[#1e293b] rounded-lg p-4 border transition-colors cursor-pointer flex items-start gap-3"
        :class="pkg.selected ? 'border-[#0284c7] bg-sky-950/30' : 'border-slate-700/80'"
        @click="toggleItem(pkg.id)"
      >
        <!-- 复选框图标 -->
        <view class="mt-0.5">
          <view
            class="w-5 h-5 rounded-sm flex items-center justify-center text-xs transition-colors"
            :class="pkg.selected ? 'bg-[#0284c7] text-white' : 'border border-slate-600 bg-slate-900'"
          >
            <text v-if="pkg.selected" class="i-carbon-checkmark" />
          </view>
        </view>

        <!-- 套餐详情 -->
        <view class="flex-1 overflow-hidden">
          <view class="flex items-center justify-between">
            <text class="text-xs font-bold text-slate-100">{{ pkg.name }}</text>
            <text class="text-sm font-black text-rose-400 font-mono">¥{{ pkg.price }}</text>
          </view>
          <view class="text-[20rpx] text-slate-400 mt-1 leading-relaxed">
            {{ pkg.desc }}
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 预约进站服务站卡片 -->
    <view class="mx-4 mt-4 bg-[#1e293b] rounded-lg p-4 border border-slate-700/80">
      <view class="text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
        <view class="flex items-center gap-1.5">
          <text class="i-carbon-store text-emerald-400" />
          <text>指定进站维保服务站</text>
        </view>
        <text class="text-[20rpx] text-sky-400 font-bold">切换网点</text>
      </view>
      <view class="text-xs font-bold text-slate-100">
        {{ selectedStation.name }}
      </view>
      <view class="text-[20rpx] text-slate-400 mt-0.5 font-mono">
        {{ selectedStation.address }} · 距您 {{ selectedStation.distanceKm }}km
      </view>
    </view>

    <!-- 4. 底部固定结算条 (深碳工业底栏) -->
    <view class="fixed bottom-0 left-0 right-0 p-3 bg-[#1e293b]/95 border-t border-slate-700 flex items-center justify-between z-30">
      <view class="pl-3">
        <text class="text-xs text-slate-400">已选套餐总计：</text>
        <text class="text-xl font-black text-rose-400 font-mono">¥{{ selectedPackagesTotal }}</text>
      </view>

      <button
        class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs px-6 min-h-[80rpx] rounded-lg font-bold border-none flex items-center justify-center transition-colors m-0"
        @click="handleConfirmBooking"
      >
        确认套餐并预约进站
      </button>
    </view>
  </view>
</template>
