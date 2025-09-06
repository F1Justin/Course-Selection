<template>
  <div class="container">
    <header class="toolbar">
      <Button label="← 返回选课" text @click="goBack" />
    </header>

    <main>
      <div class="grid">
        <div class="col-12">
          <SelectedSchedule />
        </div>
        <div class="col-12">
          <SelectedCourses />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '@/store/courseStore';
import SelectedCourses from '@/components/SelectedCourses.vue';
import SelectedSchedule from '@/components/SelectedSchedule.vue';
import Button from 'primevue/button';

const router = useRouter();
const store = useCourseStore();
const selectedCount = computed(() => store.selectedCourses.length);

function goBack() { router.push('/'); }
function clearAll() {
  // 逐个移除，保持状态一致
  [...store.selectedCourseIds].forEach(id => store.deselectCourse(id));
}
</script>

<style scoped>
.container { max-width: 1400px; margin: 0 auto; padding: 0 15px; min-height: 100vh; display: flex; flex-direction: column; }
.toolbar { display: flex; align-items: center; gap: 0.5rem; padding: 1rem 0; }
.spacer { flex: 1; }
main { flex: 1; display: flex; flex-direction: column; }
</style>


