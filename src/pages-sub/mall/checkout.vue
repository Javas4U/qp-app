<script lang="ts" setup>
import type { FulfillmentType, ServiceStation } from '@/types/mall'
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineOptions({
  name: 'MallCheckoutPage',
})

definePage({
  style: {
    navigationBarTitleText: '配件履约结算与拆单',
    navigationBarBackgroundColor: '#f8fafc',
    navigationBarTextStyle: 'black',
  },
})

const mallStore = useMallSessionStore()
const {
  currentPart,
  fulfillmentType,
  stations,
  selectedStation,
  selectedDisplacement,
  selectedHorsepower,
  partPrice,
  shippingFee,
  laborFee,
  grandTotal,
} = storeToRefs(mallStore)

// 快递地址
const expressAddress = ref('湖北省孝感市孝南区高新技术物流园A区3号库')
const expressReceiver = ref('李强国 (老李) · 138****8888')

function selectStation(station: ServiceStation) {
  selectedStation.value = station
}

function handleSwitchFulfillment(type: FulfillmentType) {
  mallStore.setFulfillmentType(type)
}

function submitOrder() {
  uni.showModal({
    title: '确认提交订单',
    content: `支付金额：¥${grandTotal.value.toLocaleString()} 元（${fulfillmentType.value === 'EXPRESS' ? '快递直达模式' : '到店安装工时拆单模式'}）`,
    confirmText: '立即支付',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '订单支付成功！', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/order/index' })
        }, 600)
      }
    },
  })
}
</script>

<template>
  <view class="checkout-page min-h-screen bg-[#f8fafc] text-slate-800 pb-28">
    <!-- 1. 履约方式双通道切换 Tab (工业机能分段器) -->
    <view class="bg-white border-b border-slate-200/90 p-4 shadow-sm">
      <view class="bg-slate-100 border border-slate-200 p-1 rounded-lg flex items-center gap-1.5">
        <view
          class="flex-1 py-2.5 rounded-md text-center text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
          :class="fulfillmentType === 'EXPRESS'
            ? 'bg-[#0284c7] text-white shadow-sm font-bold'
            : 'bg-transparent text-slate-600 hover:text-slate-900'"
          @click="handleSwitchFulfillment('EXPRESS')"
        >
          <text class="i-carbon-delivery-parcel text-sm" />
          <text>快递直达车队 (+¥30)</text>
        </view>

        <view
          class="flex-1 py-2.5 rounded-md text-center text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
          :class="fulfillmentType === 'STATION_INSTALL'
            ? 'bg-[#0284c7] text-white shadow-sm font-bold'
            : 'bg-transparent text-slate-600 hover:text-slate-900'"
          @click="handleSwitchFulfillment('STATION_INSTALL')"
        >
          <text class="i-carbon-tools text-sm" />
          <text>到店包安装 (+¥1200)</text>
        </view>
      </view>
    </view>

    <!-- 2. 履约信息卡片 -->
    <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm">
      <!-- 快递地址 -->
      <view v-if="fulfillmentType === 'EXPRESS'" class="space-y-2">
        <view class="flex items-center justify-between text-xs font-bold text-slate-800">
          <view class="flex items-center gap-1.5">
            <text class="i-carbon-location-filled text-rose-500 text-sm" />
            <text>物流收货地址 (直抵车队泊位)</text>
          </view>
          <text class="text-xs text-sky-600 font-semibold cursor-pointer hover:underline">修改地址</text>
        </view>
        <view class="text-sm text-slate-900 font-bold pt-1">
          {{ expressReceiver }}
        </view>
        <view class="text-xs text-slate-600 leading-relaxed font-mono">
          {{ expressAddress }}
        </view>
        <view class="mt-2 pt-2.5 border-t border-slate-100 text-[20rpx] text-sky-700 bg-sky-50/70 p-2 rounded flex items-center gap-1.5">
          <text class="i-carbon-delivery text-xs shrink-0" />
          <text>德邦/顺丰大件重载专线承运 · 原厂加固防震木箱总成包装</text>
        </view>
      </view>

      <!-- 服务站选择 -->
      <view v-else class="space-y-2.5">
        <view class="flex items-center justify-between text-xs font-bold text-slate-800">
          <view class="flex items-center gap-1.5">
            <text class="i-carbon-store text-emerald-600 text-sm" />
            <text>指定安装服务站 (认证合作网点)</text>
          </view>
          <text class="text-[20rpx] text-slate-500 font-mono">选择最近网点</text>
        </view>

        <view class="space-y-2 pt-1">
          <view
            v-for="st in stations"
            :key="st.id"
            class="p-3 rounded-md border flex items-center justify-between cursor-pointer transition-all"
            :class="selectedStation.id === st.id
              ? 'border-[#0284c7] bg-sky-50/60 ring-1 ring-[#0284c7]/30'
              : 'border-slate-200/90 bg-slate-50/50 hover:border-slate-300'"
            @click="selectStation(st)"
          >
            <view class="overflow-hidden">
              <view class="text-xs font-bold text-slate-900 truncate">
                {{ st.name }}
              </view>
              <view class="text-[20rpx] text-slate-500 mt-1 truncate">
                {{ st.address }}
              </view>
              <view class="flex items-center gap-2 mt-1.5 text-[20rpx]">
                <text class="text-amber-600 font-bold">★ {{ st.rating }}</text>
                <text class="text-sky-600 font-mono font-semibold">距您 {{ st.distanceKm }}km</text>
                <text class="text-slate-500 font-mono">{{ st.phone }}</text>
              </view>
            </view>
            <view class="shrink-0 ml-2">
              <view
                v-if="selectedStation.id === st.id"
                class="w-5 h-5 rounded-sm bg-[#0284c7] text-white flex items-center justify-center text-xs"
              >
                <text class="i-carbon-checkmark font-bold" />
              </view>
              <view v-else class="w-5 h-5 rounded-sm border border-slate-300 bg-white" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 配件商品卡片 -->
    <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm">
      <view class="flex gap-3">
        <image
          :src="currentPart.image"
          mode="aspectFill"
          class="w-20 h-20 rounded-md bg-slate-50 border border-slate-200 shrink-0 object-cover"
        />
        <view class="flex-1 flex flex-col justify-between text-xs">
          <view>
            <view class="font-bold text-slate-900 leading-snug">
              {{ currentPart.name }}
            </view>
            <view class="text-[20rpx] text-slate-500 mt-1 font-mono">
              选配：{{ selectedDisplacement }} / {{ selectedHorsepower }} · 国六B
            </view>
            <view class="text-[18rpx] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <text class="i-carbon-badge text-xs" />
              <text>原厂正品备件 · 享 2 年全国干线联保</text>
            </view>
          </view>
          <view class="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100">
            <text class="text-slate-500 text-[20rpx]">配件官方指导价</text>
            <text class="text-base font-bold text-amber-600 font-mono">¥{{ partPrice }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 4. 动态拆单计价清单 -->
    <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm space-y-2.5 text-xs text-slate-700">
      <view class="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
        <text class="flex items-center gap-1.5">
          <text class="w-1.5 h-3 bg-[#0284c7] rounded-sm" />
          <text>履约费用明细拆单</text>
        </text>
        <text class="text-[20rpx] text-slate-500 font-mono">明细公示</text>
      </view>

      <view class="flex items-center justify-between">
        <text class="text-slate-500">原厂配件商品售价</text>
        <text class="font-bold text-slate-900 font-mono">¥{{ partPrice.toLocaleString() }}.00</text>
      </view>

      <view v-if="fulfillmentType === 'EXPRESS'" class="flex items-center justify-between">
        <text class="text-slate-500">大件物流快运运费</text>
        <text class="font-bold text-sky-600 font-mono">+¥{{ shippingFee }}.00</text>
      </view>

      <view v-else class="flex items-center justify-between">
        <text class="text-slate-500">特约服务站专业安装工时费</text>
        <text class="font-bold text-emerald-600 font-mono">+¥{{ laborFee.toLocaleString() }}.00</text>
      </view>

      <view class="flex items-center justify-between pt-2.5 border-t border-slate-200 text-sm">
        <text class="font-bold text-slate-900">实付结算金额</text>
        <text class="text-lg font-black text-rose-600 font-mono">¥{{ grandTotal.toLocaleString() }}.00</text>
      </view>
    </view>

    <!-- 5. 底部固定结算提交栏 (手套防误触) -->
    <view class="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between z-30 shadow-lg">
      <view class="pl-1">
        <text class="text-xs text-slate-500 block font-mono">实付总额：</text>
        <text class="text-xl font-black text-rose-600 font-mono">¥{{ grandTotal.toLocaleString() }}</text>
      </view>

      <button
        class="min-h-[88rpx] h-[88rpx] bg-[#0284c7] active:bg-[#0369a1] text-white text-xs px-6 rounded-lg font-bold border-none shadow-sm shadow-sky-600/20 active:translate-y-0.5 flex items-center justify-center m-0 shrink-0"
        @click="submitOrder"
      >
        <text class="i-carbon-wallet mr-1 text-sm" />
        立即支付提交订单
      </button>
    </view>
  </view>
</template>
