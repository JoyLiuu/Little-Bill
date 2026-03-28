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
              <text class="status" :class="fund.status">
                {{ fund.status === 'active' ? '进行中' : '已完成' }}
              </text>
            </view>
            <text class="deadline">截止: {{ formatDeadline(fund.deadline) }}</text>
          </view>

          <view class="fund-progress">
            <view class="progress-info">
              <text class="current">¥{{ formatAmount(fund.currentAmount) }}</text>
              <text class="target">/ ¥{{ formatAmount(fund.targetAmount) }}</text>
            </view>
            <view class="progress-bar">
              <view
                class="progress-fill"
                :style="{ 
                  width: Math.min((fund.currentAmount / fund.targetAmount) * 100, 100) + '%',
                  backgroundColor: fund.color 
                }"
              ></view>
            </view>
            <view class="progress-detail">
              <text class="percent">{{ Math.round((fund.currentAmount / fund.targetAmount) * 100) }}%</text>
              <text class="remaining" v-if="fund.status === 'active'">
                还需 ¥{{ formatAmount(Math.max(0, fund.targetAmount - fund.currentAmount)) }}
              </text>
            </view>
          </view>

          <view class="fund-actions">
            <button
              class="btn-action deposit"
              :style="{ backgroundColor: fund.color + '20', color: fund.color }"
              @click="openOperationModal(fund, 'deposit')"
            >
              存入
            </button>
            <button
              class="btn-action withdraw"
              :disabled="fund.currentAmount <= 0"
              @click="openOperationModal(fund, 'withdraw')"
            >
              取出
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">🏦</text>
        <text class="empty-text">还没有资金池</text>
        <text class="empty-tip">点击下方按钮创建第一个资金池</text>
      </view>
    </scroll-view>

    <!-- 新建按钮 -->
    <view class="create-btn" @click="showFundModal = true">
      <text class="icon">+</text>
      <text>新建资金池</text>
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

// 方法
const formatDeadline = (deadline: string) => {
  const [year, month] = deadline.split('-')
  return `${year}年${parseInt(month)}月`
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

          .status {
            font-size: 20rpx;
            padding: 4rpx 12rpx;
            border-radius: 8rpx;
            background: #f0f0f0;
            color: #999;

            &.active {
              background: #e8f5e9;
              color: #4CAF50;
            }

            &.completed {
              background: #fff3e0;
              color: #ff9800;
            }
          }
        }

        .deadline {
          font-size: 24rpx;
          color: #999;
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

        .progress-bar {
          height: 12rpx;
          background: #f0f0f0;
          border-radius: 6rpx;
          overflow: hidden;
          margin-bottom: 12rpx;

          .progress-fill {
            height: 100%;
            border-radius: 6rpx;
            transition: width 0.3s;
          }
        }

        .progress-detail {
          display: flex;
          justify-content: space-between;

          .percent {
            font-size: 24rpx;
            color: #4CAF50;
            font-weight: 500;
          }

          .remaining {
            font-size: 24rpx;
            color: #999;
          }
        }
      }

      .fund-actions {
        display: flex;
        gap: 20rpx;

        .btn-action {
          flex: 1;
          height: 72rpx;
          border-radius: 36rpx;
          font-size: 28rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;

          &.deposit {
            &:active {
              opacity: 0.8;
            }
          }

          &.withdraw {
            background: #f5f5f5;
            color: #666;

            &:active {
              background: #e0e0e0;
            }

            &[disabled] {
              opacity: 0.5;
            }
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 120rpx 40rpx;

      .empty-icon {
        display: block;
        font-size: 100rpx;
        margin-bottom: 24rpx;
      }

      .empty-text {
        display: block;
        font-size: 32rpx;
        color: #666;
        margin-bottom: 12rpx;
      }

      .empty-tip {
        display: block;
        font-size: 26rpx;
        color: #999;
      }
    }
  }

  .create-btn {
    position: fixed;
    left: 32rpx;
    right: 32rpx;
    bottom: calc(40rpx + env(safe-area-inset-bottom));
    height: 88rpx;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);

    &:active {
      opacity: 0.9;
    }

    .icon {
      font-size: 40rpx;
      color: #fff;
      margin-right: 12rpx;
      font-weight: 300;
    }

    text {
      font-size: 32rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}
</style>
