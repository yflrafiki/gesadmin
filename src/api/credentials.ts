import API from './axios';

export const verifyByTxId = (txId: string) =>
  API.get(`/credentials/check/${txId}`);

export const getTeacherCredentials = (teacherId: string) =>
  API.get(`/credentials/teacher/${teacherId}`);

// Read-only — verification already happened automatically when each teacher
// uploaded their document; HR has nothing to upload or review here.
export const getVerifiedTeachers = () => API.get('/credentials/verified-teachers');