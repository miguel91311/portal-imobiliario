const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class APIError extends Error {
  constructor(public status: number, public data: any) {
    super(`API Error ${status}: ${JSON.stringify(data)}`);
  }
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('portal_token') : null;

  const isFormData = options?.body instanceof FormData;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new APIError(res.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; name: string; role: string; country: string; agency?: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (body: { email: string; password: string; name: string; role?: string; country?: string; agency?: string; planType?: string }) =>
    request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: () =>
    request<{ id: string; email: string; name: string; role: string; country: string; agency?: string; licenseId?: string }>('/api/auth/me'),

  // Properties
  getProperties: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ '@odata.count': number; value: any[] }>(`/api/properties${query}`);
  },

  getProperty: (id: string) =>
    request<any>(`/api/properties/${id}`),

  createLead: (body: { name: string; email: string; phone?: string; propertyId: string; source?: string }) =>
    request<any>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Documents
  getDocuments: (propertyId?: string) => {
    const query = propertyId ? `?propertyId=${propertyId}` : '';
    return request<{ value: any[] }>(`/api/documents${query}`);
  },

  uploadDocument: (formData: FormData) =>
    request<any>('/api/documents/upload', {
      method: 'POST',
      body: formData,
    }),

  deleteDocument: (id: string) =>
    request<any>(`/api/documents/${id}`, {
      method: 'DELETE',
    }),

  // Calculations
  calculateIMT: (body: any) =>
    request<any>('/api/calculations/imt-jovem', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  calculateIPU: (body: any) =>
    request<any>('/api/calculations/ipu-angola', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  calculateAVM: (body: any) =>
    request<any>('/api/calculations/avm', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Users / RBAC
  getUsers: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ value: any[] }>(`/api/users${query}`);
  },

  updateUserRole: (id: string, role: string) =>
    request<any>(`/api/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  updateUserStatus: (id: string, isActive: boolean) =>
    request<any>(`/api/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  updateUserKYC: (id: string, kycStatus: string, kycRisk?: string) =>
    request<any>(`/api/users/${id}/kyc`, {
      method: 'PATCH',
      body: JSON.stringify({ kycStatus, ...(kycRisk && { kycRisk }) }),
    }),

  inviteUser: (body: { email: string; name: string; role: string; country?: string; agency?: string; licenseId?: string }) =>
    request<any>('/api/users/invite', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Activity Logs
  getActivityLogs: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ value: any[]; '@odata.count': number; page: number; limit: number }>(`/api/activity-logs${query}`);
  },

  // Analytics
  getAnalyticsOverview: () =>
    request<any>('/api/analytics/overview'),

  getAnalyticsLeadsByStatus: () =>
    request<any>('/api/analytics/leads-by-status'),

  getAnalyticsTopAgents: () =>
    request<any>('/api/analytics/top-agents'),

  // Leads CRM
  getLeads: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ value: any[] }>(`/api/leads${query}`);
  },

  getLead360: (id: string) =>
    request<any>(`/api/leads/${id}/360`),

  updateLeadStatus: (id: string, status: string) =>
    request<any>(`/api/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateLead: (id: string, body: any) =>
    request<any>(`/api/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  scoreLead: (id: string) =>
    request<any>(`/api/leads/${id}/score`, {
      method: 'POST',
    }),

  // Properties management
  createProperty: (body: any) =>
    request<any>('/api/properties', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateProperty: (id: string, body: any) =>
    request<any>(`/api/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteProperty: (id: string) =>
    request<any>(`/api/properties/${id}`, {
      method: 'DELETE',
    }),

  // Owner
  getOwnerStats: () => request<any>('/api/owner/me/stats'),

  getOwnerListings: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ '@odata.count': number; value: any[] }>(`/api/owner/me/listings${query}`);
  },

  purchaseFeatured: (body: { propertyId: string; packageId: string }) =>
    request<any>('/api/owner/me/purchase-featured', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  purchaseSprint: (body: { propertyId: string }) =>
    request<any>('/api/owner/me/purchase-sprint', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  buyCredits: (body: { quantity: number }) =>
    request<any>('/api/owner/me/buy-credits', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMyPlan: () =>
    request<any>('/api/owner/me/plan'),

  // Stripe
  createStripeCheckout: (body: {
    type: 'plan' | 'credits' | 'featured_package';
    planId?: string;
    quantity?: number;
    packageId?: string;
    propertyId?: string;
    successUrl: string;
    cancelUrl: string;
  }) =>
    request<{ sessionId: string; url: string }>('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getStripeConfig: () =>
    request<{ publishableKey: string }>('/api/stripe/config'),

  createStripePortal: (returnUrl?: string) =>
    request<{ url: string }>('/api/stripe/portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl }),
    }),

  // Featured Packages
  getFeaturedPackages: () =>
    request<{ value: any[] }>('/api/featured-packages'),

  // Teams
  getTeams: () =>
    request<{ value: any[] }>('/api/teams'),

  // Market Intelligence
  getMarketIntelligence: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/api/market/intelligence${query}`);
  },

  getComparables: (propertyId: string) =>
    request<{ value: any[] }>(`/api/market/comparables?propertyId=${propertyId}`),

  getPriceTrend: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/api/market/price-trend${query}`);
  },

  createTeam: (body: { name: string; slug: string; description?: string; country?: string }) =>
    request<any>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getTeam: (id: string) =>
    request<any>(`/api/teams/${id}`),

  updateTeam: (id: string, body: any) =>
    request<any>(`/api/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  inviteTeamMember: (teamId: string, body: { email: string; name: string; role?: string; commissionRate?: number }) =>
    request<any>(`/api/teams/${teamId}/invite`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getTeamMembers: (teamId: string) =>
    request<{ value: any[] }>(`/api/teams/${teamId}/members`),

  updateTeamMember: (teamId: string, userId: string, body: any) =>
    request<any>(`/api/teams/${teamId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  removeTeamMember: (teamId: string, userId: string) =>
    request<any>(`/api/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    }),

  getTeamStats: (teamId: string) =>
    request<any>(`/api/teams/${teamId}/stats`),

  // Alerts
  getAlerts: () =>
    request<{ value: any[] }>('/api/alerts'),

  createAlert: (body: any) =>
    request<any>('/api/alerts', { method: 'POST', body: JSON.stringify(body) }),

  deleteAlert: (id: string) =>
    request<any>(`/api/alerts/${id}`, { method: 'DELETE' }),

  toggleAlert: (id: string) =>
    request<any>(`/api/alerts/${id}/toggle`, { method: 'PATCH' }),

  testAlert: (id: string) =>
    request<any>(`/api/alerts/${id}/test`, { method: 'POST' }),

  // Valuations / AVM history
  getValuations: (propertyId?: string) => {
    const query = propertyId ? `?propertyId=${propertyId}` : '';
    return request<{ value: any[] }>(`/api/valuations${query}`);
  },

  // Integrations
  getIntegrations: () =>
    request<{ value: any[] }>('/api/integrations'),

  publishToPortal: (portal: string, body: { propertyId: string }) =>
    request<any>(`/api/integrations/${portal}/publish`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  unpublishFromPortal: (portal: string, body: { propertyId: string }) =>
    request<any>(`/api/integrations/${portal}/unpublish`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Webhooks
  getWebhooks: () =>
    request<{ value: any[] }>('/api/webhooks'),

  createWebhook: (body: { name: string; url: string; events: string[]; secret?: string }) =>
    request<any>('/api/webhooks', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateWebhook: (id: string, body: any) =>
    request<any>(`/api/webhooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteWebhook: (id: string) =>
    request<any>(`/api/webhooks/${id}`, {
      method: 'DELETE',
    }),

  // Workflows
  getWorkflows: () =>
    request<{ value: any[] }>('/api/workflows'),

  createWorkflow: (body: { name: string; description?: string; trigger: string; actions: any[] }) =>
    request<any>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateWorkflow: (id: string, body: any) =>
    request<any>(`/api/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteWorkflow: (id: string) =>
    request<any>(`/api/workflows/${id}`, {
      method: 'DELETE',
    }),

  // OpenImmo
  exportOpenImmo: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<string>(`/api/openimmo/export${query}`);
  },

  // Import
  importCSV: (content: string) =>
    request<any>('/api/import/csv', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  importOpenImmo: (content: string) =>
    request<any>('/api/import/openimmo', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  importJSON: (content: string) =>
    request<any>('/api/import/json', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  importURL: (url: string) =>
    request<any>('/api/import/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  previewCSV: (content: string) =>
    request<any>('/api/import/preview/csv', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  previewOpenImmo: (content: string) =>
    request<any>('/api/import/preview/openimmo', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  previewJSON: (content: string) =>
    request<any>('/api/import/preview/json', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Favorites
  getFavorites: () =>
    request<{ value: any[] }>('/api/favorites'),

  addFavorite: (propertyId: string, notes?: string) =>
    request<any>('/api/favorites', { method: 'POST', body: JSON.stringify({ propertyId, notes }) }),

  removeFavorite: (propertyId: string) =>
    request<any>(`/api/favorites/${propertyId}`, { method: 'DELETE' }),

  // Reviews
  getReviews: (agentId: string) =>
    request<{ value: any[]; stats: { average: number; count: number } }>(`/api/reviews/${agentId}`),

  createReview: (body: { agentId: string; propertyId?: string; rating: number; title?: string; comment?: string }) =>
    request<any>('/api/reviews', { method: 'POST', body: JSON.stringify(body) }),

  // Price History
  getPriceHistory: (propertyId: string) =>
    request<{ value: any[] }>(`/api/price-history/${propertyId}`),

  // Aggregator
  getAggregatedListings: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ value: any[] }>(`/api/aggregator/search${query}`);
  },

  getAggregatorSources: () =>
    request<{ value: any[] }>('/api/aggregator/sources'),

  // Credit Simulation
  calculateCreditPT: (body: any) =>
    request<any>('/api/calculations/credit-pt', { method: 'POST', body: JSON.stringify(body) }),

  calculateCreditAO: (body: any) =>
    request<any>('/api/calculations/credit-ao', { method: 'POST', body: JSON.stringify(body) }),

  // API Keys
  getApiKeys: () => request<any[]>('/api/api-keys'),
  createApiKey: (name: string, expiresInDays?: number) =>
    request<any>('/api/api-keys', { method: 'POST', body: JSON.stringify({ name, expiresInDays }) }),
  deleteApiKey: (id: string) =>
    request<any>(`/api/api-keys/${id}`, { method: 'DELETE' }),
};
