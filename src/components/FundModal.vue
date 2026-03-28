<template>
  <view class="fund-modal" v-if="visible" @click="closeOnOverlay && close()">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="title">{{ isEdit ? '编辑资金池' : '新建资金池' }}</text>
        <text class="close-btn" @click="close">×</text>
      </view>
      
      <scroll-view class="modal-body" scroll-y>
        <!-- 名称 -->
        <view class="form-item">
          <text class="label">名称</text>
          <input
            class="input"
            v-model="form.name"
            placeholder="请输入资金池名称"
            maxlength="20"
          />
        </view>
        
        <!-- 目标金额 -->
        <view class="form-item">
          <text class="label">目标金额</text>
          <AmountInput v-model="form.targetAmount" placeholder="0.00" />
        </view>
        
        <!-- 截止月份 -->
        <view class="form-item">
          <text class="label">截止月份</text>
          <picker
            mode="date"
            fields="month"
            :value="form.deadline"
            :start="minDate"
            @change="onDeadlineChange"
          >
            <view class="picker-value">
              <text>{{ formatDeadline(form.deadline) }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
        
        <!-- 颜色选择 -->
        <view class="form-item">
          <text class="label">颜色标识</text>
          <view class="color-list">
            <view
              v-for="color in FUND_COLORS"
              :key="color"
              class="color-item"
              :class="{ active: form.color === color }"
              :style="{ backgroundColor: color }"
              @click="form.color = color"
            >
              <text v-if="form.color === color" class="check">✓</text>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <view class="modal-footer">
        <button class="btn-save" @click="save" :disabled="!canSave">
          {{ isEdit ? '保存' : '创建' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AmountInput from './AmountInput.vue'
import { FUND_COLORS } from '@/utils/constants'
import type { FundPool } from '@/types'

const props = defineProps<{
  visible: boolean
  fund?: FundPool | null
  closeOnOverlay?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: any): void
}>()

const isEdit = computed(() => !!props.fund)

const form = ref({
  name: '',
  targetAmount: 0,
  deadline: '',
  color: FUND_COLORS[0],
})

const minDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
})

const canSave = computed(() => {
  return form.value.name.trim() && form.value.targetAmount > 0 && form.value.deadline
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.fund) {
      form.value = {
        name: props.fund.name,
        targetAmount: props.fund.targetAmount,
        deadline: props.fund.deadline,
        color: props.fund.color,
      }
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  const now = new Date()
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), 1)
  form.value = {
    name: '',
    targetAmount: 0,
    deadline: `${nextYear.getFullYear()}-${String(nextYear.getMonth() + 1).padStart(2, '0')}`,
    color: FUND_COLORS[0],
  }
}

const onDeadlineChange = (e: any) => {
  form.value.deadline = e.detail.value
}

const formatDeadline = (deadline: string) => {
  if (!deadline) return '请选择'
  const [year, month] = deadline.split('-')
  return `${year}年${parseInt(month)}月`
}

const save = () => {
  if (!canSave.value) return
  
  const data = {
    ...form.value,
    id: props.fund?.id,
  }
  
  emit('save', data)
  close()
}

const close = () => {
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.fund-modal {
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
    max-height: 85vh;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    display: flex;
    flex-direction: column;
    
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
      flex: 1;
      padding: 32rpx;
      
      .form-item {
        margin-bottom: 32rpx;
        
        .label {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 16rpx;
          font-weight: 500;
        }
        
        .input {
          width: 100%;
          height: 80rpx;
          padding: 0 24rpx;
          background: #f5f5f5;
          border-radius: 8rpx;
          font-size: 28rpx;
        }
        
        .picker-value {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20rpx 24rpx;
          background: #f5f5f5;
          border-radius: 8rpx;
          font-size: 28rpx;
          color: #333;
          
          .arrow {
            font-size: 20rpx;
            color: #999;
          }
        }
        
        .color-list {
          display: flex;
          gap: 24rpx;
          flex-wrap: wrap;
          
          .color-item {
            width: 72rpx;
            height: 72rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            
            &.active {
              transform: scale(1.15);
              box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
            }
            
            .check {
              color: #fff;
              font-size: 32rpx;
              font-weight: bold;
            }
          }
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
