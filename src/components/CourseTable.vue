<template>
  <div class="course-table">
    <el-card shadow="hover">
      <template #header>
        <div class="table-header">
          <h3>课程列表</h3>
          <span class="result-count">共找到 {{ totalItems }} 门课程</span>
        </div>
      </template>
      
      <!-- 数据加载状态 -->
      <el-empty v-if="!loading && totalItems === 0" description="没有找到符合条件的课程" />
      
      <!-- 表格数据 -->
      <el-table
        v-if="totalItems > 0"
        :data="paginatedCourses"
        border
        style="width: 100%"
        :header-cell-style="{ background: 'var(--background-color)', color: 'var(--text-primary)' }"
        max-height="600"
        v-loading="loading"
      >
        <el-table-column prop="courseId" label="课程序号" min-width="100" sortable />
        <el-table-column prop="courseName" label="课程名称" min-width="150">
          <template #default="scope">
            <el-link
              :href="`https://1.tongji.icu/search?q=${encodeURIComponent(scope.row.courseName)}`"
              target="_blank"
              type="primary"
              :underline="false"
            >
              {{ scope.row.courseName }}
              <el-icon class="el-icon--right"><Link /></el-icon>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="weeklyHours" label="周学时" min-width="80" align="center" />
        <el-table-column prop="leader" label="负责人" min-width="100" />
        <el-table-column prop="teachers" label="授课教师" min-width="120" />
        <el-table-column prop="courseNature" label="课程性质" min-width="150" />
        <el-table-column prop="language" label="授课语言" min-width="100" align="center" />
        <el-table-column prop="campus" label="校区" min-width="100" />
        <el-table-column prop="department" label="开课学院" min-width="150" />
        <el-table-column prop="auditInfo" label="听课专业" min-width="200" show-overflow-tooltip />
        <el-table-column prop="schedule" label="排课信息" min-width="200" show-overflow-tooltip />
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="totalPages > 1">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import { Link } from '@element-plus/icons-vue';

const courseStore = useCourseStore();

const loading = computed(() => courseStore.loading);
const totalItems = computed(() => courseStore.totalItems);
const totalPages = computed(() => courseStore.totalPages);
const paginatedCourses = computed(() => courseStore.paginatedCourses);
const currentPage = computed(() => courseStore.currentPage);
const pageSize = computed(() => courseStore.pageSize);

function handlePageChange(page) {
  courseStore.goToPage(page);
  // 滚动到表格顶部
  document.querySelector('.course-table').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}
</script>

<style scoped>
.course-table {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.result-count {
  color: var(--text-secondary);
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 