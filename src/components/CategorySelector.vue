<template>
  <view class="category-selector">
    <view class="type-tabs">
      <view
        class="tab"
        :class="{ active: currentType === 'expense' }"
        @click="switchType('expense')"
      >
        支出
      </view>
      <view
        class="tab"
        :class="{ active: currentType === 'income' }"
        @click="switchType('income')"
      >
        收入
      </view>
    </view>
    
    <view class="category-grid">
      <view
        v-for="category in currentCategories"
        :key="category.id"
        class="category-item"
        :class="{ active: modelValue === category.id }"
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/utils/constants'
import type { Category } from '@/types'

const props = defineProps<{
  modelValue: string
  type?: 'expense' | 'income'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:type', value: 'expense' | 'income'): void
  (e: 'select', category: Category): void
}>()

const currentType = ref<'expense' | 'income'>(props.type || 'expense')

watch(() => props.type, (val) => {
  if (val) {
    currentType.value = val
  }
})

const currentCategories = computed(() => {
  return currentType.value === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
})

const switchType = (type: 'expense' | 'income') => {
  currentType.value = type
  emit('update:type', type)
  emit('update:modelValue', '')
}

const selectCategory = (category: Category) => {
  emit('update:modelValue', category.id)
  emit('select', category)
}
</script>

<style lang="scss" scoped>
.category-selector {
  .type-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 32rpx;
    
    .tab {
      padding: 16rpx 48rpx;
      font-size: 28rpx;
      color: #666;
      position: relative;
      
      &.active {
        color: #4CAF50;
        font-weight: 500;
        
        &::after {
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
      }
    }
  }
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24rpx;
    
    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx;
      border-radius: 12rpx;
      transition: all 0.2s;
      
      &.active {
        background: #f0f8f0;
        
        .icon {
          transform: scale(1.1);
        }
      }
      
      .icon {
        width: 88rpx;
        height: 88rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12rpx;
        transition: transform 0.2s;
        
        .iconfont {
          font-size: 40rpx;
        }
      }
      
      .name {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>
