export type ItemStatus = 'LOST' | 'FOUND' | 'UNDER_REVIEW' | 'MATCHED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt: string; // Serialized as Instant/ISO String
}

export interface Item {
  id: number;
  title: string;
  description: string;
  category?: string;
  status: ItemStatus;
  createdAt: string; // Serialized as LocalDateTime string
  user: User;
  imageUrl?: string;
}

export interface Notification {
  id: number;
  user: User;
  message: string;
  read: boolean;
  createdAt: string; // Serialized as LocalDateTime string
}

export interface ItemRequest {
  title: string;
  description: string;
  category?: string;
  status: string; // ItemStatus as string in payload validation
}

export interface ItemResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  reporterName: string;
  reporterId: number;
  imageUrl?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string; // Included optionally in request payload
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password?: string; // Included optionally in request payload
}

export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
