import { jsonBody, request } from './http';
import type { AuthResult, Session } from './types';

export type RegisterInput = {
  companyName: string;
  name: string;
  email: string;
  password: string;
};

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResult>('/api/auth/login', {
      method: 'POST',
      body: jsonBody({ email, password }),
    }),

  register: (input: RegisterInput) =>
    request<AuthResult>('/api/auth/register', { method: 'POST', body: jsonBody(input) }),

  me: () => request<Session>('/api/auth/me'),
};
