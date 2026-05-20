import API from './axios';

export const getAllPromotions = (params?: object) =>
  API.get('/promotions', { params });

export const reviewPromotion = (id: string, data: object) =>
  API.put(`/promotions/${id}/review`, data);

export const getPromotionDocuments = () => API.get('/promotions/documents');
export const reviewPromotionDocument = (id: string, data: object) =>
  API.put(`/promotions/documents/${id}/review`, data);