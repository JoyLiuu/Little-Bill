<template>
  <view class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部总览卡片 -->
    <view class="px-4 pt-12 pb-6" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">
      <view class="bg-white/15 rounded-2xl p-6 flex items-center">
        <!-- 总投入 -->
        <view class="flex-1 text-center">
          <text class="text-sm text-white/80 block mb-2">总投入</text>
          <text class="text-3xl font-bold text-white">¥{{ formatAmount(totalInvested) }}</text>
        </view>
        <!-- 分隔线 -->
        <view class="w-px h-16 bg-white/20 mx-4"></view>
        <!-- 资金池统计 -->
        <view class="flex-1 text-center">
          <text class="text-sm text-white/80 block mb-2">资金池</text>
          <text class="text-3xl font-bold text-white">{{ fundStats.total }}/{{ fundStats.active }}/{{ fundStats.completed }}</text>
          <text class="text-xs text-white/60 block mt-1">总/进行中/已完成</text>
        </view>
      </view>
    </view>

    <!-- 资金池列表 -->
    <scroll-view class="flex-1 px-4 py-4" scroll-y>
      <view v-if="allFunds.length > 0">
        <view
          v-for="fund in allFunds"
          :key="fund.id"
          class="bg-white rounded-2xl p-5 mb-4"
          :style="{ borderLeftWidth: '4rpx', borderLeftColor: fund.color, borderLeftStyle: 'solid' }"
        >
          <!-- 标题行 -->
          <view class="flex items-center justify-between mb-4">
            <view class="flex items-center">
              <view class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: fund.color }"></view>
              <text class="text-base font-semibold text-gray-800">{{ fund.name }}</text>
              <view 
                class="ml-2 px-2 py-0.5 rounded text-xs"
                :class="fund.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'"
              >
                {{ fund.status === 'active' ? '进行中' : '已完成' }}
              </view>
            </view>
          </view>

          <!-- 进度信息 -->
          <view class="mb-3">
            <view class="flex items-baseline mb-2">
              <text class="text-2xl font-bold text-gray-800">¥{{ formatAmount(fund.currentAmount) }}</text>
              <text class="text-sm text-gray-400 ml-2">/ ¥{{ formatAmount(fund.targetAmount) }}</text>
            </view>
            <!-- 进度条 -->
            <view class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <view 
                class="h-full rounded-full transition-all"
                :style="{ 
                  width: Math.min(Math.round((fund.currentAmount / fund.targetAmount) * 100), 100) + '%',
                  backgroundColor: fund.color 
                }"
              ></view>
            </view>
            <view class="flex justify-between mt-2">
              <text class="text-sm font-medium" :style="{ color: fund.color }">
                {{ Math.round((fund.currentAmount / fund.targetAmount) * 100) }}%
              </text>
              <text v-if="fund.status === 'active'" class="text-xs text-gray-400">
                还需 ¥{{ formatAmount(Math.max(0, fund.targetAmount - fund.currentAmount)) }}
              </text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="flex gap-3">
            <view
              class="flex-1 py-2 rounded-full text-center text-sm text-white"
              :style="{ backgroundColor: fund.color }"
              @click="openOperationModal(fund, 'deposit')"
            >
              存入
            </view>
            <view
              class="flex-1 py-2 rounded-full text-center text-sm bg-gray-100 text-gray-600"
              :class="{ 'opacity-50': fund.currentAmount <= 0 }"
              @click="fund.currentAmount > 0 && openOperationModal(fund, 'withdraw')"
            >
              取出
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="flex flex-col items-center justify-center py-24">
        <view class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-6">
          <text class="text-5xl text-gray-400">¥</text>
        </view>
        <text class="text-lg font-medium text-gray-700 mb-2">还没有资金池</text>
        <text class="text-sm text-gray-400">点击下方按钮创建第一个资金池</text>
      </view>
    </scroll-view>

    <!-- 底部新建按钮 -->
    <view class="px-4 pb-6 pt-2 bg-gray-50">
      <view
        class="w-full py-4 rounded-full text-center text-white font-medium"
        style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);"
        @click="showFundModal = true"
      >
        新建资金池
      </view>
    </view>

    <!-- 资金池弹窗 -->
    <FundModal
      v-model:visible="showFundModal"
      :fund="editingFund"
      @save="onSaveFund"
    />

    <!-- 操作弹窗 -->
    <FundOperationModal
      v-model:visible="showOperationModal"
      :fund="selectedFund"
      :operation-type="operationType"
      @confirm="onOperationConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFundStore } from '@/stores/fund'
import FundModal from '@/components/FundModal.vue'
import FundOperationModal from '@/components/FundOperationModal.vue'
import { formatAmount } from '@/utils/format'
import type { FundPool } from '@/types'

const fundStore = useFundStore()

const showFundModal = ref(false)
const showOperationModal = ref(false)
const editingFund = ref<FundPool | null>(null)
const selectedFund = ref<FundPool | null>(null)
const operationType = ref<'deposit' | 'withdraw'>('deposit')

// 计算属性
const allFunds = computed(() => fundStore.allFunds)
const totalInvested = computed(() => fundStore.totalInvested)

const fundStats = computed(() => {
  const total = allFunds.value.length
  const active = allFunds.value.filter(f => f.status === 'active').length
  const completed = allFunds.value.filter(f => f.status === 'completed').length
  return { total, active, completed }
})

const openOperationModal = (fund: FundPool, type: 'deposit' | 'withdraw') => {
  selectedFund.value = fund
  operationType.value = type
  showOperationModal.value = true
}

const onSaveFund = (data: any) => {
  if (data.id) {
    fundStore.updateFund(data.id, data)
    uni.showToast({ title: '修改成功', icon: 'success' })
  } else {
    fundStore.addFund(data)
    uni.showToast({ title: '创建成功', icon: 'success' })
  }
  editingFund.value = null
}

const onOperationConfirm = (data: { amount: number; remark: string }) => {
  if (!selectedFund.value) return

  if (operationType.value === 'deposit') {
    fundStore.deposit(selectedFund.value.id, data.amount, data.remark)
    uni.showToast({ title: '存入成功', icon: 'success' })
  } else {
    const success = fundStore.withdraw(selectedFund.value.id, data.amount, data.remark)
    if (success) {
      uni.showToast({ title: '取出成功', icon: 'success' })
    } else {
      uni.showToast({ title: '余额不足', icon: 'none' })
    }
  }
  selectedFund.value = null
}

onMounted(() => {
  fundStore.initFunds()
})
</script>
