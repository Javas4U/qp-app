<script setup lang="ts">
import { ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '车主协同服务大厅',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
  },
})

const banners = ref([
  { title: '全天候干线道路救援 · 15分钟快速响应', tag: '应急保障' },
  { title: '原厂直供质保备件 · 全国两万合作网点联保', tag: '正品溯源' },
])

const quickActions = ref([
  { title: '极速道路救援', desc: '全天候一键派单', icon: 'i-carbon-warning-alt', color: 'text-rose-400', url: '/pages-sub/rescue/create' },
  { title: '原厂配件商城', desc: '车型总成选配', icon: 'i-carbon-shopping-bag', color: 'text-sky-400', url: '/pages-sub/mall/parts-catalog' },
  { title: '车型精准查询', desc: '国六及新能源库', icon: 'i-carbon-delivery-truck', color: 'text-amber-400', url: '/pages-sub/mall/vehicle-query' },
  { title: '我的维修工单', desc: '全流程轨迹追踪', icon: 'i-carbon-document', color: 'text-emerald-400', url: '/pages/order/index', isTab: true },
])

const hotline = ref('400-800-8899')

function callHotline() {
  uni.makePhoneCall({
    phoneNumber: hotline.value,
  })
}

function handleNavigate(item: typeof quickActions.value[0]) {
  if (item.isTab) {
    uni.switchTab({ url: item.url })
  }
  else {
    uni.navigateTo({ url: item.url })
  }
}

function handleOnlineChat() {
  uni.showModal({
    title: '干线智能坐席',
    content: '当前为干线重卡专属在线通道，已为您建立专属工单会话（响应时间 < 30 秒）。',
    confirmText: '呼叫坐席',
    cancelText: '稍后',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已接通人工专家坐席', icon: 'success' })
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-[#0f172a] text-slate-100 pb-16">
    <!-- 1. 头部机能卡片 (深碳工业质感) -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] px-4 py-4">
      <view class="flex items-center justify-between">
        <view>
          <view class="flex items-center gap-2">
            <text class="w-2 h-4 bg-[#0284c7] rounded-sm" />
            <text class="text-lg text-slate-100 font-bold">
              卡车汇 · 干线车主协同服务大厅
            </text>
          </view>
          <view class="mt-1 text-xs text-slate-400">
            重卡全生命周期后市场协同保障 · 7×24H 守卫干线运转
          </view>
        </view>
        <view class="px-2 py-0.5 rounded-sm bg-sky-950/60 border border-sky-600/40 text-[20rpx] text-[#38bdf8] font-mono">
          V2.4 协同版
        </view>
      </view>
    </view>

    <!-- 2. 轮播警示/保障条 -->
    <view class="p-4">
      <swiper
        class="h-28 overflow-hidden rounded-lg border border-slate-700/80 bg-[#1e293b]"
        :indicator-dots="true"
        :autoplay="true"
        indicator-color="rgba(148, 163, 184, 0.4)"
        indicator-active-color="#0284c7"
      >
        <swiper-item v-for="(banner, idx) in banners" :key="idx">
          <view class="h-full w-full flex flex-col justify-center px-4 bg-gradient-to-r from-sky-950/40 via-[#1e293b] to-[#1e293b]">
            <view class="text-[20rpx] inline-block px-1.5 py-0.5 rounded-sm bg-[#0284c7] text-white font-mono w-fit mb-1.5 font-bold">
              {{ banner.tag }}
            </view>
            <view class="text-sm text-slate-100 font-bold">
              {{ banner.title }}
            </view>
            <view class="text-[20rpx] text-slate-400 mt-1">
              遇紧急故障请立即靠边停车，开启双闪并摆放反光三角警示牌
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 3. 24小时应急调度电话高辨识专区 (手套防误触) -->
    <view class="mx-4 mb-4 rounded-lg bg-[#1e293b] p-4 border border-slate-700/80">
      <view class="flex items-center justify-between mb-3">
        <view class="flex items-center gap-1.5">
          <text class="i-carbon-phone-filled text-rose-500 text-base" />
          <text class="text-xs font-bold text-slate-200">24H 干线抢修调度专线</text>
        </view>
        <text class="text-[20rpx] text-emerald-400 flex items-center gap-1">
          <text class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          专席在线中
        </text>
      </view>

      <view class="flex items-center justify-between gap-3 bg-[#090d16] p-3 rounded-md border border-slate-700/80">
        <view>
          <text class="text-[20rpx] text-slate-400 block font-mono">全国调度免费服务热线：</text>
          <text class="text-xl font-black text-slate-100 font-mono tracking-wider">{{ hotline }}</text>
        </view>
        <button
          class="min-h-[88rpx] h-[88rpx] bg-[#0284c7] hover:bg-sky-500 text-white text-xs px-5 rounded-lg font-bold border border-sky-400/40 active:translate-y-0.5 flex items-center justify-center m-0"
          @click="callHotline"
        >
          <text class="i-carbon-phone mr-1 text-sm" />
          立即拨打
        </button>
      </view>
    </view>

    <!-- 4. 高频服务入口网格 (刚性 2x2 网格) -->
    <view class="mx-4 rounded-lg bg-[#1e293b] p-4 border border-slate-700/80">
      <view class="mb-3 text-xs text-slate-300 font-bold flex items-center justify-between">
        <text class="flex items-center gap-1.5">
          <text class="w-1.5 h-3 bg-[#0284c7] rounded-sm" />
          <text>车主核心机能服务</text>
        </text>
        <text class="text-[20rpx] text-slate-400 font-mono">即按即达</text>
      </view>

      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="(action, idx) in quickActions"
          :key="idx"
          class="flex items-center gap-3 rounded-md p-3 border border-slate-700/80 bg-[#090d16] cursor-pointer hover:border-sky-500/50 active:translate-y-0.5 transition-all min-h-[96rpx]"
          @click="handleNavigate(action)"
        >
          <view class="h-10 w-10 flex items-center justify-center rounded-sm bg-[#1e293b] border border-slate-700 shrink-0" :class="[action.color]">
            <text class="text-xl" :class="[action.icon]" />
          </view>
          <view class="overflow-hidden">
            <view class="text-xs text-slate-100 font-bold truncate">
              {{ action.title }}
            </view>
            <view class="text-[20rpx] text-slate-400 truncate mt-0.5">
              {{ action.desc }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 5. 在线客服与常见指引卡片 -->
    <view class="mx-4 mt-4 rounded-lg bg-[#1e293b] p-4 border border-slate-700/80">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <text class="i-carbon-chat-operational text-xl text-[#38bdf8]" />
          <view>
            <view class="text-xs font-bold text-slate-100">在线专家问诊与工单沟通</view>
            <view class="text-[20rpx] text-slate-400">平均应答时间 30 秒 · 技术工程师一对一支持</view>
          </view>
        </view>
        <button
          class="min-h-[80rpx] h-[80rpx] px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md font-bold border border-slate-700 active:translate-y-0.5 flex items-center justify-center m-0"
          @click="handleOnlineChat"
        >
          <text class="i-carbon-user-speaker mr-1 text-sm text-[#38bdf8]" />
          连接坐席
        </button>
      </view>
    </view>
  </view>
</template>
