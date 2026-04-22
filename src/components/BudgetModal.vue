<template>
  <u-popup
    :show="visible"
    mode="bottom"
    :round="32"
    :closeOnClickOverlay="true"
    @close="close"
    bgColor="#fff"
    :zIndex="1000"
  >
    <view class="budget-modal-content">
      <view class="budget-modal-header">
        <text class="budget-modal-title">设置月预算</text>
        <u-icon name="close" size="24" color="#999" @click="close"></u-icon>
      </view>
      <view class="budget-modal-body">
        <view class="budget-input-wrapper">
          <text class="budget-currency">¥</text>
          <input
            v-model="budgetInput"
            type="digit"
            placeholder="请输入月预算金额"
            class="budget-input"
            focus
          />
        </view>
      </view>
      <view class="budget-modal-footer">
        <u-button
          text="确定"
          shape="circle"
          size="large"
          color="linear-gradient(135deg, #3E8FD4 0%, #2E6FA8 100%)"
          @click="save"
        />
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  currentBudget: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', budget: number): void
}>()

const budgetInput = ref('')

// 监听 visible 变化，打开时填充当前预算
watch(
  () => props.visible,
  val => {
    if (val) {
      budgetInput.value = props.currentBudget > 0 ? props.currentBudget.toString() : ''
    }
  }
)

const close = () => {
  emit('update:visible', false)
}

const save = () => {
  const budget = parseFloat(budgetInput.value)
  if (budget > 0) {
    emit('save', budget)
    close()
  } else {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
  }
}
</script>

<style scoped>
.budget-modal-content {
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.budget-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
}

.budget-modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.budget-modal-body {
  margin-bottom: 48rpx;
}

.budget-input-wrapper {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #e0e0e0;
}

.budget-currency {
  font-size: 48rpx;
  color: #333;
  margin-right: 16rpx;
  font-weight: bold;
}

.budget-input {
  flex: 1;
  font-size: 48rpx;
  color: #333;
  border: none;
  outline: none;
  background: transparent;
}

.budget-modal-footer {
  padding-top: 16rpx;
}
</style>
