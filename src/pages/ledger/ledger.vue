<template>
  <view class="min-h-screen bg-gray-100 flex flex-col">
    <!-- 顶部月份选择器 -->
    <view class="px-4 pt-12 pb-6" style="background: linear-gradient(135deg, #3E8FD4 0%, #2E6FA8 100%);">
      <view class="flex items-center justify-center mb-6">
        <text class="px-8 font-light" style="font-size: 48rpx; color: rgba(255,255,255,0.8);" @click="changeMonth(-1)">‹</text>
        <view class="text-center">
          <text class="block mb-1" style="font-size: 26rpx; color: rgba(255,255,255,0.8);">{{ currentYear }}年</text>
          <text class="font-semibold" style="font-size: 60rpx; color: #fff;">{{ currentMonth }}月</text>
        </view>
        <text class="px-8 font-light" style="font-size: 48rpx; color: rgba(255,255,255,0.8);" @click="changeMonth(1)">›</text>
      </view>
      <view class="text-center">
        <text class="block mb-2" style="font-size: 26rpx; color: rgba(255,255,255,0.8);">当月支出</text>
        <text class="font-bold" style="font-size: 72rpx; color: #fff;">¥{{ formatAmount(monthExpense) }}</text>
      </view>
    </view>

    <!-- 记账列表 -->
    <scroll-view
      class="flex-1 p-2"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view v-if="groupedRecords.length > 0">
        <view
          v-for="group in groupedRecords"
          :key="group.date"
          class="mb-2"
        >
          <!-- 日期分组头 -->
          <view class="flex justify-between items-center px-4 py-3 bg-white rounded-t-2xl border-b border-gray-100">
            <view class="flex items-center">
              <text class="text-xl font-semibold text-gray-800 mr-3">{{ formatDay(group.date) }}</text>
              <text class="text-sm text-gray-400">{{ formatWeek(group.date) }}</text>
            </view>
            <text class="text-base text-danger font-medium">¥{{ formatAmount(group.total) }}</text>
          </view>

          <!-- 记录列表 -->
          <view class="bg-white rounded-b-2xl overflow-hidden">
            <view
              v-for="(record, index) in group.records"
              :key="record.id"
              class="flex items-center px-4 py-3 active:bg-gray-50"
              :class="index < group.records.length - 1 ? 'border-b border-gray-100' : ''"
              @longpress="onLongPress(record)"
              @click="onRecordClick(record)"
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
                :class="record.type === 'expense' ? 'text-danger' : 'text-primary'"
              >
                {{ record.type === 'expense' ? '-' : '+' }}¥{{ formatAmount(record.amount) }}
              </text>
            </view>
          </view>
        </view>

        <view class="text-center py-6 text-gray-400 text-sm">
          <text v-if="hasMore">加载更多...</text>
          <text v-else>没有更多记录了</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="text-center py-24 px-8">
        <text class="text-8xl block mb-4">📒</text>
        <text class="text-xl text-gray-600 block mb-2">本月还没有记账</text>
        <text class="text-sm text-gray-400">点击右下角按钮开始记录</text>
      </view>
    </scroll-view>

    <!-- 悬浮记账按钮 -->
    <view
      class="fixed rounded-full flex items-center justify-center z-50"
      style="right: 48rpx; bottom: 180rpx; width: 96rpx; height: 96rpx; background: linear-gradient(135deg, #3E8FD4 0%, #2E6FA8 100%); box-shadow: 0 8rpx 24rpx rgba(184, 169, 201, 0.3);"
      @click="showRecordModal = true"
    >
      <text class="font-light" style="font-size: 48rpx; color: #fff;">+</text>
    </view>

    <!-- 操作菜单 -->
    <u-action-sheet
      :show="showActionSheet"
      :actions="actionList"
      title="选择操作"
      @close="showActionSheet = false"
      @select="onActionSelect"
    />

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
import { useRecordStore } from '@/stores/record'
import RecordModal from '@/components/RecordModal.vue'
import { formatAmount } from '@/utils/format'
import { dayjs } from '@/utils/date'
import type { Record } from '@/types'

const recordStore = useRecordStore()

const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const isRefreshing = ref(false)
const hasMore = ref(false)
const showRecordModal = ref(false)
const showActionSheet = ref(false)
const editingRecord = ref<Record | null>(null)
const selectedRecord = ref<Record | null>(null)

// 操作菜单列表
const actionList = [
  { name: '编辑', color: '#333' },
  { name: '删除', color: '#ff5252' }
]

// 计算属性
const monthRecords = computed(() => {
  return recordStore.getMonthRecords(currentYear.value, currentMonth.value)
})

const monthExpense = computed(() => {
  return monthRecords.value
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
})

const groupedRecords = computed(() => {
  const groups: { [key: string]: { date: string; total: number; records: Record[] } } = {}

  monthRecords.value.forEach(record => {
    if (!groups[record.date]) {
      groups[record.date] = {
        date: record.date,
        total: 0,
        records: [],
      }
    }
    groups[record.date].records.push(record)
    if (record.type === 'expense') {
      groups[record.date].total += record.amount
    }
  })

  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date))
})

// 方法
const changeMonth = (delta: number) => {
  const newDate = new Date(currentYear.value, currentMonth.value - 1 + delta, 1)
  currentYear.value = newDate.getFullYear()
  currentMonth.value = newDate.getMonth() + 1
}

const formatDay = (dateStr: string) => {
  const date = dayjs(dateStr)
  const today = dayjs()

  if (date.isSame(today, 'day')) return '今天'
  if (date.isSame(today.subtract(1, 'day'), 'day')) return '昨天'
  return date.format('M月D日')
}

const formatWeek = (dateStr: string) => {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekDays[dayjs(dateStr).day()]
}

const onLongPress = (record: Record) => {
  selectedRecord.value = record
  showActionSheet.value = true
}

const onRecordClick = (record: Record) => {
  // 点击记录可以查看详情或编辑
}

const onActionSelect = (action: any) => {
  if (action.name === '编辑') {
    if (selectedRecord.value) {
      editingRecord.value = selectedRecord.value
      showRecordModal.value = true
    }
  } else if (action.name === '删除') {
    if (selectedRecord.value) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        success: (res) => {
          if (res.confirm) {
            recordStore.deleteRecord(selectedRecord.value!.id)
            uni.showToast({ title: '删除成功', icon: 'success' })
          }
          selectedRecord.value = null
        },
      })
    }
  }
  showActionSheet.value = false
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

const onRefresh = () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

const onLoadMore = () => {
  // 加载更多逻辑
}

onMounted(() => {
  recordStore.initRecords()
})
</script>

<style>
/* UnoCSS 样式在 app.wxss 中全局提供 */
</style>
