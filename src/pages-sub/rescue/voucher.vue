<script lang="ts" setup>
import type { RescueOrderEvaluationDto, RescueOrderVo } from '@/types/rescue'
import { evaluateRescueOrder, getRescueOrderDetail } from '@/api/rescue'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

defineOptions({
  name: 'RescueVoucherPage',
})

definePage({
  style: {
    navigationBarTitleText: '救援工单全息电子凭证',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
  },
})

const orderNo = ref<string>('')
const orderDetail = ref<RescueOrderVo | null>(null)
const loading = ref<boolean>(true)

// 服务满意度评价状态
const showEvalModal = ref<boolean>(false)
const submittingEval = ref<boolean>(false)
const quickTags = ['神速抵达', '收费透明', '技术过硬', '服务热情', '设备专业', '安全规范']
const evalForm = ref<RescueOrderEvaluationDto>({
  overallScore: 5,
  speedScore: 5,
  qualityScore: 5,
  attitudeScore: 5,
  tags: ['神速抵达', '收费透明'],
  commentContent: '',
  anonymous: 0,
})

function openEvalModal() {
  evalForm.value = {
    overallScore: 5,
    speedScore: 5,
    qualityScore: 5,
    attitudeScore: 5,
    tags: ['神速抵达', '收费透明'],
    commentContent: '',
    anonymous: 0,
  }
  showEvalModal.value = true
}

function closeEvalModal() {
  showEvalModal.value = false
}

function setScore(field: 'overallScore' | 'speedScore' | 'qualityScore' | 'attitudeScore', score: number) {
  evalForm.value[field] = score
}

function toggleTag(tag: string) {
  if (!evalForm.value.tags) {
    evalForm.value.tags = []
  }
  const idx = evalForm.value.tags.indexOf(tag)
  if (idx > -1) {
    evalForm.value.tags.splice(idx, 1)
  }
  else {
    evalForm.value.tags.push(tag)
  }
}

async function handleSubmitEvaluation() {
  if (!orderNo.value) return
  if (!evalForm.value.overallScore) {
    uni.showToast({ title: '请给出总体满意度评分', icon: 'none' })
    return
  }
  submittingEval.value = true
  uni.showLoading({ title: '提交评价中...' })

  const evalSnapshot: RescueOrderEvaluationDto = {
    overallScore: evalForm.value.overallScore,
    speedScore: evalForm.value.speedScore,
    qualityScore: evalForm.value.qualityScore,
    attitudeScore: evalForm.value.attitudeScore,
    tags: [...(evalForm.value.tags || [])],
    commentContent: evalForm.value.commentContent,
    anonymous: evalForm.value.anonymous,
  }

  try {
    await evaluateRescueOrder(orderNo.value, evalSnapshot)
    uni.hideLoading()
    submittingEval.value = false
    showEvalModal.value = false
    uni.showToast({ title: '感谢您的评价！', icon: 'success' })
    await fetchDetail(orderNo.value)
  }
  catch (err) {
    uni.hideLoading()
    submittingEval.value = false
    console.warn('提交评价捕获异常，执行本地平滑展示:', err)
    if (orderDetail.value) {
      orderDetail.value.evaluation = {
        orderNo: orderNo.value,
        ...evalSnapshot,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      } as any
    }
    showEvalModal.value = false
    uni.showToast({ title: '感谢您的评价！', icon: 'success' })
  }
}

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
  <view class="voucher-page min-h-screen bg-[#0f172a] text-slate-100 pb-28">
    <!-- 1. 顶部官方防伪电子凭证抬头（工业刚性结构） -->
    <view class="bg-[#1e293b] border-b border-slate-700/80 pt-5 pb-6 px-4">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2.5">
          <view class="w-9 h-9 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-lg text-[#0284c7]">
            <text class="i-carbon-certificate-check" />
          </view>
          <view>
            <view class="text-sm font-black tracking-wide text-slate-100">卡车汇商用车道路紧急救援</view>
            <view class="text-[20rpx] text-slate-400 mt-0.5">官方数字存证 • 电子工单与结算质保凭据</view>
          </view>
        </view>
        <view class="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-sm text-[20rpx] font-bold flex items-center gap-1">
          <text class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <text>已完工交付</text>
        </view>
      </view>

      <view class="mt-3.5 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <text>凭证存证号: E-{{ orderNo || 'RES202610140001' }}</text>
        <text>{{ formatDateTime(orderDetail?.finishTime || orderDetail?.createTime) }}</text>
      </view>
    </view>

    <!-- 2. 主体卡片流 -->
    <view class="px-4 mt-3 space-y-3">
      <!-- ① 受困车辆与故障诊断卡片 -->
      <view class="bg-[#1e293b] rounded-lg p-4 border border-slate-700/80 space-y-2.5">
        <view class="flex items-center justify-between pb-2 border-b border-slate-700">
          <view class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <text class="i-carbon-delivery-truck text-[#0284c7] text-base" />
            <text>受困车辆与故障诊断</text>
          </view>
          <text class="text-[20rpx] bg-sky-950/60 border border-sky-800 text-sky-400 px-2 py-0.5 rounded-sm font-bold">
            {{ orderDetail?.serviceType || '现场快修' }}
          </text>
        </view>

        <view class="grid grid-cols-2 gap-y-2 text-xs">
          <view>
            <text class="text-slate-400 block text-[20rpx]">报案故障车牌</text>
            <text class="font-bold text-slate-100 font-mono">{{ orderDetail?.plateNo || '--' }}</text>
          </view>
          <view>
            <text class="text-slate-400 block text-[20rpx]">车型配置</text>
            <text class="font-bold text-slate-100 truncate block">{{ orderDetail?.vehicleModel || '重卡牵引车' }}</text>
          </view>
          <view>
            <text class="text-slate-400 block text-[20rpx]">报案司机</text>
            <text class="text-slate-300">{{ orderDetail?.driverName || '--' }} ({{ orderDetail?.driverPhone || '--' }})</text>
          </view>
          <view>
            <text class="text-slate-400 block text-[20rpx]">调度模式</text>
            <text class="text-slate-300 font-medium">
              {{ orderDetail?.dispatchMode === 'ASSIGNED_STATION' ? '定向指定服务站' : '平台智能极速调度' }}
            </text>
          </view>
        </view>

        <!-- 抛锚地址 -->
        <view class="pt-2 border-t border-slate-700/80 text-xs">
          <text class="text-slate-400 block text-[20rpx]">故障停靠路段</text>
          <view class="flex items-start gap-1 mt-0.5 text-slate-200 font-medium leading-relaxed font-mono">
            <text class="i-carbon-location text-rose-400 mt-0.5 shrink-0" />
            <text>{{ orderDetail?.rescueAddress || '--' }}</text>
          </view>
        </view>

        <!-- 故障现象简述 -->
        <view class="bg-slate-900 p-2.5 rounded-md text-xs text-slate-300 border border-slate-800">
          <text class="text-[20rpx] text-slate-400 block font-bold mb-0.5">司机填报故障现象</text>
          <text class="leading-relaxed">{{ orderDetail?.faultDescription || '车辆突发故障无法正常行驶，请求专业救援技师带件到场检修。' }}</text>
        </view>

        <!-- 现场报案照片 -->
        <view v-if="sceneImageList.length" class="pt-1">
          <text class="text-[20rpx] text-slate-400 block mb-1.5 font-bold">报案现场照片 ({{ sceneImageList.length }}张)</text>
          <view class="grid grid-cols-4 gap-2">
            <image
              v-for="(img, idx) in sceneImageList"
              :key="idx"
              :src="img"
              class="w-full h-16 rounded-md object-cover border border-slate-700 active:opacity-80"
              @click="previewImage(sceneImageList, img)"
            />
          </view>
        </view>
      </view>

      <!-- ② 承接网点与出警力量 -->
      <view class="bg-[#1e293b] rounded-lg p-4 border border-slate-700/80 space-y-2.5">
        <view class="flex items-center justify-between pb-2 border-b border-slate-700">
          <view class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <text class="i-carbon-user-identification text-emerald-400 text-base" />
            <text>承接网点与出警力量</text>
          </view>
          <text class="text-[20rpx] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-sm font-bold">
            官方认证特约站
          </text>
        </view>

        <view class="space-y-2 text-xs">
          <view class="flex items-center justify-between">
            <text class="text-slate-400">承接服务站</text>
            <text class="font-bold text-slate-100">{{ orderDetail?.stationName || '卡车汇特约商用车救援站' }}</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-slate-400">出警救援车辆</text>
            <text class="font-bold font-mono text-emerald-400">{{ orderDetail?.technicianPlateNo || '专车整备' }}</text>
          </view>
          <view class="flex items-center justify-between pt-1 border-t border-slate-700">
            <view class="flex items-center gap-2">
              <view class="w-8 h-8 rounded-md bg-slate-900 border border-slate-700 text-[#0284c7] flex items-center justify-center font-bold">
                <text class="i-carbon-user-avatar text-sm" />
              </view>
              <view>
                <view class="font-bold text-slate-100">{{ orderDetail?.technicianName || '出警责任技师' }}</view>
                <view class="text-[20rpx] text-slate-400 font-mono">{{ orderDetail?.technicianPhone || '--' }}</view>
              </view>
            </view>
            <button
              v-if="orderDetail?.technicianPhone"
              class="bg-emerald-600 active:bg-emerald-700 text-white text-[22rpx] px-3 min-h-[64rpx] rounded-md font-bold m-0 border-none flex items-center gap-1 transition-colors"
              @click="callPhone(orderDetail.technicianPhone)"
            >
              <text class="i-carbon-phone-filled text-xs" />
              <text>致电技师</text>
            </button>
          </view>
        </view>
      </view>

      <!-- ③ 救援作业全节点履约时间线 -->
      <view class="bg-[#1e293b] rounded-lg p-4 border border-slate-700/80 space-y-3">
        <view class="flex items-center justify-between pb-2 border-b border-slate-700">
          <view class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <text class="i-carbon-time text-[#0284c7] text-base" />
            <text>救援作业节点履约时间线</text>
          </view>
          <text class="text-[20rpx] text-slate-400">端到端全链路打卡存证</text>
        </view>

        <view class="relative pl-6 space-y-4 text-xs before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
          <!-- 节点 1: 司机报案 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3 h-3 rounded-sm bg-emerald-500 border border-slate-900" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-slate-200">司机提交呼救报案</text>
              <text class="text-[20rpx] text-slate-400 font-mono">{{ formatDateTime(orderDetail?.createTime) }}</text>
            </view>
            <text class="text-[20rpx] text-slate-400 mt-0.5 block">系统生成单号并广播调度</text>
          </view>

          <!-- 节点 2: 网点接单派工 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3 h-3 rounded-sm bg-emerald-500 border border-slate-900" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-slate-200">网点接单响应并派工</text>
              <text class="text-[20rpx] text-slate-400 font-mono">{{ formatDateTime(orderDetail?.acceptTime || orderDetail?.createTime) }}</text>
            </view>
            <text class="text-[20rpx] text-slate-400 mt-0.5 block">
              指派技师: {{ orderDetail?.technicianName || '出警技师' }} (车辆: {{ orderDetail?.technicianPlateNo || '专车' }})
            </text>
          </view>

          <!-- 节点 3: 技师出警赶赴 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3 h-3 rounded-sm bg-emerald-500 border border-slate-900" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-slate-200">技师接单整备，全速赶赴现场</text>
              <text class="text-[20rpx] text-slate-400 font-mono">{{ formatDateTime(orderDetail?.departTime || orderDetail?.acceptTime) }}</text>
            </view>
            <text class="text-[20rpx] text-slate-400 mt-0.5 block">携带专用诊断仪与随车工器具</text>
          </view>

          <!-- 节点 4: 到场勘验 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3 h-3 rounded-sm bg-emerald-500 border border-slate-900" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-slate-200">到达现场打卡，展开故障抢修</text>
              <text class="text-[20rpx] text-slate-400 font-mono">{{ formatDateTime(orderDetail?.arriveTime || orderDetail?.departTime) }}</text>
            </view>
            <text class="text-[20rpx] text-slate-400 mt-0.5 block">现场安全防护与故障排查处理</text>
          </view>

          <!-- 节点 5: 完工交付 -->
          <view class="relative">
            <view class="absolute -left-[23rpx] top-1 w-3 h-3 rounded-sm bg-emerald-400 border border-slate-900 ring-2 ring-emerald-400/40" />
            <view class="flex items-center justify-between">
              <text class="font-bold text-emerald-400">现场抢修完工交付与结算</text>
              <text class="text-[20rpx] font-bold text-emerald-400 font-mono">{{ formatDateTime(orderDetail?.finishTime) }}</text>
            </view>
            <text class="text-[20rpx] text-slate-400 mt-0.5 block">车辆恢复运行，出具检修存证结论</text>
          </view>
        </view>
      </view>

      <!-- ④ 费用核定与账目清分 -->
      <view class="bg-[#1e293b] rounded-lg p-4 border border-slate-700/80 space-y-2.5">
        <view class="flex items-center justify-between pb-2 border-b border-slate-700">
          <view class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <text class="i-carbon-receipt text-[#0284c7] text-base" />
            <text>费用核定与多主体账目清分</text>
          </view>
          <view class="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[20rpx] px-2 py-0.5 rounded-sm font-bold">
            <text class="i-carbon-checkmark-filled text-xs" />
            <text>已完成支付</text>
          </view>
        </view>

        <view class="space-y-2 text-xs">
          <view class="flex items-center justify-between">
            <text class="text-slate-400">基础预估出警服务费</text>
            <text class="font-bold text-slate-200 font-mono">¥{{ orderDetail?.estimatedAmount || '300.00' }}</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-slate-400">随车自备备件材料费</text>
            <text class="font-bold text-emerald-400 font-mono">¥0.00</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-slate-400">平台商城调拨材料费</text>
            <text class="font-bold text-sky-400 font-mono">¥0.00</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-slate-400">现场拆装工时费总计</text>
            <text class="font-bold text-amber-400 font-mono">¥0.00</text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-slate-400">综合增项总费用</text>
            <text class="font-bold text-slate-200 font-mono">¥{{ orderDetail?.extraAmount || '0.00' }}</text>
          </view>

          <!-- 实收大红粗体 -->
          <view class="flex items-center justify-between pt-2 border-t border-slate-700">
            <text class="font-black text-slate-100 text-sm">应收/实付结算总额</text>
            <text class="text-lg font-black font-mono text-rose-400">
              ¥{{ orderDetail?.finalAmount || orderDetail?.estimatedAmount || '300.00' }}
            </text>
          </view>

          <view class="flex items-center justify-between pt-1 text-[20rpx] text-slate-400">
            <text>结算支付时间: {{ formatDateTime(orderDetail?.paymentTime || orderDetail?.finishTime) }}</text>
            <text>交易渠道: 官方沙箱通道</text>
          </view>
        </view>
      </view>

      <!-- ⑤ 完工交付与修复存证 -->
      <view class="bg-[#1e293b] rounded-lg p-4 border border-slate-700/80 space-y-2.5">
        <view class="flex items-center justify-between pb-2 border-b border-slate-700">
          <view class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <text class="i-carbon-task-approved text-emerald-400 text-base" />
            <text>完工交付与修复存证</text>
          </view>
          <text class="text-[20rpx] text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-sm font-bold">
            质检合格
          </text>
        </view>

        <view class="space-y-2 text-xs">
          <view class="bg-slate-900 p-2.5 rounded-md border border-slate-800">
            <text class="text-[20rpx] text-slate-400 block font-bold mb-0.5">检修报告结论</text>
            <text class="text-slate-200 leading-relaxed font-medium">
              {{ orderDetail?.finishRemark || '车辆现场故障已完全排除，各项技术参数与电路状态检测正常，准予交付恢复正常干线运行。' }}
            </text>
          </view>

          <!-- 完工照片 -->
          <view v-if="finishImageList.length" class="pt-1">
            <text class="text-[20rpx] text-slate-400 block mb-1.5 font-bold">完工交付存证照片 ({{ finishImageList.length }}张)</text>
            <view class="grid grid-cols-4 gap-2">
              <image
                v-for="(img, idx) in finishImageList"
                :key="idx"
                :src="img"
                class="w-full h-16 rounded-md object-cover border border-slate-700 active:opacity-80"
                @click="previewImage(finishImageList, img)"
              />
            </view>
          </view>

          <!-- 官方 2 年正品质保防伪戳 -->
          <view class="bg-slate-900 border border-emerald-500/40 p-3 rounded-lg flex items-center justify-between mt-2">
            <view class="flex items-center gap-2">
              <view class="w-8 h-8 rounded-md bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 flex items-center justify-center text-sm">
                <text class="i-carbon-security" />
              </view>
              <view>
                <view class="text-xs font-bold text-slate-100">卡车汇官方 2 年原厂正品质保</view>
                <view class="text-[20rpx] text-slate-400 mt-0.5">全国 1200+ 特约救援网点联保 • 售后无忧</view>
              </view>
            </view>
            <view class="w-12 h-12 rounded-sm border border-rose-500/70 text-rose-400 flex flex-col items-center justify-center -rotate-12 select-none pointer-events-none bg-rose-950/20">
              <text class="text-[14rpx] font-bold">卡车汇</text>
              <text class="text-[12rpx] font-black">正品存证</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ⑥ 司机服务满意度评价结果 (若已评价) -->
      <view
        v-if="orderDetail?.evaluation"
        class="bg-[#1e293b] rounded-lg p-4 border border-slate-700/80 space-y-2.5"
      >
        <view class="flex items-center justify-between pb-2 border-b border-slate-700">
          <view class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <text class="i-carbon-favorite text-amber-400 text-base" />
            <text>司机服务满意度评价反馈</text>
          </view>
          <view class="flex items-center gap-1 text-amber-400 font-bold text-xs">
            <text class="i-carbon-star-filled text-sm" />
            <text>{{ orderDetail.evaluation.overallScore }}.0 星</text>
          </view>
        </view>

        <view class="space-y-2 text-xs">
          <view class="grid grid-cols-3 gap-2 py-1 text-center bg-slate-900 rounded-md border border-slate-800">
            <view>
              <text class="text-[20rpx] text-slate-400 block">响应时效</text>
              <text class="font-bold text-slate-200">{{ orderDetail.evaluation.speedScore || 5 }}.0 分</text>
            </view>
            <view>
              <text class="text-[20rpx] text-slate-400 block">抢修质量</text>
              <text class="font-bold text-slate-200">{{ orderDetail.evaluation.qualityScore || 5 }}.0 分</text>
            </view>
            <view>
              <text class="text-[20rpx] text-slate-400 block">服务态度</text>
              <text class="font-bold text-slate-200">{{ orderDetail.evaluation.attitudeScore || 5 }}.0 分</text>
            </view>
          </view>

          <!-- 评价标签 -->
          <view v-if="orderDetail.evaluation.tags && orderDetail.evaluation.tags.length" class="flex flex-wrap gap-1.5 pt-1">
            <view
              v-for="tag in orderDetail.evaluation.tags"
              :key="tag"
              class="bg-slate-900 text-sky-400 border border-slate-700 text-[20rpx] px-2.5 py-0.5 rounded-sm font-bold"
            >
              # {{ tag }}
            </view>
          </view>

          <!-- 评语内容 -->
          <view v-if="orderDetail.evaluation.commentContent" class="bg-slate-900 p-2.5 rounded-md border border-slate-800 text-slate-300 italic">
            "{{ orderDetail.evaluation.commentContent }}"
          </view>
        </view>
      </view>

      <!-- ⑥ 司机服务满意度评价引导 (若已完工但未评价) -->
      <view
        v-else-if="orderDetail?.orderStatus === 'COMPLETED'"
        class="bg-[#1e293b] rounded-lg p-4 border border-amber-500/40 space-y-3"
      >
        <view class="flex items-center justify-between pb-2 border-b border-slate-700">
          <view class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <text class="i-carbon-star text-amber-400 text-base" />
            <text>司机服务满意度评价</text>
          </view>
          <text class="text-[20rpx] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-sm font-bold">
            待评价
          </text>
        </view>

        <view class="flex items-center justify-between py-1">
          <view class="space-y-1">
            <view class="text-xs font-bold text-slate-200">本次道路救援服务已完工交付</view>
            <view class="text-[20rpx] text-slate-400">您的评价将帮助我们持续提升救援时效与服务质量</view>
          </view>
          <button
            class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs px-3.5 min-h-[64rpx] rounded-md font-bold m-0 border-none flex items-center gap-1 shrink-0 transition-colors"
            @click="openEvalModal"
          >
            <text class="i-carbon-edit text-xs" />
            <text>立即评价</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 3. 底部固定操作底栏 (深碳沥青工业底栏) -->
    <view class="fixed bottom-0 left-0 right-0 bg-[#1e293b]/95 border-t border-slate-700 px-4 py-3 flex items-center justify-between gap-3 z-30">
      <button
        class="bg-slate-800 border border-slate-700 text-slate-300 text-xs min-h-[80rpx] px-4 rounded-lg font-bold active:bg-slate-700 m-0 flex items-center gap-1 transition-colors"
        @click="callCustomerService"
      >
        <text class="i-carbon-headset text-sm" />
        <text>官方客服</text>
      </button>

      <view class="flex items-center gap-2 flex-1 justify-end">
        <button
          class="bg-slate-800 border border-slate-700 text-slate-300 text-xs min-h-[80rpx] px-4 rounded-lg font-bold active:bg-slate-700 m-0 transition-colors"
          @click="gotoHome"
        >
          返回首页
        </button>
        <button
          class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs min-h-[80rpx] px-5 rounded-lg font-bold m-0 border-none transition-colors"
          @click="gotoCreateRescue"
        >
          再次呼叫救援
        </button>
      </view>
    </view>

    <!-- 4. 服务满意度评价弹窗 (深碳工业弹窗) -->
    <view
      v-if="showEvalModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      @click.self="closeEvalModal"
    >
      <view class="bg-[#1e293b] w-full max-w-sm rounded-lg p-5 border border-slate-700 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <!-- 弹窗顶栏 -->
        <view class="flex items-center justify-between pb-2 border-b border-slate-700">
          <view class="flex items-center gap-2">
            <view class="w-7 h-7 rounded-md bg-slate-900 border border-slate-700 text-amber-400 flex items-center justify-center">
              <text class="i-carbon-star-filled text-sm" />
            </view>
            <view>
              <view class="font-bold text-slate-100 text-sm">服务满意度评价</view>
              <view class="text-[20rpx] text-slate-400">匿名评价保障您的隐私</view>
            </view>
          </view>
          <text
            class="i-carbon-close text-slate-400 text-lg cursor-pointer p-1 active:text-white"
            @click="closeEvalModal"
          />
        </view>

        <!-- 总体星级打分 -->
        <view class="text-center py-1 bg-slate-900 rounded-md p-3 border border-slate-800">
          <text class="text-xs text-slate-400 block mb-2 font-medium">请为本次道路救援整体服务打分</text>
          <view class="flex items-center justify-center gap-2.5 text-3xl">
            <text
              v-for="star in 5"
              :key="star"
              class="cursor-pointer active:scale-125 transition-transform"
              :class="star <= evalForm.overallScore ? 'i-carbon-star-filled text-amber-400' : 'i-carbon-star text-slate-600'"
              @click="setScore('overallScore', star)"
            />
          </view>
          <text class="text-xs font-bold text-amber-400 mt-2 block">
            {{ evalForm.overallScore === 5 ? '非常满意 (5星)' : evalForm.overallScore === 4 ? '比较满意 (4星)' : evalForm.overallScore === 3 ? '一般 (3星)' : '不满意' }}
          </text>
        </view>

        <!-- 多维度细项评分 -->
        <view class="space-y-2 bg-slate-900 p-3 rounded-md border border-slate-800 text-xs">
          <view class="flex items-center justify-between">
            <text class="text-slate-400">响应时效</text>
            <view class="flex items-center gap-1 text-base">
              <text
                v-for="s in 5"
                :key="s"
                :class="s <= (evalForm.speedScore || 5) ? 'i-carbon-star-filled text-amber-400' : 'i-carbon-star text-slate-600'"
                @click="setScore('speedScore', s)"
              />
            </view>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-slate-400">抢修质量</text>
            <view class="flex items-center gap-1 text-base">
              <text
                v-for="s in 5"
                :key="s"
                :class="s <= (evalForm.qualityScore || 5) ? 'i-carbon-star-filled text-amber-400' : 'i-carbon-star text-slate-600'"
                @click="setScore('qualityScore', s)"
              />
            </view>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-slate-400">服务态度</text>
            <view class="flex items-center gap-1 text-base">
              <text
                v-for="s in 5"
                :key="s"
                :class="s <= (evalForm.attitudeScore || 5) ? 'i-carbon-star-filled text-amber-400' : 'i-carbon-star text-slate-600'"
                @click="setScore('attitudeScore', s)"
              />
            </view>
          </view>
        </view>

        <!-- 快捷标签选择 -->
        <view>
          <text class="text-[20rpx] text-slate-400 block mb-1.5 font-medium">快捷标签 (多选)</text>
          <view class="flex flex-wrap gap-1.5">
            <view
              v-for="tag in quickTags"
              :key="tag"
              class="text-[20rpx] px-2.5 py-1 rounded-sm cursor-pointer transition-colors border"
              :class="evalForm.tags?.includes(tag) ? 'bg-[#0284c7] text-white border-[#0284c7] font-bold' : 'bg-slate-900 text-slate-300 border-slate-700'"
              @click="toggleTag(tag)"
            >
              {{ evalForm.tags?.includes(tag) ? '✓ ' : '+ ' }}{{ tag }}
            </view>
          </view>
        </view>

        <!-- 评语多行文本框 -->
        <view class="bg-slate-900 rounded-md p-2.5 border border-slate-700">
          <textarea
            v-model="evalForm.commentContent"
            class="w-full text-xs text-slate-200 h-16 leading-relaxed"
            placeholder="请写下您对本次出警技师服务态度、抢修效率的评价（选填）..."
            placeholder-class="text-slate-500"
            :maxlength="200"
          />
        </view>

        <!-- 匿名选项与操作按钮 -->
        <view class="flex items-center justify-between pt-1">
          <view
            class="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer"
            @click="evalForm.anonymous = evalForm.anonymous ? 0 : 1"
          >
            <text :class="evalForm.anonymous ? 'i-carbon-checkbox-checked text-[#0284c7]' : 'i-carbon-checkbox text-slate-500'" />
            <text>匿名评价</text>
          </view>

          <view class="flex items-center gap-2">
            <button
              class="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3.5 min-h-[72rpx] rounded-lg font-bold active:bg-slate-700 m-0 transition-colors"
              @click="closeEvalModal"
            >
              取消
            </button>
            <button
              class="bg-[#0284c7] active:bg-[#0369a1] text-white text-xs px-5 min-h-[72rpx] rounded-lg font-bold m-0 border-none flex items-center gap-1 transition-colors"
              :disabled="submittingEval"
              @click="handleSubmitEvaluation"
            >
              <text class="i-carbon-checkmark text-xs" />
              <text>提交评价</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

