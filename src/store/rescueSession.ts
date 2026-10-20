import type { ReplacedPartItem, RescueLocation, RescueOrderVo, RescueTicket, RescueTypeCode } from '@/types/rescue'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useRescueSessionStore = defineStore(
  'rescueSession',
  () => {
    // 真实后端工单快照（用于 SWR 秒开及跨页面平滑传递）
    const activeOrderDetail = ref<RescueOrderVo | null>(null)

    function setActiveOrderDetail(order: RescueOrderVo | null) {
      activeOrderDetail.value = order
    }

    // 默认提供一个可演示的初始救援工单
    const defaultTicket: RescueTicket = {
      ticketId: 'RC202610120001',
      driverId: 'D10001',
      driverName: '李师傅',
      driverPhone: '13800138000',
      plateNo: '鄂A·88888',
      rescueType: 'ENGINE',
      rescueTypeName: '发动机故障',
      status: 'DISPATCHING',
      location: {
        address: 'G107国道孝感段K128+500处',
        lat: 30.92,
        lng: 113.91,
      },
      faultImages: [
        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80',
      ],
      faultDescription: '重载爬坡时发动机水温爆表报警，熄火后伴有异响无法启动',
      estimatedFee: 600,
      createTime: '2026-10-12 14:32:00',
      technicianId: 'T8801',
      technicianName: '张建军师傅',
      technicianPhone: '13911223344',
      technicianRating: 4.9,
      technicianAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      currentDistanceKm: 12.6,
      etaMinutes: 18,
      stationName: '卡车汇东风商用车孝感特约救援站',
      replacedParts: [
        {
          partName: '原厂节温器总成 (东风康明斯ISZ13)',
          partCode: 'OE-5345091',
          isOriginal: true,
          price: 580,
          laborFee: 220,
        },
        {
          partName: '原厂重负荷防冻冷却液 10kg',
          partCode: 'OE-8821903',
          isOriginal: true,
          price: 200,
          laborFee: 0,
        },
      ],
      workPhotos: [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
      ],
      paidAmount: 1000,
    }

    const currentTicket = ref<RescueTicket | null>(defaultTicket)
    const historyTickets = ref<RescueTicket[]>([
      {
        ticketId: 'RC202610080088',
        driverId: 'D10001',
        driverName: '李师傅',
        driverPhone: '13800138000',
        plateNo: '鄂A·88888',
        rescueType: 'TIRE',
        rescueTypeName: '轮胎爆胎',
        status: 'PAID',
        location: {
          address: '京港澳高速蔡甸服务区',
          lat: 30.58,
          lng: 114.05,
        },
        faultImages: [],
        faultDescription: '右后导向轮突发爆胎',
        estimatedFee: 800,
        createTime: '2026-10-08 09:15:00',
        technicianName: '王建师傅',
        technicianPhone: '13788990011',
        paidAmount: 850,
      },
    ])

    const dispatchCountdownSeconds = ref<number>(118)
    const isDispatching = computed(() => currentTicket.value?.status === 'DISPATCHING')

    // 格式化倒计时 MM:SS
    const formattedCountdown = computed(() => {
      const minutes = Math.floor(dispatchCountdownSeconds.value / 60)
      const seconds = dispatchCountdownSeconds.value % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    })

    // 创建报案
    function createTicket(data: {
      rescueType: RescueTypeCode
      rescueTypeName: string
      location: RescueLocation
      faultImages: string[]
      faultDescription: string
      driverName: string
      driverPhone: string
      plateNo: string
    }) {
      const newTicketId = `RC${Date.now().toString().slice(-10)}`
      const ticket: RescueTicket = {
        ticketId: newTicketId,
        driverId: 'D10001',
        driverName: data.driverName || '李师傅',
        driverPhone: data.driverPhone || '13800138000',
        plateNo: data.plateNo || '鄂A·88888',
        rescueType: data.rescueType,
        rescueTypeName: data.rescueTypeName,
        status: 'DISPATCHING',
        location: data.location,
        faultImages: data.faultImages,
        faultDescription: data.faultDescription,
        estimatedFee: 600,
        createTime: new Date().toLocaleString(),
        currentDistanceKm: 12.6,
        etaMinutes: 18,
      }
      currentTicket.value = ticket
      dispatchCountdownSeconds.value = 120
      return ticket
    }

    // 模拟技师接单
    function mockAcceptTicket() {
      if (!currentTicket.value)
        return
      currentTicket.value.status = 'ACCEPTED'
      currentTicket.value.technicianId = 'T8801'
      currentTicket.value.technicianName = '张建军师傅'
      currentTicket.value.technicianPhone = '13911223344'
      currentTicket.value.technicianRating = 4.9
      currentTicket.value.technicianAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      currentTicket.value.currentDistanceKm = 12.6
      currentTicket.value.etaMinutes = 18
      currentTicket.value.stationName = '卡车汇东风商用车孝感特约救援站'
    }

    // 技师到达现场打卡
    function arriveAtScene() {
      if (!currentTicket.value)
        return
      currentTicket.value.status = 'ARRIVED'
    }

    // 开始现场检修换件
    function startService() {
      if (!currentTicket.value)
        return
      currentTicket.value.status = 'SERVICING'
    }

    // 技师确认现场更换配件
    function confirmParts(parts: ReplacedPartItem[]) {
      if (!currentTicket.value)
        return
      currentTicket.value.replacedParts = parts
      const total = parts.reduce((sum, item) => sum + item.price + item.laborFee, 0)
      currentTicket.value.estimatedFee = total > 0 ? total : currentTicket.value.estimatedFee
    }

    // 技师完工拍照存证
    function completeService(photos: string[]) {
      if (!currentTicket.value)
        return
      currentTicket.value.status = 'COMPLETED'
      currentTicket.value.workPhotos = photos
      currentTicket.value.completedTime = new Date().toLocaleString()
      // 计算结算金额（如配件 + 工时 = 1000 元）
      let totalAmount = 0
      if (currentTicket.value.replacedParts?.length) {
        totalAmount = currentTicket.value.replacedParts.reduce(
          (sum, p) => sum + p.price + p.laborFee,
          0,
        )
      }
      currentTicket.value.paidAmount = totalAmount > 0 ? totalAmount : 1000
    }

    // 司机支付成功
    function payTicket(amount?: number) {
      if (!currentTicket.value)
        return
      currentTicket.value.status = 'PAID'
      if (amount) {
        currentTicket.value.paidAmount = amount
      }
      historyTickets.value.unshift({ ...currentTicket.value })
    }

    // 取消工单
    function cancelTicket() {
      if (!currentTicket.value)
        return
      currentTicket.value.status = 'CANCELLED'
      historyTickets.value.unshift({ ...currentTicket.value })
      currentTicket.value = null
    }

    // 重置或恢复初始演示工单
    function resetToDemo() {
      currentTicket.value = { ...defaultTicket }
    }

    return {
      activeOrderDetail,
      setActiveOrderDetail,
      currentTicket,
      historyTickets,
      dispatchCountdownSeconds,
      formattedCountdown,
      isDispatching,
      createTicket,
      mockAcceptTicket,
      arriveAtScene,
      startService,
      confirmParts,
      completeService,
      payTicket,
      cancelTicket,
      resetToDemo,
    }
  },
  {
    persist: true,
  },
)
