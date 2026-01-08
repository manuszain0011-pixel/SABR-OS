export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string | null
          cover_url: string | null
          created_at: string
          current_page: number | null
          description: string | null
          finish_date: string | null
          id: string
          isbn: string | null
          notes: string | null
          rating: number | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number | null
          description?: string | null
          finish_date?: string | null
          id?: string
          isbn?: string | null
          notes?: string | null
          rating?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number | null
          description?: string | null
          finish_date?: string | null
          id?: string
          isbn?: string | null
          notes?: string | null
          rating?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category: string
          created_at: string
          currency: string | null
          id: string
          month: number | null
          period: string | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          currency?: string | null
          id?: string
          month?: number | null
          period?: string | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string | null
          id?: string
          month?: number | null
          period?: string | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      daily_inspiration: {
        Row: {
          id: string
          content_type: string
          arabic_text: string | null
          translation: string
          reference: string | null
          category: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          content_type: string
          arabic_text?: string | null
          translation: string
          reference?: string | null
          category?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          content_type?: string
          arabic_text?: string | null
          translation?: string
          reference?: string | null
          category?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      daily_checklist: {
        Row: {
          id: string
          user_id: string
          date: string
          morning_azkar: boolean | null
          evening_azkar: boolean | null
          quran_read: boolean | null
          sadaqah_given: boolean | null
          istighfar_100: boolean | null
          salawat_prophet: boolean | null
          dua_made: boolean | null
          good_deed: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          morning_azkar?: boolean | null
          evening_azkar?: boolean | null
          quran_read?: boolean | null
          sadaqah_given?: boolean | null
          istighfar_100?: boolean | null
          salawat_prophet?: boolean | null
          dua_made?: boolean | null
          good_deed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          morning_azkar?: boolean | null
          evening_azkar?: boolean | null
          quran_read?: boolean | null
          sadaqah_given?: boolean | null
          istighfar_100?: boolean | null
          salawat_prophet?: boolean | null
          dua_made?: boolean | null
          good_deed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          avatar_url: string | null
          birthday: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          is_favorite: boolean | null
          last_contact_date: string | null
          name: string
          notes: string | null
          phone: string | null
          relationship: string | null
          role: string | null
          social_links: Json | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          last_contact_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          role?: string | null
          social_links?: Json | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          last_contact_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          role?: string | null
          social_links?: Json | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string
          debt_id: string
          id: string
          notes: string | null
          payment_date: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          debt_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          debt_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          contact_name: string | null
          created_at: string
          currency: string | null
          current_amount: number
          due_date: string | null
          id: string
          interest_rate: number | null
          is_paid: boolean | null
          name: string
          notes: string | null
          original_amount: number
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          currency?: string | null
          current_amount: number
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          is_paid?: boolean | null
          name: string
          notes?: string | null
          original_amount: number
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          currency?: string | null
          current_amount?: number
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          is_paid?: boolean | null
          name?: string
          notes?: string | null
          original_amount?: number
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deep_work_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          duration_minutes: number
          mode: string
          completed: boolean | null
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          duration_minutes: number
          mode?: string
          completed?: boolean | null
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          duration_minutes?: number
          mode?: string
          completed?: boolean | null
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      duas: {
        Row: {
          answered_date: string | null
          arabic_text: string | null
          category: string | null
          created_at: string
          id: string
          is_answered: boolean | null
          is_favorite: boolean | null
          notes: string | null
          title: string
          translation: string | null
          transliteration: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answered_date?: string | null
          arabic_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean | null
          is_favorite?: boolean | null
          notes?: string | null
          title: string
          translation?: string | null
          transliteration?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answered_date?: string | null
          arabic_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean | null
          is_favorite?: boolean | null
          notes?: string | null
          title?: string
          translation?: string | null
          transliteration?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fasting_records: {
        Row: {
          created_at: string
          date: string
          id: string
          iftar_time: string | null
          is_completed: boolean | null
          notes: string | null
          suhoor_time: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          iftar_time?: string | null
          is_completed?: boolean | null
          notes?: string | null
          suhoor_time?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          iftar_time?: string | null
          is_completed?: boolean | null
          notes?: string | null
          suhoor_time?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          currency: string | null
          date: string
          description: string | null
          id: string
          is_recurring: boolean | null
          payment_method: string | null
          recurrence_type: string | null
          tags: string[] | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          currency?: string | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          recurrence_type?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          recurrence_type?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category: string | null
          created_at: string
          currency: string | null
          current_amount: number | null
          id: string
          is_achieved: boolean | null
          name: string
          notes: string | null
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string | null
          current_amount?: number | null
          id?: string
          is_achieved?: boolean | null
          name: string
          notes?: string | null
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string | null
          current_amount?: number | null
          id?: string
          is_achieved?: boolean | null
          name?: string
          notes?: string | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          area_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          progress: number | null
          status: string | null
          tags: string[] | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          default_frequency: string | null
          icon: string | null
          is_system: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          default_frequency?: string | null
          icon?: string | null
          is_system?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          default_frequency?: string | null
          icon?: string | null
          is_system?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      global_announcements: {
        Row: {
          id: string
          title: string
          message: string
          type: string | null
          is_active: boolean | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          message: string
          type?: string | null
          is_active?: boolean | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: string | null
          is_active?: boolean | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      feedback_reports: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          description: string
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          description: string
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          description?: string
          status?: string | null
          created_at?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_date: string
          count: number | null
          created_at: string
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_date: string
          count?: number | null
          created_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_date?: string
          count?: number | null
          created_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          area_id: string | null
          color: string | null
          created_at: string
          description: string | null
          frequency: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          streak_best: number | null
          streak_current: number | null
          target_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          frequency?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          streak_best?: number | null
          streak_current?: number | null
          target_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          frequency?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          streak_best?: number | null
          streak_current?: number | null
          target_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          area_id: string | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      interaction_notes: {
        Row: {
          contact_id: string
          content: string
          created_at: string
          id: string
          interaction_date: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string
          id?: string
          interaction_date?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string
          id?: string
          interaction_date?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interaction_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          challenges: string | null
          created_at: string
          energy_level: number | null
          entry_date: string
          gratitude: string[] | null
          highlights: string | null
          id: string
          learnings: string | null
          mood: string | null
          notes: string | null
          tags: string[] | null
          tomorrow_goals: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenges?: string | null
          created_at?: string
          energy_level?: number | null
          entry_date?: string
          gratitude?: string[] | null
          highlights?: string | null
          id?: string
          learnings?: string | null
          mood?: string | null
          notes?: string | null
          tags?: string[] | null
          tomorrow_goals?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenges?: string | null
          created_at?: string
          energy_level?: number | null
          entry_date?: string
          gratitude?: string[] | null
          highlights?: string | null
          id?: string
          learnings?: string | null
          mood?: string | null
          notes?: string | null
          tags?: string[] | null
          tomorrow_goals?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          goal_id: string
          id: string
          is_completed: boolean | null
          order_index: number | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          is_completed?: boolean | null
          order_index?: number | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          is_completed?: boolean | null
          order_index?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reviews: {
        Row: {
          areas_to_improve: string[] | null
          created_at: string
          goals_achieved: string[] | null
          goals_missed: string[] | null
          id: string
          key_wins: string[] | null
          month: number
          next_month_focus: string[] | null
          notes: string | null
          overall_rating: number | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          areas_to_improve?: string[] | null
          created_at?: string
          goals_achieved?: string[] | null
          goals_missed?: string[] | null
          id?: string
          key_wins?: string[] | null
          month: number
          next_month_focus?: string[] | null
          notes?: string | null
          overall_rating?: number | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          areas_to_improve?: string[] | null
          created_at?: string
          goals_achieved?: string[] | null
          goals_missed?: string[] | null
          id?: string
          key_wins?: string[] | null
          month?: number
          next_month_focus?: string[] | null
          notes?: string | null
          overall_rating?: number | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          area_id: string | null
          content: string | null
          created_at: string
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          project_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          project_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          project_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_records: {
        Row: {
          asr: string | null
          created_at: string
          date: string
          dhuhr: string | null
          fajr: string | null
          id: string
          isha: string | null
          maghrib: string | null
          notes: string | null
          tahajjud: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asr?: string | null
          created_at?: string
          date?: string
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          maghrib?: string | null
          notes?: string | null
          tahajjud?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asr?: string | null
          created_at?: string
          date?: string
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          maghrib?: string | null
          notes?: string | null
          tahajjud?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          language: string | null
          location: string | null
          name: string
          occupation: string | null
          phone: string | null
          role: string | null
          status: string | null
          social_links: Json | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          language?: string | null
          location?: string | null
          name?: string
          occupation?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          social_links?: Json | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          language?: string | null
          location?: string | null
          name?: string
          occupation?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          social_links?: Json | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          area_id: string | null
          color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          goal_id: string | null
          id: string
          name: string
          priority: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_id?: string | null
          id?: string
          name: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_id?: string | null
          id?: string
          name?: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      quran_goals: {
        Row: {
          created_at: string
          current_value: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          start_date: string | null
          target_value: number
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          start_date?: string | null
          target_value: number
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          start_date?: string | null
          target_value?: number
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_progress: {
        Row: {
          ayah_from: number | null
          ayah_to: number | null
          created_at: string
          date: string
          duration_minutes: number | null
          id: string
          juz_number: number | null
          notes: string | null
          pages_read: number | null
          surah_name: string | null
          surah_number: number | null
          type: string | null
          user_id: string
        }
        Insert: {
          ayah_from?: number | null
          ayah_to?: number | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          id?: string
          juz_number?: number | null
          notes?: string | null
          pages_read?: number | null
          surah_name?: string | null
          surah_number?: number | null
          type?: string | null
          user_id: string
        }
        Update: {
          ayah_from?: number | null
          ayah_to?: number | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          id?: string
          juz_number?: number | null
          notes?: string | null
          pages_read?: number | null
          surah_name?: string | null
          surah_number?: number | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          area_id: string | null
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean | null
          status: string | null
          tags: string[] | null
          title: string
          type: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          status?: string | null
          tags?: string[] | null
          title: string
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_events: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          is_all_day: boolean | null
          is_recurring: boolean | null
          location: string | null
          recurrence_end_date: string | null
          recurrence_type: string | null
          reminder_minutes: number | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          reminder_minutes?: number | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          reminder_minutes?: number | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string | null
          category: string | null
          created_at: string
          currency: string | null
          id: string
          is_active: boolean | null
          name: string
          next_billing_date: string | null
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          category?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          next_billing_date?: string | null
          notes?: string | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          category?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          next_billing_date?: string | null
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean | null
          order_index: number | null
          task_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          order_index?: number | null
          task_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          order_index?: number | null
          task_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_minutes: number | null
          area_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          due_time: string | null
          estimated_minutes: number | null
          goal_id: string | null
          id: string
          is_recurring: boolean | null
          priority: string | null
          project_id: string | null
          recurrence_interval: number | null
          recurrence_type: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_minutes?: number | null
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: string | null
          project_id?: string | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_minutes?: number | null
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: string | null
          project_id?: string | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          date_format: string | null
          default_currency: string | null
          email_notifications: boolean | null
          id: string
          notifications_enabled: boolean | null
          prayer_calculation_method: string | null
          prayer_reminder_minutes: number | null
          prayer_reminders: boolean | null
          time_format: string | null
          updated_at: string
          user_id: string
          week_starts_on: string | null
          city: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          custom_prayer_times: Json | null
        }
        Insert: {
          created_at?: string
          date_format?: string | null
          default_currency?: string | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          prayer_calculation_method?: string | null
          prayer_reminder_minutes?: number | null
          prayer_reminders?: boolean | null
          time_format?: string | null
          updated_at?: string
          user_id: string
          week_starts_on?: string | null
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          custom_prayer_times?: Json | null
        }
        Update: {
          created_at?: string
          date_format?: string | null
          default_currency?: string | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          prayer_calculation_method?: string | null
          prayer_reminder_minutes?: number | null
          prayer_reminders?: boolean | null
          time_format?: string | null
          updated_at?: string
          user_id?: string
          week_starts_on?: string | null
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          custom_prayer_times?: Json | null
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          created_at: string
          description: string | null
          genre: string[] | null
          id: string
          notes: string | null
          platform: string | null
          poster_url: string | null
          rating: number | null
          release_year: number | null
          status: string | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
          watched_date: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          genre?: string[] | null
          id?: string
          notes?: string | null
          platform?: string | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
          watched_date?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          genre?: string[] | null
          id?: string
          notes?: string | null
          platform?: string | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
          watched_date?: string | null
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          accomplishments: string[] | null
          challenges: string[] | null
          created_at: string
          id: string
          lessons_learned: string[] | null
          next_week_priorities: string[] | null
          notes: string | null
          overall_rating: number | null
          updated_at: string
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          accomplishments?: string[] | null
          challenges?: string[] | null
          created_at?: string
          id?: string
          lessons_learned?: string[] | null
          next_week_priorities?: string[] | null
          notes?: string | null
          overall_rating?: number | null
          updated_at?: string
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          accomplishments?: string[] | null
          challenges?: string[] | null
          created_at?: string
          id?: string
          lessons_learned?: string[] | null
          next_week_priorities?: string[] | null
          notes?: string | null
          overall_rating?: number | null
          updated_at?: string
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      zikr_entries: {
        Row: {
          count: number | null
          created_at: string
          date: string
          id: string
          notes: string | null
          target_count: number | null
          type: string
          user_id: string
        }
        Insert: {
          count?: number | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          target_count?: number | null
          type: string
          user_id: string
        }
        Update: {
          count?: number | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          target_count?: number | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      zakat_records: {
        Row: {
          id: string
          user_id: string
          year: number
          nisab_amount: number
          total_zakatable_wealth: number
          zakat_due: number
          zakat_paid: number | null
          is_paid: boolean | null
          payment_date: string | null
          notes: string | null
          business_value: number | null
          investments_value: number | null
          gold_value: number | null
          silver_value: number | null
          cash_amount: number | null
          debts_deducted: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year: number
          nisab_amount: number
          total_zakatable_wealth: number
          zakat_due: number
          zakat_paid?: number | null
          is_paid?: boolean | null
          payment_date?: string | null
          notes?: string | null
          business_value?: number | null
          investments_value?: number | null
          gold_value?: number | null
          silver_value?: number | null
          cash_amount?: number | null
          debts_deducted?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          year?: number
          nisab_amount?: number
          total_zakatable_wealth?: number
          zakat_due?: number
          zakat_paid?: number | null
          is_paid?: boolean | null
          payment_date?: string | null
          notes?: string | null
          business_value?: number | null
          investments_value?: number | null
          gold_value?: number | null
          silver_value?: number | null
          cash_amount?: number | null
          debts_deducted?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
