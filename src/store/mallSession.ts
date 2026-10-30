import type {
  FulfillmentType,
  MaintenancePackageItem,
  PartProductItem,
  ServiceStation,
  VehicleBrand,
  VehicleModelItem,
} from '@/types/mall'
import type { DemoMaintenanceOrderItem, DemoMallOrderItem } from '@/types/demo'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { GUEST_PLACEHOLDERS } from '@/constants/guest'

export const GUEST_MODEL_PLACEHOLDER: VehicleModelItem = {
  id: '',
  brandId: '',
  brandName: '卡车汇',
  name: GUEST_PLACEHOLDERS.vehiclePickerName,
  fuelType: 'FUEL',
  displacement: '--',
  horsepower: '--',
  image: '',
}

export const DEFAULT_BRANDS: VehicleBrand[] = [
  { id: 'DFCV', name: '东风商用车', logo: '🚚' },
  { id: 'FAW', name: '一汽解放', logo: '🚛' },
  { id: 'SINOTRUK', name: '中国重汽', logo: '🚚' },
  { id: 'SHACMAN', name: '陕汽重卡', logo: '🚛' },
  { id: 'FOTON', name: '福田欧曼', logo: '🚚' },
]

// 2. 全量品牌与全动力维度车型矩阵 (5品牌 × 4动力类型，全维度覆盖 0 空态)
export const ALL_VEHICLE_MODELS: VehicleModelItem[] = [
  // ----------------- 东风商用车 (DFCV) -----------------
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
        name: '天龙KC 440马力 8×4工程自卸车',
        fuelType: 'FUEL',
        displacement: '10.5L',
        horsepower: '440Ps',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-04',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '天锦KR 290马力 4×2绿通载货车',
        fuelType: 'FUEL',
        displacement: '6.7L',
        horsepower: '290Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-05',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '天龙KL LNG 460马力 天然气牵引车',
        fuelType: 'GAS',
        displacement: '12.0L',
        horsepower: '460Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-06',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '天龙旗舰KX LNG 530马力 气体机牵引车',
        fuelType: 'GAS',
        displacement: '15.0L',
        horsepower: '530Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-07',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '天龙KC LNG 440马力 8×4天然气自卸车',
        fuelType: 'GAS',
        displacement: '12.0L',
        horsepower: '440Ps',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-08',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '东风天龙KL 换电式纯电动牵引车',
        fuelType: 'EV',
        displacement: '282kWh电池',
        horsepower: '490Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-09',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '东风华神DV3 纯电动自卸工程车',
        fuelType: 'EV',
        displacement: '350kWh电池',
        horsepower: '450Ps',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-10',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '东风天锦KR 纯电动物流城配重卡',
        fuelType: 'EV',
        displacement: '162kWh电池',
        horsepower: '245Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-11',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '东风天龙KX 氢燃料电池49吨牵引车',
        fuelType: 'HYDROGEN',
        displacement: '120kW电堆',
        horsepower: '540Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'DF-TL-12',
        brandId: 'DFCV',
        brandName: '东风商用车',
        name: '东风氢腾 6×4 燃料电池长途重卡',
        fuelType: 'HYDROGEN',
        displacement: '150kW电堆',
        horsepower: '600Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },

      // ----------------- 一汽解放 (FAW) -----------------
      {
        id: 'FAW-J7-01',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J7 600马力 6×4干线牵引车',
        fuelType: 'FUEL',
        displacement: '15.0L',
        horsepower: '600Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-J6V-02',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J6V 520马力 6×4长途领航版',
        fuelType: 'FUEL',
        displacement: '13.0L',
        horsepower: '520Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-J6P-03',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J6P 460马力 6×4经典质惠版',
        fuelType: 'FUEL',
        displacement: '11.0L',
        horsepower: '460Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-J6L-04',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J6L 260马力 4×2绿通载货车',
        fuelType: 'FUEL',
        displacement: '5.7L',
        horsepower: '260Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-J6V-05',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J6V LNG 530马力 天然气牵引车',
        fuelType: 'GAS',
        displacement: '15.0L',
        horsepower: '530Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-J7-06',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J7 LNG 560马力 气体机旗舰版',
        fuelType: 'GAS',
        displacement: '15.0L',
        horsepower: '560Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-JH6-07',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放JH6 LNG 460马力 长续航牵引车',
        fuelType: 'GAS',
        displacement: '13.0L',
        horsepower: '460Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-J6P-08',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J6P 充换电一体纯电牵引车',
        fuelType: 'EV',
        displacement: '282kWh电池',
        horsepower: '490Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-J6L-09',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J6L 纯电动市政自卸重卡',
        fuelType: 'EV',
        displacement: '282kWh电池',
        horsepower: '410Ps',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-J7-10',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J7 氢燃料电池重载牵引车',
        fuelType: 'HYDROGEN',
        displacement: '160kW电堆',
        horsepower: '580Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FAW-J6P-11',
        brandId: 'FAW',
        brandName: '一汽解放',
        name: '解放J6P 氢能干线物流示范重卡',
        fuelType: 'HYDROGEN',
        displacement: '120kW电堆',
        horsepower: '500Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },

      // ----------------- 中国重汽 (SINOTRUK) -----------------
      {
        id: 'CN-C9H-01',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '汕德卡 C9H 680马力 6×4超旗舰重卡',
        fuelType: 'FUEL',
        displacement: '16.6L',
        horsepower: '680Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'CN-X7-02',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '黄河 X7 570马力 低风阻干线牵引车',
        fuelType: 'FUEL',
        displacement: '13.0L',
        horsepower: '570Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'CN-TH7-03',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '豪沃 TH7 480马力 奔强版燃油重卡',
        fuelType: 'FUEL',
        displacement: '11.0L',
        horsepower: '480Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'CN-TX-04',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '豪沃 TX 400马力 8×4工程自卸车',
        fuelType: 'FUEL',
        displacement: '10.5L',
        horsepower: '400Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'CN-G7S-05',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '汕德卡 G7S LNG 530马力 天然气重卡',
        fuelType: 'GAS',
        displacement: '15.0L',
        horsepower: '530Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'CN-MAX-06',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '豪沃 MAX LNG 480马力 天然气牵引车',
        fuelType: 'GAS',
        displacement: '13.0L',
        horsepower: '480Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'CN-GX-07',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '汕德卡 GX 纯电充换一体牵引车',
        fuelType: 'EV',
        displacement: '350kWh电池',
        horsepower: '540Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'CN-TX-08',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '豪沃 TX 纯电动市政自卸重卡',
        fuelType: 'EV',
        displacement: '282kWh电池',
        horsepower: '460Ps',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'CN-HH-09',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '黄河 氢燃料电池雪蜡雪域重卡',
        fuelType: 'HYDROGEN',
        displacement: '162kW电堆',
        horsepower: '590Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'CN-SDK-10',
        brandId: 'SINOTRUK',
        brandName: '中国重汽',
        name: '汕德卡 氢能全功率燃料电池重卡',
        fuelType: 'HYDROGEN',
        displacement: '200kW电堆',
        horsepower: '660Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },

      // ----------------- 陕汽重卡 (SHACMAN) -----------------
      {
        id: 'SX-X6000-01',
        brandId: 'SHACMAN',
        brandName: '陕汽重卡',
        name: '陕汽德龙 X6000 660马力 旗舰牵引车',
        fuelType: 'FUEL',
        displacement: '15.0L',
        horsepower: '660Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'SX-X5000-02',
        brandId: 'SHACMAN',
        brandName: '陕汽重卡',
        name: '陕汽德龙 X5000 480马力 高效重卡',
        fuelType: 'FUEL',
        displacement: '12.0L',
        horsepower: '480Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'SX-M3000S-03',
        brandId: 'SHACMAN',
        brandName: '陕汽重卡',
        name: '陕汽德龙 M3000S 430马力 8×4自卸车',
        fuelType: 'FUEL',
        displacement: '10.5L',
        horsepower: '430Ps',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'SX-X6000-04',
        brandId: 'SHACMAN',
        brandName: '陕汽重卡',
        name: '陕汽德龙 X6000 LNG 530马力 燃气重卡',
        fuelType: 'GAS',
        displacement: '15.0L',
        horsepower: '530Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'SX-X5000-05',
        brandId: 'SHACMAN',
        brandName: '陕汽重卡',
        name: '陕汽德龙 X5000 LNG 480马力 气耗标杆版',
        fuelType: 'GAS',
        displacement: '13.0L',
        horsepower: '480Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'SX-E6000-06',
        brandId: 'SHACMAN',
        brandName: '陕汽重卡',
        name: '陕汽德龙 E6000 纯电充换电牵引车',
        fuelType: 'EV',
        displacement: '350kWh电池',
        horsepower: '520Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'SX-M3000E-07',
        brandId: 'SHACMAN',
        brandName: '陕汽重卡',
        name: '陕汽德龙 M3000E 纯电工程自卸车',
        fuelType: 'EV',
        displacement: '282kWh电池',
        horsepower: '450Ps',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'SX-H2-08',
        brandId: 'SHACMAN',
        brandName: '陕汽重卡',
        name: '陕汽德龙 X6000 氢燃料电池牵引车',
        fuelType: 'HYDROGEN',
        displacement: '150kW电堆',
        horsepower: '560Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'SX-ZJ-09',
        brandId: 'SHACMAN',
        brandName: '陕汽重卡',
        name: '陕汽智劲 氢能长续航干线重卡',
        fuelType: 'HYDROGEN',
        displacement: '180kW电堆',
        horsepower: '620Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },

      // ----------------- 福田欧曼 (FOTON) -----------------
      {
        id: 'FT-YH-01',
        brandId: 'FOTON',
        brandName: '福田欧曼',
        name: '欧曼银河 660马力 6×4全能旗舰重卡',
        fuelType: 'FUEL',
        displacement: '15.0L',
        horsepower: '660Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FT-EST-02',
        brandId: 'FOTON',
        brandName: '福田欧曼',
        name: '欧曼EST星辉版 530马力 超级卡车',
        fuelType: 'FUEL',
        displacement: '13.0L',
        horsepower: '530Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FT-GTL-03',
        brandId: 'FOTON',
        brandName: '福田欧曼',
        name: '欧曼GTL 460马力 畅享版燃油重卡',
        fuelType: 'FUEL',
        displacement: '11.0L',
        horsepower: '460Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FT-YH-04',
        brandId: 'FOTON',
        brandName: '福田欧曼',
        name: '欧曼银河 LNG 530马力 天然气超级重卡',
        fuelType: 'GAS',
        displacement: '15.0L',
        horsepower: '530Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FT-EST-05',
        brandId: 'FOTON',
        brandName: '福田欧曼',
        name: '欧曼EST LNG 480马力 低气耗牵引车',
        fuelType: 'GAS',
        displacement: '13.0L',
        horsepower: '480Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FT-ZL-06',
        brandId: 'FOTON',
        brandName: '福田欧曼',
        name: '欧曼智蓝 纯电动换电重卡',
        fuelType: 'EV',
        displacement: '282kWh电池',
        horsepower: '490Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FT-EST-07',
        brandId: 'FOTON',
        brandName: '福田欧曼',
        name: '欧曼EST EV 纯电干线牵引车',
        fuelType: 'EV',
        displacement: '350kWh电池',
        horsepower: '540Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FT-YH-08',
        brandId: 'FOTON',
        brandName: '福田欧曼',
        name: '欧曼银河 氢燃料电池长续航重卡',
        fuelType: 'HYDROGEN',
        displacement: '150kW电堆',
        horsepower: '580Ps',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'FT-ZL-09',
        brandId: 'FOTON',
        brandName: '福田欧曼',
        name: '欧曼智蓝 氢能物流冷链特种重卡',
        fuelType: 'HYDROGEN',
        displacement: '120kW电堆',
        horsepower: '490Ps',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
      },
    ]

export const DEFAULT_PARTS_PRODUCTS: PartProductItem[] = [
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
    image: 'https://images.unsplash.com/photo-1635691033744-a1a2a07ba971?w=600&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'PART-005',
    name: '原厂重卡高功率交流发电机总成 (28V 80A 国六B)',
    category: 'ELEC',
    subCategoryName: '发电机总成',
    oeCode: 'OE-DF-3701010-EL',
    isOriginal: true,
    priceRetail: 850,
    salesCount: 1680,
    specs: [
      { label: '额定电压', value: '28V' },
      { label: '额定电流', value: '80A' },
      { label: '调节器类型', value: '内置集成' },
    ],
    shippingFee: 20,
    standardInstallFee: 180,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'PART-006',
    name: '潍柴WP13/天龙原厂高压共轨喷油器套装 (6支装)',
    category: 'ENGINE',
    subCategoryName: '燃油喷射系统',
    oeCode: 'OE-CR-0445120-INJ',
    isOriginal: true,
    priceRetail: 2400,
    salesCount: 950,
    specs: [
      { label: '喷射压力', value: '1800Bar' },
      { label: '数量', value: '6支精配' },
    ],
    shippingFee: 25,
    standardInstallFee: 300,
    image: 'https://images.unsplash.com/photo-1635691033744-a1a2a07ba971?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'PART-007',
    name: '威伯科WABCO挂车ABS电磁阀及整车控制器ECU',
    category: 'ELEC',
    subCategoryName: '制动电子控制',
    oeCode: 'OE-WABCO-4721950',
    isOriginal: true,
    priceRetail: 1680,
    salesCount: 740,
    specs: [
      { label: '控制通道', value: '4S/4M' },
      { label: '适用车型', value: '重卡/牵引半挂' },
    ],
    shippingFee: 20,
    standardInstallFee: 260,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'PART-008',
    name: '瀚德Haldex双腔自动调整臂及重载制动气室总成',
    category: 'BODY',
    subCategoryName: '制动执行机构',
    oeCode: 'OE-HALDEX-79350',
    isOriginal: true,
    priceRetail: 520,
    salesCount: 2200,
    specs: [
      { label: '气室型号', value: 'Type 30/30' },
      { label: '调整方式', value: '免维护自动恒隙' },
    ],
    shippingFee: 15,
    standardInstallFee: 120,
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop&q=80',
  },
]

// 4. 真实干线特约服务站全貌矩阵 (覆盖湖北及周边干线重卡物流枢纽)
export const DEFAULT_SERVICE_STATIONS: ServiceStation[] = [
  {
    id: 'ST-001',
    name: '卡车汇孝感特约维保中心 (东风商用车认证)',
    address: '湖北省孝感市孝南区G107国道1188号',
    distanceKm: 3.2,
    phone: '0712-2889988',
    rating: 4.9,
    latitude: 30.9182,
    longitude: 113.9213,
    isCertified: true,
    has24hRescue: true,
    tags: ['东风商用车认证', '重卡大修', '24H极速救援', '配件中心仓'],
    businessHours: '00:00 - 24:00 (全天候)',
  },
  {
    id: 'ST-002',
    name: '武汉东西湖物流园商用车快修站',
    address: '湖北省武汉市东西湖区高桥五路物流园内',
    distanceKm: 28.5,
    phone: '027-8339900',
    rating: 4.8,
    latitude: 30.6288,
    longitude: 114.1285,
    isCertified: true,
    has24hRescue: true,
    tags: ['干线物流枢纽', '底盘悬挂', '快速保养', '制动气路'],
    businessHours: '08:00 - 22:00',
  },
  {
    id: 'ST-003',
    name: '汉口北商用车综合维保基地',
    address: '湖北省武汉市黄陂区汉口北大道88号商用车大市场',
    distanceKm: 42.1,
    phone: '027-82915566',
    rating: 4.9,
    latitude: 30.7021,
    longitude: 114.3312,
    isCertified: true,
    has24hRescue: false,
    tags: ['康明斯动力专修', '天然气系统维护', '重卡钣金喷漆'],
    businessHours: '08:30 - 18:30',
  },
  {
    id: 'ST-004',
    name: '襄阳高新重卡技术服务中心',
    address: '湖北省襄阳市高新区奔驰大道东风汽车工业园北门',
    distanceKm: 185.0,
    phone: '0710-3882299',
    rating: 4.9,
    latitude: 32.0821,
    longitude: 112.1582,
    isCertified: true,
    has24hRescue: true,
    tags: ['原厂发动机标定', '后桥减速器专修', '24H救援驻点'],
    businessHours: '00:00 - 24:00 (全天候)',
  },
  {
    id: 'ST-005',
    name: '十堰东风商用车核心维保总站',
    address: '湖北省十堰市张湾区车城西路东风重卡基地',
    distanceKm: 320.0,
    phone: '0719-8226688',
    rating: 5.0,
    latitude: 32.6512,
    longitude: 110.7821,
    isCertified: true,
    has24hRescue: true,
    tags: ['东风技术总工驻点', '国六全车电路排查', '总成质保核销'],
    businessHours: '00:00 - 24:00 (全天候)',
  },
  {
    id: 'ST-006',
    name: '宜昌三峡物流园商用车快修站',
    address: '湖北省宜昌市伍家岗区桔乡路三峡物流园8号门',
    distanceKm: 260.0,
    phone: '0717-6991122',
    rating: 4.7,
    latitude: 30.6821,
    longitude: 111.3512,
    isCertified: true,
    has24hRescue: true,
    tags: ['山区重载刹车调校', '液力缓速器专修', '24H流动救援'],
    businessHours: '00:00 - 24:00 (全天候)',
  },
]

export const useMallSessionStore = defineStore(
  'mallSession',
  () => {
    // 1. 品牌库
    const brands = ref<VehicleBrand[]>(DEFAULT_BRANDS)

    // 2. 全量品牌与全动力维度车型矩阵 (5品牌 × 4动力类型，全维度覆盖 0 空态)
    const vehicleModels = ref<VehicleModelItem[]>([...ALL_VEHICLE_MODELS])

    // 自愈保障函数：若历史 persist 缓存中车型库数据少于 20 款或存在历史失效图片残留，立即强制重置为全量最新矩阵
    function checkAndHealVehicleModels() {
      const hasBrokenImage = vehicleModels.value?.some(m => !m.image || m.image.includes('photo-1586191582056'))
      if (!vehicleModels.value || vehicleModels.value.length < 20 || hasBrokenImage) {
        vehicleModels.value = [...ALL_VEHICLE_MODELS]
      }
    }
    checkAndHealVehicleModels()

    function forceRefreshVehicleModels() {
      vehicleModels.value = [...ALL_VEHICLE_MODELS]
    }

    // 当前选中的基准车型（未登录或未绑定时为占位车型）
    const selectedModel = ref<VehicleModelItem>(GUEST_MODEL_PLACEHOLDER)
    const isGuestModel = computed(() => !selectedModel.value?.id)

    // 3. 配件商品库（覆盖发动机、驾驶室、底盘后桥、全车电器等原厂品类）
    const partsProducts = ref<PartProductItem[]>([...DEFAULT_PARTS_PRODUCTS])

    // 自愈保障函数：若历史 persist 缓存中配件数据存在历史失效图片，立即强制重置为全量最新配件
    function checkAndHealPartsProducts() {
      const hasBroken = partsProducts.value?.some(p => !p.image || p.image.includes('photo-1486006920555'))
      if (!partsProducts.value || partsProducts.value.length < 4 || hasBroken) {
        partsProducts.value = [...DEFAULT_PARTS_PRODUCTS]
      }
    }
    checkAndHealPartsProducts()

    function forceRefreshPartsProducts() {
      partsProducts.value = [...DEFAULT_PARTS_PRODUCTS]
    }

    // 当前选购的配件
    const currentPart = ref<PartProductItem>(partsProducts.value[0])
    // 当前选中的规格（排量、马力等）
    const selectedDisplacement = ref<string>('11L')
    const selectedHorsepower = ref<string>('460Ps')

    // 4. 履约方式选择：快递邮寄 VS 到店安装
    const fulfillmentType = ref<FulfillmentType>('EXPRESS')

    // 5. 合作安装服务站列表 (覆盖干线枢纽特约维保大厅)
    const stations = ref<ServiceStation[]>([...DEFAULT_SERVICE_STATIONS])
    const selectedStation = ref<ServiceStation>(stations.value[0])

    function checkAndHealStations() {
      if (!stations.value || stations.value.length < 4 || !stations.value[0]?.latitude) {
        stations.value = [...DEFAULT_SERVICE_STATIONS]
      }
      if (!selectedStation.value || !selectedStation.value.id || !selectedStation.value.latitude) {
        selectedStation.value = stations.value[0]
      }
    }
    checkAndHealStations()

    function selectStation(station: ServiceStation) {
      selectedStation.value = station
    }

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

    // 7. 商城订单与维保预约单响应式池 (用于高保真演示流转)
    const defaultMallOrders: DemoMallOrderItem[] = [
      {
        orderNo: 'OD-20261012-0992',
        partName: '东风商用车 天龙原厂高功率发电机总成 (460Ps 国六B)',
        spec: '规格：11L / 460Ps · 原厂国六B · 质保12个月',
        channelText: '履约通道：到店特约站专业安装 (含¥1200工时费)',
        fulfillmentType: 'STATION_INSTALL',
        stationName: '卡车汇东风商用车孝感特约救援站',
        quantity: 1,
        totalPrice: '14,000',
        status: 'PENDING_DELIVERY',
        statusText: '待收货 / 待到店安装',
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-400/30',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=80',
        createTime: '2026-10-12 10:20:00',
        timeline: [
          { title: '备件已从东风孝感中心仓顺丰冷链特快发出', time: '2026-10-12 11:00', done: true, desc: '顺丰单号: SF18829103982' },
          { title: '到达卡车汇孝感特约维保中心', time: '2026-10-12 16:30', done: true, desc: '配件已入库，等待车主进站安装' },
          { title: '专业技师工位待命中', time: '2026-10-13 09:00', done: false, desc: '预约进站即可直接上架安装' },
        ],
      },
      {
        orderNo: 'OD-20261005-0811',
        partName: '东风康明斯 ISZ13 重卡原厂水泵总成及传动皮带',
        spec: '规格：原厂重负荷专用 · 双向动平衡认证',
        channelText: '履约通道：顺丰特快直发车队',
        fulfillmentType: 'EXPRESS',
        stationName: '湖北省孝感市孝南区配件中心仓',
        quantity: 1,
        totalPrice: '860',
        status: 'COMPLETED',
        statusText: '已签收 · 交易完成',
        badgeBg: 'bg-slate-700/50 text-slate-300 border border-slate-600',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
        createTime: '2026-10-05 09:15:00',
        timeline: [
          { title: '配件包裹由车队门卫李师傅代签收', time: '2026-10-06 14:20', done: true, desc: '签收人: 李师傅 (外包装完好无损)' },
        ],
      },
    ]

    const defaultMaintenanceOrders: DemoMaintenanceOrderItem[] = [
      {
        orderNo: 'YY-20261015-001',
        packageName: '东风天龙旗舰 小保养基础套餐 + 36项底盘巡检',
        stationName: '卡车汇东风商用车孝感特约救援站',
        serviceTime: '2026年10月15日 14:00',
        address: '湖北省孝感市孝南区G107国道南段68号',
        phone: '0712-2889988',
        verifyCode: '8820 9134 5091',
        status: 'PENDING_SERVICE',
        statusText: '预约成功 · 待进站',
        isOngoing: true,
      },
      {
        orderNo: 'YY-20260920-008',
        packageName: '重卡秋季长途三滤深度保洁 + 制动气路干燥罐更换',
        stationName: '卡车汇东风商用车武汉江夏特约服务站',
        serviceTime: '2026年9月20日 10:30',
        address: '湖北省武汉市江夏区金港汽车工业园8号',
        phone: '027-88996655',
        verifyCode: '6610 8921 3412',
        status: 'FINISHED',
        statusText: '已进站保养 · 核销完成',
        isOngoing: false,
      },
    ]

    const mallOrdersList = ref<DemoMallOrderItem[]>(defaultMallOrders)
    const maintenanceOrdersList = ref<DemoMaintenanceOrderItem[]>(defaultMaintenanceOrders)

    function addMallOrder(order: DemoMallOrderItem) {
      mallOrdersList.value.unshift(order)
    }

    function updateMallOrderStatus(orderNo: string, status: DemoMallOrderItem['status'], statusText?: string) {
      const target = mallOrdersList.value.find(o => o.orderNo === orderNo)
      if (target) {
        target.status = status
        if (statusText) {
          target.statusText = statusText
        }
        else if (status === 'COMPLETED') {
          target.statusText = '已签收 · 交易完成'
          target.badgeBg = 'bg-slate-700/50 text-slate-300 border border-slate-600'
        }
      }
    }

    function addMaintenanceOrder(order: DemoMaintenanceOrderItem) {
      maintenanceOrdersList.value.unshift(order)
    }

    function updateMaintenanceOrderStatus(orderNo: string, status: DemoMaintenanceOrderItem['status'], statusText?: string) {
      const target = maintenanceOrdersList.value.find(o => o.orderNo === orderNo)
      if (target) {
        target.status = status
        if (statusText) {
          target.statusText = statusText
        }
        else if (status === 'FINISHED') {
          target.statusText = '已进站保养 · 核销完成'
          target.isOngoing = false
        }
      }
    }

    function resetSelectedModel() {
      selectedModel.value = GUEST_MODEL_PLACEHOLDER
    }

    return {
      brands,
      vehicleModels,
      selectedModel,
      isGuestModel,
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
      mallOrdersList,
      maintenanceOrdersList,
      addMallOrder,
      updateMallOrderStatus,
      addMaintenanceOrder,
      updateMaintenanceOrderStatus,
      setFulfillmentType,
      toggleMaintenancePackage,
      selectVehicleModel,
      resetSelectedModel,
      selectStation,
      checkAndHealStations,
      forceRefreshVehicleModels,
      forceRefreshPartsProducts,
      checkAndHealPartsProducts,
    }
  },
  {
    persist: {
      paths: [
        'selectedModel',
        'selectedDisplacement',
        'selectedHorsepower',
        'fulfillmentType',
        'selectedStation',
        'mallOrdersList',
        'maintenanceOrdersList',
      ],
      afterRestore: (ctx) => {
        const hasBrokenImage = ctx.store.vehicleModels?.some((m: VehicleModelItem) => !m.image || m.image.includes('photo-1586191582056'))
        if (!ctx.store.vehicleModels || ctx.store.vehicleModels.length < 20 || hasBrokenImage) {
          ctx.store.vehicleModels = [...ALL_VEHICLE_MODELS]
        }
        const hasBrokenPart = ctx.store.partsProducts?.some((p: PartProductItem) => !p.image || p.image.includes('photo-1486006920555'))
        if (!ctx.store.partsProducts || ctx.store.partsProducts.length < 4 || hasBrokenPart) {
          ctx.store.partsProducts = [...DEFAULT_PARTS_PRODUCTS]
        }
        if (!ctx.store.stations || ctx.store.stations.length < 4 || !ctx.store.stations[0]?.latitude) {
          ctx.store.stations = [...DEFAULT_SERVICE_STATIONS]
        }
        if (!ctx.store.selectedStation || !ctx.store.selectedStation.id || !ctx.store.selectedStation.latitude) {
          ctx.store.selectedStation = ctx.store.stations ? ctx.store.stations[0] : DEFAULT_SERVICE_STATIONS[0]
        }
      },
    },
  },
)
