<script lang="ts" setup>
import type { DemoMallOrderItem } from '@/types/demo'
import type { FulfillmentType, ServiceStation } from '@/types/mall'
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'MallCheckoutPage',
})

definePage({
  style: {
    navigationBarTitleText: '配件履约结算与拆单',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
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
} = storeToRefs(mallStore)

// 快递地址
const expressAddress = ref('湖北省孝感市孝南区高新技术物流园A区3号库')
const expressReceiver = ref('李强国 (老李) · 138****8888')

// 动态计算实配单价
const actualPartPrice = computed(() => {
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

const shippingFee = computed(() => (fulfillmentType.value === 'EXPRESS' ? (currentPart.value?.shippingFee || 30) : 0))
const laborFee = computed(() => (fulfillmentType.value === 'STATION_INSTALL' ? (currentPart.value?.standardInstallFee || 1200) : 0))

const grandTotal = computed(() => {
  return actualPartPrice.value + shippingFee.value + laborFee.value
})

function selectStation(station: ServiceStation) {
  selectedStation.value = station
}

function handleSwitchFulfillment(type: FulfillmentType) {
  mallStore.setFulfillmentType(type)
}

function submitOrder() {
  uni.showModal({
    title: '确认提交订单',
    content: `支付金额：¥${grandTotal.value.toLocaleString()} 元（${fulfillmentType.value === 'EXPRESS' ? '顺丰特快直发车队' : '特约维保站包安装拆单'}）`,
    confirmColor: '#0284c7',
    confirmText: '立即支付',
    success: (res) => {
      if (res.confirm) {
        const orderNo = `OD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
        const newOrder: DemoMallOrderItem = {
          orderNo,
          partName: currentPart.value.name,
          spec: `规格：${selectedDisplacement.value} / ${selectedHorsepower.value} · 原厂国六B`,
          channelText: fulfillmentType.value === 'EXPRESS'
            ? '履约通道：顺丰特快直发车队'
            : `履约通道：到店特约站专业安装 (含¥${laborFee.value}工时费)`,
          fulfillmentType: fulfillmentType.value === 'STATION_INSTALL' ? 'STATION_INSTALL' : 'EXPRESS',
          stationName: fulfillmentType.value === 'EXPRESS' ? '湖北省孝感市配件中心仓' : selectedStation.value.name,
          quantity: 1,
          totalPrice: grandTotal.value.toLocaleString(),
          status: 'PENDING_DELIVERY',
          statusText: fulfillmentType.value === 'EXPRESS' ? '备件调拨中 / 待收货' : '待到店安装',
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-400/30',
          image: currentPart.value.image,
          createTime: new Date().toLocaleString(),
          timeline: [
            {
              title: '订单支付成功，生成工单凭据',
              time: new Date().toLocaleTimeString().slice(0, 5),
              done: true,
              desc: fulfillmentType.value === 'EXPRESS'
                ? '已通知中心仓顺丰打包出库'
                : `已同步预约服务站: ${selectedStation.value.name}`,
            },
            {
              title: fulfillmentType.value === 'EXPRESS' ? '顺丰干线特快调拨' : '备件发往指定服务站',
              time: '预计明日',
              done: false,
            },
          ],
        }

        mallStore.addMallOrder(newOrder)
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
  <view class="checkout-page min-h-screen bg-[#0f172a] pb-28 text-slate-100">
    <!-- 1. 履约方式双通道切换 Tab (深碳工业机能条) -->
    <view class="border-b border-slate-700/80 bg-[#1e293b] p-4">
      <view class="flex items-center gap-1.5 border border-slate-800 rounded-lg bg-[#090d16] p-1">
        <view
          class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border rounded-md py-2.5 text-center text-xs font-bold transition-all"
          :class="fulfillmentType === 'EXPRESS'
            ? 'bg-[#0284c7] text-white border-sky-400/40 font-bold'
            : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'"
          @click="handleSwitchFulfillment('EXPRESS')"
        >
          <text class="i-carbon-delivery-parcel text-sm" />
          <text>快递直达车队 (+¥30)</text>
        </view>

        <view
          class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border rounded-md py-2.5 text-center text-xs font-bold transition-all"
          :class="fulfillmentType === 'STATION_INSTALL'
            ? 'bg-[#0284c7] text-white border-sky-400/40 font-bold'
            : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'"
          @click="handleSwitchFulfillment('STATION_INSTALL')"
        >
          <text class="i-carbon-tools text-sm" />
          <text>到店包安装 (+¥1200)</text>
        </view>
      </view>
    </view>

    <!-- 2. 履约信息卡片 -->
    <view class="mx-4 mt-3 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4">
      <!-- 快递地址 -->
      <view v-if="fulfillmentType === 'EXPRESS'" class="space-y-2">
        <view class="flex items-center justify-between text-xs text-slate-200 font-bold">
          <view class="flex items-center gap-1.5">
            <text class="i-carbon-location-filled text-sm text-rose-500" />
            <text>物流收货地址 (直抵车队泊位)</text>
          </view>
          <text class="cursor-pointer text-xs text-[#38bdf8] font-normal hover:underline">修改地址</text>
        </view>
        <view class="pt-1 text-sm text-slate-100 font-bold">
          {{ expressReceiver }}
        </view>
        <view class="text-xs text-slate-400 leading-relaxed font-mono">
          {{ expressAddress }}
        </view>
        <view class="mt-2 flex items-center gap-1.5 border-t border-slate-700/80 pt-2.5 text-[20rpx] text-[#38bdf8]">
          <text class="i-carbon-delivery shrink-0 text-xs" />
          <text>德邦/顺丰大件重载专线承运 · 原厂加固防震木箱总成包装</text>
        </view>
      </view>

      <!-- 服务站选择 -->
      <view v-else class="space-y-2.5">
        <view class="flex items-center justify-between text-xs text-slate-200 font-bold">
          <view class="flex items-center gap-1.5">
            <text class="i-carbon-store text-sm text-emerald-400" />
            <text>指定安装服务站 (认证合作网点)</text>
          </view>
          <text class="text-[20rpx] text-slate-400 font-mono">选择最近网点</text>
        </view>

        <view class="pt-1 space-y-2">
          <view
            v-for="st in stations"
            :key="st.id"
            class="flex cursor-pointer items-center justify-between border rounded-md p-3 transition-all"
            :class="selectedStation.id === st.id
              ? 'border-[#0284c7] bg-sky-950/20'
              : 'border-slate-700/80 bg-[#090d16] hover:border-slate-600'"
            @click="selectStation(st)"
          >
            <view class="overflow-hidden">
              <view class="truncate text-xs text-slate-100 font-bold">
                {{ st.name }}
              </view>
              <view class="mt-1 truncate text-[20rpx] text-slate-400">
                {{ st.address }}
              </view>
              <view class="mt-1.5 flex items-center gap-2 text-[20rpx]">
                <text class="text-amber-400 font-bold">★ {{ st.rating }}</text>
                <text class="text-[#38bdf8] font-mono">距您 {{ st.distanceKm }}km</text>
                <text class="text-slate-400 font-mono">{{ st.phone }}</text>
              </view>
            </view>
            <view class="ml-2 shrink-0">
              <view
                v-if="selectedStation.id === st.id"
                class="h-5 w-5 flex items-center justify-center border border-sky-400/50 rounded-sm bg-[#0284c7] text-xs text-white"
              >
                <text class="i-carbon-checkmark font-bold" />
              </view>
              <view v-else class="h-5 w-5 border border-slate-600 rounded-sm bg-[#090d16]" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 配件商品卡片 -->
    <view class="mx-4 mt-3 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4">
      <view class="flex gap-3">
        <image
          :src="currentPart.image"
          mode="aspectFill"
          class="h-20 w-20 shrink-0 border border-slate-700/80 rounded-md bg-[#090d16] object-cover"
        />
        <view class="flex flex-1 flex-col justify-between text-xs">
          <view>
            <view class="text-slate-100 font-bold leading-snug">
              {{ currentPart.name }}
            </view>
            <view class="mt-1 text-[20rpx] text-slate-400 font-mono">
              选配：{{ selectedDisplacement }} / {{ selectedHorsepower }} · 国六B
            </view>
            <view class="mt-1 flex items-center gap-1 text-[18rpx] text-emerald-400">
              <text class="i-carbon-badge text-xs" />
              <text>原厂正品备件 · 享 2 年全国干线联保</text>
            </view>
          </view>
          <view class="mt-2 flex items-baseline justify-between border-t border-slate-700/60 pt-2">
            <text class="text-[20rpx] text-slate-400">配件官方指导价</text>
            <text class="text-base text-amber-400 font-bold font-mono">¥{{ actualPartPrice.toLocaleString() }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 4. 动态拆单计价清单 -->
    <view class="mx-4 mt-3 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4 text-xs text-slate-300 space-y-2.5">
      <view class="flex items-center justify-between border-b border-slate-700/80 pb-2 text-slate-100 font-bold">
        <text class="flex items-center gap-1.5">
          <text class="h-3 w-1.5 rounded-sm bg-[#0284c7]" />
          <text>履约费用明细拆单</text>
        </text>
        <text class="text-[20rpx] text-slate-400 font-mono">明细公示</text>
      </view>

      <view class="flex items-center justify-between">
        <text class="text-slate-400">原厂配件商品售价</text>
        <text class="text-slate-100 font-bold font-mono">¥{{ actualPartPrice.toLocaleString() }}.00</text>
      </view>

      <view v-if="fulfillmentType === 'EXPRESS'" class="flex items-center justify-between">
        <text class="text-slate-400">大件物流快运运费</text>
        <text class="text-[#38bdf8] font-bold font-mono">+¥{{ shippingFee }}.00</text>
      </view>

      <view v-else class="flex items-center justify-between">
        <text class="text-slate-400">特约服务站专业安装工时费</text>
        <text class="text-emerald-400 font-bold font-mono">+¥{{ laborFee.toLocaleString() }}.00</text>
      </view>

      <view class="flex items-center justify-between border-t border-slate-700/80 pt-2.5 text-sm">
        <text class="text-slate-100 font-bold">实付结算金额</text>
        <text class="text-lg text-rose-500 font-black font-mono">¥{{ grandTotal.toLocaleString() }}.00</text>
      </view>
    </view>

    <!-- 5. 底部固定结算提交栏 (手套防误触，触控热区 >= 88rpx) -->
    <view class="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-slate-700/80 bg-[#1e293b] px-4 py-3">
      <view class="pl-1">
        <text class="block text-xs text-slate-400 font-mono">实付总额：</text>
        <text class="text-xl text-rose-500 font-black font-mono">¥{{ grandTotal.toLocaleString() }}</text>
      </view>

      <button
        class="h-11 min-h-[88rpx] flex shrink-0 items-center justify-center border border-sky-400/40 rounded-lg bg-[#0284c7] px-6 text-xs text-white font-bold active:translate-y-0.5 active:bg-[#0369a1]"
        @click="submitOrder"
      >
        <text class="i-carbon-wallet mr-1 text-sm" />
        立即支付提交订单
      </button>
    </view>
  </view>
</template>
