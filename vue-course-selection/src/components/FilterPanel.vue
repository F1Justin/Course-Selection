<template>
  <div class="filter-panel">
    <Card>
      <template #title>
        <div class="filter-header">
          <h3 class="filter-title">筛选条件</h3>
        </div>
      </template>
      
      <template #content>
        <div class="p-fluid">
          <div class="filter-item">
            <label class="filter-label" for="courseNature">课程性质</label>
            <Dropdown 
              id="courseNature"
              v-model="filters.courseNature" 
              :options="courseNatureOptions" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="选择课程性质"
              class="w-full"
              :showClear="!!filters.courseNature"
              :panelStyle="{ 'max-height': '400px', 'overflow-y': 'auto' }"
              :filter="true"
              filterPlaceholder="搜索课程性质..."
              :virtualScrollerOptions="{ itemSize: 38 }"
            />
          </div>
          
          <div class="filter-item">
            <label class="filter-label" for="campus">校区</label>
            <Dropdown 
              id="campus"
              v-model="filters.campus" 
              :options="campusOptions" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="选择校区"
              class="w-full"
              :showClear="!!filters.campus"
              :panelStyle="{ 'max-height': '400px', 'overflow-y': 'auto' }"
              :filter="true"
              filterPlaceholder="搜索校区..."
              :virtualScrollerOptions="{ itemSize: 38 }"
            />
          </div>
          
          <div class="filter-item">
            <label class="filter-label" for="department">开课学院</label>
            <Dropdown 
              id="department"
              v-model="filters.department" 
              :options="departmentOptions" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="选择开课学院"
              class="w-full"
              :showClear="!!filters.department"
              :panelStyle="{ 'max-height': '400px', 'overflow-y': 'auto' }"
              :filter="true"
              filterPlaceholder="搜索开课学院..."
              :virtualScrollerOptions="{ itemSize: 38 }"
            />
          </div>
          
          <div class="filter-item">
            <label class="filter-label" for="search">搜索</label>
            <IconField class="w-full search-input">
              <InputIcon class="pi pi-search" />
              <InputText 
                id="search"
                v-model="filters.search" 
                placeholder="搜索课程信息..." 
                class="w-full"
                @input="debounceSearch" 
              />
            </IconField>
          </div>
          
          <div class="filter-actions">
            <Button 
              label="应用筛选" 
              icon="pi pi-filter" 
              @click="applyFilters" 
              :loading="loading"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const courseStore = useCourseStore();
const loading = computed(() => courseStore.loading);
const filters = computed(() => courseStore.filters);
const filterOptions = computed(() => courseStore.filterOptions);

// 转换选项格式为PrimeVue组件所需的格式
const courseNatureOptions = computed(() => {
  const options = [
    { label: '全部', value: '' },
    { label: '选修课合集', value: '选修课合集' }
  ];
  
  filterOptions.value.courseNatures?.forEach(nature => {
    options.push({ label: nature, value: nature });
  });
  
  return options;
});

const campusOptions = computed(() => {
  const options = [{ label: '全部', value: '' }];
  
  filterOptions.value.campuses?.forEach(campus => {
    options.push({ label: campus, value: campus });
  });
  
  return options;
});

const departmentOptions = computed(() => {
  const options = [{ label: '全部', value: '' }];
  
  filterOptions.value.departments?.forEach(dept => {
    options.push({ label: dept, value: dept });
  });
  
  return options;
});

// 防抖搜索
let searchTimer = null;
const debounceSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    applyFilters();
  }, 300);
};

const applyFilters = () => {
  courseStore.applyFilters();
};

// 监听筛选器的变化，自动应用筛选
watch(() => [filters.value.courseNature, filters.value.campus, filters.value.department], 
  () => {
    applyFilters();
  }
);
</script>

<style scoped>
.filter-panel {
  margin-bottom: 0;
  height: 100%;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.filter-item {
  margin-bottom: 1rem;
}

.filter-item:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.search-input {
  margin-bottom: 1rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
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

:deep(.p-dropdown-panel .p-dropdown-items) {
  padding: 0.5rem 0;
}

:deep(.p-dropdown-item) {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
}

:deep(.p-dropdown-panel) {
  max-height: 70vh !important;
}

:deep(.p-dropdown-items-wrapper) {
  max-height: 60vh !important;
}

:deep(.p-dropdown-filter-container) {
  padding: 0.5rem;
}
</style> 