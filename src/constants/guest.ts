/**
 * 移动端访客状态与占位符规范常量定义
 * 对应特性分支: specs/022-app-guest-placeholder-guard
 */

export interface GuestPlaceholders {
  readonly avatar: string
  readonly nickname: string
  readonly phone: string
  readonly memberLevel: string
  readonly vehiclePickerName: string
  readonly defaultVehicleName: string
  readonly defaultPlateNo: string
  readonly metricsPlaceholder: string
  readonly emptyOrderText: string
}

export const GUEST_PLACEHOLDERS: GuestPlaceholders = {
  avatar: '/static/images/default-avatar.png',
  nickname: '点击登录 / 注册',
  phone: '--',
  memberLevel: '点击登录',
  vehiclePickerName: '选择车型 / 绑定爱车',
  defaultVehicleName: '暂未绑定爱车 (登录后查看)',
  defaultPlateNo: '--',
  metricsPlaceholder: '--',
  emptyOrderText: '登录后查看您的全部订单与救援进度',
} as const

/**
 * 访客初始空用户信息对象结构
 */
export const GUEST_USER_INFO = {
  userId: '',
  nickname: GUEST_PLACEHOLDERS.nickname,
  phone: GUEST_PLACEHOLDERS.phone,
  avatar: GUEST_PLACEHOLDERS.avatar,
  memberLevel: GUEST_PLACEHOLDERS.memberLevel,
  memberPoints: 0,
  defaultPlateNo: GUEST_PLACEHOLDERS.defaultPlateNo,
  defaultVehicleName: GUEST_PLACEHOLDERS.defaultVehicleName,
  totalOrders: 0,
  vouchersCount: 0,
} as const
