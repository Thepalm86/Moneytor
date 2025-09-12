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
      achievements: {
        Row: {
          badge_color: string
          badge_icon: string
          category: Database['public']['Enums']['achievement_category']
          created_at: string
          criteria: Json
          description: string
          id: string
          is_active: boolean
          name: string
          points: number
        }
        Insert: {
          badge_color: string
          badge_icon: string
          category: Database['public']['Enums']['achievement_category']
          created_at?: string
          criteria: Json
          description: string
          id?: string
          is_active?: boolean
          name: string
          points: number
        }
        Update: {
          badge_color?: string
          badge_icon?: string
          category?: Database['public']['Enums']['achievement_category']
          created_at?: string
          criteria?: Json
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          points?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          is_active: boolean
          name: string
          type: Database['public']['Enums']['transaction_type']
          updated_at: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          type: Database['public']['Enums']['transaction_type']
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: Database['public']['Enums']['transaction_type']
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          currency: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          theme_preference: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          currency?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          theme_preference?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          currency?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          theme_preference?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      saving_goals: {
        Row: {
          color: string
          created_at: string
          current_amount: number
          description: string | null
          id: string
          is_achieved: boolean
          name: string
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          is_achieved?: boolean
          name: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          is_achieved?: boolean
          name?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saving_goals_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      targets: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          period_end: string
          period_start: string
          period_type: Database['public']['Enums']['period_type']
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          period_end: string
          period_start: string
          period_type: Database['public']['Enums']['period_type']
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          period_end?: string
          period_start?: string
          period_type?: Database['public']['Enums']['period_type']
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'targets_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'targets_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          date: string
          description: string | null
          id: string
          tags: string[]
          type: Database['public']['Enums']['transaction_type']
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          tags?: string[]
          type: Database['public']['Enums']['transaction_type']
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          tags?: string[]
          type?: Database['public']['Enums']['transaction_type']
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          earned_at: string
          id: string
          progress: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_achievements_achievement_id_fkey'
            columns: ['achievement_id']
            isOneToOne: false
            referencedRelation: 'achievements'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_achievements_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_category_spending: {
        Args: {
          user_id: string
          category_id: string
          start_date: string
          end_date: string
        }
        Returns: number
      }
      get_period_expenses: {
        Args: {
          user_id: string
          start_date: string
          end_date: string
        }
        Returns: number
      }
      get_period_income: {
        Args: {
          user_id: string
          start_date: string
          end_date: string
        }
        Returns: number
      }
      get_target_spending: {
        Args: {
          target_id: string
        }
        Returns: number
      }
      update_saving_goal_progress: {
        Args: {
          goal_id: string
          amount: number
        }
        Returns: boolean
      }
    }
    Enums: {
      achievement_category: 'saving' | 'spending' | 'budgeting' | 'consistency'
      period_type: 'weekly' | 'monthly' | 'yearly'
      transaction_type: 'income' | 'expense'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}