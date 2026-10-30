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
    navigationBarBackgroundColor: '#0f172a',
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
  <view class="tech-parts-page min-h-screen flex flex-col justify-between bg-[#0f172a] pb-28 text-slate-100">
    <view>
      <!-- 1. 顶部非平台配件无质保醒目警示横幅 (工业合规安全条) -->
      <view class="border-b border-rose-500/40 bg-rose-950/80 p-3.5 text-rose-200">
        <view class="flex items-start gap-2">
          <text class="i-carbon-warning-filled mt-0.5 shrink-0 text-lg text-amber-400" />
          <view class="text-xs leading-relaxed">
            <view class="text-slate-100 font-bold">
              质保合规重要声明
            </view>
            <view class="mt-0.5 text-slate-300">
              非卡车汇官方认证原厂配件不享受全国联保与先行赔付政策！现场换件请严格核验原厂防伪码并勾选入库。
            </view>
          </view>
        </view>
      </view>

      <!-- 2. 工单与求援信息简报 -->
      <view class="mx-4 mt-3 flex items-center justify-between border border-slate-700/80 rounded-lg bg-[#1e293b] p-3.5 text-xs">
        <view>
          <text class="text-slate-400">求援重卡：</text>
          <text class="text-slate-100 font-bold font-mono">{{ currentTicket?.plateNo }} ({{ currentTicket?.driverName }})</text>
        </view>
        <view class="border border-emerald-500/40 rounded-sm bg-emerald-500/20 px-2 py-0.5 text-[20rpx] text-emerald-400 font-bold">
          原厂质保 2 年
        </view>
      </view>

      <!-- 3. 配件清单勾选列表 -->
      <view class="mx-4 mt-3 space-y-3">
        <view class="flex items-center justify-between text-xs text-slate-200 font-bold">
          <text>现场调配原厂配件明细</text>
          <text class="text-[20rpx] text-slate-400">点击勾选核销入单</text>
        </view>

        <view
          v-for="(part, idx) in partsList"
          :key="part.partCode"
          class="cursor-pointer border rounded-lg bg-[#1e293b] p-4 transition-colors"
          :class="part.selected ? 'border-[#0284c7] bg-sky-950/30' : 'border-slate-700/80'"
          @click="togglePart(idx)"
        >
          <view class="flex items-start justify-between">
            <view class="flex items-start gap-2.5">
              <view class="mt-0.5">
                <view
                  class="h-5 w-5 flex items-center justify-center rounded-sm text-xs transition-colors"
                  :class="part.selected ? 'bg-[#0284c7] text-white' : 'border border-slate-600 bg-slate-900'"
                >
                  <text v-if="part.selected" class="i-carbon-checkmark" />
                </view>
              </view>
              <view>
                <view class="text-xs text-slate-100 font-bold leading-snug">
                  {{ part.partName }}
                </view>
                <view class="mt-0.5 text-[20rpx] text-slate-400 font-mono">
                  OE: {{ part.partCode }} · 100%原厂正品
                </view>
              </view>
            </view>
          </view>

          <!-- 价格与工时费分拆 -->
          <view class="mt-3 flex items-center justify-between border-t border-slate-700/80 pt-2.5 text-xs text-slate-300">
            <text class="text-slate-400">配件费 ¥{{ part.price }} + 安装工时 ¥{{ part.laborFee }}</text>
            <text class="text-rose-400 font-bold font-mono">小计 ¥{{ part.price + part.laborFee }}</text>
          </view>
        </view>
      </view>

      <!-- 4. 结算合计清单 -->
      <view class="mx-4 mt-3 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4 text-xs space-y-2">
        <view class="flex items-center justify-between text-slate-400">
          <text>原厂备件费合计</text>
          <text class="text-slate-200 font-bold font-mono">¥{{ totalPartCost }}.00</text>
        </view>
        <view class="flex items-center justify-between text-slate-400">
          <text>现场标准工时费</text>
          <text class="text-slate-200 font-bold font-mono">¥{{ totalLaborCost }}.00</text>
        </view>
        <view class="flex items-center justify-between border-t border-slate-700 pt-2 text-sm text-slate-100 font-bold">
          <text>维修应付总额</text>
          <text class="text-base text-rose-400 font-black font-mono">¥{{ grandTotal }}.00</text>
        </view>
      </view>
    </view>

    <!-- 5. 底部确认按钮 (手套防误触 ≥ 44px) -->
    <view class="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-700 bg-[#1e293b]/95 p-4">
      <button
        class="min-h-[88rpx] w-full flex items-center justify-center gap-2 rounded-lg border-none bg-[#0284c7] text-sm text-white font-bold transition-colors active:bg-[#0369a1]"
        @click="handleNext"
      >
        <text class="i-carbon-camera text-base" />
        <text>确认换件明细，去拍照存证完工</text>
      </button>
    </view>
  </view>
</template>
