export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          id: string
          connector_id: string | null
          name: string
          config: Json
          team_id: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          connector_id?: string | null
          name: string
          config: Json
          team_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          connector_id?: string | null
          name?: string
          config?: Json
          team_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      connectors: {
        Row: {
          id: string
          name: string
          type: string
          provider: string
          config: Json
          team_id: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          provider: string
          config: Json
          team_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          provider?: string
          config?: Json
          team_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connectors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sync_jobs: {
        Row: {
          id: string
          sync_id: string
          team_id: string
          status: string
          progress: number | null
          last_synced_at: string | null
          message: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          sync_id: string
          team_id: string
          status?: string
          progress?: number | null
          last_synced_at?: string | null
          message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sync_id?: string
          team_id?: string
          status?: string
          progress?: number | null
          last_synced_at?: string | null
          message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_sync_jobs_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "syncs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_sync_jobs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      field_mapping: {
        Row: {
          id: string
          sync_id: string | null
          source_field: string
          destination_field: string
          transformation_type: string | null
          transformation_config: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          sync_id?: string | null
          source_field: string
          destination_field: string
          transformation_type?: string | null
          transformation_config?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sync_id?: string | null
          source_field?: string
          destination_field?: string
          transformation_type?: string | null
          transformation_config?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_mapping_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "syncs"
            referencedColumns: ["id"]
          },
        ]
      }
      metadata_sync_jobs: {
        Row: {
          id: string
          connection_id: string
          team_id: string
          status: string
          progress: number | null
          started_at: string | null
          error: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          connection_id: string
          team_id: string
          status?: string
          progress?: number | null
          started_at?: string | null
          error?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          connection_id?: string
          team_id?: string
          status?: string
          progress?: number | null
          started_at?: string | null
          error?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metadata_sync_jobs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metadata_sync_jobs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          id: string
          sync_id: string
          timestamp: string
          direction: string
          status: string
          records_inserted: number | null
          records_updated: number | null
          records_skipped: number | null
          duration_ms: number | null
          error_message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          sync_id: string
          timestamp?: string
          direction: string
          status: string
          records_inserted?: number | null
          records_updated?: number | null
          records_skipped?: number | null
          duration_ms?: number | null
          error_message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          sync_id?: string
          timestamp?: string
          direction?: string
          status?: string
          records_inserted?: number | null
          records_updated?: number | null
          records_skipped?: number | null
          duration_ms?: number | null
          error_message?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "syncs"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_field_mappings: {
        Row: {
          id: string
          sync_id: string
          airtable_field_name: string
          postgres_field_name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          sync_id: string
          airtable_field_name: string
          postgres_field_name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          sync_id?: string
          airtable_field_name?: string
          postgres_field_name?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_field_mappings_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "syncs"
            referencedColumns: ["id"]
          },
        ]
      }
      syncs: {
        Row: {
          id: string
          name: string
          source_id: string | null
          destination_id: string | null
          config: Json
          team_id: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          source_id?: string | null
          destination_id?: string | null
          config: Json
          team_id?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          source_id?: string | null
          destination_id?: string | null
          config?: Json
          team_id?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syncs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syncs_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syncs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          team_id: string | null
          user_id: string | null
          role: string
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          team_id?: string | null
          user_id?: string | null
          role: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string | null
          user_id?: string | null
          role?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_accessible_sync_ids_for_user: {
        Args: { uid: string }
        Returns: string[]
      }
      get_role_based_team_ids_for_user: {
        Args: { uid: string; role_param: string }
        Returns: string[]
      }
      get_team_ids_for_user: {
        Args: { uid: string }
        Returns: string[]
      }
      get_team_member_profile: {
        Args: { member_user_id: string }
        Returns: {
          email: string
          username: string
          avatar_url: string
        }[]
      }
      get_syncs_by_table_id: {
        Args: { table_id: string }
        Returns: string[]
      }
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
