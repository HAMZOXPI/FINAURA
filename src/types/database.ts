export type PropertyType =
  | "appartement"
  | "villa"
  | "maison"
  | "terrain"
  | "local_commercial"
  | "bureau"
  | "ferme"
  | "riad";
export type PropertyStatus = "for_sale" | "for_rent" | "sold" | "pending";
export type ListingStatus = "draft" | "published" | "archived";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: "user" | "agent" | "admin";
  bio?: string | null;
  verified_seller?: boolean;
  is_verified?: boolean;
  identity_verified?: boolean;
  phone_verified?: boolean;
  email_verified?: boolean;
  response_rate?: number;
  avg_response_time_hours?: number;
  listings_sold_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SellerReview {
  id: string;
  seller_id: string;
  reviewer_id: string;
  property_id: string | null;
  rating: number;
  communication_rating: number;
  accuracy_rating: number;
  responsiveness_rating: number;
  trust_rating: number;
  review_text: string;
  helpful_count: number;
  created_at: string;
  reviewer?: Pick<Profile, "id" | "full_name" | "avatar_url">;
}

export interface SellerReviewSummary {
  averageRating: number;
  totalReviews: number;
  communication: number;
  accuracy: number;
  responsiveness: number;
  trust: number;
}

export interface SellerStats {
  totalListings: number;
  listingsSold: number;
  responseRate: number;
  avgResponseTimeHours: number;
  averageRating: number;
  totalReviews: number;
}

export interface SellerVerification {
  verifiedSeller: boolean;
  identityVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export interface SellerPublicProfile {
  profile: Profile;
  stats: SellerStats;
  reviewSummary: SellerReviewSummary;
  reviews: SellerReview[];
  verification: SellerVerification;
  isFavorite: boolean;
  canReview: boolean;
  hasReviewed: boolean;
  helpfulReviewIds: string[];
}

export interface SellerProfileCache {
  id: string;
  average_rating: number;
  total_reviews: number;
  updated_at: string;
}

export type VerificationRequestStatus = "pending" | "approved" | "rejected";

export type AdminGiftType =
  | "unlimited_listings"
  | "extra_listing_credits"
  | "premium_subscription"
  | "premium_extension"
  | "featured_listing_credits"
  | "boost_credits"
  | "discount_coupon"
  | "custom_gift";

export type AdminGiftStatus = "active" | "expired" | "revoked";

export type AdminGiftPaymentSource =
  | "gift"
  | "cash"
  | "bank_transfer"
  | "admin_compensation"
  | "promotion"
  | "support"
  | "other";

export type AdminGiftAuditAction = "grant" | "edit" | "extend" | "revoke";

export interface AdminGift {
  id: string;
  user_id: string;
  gift_type: AdminGiftType;
  quantity: number | null;
  quantity_remaining: number | null;
  duration_days: number | null;
  expires_at: string | null;
  status: AdminGiftStatus;
  granted_by: string | null;
  notes: string | null;
  payment_source: AdminGiftPaymentSource;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdminGiftAuditLog {
  id: string;
  gift_id: string | null;
  action: AdminGiftAuditAction;
  admin_id: string | null;
  user_id: string | null;
  reason: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type NotificationPriority = "info" | "success" | "warning" | "error";

export type NotificationType =
  | "verification_approved"
  | "verification_rejected"
  | "property_approved"
  | "property_rejected"
  | "property_hidden"
  | "premium_activated"
  | "premium_expired"
  | "premium_expiring"
  | "gift_granted"
  | "gift_expired"
  | "payment_confirmed"
  | "subscription_changed"
  | "subscription_renewed"
  | "subscription_expired"
  | "new_message"
  | "report_listing"
  | "admin_broadcast"
  | "system";

export type NotificationAudience =
  | "all_users"
  | "premium_users"
  | "verified_users"
  | "city_users"
  | "single_user";

export type NotificationAuditAction = "create" | "read" | "read_all" | "delete" | "broadcast";

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  action_url: string | null;
  template_key: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  broadcast_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationBroadcast {
  id: string;
  title: string;
  body: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  audience: NotificationAudience;
  target_user_id: string | null;
  target_city: string | null;
  template_key: string | null;
  sent_by: string | null;
  metadata: Record<string, unknown>;
  recipient_count: number;
  created_at: string;
}

export interface NotificationAuditLog {
  id: string;
  action: NotificationAuditAction;
  notification_id: string | null;
  broadcast_id: string | null;
  actor_id: string | null;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  seller_id: string;
  status: VerificationRequestStatus;
  rejection_reason: string | null;
  id_front: string;
  id_back: string;
  selfie: string;
  proof_of_address: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: PropertyType;
  status: PropertyStatus;
  listing_status: ListingStatus;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  features: string[];
  images: string[];
  owner_id: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface ContactInquiry {
  id: string;
  property_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  message: string;
  created_at: string;
  property?: Property;
}

export type MessageAttachmentType = "image" | "file";

export interface Conversation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
  property?: Pick<Property, "id" | "title" | "price" | "status" | "images" | "city">;
  buyer?: Pick<Profile, "id" | "full_name" | "avatar_url">;
  seller?: Pick<Profile, "id" | "full_name" | "avatar_url">;
}

export interface ConversationRead {
  conversation_id: string;
  user_id: string;
  last_read_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: MessageAttachmentType | null;
  created_at: string;
  sender?: Pick<Profile, "id" | "full_name" | "avatar_url">;
}

export interface ConversationWithMeta extends Conversation {
  unread_count: number;
  other_participant: Pick<Profile, "id" | "full_name" | "avatar_url">;
  other_last_read_at: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  max_listings: number | null;
  max_favorites: number | null;
  features: string[];
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface PropertyFilters {
  search?: string;
  property_type?: PropertyType | "";
  status?: PropertyStatus | "";
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  min_area?: number;
  city?: string;
  state?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "area_desc";
}

export interface DashboardStats {
  listings_count: number;
  published_count: number;
  favorites_count: number;
  messages_count: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: "user" | "agent" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      properties: {
        Row: Property;
        Insert: {
          id?: string;
          title: string;
          description?: string;
          price: number;
          property_type: PropertyType;
          status?: PropertyStatus;
          listing_status?: ListingStatus;
          bedrooms?: number;
          bathrooms?: number;
          area_sqft?: number;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          features?: string[];
          images?: string[];
          owner_id: string;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Property>;
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: Favorite;
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: Partial<Favorite>;
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_inquiries: {
        Row: ContactInquiry;
        Insert: {
          id?: string;
          property_id: string;
          sender_id?: string | null;
          sender_name: string;
          sender_email: string;
          sender_phone?: string | null;
          message: string;
          created_at?: string;
        };
        Update: Partial<ContactInquiry>;
        Relationships: [
          {
            foreignKeyName: "contact_inquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: Conversation;
        Insert: {
          id?: string;
          property_id: string;
          buyer_id: string;
          seller_id: string;
          last_message_text?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Conversation>;
        Relationships: [];
      };
      messages: {
        Row: ChatMessage;
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          attachment_url?: string | null;
          attachment_name?: string | null;
          attachment_type?: MessageAttachmentType | null;
          created_at?: string;
        };
        Update: Partial<ChatMessage>;
        Relationships: [];
      };
      conversation_reads: {
        Row: ConversationRead;
        Insert: {
          conversation_id: string;
          user_id: string;
          last_read_at?: string;
        };
        Update: Partial<ConversationRead>;
        Relationships: [];
      };
      subscription_plans: {
        Row: SubscriptionPlan;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          price_monthly?: number;
          max_listings?: number | null;
          max_favorites?: number | null;
          features?: string[];
          stripe_price_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<SubscriptionPlan>;
        Relationships: [];
      };
      user_subscriptions: {
        Row: UserSubscription;
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status?: "active" | "canceled" | "past_due" | "trialing";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<UserSubscription>;
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_gifts: {
        Row: AdminGift;
        Insert: {
          id?: string;
          user_id: string;
          gift_type: AdminGiftType;
          quantity?: number | null;
          quantity_remaining?: number | null;
          duration_days?: number | null;
          expires_at?: string | null;
          status?: AdminGiftStatus;
          granted_by?: string | null;
          notes?: string | null;
          payment_source?: AdminGiftPaymentSource;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          gift_type?: AdminGiftType;
          quantity?: number | null;
          quantity_remaining?: number | null;
          duration_days?: number | null;
          expires_at?: string | null;
          status?: AdminGiftStatus;
          granted_by?: string | null;
          notes?: string | null;
          payment_source?: AdminGiftPaymentSource;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_gifts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_gifts_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_gift_audit_log: {
        Row: AdminGiftAuditLog;
        Insert: {
          id?: string;
          gift_id?: string | null;
          action: AdminGiftAuditAction;
          admin_id?: string | null;
          user_id?: string | null;
          reason?: string | null;
          ip_address?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<AdminGiftAuditLog>;
        Relationships: [
          {
            foreignKeyName: "admin_gift_audit_log_gift_id_fkey";
            columns: ["gift_id"];
            isOneToOne: false;
            referencedRelation: "admin_gifts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_gift_audit_log_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_gift_audit_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: Notification;
        Insert: {
          id?: string;
          user_id: string;
          notification_type: NotificationType;
          priority?: NotificationPriority;
          title: string;
          body: string;
          action_url?: string | null;
          template_key?: string | null;
          metadata?: Record<string, unknown>;
          is_read?: boolean;
          read_at?: string | null;
          broadcast_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Notification>;
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_broadcasts: {
        Row: NotificationBroadcast;
        Insert: {
          id?: string;
          title: string;
          body: string;
          notification_type?: NotificationType;
          priority?: NotificationPriority;
          audience: NotificationAudience;
          target_user_id?: string | null;
          template_key?: string | null;
          sent_by?: string | null;
          metadata?: Record<string, unknown>;
          recipient_count?: number;
          created_at?: string;
        };
        Update: Partial<NotificationBroadcast>;
        Relationships: [];
      };
      notification_audit_log: {
        Row: NotificationAuditLog;
        Insert: {
          id?: string;
          action: NotificationAuditAction;
          notification_id?: string | null;
          broadcast_id?: string | null;
          actor_id?: string | null;
          user_id?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<NotificationAuditLog>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_dashboard_stats: {
        Args: { p_user_id: string };
        Returns: DashboardStats;
      };
      create_user_notification: {
        Args: {
          p_user_id: string;
          p_notification_type: NotificationType;
          p_priority: NotificationPriority;
          p_title: string;
          p_body: string;
          p_action_url?: string | null;
          p_template_key?: string | null;
          p_metadata?: Record<string, unknown>;
          p_broadcast_id?: string | null;
        };
        Returns: string;
      };
      cleanup_old_notifications: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      admin_gift_type: AdminGiftType;
      admin_gift_status: AdminGiftStatus;
      admin_gift_payment_source: AdminGiftPaymentSource;
      admin_gift_audit_action: AdminGiftAuditAction;
      notification_priority: NotificationPriority;
      notification_type: NotificationType;
      notification_audience: NotificationAudience;
      notification_audit_action: NotificationAuditAction;
    };
    CompositeTypes: Record<string, never>;
  };
}
