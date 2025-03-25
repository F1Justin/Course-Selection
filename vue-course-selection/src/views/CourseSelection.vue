<template>
  <div class="course-selection">
    <LoadingOverlay :show="isInitialLoading" />
    
    <el-container class="container">
      <el-header height="auto">
        <div class="page-header">
          <h1 class="page-title">课程展示与筛选系统</h1>
          <p class="page-subtitle">轻松查找并筛选课程信息</p>
        </div>
      </el-header>
      
      <el-main>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="5">
            <FilterPanel />
          </el-col>
          
          <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="19">
            <ScheduleGrid />
            <CourseTable />
          </el-col>
        </el-row>
        
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          show-icon
          :closable="false"
          style="margin: 20px 0"
        />
      </el-main>
      
      <el-footer height="auto" class="footer">
        <div class="footer-content">
          <p>&copy; {{ currentYear }} 课程展示与筛选系统 | 基于Vue 3与Element Plus</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import FilterPanel from '@/components/FilterPanel.vue';
import ScheduleGrid from '@/components/ScheduleGrid.vue';
import CourseTable from '@/components/CourseTable.vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const courseStore = useCourseStore();
const error = computed(() => courseStore.error);
const isInitialLoading = ref(true);
const currentYear = new Date().getFullYear();

onMounted(async () => {
  try {
    await courseStore.loadCourses();
  } catch (err) {
    console.error('Failed to load courses:', err);
  } finally {
    setTimeout(() => {
      isInitialLoading.value = false;
    }, 500); // 给一个短暂的延迟，确保UI有适当的过渡
  }
});
</script>

<style scoped>
.course-selection {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

.page-header {
  padding: 30px 0;
}

.page-title {
  font-size: 32px;
  margin-bottom: 10px;
  color: var(--primary-color);
  text-align: center;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 20px 0;
}

.footer {
  margin-top: 30px;
  padding: 20px 0;
  border-top: 1px solid var(--border-light);
}

.footer-content {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}
</style> 