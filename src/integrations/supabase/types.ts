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
          config: Json | null
          config_public: Json | null
          config_encrypted: string | null
          config_iv: string | null
          connector_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          config_public?: Json | null
          config_encrypted?: string | null
          config_iv?: string | null
          connector_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          config_public?: Json | null
          config_encrypted?: string | null
          config_iv?: string | null
          connector_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
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
            foreignKeyName: "connections_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      connectors: {
        Row: {
          config: Json | null
          config_public: Json | null
          config_encrypted: string | null
          config_iv: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          provider: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          config_public?: Json | null
          config_encrypted?: string | null
          config_iv?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          config_public?: Json | null
          config_encrypted?: string | null
          config_iv?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      field_mapping: {
        Row: {
          created_at: string | null
          destination_field: string
          id: string
          source_field: string
          sync_id: string | null
          transformation_config: Json | null
          transformation_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          destination_field: string
          id?: string
          source_field: string
          sync_id?: string | null
          transformation_config?: Json | null
          transformation_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          destination_field?: string
          id?: string
          source_field?: string
          sync_id?: string | null
          transformation_config?: Json | null
          transformation_type?: string | null
          updated_at?: string | null
          user_id?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      sync_field_mappings: {
        Row: {
          airtable_field_name: string
          created_at: string
          id: string
          postgres_field_name: string
          sync_id: string
        }
        Insert: {
          airtable_field_name: string
          created_at?: string
          id?: string
          postgres_field_name: string
          sync_id: string
        }
        Update: {
          airtable_field_name?: string
          created_at?: string
          id?: string
          postgres_field_name?: string
          sync_id?: string
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
      sync_logs: {
        Row: {
          created_at: string
          direction: string
          duration_ms: number | null
          error_message: string | null
          id: string
          records_inserted: number | null
          records_skipped: number | null
          records_updated: number | null
          status: string
          sync_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          direction: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          records_inserted?: number | null
          records_skipped?: number | null
          records_updated?: number | null
          status: string
          sync_id: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          direction?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          records_inserted?: number | null
          records_skipped?: number | null
          records_updated?: number | null
          status?: string
          sync_id?: string
          timestamp?: string
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
      syncs: {
        Row: {
          config: Json
          created_at: string | null
          destination_id: string | null
          id: string
          name: string
          source_id: string | null
          status: string
          sync_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          destination_id?: string | null
          id?: string
          name: string
          source_id?: string | null
          status?: string
          sync_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          destination_id?: string | null
          id?: string
          name?: string
          source_id?: string | null
          status?: string
          sync_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syncs_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syncs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      connectors_public: {
        Row: {
          id: string
          name: string
          type: string
          provider: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          icon: string | null
          description: string | null
          host: string | null
          port: string | null
          database: string | null
          username: string | null
          schema: string | null
          ssl: string | null
          required_fields: string | null
          optional_fields: string | null
          auth_url: string | null
          token_url: string | null
          redirect_url: string | null
          scopes: string | null
          client_id: string | null
          code_challenge_required: string | null
          config_public: Json | null
        }
        Insert: {
          id?: string
          name?: string
          type?: string
          provider?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          icon?: string | null
          description?: string | null
          host?: string | null
          port?: string | null
          database?: string | null
          username?: string | null
          schema?: string | null
          ssl?: string | null
          required_fields?: string | null
          optional_fields?: string | null
          auth_url?: string | null
          token_url?: string | null
          redirect_url?: string | null
          scopes?: string | null
          client_id?: string | null
          code_challenge_required?: string | null
          config_public?: Json | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          provider?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          icon?: string | null
          description?: string | null
          host?: string | null
          port?: string | null
          database?: string | null
          username?: string | null
          schema?: string | null
          ssl?: string | null
          required_fields?: string | null
          optional_fields?: string | null
          auth_url?: string | null
          token_url?: string | null
          redirect_url?: string | null
          scopes?: string | null
          client_id?: string | null
          code_challenge_required?: string | null
          config_public?: Json | null
        }
        Relationships: []
      }
      connections_public: {
        Row: {
          id: string
          connector_id: string | null
          name: string
          config_public: Json | null
          user_id: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          connector_id?: string | null
          name?: string
          config_public?: Json | null
          user_id?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          connector_id?: string | null
          name?: string
          config_public?: Json | null
          user_id?: string
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
          }
        ]
      }
    }
    Functions: {
      get_team_member_profile: {
        Args: { member_user_id: string }
        Returns: {
          email: string
          username: string
          avatar_url: string
        }[]
      }
      get_user_connections: {
        Args: { uid: string }
        Returns: string[]
      }
      get_user_syncs: {
        Args: { uid: string }
        Returns: string[]
      }
      get_connector_with_decrypted_config: {
        Args: { connector_id: string }
        Returns: {
          id: string
          name: string
          type: string
          provider: string
          config: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_connection_with_decrypted_config: {
        Args: { connection_id: string }
        Returns: {
          id: string
          connector_id: string
          name: string
          config_public: Json
          config_private: Json
          user_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_all_connectors_with_decrypted_configs: {
        Args: Record<string, never>
        Returns: {
          id: string
          name: string
          type: string
          provider: string
          config: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_user_connections_with_decrypted_configs: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          connector_id: string
          name: string
          config_public: Json
          config_private: Json
          user_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      update_connection_safe: {
        Args: { connection_id: string; updates: Json }
        Returns: Json
      }
      get_connection_metadata: {
        Args: { connection_id: string }
        Returns: {
          id: string
          connector_id: string
          name: string
          config_public: Json
          user_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_user_connections_metadata: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          connector_id: string
          name: string
          config_public: Json
          user_id: string
          is_active: boolean
          created_at: string
          updated_at: string
          connector_name: string
          connector_provider: string
          connector_type: string
        }[]
      }
      validate_connection_ownership: {
        Args: { connection_id: string }
        Returns: boolean
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
