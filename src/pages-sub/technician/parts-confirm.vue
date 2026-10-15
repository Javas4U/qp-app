<script lang="ts" setup>
import type { ReplacedPartItem } from '@/types/rescue'
import { useRescueSessionStore } from '@/store/rescueSession'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'TechnicianPartsConfirmPage',
})

definePage({
  style: {
    navigationBarTitleText: '技师工作台 - 故障换件确认',
    navigationBarBackgroundColor: '#00b578',
    navigationBarTextStyle: 'white',
  },
})

const rescueStore = useRescueSessionStore()
const { currentTicket } = storeToRefs(rescueStore)

// 备选更换配件清单
const partsList = ref<(ReplacedPartItem & { selected: boolean })[]>([
  {
    partName: '原厂节温器总成 (东风康明斯ISZ13)',
    partCode: 'OE-5345091',
    isOriginal: true,
    price: 580,
    laborFee: 220,
    selected: true,
  },
  {
    partName: '原厂重负荷防冻冷却液 10kg',
    partCode: 'OE-8821903',
    isOriginal: true,
    price: 200,
    laborFee: 0,
    selected: true,
  },
  {
    partName: '东风原厂高压油管减震卡扣套件',
    partCode: 'OE-1102944',
    isOriginal: true,
    price: 80,
    laborFee: 20,
    selected: false,
  },
])

function togglePart(index: number) {
  partsList.value[index].selected = !partsList.value[index].selected
}

// 动态总计
const totalPartCost = computed(() => {
  return partsList.value
    .filter(p => p.selected)
    .reduce((sum, p) => sum + p.price, 0)
})

const totalLaborCost = computed(() => {
  return partsList.value
    .filter(p => p.selected)
    .reduce((sum, p) => sum + p.laborFee, 0)
})

const grandTotal = computed(() => totalPartCost.value + totalLaborCost.value)

function handleNext() {
  const selectedItems = partsList.value
    .filter(p => p.selected)
    .map(({ selected, ...rest }) => rest)

  rescueStore.confirmParts(selectedItems)

  uni.navigateTo({
    url: '/pages-sub/technician/complete',
  })
}
</script>

<template>
  <view class="tech-parts-page min-h-screen bg-[#f5f7fa] pb-24 flex flex-col justify-between">
    <view>
      <!-- 1. 顶部非平台配件无质保醒目警示横幅 (对标 救援8.jpg) -->
      <view class="bg-red-500 text-white p-4 shadow-sm">
        <view class="flex items-start gap-2">
          <text class="i-carbon-warning-filled text-xl shrink-0 mt-0.5 text-amber-300" />
          <view class="text-xs leading-relaxed">
            <view class="font-bold text-sm">
              质保合规重要声明
            </view>
            <view class="mt-0.5 opacity-90">
              非卡车汇官方认证原厂配件不享受全国联保与先行赔付政策！现场换件请严格核验原厂防伪码并勾选入库。
            </view>
          </view>
        </view>
      </view>

      <!-- 2. 工单与求援信息简报 -->
      <view class="mx-4 mt-3 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center justify-between text-xs">
        <view>
          <text class="text-gray-400">求援重卡：</text>
          <text class="font-bold text-gray-900">{{ currentTicket?.plateNo }} ({{ currentTicket?.driverName }})</text>
        </view>
        <view class="bg-emerald-50 text-emerald-700 text-[20rpx] px-2 py-0.5 rounded font-bold">
          原厂质保 2 年
        </view>
      </view>

      <!-- 3. 配件清单勾选列表 (对标 救援8.jpg) -->
      <view class="mx-4 mt-3 space-y-3">
        <view class="text-xs font-bold text-gray-800 flex items-center justify-between">
          <text>现场调配原厂配件明细</text>
          <text class="text-[20rpx] text-gray-400">点击勾选核销</text>
        </view>

        <view
          v-for="(part, idx) in partsList"
          :key="part.partCode"
          class="bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer"
          :class="part.selected ? 'border-[#00b578] ring-2 ring-emerald-100 bg-emerald-50/15' : 'border-gray-100'"
          @click="togglePart(idx)"
        >
          <view class="flex items-start justify-between">
            <view class="flex items-start gap-2.5">
              <view class="mt-0.5">
                <view
                  class="w-5 h-5 rounded-md flex items-center justify-center text-xs"
                  :class="part.selected ? 'bg-[#00b578] text-white' : 'border border-gray-300 bg-white'"
                >
                  <text v-if="part.selected" class="i-carbon-checkmark" />
                </view>
              </view>
              <div>
                <view class="text-xs font-bold text-gray-900 leading-snug">
                  {{ part.partName }}
                </view>
                <view class="text-[20rpx] text-gray-400 font-mono mt-0.5">
                  OE: {{ part.partCode }} · 100%正品
                </view>
              </div>
            </view>
          </view>

          <!-- 价格与工时费分拆 -->
          <view class="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between text-xs text-gray-600">
            <text>配件费 ¥{{ part.price }} + 安装工时 ¥{{ part.laborFee }}</text>
            <text class="font-bold text-red-600 font-mono">小计 ¥{{ part.price + part.laborFee }}</text>
          </view>
        </view>
      </view>

      <!-- 4. 结算合计清单 -->
      <view class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-xs space-y-2">
        <view class="flex items-center justify-between text-gray-500">
          <text>原厂备件费合计</text>
          <text class="font-bold text-gray-800">¥{{ totalPartCost }}.00</text>
        </view>
        <view class="flex items-center justify-between text-gray-500">
          <text>现场标准工时费</text>
          <text class="font-bold text-gray-800">¥{{ totalLaborCost }}.00</text>
        </view>
        <view class="flex items-center justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
          <text>维修应付总额</text>
          <text class="text-base text-red-600 font-black font-mono">¥{{ grandTotal }}.00</text>
        </view>
      </view>
    </view>

    <!-- 5. 底部确认按钮 -->
    <view class="p-4 bg-white border-t border-gray-100 shadow-lg">
      <button
        class="w-full bg-[#00b578] text-white py-3 rounded-xl font-bold text-sm shadow-md active:opacity-90 flex items-center justify-center gap-2 border-none"
        @click="handleNext"
      >
        <text class="i-carbon-camera text-base" />
        <text>确认换件明细，去拍照存证完工</text>
      </button>
    </view>
  </view>
</template>
