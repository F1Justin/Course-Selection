<template>
  <div>
    <!-- 加载遮罩 -->
    <LoadingOverlay :show="loading" />
    
    <div class="container">
      <!-- 头部 -->
      <header>
        <div class="logo">
          <div class="title-container">
            <h1>通济 - 模拟选课系统</h1>
            <p>为苦于1系统全校课表的人准备的课程筛选工具</p>
          </div>
        </div>
        <div class="header-actions">
          <Button label="查看已选的课程" icon="pi pi-eye" class="p-button-raised header-cta" @click="goPreview" />
        </div>
      </header>
      
      <!-- 主内容区 -->
      <main>
        <!-- 错误提示 -->
        <div v-if="error" class="grid">
          <div class="col-12">
            <Message severity="error" :closable="false">
              <div class="error-content">
                <i class="pi pi-exclamation-triangle" style="font-size: 1.5rem"></i>
                <div>
                  <h3>加载数据时出错</h3>
                  <p>{{ error }}</p>
                  <Button label="重试" icon="pi pi-refresh" @click="reloadData" />
                </div>
              </div>
            </Message>
          </div>
        </div>
        
        <!-- 筛选和课程列表 -->
        <div class="grid filter-grid">
          <!-- 左侧筛选面板 -->
          <div class="col-12 md:col-5 lg:col-4 filter-panel-container">
            <FilterPanel />
          </div>
          
          <!-- 右侧时间筛选面板 -->
          <div class="col-12 md:col-7 lg:col-8 schedule-grid-container">
            <ScheduleGrid />
          </div>
        </div>
        
        <!-- 课程表 -->
        <div class="grid table-grid">
          <div class="col-12 course-table-container">
            <CourseTable />
          </div>
        </div>
      </main>
      
      <!-- 底部 -->
      <footer>
        <p>© {{ new Date().getFullYear() }} 通济选课系统 | <a href="https://github.com/F1Justin/Course-Selection" target="_blank">GitHub</a></p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import FilterPanel from '@/components/FilterPanel.vue';
import ScheduleGrid from '@/components/ScheduleGrid.vue';
import CourseTable from '@/components/CourseTable.vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import Message from 'primevue/message';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const courseStore = useCourseStore();
const router = useRouter();
const loading = computed(() => courseStore.loading);
const error = computed(() => courseStore.error);

const reloadData = () => {
  courseStore.loadCourses();
};

onMounted(() => {
  courseStore.loadCourses();
});

function goPreview() {
  router.push('/preview');
}
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  padding: 1.5rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo img {
  height: 3rem;
}

.title-container h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--primary-color);
}

.title-container p {
  margin: 0.2rem 0 0 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.filter-grid {
  margin-bottom: 1rem;
  flex: 0 0 auto;
}

.table-grid {
  flex: 1;
  display: flex;
  margin-bottom: 0;
}

.course-table-container {
  flex: 1;
  display: flex;
  min-height: 500px;
}

.error-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.error-content h3 {
  margin: 0 0 0.5rem 0;
}

.error-content p {
  margin: 0 0 1rem 0;
}

footer {
  text-align: center;
  padding: 1rem 0;
  margin-top: 1rem;
  border-top: 1px solid var(--surface-border);
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  flex-shrink: 0;
}

footer a {
  color: var(--primary-color);
  text-decoration: none;
}

/* 确保筛选面板和时间筛选板卡高度对齐 */
@media screen and (min-width: 768px) {
  .filter-panel-container :deep(.p-card),
  .schedule-grid-container :deep(.p-card) {
    height: 100%;
  }
}

/* 顶部按钮右侧对齐并与标题同高 */
header { display: flex; justify-content: space-between; align-items: center; }
.header-actions { display: flex; align-items: center; }
.header-cta { transform: scale(0.8); transform-origin: right center; }
</style> 