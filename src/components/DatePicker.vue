<template>
  <view class="date-picker">
    <!-- 日期显示按钮 -->
    <view class="picker-content" @click="openCalendar">
      <text class="date-text">{{ displayDate }}</text>
      <text class="arrow">▼</text>
    </view>

    <!-- 日历弹窗 -->
    <view
      class="calendar-modal"
      v-if="showCalendar"
      @click="closeCalendar"
      @touchmove.stop.prevent="onTouchMove"
    >
      <view class="calendar-content" @click.stop @touchmove.stop>
        <!-- 头部 -->
        <view class="calendar-header">
          <text class="cancel-btn" @click="closeCalendar">取消</text>
          <text class="title">选择日期</text>
          <text class="confirm-btn" @click="confirmDate">确定</text>
        </view>

        <scroll-view class="calendar-body" scroll-y>
          <!-- 年月选择器 -->
          <view class="month-selector">
            <text class="arrow-btn" @click="prevMonth">‹</text>
            <text class="current-month">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
            <text class="arrow-btn" @click="nextMonth">›</text>
          </view>

          <!-- 星期标题 -->
          <view class="week-header">
            <text v-for="day in weekDays" :key="day" class="week-day">{{ day }}</text>
          </view>

          <!-- 日期网格 -->
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
    </view>
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

const selectDate = (day: any) => {
  if (isDisabled(day)) return
  const month = String(day.month + 1).padStart(2, '0')
  const date = String(day.date).padStart(2, '0')
  selectedDate.value = `${day.year}-${month}-${date}`
}

const isSelected = (day: any) => {
  const month = String(day.month + 1).padStart(2, '0')
  const date = String(day.date).padStart(2, '0')
  const dateStr = `${day.year}-${month}-${date}`
  return dateStr === selectedDate.value
}

const isToday = (day: any) => {
  const today = new Date()
  return day.year === today.getFullYear() &&
         day.month === today.getMonth() &&
         day.date === today.getDate()
}

const isDisabled = (day: any) => {
  const month = String(day.month + 1).padStart(2, '0')
  const date = String(day.date).padStart(2, '0')
  const dateStr = `${day.year}-${month}-${date}`
  const today = formatDate(new Date())
  return dateStr > today
}

// 阻止滚动穿透
const onTouchMove = () => {
  // 什么都不做，只是阻止事件冒泡和默认行为
}

watch(() => props.modelValue, (val) => {
  selectedDate.value = val
})
</script>

<style lang="scss" scoped>
.date-picker {
  .picker-content {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background: #f5f5f5;
    border-radius: 8rpx;

    .date-text {
      font-size: 28rpx;
      color: #333;
      margin-right: 16rpx;
    }

    .arrow {
      font-size: 20rpx;
      color: #999;
    }
  }
}

.calendar-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.calendar-content {
  width: 100%;
  max-width: 600rpx;
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
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .cancel-btn {
    font-size: 28rpx;
    color: #999;
  }

  .title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .confirm-btn {
    font-size: 28rpx;
    color: #4CAF50;
    font-weight: 500;
  }
}

.month-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx 30rpx;

  .arrow-btn {
    font-size: 40rpx;
    color: #666;
    padding: 0 30rpx;
    font-weight: 300;
  }

  .current-month {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    min-width: 200rpx;
    text-align: center;
  }
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;

  .week-day {
    text-align: center;
    font-size: 26rpx;
    color: #999;
  }
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 16rpx 20rpx 30rpx;
  gap: 8rpx 0;

  .day-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin: 4rpx;

    .day-text {
      font-size: 28rpx;
      color: #333;
    }

    &.other-month {
      .day-text {
        color: #ccc;
      }
    }

    &.today {
      background: #e8f5e9;

      .day-text {
        color: #4CAF50;
        font-weight: 500;
      }
    }

    &.selected {
      background: #4CAF50;

      .day-text {
        color: #fff;
        font-weight: 500;
      }
    }

    &.disabled {
      opacity: 0.3;
    }

    &:active:not(.disabled) {
      background: #f0f0f0;
    }
  }
}
</style>
