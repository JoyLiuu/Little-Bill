<template>
  <view class="min-h-screen bg-gray-100 pb-4">
    <!-- 顶部切换标签 -->
    <view class="px-4 pt-12 pb-6" style="background: linear-gradient(135deg, #3E8FD4 0%, #2E6FA8 100%);">
      <view class="flex justify-center mb-6">
        <view
          class="px-10 py-2 text-base relative"
          :class="viewType === 'month' ? 'text-white font-medium' : 'text-white/70'"
          @click="switchView('month')"
        >
          月度
          <view v-if="viewType === 'month'" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full"></view>
        </view>
        <view
          class="px-10 py-2 text-base relative"
          :class="viewType === 'year' ? 'text-white font-medium' : 'text-white/70'"
          @click="switchView('year')"
        >
          年度
          <view v-if="viewType === 'year'" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full"></view>
        </view>
      </view>
      
      <!-- 年月选择器 -->
      <view class="flex items-center justify-center mb-6">
        <text class="px-6 font-light" style="font-size: 48rpx; color: rgba(255,255,255,0.8);" @click="changeDate(-1)">‹</text>
        <view class="text-center" @click="showDatePicker = true">
          <text class="font-medium" style="font-size: 48rpx; color: #fff;">
            {{ viewType === 'month' ? currentYear + '年' + currentMonth + '月' : currentYear + '年' }}
          </text>
        </view>
        <text class="px-6 font-light" style="font-size: 48rpx; color: rgba(255,255,255,0.8);" @click="changeDate(1)">›</text>
      </view>
      
      <!-- 总支出 -->
      <view class="text-center mb-4">
        <text class="text-sm text-white/80 block mb-2">{{ viewType === 'month' ? '月支出' : '年支出' }}</text>
        <text class="text-6xl text-white font-bold">¥{{ formatAmount(totalExpense) }}</text>
      </view>
      
      <!-- 年度报告入口 -->
      <view 
        class="flex items-center justify-center py-2 px-6 bg-white/20 rounded-full w-fit mx-auto"
        @click="goToAnnualReport"
      >
        <text class="text-sm text-white">查看年度报告</text>
        <text class="text-sm text-white ml-1">→</text>
      </view>
    </view>

    <!-- 分类统计 -->
    <view class="bg-white rounded-2xl p-5 m-2">
      <text class="text-lg font-semibold text-gray-800 mb-5 block">分类统计</text>
      
      <!-- 饼图 -->
      <view class="flex justify-center mb-6">
        <view v-if="categoryStats.length > 0" class="relative" style="width: 224rpx; height: 224rpx;">
          <!-- 使用 conic-gradient 实现饼图 -->
          <view 
            class="w-full h-full rounded-full"
            :style="pieChartStyle"
          ></view>
          <!-- 中心白色圆 -->
          <view 
            class="absolute bg-white rounded-full flex flex-col items-center justify-center"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%); width: 140rpx; height: 140rpx;"
          >
            <text class="font-bold text-gray-800" style="font-size: 48rpx;">{{ categoryStats.length }}</text>
            <text class="text-xs text-gray-400">分类</text>
          </view>
        </view>
        <view v-else class="flex items-center justify-center text-gray-400" style="width: 224rpx; height: 224rpx;">
          <text>暂无数据</text>
        </view>
      </view>
      
      <!-- 分类排行榜 -->
      <view>
        <view
          v-for="(item, index) in categoryStats.slice(0, 5)"
          :key="item.categoryId"
          class="flex items-center py-3 border-b border-gray-100 last:border-b-0"
          @click="filterByCategory(item)"
        >
          <text class="w-10 text-base text-gray-400 font-medium">{{ index + 1 }}</text>
          <view
            class="w-14 h-14 rounded-full flex items-center justify-center mr-4"
            :style="{ backgroundColor: item.categoryColor + '20' }"
          >
            <text class="text-xl" :style="{ color: item.categoryColor }">
              {{ item.categoryIcon }}
            </text>
          </view>
          <view class="flex-1">
            <text class="text-base text-gray-800 block mb-1">{{ item.categoryName }}</text>
            <view class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <view
                class="h-full rounded-full transition-all duration-300"
                :style="{ 
                  width: item.percentage + '%',
                  backgroundColor: item.categoryColor 
                }"
              ></view>
            </view>
          </view>
          <view class="text-right ml-4">
            <text class="text-base text-gray-800 font-medium block">¥{{ formatAmount(item.amount) }}</text>
            <text class="text-xs text-gray-400">{{ item.percentage }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 趋势图 -->
    <view class="bg-white rounded-2xl p-5 m-2">
      <text class="text-lg font-semibold text-gray-800 mb-5 block">{{ viewType === 'month' ? '每日趋势' : '月度趋势' }}</text>
      
      <view class="relative">
        <!-- 柱状图 -->
        <scroll-view v-if="trendData.length > 0" scroll-x class="py-4" style="height: 400rpx; white-space: nowrap;">
          <view class="flex items-end" style="height: 340rpx; padding: 0 20rpx;">
            <view
              v-for="(item, index) in trendData"
              :key="index"
              class="flex flex-col items-center"
              style="width: 60rpx; height: 100%; margin: 0 8rpx; display: inline-flex;"
            >
              <view 
                class="w-full rounded-t-lg relative transition-all"
                :class="item.value > averageValue ? 'bg-primary' : 'bg-gray-200'"
                :style="{ height: getChartHeight(item.value) }"
              >
                <text v-if="item.value > 0" class="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                  {{ formatShortAmount(item.value) }}
                </text>
              </view>
              <text class="text-xs text-gray-400 mt-2">{{ item.label }}</text>
            </view>
          </view>
        </scroll-view>
        <view v-else class="flex items-center justify-center text-gray-400" style="height: 400rpx;">
          <text>暂无数据</text>
        </view>
        
        <!-- 平均线 -->
        <view v-if="trendData.length > 0" class="absolute left-4 right-4 flex items-center" :style="{ top: (100 - (averageValue / Math.max(...trendData.map(d => d.value), averageValue) * 100)) * 3.4 + 'rpx' }">
          <view class="flex-1 border-t-2 border-dashed" style="border-color: #D4C4A8;"></view>
          <text class="text-xs mx-2" style="color: #D4C4A8;">平均 ¥{{ formatAmount(averageValue) }}</text>
          <view class="flex-1 border-t-2 border-dashed" style="border-color: #D4C4A8;"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRecordStore } from '@/stores/record'
import { formatAmount } from '@/utils/format'
import type { CategoryStat } from '@/types'

const recordStore = useRecordStore()

const viewType = ref<'month' | 'year'>('month')
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const showDatePicker = ref(false)

// 计算属性
const categoryStats = computed(() => {
  if (viewType.value === 'month') {
    return recordStore.getCategoryStats(currentYear.value, currentMonth.value)
  } else {
    return recordStore.getCategoryStats(currentYear.value)
  }
})

const totalExpense = computed(() => {
  if (viewType.value === 'month') {
    return recordStore.getMonthRecords(currentYear.value, currentMonth.value)
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
  } else {
    return recordStore.getYearTotalExpense(currentYear.value)
  }
})

const trendData = computed(() => {
  if (viewType.value === 'month') {
    const stats = recordStore.getDailyStats(currentYear.value, currentMonth.value)
    return stats.map(s => ({
      label: s.date.split('-')[2],
      value: s.expense,
    }))
  } else {
    const stats = recordStore.getMonthlyStats(currentYear.value)
    return stats.map(s => ({
      label: s.month + '月',
      value: s.expense,
    }))
  }
})

const averageValue = computed(() => {
  if (trendData.value.length === 0) return 0
  const total = trendData.value.reduce((sum, item) => sum + item.value, 0)
  return total / trendData.value.filter(item => item.value > 0).length || 1
})

// 饼图样式 - 使用 conic-gradient
const pieChartStyle = computed(() => {
  if (categoryStats.value.length === 0) return {}
  
  const total = categoryStats.value.reduce((sum, item) => sum + item.amount, 0)
  let currentAngle = 0
  const gradientParts: string[] = []
  
  categoryStats.value.forEach(item => {
    const percentage = item.amount / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    
    gradientParts.push(`${item.categoryColor} ${startAngle}deg ${endAngle}deg`)
    currentAngle = endAngle
  })
  
  return {
    background: `conic-gradient(${gradientParts.join(', ')})`
  }
})

// 方法
const switchView = (type: 'month' | 'year') => {
  viewType.value = type
}

const changeDate = (delta: number) => {
  if (viewType.value === 'month') {
    const newDate = new Date(currentYear.value, currentMonth.value - 1 + delta, 1)
    currentYear.value = newDate.getFullYear()
    currentMonth.value = newDate.getMonth() + 1
  } else {
    currentYear.value += delta
  }
}

const getChartHeight = (value: number) => {
  const max = Math.max(...trendData.value.map(d => d.value), averageValue.value)
  if (max === 0) return '0%'
  return `${(value / max) * 100}%`
}

const formatShortAmount = (amount: number) => {
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'k'
  }
  return amount.toFixed(0)
}

const filterByCategory = (category: CategoryStat) => {
  uni.switchTab({ url: '/pages/ledger/ledger' })
}

const goToAnnualReport = () => {
  uni.navigateTo({ url: '/pages/annual-report/annual-report' })
}

onMounted(() => {
  recordStore.initRecords()
})
</script>

<style>
/* UnoCSS 样式在 app.wxss 中全局提供 */
</style>
