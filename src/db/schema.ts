import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums for consistent type safety
export const userRoleEnum = pgEnum("role", [
  "guest",
  "registered",
  "member",
  "verified_member",
  "seller",
  "organization_admin",
  "organization_staff",
  "moderator",
  "content_editor",
  "super_admin",
]);

export const membershipPlanEnum = pgEnum("plan", ["free", "member"]);
export const verificationLevelEnum = pgEnum("verification_level", [
  "official_verified",
  "institution_verified",
  "duta_verified",
  "community_verified",
  "user_generated",
]);
export const contentTypeEnum = pgEnum("content_type", [
  "article",
  "announcement",
  "guide",
  "event",
  "official_information",
  "community_content",
]);
export const sourceStatusEnum = pgEnum("source_status", ["active", "inactive"]);
export const jobTypeEnum = pgEnum("job_type", [
  "full-time",
  "part-time",
  "freelance",
  "internship",
  "professional",
  "business_opportunity",
]);
export const sellerStatusEnum = pgEnum("seller_status", [
  "verified_seller",
  "member_seller",
  "community_seller",
  "new_seller",
]);
export const organizationTypeEnum = pgEnum("organization_type", [
  "resmi",
  "informal",
  "lokal",
  "nasional",
  "daerah",
  "profesi",
  "sosial",
  "perkumpulan",
]);
export const eventCategoryEnum = pgEnum("event_category", [
  "social_gathering",
  "culinary_pasaran",
  "webinar_skill",
  "sports_fun",
  "religious_holiday",
  "consular_outreach",
]);
export const jobCategoryEnum = pgEnum("job_category", [
  "full-time",
  "part-time",
  "freelance",
  "internship",
  "professional",
  "business_opportunity",
]);
export const marketplaceCategoryEnum = pgEnum("marketplace_category", [
  "makanan",
  "produk_indonesia",
  "fashion",
  "jasa",
  "travel",
  "transport",
  "accommodation",
  "professional_services",
  "digital_services",
]);

// ==================== USERS ====================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("registered"),
  city: text("city").notNull().default("Kuala Lumpur"),
  country: text("country").notNull().default("Malaysia"),
  profession: text("profession"),
  bio: text("bio"),
  avatar: text("avatar"),
  phone: text("phone"),
  verified: boolean("verified").notNull().default(false),
  membershipStatus: text("membership_status").notNull().default("free"),
  membershipStartDate: timestamp("membership_start_date"),
  membershipRenewalDate: timestamp("membership_renewal_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== MEMBERSHIPS ====================
export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date").defaultNow().notNull(),
  renewalDate: timestamp("renewal_date").notNull(),
  cancellationDate: timestamp("cancellation_date"),
  failedPaymentCount: integer("failed_payment_count").notNull().default(0),
  gracePeriodEnd: timestamp("grace_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== OFFICIAL SOURCES ====================
export const officialSources = pgTable("official_sources", {
  id: serial("id").primaryKey(),
  institution: text("institution").notNull(),
  url: text("url").notNull,
  category: text("category").notNull, // 'KBRI', 'KJRI', 'KRI', 'Imigrasi', etc.
  lastChecked: timestamp("last_check").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
  verificationStatus: text("verification_status").notNull().default("verified"),
  checksum: text("checksum"),
  notes: text("notes"),
});

// ==================== ORGANIZATIONS ====================
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("informal"),
  description: text("description"),
  location: text("location"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  officialSourceId: integer("official_source_id").references(() => officialSources.id),
  website: text("website"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  foundedDate: timestamp("founded_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== ORGANIZATION MEMBERS ====================
export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "set null" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("active"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
  invitationToken: text("invitation_token"),
});

// ==================== JOBS ====================
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("job"), // 'job', 'housing', 'service'
  category: text("category").notNull().default("full-time"),
  location: text("location").notNull(),
  salaryOrPrice: text("salary_or_price"),
  employmentType: text("employment_type").notNull().default("full-time"),
  requirements: text("requirements"),
  languageRequirements: text("language_requirements"),
  contactInfo: text("contact_info"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  employerName: text("employer_name"),
  postedByUserId: integer("posted_by_user_id").references(() => users.id, { onDelete: "set null" }),
  datePosted: timestamp("date_posted").defaultNow().notNull(),
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== MARKETPLACE SELLERS ====================
export const marketplaceSellers = pgTable("marketplace_sellers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  verificationStatus: text("verification_status").notNull().default("new_seller"),
  storeName: text("store_name"),
  description: text("description"),
  website: text("website"),
  rating: integer("rating").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== PRODUCTS ====================
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => marketplaceSellers.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  category: text("category").notNull().default("makanan"),
  images: text("images").array(), // JSON array of image URLs
  status: text("status").notNull().default("active"),
  stock: integer("stock").notNull().default(0),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== ARTICLES / GUIDES ====================
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(), // 'malaysia', 'transport', 'accommodation', etc.
  location: text("location"),
  source: text("source"), // official source name or URL
  sourceStatus: text("source_status"), // 'official', 'community', 'user_generated'
  lastChecked: timestamp("last_checked"),
  verificationStatus: text("verification_status").notNull().default("user_generated"),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  publishDate: timestamp("publish_date"),
  updatedDate: timestamp("updated_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== AI CONVERSATIONS ====================
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  intent: text("intent"), // 'official_service', 'job_search', 'organization_document', etc.
  message: text("message").notNull(),
  answer: text("answer"),
  sources: text("sources").array(), // JSON array of source references
  confidence: text("confidence").notNull().default("low"), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== PHOTO PROJECTS (AI Photo Background) ====================
export const photoProjects = pgTable("photo_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  originalImage: text("original_image").notNull(),
  background: text("background").notNull(), // selected location/metadata
  resultImage: text("result_image").notNull(),
  metadata: text("metadata"), // JSON with location info, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== EVENTS (enhanced) ====================
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("social_gathering"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  capacity: integer("capacity").notNull().default(100),
  attendeesCount: integer("attendees_count").notNull().default(0),
  imageUrl: text("image_url"),
  isFree: boolean("is_free").notNull().default(true),
  registrationLink: text("registration_link"),
  verificationStatus: text("verification_status").notNull().default("community_verified"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== EVENT RSVPS ====================
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").notNull().default("going"), // 'going', 'maybe'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== SUGGESTIONS (community usulan - keep existing) ====================
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'Legal & Consular', 'Jobs & Work', etc.
  targetCity: text("target_city").notNull().default("All Cities"),
  status: text("status").notNull().default("open"), // 'open', 'under_review', 'planned', 'implemented', 'closed'
  officialResponse: text("official_response"),
  upvotesCount: integer("upvotes_count").notNull().default(0),
  viewsCount: integer("views_count").notNull().default(0),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const suggestionUpvotes = pgTable("suggestion_upvotes", {
  id: serial("id").primaryKey(),
  suggestionId: integer("suggestion_id").references(() => suggestions.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suggestionComments = pgTable("suggestion_comments", {
  id: serial("id").primaryKey(),
  suggestionId: integer("suggestion_id").references(() => suggestions.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== EMERGENCY ALERTS ====================
export const emergencyAlerts = pgTable("emergency_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'legal', 'health', 'documents', 'disaster', 'other'
  city: text("city").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  urgency: text("urgency").notNull().default("urgent"), // 'urgent', 'high', 'normal'
  status: text("status").notNull().default("seeking_help"), // 'seeking_help', 'assisted', 'resolved'
  contactNumber: text("contact_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== CONSULAR GUIDES (enhanced) ====================
export const consularGuides = pgTable("consular_guides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'Paspor & Dokumen', 'Izin Tinggal & Kerja', etc.
  content: text("content").notNull(),
  essentialLinks: text("essential_links").array(), // JSON array of link objects
  helplinePhone: text("helpline_phone"),
  officialSourceId: integer("official_source_id").references(() => officialSources.id),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  verificationStatus: text("verification_status").notNull().default("official_verified"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types for inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;

export type OfficialSource = typeof officialSources.$inferSelect;
export type NewOfficialSource = typeof officialSources.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

export type MarketplaceSeller = typeof marketplaceSellers.$inferSelect;
export type NewMarketplaceSeller = typeof marketplaceSellers.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

export type AiConversation = typeof aiConversations.$inferSelect;
export type NewAiConversation = typeof aiConversations.$inferInsert;

export type PhotoProject = typeof photoProjects.$inferSelect;
export type NewPhotoProject = typeof photoProjects.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type EventRsvp = typeof eventRsvps.$inferSelect;

export type Suggestion = typeof suggestions.$inferSelect;
export type NewSuggestion = typeof suggestions.$inferInsert;

export type SuggestionUpvote = typeof suggestionUpvotes.$inferSelect;
export type SuggestionComment = typeof suggestionComments.$inferSelect;

export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type ConsularGuide = typeof consularGuides.$inferSelect;