import { GUEST_USER_INFO } from '@/constants/guest'
import { useTokenStore } from '@/store/token'
import type { DemoMileageRecord, DemoVoucherItem } from '@/types/demo'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type AppUserRole = 'DRIVER' | 'TECHNICIAN'

export interface UserSessionProfile {
  userId: string
  nickname: string
  phone: string
  avatar: string
  memberLevel: string
  memberPoints: number | string
  defaultPlateNo: string
  defaultVehicleName: string
  totalOrders: number | string
  vouchersCount: number | string
}

export interface TechnicianSessionInfo {
  technicianId: string
  name: string
  phone: string
  stationName: string
  starRating: number
  serviceYears: number
  todayCompletedCount: number
  isOnline: boolean
}

const defaultTechnicianInfo: TechnicianSessionInfo = {
  technicianId: '',
  name: '未认证技师',
  phone: '--',
  stationName: '暂无归属服务站',
  starRating: 5.0,
  serviceYears: 0,
  todayCompletedCount: 0,
  isOnline: false,
}

export const useUserSessionStore = defineStore(
  'userSession',
  () => {
    // 角色管理：当前生效激活角色
    const currentRole = ref<AppUserRole>('DRIVER')
    // 用户具备的全部后端角色编码列表（未登录默认为空）
    const roles = ref<string[]>([])

    // 用户与车辆基础信息（未登录默认为访客占位符）
    const userInfo = ref<UserSessionProfile>({ ...GUEST_USER_INFO })

    // 清理历史本地持久化存储中残留的测试脏数据 (如历史写死的 28 条订单)
    if (userInfo.value.totalOrders === 28) {
      userInfo.value.totalOrders = 0
    }

    // 技师信息（当处于技师视角时生效）
    const technicianInfo = ref<TechnicianSessionInfo>({ ...defaultTechnicianInfo })

    // 专属卡券包列表
    const vouchersList = ref<DemoVoucherItem[]>([
      {
        id: 'VOUCHER-01',
        title: '配件商城原厂大额满减券',
        type: 'MALL',
        discountAmount: 500,
        minSpend: 5000,
        validUntil: '2026-12-31',
        targetUrl: '/pages-sub/mall/parts-catalog',
        tag: '原厂配件通用',
      },
      {
        id: 'VOUCHER-02',
        title: '干线公路紧急救援首单立减券',
        type: 'RESCUE',
        discountAmount: 100,
        minSpend: 0,
        validUntil: '2026-12-31',
        targetUrl: '/pages/rescue/index',
        tag: '全国特约网点通用',
      },
      {
        id: 'VOUCHER-03',
        title: '重卡秋季36项底盘巡检体验券',
        type: 'MAINTENANCE',
        discountAmount: 150,
        minSpend: 150,
        validUntil: '2026-11-30',
        targetUrl: '/pages-sub/mall/package-select',
        tag: '特约维保中心',
      },
    ])

    // 会员里程积分明细账本
    const mileageRecords = ref<DemoMileageRecord[]>([
      {
        id: 'MR-01',
        title: '长途干线安全出车 1200km 达标奖励',
        points: 240,
        time: '2026-10-28 18:30',
        type: 'PLUS',
      },
      {
        id: 'MR-02',
        title: '原厂重卡机油深度保养服务返分',
        points: 150,
        time: '2026-10-15 15:40',
        type: 'PLUS',
      },
      {
        id: 'MR-03',
        title: '东风天龙配件商城原厂发电机采购奖励',
        points: 880,
        time: '2026-10-12 11:20',
        type: 'PLUS',
      },
      {
        id: 'MR-04',
        title: '积分商城兑换原厂三滤抵扣券',
        points: 300,
        time: '2026-10-10 09:10',
        type: 'MINUS',
      },
    ])

    // 鉴权状态联动
    const hasLogin = computed(() => {
      try {
        const tokenStore = useTokenStore()
        return tokenStore.updateNowTime().hasLogin
      }
      catch {
        return false
      }
    })

    const isGuest = computed(() => !hasLogin.value)

    // 角色计算属性
    const hasTechnicianRole = computed(() => {
      if (!hasLogin.value)
        return false
      return (roles.value || []).some(r =>
        ['TECHNICIAN', 'PROVIDER', 'ADMIN'].includes(String(r).toUpperCase()),
      )
    })

    const hasDriverRole = computed(() => {
      if (!hasLogin.value)
        return false
      return (roles.value || []).some(r =>
        ['DRIVER', 'CUSTOMER', 'USER'].includes(String(r).toUpperCase()),
      )
    })

    // 是否同时具备技师和司机双重角色
    const hasBothRoles = computed(() => {
      return hasTechnicianRole.value && hasDriverRole.value
    })

    const isTechnician = computed(() => hasLogin.value && currentRole.value === 'TECHNICIAN')
    const isCustomer = computed(() => currentRole.value === 'DRIVER')

    /**
     * 根据当前用户拥有的角色列表智能初始化当前视角
     */
    function initUserRoles(newRoles?: string[]) {
      if (Array.isArray(newRoles) && newRoles.length > 0) {
        roles.value = newRoles
      }

      const isTech = hasTechnicianRole.value
      const isDriver = hasDriverRole.value

      if (isTech && !isDriver) {
        // 纯技师角色：强制激活技师视角
        currentRole.value = 'TECHNICIAN'
      }
      else if (isDriver && !isTech) {
        // 纯司机角色：强制激活司机视角
        currentRole.value = 'DRIVER'
      }
      else if (isTech && isDriver) {
        // 双重角色：若已有有效持久化选择则保留，否则默认优先司机模式
        if (!['DRIVER', 'TECHNICIAN'].includes(currentRole.value)) {
          currentRole.value = 'DRIVER'
        }
      }
      else {
        // 无明确角色或默认访客：默认司机模式
        currentRole.value = 'DRIVER'
      }
    }

    /**
     * 切换当前激活视角 (仅当具有双角色权限且登录时生效)
     */
    function switchRole(targetRole?: AppUserRole) {
      if (!hasLogin.value) {
        console.warn('未登录状态下不允许切换视角')
        return
      }

      if (!hasBothRoles.value && roles.value.length > 0) {
        console.warn('当前用户非双重身份，不允许随意切换视角')
        return
      }

      if (targetRole) {
        currentRole.value = targetRole
      }
      else {
        currentRole.value = currentRole.value === 'DRIVER' ? 'TECHNICIAN' : 'DRIVER'
      }
    }

    /**
     * 设置角色
     */
    function setRoles(newRoles: string[]) {
      initUserRoles(newRoles)
    }

    /**
     * 更新或合并用户信息
     */
    function updateUserInfo(partial: Partial<UserSessionProfile>) {
      userInfo.value = {
        ...userInfo.value,
        ...partial,
      }
    }

    /**
     * 登出后重置状态为纯净访客态
     */
    function resetSession() {
      currentRole.value = 'DRIVER'
      roles.value = []
      userInfo.value = { ...GUEST_USER_INFO }
      technicianInfo.value = { ...defaultTechnicianInfo }
    }

    return {
      currentRole,
      roles,
      userInfo,
      technicianInfo,
      vouchersList,
      mileageRecords,
      hasLogin,
      isGuest,
      hasTechnicianRole,
      hasDriverRole,
      hasBothRoles,
      isTechnician,
      isCustomer,
      initUserRoles,
      switchRole,
      setRoles,
      updateUserInfo,
      resetSession,
    }
  },
  {
    persist: true,
  },
)
