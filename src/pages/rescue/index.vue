<script lang="ts" setup>
import type { RescueTypeCode } from '@/types/rescue'
import { ref } from 'vue'

defineOptions({
  name: 'RescueHallPage',
})

definePage({
  style: {
    navigationBarTitleText: '道路救援',
    navigationBarBackgroundColor: '#0284c7',
    navigationBarTextStyle: 'white',
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
  <view class="rescue-page min-h-screen bg-[#f8fafc] pb-24">
    <!-- 1. 顶部 24 小时救援横幅：深碳与信标蓝交融机能顶栏 -->
    <view class="bg-gradient-to-b from-[#0f172a] via-[#0369a1] to-[#0284c7] text-white px-4 pt-3 pb-6 rounded-b-2xl border-b border-sky-400/20">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-sm bg-emerald-400 animate-pulse" />
          <text class="text-xs font-bold tracking-wider text-slate-100">全国 1200+ 特约救援网点 24H 在线</text>
        </view>
        <view
          class="bg-black/25 border border-white/25 text-white px-3 py-1 rounded-sm text-[20rpx] font-bold flex items-center gap-1 active:opacity-80 cursor-pointer"
          @click="callPhone"
        >
          <text class="i-carbon-phone text-xs text-amber-400" />
          <text>电话专线</text>
        </view>
      </view>

      <view class="mt-4 flex items-baseline gap-2">
        <text class="text-2xl font-black tracking-tight text-white">卡车汇极速道路救援</text>
        <text class="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-sm font-extrabold">平均18分钟直达</text>
      </view>
      <text class="text-xs text-slate-200 mt-1 block font-medium">一键智能定位 · 专业技师调度 · 统一透明公道收费</text>
    </view>

    <!-- 2. 一键呼叫救援大卡片：硬核纯色实体分层与超大触感按钮 (88rpx/44px) -->
    <view class="mx-4 -mt-3 bg-white rounded-lg p-5 border border-slate-200/90">
      <view class="flex items-center justify-between">
        <view>
          <view class="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <text class="i-carbon-location-filled text-red-600 text-lg" />
            <text>当前停靠：智能高精定位</text>
          </view>
          <view class="text-xs text-slate-500 mt-1">
            G107国道附近 · 点击一键呼叫将自动获取经纬度
          </view>
        </view>
      </view>

      <view class="mt-4">
        <button
          class="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold text-base h-12 rounded-md active:bg-red-800 flex items-center justify-center gap-2 border-none"
          @click="startRescue()"
        >
          <text class="i-carbon-warning-filled text-xl" />
          <text>一键立即呼叫救援</text>
        </button>
      </view>
    </view>

    <!-- 3. 故障诊断快捷引导横幅：轻量机能提示条 -->
    <view
      class="mx-4 mt-4 bg-slate-900 border border-slate-700 rounded-lg p-3.5 flex items-center justify-between cursor-pointer active:opacity-90"
      @click="gotoDiagnosis"
    >
      <view class="flex items-center gap-3">
        <view class="w-9 h-9 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <text class="i-carbon-analytics text-base" />
        </view>
        <view>
          <view class="text-xs font-bold text-slate-100">
            不确定什么故障？试试智能诊断
          </view>
          <view class="text-[20rpx] text-slate-400 mt-0.5 font-medium">
            AI故障排查树 · 原厂工程师指导 · 推荐备件
          </view>
        </view>
      </view>
      <view class="flex items-center text-indigo-400 text-xs font-bold shrink-0">
        <text>去诊断</text>
        <text class="i-carbon-chevron-right text-xs ml-0.5" />
      </view>
    </view>

    <!-- 4. 常见救援分类 6 宫格：中圆角与 1px 刚性边框 -->
    <view class="mx-4 mt-4 bg-white rounded-lg p-4 border border-slate-200/80">
      <view class="flex items-center justify-between mb-3">
        <view class="flex items-center gap-1.5">
          <view class="w-1 h-3.5 bg-red-600 rounded-sm" />
          <text class="text-sm font-bold text-slate-900">按救援类型快速报案</text>
        </view>
        <text class="text-[20rpx] text-slate-400 font-medium">选择后极速派单</text>
      </view>

      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="item in rescueTypes"
          :key="item.code"
          class="p-3 rounded-md border border-slate-200/80 bg-slate-50/60 flex items-center gap-2.5 cursor-pointer active:bg-sky-50 active:border-sky-300 transition-colors"
          @click="startRescue(item.code)"
        >
          <view
            class="w-10 h-10 rounded-md flex items-center justify-center shrink-0 border"
            :style="{
              backgroundColor: `${item.color}12`,
              borderColor: `${item.color}30`,
              color: item.color,
            }"
          >
            <text :class="item.icon" class="text-lg" />
          </view>
          <view class="overflow-hidden">
            <view class="text-xs font-bold text-slate-900 truncate">
              {{ item.name }}
            </view>
            <view class="text-[20rpx] text-slate-400 truncate mt-0.5">
              {{ item.desc }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 5. 救援服务承诺背书：高对比度工业实体底框 -->
    <view class="mx-4 mt-4 p-4 rounded-lg bg-white border border-slate-200/80 text-[22rpx] text-slate-600 space-y-2">
      <view class="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
        <text class="i-carbon-checkmark-filled text-emerald-600 text-sm" />
        <text>卡车汇平台 4 大服务保障承诺</text>
      </view>
      <view class="pl-5 text-slate-700 leading-relaxed">
        1. 明码实价：按工时标准计价，杜绝半路坐地起价；
      </view>
      <view class="pl-5 text-slate-700 leading-relaxed">
        2. 原厂品质：现场更换配件 100% 正品保障且享全国联保；
      </view>
      <view class="pl-5 text-slate-700 leading-relaxed">
        3. 极速响应：雷达调度周边 15km 范围内认证合作技师；
      </view>
      <view class="pl-5 text-slate-700 leading-relaxed">
        4. 完工拍照：全程作业记录存证，司机验车满意后再付款。
      </view>
    </view>
  </view>
</template>
