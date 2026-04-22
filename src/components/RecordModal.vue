<template>
  <u-popup
    :show="visible"
    mode="center"
    :round="24"
    @close="close"
    bgColor="#fff"
    :zIndex="1000"
    :customStyle="{ width: '85%' }"
  >
    <view class="modal-container">
      <!-- 头部 -->
      <view class="modal-header">
        <text class="modal-title">{{ isEdit ? '编辑记录' : '记一笔' }}</text>
        <u-icon name="close" size="24" color="#999" @click="close"></u-icon>
      </view>

      <scroll-view scroll-y class="modal-body">
        <!-- 金额输入 -->
        <view class="amount-section">
          <text class="currency">¥</text>
          <input
            v-model="amountInput"
            type="digit"
            placeholder="0.00"
            class="amount-input"
            focus
          />
        </view>

        <!-- 分类选择 -->
        <view class="section">
          <text class="section-title">选择分类</text>
          <view class="category-grid">
            <view
              v-for="category in EXPENSE_CATEGORIES"
              :key="category.id"
              class="category-item"
              @click="selectCategory(category)"
            >
              <view
                class="category-icon"
                :class="{ active: form.categoryId === category.id }"
                :style="{ backgroundColor: form.categoryId === category.id ? category.color : category.color + '20' }"
              >
                <u-icon :name="category.icon" size="20" :color="form.categoryId === category.id ? '#fff' : category.color"></u-icon>
              </view>
              <text
                class="category-name"
                :class="{ active: form.categoryId === category.id }"
              >{{ category.name }}</text>
            </view>
          </view>
        </view>

        <!-- 日期选择 -->
        <view class="section date-section">
          <text class="section-title">日期</text>
          <DatePicker v-model="form.date" />
        </view>

        <!-- 备注 -->
        <view class="section remark-section">
          <text class="section-title">备注</text>
          <u-textarea
            v-model="form.remark"
            placeholder="添加备注（选填）"
            maxlength="100"
            height="60"
            border="surround"
            :customStyle="{ backgroundColor: '#f5f5f5', width: '100%' }"
          />
        </view>
      </scroll-view>

      <!-- 底部提交按钮 -->
      <view class="modal-footer">
        <u-button
          :text="isEdit ? '保存' : '确认'"
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
import DatePicker from './DatePicker.vue'
import { EXPENSE_CATEGORIES } from '@/utils/constants'
import { formatDate } from '@/utils/date'
import type { Record, Category } from '@/types'

const props = defineProps<{
  visible: boolean
  record?: Record | null
  closeOnOverlay?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: any): void
}>()

const isEdit = computed(() => !!props.record)

const form = ref({
  amount: 0,
  type: 'expense' as const,
  categoryId: '',
  categoryName: '',
  categoryIcon: '',
  categoryColor: '',
  date: formatDate(new Date()),
  remark: '',
})

const amountInput = ref('')

const canSave = computed(() => {
  return form.value.amount > 0 && form.value.categoryId
})

watch(
  () => props.visible,
  val => {
    if (val) {
      if (props.record) {
        form.value = {
          amount: props.record.amount,
          type: props.record.type,
          categoryId: props.record.categoryId,
          categoryName: props.record.categoryName,
          categoryIcon: props.record.categoryIcon,
          categoryColor: props.record.categoryColor,
          date: props.record.date,
          remark: props.record.remark || '',
          images: props.record.images || [],
        }
        amountInput.value = props.record.amount.toString()
      } else {
        resetForm()
      }
    }
  }
)

watch(amountInput, (val) => {
  // 限制只能输入数字和小数点
  let value = val.replace(/[^\d.]/g, '')

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

  amountInput.value = value
  form.value.amount = parseFloat(value) || 0
})

const resetForm = () => {
  form.value = {
    amount: 0,
    type: 'expense' as const,
    categoryId: '',
    categoryName: '',
    categoryIcon: '',
    categoryColor: '',
    date: formatDate(new Date()),
    remark: '',
  }
  amountInput.value = ''
}

const selectCategory = (category: Category) => {
  form.value.categoryId = category.id
  form.value.categoryName = category.name
  form.value.categoryIcon = category.icon
  form.value.categoryColor = category.color
}

const save = () => {
  if (!canSave.value) return

  const data = {
    ...form.value,
    id: props.record?.id,
    images: [],
  }

  emit('save', data)
  close()
}

const close = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-container {
  display: flex;
  flex-direction: column;
  max-height: 75vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-body {
  flex: 1;
  padding: 20rpx 32rpx;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.amount-section {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 2rpx solid #e0e0e0;
  margin-bottom: 12rpx;
}

.currency {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}

.amount-input {
  flex: 1;
  font-size: 48rpx;
  color: #333;
  border: none;
  outline: none;
  background: transparent;
}

.section {
  margin-bottom: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.section.date-section {
  margin-bottom: 12rpx;
}

.section-title {
  display: block;
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx 8rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.category-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
  transition: all 0.2s;
}

.category-name {
  font-size: 22rpx;
  color: #666;
  text-align: center;
}

.category-name.active {
  color: #333;
  font-weight: 500;
}

.remark-section {
  margin-bottom: 0;
}

.modal-footer {
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}
</style>
