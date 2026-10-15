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
    navigationBarBackgroundColor: '#ffffff',
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
  <view class="parts-detail-page min-h-screen bg-[#f5f7fa] pb-24">
    <!-- 1. 高清配件轮播/总成图 (对标 天龙配件选购 (2) 顶部大图) -->
    <view class="bg-white p-4">
      <image
        :src="currentPart.image"
        mode="aspectFit"
        class="w-full h-64 bg-gray-50 rounded-2xl"
      />
    </view>

    <!-- 2. 品名、OE码、价格与销量卡片 -->
    <view class="bg-white p-4 border-t border-gray-100">
      <view class="flex items-center gap-1.5 mb-2">
        <text class="bg-emerald-50 text-[#00b578] text-xs px-2 py-0.5 rounded-full font-bold">原厂正品 100% 联保</text>
        <text class="bg-blue-50 text-[#1677ff] text-xs px-2 py-0.5 rounded-full font-bold">适配东风商用车</text>
      </view>

      <view class="text-base font-black text-gray-900 leading-snug">
        {{ currentPart.name }}
      </view>

      <view class="mt-2 text-xs text-gray-500 font-mono">
        OE 原厂零件号：{{ currentPart.oeCode }}
      </view>

      <!-- 价格与销量 -->
      <view class="mt-3 flex items-baseline justify-between pt-2 border-t border-gray-100">
        <view class="flex items-baseline gap-1">
          <text class="text-sm font-bold text-red-600">指导价 ¥</text>
          <text class="text-3xl font-black text-red-600 font-mono">{{ currentPart.priceRetail }}</text>
        </view>
        <text class="text-xs text-gray-400">已累计订购 {{ currentPart.salesCount }} 套</text>
      </view>
    </view>

    <!-- 3. 规格配置动态切换 (对标 天龙配件选购 (2) 规格切换) -->
    <view class="mt-3 bg-white p-4">
      <view class="text-xs font-bold text-gray-800 mb-3">
        选择总成适配规格
      </view>

      <!-- 排量选择 -->
      <view class="mb-3">
        <view class="text-[22rpx] text-gray-500 mb-1.5">
          排量规格：
        </view>
        <view class="flex items-center gap-2">
          <view
            v-for="d in displacementOptions"
            :key="d"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
            :class="selectedDisplacement === d
              ? 'bg-blue-50 border-[#1677ff] text-[#1677ff]'
              : 'bg-gray-50 border-gray-100 text-gray-700'"
            @click="selectedDisplacement = d"
          >
            {{ d }}
          </view>
        </view>
      </view>

      <!-- 马力选择 -->
      <view>
        <view class="text-[22rpx] text-gray-500 mb-1.5">
          输出马力：
        </view>
        <view class="flex items-center gap-2">
          <view
            v-for="hp in horsepowerOptions"
            :key="hp"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
            :class="selectedHorsepower === hp
              ? 'bg-blue-50 border-[#1677ff] text-[#1677ff]'
              : 'bg-gray-50 border-gray-100 text-gray-700'"
            @click="selectedHorsepower = hp"
          >
            {{ hp }}
          </view>
        </view>
      </view>
    </view>

    <!-- 4. 适配车型确认与履约通道说明 -->
    <view class="mt-3 bg-white p-4 space-y-3">
      <view class="text-xs font-bold text-gray-800 flex items-center justify-between">
        <view class="flex items-center gap-1.5">
          <text class="i-carbon-checkmark-outline text-emerald-600" />
          <text>当前适配绑定车型</text>
        </view>
        <text class="text-[#1677ff] text-xs font-normal">{{ selectedModel.name }}</text>
      </view>

      <!-- 履约通道提示 -->
      <view class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs text-gray-600">
        <view class="font-bold text-gray-800">
          支持履约通道：
        </view>
        <view class="flex items-center gap-1.5">
          <text class="text-blue-600">● 顺丰/德邦专车快运：</text>
          <text>+¥{{ currentPart.shippingFee }} 运费，送达指定仓库或车队</text>
        </view>
        <view class="flex items-center gap-1.5">
          <text class="text-emerald-600">● 特约维修站到店安装：</text>
          <text>+¥{{ currentPart.standardInstallFee }} 标准工时费，持证技师质保包安装</text>
        </view>
      </view>
    </view>

    <!-- 5. 底部固定结算条 -->
    <view class="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-gray-100 shadow-lg flex items-center justify-between">
      <view class="flex items-center gap-4 pl-2">
        <view class="flex flex-col items-center cursor-pointer text-gray-500" @click="callService">
          <text class="i-carbon-headset text-lg" />
          <text class="text-[18rpx] mt-0.5">专家客服</text>
        </view>
        <view class="flex flex-col items-center cursor-pointer text-gray-500" @click="handleAddCart">
          <text class="i-carbon-box text-lg" />
          <text class="text-[18rpx] mt-0.5">加清单</text>
        </view>
      </view>

      <view class="flex items-center gap-2">
        <button
          class="bg-amber-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold active:opacity-90 m-0"
          @click="handleAddCart"
        >
          加入清单
        </button>
        <button
          class="bg-[#1677ff] text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-md active:opacity-90 m-0"
          @click="gotoCheckout"
        >
          立即选配结算
        </button>
      </view>
    </view>
  </view>
</template>
