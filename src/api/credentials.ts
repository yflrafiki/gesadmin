import API from './axios';

export const verifyByTxId = (txId: string) =>
  API.get(`/credentials/check/${txId}`);

export const getTeacherCredentials = (teacherId: string) =>
  API.get(`/credentials/teacher/${teacherId}`);