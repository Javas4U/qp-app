<script lang="ts" setup>
defineOptions({
  name: 'AboutPage',
})

definePage({
  style: {
    navigationBarTitleText: '关于卡车汇',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
  },
})

function callService() {
  uni.makePhoneCall({
    phoneNumber: '400-888-9999',
    fail: () => {
      uni.showToast({ title: '客服专线: 400-888-9999', icon: 'none' })
    },
  })
}
</script>

<template>
  <view class="about-page min-h-screen bg-[#f8fafc] pb-16">
    <!-- 1. 顶部品牌展示区 (深碳沥青工业风) -->
    <view class="border-b border-slate-700/60 rounded-b-2xl from-[#0f172a] via-[#1e293b] to-[#1e293b] bg-gradient-to-b px-5 pb-12 pt-8 text-center text-white">
      <view class="mx-auto h-16 w-16 flex items-center justify-center border-2 border-sky-400/50 rounded-lg bg-[#0284c7] text-3xl shadow-sm">
        <text class="i-carbon-delivery-truck text-white" />
      </view>
      <view class="mt-3 text-lg text-white font-black tracking-tight">
        卡车汇 Truck Hub
      </view>
      <view class="mt-1 text-xs text-slate-300 font-mono">
        Version 1.2.0 (Build 2026.10)
      </view>
      <view class="mt-2 inline-block border border-white/20 rounded-sm bg-black/25 px-2.5 py-0.5 text-[20rpx] text-sky-400 font-bold">
        全国公路商用车应急保障枢纽
      </view>
    </view>

    <!-- 2. 平台核心介绍卡片 -->
    <view class="mx-4 border border-slate-200/90 rounded-lg bg-white p-5 -mt-6 space-y-3">
      <view class="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
        <text class="h-3.5 w-1 rounded-sm bg-[#0284c7]" />
        <text>关于我们</text>
      </view>
      <view class="text-xs text-slate-600 leading-relaxed">
        卡车汇专为公路货运重卡与商用车打造，覆盖全国 1200+ 认证特约救援网点与专业维修技师团队。平台致力于解决公路后市场呼叫难、位置黑盒、配件不透明等难题，提供“一键极速救援、原厂配件直购、到店扫码安装与智能故障排查”的一体化应急闭环保障。
      </view>
    </view>

    <!-- 3. 服务信息与功能列表 -->
    <view class="mx-4 mt-4 overflow-hidden border border-slate-200/80 rounded-lg bg-white divide-y divide-slate-100">
      <view class="flex items-center justify-between p-4 text-xs">
        <text class="text-slate-500 font-medium">客服电话</text>
        <view class="flex cursor-pointer items-center gap-1 text-[#0284c7] font-bold" @click="callService">
          <text>400-888-9999</text>
          <text class="i-carbon-phone text-xs" />
        </view>
      </view>

      <view class="flex items-center justify-between p-4 text-xs">
        <text class="text-slate-500 font-medium">服务时间</text>
        <text class="text-slate-900 font-bold">7 × 24 小时全国道路紧急响应</text>
      </view>

      <view class="flex items-center justify-between p-4 text-xs">
        <text class="text-slate-500 font-medium">官方主体</text>
        <text class="text-slate-900 font-bold">卡车汇（北京）数字化供应链服务有限公司</text>
      </view>

      <view class="flex items-center justify-between p-4 text-xs">
        <text class="text-slate-500 font-medium">服务协议与隐私条款</text>
        <text class="text-[#0284c7] font-bold">查看详情</text>
      </view>
    </view>

    <!-- 4. 底部版权 -->
    <view class="mt-12 text-center text-[20rpx] text-slate-400 font-medium space-y-1">
      <view>Copyright © 2026 Truck Hub. All Rights Reserved.</view>
      <view>工信部增值电信业务认证 · 全国重卡数字化标准保障平台</view>
    </view>
  </view>
</template>
