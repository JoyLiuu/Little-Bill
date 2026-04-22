<template>
  <view class="min-h-screen pb-10" style="background: linear-gradient(180deg, #3E8FD4 0%, #F7FBFE 300rpx);">
    <!-- 顶部区域 - 预算进度 -->
    <view class="px-4 pt-12 pb-4">
      <!-- 预算进度环 -->
      <view class="bg-white rounded-3xl p-5" style="box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.1);">
        <view class="flex items-center">
          <!-- 进度环 -->
          <view class="relative flex-shrink-0" style="width: 160rpx; height: 160rpx;">
            <view 
              class="w-full h-full rounded-full flex items-center justify-center"
              :style="progressStyle"
            >
              <view class="bg-white rounded-full flex flex-col items-center justify-center" style="width: 130rpx; height: 130rpx;">
                <text class="font-bold" style="font-size: 40rpx; color: #3E8FD4;">{{ progressPercent }}%</text>
                <text class="text-xs text-gray-400 mt-1">已使用123</text>
              </view>
            </view>
          </view>
          
          <!-- 预算信息 -->
          <view class="flex-1 ml-6">
            <view class="flex justify-between items-center mb-3" @click="showBudgetModal = true">
              <text class="text-sm text-gray-500">月预算123678</text>
              <view class="flex items-center">
                <text class="text-base font-semibold text-gray-800">
                  ¥{{ formatAmount(monthlyBudget) }}
                </text>
                <u-icon name="edit-pen" size="16" color="#999" class="ml-2"></u-icon>
              </view>
            </view>
            <view class="flex justify-between items-center mb-3">
              <text class="text-sm text-gray-500">已支出</text>
              <text class="text-base font-semibold" style="color: #ff5252;">
                ¥{{ formatAmount(currentExpense) }}
              </text>
            </view>
            <view class="flex justify-between items-center">
              <text class="text-sm text-gray-500">剩余</text>
              <text 
                class="text-base font-semibold"
                :style="remainingBudget < 0 ? 'color: #ff5252;' : 'color: #1f2937;'"
              >
                ¥{{ formatAmount(remainingBudget) }}
              </text>
            </view>
          </view>
        </view>

        <!-- 今日可用额度 -->
        <view class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <text class="text-sm text-gray-500">今日可用额度</text>
          <text 
            class="font-bold"
            style="font-size: 36rpx;"
            :style="dailyAvailable < 0 ? 'color: #D94F3A;' : 'color: #3E8FD4;'"
          >
            ¥{{ formatAmount(dailyAvailable) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view 
      class="fixed right-4 bottom-24 rounded-full flex items-center justify-center z-50"
      style="width: 112rpx; height: 112rpx; background: linear-gradient(135deg, #3E8FD4 0%, #2E6FA8 100%); box-shadow: 0 8rpx 24rpx rgba(184, 169, 201, 0.4);"
      @click="showRecordModal = true"
    >
      <text class="text-white font-light" style="font-size: 56rpx;">+</text>
    </view>

    <!-- 日历视图 -->
    <view class="px-4 mb-6">
      <text class="text-xl font-semibold text-gray-800 mb-4 block">日历视图{{showRecordModal}}</text>
      <view class="bg-white rounded-2xl p-5" style="box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06);">
        <!-- 月份选择器 -->
        <view class="flex items-center justify-between mb-4">
          <text class="px-4 font-light" style="font-size: 40rpx; color: #999;" @click="changeMonth(-1)">‹</text>
          <view class="text-center">
            <text class="text-base font-semibold text-gray-800">{{ currentYear }}年{{ currentMonth }}月</text>
          </view>
          <text class="px-4 font-light" style="font-size: 40rpx; color: #999;" @click="changeMonth(1)">›</text>
        </view>

        <!-- 星期标题 -->
        <view class="flex justify-around mb-2">
          <text v-for="day in weekDays" :key="day" class="text-sm text-gray-400">{{ day }}</text>
        </view>

        <!-- 日历网格 -->
        <view class="calendar-grid">
          <view
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'has-expense': day.expense > 0
            }"
            @click="onDayClick(day)"
          >
            <text class="day-number" :class="{ 'text-primary': day.isToday }">{{ day.date }}</text>
            <text v-if="day.expense > 0" class="day-expense">{{ formatShortAmount(day.expense) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部区域 - 今日记录 -->
    <view class="px-4">
      <view class="flex justify-between items-center mb-4">
        <text class="text-xl font-semibold text-gray-800">今日记账</text>
        <view class="flex items-center text-sm text-gray-400" v-if="yesterdayExpense > 0">
          <text>较昨日</text>
          <text :class="compareInfo.class" class="ml-1">{{ compareInfo.text }}</text>
        </view>
      </view>

      <view class="bg-white rounded-2xl overflow-hidden" v-if="todayRecords.length > 0">
        <view
          v-for="(record, index) in todayRecords.slice(0, 5)"
          :key="record.id"
          class="flex items-center px-5 py-4"
          :class="index < todayRecords.slice(0, 5).length - 1 ? 'border-b border-gray-50' : ''"
          @click="editRecord(record)"
        >
          <view
            class="w-16 h-16 rounded-full flex items-center justify-center mr-4"
            :style="{ backgroundColor: record.categoryColor + '20' }"
          >
            <u-icon :name="record.categoryIcon" size="24" :color="record.categoryColor"></u-icon>
          </view>
          <view class="flex-1">
            <text class="text-base font-medium text-gray-800 block">{{ record.categoryName }}</text>
            <text class="text-sm text-gray-400" v-if="record.remark">{{ record.remark }}</text>
          </view>
          <text 
            class="text-lg font-medium"
            :style="record.type === 'expense' ? 'color: #D94F3A;' : 'color: #3E8FD4;'"
          >
            {{ record.type === 'expense' ? '-' : '+' }}¥{{ formatAmount(record.amount) }}
          </text>
        </view>

        <view 
          v-if="todayRecords.length > 5" 
          class="flex items-center justify-center py-4"
          style="color: #3E8FD4;"
          @click="goToLedger"
        >
          <text>查看全部 {{ todayRecords.length }} 条</text>
          <text class="ml-1">→</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="bg-white rounded-2xl py-16 px-8 text-center">
        <text class="text-7xl block mb-4">📝</text>
        <text class="text-lg text-gray-600 block mb-2">今天还没有记账哦</text>
        <text class="text-sm text-gray-400">点击上方"记一笔"开始记录</text>
      </view>
    </view>

    <!-- 记账弹窗 -->
    <RecordModal
      v-model:visible="showRecordModal"
      :record="editingRecord"
      @save="onSaveRecord"
    />

    <!-- 预算设置弹窗 -->
    <!-- <BudgetModal
      v-model:visible="showBudgetModal"
      :currentBudget="monthlyBudget"
      @save="onSaveBudget"
    /> -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRecordStore } from '@/stores/record'
import RecordModal from '@/components/RecordModal.vue'
import BudgetModal from '@/components/BudgetModal.vue'
import { formatAmount } from '@/utils/format'
import { getRemainingDaysInMonth, dayjs } from '@/utils/date'
import type { Record } from '@/types'

const userStore = useUserStore()
const recordStore = useRecordStore()

const showRecordModal = ref(false)
const editingRecord = ref<Record | null>(null)
const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const showBudgetModal = ref(false)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 计算属性
const monthlyBudget = computed(() => userStore.currentMonthBudget)
const currentExpense = computed(() => recordStore.currentMonthExpense)
const todayRecords = computed(() => recordStore.todayRecords)
const yesterdayExpense = computed(() => recordStore.yesterdayExpense)

const remainingBudget = computed(() => monthlyBudget.value - currentExpense.value)

const dailyAvailable = computed(() => {
  const remaining = remainingBudget.value
  const daysLeft = getRemainingDaysInMonth()
  return daysLeft > 0 ? remaining / daysLeft : remaining
})

const progressPercent = computed(() => {
  const budget = Number(monthlyBudget.value) || 0
  const expense = Number(currentExpense.value) || 0
  if (budget === 0) return 0
  const percent = Math.round((expense / budget) * 100)
  return Math.min(percent, 100)
})

const progressStyle = computed(() => {
  return {
    background: `conic-gradient(#3E8FD4 ${progressPercent.value * 3.6}deg, #EAF4FD 0deg)`,
  }
})

const compareInfo = computed(() => {
  const today = recordStore.todayExpense
  const yesterday = yesterdayExpense.value
  const diff = today - yesterday

  if (diff > 0) return { class: 'text-danger', text: `+¥${formatAmount(diff)}` }
  if (diff < 0) return { class: 'text-primary', text: `-¥${formatAmount(Math.abs(diff))}` }
  return { class: 'text-gray-400', text: '持平' }
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
  const prevLastDay = new Date(currentYear.value, currentMonth.value - 1, 0)
  
  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')

  // 按日期分组计算支出
  const expenseMap: { [key: string]: number } = {}
  monthRecords.value.forEach(record => {
    if (record.type === 'expense') {
      expenseMap[record.date] = (expenseMap[record.date] || 0) + record.amount
    }
  })

  // 上月日期
  const firstDayWeek = firstDay.getDay()
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
      expense: expenseMap[dateStr] || 0
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
      expense: expenseMap[dateStr] || 0
    })
  }

  // 下月日期
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      year: currentYear.value,
      month: currentMonth.value + 1,
      date: i,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      expense: expenseMap[dateStr] || 0
    })
  }

  return days
})

// 方法
const changeMonth = (delta: number) => {
  const newDate = new Date(currentYear.value, currentMonth.value - 1 + delta, 1)
  currentYear.value = newDate.getFullYear()
  currentMonth.value = newDate.getMonth() + 1
}

const onDayClick = (day: any) => {
  if (day.isCurrentMonth) {
    // 跳转到当日明细页面，传递日期参数
    uni.navigateTo({
      url: `/pages/day-detail/day-detail?date=${day.dateStr}`
    })
  } else {
    // 切换到对应月份
    currentYear.value = day.year
    currentMonth.value = day.month
  }
}

const formatShortAmount = (amount: number) => {
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'k'
  }
  return amount > 0 ? amount.toString() : ''
}

const editRecord = (record: Record) => {
  editingRecord.value = record
  showRecordModal.value = true
}

const onSaveRecord = (data: any) => {
  if (data.id) {
    recordStore.updateRecord(data.id, data)
    uni.showToast({ title: '修改成功', icon: 'success' })
  } else {
    recordStore.addRecord(data)
    uni.showToast({ title: '记账成功', icon: 'success' })
  }
  editingRecord.value = null
}

const goToLedger = () => {
  uni.switchTab({ url: '/pages/ledger/ledger' })
}

const onSaveBudget = (budget: number) => {
  userStore.setMonthlyBudget(budget)
  uni.showToast({ title: '设置成功', icon: 'success' })
}

onMounted(() => {
  recordStore.initRecords()
})
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 0;
  border-radius: 12rpx;
  min-height: 80rpx;
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: #C5DFF5;
}

.calendar-day.has-expense {
  background: #FDF2F0;
}

.calendar-day:active {
  background: #EAF4FD;
}

.day-number {
  font-size: 28rpx;
  color: #1C3A5A;
  font-weight: 500;
}

.day-number.text-primary {
  color: #3E8FD4;
  font-weight: bold;
}

.day-expense {
  font-size: 20rpx;
  color: #D94F3A;
  margin-top: 4rpx;
}
</style>
