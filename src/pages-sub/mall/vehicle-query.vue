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
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTextStyle: 'white',
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
    title: `已选择: ${model.name.slice(0, 12)}`,
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
  <view class="vehicle-query-page min-h-screen bg-[#f5f7fa] flex flex-col justify-between pb-20">
    <!-- 1. 顶部动力类型筛选 Tabs (对标 7d9ea...jpg 顶部) -->
    <view class="bg-[#1677ff] text-white pt-2 pb-3 px-3">
      <view class="flex items-center justify-around bg-black/15 p-1 rounded-xl">
        <view
          v-for="item in fuelOptions"
          :key="item.type"
          class="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          :class="activeFuel === item.type ? 'bg-white text-[#1677ff] shadow-sm' : 'text-white/80'"
          @click="activeFuel = item.type"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <!-- 2. 主体左右分栏布局 (对标 7d9ea...jpg) -->
    <view class="flex-1 flex overflow-hidden">
      <!-- 左侧品牌列表 -->
      <scroll-view scroll-y class="w-24 bg-gray-100 shrink-0">
        <view
          v-for="brand in brands"
          :key="brand.id"
          class="py-3.5 px-2 text-center text-xs font-medium cursor-pointer border-l-4 transition-all"
          :class="activeBrandId === brand.id
            ? 'bg-white border-[#1677ff] text-[#1677ff] font-bold'
            : 'border-transparent text-gray-600'"
          @click="activeBrandId = brand.id"
        >
          <view class="text-base mb-1">
            {{ brand.logo }}
          </view>
          <view class="truncate">
            {{ brand.name }}
          </view>
        </view>
      </scroll-view>

      <!-- 右侧车型网格列表 -->
      <scroll-view scroll-y class="flex-1 p-3">
        <view class="text-xs font-bold text-gray-700 mb-2.5 flex items-center justify-between">
          <text>适配车型列表 (共 {{ filteredModels.length }} 款)</text>
          <text class="text-[20rpx] text-gray-400">点击卡片切换</text>
        </view>

        <view class="space-y-3">
          <view
            v-for="model in filteredModels"
            :key="model.id"
            class="bg-white rounded-2xl p-3 border shadow-xs flex items-center gap-3 cursor-pointer transition-all"
            :class="selectedModel.id === model.id ? 'border-[#1677ff] ring-2 ring-blue-100 bg-blue-50/20' : 'border-gray-100'"
            @click="selectModel(model)"
          >
            <image
              :src="model.image"
              mode="aspectFill"
              class="w-20 h-16 rounded-xl bg-gray-100 shrink-0"
            />
            <view class="flex-1 overflow-hidden">
              <view class="text-xs font-bold text-gray-900 leading-snug">
                {{ model.name }}
              </view>
              <view class="flex items-center gap-1.5 mt-1.5 text-[20rpx] text-gray-500">
                <text class="bg-gray-100 px-1.5 py-0.2 rounded font-mono">排量 {{ model.displacement }}</text>
                <text class="bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-mono font-bold">{{ model.horsepower }}</text>
              </view>
            </view>
            <view class="shrink-0">
              <view
                v-if="selectedModel.id === model.id"
                class="w-6 h-6 rounded-full bg-[#1677ff] text-white flex items-center justify-center text-xs"
              >
                <text class="i-carbon-checkmark" />
              </view>
              <view
                v-else
                class="w-6 h-6 rounded-full border border-gray-300"
              />
            </view>
          </view>

          <!-- 备用提示 -->
          <view v-if="filteredModels.length === 0" class="py-12 text-center text-xs text-gray-400">
            暂无该动力类型车型，请切换其他动力 Tab
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 3. 底部悬浮当前已选车型与确定按钮 -->
    <view class="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-gray-100 flex items-center justify-between shadow-lg">
      <view class="flex items-center gap-2 max-w-[65%]">
        <text class="i-carbon-delivery-truck text-xl text-[#1677ff] shrink-0" />
        <view class="overflow-hidden">
          <text class="text-[20rpx] text-gray-400 block">当前已锁定车型：</text>
          <text class="text-xs font-bold text-gray-900 truncate block">{{ selectedModel.name }}</text>
        </view>
      </view>

      <button
        class="bg-[#1677ff] text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow-md active:opacity-90 m-0 shrink-0"
        @click="confirmAndGoCatalog"
      >
        确定并去选配件
      </button>
    </view>
  </view>
</template>
