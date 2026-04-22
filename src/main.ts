import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'virtual:uno.css'
import uviewPlus from 'uview-plus'
export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(uviewPlus)
  app.use(pinia)

  return {
    app
  }
}
