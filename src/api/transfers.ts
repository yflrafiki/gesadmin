import API from './axios';

export const getAllTransfers = (params?: object) =>
  API.get('/transfers', { params });

export const reviewTransfer = (id: string, data: object) =>
  API.put(`/transfers/${id}/review`, data);