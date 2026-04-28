<template>
  <view class="min-h-screen bg-white flex flex-col">
    <!-- 头部 -->
    <view class="flex items-center justify-between px-4 pt-12 pb-4 border-b border-gray-100">
      <text class="text-base text-gray-500" @click="goBack">取消</text>
      <text class="text-lg font-semibold text-gray-800">记一笔</text>
      <text class="text-base text-primary" :class="{ 'opacity-50': !canSave }" @click="save">保存</text>
    </view>

    <scroll-view scroll-y class="flex-1">
      <!-- 金额输入 -->
      <view class="px-6 py-8">
        <view class="flex items-center justify-center">
          <text class="text-3xl font-bold text-gray-800 mr-2">¥</text>
          <input
            v-model="amountInput"
            type="digit"
            placeholder="0.00"
            class="text-5xl font-bold text-gray-800 text-center"
            style="width: 300rpx;"
            focus
          />
        </view>
      </view>

      <!-- 分类选择 -->
      <view class="px-4 mb-6">
        <text class="text-sm text-gray-500 mb-4 block">选择分类</text>
        <view class="grid grid-cols-4 gap-4">
          <view
            v-for="category in EXPENSE_CATEGORIES"
            :key="category.id"
            class="flex flex-col items-center"
            @click="selectCategory(category)"
          >
            <view
              class="w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all"
              :style="{ 
                backgroundColor: form.categoryId === category.id ? category.color : category.color + '20',
                transform: form.categoryId === category.id ? 'scale(1.1)' : 'scale(1)'
              }"
            >
              <u-icon 
                :name="category.icon" 
                size="24" 
                :color="form.categoryId === category.id ? '#fff' : category.color"
              ></u-icon>
            </view>
            <text 
              class="text-xs"
              :class="form.categoryId === category.id ? 'text-gray-800 font-medium' : 'text-gray-500'"
            >
              {{ category.name }}
            </text>
          </view>
        </view>
      </view>

      <!-- 日期选择 -->
      <view class="px-4 mb-6">
        <text class="text-sm text-gray-500 mb-3 block">日期</text>
        <view class="flex items-center bg-gray-50 rounded-xl px-4 py-3" @click="showDatePicker = true">
          <u-icon name="calendar" size="20" color="#999"></u-icon>
          <text class="text-base text-gray-800 ml-3">{{ form.date }}</text>
        </view>
      </view>

      <!-- 备注 -->
      <view class="px-4 mb-6">
        <text class="text-sm text-gray-500 mb-3 block">备注</text>
        <u-textarea
          v-model="form.remark"
          placeholder="添加备注（选填）"
          maxlength="100"
          height="100"
          border="none"
          :customStyle="{ backgroundColor: '#f5f5f5', borderRadius: '12rpx', padding: '24rpx' }"
        />
      </view>
    </scroll-view>

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
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRecordStore } from '@/stores/record'
import { EXPENSE_CATEGORIES } from '@/utils/constants'
import { formatDate, dayjs } from '@/utils/date'
import type { Category } from '@/types'

const recordStore = useRecordStore()

const showDatePicker = ref(false)
const tempDate = ref({ year: dayjs().year(), month: dayjs().month() + 1, day: dayjs().date() })

const form = ref({
  amount: 0,
  type: 'expense' as const,
  categoryId: '',
  categoryName: '',
  categoryIcon: '',
  categoryColor: '',
  date: formatDate(new Date()),
  remark: '',
})

const amountInput = ref('')

const canSave = computed(() => {
  return form.value.amount > 0 && form.value.categoryId
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

watch(amountInput, (val) => {
  let value = val.replace(/[^\d.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  if (parts[1] && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].slice(0, 2)
  }
  const numValue = parseFloat(value) || 0
  if (numValue > 9999999.99) {
    value = '9999999.99'
  }
  amountInput.value = value
  form.value.amount = parseFloat(value) || 0
})

const selectCategory = (category: Category) => {
  form.value.categoryId = category.id
  form.value.categoryName = category.name
  form.value.categoryIcon = category.icon
  form.value.categoryColor = category.color
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

const save = () => {
  if (!canSave.value) return

  const data = {
    ...form.value,
    images: [],
  }

  recordStore.addRecord(data)
  uni.showToast({ title: '记账成功', icon: 'success' })
  
  // 返回上一页
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
    date: formatDate(new Date()),
    remark: '',
  }
  amountInput.value = ''
}

// 页面显示时重置表单
onShow(() => {
  resetForm()
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
