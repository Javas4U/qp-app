<script setup lang="ts">
interface Props {
  visible: boolean
  faultData?: {
    name: string
    recommendedPart: string
    partId?: string
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  faultData: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'buyPart', partId?: string): void
  (e: 'callRescue'): void
}>()

function close() {
  emit('update:visible', false)
}

function handleBuy() {
  emit('buyPart', props.faultData?.partId || 'PART-001')
}

function handleRescue() {
  emit('callRescue')
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
          <view class="h-2.5 w-2.5 animate-pulse rounded-sm bg-red-500" />
          <text class="text-sm text-slate-100 font-bold">排查建议：{{ faultData?.name || '未知故障' }}</text>
        </view>
        <view
          class="h-7 w-7 flex cursor-pointer items-center justify-center rounded-sm bg-slate-800 text-slate-400 hover:text-white"
          @click="close"
        >
          <text class="i-carbon-close text-base" />
        </view>
      </view>

      <!-- 排查内容 -->
      <view class="py-3 text-xs text-slate-300 leading-relaxed space-y-2.5">
        <view class="border border-amber-500/40 rounded-md bg-amber-500/10 p-2.5 text-amber-300 font-medium">
          ⚠️ 应急安全规范：重载卡车请立即减速开启双闪靠边停靠，严禁在发动机高温报警状态下直接旋开水箱盖以防高压蒸汽喷溅烫伤！
        </view>

        <view class="flex items-center gap-1 text-slate-100 font-bold">
          <text class="i-carbon-list-bulleted text-sky-400" />
          <text>标准排查步骤：</text>
        </view>
        <view class="border border-slate-700/70 rounded-md bg-[#0f172a] p-2.5 pl-3 text-slate-300 space-y-1 font-medium">
          <view>1. 熄火等待15分钟，观察水箱膨胀壶冷却液位是否低于下限标线；</view>
          <view>2. 检查电子硅油离合器风扇线束与插头是否松动虚接；</view>
          <view>3. 若下水管与上水管温差过大，判断为节温器主阀门卡死不开，需更换节温器总成。</view>
        </view>

        <!-- 推荐原厂配件卡片 -->
        <view class="mt-3 flex items-center justify-between border border-sky-500/40 rounded-md bg-sky-500/10 p-3">
          <view class="mr-2 min-w-0 flex-1">
            <view class="text-[20rpx] text-sky-400 font-bold">
              ★ 推荐适配东风原厂配件
            </view>
            <view class="mt-0.5 truncate text-xs text-slate-100 font-bold">
              {{ faultData?.recommendedPart || '原厂节温器总成' }}
            </view>
            <view class="text-[20rpx] text-slate-400">
              100%正品联保 · 支持快递或特约站到店安装
            </view>
          </view>
          <button
            class="m-0 h-10 min-h-[80rpx] shrink-0 flex items-center justify-center rounded-md border-none bg-[#0284c7] px-4 text-xs text-white font-bold active:bg-[#0369a1]"
            @click="handleBuy"
          >
            去选购
          </button>
        </view>
      </view>

      <!-- 底部操作按钮 (触控热区 >= 88rpx / h-11) -->
      <view class="mt-2 flex gap-3 border-t border-slate-700/80 pt-3">
        <button
          class="h-11 min-h-[88rpx] flex flex-1 items-center justify-center gap-1 rounded-md border-none bg-red-600 text-xs text-white font-bold shadow-sm active:bg-red-700"
          @click="handleRescue"
        >
          <text class="i-carbon-warning text-sm" />
          <text>一键呼叫现场救援</text>
        </button>
        <button
          class="h-11 min-h-[88rpx] flex-1 border border-slate-600 rounded-md bg-slate-800 text-xs text-slate-300 font-medium active:bg-slate-700"
          @click="close"
        >
          已了解关闭
        </button>
      </view>
    </view>
  </view>
</template>
