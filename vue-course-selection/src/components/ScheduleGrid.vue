<template>
  <div class="schedule-grid">
    <Card>
      <template #title>
        <div class="schedule-header">
          <h3 class="schedule-title">按时间筛选</h3>
          <div class="actions-container">
            <Button 
              :label="showAllTimeCategories ? '仅显示常用' : '显示所有时段'" 
              text 
              @click="toggleShowAllTimeCategories" 
              class="p-button-sm p-button-secondary" 
            />
            <Button 
              label="重置时间筛选" 
              outlined 
              @click="resetSchedule" 
              :disabled="!hasActiveCell"
              class="p-button-sm"
            />
          </div>
        </div>
      </template>
      
      <template #content>
        <div class="schedule-table-container">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>时间段</th>
                <th v-for="day in days" :key="day.value">{{ day.label }}</th>
              </tr>
            </thead>
            <template v-for="category in categorizedScheduleData" :key="category.title">
              <tr class="category-header-row" v-if="category.slots.length > 0">
                <td :colspan="days.length + 1" class="category-header">{{ category.title }}</td>
              </tr>
              <tr v-for="item in category.slots" :key="item.slot">
                <td>{{ item.time }}</td>
                <td
                  v-for="day in days"
                  :key="`${day.value}-${item.slot}`"
                  :class="[
                    'schedule-cell',
                    { 'active': isActive(day.value, item.slot) },
                    { 'disabled-cell': !hasCoursesInCell(day.value, item.slot) }
                  ]"
                  @click="hasCoursesInCell(day.value, item.slot) ? selectTimeSlot(day.value, item.slot) : null"
                >
                  <span v-if="hasCoursesInCell(day.value, item.slot)">&nbsp;</span>
                  <span v-else class="disabled-marker">-</span>
                </td>
              </tr>
            </template>
            <tbody v-if="!categorizedScheduleData || categorizedScheduleData.length === 0">
                <tr><td :colspan="days.length + 1" style="text-align: center; padding: 1rem;">正在加载或无可用时间段...</td></tr>
            </tbody>
          </table>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import Card from 'primevue/card';
import Button from 'primevue/button';

const courseStore = useCourseStore();
const filters = computed(() => courseStore.filters);
const filterOptions = computed(() => courseStore.filterOptions);
const scheduleCellCourseCounts = computed(() => courseStore.scheduleCellCourseCounts);

const showAllTimeCategories = ref(false);

const days = [
  { value: 1, label: '星期一' },
  { value: 2, label: '星期二' },
  { value: 3, label: '星期三' },
  { value: 4, label: '星期四' },
  { value: 5, label: '星期五' },
  { value: 6, label: '星期六' },
  { value: 7, label: '星期日' }
];

const categorizedScheduleData = computed(() => {
  const allSlots = filterOptions.value.timeSlots;
  if (!allSlots || allSlots.length === 0) {
    return [];
  }

  const commonTwoSessionSlots = ["1-2", "3-4", "5-6", "7-8", "9-10", "10-11", "12-13"];

  let categoriesDefinition = {
    common: { title: '常用 (2节课)', slots: [], order: 1 },
    ...(showAllTimeCategories.value && {
      single: { title: '单节课', slots: [], order: 2 },
      triple: { title: '3节课', slots: [], order: 3 },
      quadPlus: { title: '4节及以上', slots: [], order: 4 },
      other: { title: '其他时段', slots: [], order: 5 }
    })
  };

  const consumedSlots = new Set();

  commonTwoSessionSlots.forEach(s => {
    if (allSlots.includes(s)) {
      categoriesDefinition.common.slots.push({ time: `${s}节`, slot: s });
      consumedSlots.add(s);
    }
  });

  if (showAllTimeCategories.value) {
    allSlots.forEach(s => {
      if (consumedSlots.has(s)) return;
      const parts = s.split('-');
      let categoryKey = 'other';
      if (parts.length === 2) {
          const start = parseInt(parts[0]);
          const end = parseInt(parts[1]);
          if (!isNaN(start) && !isNaN(end)) {
              const duration = end - start + 1;
              if (duration === 1) categoryKey = 'single';
              else if (duration === 3) categoryKey = 'triple';
              else if (duration >= 4) categoryKey = 'quadPlus';
          }
      }
      if (categoriesDefinition[categoryKey]) {
        categoriesDefinition[categoryKey].slots.push({ time: `${s}节`, slot: s });
      }
      consumedSlots.add(s);
    });
  }
  
  return Object.values(categoriesDefinition)
    .filter(cat => cat.slots && cat.slots.length > 0)
    .sort((a, b) => a.order - b.order);
});

function hasCoursesInCell(dayIndex, timeSlot) {
  return (scheduleCellCourseCounts.value[dayIndex]?.[timeSlot] || 0) > 0;
}

const hasActiveCell = computed(() => {
  return filters.value.scheduleDay !== null && 
         filters.value.scheduleTime !== null &&
         hasCoursesInCell(filters.value.scheduleDay, filters.value.scheduleTime);
});

function isActive(day, time) {
  return filters.value.scheduleDay === day && 
         filters.value.scheduleTime === time && 
         hasCoursesInCell(day, time);
}

function selectTimeSlot(day, time) {
  if (!hasCoursesInCell(day, time)) return;

  if (isActive(day, time)) {
    resetSchedule();
    return;
  }
  
  filters.value.scheduleDay = day;
  filters.value.scheduleTime = time;
  courseStore.applyFilters();
}

function resetSchedule() {
  courseStore.resetScheduleFilter();
}

function toggleShowAllTimeCategories() {
  showAllTimeCategories.value = !showAllTimeCategories.value;
}
</script>

<style scoped>
.schedule-grid {
  margin-bottom: 0;
  height: 100%;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.schedule-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th,
.schedule-table td {
  border: 1px solid var(--surface-border);
  text-align: center;
  padding: 0.5rem 0.3rem;
  font-size: 0.85rem;
  min-height: 2.5em;
  box-sizing: border-box;
}

.schedule-table th {
  background-color: var(--surface-ground);
  color: var(--text-color);
  font-weight: 600;
}

.schedule-cell {
  cursor: pointer;
  transition: background-color 0.2s;
}

.schedule-cell:hover:not(.disabled-cell):not(.active) {
  background-color: var(--surface-hover);
}

.schedule-cell.active {
  background-color: var(--primary-color);
  color: var(--primary-color-text, #ffffff);
}

.schedule-cell.disabled-cell {
  background-color: var(--surface-100);
  color: var(--surface-400);
  cursor: not-allowed;
}

.schedule-cell.disabled-cell:hover {
  background-color: var(--surface-100);
}

.disabled-marker {
    color: var(--surface-400);
    font-size: 0.9em;
}

:deep(.p-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.p-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.p-card-content) {
  flex: 1;
  padding-top: 0;
}

.category-header-row {
  background-color: var(--surface-50);
  position: sticky;
  top: 0;
  z-index: 1;
}

.category-header-row:first-child {
}

.category-header {
  text-align: left !important;
  padding: 0.4rem 0.6rem !important;
  font-weight: 600;
  color: var(--text-color-secondary);
  font-size: 0.8rem;
  border-bottom: 1px solid var(--surface-border);
}

/* 深色模式样式 - 使用data-theme属性而不是media query */
[data-theme="dark"] .category-header-row {
  background-color: #2a2a2a;
}

[data-theme="dark"] .category-header {
  color: #e5e7eb;
}

[data-theme="dark"] .schedule-cell:hover:not(.disabled-cell):not(.active) {
  background-color: rgba(255, 255, 255, 0.08);
}

[data-theme="dark"] .schedule-cell.disabled-cell {
  background-color: #374151; /* 深灰色背景 */
  color: #9ca3af; /* 浅灰色文字 */
}

[data-theme="dark"] .schedule-cell.disabled-cell:hover {
  background-color: #374151; /* 悬停时保持同样的深灰色 */
}

[data-theme="dark"] .disabled-marker {
  color: #9ca3af;
}

.actions-container {
  display: flex;
  gap: 0.5rem;
}
</style> 