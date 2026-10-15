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
  emit('buyPart', props.faultData?.partId)
}

function handleRescue() {
  emit('callRescue')
}
</script>

<template>
  <view
    v-if="visible"
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
    @click="close"
  >
    <view
      class="w-full max-w-lg bg-white rounded-t-3xl p-5 shadow-2xl"
      @click.stop
    >
      <!-- 弹窗标题 -->
      <view class="flex items-center justify-between pb-3 border-b border-gray-100">
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <text class="text-sm font-bold text-gray-900">故障排查建议：{{ faultData?.name || '未知故障' }}</text>
        </view>
        <text
          class="i-carbon-close text-gray-400 text-lg cursor-pointer"
          @click="close"
        />
      </view>

      <!-- 排查内容 -->
      <view class="py-3 text-xs text-gray-600 leading-relaxed space-y-2.5">
        <view class="bg-amber-50 text-amber-800 p-2.5 rounded-xl border border-amber-200">
          ⚠️ 应急安全规范：重载卡车请立即减速开启双闪靠边停靠，严禁在发动机高温报警状态下直接旋开水箱盖以防高压蒸汽喷溅烫伤！
        </view>

        <view class="font-bold text-gray-800 flex items-center gap-1">
          <text class="i-carbon-list-bulleted text-[#1677ff]" />
          <text>标准排查步骤：</text>
        </view>
        <view class="pl-2 space-y-1 text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <view>1. 熄火等待15分钟，观察水箱膨胀壶冷却液位是否低于下限标线；</view>
          <view>2. 检查电子硅油离合器风扇线束与插头是否松动虚接；</view>
          <view>3. 若下水管与上水管温差过大，判断为节温器主阀门卡死不开，需更换节温器总成。</view>
        </view>

        <!-- 推荐原厂配件卡片 -->
        <view class="mt-3 p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
          <view>
            <view class="text-[20rpx] text-blue-600 font-bold">
              ★ 推荐适配东风原厂配件
            </view>
            <view class="text-xs font-bold text-gray-900 mt-0.5">
              {{ faultData?.recommendedPart || '原厂节温器总成' }}
            </view>
            <view class="text-[20rpx] text-gray-500">
              100%正品联保 · 支持快递或特约站到店安装
            </view>
          </view>
          <button
            class="bg-[#1677ff] text-white text-xs px-3.5 py-1.5 rounded-xl font-bold shadow-xs active:opacity-90 m-0"
            @click="handleBuy"
          >
            去选购
          </button>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="mt-2 pt-3 border-t border-gray-100 flex gap-2">
        <button
          class="flex-1 bg-red-500 text-white text-xs py-2.5 rounded-xl font-bold active:opacity-90 flex items-center justify-center gap-1 shadow-sm"
          @click="handleRescue"
        >
          <text class="i-carbon-warning text-sm" />
          <text>一键呼叫现场救援</text>
        </button>
        <button
          class="flex-1 bg-gray-100 text-gray-700 text-xs py-2.5 rounded-xl font-medium"
          @click="close"
        >
          已了解关闭
        </button>
      </view>
    </view>
  </view>
</template>
