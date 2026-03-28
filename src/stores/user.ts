import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref<UserInfo | null>(null)
  const monthlyBudget = ref<number>(5000)

  // Getters
  const isLoggedIn = computed(() => !!userInfo.value)
  
  const currentMonthBudget = computed(() => {
    const now = new Date()
    const budgetKey = `${STORAGE_KEYS.BUDGET}_${now.getFullYear()}_${now.getMonth() + 1}`
    return storage.get<number>(budgetKey, monthlyBudget.value)
  })

  // Actions
  const initUserInfo = () => {
    const stored = storage.get<UserInfo>(STORAGE_KEYS.USER_INFO)
    if (stored) {
      userInfo.value = stored
    }
    
    const storedBudget = storage.get<number>(STORAGE_KEYS.BUDGET)
    if (storedBudget) {
      monthlyBudget.value = storedBudget
    }
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    storage.set(STORAGE_KEYS.USER_INFO, info)
  }

  const setMonthlyBudget = (budget: number) => {
    monthlyBudget.value = budget
    const now = new Date()
    const budgetKey = `${STORAGE_KEYS.BUDGET}_${now.getFullYear()}_${now.getMonth() + 1}`
    storage.set(budgetKey, budget)
    storage.set(STORAGE_KEYS.BUDGET, budget)
  }

  const getMonthBudget = (year: number, month: number) => {
    const budgetKey = `${STORAGE_KEYS.BUDGET}_${year}_${month}`
    return storage.get<number>(budgetKey, monthlyBudget.value)
  }

  const logout = () => {
    userInfo.value = null
    storage.remove(STORAGE_KEYS.USER_INFO)
  }

  return {
    userInfo,
    monthlyBudget,
    isLoggedIn,
    currentMonthBudget,
    initUserInfo,
    setUserInfo,
    setMonthlyBudget,
    getMonthBudget,
    logout,
  }
})
