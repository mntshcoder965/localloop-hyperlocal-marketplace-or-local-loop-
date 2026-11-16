import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { authRepository } from './auth.repository.js';
import { AppError } from '../../middlewares/errorMiddleware.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { SanitizedUser, UserEntity } from './auth.types.js';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function sanitizeUser(user: UserEntity): SanitizedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar_url: user.avatar_url,
    bio: user.bio,
    is_verified: user.is_verified,
    rating_avg: Number(user.rating_avg) || 0,
    rating_count: user.rating_count || 0,
    created_at: user.created_at,
  };
}

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string; role?: string }) {
    const existing = await authRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const password_hash = await bcrypt.hash(data.password, 10);
    const user = await authRepository.createUser({
      name: data.name,
      email: data.email,
      password_hash,
      phone: data.phone,
      role: data.role || 'BUYER',
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const rawRefreshToken = signRefreshToken({ userId: user.id });
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await authRepository.saveRefreshToken(user.id, tokenHash, expiresAt);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: rawRefreshToken,
    };
  },

  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password credentials', 401);
    }

    if (user.is_suspended) {
      throw new AppError('This account has been suspended by platform moderation.', 403);
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      throw new AppError('Invalid email or password credentials', 401);
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const rawRefreshToken = signRefreshToken({ userId: user.id });
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.saveRefreshToken(user.id, tokenHash, expiresAt);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: rawRefreshToken,
    };
  },

  async refreshTokens(rawRefreshToken: string) {
    try {
      const payload = verifyRefreshToken(rawRefreshToken);
      const tokenHash = hashToken(rawRefreshToken);

      const storedToken = await authRepository.findRefreshToken(tokenHash);
      if (!storedToken) {
        throw new AppError('Refresh token revoked or invalid', 401);
      }

      const user = await authRepository.findById(payload.userId);
      if (!user || user.is_suspended) {
        throw new AppError('User not found or suspended', 401);
      }

      // Rotate refresh token
      const newRefreshToken = signRefreshToken({ userId: user.id });
      const newTokenHash = hashToken(newRefreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await authRepository.revokeRefreshToken(tokenHash, newTokenHash);
      await authRepository.saveRefreshToken(user.id, newTokenHash, expiresAt);

      const newAccessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: sanitizeUser(user),
      };
    } catch (err: any) {
      throw new AppError(err.message || 'Invalid refresh token', 401);
    }
  },

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await authRepository.revokeRefreshToken(tokenHash);
    }
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return sanitizeUser(user);
  },

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar_url?: string; bio?: string }) {
    const user = await authRepository.updateProfile(userId, data);
    return sanitizeUser(user);
  },

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const matches = await bcrypt.compare(currentPass, user.password_hash);
    if (!matches) {
      throw new AppError('Current password is incorrect', 400);
    }

    const newHash = await bcrypt.hash(newPass, 10);
    await authRepository.updatePassword(userId, newHash);
    // Revoke all existing refresh tokens for security
    await authRepository.revokeAllUserTokens(userId);
  },
};

