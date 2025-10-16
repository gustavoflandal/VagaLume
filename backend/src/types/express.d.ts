import { Request } from 'express';

// Tipo do usuário autenticado no request
export interface AuthUser {
  id: string;
  userId: string; // Alias para id (compatibilidade)
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Estender o tipo Request do Express para incluir o usuário autenticado
export interface AuthRequest extends Request {
  user?: AuthUser;
}
