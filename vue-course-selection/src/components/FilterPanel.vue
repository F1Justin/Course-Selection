<template>
  <div class="filter-panel">
    <el-card shadow="hover">
      <template #header>
        <div class="filter-header">
          <h3>筛选条件</h3>
        </div>
      </template>
      
      <el-form :model="filters" label-width="80px" @submit.prevent>
        <el-form-item label="课程性质">
          <el-select v-model="filters.courseNature" clearable placeholder="选择课程性质" style="width: 100%">
            <el-option value="" label="全部"></el-option>
            <el-option value="选修课合集" label="选修课合集"></el-option>
            <el-option 
              v-for="nature in filterOptions.courseNatures" 
              :key="nature" 
              :label="nature" 
              :value="nature">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="校区">
          <el-select v-model="filters.campus" clearable placeholder="选择校区" style="width: 100%">
            <el-option value="" label="全部"></el-option>
            <el-option 
              v-for="campus in filterOptions.campuses" 
              :key="campus" 
              :label="campus" 
              :value="campus">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="开课学院">
          <el-select v-model="filters.department" clearable placeholder="选择开课学院" style="width: 100%">
            <el-option value="" label="全部"></el-option>
            <el-option 
              v-for="dept in filterOptions.departments" 
              :key="dept" 
              :label="dept" 
              :value="dept">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="搜索">
          <el-input
            v-model="filters.search"
            placeholder="搜索课程信息..."
            clearable
            :prefix-icon="Search"
            @input="debounceSearch"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilters" :loading="loading" style="width: 100%">
            筛选
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCourseStore } from '@/store/courseStore';
import { Search } from '@element-plus/icons-vue';

const courseStore = useCourseStore();
const loading = computed(() => courseStore.loading);
const filters = computed(() => courseStore.filters);
const filterOptions = computed(() => courseStore.filterOptions);

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
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-header h3 {
  margin: 0;
  color: var(--text-primary);
}
</style> 