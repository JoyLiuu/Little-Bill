import { defineConfig } from 'unocss'
import { presetUno } from '@unocss/preset-uno'
import { presetAttributify } from '@unocss/preset-attributify'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  // 小程序适配配置
  theme: {
    colors: {
      primary: {
        DEFAULT: '#4CAF50',
        light: '#81C784',
        dark: '#388E3C',
      },
      danger: '#ff5252',
      warning: '#ffb74d',
      info: '#64b5f6',
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
