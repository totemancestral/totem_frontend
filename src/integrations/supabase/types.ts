export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      commandes: {
        Row: {
          created_at: string;
          devise: string;
          id: string;
          langue: string;
          montant_cents: number;
          offre: Database["public"]["Enums"]["offre_type"];
          pays: string | null;
          reponses_id: string | null;
          statut: Database["public"]["Enums"]["commande_statut"];
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          devise?: string;
          id?: string;
          langue?: string;
          montant_cents: number;
          offre: Database["public"]["Enums"]["offre_type"];
          pays?: string | null;
          reponses_id?: string | null;
          statut?: Database["public"]["Enums"]["commande_statut"];
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          devise?: string;
          id?: string;
          langue?: string;
          montant_cents?: number;
          offre?: Database["public"]["Enums"]["offre_type"];
          pays?: string | null;
          reponses_id?: string | null;
          statut?: Database["public"]["Enums"]["commande_statut"];
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commandes_reponses_id_fkey";
            columns: ["reponses_id"];
            isOneToOne: false;
            referencedRelation: "reponses_parcours";
            referencedColumns: ["id"];
          },
        ];
      };
      erreurs_pipeline: {
        Row: {
          commande_id: string;
          created_at: string;
          etape: string;
          id: string;
          message: string;
          stack: string | null;
          tentative: number;
        };
        Insert: {
          commande_id: string;
          created_at?: string;
          etape: string;
          id?: string;
          message: string;
          stack?: string | null;
          tentative?: number;
        };
        Update: {
          commande_id?: string;
          created_at?: string;
          etape?: string;
          id?: string;
          message?: string;
          stack?: string | null;
          tentative?: number;
        };
        Relationships: [
          {
            foreignKeyName: "erreurs_pipeline_commande_id_fkey";
            columns: ["commande_id"];
            isOneToOne: false;
            referencedRelation: "commandes";
            referencedColumns: ["id"];
          },
        ];
      };
      oeuvres: {
        Row: {
          audio_url: string | null;
          commande_id: string;
          created_at: string;
          id: string;
          image_url: string | null;
          metadata: Json;
          nom_totem: string | null;
          numero_serie: string | null;
          pdf_url: string | null;
          recit: string | null;
          statut: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          audio_url?: string | null;
          commande_id: string;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          metadata?: Json;
          nom_totem?: string | null;
          numero_serie?: string | null;
          pdf_url?: string | null;
          recit?: string | null;
          statut?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          audio_url?: string | null;
          commande_id?: string;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          metadata?: Json;
          nom_totem?: string | null;
          numero_serie?: string | null;
          pdf_url?: string | null;
          recit?: string | null;
          statut?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oeuvres_commande_id_fkey";
            columns: ["commande_id"];
            isOneToOne: false;
            referencedRelation: "commandes";
            referencedColumns: ["id"];
          },
        ];
      };
      oeuvre_versions: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          is_current: boolean;
          metadata: Json;
          nom_totem: string | null;
          oeuvre_id: string;
          recit: string | null;
          type: string;
          updated_at: string;
          user_id: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_current?: boolean;
          metadata?: Json;
          nom_totem?: string | null;
          oeuvre_id: string;
          recit?: string | null;
          type?: string;
          updated_at?: string;
          user_id: string;
          version?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_current?: boolean;
          metadata?: Json;
          nom_totem?: string | null;
          oeuvre_id?: string;
          recit?: string | null;
          type?: string;
          updated_at?: string;
          user_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "oeuvre_versions_oeuvre_id_fkey";
            columns: ["oeuvre_id"];
            isOneToOne: false;
            referencedRelation: "oeuvres";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          langue: string;
          pays: string | null;
          prenom: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
          langue?: string;
          pays?: string | null;
          prenom?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          langue?: string;
          pays?: string | null;
          prenom?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reponses_parcours: {
        Row: {
          created_at: string;
          id: string;
          langue: string;
          reponses: Json;
          session_id: string;
          termine: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          langue?: string;
          reponses?: Json;
          session_id: string;
          termine?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          langue?: string;
          reponses?: Json;
          session_id?: string;
          termine?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      commande_statut:
        "en_attente_paiement" | "paye" | "en_generation" | "livree" | "erreur" | "remboursee";
      offre_type:
        | "essentiel"
        | "signature"
        | "heritage"
        | "origine"
        | "ancestral"
        | "famille"
        | "junior";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      commande_statut: [
        "en_attente_paiement",
        "paye",
        "en_generation",
        "livree",
        "erreur",
        "remboursee",
      ],
      offre_type: ["essentiel", "signature", "heritage", "junior"],
    },
  },
} as const;
