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
    navigationBarBackgroundColor: '#0f172a',
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
  <view class="success-page min-h-screen bg-[#0f172a] text-slate-100 pb-16 flex flex-col justify-between">
    <view>
      <!-- 1. 顶部翡翠绿结算完成工业机能顶栏 -->
      <view class="bg-[#1e293b] border-b border-slate-700/80 pt-8 pb-8 px-4 text-center">
        <view class="w-14 h-14 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
          <text class="i-carbon-checkmark-filled" />
        </view>
        <view class="mt-3 text-base font-bold text-slate-100">
          救援工单结算成功
        </view>
        <view class="mt-1 text-xs text-slate-400">
          感谢您对卡车汇专业商用车救援服务的信任与支持
        </view>

        <!-- 金额展示 -->
        <view class="mt-3 text-3xl font-black font-mono tracking-tight text-emerald-400 flex items-center justify-center gap-1">
          <text class="text-xl">¥</text>
          <text>{{ orderDetail?.finalAmount || orderDetail?.estimatedAmount || '300.00' }}</text>
        </view>
      </view>

      <!-- 2. 费用结算清单卡片 (1px刚性实线) -->
      <view class="mx-4 mt-3 bg-[#1e293b] rounded-lg p-4 border border-slate-700/80 text-xs text-slate-300 space-y-2.5">
        <view class="flex items-center justify-between pb-2.5 border-b border-slate-700">
          <text class="text-slate-400">工单编号</text>
          <text class="font-mono font-bold text-slate-100 select-all">{{ orderNo || orderDetail?.orderNo || 'RES202610140001' }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-slate-400">基础预估出警服务费</text>
          <text class="font-bold text-slate-200 font-mono">¥{{ orderDetail?.estimatedAmount || '300.00' }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-slate-400">现场增项与配件费用</text>
          <text class="font-bold text-slate-200 font-mono">¥{{ orderDetail?.extraAmount || '0.00' }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-slate-400">支付结算方式</text>
          <text class="font-bold text-slate-200">沙箱模拟通道（已结算）</text>
        </view>

        <view class="flex items-center justify-between pt-2 border-t border-slate-700 text-sm">
          <text class="font-bold text-slate-100">实付总计</text>
          <text class="text-base font-black text-rose-400 font-mono">¥{{ orderDetail?.finalAmount || orderDetail?.estimatedAmount || '300.00' }}</text>
        </view>

        <view class="pt-2 border-t border-slate-700 flex items-center justify-between text-[22rpx] text-emerald-400 bg-slate-900 p-2.5 rounded-md border border-slate-800">
          <view class="flex items-center gap-1.5">
            <text class="i-carbon-security text-base shrink-0" />
            <text>本次救援服务与原厂装配件由卡车汇官方提供全国联保</text>
          </view>
        </view>
      </view>

      <!-- 3. 服务技师与网点信息 -->
      <view class="mx-4 mt-3 bg-[#1e293b] rounded-lg p-3.5 border border-slate-700/80 flex items-center justify-between">
        <view class="flex items-center gap-2.5">
          <view class="w-10 h-10 rounded-md bg-slate-900 border border-slate-700 text-[#0284c7] flex items-center justify-center text-lg font-bold">
            <text class="i-carbon-user-avatar" />
          </view>
          <view class="text-xs">
            <view class="font-bold text-slate-100">
              {{ orderDetail?.technicianName || '出警责任技师' }}
            </view>
            <view class="text-[20rpx] text-slate-400 mt-0.5">
              {{ orderDetail?.stationName || '卡车汇特约商用车救援站' }}
            </view>
          </view>
        </view>
        <view class="text-amber-400 flex items-center gap-0.5 text-xs font-bold bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-sm">
          <text class="i-carbon-star-filled text-xs" />
          <text>{{ orderDetail?.evaluation ? `已评价 (${orderDetail.evaluation.overallScore}.0)` : '服务完成' }}</text>
        </view>
      </view>
    </view>

    <!-- 4. 底部三操作按钮行（手套防误触 ≥ 44px） -->
    <view class="px-4 space-y-2.5 mt-6">
      <button
        class="w-full bg-[#0284c7] active:bg-[#0369a1] text-white min-h-[88rpx] rounded-lg font-bold text-xs flex items-center justify-center gap-1 border-none transition-colors"
        @click="gotoOrder"
      >
        <text class="i-carbon-certificate-check text-sm" />
        <text>查看工单与全息电子凭证</text>
      </button>

      <view class="grid grid-cols-2 gap-2">
        <button
          class="bg-slate-800 border border-slate-700 text-slate-200 min-h-[80rpx] rounded-lg text-xs font-medium flex items-center justify-center active:bg-slate-700 transition-colors"
          @click="gotoHome"
        >
          返回首页
        </button>
        <button
          class="bg-emerald-600 active:bg-emerald-700 text-white min-h-[80rpx] rounded-lg text-xs font-medium flex items-center justify-center border-none transition-colors"
          @click="gotoMall"
        >
          选购原厂配件
        </button>
      </view>
    </view>
  </view>
</template>
