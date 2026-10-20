<script setup lang="ts">
import type { CurrentLoginUserVo } from '@/api/auth'
import { getCurrentLoginUserApi } from '@/api/auth'
import { useTokenStore } from '@/store/token'
import { useUserSessionStore } from '@/store/userSession'
import { toLoginPage } from '@/utils/toLoginPage'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

defineOptions({
  name: 'MePage',
})

definePage({
  style: {
    navigationBarTitleText: '个人中心',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserSessionStore()
const { userInfo, currentRole } = storeToRefs(userStore)

const hasLogin = computed(() => tokenStore.updateNowTime().hasLogin)
const currentUser = ref<CurrentLoginUserVo | null>(null)
const loading = ref(false)

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
  toLoginPage()
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
    uni.showToast({ title: '请先登录账号', icon: 'none' })
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
    handleGoLogin()
    return
  }
  uni.navigateTo({ url: '/pages-sub/mall/vehicle-query' })
}

function gotoOrders() {
  if (!hasLogin.value) {
    handleGoLogin()
    return
  }
  uni.switchTab({ url: '/pages/order/index' })
}

function navigateTo(url: string) {
  if (!hasLogin.value && !url.includes('checkout')) {
    handleGoLogin()
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
  <view class="min-h-screen bg-[#f8fafc] pb-24">
    <!-- 1. 顶部用户信息卡片 (深碳沥青工业风) -->
    <view class="bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#1e293b] text-white px-5 pt-4 pb-14 rounded-b-2xl border-b border-slate-700/60">
      <!-- 已登录状态展示 -->
      <view v-if="hasLogin" class="flex items-center justify-between">
        <view class="flex items-center gap-3">
          <image
            :src="currentUser?.avatar || userInfo.avatar"
            class="w-14 h-14 rounded-md border-2 border-amber-400 bg-slate-900 object-cover shrink-0"
          />
          <view>
            <view class="flex items-center gap-2">
              <text class="text-base font-bold text-white">{{ currentUser?.username || userInfo.nickname }}</text>
              <!-- 技师视角展示认证技师徽章，司机视角展示会员等级 -->
              <view
                v-if="currentRole === 'TECHNICIAN'"
                class="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[18rpx] px-2 py-0.5 rounded-sm font-bold flex items-center gap-1"
              >
                <text class="i-carbon-certificate text-[18rpx]" />
                <text>认证救援技师</text>
              </view>
              <view
                v-else
                class="bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[18rpx] px-2 py-0.5 rounded-sm font-bold"
              >
                {{ userInfo.memberLevel }}
              </view>
            </view>
            <view class="text-xs text-slate-300 mt-0.5 font-mono">
              手机号：{{ currentUser?.phone || userInfo.phone }}
            </view>
            <view v-if="currentRole === 'TECHNICIAN'" class="text-[18rpx] text-teal-300 mt-0.5 flex items-center gap-1 font-medium">
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
          class="bg-slate-900/80 border border-slate-600 px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 cursor-pointer active:opacity-80"
          @click="switchRole"
        >
          <text :class="currentRole === 'DRIVER' ? 'i-carbon-tools' : 'i-carbon-delivery-truck'" class="text-amber-400 text-sm" />
          <text class="font-bold text-white">切为{{ currentRole === 'DRIVER' ? '技师' : '司机' }}</text>
        </view>
      </view>

      <!-- 未登录状态展示 -->
      <view v-else class="flex items-center justify-between">
        <view class="flex items-center gap-3 cursor-pointer" @click="handleGoLogin">
          <view class="w-14 h-14 rounded-md border-2 border-slate-600 bg-slate-900 flex items-center justify-center text-2xl text-slate-300">
            <text class="i-carbon-user-avatar-filled" />
          </view>
          <view>
            <view class="flex items-center gap-2">
              <text class="text-base font-bold text-white hover:text-emerald-400">点击登录 / 注册</text>
              <view class="bg-slate-800 border border-slate-600 text-slate-300 text-[18rpx] px-2 py-0.5 rounded-sm font-medium">
                未登录
              </view>
            </view>
            <view class="text-xs text-slate-300 mt-1 font-medium">
              登录后享爱车档案、紧急呼救与车队权益
            </view>
          </view>
        </view>

        <button
          class="bg-[#0284c7] text-white text-xs px-3.5 h-8 rounded-md font-bold active:bg-[#0369a1] m-0 border-none flex items-center justify-center"
          @click="handleGoLogin"
        >
          立即登录
        </button>
      </view>
    </view>

    <!-- 2. 悬浮核心业务卡片：硬核实体分层与 1px 刚性实线 -->
    <!-- 技师视角：高亮置顶【救援技师移动工作台】卡片 -->
    <view
      v-if="currentRole === 'TECHNICIAN'"
      class="mx-4 -mt-10 bg-white rounded-lg p-4 border border-teal-200/90"
    >
      <view class="flex items-center justify-between pb-3 border-b border-slate-100">
        <view class="flex items-center gap-2">
          <view class="w-8 h-8 rounded-md bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600">
            <text class="i-carbon-tools text-lg" />
          </view>
          <view>
            <view class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <text>救援技师出警移动工作台</text>
              <view class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-sm bg-emerald-50 text-emerald-600 text-[18rpx] font-bold border border-emerald-200">
                <view class="w-1.5 h-1.5 rounded-sm bg-emerald-500 animate-pulse" />
                <text>实时接单中</text>
              </view>
            </view>
            <view class="text-[20rpx] text-slate-500 font-mono mt-0.5">
              工号：{{ userStore.technicianInfo.technicianId }} · {{ userStore.technicianInfo.stationName }}
            </view>
          </view>
        </view>
        <button
          class="text-xs text-white bg-teal-600 px-3.5 h-8 rounded-md font-bold active:bg-teal-700 m-0 border-none flex items-center gap-1"
          @click="navigateTo('/pages-sub/technician/workbench')"
        >
          <text>进入工作台</text>
          <text class="i-carbon-chevron-right text-xs" />
        </button>
      </view>

      <!-- 技师核心出警指标 3 格统计 -->
      <view class="pt-3 grid grid-cols-3 divide-x divide-slate-100 text-center">
        <view class="cursor-pointer" @click="navigateTo('/pages-sub/technician/workbench')">
          <view class="text-base font-extrabold text-emerald-600 font-mono">
            {{ userStore.technicianInfo.todayCompletedCount }}
          </view>
          <view class="text-[20rpx] text-slate-400 mt-0.5 font-medium">
            今日已完工 (单)
          </view>
        </view>
        <view class="cursor-pointer" @click="navigateTo('/pages-sub/technician/workbench')">
          <view class="text-base font-extrabold text-amber-500 font-mono flex items-center justify-center gap-0.5">
            <text>{{ userStore.technicianInfo.starRating }}</text>
            <text class="i-carbon-star-filled text-xs text-amber-400" />
          </view>
          <view class="text-[20rpx] text-slate-400 mt-0.5 font-medium">
            技师服务评分
          </view>
        </view>
        <view class="cursor-pointer" @click="navigateTo('/pages-sub/technician/workbench')">
          <view class="text-base font-extrabold text-[#0284c7] font-mono">
            {{ userStore.technicianInfo.serviceYears }} 年
          </view>
          <view class="text-[20rpx] text-slate-400 mt-0.5 font-medium">
            专业救援从业
          </view>
        </view>
      </view>
    </view>

    <!-- 司机视角：悬浮我的爱车档案卡片 -->
    <view
      v-else
      class="mx-4 -mt-10 bg-white rounded-lg p-4 border border-slate-200/90"
    >
      <view class="flex items-center justify-between pb-3 border-b border-slate-100">
        <view class="flex items-center gap-2">
          <text class="i-carbon-delivery-truck text-lg text-[#0284c7]" />
          <view>
            <view class="text-xs font-bold text-slate-900">
              {{ hasLogin ? userInfo.defaultVehicleName : '暂未绑定爱车 (登录后查看)' }}
            </view>
            <view class="text-[20rpx] text-slate-500 font-mono mt-0.5">
              车牌号：<text class="font-bold text-slate-700">{{ hasLogin ? userInfo.defaultPlateNo : '--' }}</text>
            </view>
          </view>
        </view>
        <button
          class="text-xs text-[#0284c7] bg-sky-50 border border-sky-200/80 px-3 h-7 rounded-md font-bold m-0 flex items-center justify-center active:bg-sky-100"
          @click="gotoVehicleQuery"
        >
          {{ hasLogin ? '切换爱车' : '绑定车辆' }}
        </button>
      </view>

      <!-- 核心指标 3 格统计 -->
      <view class="pt-3 grid grid-cols-3 divide-x divide-slate-100 text-center">
        <view class="cursor-pointer" @click="gotoOrders">
          <view class="text-base font-extrabold text-slate-900 font-mono">
            {{ hasLogin ? userInfo.totalOrders : '--' }}
          </view>
          <view class="text-[20rpx] text-slate-400 mt-0.5 font-medium">
            全部订单
          </view>
        </view>
        <view class="cursor-pointer" @click="gotoOrders">
          <view class="text-base font-extrabold text-amber-500 font-mono">
            {{ hasLogin ? userInfo.vouchersCount : '--' }}
          </view>
          <view class="text-[20rpx] text-slate-400 mt-0.5 font-medium">
            优惠卡券包
          </view>
        </view>
        <view class="cursor-pointer">
          <view class="text-base font-extrabold text-emerald-600 font-mono">
            {{ hasLogin ? userInfo.memberPoints : '--' }}
          </view>
          <view class="text-[20rpx] text-slate-400 mt-0.5 font-medium">
            会员里程分
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 功能服务入口列表：1px 规整实线与中圆角 -->
    <view class="mx-4 mt-4 bg-white rounded-lg overflow-hidden border border-slate-200/80 divide-y divide-slate-100">
      <!-- 技师视角下置顶工作台快捷项 -->
      <view
        v-if="currentRole === 'TECHNICIAN'"
        class="p-4 flex items-center justify-between cursor-pointer active:bg-teal-50/50 transition-colors bg-teal-50/20"
        @click="navigateTo('/pages-sub/technician/workbench')"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-dashboard-reference text-lg text-teal-600" />
          <view>
            <text class="text-xs font-bold text-slate-900">救援技师出警工作台</text>
            <view class="text-[20rpx] text-teal-600 mt-0.5 font-medium">现场抢修 · 配件核销 · 增项申报</view>
          </view>
        </view>
        <view class="flex items-center gap-1 text-teal-600 text-xs font-bold">
          <text>即刻出警</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>

      <view
        class="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
        @click="navigateTo('/pages-sub/mall/package-select')"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-tools text-lg text-[#059669]" />
          <text class="text-xs font-bold text-slate-800">维保套餐定制与预约</text>
        </view>
        <view class="flex items-center gap-1 text-slate-400 text-xs font-medium">
          <text>原厂保养</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>

      <view
        class="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
        @click="gotoOrders"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-ticket text-lg text-[#0284c7]" />
          <text class="text-xs font-bold text-slate-800">道路紧急救援工单记录</text>
        </view>
        <view class="flex items-center gap-1 text-slate-400 text-xs font-medium">
          <text>跟单进度</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>

      <view
        class="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
        @click="navigateTo('/pages-sub/mall/checkout')"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-location text-lg text-amber-500" />
          <text class="text-xs font-bold text-slate-800">已选合作安装服务站</text>
        </view>
        <view class="flex items-center gap-1 text-slate-400 text-xs font-medium">
          <text>线下特约站</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>

      <view
        class="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
        @click="handleContactService"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-headset text-lg text-purple-600" />
          <text class="text-xs font-bold text-slate-800">联系 24 小时卡车汇客服</text>
        </view>
        <view class="flex items-center gap-1 text-slate-400 text-xs font-medium">
          <text>400-888-9999</text>
          <text class="i-carbon-chevron-right text-xs" />
        </view>
      </view>
    </view>

    <!-- 4. 已登录状态下的退出登录操作区：触控友好大按钮 (h-11) -->
    <view v-if="hasLogin" class="mx-4 mt-4">
      <button
        class="w-full bg-white border border-red-200 text-red-600 rounded-md h-11 text-xs font-extrabold active:bg-red-50 flex items-center justify-center gap-1.5"
        @click="handleLogout"
      >
        <text class="i-carbon-logout text-base" />
        <text>退出当前账号登录</text>
      </button>
    </view>

    <!-- 5. 底部品牌机能说明 -->
    <view class="mt-8 text-center text-[20rpx] text-slate-400 font-medium">
      卡车汇 · 全国重卡数字化全生命周期服务平台
    </view>
  </view>
</template>
