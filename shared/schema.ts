export * from "./models/auth";
export * from "./models/chat";

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(), // Lucide icon name
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  affiliateBaseUrl: text("affiliate_base_url"),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  discountAmount: text("discount_amount").notNull(), // e.g. "20% OFF", "₹500 Cashback"
  expiryDate: timestamp("expiry_date"),
  successScore: integer("success_score").default(0), // 0-100
  lastVerified: timestamp("last_verified").defaultNow(),
  affiliateLink: text("affiliate_link").notNull(),
  isActive: boolean("is_active").default(true),
  userId: text("user_id").references(() => users.id), // Submitted by
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").references(() => coupons.id),
  userId: text("user_id").references(() => users.id),
  worked: boolean("worked").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  category: one(categories, {
    fields: [coupons.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [coupons.brandId],
    references: [brands.id],
  }),
  feedback: many(feedback),
  user: one(users, {
    fields: [coupons.userId],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  coupon: one(coupons, {
    fields: [feedback.couponId],
    references: [coupons.id],
  }),
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertCouponSchema = createInsertSchema(coupons).omit({ 
  id: true, 
  createdAt: true, 
  lastVerified: true, 
  successScore: true 
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({ 
  id: true, 
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Brand = typeof brands.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;

export type CreateCouponRequest = InsertCoupon;
export type UpdateCouponRequest = Partial<InsertCoupon>;
export type CreateFeedbackRequest = z.infer<typeof insertFeedbackSchema>;

export type CouponResponse = Coupon & {
  brand?: Brand;
  category?: Category;
};

export type ValidateCouponResponse = {
  successScore: number;
  confidence: "high" | "medium" | "low";
  analysis: string;
};
