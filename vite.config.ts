import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import UnoCSS from 'unocss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { copyStaticPlugin } from './vite-plugin-copy-static.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 微信小程序 CSS 后处理插件
const wxssPostProcessPlugin = () => {
  return {
    name: 'wxss-post-process',
    generateBundle(options, bundle) {
      // 处理所有 wxss 文件
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.wxss') && chunk.type === 'asset') {
          let css = chunk.source.toString()

          // 修复空的 CSS 变量值（微信小程序不支持）
          // 将 "--variable: ;" 替换为 "--variable: initial;"
          css = css.replace(/(--[\w-]+):\s*;/g, '$1: initial;')

          // 修复其他可能的 WXSS 不兼容语法
          // 移除 CSS 变量中的空值
          css = css.replace(/:\s*;/g, ': initial;')

          chunk.source = css
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni.default(),
    UnoCSS(),
    wxssPostProcessPlugin(),
    copyStaticPlugin(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // 取消sass废弃API的报警
        silenceDeprecations: ['legacy-js-api', 'color-functions', 'import'],
        // 预加载 uview-plus 主题文件
        additionalData: `@import "uview-plus/theme.scss";`
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['uview-plus']
  }
})
