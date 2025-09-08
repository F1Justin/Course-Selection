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
          <Column header="操作" style="width: 10%" :exportable="false">
            <template #body="slotProps">
              <div class="actions-cell">
                <Button
                  :label="isSelected(slotProps.data.courseId) ? '退选' : '选课'"
                  :severity="isSelected(slotProps.data.courseId) ? 'danger' : (wouldConflict(slotProps.data.courseId) ? 'warning' : 'success')"
                  size="small"
                  class="p-button-sm"
                  @click="onToggle(slotProps.data.courseId)"
                />
                <div class="conflict-hint" v-if="wouldConflict(slotProps.data.courseId)">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>{{ isSelected(slotProps.data.courseId) ? '与其他已选课程冲突' : '选中将产生冲突' }}</span>
                </div>
              </div>
            </template>
          </Column>
          <Column field="courseId" header="课程序号" sortable style="width: 10%">
            <template #body="slotProps">
              <div class="id-badges">
                <span v-if="slotProps.data.newCourseId" class="badge badge-new-id" title="新课程序号">{{ slotProps.data.newCourseId }}</span>
                <span class="badge badge-old-id" title="旧课程序号">{{ slotProps.data.courseId }}</span>
              </div>
            </template>
          </Column>
          <Column field="courseName" header="课程名称" style="width: 12%">
            <template #body="slotProps">
              <a
                :href="`https://1.tongji.icu/search?q=${encodeURIComponent(slotProps.data.courseName)}`"
                target="_blank"
                class="p-link clamped-text"
              >
                {{ slotProps.data.courseName }}
                <i class="pi pi-external-link" style="font-size: 0.75rem; margin-left: 3px"></i>
              </a>
            </template>
          </Column>
          <Column field="weeklyHours" header="周学时" style="width: 4%" align="center">
            <template #body="slotProps">
              <div class="wrappable-text clamped-text">{{ slotProps.data.weeklyHours }}</div>
            </template>
          </Column>
          <Column field="teachers" header="授课教师" style="width: 8%">
            <template #body="slotProps">
              <div class="wrappable-text clamped-text">{{ slotProps.data.teachers }}</div>
            </template>
          </Column>
          <Column field="courseNature" header="课程性质" style="width: 9%">
            <template #body="slotProps">
              <div class="wrappable-text clamped-text">{{ slotProps.data.courseNature }}</div>
            </template>
          </Column>
          <Column field="language" header="授课语言" style="width: 6%" align="center">
            <template #body="slotProps">
              <div class="wrappable-text clamped-text">{{ slotProps.data.language }}</div>
            </template>
          </Column>
          <Column field="campus" header="校区" style="width: 5%">
            <template #body="slotProps">
              <div class="wrappable-text clamped-text">{{ slotProps.data.campus }}</div>
            </template>
          </Column>
          <Column field="department" header="开课学院" style="width: 10%">
            <template #body="slotProps">
              <div class="wrappable-text clamped-text">{{ slotProps.data.department }}</div>
            </template>
          </Column>
          <Column field="auditInfo" header="听课专业" style="width: 16%">
            <template #body="slotProps">
              <div 
                class="wrappable-text clamped-text clickable-cell"
                @click="openCellDetail($event, slotProps.data.auditInfo, '听课专业')"
                :title="'点击查看完整内容'"
              >
                {{ slotProps.data.auditInfo }}
              </div>
            </template>
          </Column>
          <Column field="schedule" header="排课信息" style="width: 17%">
            <template #body="slotProps">
              <div 
                class="wrappable-text clamped-text clickable-cell"
                @click="openCellDetail($event, slotProps.data.schedule, '排课信息')"
                :title="'点击查看完整内容'"
              >
                {{ slotProps.data.schedule }}
              </div>
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

    <!-- 单击表格单元弹出完整信息 -->
    <OverlayPanel ref="op" :dismissable="true" showCloseIcon>
      <div class="overlay-content">
        <div class="overlay-title">{{ overlayTitle }}</div>
        <div class="overlay-text">{{ overlayText }}</div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import OverlayPanel from 'primevue/overlaypanel';

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

// 选课交互
function isSelected(courseId) {
  return courseStore.isCourseSelected(courseId);
}

function wouldConflict(courseId) {
  return courseStore.wouldConflictWithSelected(courseId);
}

function onToggle(courseId) {
  courseStore.toggleCourseSelection(courseId);
}

// 长文本弹出
const op = ref();
const overlayText = ref('');
const overlayTitle = ref('');
function openCellDetail(event, text, title) {
  overlayText.value = String(text || '');
  overlayTitle.value = String(title || '详情');
  op.value?.show(event);
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

.actions-cell {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.conflict-hint {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #d97706;
}

/* 序号双色徽标 */
.id-badges { display: flex; gap: 0.25rem; align-items: center; flex-wrap: wrap; }
.badge { display: inline-flex; align-items: center; padding: 0 0.35rem; border-radius: 6px; font-size: 0.8rem; line-height: 1.4; }
.badge-new-id { background: #dbeafe; color: #1e3a8a; border: 1px solid #bfdbfe; }
.badge-old-id { background: #ecfccb; color: #3f6212; border: 1px solid #d9f99d; }

/* 4行截断与点击展开 */
.clamped-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  overflow: hidden;
}

.clickable-cell {
  cursor: pointer;
}

.overlay-content {
  max-width: min(70vw, 800px);
  max-height: 60vh;
  overflow: auto;
}

.overlay-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.overlay-text {
  white-space: pre-wrap;
  line-height: 1.5;
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