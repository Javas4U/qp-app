<script lang="ts" setup>
import type { RescueTypeCode } from '@/types/rescue'
import { ref } from 'vue'

defineOptions({
  name: 'RescueHallPage',
})

definePage({
  style: {
    navigationBarTitleText: '道路救援',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

// 6宫格救援类型
const rescueTypes = ref<{ code: RescueTypeCode, name: string, desc: string, icon: string, color: string }[]>([
  { code: 'TIRE', name: '轮胎问题', desc: '爆胎/漏气/换备胎', icon: 'i-carbon-circle-dash', color: '#ef4444' },
  { code: 'ENGINE', name: '发动机故障', desc: '高温/拉缸/异响熄火', icon: 'i-carbon-meter', color: '#f59e0b' },
  { code: 'CIRCUIT', name: '线路断电', desc: '全车无电/保险丝烧断', icon: 'i-carbon-flash', color: '#eab308' },
  { code: 'START_FAIL', name: '无法启动', desc: '电瓶亏电/搭电启动', icon: 'i-carbon-power', color: '#10b981' },
  { code: 'REPLACE_PART', name: '现场换件', desc: '原厂配件快速送达', icon: 'i-carbon-tools', color: '#0891b2' },
  { code: 'TOW_TRUCK', name: '故障拖车', desc: '重卡重载平板清障', icon: 'i-carbon-delivery-truck', color: '#8b5cf6' },
])

function startRescue(typeCode?: RescueTypeCode) {
  const url = typeCode
    ? `/pages-sub/rescue/create?type=${typeCode}`
    : '/pages-sub/rescue/create'
  uni.navigateTo({ url })
}

function callPhone() {
  uni.makePhoneCall({
    phoneNumber: '400-888-9999',
    fail: () => {
      uni.showToast({ title: '救援专线: 400-888-9999', icon: 'none' })
    },
  })
}

function gotoDiagnosis() {
  uni.switchTab({ url: '/pages/diagnosis/index' })
}
</script>

<template>
  <view class="rescue-page min-h-screen bg-[#0f172a] pb-24 text-slate-100">
    <!-- 1. 顶部 24 小时救援横幅：深碳与信标蓝交融机能顶栏 -->
    <view class="border-b border-slate-700/80 rounded-b-2xl bg-[#1e293b] px-4 pb-6 pt-3 text-white">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view class="h-2.5 w-2.5 animate-pulse rounded-sm bg-emerald-400" />
          <text class="text-xs text-slate-200 font-bold tracking-wider">全国 1200+ 特约救援网点 24H 在线</text>
        </view>
        <view
          class="h-8 min-h-[64rpx] flex cursor-pointer items-center gap-1 border border-slate-600 rounded-sm bg-slate-800/90 px-3 text-xs text-white font-bold active:opacity-80"
          @click="callPhone"
        >
          <text class="i-carbon-phone text-xs text-amber-400" />
          <text>电话专线</text>
        </view>
      </view>

      <view class="mt-4 flex items-baseline gap-2">
        <text class="text-2xl text-white font-black tracking-tight">卡车汇极速道路救援</text>
        <text class="rounded-sm bg-amber-400 px-2 py-0.5 text-xs text-slate-950 font-extrabold">平均18分钟直达</text>
      </view>
      <text class="mt-1 block text-xs text-slate-300 font-medium">一键智能定位 · 专业技师调度 · 统一透明公道收费</text>
    </view>

    <!-- 2. 一键呼叫救援大卡片：硬核纯色实体分层与超大触感按钮 (88rpx/44px) -->
    <view class="mx-4 border border-slate-700/80 rounded-lg bg-[#1e293b] p-5 -mt-3 shadow-md">
      <view class="flex items-center justify-between">
        <view>
          <view class="flex items-center gap-1.5 text-base text-slate-100 font-bold">
            <text class="i-carbon-location-filled text-lg text-red-500" />
            <text>当前停靠：智能高精定位</text>
          </view>
          <view class="mt-1 text-xs text-slate-400">
            G107国道附近 · 点击一键呼叫将自动获取经纬度
          </view>
        </view>
      </view>

      <view class="mt-4">
        <button
          class="h-12 min-h-[96rpx] w-full flex items-center justify-center gap-2 rounded-md border-none from-red-600 to-red-700 bg-gradient-to-r text-base text-white font-extrabold shadow-sm active:bg-red-800"
          @click="startRescue()"
        >
          <text class="i-carbon-warning-filled text-xl" />
          <text>一键立即呼叫救援</text>
        </button>
      </view>
    </view>

    <!-- 3. 故障诊断快捷引导横幅：轻量机能提示条 -->
    <view
      class="mx-4 mt-4 flex cursor-pointer items-center justify-between border border-slate-700/80 rounded-lg bg-[#1e293b] p-3.5 active:opacity-90"
      @click="gotoDiagnosis"
    >
      <view class="flex items-center gap-3">
        <view class="h-9 w-9 flex shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
          <text class="i-carbon-analytics text-base" />
        </view>
        <view>
          <view class="text-xs text-slate-100 font-bold">
            不确定什么故障？试试智能诊断
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400 font-medium">
            AI故障排查树 · 原厂工程师指导 · 推荐备件
          </view>
        </view>
      </view>
      <view class="flex shrink-0 items-center text-xs text-sky-400 font-bold">
        <text>去诊断</text>
        <text class="i-carbon-chevron-right ml-0.5 text-xs" />
      </view>
    </view>

    <!-- 4. 常见救援分类 6 宫格：中圆角与 1px 刚性边框 -->
    <view class="mx-4 mt-4 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4">
      <view class="mb-3 flex items-center justify-between">
        <view class="flex items-center gap-1.5">
          <view class="h-3.5 w-1 rounded-sm bg-red-600" />
          <text class="text-sm text-slate-100 font-bold">按救援类型快速报案</text>
        </view>
        <text class="text-[20rpx] text-slate-400 font-medium">选择后极速派单</text>
      </view>

      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="item in rescueTypes"
          :key="item.code"
          class="min-h-[88rpx] flex cursor-pointer items-center gap-2.5 border border-slate-700/70 rounded-md bg-[#0f172a] p-3 transition-colors active:border-sky-500 active:bg-slate-800"
          @click="startRescue(item.code)"
        >
          <view
            class="h-10 w-10 flex shrink-0 items-center justify-center border rounded-md"
            :style="{
              backgroundColor: `${item.color}15`,
              borderColor: `${item.color}40`,
              color: item.color,
            }"
          >
            <text :class="item.icon" class="text-lg" />
          </view>
          <view class="overflow-hidden">
            <view class="truncate text-xs text-slate-100 font-bold">
              {{ item.name }}
            </view>
            <view class="mt-0.5 truncate text-[20rpx] text-slate-400">
              {{ item.desc }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 5. 救援服务承诺背书：高对比度工业实体底框 -->
    <view class="mx-4 mt-4 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4 text-[22rpx] text-slate-300 space-y-2">
      <view class="flex items-center gap-1.5 text-xs text-slate-100 font-bold">
        <text class="i-carbon-checkmark-filled text-sm text-emerald-400" />
        <text>卡车汇平台 4 大服务保障承诺</text>
      </view>
      <view class="pl-5 text-slate-300 leading-relaxed">
        1. 明码实价：按工时标准计价，杜绝半路坐地起价；
      </view>
      <view class="pl-5 text-slate-300 leading-relaxed">
        2. 原厂品质：现场更换配件 100% 正品保障且享全国联保；
      </view>
      <view class="pl-5 text-slate-300 leading-relaxed">
        3. 极速响应：雷达调度周边 15km 范围内认证合作技师；
      </view>
      <view class="pl-5 text-slate-300 leading-relaxed">
        4. 完工拍照：全程作业记录存证，司机验车满意后再付款。
      </view>
    </view>
  </view>
</template>
