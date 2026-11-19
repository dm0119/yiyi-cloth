import { createApp } from 'vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/styles/global.css'
import App from './App.vue'
import permissionDirective from './directives/permission'
import pinia from './stores'


const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册权限指令
app.directive('permission', permissionDirective)

app.use(router)
app.use(ElementPlus)
app.use(pinia)
app.mount('#app')
