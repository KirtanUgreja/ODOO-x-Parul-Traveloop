import { apiFetch } from './api';

export const notificationService = {
  async getNotifications() {
    return apiFetch('/notifications');
  },

  async markAsRead(id: string) {
    return apiFetch(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllAsRead() {
    return apiFetch('/notifications/read-all', {
      method: 'POST',
    });
  },

  async deleteNotification(id: string) {
    return apiFetch(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }
};
