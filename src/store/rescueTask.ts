import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RescueOrderItemVo } from '@/types/rescue'

export const useRescueTaskStore = defineStore(
  'rescueTask',
  () => {
    const currentActiveOrder = ref<RescueOrderItemVo | null>(null)
    const isOnline = ref<boolean>(true)

    function setCurrentOrder(order: RescueOrderItemVo | null) {
      currentActiveOrder.value = order
    }

    function toggleOnlineStatus() {
      isOnline.value = !isOnline.value
    }

    return {
      currentActiveOrder,
      isOnline,
      setCurrentOrder,
      toggleOnlineStatus,
    }
  },
  {
    persist: true,
  },
)
