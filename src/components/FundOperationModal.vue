<template>
  <view class="operation-modal" v-if="visible" @click="closeOnOverlay && close()">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="title">{{ operationType === 'deposit' ? '存入' : '取出' }}</text>
        <text class="close-btn" @click="close">×</text>
      </view>
      
      <view class="modal-body">
        <!-- 资金池信息 -->
        <view class="fund-info" v-if="fund">
          <view
            class="fund-icon"
            :style="{ backgroundColor: fund.color + '20' }"
          >
            <text class="iconfont" :style="{ color: fund.color }">💰</text>
          </view>
          <view class="fund-detail">
            <text class="fund-name">{{ fund.name }}</text>
            <text class="fund-amount">
              当前：¥{{ formatAmount(fund.currentAmount) }} / ¥{{ formatAmount(fund.targetAmount) }}
            </text>
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
          <textarea
            class="remark-input"
            v-model="form.remark"
            placeholder="添加备注"
            maxlength="50"
          />
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="btn-save" @click="confirm" :disabled="!canSave">
          确认{{ operationType === 'deposit' ? '存入' : '取出' }}
        </button>
      </view>
    </view>
  </view>
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

<style lang="scss" scoped>
.operation-modal {
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
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
      
      .close-btn {
        font-size: 48rpx;
        color: #999;
        line-height: 1;
      }
    }
    
    .modal-body {
      padding: 32rpx;
      
      .fund-info {
        display: flex;
        align-items: center;
        padding: 24rpx;
        background: #f8f8f8;
        border-radius: 16rpx;
        margin-bottom: 32rpx;
        
        .fund-icon {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 24rpx;
          
          .iconfont {
            font-size: 40rpx;
          }
        }
        
        .fund-detail {
          flex: 1;
          
          .fund-name {
            display: block;
            font-size: 30rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 8rpx;
          }
          
          .fund-amount {
            font-size: 24rpx;
            color: #666;
          }
        }
      }
      
      .amount-section,
      .remark-section {
        margin-bottom: 32rpx;
        
        .label {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 16rpx;
          font-weight: 500;
        }
        
        .remark-input {
          width: 100%;
          height: 120rpx;
          padding: 16rpx;
          background: #f5f5f5;
          border-radius: 8rpx;
          font-size: 28rpx;
        }
      }
    }
    
    .modal-footer {
      padding: 24rpx 32rpx;
      padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
      border-top: 1rpx solid #f0f0f0;
      
      .btn-save {
        width: 100%;
        height: 88rpx;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: #fff;
        border-radius: 44rpx;
        font-size: 32rpx;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &[disabled] {
          opacity: 0.5;
        }
        
        &:active {
          opacity: 0.9;
        }
      }
    }
  }
}
</style>
