export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  full_name: string;
  password: string;
}

export interface User {
  id: number; // Change this from 'id?: number' to 'id: number'
  username: string;
  email: string;
  full_name: string;
}