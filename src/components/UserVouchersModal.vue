<script setup lang="ts">
import type { DemoVoucherItem } from '@/types/demo'

interface Props {
  visible: boolean
  vouchers: DemoVoucherItem[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  vouchers: () => [],
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'useVoucher', targetUrl: string): void
}>()

function close() {
  emit('update:visible', false)
}

function handleUse(voucher: DemoVoucherItem) {
  close()
  emit('useVoucher', voucher.targetUrl)
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
          <text class="text-sm text-slate-100 font-bold">我的优惠卡券包 ({{ vouchers.length }}张可用)</text>
        </view>
        <view
          class="h-7 w-7 flex cursor-pointer items-center justify-center rounded-sm bg-slate-800 text-slate-400 hover:text-white"
          @click="close"
        >
          <text class="i-carbon-close text-base" />
        </view>
      </view>

      <!-- 卡券列表 -->
      <view class="my-4 max-h-[50vh] overflow-y-auto pr-1 space-y-3">
        <view
          v-if="!vouchers || !vouchers.length"
          class="py-8 text-center text-xs text-slate-500"
        >
          暂无可用优惠卡券
        </view>

        <view
          v-for="voucher in vouchers"
          :key="voucher.id"
          class="flex overflow-hidden border border-slate-700/80 rounded-lg bg-[#0f172a]"
        >
          <!-- 左侧金额与类型 -->
          <view class="w-24 shrink-0 flex flex-col items-center justify-center border-r border-dashed border-slate-700 bg-amber-500/10 p-3 text-amber-400">
            <view class="flex items-baseline">
              <text class="text-xs font-bold">¥</text>
              <text class="text-2xl font-black font-mono">{{ voucher.discountAmount }}</text>
            </view>
            <text class="mt-0.5 text-[18rpx] text-amber-300 font-medium">
              {{ voucher.minSpend > 0 ? `满¥${voucher.minSpend}可用` : '无门槛立减' }}
            </text>
          </view>

          <!-- 右侧卡券详情与操作 -->
          <view class="flex flex-1 flex-col justify-between p-3">
            <view>
              <view class="flex items-center gap-1.5">
                <text class="border border-amber-400/40 rounded-sm bg-amber-400/15 px-1 py-0.2 text-[18rpx] text-amber-300 font-bold">
                  {{ voucher.tag || '通用' }}
                </text>
                <text class="line-clamp-1 text-xs text-slate-100 font-bold">
                  {{ voucher.title }}
                </text>
              </view>
              <view class="mt-1 text-[20rpx] text-slate-400 font-mono">
                有效期至: {{ voucher.validUntil }}
              </view>
            </view>

            <view class="mt-2.5 flex justify-end">
              <button
                class="m-0 h-8 flex items-center justify-center rounded-md border-none bg-amber-500 px-3.5 text-xs text-slate-950 font-black active:bg-amber-600"
                @click="handleUse(voucher)"
              >
                立即去使用
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部关闭按钮 -->
      <view class="border-t border-slate-700/80 pt-3">
        <button
          class="h-11 min-h-[88rpx] w-full border border-slate-600 rounded-md bg-slate-800 text-xs text-slate-300 font-medium active:bg-slate-700"
          @click="close"
        >
          关闭返回
        </button>
      </view>
    </view>
  </view>
</template>

