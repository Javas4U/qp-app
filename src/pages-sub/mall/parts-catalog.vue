<script lang="ts" setup>
import type { PartCategory } from '@/types/mall'
import { useMallSessionStore } from '@/store/mallSession'
import { onLoad } from '@dcloudio/uni-app'
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
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
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
const searchKeyword = ref('')

onLoad((query) => {
  if (query && query.category) {
    const valid = categoryTabs.some(t => t.key === query.category)
    if (valid) {
      activeCategory.value = query.category as PartCategory
    }
  }
  if (query && query.keyword) {
    searchKeyword.value = decodeURIComponent(query.keyword as string)
  }
  mallStore.checkAndHealPartsProducts?.()
})

const filteredParts = computed(() => {
  let list = partsProducts.value
  if (activeCategory.value !== 'ALL') {
    list = list.filter(p => p.category === activeCategory.value)
  }
  const kw = searchKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.oeCode.toLowerCase().includes(kw) ||
      p.subCategoryName.toLowerCase().includes(kw),
    )
  }
  return list
})

function handlePartImageError(part: any) {
  part.image = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80'
}

function selectPart(part: any) {
  currentPart.value = part
  uni.navigateTo({
    url: `/pages-sub/mall/parts-detail?partId=${part.id}`,
  })
}

function gotoVehicleQuery() {
  uni.navigateTo({
    url: '/pages-sub/mall/vehicle-query',
  })
}
</script>

<template>
  <view class="parts-catalog-page min-h-screen bg-[#0f172a] pb-20 text-slate-100">
    <!-- 1. 顶部当前车型绑定卡片 (工业刚性顶栏) -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] px-4 pb-3.5 pt-3">
      <view
        class="flex cursor-pointer items-center justify-between border border-slate-700 rounded-lg bg-slate-900 p-3 transition-colors active:bg-slate-800"
        @click="gotoVehicleQuery"
      >
        <view class="flex items-center gap-2.5 overflow-hidden">
          <text class="i-carbon-delivery-truck shrink-0 text-lg text-amber-400" />
          <view class="overflow-hidden">
            <view class="text-[20rpx] text-slate-400">
              当前适配车型图谱：
            </view>
            <view class="truncate text-xs text-slate-100 font-bold">
              {{ selectedModel.name }}
            </view>
          </view>
        </view>
        <view class="flex shrink-0 items-center gap-1 border border-slate-700 rounded-sm bg-slate-800 px-2.5 py-1 text-[20rpx] text-sky-400 font-bold">
          <text>切换车型</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>
    </view>

    <!-- 2. 搜索框与当前检索态 -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] px-4 pb-3 pt-2">
      <view class="h-9 flex items-center border border-slate-700 rounded-md bg-[#090d16] px-3">
        <text class="i-carbon-search mr-2 shrink-0 text-sm text-slate-400" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索配件品名、OE码、子品类..."
          placeholder-class="text-slate-500"
          class="h-full flex-1 bg-transparent text-xs text-slate-100 font-medium outline-none"
        >
        <view
          v-if="searchKeyword"
          class="flex shrink-0 cursor-pointer items-center p-1 text-slate-400 active:text-white"
          @click="searchKeyword = ''"
        >
          <text class="i-carbon-close text-sm" />
        </view>
      </view>
    </view>

    <!-- 2. 部位分类 Tab 横滑栏 -->
    <view class="sticky top-0 z-20 border-b border-slate-700 bg-[#1e293b]">
      <scroll-view scroll-x class="whitespace-nowrap px-3 py-2.5">
        <view class="flex items-center gap-2">
          <view
            v-for="tab in categoryTabs"
            :key="tab.key"
            class="h-9 min-h-[72rpx] inline-flex shrink-0 cursor-pointer items-center justify-center border rounded-md px-4 text-xs font-bold transition-colors"
            :class="activeCategory === tab.key
              ? 'bg-[#0284c7] text-white border-sky-400 shadow-sm'
              : 'bg-slate-900 border-slate-700 text-slate-400 active:text-slate-200'"
            @click="activeCategory = tab.key"
          >
            {{ tab.name }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 3. 二维配件网格图谱 (深碳工业风格) -->
    <view class="p-4">
      <view class="mb-3 flex items-center justify-between text-xs">
        <view class="flex items-center gap-1.5 text-slate-200 font-bold">
          <text class="i-carbon-grid text-[#0284c7]" />
          <text>原厂正品配件总成与易损件 (共 {{ filteredParts.length }} 项)</text>
        </view>
        <text class="text-[20rpx] text-emerald-400 font-bold">100% 正品质保</text>
      </view>

      <!-- 搜索空状态兜底 -->
      <view v-if="filteredParts.length === 0" class="py-16 text-center text-slate-400">
        <text class="i-carbon-search mb-2 block text-3xl text-slate-500" />
        <view class="text-xs text-slate-300 font-bold">
          未检索到匹配的配件商品
        </view>
        <view class="mt-1 text-[22rpx] text-slate-500">
          关键词“{{ searchKeyword }}”暂无对应品类，建议尝试缩减关键词
        </view>
        <view class="mt-4">
          <button
            class="m-0 inline-flex items-center justify-center border border-slate-700 rounded-md bg-slate-800 px-4 py-1.5 text-xs text-sky-400 font-bold active:bg-slate-700"
            @click="searchKeyword = ''; activeCategory = 'ALL'"
          >
            清空筛选查看全量配件
          </button>
        </view>
      </view>

      <view v-else class="grid grid-cols-2 gap-3">
        <view
          v-for="part in filteredParts"
          :key="part.id"
          class="flex flex-col cursor-pointer justify-between overflow-hidden border border-slate-700/80 rounded-lg bg-[#1e293b] transition-colors active:border-sky-400"
          @click="selectPart(part)"
        >
          <view class="relative">
            <image
              :src="part.image"
              mode="aspectFill"
              class="h-32 w-full bg-slate-900"
              @error="handlePartImageError(part)"
            />
            <view class="absolute left-2 top-2 border border-slate-700 rounded-sm bg-slate-900/90 px-1.5 py-0.5 text-[18rpx] text-sky-400 font-mono">
              {{ part.oeCode.slice(0, 12) }}
            </view>
          </view>

          <view class="flex flex-1 flex-col justify-between p-3">
            <view>
              <view class="mb-1 flex items-center gap-1">
                <text class="border border-emerald-500/40 rounded-sm bg-emerald-500/20 px-1 py-0.2 text-[18rpx] text-emerald-400 font-bold">官方联保</text>
                <text class="text-[18rpx] text-slate-400">{{ part.subCategoryName }}</text>
              </view>
              <view class="line-clamp-2 text-xs text-slate-100 font-bold leading-tight">
                {{ part.name }}
              </view>
            </view>

            <view class="mt-2.5 flex items-center justify-between border-t border-slate-700/80 pt-2">
              <view>
                <text class="text-[20rpx] text-rose-400 font-bold">¥</text>
                <text class="text-base text-rose-400 font-bold font-mono">{{ part.priceRetail }}</text>
              </view>
              <button
                class="m-0 h-8 min-h-[64rpx] flex items-center justify-center rounded-md border-none bg-[#0284c7] px-3 text-xs text-white font-bold transition-colors active:bg-[#0369a1]"
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
