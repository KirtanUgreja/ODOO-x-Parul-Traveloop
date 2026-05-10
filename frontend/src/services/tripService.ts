const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}/api${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const tripService = {
  // --- Trips ---
  getTrips: () => apiFetch('/trips'),
  getTripById: (id: string) => apiFetch(`/trips/${id}`),
  createTrip: (tripData: any) => apiFetch('/trips', { method: 'POST', body: JSON.stringify(tripData) }),
  updateTrip: (id: string, tripData: any) => apiFetch(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(tripData) }),
  deleteTrip: (id: string) => apiFetch(`/trips/${id}`, { method: 'DELETE' }),
  getPublicTrip: (token: string) => apiFetch(`/trips/public/${token}`),
  duplicateTrip: (id: string) => apiFetch(`/trips/${id}/duplicate`, { method: 'POST' }),

  // --- Activities ---
  getActivities: (tripId: string) => apiFetch(`/trips/${tripId}/activities`),
  createActivity: (tripId: string, data: any) =>
    apiFetch(`/trips/${tripId}/activities`, { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id: string, data: any) =>
    apiFetch(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActivity: (id: string) => apiFetch(`/activities/${id}`, { method: 'DELETE' }),
  toggleActivity: (id: string) => apiFetch(`/activities/${id}/complete`, { method: 'PATCH' }),

  // --- Notes ---
  getNotes: (tripId: string) => apiFetch(`/trips/${tripId}/notes`),
  createNote: (tripId: string, content: string) =>
    apiFetch(`/trips/${tripId}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
  updateNote: (id: string, content: string) =>
    apiFetch(`/notes/${id}`, { method: 'PUT', body: JSON.stringify({ content }) }),
  deleteNote: (id: string) => apiFetch(`/notes/${id}`, { method: 'DELETE' }),

  // --- Checklist ---
  getChecklist: (tripId: string) => apiFetch(`/trips/${tripId}/checklist`),
  createChecklistItem: (tripId: string, item: string, category?: string) =>
    apiFetch(`/trips/${tripId}/checklist`, { method: 'POST', body: JSON.stringify({ item, category }) }),
  toggleChecklistItem: (id: string) => apiFetch(`/checklist/${id}/toggle`, { method: 'PATCH' }),
  deleteChecklistItem: (id: string) => apiFetch(`/checklist/${id}`, { method: 'DELETE' }),
};
