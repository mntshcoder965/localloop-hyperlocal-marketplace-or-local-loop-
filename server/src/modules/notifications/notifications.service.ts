import { notificationsRepository } from './notifications.repository.js';

export const notificationsService = {
  async getMyNotifications(userId: string) {
    return await notificationsRepository.getByUser(userId);
  },

  async markAsRead(notificationId: string, userId: string) {
    await notificationsRepository.markAsRead(notificationId, userId);
  },

  async markAllAsRead(userId: string) {
    await notificationsRepository.markAllAsRead(userId);
  },
};

