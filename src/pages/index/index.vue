<template>
  <view class="min-h-screen bg-gray-50 pb-6">
    <!-- 顶部导航 -->
    <view class="flex items-center justify-between px-4 pt-12 pb-4 bg-white">
      <view class="w-20"></view>
      <text class="text-lg font-semibold text-gray-800">账本</text>
      <view class="w-20 flex justify-end" @click="showMonthPicker = true">
        <view class="bg-indigo-50 rounded-full px-3 py-1">
          <text class="text-sm text-indigo-500 font-medium"
            >{{ currentYear }}.{{ String(currentMonth).padStart(2, '0') }}</text
          >
        </view>
      </view>
    </view>

    <!-- 预算卡片 -->
    <view
      class="mx-4 rounded-2xl p-5 text-white"
      style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)"
    >
      <!-- 顶部标签 -->
      <view class="flex items-center justify-between mb-4">
        <view class="flex items-center">
          <u-icon name="wallet" size="16" color="#fff"></u-icon>
          <text class="text-sm text-white/80 ml-2">月度预算</text>
        </view>
        <text class="text-sm text-white/80">{{ currentMonth }}月</text>
      </view>

      <!-- 剩余金额 -->
      <view class="flex items-baseline mb-4">
        <text class="text-4xl font-bold">¥{{ formatAmount(remainingBudget) }}</text>
        <text class="text-sm text-white/80 ml-2">剩余</text>
      </view>

      <!-- 进度条 -->
      <view class="h-2 bg-white/20 rounded-full mb-3 overflow-hidden">
        <view
          class="h-full bg-white rounded-full transition-all"
          :style="{ width: Math.min(progressPercent, 100) + '%' }"
        ></view>
      </view>

      <!-- 进度信息 -->
      <view class="flex justify-between text-sm mb-6">
        <text class="text-white/80">已用 {{ progressPercent }}%</text>
        <text class="text-white/80">预算 ¥{{ formatAmount(monthlyBudget) }}</text>
      </view>

      <!-- 统计数据 -->
      <view class="flex justify-between pt-4 border-t border-white/20">
        <view class="text-center">
          <text class="text-xs text-white/60 block mb-1">已支出</text>
          <text class="text-lg font-semibold">¥{{ formatAmount(currentExpense) }}</text>
        </view>
        <view class="text-center">
          <text class="text-xs text-white/60 block mb-1">今日支出</text>
          <text class="text-lg font-semibold">¥{{ formatAmount(todayExpense) }}</text>
        </view>
        <view class="text-center">
          <text class="text-xs text-white/60 block mb-1">日均可用</text>
          <text class="text-lg font-semibold">¥{{ formatAmount(dailyAvailable) }}</text>
        </view>
      </view>
    </view>

    <!-- 消费日历 -->
    <view class="mx-4 mt-4 bg-white rounded-2xl p-4">
      <view class="flex items-center justify-between mb-4">
        <view class="flex items-center">
          <u-icon name="calendar" size="18" color="#6366f1"></u-icon>
          <text class="text-base font-semibold text-gray-800 ml-2">消费日历</text>
        </view>
        <view class="bg-indigo-50 rounded-full px-3 py-1" @click="showMonthPicker = true">
          <text class="text-sm text-indigo-500"
            >{{ currentYear }}-{{ String(currentMonth).padStart(2, '0') }}</text
          >
        </view>
      </view>

      <!-- 星期标题 -->
      <view class="flex justify-around mb-2">
        <text v-for="day in weekDays" :key="day" class="text-sm text-gray-400">{{ day }}</text>
      </view>

      <!-- 日历网格 -->
      <view class="grid grid-cols-7 gap-2">
        <view
          v-for="(day, index) in calendarDays"
          :key="index"
          class="aspect-square flex flex-col items-center justify-center rounded-xl py-2"
          :class="{
            'bg-gray-50': !day.isCurrentMonth,
            'bg-indigo-500': day.isToday,
            'bg-orange-50': day.expense > 0 && !day.isToday,
          }"
          @click="onDayClick(day)"
        >
          <text
            class="text-base font-medium"
            :class="{
              'text-white': day.isToday,
              'text-gray-400': !day.isCurrentMonth,
              'text-gray-800': day.isCurrentMonth && !day.isToday,
            }"
            >{{ day.date }}</text
          >
          <text
            v-if="day.expense > 0"
            class="text-xs mt-1"
            :class="day.isToday ? 'text-white/80' : 'text-orange-500'"
          >
            ¥{{ formatShortAmount(day.expense) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 今日消费 -->
    <view class="mx-4 mt-4 bg-white rounded-2xl p-4">
      <view class="flex items-center justify-between mb-4">
        <text class="text-base font-semibold text-gray-800">今日消费</text>
        <text class="text-lg font-semibold text-orange-500">¥{{ formatAmount(todayExpense) }}</text>
      </view>

      <view v-if="todayRecords.length > 0">
        <view
          v-for="(record, index) in todayRecords"
          :key="record.id"
          class="flex items-center py-3"
          :class="index < todayRecords.length - 1 ? 'border-b border-gray-100' : ''"
        >
          <view
            class="w-12 h-12 rounded-xl flex items-center justify-center mr-3"
            :style="{ backgroundColor: record.categoryColor }"
          >
            <u-icon :name="record.categoryIcon" size="24" color="#fff"></u-icon>
          </view>
          <view class="flex-1">
            <text class="text-base text-gray-800 font-medium block">{{
              record.remark || record.categoryName
            }}</text>
            <text class="text-xs text-gray-400"
              >{{ record.categoryName }} · {{ formatTime(record.createTime) }}</text
            >
          </view>
          <view class="flex items-center">
            <text class="text-base font-semibold text-gray-800"
              >-{{ formatAmount(record.amount) }}</text
            >
            <u-icon name="arrow-right" size="14" color="#ccc" class="ml-2"></u-icon>
          </view>
        </view>
      </view>

      <view v-else class="text-center py-8">
        <text class="text-gray-400 text-sm">今日暂无消费记录</text>
      </view>
    </view>

    <!-- 月份选择器弹窗 -->
    <u-popup :show="showMonthPicker" mode="bottom" @close="showMonthPicker = false" :round="20">
      <view class="p-6">
        <view class="flex justify-between items-center mb-6">
          <text class="text-base text-gray-400" @click="showMonthPicker = false">取消</text>
          <text class="text-lg font-semibold text-gray-800">选择月份</text>
          <text class="text-base text-indigo-500" @click="confirmMonth">确定</text>
        </view>
        <picker-view
          :value="[yearOptions.indexOf(tempYear), tempMonth - 1]"
          class="w-full h-80"
          indicator-style="height: 44px;"
          @change="onMonthChange"
        >
          <picker-view-column>
            <view
              v-for="year in yearOptions"
              :key="year"
              class="flex items-center justify-center h-11"
            >
              {{ year }}年
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="month in 12" :key="month" class="flex items-center justify-center h-11">
              {{ month }}月
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRecordStore } from '@/stores/record'
import { formatAmount } from '@/utils/format'
import { getRemainingDaysInMonth, dayjs } from '@/utils/date'

const userStore = useUserStore()
const recordStore = useRecordStore()

const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const showMonthPicker = ref(false)
const tempYear = ref(currentYear.value)
const tempMonth = ref(currentMonth.value)

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

// 计算属性
const monthlyBudget = computed(() => userStore.currentMonthBudget)
const currentExpense = computed(() => recordStore.currentMonthExpense)

const remainingBudget = computed(() => (monthlyBudget.value || 0) - currentExpense.value)

const dailyAvailable = computed(() => {
  const remaining = remainingBudget.value
  const daysLeft = getRemainingDaysInMonth()
  return daysLeft > 0 ? remaining / daysLeft : remaining
})

const progressPercent = computed(() => {
  const budget = Number(monthlyBudget.value) || 0
  const expense = Number(currentExpense.value) || 0
  if (budget === 0) return 0
  return Math.round((expense / budget) * 100)
})

// 今日支出
const todayExpense = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  const records = recordStore.getDateRecords(today)
  return records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
})

// 今日记录
const todayRecords = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return recordStore
    .getDateRecords(today)
    .filter(r => r.type === 'expense')
    .sort((a, b) => b.createTime - a.createTime)
})

const yearOptions = computed(() => {
  const current = dayjs().year()
  return Array.from({ length: 21 }, (_, i) => current - 10 + i)
})

// 获取当月记录
const monthRecords = computed(() => {
  return recordStore.getMonthRecords(currentYear.value, currentMonth.value)
})

// 计算日历数据
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)

  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')

  // 按日期分组计算支出
  const expenseMap: { [key: string]: number } = {}
  monthRecords.value.forEach(record => {
    if (record.type === 'expense') {
      expenseMap[record.date] = (expenseMap[record.date] || 0) + record.amount
    }
  })

  // 计算第一天是星期几（0=周日，需要调整为1=周一）
  let firstDayWeek = firstDay.getDay()
  firstDayWeek = firstDayWeek === 0 ? 6 : firstDayWeek - 1

  // 上月日期
  const prevLastDay = new Date(currentYear.value, currentMonth.value - 1, 0)
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const date = prevLastDay.getDate() - i
    const dateStr = `${prevLastDay.getFullYear()}-${String(prevLastDay.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    days.push({
      year: prevLastDay.getFullYear(),
      month: prevLastDay.getMonth() + 1,
      date,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      expense: expenseMap[dateStr] || 0,
    })
  }

  // 当月日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      year: currentYear.value,
      month: currentMonth.value,
      date: i,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      expense: expenseMap[dateStr] || 0,
    })
  }

  // 下月日期 - 补齐到42个格子（6行）
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonth = currentMonth.value === 12 ? 1 : currentMonth.value + 1
    const nextYear = currentMonth.value === 12 ? currentYear.value + 1 : currentYear.value
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      year: nextYear,
      month: nextMonth,
      date: i,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      expense: expenseMap[dateStr] || 0,
    })
  }

  return days
})

// 方法
const formatShortAmount = (amount: number) => {
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'k'
  }
  return amount > 0 ? amount.toString() : ''
}

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('HH:mm')
}

const onDayClick = (day: any) => {
  if (day.isCurrentMonth) {
    uni.navigateTo({
      url: `/pages/day-detail/day-detail?date=${day.dateStr}`,
    })
  } else {
    currentYear.value = day.year
    currentMonth.value = day.month
  }
}

const onMonthChange = (e: any) => {
  const [yearIndex, monthIndex] = e.detail.value
  tempYear.value = yearOptions.value[yearIndex]
  tempMonth.value = monthIndex + 1
}

const confirmMonth = () => {
  currentYear.value = tempYear.value
  currentMonth.value = tempMonth.value
  showMonthPicker.value = false
}

onMounted(() => {
  recordStore.initRecords()
  tempYear.value = currentYear.value
  tempMonth.value = currentMonth.value
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
