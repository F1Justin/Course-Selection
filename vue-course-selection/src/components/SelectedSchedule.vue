<template>
  <div class="selected-schedule">
    <Card>
      <template #title>
        <div class="header">
          <h3 class="title">已选课程预览</h3>
        </div>
      </template>
      <template #content>
        <div class="schedule-grid">
          <!-- 表头 -->
          <div class="grid-header">
            <div class="corner">节次</div>
            <div v-for="d in days" :key="d.value" class="day-header">{{ d.label }}</div>
          </div>

          <!-- 背景栅格与空隙行（空隙行保持列边界线） -->
          <div class="grid-body">
            <!-- 行渲染：1..totalRows，其中5、10为空隙行 -->
            <template v-for="row in totalRows" :key="'r-'+row">
              <template v-if="isGapRow(row)">
                <div class="gap-row" :style="gridPos(1, row, 8)">{{ labelForGap(row) }}</div>
              </template>
              <template v-else>
                <!-- 节次标签列 -->
                <div class="unit-label" :style="gridPos(1, row)">{{ unitForRow(row) }}</div>
                <!-- 背景单元格：7天 -->
                <div v-for="d in days" :key="'c-'+d.value+'-'+row" class="bg-cell" :style="gridPos(dayCol(d.value), row)"></div>
              </template>
            </template>

            <!-- 课程块：按天合并连续节次为一个 block，跨行显示 -->
            <div 
              v-for="blk in blocks" 
              :key="blk.key"
              class="course-block"
              :title="blk.title"
              :style="blockStyle(blk)"
            >
              <div class="block-inner">
                <div class="time-label">{{ blockUnitLabel(blk) }}</div>
                <div class="name">{{ blk.course.courseName }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
  
</template>

<script setup>
import { computed } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import Card from 'primevue/card';

const courseStore = useCourseStore();
const selectedUnitMap = computed(() => courseStore.selectedUnitMap);
const conflictCells = computed(() => courseStore.conflictCells);

const days = [
  { value: 1, label: '星期一' },
  { value: 2, label: '星期二' },
  { value: 3, label: '星期三' },
  { value: 4, label: '星期四' },
  { value: 5, label: '星期五' },
  { value: 6, label: '星期六' },
  { value: 7, label: '星期日' }
];

// 一天 11 节，插入两条空隙行：row=5(午间), row=10(傍晚)
const totalRows = 13; // 11 节 + 2 空隙
function isGapRow(row) { return row === 5 || row === 10; }
function unitForRow(row) {
  if (row <= 4) return row;
  if (row >= 6 && row <= 9) return row - 1;
  if (row >= 11) return row - 2;
  return ''; // 5 和 10 为空隙
}
function labelForGap(row) { return row === 5 ? '午休' : (row === 10 ? '傍晚' : ''); }
function rowIndexForUnit(u) {
  if (u <= 4) return u;
  if (u <= 8) return u + 1; // 5..8 跳过午间空隙
  return u + 2;             // 9..11 再跳过傍晚空隙
}

// 栅格定位助手（列从1起：1为节次列，2..8为星期列）
function gridPos(col, row, colSpan = 1) {
  return { gridColumn: `${col} / ${col + colSpan}`, gridRow: `${row} / ${row + 1}` };
}
function dayCol(dayIndex) { return dayIndex + 1; }

// 将 selectedUnitMap 合并为课程块（同一天内连续节次 -> 1 块）
const blocks = computed(() => {
  const result = [];
  for (const dayKey of Object.keys(selectedUnitMap.value || {})) {
    const dayIndex = parseInt(dayKey);
    const unitToCourses = selectedUnitMap.value[dayIndex] || {};
    // 课程 -> 单位节集合
    const courseToUnits = new Map();
    Object.entries(unitToCourses).forEach(([unitStr, courses]) => {
      const unit = parseInt(unitStr);
      courses.forEach(c => {
        if (!courseToUnits.has(c.courseId)) courseToUnits.set(c.courseId, new Set());
        courseToUnits.get(c.courseId).add(unit);
      });
    });
    // 合并连续区间
    for (const [courseId, unitSet] of courseToUnits.entries()) {
      const units = Array.from(unitSet).sort((a, b) => a - b);
      let start = null, prev = null;
      units.forEach(u => {
        if (start === null) { start = prev = u; return; }
        if (u === prev + 1) { prev = u; return; }
        pushBlock(result, dayIndex, start, prev, courseId);
        start = prev = u;
      });
      if (start !== null) pushBlock(result, dayIndex, start, prev, courseId);
    }
  }
  return result;
});

function pushBlock(list, dayIndex, startUnit, endUnit, courseId) {
  const course = findCourse(courseId);
  if (!course) return;
  const rowStart = rowIndexForUnit(startUnit);
  const rowEnd = rowIndexForUnit(endUnit) + 1; // grid end line
  list.push({
    key: `${dayIndex}-${courseId}-${startUnit}-${endUnit}`,
    dayIndex,
    rowStart,
    rowEnd,
    course,
    title: course.schedule,
    startUnit,
    endUnit
  });
}

function findCourse(courseId) {
  // 从 selectedUnitMap 的值中已含课程对象；此处为了稳定从 store.selectedCourses 查找
  return (courseStore.selectedCourses || []).find(c => c.courseId === courseId);
}

function blockStyle(blk) {
  return {
    gridColumn: `${dayCol(blk.dayIndex)} / ${dayCol(blk.dayIndex) + 1}`,
    gridRow: `${blk.rowStart} / ${blk.rowEnd}`
  };
}

function blockUnitLabel(blk) {
  return `${blk.startUnit}${blk.endUnit !== blk.startUnit ? '-' + blk.endUnit : ''}节`;
}
</script>

<style scoped>
.header { display: flex; align-items: center; justify-content: space-between; }

.schedule-grid { overflow-x: auto; }

.grid-header { display: grid; grid-template-columns: 70px repeat(7, 1fr); gap: 0; margin-bottom: 0.25rem; }
.corner { font-weight: 600; background: var(--surface-ground); padding: 0.35rem; border: 1px solid var(--surface-border); }
.day-header { font-weight: 600; background: var(--surface-ground); padding: 0.35rem; border: 1px solid var(--surface-border); text-align: center; }

.grid-body { position: relative; display: grid; grid-template-columns: 70px repeat(7, 1fr); grid-auto-rows: 40px; }
.unit-label { display: flex; align-items: center; justify-content: center; border: 1px solid var(--surface-border); background: var(--surface-0); }
.bg-cell { border: 1px solid var(--surface-border); background: var(--surface-0); z-index: 0; }
.gap-row { 
  border: 1px solid var(--surface-border);
  background: var(--surface-50);
  display: flex; align-items: center; padding-left: 10px; font-weight: 600; color: var(--text-color-secondary);
}

.course-block { 
  border-radius: 0;
  background: var(--primary-color);
  color: var(--primary-color-text, #ffffff);
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  display: flex; align-items: stretch; padding: 0; 
  overflow: hidden; z-index: 1;
  margin: 2px; /* 高度略小于单元格，避免贴边 */
}
.course-block .block-inner { padding: 0.25rem 0.4rem; width: 100%; display: flex; flex-direction: column; gap: 0.15rem; }
.course-block .time-label { opacity: 0.9; font-size: 0.7rem; }
.course-block .name { font-weight: 700; font-size: 0.9rem; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>


