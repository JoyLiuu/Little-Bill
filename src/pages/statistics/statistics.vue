<template>
  <view class="min-h-screen bg-gray-50 pb-4">
    <!-- 顶部导航栏 -->
    <view class="px-4 pt-12 pb-4 bg-white">
      <view class="flex items-center justify-between">
        <!-- 左侧：按月/按年切换 -->
        <view class="flex bg-gray-100 rounded-lg p-1">
          <view
            v-for="type in timeTypes"
            :key="type.value"
            class="px-4 py-1.5 text-sm rounded-md transition-all"
            :class="viewType === type.value ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'"
            @click="switchView(type.value)"
          >
            {{ type.label }}
          </view>
        </view>

        <!-- 右侧：日期选择器 -->
        <view class="flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
          <text class="text-gray-400 text-sm mr-2" @click="changeDate(-1)">‹</text>
          <text class="text-sm text-gray-800 font-medium" @click="showDatePicker = true">
            {{ displayDate }}
          </text>
          <text class="text-gray-400 text-sm ml-2" @click="changeDate(1)">›</text>
        </view>
      </view>
    </view>

    <!-- 统计卡片区域 -->
    <view class="px-4 py-4 bg-white mb-3">
      <view class="flex justify-between">
        <!-- 总支出 -->
        <view class="flex-1 mr-2 bg-gray-50 rounded-xl p-4">
          <text class="text-xs text-gray-500 block mb-1">总支出</text>
          <text class="text-xl font-bold text-gray-800">¥{{ formatAmount(totalExpense) }}</text>
        </view>
        <!-- 笔数 -->
        <view class="flex-1 mx-1 bg-gray-50 rounded-xl p-4">
          <text class="text-xs text-gray-500 block mb-1">笔数</text>
          <text class="text-xl font-bold text-gray-800">{{ totalCount }}</text>
        </view>
        <!-- 日均支出 -->
        <view class="flex-1 ml-2 bg-gray-50 rounded-xl p-4">
          <text class="text-xs text-gray-500 block mb-1">日均支出</text>
          <text class="text-xl font-bold text-gray-800">¥{{ formatAmount(dailyAverage) }}</text>
        </view>
      </view>
    </view>

    <!-- 支出分类 -->
    <view class="bg-white rounded-2xl p-5 m-3">
      <text class="text-base font-semibold text-gray-800 mb-5 block">支出分类</text>

      <view v-if="categoryStats.length > 0" class="flex">
        <!-- 左侧：环形图 -->
        <view class="relative flex-shrink-0 mr-6" style="width: 200rpx; height: 200rpx;">
          <view
            class="w-full h-full rounded-full"
            :style="pieChartStyle"
          ></view>
          <view
            class="absolute bg-white rounded-full flex flex-col items-center justify-center"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%); width: 130rpx; height: 130rpx;"
          >
            <text class="text-xs text-gray-400">合计</text>
            <text class="text-base font-bold text-gray-800">¥{{ formatAmount(totalExpense) }}</text>
          </view>
        </view>

        <!-- 右侧：分类列表 -->
        <view class="flex-1">
          <view
            v-for="(item, index) in categoryStats.slice(0, 6)"
            :key="item.categoryId"
            class="flex items-center justify-between py-2"
            :class="index < categoryStats.slice(0, 6).length - 1 ? 'border-b border-gray-50' : ''"
          >
            <view class="flex items-center">
              <view
                class="w-3 h-3 rounded-sm mr-2"
                :style="{ backgroundColor: item.categoryColor }"
              ></view>
              <text class="text-sm text-gray-700">{{ item.categoryName }}</text>
            </view>
            <view class="flex items-center">
              <text class="text-xs text-gray-400 mr-3">{{ item.percentage }}%</text>
              <text class="text-sm text-gray-800 font-medium w-16 text-right">¥{{ formatAmount(item.amount) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="text-center py-12">
        <text class="text-6xl block mb-3">📊</text>
        <text class="text-gray-400">暂无支出记录</text>
      </view>
    </view>

    <!-- 支出明细列表 -->
    <view class="bg-white rounded-2xl p-5 m-3">
      <text class="text-base font-semibold text-gray-800 mb-4 block">支出明细</text>

      <view v-if="expenseRecords.length > 0">
        <view
          v-for="(record, index) in expenseRecords"
          :key="record.id"
          class="flex items-center py-3"
          :class="index < expenseRecords.length - 1 ? 'border-b border-gray-100' : ''"
        >
          <view
            class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            :style="{ backgroundColor: record.categoryColor + '20' }"
          >
            <text class="text-lg" :style="{ color: record.categoryColor }">
              {{ record.categoryIcon }}
            </text>
          </view>
          <view class="flex-1">
            <text class="text-sm text-gray-800 block">{{ record.categoryName }}</text>
            <text class="text-xs text-gray-400">{{ formatDateTime(record.date) }}</text>
          </view>
          <view class="text-right">
            <text class="text-sm font-medium text-gray-800 block">¥{{ formatAmount(record.amount) }}</text>
            <text class="text-xs text-gray-400" v-if="record.remark">{{ record.remark }}</text>
          </view>
        </view>
      </view>

      <view v-else class="text-center py-8">
        <text class="text-gray-400 text-sm">暂无支出记录</text>
      </view>
    </view>

    <!-- 日期选择器弹窗 -->
    <u-popup
      :show="showDatePicker"
      mode="bottom"
      @close="showDatePicker = false"
      :round="20"
    >
      <view class="p-6">
        <view class="flex justify-between items-center mb-6">
          <text class="text-base text-gray-400" @click="showDatePicker = false">取消</text>
          <text class="text-lg font-semibold text-gray-800">选择日期</text>
          <text class="text-base text-primary" @click="confirmDate">确定</text>
        </view>

        <view class="flex justify-center">
          <picker-view
            v-if="viewType === 'month'"
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

type ViewType = 'month' | 'year'

const viewType = ref<ViewType>('month')
const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const showDatePicker = ref(false)

const tempYear = ref(currentYear.value)
const tempMonth = ref(currentMonth.value)

const timeTypes = [
  { label: '按月', value: 'month' as ViewType },
  { label: '按年', value: 'year' as ViewType },
]

const yearOptions = computed(() => {
  const current = dayjs().year()
  return Array.from({ length: 21 }, (_, i) => current - 10 + i)
})

const displayDate = computed(() => {
  if (viewType.value === 'month') {
    return `${currentYear.value}年${currentMonth.value}月`
  } else {
    return `${currentYear.value}年`
  }
})

const currentRecords = computed(() => {
  if (viewType.value === 'month') {
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

const totalCount = computed(() => {
  return currentRecords.value.filter(r => r.type === 'expense').length
})

const dailyAverage = computed(() => {
  if (viewType.value === 'month') {
    const daysInMonth = dayjs(`${currentYear.value}-${currentMonth.value}-01`).daysInMonth()
    const today = dayjs()
    const isCurrentMonth = today.year() === currentYear.value && today.month() + 1 === currentMonth.value
    const days = isCurrentMonth ? today.date() : daysInMonth
    return days > 0 ? totalExpense.value / days : 0
  } else {
    const today = dayjs()
    const isCurrentYear = today.year() === currentYear.value
    if (isCurrentYear) {
      return today.dayOfYear() > 0 ? totalExpense.value / today.dayOfYear() : 0
    } else {
      return totalExpense.value / 365
    }
  }
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

const expenseRecords = computed(() => {
  return currentRecords.value
    .filter(r => r.type === 'expense')
    .sort((a, b) => b.createTime - a.createTime)
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
}

const changeDate = (delta: number) => {
  if (viewType.value === 'month') {
    const newDate = dayjs(`${currentYear.value}-${currentMonth.value}-01`).add(delta, 'month')
    currentYear.value = newDate.year()
    currentMonth.value = newDate.month() + 1
  } else {
    currentYear.value += delta
  }
}

const formatDateTime = (dateStr: string) => {
  const date = dayjs(dateStr)
  const today = dayjs()

  if (date.isSame(today, 'day')) return '今天'
  if (date.isSame(today.subtract(1, 'day'), 'day')) return '昨天'
  return date.format('M月D日')
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
  showDatePicker.value = false
}

watch(showDatePicker, (val) => {
  if (val) {
    tempYear.value = currentYear.value
    tempMonth.value = currentMonth.value
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
