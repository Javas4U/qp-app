<script lang="ts" setup>
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineOptions({
  name: 'PartsDetailPage',
})

definePage({
  style: {
    navigationBarTitleText: '配件详情',
    navigationBarBackgroundColor: '#f8fafc',
    navigationBarTextStyle: 'black',
  },
})

const mallStore = useMallSessionStore()
const { currentPart, selectedModel } = storeToRefs(mallStore)

// 规格选择
const displacementOptions = ['11L', '12L', '13.5L']
const selectedDisplacement = ref('11L')

const horsepowerOptions = ['440Ps', '460Ps', '520Ps', '560Ps']
const selectedHorsepower = ref('460Ps')

function gotoCheckout() {
  uni.navigateTo({
    url: '/pages-sub/mall/checkout',
  })
}

function handleAddCart() {
  uni.showToast({
    title: '已加入配件备选清单',
    icon: 'success',
  })
}

function callService() {
  uni.makePhoneCall({
    phoneNumber: '400-888-9999',
    fail: () => {
      uni.showToast({ title: '原厂配件专家客服: 400-888-9999', icon: 'none' })
    },
  })
}
</script>

<template>
  <view class="parts-detail-page min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
    <!-- 1. 高清配件轮播/总成图 (工业质感大图) -->
    <view class="bg-white border-b border-slate-200 p-4">
      <image
        :src="currentPart.image"
        mode="aspectFit"
        class="w-full h-64 bg-slate-50 rounded-lg border border-slate-200"
      />
    </view>

    <!-- 2. 品名、OE码、价格与销量卡片 -->
    <view class="bg-white p-4 border-b border-slate-200 shadow-sm">
      <view class="flex items-center gap-1.5 mb-2">
        <text class="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-2 py-0.5 rounded-sm font-bold">原厂正品 100% 联保</text>
        <text class="bg-sky-50 text-sky-700 border border-sky-300 text-xs px-2 py-0.5 rounded-sm font-bold">适配东风商用车</text>
      </view>

      <view class="text-base font-black text-slate-900 leading-snug">
        {{ currentPart.name }}
      </view>

      <view class="mt-2 text-xs text-[#0284c7] font-mono">
        OE 原厂零件号：{{ currentPart.oeCode }}
      </view>

      <!-- 价格与销量 -->
      <view class="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-100">
        <view class="flex items-baseline gap-1">
          <text class="text-sm font-bold text-rose-600">指导价 ¥</text>
          <text class="text-3xl font-black text-rose-600 font-mono">{{ currentPart.priceRetail }}</text>
        </view>
        <text class="text-xs text-slate-500 font-mono">已累计订购 {{ currentPart.salesCount }} 套</text>
      </view>
    </view>

    <!-- 3. 规格配置动态切换 (亮色工业选块) -->
    <view class="mt-3 bg-white p-4 border-y border-slate-200 shadow-sm">
      <view class="text-xs font-bold text-slate-900 mb-3">
        选择总成适配规格
      </view>

      <!-- 排量选择 -->
      <view class="mb-3">
        <view class="text-[22rpx] text-slate-500 mb-1.5">
          排量规格：
        </view>
        <view class="flex items-center gap-2">
          <view
            v-for="d in displacementOptions"
            :key="d"
            class="px-3 py-1.5 rounded-sm text-xs font-bold cursor-pointer border transition-colors"
            :class="selectedDisplacement === d
              ? 'bg-[#0284c7] border-[#0284c7] text-white'
              : 'bg-slate-50 border-slate-300 text-slate-700'"
            @click="selectedDisplacement = d"
          >
            {{ d }}
          </view>
        </view>
      </view>

      <!-- 马力选择 -->
      <view>
        <view class="text-[22rpx] text-slate-500 mb-1.5">
          输出马力：
        </view>
        <view class="flex items-center gap-2">
          <view
            v-for="hp in horsepowerOptions"
            :key="hp"
            class="px-3 py-1.5 rounded-sm text-xs font-bold cursor-pointer border transition-colors"
            :class="selectedHorsepower === hp
              ? 'bg-[#0284c7] border-[#0284c7] text-white'
              : 'bg-slate-50 border-slate-300 text-slate-700'"
            @click="selectedHorsepower = hp"
          >
            {{ hp }}
          </view>
        </view>
      </view>
    </view>

    <!-- 4. 适配车型确认与履约通道说明 -->
    <view class="mt-3 bg-white p-4 border-y border-slate-200 shadow-sm space-y-3">
      <view class="text-xs font-bold text-slate-900 flex items-center justify-between">
        <view class="flex items-center gap-1.5">
          <text class="i-carbon-checkmark-outline text-emerald-600" />
          <text>当前适配绑定车型</text>
        </view>
        <text class="text-[#0284c7] text-xs font-mono font-bold">{{ selectedModel.name }}</text>
      </view>

      <!-- 履约通道提示 -->
      <view class="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-700">
        <view class="font-bold text-slate-900">
          支持履约通道：
        </view>
        <view class="flex items-center gap-1.5">
          <text class="text-[#0284c7] font-medium">● 顺丰/德邦专车快运：</text>
          <text>+¥{{ currentPart.shippingFee }} 运费，送达指定仓库或车队</text>
        </view>
        <view class="flex items-center gap-1.5">
          <text class="text-emerald-700 font-medium">● 特约维修站到店安装：</text>
          <text>+¥{{ currentPart.standardInstallFee }} 标准工时费，持证技师质保包安装</text>
        </view>
      </view>
    </view>

    <!-- 5. 底部固定结算条 (工业亮色底栏) -->
    <view class="fixed bottom-0 left-0 right-0 p-3 bg-white/95 border-t border-slate-200 flex items-center justify-between z-30 shadow-md">
      <view class="flex items-center gap-4 pl-2">
        <view class="flex flex-col items-center cursor-pointer text-slate-500 active:text-slate-800" @click="callService">
          <text class="i-carbon-headset text-lg" />
          <text class="text-[18rpx] mt-0.5">专家客服</text>
        </view>
        <view class="flex flex-col items-center cursor-pointer text-slate-500 active:text-slate-800" @click="handleAddCart">
          <text class="i-carbon-box text-lg" />
          <text class="text-[18rpx] mt-0.5">加清单</text>
        </view>
      </view>

      <view class="flex items-center gap-2">
        <button
          class="bg-slate-100 border border-slate-300 text-slate-700 text-xs px-4 min-h-[80rpx] rounded-lg font-bold active:bg-slate-200 m-0 flex items-center justify-center transition-colors"
          @click="handleAddCart"
        >
          加入清单
        </button>
        <button
          class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs px-5 min-h-[80rpx] rounded-lg font-bold m-0 border-none flex items-center justify-center transition-colors shadow-sm"
          @click="gotoCheckout"
        >
          立即选配结算
        </button>
      </view>
    </view>
  </view>
</template>
