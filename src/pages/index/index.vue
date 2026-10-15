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

// 轮播图配置
const bannerList = ref([
  {
    id: 1,
    title: '24小时道路极速救援',
    subtitle: '全国覆盖 · 平均18分钟极速响应',
    badge: '紧急通道',
    bgClass: 'from-[#1677ff] to-[#0958d9]',
    link: '/pages/rescue/index',
  },
  {
    id: 2,
    title: '东风天龙 原厂正品配件节',
    subtitle: '官方直供 · 100%正品联保 · 到店包安装',
    badge: '限时特惠',
    bgClass: 'from-[#00b578] to-[#028c5c]',
    link: '/pages-sub/mall/parts-catalog',
  },
  {
    id: 3,
    title: '重卡智能故障诊断专家',
    subtitle: 'AI智能分析 + 原厂工程师在线排查',
    badge: '免费诊断',
    bgClass: 'from-[#fa8c16] to-[#d46b08]',
    link: '/pages/diagnosis/index',
  },
])

// 8宫格金刚区
const gridNavList = [
  { name: '道路救援', icon: 'i-carbon-warning-alt', color: '#ff4d4f', url: '/pages/rescue/index', isTab: true },
  { name: '配件选购', icon: 'i-carbon-box', color: '#1677ff', url: '/pages-sub/mall/parts-catalog' },
  { name: '智能诊断', icon: 'i-carbon-analytics', color: '#722ed1', url: '/pages/diagnosis/index', isTab: true },
  { name: '车型查询', icon: 'i-carbon-delivery-truck', color: '#13c2c2', url: '/pages-sub/mall/vehicle-query' },
  { name: '维保套餐', icon: 'i-carbon-tools', color: '#00b578', url: '/pages-sub/mall/package-select' },
  { name: '附近服务站', icon: 'i-carbon-location', color: '#fa8c16', url: '/pages-sub/mall/checkout' },
  { name: '综合订单', icon: 'i-carbon-document', color: '#2f54eb', url: '/pages/order/index', isTab: true },
  { name: '个人中心', icon: 'i-carbon-user', color: '#52c41a', url: '/pages/me/me', isTab: true },
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
  <view class="home-container min-h-screen pb-20 bg-[#f5f7fa]">
    <!-- 1. 顶部自定义 Header：状态栏安全区 + 车型绑定与会员 + 通栏搜索框 -->
    <view class="custom-header px-4 pb-3 bg-gradient-to-b from-[#0e2238] to-[#1a365d] text-white">
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
        <!-- 车型切换器 -->
        <view
          class="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur cursor-pointer active:opacity-80 shrink-0"
          @click="navigateTo('/pages-sub/mall/vehicle-query')"
        >
          <text class="i-carbon-delivery-truck text-amber-400 text-sm" />
          <text class="text-xs font-semibold max-w-[240rpx] truncate">
            {{ selectedModel.name }}
          </text>
          <text class="i-carbon-chevron-down text-xs opacity-70" />
        </view>

        <!-- 会员等级标识 -->
        <view
          class="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-[#0e2238] px-2.5 py-1 rounded-full text-xs font-bold shadow-sm shrink-0"
          @click="navigateTo('/pages/me/me', true)"
        >
          <text class="i-carbon-star-filled text-xs" />
          <text>{{ userInfo.memberLevel }}</text>
        </view>
      </view>

      <!-- 通栏搜索框：置于导航栏下方，左右通栏，无胶囊遮挡风险 -->
      <view class="mt-2 flex items-center bg-white rounded-xl px-3 py-2 shadow-sm">
        <text class="i-carbon-search text-gray-400 text-base mr-2" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索原厂总成、发动机配件、滤芯、救援网点"
          class="flex-1 text-xs text-gray-800 placeholder-gray-400 bg-transparent outline-none"
          confirm-type="search"
          @confirm="handleSearch"
        >
        <view
          class="bg-[#1677ff] text-white px-3 py-1 rounded-lg text-xs font-medium ml-2 active:opacity-90 shrink-0"
          @click="handleSearch"
        >
          搜索
        </view>
      </view>
    </view>

    <!-- 2. 轮播 Banner -->
    <view class="px-4 mt-3">
      <swiper
        class="h-38 rounded-2xl overflow-hidden shadow-sm"
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
              <view class="inline-block bg-white/25 text-[20rpx] px-2 py-0.5 rounded-full font-semibold mb-1 backdrop-blur">
                {{ banner.badge }}
              </view>
              <view class="text-base font-bold tracking-tight">
                {{ banner.title }}
              </view>
              <view class="text-xs opacity-90 mt-0.5">
                {{ banner.subtitle }}
              </view>
            </view>
            <view class="flex items-center justify-between text-xs pt-1 border-t border-white/20">
              <text class="opacity-90">新人专享领 ¥100 备件直减券</text>
              <view class="flex items-center font-bold">
                <text>立即直达</text>
                <text class="i-carbon-arrow-right ml-1 text-xs" />
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 3. 正在进行的真实救援悬浮提醒条 (FR-016 真实后端联动) -->
    <view
      v-if="activeRescueOrder"
      class="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between shadow-sm cursor-pointer"
      @click="navigateTo(`/pages-sub/rescue/tracking?orderNo=${activeRescueOrder.orderNo}`)"
    >
      <view class="flex items-center gap-2">
        <view class="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse">
          <text class="i-carbon-warning-alt text-base" />
        </view>
        <view>
          <view class="text-xs font-bold text-red-700 flex items-center gap-1">
            <text>救援跟单进行中</text>
            <text class="text-[20rpx] bg-red-600 text-white px-1.5 py-0.2 rounded font-mono">
              {{ activeRescueOrder.orderStatus === 'DISPATCHING' || activeRescueOrder.orderStatus === 'PENDING_DISPATCH' ? '调度派单中' :
                activeRescueOrder.orderStatus === 'ACCEPTED' ? '已派工出警' :
                activeRescueOrder.orderStatus === 'DEPARTED' ? '技师赶赴现场' :
                activeRescueOrder.orderStatus === 'ARRIVED' || activeRescueOrder.orderStatus === 'IN_PROGRESS' ? '已到场抢修' : '进行中' }}
            </text>
          </view>
          <view class="text-[22rpx] text-red-500 mt-0.5 truncate max-w-56">
            单号: {{ activeRescueOrder.orderNo }} · {{ activeRescueOrder.technicianName ? `${activeRescueOrder.technicianName}师傅` : '网点调度中' }}
            <text v-if="activeRescueOrder.technicianPlateNo"> · {{ activeRescueOrder.technicianPlateNo }}</text>
          </view>
        </view>
      </view>
      <view class="flex items-center text-red-600 text-xs font-bold shrink-0">
        <text>查看轨迹</text>
        <text class="i-carbon-chevron-right ml-0.5 text-xs" />
      </view>
    </view>

    <!-- 4. 核心 8 宫格金刚区 -->
    <view class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
      <view class="grid grid-cols-4 gap-y-4 gap-x-2">
        <view
          v-for="item in gridNavList"
          :key="item.name"
          class="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
          @click="navigateTo(item.url, item.isTab)"
        >
          <view
            class="w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 shadow-sm"
            :style="{ backgroundColor: `${item.color}15` }"
          >
            <text
              :class="item.icon"
              class="text-xl"
              :style="{ color: item.color }"
            />
          </view>
          <text class="text-xs font-medium text-gray-700">
            {{ item.name }}
          </text>
        </view>
      </view>
    </view>

    <!-- 5. 紧急救援一键呼叫醒目卡片 -->
    <view class="mx-4 mt-3 bg-gradient-to-r from-red-600 to-rose-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
      <view>
        <view class="flex items-center gap-1.5">
          <text class="text-sm font-bold">卡车汇 24H 道路极速救援热线</text>
          <text class="bg-white/20 text-[20rpx] px-1.5 py-0.5 rounded font-mono">全国联保</text>
        </view>
        <view class="text-xs opacity-90 mt-1">
          爆胎 / 无法启动 / 线路断电 / 故障拖车 / 现场换件
        </view>
      </view>
      <view
        class="bg-white text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold shadow active:opacity-90 flex items-center gap-1 cursor-pointer"
        @click="navigateTo('/pages-sub/rescue/create')"
      >
        <text class="i-carbon-phone-filled text-sm" />
        <text>立即报案</text>
      </view>
    </view>

    <!-- 6. 原厂配件特惠专区 (对标 1c.png 底部热卖推荐) -->
    <view class="mx-4 mt-4">
      <view class="flex items-center justify-between mb-2.5">
        <view class="flex items-center gap-1.5">
          <view class="w-1 h-3.5 bg-[#1677ff] rounded-full" />
          <text class="text-sm font-bold text-gray-900">天龙旗舰 · 原厂配件直选</text>
          <text class="text-[20rpx] text-[#00b578] bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">100% 正品质保</text>
        </view>
        <view
          class="flex items-center text-xs text-gray-400 cursor-pointer"
          @click="navigateTo('/pages-sub/mall/parts-catalog')"
        >
          <text>更多部件</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>

      <!-- 配件商品双列网格 -->
      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="part in partsProducts"
          :key="part.id"
          class="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col justify-between cursor-pointer active:opacity-90"
          @click="navigateTo('/pages-sub/mall/parts-detail')"
        >
          <image
            :src="part.image"
            mode="aspectFill"
            class="w-full h-32 bg-gray-100"
          />
          <view class="p-2.5 flex-1 flex flex-col justify-between">
            <view>
              <view class="flex items-center gap-1 mb-1">
                <text class="bg-blue-50 text-[#1677ff] text-[18rpx] px-1 py-0.2 rounded font-medium">原厂品质</text>
                <text class="text-[18rpx] text-gray-400 font-mono">{{ part.oeCode.slice(0, 10) }}</text>
              </view>
              <view class="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">
                {{ part.name }}
              </view>
            </view>

            <view class="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
              <view>
                <text class="text-[20rpx] text-red-600 font-bold">¥</text>
                <text class="text-base text-red-600 font-bold">{{ part.priceRetail }}</text>
              </view>
              <view class="w-6 h-6 rounded-full bg-blue-50 text-[#1677ff] flex items-center justify-center">
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
  border-bottom-left-radius: 28rpx;
  border-bottom-right-radius: 28rpx;
}
</style>
