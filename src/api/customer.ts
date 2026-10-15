import { http } from '@/http/http'
import type { CustomerVehicleVo } from '@/types/customer'

/**
 * 获取当前车主绑定的车辆列表
 */
export function getCustomerVehicleList() {
  return http.get<CustomerVehicleVo[]>('/customer/vehicle/list')
}

/**
 * 绑定或更新车辆信息
 */
export function saveCustomerVehicle(vehicle: Partial<CustomerVehicleVo>) {
  return http.post<CustomerVehicleVo>('/customer/vehicle/save', vehicle)
}
