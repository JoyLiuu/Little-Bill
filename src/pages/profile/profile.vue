<template>
  <view class="profile-page">
    <!-- 未登录状态 -->
    <view v-if="!userStore.isLoggedIn" class="login-container">
      <view class="login-card">
        <view class="login-icon">
          <u-icon name="account-fill" size="80" color="#3E8FD4" />
        </view>
        <text class="login-title">欢迎使用记账小程序</text>
        <text class="login-subtitle">登录后可同步数据，享受更多功能</text>
        <view class="login-features">
          <view class="feature-item">
            <u-icon name="cloud" size="20" color="#3E8FD4" />
            <text>数据云端备份</text>
          </view>
          <view class="feature-item">
            <u-icon name="chart" size="20" color="#3E8FD4" />
            <text>智能财务分析</text>
          </view>
          <view class="feature-item">
            <u-icon name="lock" size="20" color="#3E8FD4" />
            <text>隐私安全保护</text>
          </view>
        </view>
        <u-button
          text="微信一键登录"
          shape="circle"
          size="large"
          :color="'linear-gradient(135deg, #3E8FD4 0%, #2E6FA8 100%)'"
          @click="handleLogin"
        >
          <template #icon>
            <u-icon name="weixin-fill" size="20" color="#fff" />
          </template>
        </u-button>
        <text class="login-tips">点击登录即表示您同意《用户协议》和《隐私政策》</text>
      </view>
    </view>

    <!-- 已登录状态 -->
    <template v-else>
      <!-- 用户信息 -->
      <view class="header">
        <view class="user-card">
          <u-avatar
            :src="userStore.userInfo?.avatarUrl || '/static/default-avatar.png'"
            size="120"
            @click="chooseAvatar"
          />
          <view class="user-info">
          <u-text :text="userStore.userInfo?.nickName || '记账用户'" size="20" color="#fff" bold></u-text>
          <u-text
            v-if="userStore.userInfo?.registerTime"
            :text="`注册于 ${formatRegisterTime(userStore.userInfo.registerTime)}`"
            size="22"
            color="rgba(255,255,255,0.8)"
          />
        </view>
        </view>
      </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <u-cell-group>
        <u-cell
          title="月预算"
          :value="`¥${userStore.monthlyBudget}`"
          @click="showBudgetModal = true"
        >
          <template #icon>
            <u-icon name="rmb-circle" size="20" color="#3E8FD4" />
          </template>
        </u-cell>
        <u-cell
          title="支出分类"
          isLink
          @click="showCategories = true"
        >
          <template #icon>
            <u-icon name="tags" size="20" color="#3E8FD4" />
          </template>
        </u-cell>
      </u-cell-group>

      <u-cell-group class="mt-4">
        <u-cell
          title="使用帮助"
          isLink
          @click="showHelp = true"
        >
          <template #icon>
            <u-icon name="question-circle" size="20" color="#009688" />
          </template>
        </u-cell>
      </u-cell-group>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <u-button
        text="退出登录"
        type="error"
        shape="circle"
        size="large"
        @click="logout"
      />
    </view>

    <!-- 预算设置弹窗 -->
    <u-popup
      :show="showBudgetModal"
      mode="bottom"
      :round="32"
      @close="showBudgetModal = false"
      bgColor="#fff"
      :zIndex="1000"
    >
      <view class="modal-content">
        <view class="modal-header">
          <u-text text="月预算" size="20" color="#333" bold></u-text>
          <u-icon name="close" size="24" color="#999" @click="showBudgetModal = false"></u-icon>
        </view>
        <view class="modal-body">
          <view class="budget-input">
            <text class="currency">¥</text>
            <u-input
              v-model="budgetInput"
              type="digit"
              placeholder="请输入月预算金额"
              border="none"
              fontSize="48rpx"
              :focus="true"
            />
          </view>
        </view>
        <view class="modal-footer">
          <u-button
            text="确定"
            shape="circle"
            size="large"
            color="linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
            @click="saveBudget"
          />
        </view>
      </view>
    </u-popup>

    <!-- 分类管理弹窗 -->
    <u-popup
      :show="showCategories"
      mode="bottom"
      :round="32"
      @close="showCategories = false"
      bgColor="#fff"
      :zIndex="1000"
      :customStyle="{ maxHeight: '60vh' }"
    >
      <view class="modal-content categories-modal">
        <view class="modal-header">
          <u-text text="支出分类" size="20" color="#333" bold></u-text>
          <u-icon name="close" size="24" color="#999" @click="showCategories = false"></u-icon>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <u-grid :col="4" :border="false">
            <u-grid-item v-for="cat in EXPENSE_CATEGORIES" :key="cat.id">
              <view
                class="category-icon"
                :style="{ backgroundColor: cat.color + '20' }"
              >
                <u-icon :name="cat.icon" size="20" :color="cat.color"></u-icon>
              </view>
              <u-text :text="cat.name" size="22" color="#666" align="center"></u-text>
            </u-grid-item>
          </u-grid>
        </scroll-view>
      </view>
    </u-popup>

    <!-- 帮助弹窗 -->
    <u-popup
      :show="showHelp"
      mode="center"
      :round="24"
      @close="showHelp = false"
      bgColor="#fff"
      :zIndex="1000"
      :customStyle="{ width: '80%', maxHeight: '60vh' }"
    >
      <view class="modal-content help-modal">
        <view class="modal-header">
          <u-text text="使用帮助" size="20" color="#333" bold></u-text>
          <u-icon name="close" size="24" color="#999" @click="showHelp = false"></u-icon>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view class="help-content">
            <view class="help-item">
              <u-text text="快速记账" size="26" color="#333" bold></u-text>
              <u-text text="点击首页「记一笔」，选择分类输入金额即可。" size="24" color="#666" class="mt-2"></u-text>
            </view>
            <view class="help-item">
              <u-text text="设置预算" size="26" color="#333" bold></u-text>
              <u-text text="在「我的」页面点击「预算设置」输入金额。" size="24" color="#666" class="mt-2"></u-text>
            </view>
          </view>
        </scroll-view>
      </view>
    </u-popup>

    <!-- 关于弹窗 -->
    <u-popup
      :show="showAbout"
      mode="center"
      :round="24"
      @close="showAbout = false"
      bgColor="#fff"
      :zIndex="1000"
      :customStyle="{ width: '70%' }"
    >
      <view class="modal-content about-modal">
        <view class="modal-header">
          <u-text text="关于我们" size="20" color="#333" bold></u-text>
          <u-icon name="close" size="24" color="#999" @click="showAbout = false"></u-icon>
        </view>
        <view class="modal-body">
          <view class="about-content">
            <u-text text="记账小程序" size="20" color="#333" bold></u-text>
            <u-text text="版本 1.0.0" size="20" color="#999" class="mt-2"></u-text>
            <u-text text="简单好用的个人记账工具，帮助您轻松管理财务。" size="20" color="#666" class="mt-8" align="center"></u-text>
          </view>
        </view>
      </view>
    </u-popup>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { EXPENSE_CATEGORIES } from '@/utils/constants'

const userStore = useUserStore()

const showBudgetModal = ref(false)
const showCategories = ref(false)
const showHelp = ref(false)
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

const handleLogin = () => {
  uni.getUserProfile({
    desc: '用于完善用户资料',
    success: (res) => {
      const { avatarUrl, nickName } = res.userInfo
      userStore.setUserInfo({
        avatarUrl,
        nickName,
        registerTime: Date.now(),
      })
      uni.showToast({ title: '登录成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '登录取消', icon: 'none' })
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

  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
    background: #EAF4FD;

    .login-card {
      width: 100%;
      background: #fff;
      border-radius: 32rpx;
      padding: 64rpx 48rpx;
      box-shadow: 0 8rpx 32rpx rgba(62, 143, 212, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;

      .login-icon {
        width: 160rpx;
        height: 160rpx;
        background: #E6F1FB;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 40rpx;
      }

      .login-title {
        font-size: 40rpx;
        font-weight: 600;
        color: #0C3D6B;
        margin-bottom: 16rpx;
      }

      .login-subtitle {
        font-size: 28rpx;
        color: #4D85B8;
        margin-bottom: 48rpx;
      }

      .login-features {
        display: flex;
        justify-content: space-around;
        width: 100%;
        margin-bottom: 64rpx;
        padding: 0 16rpx;

        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12rpx;

          text {
            font-size: 24rpx;
            color: #1C3A5A;
          }
        }
      }

      :deep(.u-button) {
        width: 100%;
        margin-bottom: 32rpx;
      }

      .login-tips {
        font-size: 22rpx;
        color: #7AADCC;
        text-align: center;
        line-height: 1.5;
      }
    }
  }

  .header {
    background: #3E8FD4;
    padding: 60rpx 32rpx;

    .user-card {
      display: flex;
      align-items: center;

      :deep(.u-avatar) {
        margin-right: 24rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
      }
    }
  }

  .menu-section {
    padding: 20rpx;

    .mt-4 {
      margin-top: 20rpx;
    }
  }

  .logout-section {
    padding: 40rpx 32rpx;
  }

  .modal-content {
    width: 100%;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;

    &.categories-modal,
    &.help-modal,
    &.about-modal {
      border-radius: 24rpx;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      border-bottom: 2rpx solid #f5f5f5;
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
      }

      .category-section {
        margin-bottom: 32rpx;

        .section-title {
          display: block;
          font-size: 28rpx;
          color: #666;
          margin-bottom: 20rpx;
        }

        .category-icon {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12rpx;
        }
      }

      .help-content {
        .help-item {
          margin-bottom: 32rpx;

          .mt-2 {
            margin-top: 12rpx;
          }
        }
      }

      .about-content {
        text-align: center;
        padding: 40rpx;

        .mt-2 {
          margin-top: 16rpx;
        }

        .mt-8 {
          margin-top: 32rpx;
        }
      }
    }

    .modal-footer {
      padding: 24rpx 32rpx;
      padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
      border-top: 2rpx solid #f5f5f5;
    }
  }
}
</style>
