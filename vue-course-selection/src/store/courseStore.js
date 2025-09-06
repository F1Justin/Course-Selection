import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';

export const useCourseStore = defineStore('courses', () => {
  // 状态
  const originalCourses = ref([]);
  const filteredCourses = ref([]);
  const filters = ref({
    courseNature: '',
    campus: '',
    department: '',
    search: '',
    scheduleDay: null,
    scheduleTime: null // 这个值将是类似 "1-2", "10-12" 这样的字符串
  });
  const filterOptions = ref({
    courseNatures: [],
    campuses: [],
    departments: [],
    timeSlots: [] // 新增：用于存储从 timeSlots.json 加载的时间段
  });
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const pageSize = ref(35);
  const scheduleCellCourseCounts = ref({}); // { [dayIndex]: { [timeSlot]: count } }
  // 选课模拟：已选课程ID集合（使用Set包装在ref中，更新时以新Set替换以触发响应）
  const selectedCourseIds = ref(new Set());
  const SELECTED_STORAGE_KEY = 'selectedCourseIds';

  // 已选课程的按天-时间段映射：{ [dayIndex]: { [slot]: Course[] } }
  const selectedScheduleMap = computed(() => {
    const byDay = {};
    selectedCourses.value.forEach(course => {
      const entries = getCourseDaySlotEntries(course);
      entries.forEach(({ dayIndex, slot }) => {
        if (!byDay[dayIndex]) byDay[dayIndex] = {};
        if (!byDay[dayIndex][slot]) byDay[dayIndex][slot] = [];
        byDay[dayIndex][slot].push(course);
      });
    });
    return byDay;
  });

  // 冲突单元格：考虑周次与节次真实冲突（任意两门在相同周次且节次重叠）
  const conflictCells = computed(() => {
    const result = {};
    const courses = selectedCourses.value;
    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        const A = courses[i];
        const B = courses[j];
        const aEntries = extractEntriesFromSchedule(A.schedule).map(e => ({ dayIndex: e.dayIndex, slot: e.slot, units: expandSlotToUnits(e.slot), weeks: e.weeks }));
        const bEntries = extractEntriesFromSchedule(B.schedule).map(e => ({ dayIndex: e.dayIndex, slot: e.slot, units: expandSlotToUnits(e.slot), weeks: e.weeks }));
        aEntries.forEach(ae => {
          bEntries.forEach(be => {
            if (ae.dayIndex !== be.dayIndex) return;
            const unitOverlap = [...ae.units].some(u => be.units.has(u));
            if (!unitOverlap) return;
            let weeksOverlap = true;
            if (ae.weeks && be.weeks) {
              weeksOverlap = [...ae.weeks].some(w => be.weeks.has(w));
            }
            if (weeksOverlap) {
              const dayKey = String(ae.dayIndex);
              if (!result[dayKey]) result[dayKey] = {};
              result[dayKey][ae.slot] = true;
              result[dayKey][be.slot] = true;
            }
          });
        });
      }
    }
    return result;
  });
  
  // 选修课类型列表
  const electiveCourseTypes = [
    "人文经典与审美素养",
    "工程能力与创新思维",
    "社会发展与国际视野",
    "科学探索与生命关怀"
  ];

  // 计算属性
  const totalItems = computed(() => filteredCourses.value.length);
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));
  const paginatedCourses = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredCourses.value.slice(start, end);
  });
  const selectedCourses = computed(() => {
    if (!originalCourses.value?.length) return [];
    return originalCourses.value.filter(c => selectedCourseIds.value.has(c.courseId));
  });

  // 预览：按天×单节映射 { [dayIndex]: { [unitNumber]: Course[] } }
  const selectedUnitMap = computed(() => {
    const map = {};
    selectedCourses.value.forEach(course => {
      const entries = extractEntriesFromSchedule(course.schedule);
      entries.forEach(e => {
        const units = expandSlotToUnits(e.slot);
        units.forEach(u => {
          if (!map[e.dayIndex]) map[e.dayIndex] = {};
          if (!map[e.dayIndex][u]) map[e.dayIndex][u] = [];
          map[e.dayIndex][u].push(course);
        });
      });
    });
    return map;
  });
  
  // Helper to get day index from schedule string part
  function getDayIndexFromScheduleItem(scheduleItemString) {
    const dayMap = { "星期一": 1, "星期二": 2, "星期三": 3, "星期四": 4, "星期五": 5, "星期六": 6, "星期日": 7 };
    for (const [dayStr, dayIdx] of Object.entries(dayMap)) {
        if (scheduleItemString.includes(dayStr)) {
            return dayIdx;
        }
    }
    return null;
  }

  // 新增：计算每个时间单元格中的课程数量（基于非时间过滤器）
  function updateScheduleCellCourseCounts() {
    const newCounts = {};
    const coursesToConsider = originalCourses.value.filter(course => {
      // 仅应用非时间相关的筛选器
      const courseNatureMatch = !filters.value.courseNature ? true :
        filters.value.courseNature === "选修课合集" ?
          electiveCourseTypes.includes(course.courseNature) :
          course.courseNature === filters.value.courseNature;
      return (
        courseNatureMatch &&
        (!filters.value.campus || course.campus === filters.value.campus) &&
        (!filters.value.department || course.department === filters.value.department) &&
        (!filters.value.search || Object.values(course).some(value => 
          String(value).toLowerCase().includes(filters.value.search.toLowerCase())))
      );
    });

    coursesToConsider.forEach(course => {
      if (!course?.schedule) return;
      const entries = extractEntriesFromSchedule(course.schedule);
      entries.forEach(({ dayIndex, slot }) => {
        if (!newCounts[dayIndex]) newCounts[dayIndex] = {};
        if (!newCounts[dayIndex][slot]) newCounts[dayIndex][slot] = 0;
        newCounts[dayIndex][slot]++;
      });
    });
    scheduleCellCourseCounts.value = newCounts;
  }

  // 将时间段字符串如 "7-8" 展开为离散节次集合，便于精确重叠判断
  function expandSlotToUnits(slot) {
    if (!slot) return new Set();
    const [startStr, endStr] = String(slot).split('-');
    const start = parseInt(startStr);
    const end = parseInt(endStr ?? startStr);
    const units = new Set();
    if (!isNaN(start) && !isNaN(end)) {
      for (let i = start; i <= end; i++) units.add(i);
    }
    return units;
  }

  // 解析 schedule 字符串，提取 (dayIndex, slot, weeks)
  function extractEntriesFromSchedule(scheduleString) {
    const results = [];
    if (!scheduleString) return results;
    const dayMap = { "星期一": 1, "星期二": 2, "星期三": 3, "星期四": 4, "星期五": 5, "星期六": 6, "星期日": 7 };
    const partRegex = /(星期[一二三四五六日])(\d{1,2}-\d{1,2})节(?:\[([^\]]+)\])?/g;
    let m;
    while ((m = partRegex.exec(scheduleString)) !== null) {
      const dayStr = m[1];
      const slot = m[2];
      const weeksRaw = m[3] || '';
      const dayIndex = dayMap[dayStr] || null;
      if (!dayIndex) continue;
      results.push({ dayIndex, slot, weeks: parseWeeksString(weeksRaw) });
    }
    return results;
  }

  // 解析周次字符串为集合，支持 1-16 / 1-15单 / 2-16双 / 1-8,10-12 等
  function parseWeeksString(raw) {
    if (!raw) return null; // 未注明则视为所有周
    let text = String(raw).trim();
    let parity = null; // 'odd' | 'even' | null
    if (text.includes('单')) { parity = 'odd'; text = text.replace('单', ''); }
    if (text.includes('双')) { parity = 'even'; text = text.replace('双', ''); }
    const set = new Set();
    text.split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
      const m = part.match(/^(\d+)(?:-(\d+))?$/);
      if (!m) return;
      const start = parseInt(m[1]);
      const end = m[2] ? parseInt(m[2]) : start;
      for (let w = start; w <= end; w++) {
        if (parity === 'odd' && w % 2 === 0) continue;
        if (parity === 'even' && w % 2 !== 0) continue;
        set.add(w);
      }
    });
    return set.size > 0 ? set : null;
  }

  // 提取课程的 (dayIndex, slot) 列表（忽略周次，仅用于网格标记与计数）
  function getCourseDaySlotEntries(course) {
    if (!course?.schedule) return [];
    return extractEntriesFromSchedule(course.schedule).map(e => ({ dayIndex: e.dayIndex, slot: e.slot }));
  }

  // 判断某课程与当前已选是否发生时间冲突（考虑周次与节次）
  function wouldConflictWithSelected(courseOrId) {
    const course = typeof courseOrId === 'string' || typeof courseOrId === 'number'
      ? originalCourses.value.find(c => c.courseId === courseOrId)
      : courseOrId;
    if (!course) return false;

    const candidateEntries = extractEntriesFromSchedule(course.schedule).map(e => ({
      dayIndex: e.dayIndex,
      slot: e.slot,
      units: expandSlotToUnits(e.slot),
      weeks: e.weeks
    }));
    const selectedList = selectedCourses.value;
    for (const ce of candidateEntries) {
      for (const sc of selectedList) {
        if (sc.courseId === course.courseId) continue;
        const scEntries = extractEntriesFromSchedule(sc.schedule).map(e => ({
          dayIndex: e.dayIndex,
          slot: e.slot,
          units: expandSlotToUnits(e.slot),
          weeks: e.weeks
        }));
        for (const se of scEntries) {
          if (se.dayIndex !== ce.dayIndex) continue;
          const unitOverlap = [...ce.units].some(u => se.units.has(u));
          if (!unitOverlap) continue;
          let weeksOverlap = true;
          if (ce.weeks && se.weeks) weeksOverlap = [...ce.weeks].some(w => se.weeks.has(w));
          if (weeksOverlap) return true;
        }
      }
    }
    return false;
  }

  // 选课增删
  function selectCourse(courseId) {
    if (!courseId) return;
    if (selectedCourseIds.value.has(courseId)) return;
    // 以新Set替换，保证响应
    selectedCourseIds.value = new Set([...selectedCourseIds.value, courseId]);
    persistSelected();
  }

  function deselectCourse(courseId) {
    if (!courseId) return;
    if (!selectedCourseIds.value.has(courseId)) return;
    const next = new Set(selectedCourseIds.value);
    next.delete(courseId);
    selectedCourseIds.value = next;
    persistSelected();
  }

  function toggleCourseSelection(courseId) {
    if (!courseId) return;
    if (selectedCourseIds.value.has(courseId)) {
      deselectCourse(courseId);
    } else {
      selectCourse(courseId);
    }
  }

  function isCourseSelected(courseId) {
    return selectedCourseIds.value.has(courseId);
  }

  // 本地持久化
  function persistSelected() {
    try {
      const ids = Array.from(selectedCourseIds.value);
      localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      // 忽略存储异常
    }
  }

  function loadSelectedFromStorage() {
    try {
      const raw = localStorage.getItem(SELECTED_STORAGE_KEY);
      if (!raw) return;
      const ids = JSON.parse(raw);
      if (Array.isArray(ids)) {
        selectedCourseIds.value = new Set(ids);
      }
    } catch (e) {
      // 忽略解析异常
    }
  }

  // 初始化：尝试从本地恢复选课
  loadSelectedFromStorage();

  // 方法
  async function loadCourses() {
    loading.value = true;
    error.value = null;
    
    try {
      // 加载课程数据
      const response = await fetch('/data/courses.json');
      if (!response.ok) throw new Error('无法加载课程数据');
      const data = await response.json();
      originalCourses.value = data;
      filteredCourses.value = [...data];
      
      // 加载筛选器选项（课程性质、校区、开课单位）
      const filterResponse = await fetch('/data/filters.json');
      if (!filterResponse.ok) throw new Error('无法加载筛选器数据');
      const filterData = await filterResponse.json();
      filterOptions.value.courseNatures = filterData.courseNatures;
      filterOptions.value.campuses = filterData.campuses;
      filterOptions.value.departments = filterData.departments;

      // 新增：加载时间段数据
      const timeSlotsResponse = await fetch('/data/timeSlots.json');
      if (!timeSlotsResponse.ok) throw new Error('无法加载时间段数据');
      const timeSlotsData = await timeSlotsResponse.json();
      filterOptions.value.timeSlots = timeSlotsData;

      updateScheduleCellCourseCounts(); // 初始计算
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }
  
  function applyFilters() {
    loading.value = true;
    updateScheduleCellCourseCounts(); // 在应用所有筛选器之前，先更新基于非时间筛选器的课程计数
    
    setTimeout(() => {
      filteredCourses.value = originalCourses.value.filter(course => {
        // 处理"选修课合集"的特殊情况
        const courseNatureMatch = !filters.value.courseNature ? true :
          filters.value.courseNature === "选修课合集" ?
            electiveCourseTypes.includes(course.courseNature) :
            course.courseNature === filters.value.courseNature;
        
        // 基本筛选条件
        const basicMatch = (
          courseNatureMatch &&
          (!filters.value.campus || course.campus === filters.value.campus) &&
          (!filters.value.department || course.department === filters.value.department) &&
          (!filters.value.search || Object.values(course).some(value => 
            String(value).toLowerCase().includes(filters.value.search.toLowerCase())))
        );
        
        // 时间筛选
        if (!filters.value.scheduleDay || !filters.value.scheduleTime) {
          return basicMatch;
        }
        
        const dayMapping = {
          1: "星期一", 2: "星期二", 3: "星期三",
          4: "星期四", 5: "星期五", 6: "星期六", 7: "星期日"
        };
        
        // filters.value.scheduleTime 现在是 "1-2", "10-12" 这样的值
        // course.parsedTimeSlots 是一个数组，例如 ["10-11", "12-13"]
        // course.schedule 是原始的、去空格的课程时间字符串，例如 "贺磊(23079)星期四10-11节[1-3]北221,星期四12-13节[1-3]北221"

        const selectedDayString = dayMapping[filters.value.scheduleDay]; // 例如 "星期四"
        const selectedTimeSlot = filters.value.scheduleTime; // 例如 "10-12"

        // 使用精确解析匹配：星期几+具体节次，并考虑原始 parsedTimeSlots 的兼容
        const parsedEntries = extractEntriesFromSchedule(course.schedule);
        const scheduleMatch = parsedEntries.some(e => e.dayIndex === filters.value.scheduleDay && e.slot === selectedTimeSlot);
        
        return basicMatch && scheduleMatch;
      });
      
      // 重置为第一页
      currentPage.value = 1;
      loading.value = false;
    }, 0);
  }
  
  function resetScheduleFilter() {
    filters.value.scheduleDay = null;
    filters.value.scheduleTime = null;
    applyFilters();
  }
  
  function goToPage(page) {
    currentPage.value = page;
  }
  
  return {
    // 状态
    originalCourses,
    filteredCourses,
    filters,
    filterOptions,
    loading,
    error,
    currentPage,
    pageSize,
    electiveCourseTypes,
    scheduleCellCourseCounts, // 暴露给组件
    selectedCourseIds,
    selectedCourses,
    selectedScheduleMap,
    selectedUnitMap,
    conflictCells,
    
    // 计算属性
    totalItems,
    totalPages,
    paginatedCourses,
    
    // 方法
    loadCourses,
    applyFilters,
    resetScheduleFilter,
    goToPage,
    // 选课API
    selectCourse,
    deselectCourse,
    toggleCourseSelection,
    isCourseSelected,
    wouldConflictWithSelected
  };
}); 