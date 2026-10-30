<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  visible: boolean
  expert?: {
    id: string
    name: string
    title: string
    avatar: string
    tag: string
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  expert: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'navigate', url: string): void
}>()

interface ChatMessage {
  id: string
  sender: 'expert' | 'user'
  text: string
  time: string
  actions?: Array<{
    label: string
    type: 'part' | 'rescue' | 'package'
    url: string
  }>
}

const quickChips = [
  '水温偏高如何应急？',
  '气刹回气慢是什么原因？',
  '发动机冷启动异响',
  '尿素消耗过快报警',
]

const messages = ref<ChatMessage[]>([
  {
    id: 'm1',
    sender: 'expert',
    text: '师傅您好！我是原厂在线诊断专家，请详细描述一下您的车型、当前故障现象以及仪表盘故障灯情况，我为您做针对性排查。',
    time: '刚刚',
  },
])

const inputText = ref('')
const isReplying = ref(false)

function close() {
  emit('update:visible', false)
}

function handleSend(textToSend?: string) {
  const content = (textToSend || inputText.value).trim()
  if (!content || isReplying.value)
    return

  messages.value.push({
    id: `u-${Date.now()}`,
    sender: 'user',
    text: content,
    time: new Date().toLocaleTimeString().slice(0, 5),
  })

  inputText.value = ''
  isReplying.value = true

  // 拟真延迟回复
  setTimeout(() => {
    isReplying.value = false
    generateExpertReply(content)
  }, 600)
}

function generateExpertReply(query: string) {
  let replyText = '根据您描述的现象，建议优先检查节温器开度与风扇离合器状态。若处于重载爬坡工况，请立即降挡减速观察水温回落趋势。'
  let actions: ChatMessage['actions'] = [
    { label: '选购原厂节温器', type: 'part', url: '/pages-sub/mall/parts-detail' },
    { label: '一键呼叫道路救援', type: 'rescue', url: '/pages-sub/rescue/create?type=ENGINE' },
  ]

  if (query.includes('气刹') || query.includes('气路') || query.includes('回气')) {
    replyText = '气刹回气慢通常是干燥罐滤芯饱和或气泵打气效率不足。建议检查气路单向阀及四回路保护阀密封性。'
    actions = [
      { label: '查看干燥罐配件', type: 'part', url: '/pages-sub/mall/parts-catalog' },
      { label: '预约进站检修', type: 'package', url: '/pages-sub/mall/package-select' },
    ]
  }
  else if (query.includes('异响') || query.includes('启动')) {
    replyText = '冷启动异响且伴随启动迟滞，大概率是起动机单向齿轮咬合不良或皮带张紧轮轴承磨损。建议停车熄火后检查皮带张力。'
    actions = [
      { label: '选购起动机总成', type: 'part', url: '/pages-sub/mall/parts-catalog' },
      { label: '呼叫现场电工', type: 'rescue', url: '/pages-sub/rescue/create?type=START_FAIL' },
    ]
  }
  else if (query.includes('尿素') || query.includes('后处理') || query.includes('限扭')) {
    replyText = '尿素报警通常由后处理喷嘴结晶堵塞或氮氧传感器信号漂移引起，持续运行可能触发发动机限扭限速（降至1800转以下）。'
    actions = [
      { label: '选购尿素喷嘴', type: 'part', url: '/pages-sub/mall/parts-catalog' },
      { label: '预约后处理清洗', type: 'package', url: '/pages-sub/mall/package-select' },
    ]
  }

  messages.value.push({
    id: `e-${Date.now()}`,
    sender: 'expert',
    text: replyText,
    time: new Date().toLocaleTimeString().slice(0, 5),
    actions,
  })
}

function handleAction(url: string) {
  close()
  emit('navigate', url)
}
</script>

<template>
  <view
    v-if="visible"
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm"
    @click="close"
  >
    <view
      class="h-[85vh] max-w-lg w-full flex flex-col border-t border-slate-700/80 rounded-t-xl bg-[#1e293b] text-slate-100 shadow-2xl"
      @click.stop
    >
      <!-- 1. 顶栏：专家信息与在线标识 -->
      <view class="flex items-center justify-between border-b border-slate-700/80 px-4 py-3">
        <view class="flex items-center gap-2.5">
          <view class="relative">
            <image
              :src="expert?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'"
              class="h-10 w-10 border border-slate-600 rounded-md bg-slate-800 object-cover"
            />
            <view class="absolute h-2.5 w-2.5 border border-[#1e293b] rounded-sm bg-emerald-400 -bottom-0.5 -right-0.5" />
          </view>
          <view>
            <view class="flex items-center gap-1.5">
              <text class="text-xs text-white font-bold">{{ expert?.name || '周工' }}</text>
              <text class="border border-sky-400/30 rounded-sm bg-sky-500/15 px-1.5 py-0.2 text-[18rpx] text-sky-400 font-bold">1v1在线</text>
            </view>
            <view class="text-[20rpx] text-slate-400">
              {{ expert?.title || '东风商用车认证总工' }} · {{ expert?.tag || '动力系统' }}
            </view>
          </view>
        </view>
        <view
          class="h-7 w-7 flex cursor-pointer items-center justify-center rounded-sm bg-slate-800 text-slate-400 hover:text-white"
          @click="close"
        >
          <text class="i-carbon-close text-base" />
        </view>
      </view>

      <!-- 2. 对话气泡消息滚动区 -->
      <scroll-view scroll-y class="flex-1 p-4">
        <view class="space-y-4">
          <view
            v-for="msg in messages"
            :key="msg.id"
            class="flex gap-2.5"
            :class="msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'"
          >
            <!-- 头像 -->
            <view
              v-if="msg.sender === 'expert'"
              class="h-8 w-8 shrink-0 flex items-center justify-center border border-sky-500/40 rounded-md bg-sky-500/20 text-xs text-sky-400 font-bold"
            >
              工
            </view>
            <view
              v-else
              class="h-8 w-8 shrink-0 flex items-center justify-center border border-amber-500/40 rounded-md bg-amber-500/20 text-xs text-amber-400 font-bold"
            >
              我
            </view>

            <!-- 消息气泡 -->
            <view class="max-w-[78%]">
              <view
                class="border rounded-md p-3 text-xs leading-relaxed"
                :class="msg.sender === 'user' ? 'bg-[#0284c7] border-sky-500 text-white' : 'bg-[#0f172a] border-slate-700/80 text-slate-200'"
              >
                {{ msg.text }}
              </view>

              <!-- 推荐行动按钮行 -->
              <view
                v-if="msg.actions && msg.actions.length"
                class="mt-2 flex flex-wrap gap-2"
              >
                <view
                  v-for="action in msg.actions"
                  :key="action.label"
                  class="flex cursor-pointer items-center gap-1 border border-sky-500/40 rounded-md bg-[#0f172a] px-2.5 py-1 text-[20rpx] text-sky-300 font-bold active:bg-sky-500/20"
                  @click="handleAction(action.url)"
                >
                  <text class="i-carbon-arrow-right text-[18rpx]" />
                  <text>{{ action.label }}</text>
                </view>
              </view>

              <view
                class="mt-1 text-[18rpx] text-slate-500 font-mono"
                :class="msg.sender === 'user' ? 'text-right' : 'text-left'"
              >
                {{ msg.time }}
              </view>
            </view>
          </view>

          <!-- 输入中动态指示器 -->
          <view v-if="isReplying" class="flex items-center gap-2 text-xs text-slate-400">
            <view class="h-2 w-2 animate-ping rounded-full bg-sky-400" />
            <text>专家正在分析并输入对策...</text>
          </view>
        </view>
      </scroll-view>

      <!-- 3. 常见自查快捷提问 Chips -->
      <view class="border-t border-slate-700/80 bg-[#0f172a] px-3 py-2">
        <scroll-view scroll-x class="whitespace-nowrap">
          <view class="flex items-center gap-2">
            <view
              v-for="chip in quickChips"
              :key="chip"
              class="inline-block cursor-pointer border border-slate-700 rounded-md bg-[#1e293b] px-2.5 py-1 text-[20rpx] text-slate-300 font-medium active:border-sky-400 active:text-sky-300"
              @click="handleSend(chip)"
            >
              {{ chip }}
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 4. 输入栏 (高度 >= 88rpx) -->
      <view class="border-t border-slate-700/80 bg-[#1e293b] p-3">
        <view class="h-11 min-h-[88rpx] flex items-center border border-slate-700 rounded-md bg-[#090d16] px-3">
          <input
            v-model="inputText"
            type="text"
            placeholder="输入故障现象，如：水温超100度、气压打不上"
            placeholder-class="text-slate-500"
            class="h-full flex-1 bg-transparent text-xs text-slate-100 font-medium outline-none"
            confirm-type="send"
            @confirm="handleSend()"
          >
          <button
            class="m-0 h-8 flex shrink-0 items-center justify-center rounded-md border-none bg-[#0284c7] px-4 text-xs text-white font-bold active:bg-[#0369a1]"
            @click="handleSend()"
          >
            发送
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

