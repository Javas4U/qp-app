<script lang="ts" setup>
import type { FuelType, VehicleModelItem } from '@/types/mall'
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'VehicleQueryPage',
})

definePage({
  style: {
    navigationBarTitleText: '车型精准查询',
    navigationBarBackgroundColor: '#f8fafc',
    navigationBarTextStyle: 'black',
  },
})

const mallStore = useMallSessionStore()
const { brands, vehicleModels, selectedModel } = storeToRefs(mallStore)

// 动力类型过滤
const fuelOptions: { type: FuelType, label: string }[] = [
  { type: 'FUEL', label: '燃油重卡' },
  { type: 'GAS', label: '天然气LNG' },
  { type: 'EV', label: '纯电动' },
  { type: 'HYDROGEN', label: '氢能混动' },
]

const activeFuel = ref<FuelType>('FUEL')
const activeBrandId = ref<string>('DFCV')

// 过滤右侧车型
const filteredModels = computed(() => {
  return vehicleModels.value.filter(
    m => m.brandId === activeBrandId.value && m.fuelType === activeFuel.value,
  )
})

function selectModel(model: VehicleModelItem) {
  mallStore.selectVehicleModel(model)
  uni.showToast({
    title: `已锁定: ${model.name.slice(0, 12)}`,
    icon: 'none',
  })
}

function confirmAndGoCatalog() {
  uni.navigateTo({
    url: '/pages-sub/mall/parts-catalog',
  })
}
</script>

<template>
  <view class="vehicle-query-page min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between pb-24">
    <!-- 1. 顶部动力类型筛选 Tabs (信标蓝高辨识工业条) -->
    <view class="bg-white border-b border-slate-200 px-3 py-2.5 shadow-sm">
      <view class="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-md">
        <view
          v-for="item in fuelOptions"
          :key="item.type"
          class="text-center py-2 rounded-sm text-xs font-semibold cursor-pointer transition-all flex items-center justify-center"
          :class="activeFuel === item.type
            ? 'bg-[#0284c7] text-white font-bold shadow-xs'
            : 'text-slate-600 hover:text-slate-900 border border-transparent'"
          @click="activeFuel = item.type"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <!-- 2. 主体左右分栏布局 (亮色工业机能) -->
    <view class="flex-1 flex overflow-hidden">
      <!-- 左侧品牌列表 -->
      <scroll-view scroll-y class="w-24 bg-slate-50 border-r border-slate-200 shrink-0">
        <view
          v-for="brand in brands"
          :key="brand.id"
          class="py-3.5 px-2 text-center text-xs font-medium cursor-pointer border-l-4 transition-all"
          :class="activeBrandId === brand.id
            ? 'bg-white border-[#0284c7] text-[#0284c7] font-bold shadow-xs'
            : 'border-transparent text-slate-600 hover:text-slate-900'"
          @click="activeBrandId = brand.id"
        >
          <view class="text-lg mb-1">
            {{ brand.logo }}
          </view>
          <view class="truncate font-sans">
            {{ brand.name }}
          </view>
        </view>
      </scroll-view>

      <!-- 右侧车型网格列表 -->
      <scroll-view scroll-y class="flex-1 p-3 bg-[#f8fafc]">
        <view class="text-xs font-bold text-slate-900 mb-2.5 flex items-center justify-between">
          <text class="flex items-center gap-1.5">
            <text class="w-1.5 h-3 bg-[#0284c7] rounded-sm" />
            <text>适配车型库 ({{ filteredModels.length }} 款)</text>
          </text>
          <text class="text-[20rpx] text-slate-500 font-mono">点击卡片锁定</text>
        </view>

        <view class="space-y-2.5">
          <view
            v-for="model in filteredModels"
            :key="model.id"
            class="bg-white rounded-lg p-3 border flex items-center gap-3 cursor-pointer transition-all shadow-xs"
            :class="selectedModel.id === model.id
              ? 'border-[#0284c7] bg-sky-50/50'
              : 'border-slate-200/90 hover:border-slate-300'"
            @click="selectModel(model)"
          >
            <image
              :src="model.image"
              mode="aspectFill"
              class="w-20 h-16 rounded-md bg-slate-100 border border-slate-200 shrink-0"
            />
            <view class="flex-1 overflow-hidden">
              <view class="text-xs font-bold text-slate-900 leading-snug truncate">
                {{ model.name }}
              </view>
              <view class="flex items-center gap-1.5 mt-2 text-[20rpx]">
                <text class="bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm font-mono">
                  排量 {{ model.displacement }}
                </text>
                <text class="bg-sky-50 border border-sky-200 text-[#0284c7] px-1.5 py-0.5 rounded-sm font-mono font-bold">
                  {{ model.horsepower }}
                </text>
              </view>
            </view>
            <view class="shrink-0">
              <view
                v-if="selectedModel.id === model.id"
                class="w-6 h-6 rounded-sm bg-[#0284c7] text-white flex items-center justify-center text-xs"
              >
                <text class="i-carbon-checkmark font-bold" />
              </view>
              <view
                v-else
                class="w-6 h-6 rounded-sm border border-slate-300 bg-slate-50"
              />
            </view>
          </view>

          <!-- 空数据状态 -->
          <view v-if="filteredModels.length === 0" class="py-14 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-lg p-4 bg-white">
            <text class="i-carbon-information-square text-2xl text-slate-400 block mx-auto mb-2" />
            <text>暂无该动力类型车型，请切换其他动力类别</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 3. 底部刚性操作栏 (手套防误触) -->
    <view class="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white/95 border-t border-slate-200 flex items-center justify-between z-30 shadow-md">
      <view class="flex items-center gap-2 max-w-[62%]">
        <text class="i-carbon-delivery-truck text-2xl text-[#0284c7] shrink-0" />
        <view class="overflow-hidden">
          <text class="text-[20rpx] text-slate-500 block font-mono">当前锁定车型：</text>
          <text class="text-xs font-bold text-slate-900 truncate block">{{ selectedModel.name }}</text>
        </view>
      </view>

      <button
        class="min-h-[88rpx] h-[88rpx] bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs px-5 rounded-lg font-bold border-none active:translate-y-0.5 flex items-center justify-center m-0 shrink-0 shadow-sm"
        @click="confirmAndGoCatalog"
      >
        <text class="i-carbon-shopping-catalog mr-1 text-sm" />
        确认锁定并选配
      </button>
    </view>
  </view>
</template>
