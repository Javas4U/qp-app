<script lang="ts" setup>
import type { CallRescueDto, RescueOrderVo, RescueTypeCode } from '@/types/rescue'
import { callRescue, getActiveRescueOrder } from '@/api/rescue'
import { useRescueSessionStore } from '@/store/rescueSession'
import { useTokenStore } from '@/store/token'
import { useUserSessionStore } from '@/store/userSession'
import { toLoginPage } from '@/utils/toLoginPage'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineOptions({
  name: 'RescueCreatePage',
})

definePage({
  style: {
    navigationBarTitleText: '发起道路救援',
    navigationBarBackgroundColor: '#0284c7',
    navigationBarTextStyle: 'white',
  },
})

const rescueStore = useRescueSessionStore()
const userStore = useUserSessionStore()
const tokenStore = useTokenStore()
const { userInfo } = storeToRefs(userStore)

// 活跃工单态势感知
const activeOrder = ref<RescueOrderVo | null>(null)
const loadingActiveOrder = ref<boolean>(false)
const showNewForm = ref<boolean>(false)

// 救援类型选项
const typeOptions: { code: RescueTypeCode, name: string, serverType: string }[] = [
  { code: 'TIRE', name: '轮胎问题', serverType: 'TIRE_CHANGE' },
  { code: 'ENGINE', name: '发动机故障', serverType: 'QUICK_REPAIR' },
  { code: 'CIRCUIT', name: '线路故障', serverType: 'QUICK_REPAIR' },
  { code: 'START_FAIL', name: '无法启动', serverType: 'JUMP_START' },
  { code: 'REPLACE_PART', name: '现场换件', serverType: 'QUICK_REPAIR' },
  { code: 'TOW_TRUCK', name: '需要拖车', serverType: 'TOWING' },
]

const selectedType = ref<RescueTypeCode>('ENGINE')

// 调度模式: BROADCAST 平台智能广播派单, ASSIGNED 指定服务商
const dispatchMode = ref<'BROADCAST' | 'ASSIGNED'>('BROADCAST')

// 合作网点选项
const stationOptions = [
  { id: 101, name: '卡车汇孝感特约抢修中心 (金牌推荐)' },
  { id: 102, name: '卡车汇京港澳高速流动服务站' },
  { id: 103, name: '卡车汇大悟重卡救援服务中心' },
]
const selectedStationId = ref<number>(101)

// 表单字段
const address = ref('G107国道孝感段K128+500处北向车道')
const rescueLongitude = ref<number>(113.91)
const rescueLatitude = ref<number>(30.92)
const contactName = ref(userInfo.value.nickname.split(' ')[0] || '李师傅')
const contactPhone = ref('13800138000')
const plateNo = ref(userInfo.value.defaultPlateNo || '鄂A·88888')
const faultDescription = ref('重载爬坡时发动机水温爆表报警，熄火后伴有异响无法启动')
const photos = ref<string[]>([
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80',
])
const submitting = ref<boolean>(false)

onLoad((query) => {
  if (query?.type && typeOptions.some(t => t.code === query.type)) {
    selectedType.value = query.type as RescueTypeCode
  }
})

onShow(() => {
  checkActiveOrder()
})

async function checkActiveOrder() {
  if (!tokenStore.updateNowTime().hasLogin) {
    activeOrder.value = null
    return
  }
  loadingActiveOrder.value = true
  try {
    const res = await getActiveRescueOrder()
    if (res && res.orderNo) {
      activeOrder.value = res
      uni.setStorageSync('current_rescue_order_no', res.orderNo)
    }
    else {
      activeOrder.value = null
    }
  }
  catch (err) {
    console.warn('拉取活跃救援工单失败:', err)
    activeOrder.value = null
  }
  finally {
    loadingActiveOrder.value = false
  }
}

function getStatusBadge(status?: string) {
  switch (status) {
    case 'DISPATCHING':
    case 'PENDING_DISPATCH':
      return { text: '正在调度派单中', bg: 'bg-amber-500', icon: 'i-carbon-radar' }
    case 'ACCEPTED':
      return { text: '服务商已接单待出发', bg: 'bg-[#0284c7]', icon: 'i-carbon-checkmark-outline' }
    case 'DEPARTED':
      return { text: '技师全速赶赴中', bg: 'bg-indigo-600', icon: 'i-carbon-delivery-truck' }
    case 'ARRIVED':
    case 'IN_PROGRESS':
      return { text: '技师已到场抢修中', bg: 'bg-emerald-600', icon: 'i-carbon-tools' }
    default:
      return { text: '履约处理中', bg: 'bg-slate-600', icon: 'i-carbon-activity' }
  }
}

function gotoActiveTracking() {
  if (!activeOrder.value?.orderNo) return
  uni.navigateTo({
    url: `/pages-sub/rescue/tracking?orderNo=${activeOrder.value.orderNo}`,
  })
}

function chooseImage() {
  uni.chooseImage({
    count: 3,
    success: (res) => {
      photos.value = [...photos.value, ...res.tempFilePaths].slice(0, 4)
    },
  })
}

function removePhoto(index: number) {
  photos.value.splice(index, 1)
}

function reLocate() {
  uni.showLoading({ title: '定位中...' })
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      uni.hideLoading()
      rescueLongitude.value = Number(res.longitude.toFixed(6))
      rescueLatitude.value = Number(res.latitude.toFixed(6))
      address.value = `湖北省孝感市附近 (经度:${rescueLongitude.value}, 纬度:${rescueLatitude.value})`
      uni.showToast({ title: '定位已更新', icon: 'success' })
    },
    fail: () => {
      uni.hideLoading()
      address.value = '京港澳高速K1042服务区北向出口50米处'
      rescueLongitude.value = 113.921200
      rescueLatitude.value = 30.934500
      uni.showToast({ title: '已校准参考位置', icon: 'none' })
    },
  })
}

async function submitRescue() {
  if (!tokenStore.updateNowTime().hasLogin) {
    uni.showModal({
      title: '登录提醒',
      content: '呼叫道路救援需先登录司机账号，是否前往一键登录？',
      confirmColor: '#0284c7',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          toLoginPage()
        }
      },
    })
    return
  }

  if (!contactPhone.value) {
    uni.showToast({ title: '请填写联系电话', icon: 'none' })
    return
  }
  if (!plateNo.value) {
    uni.showToast({ title: '请填写车牌号码', icon: 'none' })
    return
  }
  if (!address.value) {
    uni.showToast({ title: '请确认停靠故障地点', icon: 'none' })
    return
  }

  const selectedTypeItem = typeOptions.find(t => t.code === selectedType.value)
  const serverServiceType = selectedTypeItem?.serverType || 'QUICK_REPAIR'

  const payload: CallRescueDto = {
    driverName: contactName.value.trim(),
    driverPhone: contactPhone.value.trim(),
    plateNo: plateNo.value.trim().toUpperCase(),
    vehicleModel: '重卡牵引车',
    serviceType: serverServiceType,
    faultDescription: faultDescription.value.trim(),
    sceneImages: photos.value,
    rescueAddress: address.value.trim(),
    rescueLongitude: rescueLongitude.value,
    rescueLatitude: rescueLatitude.value,
    assignedStationId: dispatchMode.value === 'ASSIGNED' ? selectedStationId.value : undefined,
  }

  submitting.value = true
  uni.showLoading({ title: '发起派单中...', mask: true })

  try {
    const res = await callRescue(payload)
    uni.hideLoading()
    submitting.value = false

    const orderNo = res?.orderNo || `RES${Date.now()}`
    uni.setStorageSync('current_rescue_order_no', orderNo)

    rescueStore.createTicket({
      rescueType: selectedType.value,
      rescueTypeName: selectedTypeItem?.name || '道路救援',
      location: {
        address: address.value,
        lat: rescueLatitude.value,
        lng: rescueLongitude.value,
      },
      faultImages: photos.value,
      faultDescription: faultDescription.value,
      driverName: contactName.value,
      driverPhone: contactPhone.value,
      plateNo: plateNo.value,
    })

    uni.showToast({ title: '呼救单已提交', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages-sub/rescue/dispatch?orderNo=${orderNo}`,
        fail: (err) => {
          console.error('跳转调度雷达页失败，降级 navigateTo:', err)
          uni.navigateTo({
            url: `/pages-sub/rescue/dispatch?orderNo=${orderNo}`,
          })
        },
      })
    }, 500)
  }
  catch (error: any) {
    console.error('[发起呼救异常捕获]:', error)
    uni.hideLoading()
    submitting.value = false
    uni.showToast({
      title: error?.message || '发起呼救失败，请确认后端服务已启动',
      icon: 'none',
      duration: 3000,
    })
  }
}
</script>

<template>
  <view class="rescue-create-page min-h-screen bg-[#f8fafc] pb-28">
    <!-- 0. 存在进行中的救援订单时，置顶态势机能卡片 (FR-016) -->
    <view v-if="activeOrder" class="mx-4 mt-3 mb-3 bg-white text-slate-800 rounded-lg p-4 border-2 border-rose-500 shadow-sm">
      <view class="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <view class="flex items-center gap-1.5 font-bold text-sm text-rose-600">
          <text class="i-carbon-warning-alt text-amber-500 text-base animate-pulse" />
          <text>您有 1 笔进行中的救援服务</text>
        </view>
        <view :class="getStatusBadge(activeOrder.orderStatus).bg" class="text-[20rpx] text-white px-2 py-0.5 rounded-sm font-bold flex items-center gap-1">
          <text :class="getStatusBadge(activeOrder.orderStatus).icon" class="text-xs" />
          <text>{{ getStatusBadge(activeOrder.orderStatus).text }}</text>
        </view>
      </view>

      <view class="mt-3 grid grid-cols-2 gap-2 text-xs">
        <view class="bg-slate-50 border border-slate-200 rounded-md p-2.5">
          <text class="text-slate-500 text-[20rpx] block">救援工单号</text>
          <text class="font-mono font-bold text-slate-900 text-xs mt-0.5 block truncate">{{ activeOrder.orderNo }}</text>
        </view>
        <view class="bg-slate-50 border border-slate-200 rounded-md p-2.5">
          <text class="text-slate-500 text-[20rpx] block">出警救援车辆</text>
          <text class="font-mono font-bold text-emerald-600 text-xs mt-0.5 block truncate">{{ activeOrder.technicianPlateNo || '专车整备中' }}</text>
        </view>
      </view>

      <view class="mt-2.5 flex items-center justify-between text-xs text-slate-600">
        <view class="flex items-center gap-1.5 truncate max-w-56">
          <text class="i-carbon-user-avatar text-sm text-slate-400" />
          <text class="font-medium truncate">{{ activeOrder.technicianName ? `出警技师：${activeOrder.technicianName}（${activeOrder.technicianPhone || '已指派'}）` : '调度指派技师中...' }}</text>
        </view>
        <text class="text-[20rpx] text-slate-400 font-mono">{{ activeOrder.createTime ? activeOrder.createTime.slice(11, 16) : '' }} 报案</text>
      </view>

      <!-- 核心行动按钮: 直达实时跟踪页 -->
      <view class="mt-3">
        <button
          class="w-full bg-emerald-600 text-white font-bold text-xs h-10 rounded-md active:bg-emerald-700 m-0 border-none flex items-center justify-center gap-1.5"
          @click="gotoActiveTracking"
        >
          <text class="i-carbon-map text-sm" />
          <text>立即查看救援实时进度与轨迹</text>
          <text class="i-carbon-chevron-right text-xs" />
        </button>
      </view>

      <view class="mt-2.5 text-center">
        <text class="text-[20rpx] text-sky-400 underline cursor-pointer" @click="showNewForm = !showNewForm">
          {{ showNewForm ? '▲ 收起新呼救填报表单' : '如需为其他车辆报案，点击展开新呼救表单 ▼' }}
        </text>
      </view>
    </view>

    <!-- 表单主容器 (若无活跃单，或用户主动展开，则展示) -->
    <view v-if="!activeOrder || showNewForm">
      <!-- 1. 救援类型宫格单选 -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/80">
        <view class="text-xs font-bold text-slate-900 mb-2.5">
          选择救援类型 <text class="text-red-500">*</text>
        </view>
        <view class="grid grid-cols-3 gap-2">
          <view
            v-for="item in typeOptions"
            :key="item.code"
            class="py-2.5 px-2 rounded-md text-center text-xs font-medium cursor-pointer border transition-all"
            :class="selectedType === item.code
              ? 'bg-sky-50 border-[#0284c7] text-[#0284c7] font-bold'
              : 'bg-slate-50 border-slate-200/80 text-slate-700'"
            @click="selectedType = item.code"
          >
            {{ item.name }}
          </view>
        </view>
      </view>

      <!-- 2. 调度方式与服务商选择 -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/80">
        <view class="text-xs font-bold text-slate-900 mb-2.5">
          救援调度方式
        </view>
        <view class="grid grid-cols-2 gap-2">
          <view
            class="py-2.5 px-3 rounded-md border text-xs text-center cursor-pointer transition-all"
            :class="dispatchMode === 'BROADCAST'
              ? 'bg-sky-50 border-[#0284c7] text-[#0284c7] font-bold'
              : 'bg-slate-50 border-slate-200/80 text-slate-600'"
            @click="dispatchMode = 'BROADCAST'"
          >
            <view class="flex items-center justify-center gap-1">
              <text class="i-carbon-radar" />
              <text>平台就近极速调度</text>
            </view>
            <view class="text-[18rpx] text-slate-400 mt-0.5">周边合作商快速响应</view>
          </view>

          <view
            class="py-2.5 px-3 rounded-md border text-xs text-center cursor-pointer transition-all"
            :class="dispatchMode === 'ASSIGNED'
              ? 'bg-sky-50 border-[#0284c7] text-[#0284c7] font-bold'
              : 'bg-slate-50 border-slate-200/80 text-slate-600'"
            @click="dispatchMode = 'ASSIGNED'"
          >
            <view class="flex items-center justify-center gap-1">
              <text class="i-carbon-badge" />
              <text>指定特约服务站</text>
            </view>
            <view class="text-[18rpx] text-slate-400 mt-0.5">定向通知心仪网点</view>
          </view>
        </view>

        <!-- 指定网点下拉选择框 -->
        <view v-if="dispatchMode === 'ASSIGNED'" class="mt-3 p-3 bg-sky-50/60 rounded-md border border-sky-100">
          <view class="text-[20rpx] text-sky-900 font-bold mb-1.5 flex items-center gap-1">
            <text class="i-carbon-location-current text-[#0284c7]" />
            <text>选择目标合作服务站 (网点PC端专属调度):</text>
          </view>
          <view class="space-y-1.5">
            <view
              v-for="st in stationOptions"
              :key="st.id"
              class="p-2.5 rounded-md text-xs cursor-pointer flex items-center justify-between border"
              :class="selectedStationId === st.id
                ? 'bg-white border-[#0284c7] text-[#0284c7] font-bold'
                : 'bg-white border-slate-200 text-slate-700'"
              @click="selectedStationId = st.id"
            >
              <text>{{ st.name }}</text>
              <text v-if="selectedStationId === st.id" class="i-carbon-checkmark text-[#0284c7] font-bold" />
            </view>
          </view>
        </view>
      </view>

      <!-- 3. 停靠位置卡片 -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/80">
        <view class="flex items-center justify-between mb-2">
          <view class="text-xs font-bold text-slate-900 flex items-center gap-1">
            <text class="i-carbon-location-filled text-red-600" />
            <text>当前停靠故障地点 (高德GCJ-02)</text>
          </view>
          <view
            class="text-xs text-[#0284c7] font-bold flex items-center gap-0.5 cursor-pointer active:opacity-80"
            @click="reLocate"
          >
            <text class="i-carbon-renew text-xs" />
            <text>重新定位</text>
          </view>
        </view>
        <view class="bg-slate-50 p-2.5 rounded-md border border-slate-200 text-xs font-medium text-slate-900">
          <input
            v-model="address"
            type="text"
            class="w-full text-xs text-slate-900 outline-none"
            placeholder="可手动微调路段或桩号描述"
          >
        </view>
      </view>

      <!-- 4. 问题描述与现场拍照 -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/80">
        <view class="text-xs font-bold text-slate-900 mb-2">
          故障描述与现场拍照
        </view>
        <view class="bg-slate-50 rounded-md p-3 border border-slate-200">
          <textarea
            v-model="faultDescription"
            :maxlength="200"
            placeholder="请简要描述车辆故障现象（如异响、仪表盘报错代码、漏水漏油等）"
            class="w-full h-20 text-xs text-slate-900 bg-transparent outline-none"
          />
          <view class="text-right text-[20rpx] text-slate-400">
            {{ faultDescription.length }}/200字
          </view>
        </view>

        <!-- 照片列表 -->
        <view class="mt-3 flex items-center gap-2 flex-wrap">
          <view
            v-for="(img, idx) in photos"
            :key="idx"
            class="w-20 h-20 rounded-md overflow-hidden relative border border-slate-200"
          >
            <image :src="img" mode="aspectFill" class="w-full h-full" />
            <view
              class="absolute top-1 right-1 w-5 h-5 rounded-sm bg-black/60 text-white flex items-center justify-center cursor-pointer"
              @click="removePhoto(idx)"
            >
              <text class="i-carbon-close text-[18rpx]" />
            </view>
          </view>
          <view
            v-if="photos.length < 4"
            class="w-20 h-20 rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer active:bg-slate-100"
            @click="chooseImage"
          >
            <text class="i-carbon-camera text-xl" />
            <text class="text-[18rpx] mt-1 font-medium">上传照片</text>
          </view>
        </view>
      </view>

      <!-- 5. 联系人与车辆信息表单 -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-4 space-y-3 border border-slate-200/80">
        <view class="text-xs font-bold text-slate-900">
          车辆与联系信息
        </view>

        <view class="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <text class="text-slate-500 w-20">车牌号码</text>
          <input
            v-model="plateNo"
            type="text"
            placeholder="例如：鄂A·88888"
            class="flex-1 text-right font-bold text-slate-900 uppercase"
          >
        </view>

        <view class="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <text class="text-slate-500 w-20">联系人</text>
          <input
            v-model="contactName"
            type="text"
            placeholder="请输入司机称呼"
            class="flex-1 text-right text-slate-900 font-medium"
          >
        </view>

        <view class="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <text class="text-slate-500 w-20">联系手机</text>
          <input
            v-model="contactPhone"
            type="number"
            placeholder="请输入接收调度的手机号"
            class="flex-1 text-right text-slate-900 font-mono font-bold"
          >
        </view>
      </view>

      <!-- 6. 费用预估提示卡片 -->
      <view class="mx-4 mt-3 bg-sky-50/70 p-3.5 rounded-lg border border-sky-200 text-xs text-sky-950 flex items-center justify-between">
        <view>
          <view class="font-bold flex items-center gap-1">
            <text class="i-carbon-information-filled text-[#0284c7]" />
            <text>基础出车检测费预估</text>
          </view>
          <view class="text-[20rpx] text-sky-700 mt-0.5 font-medium">
            含周边15km内出车费与现场勘测排查；若更换原厂配件另行确认。
          </view>
        </view>
        <text class="text-base font-extrabold text-red-600 font-mono">¥300~600</text>
      </view>

      <!-- 7. 底部固定提交按钮：The Glove-First 规范 (h-11 / 44px) -->
      <view class="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-slate-200/90 z-20">
        <button
          class="w-full bg-[#0284c7] text-white h-11 rounded-md font-extrabold text-sm active:bg-[#0369a1] flex items-center justify-center gap-2 border-none"
          :disabled="submitting"
          @click="submitRescue"
        >
          <text class="i-carbon-send-alt text-base" />
          <text>{{ submitting ? '正在提交...' : '立即发起极速派单' }}</text>
        </button>
      </view>
    </view>
  </view>
</template>
