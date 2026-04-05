<template>
  <div class="section-tabs">
    <button :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">待处理</button>
    <button :class="{ active: activeTab === 'processing' }" @click="activeTab = 'processing'">处理中</button>
    <button :class="{ active: activeTab === 'done' }" @click="activeTab = 'done'">已完成</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const activeTab = ref('pending');
// 可通过 emit 通知父组件切换内容
</script>

<style scoped>
.section-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  padding: 4px 12px 10px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.75));
}
.section-tabs button {
  position: relative;
  padding: 10px 0;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #666;
  cursor: pointer;
}
.section-tabs button.active {
  color: #2b6df8;
  font-weight: 600;
}
.section-tabs button.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 28px;
  height: 3px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #2b6df8;
}
</style>
