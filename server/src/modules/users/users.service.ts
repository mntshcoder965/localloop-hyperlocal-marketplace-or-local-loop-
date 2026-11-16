import { usersRepository } from './users.repository.js';
import { AppError } from '../../middlewares/errorMiddleware.js';

export const usersService = {
  async getAddresses(userId: string) {
    return await usersRepository.getAddresses(userId);
  },

  async addAddress(userId: string, data: any) {
    return await usersRepository.addAddress(userId, data);
  },

  async deleteAddress(userId: string, addressId: string) {
    const success = await usersRepository.deleteAddress(userId, addressId);
    if (!success) {
      throw new AppError('Address not found or unauthorized', 404);
    }
  },

  async setDefaultAddress(userId: string, addressId: string) {
    await usersRepository.setDefaultAddress(userId, addressId);
  },

  async getSellerProfile(sellerId: string) {
    const profile = await usersRepository.getSellerPublicProfile(sellerId);
    if (!profile) {
      throw new AppError('Seller not found', 404);
    }
    return profile;
  },
};

