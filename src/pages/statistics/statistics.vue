<template>
  <view class="min-h-screen bg-gray-50 pb-4">
    <!-- 页面标题 -->
    <view class="pt-12 pb-4 px-4 bg-white">
      <text class="text-lg font-semibold text-gray-800 text-center block">消费统计</text>
    </view>

    <!-- 日/月/年切换 -->
    <view class="px-6 py-4 bg-white">
      <view class="flex bg-gray-100 rounded-full p-1">
        <view
          v-for="type in timeTypes"
          :key="type.value"
          class="flex-1 py-2 text-sm text-center rounded-full transition-all"
          :class="viewType === type.value ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500'"
          @click="switchView(type.value)"
        >
          {{ type.label }}
        </view>
      </view>
    </view>

    <!-- 总支出卡片 -->
    <view class="mx-4 mt-4 bg-white rounded-2xl p-6">
      <text class="text-sm text-gray-500 block mb-2">{{ viewType === 'month' ? '本月总支出' : viewType === 'year' ? '本年总支出' : '今日支出' }}</text>
      <view class="flex items-center mb-2">
        <text class="text-4xl font-bold text-gray-900">¥{{ formatAmount(totalExpense) }}</text>
        <!-- 环比标签 -->
        <view 
          v-if="comparePercent !== 0"
          class="ml-3 px-2 py-1 rounded-full flex items-center"
          :class="comparePercent > 0 ? 'bg-orange-100' : 'bg-green-100'"
        >
          <text class="text-xs" :class="comparePercent > 0 ? 'text-orange-500' : 'text-green-500'">
            {{ comparePercent > 0 ? '↑' : '↓' }} {{ Math.abs(comparePercent).toFixed(1) }}%
          </text>
        </view>
        <view v-else class="ml-3 px-2 py-1 rounded-full bg-gray-100">
          <text class="text-xs text-gray-500">0.0%</text>
        </view>
      </view>
      <text class="text-sm text-gray-400">{{ compareLabel }}</text>
    </view>

    <!-- 趋势柱状图 -->
    <view class="mx-4 mt-4 bg-white rounded-2xl p-6">
      <text class="text-base font-semibold text-gray-800 mb-6 block">支出趋势</text>
      
      <view v-if="trendData.length > 0" class="relative">
        <!-- 柱状图 -->
        <scroll-view scroll-x class="whitespace-nowrap" style="height: 280rpx;">
          <view class="flex items-end px-2" style="height: 240rpx; min-width: 100%;">
            <view
              v-for="(item, index) in trendData"
              :key="index"
              class="flex flex-col items-center mx-3"
              style="display: inline-flex;"
            >
              <!-- 柱子 -->
              <view
                class="w-10 rounded-t-lg transition-all"
                :class="item.isCurrent ? 'bg-indigo-500' : 'bg-indigo-200'"
                :style="{ height: getBarHeight(item.value) }"
                @click="selectBar(item)"
              ></view>
              <!-- 月份标签 -->
              <text class="text-xs text-gray-500 mt-3">{{ item.label }}</text>
            </view>
          </view>
        </scroll-view>
        
        <!-- 选中提示 -->
        <view v-if="selectedBar" class="absolute top-0 left-0 right-0 flex justify-center">
          <view class="bg-gray-800 rounded-lg px-3 py-2">
            <text class="text-xs text-white">{{ selectedBar.label }} ¥{{ formatAmount(selectedBar.value) }}</text>
          </view>
        </view>
      </view>

      <view v-else class="text-center py-12">
        <text class="text-gray-400">暂无数据</text>
      </view>
    </view>

    <!-- 支出分类 -->
    <view class="mx-4 mt-4 bg-white rounded-2xl p-6">
      <text class="text-base font-semibold text-gray-800 mb-5 block">支出分类</text>

      <view v-if="categoryStats.length > 0" class="flex">
        <!-- 左侧：环形图 -->
        <view class="relative flex-shrink-0 mr-4" style="width: 180rpx; height: 180rpx;">
          <view class="w-full h-full rounded-full" :style="pieChartStyle"></view>
          <view
            class="absolute bg-white rounded-full flex flex-col items-center justify-center"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120rpx; height: 120rpx;"
          >
            <text class="text-xs text-gray-400">合计</text>
            <text class="text-sm font-bold text-gray-800">¥{{ formatAmount(totalExpense) }}</text>
          </view>
        </view>

        <!-- 右侧：分类列表 -->
        <view class="flex-1">
          <view
            v-for="(item, index) in categoryStats.slice(0, 5)"
            :key="item.categoryId"
            class="flex items-center justify-between py-2"
            :class="index < Math.min(categoryStats.length, 5) - 1 ? 'border-b border-gray-50' : ''"
          >
            <view class="flex items-center">
              <view class="w-3 h-3 rounded mr-2" :style="{ backgroundColor: item.categoryColor }"></view>
              <text class="text-sm text-gray-700">{{ item.categoryName }}</text>
            </view>
            <view class="flex items-center">
              <text class="text-xs text-gray-400 mr-2">{{ item.percentage }}%</text>
              <text class="text-sm text-gray-800 font-medium">¥{{ formatAmount(item.amount) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="text-center py-8">
        <text class="text-gray-400">暂无支出记录</text>
      </view>
    </view>

    <!-- 日期选择器弹窗 -->
    <u-popup :show="showDatePicker" mode="bottom" @close="showDatePicker = false" :round="20">
      <view class="p-6">
        <view class="flex justify-between items-center mb-6">
          <text class="text-base text-gray-400" @click="showDatePicker = false">取消</text>
          <text class="text-lg font-semibold text-gray-800">选择日期</text>
          <text class="text-base text-indigo-500" @click="confirmDate">确定</text>
        </view>

        <view class="flex justify-center">
          <picker-view
            v-if="viewType === 'day'"
            :value="datePickerValue"
            class="w-full h-80"
            indicator-style="height: 44px;"
            @change="onDatePickerChange"
          >
            <picker-view-column>
              <view v-for="year in yearOptions" :key="year" class="flex items-center justify-center h-11">
                {{ year }}年
              </view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="month in 12" :key="month" class="flex items-center justify-center h-11">
                {{ month }}月
              </view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="day in daysInMonth" :key="day" class="flex items-center justify-center h-11">
                {{ day }}日
              </view>
            </picker-view-column>
          </picker-view>

          <picker-view
            v-else-if="viewType === 'month'"
            :value="[yearOptions.indexOf(currentYear), currentMonth - 1]"
            class="w-full h-80"
            indicator-style="height: 44px;"
            @change="onMonthPickerChange"
          >
            <picker-view-column>
              <view v-for="year in yearOptions" :key="year" class="flex items-center justify-center h-11">
                {{ year }}年
              </view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="month in 12" :key="month" class="flex items-center justify-center h-11">
                {{ month }}月
              </view>
            </picker-view-column>
          </picker-view>

          <picker-view
            v-else
            :value="[yearOptions.indexOf(currentYear)]"
            class="w-full h-80"
            indicator-style="height: 44px;"
            @change="onYearPickerChange"
          >
            <picker-view-column>
              <view v-for="year in yearOptions" :key="year" class="flex items-center justify-center h-11">
                {{ year }}年
              </view>
            </picker-view-column>
          </picker-view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRecordStore } from '@/stores/record'
import { formatAmount } from '@/utils/format'
import { dayjs } from '@/utils/date'
import type { CategoryStat, Record } from '@/types'

const recordStore = useRecordStore()

type ViewType = 'day' | 'month' | 'year'

const viewType = ref<ViewType>('month')
const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const currentDay = ref(dayjs().date())
const showDatePicker = ref(false)
const selectedBar = ref<{ label: string; value: number } | null>(null)

const tempYear = ref(currentYear.value)
const tempMonth = ref(currentMonth.value)
const tempDay = ref(currentDay.value)

const timeTypes = [
  { label: '日', value: 'day' as ViewType },
  { label: '月', value: 'month' as ViewType },
  { label: '年', value: 'year' as ViewType },
]

const yearOptions = computed(() => {
  const current = dayjs().year()
  return Array.from({ length: 21 }, (_, i) => current - 10 + i)
})

const daysInMonth = computed(() => {
  return dayjs(`${tempYear.value}-${tempMonth.value}-01`).daysInMonth()
})

const datePickerValue = computed(() => {
  return [
    yearOptions.value.indexOf(tempYear.value),
    tempMonth.value - 1,
    tempDay.value - 1
  ]
})

const currentRecords = computed(() => {
  if (viewType.value === 'day') {
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(currentDay.value).padStart(2, '0')}`
    return recordStore.getDateRecords(dateStr)
  } else if (viewType.value === 'month') {
    return recordStore.getMonthRecords(currentYear.value, currentMonth.value)
  } else {
    return recordStore.records.filter((r: Record) => dayjs(r.date).year() === currentYear.value)
  }
})

const totalExpense = computed(() => {
  return currentRecords.value
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
})

// 环比数据
const comparePercent = computed(() => {
  let prevExpense = 0
  if (viewType.value === 'day') {
    const prevDate = dayjs(`${currentYear.value}-${currentMonth.value}-${currentDay.value}`).subtract(1, 'day')
    const prevRecords = recordStore.getDateRecords(prevDate.format('YYYY-MM-DD'))
    prevExpense = prevRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  } else if (viewType.value === 'month') {
    const prevMonth = dayjs(`${currentYear.value}-${currentMonth.value}-01`).subtract(1, 'month')
    const prevRecords = recordStore.getMonthRecords(prevMonth.year(), prevMonth.month() + 1)
    prevExpense = prevRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  } else {
    const prevRecords = recordStore.records.filter((r: Record) => dayjs(r.date).year() === currentYear.value - 1)
    prevExpense = prevRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  }
  
  if (prevExpense === 0) return 0
  return ((totalExpense.value - prevExpense) / prevExpense) * 100
})

const compareLabel = computed(() => {
  if (viewType.value === 'day') return '较昨日'
  if (viewType.value === 'month') return '较上一月'
  return '较上一年'
})

// 趋势数据
const trendData = computed(() => {
  const data: { label: string; value: number; isCurrent: boolean }[] = []
  
  if (viewType.value === 'month') {
    // 显示最近6个月
    for (let i = 5; i >= 0; i--) {
      const d = dayjs(`${currentYear.value}-${currentMonth.value}-01`).subtract(i, 'month')
      const records = recordStore.getMonthRecords(d.year(), d.month() + 1)
      const expense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      data.push({
        label: `${d.month() + 1}月`,
        value: expense,
        isCurrent: i === 0
      })
    }
  } else if (viewType.value === 'year') {
    // 显示最近5年
    for (let i = 4; i >= 0; i--) {
      const year = currentYear.value - i
      const records = recordStore.records.filter((r: Record) => dayjs(r.date).year() === year)
      const expense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      data.push({
        label: `${year}年`,
        value: expense,
        isCurrent: i === 0
      })
    }
  } else {
    // 日视图显示最近7天
    for (let i = 6; i >= 0; i--) {
      const d = dayjs(`${currentYear.value}-${currentMonth.value}-${currentDay.value}`).subtract(i, 'day')
      const records = recordStore.getDateRecords(d.format('YYYY-MM-DD'))
      const expense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      data.push({
        label: `${d.date()}日`,
        value: expense,
        isCurrent: i === 0
      })
    }
  }
  
  return data
})

const categoryStats = computed((): CategoryStat[] => {
  const stats: { [key: string]: CategoryStat } = {}
  let total = 0

  const expenseRecords = currentRecords.value.filter(r => r.type === 'expense')

  expenseRecords.forEach(record => {
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

  Object.values(stats).forEach(stat => {
    stat.percentage = total > 0 ? Math.round((stat.amount / total) * 100) : 0
  })

  return Object.values(stats).sort((a, b) => b.amount - a.amount)
})

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

const switchView = (type: ViewType) => {
  viewType.value = type
  selectedBar.value = null
}

const getBarHeight = (value: number) => {
  const max = Math.max(...trendData.value.map(d => d.value), 1)
  const height = (value / max) * 180
  return `${Math.max(height, 20)}rpx`
}

const selectBar = (item: { label: string; value: number }) => {
  selectedBar.value = item
}

const onDatePickerChange = (e: any) => {
  const [yearIndex, monthIndex, dayIndex] = e.detail.value
  tempYear.value = yearOptions.value[yearIndex]
  tempMonth.value = monthIndex + 1
  tempDay.value = dayIndex + 1
}

const onMonthPickerChange = (e: any) => {
  const [yearIndex, monthIndex] = e.detail.value
  tempYear.value = yearOptions.value[yearIndex]
  tempMonth.value = monthIndex + 1
}

const onYearPickerChange = (e: any) => {
  const [yearIndex] = e.detail.value
  tempYear.value = yearOptions.value[yearIndex]
}

const confirmDate = () => {
  currentYear.value = tempYear.value
  currentMonth.value = tempMonth.value
  currentDay.value = tempDay.value
  showDatePicker.value = false
}

watch(showDatePicker, (val) => {
  if (val) {
    tempYear.value = currentYear.value
    tempMonth.value = currentMonth.value
    tempDay.value = currentDay.value
  }
})

onMounted(() => {
  recordStore.initRecords()
})
</script>

<style>
picker-view {
  width: 100%;
  height: 320rpx;
}

picker-view-column {
  text-align: center;
}

picker-view-column view {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #333;
}
</style>
