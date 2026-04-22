<template>
  <view class="annual-report-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="year-selector">
        <u-icon name="arrow-left" size="24" color="rgba(255,255,255,0.8)" @click="changeYear(-1)"></u-icon>
        <picker
          mode="date"
          fields="year"
          :value="String(currentYear)"
          @change="onYearChange"
        >
          <u-text :text="`${currentYear}年`" size="20" color="#fff" bold></u-text>
        </picker>
        <u-icon name="arrow-right" size="24" color="rgba(255,255,255,0.8)" @click="changeYear(1)"></u-icon>
      </view>
      <u-text text="年度报告" size="20" color="rgba(255,255,255,0.8)"></u-text>
    </view>

    <scroll-view class="report-content" scroll-y>
      <!-- 总览卡片 -->
      <view class="overview-cards">
        <view class="overview-card expense" @click="showExpenseDetail = true">
          <u-icon name="red-packet" size="20" color="#ff5252"></u-icon>
          <view class="card-info">
            <u-text text="日常消费" size="24" color="#999"></u-text>
            <u-text :text="`¥${formatAmount(totalExpense)}`" size="20" color="#333" bold></u-text>
          </view>
          <u-icon name="arrow-right" size="20" color="#ccc"></u-icon>
        </view>

        <view class="overview-card fund" @click="showFundDetail = true">
          <u-icon name="rmb-circle" size="20" color="#4CAF50"></u-icon>
          <view class="card-info">
            <u-text text="资金池存入" size="24" color="#999"></u-text>
            <u-text :text="`¥${formatAmount(totalFundDeposit)}`" size="20" color="#333" bold></u-text>
          </view>
          <u-icon name="arrow-right" size="20" color="#ccc"></u-icon>
        </view>
      </view>

      <!-- 月度消费趋势 -->
      <view class="chart-section">
        <u-text text="月度消费趋势" size="20" color="#333" bold class="section-title"></u-text>
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
            <u-text text="暂无数据" size="20" color="#999"></u-text>
          </view>
        </view>
      </view>

      <!-- 消费分类排行 -->
      <view class="category-section">
        <u-text text="消费分类排行" size="20" color="#333" bold class="section-title"></u-text>
        <view class="category-list" v-if="categoryStats.length > 0">
          <view
            v-for="(item, index) in categoryStats.slice(0, 8)"
            :key="item.categoryId"
            class="category-item"
          >
            <u-text :text="String(index + 1)" size="20" color="#999" bold class="rank"></u-text>
            <view
              class="icon"
              :style="{ backgroundColor: item.categoryColor + '20' }"
            >
              <u-icon :name="item.categoryIcon" size="20" :color="item.categoryColor"></u-icon>
            </view>
            <view class="info">
              <u-text :text="item.categoryName" size="20" color="#333"></u-text>
              <u-line-progress
                :percentage="item.percentage"
                :active-color="item.categoryColor"
                height="8"
                :show-percent="false"
              />
            </view>
            <view class="amount">
              <u-text :text="`¥${formatAmount(item.amount)}`" size="20" color="#333" bold></u-text>
              <u-text :text="`${item.percentage}%`" size="22" color="#999"></u-text>
            </view>
          </view>
        </view>
        <view class="empty-list" v-else>
          <u-text text="暂无消费数据" size="20" color="#999"></u-text>
        </view>
      </view>

      <!-- 资金池总结 -->
      <view class="fund-section" v-if="fundStats.length > 0">
        <u-text text="资金池总结" size="20" color="#333" bold class="section-title"></u-text>
        <view class="fund-list">
          <view
            v-for="fund in fundStats"
            :key="fund.fundId"
            class="fund-item"
          >
            <view class="fund-header">
              <u-text :text="fund.fundName" size="20" color="#333" bold></u-text>
              <u-tag
                :text="fund.status === 'active' ? '进行中' : '已完成'"
                :type="fund.status === 'active' ? 'success' : 'warning'"
                size="mini"
              />
            </view>
            <view class="fund-progress">
              <view class="progress-info">
                <u-text :text="`目标: ¥${formatAmount(fund.targetAmount)}`" size="24" color="#666"></u-text>
                <u-text :text="`已存: ¥${formatAmount(fund.currentAmount)}`" size="24" color="#666"></u-text>
              </view>
              <u-line-progress
                :percentage="Math.min(Math.round((fund.currentAmount / fund.targetAmount) * 100), 100)"
                active-color="#4CAF50"
                height="8"
                :show-percent="false"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 分享按钮 -->
      <view class="share-section">
        <u-button
          text="分享报告"
          shape="circle"
          size="large"
          color="linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
          :customStyle="{ boxShadow: '0 8rpx 24rpx rgba(76, 175, 80, 0.3)' }"
          @click="shareReport"
        />
      </view>
    </scroll-view>

    <!-- 消费详情弹窗 -->
    <u-popup
      :show="showExpenseDetail"
      mode="bottom"
      :round="32"
      @close="showExpenseDetail = false"
      bgColor="#fff"
      :zIndex="1000"
      :customStyle="{ maxHeight: '70vh' }"
    >
      <view class="modal-content">
        <view class="modal-header">
          <u-text text="消费明细" size="20" color="#333" bold></u-text>
          <u-icon name="close" size="24" color="#999" @click="showExpenseDetail = false"></u-icon>
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
                <u-icon :name="item.categoryIcon" size="20" :color="item.categoryColor"></u-icon>
              </view>
              <view class="info">
                <u-text :text="item.categoryName" size="20" color="#333"></u-text>
                <u-text :text="`${item.count}笔`" size="24" color="#999"></u-text>
              </view>
              <u-text :text="`¥${formatAmount(item.amount)}`" size="20" color="#333" bold></u-text>
            </view>
          </view>
        </scroll-view>
      </view>
    </u-popup>

    <!-- 资金池详情弹窗 -->
    <u-popup
      :show="showFundDetail"
      mode="bottom"
      :round="32"
      @close="showFundDetail = false"
      bgColor="#fff"
      :zIndex="1000"
      :customStyle="{ maxHeight: '70vh' }"
    >
      <view class="modal-content">
        <view class="modal-header">
          <u-text text="资金池明细" size="20" color="#333" bold></u-text>
          <u-icon name="close" size="24" color="#999" @click="showFundDetail = false"></u-icon>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view class="detail-list">
            <view
              v-for="fund in fundStats"
              :key="fund.fundId"
              class="detail-item"
            >
              <view class="icon" style="background: #e8f5e9;">
                <u-icon name="rmb-circle" size="20" color="#4CAF50"></u-icon>
              </view>
              <view class="info">
                <u-text :text="fund.fundName" size="20" color="#333"></u-text>
                <u-text :text="`存入: ¥${formatAmount(fund.depositTotal)}`" size="24" color="#999"></u-text>
              </view>
              <u-text
                :text="`${Math.round((fund.currentAmount / fund.targetAmount) * 100)}%`"
                size="20"
                color="#4CAF50"
                bold
              ></u-text>
            </view>
          </view>
        </scroll-view>
      </view>
    </u-popup>
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
      gap: 40rpx;
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

        .card-info {
          flex: 1;
          margin: 0 16rpx;
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
          }

          .icon {
            width: 64rpx;
            height: 64rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20rpx;
          }

          .info {
            flex: 1;
          }

          .amount {
            text-align: right;
            margin-left: 20rpx;
          }
        }
      }

      .empty-list {
        padding: 60rpx;
        text-align: center;
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
          }

          .fund-progress {
            .progress-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12rpx;
            }
          }
        }
      }
    }

    .share-section {
      padding: 20rpx 0 40rpx;
    }
  }

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
          }

          .info {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
