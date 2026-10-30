<script lang="ts" setup>
import type { ServiceStation } from '@/types/mall'
import { useMallSessionStore } from '@/store/mallSession'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'ServiceStationsPage',
})

definePage({
  style: {
    navigationBarTitleText: '附近特约服务站',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

const mallStore = useMallSessionStore()
const { stations, selectedStation } = storeToRefs(mallStore)

const searchKeyword = ref('')
const activeSort = ref<'DISTANCE' | 'RATING'>('DISTANCE')
const only24hRescue = ref(false)

onShow(() => {
  mallStore.checkAndHealStations?.()
})

const filteredStations = computed(() => {
  let list = [...stations.value]

  // 1. 关键词过滤（服务站名称、详细地址、特色标签）
  const kw = searchKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(st =>
      st.name.toLowerCase().includes(kw)
      || st.address.toLowerCase().includes(kw)
      || st.tags?.some(tag => tag.toLowerCase().includes(kw)),
    )
  }

  // 2. 仅看 24H 救援驻点
  if (only24hRescue.value) {
    list = list.filter(st => st.has24hRescue)
  }

  // 3. 排序维度
  if (activeSort.value === 'DISTANCE') {
    list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
  }
  else if (activeSort.value === 'RATING') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  return list
})

// 一键呼叫电话
function handleCallPhone(station: ServiceStation) {
  if (!station.phone) {
    uni.showToast({ title: '该服务站暂无联系电话', icon: 'none' })
    return
  }
  uni.makePhoneCall({
    phoneNumber: station.phone,
    fail: () => {
      uni.showToast({ title: `拨打服务热线: ${station.phone}`, icon: 'none' })
    },
  })
}

// 地图坐标导航调起 (调用系统高德/腾讯地图导航)
function handleOpenLocation(station: ServiceStation) {
  if (!station.latitude || !station.longitude) {
    uni.showToast({ title: '该站点暂无精确坐标', icon: 'none' })
    return
  }
  uni.openLocation({
    latitude: station.latitude,
    longitude: station.longitude,
    name: station.name,
    address: station.address,
    scale: 15,
    fail: () => {
      uni.showToast({ title: '导航启动失败，请检查定位授权', icon: 'none' })
    },
  })
}

// 设为常用特约站 (全局状态同步)
function handleSetDefaultStation(station: ServiceStation) {
  mallStore.selectStation(station)
  uni.showToast({
    title: `已设为常用特约站`,
    icon: 'success',
  })
}

// 一键直通维保预约 (自动选中该站并跳转)
function handleGoBooking(station: ServiceStation) {
  mallStore.selectStation(station)
  uni.navigateTo({
    url: '/pages-sub/mall/package-select',
  })
}
</script>

<template>
  <view class="service-stations-page min-h-screen bg-[#0f172a] pb-24 text-slate-100">
    <!-- 1. 顶部当前常驻特约服务站卡片 (工业刚性顶栏) -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] px-4 pb-3.5 pt-3">
      <view class="border border-slate-700 rounded-lg bg-slate-900 p-3">
        <view class="mb-1.5 flex items-center justify-between">
          <view class="flex items-center gap-1.5">
            <text class="i-carbon-location-filled text-base text-amber-400" />
            <text class="text-xs text-slate-200 font-bold">当前常驻履约服务站</text>
          </view>
          <text class="border border-amber-400/40 rounded-sm bg-amber-400/15 px-2 py-0.5 text-[20rpx] text-amber-300 font-bold">
            维保与到店安装默认首选
          </text>
        </view>
        <view class="truncate text-xs text-white font-bold">
          {{ selectedStation?.name || '卡车汇孝感特约维保中心' }}
        </view>
        <view class="mt-1 flex items-center justify-between text-[20rpx] text-slate-400">
          <text class="truncate max-w-[480rpx]">{{ selectedStation?.address }}</text>
          <text class="shrink-0 text-amber-400 font-bold font-mono">距您 {{ selectedStation?.distanceKm || 3.2 }} km</text>
        </view>
      </view>
    </view>

    <!-- 2. 搜索框与排序筛选工具栏 -->
    <view class="sticky top-0 z-20 border-b border-slate-700 bg-[#1e293b] px-4 py-3">
      <!-- 搜索输入框 -->
      <view class="h-9 flex items-center border border-slate-700 rounded-md bg-[#090d16] px-3">
        <text class="i-carbon-search mr-2 shrink-0 text-sm text-slate-400" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索站点名称、干线公路、特色能力..."
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

      <!-- 排序与 24H 救援筛选 -->
      <view class="mt-2.5 flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view
            class="h-7 min-h-[56rpx] flex cursor-pointer items-center justify-center border rounded-md px-3 text-xs font-bold transition-colors"
            :class="activeSort === 'DISTANCE'
              ? 'bg-[#0284c7] text-white border-sky-400'
              : 'bg-slate-900 border-slate-700 text-slate-400 active:text-slate-200'"
            @click="activeSort = 'DISTANCE'"
          >
            <text class="i-carbon-direction-straight-right mr-1 text-xs" />
            <text>距离最近</text>
          </view>
          <view
            class="h-7 min-h-[56rpx] flex cursor-pointer items-center justify-center border rounded-md px-3 text-xs font-bold transition-colors"
            :class="activeSort === 'RATING'
              ? 'bg-[#0284c7] text-white border-sky-400'
              : 'bg-slate-900 border-slate-700 text-slate-400 active:text-slate-200'"
            @click="activeSort = 'RATING'"
          >
            <text class="i-carbon-star-filled mr-1 text-xs text-amber-400" />
            <text>好评优先</text>
          </view>
        </view>

        <view
          class="flex cursor-pointer items-center gap-1 border rounded-md px-2.5 py-1 text-xs font-bold transition-colors"
          :class="only24hRescue
            ? 'border-red-500/60 bg-red-500/20 text-red-400'
            : 'border-slate-700 bg-slate-900 text-slate-400 active:text-slate-200'"
          @click="only24hRescue = !only24hRescue"
        >
          <text class="i-carbon-warning-alt text-xs text-red-400" />
          <text>24H极速救援</text>
        </view>
      </view>
    </view>

    <!-- 3. 服务站列表卡片 -->
    <view class="p-4">
      <view class="mb-3 flex items-center justify-between text-xs">
        <view class="flex items-center gap-1.5 text-slate-200 font-bold">
          <text class="i-carbon-enterprise text-[#0284c7]" />
          <text>认证特约维保站点 (共 {{ filteredStations.length }} 家)</text>
        </view>
        <text class="text-[20rpx] text-slate-400">全国联保 · 原厂配件直供</text>
      </view>

      <!-- 搜索空状态 -->
      <view v-if="filteredStations.length === 0" class="py-16 text-center text-slate-400">
        <text class="i-carbon-location-heart mb-2 block text-3xl text-slate-500" />
        <view class="text-xs text-slate-300 font-bold">
          未检索到符合条件的服务站
        </view>
        <view class="mt-1 text-[22rpx] text-slate-500">
          关键词“{{ searchKeyword }}”暂无网点覆盖，建议尝试调整筛选
        </view>
        <view class="mt-4">
          <button
            class="m-0 inline-flex items-center justify-center border border-slate-700 rounded-md bg-slate-800 px-4 py-1.5 text-xs text-sky-400 font-bold active:bg-slate-700"
            @click="searchKeyword = ''; only24hRescue = false; activeSort = 'DISTANCE'"
          >
            重置筛选条件
          </button>
        </view>
      </view>

      <!-- 服务站网格卡片 -->
      <view v-else class="flex flex-col gap-3">
        <view
          v-for="st in filteredStations"
          :key="st.id"
          class="border border-slate-700/80 rounded-lg bg-[#1e293b] p-3.5 transition-colors"
          :class="selectedStation?.id === st.id ? 'border-sky-500/80 shadow-sm' : ''"
        >
          <!-- 站点头部：名称与认证徽章 -->
          <view class="flex items-start justify-between gap-2">
            <view class="min-w-0 flex-1">
              <view class="flex flex-wrap items-center gap-1.5">
                <text
                  v-if="st.isCertified"
                  class="border border-sky-400/40 rounded-sm bg-sky-500/20 px-1.5 py-0.2 text-[18rpx] text-sky-400 font-bold"
                >
                  官方认证
                </text>
                <text
                  v-if="st.has24hRescue"
                  class="border border-red-500/40 rounded-sm bg-red-500/20 px-1.5 py-0.2 text-[18rpx] text-red-400 font-bold"
                >
                  24H驻点救援
                </text>
                <text class="text-sm text-white font-bold leading-tight">
                  {{ st.name }}
                </text>
              </view>
              <view class="mt-1.5 flex items-center gap-2 text-[20rpx] text-slate-400">
                <view class="flex items-center text-amber-400 font-bold">
                  <text class="i-carbon-star-filled mr-0.5 text-xs" />
                  <text>{{ st.rating }} 分</text>
                </view>
                <text class="text-slate-600">|</text>
                <view class="flex items-center">
                  <text class="i-carbon-time mr-0.5 text-xs text-slate-400" />
                  <text>{{ st.businessHours || '08:00 - 22:00' }}</text>
                </view>
              </view>
            </view>

            <!-- 距离公里数与常用标签 -->
            <view class="flex shrink-0 flex-col items-end gap-1">
              <view class="text-xs text-amber-400 font-extrabold font-mono">
                {{ st.distanceKm }} km
              </view>
              <view
                v-if="selectedStation?.id === st.id"
                class="border border-emerald-500/40 rounded-sm bg-emerald-500/20 px-1.5 py-0.2 text-[18rpx] text-emerald-400 font-bold"
              >
                当前常用
              </view>
              <view
                v-else
                class="cursor-pointer border border-slate-600 rounded-sm bg-slate-800 px-1.5 py-0.2 text-[18rpx] text-slate-300 font-medium active:text-white"
                @click="handleSetDefaultStation(st)"
              >
                设为常用
              </view>
            </view>
          </view>

          <!-- 站点地址行 -->
          <view class="mt-2 flex items-start gap-1 text-[22rpx] text-slate-300">
            <text class="i-carbon-location shrink-0 text-xs text-slate-400 mt-0.5" />
            <text class="line-clamp-2 leading-relaxed">{{ st.address }}</text>
          </view>

          <!-- 业务特色标签 -->
          <view v-if="st.tags?.length" class="mt-2.5 flex flex-wrap gap-1.5 border-t border-slate-700/60 pt-2">
            <view
              v-for="tag in st.tags"
              :key="tag"
              class="border border-slate-700 rounded-sm bg-slate-900/80 px-2 py-0.5 text-[20rpx] text-slate-300"
            >
              {{ tag }}
            </view>
          </view>

          <!-- 核心操作机能区 (严格符合手套触控法则) -->
          <view class="mt-3 flex items-center gap-2 border-t border-slate-700/80 pt-2.5">
            <!-- 拨号按钮 -->
            <view
              class="h-9 min-h-[72rpx] flex flex-1 cursor-pointer items-center justify-center gap-1 border border-slate-600 rounded-md bg-slate-900 text-xs text-slate-200 font-bold active:bg-slate-800"
              @click="handleCallPhone(st)"
            >
              <text class="i-carbon-phone-filled text-xs text-sky-400" />
              <text>呼叫站点</text>
            </view>

            <!-- 导航按钮 -->
            <view
              class="h-9 min-h-[72rpx] flex flex-1 cursor-pointer items-center justify-center gap-1 border border-slate-600 rounded-md bg-slate-900 text-xs text-slate-200 font-bold active:bg-slate-800"
              @click="handleOpenLocation(st)"
            >
              <text class="i-carbon-direction-straight-right text-xs text-amber-400" />
              <text>地图导航</text>
            </view>

            <!-- 预约维保按钮 -->
            <view
              class="h-9 min-h-[72rpx] flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md bg-[#0284c7] text-xs text-white font-bold active:bg-[#0369a1]"
              @click="handleGoBooking(st)"
            >
              <text class="i-carbon-tools text-xs" />
              <text>预约维保</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

