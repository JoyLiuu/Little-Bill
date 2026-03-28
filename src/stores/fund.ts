import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FundPool, FundOperation } from '@/types'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { generateId } from '@/utils/format'

export const useFundStore = defineStore('fund', () => {
  // State
  const fundPools = ref<FundPool[]>([])
  const fundOperations = ref<FundOperation[]>([])

  // Getters
  const allFunds = computed(() => {
    return fundPools.value.sort((a, b) => b.createTime - a.createTime)
  })

  const activeFunds = computed(() => {
    return fundPools.value.filter(f => f.status === 'active')
  })

  const completedFunds = computed(() => {
    return fundPools.value.filter(f => f.status === 'completed')
  })

  // 资金池总投入
  const totalInvested = computed(() => {
    return fundPools.value.reduce((sum, f) => sum + f.currentAmount, 0)
  })

  // 年度资金池存入总额
  const getYearDepositTotal = (year: number): number => {
    return fundOperations.value
      .filter(op => {
        const opYear = new Date(op.date).getFullYear()
        return opYear === year && op.type === 'deposit'
      })
      .reduce((sum, op) => sum + op.amount, 0)
  }

  // 获取资金池操作记录
  const getFundOperations = (fundId: string): FundOperation[] => {
    return fundOperations.value
      .filter(op => op.fundId === fundId)
      .sort((a, b) => b.createTime - a.createTime)
  }

  // Actions
  const initFunds = () => {
    const storedFunds = storage.get<FundPool[]>(STORAGE_KEYS.FUND_POOLS, [])
    const storedOps = storage.get<FundOperation[]>(STORAGE_KEYS.FUND_OPERATIONS, [])
    fundPools.value = storedFunds
    fundOperations.value = storedOps
  }

  const addFund = (data: Omit<FundPool, 'id' | 'currentAmount' | 'status' | 'createTime'>): FundPool => {
    const newFund: FundPool = {
      ...data,
      id: generateId(),
      currentAmount: 0,
      status: 'active',
      createTime: Date.now(),
    }

    fundPools.value.unshift(newFund)
    saveFunds()
    return newFund
  }

  const updateFund = (id: string, data: Partial<FundPool>): boolean => {
    const index = fundPools.value.findIndex(f => f.id === id)
    if (index === -1) return false

    fundPools.value[index] = { ...fundPools.value[index], ...data }
    saveFunds()
    return true
  }

  const deleteFund = (id: string): boolean => {
    const index = fundPools.value.findIndex(f => f.id === id)
    if (index === -1) return false

    fundPools.value.splice(index, 1)
    // 同时删除相关操作记录
    fundOperations.value = fundOperations.value.filter(op => op.fundId !== id)
    saveFunds()
    saveOperations()
    return true
  }

  // 存入资金
  const deposit = (fundId: string, amount: number, remark?: string): boolean => {
    const fund = fundPools.value.find(f => f.id === fundId)
    if (!fund) return false

    const newAmount = fund.currentAmount + amount
    
    // 创建操作记录
    const operation: FundOperation = {
      id: generateId(),
      fundId,
      type: 'deposit',
      amount,
      date: new Date().toISOString().split('T')[0],
      remark,
      createTime: Date.now(),
    }

    fundOperations.value.unshift(operation)
    
    // 更新资金池
    fund.currentAmount = newAmount
    if (newAmount >= fund.targetAmount) {
      fund.status = 'completed'
    }

    saveFunds()
    saveOperations()
    return true
  }

  // 取出资金
  const withdraw = (fundId: string, amount: number, remark?: string): boolean => {
    const fund = fundPools.value.find(f => f.id === fundId)
    if (!fund || fund.currentAmount < amount) return false

    const newAmount = fund.currentAmount - amount

    // 创建操作记录
    const operation: FundOperation = {
      id: generateId(),
      fundId,
      type: 'withdraw',
      amount,
      date: new Date().toISOString().split('T')[0],
      remark,
      createTime: Date.now(),
    }

    fundOperations.value.unshift(operation)
    
    // 更新资金池
    fund.currentAmount = newAmount
    if (newAmount < fund.targetAmount && fund.status === 'completed') {
      fund.status = 'active'
    }

    saveFunds()
    saveOperations()
    return true
  }

  const saveFunds = () => {
    storage.set(STORAGE_KEYS.FUND_POOLS, fundPools.value)
  }

  const saveOperations = () => {
    storage.set(STORAGE_KEYS.FUND_OPERATIONS, fundOperations.value)
  }

  return {
    fundPools,
    fundOperations,
    allFunds,
    activeFunds,
    completedFunds,
    totalInvested,
    initFunds,
    addFund,
    updateFund,
    deleteFund,
    deposit,
    withdraw,
    getFundOperations,
    getYearDepositTotal,
  }
})
