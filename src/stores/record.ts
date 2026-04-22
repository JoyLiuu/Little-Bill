import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Record, CategoryStat, DailyStat, MonthlyStat } from '@/types'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS, ALL_CATEGORIES } from '@/utils/constants'
import { formatDate, dayjs } from '@/utils/date'
import { generateId } from '@/utils/format'

export const useRecordStore = defineStore('record', () => {
  // State
  const records = ref<Record[]>([])

  // Getters
  const allRecords = computed(() => {
    return records.value.sort((a, b) => b.createTime - a.createTime)
  })

  // 获取今日记录
  const todayRecords = computed(() => {
    const today = formatDate(dayjs())
    return records.value
      .filter(r => r.date === today)
      .sort((a, b) => b.createTime - a.createTime)
  })

  // 获取当月记录
  const currentMonthRecords = computed(() => {
    const now = dayjs()
    return records.value.filter(r => {
      return dayjs(r.date).isSame(now, 'month')
    })
  })

  // 获取指定月份记录
  const getMonthRecords = (year: number, month: number) => {
    return records.value.filter(r => {
      const recordDate = dayjs(r.date)
      return recordDate.year() === year && recordDate.month() + 1 === month
    })
  }

  // 获取指定日期记录
  const getDateRecords = (date: string) => {
    return records.value
      .filter(r => r.date === date)
      .sort((a, b) => b.createTime - a.createTime)
  }

  // 计算当月总支出
  const currentMonthExpense = computed(() => {
    return currentMonthRecords.value
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
  })

  // 计算当日总支出
  const todayExpense = computed(() => {
    return todayRecords.value
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
  })

  // 计算昨日支出
  const yesterdayExpense = computed(() => {
    const yesterday = dayjs().subtract(1, 'day')
    const yesterdayStr = formatDate(yesterday)
    return records.value
      .filter(r => r.date === yesterdayStr && r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
  })

  // 按日期分组
  const groupedByDate = computed(() => {
    const groups: { [key: string]: Record[] } = {}
    const sorted = [...records.value].sort((a, b) => b.date.localeCompare(a.date))
    
    sorted.forEach(record => {
      if (!groups[record.date]) {
        groups[record.date] = []
      }
      groups[record.date].push(record)
    })
    
    return groups
  })

  // 获取分类统计
  const getCategoryStats = (year?: number, month?: number): CategoryStat[] => {
    let filtered = records.value.filter(r => r.type === 'expense')
    
    if (year !== undefined && month !== undefined) {
      filtered = filtered.filter(r => {
        const date = dayjs(r.date)
        return date.year() === year && date.month() + 1 === month
      })
    }

    const stats: { [key: string]: CategoryStat } = {}
    let total = 0

    filtered.forEach(record => {
      if (!stats[record.categoryId]) {
        stats[record.categoryId] = {
          categoryId: record.categoryId,
          categoryName: record.categoryName,
          categoryIcon: record.categoryIcon,
          categoryColor: record.categoryColor,
          amount: 0,
          percentage: 0,
          count: 0,
        }
      }
      stats[record.categoryId].amount += record.amount
      stats[record.categoryId].count += 1
      total += record.amount
    })

    // 计算百分比
    Object.values(stats).forEach(stat => {
      stat.percentage = total > 0 ? Math.round((stat.amount / total) * 100) : 0
    })

    return Object.values(stats).sort((a, b) => b.amount - a.amount)
  }

  // 获取每日统计
  const getDailyStats = (year: number, month: number): DailyStat[] => {
    const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth()
    const stats: DailyStat[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayRecords = records.value.filter(r => r.date === dateStr)
      
      stats.push({
        date: dateStr,
        expense: dayRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
        income: dayRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
      })
    }

    return stats
  }

  // 获取每月统计
  const getMonthlyStats = (year: number): MonthlyStat[] => {
    const stats: MonthlyStat[] = []

    for (let month = 1; month <= 12; month++) {
      const monthRecords = records.value.filter(r => {
        const date = dayjs(r.date)
        return date.year() === year && date.month() + 1 === month
      })

      stats.push({
        year,
        month,
        expense: monthRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
        income: monthRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
      })
    }

    return stats
  }

  // Actions
  const initRecords = () => {
    const stored = storage.get<Record[]>(STORAGE_KEYS.RECORDS, [])
    // 确保存储的数据是数组，如果不是则使用空数组
    records.value = Array.isArray(stored) ? stored : []
  }

  const addRecord = (data: Omit<Record, 'id' | 'createTime'>): Record => {
    const category = ALL_CATEGORIES.find(c => c.id === data.categoryId)
    
    const newRecord: Record = {
      ...data,
      id: generateId(),
      categoryName: category?.name || data.categoryName,
      categoryIcon: category?.icon || data.categoryIcon,
      categoryColor: category?.color || data.categoryColor,
      createTime: Date.now(),
    }

    records.value.unshift(newRecord)
    saveRecords()
    return newRecord
  }

  const updateRecord = (id: string, data: Partial<Record>): boolean => {
    const index = records.value.findIndex(r => r.id === id)
    if (index === -1) return false

    if (data.categoryId) {
      const category = ALL_CATEGORIES.find(c => c.id === data.categoryId)
      if (category) {
        data.categoryName = category.name
        data.categoryIcon = category.icon
        data.categoryColor = category.color
      }
    }

    records.value[index] = { ...records.value[index], ...data }
    saveRecords()
    return true
  }

  const deleteRecord = (id: string): boolean => {
    const index = records.value.findIndex(r => r.id === id)
    if (index === -1) return false

    records.value.splice(index, 1)
    saveRecords()
    return true
  }

  const saveRecords = () => {
    storage.set(STORAGE_KEYS.RECORDS, records.value)
  }

  // 获取年度统计
  const getYearTotal = (year: number, type: 'expense' | 'income'): number => {
    return records.value
      .filter(r => dayjs(r.date).year() === year && r.type === type)
      .reduce((sum, r) => sum + r.amount, 0)
  }

  // 获取年度总支出
  const getYearTotalExpense = (year: number): number => getYearTotal(year, 'expense')

  // 获取年度总收入
  const getYearTotalIncome = (year: number): number => getYearTotal(year, 'income')

  return {
    records,
    allRecords,
    todayRecords,
    currentMonthRecords,
    currentMonthExpense,
    todayExpense,
    yesterdayExpense,
    groupedByDate,
    initRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    getMonthRecords,
    getDateRecords,
    getCategoryStats,
    getDailyStats,
    getMonthlyStats,
    getYearTotalExpense,
    getYearTotalIncome,
  }
})
