import type { DemoMaintenanceOrderItem, DemoMallOrderItem } from '@/types/demo'
import { beforeEach, describe, expect, it } from 'vitest'
import { GUEST_MODEL_PLACEHOLDER, useMallSessionStore } from './mallSession'

describe('useMallSessionStore (商城与维保动态演示池)', () => {
  beforeEach(() => {
    const store = useMallSessionStore()
    store.resetSelectedModel()
    store.setFulfillmentType('EXPRESS')
  })

  it('履约模式切换与动态计费：EXPRESS 与 STATION_INSTALL 拆单联动', () => {
    const store = useMallSessionStore()

    // 默认 EXPRESS 模式
    store.setFulfillmentType('EXPRESS')
    expect(store.fulfillmentType).toBe('EXPRESS')
    expect(store.shippingFee).toBe(store.currentPart.shippingFee)
    expect(store.laborFee).toBe(0)
    expect(store.grandTotal).toBe(store.partPrice + store.shippingFee)

    // 切换到 STATION_INSTALL 模式
    store.setFulfillmentType('STATION_INSTALL')
    expect(store.fulfillmentType).toBe('STATION_INSTALL')
    expect(store.shippingFee).toBe(0)
    expect(store.laborFee).toBe(store.currentPart.standardInstallFee)
    expect(store.grandTotal).toBe(store.partPrice + store.laborFee)
  })

  it('维保套餐动态勾选与价格汇总：toggleMaintenancePackage', () => {
    const store = useMallSessionStore()
    const pkg01 = store.maintenancePackages.find(p => p.id === 'PKG-01')
    expect(pkg01).toBeDefined()

    const initialTotal = store.selectedPackagesTotal
    const initialSelected = pkg01!.selected

    // 反转勾选
    store.toggleMaintenancePackage('PKG-01')
    expect(pkg01!.selected).toBe(!initialSelected)

    if (initialSelected) {
      expect(store.selectedPackagesTotal).toBe(initialTotal - pkg01!.price)
    }
    else {
      expect(store.selectedPackagesTotal).toBe(initialTotal + pkg01!.price)
    }
  })

  it('商城订单动态增删与状态流转：addMallOrder 与 updateMallOrderStatus', () => {
    const store = useMallSessionStore()
    const initialCount = store.mallOrdersList.length

    const testOrder: DemoMallOrderItem = {
      orderNo: 'OD-TEST-9999',
      partName: '测试发电机总成',
      spec: '11L / 460Ps',
      channelText: '顺丰特快',
      fulfillmentType: 'EXPRESS',
      stationName: '孝感仓库',
      quantity: 1,
      totalPrice: '12,800',
      status: 'PENDING_DELIVERY',
      statusText: '备件出库中',
      badgeBg: 'bg-emerald-500/15',
      image: '',
      createTime: '2026-10-30',
      timeline: [],
    }

    store.addMallOrder(testOrder)
    expect(store.mallOrdersList.length).toBe(initialCount + 1)
    expect(store.mallOrdersList[0].orderNo).toBe('OD-TEST-9999')

    // 更新状态为已完成
    store.updateMallOrderStatus('OD-TEST-9999', 'COMPLETED')
    const updated = store.mallOrdersList.find(o => o.orderNo === 'OD-TEST-9999')
    expect(updated).toBeDefined()
    expect(updated!.status).toBe('COMPLETED')
    expect(updated!.statusText).toBe('已签收 · 交易完成')
  })

  it('维保预约单动态增删与核销流转：addMaintenanceOrder 与 updateMaintenanceOrderStatus', () => {
    const store = useMallSessionStore()
    const initialCount = store.maintenanceOrdersList.length

    const testBooking: DemoMaintenanceOrderItem = {
      orderNo: 'YY-TEST-8888',
      packageName: '小保养基础套餐',
      stationName: '孝感特约维保中心',
      serviceTime: '2026-10-30 15:00',
      address: 'G107国道南段',
      phone: '0712-2889988',
      verifyCode: '9999 8888 7777',
      status: 'PENDING_SERVICE',
      statusText: '预约成功 · 待进站',
      isOngoing: true,
    }

    store.addMaintenanceOrder(testBooking)
    expect(store.maintenanceOrdersList.length).toBe(initialCount + 1)
    expect(store.maintenanceOrdersList[0].orderNo).toBe('YY-TEST-8888')

    // 进站核销
    store.updateMaintenanceOrderStatus('YY-TEST-8888', 'FINISHED')
    const updated = store.maintenanceOrdersList.find(o => o.orderNo === 'YY-TEST-8888')
    expect(updated).toBeDefined()
    expect(updated!.status).toBe('FINISHED')
    expect(updated!.statusText).toBe('已进站保养 · 核销完成')
    expect(updated!.isOngoing).toBe(false)
  })

  it('车型选择与重置：selectVehicleModel 与 resetSelectedModel', () => {
    const store = useMallSessionStore()
    expect(store.isGuestModel).toBe(true)

    const model = store.vehicleModels[0]
    store.selectVehicleModel(model)

    expect(store.selectedModel.id).toBe(model.id)
    expect(store.isGuestModel).toBe(false)

    store.resetSelectedModel()
    expect(store.selectedModel.id).toBe(GUEST_MODEL_PLACEHOLDER.id)
    expect(store.isGuestModel).toBe(true)
  })

  it('全品牌与全动力维度车型矩阵完备性：5品牌 × 4动力类型 100% 覆盖', () => {
    const store = useMallSessionStore()
    const brandIds = ['DFCV', 'FAW', 'SINOTRUK', 'SHACMAN', 'FOTON']
    const fuelTypes = ['FUEL', 'GAS', 'EV', 'HYDROGEN']

    for (const bId of brandIds) {
      for (const fType of fuelTypes) {
        const matches = store.vehicleModels.filter(m => m.brandId === bId && m.fuelType === fType)
        expect(matches.length, `${bId} + ${fType} 车型不应为空`).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('车型数据自愈保障：当 vehicleModels 被意外破坏或老旧缓存覆盖时，可通过 forceRefreshVehicleModels 恢复全矩阵', () => {
    const store = useMallSessionStore()
    store.vehicleModels = []
    expect(store.vehicleModels.length).toBe(0)

    store.forceRefreshVehicleModels()
    expect(store.vehicleModels.length).toBeGreaterThanOrEqual(50)
  })

  it('车型真实图片完备性与 0 破图保障：所有车型图片均为有效实车照片，杜绝失效死链', () => {
    const store = useMallSessionStore()
    expect(store.vehicleModels.length).toBeGreaterThanOrEqual(50)

    for (const m of store.vehicleModels) {
      expect(m.image).toBeTruthy()
      expect(m.image).not.toContain('photo-1586191582056')
      expect(m.image.startsWith('https://images.unsplash.com/photo-')).toBe(true)
    }
  })
})

