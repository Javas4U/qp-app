<script lang="ts" setup>
import type { PartProductItem } from '@/types/mall'
import type { RescueOrderVo } from '@/types/rescue'
import { getActiveRescueOrder } from '@/api/rescue'
import { useMallSessionStore } from '@/store/mallSession'
import { useRescueSessionStore } from '@/store/rescueSession'
import { useTokenStore } from '@/store/token'
import { useUserSessionStore } from '@/store/userSession'
import { GUEST_PLACEHOLDERS } from '@/constants/guest'
import { toLoginPage } from '@/utils/toLoginPage'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'IndexPage',
})

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '卡车汇',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserSessionStore()
const mallStore = useMallSessionStore()
const rescueStore = useRescueSessionStore()

const { userInfo } = storeToRefs(userStore)
const { selectedModel, partsProducts } = storeToRefs(mallStore)
const { currentTicket } = storeToRefs(rescueStore)

const hasLogin = computed(() => tokenStore.updateNowTime().hasLogin)

// 顶栏车型与会员等级响应式占位呈现
const displayedVehicleName = computed(() => {
  if (hasLogin.value && selectedModel.value?.id) {
    return selectedModel.value.name
  }
  return GUEST_PLACEHOLDERS.vehiclePickerName
})

const displayedMemberLevel = computed(() => {
  if (hasLogin.value) {
    return userInfo.value.memberLevel || 'VIP会员'
  }
  return GUEST_PLACEHOLDERS.memberLevel
})

function handleHeaderVehicleClick() {
  if (!hasLogin.value) {
    toLoginPage({
      redirectUrl: '/pages-sub/mall/vehicle-query',
      noticeMessage: '请先登录以查看或绑定爱车',
    })
    return
  }
  navigateTo('/pages-sub/mall/vehicle-query')
}

function handleHeaderMemberClick() {
  if (!hasLogin.value) {
    toLoginPage({
      redirectUrl: '/pages/me/me',
      noticeMessage: '请先登录以查看会员权益',
    })
    return
  }
  navigateTo('/pages/me/me', true)
}

const searchKeyword = ref('')
const activeRescueOrder = ref<RescueOrderVo | null>(null)

onShow(() => {
  checkActiveRescueOrder()
  mallStore.checkAndHealPartsProducts?.()
})

async function checkActiveRescueOrder() {
  if (!tokenStore.updateNowTime().hasLogin) {
    activeRescueOrder.value = null
    return
  }
  try {
    const res = await getActiveRescueOrder()
    if (res && res.orderNo) {
      activeRescueOrder.value = res
      rescueStore.setActiveOrderDetail(res)
      uni.setStorageSync('current_rescue_order_no', res.orderNo)
    }
    else {
      activeRescueOrder.value = null
    }
  }
  catch {
    activeRescueOrder.value = null
  }
}

function handleGoTracking(order: RescueOrderVo) {
  if (!order || !order.orderNo)
    return
  rescueStore.setActiveOrderDetail(order)
  uni.setStorageSync('current_rescue_order_no', order.orderNo)
  uni.navigateTo({
    url: `/pages-sub/rescue/tracking?orderNo=${order.orderNo}`,
  })
}

// 轮播图配置
const bannerList = ref([
  {
    id: 1,
    title: '24小时道路极速救援',
    subtitle: '全国覆盖 · 平均18分钟极速响应',
    badge: '紧急通道',
    bgClass: 'from-[#0284c7] to-[#0369a1]',
    link: '/pages/rescue/index',
  },
  {
    id: 2,
    title: '东风天龙 原厂正品配件节',
    subtitle: '官方直供 · 100%正品联保 · 到店包安装',
    badge: '限时特惠',
    bgClass: 'from-[#059669] to-[#047857]',
    link: '/pages-sub/mall/parts-catalog',
  },
  {
    id: 3,
    title: '重卡智能故障诊断专家',
    subtitle: 'AI智能分析 + 原厂工程师在线排查',
    badge: '免费诊断',
    bgClass: 'from-[#d97706] to-[#b45309]',
    link: '/pages/diagnosis/index',
  },
])

// 8宫格金刚区
const gridNavList = [
  { name: '道路救援', icon: 'i-carbon-warning-alt', color: '#ef4444', url: '/pages/rescue/index', isTab: true },
  { name: '配件选购', icon: 'i-carbon-box', color: '#0284c7', url: '/pages-sub/mall/parts-catalog' },
  { name: '智能诊断', icon: 'i-carbon-analytics', color: '#8b5cf6', url: '/pages/diagnosis/index', isTab: true },
  { name: '车型查询', icon: 'i-carbon-delivery-truck', color: '#0891b2', url: '/pages-sub/mall/vehicle-query' },
  { name: '维保套餐', icon: 'i-carbon-tools', color: '#10b981', url: '/pages-sub/mall/package-select' },
  { name: '附近服务站', icon: 'i-carbon-location', color: '#f59e0b', url: '/pages-sub/mall/service-stations' },
  { name: '综合订单', icon: 'i-carbon-document', color: '#3b82f6', url: '/pages/order/index', isTab: true },
  { name: '个人中心', icon: 'i-carbon-user', color: '#10b981', url: '/pages/me/me', isTab: true },
]

function navigateTo(url: string, isTab = false) {
  if (isTab) {
    uni.switchTab({ url })
  }
  else {
    uni.navigateTo({ url })
  }
}

function handleSearch() {
  const kw = searchKeyword.value.trim()
  if (kw) {
    uni.navigateTo({
      url: `/pages-sub/mall/parts-catalog?keyword=${encodeURIComponent(kw)}`,
    })
  }
  else {
    uni.navigateTo({
      url: '/pages-sub/mall/parts-catalog',
    })
  }
}

function selectPart(part: PartProductItem) {
  mallStore.currentPart = part
  uni.navigateTo({
    url: `/pages-sub/mall/parts-detail?partId=${part.id}`,
  })
}

function handlePartImageError(part: PartProductItem) {
  part.image = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80'
}

function callHotline() {
  uni.makePhoneCall({
    phoneNumber: '400-888-9999',
    fail: () => {
      uni.showToast({ title: '拨打客服: 400-888-9999', icon: 'none' })
    },
  })
}

// 状态栏与微信胶囊安全区适配
const statusBarHeight = ref(44)
const navBarHeight = ref(44)
const menuButtonPaddingRight = ref(0)

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 44

  // #ifdef MP-WEIXIN
  try {
    const menu = uni.getMenuButtonBoundingClientRect()
    if (menu && menu.top && menu.height) {
      navBarHeight.value = (menu.top - statusBarHeight.value) * 2 + menu.height
      menuButtonPaddingRight.value = sys.windowWidth - menu.left + 8
    }
  }
  catch (e) {
    navBarHeight.value = 44
  }
  // #endif
})
</script>

<template>
  <view class="home-container min-h-screen bg-[#0f172a] pb-24 text-slate-100">
    <!-- 1. 顶部自定义 Header：状态栏安全区 + 车型绑定与会员 + 通栏搜索框 -->
    <view class="custom-header border-b border-slate-700/80 bg-[#1e293b] px-4 pb-3.5 text-white">
      <!-- 状态栏/灵动岛占位：避开时间、电池栏与灵动岛 -->
      <view :style="{ height: `${statusBarHeight}px` }" />

      <!-- 自定义导航栏行：与微信小程序右上角胶囊垂直对齐，右侧 padding 避让胶囊按钮 -->
      <view
        class="flex items-center justify-between"
        :style="{
          height: `${navBarHeight}px`,
          paddingRight: `${menuButtonPaddingRight}px`,
        }"
      >
        <!-- 车型切换器：规整中圆角与防眩光深色机能底框 -->
        <view
          class="flex shrink-0 cursor-pointer items-center gap-1.5 border border-slate-600/80 rounded-md bg-slate-900/80 px-3 py-1.5 active:opacity-80"
          @click="handleHeaderVehicleClick"
        >
          <text class="i-carbon-delivery-truck text-sm text-amber-400" />
          <text class="max-w-[240rpx] truncate text-xs text-slate-100 font-bold">
            {{ displayedVehicleName }}
          </text>
          <text class="i-carbon-chevron-down text-xs text-slate-400" />
        </view>

        <!-- 会员等级标识：琥珀金小圆角机能标签 -->
        <view
          class="flex shrink-0 items-center gap-1 border border-amber-400/40 rounded-sm bg-amber-400/15 px-2.5 py-1 text-xs text-amber-300 font-bold active:opacity-80"
          @click="handleHeaderMemberClick"
        >
          <text class="i-carbon-star-filled text-xs text-amber-400" />
          <text>{{ displayedMemberLevel }}</text>
        </view>
      </view>

      <!-- 通栏搜索框：提升至 44px (88rpx) 热区高度，强化强光对比度与信标蓝按钮 -->
      <view class="mt-2.5 h-[88rpx] flex items-center border border-slate-700 rounded-md bg-[#090d16] px-3">
        <text class="i-carbon-search mr-2 shrink-0 text-base text-slate-400" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索原厂总成、发动机配件、滤芯、救援网点"
          placeholder-class="text-slate-500"
          class="h-full flex-1 bg-transparent text-xs text-slate-100 font-medium outline-none"
          confirm-type="search"
          @confirm="handleSearch"
        >
        <view
          class="ml-2 h-8 flex shrink-0 items-center justify-center rounded-md bg-[#0284c7] px-3.5 text-xs text-white font-bold active:bg-[#0369a1]"
          @click="handleSearch"
        >
          搜索
        </view>
      </view>
    </view>

    <!-- 2. 轮播 Banner：刚性实线物理边框 -->
    <view class="mt-3 px-4">
      <swiper
        class="h-38 overflow-hidden border border-slate-700/80 rounded-lg bg-[#1e293b]"
        circular
        autoplay
        indicator-dots
        indicator-color="rgba(255,255,255,0.3)"
        indicator-active-color="#38bdf8"
        :interval="4000"
      >
        <swiper-item v-for="banner in bannerList" :key="banner.id">
          <view
            class="relative h-full w-full flex flex-col justify-between bg-gradient-to-r p-4 text-white"
            :class="banner.bgClass"
            @click="navigateTo(banner.link, banner.link.startsWith('/pages/'))"
          >
            <view>
              <view class="mb-1 inline-block border border-white/20 rounded-sm bg-black/35 px-2 py-0.5 text-[20rpx] font-bold">
                {{ banner.badge }}
              </view>
              <view class="text-base font-bold tracking-tight">
                {{ banner.title }}
              </view>
              <view class="mt-0.5 text-xs text-slate-200">
                {{ banner.subtitle }}
              </view>
            </view>
            <view class="flex items-center justify-between border-t border-white/20 pt-1.5 text-xs">
              <text class="text-slate-200">新人专享领 ¥100 备件直减券</text>
              <view class="flex items-center text-sky-300 font-bold">
                <text>立即直达</text>
                <text class="i-carbon-arrow-right ml-1 text-xs" />
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 3. 正在进行的真实救援应急机能面板 (FR-016 真实后端联动) -->
    <view
      v-if="hasLogin && activeRescueOrder"
      class="mx-4 mt-3 flex cursor-pointer items-center justify-between border-2 border-red-500 rounded-lg bg-[#0f172a] p-3.5 active:opacity-95"
      @click="handleGoTracking(activeRescueOrder)"
    >
      <view class="mr-2 min-w-0 flex flex-1 items-center gap-2.5">
        <view class="h-9 w-9 flex shrink-0 animate-pulse items-center justify-center rounded-md bg-red-600 text-white">
          <text class="i-carbon-warning-alt text-lg" />
        </view>
        <view class="min-w-0 flex-1">
          <view class="flex items-center gap-1.5 text-xs text-red-400 font-bold">
            <text>救援紧急调度中</text>
            <text class="rounded-sm bg-red-600 px-1.5 py-0.2 text-[20rpx] text-white font-bold font-mono">
              {{ activeRescueOrder.orderStatus === 'DISPATCHING' || activeRescueOrder.orderStatus === 'PENDING_DISPATCH' ? '调度派单中'
                : activeRescueOrder.orderStatus === 'ACCEPTED' ? '已派工出警'
                  : activeRescueOrder.orderStatus === 'DEPARTED' ? '技师赶赴现场'
                    : activeRescueOrder.orderStatus === 'ARRIVED' || activeRescueOrder.orderStatus === 'IN_PROGRESS' ? '已到场抢修' : '进行中' }}
            </text>
          </view>
          <view class="mt-1 truncate text-[22rpx] text-slate-300">
            单号: <text class="text-white font-mono">{{ activeRescueOrder.orderNo }}</text> · {{ activeRescueOrder.technicianName ? `${activeRescueOrder.technicianName}师傅` : '网点调度中' }}
            <text v-if="activeRescueOrder.technicianPlateNo"> · {{ activeRescueOrder.technicianPlateNo }}</text>
          </view>
        </view>
      </view>
      <view class="flex shrink-0 items-center border border-red-500/50 rounded-sm bg-red-500/20 px-2.5 py-1.5 text-xs text-red-400 font-bold">
        <text>查看轨迹</text>
        <text class="i-carbon-chevron-right ml-0.5 text-xs" />
      </view>
    </view>

    <!-- 4. 核心 8 宫格金刚区：深碳卡片与高反差图标 -->
    <view class="mx-4 mt-3 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4">
      <view class="grid grid-cols-4 gap-x-2 gap-y-4">
        <view
          v-for="item in gridNavList"
          :key="item.name"
          class="flex flex-col cursor-pointer items-center transition-transform active:scale-95"
          @click="navigateTo(item.url, item.isTab)"
        >
          <view
            class="mb-1.5 h-12 w-12 flex items-center justify-center border rounded-md"
            :style="{
              backgroundColor: `${item.color}15`,
              borderColor: `${item.color}40`,
            }"
          >
            <text
              :class="item.icon"
              class="text-xl"
              :style="{ color: item.color }"
            />
          </view>
          <text class="text-xs text-slate-200 font-bold">
            {{ item.name }}
          </text>
        </view>
      </view>
    </view>

    <!-- 5. 紧急救援一键呼叫醒目卡片：强化核心行动触控热区（高度 44px） -->
    <view class="mx-4 mt-3 flex items-center justify-between border border-red-500/40 rounded-lg from-red-600 to-red-700 bg-gradient-to-r p-4 text-white shadow-sm">
      <view class="mr-3 min-w-0 flex-1">
        <view class="flex items-center gap-1.5">
          <text class="text-sm font-bold tracking-tight">卡车汇 24H 道路极速救援</text>
          <text class="border border-white/20 rounded-sm bg-black/25 px-1.5 py-0.5 text-[20rpx] font-mono">全国联保</text>
        </view>
        <view class="mt-1 truncate text-xs text-white/90">
          爆胎 / 无法启动 / 线路断电 / 故障拖车 / 现场换件
        </view>
      </view>
      <view
        class="h-11 min-h-[88rpx] flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md bg-white px-4 text-xs text-red-600 font-extrabold active:opacity-90"
        @click="navigateTo('/pages-sub/rescue/create')"
      >
        <text class="i-carbon-phone-filled text-sm" />
        <text>立即报案</text>
      </view>
    </view>

    <!-- 6. 原厂配件特惠专区：深碳网格与信标蓝价格 -->
    <view class="mx-4 mt-4">
      <view class="mb-2.5 flex items-center justify-between">
        <view class="flex items-center gap-1.5">
          <view class="h-3.5 w-1 rounded-sm bg-[#0284c7]" />
          <text class="text-sm text-slate-100 font-bold">天龙旗舰 · 原厂配件直选</text>
          <text class="border border-emerald-500/40 rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[20rpx] text-emerald-400 font-bold">100% 正品质保</text>
        </view>
        <view
          class="flex cursor-pointer items-center text-xs text-sky-400 active:text-sky-300"
          @click="navigateTo('/pages-sub/mall/parts-catalog')"
        >
          <text>更多部件</text>
          <text class="i-carbon-chevron-right ml-0.5 text-xs" />
        </view>
      </view>

      <!-- 配件商品双列网格 -->
      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="part in partsProducts"
          :key="part.id"
          class="flex flex-col cursor-pointer justify-between overflow-hidden border border-slate-700/80 rounded-lg bg-[#1e293b] active:opacity-90"
          @click="selectPart(part)"
        >
          <image
            :src="part.image"
            mode="aspectFill"
            class="h-32 w-full bg-slate-900"
            @error="handlePartImageError(part)"
          />
          <view class="flex flex-1 flex-col justify-between p-2.5">
            <view>
              <view class="mb-1 flex items-center gap-1">
                <text class="border border-sky-400/40 rounded-sm bg-sky-500/20 px-1 py-0.2 text-[18rpx] text-sky-400 font-bold">原厂品质</text>
                <text class="text-[18rpx] text-slate-400 font-mono">{{ part.oeCode.slice(0, 10) }}</text>
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
              <view class="h-8 w-8 flex items-center justify-center border border-sky-400/40 rounded-md bg-sky-500/20 text-sky-400 active:bg-sky-500/40">
                <text class="i-carbon-shopping-cart-plus text-xs" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.custom-header {
  border-bottom-left-radius: 24rpx;
  border-bottom-right-radius: 24rpx;
}
</style>
