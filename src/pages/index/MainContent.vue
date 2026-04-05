<template>
  <div class="main-content">
    <SectionTabs :status="status" />
    
    <div class="empty-state">
      <div class="empty-text">
        <p class="empty-title">暂无新的工单</p>
        <p class="empty-subtitle">工单创建可能存在延迟或遗漏，请关注教室服务群</p>
      </div>
      <button class="refresh-btn" @click="handleRefresh">
        刷新状态
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import SectionTabs from '@/components/SectionTabs.vue';

defineProps<{
  status: 'offline' | 'online' | 'break';
}>();

const handleRefresh = () => {
  // 刷新逻辑
  console.log('刷新工单列表');
};
</script>

<style scoped>
.main-content {
  background: #f5f5f5;
  min-height: calc(100vh - 88px - var(--status-bar-height, 0px));
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px 80px;
}

.empty-text {
  text-align: center;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 18px;
  color: #505050;
  font-weight: 600;
  margin-bottom: 12px;
}

.empty-subtitle {
  font-size: 14px;
  color: #9b9b9b;
  line-height: 1.5;
}

.refresh-btn {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  color: #fff;
  border: none;
  padding: 14px 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
  transition: all 0.2s;
}

.refresh-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}
</style>
