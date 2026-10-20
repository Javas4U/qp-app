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
    navigationBarBackgroundColor: '#0f172a',
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
  <view class="parts-catalog-page min-h-screen bg-[#0f172a] text-slate-100 pb-20">
    <!-- 1. 顶部当前车型绑定卡片 (工业刚性顶栏) -->
    <view class="bg-[#1e293b] border-b border-slate-700/80 pt-3 pb-3.5 px-4">
      <view
        class="bg-slate-900 rounded-lg p-3 flex items-center justify-between cursor-pointer active:bg-slate-800 transition-colors border border-slate-700"
        @click="gotoVehicleQuery"
      >
        <view class="flex items-center gap-2.5 overflow-hidden">
          <text class="i-carbon-delivery-truck text-amber-400 text-lg shrink-0" />
          <view class="overflow-hidden">
            <view class="text-[20rpx] text-slate-400">
              当前适配车型图谱：
            </view>
            <view class="text-xs font-bold text-slate-100 truncate">
              {{ selectedModel.name }}
            </view>
          </view>
        </view>
        <view class="flex items-center gap-1 text-[20rpx] bg-slate-800 border border-slate-700 text-sky-400 px-2 py-1 rounded-sm shrink-0">
          <text>切换车型</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>
    </view>

    <!-- 2. 部位分类 Tab 横滑栏 -->
    <view class="sticky top-0 z-20 bg-[#1e293b] border-b border-slate-700">
      <scroll-view scroll-x class="whitespace-nowrap px-3 py-2">
        <view class="flex items-center gap-2">
          <view
            v-for="tab in categoryTabs"
            :key="tab.key"
            class="inline-block px-3.5 py-1.5 rounded-sm text-xs font-bold cursor-pointer transition-colors shrink-0 border"
            :class="activeCategory === tab.key
              ? 'bg-[#0284c7] text-white border-[#0284c7]'
              : 'bg-slate-900 border-slate-700 text-slate-400'"
            @click="activeCategory = tab.key"
          >
            {{ tab.name }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 3. 二维配件网格图谱 (深碳工业风格) -->
    <view class="p-4">
      <view class="flex items-center justify-between mb-3 text-xs">
        <view class="font-bold text-slate-200 flex items-center gap-1">
          <text class="i-carbon-grid text-[#0284c7]" />
          <text>原厂正品配件总成与易损件 (共 {{ filteredParts.length }} 项)</text>
        </view>
        <text class="text-[20rpx] text-emerald-400 font-bold">100% 正品质保</text>
      </view>

      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="part in filteredParts"
          :key="part.id"
          class="bg-[#1e293b] rounded-lg overflow-hidden border border-slate-700/80 flex flex-col justify-between cursor-pointer active:border-[#0284c7] transition-colors"
          @click="selectPart(part)"
        >
          <view class="relative">
            <image
              :src="part.image"
              mode="aspectFill"
              class="w-full h-32 bg-slate-900"
            />
            <view class="absolute top-2 left-2 bg-slate-900/90 border border-slate-700 text-sky-400 text-[18rpx] px-1.5 py-0.5 rounded-sm font-mono">
              {{ part.oeCode.slice(0, 12) }}
            </view>
          </view>

          <view class="p-3 flex-1 flex flex-col justify-between">
            <view>
              <view class="flex items-center gap-1 mb-1">
                <text class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[18rpx] px-1 py-0.2 rounded-sm font-bold">官方联保</text>
                <text class="text-[18rpx] text-slate-400">{{ part.subCategoryName }}</text>
              </view>
              <view class="text-xs font-bold text-slate-100 line-clamp-2 leading-tight">
                {{ part.name }}
              </view>
            </view>

            <view class="mt-2.5 pt-2 border-t border-slate-700/80 flex items-center justify-between">
              <view>
                <text class="text-[20rpx] text-rose-400 font-bold">¥</text>
                <text class="text-base text-rose-400 font-bold font-mono">{{ part.priceRetail }}</text>
              </view>
              <button
                class="bg-[#0284c7] active:bg-[#0369a1] text-white text-[20rpx] px-2.5 min-h-[52rpx] rounded-md font-bold m-0 border-none flex items-center justify-center transition-colors"
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
