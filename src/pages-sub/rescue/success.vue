<script lang="ts" setup>
import type { RescueOrderVo } from '@/types/rescue'
import { getRescueOrderDetail } from '@/api/rescue'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

defineOptions({
  name: 'RescueSuccessPage',
})

definePage({
  style: {
    navigationBarTitleText: '结算完成',
    navigationBarBackgroundColor: '#00b578',
    navigationBarTextStyle: 'white',
  },
})

const orderNo = ref<string>('')
const orderDetail = ref<RescueOrderVo | null>(null)
const loading = ref<boolean>(false)

onLoad(async (query: any) => {
  let no = query?.orderNo || ''
  if (!no) {
    no = uni.getStorageSync('current_rescue_order_no') || ''
  }
  orderNo.value = no
  if (no) {
    await fetchDetail(no)
  }
})

async function fetchDetail(no: string) {
  loading.value = true
  try {
    const res = await getRescueOrderDetail(no)
    orderDetail.value = res
  }
  catch (err) {
    console.error('获取工单结算详情失败:', err)
  }
  finally {
    loading.value = false
  }
}

function gotoHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

function gotoOrder() {
  const targetOrderNo = orderNo.value || uni.getStorageSync('current_rescue_order_no') || ''
  if (targetOrderNo) {
    uni.redirectTo({ url: `/pages-sub/rescue/voucher?orderNo=${targetOrderNo}` })
  }
  else {
    uni.switchTab({ url: '/pages/order/index' })
  }
}

function gotoMall() {
  uni.navigateTo({ url: '/pages-sub/mall/parts-catalog' })
}
</script>

<template>
  <view class="success-page min-h-screen bg-[#f5f7fa] pb-16 flex flex-col justify-between">
    <view>
      <!-- 1. 顶部绿色支付成功大标 -->
      <view class="bg-[#00b578] text-white pt-6 pb-12 px-4 rounded-b-[48rpx] text-center shadow-sm">
        <view class="w-16 h-16 rounded-full bg-white text-[#00b578] mx-auto flex items-center justify-center text-3xl shadow-md">
          <text class="i-carbon-checkmark-filled" />
        </view>
        <view class="mt-3 text-lg font-bold">
          救援工单结算成功
        </view>
        <view class="mt-1 text-xs opacity-90">
          感谢您对卡车汇专业商用车救援服务的信任与支持
        </view>

        <!-- 金额展示 -->
        <view class="mt-4 text-3xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-1">
          <text class="text-xl">¥</text>
          <text>{{ orderDetail?.finalAmount || orderDetail?.estimatedAmount || '300.00' }}</text>
        </view>
      </view>

      <!-- 2. 费用结算清单卡片 -->
      <view class="mx-4 -mt-6 bg-white rounded-2xl p-5 shadow-md border border-gray-100 text-xs text-gray-700 space-y-3">
        <view class="flex items-center justify-between pb-3 border-b border-gray-100">
          <text class="text-gray-400">工单编号</text>
          <text class="font-mono font-bold text-gray-900 select-all">{{ orderNo || orderDetail?.orderNo || 'RES202610140001' }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-gray-500">基础预估出警服务费</text>
          <text class="font-bold text-gray-800">¥{{ orderDetail?.estimatedAmount || '300.00' }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-gray-500">现场增项与配件费用</text>
          <text class="font-bold text-gray-800">¥{{ orderDetail?.extraAmount || '0.00' }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-gray-500">支付结算方式</text>
          <text class="font-bold text-gray-800">沙箱模拟通道（已结算）</text>
        </view>

        <view class="flex items-center justify-between pt-2 border-t border-gray-100 text-sm">
          <text class="font-bold text-gray-900">实付总计</text>
          <text class="text-base font-black text-red-600">¥{{ orderDetail?.finalAmount || orderDetail?.estimatedAmount || '300.00' }}</text>
        </view>

        <view class="pt-2 border-t border-gray-100 flex items-center justify-between text-[22rpx] text-emerald-600 bg-emerald-50 p-2.5 rounded-xl">
          <view class="flex items-center gap-1">
            <text class="i-carbon-security text-sm" />
            <text>本次救援服务与装配由卡车汇官方提供原厂质量保障</text>
          </view>
        </view>
      </view>

      <!-- 3. 服务技师与网点信息 -->
      <view class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
        <view class="flex items-center gap-2.5">
          <view class="w-10 h-10 rounded-full bg-blue-100 text-[#1677ff] flex items-center justify-center text-lg font-bold">
            <text class="i-carbon-user-avatar" />
          </view>
          <view class="text-xs">
            <view class="font-bold text-gray-800">
              {{ orderDetail?.technicianName || '出警责任技师' }}
            </view>
            <view class="text-[20rpx] text-gray-400 mt-0.5">
              {{ orderDetail?.stationName || '卡车汇特约商用车救援站' }}
            </view>
          </view>
        </view>
        <view class="text-amber-500 flex items-center gap-0.5 text-xs font-bold">
          <text class="i-carbon-star-filled text-sm" />
          <text>{{ orderDetail?.evaluation ? `已评价 (${orderDetail.evaluation.overallScore}.0)` : '服务完成' }}</text>
        </view>
      </view>
    </view>

    <!-- 4. 底部三操作按钮行 -->
    <view class="px-4 space-y-2.5 mt-6">
      <button
        class="w-full bg-[#1677ff] text-white py-3 rounded-xl font-bold text-xs shadow-md active:opacity-90 m-0 border-none"
        @click="gotoOrder"
      >
        查看工单与电子凭证
      </button>

      <view class="grid grid-cols-2 gap-2">
        <button
          class="bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-medium m-0 active:bg-gray-50"
          @click="gotoHome"
        >
          返回首页
        </button>
        <button
          class="bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-medium m-0 active:opacity-90 border-none"
          @click="gotoMall"
        >
          选购原厂配件
        </button>
      </view>
    </view>
  </view>
</template>
