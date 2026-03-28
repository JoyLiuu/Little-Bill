<template>
  <view class="min-h-screen pb-10" style="background: linear-gradient(180deg, #4CAF50 0%, #f5f5f5 300rpx);">
    <!-- 顶部区域 -->
    <view class="px-4 pt-10 pb-4">
      <!-- 用户信息 -->
      <view class="flex items-center mb-6">
        <image
          class="w-20 h-20 rounded-full mr-4 border-4 border-white/30"
          :src="userStore.userInfo?.avatarUrl || '/static/default-avatar.png'"
          mode="aspectFill"
        />
        <text class="text-2xl text-white font-medium">
          {{ userStore.userInfo?.nickName || '记账用户' }}
        </text>
      </view>

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
                <text class="font-bold" style="font-size: 40rpx; color: #4CAF50;">{{ progressPercent }}%</text>
                <text class="text-xs text-gray-400 mt-1">已使用</text>
              </view>
            </view>
          </view>
          
          <!-- 预算信息 -->
          <view class="flex-1 ml-6">
            <view class="flex justify-between items-center mb-3">
              <text class="text-sm text-gray-500">月预算</text>
              <text class="text-base font-semibold text-gray-800">
                ¥{{ formatAmount(monthlyBudget) }}
              </text>
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
            :style="dailyAvailable < 0 ? 'color: #ff5252;' : 'color: #4CAF50;'"
          >
            ¥{{ formatAmount(dailyAvailable) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 中间区域 - 记一笔 -->
    <view class="px-4 mb-6">
      <button 
        class="w-full rounded-2xl flex items-center justify-center"
        style="height: 120rpx; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.35);"
        @click="showRecordModal = true"
      >
        <text class="text-white mr-2 font-light" style="font-size: 48rpx;">+</text>
        <text class="text-white font-medium" style="font-size: 36rpx;">记一笔</text>
      </button>

      <!-- 快捷分类 -->
      <view class="bg-white rounded-2xl p-5 mt-6" style="box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06);">
        <text class="text-base font-semibold text-gray-800 mb-4 block">快捷记账</text>
        <view class="grid grid-cols-6 gap-2">
          <view
            v-for="category in quickCategories"
            :key="category.id"
            class="flex flex-col items-center"
            @click="quickRecord(category)"
          >
            <view
              class="rounded-full flex items-center justify-center mb-2"
              style="width: 88rpx; height: 88rpx;"
              :style="{ backgroundColor: category.color + '15' }"
            >
              <text style="font-size: 40rpx;" :style="{ color: category.color }">
                {{ category.icon }}
              </text>
            </view>
            <text class="text-xs text-gray-500">{{ category.name }}</text>
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
          <text :class="compareClass" class="ml-1">{{ compareText }}</text>
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
            <text class="text-2xl" :style="{ color: record.categoryColor }">
              {{ record.categoryIcon }}
            </text>
          </view>
          <view class="flex-1">
            <text class="text-base font-medium text-gray-800 block">{{ record.categoryName }}</text>
            <text class="text-sm text-gray-400" v-if="record.remark">{{ record.remark }}</text>
          </view>
          <text 
            class="text-lg font-medium"
            :style="record.type === 'expense' ? 'color: #ff5252;' : 'color: #4CAF50;'"
          >
            {{ record.type === 'expense' ? '-' : '+' }}¥{{ formatAmount(record.amount) }}
          </text>
        </view>

        <view 
          v-if="todayRecords.length > 5" 
          class="flex items-center justify-center py-4"
          style="color: #4CAF50;"
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
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRecordStore } from '@/stores/record'
import RecordModal from '@/components/RecordModal.vue'
import { EXPENSE_CATEGORIES } from '@/utils/constants'
import { formatAmount } from '@/utils/format'
import { getRemainingDaysInMonth } from '@/utils/date'
import type { Record } from '@/types'

const userStore = useUserStore()
const recordStore = useRecordStore()

const showRecordModal = ref(false)
const editingRecord = ref<Record | null>(null)

// 快捷分类（6个常用分类）
const quickCategories = EXPENSE_CATEGORIES.slice(0, 6)

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
    background: `conic-gradient(#4CAF50 ${progressPercent.value * 3.6}deg, #e5e7eb 0deg)`,
  }
})

const compareClass = computed(() => {
  const todayExpense = recordStore.todayExpense
  if (todayExpense > yesterdayExpense.value) return 'text-danger'
  if (todayExpense < yesterdayExpense.value) return 'text-primary'
  return 'text-gray-400'
})

const compareText = computed(() => {
  const todayExpense = recordStore.todayExpense
  const diff = todayExpense - yesterdayExpense.value
  if (diff > 0) return `+¥${formatAmount(diff)}`
  if (diff < 0) return `-¥${formatAmount(Math.abs(diff))}`
  return '持平'
})

// 方法
const quickRecord = (category: typeof EXPENSE_CATEGORIES[0]) => {
  editingRecord.value = null
  showRecordModal.value = true
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

onMounted(() => {
  recordStore.initRecords()
})
</script>

<style>
/* UnoCSS 样式在 app.wxss 中全局提供 */
</style>
