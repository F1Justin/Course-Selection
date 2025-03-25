import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/main.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(ElementPlus, { size: 'default', zIndex: 3000 });
app.use(pinia);

app.mount('#app'); 