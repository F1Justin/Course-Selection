<template>
  <div class="app-container">
    <el-config-provider :locale="zhCn">
      <CourseSelection />
    </el-config-provider>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import CourseSelection from './views/CourseSelection.vue';
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
}
</style> 