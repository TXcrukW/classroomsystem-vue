import { clearToken, getToken, getCurrentUser } from '@/utils/auth';

export type TicketStatus = 'open' | 'abnormal' | 'accepted' | 'resolved';

export interface TicketUpdate {
  time: number;
  status: string;
  message: string;
}

export interface Ticket {
  id: number;
  time: number;
  updated_at: number;
  status: TicketStatus;
  assigned_to?: string;
  group_id: number;
  group_name: string;
  nickname: string;
  classroom_id: string;
  message: string;
  issue_type: string;
  updates: TicketUpdate[];
}

interface TicketsResponse {
  status: 'ok' | 'error';
  total: number;
  tickets: Ticket[];
  message?: string;
}

export interface UpdateTicketStatusPayload {
  status: 'accepted' | 'resolved' | 'completed';
  note?: string;
  operator?: string;
}

interface UpdateTicketStatusResponse {
  status: 'ok' | 'error';
  message: string;
  ticket?: Ticket;
}

const UNI_ENV = (import.meta as ImportMeta & { env?: Record<string, string> }).env || {};
const DEFAULT_LAN_API_BASE = 'http://192.168.10.2:6789';
const rawApiBase = String(UNI_ENV.VITE_API_BASE || '').trim();
const platform = String(UNI_ENV.UNI_PLATFORM || '').toLowerCase();
const isAppPlus = platform === 'app-plus';
const isLocalhostBase = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawApiBase);

// Real-device debugging cannot reach localhost on the development machine.
const API_BASE = (isAppPlus && isLocalhostBase ? DEFAULT_LAN_API_BASE : rawApiBase || DEFAULT_LAN_API_BASE).replace(/\/$/, '');

type RequestConfig = {
  method?: string;
  header?: Record<string, string>;
  data?: unknown;
  timeout?: number;
};

const REQUEST_TIMEOUT = 8000;

function isHttp404(error: unknown) {
  return error instanceof Error && /HTTP\s+404/i.test(error.message);
}

function isHttp405(error: unknown) {
  return error instanceof Error && /HTTP\s+405/i.test(error.message);
}

function request<T>(url: string, options?: RequestConfig): Promise<T> {
  const token = getToken();
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutMs = options?.timeout ?? REQUEST_TIMEOUT;
    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error('Request timeout'));
    }, timeoutMs);

    uni.request({
      url: `${API_BASE}${url}`,
      method: (options?.method || 'GET') as unknown as UniApp.RequestOptions['method'],
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...(options?.header || {}),
      },
      data: options?.data as any,
      timeout: options?.timeout ?? REQUEST_TIMEOUT,
      success: (res) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);

        let payload: unknown = res.data;
        if (typeof payload === 'string') {
          const trimmed = payload.trim();
          if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
              payload = JSON.parse(trimmed);
            } catch (error) {
              console.warn('Failed to parse response JSON:', error);
            }
          }
        }

        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(payload as T);
          return;
        }

        if (res.statusCode === 401) {
          clearToken();
          uni.reLaunch({ url: '/pages/login/index' });
        }

        const payloadText = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
        reject(new Error(`HTTP ${res.statusCode || 'unknown'} ${url} ${payloadText}`));
      },
      fail: (error) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        console.error('Request failed:', `${API_BASE}${url}`, error);
        reject(error);
      },
    });
  });
}

export async function fetchOpenTickets(): Promise<Ticket[]> {
  const response = await request<TicketsResponse>('/api/tickets/open');

  if (response.status !== 'ok') {
    throw new Error(response.message || '获取工单失败');
  }

  return response.tickets || [];
}

export async function fetchTickets(): Promise<Ticket[]> {
  const response = await request<TicketsResponse>('/api/tickets');

  if (response.status !== 'ok') {
    throw new Error(response.message || '获取工单失败');
  }

  return response.tickets || [];
}

export async function updateTicketStatus(ticketId: number, payload: UpdateTicketStatusPayload): Promise<Ticket | undefined> {
  const requestData = {
    operator: getCurrentUser() || 'frontend-app',
    ...payload,
  };

  const statusPath = `/api/tickets/${ticketId}/status`;
  const acceptPath = `/api/tickets/${ticketId}/accept`;
  const completePath = `/api/tickets/${ticketId}/complete`;

  try {
    const response = await request<UpdateTicketStatusResponse>(statusPath, {
      method: 'PATCH',
      data: requestData,
    });

    if (response.status !== 'ok') {
      throw new Error(response.message || '工单状态回传失败');
    }

    return response.ticket;
  } catch (error) {
    // 兼容旧后端：resolved/completed 走 /complete。
    if (isHttp404(error) && (payload.status === 'resolved' || payload.status === 'completed')) {
      const response = await request<UpdateTicketStatusResponse>(completePath, {
        method: 'PATCH',
        data: requestData,
      });

      if (response.status !== 'ok') {
        throw new Error(response.message || '工单完成回传失败');
      }

      return response.ticket;
    }

    // 兼容部分后端将“接起”单独暴露为 /accept。
    if (isHttp404(error) && payload.status === 'accepted') {
      try {
        const response = await request<UpdateTicketStatusResponse>(acceptPath, {
          method: 'PATCH',
          data: requestData,
        });

        if (response.status !== 'ok') {
          throw new Error(response.message || '工单接起回传失败');
        }

        return response.ticket;
      } catch (acceptError) {
        // 某些服务端可能把 /accept 实现成 POST。
        if (isHttp405(acceptError) || isHttp404(acceptError)) {
          const response = await request<UpdateTicketStatusResponse>(acceptPath, {
            method: 'POST',
            data: requestData,
          });

          if (response.status !== 'ok') {
            throw new Error(response.message || '工单接起回传失败');
          }

          return response.ticket;
        }

        throw acceptError;
      }
    }

    if (isHttp404(error) && payload.status === 'accepted') {
      throw new Error('后端未匹配到接起接口（/status 或 /accept）');
    }

    throw error;
  }
}

export async function acceptTicket(ticketId: number, payload: Omit<UpdateTicketStatusPayload, 'status'> = {}): Promise<Ticket | undefined> {
  return updateTicketStatus(ticketId, {
    status: 'accepted',
    ...payload,
  });
}

export async function completeTicket(ticketId: number, payload: Omit<UpdateTicketStatusPayload, 'status'> = {}): Promise<Ticket | undefined> {
  return updateTicketStatus(ticketId, {
    status: 'resolved',
    ...payload,
  });
}

export async function verifyToken(): Promise<boolean> {
  try {
    const response = await request<{ status: string; user?: { username?: string; status?: 'online' | 'break' | 'offline' } }>('/api/verify-token');
    if (response.status === 'success' && response.user && response.user.username) {
      import('@/utils/auth').then(m => m.setCurrentUser(response.user!.username!));
      if (response.user.status) {
        uni.setStorageSync('user_last_status', response.user.status);
      }
    }
    return response.status === 'success';
  } catch (error) {
    return false;
  }
}

/**
 * 更新用户在线状态 (User Presence/Attendance)
 * 根据后端建议修改路径为 /api/user/status，并适配返回格式
 * @param status 'online' | 'break' | 'offline'
 */
export async function updateUserPresence(status: 'online' | 'break' | 'offline'): Promise<boolean> {
  try {
    const operator = getCurrentUser() || 'frontend-app';
    const response = await request<{ status: 'success' | 'error'; message?: string }>('/api/user/status', {
      method: 'POST',
      data: {
        operator,
        status,
        timestamp: Date.now(),
      },
    });
    return response.status === 'success';
  } catch (error) {
    console.error('Failed to update user presence:', error);
    return false;
  }
}

export function createTicketsEventSource(): EventSource | null {
  if (typeof EventSource === 'undefined') {
    return null;
  }
  
  const token = getToken();
  const url = `${API_BASE}/api/tickets/stream${token ? `?token=${token}` : ''}`;
  return new EventSource(url);
}
