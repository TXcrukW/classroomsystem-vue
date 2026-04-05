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
};

function request<T>(url: string, options?: RequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      method: (options?.method || 'GET') as unknown as UniApp.RequestOptions['method'],
      header: {
        'Content-Type': 'application/json',
        ...(options?.header || {}),
      },
      data: options?.data as any,
      success: (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
          return;
        }

        reject(new Error(`HTTP ${res.statusCode || 'unknown'}`));
      },
      fail: (error) => {
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
