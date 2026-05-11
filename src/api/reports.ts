import API from './axios';

export const getDashboardSummary = () =>
  API.get('/reports/summary');

export const getTransferReport = (params?: object) =>
  API.get('/reports/transfers', { params });

export const getPromotionReport = (params?: object) =>
  API.get('/reports/promotions', { params });

export const getAuditLog = (params?: object) =>
  API.get('/reports/audit', { params });

export const getTeacherHistory = (id: string) =>
  API.get(`/reports/teacher/${id}/history`);