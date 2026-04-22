<template>
  <u-popup
    :show="visible"
    mode="bottom"
    :round="32"
    :closeOnClickOverlay="closeOnOverlay"
    @close="close"
    bgColor="#fff"
    :zIndex="1000"
    :customStyle="{ maxHeight: '70vh' }"
  >
    <view class="modal-content">
      <view class="modal-header">
        <text class="title">{{ isEdit ? '编辑资金池' : '新建资金池' }}</text>
        <u-icon name="close" size="24" color="#999" @click="close"></u-icon>
      </view>

      <scroll-view class="modal-body" scroll-y>
        <!-- 名称 -->
        <view class="form-item">
          <text class="label">名称</text>
          <u-input
            v-model="form.name"
            placeholder="请输入资金池名称"
            maxlength="20"
            border="surround"
            :customStyle="{ backgroundColor: '#f5f5f5' }"
          />
        </view>

        <!-- 预算金额 -->
        <view class="form-item">
          <text class="label">预算金额</text>
          <AmountInput v-model="form.targetAmount" placeholder="0.00" />
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
              <u-icon v-if="form.color === color" name="checkmark" size="16" color="#fff"></u-icon>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="modal-footer">
        <u-button
          :text="isEdit ? '保存' : '创建'"
          shape="circle"
          size="large"
          :color="canSave ? 'linear-gradient(135deg, #3E8FD4 0%, #2E6FA8 100%)' : '#ccc'"
          :disabled="!canSave"
          @click="save"
        />
      </view>
    </view>
  </u-popup>
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
  color: FUND_COLORS[0],
})

const canSave = computed(() => {
  const nameValid = form.value.name && form.value.name.trim().length > 0
  const amountValid = Number(form.value.targetAmount) > 0
  return nameValid && amountValid
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.fund) {
      form.value = {
        name: props.fund.name,
        targetAmount: props.fund.targetAmount,
        color: props.fund.color,
      }
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  form.value = {
    name: '',
    targetAmount: 0,
    color: FUND_COLORS[0],
  }
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

<style scoped>
.modal-content {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #EDF4FB;
  flex-shrink: 0;
}

.modal-header .title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0C3D6B;
}

.modal-body {
  flex: 1;
  padding: 24rpx 32rpx;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-item .label {
  display: block;
  font-size: 24rpx;
  color: #1C3A5A;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.form-item .color-list {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.form-item .color-list .color-item {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.form-item .color-list .color-item.active {
  transform: scale(1.1);
  box-shadow: 0 4rpx 12rpx rgba(62, 143, 212, 0.3);
}

.modal-footer {
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #EDF4FB;
  flex-shrink: 0;
}
</style>
