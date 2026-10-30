<script lang="ts" setup>
import type { FuelType, VehicleModelItem } from '@/types/mall'
import { useMallSessionStore } from '@/store/mallSession'
import { useTokenStore } from '@/store/token'
import { useUserSessionStore } from '@/store/userSession'
import { toLoginPage } from '@/utils/toLoginPage'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

defineOptions({
  name: 'VehicleQueryPage',
})

definePage({
  style: {
    navigationBarTitleText: '车型精准查询',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserSessionStore()
const mallStore = useMallSessionStore()
const { brands, vehicleModels, selectedModel } = storeToRefs(mallStore)

// 缓存自愈检测：若真机本地残留了旧版少量车型或历史失效图片，进入页面即刻自动重置为最新真实图片矩阵
function ensureVehicleModelsReady() {
  const hasBroken = mallStore.vehicleModels.some(m => !m.image || m.image.includes('photo-1586191582056'))
  if (mallStore.vehicleModels.length < 20 || hasBroken) {
    mallStore.forceRefreshVehicleModels()
  }
}

function handleImageError(model: VehicleModelItem) {
  model.image = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80'
}

onMounted(() => {
  ensureVehicleModelsReady()
})

onShow(() => {
  ensureVehicleModelsReady()
})

const hasLogin = computed(() => tokenStore.updateNowTime().hasLogin)

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
  if (hasLogin.value) {
    userStore.userInfo.defaultVehicleName = model.name
  }
  uni.showToast({
    title: `已选定爱车: ${model.name.slice(0, 8)}`,
    icon: 'success',
    duration: 1500,
  })
  setTimeout(() => {
    uni.navigateBack({
      fail: () => {
        uni.switchTab({ url: '/pages/index/index' })
      },
    })
  }, 300)
}

function handleSetDefaultVehicle() {
  if (!hasLogin.value) {
    toLoginPage({
      redirectUrl: '/pages-sub/mall/vehicle-query',
      noticeMessage: '请先登录以绑定爱车',
    })
    return
  }

  if (!selectedModel.value?.id) {
    uni.showToast({
      title: '请先在列表选择一款车型',
      icon: 'none',
    })
    return
  }

  userStore.userInfo.defaultVehicleName = selectedModel.value.name
  uni.showToast({
    title: '已设为常用爱车',
    icon: 'success',
  })
  setTimeout(() => {
    uni.navigateBack({
      fail: () => {
        uni.switchTab({ url: '/pages/index/index' })
      },
    })
  }, 500)
}

function confirmAndGoCatalog() {
  uni.navigateTo({
    url: '/pages-sub/mall/parts-catalog',
  })
}
</script>

<template>
  <view class="vehicle-query-page min-h-screen flex flex-col justify-between bg-[#0f172a] pb-24 text-slate-100">
    <!-- 1. 顶部动力类型筛选 Tabs (信标蓝高辨识工业条) -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] px-3 py-2.5">
      <view class="grid grid-cols-4 gap-1.5 border border-slate-800 rounded-md bg-[#090d16] p-1">
        <view
          v-for="item in fuelOptions"
          :key="item.type"
          class="flex cursor-pointer items-center justify-center rounded-sm py-2 text-center text-xs font-semibold transition-all"
          :class="activeFuel === item.type
            ? 'bg-[#0284c7] text-white font-bold border border-sky-400/40'
            : 'text-slate-400 hover:text-slate-200 border border-transparent'"
          @click="activeFuel = item.type"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <!-- 2. 主体左右分栏布局 (深碳工业机能) -->
    <view class="flex flex-1 overflow-hidden">
      <!-- 左侧品牌列表 -->
      <scroll-view scroll-y class="w-24 shrink-0 border-r border-slate-700/80 bg-[#090d16]">
        <view
          v-for="brand in brands"
          :key="brand.id"
          class="cursor-pointer border-l-4 px-2 py-3.5 text-center text-xs font-medium transition-all"
          :class="activeBrandId === brand.id
            ? 'bg-[#1e293b] border-[#0284c7] text-[#38bdf8] font-bold'
            : 'border-transparent text-slate-400 hover:text-slate-200'"
          @click="activeBrandId = brand.id"
        >
          <view class="mb-1 text-lg">
            {{ brand.logo }}
          </view>
          <view class="truncate font-sans">
            {{ brand.name }}
          </view>
        </view>
      </scroll-view>

      <!-- 右侧车型网格列表 -->
      <scroll-view scroll-y class="flex-1 bg-[#0f172a] p-3">
        <view class="mb-2.5 flex items-center justify-between text-xs text-slate-300 font-bold">
          <text class="flex items-center gap-1.5">
            <text class="h-3 w-1.5 rounded-sm bg-[#0284c7]" />
            <text>适配车型库 ({{ filteredModels.length }} 款)</text>
          </text>
          <text class="text-[20rpx] text-sky-400 font-mono">点击卡片选定并返回</text>
        </view>

        <view class="space-y-2.5">
          <view
            v-for="model in filteredModels"
            :key="model.id"
            class="flex cursor-pointer items-center gap-3 border rounded-lg bg-[#1e293b] p-3 transition-all"
            :class="selectedModel.id === model.id
              ? 'border-[#0284c7] bg-sky-950/20'
              : 'border-slate-700/80 hover:border-slate-600'"
            @click="selectModel(model)"
          >
            <image
              :src="model.image"
              mode="aspectFill"
              class="h-16 w-20 shrink-0 border border-slate-700/80 rounded-md bg-[#090d16]"
              @error="handleImageError(model)"
            />
            <view class="flex-1 overflow-hidden">
              <view class="truncate text-xs text-slate-100 font-bold leading-snug">
                {{ model.name }}
              </view>
              <view class="mt-2 flex items-center gap-1.5 text-[20rpx]">
                <text class="border border-slate-700 rounded-sm bg-[#090d16] px-1.5 py-0.5 text-slate-300 font-mono">
                  排量 {{ model.displacement }}
                </text>
                <text class="border border-sky-700/60 rounded-sm bg-sky-950/50 px-1.5 py-0.5 text-[#38bdf8] font-bold font-mono">
                  {{ model.horsepower }}
                </text>
              </view>
            </view>
            <view class="shrink-0">
              <view
                v-if="selectedModel.id === model.id"
                class="h-6 w-6 flex items-center justify-center border border-sky-400/50 rounded-sm bg-[#0284c7] text-xs text-white"
              >
                <text class="i-carbon-checkmark font-bold" />
              </view>
              <view
                v-else
                class="h-6 w-6 border border-slate-600 rounded-sm bg-[#090d16]"
              />
            </view>
          </view>

          <!-- 空数据状态 -->
          <view v-if="filteredModels.length === 0" class="border border-slate-700/80 rounded-lg border-dashed bg-[#1e293b]/50 p-4 py-12 text-center text-xs text-slate-400">
            <text class="i-carbon-information-square mx-auto mb-2 block text-2xl text-slate-500" />
            <text class="mb-3 block">暂无该动力类型车型，请切换其他动力类别</text>
            <button
              class="mx-auto inline-flex items-center gap-1.5 border border-sky-400/40 rounded-md bg-[#0284c7] px-3.5 py-1.5 text-xs text-white active:bg-sky-700"
              @click="mallStore.forceRefreshVehicleModels()"
            >
              <text class="i-carbon-renew" />
              重新同步车型库
            </button>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 3. 底部刚性操作栏 (手套防误触，触控热区 >= 88rpx / h-11) -->
    <view class="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-slate-700/80 bg-[#1e293b] px-4 py-3">
      <view class="max-w-[46%] flex items-center gap-2">
        <text class="i-carbon-delivery-truck shrink-0 text-2xl text-[#0284c7]" />
        <view class="overflow-hidden">
          <text class="block text-[20rpx] text-slate-400 font-mono">当前车型：</text>
          <text class="block truncate text-xs text-slate-100 font-bold">{{ selectedModel.name }}</text>
        </view>
      </view>

      <view class="flex items-center gap-2">
        <button
          class="h-11 min-h-[88rpx] flex shrink-0 items-center justify-center border border-amber-400/30 rounded-lg bg-slate-800 px-3.5 text-xs text-amber-300 font-bold active:translate-y-0.5 active:bg-slate-700"
          @click="handleSetDefaultVehicle"
        >
          <text class="i-carbon-star mr-1 text-sm text-amber-400" />
          设为常用爱车
        </button>
        <button
          class="h-11 min-h-[88rpx] flex shrink-0 items-center justify-center border border-sky-400/40 rounded-lg bg-[#0284c7] px-4 text-xs text-white font-bold active:translate-y-0.5 active:bg-[#0369a1]"
          @click="confirmAndGoCatalog"
        >
          <text class="i-carbon-shopping-catalog mr-1 text-sm" />
          选配
        </button>
      </view>
    </view>
  </view>
</template>
