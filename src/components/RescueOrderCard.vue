<script setup lang="ts">
import type { RescueOrderItemVo } from '@/types/rescue'

const props = defineProps<{
  item: RescueOrderItemVo
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', item: RescueOrderItemVo): void
  (e: 'accept', item: RescueOrderItemVo): void
}>()

function handleCardClick() {
  emit('click', props.item)
}

function handleAccept(e: Event) {
  // #ifdef MP-WEIXIN || H5
  e.stopPropagation()
  // #endif
  emit('accept', props.item)
}

const urgencyBadgeClass = computed(() => {
  switch (props.item.urgency) {
    case '高':
      return 'bg-red-50 text-red-600 border-red-200'
    case '中':
      return 'bg-amber-50 text-amber-600 border-amber-200'
    default:
      return 'bg-blue-50 text-blue-600 border-blue-200'
  }
})
</script>

<template>
  <view
    class="mb-3 border border-gray-100 rounded-xl bg-white p-4 shadow-sm transition-all active:bg-gray-50"
    @click="handleCardClick"
  >
    <!-- 卡片头部：车牌与紧急状态 -->
    <view class="mb-2 flex items-center justify-between">
      <view class="flex items-center space-x-2">
        <text class="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-800 font-semibold">
          {{ item.plateNo }}
        </text>
        <text v-if="item.vehicleModel" class="text-xs text-gray-500">
          {{ item.vehicleModel }}
        </text>
      </view>
      <text
        class="border rounded-full px-2 py-0.5 text-xs font-medium"
        :class="urgencyBadgeClass"
      >
        {{ item.urgency }}紧急
      </text>
    </view>

    <!-- 故障描述 -->
    <view class="mb-3">
      <text class="text-sm text-gray-800 font-medium leading-relaxed">
        {{ item.faultDesc }}
      </text>
    </view>

    <!-- 位置与时间信息 -->
    <view class="mb-3 text-xs text-gray-500 space-y-1">
      <view class="flex items-center">
        <text class="i-carbon-location mr-1 text-gray-400" />
        <text class="flex-1 truncate">
          {{ item.location }}
        </text>
        <text v-if="item.distanceKm" class="text-blue-600 font-medium">
          约 {{ item.distanceKm }}km
        </text>
      </view>
      <view class="flex items-center">
        <text class="i-carbon-time mr-1 text-gray-400" />
        <text>{{ item.createTime }} 报修</text>
      </view>
    </view>

    <!-- 底部操作区 -->
    <view class="flex items-center justify-between border-t border-gray-100 pt-3">
      <text class="text-xs text-gray-400">
        工单号: {{ item.orderNo }}
      </text>
      <button
        v-if="item.status === 'PENDING'"
        class="h-8 flex items-center justify-center rounded-lg bg-blue-600 px-4 text-xs text-white font-medium shadow-sm active:bg-blue-700"
        :disabled="loading"
        @click="handleAccept"
      >
        <text class="i-carbon-flash mr-1 text-sm" />
        立即抢单
      </button>
      <text
        v-else
        class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 font-medium"
      >
        {{ item.status === 'ACCEPTED' ? '作业中' : '已归档' }}
      </text>
    </view>
  </view>
</template>
