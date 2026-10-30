/**
 * 客户与车辆领域类型定义
 */

export interface CustomerVehicleVo {
  id: string | number
  plateNo: string
  modelName: string
  brandName?: string
  vin?: string
  isDefault?: boolean
  createTime?: string
}
