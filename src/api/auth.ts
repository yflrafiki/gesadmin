import API from './axios';

export const loginUser = (data: { email: string; password: string }) =>
  API.post('/auth/login', data);

export const changePassword = (data: { current_password: string; new_password: string }) =>
  API.put('/auth/change-password', data);

export const registerAccount = (data: object) => API.post('/auth/register', data);

export const getUsersByRole = (params: { role: string; region?: string }) =>
  API.get('/auth/users', { params });