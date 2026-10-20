<script lang="ts" setup>
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineOptions({
  name: 'DiagnosisPage',
})

definePage({
  style: {
    navigationBarTitleText: '智能诊断',
    navigationBarBackgroundColor: '#0284c7',
    navigationBarTextStyle: 'white',
  },
})

const mallStore = useMallSessionStore()
const { brands, selectedModel } = storeToRefs(mallStore)

// 当前选中的品牌索引
const activeBrandId = ref('DFCV')

// 专家推荐列表（对标智能诊断详情图）
const expertList = ref([
  {
    id: 'EXP-01',
    name: '周工',
    title: '东风商用车原厂认证总工',
    tag: '发动机/后处理专家',
    experience: '18年工龄',
    solvedCount: 3240,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    online: true,
  },
  {
    id: 'EXP-02',
    name: '张师傅',
    title: '金牌重卡电气技师',
    tag: '线路电路/ECU电控',
    experience: '15年工龄',
    solvedCount: 2890,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    online: true,
  },
  {
    id: 'EXP-03',
    name: '陈工',
    title: '法士特变速箱特约顾问',
    tag: '传动总成/底盘制动',
    experience: '12年工龄',
    solvedCount: 1680,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    online: false,
  },
])

// 常见故障诊断矩阵
const faultCategories = ref([
  {
    id: 'ENG',
    name: '发动机与排气系统',
    icon: 'i-carbon-meter',
    color: '#ef4444',
    symptoms: [
      { name: '发动机高温水温报警', recommendedPart: '原厂节温器总成', partId: 'PART-001' },
      { name: '加速无力冒黑烟', recommendedPart: '共轨高压油泵', partId: 'PART-001' },
      { name: '机油压力过低报警', recommendedPart: '机油感应塞/机滤', partId: 'PART-001' },
      { name: 'DPF/SCR尿素限扭矩', recommendedPart: '原厂尿素喷嘴', partId: 'PART-001' },
    ],
  },
  {
    id: 'ELEC',
    name: '全车电气与电控线路',
    icon: 'i-carbon-flash',
    color: '#f59e0b',
    symptoms: [
      { name: '起动机卡死无反应', recommendedPart: '原厂减速起动机', partId: 'PART-002' },
      { name: '仪表盘CAN总线掉线', recommendedPart: '全车线束检修', partId: 'PART-002' },
      { name: '发电机不发电亏电', recommendedPart: '大功率交流发电机', partId: 'PART-002' },
      { name: '车灯全车闪烁/断电', recommendedPart: '主电源继电器', partId: 'PART-002' },
    ],
  },
  {
    id: 'TRANS',
    name: '传动与变速箱总成',
    icon: 'i-carbon-settings',
    color: '#0284c7',
    symptoms: [
      { name: '挂挡异响/打齿掉挡', recommendedPart: '法士特变速箱总成', partId: 'PART-003' },
      { name: '离合器沉重发卡打滑', recommendedPart: '离合器压盘及从动盘', partId: 'PART-003' },
      { name: '传动轴高速共振抖动', recommendedPart: '中间支承轴承', partId: 'PART-003' },
    ],
  },
  {
    id: 'BRAKE',
    name: '气路与气压制动系统',
    icon: 'i-carbon-warning-alt',
    color: '#8b5cf6',
    symptoms: [
      { name: '气压上升慢/干燥筒漏气', recommendedPart: '原厂空气干燥器', partId: 'PART-004' },
      { name: '刹车跑偏/制动距离过长', recommendedPart: '刹车分泵及蹄片', partId: 'PART-004' },
      { name: 'ABS报警灯常亮', recommendedPart: '轮速传感器总成', partId: 'PART-004' },
    ],
  },
])

// 选中的故障诊断弹窗状态
const showModal = ref(false)
const selectedFault = ref<any>(null)

function openFaultGuide(symptom: any) {
  selectedFault.value = symptom
  showModal.value = true
}

function consultExpert(expert: any) {
  uni.showModal({
    title: `连线 ${expert.name}`,
    content: `即将发起与【${expert.title}】的 1v1 故障远程音视频指导，是否继续？`,
    confirmColor: '#0284c7',
    confirmText: '立即连线',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已接通专家客服坐席', icon: 'success' })
      }
    },
  })
}

function gotoPartDetail() {
  showModal.value = false
  uni.navigateTo({ url: '/pages-sub/mall/parts-detail' })
}

function callRescue() {
  showModal.value = false
  uni.navigateTo({ url: '/pages-sub/rescue/create?type=ENGINE' })
}
</script>

<template>
  <view class="diagnosis-page min-h-screen bg-[#f8fafc] pb-24">
    <!-- 1. 顶部品牌滑动栏：深碳与信标蓝交融机能顶栏 -->
    <view class="bg-gradient-to-b from-[#0f172a] via-[#0369a1] to-[#0284c7] pt-3.5 pb-5 px-4 text-white rounded-b-2xl border-b border-sky-400/20">
      <view class="flex items-center justify-between">
        <view class="text-base font-extrabold tracking-tight text-white">
          重卡全生命周期智能诊断
        </view>
        <view class="text-[20rpx] bg-black/25 border border-white/20 px-2 py-0.5 rounded-sm font-bold">
          当前车型: {{ selectedModel.name.slice(0, 10) }}
        </view>
      </view>

      <!-- 品牌横滑 -->
      <scroll-view scroll-x class="whitespace-nowrap mt-3 -mx-2">
        <view class="flex items-center gap-2 px-2">
          <view
            v-for="brand in brands"
            :key="brand.id"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all border"
            :class="activeBrandId === brand.id ? 'bg-white text-[#0284c7] border-white' : 'bg-black/20 text-slate-100 border-white/10 active:opacity-80'"
            @click="activeBrandId = brand.id"
          >
            <text class="text-xs">{{ brand.logo }}</text>
            <text>{{ brand.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 2. 在线技术专家推荐卡片横滑 -->
    <view class="mx-4 mt-3">
      <view class="flex items-center justify-between mb-2">
        <view class="flex items-center gap-1.5">
          <view class="w-1 h-3.5 bg-[#0284c7] rounded-sm" />
          <text class="text-sm font-bold text-slate-900">原厂特邀技术专家</text>
          <text class="text-[20rpx] text-[#0284c7] bg-sky-50 border border-sky-200/80 px-1.5 py-0.2 rounded-sm font-bold">1对1解答</text>
        </view>
        <text class="text-xs text-slate-400 font-medium">平均1分钟响应</text>
      </view>

      <scroll-view scroll-x class="whitespace-nowrap -mx-1">
        <view class="flex items-center gap-2.5 px-1">
          <view
            v-for="expert in expertList"
            :key="expert.id"
            class="inline-block w-64 bg-white rounded-lg p-3 border border-slate-200/80 align-top"
          >
            <view class="flex items-center gap-2.5">
              <view class="relative">
                <image
                  :src="expert.avatar"
                  class="w-11 h-11 rounded-md object-cover bg-slate-100 border border-slate-200"
                />
                <view
                  v-if="expert.online"
                  class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-sm"
                />
              </view>
              <view class="flex-1 overflow-hidden">
                <view class="flex items-center gap-1">
                  <text class="text-xs font-bold text-slate-900">{{ expert.name }}</text>
                  <text class="text-[18rpx] bg-sky-50 text-[#0284c7] border border-sky-200/80 px-1 py-0.2 rounded-sm font-bold">{{ expert.experience }}</text>
                </view>
                <view class="text-[20rpx] text-slate-500 truncate mt-0.5 font-medium">
                  {{ expert.title }}
                </view>
              </view>
            </view>

            <view class="mt-2 text-[20rpx] text-slate-700 bg-slate-50 border border-slate-100 p-1.5 rounded-md font-medium">
              擅长领域：{{ expert.tag }}
            </view>

            <view class="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
              <text class="text-[20rpx] text-slate-400 font-medium">已排查解决 {{ expert.solvedCount }} 例</text>
              <button
                class="bg-[#0284c7] text-white text-xs px-3.5 h-7 rounded-md font-bold active:bg-[#0369a1] m-0 flex items-center justify-center border-none"
                @click="consultExpert(expert)"
              >
                立即咨询
              </button>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 3. 常见故障诊断矩阵 -->
    <view class="mx-4 mt-4">
      <view class="flex items-center justify-between mb-2.5">
        <view class="flex items-center gap-1.5">
          <view class="w-1 h-3.5 bg-red-600 rounded-sm" />
          <text class="text-sm font-bold text-slate-900">故障自查诊断库</text>
        </view>
        <text class="text-[20rpx] text-slate-400 font-medium">点击诊断症状查看推荐对策</text>
      </view>

      <view class="space-y-3">
        <view
          v-for="cat in faultCategories"
          :key="cat.id"
          class="bg-white rounded-lg p-3.5 border border-slate-200/80"
        >
          <view class="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-100">
            <view
              class="w-7 h-7 rounded-md flex items-center justify-center text-sm border"
              :style="{
                backgroundColor: `${cat.color}12`,
                borderColor: `${cat.color}30`,
                color: cat.color,
              }"
            >
              <text :class="cat.icon" />
            </view>
            <text class="text-xs font-bold text-slate-900">{{ cat.name }}</text>
          </view>

          <!-- 故障现象芯片：中圆角与 1px 细边框 -->
          <view class="grid grid-cols-2 gap-2">
            <view
              v-for="symptom in cat.symptoms"
              :key="symptom.name"
              class="p-2 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer active:bg-sky-50 active:border-sky-300 transition-all"
              @click="openFaultGuide(symptom)"
            >
              <text class="text-xs text-slate-800 font-medium truncate pr-1">{{ symptom.name }}</text>
              <text class="i-carbon-chevron-right text-slate-400 text-xs shrink-0" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 4. 故障排查引导与推荐配件弹窗组件 -->
    <DiagnosisGuideModal
      v-model:visible="showModal"
      :fault-data="selectedFault"
      @buy-part="gotoPartDetail"
      @call-rescue="callRescue"
    />
  </view>
</template>
