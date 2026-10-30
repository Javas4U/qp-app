<script lang="ts" setup>
import type { DemoMaintenanceOrderItem } from '@/types/demo'
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineOptions({
  name: 'PackageSelectPage',
})

definePage({
  style: {
    navigationBarTitleText: '维保套餐定制选配',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

const mallStore = useMallSessionStore()
const {
  selectedModel,
  maintenancePackages,
  selectedPackagesTotal,
  selectedStation,
  stations,
} = storeToRefs(mallStore)

const appointmentDate = ref('2026-10-18')
const appointmentTime = ref('14:00')

function toggleItem(id: string) {
  mallStore.toggleMaintenancePackage(id)
}

function selectStation(st: any) {
  selectedStation.value = st
}

function handleConfirmBooking() {
  const selectedItems = maintenancePackages.value.filter(p => p.selected)
  if (!selectedItems.length) {
    uni.showToast({ title: '请至少选择一项维保项目', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认预约维保套餐',
    content: `合计费用：¥${selectedPackagesTotal.value} 元\n预约网点：${selectedStation.value.name}\n预约时间：${appointmentDate.value} ${appointmentTime.value}`,
    confirmColor: '#0284c7',
    confirmText: '立即预约',
    success: (res) => {
      if (res.confirm) {
        const orderNo = `YY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`
        const verifyCode = `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`
        const combinedName = selectedItems.map(p => p.name).join(' + ')

        const newBooking: DemoMaintenanceOrderItem = {
          orderNo,
          packageName: `${selectedModel.value.name.slice(0, 6)} ${combinedName}`,
          stationName: selectedStation.value.name,
          serviceTime: `${appointmentDate.value} ${appointmentTime.value}`,
          address: selectedStation.value.address,
          phone: selectedStation.value.phone,
          verifyCode,
          status: 'PENDING_SERVICE',
          statusText: '预约成功 · 待进站',
          isOngoing: true,
        }

        mallStore.addMaintenanceOrder(newBooking)
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
  <view class="package-select-page min-h-screen bg-[#0f172a] pb-28 text-slate-100">
    <!-- 1. 顶部适配车型卡片 (工业刚性顶栏) -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] px-4 pb-3.5 pt-3">
      <view class="flex items-center justify-between border border-slate-700 rounded-lg bg-slate-900 p-3">
        <view class="flex items-center gap-2">
          <text class="i-carbon-delivery-truck text-lg text-amber-400" />
          <view>
            <view class="text-[20rpx] text-slate-400">
              维保适配车型
            </view>
            <view class="text-xs text-slate-100 font-bold font-mono">
              {{ selectedModel.name }}
            </view>
          </view>
        </view>
        <view class="border border-slate-700 rounded-sm bg-slate-800 px-2 py-0.5 text-[20rpx] text-emerald-400 font-bold">
          原厂专业养护
        </view>
      </view>
    </view>

    <!-- 2. 维保套餐多选项列表 -->
    <view class="mx-4 mt-3 space-y-3">
      <view class="flex items-center justify-between px-1 text-xs text-slate-200 font-bold">
        <text>精选原厂维保升级包 (可多选组合)</text>
        <text class="text-[20rpx] text-sky-400">已选金额联动计算</text>
      </view>

      <view
        v-for="pkg in maintenancePackages"
        :key="pkg.id"
        class="flex cursor-pointer items-start gap-3 border rounded-lg bg-[#1e293b] p-4 transition-colors"
        :class="pkg.selected ? 'border-[#0284c7] bg-sky-950/30' : 'border-slate-700/80'"
        @click="toggleItem(pkg.id)"
      >
        <!-- 复选框图标 -->
        <view class="mt-0.5">
          <view
            class="h-5 w-5 flex items-center justify-center rounded-sm text-xs transition-colors"
            :class="pkg.selected ? 'bg-[#0284c7] text-white' : 'border border-slate-600 bg-slate-900'"
          >
            <text v-if="pkg.selected" class="i-carbon-checkmark" />
          </view>
        </view>

        <!-- 套餐详情 -->
        <view class="flex-1 overflow-hidden">
          <view class="flex items-center justify-between">
            <text class="text-xs text-slate-100 font-bold">{{ pkg.name }}</text>
            <text class="text-sm text-rose-400 font-black font-mono">¥{{ pkg.price }}</text>
          </view>
          <view class="mt-1 text-[20rpx] text-slate-400 leading-relaxed">
            {{ pkg.desc }}
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 预约进站服务站卡片 -->
    <view class="mx-4 mt-4 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4">
      <view class="mb-2 flex items-center justify-between text-xs text-slate-200 font-bold">
        <view class="flex items-center gap-1.5">
          <text class="i-carbon-store text-emerald-400" />
          <text>指定进站维保服务站</text>
        </view>
        <text class="text-[20rpx] text-slate-400 font-mono">可点击切换</text>
      </view>

      <view class="space-y-2">
        <view
          v-for="st in stations"
          :key="st.id"
          class="flex cursor-pointer items-center justify-between border rounded-md p-3 transition-colors"
          :class="selectedStation.id === st.id ? 'border-sky-500 bg-[#0f172a]' : 'border-slate-700/70 bg-[#090d16]'"
          @click="selectStation(st)"
        >
          <view class="overflow-hidden">
            <view class="truncate text-xs text-slate-100 font-bold">
              {{ st.name }}
            </view>
            <view class="mt-0.5 truncate text-[20rpx] text-slate-400">
              {{ st.address }} · 距您 {{ st.distanceKm }}km
            </view>
          </view>
          <view
            class="h-5 w-5 shrink-0 flex items-center justify-center border rounded-sm"
            :class="selectedStation.id === st.id ? 'border-sky-400 bg-[#0284c7] text-white' : 'border-slate-600 bg-slate-900'"
          >
            <text v-if="selectedStation.id === st.id" class="i-carbon-checkmark text-xs font-bold" />
          </view>
        </view>
      </view>
    </view>

    <!-- 4. 底部固定结算条 (触控热区 >= 88rpx / h-11) -->
    <view class="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-slate-700/80 bg-[#1e293b] p-3">
      <view class="pl-3">
        <text class="text-xs text-slate-400">已选套餐总计：</text>
        <text class="text-xl text-rose-400 font-black font-mono">¥{{ selectedPackagesTotal }}</text>
      </view>

      <button
        class="h-11 min-h-[88rpx] flex items-center justify-center rounded-lg border-none bg-[#0284c7] px-6 text-xs text-white font-bold transition-colors active:bg-[#0369a1]"
        @click="handleConfirmBooking"
      >
        确认套餐并预约进站
      </button>
    </view>
  </view>
</template>
