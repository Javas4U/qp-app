<script setup lang="ts">
import type { DemoMileageRecord } from '@/types/demo'

interface Props {
  visible: boolean
  points: number | string
  records: DemoMileageRecord[]
}

withDefaults(defineProps<Props>(), {
  visible: false,
  points: 1280,
  records: () => [],
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

function close() {
  emit('update:visible', false)
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
          <view class="h-2.5 w-2.5 animate-pulse rounded-sm bg-emerald-400" />
          <text class="text-sm text-slate-100 font-bold">会员里程积分账本</text>
        </view>
        <view
          class="h-7 w-7 flex cursor-pointer items-center justify-center rounded-sm bg-slate-800 text-slate-400 hover:text-white"
          @click="close"
        >
          <text class="i-carbon-close text-base" />
        </view>
      </view>

      <!-- 当前总可用积分卡片 -->
      <view class="mt-3 flex items-center justify-between border border-emerald-500/40 rounded-lg bg-emerald-500/10 p-4">
        <view>
          <view class="text-[20rpx] text-emerald-400 font-bold">
            当前可用会员里程分
          </view>
          <view class="mt-0.5 text-2xl text-emerald-400 font-black font-mono">
            {{ points }}
          </view>
          <view class="mt-0.5 text-[18rpx] text-slate-400">
            可抵扣配件直购款与特约站维保工时费 (100分 = ¥10)
          </view>
        </view>
        <view class="h-10 w-10 flex items-center justify-center border border-emerald-500/40 rounded-md bg-emerald-500/20 text-emerald-400">
          <text class="i-carbon-badge text-xl" />
        </view>
      </view>

      <!-- 积分明细流水 -->
      <view class="my-3 max-h-[45vh] overflow-y-auto pr-1">
        <view class="mb-2 text-xs text-slate-400 font-bold">
          近期积分收支明细
        </view>

        <view
          v-if="!records || !records.length"
          class="py-6 text-center text-xs text-slate-500"
        >
          暂无里程积分明细
        </view>

        <view class="space-y-2.5">
          <view
            v-for="rec in records"
            :key="rec.id"
            class="flex items-center justify-between border border-slate-700/70 rounded-md bg-[#0f172a] p-3 text-xs"
          >
            <view class="mr-2 min-w-0 flex-1">
              <view class="truncate text-slate-200 font-bold">
                {{ rec.title }}
              </view>
              <view class="mt-0.5 text-[18rpx] text-slate-500 font-mono">
                {{ rec.time }}
              </view>
            </view>
            <view
              class="shrink-0 text-sm font-extrabold font-mono"
              :class="rec.type === 'PLUS' ? 'text-emerald-400' : 'text-rose-400'"
            >
              {{ rec.type === 'PLUS' ? `+${rec.points}` : `-${rec.points}` }}
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

