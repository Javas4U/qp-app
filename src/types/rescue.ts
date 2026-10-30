/**
 * 道路紧急救援与抢修工单领域类型契约定义
 */

export type RescueTypeCode
  = | 'TOWING'
    | 'TIRE'
    | 'BATTERY'
    | 'OIL'
    | 'LOCK'
    | 'ENGINE'
    | 'OTHER'
    | 'CIRCUIT'
    | 'START_FAIL'
    | 'REPLACE_PART'
    | 'TOW_TRUCK'
    | (string & {})

export type RescueOrderStatus
  = | 'PENDING_DISPATCH'
    | 'DISPATCHING'
    | 'ACCEPTED'
    | 'DEPARTED'
    | 'ARRIVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | (string & {})

export interface RescueLocation {
  address?: string
  lat: number
  lng: number
  longitude?: number
  latitude?: number
}

export interface ReplacedPartItem {
  partName: string
  partCode?: string
  isOriginal?: boolean
  price: number
  laborFee?: number
}

export interface RescueTicket {
  ticketId: string
  driverId?: string
  driverName?: string
  driverPhone?: string
  plateNo: string
  rescueType: RescueTypeCode
  rescueTypeName?: string
  status: RescueOrderStatus
  location: RescueLocation
  faultImages?: string[]
  faultDescription?: string
  estimatedFee?: number
  paidAmount?: number
  createTime?: string
  completedTime?: string
  technicianId?: string
  technicianName?: string
  technicianPhone?: string
  technicianRating?: number
  technicianAvatar?: string
  currentDistanceKm?: number
  etaMinutes?: number
  stationName?: string
  replacedParts?: ReplacedPartItem[]
  workPhotos?: string[]
}

export interface RescueOrderEvaluationVo {
  id?: number | string
  orderNo?: string
  starRating?: number
  overallScore?: number
  speedScore?: number
  qualityScore?: number
  attitudeScore?: number
  commentContent?: string
  content?: string
  tags?: string[]
  createTime?: string
}

export interface RescueOrderVo {
  id?: number | string
  orderNo: string
  driverName?: string
  driverPhone?: string
  plateNo: string
  vehicleModel?: string
  dispatchMode?: string
  serviceType: string
  faultDescription?: string
  sceneImages?: string
  rescueAddress: string
  rescueLongitude?: number
  rescueLatitude?: number
  stationName?: string
  assignedStationName?: string
  technicianName?: string
  technicianPhone?: string
  technicianPlateNo?: string
  technicianAvatar?: string
  orderStatus: RescueOrderStatus
  estimatedAmount?: number
  extraAmount?: number
  finalAmount?: number
  paymentStatus?: number
  paymentTime?: string
  evaluationStatus?: number
  evaluation?: RescueOrderEvaluationVo
  acceptTime?: string
  departTime?: string
  arriveTime?: string
  finishTime?: string
  finishRemark?: string
  finishImages?: string
  createTime?: string
  partItems?: any[]
  extraItems?: any[]
}

export interface CallRescueDto {
  serviceType: string
  vehicleModel: string
  plateNo: string
  rescueAddress: string
  rescueLongitude: number
  rescueLatitude: number
  faultDescription?: string
  sceneImages?: string | string[]
  assignedStationId?: number | string
  contactPhone?: string
  contactName?: string
  driverName?: string
  driverPhone?: string
}

export interface AcceptOrderDto {
  orderNo: string
  technicianId?: string
  technicianName?: string
  technicianPhone?: string
  technicianPlateNo?: string
}

export interface AcceptOrderVo {
  success: boolean
  orderNo: string
}

export interface ReportProgressDto {
  action?: string
  progressType?: 'DEPARTED' | 'ARRIVED' | 'FINISHED' | string
  currentLongitude?: number
  currentLatitude?: number
  finishImages?: string
  finishRemark?: string
}

export interface MockPayRescueOrderDto {
  payChannel?: string
  paymentMethod?: string
  payAmount?: number
}

export interface RescueOrderEvaluationDto {
  orderNo?: string
  overallScore?: number
  speedScore?: number
  qualityScore?: number
  attitudeScore?: number
  commentContent?: string
  anonymous?: number
  starRating?: number
  content?: string
  tags?: string[]
}

export interface RescueOrderItemVo {
  id?: number | string
  orderNo: string
  driverName?: string
  driverPhone?: string
  plateNo: string
  vehicleModel?: string
  serviceType: string
  rescueAddress: string
  orderStatus: RescueOrderStatus
  estimatedAmount?: number
  finalAmount?: number
  paymentStatus?: number
  createTime?: string
  urgency?: string
  faultDesc?: string
  location?: string
  distanceKm?: number
  status?: string
}
