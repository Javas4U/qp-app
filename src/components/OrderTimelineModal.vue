<script setup lang="ts">
import type { DemoMallOrderItem } from '@/types/demo'

interface Props {
  visible: boolean
  order?: DemoMallOrderItem | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  order: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirmReceipt', orderNo: string): void
}>()

function close() {
  emit('update:visible', false)
}

function handleConfirm() {
  if (props.order?.orderNo) {
    emit('confirmReceipt', props.order.orderNo)
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
          <view class="h-2.5 w-2.5 animate-pulse rounded-sm bg-sky-400" />
          <text class="text-sm text-slate-100 font-bold">履约与物流进度追踪</text>
        </view>
        <view
          class="h-7 w-7 flex cursor-pointer items-center justify-center rounded-sm bg-slate-800 text-slate-400 hover:text-white"
          @click="close"
        >
          <text class="i-carbon-close text-base" />
        </view>
      </view>

      <!-- 订单简要 -->
      <view class="mt-3 border border-slate-700/80 rounded-md bg-[#0f172a] p-3 text-xs">
        <view class="flex items-center justify-between">
          <text class="text-slate-400 font-mono">订单号: {{ order?.orderNo }}</text>
          <text class="text-sky-400 font-bold">{{ order?.statusText }}</text>
        </view>
        <view class="mt-1 line-clamp-1 text-slate-200 font-bold">
          {{ order?.partName }}
        </view>
        <view class="mt-1 text-[20rpx] text-slate-400">
          {{ order?.channelText }}
        </view>
      </view>

      <!-- 时间轴列表 -->
      <view class="my-4 max-h-[45vh] overflow-y-auto pr-1">
        <view
          v-if="!order?.timeline || !order.timeline.length"
          class="py-6 text-center text-xs text-slate-500"
        >
          暂无物流轨迹更新
        </view>
        <view v-else class="relative border-l-2 border-slate-700/80 pl-4 space-y-4 ml-2">
          <view
            v-for="(node, idx) in order.timeline"
            :key="idx"
            class="relative"
          >
            <!-- 节点圆点 -->
            <view
              class="absolute h-3.5 w-3.5 border-2 rounded-full -left-[23px] top-0.5"
              :class="node.done ? 'bg-sky-500 border-[#1e293b]' : 'bg-slate-700 border-[#1e293b]'"
            />
            <view class="flex items-center justify-between text-xs">
              <text class="font-bold" :class="node.done ? 'text-slate-100' : 'text-slate-400'">
                {{ node.title }}
              </text>
              <text class="text-[20rpx] text-slate-500 font-mono">{{ node.time }}</text>
            </view>
            <view v-if="node.desc" class="mt-0.5 text-[20rpx] text-slate-400">
              {{ node.desc }}
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作按钮 (触控热区 >= 88rpx / h-11) -->
      <view class="flex gap-3 border-t border-slate-700/80 pt-3">
        <button
          v-if="order?.status !== 'COMPLETED'"
          class="h-11 min-h-[88rpx] flex flex-1 items-center justify-center gap-1 rounded-md border-none bg-emerald-600 text-xs text-white font-bold shadow-sm active:bg-emerald-700"
          @click="handleConfirm"
        >
          <text class="i-carbon-checkmark-filled text-base" />
          <text>模拟确认收货 / 验收完成</text>
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

