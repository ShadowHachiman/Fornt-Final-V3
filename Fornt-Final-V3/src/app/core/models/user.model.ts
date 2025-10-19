// src/app/core/models/user.model.ts

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN'; // Roles definidos en Spring Boot
  active: boolean;
}

export interface UserCreationDTO {
  username: string;
  password?: string; // Solo requerido en la creación o cambio de clave
  email: string;
  roles: string[]; // Backend espera un array de roles
}
