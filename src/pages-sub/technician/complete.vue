<script lang="ts" setup>
import { useRescueSessionStore } from '@/store/rescueSession'
import { useUserSessionStore } from '@/store/userSession'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineOptions({
  name: 'TechnicianCompletePage',
})

definePage({
  style: {
    navigationBarTitleText: '技师工作台 - 完工存证',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white',
  },
})

const rescueStore = useRescueSessionStore()
const userStore = useUserSessionStore()
const { currentTicket } = storeToRefs(rescueStore)

// 现场存证照片列表
const workPhotos = ref<string[]>([
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
])

const remark = ref('已成功更换东风康明斯原厂节温器总成，重力排空并加注原厂10kg重负荷防冻液。车辆怠速运转20分钟，水温稳定在85℃正常区间，电子风扇结合正常，全车OBD无故障码，司机路试满意。')

function takePhoto() {
  uni.chooseImage({
    count: 2,
    success: (res) => {
      workPhotos.value = [...workPhotos.value, ...res.tempFilePaths].slice(0, 4)
    },
  })
}

function removePhoto(idx: number) {
  workPhotos.value.splice(idx, 1)
}

function submitCompletion() {
  if (workPhotos.value.length === 0) {
    uni.showToast({ title: '请至少上传一张现场作业存证照片', icon: 'none' })
    return
  }

  uni.showLoading({ title: '正在提交完工存证...' })
  setTimeout(() => {
    uni.hideLoading()
    rescueStore.completeService(workPhotos.value)

    uni.showModal({
      title: '完工提交成功',
      content: '工单已流转至求援司机端结算。是否立即切回司机视角查看支付结算单？',
      confirmText: '切回司机视角',
      cancelText: '留在技师端',
      success: (res) => {
        if (res.confirm) {
          userStore.switchRole('DRIVER')
          uni.redirectTo({
            url: '/pages-sub/rescue/success',
          })
        }
        else {
          uni.switchTab({
            url: '/pages/index/index',
          })
        }
      },
    })
  }, 600)
}
</script>

<template>
  <view class="tech-complete-page min-h-screen flex flex-col justify-between bg-[#0f172a] pb-28 text-slate-100">
    <view>
      <!-- 1. 顶部完工指引 (工业刚性顶栏) -->
      <view class="border-b border-slate-700/80 bg-[#1e293b] p-4">
        <view class="flex items-center gap-2.5">
          <view class="h-8 w-8 flex items-center justify-center border border-slate-700 rounded-md bg-slate-900 text-lg text-[#0284c7]">
            <text class="i-carbon-camera" />
          </view>
          <view>
            <view class="text-sm text-slate-100 font-bold">
              现场作业标准化拍照存证
            </view>
            <view class="mt-0.5 text-[20rpx] text-slate-400">
              请务必上传：损坏旧件对比照、原厂新件包装防伪标、装配完工细节照
            </view>
          </view>
        </view>
      </view>

      <!-- 2. 工单信息提示 -->
      <view class="mx-4 mt-3 flex items-center justify-between border border-slate-700/80 rounded-lg bg-[#1e293b] p-3.5 text-xs">
        <view>
          <text class="text-slate-400">求援车辆：</text>
          <text class="text-slate-100 font-bold font-mono">{{ currentTicket?.plateNo }}</text>
        </view>
        <view class="text-rose-400 font-bold font-mono">
          应结总额：¥{{ currentTicket?.paidAmount || 1000 }}.00
        </view>
      </view>

      <!-- 3. 照片上传区域 -->
      <view class="mx-4 mt-3 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4">
        <view class="mb-3 flex items-center justify-between text-xs text-slate-200 font-bold">
          <text>作业照片存证 (最多4张)</text>
          <text class="text-[20rpx] text-slate-400 font-mono">{{ workPhotos.length }}/4</text>
        </view>

        <view class="grid grid-cols-2 gap-3">
          <view
            v-for="(photo, idx) in workPhotos"
            :key="idx"
            class="relative h-32 overflow-hidden border border-slate-700 rounded-md bg-slate-900"
          >
            <image :src="photo" mode="aspectFill" class="h-full w-full" />
            <view
              class="absolute right-1.5 top-1.5 h-6 w-6 flex cursor-pointer items-center justify-center rounded-sm bg-black/75 text-white"
              @click="removePhoto(idx)"
            >
              <text class="i-carbon-close text-xs" />
            </view>
            <view class="absolute inset-x-0 bottom-0 border-t border-slate-800 bg-slate-900/90 py-0.5 text-center text-[18rpx] text-slate-200 font-medium">
              {{ idx === 0 ? '损坏节温器旧件' : '原厂新件装配完成' }}
            </view>
          </view>

          <!-- 添加照片按钮 -->
          <view
            v-if="workPhotos.length < 4"
            class="h-32 flex flex-col cursor-pointer items-center justify-center border-2 border-slate-700 rounded-md border-dashed bg-slate-900/60 text-slate-400 transition-colors active:bg-slate-900"
            @click="takePhoto"
          >
            <text class="i-carbon-camera text-2xl text-[#0284c7]" />
            <text class="mt-1.5 text-xs text-slate-300 font-medium">拍摄存证照片</text>
            <text class="text-[18rpx] text-slate-500">支持相机拍摄/相册选择</text>
          </view>
        </view>
      </view>

      <!-- 4. 维修总结说明文本框 -->
      <view class="mx-4 mt-3 border border-slate-700/80 rounded-lg bg-[#1e293b] p-4">
        <view class="mb-2 text-xs text-slate-200 font-bold">
          现场检修总结说明
        </view>
        <textarea
          v-model="remark"
          :maxlength="200"
          class="h-24 w-full border border-slate-700 rounded-md bg-slate-900 p-2.5 text-xs text-slate-200 leading-relaxed outline-none"
          placeholder="请填写本次换件与检修自检情况"
          placeholder-class="text-slate-500"
        />
        <view class="mt-1 text-right text-[20rpx] text-slate-400 font-mono">
          {{ remark.length }}/200字
        </view>
      </view>
    </view>

    <!-- 5. 底部提交按钮 (手套防误触 ≥ 44px) -->
    <view class="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-700 bg-[#1e293b]/95 p-4">
      <button
        class="min-h-[88rpx] w-full flex items-center justify-center gap-2 rounded-lg border-none bg-[#0284c7] text-sm text-white font-bold transition-colors active:bg-[#0369a1]"
        @click="submitCompletion"
      >
        <text class="i-carbon-checkmark-filled text-base" />
        <text>提交完工存证并推送司机结算</text>
      </button>
    </view>
  </view>
</template>
