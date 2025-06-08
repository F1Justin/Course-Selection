<template>
  <div class="app-container">
    <CourseSelection />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import CourseSelection from './views/CourseSelection.vue';

let mediaQueryList;
let themeLink = null;

// 动态切换主题
const updateTheme = (event) => {
  const isDark = event.matches;
  
  // 移除现有的主题链接
  if (themeLink) {
    themeLink.remove();
  }
  
  // 创建新的主题链接
  themeLink = document.createElement('link');
  themeLink.rel = 'stylesheet';
  themeLink.type = 'text/css';
  
  if (isDark) {
    // 深色主题
    themeLink.href = 'https://unpkg.com/primevue@^3/resources/themes/lara-dark-blue/theme.css';
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    // 浅色主题  
    themeLink.href = 'https://unpkg.com/primevue@^3/resources/themes/lara-light-blue/theme.css';
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  document.head.appendChild(themeLink);
};

onMounted(() => {
  mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  updateTheme(mediaQueryList); // 初始设置
  mediaQueryList.addEventListener('change', updateTheme); // 监听变化
});

onUnmounted(() => {
  if (mediaQueryList) {
    mediaQueryList.removeEventListener('change', updateTheme);
  }
  if (themeLink) {
    themeLink.remove();
  }
});
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
}
</style> 