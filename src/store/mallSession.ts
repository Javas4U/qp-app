import type {
  FulfillmentType,
  MaintenancePackageItem,
  PartCategory,
  PartProductItem,
  ServiceStation,
  VehicleBrand,
  VehicleModelItem,
} from '@/types/mall'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useMallSessionStore = defineStore(
  'mallSession',
  () => {
    // 1. 品牌库
    const brands = ref<VehicleBrand[]>([
      { id: 'DFCV', name: '东风商用车', logo: '🚚' },
      { id: 'FAW', name: '一汽解放', logo: '🚛' },
      { id: 'SINOTRUK', name: '中国重汽', logo: '🚚' },
      { id: 'SHACMAN', name: '陕汽重卡', logo: '🚛' },
      { id: 'FOTON', name: '福田欧曼', logo: '🚚' },
    ])

    // 2. 车型列表
    const vehicleModels = ref<VehicleModelItem[]>([
      {
        id: 'DF-TL-01',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '天龙旗舰KX 560马力 6×4牵引车',
        fuelType: 'FUEL',
        displacement: '13.5L',
        horsepower: '560Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-02',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '天龙KL 460马力 6×4燃油牵引车',
        fuelType: 'FUEL',
        displacement: '11.0L',
        horsepower: '460Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-03',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '天龙KL LNG 460马力 天然气牵引车',
        fuelType: 'GAS',
        displacement: '12.0L',
        horsepower: '460Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-04',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '天龙KC 440马力 8×4工程自卸车',
        fuelType: 'FUEL',
        displacement: '10.5L',
        horsepower: '440Ps',
        image: 'https://images.unsplash.com/photo-1586191582056-a60b9eb47c87?w=500&auto=format&fit=crop&q=80',
      },
    ])

    // 当前选中的基准车型
    const selectedModel = ref<VehicleModelItem>(vehicleModels.value[1])

    // 3. 配件商品库（对标天龙配件选购页 (1) & (2)）
    const partsProducts = ref<PartProductItem[]>([
      {
        id: 'PART-001',
        name: '东风天龙 康明斯ISZ 发动机总成 (原厂带质保)',
        category: 'ENGINE',
        subCategoryName: '发动机总成',
        oeCode: 'OE-DF-5345091-ENG',
        isOriginal: true,
        priceRetail: 12800,
        salesCount: 1420,
        specs: [
          { label: '排量', value: '11L' },
          { label: '马力', value: '460Ps' },
          { label: '排放标准', value: '国六B' },
          { label: '质保期', value: '2年/20万公里' },
        ],
        shippingFee: 30,
        standardInstallFee: 1200,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
        description: '东风康明斯原厂高压共轨柴油机总成，经过原厂冷热态台架试验，动力强劲，燃油经济性优异。',
      },
      {
        id: 'PART-002',
        name: '东风天龙 驾驶室液压翻转减震器总成',
        category: 'CABIN',
        subCategoryName: '驾驶室部件',
        oeCode: 'OE-DF-5001010-CB',
        isOriginal: true,
        priceRetail: 680,
        salesCount: 3890,
        specs: [
          { label: '安装位置', value: '驾驶室后悬' },
          { label: '类型', value: '气囊+液压复合减震' },
        ],
        shippingFee: 15,
        standardInstallFee: 150,
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'PART-003',
        name: '法士特12挡铝壳变速箱总成 (12JSDX240TA)',
        category: 'ENGINE',
        subCategoryName: '传动系统',
        oeCode: 'OE-FS-12JSDX240TA',
        isOriginal: true,
        priceRetail: 9800,
        salesCount: 860,
        specs: [
          { label: '挡位数', value: '12前2倒' },
          { label: '壳体材质', value: '轻量化铝合金' },
        ],
        shippingFee: 40,
        standardInstallFee: 800,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'PART-004',
        name: '后桥主减速器及差速器总成 (东风德纳440单级减速)',
        category: 'BODY',
        subCategoryName: '底盘后桥',
        oeCode: 'OE-DANA-2401010',
        isOriginal: true,
        priceRetail: 4500,
        salesCount: 1120,
        specs: [
          { label: '速比', value: '3.7' },
          { label: '承载吨位', value: '13吨' },
        ],
        shippingFee: 35,
        standardInstallFee: 500,
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
      },
    ])

    // 当前选购的配件
    const currentPart = ref<PartProductItem>(partsProducts.value[0])
    // 当前选中的规格（排量、马力等）
    const selectedDisplacement = ref<string>('11L')
    const selectedHorsepower = ref<string>('460Ps')

    // 4. 履约方式选择：快递邮寄 VS 到店安装
    const fulfillmentType = ref<FulfillmentType>('EXPRESS')

    // 5. 合作安装服务站列表
    const stations = ref<ServiceStation[]>([
      {
        id: 'ST-001',
        name: '卡车汇孝感特约维保中心 (东风商用车认证)',
        address: '孝感市孝南区G107国道1188号',
        distanceKm: 3.2,
        phone: '0712-2889988',
        rating: 4.9,
      },
      {
        id: 'ST-002',
        name: '武汉东西湖物流园商用车快修站',
        address: '武汉市东西湖区高桥五路物流园内',
        distanceKm: 28.5,
        phone: '027-8339900',
        rating: 4.8,
      },
    ])
    const selectedStation = ref<ServiceStation>(stations.value[0])

    // 6. 维保套餐（对标天龙配件选购 (4)）
    const maintenancePackages = ref<MaintenancePackageItem[]>([
      {
        id: 'PKG-01',
        name: '小保养基础套餐 (机油机滤)',
        price: 680,
        selected: true,
        desc: '包含东风原厂全合成重负荷柴机油 30L + 原厂高流速机油滤清器',
      },
      {
        id: 'PKG-02',
        name: '原厂重卡机油更换升级 (美孚黑霸王)',
        price: 399,
        selected: false,
        desc: '升级为美孚黑霸王长效10万公里抗磨机油，保护发动机冷启动',
      },
      {
        id: 'PKG-03',
        name: '三滤长效保养套装 (柴滤/空滤/机滤)',
        price: 260,
        selected: true,
        desc: '包含粗滤、精滤、沙漠级空滤，有效降低油耗',
      },
      {
        id: 'PKG-04',
        name: '全车制动与底盘安全深度排查 (36项)',
        price: 150,
        selected: false,
        desc: '气路干燥筒检测、刹车蹄片磨损度测定、传动轴动平衡巡检',
      },
    ])

    // 计算总计与拆单明细
    const partPrice = computed(() => currentPart.value?.priceRetail || 0)
    const shippingFee = computed(() => (fulfillmentType.value === 'EXPRESS' ? currentPart.value.shippingFee : 0))
    const laborFee = computed(() => (fulfillmentType.value === 'STATION_INSTALL' ? currentPart.value.standardInstallFee : 0))

    // 维保套餐选中总价
    const selectedPackagesTotal = computed(() => {
      return maintenancePackages.value
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.price, 0)
    })

    // 最终合计总支付额
    const grandTotal = computed(() => {
      return partPrice.value + shippingFee.value + laborFee.value
    })

    function setFulfillmentType(type: FulfillmentType) {
      fulfillmentType.value = type
    }

    function toggleMaintenancePackage(id: string) {
      const target = maintenancePackages.value.find(item => item.id === id)
      if (target) {
        target.selected = !target.selected
      }
    }

    function selectVehicleModel(model: VehicleModelItem) {
      selectedModel.value = model
    }

    return {
      brands,
      vehicleModels,
      selectedModel,
      partsProducts,
      currentPart,
      selectedDisplacement,
      selectedHorsepower,
      fulfillmentType,
      stations,
      selectedStation,
      maintenancePackages,
      partPrice,
      shippingFee,
      laborFee,
      selectedPackagesTotal,
      grandTotal,
      setFulfillmentType,
      toggleMaintenancePackage,
      selectVehicleModel,
    }
  },
  {
    persist: true,
  },
)
