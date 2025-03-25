<template>
  <div class="loading-overlay" v-if="show">
    <div class="loading-content">
      <el-icon class="loading-icon"><loading /></el-icon>
      <h3>正在加载课程数据</h3>
      <p>请耐心等待...</p>
    </div>
  </div>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  padding: 30px;
  border-radius: 8px;
  background-color: white;
  box-shadow: var(--box-shadow);
}

.loading-icon {
  font-size: 48px;
  color: var(--primary-color);
  animation: rotate 1.5s linear infinite;
}

h3 {
  margin: 20px 0 10px;
  color: var(--text-primary);
}

p {
  margin: 0;
  color: var(--text-secondary);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  .loading-content {
    background-color: #1d1d1d;
  }
}
</style> 