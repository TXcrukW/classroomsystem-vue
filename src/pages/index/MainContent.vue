<template>
  <div class="main-content">
    <SectionTabs v-model="activeTab" :status="status" />
    <div
      class="content-area"
      @touchstart="handleTabSwipeStart($event)"
      @touchmove="handleTabSwipeMove($event)"
      @touchend="handleTabSwipeEnd"
      @mousedown="handleTabMouseDown($event)"
    >
      <div v-if="displayTickets.length" class="ticket-list">
        <article v-for="ticket in displayTickets" :key="ticket.id" class="ticket-card">
          <div class="meta-row">
            <p>
              <span class="label label-blue">教室:</span>
              <span class="value">{{ ticket.classroom_id || '-' }}</span>
            </p>
            <p>
              <span class="label">用户:</span>
              <span class="value">{{ ticket.nickname || '-' }}</span>
            </p>
          </div>
          <div class="content-block">
            <p class="content-title">内容:</p>
            <p class="content-text">{{ ticket.message || '暂无内容' }}</p>
          </div>
          <p class="detail-line">
            <span class="label" :class="ticket.status === 'abnormal' ? 'label-danger' : 'label-purple'">状态:</span>
            <span class="value" :class="{ 'value-danger': ticket.status === 'abnormal' }">{{ statusText(ticket.status) }}</span>
          </p>
          <p class="detail-line">
            <span class="label">工单类型:</span>
            <span class="value">{{ ticket.issue_type || '-' }}</span>
          </p>
          <p class="detail-line">
            <span class="label label-orange">发起时间:</span>
            <span class="value">{{ formatTime(ticket.time) }}</span>
          </p>
          <div class="swipe-action" :id="`swipe-${ticket.id}`">
            <div class="swipe-hint">
              {{ loadingTicketId === ticket.id ? '处理中...' : activeTab === 'waiting' ? '向右滑动接起工单' : '向右滑动完成工单' }}
            </div>
            <div
              class="swipe-handle"
              :class="{ disabled: loadingTicketId === ticket.id }"
              :style="swipeStyle(ticket.id)"
            >
              <span class="swipe-arrow">→</span>
            </div>
            <div
              class="swipe-touch-layer"
              @touchstart.stop.prevent="handleSwipeStart(ticket.id, $event)"
              @touchmove.stop.prevent="handleSwipeMove(ticket.id, $event)"
              @touchend.stop="handleSwipeEnd(ticket)"
              @touchcancel.stop="handleSwipeCancel(ticket.id)"
              @mousedown.stop.prevent="handleSwipeMouseDown(ticket.id, $event)"
            />
          </div>
        </article>
      </div>
      <div v-else class="empty-state">
        <p class="empty-title">{{ activeTab === 'waiting' ? '暂无等待接起工单' : '暂无待完成工单' }}</p>
        <p class="empty-subtitle">{{ loading ? '正在同步后端工单数据...' : '工单创建可能存在延迟，请稍后刷新重试' }}</p>
        <button class="refresh-btn" :disabled="loading" @click="handleManualRefresh">
          {{ loading ? '同步中...' : '刷新状态' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue';
import SectionTabs from '@/components/SectionTabs.vue';
import { completeTicket, createTicketsEventSource, fetchOpenTickets, type Ticket, type TicketStatus } from '@/api/tickets';

type TicketTab = 'waiting' | 'pending';

defineProps<{
  status: 'offline' | 'online' | 'break';
}>();

const activeTab = ref<TicketTab>('waiting');
const loading = ref(false);
const loadingTicketId = ref<number | null>(null);
const tickets = ref<Ticket[]>([]);
const claimedTicketIds = ref<Record<number, true>>({});
const swipeOffsetMap = ref<Record<number, number>>({});
const swipeMaxMap = ref<Record<number, number>>({});
const draggingTicketId = ref<number | null>(null);
let eventSource: EventSource | null = null;
let reconnectTimer: number | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let refreshing = false;
let swipeStartX = 0;
let swipeStartOffset = 0;
let mouseDraggingTicketId: number | null = null;

const vm = getCurrentInstance();

const POLL_INTERVAL = 2000;
const DEFAULT_SWIPE_MAX = 170;
const SWIPE_HANDLE_WIDTH = 80;
const SWIPE_CONFIRM_RATIO = 0.82;

const normalizeTickets = (list: Ticket[]) => {
  return [...list].sort((a, b) => Number(b.updated_at || b.time) - Number(a.updated_at || a.time));
};

const isActiveStatus = (status: TicketStatus) => status !== 'resolved';

const waitingTickets = computed(() => {
  return tickets.value.filter((ticket) => isActiveStatus(ticket.status) && !claimedTicketIds.value[ticket.id]);
});

const pendingTickets = computed(() => {
  return tickets.value.filter((ticket) => isActiveStatus(ticket.status) && claimedTicketIds.value[ticket.id]);
});

const displayTickets = computed(() => (activeTab.value === 'waiting' ? waitingTickets.value : pendingTickets.value));

const notify = (title: string, icon: 'none' | 'success' = 'none') => {
  uni.showToast({ title, icon, duration: 1800 });
};

const mergeTicket = (ticket: Ticket) => {
  if (!isActiveStatus(ticket.status)) {
    tickets.value = tickets.value.filter((item) => item.id !== ticket.id);
    if (claimedTicketIds.value[ticket.id]) {
      const next = { ...claimedTicketIds.value };
      delete next[ticket.id];
      claimedTicketIds.value = next;
    }
    return;
  }

  const index = tickets.value.findIndex((item) => item.id === ticket.id);
  if (index === -1) {
    tickets.value = normalizeTickets([...tickets.value, ticket]);
    return;
  }

  const next = [...tickets.value];
  next[index] = ticket;
  tickets.value = normalizeTickets(next);
};

const removeTicket = (ticketId: number) => {
  tickets.value = tickets.value.filter((item) => item.id !== ticketId);
  if (claimedTicketIds.value[ticketId]) {
    const next = { ...claimedTicketIds.value };
    delete next[ticketId];
    claimedTicketIds.value = next;
  }

  if (swipeOffsetMap.value[ticketId] !== undefined || swipeMaxMap.value[ticketId] !== undefined) {
    const nextOffset = { ...swipeOffsetMap.value };
    const nextMax = { ...swipeMaxMap.value };
    delete nextOffset[ticketId];
    delete nextMax[ticketId];
    swipeOffsetMap.value = nextOffset;
    swipeMaxMap.value = nextMax;
  }
};

const getSwipeOffset = (ticketId: number) => swipeOffsetMap.value[ticketId] || 0;

const getSwipeMax = (ticketId: number) => swipeMaxMap.value[ticketId] || DEFAULT_SWIPE_MAX;

const setSwipeOffset = (ticketId: number, offset: number) => {
  swipeOffsetMap.value = {
    ...swipeOffsetMap.value,
    [ticketId]: offset,
  };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const measureSwipeMax = (ticketId: number): Promise<number> => {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery().in(vm?.proxy as any);
    query
      .select(`#swipe-${ticketId}`)
      .boundingClientRect((result) => {
        const rect = Array.isArray(result) ? result[0] : result;
        if (!rect?.width) {
          resolve(DEFAULT_SWIPE_MAX);
          return;
        }

        resolve(Math.max(rect.width - SWIPE_HANDLE_WIDTH - 8, 96));
      })
      .exec();
  });
};

const ensureSwipeMax = async (ticketId: number) => {
  if (swipeMaxMap.value[ticketId]) {
    return;
  }

  const max = await measureSwipeMax(ticketId);
  swipeMaxMap.value = {
    ...swipeMaxMap.value,
    [ticketId]: max,
  };
};

const resetSwipe = (ticketId: number) => {
  setSwipeOffset(ticketId, 0);
};

const swipeStyle = (ticketId: number) => {
  return {
    transform: `translateX(${getSwipeOffset(ticketId)}px)`,
    transition: draggingTicketId.value === ticketId ? 'none' : 'transform 0.2s ease',
  };
};

const handleSwipeStart = async (ticketId: number, event: TouchEvent) => {
  if (loadingTicketId.value === ticketId) {
    return;
  }

  await ensureSwipeMax(ticketId);
  draggingTicketId.value = ticketId;
  swipeStartX = event.touches?.[0]?.clientX || 0;
  swipeStartOffset = getSwipeOffset(ticketId);
};

const handleSwipeMove = (ticketId: number, event: TouchEvent) => {
  if (draggingTicketId.value !== ticketId || loadingTicketId.value === ticketId) {
    return;
  }

  const currentX = event.touches?.[0]?.clientX || 0;
  const delta = currentX - swipeStartX;
  const nextOffset = clamp(swipeStartOffset + delta, 0, getSwipeMax(ticketId));
  setSwipeOffset(ticketId, nextOffset);
};

const handleSwipeEnd = async (ticket: Ticket) => {
  if (draggingTicketId.value !== ticket.id) {
    return;
  }

  draggingTicketId.value = null;
  const max = getSwipeMax(ticket.id);
  const offset = getSwipeOffset(ticket.id);
  const confirmed = offset >= max * SWIPE_CONFIRM_RATIO;

  if (!confirmed) {
    resetSwipe(ticket.id);
    return;
  }

  setSwipeOffset(ticket.id, max);
  await handleAction(ticket);
  resetSwipe(ticket.id);
};

const handleSwipeCancel = (ticketId: number) => {
  if (draggingTicketId.value === ticketId) {
    draggingTicketId.value = null;
  }
  resetSwipe(ticketId);
};

const handleSwipeMouseMove = (event: MouseEvent) => {
  if (mouseDraggingTicketId === null) {
    return;
  }

  const ticketId = mouseDraggingTicketId;
  const delta = event.clientX - swipeStartX;
  const nextOffset = clamp(swipeStartOffset + delta, 0, getSwipeMax(ticketId));
  setSwipeOffset(ticketId, nextOffset);
};

const handleSwipeMouseUp = async () => {
  if (mouseDraggingTicketId === null) {
    return;
  }

  const ticketId = mouseDraggingTicketId;
  mouseDraggingTicketId = null;
  window.removeEventListener('mousemove', handleSwipeMouseMove);
  window.removeEventListener('mouseup', handleSwipeMouseUp);

  const target = tickets.value.find((item) => item.id === ticketId);
  if (!target) {
    resetSwipe(ticketId);
    return;
  }

  await handleSwipeEnd(target);
};

const handleSwipeMouseDown = async (ticketId: number, event: MouseEvent) => {
  if (loadingTicketId.value === ticketId) {
    return;
  }

  await ensureSwipeMax(ticketId);
  draggingTicketId.value = ticketId;
  mouseDraggingTicketId = ticketId;
  swipeStartX = event.clientX;
  swipeStartOffset = getSwipeOffset(ticketId);

  window.addEventListener('mousemove', handleSwipeMouseMove);
  window.addEventListener('mouseup', handleSwipeMouseUp);
};

const refreshTickets = async (options: { silent?: boolean } = {}) => {
  if (refreshing) {
    return;
  }

  const silent = Boolean(options.silent);
  refreshing = true;
  if (!silent) {
    loading.value = true;
  }

  try {
    const list = await fetchOpenTickets();
    tickets.value = normalizeTickets(list.filter((item) => isActiveStatus(item.status)));

    const activeIdSet = new Set(tickets.value.map((item) => item.id));
    const nextClaimed: Record<number, true> = {};
    Object.keys(claimedTicketIds.value).forEach((id) => {
      const numId = Number(id);
      if (activeIdSet.has(numId)) {
        nextClaimed[numId] = true;
      }
    });
    claimedTicketIds.value = nextClaimed;
  } catch (error) {
    console.error(error);
    if (!silent) {
      notify('工单同步失败，请检查后端服务');
    }
  } finally {
    if (!silent) {
      loading.value = false;
    }
    refreshing = false;
  }
};

const startPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  pollTimer = setInterval(() => {
    refreshTickets({ silent: true });
  }, POLL_INTERVAL);
};

const connectStream = () => {
  eventSource = createTicketsEventSource();
  if (!eventSource) {
    console.warn('当前环境不支持 EventSource，跳过实时同步');
    return;
  }

  eventSource.addEventListener('snapshot', (event) => {
    const payload = JSON.parse((event as MessageEvent).data || '{}') as { tickets?: Ticket[] };
    const nextTickets = (payload.tickets || []).filter((item) => isActiveStatus(item.status));
    tickets.value = normalizeTickets(nextTickets);
  });

  eventSource.addEventListener('ticket_created', (event) => {
    const payload = JSON.parse((event as MessageEvent).data || '{}') as Ticket;
    mergeTicket(payload);
  });

  eventSource.addEventListener('ticket_updated', (event) => {
    const payload = JSON.parse((event as MessageEvent).data || '{}') as Ticket;
    mergeTicket(payload);
  });

  eventSource.addEventListener('ticket_expired', (event) => {
    const payload = JSON.parse((event as MessageEvent).data || '{}') as { id?: number };
    if (payload.id) {
      removeTicket(payload.id);
    }
  });

  eventSource.onerror = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    refreshTickets({ silent: true });

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    reconnectTimer = setTimeout(() => {
      connectStream();
    }, 3000);
  };
};

// --- tab滑动切换 ---
let tabSwipeStartX = 0;
let tabSwipeDeltaX = 0;
let tabSwipeActive = false;
let tabMouseDown = false;

const handleTabSwipeStart = (event: TouchEvent) => {
  if (event.touches.length !== 1) return;
  tabSwipeStartX = event.touches[0].clientX;
  tabSwipeDeltaX = 0;
  tabSwipeActive = true;
};

const handleTabSwipeMove = (event: TouchEvent) => {
  if (!tabSwipeActive) return;
  const x = event.touches[0].clientX;
  tabSwipeDeltaX = x - tabSwipeStartX;
};

const handleTabSwipeEnd = () => {
  if (!tabSwipeActive) return;
  if (tabSwipeDeltaX > 60 && activeTab.value === 'pending') {
    activeTab.value = 'waiting';
  } else if (tabSwipeDeltaX < -60 && activeTab.value === 'waiting') {
    activeTab.value = 'pending';
  }
  tabSwipeActive = false;
  tabSwipeDeltaX = 0;
};

// 鼠标拖动兼容
const handleTabMouseDown = (event: MouseEvent) => {
  tabMouseDown = true;
  tabSwipeStartX = event.clientX;
  tabSwipeDeltaX = 0;
  window.addEventListener('mousemove', handleTabMouseMove);
  window.addEventListener('mouseup', handleTabMouseUp);
};
const handleTabMouseMove = (event: MouseEvent) => {
  if (!tabMouseDown) return;
  tabSwipeDeltaX = event.clientX - tabSwipeStartX;
};
const handleTabMouseUp = () => {
  if (!tabMouseDown) return;
  if (tabSwipeDeltaX > 60 && activeTab.value === 'pending') {
    activeTab.value = 'waiting';
  } else if (tabSwipeDeltaX < -60 && activeTab.value === 'waiting') {
    activeTab.value = 'pending';
  }
  tabMouseDown = false;
  tabSwipeDeltaX = 0;
  window.removeEventListener('mousemove', handleTabMouseMove);
  window.removeEventListener('mouseup', handleTabMouseUp);
};

const handleAction = async (ticket: Ticket) => {
  if (activeTab.value === 'waiting') {
    claimedTicketIds.value = {
      ...claimedTicketIds.value,
      [ticket.id]: true,
    };
    // 不再自动切tab
    notify('已接起工单', 'success');
    return;
  }

  loadingTicketId.value = ticket.id;
  try {
    await completeTicket(ticket.id);
    removeTicket(ticket.id);
    notify('工单已完成', 'success');
  } catch (error) {
    console.error(error);
    notify('回传失败，请稍后重试');
  } finally {
    loadingTicketId.value = null;
  }
};

const handleManualRefresh = () => {
  refreshTickets();
};

const statusText = (status: TicketStatus) => {
  if (status === 'open') return '正常待处理';
  if (status === 'abnormal') return '异常待处理';
  return '已完成';
};

const formatTime = (time: number | string | undefined) => {
  const num = Number(time);
  if (!num) {
    return '-';
  }

  const ms = num > 1_000_000_000_000 ? num : num * 1000;
  const date = new Date(ms);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  const second = `${date.getSeconds()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

onMounted(async () => {
  await refreshTickets();
  connectStream();
  startPolling();
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleTabMouseMove);
  window.removeEventListener('mouseup', handleTabMouseUp);
  if (mouseDraggingTicketId !== null) {
    window.removeEventListener('mousemove', handleSwipeMouseMove);
    window.removeEventListener('mouseup', handleSwipeMouseUp);
    mouseDraggingTicketId = null;
  }

  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});
</script>

<style scoped>
.main-content {
  background: #f5f5f5;
  min-height: calc(100vh - 88px - var(--status-bar-height, 0px));
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 10px 10px 18px;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-card {
  background: #efefef;
  border-radius: 4px;
  padding: 14px 12px 10px;
  border: 1px solid #e2e2e2;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  color: #4f4f4f;
}

.meta-row p {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.content-block {
  margin-bottom: 14px;
}

.content-title {
  margin: 0 0 6px;
  color: #565656;
  font-size: 24px;
  font-weight: 700;
}

.content-text {
  margin: 0;
  color: #5a5a5a;
  font-size: 24px;
  line-height: 1.5;
  font-weight: 700;
  word-break: break-all;
}

.detail-line {
  margin: 0 0 4px;
  color: #5e5e5e;
  font-size: 19px;
  font-weight: 700;
}

.label {
  margin-right: 4px;
  color: #5f5f5f;
}

.value {
  color: #5f5f5f;
}

.label-blue {
  color: #3a86d9;
}

.label-purple {
  color: #b359d0;
}

.label-orange {
  color: #ef632f;
}

.label-danger {
  color: #d93025;
}

.value-danger {
  color: #d93025;
}

.swipe-action {
  width: 100%;
  margin-top: 12px;
  height: 68px;
  border: 2px solid #e38a39;
  border-radius: 12px;
  background: #f7f7f7;
  position: relative;
  overflow: hidden;
}

.swipe-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bb8b56;
  font-size: 26px;
  font-weight: 600;
}

.swipe-handle {
  position: absolute;
  left: 4px;
  top: 4px;
  bottom: 4px;
  width: 65px;
  border-radius: 10px;
  background: #d67f2c;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  touch-action: none;
  pointer-events: none;
}

.swipe-handle.disabled {
  opacity: 0.6;
}

.swipe-arrow {
  font-size: 38px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.swipe-touch-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px 80px;
}

.empty-title {
  font-size: 17px;
  color: #505050;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: center;
}

.empty-subtitle {
  font-size: 14px;
  color: #9b9b9b;
  line-height: 1.5;
  text-align: center;
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
  margin-top: 20px;
}

.refresh-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.65;
}

</style>
