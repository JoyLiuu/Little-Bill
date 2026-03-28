<template>
  <view class="record-modal" v-if="visible" @click="closeOnOverlay && close()">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="title">{{ isEdit ? '编辑记录' : '记一笔' }}</text>
        <text class="close-btn" @click="close">×</text>
      </view>
      
      <scroll-view class="modal-body" scroll-y>
        <!-- 金额输入 -->
        <AmountInput
          v-model="form.amount"
          placeholder="0.00"
          :focus="true"
        />
        
        <!-- 类型切换 -->
        <view class="type-tabs">
          <view
            class="tab"
            :class="{ active: form.type === 'expense' }"
            @click="switchType('expense')"
          >
            支出
          </view>
          <view
            class="tab"
            :class="{ active: form.type === 'income' }"
            @click="switchType('income')"
          >
            收入
          </view>
        </view>
        
        <!-- 分类选择 -->
        <view class="section">
          <text class="section-title">选择分类</text>
          <view class="category-grid">
            <view
              v-for="category in currentCategories"
              :key="category.id"
              class="category-item"
              :class="{ active: form.categoryId === category.id }"
              @click="selectCategory(category)"
            >
              <view
                class="icon"
                :style="{ backgroundColor: category.color + '20', color: category.color }"
              >
                <text class="iconfont">{{ category.icon }}</text>
              </view>
              <text class="name">{{ category.name }}</text>
            </view>
          </view>
        </view>
        
        <!-- 日期选择 -->
        <view class="section">
          <text class="section-title">日期</text>
          <DatePicker v-model="form.date" />
        </view>
        
        <!-- 备注 -->
        <view class="section">
          <text class="section-title">备注</text>
          <textarea
            class="remark-input"
            v-model="form.remark"
            placeholder="添加备注（选填）"
            maxlength="100"
          />
        </view>
        
        <!-- 图片上传 -->
        <view class="section">
          <text class="section-title">图片（最多3张）</text>
          <view class="image-list">
            <view
              v-for="(img, index) in form.images"
              :key="index"
              class="image-item"
            >
              <image :src="img" mode="aspectFill" />
              <text class="delete-btn" @click="removeImage(index)">×</text>
            </view>
            <view
              v-if="form.images.length < 3"
              class="image-item add"
              @click="chooseImage"
            >
              <text class="add-icon">+</text>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <view class="modal-footer">
        <button class="btn-save" @click="save" :disabled="!canSave">
          {{ isEdit ? '保存' : '记一笔' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AmountInput from './AmountInput.vue'
import DatePicker from './DatePicker.vue'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/utils/constants'
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
  type: 'expense' as 'expense' | 'income',
  categoryId: '',
  categoryName: '',
  categoryIcon: '',
  categoryColor: '',
  date: formatDate(new Date()),
  remark: '',
  images: [] as string[],
})

const currentCategories = computed(() => {
  return form.value.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
})

const canSave = computed(() => {
  return form.value.amount > 0 && form.value.categoryId
})

watch(() => props.visible, (val) => {
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
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  form.value = {
    amount: 0,
    type: 'expense',
    categoryId: '',
    categoryName: '',
    categoryIcon: '',
    categoryColor: '',
    date: formatDate(new Date()),
    remark: '',
    images: [],
  }
}

const switchType = (type: 'expense' | 'income') => {
  form.value.type = type
  form.value.categoryId = ''
  form.value.categoryName = ''
  form.value.categoryIcon = ''
  form.value.categoryColor = ''
}

const selectCategory = (category: Category) => {
  form.value.categoryId = category.id
  form.value.categoryName = category.name
  form.value.categoryIcon = category.icon
  form.value.categoryColor = category.color
}

const chooseImage = () => {
  uni.chooseImage({
    count: 3 - form.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.images.push(...res.tempFilePaths)
    },
  })
}

const removeImage = (index: number) => {
  form.value.images.splice(index, 1)
}

const save = () => {
  if (!canSave.value) return
  
  const data = {
    ...form.value,
    id: props.record?.id,
  }
  
  emit('save', data)
  close()
}

const close = () => {
  emit('update:visible', false)
}
</script>

<style>
.record-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.record-modal .modal-content {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.record-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-modal .modal-header .title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.record-modal .modal-header .close-btn {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.record-modal .modal-body {
  flex: 1;
  padding: 32rpx;
}

.record-modal .type-tabs {
  display: flex;
  justify-content: center;
  margin: 32rpx 0;
}

.record-modal .type-tabs .tab {
  padding: 16rpx 48rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.record-modal .type-tabs .tab.active {
  color: #4CAF50;
  font-weight: 500;
}

.record-modal .type-tabs .tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #4CAF50;
  border-radius: 2rpx;
}

.record-modal .section {
  margin-bottom: 32rpx;
}

.record-modal .section .section-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.record-modal .category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.record-modal .category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 8rpx;
  border-radius: 12rpx;
}

.record-modal .category-item.active {
  background: #f0f8f0;
}

.record-modal .category-item.active .icon {
  transform: scale(1.1);
}

.record-modal .category-item .icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  transition: transform 0.2s;
}

.record-modal .category-item .icon .iconfont {
  font-size: 36rpx;
}

.record-modal .category-item .name {
  font-size: 22rpx;
  color: #666;
}

.record-modal .remark-input {
  width: 100%;
  height: 120rpx;
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.record-modal .image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.record-modal .image-item {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
}

.record-modal .image-item image {
  width: 100%;
  height: 100%;
}

.record-modal .image-item .delete-btn {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.record-modal .image-item.add {
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-modal .image-item.add .add-icon {
  font-size: 60rpx;
  color: #999;
}

.record-modal .modal-footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
}

.record-modal .btn-save {
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
}

.record-modal .btn-save[disabled] {
  opacity: 0.5;
}

.record-modal .btn-save:active {
  opacity: 0.9;
}
</style>
