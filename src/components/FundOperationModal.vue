<template>
  <u-popup
    :show="visible"
    mode="bottom"
    :round="32"
    :closeOnClickOverlay="closeOnOverlay"
    @close="close"
    bgColor="#fff"
    :zIndex="1000"
  >
    <view class="modal-content">
      <view class="modal-header">
        <text class="title">{{ operationType === 'deposit' ? '存入' : '取出' }}</text>
        <u-icon name="close" size="24" color="#999" @click="close"></u-icon>
      </view>

      <view class="modal-body">
        <!-- 资金池信息 -->
        <view class="fund-info" v-if="fund">
          <view
            class="fund-icon"
            :style="{ backgroundColor: fund.color + '20' }"
          >
            <u-icon name="rmb-circle" size="20" :color="fund.color"></u-icon>
          </view>
          <view class="fund-detail">
            <u-text :text="fund.name" size="20" color="#333" bold></u-text>
            <u-text :text="`当前：¥${formatAmount(fund.currentAmount)} / ¥${formatAmount(fund.targetAmount)}`" size="24" color="#666"></u-text>
          </view>
        </view>

        <!-- 金额输入 -->
        <view class="amount-section">
          <text class="label">{{ operationType === 'deposit' ? '存入金额' : '取出金额' }}</text>
          <AmountInput v-model="form.amount" placeholder="0.00" :focus="true" />
        </view>

        <!-- 备注 -->
        <view class="remark-section">
          <text class="label">备注（选填）</text>
          <u-textarea
            v-model="form.remark"
            placeholder="添加备注"
            maxlength="50"
            height="120"
            border="surround"
            :customStyle="{ backgroundColor: '#f5f5f5' }"
          />
        </view>
      </view>

      <view class="modal-footer">
        <u-button
          :text="`确认${operationType === 'deposit' ? '存入' : '取出'}`"
          shape="circle"
          size="large"
          :color="canSave ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : '#ccc'"
          :disabled="!canSave"
          @click="confirm"
        />
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AmountInput from './AmountInput.vue'
import type { FundPool } from '@/types'
import { formatAmount } from '@/utils/format'

const props = defineProps<{
  visible: boolean
  fund: FundPool | null
  operationType: 'deposit' | 'withdraw'
  closeOnOverlay?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: { amount: number; remark: string }): void
}>()

const form = ref({
  amount: 0,
  remark: '',
})

const canSave = computed(() => {
  if (form.value.amount <= 0) return false
  if (props.operationType === 'withdraw' && props.fund) {
    return form.value.amount <= props.fund.currentAmount
  }
  return true
})

watch(() => props.visible, (val) => {
  if (val) {
    form.value = {
      amount: 0,
      remark: '',
    }
  }
})

const confirm = () => {
  if (!canSave.value) return

  emit('confirm', {
    amount: form.value.amount,
    remark: form.value.remark,
  })
  close()
}

const close = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-header .title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-body {
  padding: 32rpx;
}

.fund-info {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.fund-info .fund-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.fund-info .fund-detail {
  flex: 1;
}

.amount-section,
.remark-section {
  margin-bottom: 32rpx;
}

.amount-section .label,
.remark-section .label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.modal-footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
}
</style>
