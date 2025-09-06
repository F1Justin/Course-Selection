import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import App from './App.vue';
import CourseSelection from './views/CourseSelection.vue';
import Preview from './views/Preview.vue';
import './assets/main.scss';

// PrimeVue样式 - 移除静态主题导入，改为动态导入
// import 'primevue/resources/themes/lara-light-blue/theme.css'; // 注释掉静态导入
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// 导入常用组件
import Button from 'primevue/button';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';

const app = createApp(App);
const pinia = createPinia();

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: CourseSelection },
    { path: '/preview', component: Preview }
  ]
});

app.use(PrimeVue, {
  ripple: true,
  inputStyle: 'filled'
});
app.use(pinia);
app.use(router);

// 注册全局组件
app.component('Button', Button);
app.component('Card', Card);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Dropdown', Dropdown);
app.component('InputText', InputText);
app.component('Message', Message);
app.component('Paginator', Paginator);
app.component('ProgressSpinner', ProgressSpinner);

app.mount('#app');