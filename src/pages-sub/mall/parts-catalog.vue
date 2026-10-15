<script lang="ts" setup>
import type { PartCategory } from '@/types/mall'
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'PartsCatalogPage',
})

definePage({
  style: {
    navigationBarTitleText: '天龙原厂配件图谱',
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTextStyle: 'white',
  },
})

const mallStore = useMallSessionStore()
const { selectedModel, partsProducts, currentPart } = storeToRefs(mallStore)

// 部位分类
const categoryTabs: { key: PartCategory | 'ALL', name: string }[] = [
  { key: 'ALL', name: '全部图谱' },
  { key: 'ENGINE', name: '发动机系统' },
  { key: 'CABIN', name: '驾驶室部件' },
  { key: 'BODY', name: '底盘与后桥' },
  { key: 'ELEC', name: '全车电器' },
]

const activeCategory = ref<PartCategory | 'ALL'>('ALL')

const filteredParts = computed(() => {
  if (activeCategory.value === 'ALL') {
    return partsProducts.value
  }
  return partsProducts.value.filter(p => p.category === activeCategory.value)
})

function selectPart(part: any) {
  currentPart.value = part
  uni.navigateTo({
    url: '/pages-sub/mall/parts-detail',
  })
}

function gotoVehicleQuery() {
  uni.navigateTo({
    url: '/pages-sub/mall/vehicle-query',
  })
}
</script>

<template>
  <view class="parts-catalog-page min-h-screen bg-[#f5f7fa] pb-20">
    <!-- 1. 顶部当前车型绑定卡片 (对标 天龙配件选购 (1) 顶部) -->
    <view class="bg-[#1677ff] text-white pt-2 pb-5 px-4 rounded-b-3xl">
      <view
        class="bg-white/15 backdrop-blur rounded-2xl p-3 flex items-center justify-between cursor-pointer active:opacity-85 border border-white/10"
        @click="gotoVehicleQuery"
      >
        <view class="flex items-center gap-2.5 overflow-hidden">
          <text class="i-carbon-delivery-truck text-amber-400 text-lg shrink-0" />
          <view class="overflow-hidden">
            <view class="text-[20rpx] text-white/80">
              当前适配车型图谱：
            </view>
            <view class="text-xs font-bold truncate">
              {{ selectedModel.name }}
            </view>
          </view>
        </view>
        <view class="flex items-center gap-1 text-[20rpx] bg-white/20 px-2 py-1 rounded-full shrink-0">
          <text>切换车型</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>
    </view>

    <!-- 2. 部位分类 Tab 横滑栏 -->
    <view class="sticky top-0 z-20 bg-white shadow-xs">
      <scroll-view scroll-x class="whitespace-nowrap px-3 py-2 border-b border-gray-100">
        <view class="flex items-center gap-2">
          <view
            v-for="tab in categoryTabs"
            :key="tab.key"
            class="inline-block px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all shrink-0"
            :class="activeCategory === tab.key
              ? 'bg-[#1677ff] text-white font-bold shadow-xs'
              : 'bg-gray-100 text-gray-600'"
            @click="activeCategory = tab.key"
          >
            {{ tab.name }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 3. 二维配件网格图谱 (对标 天龙配件选购页 (1) 图谱网格) -->
    <view class="p-4">
      <view class="flex items-center justify-between mb-3 text-xs">
        <view class="font-bold text-gray-800 flex items-center gap-1">
          <text class="i-carbon-grid text-[#1677ff]" />
          <text>原厂正品配件总成与易损件 (共 {{ filteredParts.length }} 项)</text>
        </view>
        <text class="text-[20rpx] text-emerald-600 font-medium">100% 正品质保</text>
      </view>

      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="part in filteredParts"
          :key="part.id"
          class="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-98 transition-all"
          @click="selectPart(part)"
        >
          <view class="relative">
            <image
              :src="part.image"
              mode="aspectFill"
              class="w-full h-32 bg-gray-100"
            />
            <view class="absolute top-2 left-2 bg-black/60 text-white text-[18rpx] px-1.5 py-0.2 rounded font-mono backdrop-blur">
              {{ part.oeCode.slice(0, 12) }}
            </view>
          </view>

          <view class="p-3 flex-1 flex flex-col justify-between">
            <view>
              <view class="flex items-center gap-1 mb-1">
                <text class="bg-emerald-50 text-[#00b578] text-[18rpx] px-1 py-0.2 rounded font-bold">官方联保</text>
                <text class="text-[18rpx] text-gray-400">{{ part.subCategoryName }}</text>
              </view>
              <view class="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                {{ part.name }}
              </view>
            </view>

            <view class="mt-2.5 pt-2 border-t border-gray-50 flex items-center justify-between">
              <view>
                <text class="text-[20rpx] text-red-600 font-bold">¥</text>
                <text class="text-base text-red-600 font-bold">{{ part.priceRetail }}</text>
              </view>
              <button
                class="bg-[#1677ff] text-white text-[20rpx] px-2 py-1 rounded-lg font-bold m-0"
              >
                选购
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
