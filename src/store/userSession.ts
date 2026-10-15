import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type AppUserRole = 'DRIVER' | 'TECHNICIAN'

export const useUserSessionStore = defineStore(
  'userSession',
  () => {
    // 角色管理：当前生效激活角色
    const currentRole = ref<AppUserRole>('DRIVER')
    // 用户具备的全部后端角色编码列表
    const roles = ref<string[]>(['CUSTOMER', 'DRIVER'])

    // 用户与车辆基础信息
    const userInfo = ref({
      userId: 'U10086',
      nickname: '卡车司机老李',
      phone: '138****8888',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      memberLevel: '钻石会员',
      memberPoints: 3680,
      defaultPlateNo: '鄂A·88888',
      defaultVehicleName: '东风商用车 天龙KL 460马力 牵引车',
      totalOrders: 28,
      vouchersCount: 3,
    })

    // 技师信息（当处于技师视角时生效）
    const technicianInfo = ref({
      technicianId: 'T8801',
      name: '张建军师傅',
      phone: '139****3344',
      stationName: '卡车汇东风商用车特约救援站',
      starRating: 4.9,
      serviceYears: 12,
      todayCompletedCount: 3,
      isOnline: true,
    })

    // 角色计算属性
    const hasTechnicianRole = computed(() => {
      return (roles.value || []).some(r =>
        ['TECHNICIAN', 'PROVIDER', 'ADMIN'].includes(String(r).toUpperCase()),
      )
    })

    const hasDriverRole = computed(() => {
      return (roles.value || []).some(r =>
        ['DRIVER', 'CUSTOMER', 'USER'].includes(String(r).toUpperCase()),
      )
    })

    // 是否同时具备技师和司机双重角色
    const hasBothRoles = computed(() => {
      return hasTechnicianRole.value && hasDriverRole.value
    })

    const isTechnician = computed(() => currentRole.value === 'TECHNICIAN')
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
      } else if (isDriver && !isTech) {
        // 纯司机角色：强制激活司机视角
        currentRole.value = 'DRIVER'
      } else if (isTech && isDriver) {
        // 双重角色：若已有有效持久化选择则保留，否则默认优先司机模式
        if (!['DRIVER', 'TECHNICIAN'].includes(currentRole.value)) {
          currentRole.value = 'DRIVER'
        }
      } else {
        // 无明确角色或默认访客：默认司机模式
        currentRole.value = 'DRIVER'
      }
    }

    /**
     * 切换当前激活视角 (仅当具有双角色权限时生效)
     */
    function switchRole(targetRole?: AppUserRole) {
      if (!hasBothRoles.value && roles.value.length > 0) {
        console.warn('当前用户非双重身份，不允许随意切换视角')
        return
      }

      if (targetRole) {
        currentRole.value = targetRole
      } else {
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
     * 登出后重置状态
     */
    function resetSession() {
      currentRole.value = 'DRIVER'
      roles.value = ['CUSTOMER', 'DRIVER']
    }

    return {
      currentRole,
      roles,
      userInfo,
      technicianInfo,
      hasTechnicianRole,
      hasDriverRole,
      hasBothRoles,
      isTechnician,
      isCustomer,
      initUserRoles,
      switchRole,
      setRoles,
      resetSession,
    }
  },
  {
    persist: true,
  },
)
