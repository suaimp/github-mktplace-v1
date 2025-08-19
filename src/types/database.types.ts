export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          role?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      // ... (resto dos tipos foram gerados pelo comando anterior)
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // ... (funções do banco)
    }
    Enums: {
      pix_key_type: "cpf" | "cnpj" | "phone" | "email" | "random"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Exportar tipos úteis
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
