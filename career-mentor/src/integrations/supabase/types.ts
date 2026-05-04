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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          final_exam_score: number
          holder_name: string
          id: string
          issued_at: string
          milestone_count: number
          roadmap_id: string
          roadmap_title: string
          total_xp: number
          user_id: string
        }
        Insert: {
          final_exam_score?: number
          holder_name: string
          id?: string
          issued_at?: string
          milestone_count?: number
          roadmap_id: string
          roadmap_title: string
          total_xp?: number
          user_id: string
        }
        Update: {
          final_exam_score?: number
          holder_name?: string
          id?: string
          issued_at?: string
          milestone_count?: number
          roadmap_id?: string
          roadmap_title?: string
          total_xp?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          milestone_id: string | null
          roadmap_id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          milestone_id?: string | null
          roadmap_id: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          milestone_id?: string | null
          roadmap_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          created_at: string
          id: string
          milestone_id: string
          passed: boolean
          roadmap_id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          milestone_id: string
          passed: boolean
          roadmap_id: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          milestone_id?: string
          passed?: boolean
          roadmap_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          attempt_id: string
          correct_index: number
          id: string
          options: Json
          order_index: number
          question: string
          selected_index: number | null
        }
        Insert: {
          attempt_id: string
          correct_index: number
          id?: string
          options: Json
          order_index: number
          question: string
          selected_index?: number | null
        }
        Update: {
          attempt_id?: string
          correct_index?: number
          id?: string
          options?: Json
          order_index?: number
          question?: string
          selected_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          milestone_id: string
          order_index: number
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          milestone_id: string
          order_index?: number
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          milestone_id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string
          depends_on: string[]
          description: string | null
          difficulty: string
          estimated_time: string | null
          exam_score: number | null
          id: string
          is_final: boolean
          order_index: number
          parallel_with: string[]
          reward_xp: number
          roadmap_id: string
          section_id: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          depends_on?: string[]
          description?: string | null
          difficulty: string
          estimated_time?: string | null
          exam_score?: number | null
          id?: string
          is_final?: boolean
          order_index: number
          parallel_with?: string[]
          reward_xp?: number
          roadmap_id: string
          section_id?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          depends_on?: string[]
          description?: string | null
          difficulty?: string
          estimated_time?: string | null
          exam_score?: number | null
          id?: string
          is_final?: boolean
          order_index?: number
          parallel_with?: string[]
          reward_xp?: number
          roadmap_id?: string
          section_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          github_url: string | null
          id: string
          learning_goals: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          github_url?: string | null
          id?: string
          learning_goals?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          github_url?: string | null
          id?: string
          learning_goals?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          created_at: string
          estimated_duration: string | null
          goal_summary: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_duration?: string | null
          goal_summary: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_duration?: string | null
          goal_summary?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          roadmap_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          roadmap_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          roadmap_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
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
