<script setup lang="ts">
import type { CurrentLoginUserVo } from '@/api/auth'
import { getCurrentLoginUserApi } from '@/api/auth'
import UserMileageModal from '@/components/UserMileageModal.vue'
import UserVouchersModal from '@/components/UserVouchersModal.vue'
import { GUEST_PLACEHOLDERS } from '@/constants/guest'
import { useMallSessionStore } from '@/store/mallSession'
import { useRescueSessionStore } from '@/store/rescueSession'
import { useTokenStore } from '@/store/token'
import { useUserSessionStore } from '@/store/userSession'
import { toLoginPage } from '@/utils/toLoginPage'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, ref, watchEffect } from 'vue'

defineOptions({
  name: 'MePage',
})

definePage({
  style: {
    navigationBarTitleText: '个人中心',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserSessionStore()
const rescueStore = useRescueSessionStore()
const mallStore = useMallSessionStore()

const { userInfo, currentRole, vouchersList, mileageRecords } = storeToRefs(userStore)
const { mallOrdersList, maintenanceOrdersList, selectedModel } = storeToRefs(mallStore)

const hasLogin = computed(() => tokenStore.updateNowTime().hasLogin)
const currentUser = ref<CurrentLoginUserVo | null>(null)
const loading = ref(false)

// 动态联动订单大厅三类有效订单总数 (道路救援 + 商城配件 + 维保预约)
const totalOrdersCount = computed(() => {
  if (!hasLogin.value)
    return 0
  const rescueCount = (rescueStore.currentTicket ? 1 : 0) + (rescueStore.historyTickets?.length || 0)
  const mallCount = mallOrdersList.value?.length || 0
  const maintenanceCount = maintenanceOrdersList.value?.length || 0
  return rescueCount + mallCount + maintenanceCount
})

// 登录态下自动同步至 session 状态
watchEffect(() => {
  if (hasLogin.value) {
    userInfo.value.totalOrders = totalOrdersCount.value
    userInfo.value.vouchersCount = vouchersList.value?.length || 3
  }
})

// 爱车显示逻辑：全局优先使用 mallStore.selectedModel
const displayVehicleName = computed(() => {
  if (hasLogin.value && selectedModel.value?.id) {
    return selectedModel.value.name
  }
  return hasLogin.value ? userInfo.value.defaultVehicleName : GUEST_PLACEHOLDERS.defaultVehicleName
})

onShow(() => {
  fetchUserInfo()
})

async function fetchUserInfo() {
  if (!hasLogin.value) {
    currentUser.value = null
    return
  }

  loading.value = true
  try {
    const res = await getCurrentLoginUserApi()
    if (res) {
      currentUser.value = res
      if (res.roles) {
        userStore.initUserRoles(res.roles)
      }
      if (res.username) {
        userInfo.value.nickname = res.username
      }
      if (res.phone) {
        userInfo.value.phone = res.phone
      }
    }
  }
  catch (err) {
    console.error('拉取当前用户信息失败:', err)
  }
  finally {
    loading.value = false
  }
}

function handleGoLogin() {
  toLoginPage({
    redirectUrl: '/pages/me/me',
    noticeMessage: '请先登录账号',
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前登录账号吗？',
    confirmColor: '#ef4444',
    confirmText: '退出登录',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在退出...', mask: true })
        try {
          await tokenStore.logout()
          currentUser.value = null
          userStore.resetSession()
          mallStore.resetSelectedModel()
          uni.hideLoading()
          uni.showToast({
            title: '已退出登录',
            icon: 'none',
          })
        }
        catch {
          uni.hideLoading()
          currentUser.value = null
          userStore.resetSession()
        }
      }
    },
  })
}

function switchRole() {
  if (!hasLogin.value) {
    handleGoLogin()
    return
  }
  if (!userStore.hasBothRoles) {
    uni.showToast({ title: '您当前未具有双重身份权限', icon: 'none' })
    return
  }
  const next = currentRole.value === 'DRIVER' ? 'TECHNICIAN' : 'DRIVER'
  userStore.switchRole(next)
  uni.showToast({
    title: `已切换为${next === 'DRIVER' ? '卡车司机' : '救援技师'}视角`,
    icon: 'none',
  })
}

function gotoVehicleQuery() {
  if (!hasLogin.value) {
    toLoginPage({
      redirectUrl: '/pages-sub/mall/vehicle-query',
      noticeMessage: '请先登录以查看或绑定爱车',
    })
    return
  }
  uni.navigateTo({ url: '/pages-sub/mall/vehicle-query' })
}

function gotoOrders() {
  if (!hasLogin.value) {
    toLoginPage({
      redirectUrl: '/pages/order/index',
      noticeMessage: '请先登录查看全部订单',
    })
    return
  }
  uni.switchTab({ url: '/pages/order/index' })
}

// 卡券弹窗
const showVouchersModal = ref(false)

function gotoVouchers() {
  if (!hasLogin.value) {
    toLoginPage({
      redirectUrl: '/pages/me/me',
      noticeMessage: '请先登录查看优惠卡券',
    })
    return
  }
  showVouchersModal.value = true
}

function handleUseVoucher(targetUrl: string) {
  if (targetUrl.startsWith('/pages/')) {
    uni.switchTab({ url: targetUrl })
  }
  else {
    uni.navigateTo({ url: targetUrl })
  }
}

// 积分弹窗
const showMileageModal = ref(false)

function gotoPoints() {
  if (!hasLogin.value) {
    toLoginPage({
      redirectUrl: '/pages/me/me',
      noticeMessage: '请先登录查看会员里程分',
    })
    return
  }
  showMileageModal.value = true
}

function navigateTo(url: string) {
  if (!hasLogin.value) {
    toLoginPage({
      redirectUrl: url,
      noticeMessage: '请先登录账号',
    })
    return
  }
  uni.navigateTo({ url })
}

function handleContactService() {
  uni.makePhoneCall({
    phoneNumber: '400-888-9999',
    fail: () => {
      uni.showToast({ title: '客服专线: 400-888-9999', icon: 'none' })
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-[#0f172a] pb-24 text-slate-100">
    <!-- 1. 顶部用户信息卡片 (深碳沥青工业风) -->
    <view class="border-b border-slate-700/80 rounded-b-2xl bg-[#1e293b] px-5 pb-14 pt-4 text-white">
      <!-- 已登录状态展示 -->
      <view v-if="hasLogin" class="flex items-center justify-between">
        <view class="flex items-center gap-3">
          <image
            :src="currentUser?.avatar || userInfo.avatar"
            class="h-14 w-14 shrink-0 border-2 border-amber-400 rounded-md bg-slate-900 object-cover"
          />
          <view>
            <view class="flex items-center gap-2">
              <text class="text-base text-white font-bold">{{ currentUser?.username || userInfo.nickname }}</text>
              <view
                v-if="currentRole === 'TECHNICIAN'"
                class="flex items-center gap-1 border border-emerald-400/50 rounded-sm bg-emerald-500/20 px-2 py-0.5 text-[18rpx] text-emerald-300 font-bold"
              >
                <text class="i-carbon-certificate text-[18rpx]" />
                <text>认证救援技师</text>
              </view>
              <view
                v-else
                class="border border-amber-400/50 rounded-sm bg-amber-400/20 px-2 py-0.5 text-[18rpx] text-amber-300 font-bold"
              >
                {{ userInfo.memberLevel }}
              </view>
            </view>
            <view class="mt-0.5 text-xs text-slate-300 font-mono">
              手机号：{{ currentUser?.phone || userInfo.phone }}
            </view>
            <view v-if="currentRole === 'TECHNICIAN'" class="mt-0.5 flex items-center gap-1 text-[18rpx] text-teal-300 font-medium">
              <text class="i-carbon-location-company text-xs" />
              <text>{{ userStore.technicianInfo.stationName }}</text>
            </view>
            <view v-else-if="currentUser?.clientNo" class="text-[18rpx] text-slate-400 font-mono">
              客户号：{{ currentUser.clientNo }}
            </view>
          </view>
        </view>

        <!-- 视角切换开关胶囊 (机能风格) -->
        <view
          v-if="hasLogin && userStore.hasBothRoles"
          class="flex cursor-pointer items-center gap-1.5 border border-slate-600 rounded-md bg-slate-900/80 px-3 py-1.5 text-xs active:opacity-80"
          @click="switchRole"
        >
          <text :class="currentRole === 'DRIVER' ? 'i-carbon-tools' : 'i-carbon-delivery-truck'" class="text-sm text-amber-400" />
          <text class="text-white font-bold">切为{{ currentRole === 'DRIVER' ? '技师' : '司机' }}</text>
        </view>
      </view>

      <!-- 未登录状态展示 -->
      <view v-else class="flex items-center justify-between">
        <view class="flex cursor-pointer items-center gap-3" @click="handleGoLogin">
          <view class="h-14 w-14 flex items-center justify-center border-2 border-slate-600 rounded-md bg-slate-900 text-2xl text-slate-400">
            <text class="i-carbon-user-avatar-filled" />
          </view>
          <view>
            <view class="flex items-center gap-2">
              <text class="text-base text-white font-bold hover:text-emerald-400">{{ GUEST_PLACEHOLDERS.nickname }}</text>
              <view class="border border-slate-600 rounded-sm bg-slate-800 px-2 py-0.5 text-[18rpx] text-slate-400 font-medium">
                未登录
              </view>
            </view>
            <view class="mt-0.5 text-xs text-slate-400 font-mono">
              手机号：{{ GUEST_PLACEHOLDERS.phone }}
            </view>
            <view class="mt-0.5 text-[20rpx] text-slate-400 font-medium">
              登录后享爱车档案、紧急呼救与车队权益
            </view>
          </view>
        </view>

        <button
          class="m-0 h-10 min-h-[80rpx] flex items-center justify-center rounded-md border-none bg-[#0284c7] px-4 text-xs text-white font-bold active:bg-[#0369a1]"
          @click="handleGoLogin"
        >
          立即登录
        </button>
      </view>
    </view>

    <!-- 2. 悬浮核心业务卡片：硬核实体分层与 1px 刚性实线 -->
    <!-- 技师视角：高亮置顶【救援技师移动工作台】卡片 -->
    <view
      v-if="hasLogin && currentRole === 'TECHNICIAN'"
      class="mx-4 border border-teal-500/50 rounded-lg bg-[#1e293b] p-4 -mt-10 shadow-lg"
    >
      <view class="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <view class="flex items-center gap-2">
          <view class="h-8 w-8 flex items-center justify-center border border-teal-500/40 rounded-md bg-teal-500/20 text-teal-400">
            <text class="i-carbon-tools text-lg" />
          </view>
          <view>
            <view class="flex items-center gap-1.5 text-xs text-slate-100 font-bold">
              <text>救援技师出警移动工作台</text>
              <view class="inline-flex items-center gap-1 border border-emerald-500/40 rounded-sm bg-emerald-500/20 px-1.5 py-0.2 text-[18rpx] text-emerald-400 font-bold">
                <view class="h-1.5 w-1.5 animate-pulse rounded-sm bg-emerald-400" />
                <text>实时接单中</text>
              </view>
            </view>
            <view class="mt-0.5 text-[20rpx] text-slate-400 font-mono">
              工号：{{ userStore.technicianInfo.technicianId }} · {{ userStore.technicianInfo.stationName }}
            </view>
          </view>
        </view>
        <button
          class="m-0 h-9 flex items-center gap-1 rounded-md border-none bg-teal-600 px-3.5 text-xs text-white font-bold active:bg-teal-700"
          @click="navigateTo('/pages-sub/technician/workbench')"
        >
          <text>进入工作台</text>
          <text class="i-carbon-chevron-right text-xs" />
        </button>
      </view>

      <!-- 技师核心出警指标 3 格统计 -->
      <view class="grid grid-cols-3 pt-3 text-center divide-x divide-slate-700/80">
        <view class="cursor-pointer" @click="navigateTo('/pages-sub/technician/workbench')">
          <view class="text-base text-emerald-400 font-extrabold font-mono">
            {{ userStore.technicianInfo.todayCompletedCount }}
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400 font-medium">
            今日已完工 (单)
          </view>
        </view>
        <view class="cursor-pointer" @click="navigateTo('/pages-sub/technician/workbench')">
          <view class="flex items-center justify-center gap-0.5 text-base text-amber-400 font-extrabold font-mono">
            <text>{{ userStore.technicianInfo.starRating }}</text>
            <text class="i-carbon-star-filled text-xs text-amber-400" />
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400 font-medium">
            技师服务评分
          </view>
        </view>
        <view class="cursor-pointer" @click="navigateTo('/pages-sub/technician/workbench')">
          <view class="text-base text-sky-400 font-extrabold font-mono">
            {{ userStore.technicianInfo.serviceYears }} 年
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400 font-medium">
            专业救援从业
          </view>
        </view>
      </view>
    </view>

    <!-- 司机视角：悬浮我的爱车档案卡片 -->
    <view
      v-else
      class="mx-4 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4 -mt-10 shadow-lg"
    >
      <view
        class="flex cursor-pointer items-center justify-between border-b border-slate-700/80 pb-3"
        @click="gotoVehicleQuery"
      >
        <view class="flex items-center gap-2">
          <text class="i-carbon-delivery-truck text-xl text-sky-400" />
          <view>
            <view class="text-xs text-slate-100 font-bold">
              {{ displayVehicleName }}
            </view>
            <view class="mt-0.5 text-[20rpx] text-slate-400 font-mono">
              车牌号：<text class="text-amber-400 font-bold">{{ hasLogin ? userInfo.defaultPlateNo : GUEST_PLACEHOLDERS.defaultPlateNo }}</text>
            </view>
          </view>
        </view>
        <button
          class="m-0 h-8 flex items-center justify-center border border-sky-400/40 rounded-md bg-sky-500/20 px-3 text-xs text-sky-400 font-bold active:bg-sky-500/30"
          @click.stop="gotoVehicleQuery"
        >
          {{ hasLogin ? '切换爱车' : '绑定车辆' }}
        </button>
      </view>

      <!-- 核心指标 3 格统计 -->
      <view class="grid grid-cols-3 pt-3 text-center divide-x divide-slate-700/80">
        <view class="cursor-pointer" @click="gotoOrders">
          <view class="text-base text-slate-100 font-extrabold font-mono">
            {{ hasLogin ? totalOrdersCount : GUEST_PLACEHOLDERS.metricsPlaceholder }}
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400 font-medium">
            全部订单
          </view>
        </view>
        <view class="cursor-pointer" @click="gotoVouchers">
          <view class="text-base text-amber-400 font-extrabold font-mono">
            {{ hasLogin ? userInfo.vouchersCount : GUEST_PLACEHOLDERS.metricsPlaceholder }}
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400 font-medium">
            优惠卡券包
          </view>
        </view>
        <view class="cursor-pointer" @click="gotoPoints">
          <view class="text-base text-emerald-400 font-extrabold font-mono">
            {{ hasLogin ? userInfo.memberPoints : GUEST_PLACEHOLDERS.metricsPlaceholder }}
          </view>
          <view class="mt-0.5 text-[20rpx] text-slate-400 font-medium">
            会员里程分
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 功能服务入口列表：1px 规整实线与中圆角 -->
    <view class="mx-4 mt-4 overflow-hidden border border-slate-700/80 rounded-lg bg-[#1e293b] divide-y divide-slate-700/80">
      <!-- 技师视角下置顶工作台快捷项 -->
      <view
        v-if="hasLogin && currentRole === 'TECHNICIAN'"
        class="flex cursor-pointer items-center justify-between bg-teal-500/10 p-4 transition-colors active:bg-teal-500/20"
        @click="navigateTo('/pages-sub/technician/workbench')"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-dashboard-reference text-lg text-teal-400" />
          <view>
            <text class="text-xs text-slate-100 font-bold">救援技师出警工作台</text>
            <view class="mt-0.5 text-[20rpx] text-teal-300 font-medium">
              现场抢修 · 配件核销 · 增项申报
            </view>
          </view>
        </view>
        <view class="flex items-center gap-1 text-xs text-teal-400 font-bold">
          <text>即刻出警</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>

      <view
        class="flex cursor-pointer items-center justify-between p-4 transition-colors active:bg-slate-800"
        @click="navigateTo('/pages-sub/mall/package-select')"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-tools text-lg text-emerald-400" />
          <text class="text-xs text-slate-200 font-bold">维保套餐定制与预约</text>
        </view>
        <view class="flex items-center gap-1 text-xs text-slate-400 font-medium">
          <text>原厂保养</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>

      <view
        class="flex cursor-pointer items-center justify-between p-4 transition-colors active:bg-slate-800"
        @click="gotoOrders"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-ticket text-lg text-sky-400" />
          <text class="text-xs text-slate-200 font-bold">道路紧急救援工单记录</text>
        </view>
        <view class="flex items-center gap-1 text-xs text-slate-400 font-medium">
          <text>跟单进度</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>

      <view
        class="flex cursor-pointer items-center justify-between p-4 transition-colors active:bg-slate-800"
        @click="navigateTo('/pages-sub/mall/checkout')"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-location text-lg text-amber-400" />
          <text class="text-xs text-slate-200 font-bold">已选合作安装服务站</text>
        </view>
        <view class="flex items-center gap-1 text-xs text-slate-400 font-medium">
          <text>线下特约站</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>

      <view
        class="flex cursor-pointer items-center justify-between p-4 transition-colors active:bg-slate-800"
        @click="handleContactService"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-headset text-lg text-purple-400" />
          <text class="text-xs text-slate-200 font-bold">联系 24 小时卡车汇客服</text>
        </view>
        <view class="flex items-center gap-1 text-xs text-slate-400 font-medium">
          <text>400-888-9999</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>
    </view>

    <!-- 4. 已登录状态下的退出登录操作区 (触控热区 >= 88rpx / h-11) -->
    <view v-if="hasLogin" class="mx-4 mt-4">
      <button
        class="h-11 min-h-[88rpx] w-full flex items-center justify-center gap-1.5 border border-red-500/40 rounded-md bg-[#1e293b] text-xs text-red-400 font-extrabold active:bg-red-500/20"
        @click="handleLogout"
      >
        <text class="i-carbon-logout text-base" />
        <text>退出当前账号登录</text>
      </button>
    </view>

    <!-- 5. 底部品牌机能说明 -->
    <view class="mt-8 text-center text-[20rpx] text-slate-500 font-medium">
      卡车汇 · 全国重卡数字化全生命周期服务平台
    </view>

    <!-- 6. 优惠卡券弹窗 -->
    <UserVouchersModal
      v-model:visible="showVouchersModal"
      :vouchers="vouchersList"
      @use-voucher="handleUseVoucher"
    />

    <!-- 7. 里程积分账本弹窗 -->
    <UserMileageModal
      v-model:visible="showMileageModal"
      :points="userInfo.memberPoints"
      :records="mileageRecords"
    />
  </view>
</template>
