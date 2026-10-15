<script setup lang="ts">
import { getCurrentLoginUserApi, quickLoginApi } from '@/api/auth'
import { useTokenStore } from '@/store/token'
import { useUserSessionStore } from '@/store/userSession'
import { reactive, ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '用户登录',
    navigationBarBackgroundColor: '#ffffff',
  },
})

// 登录模式：wechat(微信一键登录) | account(账号密码登录)
const loginMode = ref<'wechat' | 'account'>('wechat')
const isAgree = ref(false)
const loggingIn = ref(false)

const accountForm = reactive({
  account: '',
  password: '',
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
  accountForm.account = '13800138000'
  accountForm.password = '123456'
  isAgree.value = true
  doLogin('13800138000', '卡车司机老李')
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
      uni.navigateBack()
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
  <view class="h-screen flex flex-col justify-between bg-white px-6 pt-6 pb-6 box-border overflow-hidden">
    <!-- 上半区：Logo 与 登录卡片 -->
    <view class="flex-1 flex flex-col justify-center">
      <!-- 1. Logo 与 标题 (紧凑精致) -->
      <view class="mb-6 text-center">
        <view class="mx-auto mb-3 h-13 w-13 flex items-center justify-center rounded-2xl bg-emerald-600 text-xl text-white font-black shadow-md">
          QP
        </view>
        <view class="text-xl text-gray-900 font-bold">
          卡车汇一体化协同平台
        </view>
        <view class="mt-1 text-[22rpx] text-gray-400">
          连接车主 · 赋能技师 · 协同配件
        </view>
      </view>

      <!-- 2. 微信快捷登录模式 -->
      <view v-if="loginMode === 'wechat'" class="space-y-3.5">
        <button
          class="w-full flex items-center justify-center rounded-xl bg-emerald-600 py-3 text-sm text-white font-bold shadow-sm transition active:scale-98 space-x-2 border-none"
          :disabled="loggingIn"
          @click="handleQuickLogin"
        >
          <text class="i-carbon-logo-wechat mr-1 text-lg" />
          <text>{{ loggingIn ? '正在登录...' : '微信手机号一键安全登录' }}</text>
        </button>

        <button
          class="w-full border border-gray-200 rounded-xl bg-gray-50 py-3 text-sm text-gray-700 font-medium transition active:scale-98"
          @click="loginMode = 'account'"
        >
          账号密码 / 手机号登录
        </button>
      </view>

      <!-- 3. 账号密码 / 验证码登录模式 -->
      <view v-else class="space-y-3">
        <view class="space-y-2.5">
          <view class="flex items-center rounded-xl bg-gray-50 px-3.5 py-2.5 border border-gray-100 text-xs">
            <text class="i-carbon-phone text-gray-400 mr-2 text-base" />
            <input
              v-model="accountForm.account"
              type="number"
              placeholder="请输入手机号码 (如 13800138000)"
              class="flex-1 text-gray-800"
            >
          </view>

          <view class="flex items-center rounded-xl bg-gray-50 px-3.5 py-2.5 border border-gray-100 text-xs">
            <text class="i-carbon-password text-gray-400 mr-2 text-base" />
            <input
              v-model="accountForm.password"
              :password="true"
              placeholder="请输入密码 (免密模式直接登录)"
              class="flex-1 text-gray-800"
            >
          </view>
        </view>

        <button
          class="w-full flex items-center justify-center rounded-xl bg-emerald-600 py-3 text-sm text-white font-bold shadow-sm transition active:scale-98 space-x-2 border-none"
          :disabled="loggingIn"
          @click="handleAccountLogin"
        >
          <text>{{ loggingIn ? '正在登录...' : '立即登录 / 快捷注册' }}</text>
        </button>

        <view class="flex items-center justify-between text-xs pt-1">
          <text
            class="text-emerald-600 font-medium cursor-pointer"
            @click="handleFillTestAccount"
          >
            ⚡ 一键填入测试账号并登录
          </text>
          <text
            class="text-gray-400 cursor-pointer"
            @click="loginMode = 'wechat'"
          >
            切回微信快捷登录
          </text>
        </view>
      </view>
    </view>

    <!-- 下半区：隐私协议 (单屏底部自然锚定，无需下拉) -->
    <view class="pt-4 pb-2">
      <view class="flex items-center justify-center text-[22rpx] text-gray-400">
        <checkbox-group @change="isAgree = !isAgree">
          <label class="flex items-center">
            <checkbox :checked="isAgree" style="transform:scale(0.65)" />
            <text>已阅读并同意</text>
          </label>
        </checkbox-group>
        <text class="text-emerald-600 ml-0.5 cursor-pointer" @click="showProtocol('卡车汇服务条款')">
          《卡车汇服务条款》
        </text>
        与
        <text class="text-emerald-600 cursor-pointer" @click="showProtocol('隐私政策')">
          《隐私政策》
        </text>
      </view>
    </view>
  </view>
</template>
