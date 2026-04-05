export type TicketStatus = 'open' | 'abnormal' | 'resolved';

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

interface CompleteTicketPayload {
  note?: string;
  operator?: string;
}

interface CompleteTicketResponse {
  status: 'ok' | 'error';
  message: string;
  ticket?: Ticket;
}

const API_BASE = ((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE || 'http://192.168.10.2:6789').replace(/\/$/, '');

type RequestConfig = {
  method?: string;
  header?: Record<string, string>;
  data?: unknown;
  timeout?: number;
};

const REQUEST_TIMEOUT = 8000;

function request<T>(url: string, options?: RequestConfig): Promise<T> {
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

        reject(new Error(`HTTP ${res.statusCode || 'unknown'}`));
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

export async function completeTicket(ticketId: number, payload: CompleteTicketPayload = {}): Promise<Ticket | undefined> {
  const response = await request<CompleteTicketResponse>(`/api/tickets/${ticketId}/complete`, {
    method: 'PATCH',
    data: {
      operator: 'frontend-app',
      ...payload,
    },
  });

  if (response.status !== 'ok') {
    throw new Error(response.message || '工单完成回传失败');
  }

  return response.ticket;
}

export function createTicketsEventSource(): EventSource | null {
  if (typeof EventSource === 'undefined') {
    return null;
  }

  return new EventSource(`${API_BASE}/api/tickets/stream`);
}
