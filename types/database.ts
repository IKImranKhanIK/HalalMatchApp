/**
 * Database Types
 * These types represent the Supabase database schema
 * Can be auto-generated with: npx supabase gen types typescript --project-id <project-id>
 */

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
      events: {
        Row: {
          id: string
          name: string
          event_date: string
          location: string | null
          status: 'upcoming' | 'active' | 'completed' | 'cancelled'
          max_participants: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          event_date: string
          location?: string | null
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          max_participants?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          event_date?: string
          location?: string | null
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          max_participants?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          participant_number: number
          full_name: string
          email: string
          phone: string
          gender: 'male' | 'female'
          background_check_status: 'pending' | 'approved' | 'rejected'
          qr_code_data: string | null
          event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_number?: number
          full_name: string
          email: string
          phone: string
          gender: 'male' | 'female'
          background_check_status?: 'pending' | 'approved' | 'rejected'
          qr_code_data?: string | null
          event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_number?: number
          full_name?: string
          email?: string
          phone?: string
          gender?: 'male' | 'female'
          background_check_status?: 'pending' | 'approved' | 'rejected'
          qr_code_data?: string | null
          event_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interest_selections: {
        Row: {
          id: string
          selector_id: string
          selected_id: string
          created_at: string
        }
        Insert: {
          id?: string
          selector_id: string
          selected_id: string
          created_at?: string
        }
        Update: {
          id?: string
          selector_id?: string
          selected_id?: string
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      mutual_matches: {
        Row: {
          participant_1_id: string
          participant_2_id: string
          participant_1_number: number
          participant_1_name: string
          participant_1_email: string
          participant_1_phone: string
          participant_1_gender: 'male' | 'female'
          participant_2_number: number
          participant_2_name: string
          participant_2_email: string
          participant_2_phone: string
          participant_2_gender: 'male' | 'female'
          first_selection_at: string
          second_selection_at: string
          match_completed_at: string
        }
      }
    }
    Functions: {
      get_selection_stats: {
        Args: Record<string, never>
        Returns: {
          total_selections: number
          mutual_matches_count: number
          male_participants: number
          female_participants: number
          approved_participants: number
          pending_checks: number
        }[]
      }
      get_participant_selections: {
        Args: { participant_uuid: string }
        Returns: {
          selection_id: string
          selected_participant_id: string
          selected_participant_number: number
          selected_participant_name: string
          selected_participant_gender: 'male' | 'female'
          selected_at: string
          is_mutual_match: boolean
        }[]
      }
    }
  }
}
