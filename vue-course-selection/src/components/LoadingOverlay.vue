<template>
  <div class="loading-overlay" v-if="show">
    <div class="loading-content">
      <ProgressSpinner class="loading-icon" strokeWidth="4" />
      <h3>正在加载课程数据</h3>
      <p>请耐心等待...</p>
    </div>
  </div>
</template>

<script setup>
import ProgressSpinner from 'primevue/progressspinner';

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
  background-color: var(--surface-card);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading-icon {
  width: 70px !important;
  height: 70px !important;
}

h3 {
  margin: 20px 0 10px;
  color: var(--text-color);
}

p {
  margin: 0;
  color: var(--text-color-secondary);
}

@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  .loading-content {
    background-color: var(--surface-card);
  }
}
</style> 