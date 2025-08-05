import { supabase } from '../../../../lib/supabase';

/**
 * Interface para dados de admin
 */
export interface AdminData {
  id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Serviço para operações relacionadas aos administradores
 * Responsabilidade única: gerenciar verificações e dados de admin
 */
export class AdminService {
  /**
   * Verifica se um usuário é administrador
   * Usa a tabela 'admins' seguindo a estratégia do Dashboard
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      console.log('AdminService: Verificando admin para usuário:', userId);

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      console.log('AdminService: Resultado da consulta admin:', {
        adminData,
        adminError,
      });

      if (adminError) {
        console.error('AdminService: Erro ao verificar admin:', adminError);
        return false;
      }

      const isAdmin = adminData?.role === 'admin';
      console.log(`AdminService: Usuário ${isAdmin ? 'é' : 'não é'} admin`);
      
      return isAdmin;
    } catch (error) {
      console.error('AdminService: Erro ao verificar role de admin:', error);
      return false;
    }
  }

  /**
   * Obtém os dados completos do admin
   */
  static async getAdminData(userId: string): Promise<AdminData | null> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('AdminService: Erro ao obter dados do admin:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('AdminService: Erro ao obter dados do admin:', error);
      return null;
    }
  }

  /**
   * Lista todos os administradores
   */
  static async getAllAdmins(): Promise<AdminData[]> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('AdminService: Erro ao listar admins:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('AdminService: Erro ao listar admins:', error);
      return [];
    }
  }
}
