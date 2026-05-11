import API from './axios';

export const getAllTeachers = (params?: object) =>
  API.get('/teachers', { params });

export const getTeacherById = (id: string) =>
  API.get(`/teachers/${id}`);

export const updateTeacher = (id: string, data: object) =>
  API.put(`/teachers/${id}`, data);