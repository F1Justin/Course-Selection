<template>
  <div class="schedule-grid">
    <Card>
      <template #title>
        <div class="schedule-header">
          <h3 class="schedule-title">按时间筛选</h3>
          <Button 
            label="重置时间筛选" 
            outlined 
            @click="resetSchedule" 
            :disabled="!hasActiveCell"
            class="p-button-sm"
          />
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
            <tbody>
              <tr v-for="slot in scheduleData" :key="slot.slot">
                <td>{{ slot.time }}</td>
                <td
                  v-for="day in days"
                  :key="`${day.value}-${slot.slot}`"
                  :class="['schedule-cell', { 'active': isActive(day.value, slot.slot) }]"
                  @click="selectTimeSlot(day.value, slot.slot)"
                >
                  &nbsp;
                </td>
              </tr>
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

const days = [
  { value: 1, label: '星期一' },
  { value: 2, label: '星期二' },
  { value: 3, label: '星期三' },
  { value: 4, label: '星期四' },
  { value: 5, label: '星期五' },
  { value: 6, label: '星期六' },
  { value: 7, label: '星期日' }
];

const scheduleData = [
  { time: '1-2节', slot: '1-2' },
  { time: '3-4节', slot: '3-4' },
  { time: '5-6节', slot: '5-6' },
  { time: '7-8节', slot: '7-8' },
  { time: '10-11节', slot: '10-11' }
];

const hasActiveCell = computed(() => {
  return filters.value.scheduleDay !== null && filters.value.scheduleTime !== null;
});

function isActive(day, time) {
  return filters.value.scheduleDay === day && filters.value.scheduleTime === time;
}

function selectTimeSlot(day, time) {
  // 如果点击已选中的单元格，则取消选择
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

.schedule-cell:hover {
  background-color: var(--surface-hover);
}

.schedule-cell.active {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
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

@media (prefers-color-scheme: dark) {
  .schedule-cell:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
}
</style> 