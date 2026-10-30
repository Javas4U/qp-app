<script setup lang="ts">
import { getCurrentLoginUserApi, quickLoginApi } from '@/api/auth'
import { useTokenStore } from '@/store/token'
import { useUserSessionStore } from '@/store/userSession'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '用户登录',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
    backgroundColorTop: '#0f172a',
    backgroundColorBottom: '#0f172a',
  },
})

// 登录模式：wechat(微信一键登录) | account(账号密码登录)；默认采用账号密码直显模式
const loginMode = ref<'wechat' | 'account'>('account')
const isAgree = ref(true)
const loggingIn = ref(false)
const redirectUrl = ref<string>('')

onLoad((query?: Record<string, string>) => {
  if (query?.redirect) {
    redirectUrl.value = decodeURIComponent(query.redirect)
  }
})

const accountForm = reactive({
  account: '16622223333',
  password: 'hunter123.a',
})

const tokenStore = useTokenStore()
const userSessionStore = useUserSessionStore()

// 微信快捷登录
async function handleQuickLogin() {
  if (!isAgree.value) {
    uni.showToast({
      title: '请先勾选用户协议与隐私政策',
      icon: 'none',
    })
    return
  }

  doLogin('13800138000', '卡车司机老李')
}

// 账号密码/验证码登录
async function handleAccountLogin() {
  if (!isAgree.value) {
    uni.showToast({
      title: '请先勾选用户协议与隐私政策',
      icon: 'none',
    })
    return
  }

  if (!accountForm.account) {
    uni.showToast({
      title: '请输入手机号码',
      icon: 'none',
    })
    return
  }

  doLogin(accountForm.account.trim(), '司机用户')
}

// 快捷填入测试账号并登录
function handleFillTestAccount() {
  accountForm.account = '16622223333'
  accountForm.password = 'hunter123.a'
  isAgree.value = true
  doLogin('16622223333', '司机用户')
}

async function doLogin(phone: string, nickname: string) {
  loggingIn.value = true
  uni.showLoading({ title: '登录中...', mask: true })
  try {
    const res = await quickLoginApi({
      phone,
      nickname,
    })

    // 写入真实 Sa-Token
    tokenStore.setTokenInfo({
      token: res.tokenValue,
      expiresIn: 86400,
    })

    userSessionStore.userInfo.phone = phone
    userSessionStore.userInfo.nickname = res.username || nickname

    // 登录成功后拉取用户详情与真实角色权限，自动初始化对应角色视角
    try {
      const userRes = await getCurrentLoginUserApi()
      if (userRes) {
        if (userRes.roles) {
          userSessionStore.initUserRoles(userRes.roles)
        }
        if (userRes.username) {
          userSessionStore.userInfo.nickname = userRes.username
        }
      }
    }
    catch (e) {
      console.warn('获取当前登录用户信息失败，使用默认角色:', e)
    }

    uni.hideLoading()
    loggingIn.value = false

    uni.showToast({
      title: '登录成功',
      icon: 'success',
    })
    setTimeout(() => {
      handlePostLoginResume()
    }, 600)
  }
  catch (err: any) {
    uni.hideLoading()
    loggingIn.value = false
    uni.showToast({
      title: err?.message || '登录失败，请确认后端服务已启动',
      icon: 'none',
      duration: 2500,
    })
  }
}

const TAB_BAR_PATHS = [
  '/pages/index/index',
  '/pages/rescue/index',
  '/pages/diagnosis/index',
  '/pages/order/index',
  '/pages/me/me',
]

function handlePostLoginResume() {
  const target = redirectUrl.value.trim()
  if (!target || target === '/pages-sub/auth/login') {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    }
    else {
      uni.switchTab({ url: '/pages/index/index' })
    }
    return
  }

  const cleanPath = target.split('?')[0]
  const isTabBar = TAB_BAR_PATHS.includes(cleanPath)

  if (isTabBar) {
    uni.switchTab({
      url: cleanPath,
      fail: () => {
        uni.switchTab({ url: '/pages/index/index' })
      },
    })
  }
  else {
    uni.redirectTo({
      url: target,
      fail: () => {
        uni.switchTab({ url: '/pages/index/index' })
      },
    })
  }
}

function showProtocol(name: string) {
  uni.showModal({
    title: name,
    content: `您正在查阅《${name}》。卡车汇承诺严格保护司机与企业用户的数据安全与隐私权益。`,
    showCancel: false,
    confirmText: '我已知晓',
  })
}
</script>

<template>
  <view class="box-border h-screen flex flex-col justify-between overflow-hidden bg-[#0f172a] px-6 pb-6 pt-6 text-slate-100">
    <!-- 上半区：Logo 与 工业登录卡片 -->
    <view class="flex flex-1 flex-col justify-center">
      <!-- 1. Logo 与 标题 (硬派工业风格) -->
      <view class="mb-8 text-center">
        <view class="mx-auto mb-4 h-16 w-16 flex items-center justify-center border border-sky-400/40 rounded-lg bg-[#0284c7] text-2xl text-white font-black tracking-wider">
          QP
        </view>
        <view class="text-xl text-slate-100 font-bold tracking-tight">
          卡车汇一体化协同平台
        </view>
        <view class="mt-1.5 flex items-center justify-center gap-2 text-[22rpx] text-slate-400">
          <text>连接车主</text>
          <text class="text-slate-600">·</text>
          <text>赋能技师</text>
          <text class="text-slate-600">·</text>
          <text>协同配件</text>
        </view>
      </view>

      <!-- 登录面板 (刚性深碳卡片) -->
      <view class="border border-slate-700/80 rounded-lg bg-[#1e293b] p-5">
        <!-- 账号密码 / 手机号直接登录面板 (隐藏微信一键登录主按钮及切换键) -->
        <view class="space-y-3">
          <view class="space-y-2.5">
            <view class="flex items-center border border-slate-700 rounded-md bg-[#090d16] px-3.5 py-2.5 text-xs">
              <text class="i-carbon-phone mr-2 shrink-0 text-base text-slate-400" />
              <input
                v-model="accountForm.account"
                type="number"
                placeholder="请输入手机号码 (如 16622223333)"
                placeholder-class="text-slate-500"
                class="flex-1 text-slate-100"
              >
            </view>

            <view class="flex items-center border border-slate-700 rounded-md bg-[#090d16] px-3.5 py-2.5 text-xs">
              <text class="i-carbon-password mr-2 shrink-0 text-base text-slate-400" />
              <input
                v-model="accountForm.password"
                :password="true"
                placeholder="请输入密码"
                placeholder-class="text-slate-500"
                class="flex-1 text-slate-100"
              >
            </view>
          </view>

          <button
            class="h-[88rpx] min-h-[88rpx] w-full flex items-center justify-center border border-sky-400/40 rounded-lg bg-[#0284c7] text-sm text-white font-bold transition-all active:translate-y-0.5 hover:bg-sky-500"
            :disabled="loggingIn"
            @click="handleAccountLogin"
          >
            <text>{{ loggingIn ? '正在登录...' : '立即登录 / 快捷注册' }}</text>
          </button>

          <view class="flex items-center justify-between pt-1.5 text-xs">
            <text
              class="flex cursor-pointer items-center gap-1 text-[#38bdf8] font-medium hover:underline"
              @click="handleFillTestAccount"
            >
              <text class="i-carbon-flash text-xs" />
              一键重填默认账号
            </text>
            <text class="text-[20rpx] text-slate-500">
              免密极速验证通道
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 下半区：隐私协议 (单屏底部自然锚定，深碳高对比) -->
    <view class="pb-2 pt-4">
      <view class="flex items-center justify-center text-[22rpx] text-slate-400">
        <checkbox-group @change="isAgree = !isAgree">
          <label class="flex items-center">
            <checkbox :checked="isAgree" style="transform:scale(0.65)" />
            <text>已阅读并同意</text>
          </label>
        </checkbox-group>
        <text class="ml-0.5 cursor-pointer text-[#38bdf8] hover:underline" @click="showProtocol('卡车汇服务条款')">
          《卡车汇服务条款》
        </text>
        与
        <text class="cursor-pointer text-[#38bdf8] hover:underline" @click="showProtocol('隐私政策')">
          《隐私政策》
        </text>
      </view>
    </view>
  </view>
</template>
