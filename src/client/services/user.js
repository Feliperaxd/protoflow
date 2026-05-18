import { request } from './api.js';

export function createUser(data) {
  return request('/users/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateUser(uid, data) {
  return request(`/users/${uid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteUser(uid) {
  return request(`/users/${uid}`, { method: 'DELETE' });
}
