<script setup lang="ts">
import { getCurrentLoginUserApi, quickLoginApi } from '@/api/auth'
import { useTokenStore } from '@/store/token'
import { useUserSessionStore } from '@/store/userSession'
import { reactive, ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '用户登录',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
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
  <view class="h-screen flex flex-col justify-between bg-[#0f172a] text-slate-100 px-6 pt-6 pb-6 box-border overflow-hidden">
    <!-- 上半区：Logo 与 工业登录卡片 -->
    <view class="flex-1 flex flex-col justify-center">
      <!-- 1. Logo 与 标题 (硬派工业风格) -->
      <view class="mb-8 text-center">
        <view class="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-lg bg-[#0284c7] border border-sky-400/40 text-2xl text-white font-black tracking-wider">
          QP
        </view>
        <view class="text-xl text-slate-100 font-bold tracking-tight">
          卡车汇一体化协同平台
        </view>
        <view class="mt-1.5 text-[22rpx] text-slate-400 flex items-center justify-center gap-2">
          <text>连接车主</text>
          <text class="text-slate-600">·</text>
          <text>赋能技师</text>
          <text class="text-slate-600">·</text>
          <text>协同配件</text>
        </view>
      </view>

      <!-- 登录面板 (刚性深碳卡片) -->
      <view class="bg-[#1e293b] border border-slate-700/80 rounded-lg p-5">
        <!-- 2. 微信快捷登录模式 -->
        <view v-if="loginMode === 'wechat'" class="space-y-3.5">
          <button
            class="w-full min-h-[88rpx] h-[88rpx] flex items-center justify-center rounded-lg bg-[#0284c7] hover:bg-sky-500 text-sm text-white font-bold border border-sky-400/40 active:translate-y-0.5 transition-all"
            :disabled="loggingIn"
            @click="handleQuickLogin"
          >
            <text class="i-carbon-logo-wechat mr-2 text-xl" />
            <text>{{ loggingIn ? '正在登录...' : '微信手机号一键安全登录' }}</text>
          </button>

          <button
            class="w-full min-h-[80rpx] h-[80rpx] border border-slate-700 rounded-lg bg-[#090d16] text-xs text-slate-300 font-medium active:translate-y-0.5 transition-all flex items-center justify-center"
            @click="loginMode = 'account'"
          >
            <text class="i-carbon-password mr-1 text-sm text-slate-400" />
            账号密码 / 手机号登录
          </button>
        </view>

        <!-- 3. 账号密码 / 验证码登录模式 -->
        <view v-else class="space-y-3">
          <view class="space-y-2.5">
            <view class="flex items-center rounded-md bg-[#090d16] px-3.5 py-2.5 border border-slate-700 text-xs">
              <text class="i-carbon-phone text-slate-400 mr-2 text-base shrink-0" />
              <input
                v-model="accountForm.account"
                type="number"
                placeholder="请输入手机号码 (如 13800138000)"
                placeholder-class="text-slate-500"
                class="flex-1 text-slate-100"
              >
            </view>

            <view class="flex items-center rounded-md bg-[#090d16] px-3.5 py-2.5 border border-slate-700 text-xs">
              <text class="i-carbon-password text-slate-400 mr-2 text-base shrink-0" />
              <input
                v-model="accountForm.password"
                :password="true"
                placeholder="请输入密码 (免密模式直接登录)"
                placeholder-class="text-slate-500"
                class="flex-1 text-slate-100"
              >
            </view>
          </view>

          <button
            class="w-full min-h-[88rpx] h-[88rpx] flex items-center justify-center rounded-lg bg-[#0284c7] hover:bg-sky-500 text-sm text-white font-bold border border-sky-400/40 active:translate-y-0.5 transition-all"
            :disabled="loggingIn"
            @click="handleAccountLogin"
          >
            <text>{{ loggingIn ? '正在登录...' : '立即登录 / 快捷注册' }}</text>
          </button>

          <view class="flex items-center justify-between text-xs pt-1.5">
            <text
              class="text-[#38bdf8] font-medium cursor-pointer hover:underline flex items-center gap-1"
              @click="handleFillTestAccount"
            >
              <text class="i-carbon-flash text-xs" />
              一键填入测试账号
            </text>
            <text
              class="text-slate-400 cursor-pointer hover:text-slate-200"
              @click="loginMode = 'wechat'"
            >
              切回微信快捷登录
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 下半区：隐私协议 (单屏底部自然锚定，深碳高对比) -->
    <view class="pt-4 pb-2">
      <view class="flex items-center justify-center text-[22rpx] text-slate-400">
        <checkbox-group @change="isAgree = !isAgree">
          <label class="flex items-center">
            <checkbox :checked="isAgree" style="transform:scale(0.65)" />
            <text>已阅读并同意</text>
          </label>
        </checkbox-group>
        <text class="text-[#38bdf8] ml-0.5 cursor-pointer hover:underline" @click="showProtocol('卡车汇服务条款')">
          《卡车汇服务条款》
        </text>
        与
        <text class="text-[#38bdf8] cursor-pointer hover:underline" @click="showProtocol('隐私政策')">
          《隐私政策》
        </text>
      </view>
    </view>
  </view>
</template>
