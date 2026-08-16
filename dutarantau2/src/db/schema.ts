import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("member"), // 'member', 'embassy_staff', 'community_lead', 'admin'
  city: text("city").notNull().default("Kuala Lumpur"),
  country: text("country").notNull().default("Malaysia"),
  profession: text("profession").notNull().default("Diaspora Member"),
  bio: text("bio"),
  avatar: text("avatar"),
  phone: text("phone"),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'Legal & Consular', 'Jobs & Work', 'Housing & Living', 'Culinary & Culture', 'Events & Social', 'App Feature', 'Emergency Aid'
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

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'Social Gathering', 'Culinary & Pasaran', 'Webinar & Skill', 'Sports & Fun', 'Religious & Holiday', 'Consular Outreach'
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  capacity: integer("capacity").notNull().default(100),
  attendeesCount: integer("attendees_count").notNull().default(0),
  imageUrl: text("image_url"),
  organizerId: integer("organizer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").notNull().default("going"), // 'going', 'maybe'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobsMarketplace = pgTable("jobs_marketplace", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'job', 'housing', 'marketplace', 'service'
  category: text("category").notNull(),
  priceOrSalary: text("price_or_salary").notNull(),
  description: text("description").notNull(),
  city: text("city").notNull(),
  contactInfo: text("contact_info").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'closed'
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consularGuides = pgTable("consular_guides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'Paspor & Dokumen', 'Izin Tinggal & Kerja', 'Bantuan Hukum', 'Darurat & Hotline', 'Pendidikan & Beasiswa'
  content: text("content").notNull(),
  essentialLinks: text("essential_links"), // JSON string array of links
  helplinePhone: text("helpline_phone"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emergencyAlerts = pgTable("emergency_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'Bantuan Hukum', 'Kesehatan / Darurat', 'Dokumen Hilang', 'Bencana / Akomodasi', 'Lainnya'
  city: text("city").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  urgency: text("urgency").notNull().default("urgent"), // 'urgent', 'high', 'normal'
  status: text("status").notNull().default("seeking_help"), // 'seeking_help', 'assisted', 'resolved'
  contactNumber: text("contact_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Suggestion = typeof suggestions.$inferSelect;
export type NewSuggestion = typeof suggestions.$inferInsert;

export type EventItem = typeof events.$inferSelect;
export type JobItem = typeof jobsMarketplace.$inferSelect;
export type ConsularGuide = typeof consularGuides.$inferSelect;
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
