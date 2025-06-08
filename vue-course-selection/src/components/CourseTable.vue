<template>
  <div class="course-table">
    <Card>
      <template #title>
        <div class="table-header">
          <h3 class="table-title">课程列表</h3>
          <span class="result-count">共找到 {{ totalItems }} 门课程</span>
        </div>
      </template>
      
      <template #content>
        <!-- 数据加载状态 -->
        <div v-if="!loading && totalItems === 0" class="empty-message">
          <i class="pi pi-search" style="font-size: 2rem"></i>
          <p>没有找到符合条件的课程</p>
        </div>
        
        <!-- 表格数据 -->
        <DataTable
          v-if="totalItems > 0"
          :value="paginatedCourses"
          :loading="loading"
          responsiveLayout="scroll"
          stripedRows
          showGridlines
          class="course-datatable"
          size="small"
          tableStyle="min-width: 50rem"
        >
          <Column field="courseId" header="课程序号" sortable style="width: 7%" />
          <Column field="courseName" header="课程名称" style="width: 12%">
            <template #body="slotProps">
              <a
                :href="`https://1.tongji.icu/search?q=${encodeURIComponent(slotProps.data.courseName)}`"
                target="_blank"
                class="p-link"
              >
                {{ slotProps.data.courseName }}
                <i class="pi pi-external-link" style="font-size: 0.75rem; margin-left: 3px"></i>
              </a>
            </template>
          </Column>
          <Column field="weeklyHours" header="周学时" style="width: 4%" align="center" />
          <Column field="leader" header="负责人" style="width: 6%" />
          <Column field="teachers" header="授课教师" style="width: 8%" />
          <Column field="courseNature" header="课程性质" style="width: 9%" />
          <Column field="language" header="授课语言" style="width: 6%" align="center" />
          <Column field="campus" header="校区" style="width: 5%" />
          <Column field="department" header="开课学院" style="width: 10%" />
          <Column field="auditInfo" header="听课专业" style="width: 16%">
            <template #body="slotProps">
              <div class="wrappable-text">{{ slotProps.data.auditInfo }}</div>
            </template>
          </Column>
          <Column field="schedule" header="排课信息" style="width: 17%">
            <template #body="slotProps">
              <div class="wrappable-text">{{ slotProps.data.schedule }}</div>
            </template>
          </Column>
        </DataTable>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="totalPages > 1">
          <Paginator
            v-model:first="first"
            :rows="pageSize"
            :totalRecords="totalItems"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            :pageLinkSize="5"
            @page="onPageChange($event)"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';

const courseStore = useCourseStore();

const loading = computed(() => courseStore.loading);
const totalItems = computed(() => courseStore.totalItems);
const totalPages = computed(() => courseStore.totalPages);
const paginatedCourses = computed(() => courseStore.paginatedCourses);
const currentPage = computed(() => courseStore.currentPage);
const pageSize = computed(() => courseStore.pageSize);

// 用于Paginator的first属性
const first = computed(() => (currentPage.value - 1) * pageSize.value);

// 监听currentPage变化，更新first
watch(currentPage, (newPage) => {
  first.value = (newPage - 1) * pageSize.value;
});

function onPageChange(event) {
  // 页码是从0开始的，所以要加1
  const page = Math.floor(event.first / event.rows) + 1;
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
  width: 100%;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

:deep(.p-card) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.p-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.p-card-content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 0.5rem;
}

.course-datatable {
  width: 100%;
  flex: 1;
}

:deep(.p-datatable) {
  display: flex;
  flex-direction: column;
  height: auto;
  overflow: visible;
}

:deep(.p-datatable-wrapper) {
  border-radius: 4px;
  overflow: visible;
}

:deep(.p-datatable-table) {
  width: 100%;
}

:deep(.p-datatable-thead > tr > th) {
  padding: 0.75rem 0.5rem;
  background-color: var(--surface-ground);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem;
  vertical-align: top;
}

/* 斑马线颜色 */
:deep(.p-datatable-tbody > tr.p-datatable-striped) {
    background-color: var(--surface-ground);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: var(--text-color-secondary);
}

.table-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.2rem;
}

.result-count {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.empty-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--text-color-secondary);
  flex: 1;
}

.pagination-container {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
}

/* 新的可换行文本样式，替代之前的 overflow-tooltip */
.wrappable-text {
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  line-height: 1.4;
  max-width: 100%;
}

/* 大屏幕优化 */
@media screen and (min-width: 1200px) {
  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.5rem 0.5rem;
  }
}
</style> 