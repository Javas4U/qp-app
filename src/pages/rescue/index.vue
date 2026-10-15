<script lang="ts" setup>
import type { RescueTypeCode } from '@/types/rescue'
import { ref } from 'vue'

defineOptions({
  name: 'RescueHallPage',
})

definePage({
  style: {
    navigationBarTitleText: '道路救援',
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTextStyle: 'white',
  },
})

// 6宫格救援类型
const rescueTypes = ref<{ code: RescueTypeCode, name: string, desc: string, icon: string, color: string }[]>([
  { code: 'TIRE', name: '轮胎问题', desc: '爆胎/漏气/换备胎', icon: 'i-carbon-circle-dash', color: '#ff4d4f' },
  { code: 'ENGINE', name: '发动机故障', desc: '高温/拉缸/异响熄火', icon: 'i-carbon-meter', color: '#fa8c16' },
  { code: 'CIRCUIT', name: '线路断电', desc: '全车无电/保险丝烧断', icon: 'i-carbon-flash', color: '#fadb14' },
  { code: 'START_FAIL', name: '无法启动', desc: '电瓶亏电/搭电启动', icon: 'i-carbon-power', color: '#52c41a' },
  { code: 'REPLACE_PART', name: '现场换件', desc: '原厂配件快速速递送达', icon: 'i-carbon-tools', color: '#13c2c2' },
  { code: 'TOW_TRUCK', name: '故障拖车', desc: '重卡重载平板清障', icon: 'i-carbon-delivery-truck', color: '#722ed1' },
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
  <view class="rescue-page min-h-screen bg-[#f5f7fa] pb-24">
    <!-- 1. 顶部 24 小时救援横幅 (对标 救援1.jpg 顶部) -->
    <view class="bg-[#1677ff] text-white px-4 pt-3 pb-6 rounded-b-[36rpx] shadow-sm">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <text class="text-xs font-semibold tracking-wider">全国 1200+ 特约救援网点全天候在线</text>
        </view>
        <view
          class="bg-white/20 text-white px-2.5 py-1 rounded-full text-[20rpx] flex items-center gap-1 backdrop-blur cursor-pointer"
          @click="callPhone"
        >
          <text class="i-carbon-phone text-xs" />
          <text>电话专线</text>
        </view>
      </view>

      <view class="mt-4 flex items-baseline gap-2">
        <text class="text-2xl font-black tracking-tight">卡车汇极速道路救援</text>
        <text class="text-xs bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">平均18分钟直达</text>
      </view>
      <text class="text-xs opacity-80 mt-1 block">一键智能定位 · 专业技师调度 · 统一透明公道收费</text>
    </view>

    <!-- 2. 一键呼叫救援大卡片 (对标 救援1.jpg 核心主入口) -->
    <view class="mx-4 -mt-3 bg-white rounded-2xl p-5 shadow-lg border border-blue-50">
      <view class="flex items-center justify-between">
        <view>
          <view class="text-lg font-bold text-gray-900 flex items-center gap-1.5">
            <text class="i-carbon-location-filled text-red-500" />
            <text>当前停靠：智能高精定位</text>
          </view>
          <view class="text-xs text-gray-500 mt-1">
            G107国道附近 · 点击一键呼叫将自动获取经纬度
          </view>
        </view>
      </view>

      <view class="mt-5">
        <button
          class="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-base py-3 rounded-xl shadow-md active:opacity-90 flex items-center justify-center gap-2 border-none"
          @click="startRescue()"
        >
          <text class="i-carbon-warning-filled text-lg" />
          <text>一键立即呼叫救援</text>
        </button>
      </view>
    </view>

    <!-- 3. 故障诊断快捷引导横幅 -->
    <view
      class="mx-4 mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between cursor-pointer"
      @click="gotoDiagnosis"
    >
      <view class="flex items-center gap-2.5">
        <view class="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
          <text class="i-carbon-analytics text-base" />
        </view>
        <view>
          <view class="text-xs font-bold text-indigo-950">
            不确定什么故障？试试智能诊断
          </view>
          <view class="text-[20rpx] text-indigo-600 mt-0.5">
            AI故障排查树 · 原厂工程师指导 · 推荐备件
          </view>
        </view>
      </view>
      <view class="flex items-center text-indigo-600 text-xs font-bold">
        <text>去诊断</text>
        <text class="i-carbon-chevron-right text-xs" />
      </view>
    </view>

    <!-- 4. 常见救援分类 6 宫格 (对标 救援1.jpg 常见类型) -->
    <view class="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
      <view class="flex items-center justify-between mb-3">
        <view class="flex items-center gap-1.5">
          <view class="w-1 h-3.5 bg-red-500 rounded-full" />
          <text class="text-sm font-bold text-gray-900">按救援类型快速报案</text>
        </view>
        <text class="text-[20rpx] text-gray-400">选择后极速派单</text>
      </view>

      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="item in rescueTypes"
          :key="item.code"
          class="p-3 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center gap-2.5 cursor-pointer active:bg-blue-50/60 transition-colors"
          @click="startRescue(item.code)"
        >
          <view
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :style="{ backgroundColor: `${item.color}15`, color: item.color }"
          >
            <text :class="item.icon" class="text-lg" />
          </view>
          <view class="overflow-hidden">
            <view class="text-xs font-bold text-gray-800 truncate">
              {{ item.name }}
            </view>
            <view class="text-[20rpx] text-gray-400 truncate mt-0.5">
              {{ item.desc }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 5. 救援服务承诺背书 -->
    <view class="mx-4 mt-4 p-4 rounded-xl bg-white/70 border border-gray-100 text-[22rpx] text-gray-500 space-y-1.5">
      <view class="flex items-center gap-1.5 text-gray-700 font-semibold">
        <text class="i-carbon-checkmark-filled text-emerald-500 text-xs" />
        <text>卡车汇平台 4 大服务保障承诺</text>
      </view>
      <view class="pl-4">
        1. 明码实价：按工时标准计价，杜绝半路坐地起价；
      </view>
      <view class="pl-4">
        2. 原厂品质：现场更换配件 100% 正品保障且享全国联保；
      </view>
      <view class="pl-4">
        3. 极速响应：雷达调度周边 15km 范围内认证合作技师；
      </view>
      <view class="pl-4">
        4. 完工拍照：全程作业记录存证，司机验车满意后再付款。
      </view>
    </view>
  </view>
</template>
