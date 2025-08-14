/**
 * Barrel export para módulos relacionados a admin
 * Facilita importações e mantém organização
 */

// Serviços
export { AdminService } from './auth/AdminService';

// Tipos
export type { AdminRole, AdminUser, AdminCheckResult, AdminServiceConfig } from '../types/admin';

// Utilitários
export { AdminUtils } from '../utils/adminUtils';

// Hooks
export { useAdminCheck, useAdminOperations } from '../hooks';
