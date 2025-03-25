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
    scheduleTime: null
  });
  const filterOptions = ref({
    courseNatures: [],
    campuses: [],
    departments: []
  });
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const pageSize = ref(35);
  
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
      
      // 加载筛选器选项
      const filterResponse = await fetch('/data/filters.json');
      if (!filterResponse.ok) throw new Error('无法加载筛选器数据');
      const filterData = await filterResponse.json();
      filterOptions.value = filterData;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }
  
  function applyFilters() {
    loading.value = true;
    
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
        
        const scheduleFilter = `${dayMapping[filters.value.scheduleDay]}${filters.value.scheduleTime}`;
        const scheduleItems = course.schedule.split(',').map(s => s.trim());
        const scheduleMatch = scheduleItems.some(item => {
          const cleanItem = item.replace(/\s+/g, '');
          return cleanItem.includes(scheduleFilter);
        });
        
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
    
    // 计算属性
    totalItems,
    totalPages,
    paginatedCourses,
    
    // 方法
    loadCourses,
    applyFilters,
    resetScheduleFilter,
    goToPage
  };
}); 