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
    <view class="bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#1e293b] text-white px-5 pt-8 pb-12 text-center rounded-b-2xl border-b border-slate-700/60">
      <view class="w-16 h-16 mx-auto rounded-lg bg-[#0284c7] border-2 border-sky-400/50 flex items-center justify-center text-3xl shadow-sm">
        <text class="i-carbon-delivery-truck text-white" />
      </view>
      <view class="text-lg font-black tracking-tight mt-3 text-white">
        卡车汇 Truck Hub
      </view>
      <view class="text-xs text-slate-300 mt-1 font-mono">
        Version 1.2.0 (Build 2026.10)
      </view>
      <view class="mt-2 inline-block bg-black/25 border border-white/20 text-sky-400 text-[20rpx] px-2.5 py-0.5 rounded-sm font-bold">
        全国公路商用车应急保障枢纽
      </view>
    </view>

    <!-- 2. 平台核心介绍卡片 -->
    <view class="mx-4 -mt-6 bg-white rounded-lg p-5 border border-slate-200/90 space-y-3">
      <view class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
        <text class="w-1 h-3.5 bg-[#0284c7] rounded-sm" />
        <text>关于我们</text>
      </view>
      <view class="text-xs text-slate-600 leading-relaxed">
        卡车汇专为公路货运重卡与商用车打造，覆盖全国 1200+ 认证特约救援网点与专业维修技师团队。平台致力于解决公路后市场呼叫难、位置黑盒、配件不透明等难题，提供“一键极速救援、原厂配件直购、到店扫码安装与智能故障排查”的一体化应急闭环保障。
      </view>
    </view>

    <!-- 3. 服务信息与功能列表 -->
    <view class="mx-4 mt-4 bg-white rounded-lg overflow-hidden border border-slate-200/80 divide-y divide-slate-100">
      <view class="p-4 flex items-center justify-between text-xs">
        <text class="text-slate-500 font-medium">客服电话</text>
        <view class="flex items-center gap-1 text-[#0284c7] font-bold cursor-pointer" @click="callService">
          <text>400-888-9999</text>
          <text class="i-carbon-phone text-xs" />
        </view>
      </view>

      <view class="p-4 flex items-center justify-between text-xs">
        <text class="text-slate-500 font-medium">服务时间</text>
        <text class="text-slate-900 font-bold">7 × 24 小时全国道路紧急响应</text>
      </view>

      <view class="p-4 flex items-center justify-between text-xs">
        <text class="text-slate-500 font-medium">官方主体</text>
        <text class="text-slate-900 font-bold">卡车汇（北京）数字化供应链服务有限公司</text>
      </view>

      <view class="p-4 flex items-center justify-between text-xs">
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
