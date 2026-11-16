import { reportsRepository } from './reports.repository.js';
import { AppError } from '../../middlewares/errorMiddleware.js';

export const reportsService = {
  async fileReport(data: {
    reporterId: string;
    targetType: 'LISTING' | 'USER';
    targetId: string;
    reason: string;
    details?: string;
  }) {
    if (!data.targetId || !data.reason) {
      throw new AppError('Target ID and reason are required', 400);
    }
    return await reportsRepository.create(data);
  },

  async getAllReports(status?: string) {
    return await reportsRepository.getAll(status);
  },

  async resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', adminNotes: string, adminId: string) {
    return await reportsRepository.updateResolution(reportId, status, adminNotes, adminId);
  },
};

