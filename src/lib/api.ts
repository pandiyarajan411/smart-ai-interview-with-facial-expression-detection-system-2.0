const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const storage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      return storage?.state?.token || null;
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error ${response.status}`);
    }

    return data;
  }

  // Auth
  async register(name: string, email: string, password: string) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  }
  async login(email: string, password: string) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }
  async getMe() { return this.request('/auth/me'); }
  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  }
  async resetPassword(token: string, password: string) {
    return this.request(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) });
  }
  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/update-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });
  }

  // Interviews
  async getInterviews(params?: { page?: number; level?: string; status?: string }) {
    const q = new URLSearchParams(params as any).toString();
    return this.request(`/interviews${q ? '?' + q : ''}`);
  }
  async startInterview(level: string, category: string, questionCount: number) {
    return this.request('/interviews', { method: 'POST', body: JSON.stringify({ level, category, questionCount }) });
  }
  async getInterview(id: string) { return this.request(`/interviews/${id}`); }
  async submitAnswer(id: string, payload: any) {
    return this.request(`/interviews/${id}/answer`, { method: 'POST', body: JSON.stringify(payload) });
  }
  async completeInterview(id: string, payload: any) {
    return this.request(`/interviews/${id}/complete`, { method: 'POST', body: JSON.stringify(payload) });
  }
  async getAIFollowUp(question: string, answer: string) {
    return this.request('/interviews/ai-followup', { method: 'POST', body: JSON.stringify({ question, answer }) });
  }

  // Questions
  async getQuestions(params?: any) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/questions${q ? '?' + q : ''}`);
  }

  // Admin
  async getAdminStats() { return this.request('/admin/stats'); }
  async getAdminUsers(params?: any) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/admin/users${q ? '?' + q : ''}`);
  }
  async banUser(id: string, ban: boolean) {
    return this.request(`/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ ban }) });
  }
  async getLeaderboard() { return this.request('/admin/leaderboard'); }
}

export const api = new ApiClient();
