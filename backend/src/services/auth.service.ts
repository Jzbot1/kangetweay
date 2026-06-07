import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as userQueries from '../db/queries/users.queries.js';
import { BadRequestError, UnauthorizedError } from '../lib/errors.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}

export async function register(name: string, email: string, password: string) {
  const existing = await userQueries.findUserByEmail(email);
  if (existing) {
    throw new BadRequestError('Email already in use');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await userQueries.createUser(name, email, passwordHash);
  
  const payload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const { password_hash, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
}

export async function login(email: string, password: string) {
  const user = await userQueries.findUserByEmail(email);
  if (!user) {
    throw new BadRequestError('Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new BadRequestError('Invalid email or password');
  }

  if (!user.is_active) {
    throw new UnauthorizedError('User account is deactivated');
  }

  const payload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const { password_hash, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
}

export async function refresh(token: string) {
  const payload = verifyRefreshToken(token);
  const user = await userQueries.findUserById(payload.userId);
  
  if (!user || !user.is_active) {
    throw new UnauthorizedError('User account deactivated or not found');
  }

  const newPayload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(newPayload);

  return {
    accessToken
  };
}
