<script lang="ts" setup>
import type { RescueOrderVo } from '@/types/rescue'
import { getActiveRescueOrder } from '@/api/rescue'
import { useMallSessionStore } from '@/store/mallSession'
import { useRescueSessionStore } from '@/store/rescueSession'
import { useTokenStore } from '@/store/token'
import { useUserSessionStore } from '@/store/userSession'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineOptions({
  name: 'IndexPage',
})

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '卡车汇',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserSessionStore()
const mallStore = useMallSessionStore()
const rescueStore = useRescueSessionStore()

const { userInfo } = storeToRefs(userStore)
const { selectedModel, partsProducts } = storeToRefs(mallStore)
const { currentTicket } = storeToRefs(rescueStore)

const searchKeyword = ref('')
const activeRescueOrder = ref<RescueOrderVo | null>(null)

onShow(() => {
  checkActiveRescueOrder()
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
  if (!order || !order.orderNo) return
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
  { name: '附近服务站', icon: 'i-carbon-location', color: '#f59e0b', url: '/pages-sub/mall/checkout' },
  { name: '综合订单', icon: 'i-carbon-document', color: '#3b82f6', url: '/pages/order/index', isTab: true },
  { name: '个人中心', icon: 'i-carbon-user', color: '#10b981', url: '/pages/me/me', isTab: true },
]

function navigateTo(url: string, isTab = false) {
  if (isTab) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

function handleSearch() {
  if (!searchKeyword.value.trim()) {
    uni.navigateTo({ url: '/pages-sub/mall/parts-catalog' })
    return
  }
  uni.showToast({
    title: `正在检索: ${searchKeyword.value}`,
    icon: 'none',
  })
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
  <view class="home-container min-h-screen pb-20 bg-[#f8fafc]">
    <!-- 1. 顶部自定义 Header：状态栏安全区 + 车型绑定与会员 + 通栏搜索框 (工业高可视亮色模式) -->
    <view class="custom-header px-4 pb-3.5 bg-white border-b border-slate-200/90 shadow-sm text-slate-900">
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
        <!-- 车型切换器：规整中圆角与防眩光浅色机能底框 -->
        <view
          class="flex items-center gap-1.5 bg-slate-100 border border-slate-300/80 px-3 py-1.5 rounded-md cursor-pointer active:bg-slate-200 shrink-0"
          @click="navigateTo('/pages-sub/mall/vehicle-query')"
        >
          <text class="i-carbon-delivery-truck text-amber-500 text-sm" />
          <text class="text-xs font-bold text-slate-900 max-w-[240rpx] truncate">
            {{ selectedModel.name }}
          </text>
          <text class="i-carbon-chevron-down text-xs text-slate-500" />
        </view>

        <!-- 会员等级标识：琥珀金小圆角机能标签 -->
        <view
          class="flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-700 px-2.5 py-1 rounded-sm text-xs font-bold shrink-0 active:opacity-80"
          @click="navigateTo('/pages/me/me', true)"
        >
          <text class="i-carbon-star-filled text-xs text-amber-500" />
          <text>{{ userInfo.memberLevel }}</text>
        </view>
      </view>

      <!-- 通栏搜索框：提升至 44px 热区高度，强化强光对比度与信标蓝按钮 -->
      <view class="mt-2.5 flex items-center bg-slate-50 border border-slate-300 rounded-md px-3 h-11">
        <text class="i-carbon-search text-slate-400 text-base mr-2 shrink-0" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索原厂总成、发动机配件、滤芯、救援网点"
          class="flex-1 text-xs text-slate-900 font-medium placeholder-slate-400 bg-transparent outline-none h-full"
          confirm-type="search"
          @confirm="handleSearch"
        >
        <view
          class="bg-[#0284c7] text-white px-3.5 h-8 flex items-center justify-center rounded-md text-xs font-bold ml-2 active:bg-[#0369a1] shrink-0 shadow-sm"
          @click="handleSearch"
        >
          搜索
        </view>
      </view>
    </view>

    <!-- 2. 轮播 Banner：摒弃胶囊圆角与弥散阴影，使用 1px 规整实线边框 -->
    <view class="px-4 mt-3">
      <swiper
        class="h-38 rounded-lg overflow-hidden border border-slate-200/80"
        circular
        autoplay
        indicator-dots
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#ffffff"
        :interval="4000"
      >
        <swiper-item v-for="banner in bannerList" :key="banner.id">
          <view
            class="h-full w-full p-4 flex flex-col justify-between text-white bg-gradient-to-r relative"
            :class="banner.bgClass"
            @click="navigateTo(banner.link, banner.link.startsWith('/pages/'))"
          >
            <view>
              <view class="inline-block bg-black/25 text-[20rpx] px-2 py-0.5 rounded-sm font-bold mb-1 border border-white/20">
                {{ banner.badge }}
              </view>
              <view class="text-base font-bold tracking-tight">
                {{ banner.title }}
              </view>
              <view class="text-xs text-white/90 mt-0.5">
                {{ banner.subtitle }}
              </view>
            </view>
            <view class="flex items-center justify-between text-xs pt-1.5 border-t border-white/20">
              <text class="text-white/90">新人专享领 ¥100 备件直减券</text>
              <view class="flex items-center font-bold">
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
      v-if="activeRescueOrder"
      class="mx-4 mt-3 p-3.5 bg-white border-2 border-rose-500 rounded-lg shadow-sm flex items-center justify-between cursor-pointer active:opacity-95"
      @click="handleGoTracking(activeRescueOrder)"
    >
      <view class="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
        <view class="w-9 h-9 rounded-md bg-rose-600 text-white flex items-center justify-center animate-pulse shrink-0">
          <text class="i-carbon-warning-alt text-lg" />
        </view>
        <view class="flex-1 min-w-0">
          <view class="text-xs font-bold text-rose-600 flex items-center gap-1.5">
            <text>救援紧急调度中</text>
            <text class="text-[20rpx] bg-rose-600 text-white px-1.5 py-0.2 rounded-sm font-mono font-bold">
              {{ activeRescueOrder.orderStatus === 'DISPATCHING' || activeRescueOrder.orderStatus === 'PENDING_DISPATCH' ? '调度派单中' :
                activeRescueOrder.orderStatus === 'ACCEPTED' ? '已派工出警' :
                activeRescueOrder.orderStatus === 'DEPARTED' ? '技师赶赴现场' :
                activeRescueOrder.orderStatus === 'ARRIVED' || activeRescueOrder.orderStatus === 'IN_PROGRESS' ? '已到场抢修' : '进行中' }}
            </text>
          </view>
          <view class="text-[22rpx] text-slate-600 mt-1 truncate">
            单号: <text class="font-mono text-slate-900 font-bold">{{ activeRescueOrder.orderNo }}</text> · {{ activeRescueOrder.technicianName ? `${activeRescueOrder.technicianName}师傅` : '网点调度中' }}
            <text v-if="activeRescueOrder.technicianPlateNo"> · {{ activeRescueOrder.technicianPlateNo }}</text>
          </view>
        </view>
      </view>
      <view class="flex items-center bg-rose-50 border border-rose-200 text-rose-600 px-2.5 py-1.5 rounded-sm text-xs font-bold shrink-0">
        <text>查看轨迹</text>
        <text class="i-carbon-chevron-right ml-0.5 text-xs" />
      </view>
    </view>

    <!-- 4. 核心 8 宫格金刚区：规整 1px 实线轻边框与中圆角图标容器 -->
    <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/80">
      <view class="grid grid-cols-4 gap-y-4 gap-x-2">
        <view
          v-for="item in gridNavList"
          :key="item.name"
          class="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
          @click="navigateTo(item.url, item.isTab)"
        >
          <view
            class="w-12 h-12 rounded-md flex items-center justify-center mb-1.5 border"
            :style="{
              backgroundColor: `${item.color}12`,
              borderColor: `${item.color}30`,
            }"
          >
            <text
              :class="item.icon"
              class="text-xl"
              :style="{ color: item.color }"
            />
          </view>
          <text class="text-xs font-bold text-slate-800">
            {{ item.name }}
          </text>
        </view>
      </view>
    </view>

    <!-- 5. 紧急救援一键呼叫醒目卡片：强化核心行动触控热区（高度40px以上） -->
    <view class="mx-4 mt-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 text-white border border-red-500/40 flex items-center justify-between">
      <view class="flex-1 min-w-0 mr-3">
        <view class="flex items-center gap-1.5">
          <text class="text-sm font-bold tracking-tight">卡车汇 24H 道路极速救援</text>
          <text class="bg-black/25 text-[20rpx] px-1.5 py-0.5 rounded-sm font-mono border border-white/20">全国联保</text>
        </view>
        <view class="text-xs text-white/90 mt-1 truncate">
          爆胎 / 无法启动 / 线路断电 / 故障拖车 / 现场换件
        </view>
      </view>
      <view
        class="bg-white text-red-600 px-4 h-10 rounded-md text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer active:opacity-90 shrink-0"
        @click="navigateTo('/pages-sub/rescue/create')"
      >
        <text class="i-carbon-phone-filled text-sm" />
        <text>立即报案</text>
      </view>
    </view>

    <!-- 6. 原厂配件特惠专区：统一信标蓝色调与大号明码实价 -->
    <view class="mx-4 mt-4">
      <view class="flex items-center justify-between mb-2.5">
        <view class="flex items-center gap-1.5">
          <view class="w-1 h-3.5 bg-[#0284c7] rounded-sm" />
          <text class="text-sm font-bold text-slate-900">天龙旗舰 · 原厂配件直选</text>
          <text class="text-[20rpx] text-[#059669] bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-sm font-bold">100% 正品质保</text>
        </view>
        <view
          class="flex items-center text-xs text-slate-400 cursor-pointer active:text-slate-600"
          @click="navigateTo('/pages-sub/mall/parts-catalog')"
        >
          <text>更多部件</text>
          <text class="i-carbon-chevron-right text-xs ml-0.5" />
        </view>
      </view>

      <!-- 配件商品双列网格 -->
      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="part in partsProducts"
          :key="part.id"
          class="bg-white rounded-lg overflow-hidden border border-slate-200/80 flex flex-col justify-between cursor-pointer active:opacity-90"
          @click="navigateTo('/pages-sub/mall/parts-detail')"
        >
          <image
            :src="part.image"
            mode="aspectFill"
            class="w-full h-32 bg-slate-100"
          />
          <view class="p-2.5 flex-1 flex flex-col justify-between">
            <view>
              <view class="flex items-center gap-1 mb-1">
                <text class="bg-sky-50 text-[#0284c7] border border-sky-200/80 text-[18rpx] px-1 py-0.2 rounded-sm font-bold">原厂品质</text>
                <text class="text-[18rpx] text-slate-400 font-mono">{{ part.oeCode.slice(0, 10) }}</text>
              </view>
              <view class="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                {{ part.name }}
              </view>
            </view>

            <view class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
              <view>
                <text class="text-[20rpx] text-red-600 font-bold">¥</text>
                <text class="text-base text-red-600 font-bold font-mono">{{ part.priceRetail }}</text>
              </view>
              <view class="w-7 h-7 rounded-md bg-sky-50 border border-sky-200/80 text-[#0284c7] flex items-center justify-center active:bg-sky-100">
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
