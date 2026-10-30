<script setup lang="ts">
import type { DemoMaintenanceOrderItem } from '@/types/demo'

interface Props {
  visible: boolean
  order?: DemoMaintenanceOrderItem | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  order: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'verifyOrder', orderNo: string): void
}>()

function close() {
  emit('update:visible', false)
}

function handleVerify() {
  if (props.order?.orderNo) {
    emit('verifyOrder', props.order.orderNo)
  }
}
</script>

<template>
  <view
    v-if="visible"
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm"
    @click="close"
  >
    <view
      class="max-w-lg w-full border-t border-slate-700/80 rounded-t-xl bg-[#1e293b] p-5 text-slate-100 shadow-2xl"
      @click.stop
    >
      <!-- 弹窗标题 -->
      <view class="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <view class="flex items-center gap-2">
          <view class="h-2.5 w-2.5 animate-pulse rounded-sm bg-amber-400" />
          <text class="text-sm text-slate-100 font-bold">特约服务站进站核销凭据</text>
        </view>
        <view
          class="h-7 w-7 flex cursor-pointer items-center justify-center rounded-sm bg-slate-800 text-slate-400 hover:text-white"
          @click="close"
        >
          <text class="i-carbon-close text-base" />
        </view>
      </view>

      <!-- 预约项目与服务站 -->
      <view class="mt-3 border border-slate-700/80 rounded-md bg-[#0f172a] p-3 text-xs space-y-1.5">
        <view class="flex items-center justify-between">
          <text class="text-slate-400 font-mono">预约号: {{ order?.orderNo }}</text>
          <text
            class="rounded-sm px-1.5 py-0.2 text-[20rpx] font-bold"
            :class="order?.isOngoing ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30' : 'bg-slate-700 text-slate-300'"
          >
            {{ order?.statusText }}
          </text>
        </view>
        <view class="text-sm text-slate-100 font-bold">
          {{ order?.packageName }}
        </view>
        <view class="text-[20rpx] text-slate-400">
          服务网点: {{ order?.stationName }}
        </view>
        <view class="text-[20rpx] text-slate-400">
          预约时间: {{ order?.serviceTime }}
        </view>
      </view>

      <!-- 电子核销条形码与核销码 -->
      <view class="my-4 flex flex-col items-center justify-center border border-slate-700/80 rounded-md bg-white p-4 text-slate-900">
        <text class="text-xs text-slate-500 font-bold tracking-wider">进站请向技师出示此凭据</text>
        
        <!-- 拟真条形码线条 -->
        <view class="my-3 h-12 w-4/5 flex items-center justify-between px-2">
          <view
            v-for="i in 36"
            :key="i"
            class="h-full bg-slate-900"
            :style="{
              width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5)}px`,
              opacity: (i % 7 === 0 ? 0.3 : 1),
            }"
          />
        </view>

        <!-- 核销数字串 -->
        <view class="text-lg text-slate-950 font-black tracking-widest font-mono">
          {{ order?.verifyCode || '8820 9134 5091' }}
        </view>
      </view>

      <!-- 底部操作按钮 (触控热区 >= 88rpx / h-11) -->
      <view class="flex gap-3 border-t border-slate-700/80 pt-3">
        <button
          v-if="order?.status !== 'FINISHED'"
          class="h-11 min-h-[88rpx] flex flex-1 items-center justify-center gap-1 rounded-md border-none bg-[#0284c7] text-xs text-white font-bold shadow-sm active:bg-[#0369a1]"
          @click="handleVerify"
        >
          <text class="i-carbon-checkmark-filled text-base" />
          <text>模拟进站核销 / 确认完工</text>
        </button>
        <button
          class="h-11 min-h-[88rpx] flex-1 border border-slate-600 rounded-md bg-slate-800 text-xs text-slate-300 font-medium active:bg-slate-700"
          @click="close"
        >
          关闭返回
        </button>
      </view>
    </view>
  </view>
</template>

