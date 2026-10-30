/**
 * 移动端全板块高保真交互演示版实体与契约模型
 * 对应特性分支: specs/023-app-interactive-demo-polish
 */

export interface DemoOrderItemTimeline {
  title: string
  time: string
  done: boolean
  desc?: string
}

export interface DemoMallOrderItem {
  orderNo: string
  partName: string
  spec: string
  channelText: string
  fulfillmentType: 'EXPRESS' | 'STATION_INSTALL'
  stationName: string
  quantity: number
  totalPrice: number | string
  status: 'PENDING_DELIVERY' | 'SHIPPED' | 'COMPLETED'
  statusText: string
  badgeBg: string
  image: string
  timeline: DemoOrderItemTimeline[]
  createTime: string
}

export interface DemoMaintenanceOrderItem {
  orderNo: string
  packageName: string
  stationName: string
  serviceTime: string
  address: string
  phone: string
  verifyCode: string
  status: 'PENDING_SERVICE' | 'FINISHED'
  statusText: string
  isOngoing: boolean
}

export interface DemoVoucherItem {
  id: string
  title: string
  type: 'MALL' | 'RESCUE' | 'MAINTENANCE'
  discountAmount: number
  minSpend: number
  validUntil: string
  targetUrl: string
  tag: string
  used?: boolean
}

export interface DemoMileageRecord {
  id: string
  title: string
  points: number
  time: string
  type: 'PLUS' | 'MINUS'
}

export interface DiagnosisChatResponse {
  expertName: string
  expertTitle: string
  content: string
  recommendAction?: {
    text: string
    url: string
  }
}

