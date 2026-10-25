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
    navigationBarBackgroundColor: '#f8fafc',
    navigationBarTextStyle: 'black',
  },
})

const rescueStore = useRescueSessionStore()
const userStore = useUserSessionStore()
const { currentTicket } = storeToRefs(rescueStore)

// 现场存证照片列表
const workPhotos = ref<string[]>([
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
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
        } else {
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
  <view class="tech-complete-page min-h-screen bg-[#f8fafc] text-slate-800 pb-28 flex flex-col justify-between">
    <view>
      <!-- 1. 顶部完工指引 (工业高可视顶栏) -->
      <view class="bg-white border-b border-slate-200 p-4 shadow-sm">
        <view class="flex items-center gap-2.5">
          <view class="w-8 h-8 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center text-lg text-[#0284c7]">
            <text class="i-carbon-camera" />
          </view>
          <view>
            <view class="text-sm font-bold text-slate-900">
              现场作业标准化拍照存证
            </view>
            <view class="text-[20rpx] text-slate-500 mt-0.5">
              请务必上传：损坏旧件对比照、原厂新件包装防伪标、装配完工细节照
            </view>
          </view>
        </view>
      </view>

      <!-- 2. 工单信息提示 -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-3.5 border border-slate-200/90 shadow-sm flex items-center justify-between text-xs">
        <view>
          <text class="text-slate-500">求援车辆：</text>
          <text class="font-bold text-slate-900 font-mono">{{ currentTicket?.plateNo }}</text>
        </view>
        <view class="font-bold text-rose-600 font-mono">
          应结总额：¥{{ currentTicket?.paidAmount || 1000 }}.00
        </view>
      </view>

      <!-- 3. 照片上传区域 -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm">
        <view class="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
          <text>作业照片存证 (最多4张)</text>
          <text class="text-[20rpx] text-slate-500 font-mono">{{ workPhotos.length }}/4</text>
        </view>

        <view class="grid grid-cols-2 gap-3">
          <view
            v-for="(photo, idx) in workPhotos"
            :key="idx"
            class="relative h-32 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shadow-xs"
          >
            <image :src="photo" mode="aspectFill" class="w-full h-full" />
            <view
              class="absolute top-1.5 right-1.5 w-6 h-6 rounded-sm bg-black/60 text-white flex items-center justify-center cursor-pointer"
              @click="removePhoto(idx)"
            >
              <text class="i-carbon-close text-xs" />
            </view>
            <view class="absolute bottom-0 inset-x-0 bg-white/95 border-t border-slate-200 text-slate-700 text-[18rpx] py-0.5 text-center font-medium">
              {{ idx === 0 ? '损坏节温器旧件' : '原厂新件装配完成' }}
            </view>
          </view>

          <!-- 添加照片按钮 -->
          <view
            v-if="workPhotos.length < 4"
            class="h-32 rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors"
            @click="takePhoto"
          >
            <text class="i-carbon-camera text-2xl text-[#0284c7]" />
            <text class="text-xs font-medium text-slate-700 mt-1.5">拍摄存证照片</text>
            <text class="text-[18rpx] text-slate-400">支持相机拍摄/相册选择</text>
          </view>
        </view>
      </view>

      <!-- 4. 维修总结说明文本框 -->
      <view class="mx-4 mt-3 bg-white rounded-lg p-4 border border-slate-200/90 shadow-sm">
        <view class="text-xs font-bold text-slate-900 mb-2">
          现场检修总结说明
        </view>
        <textarea
          v-model="remark"
          :maxlength="200"
          class="w-full h-24 p-2.5 bg-slate-50 rounded-md text-xs text-slate-900 border border-slate-300 outline-none leading-relaxed"
          placeholder="请填写本次换件与检修自检情况"
          placeholder-class="text-slate-400"
        />
        <view class="text-right text-[20rpx] text-slate-500 font-mono mt-1">
          {{ remark.length }}/200字
        </view>
      </view>
    </view>

    <!-- 5. 底部提交按钮 (手套防误触 ≥ 44px) -->
    <view class="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-slate-200 z-30 shadow-md">
      <button
        class="w-full bg-[#0284c7] active:bg-[#0369a1] text-white min-h-[88rpx] rounded-lg font-bold text-sm flex items-center justify-center gap-2 border-none transition-colors shadow-sm"
        @click="submitCompletion"
      >
        <text class="i-carbon-checkmark-filled text-base" />
        <text>提交完工存证并推送司机结算</text>
      </button>
    </view>
  </view>
</template>
