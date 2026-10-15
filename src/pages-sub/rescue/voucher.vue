<script lang="ts" setup>
import type { RescueOrderVo } from '@/types/rescue'
import { getRescueOrderDetail } from '@/api/rescue'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

defineOptions({
  name: 'RescueVoucherPage',
})

definePage({
  style: {
    navigationBarTitleText: '救援工单全息电子凭证',
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTextStyle: 'white',
  },
})

const orderNo = ref<string>('')
const orderDetail = ref<RescueOrderVo | null>(null)
const loading = ref<boolean>(true)

onLoad(async (query: any) => {
  let no = query?.orderNo || ''
  if (!no) {
    no = uni.getStorageSync('current_rescue_order_no') || ''
  }
  orderNo.value = no
  if (no) {
    await fetchDetail(no)
  }
  else {
    loading.value = false
  }
})

async function fetchDetail(no: string) {
  loading.value = true
  try {
    const res = await getRescueOrderDetail(no)
    orderDetail.value = res
  }
  catch (err) {
    console.error('获取工单电子凭证失败:', err)
  }
  finally {
    loading.value = false
  }
}

// 解析照片列表
const sceneImageList = computed(() => {
  const raw = orderDetail.value?.sceneImages
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [raw]
  }
  catch {
    return raw.split(',').filter(Boolean)
  }
})

const finishImageList = computed(() => {
  const raw = orderDetail.value?.finishImages
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [raw]
  }
  catch {
    return raw.split(',').filter(Boolean)
  }
})

// 时间格式化
function formatDateTime(timeStr?: string) {
  if (!timeStr) return '--'
  return timeStr.replace('T', ' ').substring(0, 16)
}

// 图片预览
function previewImage(urls: string[], current: string) {
  if (!urls.length) return
  uni.previewImage({
    current,
    urls,
  })
}

// 拨打技师电话
function callPhone(phone?: string) {
  if (!phone) return
  uni.makePhoneCall({
    phoneNumber: phone,
    fail: () => {
      uni.showToast({ title: `拨打电话: ${phone}`, icon: 'none' })
    },
  })
}

// 拨打客服热线
function callCustomerService() {
  uni.makePhoneCall({
    phoneNumber: '400-888-9999',
    fail: () => {
      uni.showToast({ title: '客服热线: 400-888-9999', icon: 'none' })
    },
  })
}

function gotoHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

function gotoCreateRescue() {
  uni.navigateTo({ url: '/pages-sub/rescue/create' })
}
</script>

<template>
  <view class="voucher-page min-h-screen bg-[#f3f4f6] pb-24">
    <!-- 1. 顶部官方防伪电子凭证抬头 -->
    <view class="bg-gradient-to-b from-[#1677ff] to-[#0d60d8] text-white pt-5 pb-8 px-5 rounded-b-[40rpx] shadow-sm">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg">
            <text class="i-carbon-certificate-check" />
          </view>
          <view>
            <view class="text-sm font-black tracking-wide">卡车汇商用车道路紧急救援</view>
            <view class="text-[20rpx] opacity-80 mt-0.5">官方存证 • 电子工单与结算质保凭证</view>
          </view>
        </view>
        <view class="bg-white/20 px-2.5 py-1 rounded-full text-[20rpx] font-bold flex items-center gap-1">
          <text class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <text>已完工交付</text>
        </view>
      </view>

      <view class="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs opacity-90 font-mono">
        <text>凭证号: E-{{ orderNo || 'RES202610140001' }}</text>
        <text>{{ formatDateTime(orderDetail?.finishTime || orderDetail?.createTime) }}</text>
      </view>
    </view>

    <!-- 2. 主体卡片流 -->
    <view class="px-4 -mt-4 space-y-3.5">
      <!-- ① 受困车辆与故障诊断卡片 (对齐 PC 端受困车辆与故障诊断) -->
      <view class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5">
        <view class="flex items-center justify-between pb-2 border-b border-gray-100">
          <view class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <text class="i-carbon-delivery-truck text-[#1677ff] text-base" />
            <text>受困车辆与故障诊断</text>
          </view>
          <text class="text-[20rpx] bg-blue-50 text-[#1677ff] px-2 py-0.5 rounded-md font-bold">
            {{ orderDetail?.serviceType || '现场快修' }}
          </text>
        </view>

        <view class="grid grid-cols-2 gap-y-2 text-xs">
          <view>
            <text class="text-gray-400 block text-[20rpx]">报案故障车牌</text>
            <text class="font-bold text-gray-800 font-mono">{{ orderDetail?.plateNo || '--' }}</text>
          </view>
          <view>
            <text class="text-gray-400 block text-[20rpx]">车型配置</text>
            <text class="font-bold text-gray-800 truncate block">{{ orderDetail?.vehicleModel || '重卡牵引车' }}</text>
          </view>
          <view>
            <text class="text-gray-400 block text-[20rpx]">报案司机</text>
            <text class="text-gray-700">{{ orderDetail?.driverName || '--' }} ({{ orderDetail?.driverPhone || '--' }})</text>
          </view>
          <view>
            <text class="text-gray-400 block text-[20rpx]">调度模式</text>
            <text class="text-gray-700 font-medium">
              {{ orderDetail?.dispatchMode === 'ASSIGNED_STATION' ? '定向指定服务站' : '平台智能极速调度' }}
            </text>
          </view>
        </view>

        <!-- 抛锚地址 -->
        <view class="pt-2 border-t border-gray-50 text-xs">
          <text class="text-gray-400 block text-[20rpx]">故障停靠路段</text>
          <view class="flex items-start gap-1 mt-0.5 text-gray-700 font-medium leading-relaxed">
            <text class="i-carbon-location text-rose-500 mt-0.5 shrink-0" />
            <text>{{ orderDetail?.rescueAddress || '--' }}</text>
          </view>
        </view>

        <!-- 故障现象简述 -->
        <view class="bg-gray-50 p-2.5 rounded-xl text-xs text-gray-700 border border-gray-100">
          <text class="text-[20rpx] text-gray-400 block font-bold mb-0.5">司机填报故障现象</text>
          <text class="leading-relaxed">{{ orderDetail?.faultDescription || '车辆突发故障无法正常行驶，请求专业救援技师带件到场检修。' }}</text>
        </view>

        <!-- 现场报案照片 -->
        <view v-if="sceneImageList.length" class="pt-1">
          <text class="text-[20rpx] text-gray-400 block mb-1.5 font-bold">报案现场照片 ({{ sceneImageList.length }}张)</text>
          <view class="grid grid-cols-4 gap-2">
            <image
              v-for="(img, idx) in sceneImageList"
              :key="idx"
              :src="img"
              class="w-full h-16 rounded-xl object-cover border border-gray-100 active:opacity-80"
              @click="previewImage(sceneImageList, img)"
            />
          </view>
        </view>
      </view>

      <!-- ② 承接网点与出警力量 (对齐 PC 端承接网点与出警力量) -->
      <view class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5">
        <view class="flex items-center justify-between pb-2 border-b border-gray-100">
          <view class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <text class="i-carbon-user-identification text-emerald-600 text-base" />
            <text>承接网点与出警力量</text>
          </view>
          <text class="text-[20rpx] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold">
            官方认证特约站
          </text>
        </view>

        <view class="space-y-2 text-xs">
          <view class="flex items-center justify-between">
            <text class="text-gray-400">承接服务站</text>
            <text class="font-bold text-gray-800">{{ orderDetail?.stationName || '卡车汇特约商用车救援站' }}</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-gray-400">出警救援车辆</text>
            <text class="font-bold font-mono text-[#1677ff]">{{ orderDetail?.technicianPlateNo || '专车整备' }}</text>
          </view>
          <view class="flex items-center justify-between pt-1 border-t border-gray-50">
            <view class="flex items-center gap-2">
              <view class="w-8 h-8 rounded-full bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold">
                <text class="i-carbon-user-avatar text-sm" />
              </view>
              <view>
                <view class="font-bold text-gray-900">{{ orderDetail?.technicianName || '出警责任技师' }}</view>
                <view class="text-[20rpx] text-gray-400 font-mono">{{ orderDetail?.technicianPhone || '--' }}</view>
              </view>
            </view>
            <button
              v-if="orderDetail?.technicianPhone"
              class="bg-emerald-50 text-emerald-700 text-[22rpx] px-3 py-1 rounded-full font-bold active:opacity-80 m-0 border border-emerald-200 flex items-center gap-1"
              @click="callPhone(orderDetail.technicianPhone)"
            >
              <text class="i-carbon-phone-filled text-xs" />
              <text>致电技师</text>
            </button>
          </view>
        </view>
      </view>

      <!-- ③ 救援作业全节点履约时间线 (对齐 PC 端救援作业节点履约时间线) -->
      <view class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <view class="flex items-center justify-between pb-2 border-b border-gray-100">
          <view class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <text class="i-carbon-time text-[#1677ff] text-base" />
            <text>救援作业节点履约时间线</text>
          </view>
          <text class="text-[20rpx] text-gray-400">端到端全链路打卡存证</text>
        </view>

        <view class="relative pl-6 space-y-4 text-xs before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
          <!-- 节点 1: 司机报案 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-gray-900">司机提交呼救报案</text>
              <text class="text-[20rpx] text-gray-400 font-mono">{{ formatDateTime(orderDetail?.createTime) }}</text>
            </view>
            <text class="text-[20rpx] text-gray-500 mt-0.5 block">系统生成单号并广播调度</text>
          </view>

          <!-- 节点 2: 网点接单派工 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-gray-900">网点接单响应并派工</text>
              <text class="text-[20rpx] text-gray-400 font-mono">{{ formatDateTime(orderDetail?.acceptTime || orderDetail?.createTime) }}</text>
            </view>
            <text class="text-[20rpx] text-gray-500 mt-0.5 block">
              指派技师: {{ orderDetail?.technicianName || '出警技师' }} (车辆: {{ orderDetail?.technicianPlateNo || '专车' }})
            </text>
          </view>

          <!-- 节点 3: 技师出警赶赴 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-gray-900">技师接单整备，全速赶赴现场</text>
              <text class="text-[20rpx] text-gray-400 font-mono">{{ formatDateTime(orderDetail?.departTime || orderDetail?.acceptTime) }}</text>
            </view>
            <text class="text-[20rpx] text-gray-500 mt-0.5 block">携带专用诊断仪与随车工器具</text>
          </view>

          <!-- 节点 4: 到场勘验 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-gray-900">到达现场打卡，展开故障抢修</text>
              <text class="text-[20rpx] text-gray-400 font-mono">{{ formatDateTime(orderDetail?.arriveTime || orderDetail?.departTime) }}</text>
            </view>
            <text class="text-[20rpx] text-gray-500 mt-0.5 block">现场安全防护与故障排查处理</text>
          </view>

          <!-- 节点 5: 完工交付 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-sm ring-2 ring-emerald-300" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-emerald-700">现场抢修完工交付与结算</text>
              <text class="text-[20rpx] font-bold text-emerald-700 font-mono">{{ formatDateTime(orderDetail?.finishTime) }}</text>
            </view>
            <text class="text-[20rpx] text-emerald-600 mt-0.5 block">车辆恢复运行，出具检修存证结论</text>
          </view>
        </view>
      </view>

      <!-- ④ 费用核定与账目清分 (对齐 PC 端费用核定与多主体账目清分) -->
      <view class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5">
        <view class="flex items-center justify-between pb-2 border-b border-gray-100">
          <view class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <text class="i-carbon-receipt text-[#1677ff] text-base" />
            <text>费用核定与多主体账目清分</text>
          </view>
          <view class="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[20rpx] px-2 py-0.5 rounded-full font-bold">
            <text class="i-carbon-checkmark-filled text-xs" />
            <text>已完成支付</text>
          </view>
        </view>

        <view class="space-y-2 text-xs">
          <view class="flex items-center justify-between">
            <text class="text-gray-500">基础预估出警服务费</text>
            <text class="font-bold text-gray-800">¥{{ orderDetail?.estimatedAmount || '300.00' }}</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-gray-500">随车自备备件材料费</text>
            <text class="font-bold text-emerald-600">¥0.00</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-gray-500">平台商城调拨材料费</text>
            <text class="font-bold text-[#1677ff]">¥0.00</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-gray-500">现场拆装工时费总计</text>
            <text class="font-bold text-amber-600">¥0.00</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-gray-500">综合增项总费用</text>
            <text class="font-bold text-gray-800">¥{{ orderDetail?.extraAmount || '0.00' }}</text>
          </view>

          <!-- 实收大红粗体 -->
          <view class="flex items-center justify-between pt-2 border-t border-gray-100">
            <text class="font-black text-gray-900 text-sm">应收/实付结算总额</text>
            <text class="text-lg font-black font-mono text-rose-600">
              ¥{{ orderDetail?.finalAmount || orderDetail?.estimatedAmount || '300.00' }}
            </text>
          </view>

          <view class="flex items-center justify-between pt-1 text-[20rpx] text-gray-400">
            <text>结算支付时间: {{ formatDateTime(orderDetail?.paymentTime || orderDetail?.finishTime) }}</text>
            <text>交易渠道: 官方沙箱通道</text>
          </view>
        </view>
      </view>

      <!-- ⑤ 完工交付与修复存证 (对齐 PC 端完工交付与修复存证) -->
      <view class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5">
        <view class="flex items-center justify-between pb-2 border-b border-gray-100">
          <view class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <text class="i-carbon-task-approved text-emerald-600 text-base" />
            <text>完工交付与修复存证</text>
          </view>
          <text class="text-[20rpx] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
            质检合格
          </text>
        </view>

        <view class="space-y-2 text-xs">
          <view class="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <text class="text-[20rpx] text-gray-400 block font-bold mb-0.5">检修报告结论</text>
            <text class="text-gray-800 leading-relaxed font-medium">
              {{ orderDetail?.finishRemark || '车辆现场故障已完全排除，各项技术参数与电路状态检测正常，准予交付恢复正常干线运行。' }}
            </text>
          </view>

          <!-- 完工照片 -->
          <view v-if="finishImageList.length" class="pt-1">
            <text class="text-[20rpx] text-gray-400 block mb-1.5 font-bold">完工交付存证照片 ({{ finishImageList.length }}张)</text>
            <view class="grid grid-cols-4 gap-2">
              <image
                v-for="(img, idx) in finishImageList"
                :key="idx"
                :src="img"
                class="w-full h-16 rounded-xl object-cover border border-gray-100 active:opacity-80"
                @click="previewImage(finishImageList, img)"
              />
            </view>
          </view>

          <!-- 官方 2 年正品质保防伪戳 -->
          <view class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between mt-2">
            <view class="flex items-center gap-2">
              <view class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shadow-sm">
                <text class="i-carbon-security" />
              </view>
              <view>
                <view class="text-xs font-bold text-emerald-950">卡车汇官方 2 年原厂正品质保</view>
                <view class="text-[20rpx] text-emerald-700 mt-0.5">全国 1200+ 特约救援网点联保 • 售后无忧</view>
              </view>
            </view>
            <view class="w-12 h-12 rounded-full border-2 border-rose-500/80 text-rose-600/90 flex flex-col items-center justify-center -rotate-12 select-none pointer-events-none">
              <text class="text-[14rpx] font-bold">卡车汇</text>
              <text class="text-[12rpx] font-black">正品存证</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ⑥ 司机服务满意度评价结果 (若已评价) -->
      <view
        v-if="orderDetail?.evaluation"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5"
      >
        <view class="flex items-center justify-between pb-2 border-b border-gray-100">
          <view class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <text class="i-carbon-favorite text-amber-500 text-base" />
            <text>司机服务满意度评价反馈</text>
          </view>
          <view class="flex items-center gap-1 text-amber-500 font-bold text-xs">
            <text class="i-carbon-star-filled text-sm" />
            <text>{{ orderDetail.evaluation.overallScore }}.0 星</text>
          </view>
        </view>

        <view class="space-y-2 text-xs">
          <view class="grid grid-cols-3 gap-2 py-1 text-center bg-amber-50/50 rounded-xl">
            <view>
              <text class="text-[20rpx] text-gray-400 block">响应时效</text>
              <text class="font-bold text-gray-800">{{ orderDetail.evaluation.speedScore || 5 }}.0 分</text>
            </view>
            <view>
              <text class="text-[20rpx] text-gray-400 block">抢修质量</text>
              <text class="font-bold text-gray-800">{{ orderDetail.evaluation.qualityScore || 5 }}.0 分</text>
            </view>
            <view>
              <text class="text-[20rpx] text-gray-400 block">服务态度</text>
              <text class="font-bold text-gray-800">{{ orderDetail.evaluation.attitudeScore || 5 }}.0 分</text>
            </view>
          </view>

          <!-- 评价标签 -->
          <view v-if="orderDetail.evaluation.tags && orderDetail.evaluation.tags.length" class="flex flex-wrap gap-1.5 pt-1">
            <view
              v-for="tag in orderDetail.evaluation.tags"
              :key="tag"
              class="bg-blue-50 text-[#1677ff] text-[20rpx] px-2.5 py-0.5 rounded-full font-bold"
            >
              # {{ tag }}
            </view>
          </view>

          <!-- 评语内容 -->
          <view v-if="orderDetail.evaluation.commentContent" class="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-700 italic">
            "{{ orderDetail.evaluation.commentContent }}"
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 底部固定操作底栏 -->
    <view class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shadow-lg z-30">
      <button
        class="bg-gray-100 text-gray-700 text-xs py-2.5 px-4 rounded-xl font-bold active:opacity-80 m-0 border-none flex items-center gap-1"
        @click="callCustomerService"
      >
        <text class="i-carbon-headset text-sm" />
        <text>官方客服</text>
      </button>

      <view class="flex items-center gap-2 flex-1 justify-end">
        <button
          class="bg-white border border-gray-300 text-gray-700 text-xs py-2.5 px-4 rounded-xl font-bold active:bg-gray-50 m-0"
          @click="gotoHome"
        >
          返回首页
        </button>
        <button
          class="bg-[#1677ff] text-white text-xs py-2.5 px-5 rounded-xl font-bold active:opacity-90 m-0 border-none shadow-md"
          @click="gotoCreateRescue"
        >
          再次呼叫救援
        </button>
      </view>
    </view>
  </view>
</template>
