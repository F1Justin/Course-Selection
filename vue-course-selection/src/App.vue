<template>
  <div class="app-container">
    <CourseSelection />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CourseSelection from './views/CourseSelection.vue';
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
}
</style> 