/**
 * 商城、配件与维保套餐领域类型定义
 */

export type FuelType = 'FUEL' | 'GAS' | 'ELECTRIC' | 'HYBRID' | 'EV' | 'HYDROGEN' | (string & {})
export type FulfillmentType = 'EXPRESS' | 'STATION' | 'STATION_INSTALL' | (string & {})
export type PartCategory = 'ENGINE' | 'CABIN' | 'BODY' | 'ELECTRICAL' | 'CHASSIS' | 'ALL' | 'ELEC' | (string & {})

export interface VehicleBrand {
  id: string
  name: string
  logo?: string
}

export interface VehicleModelItem {
  id: string
  brandId: string
  brandName: string
  name: string
  fuelType?: FuelType
  displacement?: string
  horsepower?: string
  image?: string
}

export interface PartSpecItem {
  label: string
  value: string
}

export interface PartProductItem {
  id: string
  name: string
  category: PartCategory
  subCategoryName?: string
  oeCode?: string
  isOriginal?: boolean
  priceRetail: number
  salesCount?: number
  specs?: PartSpecItem[]
  shippingFee?: number
  standardInstallFee?: number
  image?: string
  description?: string
}

export interface ServiceStation {
  id: string
  name: string
  address: string
  distanceKm?: number
  phone?: string
  rating?: number
  latitude?: number
  longitude?: number
  isCertified?: boolean
  has24hRescue?: boolean
  tags?: string[]
  businessHours?: string
}

export interface MaintenancePackageItem {
  id: string
  name: string
  price: number
  selected?: boolean
  desc?: string
}
