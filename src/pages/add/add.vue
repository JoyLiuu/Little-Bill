<template>
  <view class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航 -->
    <view class="flex items-center justify-between px-4 pt-12 pb-4 bg-white">
      <text class="text-2xl text-gray-800" @click="goBack">‹</text>
      <text class="text-lg font-semibold text-gray-800">记一笔</text>
      <view class="w-6"></view>
    </view>

    <!-- 金额卡片 -->
    <view class="mx-4 mt-4 rounded-2xl p-5" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
      <text class="text-sm text-white/80 block mb-2">本次金额</text>
      <view class="flex items-baseline mb-4">
        <text class="text-2xl text-white font-medium mr-1">¥</text>
        <text class="text-5xl font-bold text-white">{{ amountDisplay }}</text>
      </view>
      <view class="flex gap-3">
        <view class="flex items-center bg-white/20 rounded-full px-3 py-1.5" @click="showDatePicker = true">
          <u-icon name="calendar" size="14" color="#fff"></u-icon>
          <text class="text-xs text-white ml-1">{{ form.date }}</text>
        </view>
        <view class="flex items-center bg-white/20 rounded-full px-3 py-1.5" @click="showTimePicker = true">
          <u-icon name="clock" size="14" color="#fff"></u-icon>
          <text class="text-xs text-white ml-1">{{ form.time }}</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="flex-1">
      <!-- 消费名目 -->
      <view class="mx-4 mt-4 bg-white rounded-2xl p-4">
        <text class="text-base font-semibold text-gray-800 mb-3 block">消费名目</text>
        <input
          v-model="form.remark"
          type="text"
          placeholder="例如：午餐 / 打车 / 朋友聚会..."
          class="w-full text-base text-gray-800 placeholder-gray-400"
        />
      </view>

      <!-- 选择分类 -->
      <view class="mx-4 mt-4 bg-white rounded-2xl p-4">
        <text class="text-base font-semibold text-gray-800 mb-4 block">选择分类</text>
        <view class="grid grid-cols-4 gap-4">
          <view
            v-for="category in EXPENSE_CATEGORIES"
            :key="category.id"
            class="flex flex-col items-center relative"
            @click="selectCategory(category)"
          >
            <!-- 选中背景 -->
            <view 
              v-if="form.categoryId === category.id"
              class="absolute -inset-2 bg-indigo-50 rounded-xl"
            ></view>
            <!-- 图标 -->
            <view
              class="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 relative z-10"
              :style="{ backgroundColor: category.color }"
            >
              <u-icon :name="category.icon" size="28" color="#fff"></u-icon>
              <!-- 选中对勾 -->
              <view 
                v-if="form.categoryId === category.id"
                class="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"
              >
                <u-icon name="checkmark" size="12" color="#fff"></u-icon>
              </view>
            </view>
            <!-- 名称 -->
            <text 
              class="text-xs relative z-10"
              :class="form.categoryId === category.id ? 'text-indigo-500 font-medium' : 'text-gray-600'"
            >
              {{ category.name }}
            </text>
          </view>
        </view>
      </view>

      <!-- 占位，给键盘留空间 -->
      <view class="h-80"></view>
    </scroll-view>

    <!-- 数字键盘 -->
    <view class="fixed bottom-0 left-0 right-0 bg-gray-50 px-4 pb-6 pt-4" style="padding-bottom: calc(24rpx + env(safe-area-inset-bottom));">
      <text class="text-base font-semibold text-gray-800 mb-4 block">输入金额</text>
      <view class="grid grid-cols-3 gap-3 mb-4">
        <view
          v-for="key in numberKeys"
          :key="key"
          class="bg-white rounded-xl py-4 flex items-center justify-center"
          :class="key === '' ? 'pointer-events-none' : ''"
          @click="onKeyPress(key)"
        >
          <text v-if="key === 'backspace'" class="text-2xl text-gray-800">⌫</text>
          <text v-else-if="key === '.'" class="text-2xl text-gray-800">.</text>
          <text v-else class="text-2xl text-gray-800">{{ key }}</text>
        </view>
      </view>
      <!-- 保存按钮 -->
      <view
        class="w-full py-4 rounded-xl text-center text-white font-medium text-lg"
        :class="canSave ? 'bg-indigo-500' : 'bg-indigo-300'"
        @click="save"
      >
        保存
      </view>
    </view>

    <!-- 日期选择器 -->
    <u-popup :show="showDatePicker" mode="bottom" @close="showDatePicker = false" :round="20">
      <view class="p-6">
        <view class="flex justify-between items-center mb-6">
          <text class="text-base text-gray-400" @click="showDatePicker = false">取消</text>
          <text class="text-lg font-semibold text-gray-800">选择日期</text>
          <text class="text-base text-indigo-500" @click="confirmDate">确定</text>
        </view>
        <picker-view
          :value="datePickerValue"
          class="w-full h-80"
          indicator-style="height: 44px;"
          @change="onDateChange"
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
      </view>
    </u-popup>

    <!-- 时间选择器 -->
    <u-popup :show="showTimePicker" mode="bottom" @close="showTimePicker = false" :round="20">
      <view class="p-6">
        <view class="flex justify-between items-center mb-6">
          <text class="text-base text-gray-400" @click="showTimePicker = false">取消</text>
          <text class="text-lg font-semibold text-gray-800">选择时间</text>
          <text class="text-base text-indigo-500" @click="confirmTime">确定</text>
        </view>
        <picker-view
          :value="timePickerValue"
          class="w-full h-80"
          indicator-style="height: 44px;"
          @change="onTimeChange"
        >
          <picker-view-column>
            <view v-for="hour in 24" :key="hour" class="flex items-center justify-center h-11">
              {{ String(hour - 1).padStart(2, '0') }}时
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="minute in 60" :key="minute" class="flex items-center justify-center h-11">
              {{ String(minute - 1).padStart(2, '0') }}分
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRecordStore } from '@/stores/record'
import { EXPENSE_CATEGORIES } from '@/utils/constants'
import { dayjs } from '@/utils/date'
import type { Category } from '@/types'

const recordStore = useRecordStore()

const showDatePicker = ref(false)
const showTimePicker = ref(false)
const amountInput = ref('0')

const form = ref({
  amount: 0,
  type: 'expense' as const,
  categoryId: '',
  categoryName: '',
  categoryIcon: '',
  categoryColor: '',
  date: dayjs().format('YYYY-MM-DD'),
  time: dayjs().format('HH:mm'),
  remark: '',
})

const tempDate = ref({ year: dayjs().year(), month: dayjs().month() + 1, day: dayjs().date() })
const tempTime = ref({ hour: dayjs().hour(), minute: dayjs().minute() })

const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace']

const canSave = computed(() => {
  return form.value.amount > 0 && form.value.categoryId
})

const amountDisplay = computed(() => {
  if (amountInput.value === '0') return '0'
  return amountInput.value
})

const yearOptions = computed(() => {
  const current = dayjs().year()
  return Array.from({ length: 21 }, (_, i) => current - 10 + i)
})

const daysInMonth = computed(() => {
  return dayjs(`${tempDate.value.year}-${tempDate.value.month}-01`).daysInMonth()
})

const datePickerValue = computed(() => {
  const d = dayjs(form.value.date)
  return [
    yearOptions.value.indexOf(d.year()),
    d.month(),
    d.date() - 1
  ]
})

const timePickerValue = computed(() => {
  const [hour, minute] = form.value.time.split(':').map(Number)
  return [hour, minute]
})

const selectCategory = (category: Category) => {
  form.value.categoryId = category.id
  form.value.categoryName = category.name
  form.value.categoryIcon = category.icon
  form.value.categoryColor = category.color
}

const onKeyPress = (key: string) => {
  if (key === 'backspace') {
    if (amountInput.value.length > 1) {
      amountInput.value = amountInput.value.slice(0, -1)
    } else {
      amountInput.value = '0'
    }
  } else if (key === '.') {
    if (!amountInput.value.includes('.')) {
      amountInput.value += '.'
    }
  } else {
    if (amountInput.value === '0') {
      amountInput.value = key
    } else if (amountInput.value.length < 10) {
      // 检查小数位数
      if (amountInput.value.includes('.')) {
        const parts = amountInput.value.split('.')
        if (parts[1] && parts[1].length >= 2) return
      }
      amountInput.value += key
    }
  }
  form.value.amount = parseFloat(amountInput.value) || 0
}

const onDateChange = (e: any) => {
  const [yearIndex, monthIndex, dayIndex] = e.detail.value
  tempDate.value = {
    year: yearOptions.value[yearIndex],
    month: monthIndex + 1,
    day: dayIndex + 1
  }
}

const confirmDate = () => {
  form.value.date = `${tempDate.value.year}-${String(tempDate.value.month).padStart(2, '0')}-${String(tempDate.value.day).padStart(2, '0')}`
  showDatePicker.value = false
}

const onTimeChange = (e: any) => {
  const [hourIndex, minuteIndex] = e.detail.value
  tempTime.value = {
    hour: hourIndex,
    minute: minuteIndex
  }
}

const confirmTime = () => {
  form.value.time = `${String(tempTime.value.hour).padStart(2, '0')}:${String(tempTime.value.minute).padStart(2, '0')}`
  showTimePicker.value = false
}

const save = () => {
  if (!canSave.value) return

  const data = {
    ...form.value,
    images: [],
  }

  recordStore.addRecord(data)
  uni.showToast({ title: '记账成功', icon: 'success' })
  
  setTimeout(() => {
    goBack()
  }, 500)
}

const goBack = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const resetForm = () => {
  form.value = {
    amount: 0,
    type: 'expense' as const,
    categoryId: '',
    categoryName: '',
    categoryIcon: '',
    categoryColor: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: dayjs().format('HH:mm'),
    remark: '',
  }
  amountInput.value = '0'
  tempDate.value = { year: dayjs().year(), month: dayjs().month() + 1, day: dayjs().date() }
  tempTime.value = { hour: dayjs().hour(), minute: dayjs().minute() }
}

onShow(() => {
  resetForm()
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
