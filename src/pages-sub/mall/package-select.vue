<script lang="ts" setup>
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'PackageSelectPage',
})

definePage({
  style: {
    navigationBarTitleText: '维保套餐定制选配',
    navigationBarBackgroundColor: '#1677ff',
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
  <view class="package-select-page min-h-screen bg-[#f5f7fa] pb-24">
    <!-- 1. 顶部适配车型卡片 (对标 天龙配件选购 (4) 顶部) -->
    <view class="bg-[#1677ff] text-white pt-2 pb-5 px-4 rounded-b-3xl">
      <view class="bg-white/15 backdrop-blur rounded-2xl p-3 flex items-center justify-between border border-white/10">
        <view class="flex items-center gap-2">
          <text class="i-carbon-delivery-truck text-amber-400 text-lg" />
          <view>
            <view class="text-[20rpx] text-white/80">
              维保适配车型
            </view>
            <view class="text-xs font-bold">
              {{ selectedModel.name }}
            </view>
          </view>
        </view>
        <view class="text-[20rpx] bg-white/20 px-2 py-0.5 rounded-full font-bold">
          原厂专业养护
        </view>
      </view>
    </view>

    <!-- 2. 维保套餐多选项列表 (对标 天龙配件选购 (4)) -->
    <view class="mx-4 -mt-3 space-y-3">
      <view class="flex items-center justify-between text-xs font-bold text-gray-800 px-1">
        <text>精选原厂维保升级包 (可多选组合)</text>
        <text class="text-[20rpx] text-[#1677ff]">已选金额联动计算</text>
      </view>

      <view
        v-for="pkg in maintenancePackages"
        :key="pkg.id"
        class="bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer flex items-start gap-3"
        :class="pkg.selected ? 'border-[#1677ff] ring-2 ring-blue-100 bg-blue-50/20' : 'border-gray-100'"
        @click="toggleItem(pkg.id)"
      >
        <!-- 复选框图标 -->
        <view class="mt-0.5">
          <view
            class="w-5 h-5 rounded-md flex items-center justify-center text-xs"
            :class="pkg.selected ? 'bg-[#1677ff] text-white' : 'border border-gray-300 bg-white'"
          >
            <text v-if="pkg.selected" class="i-carbon-checkmark" />
          </view>
        </view>

        <!-- 套餐详情 -->
        <view class="flex-1 overflow-hidden">
          <view class="flex items-center justify-between">
            <text class="text-xs font-bold text-gray-900">{{ pkg.name }}</text>
            <text class="text-sm font-black text-red-600 font-mono">¥{{ pkg.price }}</text>
          </view>
          <view class="text-[20rpx] text-gray-500 mt-1 leading-relaxed">
            {{ pkg.desc }}
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 预约进站服务站卡片 -->
    <view class="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <view class="text-xs font-bold text-gray-800 mb-2 flex items-center justify-between">
        <view class="flex items-center gap-1.5">
          <text class="i-carbon-store text-[#00b578]" />
          <text>指定进站维保服务站</text>
        </view>
        <text class="text-[20rpx] text-[#1677ff]">切换网点</text>
      </view>
      <view class="text-xs font-bold text-gray-900">
        {{ selectedStation.name }}
      </view>
      <view class="text-[20rpx] text-gray-500 mt-0.5">
        {{ selectedStation.address }} · 距您 {{ selectedStation.distanceKm }}km
      </view>
    </view>

    <!-- 4. 底部固定结算条 -->
    <view class="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-gray-100 shadow-lg flex items-center justify-between">
      <view class="pl-3">
        <text class="text-xs text-gray-500">已选套餐总计：</text>
        <text class="text-xl font-black text-red-600 font-mono">¥{{ selectedPackagesTotal }}</text>
      </view>

      <button
        class="bg-[#1677ff] text-white text-xs px-6 py-2.5 rounded-xl font-bold shadow-md active:opacity-90 m-0"
        @click="handleConfirmBooking"
      >
        确认套餐并预约进站
      </button>
    </view>
  </view>
</template>
