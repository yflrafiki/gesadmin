import API from './axios';

export const createExam = (data: object) => API.post('/exams', data);
export const getAllExams = () => API.get('/exams');
export const publishExam = (id: string) => API.put(`/exams/${id}/publish`);
export const closeExam = (id: string) => API.put(`/exams/${id}/close`);
export const getExamResults = (id: string) => API.get(`/exams/${id}/results`);