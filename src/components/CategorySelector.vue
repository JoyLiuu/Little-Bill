<template>
  <view class="category-selector">
    <u-tabs
      :list="typeList"
      :current="currentIndex"
      :activeStyle="{ color: '#3E8FD4', fontWeight: 'bold' }"
      :inactiveStyle="{ color: '#666' }"
      lineColor="#3E8FD4"
      @change="switchType"
    />
    
    <u-grid :col="4" :border="false" class="category-grid">
      <u-grid-item
        v-for="category in currentCategories"
        :key="category.id"
        @click="selectCategory(category)"
      >
        <view
          class="category-item"
          :class="{ active: modelValue === category.id }"
        >
          <view
            class="icon"
            :style="{ backgroundColor: category.color + '20' }"
          >
            <u-icon :name="category.icon" size="20" :color="category.color"></u-icon>
          </view>
          <text class="name">{{ category.name }}</text>
        </view>
      </u-grid-item>
    </u-grid>
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

const typeList = [
  { name: '支出', value: 'expense' },
  { name: '收入', value: 'income' }
]

const currentIndex = computed(() => {
  return currentType.value === 'expense' ? 0 : 1
})

watch(() => props.type, (val) => {
  if (val) {
    currentType.value = val
  }
})

const currentCategories = computed(() => {
  return currentType.value === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
})

const switchType = (item: any) => {
  const type = item.value as 'expense' | 'income'
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
  .category-grid {
    margin-top: 24rpx;
    
    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx;
      
      &.active {
        .icon {
          transform: scale(1.1);
          background: #F0E8F0 !important;
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
      }
      
      .name {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>
