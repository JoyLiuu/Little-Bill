<template>
  <view class="amount-input">
    <text class="currency">¥</text>
    <u-input
      class="input"
      type="digit"
      :value="displayValue"
      :placeholder="placeholder"
      :focus="focus"
      border="none"
      fontSize="48rpx"
      color="#333"
      @input="onInput"
      @blur="onBlur"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: number
  placeholder?: string
  focus?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'blur'): void
}>()

const displayValue = ref('')

watch(() => props.modelValue, (val) => {
  if (val === 0) {
    displayValue.value = ''
  } else {
    displayValue.value = val.toString()
  }
}, { immediate: true })

const onInput = (e: any) => {
  let value = e.detail.value
  
  // 限制只能输入数字和小数点
  value = value.replace(/[^\d.]/g, '')
  
  // 限制只能有一个小数点
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  
  // 限制小数点后两位
  if (parts[1] && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].slice(0, 2)
  }
  
  // 限制最大金额
  const numValue = parseFloat(value) || 0
  if (numValue > 9999999.99) {
    value = '9999999.99'
  }
  
  displayValue.value = value
  emit('update:modelValue', parseFloat(value) || 0)
}

const onBlur = () => {
  emit('blur')
}
</script>

<style lang="scss" scoped>
.amount-input {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #e0e0e0;
  
  .currency {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    margin-right: 16rpx;
  }
  
  .input {
    flex: 1;
  }
}
</style>
