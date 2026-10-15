import { http } from '@/http/http'

export interface LoginResultVo {
  token: string
  refreshToken: string
  clientNo: string
  roles: string[]
}

/**
 * 微信小程序授权登录
 */
export function wechatMiniLogin(code: string) {
  return http.post<LoginResultVo>('/auth/wx/login', { code })
}

export interface CurrentLoginUserVo {
  clientNo: string
  username: string
  realName?: string
  phone?: string
  avatar?: string
  roles?: string[]
}

/**
 * 获取当前登录用户信息与权限 (直连后端 GET /auth/userInfo)
 */
export function getCurrentLoginUserApi() {
  return http.get<CurrentLoginUserVo>('/auth/userInfo')
}

export interface QuickLoginDto {
  phone: string
  nickname?: string
}

export interface QuickLoginResultVo {
  tokenName: string
  tokenValue: string
  tokenPrefix: string
  clientNo: string
  username: string
}

/**
 * 移动端手机号一键免密快捷登录
 */
export function quickLoginApi(data: QuickLoginDto) {
  return http.post<QuickLoginResultVo>('/auth/quickLogin', data)
}
