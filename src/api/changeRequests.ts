import API from './axios';

export const getAllChangeRequests = (params?: object) =>
  API.get('/change-requests', { params });

export const reviewChangeRequest = (id: string, data: { status: 'approved' | 'rejected'; hr_notes?: string }) =>
  API.put(`/change-requests/${id}/review`, data);
