<template>
  <div class="selected-courses">
    <Card>
      <template #title>
        <div class="header">
          <h3 class="title">已选课程</h3>
          <span class="count">共 {{ selectedCourses.length }} 门</span>
        </div>
      </template>

      <template #content>
        <div v-if="selectedCourses.length === 0" class="empty">
          <i class="pi pi-info-circle" /> 尚未选择任何课程
        </div>

        <ul v-else class="course-list">
          <li v-for="c in selectedCourses" :key="c.courseId" class="course-item">
            <div class="meta">
              <div class="name">
                <strong>{{ c.courseName }}</strong>
                <span class="muted">（{{ c.courseId }}）</span>
              </div>
              <div class="sub">
                <span class="badge">{{ c.courseNature }}</span>
                <span class="muted">{{ c.campus }}</span>
                <span class="muted">{{ c.department }}</span>
              </div>
              <div class="schedule clamped-text" @click="openDetail($event, c.schedule, '排课信息')" title="点击查看完整排课">
                {{ c.schedule }}
              </div>
            </div>
            <div class="actions">
              <Button label="退选" severity="danger" size="small" @click="remove(c.courseId)" />
              <Button label="查看课程评价" icon="pi pi-external-link" size="small" outlined @click="openReview(c.courseName)" />
            </div>
          </li>
        </ul>
      </template>
    </Card>

    <OverlayPanel ref="op" :dismissable="true" showCloseIcon>
      <div class="overlay-content">
        <div class="overlay-title">{{ overlayTitle }}</div>
        <div class="overlay-text">{{ overlayText }}</div>
      </div>
    </OverlayPanel>
  </div>
  
</template>

<script setup>
import { computed, ref } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import Card from 'primevue/card';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';

const courseStore = useCourseStore();
const selectedCourses = computed(() => courseStore.selectedCourses);

function remove(courseId) {
  courseStore.deselectCourse(courseId);
}

function openReview(courseName) {
  const url = `https://1.tongji.icu/search?q=${encodeURIComponent(courseName || '')}`;
  window.open(url, '_blank');
}

const op = ref();
const overlayText = ref('');
const overlayTitle = ref('');
function openDetail(event, text, title) {
  overlayText.value = String(text || '');
  overlayTitle.value = String(title || '详情');
  op.value?.show(event);
}
</script>

<style scoped>
.selected-courses {
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  font-size: 1.1rem;
}

.count {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.empty {
  color: var(--text-color-secondary);
}

.course-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.course-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px dashed var(--surface-border);
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name {
  display: flex;
  gap: 0.25rem;
  align-items: baseline;
}

.muted {
  color: var(--text-color-secondary);
  font-size: 0.9em;
}

.badge {
  background-color: var(--surface-100);
  color: var(--text-color-secondary);
  padding: 0.1rem 0.35rem;
  border-radius: 6px;
  margin-right: 0.5rem;
}

.schedule {
  max-width: 900px;
  cursor: pointer;
}

/* 复用 4 行截断样式 */
.clamped-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  overflow: hidden;
}

.actions {
  flex-shrink: 0;
  display: flex;
  gap: 0.5rem;
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
</style>


