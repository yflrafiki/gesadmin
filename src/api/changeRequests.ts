import API from './axios';

export const getAllChangeRequests = (params?: object) =>
  API.get('/change-requests', { params });

export const reviewChangeRequest = (id: string, data: { status: 'approved' | 'rejected'; hr_notes?: string }) =>
  API.put(`/change-requests/${id}/review`, data);

// The endpoint requires the Bearer token, which only axios attaches — fetch as
// a blob and let the caller open/download it.
export const getChangeRequestDocument = (id: string) =>
  API.get(`/change-requests/${id}/document`, { responseType: 'blob' });
