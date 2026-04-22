<template>
  <view class="date-picker">
    <!-- 日期显示按钮 -->
    <view class="picker-content" @click="openCalendar">
      <u-text :text="displayDate" size="20" color="#333"></u-text>
      <u-icon name="arrow-down" size="14" color="#999"></u-icon>
    </view>

    <!-- 日历弹窗 -->
    <u-popup
      :show="showCalendar"
      mode="center"
      :round="24"
      :closeOnClickOverlay="true"
      @close="closeCalendar"
      bgColor="#fff"
      :zIndex="1000"
      :customStyle="{ width: '85%' }"
    >
      <view class="calendar-content">
        <!-- 头部 -->
        <view class="calendar-header">
          <u-text text="取消" size="20" color="#999" @click="closeCalendar"></u-text>
          <u-text text="选择日期" size="20" color="#333" bold></u-text>
          <u-text text="确定" size="20" color="#4CAF50" @click="confirmDate"></u-text>
        </view>

        <!-- 年月选择器 -->
        <view class="month-selector">
          <u-icon name="arrow-left" size="20" color="#666" @click="prevMonth"></u-icon>
          <u-text :text="`${currentYear}年${currentMonth + 1}月`" size="20" color="#333" bold></u-text>
          <u-icon name="arrow-right" size="20" color="#666" @click="nextMonth"></u-icon>
        </view>

        <!-- 星期标题 -->
        <view class="week-header">
          <text v-for="day in weekDays" :key="day" class="week-day">{{ day }}</text>
        </view>

        <!-- 日期网格 -->
        <scroll-view class="calendar-body" scroll-y>
          <view class="days-grid">
            <view
              v-for="(day, index) in calendarDays"
              :key="index"
              class="day-cell"
              :class="{
                'other-month': !day.isCurrentMonth,
                'selected': isSelected(day),
                'today': isToday(day),
                'disabled': isDisabled(day)
              }"
              @click="selectDate(day)"
            >
              <text class="day-text">{{ day.date }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatDateCN, formatDate } from '@/utils/date'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const showCalendar = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedDate = ref(props.modelValue)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const displayDate = computed(() => {
  return formatDateCN(props.modelValue)
})

// 计算日历天数
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0)

  // 上月日期
  const firstDayWeek = firstDay.getDay()
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    days.push({
      year: currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value,
      month: currentMonth.value === 0 ? 11 : currentMonth.value - 1,
      date: prevLastDay.getDate() - i,
      isCurrentMonth: false
    })
  }

  // 当月日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      year: currentYear.value,
      month: currentMonth.value,
      date: i,
      isCurrentMonth: true
    })
  }

  // 下月日期
  const remainingCells = 42 - days.length // 6行7列
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      year: currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value,
      month: currentMonth.value === 11 ? 0 : currentMonth.value + 1,
      date: i,
      isCurrentMonth: false
    })
  }

  return days
})

const openCalendar = () => {
  const date = new Date(props.modelValue)
  currentYear.value = date.getFullYear()
  currentMonth.value = date.getMonth()
  selectedDate.value = props.modelValue
  showCalendar.value = true
}

const closeCalendar = () => {
  showCalendar.value = false
}

const confirmDate = () => {
  emit('update:modelValue', selectedDate.value)
  closeCalendar()
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const formatDayToString = (day: any): string => {
  const month = String(day.month + 1).padStart(2, '0')
  const date = String(day.date).padStart(2, '0')
  return `${day.year}-${month}-${date}`
}

const selectDate = (day: any) => {
  if (isDisabled(day)) return
  selectedDate.value = formatDayToString(day)
}

const isSelected = (day: any) => {
  return formatDayToString(day) === selectedDate.value
}

const isToday = (day: any) => {
  const today = new Date()
  return day.year === today.getFullYear() &&
         day.month === today.getMonth() &&
         day.date === today.getDate()
}

const isDisabled = (day: any) => {
  return formatDayToString(day) > formatDate(new Date())
}

watch(() => props.modelValue, (val) => {
  selectedDate.value = val
})
</script>

<style scoped>
.date-picker {
  width: 100%;
}

.date-picker .picker-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  width: 100%;
  box-sizing: border-box;
}

.calendar-content {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.calendar-body {
  flex: 1;
  overflow: hidden;
  max-height: 500rpx;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.month-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx 30rpx;
  gap: 60rpx;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.week-header .week-day {
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 16rpx 20rpx 30rpx;
  gap: 8rpx 0;
}

.days-grid .day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 4rpx;
}

.days-grid .day-cell .day-text {
  font-size: 28rpx;
  color: #333;
}

.days-grid .day-cell.other-month .day-text {
  color: #ccc;
}

.days-grid .day-cell.today {
  background: #e8f5e9;
}

.days-grid .day-cell.today .day-text {
  color: #4CAF50;
  font-weight: 500;
}

.days-grid .day-cell.selected {
  background: #4CAF50;
}

.days-grid .day-cell.selected .day-text {
  color: #fff;
  font-weight: 500;
}

.days-grid .day-cell.disabled {
  opacity: 0.3;
}

.days-grid .day-cell:active:not(.disabled) {
  background: #f0f0f0;
}
</style>
