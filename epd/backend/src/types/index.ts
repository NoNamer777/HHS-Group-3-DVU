import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PatientFilters extends PaginationParams {
  status?: string;
  search?: string;
}

export interface EncounterFilters extends PaginationParams {
  patientId?: number;
  status?: string;
  type?: string;
}
