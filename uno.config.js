import { defineConfig } from 'unocss'
import { presetUno } from '@unocss/preset-uno'
import { presetAttributify } from '@unocss/preset-attributify'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  // 小程序适配配置 - 莫兰迪色系
  theme: {
    colors: {
      primary: {
        DEFAULT: '#B8A9C9', // 莫兰迪灰紫
        light: '#D4C5E2',   // 浅灰紫
        dark: '#9B8AA5',    // 深灰紫
      },
      secondary: {
        DEFAULT: '#E8E3E9', // 莫兰迪灰粉背景
        light: '#F5F0F0',   // 极浅灰
        dark: '#C4B5C0',    // 中灰紫
      },
      danger: '#D4A5A5',    // 莫兰迪灰红
      warning: '#D4C4A8',   // 莫兰迪米黄
      info: '#A5B8C4',      // 莫兰迪灰蓝
      accent: {
        DEFAULT: '#C9B8A9', // 莫兰迪米棕
        light: '#D9CFC4',
        dark: '#A89888',
      },
      morandi: {
        sage: '#B5C4B1',      // 鼠尾草绿
        rose: '#D4A5A5',      // 灰玫瑰
        blue: '#A5B8C4',      // 灰蓝
        beige: '#D9CFC4',     // 米灰
        lavender: '#C4B5D4',  // 薰衣草灰
        sand: '#C9B8A9',      // 沙色
      }
    },
  },
  // 安全列表，确保这些类被生成
  safelist: [
    'flex',
    'items-center',
    'justify-center',
    'justify-between',
    'text-white',
    'bg-white',
    'rounded-full',
    'rounded-2xl',
  ],
  // 微信小程序适配：将不支持的字符替换
  postprocess: (util) => {
    // 处理类名中的特殊字符，使其兼容微信小程序
    util.selector = util.selector
      .replace(/\\\//g, '_') // 替换 \/ 为 _
      .replace(/\\:/g, '_')   // 替换 \: 为 _
      .replace(/\\\?/g, '_')  // 替换 \? 为 _
      .replace(/\\\$/g, '_')  // 替换 \$ 为 _
      .replace(/\\/g, '')     // 移除其他反斜杠
    
    // 处理 CSS 属性值，移除空的 CSS 变量值（微信小程序不支持）
    if (util.entries) {
      util.entries = util.entries.map(([key, value]) => {
        // 将空的 CSS 变量值替换为有效的默认值
        if (value === '' || value === ' ') {
          return [key, 'initial']
        }
        return [key, value]
      })
    }
    
    return util
  },
})
