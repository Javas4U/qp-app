import { http } from '@/http/http'
import type {
  AcceptOrderDto,
  AcceptOrderVo,
  CallRescueDto,
  MockPayRescueOrderDto,
  ReportProgressDto,
  RescueOrderEvaluationDto,
  RescueOrderItemVo,
  RescueOrderVo,
} from '@/types/rescue'

/**
 * 司机发起道路紧急救援呼救 (直连真实后端)
 */
export function callRescue(data: CallRescueDto) {
  return http.post<RescueOrderVo>('/rescue/orders/call', data)
}

/**
 * 根据单号查询救援工单全生命周期详情 (用于雷达轮询与跟踪页展示)
 */
export function getRescueOrderDetail(orderNo: string) {
  return http.get<RescueOrderVo>(`/rescue/orders/${orderNo}`)
}

/**
 * 获取当前登录司机最新进行中的活跃救援工单 (用于异常恢复与直接进入跟踪页)
 */
export function getActiveRescueOrder() {
  return http.get<RescueOrderVo | null>('/rescue/orders/active')
}

/**
 * 客户指定网点超时 (10分钟) 一键转为平台智能就近调度
 */
export function transferToBroadcast(orderNo: string) {
  return http.post<void>(`/rescue/orders/${orderNo}/transferToBroadcast`)
}

/**
 * 技师移动端拉取指派给当前登录技师的任务列表
 */
export function getMyRescueTasks() {
  return http.get<RescueOrderVo[]>('/rescue/orders/myTasks')
}

/**
 * 技师作业节点打卡 (出发/到场/完工存证)
 */
export function reportRescueProgress(orderNo: string, data: ReportProgressDto) {
  return http.post<void>(`/rescue/orders/${orderNo}/progress`, data)
}

/**
 * 查询抢修工单大厅列表
 */
export function getRescueOrderPage(params: { pageNum: number, pageSize: number, status?: string }) {
  return http.get<RescueOrderItemVo[]>('/rescue/order/page', params)
}

/**
 * 技师抢单
 */
export function acceptRescueOrder(data: AcceptOrderDto) {
  return http.post<AcceptOrderVo>('/rescue/order/accept', data)
}

/**
 * 技师更新抢修到达与核销状态
 */
export function updateRescueStatus(data: { orderNo: string, action: string, remark?: string }) {
  return http.post<boolean>('/rescue/order/status', data)
}

/**
 * 司机端模拟支付救援工单费用
 */
export function mockPayRescueOrder(orderNo: string, data: MockPayRescueOrderDto) {
  return http.post<void>(`/rescue/orders/${orderNo}/pay`, data)
}

/**
 * 司机端提交服务满意度评价
 */
export function evaluateRescueOrder(orderNo: string, data: RescueOrderEvaluationDto) {
  return http.post<void>(`/rescue/orders/${orderNo}/evaluate`, data)
}

