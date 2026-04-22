<template>
  <view class="funds-page">
    <!-- 顶部总览 -->
    <view class="header">
      <view class="overview-card">
        <view class="overview-item">
          <text class="label">总投入</text>
          <text class="value">¥{{ formatAmount(totalInvested) }}</text>
        </view>
        <view class="divider"></view>
        <view class="overview-item">
          <text class="label">资金池</text>
          <text class="value">{{ fundStats.total }}/{{ fundStats.active }}/{{ fundStats.completed }}</text>
          <text class="sub-label">总/进行中/已完成</text>
        </view>
      </view>
    </view>

    <!-- 资金池列表 -->
    <scroll-view class="funds-list" scroll-y>
      <view v-if="allFunds.length > 0">
        <view
          v-for="fund in allFunds"
          :key="fund.id"
          class="fund-card"
          :style="{ borderLeftColor: fund.color }"
        >
          <view class="fund-header">
            <view class="fund-title">
              <view class="color-dot" :style="{ backgroundColor: fund.color }"></view>
              <text class="name">{{ fund.name }}</text>
              <u-tag
                :text="fund.status === 'active' ? '进行中' : '已完成'"
                :type="fund.status === 'active' ? 'success' : 'warning'"
                size="mini"
              />
            </view>
          </view>

          <view class="fund-progress">
            <view class="progress-info">
              <text class="current">¥{{ formatAmount(fund.currentAmount) }}</text>
              <text class="target">/ ¥{{ formatAmount(fund.targetAmount) }}</text>
            </view>
            <u-line-progress
              :percentage="Math.min(Math.round((fund.currentAmount / fund.targetAmount) * 100), 100)"
              :active-color="fund.color"
              height="12"
              :show-percent="false"
            />
            <view class="progress-detail">
              <u-text
                :text="`${Math.round((fund.currentAmount / fund.targetAmount) * 100)}%`"
                size="24"
                :color="fund.color"
                bold
              />
              <u-text
                v-if="fund.status === 'active'"
                :text="`还需 ¥${formatAmount(Math.max(0, fund.targetAmount - fund.currentAmount))}`"
                size="24"
                color="#999"
              />
            </view>
          </view>

          <view class="fund-actions">
            <u-button
              :text="'存入'"
              size="small"
              :color="fund.color"
              shape="circle"
              @click="openOperationModal(fund, 'deposit')"
            />
            <u-button
              :text="'取出'"
              size="small"
              type="info"
              shape="circle"
              :disabled="fund.currentAmount <= 0"
              @click="openOperationModal(fund, 'withdraw')"
            />
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <u-icon name="rmb-circle" size="100" color="#ccc"></u-icon>
        <u-text text="还没有资金池" size="20" color="#666" bold class="mt-4"></u-text>
        <u-text text="点击下方按钮创建第一个资金池" size="26" color="#999" class="mt-2"></u-text>
      </view>
    </scroll-view>

    <!-- 新建按钮 -->
    <u-button
      :text="'新建资金池'"
      size="large"
      color="linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
      shape="circle"
      :customStyle="createBtnStyle"
      @click="showFundModal = true"
    />

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

const createBtnStyle = {
  position: 'fixed',
  left: '32rpx',
  right: '32rpx',
  bottom: 'calc(40rpx + env(safe-area-inset-bottom))',
  boxShadow: '0 8rpx 24rpx rgba(76, 175, 80, 0.3)'
}



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

<style lang="scss" scoped>
.funds-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  .header {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    padding: 40rpx 32rpx;
    padding-top: 60rpx;

    .overview-card {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 16rpx;
      padding: 32rpx;
      display: flex;
      align-items: center;

      .overview-item {
        flex: 1;
        text-align: center;

        .label {
          display: block;
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 12rpx;
        }

        .value {
          display: block;
          font-size: 48rpx;
          color: #fff;
          font-weight: bold;
          margin-bottom: 4rpx;
        }

        .sub-label {
          font-size: 20rpx;
          color: rgba(255, 255, 255, 0.6);
        }
      }

      .divider {
        width: 2rpx;
        height: 80rpx;
        background: rgba(255, 255, 255, 0.2);
        margin: 0 32rpx;
      }
    }
  }

  .funds-list {
    flex: 1;
    padding: 20rpx;

    .fund-card {
      background: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;
      border-left: 8rpx solid;

      .fund-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;

        .fund-title {
          display: flex;
          align-items: center;

          .color-dot {
            width: 16rpx;
            height: 16rpx;
            border-radius: 50%;
            margin-right: 12rpx;
          }

          .name {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
            margin-right: 12rpx;
          }
        }
      }

      .fund-progress {
        margin-bottom: 24rpx;

        .progress-info {
          margin-bottom: 12rpx;

          .current {
            font-size: 40rpx;
            font-weight: bold;
            color: #333;
          }

          .target {
            font-size: 28rpx;
            color: #999;
          }
        }

        .progress-detail {
          display: flex;
          justify-content: space-between;
          margin-top: 12rpx;
        }
      }

      .fund-actions {
        display: flex;
        gap: 20rpx;
      }
    }

    .empty-state {
      text-align: center;
      padding: 120rpx 40rpx;
    }
  }
}
</style>
