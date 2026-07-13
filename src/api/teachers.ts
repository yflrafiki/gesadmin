import API from './axios';
import { cached, bust } from '../lib/cache';

export const getAllTeachers = (params?: object) =>
  cached(`teachers:${JSON.stringify(params ?? {})}`, 60_000, () => API.get('/teachers', { params }));

export const getTeacherById = (id: string) =>
  cached(`teacher:${id}`, 2 * 60_000, () => API.get(`/teachers/${id}`));

export const updateTeacher = (id: string, data: object) => {
  bust('teachers:');
  bust(`teacher:${id}`);
  return API.put(`/teachers/${id}`, data);
};

export const deleteTeacher = (id: string) => {
  bust('teachers:');
  bust(`teacher:${id}`);
  return API.delete(`/teachers/${id}`);
};