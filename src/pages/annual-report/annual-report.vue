<template>
  <view class="annual-report-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="year-selector">
        <text class="arrow" @click="changeYear(-1)">‹</text>
        <picker
          mode="date"
          fields="year"
          :value="String(currentYear)"
          @change="onYearChange"
        >
          <text class="year-text">{{ currentYear }}年</text>
        </picker>
        <text class="arrow" @click="changeYear(1)">›</text>
      </view>
      <text class="subtitle">年度报告</text>
    </view>

    <scroll-view class="report-content" scroll-y>
      <!-- 总览卡片 -->
      <view class="overview-cards">
        <view class="overview-card expense" @click="showExpenseDetail = true">
          <view class="card-icon">💳</view>
          <view class="card-info">
            <text class="label">日常消费</text>
            <text class="amount">¥{{ formatAmount(totalExpense) }}</text>
          </view>
          <text class="arrow">›</text>
        </view>

        <view class="overview-card fund" @click="showFundDetail = true">
          <view class="card-icon">🏦</view>
          <view class="card-info">
            <text class="label">资金池存入</text>
            <text class="amount">¥{{ formatAmount(totalFundDeposit) }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 月度消费趋势 -->
      <view class="chart-section">
        <view class="section-title">月度消费趋势</view>
        <view class="chart-container">
          <view class="month-chart" v-if="monthlyStats.length > 0">
            <view
              v-for="(item, index) in monthlyStats"
              :key="index"
              class="month-bar"
            >
              <view class="bar-wrapper">
                <view
                  class="bar"
                  :style="{ height: getBarHeight(item.expense) }"
                >
                  <text class="value" v-if="item.expense > 0">
                    {{ formatShortAmount(item.expense) }}
                  </text>
                </view>
              </view>
              <text class="label">{{ item.month }}月</text>
            </view>
          </view>
          <view class="empty-chart" v-else>
            <text>暂无数据</text>
          </view>
        </view>
      </view>

      <!-- 消费分类排行 -->
      <view class="category-section">
        <view class="section-title">消费分类排行</view>
        <view class="category-list" v-if="categoryStats.length > 0">
          <view
            v-for="(item, index) in categoryStats.slice(0, 8)"
            :key="item.categoryId"
            class="category-item"
          >
            <view class="rank">{{ index + 1 }}</view>
            <view
              class="icon"
              :style="{ backgroundColor: item.categoryColor + '20' }"
            >
              <text class="iconfont" :style="{ color: item.categoryColor }">
                {{ item.categoryIcon }}
              </text>
            </view>
            <view class="info">
              <text class="name">{{ item.categoryName }}</text>
              <view class="progress-bar">
                <view
                  class="progress-fill"
                  :style="{ 
                    width: item.percentage + '%',
                    backgroundColor: item.categoryColor 
                  }"
                ></view>
              </view>
            </view>
            <view class="amount">
              <text class="value">¥{{ formatAmount(item.amount) }}</text>
              <text class="percent">{{ item.percentage }}%</text>
            </view>
          </view>
        </view>
        <view class="empty-list" v-else>
          <text>暂无消费数据</text>
        </view>
      </view>

      <!-- 资金池总结 -->
      <view class="fund-section" v-if="fundStats.length > 0">
        <view class="section-title">资金池总结</view>
        <view class="fund-list">
          <view
            v-for="fund in fundStats"
            :key="fund.fundId"
            class="fund-item"
          >
            <view class="fund-header">
              <text class="name">{{ fund.fundName }}</text>
              <text class="status" :class="fund.status">
                {{ fund.status === 'active' ? '进行中' : '已完成' }}
              </text>
            </view>
            <view class="fund-progress">
              <view class="progress-info">
                <text>目标: ¥{{ formatAmount(fund.targetAmount) }}</text>
                <text>已存: ¥{{ formatAmount(fund.currentAmount) }}</text>
              </view>
              <view class="progress-bar">
                <view
                  class="progress-fill"
                  :style="{ width: Math.min((fund.currentAmount / fund.targetAmount) * 100, 100) + '%' }"
                ></view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 分享按钮 -->
      <view class="share-section">
        <button class="btn-share" @click="shareReport">
          <text class="icon">📤</text>
          <text>分享报告</text>
        </button>
      </view>
    </scroll-view>

    <!-- 消费详情弹窗 -->
    <view class="modal" v-if="showExpenseDetail" @click="showExpenseDetail = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="title">消费明细</text>
          <text class="close" @click="showExpenseDetail = false">×</text>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view class="detail-list">
            <view
              v-for="item in categoryStats"
              :key="item.categoryId"
              class="detail-item"
            >
              <view
                class="icon"
                :style="{ backgroundColor: item.categoryColor + '20' }"
              >
                <text class="iconfont" :style="{ color: item.categoryColor }">
                  {{ item.categoryIcon }}
                </text>
              </view>
              <view class="info">
                <text class="name">{{ item.categoryName }}</text>
                <text class="count">{{ item.count }}笔</text>
              </view>
              <text class="amount">¥{{ formatAmount(item.amount) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 资金池详情弹窗 -->
    <view class="modal" v-if="showFundDetail" @click="showFundDetail = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="title">资金池明细</text>
          <text class="close" @click="showFundDetail = false">×</text>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view class="detail-list">
            <view
              v-for="fund in fundStats"
              :key="fund.fundId"
              class="detail-item"
            >
              <view class="icon" style="background: #e8f5e9;">
                <text style="color: #4CAF50;">🏦</text>
              </view>
              <view class="info">
                <text class="name">{{ fund.fundName }}</text>
                <text class="count">
                  存入: ¥{{ formatAmount(fund.depositTotal) }}
                </text>
              </view>
              <text class="amount">
                {{ Math.round((fund.currentAmount / fund.targetAmount) * 100) }}%
              </text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useFundStore } from '@/stores/fund'
import { formatAmount } from '@/utils/format'
import type { CategoryStat, MonthlyStat } from '@/types'

const recordStore = useRecordStore()
const fundStore = useFundStore()

const currentYear = ref(new Date().getFullYear())
const showExpenseDetail = ref(false)
const showFundDetail = ref(false)

// 计算属性
const totalExpense = computed(() => {
  return recordStore.getYearTotalExpense(currentYear.value)
})

const totalFundDeposit = computed(() => {
  return fundStore.getYearDepositTotal(currentYear.value)
})

const monthlyStats = computed(() => {
  return recordStore.getMonthlyStats(currentYear.value)
})

const categoryStats = computed(() => {
  return recordStore.getCategoryStats(currentYear.value)
})

const fundStats = computed(() => {
  return fundStore.allFunds.map(fund => ({
    fundId: fund.id,
    fundName: fund.name,
    targetAmount: fund.targetAmount,
    currentAmount: fund.currentAmount,
    depositTotal: fundStore.getFundOperations(fund.id)
      .filter(op => op.type === 'deposit')
      .reduce((sum, op) => sum + op.amount, 0),
    status: fund.status,
  }))
})

const maxExpense = computed(() => {
  return Math.max(...monthlyStats.value.map(m => m.expense), 1)
})

// 方法
const changeYear = (delta: number) => {
  currentYear.value += delta
}

const onYearChange = (e: any) => {
  currentYear.value = parseInt(e.detail.value)
}

const getBarHeight = (expense: number) => {
  if (maxExpense.value === 0) return '0%'
  return `${(expense / maxExpense.value) * 100}%`
}

const formatShortAmount = (amount: number) => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + 'w'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'k'
  }
  return amount.toFixed(0)
}

const shareReport = () => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
  })
}

onMounted(() => {
  recordStore.initRecords()
  fundStore.initFunds()
})
</script>

<style lang="scss" scoped>
.annual-report-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  .header {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    padding: 40rpx 32rpx;
    padding-top: 60rpx;
    text-align: center;

    .year-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;

      .arrow {
        font-size: 48rpx;
        color: rgba(255, 255, 255, 0.8);
        padding: 0 40rpx;
      }

      .year-text {
        font-size: 48rpx;
        color: #fff;
        font-weight: 600;
      }
    }

    .subtitle {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .report-content {
    flex: 1;
    padding: 20rpx;

    .overview-cards {
      display: flex;
      gap: 20rpx;
      margin-bottom: 20rpx;

      .overview-card {
        flex: 1;
        background: #fff;
        border-radius: 16rpx;
        padding: 24rpx;
        display: flex;
        align-items: center;

        &.expense {
          border-left: 8rpx solid #ff5252;
        }

        &.fund {
          border-left: 8rpx solid #4CAF50;
        }

        .card-icon {
          font-size: 48rpx;
          margin-right: 16rpx;
        }

        .card-info {
          flex: 1;

          .label {
            display: block;
            font-size: 24rpx;
            color: #999;
            margin-bottom: 8rpx;
          }

          .amount {
            display: block;
            font-size: 36rpx;
            font-weight: bold;
            color: #333;
          }
        }

        .arrow {
          font-size: 32rpx;
          color: #ccc;
        }
      }
    }

    .chart-section,
    .category-section,
    .fund-section {
      background: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;

      .section-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 24rpx;
      }
    }

    .chart-section {
      .chart-container {
        .month-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 280rpx;
          padding: 20rpx 0;

          .month-bar {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;

            .bar-wrapper {
              height: 200rpx;
              display: flex;
              align-items: flex-end;

              .bar {
                width: 32rpx;
                min-height: 4rpx;
                background: linear-gradient(180deg, #4CAF50 0%, #81C784 100%);
                border-radius: 16rpx 16rpx 0 0;
                position: relative;

                .value {
                  position: absolute;
                  top: -32rpx;
                  left: 50%;
                  transform: translateX(-50%);
                  font-size: 18rpx;
                  color: #666;
                  white-space: nowrap;
                }
              }
            }

            .label {
              font-size: 20rpx;
              color: #999;
              margin-top: 8rpx;
            }
          }
        }

        .empty-chart {
          height: 280rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }
      }
    }

    .category-section {
      .category-list {
        .category-item {
          display: flex;
          align-items: center;
          padding: 20rpx 0;
          border-bottom: 2rpx solid #f5f5f5;

          &:last-child {
            border-bottom: none;
          }

          .rank {
            width: 48rpx;
            font-size: 28rpx;
            color: #999;
            font-weight: 500;
          }

          .icon {
            width: 64rpx;
            height: 64rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20rpx;

            .iconfont {
              font-size: 32rpx;
            }
          }

          .info {
            flex: 1;

            .name {
              display: block;
              font-size: 28rpx;
              color: #333;
              margin-bottom: 8rpx;
            }

            .progress-bar {
              height: 8rpx;
              background: #f0f0f0;
              border-radius: 4rpx;
              overflow: hidden;

              .progress-fill {
                height: 100%;
                border-radius: 4rpx;
              }
            }
          }

          .amount {
            text-align: right;
            margin-left: 20rpx;

            .value {
              display: block;
              font-size: 28rpx;
              color: #333;
              font-weight: 500;
            }

            .percent {
              display: block;
              font-size: 22rpx;
              color: #999;
              margin-top: 4rpx;
            }
          }
        }
      }

      .empty-list {
        padding: 60rpx;
        text-align: center;
        color: #999;
      }
    }

    .fund-section {
      .fund-list {
        .fund-item {
          padding: 20rpx 0;
          border-bottom: 2rpx solid #f5f5f5;

          &:last-child {
            border-bottom: none;
          }

          .fund-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16rpx;

            .name {
              font-size: 30rpx;
              color: #333;
              font-weight: 500;
            }

            .status {
              font-size: 22rpx;
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

          .fund-progress {
            .progress-info {
              display: flex;
              justify-content: space-between;
              font-size: 24rpx;
              color: #666;
              margin-bottom: 12rpx;
            }

            .progress-bar {
              height: 8rpx;
              background: #f0f0f0;
              border-radius: 4rpx;
              overflow: hidden;

              .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50 0%, #81C784 100%);
                border-radius: 4rpx;
              }
            }
          }
        }
      }
    }

    .share-section {
      padding: 20rpx 0 40rpx;

      .btn-share {
        width: 100%;
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
          font-size: 32rpx;
          margin-right: 12rpx;
        }

        text {
          font-size: 32rpx;
          color: #fff;
          font-weight: 500;
        }
      }
    }
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-end;

    .modal-content {
      width: 100%;
      max-height: 70vh;
      background: #fff;
      border-radius: 32rpx 32rpx 0 0;
      display: flex;
      flex-direction: column;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 32rpx;
        border-bottom: 2rpx solid #f5f5f5;

        .title {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
        }

        .close {
          font-size: 48rpx;
          color: #999;
        }
      }

      .modal-body {
        flex: 1;
        padding: 24rpx;
        overflow-y: auto;

        .detail-list {
          .detail-item {
            display: flex;
            align-items: center;
            padding: 24rpx 0;
            border-bottom: 2rpx solid #f5f5f5;

            &:last-child {
              border-bottom: none;
            }

            .icon {
              width: 72rpx;
              height: 72rpx;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 20rpx;

              .iconfont {
                font-size: 36rpx;
              }
            }

            .info {
              flex: 1;

              .name {
                display: block;
                font-size: 30rpx;
                color: #333;
                margin-bottom: 4rpx;
              }

              .count {
                font-size: 24rpx;
                color: #999;
              }
            }

            .amount {
              font-size: 32rpx;
              color: #333;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}
</style>
