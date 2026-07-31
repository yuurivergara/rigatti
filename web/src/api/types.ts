export type Role = 'admin' | 'user';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Company = {
  id: string;
  name: string;
};

export type Session = {
  user: User;
  company: Company;
};

export type AuthResult = Session & { token: string };

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  stock: number;
  active: boolean;
  createdAt: string;
};

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  stock: number;
  active: boolean;
};

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type ProductQuery = {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type AgentEvent =
  | { type: 'text'; text: string }
  | { type: 'tool'; name: string; input: unknown }
  | { type: 'done'; text: string }
  | { type: 'error'; message: string };
