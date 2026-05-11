import API from './axios';

export const getAllPromotions = (params?: object) =>
  API.get('/promotions', { params });

export const reviewPromotion = (id: string, data: object) =>
  API.put(`/promotions/${id}/review`, data);