<script lang="ts" setup>
import { useMallSessionStore } from '@/store/mallSession'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'PartsDetailPage',
})

definePage({
  style: {
    navigationBarTitleText: '配件详情',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

const mallStore = useMallSessionStore()
const { currentPart, selectedModel, partsProducts } = storeToRefs(mallStore)

onLoad((query) => {
  if (query && query.partId) {
    const found = partsProducts.value.find(p => p.id === query.partId)
    if (found) {
      currentPart.value = found
    }
  }
})

// 规格选择
const displacementOptions = ['11L', '12L', '13.5L']
const selectedDisplacement = ref('11L')

const horsepowerOptions = ['440Ps', '460Ps', '520Ps', '560Ps']
const selectedHorsepower = ref('460Ps')

// 联动价格计算
const calculatedPrice = computed(() => {
  const base = currentPart.value?.priceRetail || 0
  let dispDelta = 0
  if (selectedDisplacement.value === '12L')
    dispDelta = 600
  if (selectedDisplacement.value === '13.5L')
    dispDelta = 1200

  let hpDelta = 0
  if (selectedHorsepower.value === '460Ps')
    hpDelta = 300
  if (selectedHorsepower.value === '520Ps')
    hpDelta = 800
  if (selectedHorsepower.value === '560Ps')
    hpDelta = 1500

  return base + dispDelta + hpDelta
})

function gotoCheckout() {
  mallStore.selectedDisplacement = selectedDisplacement.value
  mallStore.selectedHorsepower = selectedHorsepower.value
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

function handlePartImageError() {
  if (currentPart.value) {
    currentPart.value.image = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80'
  }
}
</script>

<template>
  <view class="parts-detail-page min-h-screen bg-[#0f172a] pb-28 text-slate-100">
    <!-- 1. 高清配件轮播/总成图 (工业质感大图) -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] p-4">
      <image
        :src="currentPart.image"
        mode="aspectFit"
        class="h-64 w-full border border-slate-700 rounded-lg bg-slate-900"
        @error="handlePartImageError"
      />
    </view>

    <!-- 2. 品名、OE码、价格与销量卡片 -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] p-4">
      <view class="mb-2 flex items-center gap-1.5">
        <text class="border border-emerald-500/40 rounded-sm bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400 font-bold">原厂正品 100% 联保</text>
        <text class="border border-sky-500/40 rounded-sm bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400 font-bold">适配东风商用车</text>
      </view>

      <view class="text-base text-slate-100 font-black leading-snug">
        {{ currentPart.name }}
      </view>

      <view class="mt-2 text-xs text-sky-400 font-mono">
        OE 原厂零件号：{{ currentPart.oeCode }}
      </view>

      <!-- 价格与销量 -->
      <view class="mt-3 flex items-baseline justify-between border-t border-slate-700/80 pt-2">
        <view class="flex items-baseline gap-1">
          <text class="text-sm text-rose-400 font-bold">指导价 ¥</text>
          <text class="text-3xl text-rose-400 font-black font-mono">{{ calculatedPrice.toLocaleString() }}</text>
        </view>
        <text class="text-xs text-slate-400 font-mono">已累计订购 {{ currentPart.salesCount }} 套</text>
      </view>
    </view>

    <!-- 3. 规格配置动态切换 (深碳阶梯圆角) -->
    <view class="mt-3 border-y border-slate-700/80 bg-[#1e293b] p-4">
      <view class="mb-3 text-xs text-slate-200 font-bold">
        选择总成适配规格
      </view>

      <!-- 排量选择 -->
      <view class="mb-3">
        <view class="mb-1.5 text-[22rpx] text-slate-400">
          排量规格：
        </view>
        <view class="flex items-center gap-2">
          <view
            v-for="d in displacementOptions"
            :key="d"
            class="min-h-[64rpx] flex cursor-pointer items-center justify-center border rounded-md px-3.5 py-1.5 text-xs font-bold transition-colors"
            :class="selectedDisplacement === d
              ? 'bg-[#0284c7] border-sky-400 text-white'
              : 'bg-slate-900 border-slate-700 text-slate-300'"
            @click="selectedDisplacement = d"
          >
            {{ d }}
          </view>
        </view>
      </view>

      <!-- 马力选择 -->
      <view>
        <view class="mb-1.5 text-[22rpx] text-slate-400">
          输出马力：
        </view>
        <view class="flex items-center gap-2">
          <view
            v-for="hp in horsepowerOptions"
            :key="hp"
            class="min-h-[64rpx] flex cursor-pointer items-center justify-center border rounded-md px-3.5 py-1.5 text-xs font-bold transition-colors"
            :class="selectedHorsepower === hp
              ? 'bg-[#0284c7] border-sky-400 text-white'
              : 'bg-slate-900 border-slate-700 text-slate-300'"
            @click="selectedHorsepower = hp"
          >
            {{ hp }}
          </view>
        </view>
      </view>
    </view>

    <!-- 4. 适配车型确认与履约通道说明 -->
    <view class="mt-3 border-y border-slate-700/80 bg-[#1e293b] p-4 space-y-3">
      <view class="flex items-center justify-between text-xs text-slate-200 font-bold">
        <view class="flex items-center gap-1.5">
          <text class="i-carbon-checkmark-outline text-emerald-400" />
          <text>当前适配绑定车型</text>
        </view>
        <text class="text-xs text-sky-400 font-bold font-mono">{{ selectedModel.name }}</text>
      </view>

      <!-- 履约通道提示 -->
      <view class="border border-slate-700 rounded-lg bg-slate-900 p-3 text-xs text-slate-300 space-y-1.5">
        <view class="text-slate-100 font-bold">
          支持履约通道：
        </view>
        <view class="flex items-center gap-1.5">
          <text class="text-sky-400">● 顺丰/德邦专车快运：</text>
          <text>+¥{{ currentPart.shippingFee }} 运费，送达指定仓库或车队</text>
        </view>
        <view class="flex items-center gap-1.5">
          <text class="text-emerald-400">● 特约维修站到店安装：</text>
          <text>+¥{{ currentPart.standardInstallFee }} 标准工时费，持证技师质保包安装</text>
        </view>
      </view>
    </view>

    <!-- 5. 底部固定结算条 (深碳工业底栏，触控热区 >= 88rpx) -->
    <view class="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-slate-700/80 bg-[#1e293b] p-3">
      <view class="flex items-center gap-4 pl-2">
        <view class="flex flex-col cursor-pointer items-center text-slate-400 active:text-slate-200" @click="callService">
          <text class="i-carbon-headset text-lg" />
          <text class="mt-0.5 text-[18rpx]">专家客服</text>
        </view>
        <view class="flex flex-col cursor-pointer items-center text-slate-400 active:text-slate-200" @click="handleAddCart">
          <text class="i-carbon-box text-lg" />
          <text class="mt-0.5 text-[18rpx]">加清单</text>
        </view>
      </view>

      <view class="flex items-center gap-2">
        <button
          class="h-11 min-h-[88rpx] flex items-center justify-center border border-slate-700 rounded-lg bg-slate-800 px-4 text-xs text-slate-200 font-bold transition-colors active:bg-slate-700"
          @click="handleAddCart"
        >
          加入清单
        </button>
        <button
          class="h-11 min-h-[88rpx] flex items-center justify-center rounded-lg border-none bg-[#0284c7] px-5 text-xs text-white font-bold transition-colors active:bg-[#0369a1]"
          @click="gotoCheckout"
        >
          立即选配结算
        </button>
      </view>
    </view>
  </view>
</template>
