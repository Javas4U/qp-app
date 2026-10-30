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
  <view class="success-page min-h-screen flex flex-col justify-between bg-[#0f172a] pb-16 text-slate-100">
    <view>
      <!-- 1. 顶部翡翠绿结算完成工业机能顶栏 -->
      <view class="border-b border-slate-700/80 bg-[#1e293b] px-4 pb-8 pt-8 text-center">
        <view class="mx-auto h-14 w-14 flex items-center justify-center border border-emerald-500/40 rounded-lg bg-emerald-500/20 text-3xl text-emerald-400">
          <text class="i-carbon-checkmark-filled" />
        </view>
        <view class="mt-3 text-base text-slate-100 font-bold">
          救援工单结算成功
        </view>
        <view class="mt-1 text-xs text-slate-400">
          感谢您对卡车汇专业商用车救援服务的信任与支持
        </view>

        <!-- 金额展示 -->
        <view class="mt-3 flex items-center justify-center gap-1 text-3xl text-emerald-400 font-black tracking-tight font-mono">
          <text class="text-xl">¥</text>
          <text>{{ orderDetail?.finalAmount || orderDetail?.estimatedAmount || '300.00' }}</text>
        </view>
      </view>

      <!-- 2. 费用结算清单卡片 (1px刚性实线) -->
      <view class="mx-4 mt-3 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4 text-xs text-slate-300 space-y-2.5">
        <view class="flex items-center justify-between border-b border-slate-700 pb-2.5">
          <text class="text-slate-400">工单编号</text>
          <text class="select-all text-slate-100 font-bold font-mono">{{ orderNo || orderDetail?.orderNo || 'RES202610140001' }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-slate-400">基础预估出警服务费</text>
          <text class="text-slate-200 font-bold font-mono">¥{{ orderDetail?.estimatedAmount || '300.00' }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-slate-400">现场增项与配件费用</text>
          <text class="text-slate-200 font-bold font-mono">¥{{ orderDetail?.extraAmount || '0.00' }}</text>
        </view>

        <view class="flex items-center justify-between">
          <text class="text-slate-400">支付结算方式</text>
          <text class="text-slate-200 font-bold">沙箱模拟通道（已结算）</text>
        </view>

        <view class="flex items-center justify-between border-t border-slate-700 pt-2 text-sm">
          <text class="text-slate-100 font-bold">实付总计</text>
          <text class="text-base text-rose-400 font-black font-mono">¥{{ orderDetail?.finalAmount || orderDetail?.estimatedAmount || '300.00' }}</text>
        </view>

        <view class="flex items-center justify-between border border-t border-slate-700 border-slate-800 rounded-md bg-slate-900 p-2.5 pt-2 text-[22rpx] text-emerald-400">
          <view class="flex items-center gap-1.5">
            <text class="i-carbon-security shrink-0 text-base" />
            <text>本次救援服务与原厂装配件由卡车汇官方提供全国联保</text>
          </view>
        </view>
      </view>

      <!-- 3. 服务技师与网点信息 -->
      <view class="mx-4 mt-3 flex items-center justify-between border border-slate-700/80 rounded-lg bg-[#1e293b] p-3.5">
        <view class="flex items-center gap-2.5">
          <view class="h-10 w-10 flex items-center justify-center border border-slate-700 rounded-md bg-slate-900 text-lg text-[#0284c7] font-bold">
            <text class="i-carbon-user-avatar" />
          </view>
          <view class="text-xs">
            <view class="text-slate-100 font-bold">
              {{ orderDetail?.technicianName || '出警责任技师' }}
            </view>
            <view class="mt-0.5 text-[20rpx] text-slate-400">
              {{ orderDetail?.stationName || '卡车汇特约商用车救援站' }}
            </view>
          </view>
        </view>
        <view class="flex items-center gap-0.5 border border-amber-400/30 rounded-sm bg-amber-400/10 px-2 py-0.5 text-xs text-amber-400 font-bold">
          <text class="i-carbon-star-filled text-xs" />
          <text>{{ orderDetail?.evaluation ? `已评价 (${orderDetail.evaluation.overallScore}.0)` : '服务完成' }}</text>
        </view>
      </view>
    </view>

    <!-- 4. 底部三操作按钮行（手套防误触 ≥ 44px） -->
    <view class="mt-6 px-4 space-y-2.5">
      <button
        class="min-h-[88rpx] w-full flex items-center justify-center gap-1 rounded-lg border-none bg-[#0284c7] text-xs text-white font-bold transition-colors active:bg-[#0369a1]"
        @click="gotoOrder"
      >
        <text class="i-carbon-certificate-check text-sm" />
        <text>查看工单与全息电子凭证</text>
      </button>

      <view class="grid grid-cols-2 gap-2">
        <button
          class="min-h-[80rpx] flex items-center justify-center border border-slate-700 rounded-lg bg-slate-800 text-xs text-slate-200 font-medium transition-colors active:bg-slate-700"
          @click="gotoHome"
        >
          返回首页
        </button>
        <button
          class="min-h-[80rpx] flex items-center justify-center rounded-lg border-none bg-emerald-600 text-xs text-white font-medium transition-colors active:bg-emerald-700"
          @click="gotoMall"
        >
          选购原厂配件
        </button>
      </view>
    </view>
  </view>
</template>
