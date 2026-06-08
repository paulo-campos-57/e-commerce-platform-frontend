import { createApp } from 'vue'
import App from './App.vue'

import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import router from './router'

const app = createApp(App)
app.use(Toast, {
    position: 'top-right',
    timeout: 4000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
})

app.use(router)

app.mount('#app')