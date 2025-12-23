export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          content: string
          team_id: string
          created_by: string | null
          created_at: string
          category: string | null
        }
        Insert: {
          id?: string
          content: string
          team_id: string
          created_by?: string | null
          created_at?: string
          category?: string | null
        }
        Update: {
          id?: string
          content?: string
          team_id?: string
          created_by?: string | null
          created_at?: string
          category?: string | null
        }
      }
      weekly_evaluations: {
        Row: {
          id: string
          team_id: string
          rating: number | null
          feedback: string | null
          week_start_date: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          rating?: number | null
          feedback?: string | null
          week_start_date: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          rating?: number | null
          feedback?: string | null
          week_start_date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

