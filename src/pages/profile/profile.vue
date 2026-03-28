<template>
  <view class="profile-page">
    <!-- 用户信息 -->
    <view class="header">
      <view class="user-card">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatarUrl || '/static/default-avatar.png'"
          mode="aspectFill"
          @click="chooseAvatar"
        />
        <view class="user-info">
          <text class="nickname">{{ userStore.userInfo?.nickName || '记账用户' }}</text>
          <text class="register-time" v-if="userStore.userInfo?.registerTime">
            注册于 {{ formatRegisterTime(userStore.userInfo.registerTime) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="showBudgetModal = true">
          <view class="icon-wrapper" style="background: #e3f2fd;">
            <text class="icon" style="color: #2196f3;">💰</text>
          </view>
          <text class="label">预算设置</text>
          <text class="value">¥{{ userStore.monthlyBudget }}/月</text>
          <text class="arrow">›</text>
        </view>

        <view class="menu-item" @click="goToAnnualReport">
          <view class="icon-wrapper" style="background: #fff3e0;">
            <text class="icon" style="color: #ff9800;">📊</text>
          </view>
          <text class="label">年度报告</text>
          <text class="arrow">›</text>
        </view>

        <view class="menu-item" @click="showCategories = true">
          <view class="icon-wrapper" style="background: #f3e5f5;">
            <text class="icon" style="color: #9c27b0;">🏷️</text>
          </view>
          <text class="label">分类管理</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="exportData">
          <view class="icon-wrapper" style="background: #e8f5e9;">
            <text class="icon" style="color: #4caf50;">📥</text>
          </view>
          <text class="label">数据导出</text>
          <text class="arrow">›</text>
        </view>

        <view class="menu-item" @click="showHelp = true">
          <view class="icon-wrapper" style="background: #e0f2f1;">
            <text class="icon" style="color: #009688;">❓</text>
          </view>
          <text class="label">使用帮助</text>
          <text class="arrow">›</text>
        </view>

        <view class="menu-item" @click="showAbout = true">
          <view class="icon-wrapper" style="background: #eceff1;">
            <text class="icon" style="color: #607d8b;">ℹ️</text>
          </view>
          <text class="label">关于我们</text>
          <text class="value">v1.0.0</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="btn-logout" @click="logout">退出登录</button>
    </view>

    <!-- 预算设置弹窗 -->
    <view class="modal" v-if="showBudgetModal" @click="showBudgetModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="title">设置月预算</text>
          <text class="close" @click="showBudgetModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="budget-input">
            <text class="currency">¥</text>
            <input
              type="digit"
              v-model="budgetInput"
              placeholder="请输入月预算金额"
              focus
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-confirm" @click="saveBudget">确定</button>
        </view>
      </view>
    </view>

    <!-- 分类管理弹窗 -->
    <view class="modal" v-if="showCategories" @click="showCategories = false">
      <view class="modal-content categories-modal" @click.stop>
        <view class="modal-header">
          <text class="title">分类管理</text>
          <text class="close" @click="showCategories = false">×</text>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view class="category-section">
            <text class="section-title">支出分类</text>
            <view class="category-grid">
              <view
                v-for="cat in EXPENSE_CATEGORIES"
                :key="cat.id"
                class="category-item"
              >
                <view
                  class="icon"
                  :style="{ backgroundColor: cat.color + '20', color: cat.color }"
                >
                  <text class="iconfont">{{ cat.icon }}</text>
                </view>
                <text class="name">{{ cat.name }}</text>
              </view>
            </view>
          </view>
          <view class="category-section">
            <text class="section-title">收入分类</text>
            <view class="category-grid">
              <view
                v-for="cat in INCOME_CATEGORIES"
                :key="cat.id"
                class="category-item"
              >
                <view
                  class="icon"
                  :style="{ backgroundColor: cat.color + '20', color: cat.color }"
                >
                  <text class="iconfont">{{ cat.icon }}</text>
                </view>
                <text class="name">{{ cat.name }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 帮助弹窗 -->
    <view class="modal" v-if="showHelp" @click="showHelp = false">
      <view class="modal-content help-modal" @click.stop>
        <view class="modal-header">
          <text class="title">使用帮助</text>
          <text class="close" @click="showHelp = false">×</text>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view class="help-content">
            <view class="help-item">
              <text class="question">如何记账？</text>
              <text class="answer">点击首页的"记一笔"按钮，选择分类、输入金额即可快速记账。</text>
            </view>
            <view class="help-item">
              <text class="question">如何设置预算？</text>
              <text class="answer">在"我的"页面点击"预算设置"，输入每月预算金额即可。</text>
            </view>
            <view class="help-item">
              <text class="question">资金池是什么？</text>
              <text class="answer">资金池用于管理储蓄目标，可以设定目标金额和截止日期，追踪储蓄进度。</text>
            </view>
            <view class="help-item">
              <text class="question">数据会丢失吗？</text>
              <text class="answer">数据存储在本地，建议定期导出备份。</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 关于弹窗 -->
    <view class="modal" v-if="showAbout" @click="showAbout = false">
      <view class="modal-content about-modal" @click.stop>
        <view class="modal-header">
          <text class="title">关于我们</text>
          <text class="close" @click="showAbout = false">×</text>
        </view>
        <view class="modal-body">
          <view class="about-content">
            <text class="app-name">记账小程序</text>
            <text class="version">版本 1.0.0</text>
            <text class="description">简单好用的个人记账工具，帮助您轻松管理财务。</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/utils/constants'

const userStore = useUserStore()

const showBudgetModal = ref(false)
const showCategories = ref(false)
const showHelp = ref(false)
const showAbout = ref(false)
const budgetInput = ref('')

// 方法
const formatRegisterTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const userInfo = userStore.userInfo || { nickName: '记账用户', registerTime: Date.now() }
      userStore.setUserInfo({
        ...userInfo,
        avatarUrl: res.tempFilePaths[0],
      })
      uni.showToast({ title: '头像已更新', icon: 'success' })
    },
  })
}

const saveBudget = () => {
  const budget = parseFloat(budgetInput.value)
  if (budget > 0) {
    userStore.setMonthlyBudget(budget)
    showBudgetModal.value = false
    uni.showToast({ title: '设置成功', icon: 'success' })
  } else {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
  }
}

const goToAnnualReport = () => {
  uni.navigateTo({ url: '/pages/annual-report/annual-report' })
}

const exportData = () => {
  uni.showModal({
    title: '数据导出',
    content: '导出功能开发中，敬请期待',
    showCancel: false,
  })
}

const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    },
  })
}

onMounted(() => {
  budgetInput.value = userStore.monthlyBudget.toString()
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;

  .header {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    padding: 60rpx 32rpx;

    .user-card {
      display: flex;
      align-items: center;

      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        margin-right: 24rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
      }

      .user-info {
        .nickname {
          display: block;
          font-size: 40rpx;
          color: #fff;
          font-weight: 600;
          margin-bottom: 8rpx;
        }

        .register-time {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .menu-section {
    padding: 20rpx;

    .menu-group {
      background: #fff;
      border-radius: 16rpx;
      margin-bottom: 20rpx;
      overflow: hidden;

      .menu-item {
        display: flex;
        align-items: center;
        padding: 28rpx 24rpx;
        border-bottom: 2rpx solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background: #f9f9f9;
        }

        .icon-wrapper {
          width: 64rpx;
          height: 64rpx;
          border-radius: 16rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20rpx;

          .icon {
            font-size: 32rpx;
          }
        }

        .label {
          flex: 1;
          font-size: 30rpx;
          color: #333;
        }

        .value {
          font-size: 26rpx;
          color: #999;
          margin-right: 16rpx;
        }

        .arrow {
          font-size: 32rpx;
          color: #ccc;
        }
      }
    }
  }

  .logout-section {
    padding: 20rpx;

    .btn-logout {
      width: 100%;
      height: 88rpx;
      background: #fff;
      border-radius: 16rpx;
      font-size: 30rpx;
      color: #ff5252;
      display: flex;
      align-items: center;
      justify-content: center;

      &:active {
        background: #f9f9f9;
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
      background: #fff;
      border-radius: 32rpx 32rpx 0 0;

      &.categories-modal,
      &.help-modal {
        max-height: 80vh;
        display: flex;
        flex-direction: column;
      }

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
        padding: 32rpx;

        .budget-input {
          display: flex;
          align-items: center;
          padding: 24rpx 0;
          border-bottom: 2rpx solid #e0e0e0;

          .currency {
            font-size: 48rpx;
            color: #333;
            margin-right: 16rpx;
          }

          input {
            flex: 1;
            font-size: 48rpx;
            color: #333;
          }
        }

        .category-section {
          margin-bottom: 32rpx;

          .section-title {
            display: block;
            font-size: 28rpx;
            color: #666;
            margin-bottom: 20rpx;
          }

          .category-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20rpx;

            .category-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 16rpx;

              .icon {
                width: 80rpx;
                height: 80rpx;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 12rpx;

                .iconfont {
                  font-size: 36rpx;
                }
              }

              .name {
                font-size: 24rpx;
                color: #666;
              }
            }
          }
        }

        .help-content {
          .help-item {
            margin-bottom: 32rpx;

            .question {
              display: block;
              font-size: 30rpx;
              font-weight: 600;
              color: #333;
              margin-bottom: 12rpx;
            }

            .answer {
              display: block;
              font-size: 28rpx;
              color: #666;
              line-height: 1.6;
            }
          }
        }

        .about-content {
          text-align: center;
          padding: 40rpx;

          .app-name {
            display: block;
            font-size: 40rpx;
            font-weight: 600;
            color: #333;
            margin-bottom: 16rpx;
          }

          .version {
            display: block;
            font-size: 28rpx;
            color: #999;
            margin-bottom: 32rpx;
          }

          .description {
            display: block;
            font-size: 28rpx;
            color: #666;
            line-height: 1.6;
          }
        }
      }

      .modal-footer {
        padding: 24rpx 32rpx;
        padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
        border-top: 2rpx solid #f5f5f5;

        .btn-confirm {
          width: 100%;
          height: 88rpx;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          border-radius: 44rpx;
          font-size: 32rpx;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}
</style>
