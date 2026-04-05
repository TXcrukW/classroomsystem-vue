<template>
  <div class="main-content">
    <SectionTabs />
    <div class="list">
      <div class="ticket-card" v-for="item in items" :key="item.id">
        <div class="ticket-header">
          <div class="ticket-title">{{ item.title }}</div>
          <div class="ticket-chevron">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M9 6l6 6-6 6" fill="none" stroke="#b0b0b0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        <div class="ticket-subtitle">{{ item.subtitle }}</div>
        <div class="ticket-meta">
          <div class="meta-row">
            <span class="meta-icon">&gt;</span>
            <span class="meta-label">时间：</span>
            <span class="meta-value">{{ item.start }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-icon">&gt;</span>
            <span class="meta-label">时间：</span>
            <span class="meta-value">{{ item.end }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SectionTabs from '@/components/SectionTabs.vue';
const items = [
  {
    id: 1,
    title: '校园园工单修工作工单',
    subtitle: '校园园-工作单',
    start: '020253-0:00',
    end: '2012-01:00',
  },
  {
    id: 2,
    title: '校园理工单程工作工单',
    subtitle: '校园理工-工作单',
    start: '029328-0:33',
    end: '2052-11:00',
  },
  {
    id: 3,
    title: '校园工单维程工作工单',
    subtitle: '校园工单-工作单',
    start: '025328-0:33',
    end: '2052-11:00',
  },
];
</script>

<style scoped>
.main-content {
  padding: 18px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  min-height: 520px;
  box-shadow: 0 12px 30px rgba(18, 48, 112, 0.08);
}
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 14px;
}
.ticket-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(237, 237, 237, 0.9);
}
.ticket-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.ticket-title {
  font-size: 17px;
  font-weight: 600;
  color: #2b2b2b;
}
.ticket-subtitle {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}
.ticket-meta {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #8c8c8c;
  font-size: 13px;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.meta-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #cfcfcf;
  color: #9a9a9a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.meta-label {
  color: #9a9a9a;
}
.meta-value {
  color: #6f6f6f;
}
</style>
