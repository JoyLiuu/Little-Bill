<template>
  <view class="min-h-screen bg-gray-100 flex flex-col">
    <!-- 顶部日期信息 -->
    <view class="px-4 pt-12 pb-6" style="background: linear-gradient(135deg, #3E8FD4 0%, #2E6FA8 100%);">
      <view class="flex items-center mb-4">
        <u-icon name="arrow-left" size="24" color="#fff" @click="goBack"></u-icon>
        <text class="text-white text-lg font-medium ml-4">{{ formatDate(currentDate) }}</text>
      </view>
      <view class="text-center">
        <text class="block mb-2" style="font-size: 26rpx; color: rgba(255,255,255,0.8);">当日支出</text>
        <text class="font-bold" style="font-size: 72rpx; color: #fff;">¥{{ formatAmount(dayExpense) }}</text>
      </view>
    </view>

    <!-- 记录列表 -->
    <scroll-view
      class="flex-1 p-4"
      scroll-y
    >
      <view v-if="dayRecords.length > 0">
        <view class="bg-white rounded-2xl overflow-hidden">
          <view
            v-for="(record, index) in dayRecords"
            :key="record.id"
            class="flex items-center px-4 py-4"
            :class="index < dayRecords.length - 1 ? 'border-b border-gray-100' : ''"
            @longpress="onLongPress(record)"
          >
            <view
              class="w-16 h-16 rounded-full flex items-center justify-center mr-4"
              :style="{ backgroundColor: record.categoryColor + '20' }"
            >
              <u-icon :name="record.categoryIcon" size="20" :color="record.categoryColor"></u-icon>
            </view>
            <view class="flex-1">
              <text class="text-base font-medium text-gray-800 block">{{ record.categoryName }}</text>
              <text class="text-sm text-gray-400" v-if="record.remark">{{ record.remark }}</text>
              <text class="text-xs text-gray-400 mt-1">{{ formatTime(record.createTime) }}</text>
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

      <!-- 空状态 -->
      <view v-else class="text-center py-24 px-8">
        <text class="text-8xl block mb-4">📒</text>
        <text class="text-xl text-gray-600 block mb-2">当日无记账记录</text>
        <text class="text-sm text-gray-400">点击右下角按钮记一笔</text>
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

const currentDate = ref('')
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
const dayRecords = computed(() => {
  if (!currentDate.value) return []
  return recordStore.getDateRecords(currentDate.value)
})

const dayExpense = computed(() => {
  return dayRecords.value
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
})

// 方法
const formatDate = (dateStr: string) => {
  const date = dayjs(dateStr)
  const today = dayjs()
  
  if (date.isSame(today, 'day')) return '今天'
  if (date.isSame(today.subtract(1, 'day'), 'day')) return '昨天'
  return date.format('M月D日')
}

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('HH:mm')
}

const goBack = () => {
  uni.navigateBack()
}

const onLongPress = (record: Record) => {
  selectedRecord.value = record
  showActionSheet.value = true
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
    // 设置日期为当前查看的日期
    data.date = currentDate.value
    recordStore.addRecord(data)
    uni.showToast({ title: '记账成功', icon: 'success' })
  }
  editingRecord.value = null
}

onMounted(() => {
  recordStore.initRecords()
  
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const { date } = currentPage.$page?.options || currentPage.options || {}
  
  if (date) {
    currentDate.value = date
  } else {
    currentDate.value = dayjs().format('YYYY-MM-DD')
  }
})
</script>

<style>
/* UnoCSS 样式在 app.wxss 中全局提供 */
</style>
