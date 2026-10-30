import { currRoute, getLastPage } from '@/utils'
import { debounce } from '@/utils/debounce'

export interface ToLoginPageOptions {
  /**
   * 跳转模式, uni.navigateTo | uni.reLaunch
   * @default 'navigateTo'
   */
  mode?: 'navigateTo' | 'reLaunch'
  /**
   * 自定义回跳页面路径，如 '/pages/order/index'
   */
  redirectUrl?: string
  /**
   * 查询参数字符串，如 '?redirect=%2Fpages%2Forder%2Findex'
   */
  queryString?: string
  /**
   * 跳转前向用户展示的友好轻提示
   */
  noticeMessage?: string
}

export const LOGIN_PAGE = '/pages-sub/auth/login'

/**
 * 跳转到登录页，带防抖处理与自动来源路由编码
 */
export const toLoginPage = debounce((options: ToLoginPageOptions | string = {}) => {
  let opts: ToLoginPageOptions = {}
  if (typeof options === 'string') {
    opts = { redirectUrl: options }
  }
  else {
    opts = options
  }

  const { mode = 'navigateTo', redirectUrl, queryString, noticeMessage } = opts

  if (noticeMessage) {
    uni.showToast({
      title: noticeMessage,
      icon: 'none',
      duration: 1500,
    })
  }

  // 计算最终的 redirect 参数
  let targetQuery = queryString || ''
  if (!targetQuery) {
    const rawRedirect = redirectUrl || (currRoute() ? currRoute().path : '')
    if (rawRedirect && rawRedirect !== LOGIN_PAGE) {
      targetQuery = `?redirect=${encodeURIComponent(rawRedirect)}`
    }
  }

  const url = `${LOGIN_PAGE}${targetQuery}`

  // 获取当前页面路径，如果在登录页则不重复跳转
  const currentPage = getLastPage()
  const currentPath = currentPage?.route ? `/${currentPage.route}` : ''
  if (currentPath === LOGIN_PAGE) {
    return
  }

  if (mode === 'navigateTo') {
    uni.navigateTo({ url })
  }
  else {
    uni.reLaunch({ url })
  }
}, 300)

/**
 * 带有提示消息并快捷引导至登录页的方法
 */
export function redirectToLogin(customRedirect?: string, noticeMessage?: string) {
  toLoginPage({
    redirectUrl: customRedirect,
    noticeMessage,
  })
}
