import API from './axios';

export const loginUser = (data: { email: string; password: string }) =>
  API.post('/auth/login', data);

export const changePassword = (data: { current_password: string; new_password: string }) =>
  API.put('/auth/change-password', data);

export const registerAccount = (data: object) => API.post('/auth/register', data);

export const getUsersByRole = (params: { role: string; region?: string }) =>
  API.get('/auth/users', { params });

export const verifyEmailCode = (data: { email: string; code: string }) =>
  API.post('/auth/verify-email-code', data);

export const resendVerificationCode = (data: { email: string }) =>
  API.post('/auth/resend-verification-code', data);