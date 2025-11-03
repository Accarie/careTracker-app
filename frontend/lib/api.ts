// API service layer for frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as HeadersInit),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: { email: string; name: string; password: string; role?: string }) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async (token: string) => {
    return request('/auth/profile', {
      method: 'GET',
      token,
    });
  },
};

// Users API
export const usersAPI = {
  getAll: async (token: string) => {
    return request('/users', {
      method: 'GET',
      token,
    });
  },

  getStaff: async (token: string) => {
    return request('/users/staff', {
      method: 'GET',
      token,
    });
  },

  getById: async (id: string, token: string) => {
    return request(`/users/${id}`, {
      method: 'GET',
      token,
    });
  },
};

// Programs API
export const programsAPI = {
  getAll: async (token: string) => {
    return request('/programs', {
      method: 'GET',
      token,
    });
  },

  getById: async (id: string, token: string) => {
    return request(`/programs/${id}`, {
      method: 'GET',
      token,
    });
  },

  create: async (data: any, token: string) => {
    return request('/programs', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any, token: string) => {
    return request(`/programs/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string, token: string) => {
    return request(`/programs/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

// Patients API
export const patientsAPI = {
  getAll: async (token: string, filters?: { status?: string; programId?: string; adherence?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.programId) params.append('programId', filters.programId);
    if (filters?.adherence) params.append('adherence', filters.adherence);

    const queryString = params.toString();
    const endpoint = queryString ? `/patients?${queryString}` : '/patients';

    return request(endpoint, {
      method: 'GET',
      token,
    });
  },

  getById: async (id: string, token: string) => {
    return request(`/patients/${id}`, {
      method: 'GET',
      token,
    });
  },

  create: async (data: any, token: string) => {
    return request('/patients', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any, token: string) => {
    return request(`/patients/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string, token: string) => {
    return request(`/patients/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

// Sessions API
export const sessionsAPI = {
  getAll: async (token: string, filters?: { programId?: string; patientId?: string; status?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.programId) params.append('programId', filters.programId);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const endpoint = queryString ? `/sessions?${queryString}` : '/sessions';

    return request(endpoint, {
      method: 'GET',
      token,
    });
  },

  getById: async (id: string, token: string) => {
    return request(`/sessions/${id}`, {
      method: 'GET',
      token,
    });
  },

  create: async (data: any, token: string) => {
    return request('/sessions', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any, token: string) => {
    return request(`/sessions/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string, token: string) => {
    return request(`/sessions/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  markMissed: async (token: string) => {
    return request('/sessions/mark-missed', {
      method: 'POST',
      token,
    });
  },
};

// Medications API
export const medicationsAPI = {
  getAll: async (token: string) => {
    return request('/medications', {
      method: 'GET',
      token,
    });
  },

  getById: async (id: string, token: string) => {
    return request(`/medications/${id}`, {
      method: 'GET',
      token,
    });
  },

  create: async (data: any, token: string) => {
    return request('/medications', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any, token: string) => {
    return request(`/medications/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string, token: string) => {
    return request(`/medications/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  // Prescriptions
  getAllPrescriptions: async (token: string, filters?: { patientId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = queryString ? `/medications/prescriptions/all?${queryString}` : '/medications/prescriptions/all';

    return request(endpoint, {
      method: 'GET',
      token,
    });
  },

  getPrescriptionById: async (id: string, token: string) => {
    return request(`/medications/prescriptions/${id}`, {
      method: 'GET',
      token,
    });
  },

  createPrescription: async (data: any, token: string) => {
    return request('/medications/prescriptions', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  updatePrescriptionStatus: async (id: string, status: string, token: string) => {
    return request(`/medications/prescriptions/${id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    });
  },

  deletePrescription: async (id: string, token: string) => {
    return request(`/medications/prescriptions/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  updateOverdue: async (token: string) => {
    return request('/medications/prescriptions/update-overdue', {
      method: 'POST',
      token,
    });
  },
};

// Reports API
export const reportsAPI = {
  getDashboardStats: async (token: string) => {
    return request('/reports/dashboard', {
      method: 'GET',
      token,
    });
  },

  getAdherenceData: async (token: string) => {
    return request('/reports/adherence', {
      method: 'GET',
      token,
    });
  },

  getEnrollmentData: async (token: string) => {
    return request('/reports/enrollments', {
      method: 'GET',
      token,
    });
  },

  getSessionStatusData: async (token: string) => {
    return request('/reports/session-status', {
      method: 'GET',
      token,
    });
  },

  exportPatients: async (token: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const endpoint = queryString ? `/reports/export/patients?${queryString}` : '/reports/export/patients';

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  exportPrograms: async (token: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const endpoint = queryString ? `/reports/export/programs?${queryString}` : '/reports/export/programs';

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `programs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  exportSessions: async (token: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const endpoint = queryString ? `/reports/export/sessions?${queryString}` : '/reports/export/sessions';

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  exportPrescriptions: async (token: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const endpoint = queryString ? `/reports/export/prescriptions?${queryString}` : '/reports/export/prescriptions';

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescriptions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

