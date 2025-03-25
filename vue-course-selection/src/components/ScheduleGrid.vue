<template>
  <div class="schedule-grid">
    <el-card shadow="hover">
      <template #header>
        <div class="schedule-header">
          <h3>按时间筛选</h3>
          <el-button type="primary" plain @click="resetSchedule" :disabled="!hasActiveCell">
            重置时间筛选
          </el-button>
        </div>
      </template>
      
      <div class="schedule-table-container">
        <el-table :data="scheduleData" border style="width: 100%" :cell-class-name="getCellClass">
          <el-table-column prop="time" label="时间段" width="100" align="center" />
          <el-table-column v-for="day in days" :key="day.value" :label="day.label" align="center">
            <template #default="scope">
              <div 
                class="schedule-cell" 
                @click="selectTimeSlot(day.value, scope.row.slot)"
                :class="{ 'is-active': isActive(day.value, scope.row.slot) }"
              >
                <span>&nbsp;</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCourseStore } from '@/store/courseStore';

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

function getCellClass({ row, column, rowIndex, columnIndex }) {
  // 第一列是时间标签，不需要特殊处理
  if (columnIndex === 0) return '';
  
  // 计算对应的日期值（星期几）
  const day = columnIndex; // columnIndex从1开始，正好对应days的索引+1
  
  return isActive(day, row.slot) ? 'active-cell' : '';
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
  margin-bottom: 20px;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.schedule-table-container {
  overflow-x: auto;
}

.schedule-cell {
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.schedule-cell:hover {
  background-color: #f0f7ff;
}

.schedule-cell.is-active {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
}

:deep(.active-cell) {
  background-color: var(--primary-color);
  color: white;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover .active-cell) {
  background-color: var(--primary-color) !important;
}

@media (prefers-color-scheme: dark) {
  .schedule-cell:hover {
    background-color: #18222c;
  }
}
</style> 