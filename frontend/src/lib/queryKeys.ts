export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const
  },
  apiKeys: {
    list: ['api-keys', 'list'] as const
  },
  credentials: {
    list: ['credentials', 'list'] as const,
    balances: ['credentials', 'balances'] as const
  },
  orders: {
    list: (filters: Record<string, any>) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const
  },
  webhooks: {
    detail: ['webhooks', 'detail'] as const,
    logs: (webhookId: string, page: number, limit: number) => ['webhooks', 'logs', webhookId, page, limit] as const
  },
  usage: {
    stats: (period: string) => ['usage', 'stats', period] as const,
    chart: (period: string) => ['usage', 'chart', period] as const,
    endpoints: (period: string) => ['usage', 'endpoints', period] as const,
    quota: ['usage', 'quota'] as const
  },
  admin: {
    users: ['admin', 'users'] as const
  }
};
