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
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTextStyle: 'white',
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
  <view class="checkout-page min-h-screen bg-[#f5f7fa] pb-24">
    <!-- 1. 履约方式双通道切换 Tab (对标 天龙配件选购页设计 (3)) -->
    <view class="bg-[#1677ff] text-white p-4 rounded-b-3xl">
      <view class="bg-black/20 p-1 rounded-2xl flex items-center">
        <view
          class="flex-1 py-2 rounded-xl text-center text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
          :class="fulfillmentType === 'EXPRESS' ? 'bg-white text-[#1677ff] shadow' : 'text-white/80'"
          @click="handleSwitchFulfillment('EXPRESS')"
        >
          <text class="i-carbon-delivery-parcel text-sm" />
          <text>快递直达车队 (运费+¥30)</text>
        </view>

        <view
          class="flex-1 py-2 rounded-xl text-center text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
          :class="fulfillmentType === 'STATION_INSTALL' ? 'bg-white text-[#1677ff] shadow' : 'text-white/80'"
          @click="handleSwitchFulfillment('STATION_INSTALL')"
        >
          <text class="i-carbon-tools text-sm" />
          <text>到店包安装 (工时+¥1200)</text>
        </view>
      </view>
    </view>

    <!-- 2. 履约信息卡片 -->
    <view class="mx-4 -mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <!-- 快递地址 -->
      <view v-if="fulfillmentType === 'EXPRESS'" class="space-y-1">
        <view class="flex items-center justify-between text-xs font-bold text-gray-800">
          <view class="flex items-center gap-1">
            <text class="i-carbon-location-filled text-red-500" />
            <text>物流收货地址</text>
          </view>
          <text class="text-xs text-[#1677ff] font-normal cursor-pointer">修改地址</text>
        </view>
        <view class="text-xs text-gray-800 font-bold pt-1">
          {{ expressReceiver }}
        </view>
        <view class="text-[22rpx] text-gray-500 leading-relaxed">
          {{ expressAddress }}
        </view>
        <view class="mt-2 pt-2 border-t border-gray-100 text-[20rpx] text-blue-600 flex items-center gap-1">
          <text class="i-carbon-delivery text-xs" />
          <text>德邦/顺丰大件物流特快专车承运，原厂加固防震木箱包装</text>
        </view>
      </view>

      <!-- 服务站选择 -->
      <view v-else class="space-y-2">
        <view class="flex items-center justify-between text-xs font-bold text-gray-800">
          <view class="flex items-center gap-1">
            <text class="i-carbon-store text-emerald-600" />
            <text>指定安装服务站（认证合作网点）</text>
          </view>
          <text class="text-[20rpx] text-gray-400">选择最近网点</text>
        </view>

        <view class="space-y-2 pt-1">
          <view
            v-for="st in stations"
            :key="st.id"
            class="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all"
            :class="selectedStation.id === st.id ? 'border-[#1677ff] bg-blue-50/30 ring-1 ring-blue-200' : 'border-gray-100 bg-gray-50/50'"
            @click="selectStation(st)"
          >
            <view class="overflow-hidden">
              <view class="text-xs font-bold text-gray-900 truncate">
                {{ st.name }}
              </view>
              <view class="text-[20rpx] text-gray-500 mt-0.5 truncate">
                {{ st.address }}
              </view>
              <view class="flex items-center gap-2 mt-1 text-[20rpx]">
                <text class="text-amber-500 font-bold">★ {{ st.rating }}</text>
                <text class="text-blue-600">距您 {{ st.distanceKm }}km</text>
                <text class="text-gray-400 font-mono">{{ st.phone }}</text>
              </view>
            </view>
            <view class="shrink-0 ml-2">
              <view
                v-if="selectedStation.id === st.id"
                class="w-5 h-5 rounded-full bg-[#1677ff] text-white flex items-center justify-center text-xs"
              >
                <text class="i-carbon-checkmark" />
              </view>
              <view v-else class="w-5 h-5 rounded-full border border-gray-300" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 配件商品卡片 (对标 天龙配件选购 (3)) -->
    <view class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <view class="flex gap-3">
        <image
          :src="currentPart.image"
          mode="aspectFill"
          class="w-20 h-20 rounded-xl bg-gray-100 shrink-0"
        />
        <view class="flex-1 flex flex-col justify-between text-xs">
          <view>
            <view class="font-bold text-gray-900 leading-snug">
              {{ currentPart.name }}
            </view>
            <view class="text-[20rpx] text-gray-500 mt-1 font-mono">
              选配：{{ selectedDisplacement }} / {{ selectedHorsepower }} · 国六B
            </view>
            <view class="text-[18rpx] text-emerald-600 mt-0.5">
              原厂正品保证 · 享 2 年全国联保
            </view>
          </view>
          <view class="flex items-baseline justify-between mt-2">
            <text class="text-gray-500 text-[20rpx]">单价</text>
            <text class="text-base font-bold text-red-600 font-mono">¥{{ partPrice }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 4. 动态拆单计价清单 -->
    <view class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5 text-xs text-gray-700">
      <view class="font-bold text-gray-900 pb-2 border-b border-gray-100">
        费用明细拆单
      </view>

      <view class="flex items-center justify-between">
        <text class="text-gray-500">原厂配件商品售价</text>
        <text class="font-bold text-gray-800">¥{{ partPrice.toLocaleString() }}.00</text>
      </view>

      <view v-if="fulfillmentType === 'EXPRESS'" class="flex items-center justify-between">
        <text class="text-gray-500">大件物流快运运费</text>
        <text class="font-bold text-blue-600">+¥{{ shippingFee }}.00</text>
      </view>

      <view v-else class="flex items-center justify-between">
        <text class="text-gray-500">特约服务站专业安装工时费</text>
        <text class="font-bold text-emerald-600">+¥{{ laborFee.toLocaleString() }}.00</text>
      </view>

      <view class="flex items-center justify-between pt-2 border-t border-gray-100 text-sm">
        <text class="font-bold text-gray-900">实付结算金额</text>
        <text class="text-lg font-black text-red-600 font-mono">¥{{ grandTotal.toLocaleString() }}.00</text>
      </view>
    </view>

    <!-- 5. 底部固定结算提交栏 -->
    <view class="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-gray-100 shadow-lg flex items-center justify-between">
      <view class="pl-3">
        <text class="text-xs text-gray-500">实付总额：</text>
        <text class="text-xl font-black text-red-600 font-mono">¥{{ grandTotal.toLocaleString() }}</text>
      </view>

      <button
        class="bg-red-500 text-white text-xs px-6 py-2.5 rounded-xl font-bold shadow-md active:opacity-90 m-0"
        @click="submitOrder"
      >
        立即支付提交订单
      </button>
    </view>
  </view>
</template>
