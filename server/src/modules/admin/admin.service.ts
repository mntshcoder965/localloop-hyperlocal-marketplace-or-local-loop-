import { adminRepository } from './admin.repository.js';
import { reportsRepository } from '../reports/reports.repository.js';
import { AppError } from '../../middlewares/errorMiddleware.js';

export const adminService = {
  async getDashboard() {
    return await adminRepository.getDashboardStats();
  },

  async getUsers(page = 1, limit = 20, search?: string) {
    return await adminRepository.getUsers(page, limit, search);
  },

  async toggleSuspension(userId: string, isSuspended: boolean) {
    const updated = await adminRepository.toggleUserSuspension(userId, isSuspended);
    if (!updated) {
      throw new AppError('User not found', 404);
    }
    return updated;
  },

  async moderateListing(listingId: string, status: 'ACTIVE' | 'REMOVED') {
    const updated = await adminRepository.moderateListing(listingId, status);
    if (!updated) {
      throw new AppError('Listing not found', 404);
    }
    return updated;
  },

  async getReports(status?: string) {
    return await reportsRepository.getAll(status);
  },

  async resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', adminNotes: string, adminId: string) {
    return await reportsRepository.updateResolution(reportId, status, adminNotes, adminId);
  },
};

