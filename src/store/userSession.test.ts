import { GUEST_PLACEHOLDERS, GUEST_USER_INFO } from '@/constants/guest'
import { useTokenStore } from '@/store/token'
import { beforeEach, describe, expect, it } from 'vitest'
import { useUserSessionStore } from './userSession'

describe('useUserSessionStore (访客占位防护与会话管理)', () => {
  beforeEach(() => {
    const tokenStore = useTokenStore()
    tokenStore.clearTokenInfo()
    const sessionStore = useUserSessionStore()
    sessionStore.resetSession()
  })

  it('初始访客态：默认展示占位信息与 isGuest 为 true', () => {
    const sessionStore = useUserSessionStore()

    expect(sessionStore.isGuest).toBe(true)
    expect(sessionStore.hasLogin).toBe(false)
    expect(sessionStore.userInfo.nickname).toBe(GUEST_PLACEHOLDERS.nickname)
    expect(sessionStore.userInfo.phone).toBe(GUEST_PLACEHOLDERS.phone)
    expect(sessionStore.userInfo.memberLevel).toBe(GUEST_PLACEHOLDERS.memberLevel)
    expect(sessionStore.userInfo.defaultVehicleName).toBe(GUEST_PLACEHOLDERS.defaultVehicleName)
    expect(sessionStore.userInfo.defaultPlateNo).toBe(GUEST_PLACEHOLDERS.defaultPlateNo)
    expect(sessionStore.userInfo.userId).toBe('')
  })

  it('updateUserInfo 与 resetSession：重置后必须彻底恢复访客纯净态', () => {
    const sessionStore = useUserSessionStore()

    sessionStore.updateUserInfo({
      userId: '1001',
      nickname: '老李测试',
      phone: '13800000000',
      defaultPlateNo: '鄂A·12345',
    })

    expect(sessionStore.userInfo.nickname).toBe('老李测试')
    expect(sessionStore.userInfo.phone).toBe('13800000000')

    sessionStore.resetSession()

    expect(sessionStore.userInfo.nickname).toBe(GUEST_USER_INFO.nickname)
    expect(sessionStore.userInfo.phone).toBe(GUEST_USER_INFO.phone)
    expect(sessionStore.userInfo.defaultPlateNo).toBe(GUEST_USER_INFO.defaultPlateNo)
    expect(sessionStore.userInfo.userId).toBe('')
    expect(sessionStore.roles).toEqual([])
  })

  it('switchRole：未登录访客态下严禁随意切换为技师视角', () => {
    const sessionStore = useUserSessionStore()

    expect(sessionStore.currentRole).toBe('DRIVER')
    sessionStore.switchRole('TECHNICIAN')
    expect(sessionStore.currentRole).toBe('DRIVER')
  })

  it('登录态联动：token 设置后 hasLogin 生效，token 清理后恢复访客态', () => {
    const tokenStore = useTokenStore()
    const sessionStore = useUserSessionStore()

    expect(sessionStore.hasLogin).toBe(false)
    expect(sessionStore.isGuest).toBe(true)

    tokenStore.setTokenInfo({
      token: 'mock-sa-token-value',
      expiresIn: 3600,
    })

    expect(tokenStore.hasLogin).toBe(true)
    expect(sessionStore.hasLogin).toBe(true)
    expect(sessionStore.isGuest).toBe(false)

    tokenStore.clearTokenInfo()

    expect(tokenStore.hasLogin).toBe(false)
    expect(sessionStore.hasLogin).toBe(false)
    expect(sessionStore.isGuest).toBe(true)
    expect(sessionStore.userInfo.nickname).toBe(GUEST_PLACEHOLDERS.nickname)
  })
})
