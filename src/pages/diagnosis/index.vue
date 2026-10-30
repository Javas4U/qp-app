<script lang="ts" setup>
import DiagnosisExpertChatModal from '@/components/DiagnosisExpertChatModal.vue'
import DiagnosisGuideModal from '@/components/DiagnosisGuideModal.vue'
import { useMallSessionStore } from '@/store/mallSession'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineOptions({
  name: 'DiagnosisPage',
})

definePage({
  style: {
    navigationBarTitleText: '智能诊断',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

const mallStore = useMallSessionStore()
const { brands, selectedModel } = storeToRefs(mallStore)

// 当前选中的品牌索引
const activeBrandId = ref('DFCV')

// 专家推荐列表
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

// 专家在线问诊弹窗状态
const showExpertChat = ref(false)
const selectedExpert = ref<any>(null)

function openFaultGuide(symptom: any) {
  selectedFault.value = symptom
  showModal.value = true
}

function consultExpert(expert: any) {
  selectedExpert.value = expert
  showExpertChat.value = true
}

function gotoPartDetail(partId?: string) {
  showModal.value = false
  if (partId) {
    uni.navigateTo({ url: `/pages-sub/mall/parts-detail?partId=${partId}` })
  }
  else {
    uni.navigateTo({ url: '/pages-sub/mall/parts-detail' })
  }
}

function callRescue() {
  showModal.value = false
  uni.navigateTo({ url: '/pages-sub/rescue/create?type=ENGINE' })
}

function handleChatNavigate(url: string) {
  uni.navigateTo({ url })
}
</script>

<template>
  <view class="diagnosis-page min-h-screen bg-[#0f172a] pb-24 text-slate-100">
    <!-- 1. 顶部品牌滑动栏：深碳工业风顶栏 -->
    <view class="border-b border-slate-700/80 rounded-b-2xl bg-[#1e293b] px-4 pb-5 pt-3.5 text-white">
      <view class="flex items-center justify-between">
        <view class="text-base text-white font-extrabold tracking-tight">
          重卡全生命周期智能诊断
        </view>
        <view class="border border-slate-600 rounded-sm bg-slate-900/80 px-2 py-0.5 text-[20rpx] text-amber-300 font-bold font-mono">
          {{ selectedModel.name.slice(0, 10) }}
        </view>
      </view>

      <!-- 品牌横滑 -->
      <scroll-view scroll-x class="mt-3 whitespace-nowrap -mx-2">
        <view class="flex items-center gap-2 px-2">
          <view
            v-for="brand in brands"
            :key="brand.id"
            class="inline-flex cursor-pointer items-center gap-1.5 border rounded-md px-3 py-1.5 text-xs font-bold transition-all"
            :class="activeBrandId === brand.id ? 'bg-[#0284c7] text-white border-sky-400' : 'bg-slate-900/80 text-slate-300 border-slate-700 active:opacity-80'"
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
      <view class="mb-2 flex items-center justify-between">
        <view class="flex items-center gap-1.5">
          <view class="h-3.5 w-1 rounded-sm bg-[#0284c7]" />
          <text class="text-sm text-slate-100 font-bold">原厂特邀技术专家</text>
          <text class="border border-sky-400/40 rounded-sm bg-sky-500/20 px-1.5 py-0.2 text-[20rpx] text-sky-400 font-bold">1对1解答</text>
        </view>
        <text class="text-xs text-slate-400 font-medium">平均1分钟响应</text>
      </view>

      <scroll-view scroll-x class="whitespace-nowrap -mx-1">
        <view class="flex items-center gap-2.5 px-1">
          <view
            v-for="expert in expertList"
            :key="expert.id"
            class="inline-block w-64 border border-slate-700/80 rounded-lg bg-[#1e293b] p-3 align-top"
          >
            <view class="flex items-center gap-2.5">
              <view class="relative">
                <image
                  :src="expert.avatar"
                  class="h-11 w-11 border border-slate-600 rounded-md bg-slate-800 object-cover"
                />
                <view
                  v-if="expert.online"
                  class="absolute h-3 w-3 border-2 border-[#1e293b] rounded-sm bg-emerald-400 -bottom-0.5 -right-0.5"
                />
              </view>
              <view class="flex-1 overflow-hidden">
                <view class="flex items-center gap-1">
                  <text class="text-xs text-slate-100 font-bold">{{ expert.name }}</text>
                  <text class="border border-sky-400/30 rounded-sm bg-sky-500/15 px-1 py-0.2 text-[18rpx] text-sky-400 font-bold">{{ expert.experience }}</text>
                </view>
                <view class="mt-0.5 truncate text-[20rpx] text-slate-400 font-medium">
                  {{ expert.title }}
                </view>
              </view>
            </view>

            <view class="mt-2 border border-slate-700/60 rounded-md bg-[#0f172a] p-1.5 text-[20rpx] text-slate-300 font-medium">
              擅长：{{ expert.tag }}
            </view>

            <view class="mt-2.5 flex items-center justify-between border-t border-slate-700/80 pt-2">
              <text class="text-[20rpx] text-slate-400 font-mono">排查 {{ expert.solvedCount }} 例</text>
              <button
                class="m-0 h-8 flex items-center justify-center rounded-md border-none bg-[#0284c7] px-3.5 text-xs text-white font-bold active:bg-[#0369a1]"
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
      <view class="mb-2.5 flex items-center justify-between">
        <view class="flex items-center gap-1.5">
          <view class="h-3.5 w-1 rounded-sm bg-red-600" />
          <text class="text-sm text-slate-100 font-bold">故障自查诊断库</text>
        </view>
        <text class="text-[20rpx] text-slate-400 font-medium">点击诊断症状查看推荐对策</text>
      </view>

      <view class="space-y-3">
        <view
          v-for="cat in faultCategories"
          :key="cat.id"
          class="border border-slate-700/80 rounded-lg bg-[#1e293b] p-3.5"
        >
          <view class="mb-2.5 flex items-center gap-2 border-b border-slate-700/80 pb-2">
            <view
              class="h-7 w-7 flex items-center justify-center border rounded-md text-sm"
              :style="{
                backgroundColor: `${cat.color}15`,
                borderColor: `${cat.color}40`,
                color: cat.color,
              }"
            >
              <text :class="cat.icon" />
            </view>
            <text class="text-xs text-slate-100 font-bold">{{ cat.name }}</text>
          </view>

          <!-- 故障现象芯片：中圆角与 1px 细边框 -->
          <view class="grid grid-cols-2 gap-2">
            <view
              v-for="symptom in cat.symptoms"
              :key="symptom.name"
              class="min-h-[88rpx] flex cursor-pointer items-center justify-between border border-slate-700/70 rounded-md bg-[#0f172a] p-2.5 transition-all active:border-sky-400 active:bg-slate-800"
              @click="openFaultGuide(symptom)"
            >
              <text class="truncate pr-1 text-xs text-slate-200 font-medium">{{ symptom.name }}</text>
              <text class="i-carbon-chevron-right shrink-0 text-xs text-slate-400" />
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

    <!-- 5. 专家在线问诊 1v1 模拟对话弹窗组件 -->
    <DiagnosisExpertChatModal
      v-model:visible="showExpertChat"
      :expert="selectedExpert"
      @navigate="handleChatNavigate"
    />
  </view>
</template>
