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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      app_pages: {
        Row: {
          audio_title: string | null
          audio_url: string | null
          auto_play_audio: boolean | null
          created_at: string
          created_by: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number | null
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_title?: string | null
          audio_url?: string | null
          auto_play_audio?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index?: number | null
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_title?: string | null
          audio_url?: string | null
          auto_play_audio?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          content_type: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_content: {
        Row: {
          content: string | null
          content_type: string
          created_at: string
          created_by: string
          display_date: string
          external_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          content_type: string
          created_at?: string
          created_by: string
          display_date?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          content_type?: string
          created_at?: string
          created_by?: string
          display_date?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      dm_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
        }
        Relationships: []
      }
      page_playlists: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          order_index: number | null
          page_slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          page_slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          page_slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_shared: boolean | null
          likes_count: number | null
          page_id: string | null
          post_type: string | null
          shared_count: number | null
          title: string
          updated_at: string
          user_likes: string[] | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_shared?: boolean | null
          likes_count?: number | null
          page_id?: string | null
          post_type?: string | null
          shared_count?: number | null
          title: string
          updated_at?: string
          user_likes?: string[] | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_shared?: boolean | null
          likes_count?: number | null
          page_id?: string | null
          post_type?: string | null
          shared_count?: number | null
          title?: string
          updated_at?: string
          user_likes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "page_posts_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "app_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          description: string | null
          id: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          slug?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          africas_talking_transaction_id: string | null
          amount_zar: number
          completed_at: string | null
          created_at: string
          id: string
          room_id: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          africas_talking_transaction_id?: string | null
          amount_zar: number
          completed_at?: string | null
          created_at?: string
          id?: string
          room_id?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          africas_talking_transaction_id?: string | null
          amount_zar?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          room_id?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      playlist_tracks: {
        Row: {
          artist: string
          audio_url: string
          cover_image_url: string | null
          created_at: string
          created_by: string
          duration_seconds: number | null
          id: string
          is_active: boolean
          order_index: number | null
          playlist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artist: string
          audio_url: string
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          playlist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artist?: string
          audio_url?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          playlist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "page_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          audio_url: string
          comments_count: number | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          host_name: string
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          likes_count: number | null
          plays_count: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url: string
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          host_name: string
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          likes_count?: number | null
          plays_count?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          host_name?: string
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          likes_count?: number | null
          plays_count?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          post_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          post_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "page_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      private_rooms: {
        Row: {
          created_at: string
          emoji: string
          expires_at: string
          host_id: string
          id: string
          is_active: boolean
          max_participants: number
          name: string
          participant_ids: string[] | null
        }
        Insert: {
          created_at?: string
          emoji?: string
          expires_at?: string
          host_id: string
          id?: string
          is_active?: boolean
          max_participants?: number
          name: string
          participant_ids?: string[] | null
        }
        Update: {
          created_at?: string
          emoji?: string
          expires_at?: string
          host_id?: string
          id?: string
          is_active?: boolean
          max_participants?: number
          name?: string
          participant_ids?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reels: {
        Row: {
          comments_count: number | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          likes_count: number | null
          shares_count: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          shares_count?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          shares_count?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roll_up_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roll_up_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "roll_up_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      roll_up_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roll_up_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "roll_up_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      roll_up_posts: {
        Row: {
          caption: string | null
          comments_count: number | null
          created_at: string
          id: string
          image_url: string
          likes_count: number | null
          updated_at: string
          user_id: string
          vibe_tags: string[] | null
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          id?: string
          image_url: string
          likes_count?: number | null
          updated_at?: string
          user_id: string
          vibe_tags?: string[] | null
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          id?: string
          image_url?: string
          likes_count?: number | null
          updated_at?: string
          user_id?: string
          vibe_tags?: string[] | null
        }
        Relationships: []
      }
      tracks: {
        Row: {
          artist: string
          audio_url: string | null
          comments_count: number | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_trending: boolean | null
          likes_count: number | null
          title: string
          updated_at: string
        }
        Insert: {
          artist: string
          audio_url?: string | null
          comments_count?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_trending?: boolean | null
          likes_count?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          artist?: string
          audio_url?: string | null
          comments_count?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_trending?: boolean | null
          likes_count?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          badges: string[] | null
          created_at: string
          id: string
          level_name: string | null
          points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: string[] | null
          created_at?: string
          id?: string
          level_name?: string | null
          points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: string[] | null
          created_at?: string
          id?: string
          level_name?: string | null
          points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_reel_likes: {
        Args: { reel_id: string }
        Returns: undefined
      }
      make_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      badge_type: "admin" | "verified"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      badge_type: ["admin", "verified"],
    },
  },
} as const
