import API from './axios';
import { cached } from '../lib/cache';

export const getDashboardSummary = (userId?: string) =>
  cached(`dashboard:summary:${userId ?? 'anon'}`, 5 * 60_000, () => API.get('/reports/summary'));

export const getTransferReport = (params?: object) =>
  API.get('/reports/transfers', { params });

export const getPromotionReport = (params?: object) =>
  API.get('/reports/promotions', { params });

export const getAuditLog = (params?: object) =>
  API.get('/reports/audit', { params });

export const getTeacherHistory = (id: string) =>
  API.get(`/reports/teacher/${id}/history`);