import {
  coupons, brands, categories, feedback, clicks, users,
  type Coupon, type InsertCoupon, type Brand, type Category, type Feedback, type CreateFeedbackRequest, type User
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Coupons
  getCoupons(filters?: { categoryId?: number; brandId?: number; search?: string; sort?: string; includeInactive?: boolean }): Promise<(Coupon & { brand: Brand | null; category: Category | null })[]>;
  getCoupon(id: number): Promise<(Coupon & { brand: Brand | null; category: Category | null }) | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, updates: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<void>;

  // Feedback & Analytics
  createFeedback(feedback: CreateFeedbackRequest): Promise<Feedback>;
  getCouponFeedbackStats(couponId: number): Promise<{ positive: number; total: number }>;
  recordClick(couponId: number, userId?: string): Promise<number>;
  recordConversion(couponId: number): Promise<number>;
  getAdminAnalytics(): Promise<{ totalClicks: number; totalConversions: number; topCoupons: any[] }>;

  // Brands & Categories
  getBrands(): Promise<Brand[]>;
  getOrCreateBrand(name: string, slug?: string): Promise<Brand>;
  getCategories(): Promise<Category[]>;
  getOrCreateCategory(name: string, slug?: string, icon?: string): Promise<Category>;

  // Seeding
  // Seeding & Users
  seedCategories(cats: { name: string; slug: string; icon: string; parentId?: number }[]): Promise<void>;
  seedBrands(brandsList: { name: string; slug: string; logoUrl: string }[]): Promise<void>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: any) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCoupons(filters?: { categoryId?: number; brandId?: number; search?: string; sort?: string; includeInactive?: boolean }) {
    let query = db.select({
      coupon: coupons,
      brand: brands,
      category: categories,
    })
      .from(coupons)
      .leftJoin(brands, eq(coupons.brandId, brands.id))
      .leftJoin(categories, eq(coupons.categoryId, categories.id));

    const conditions = [];
    if (!filters?.includeInactive) {
      conditions.push(eq(coupons.isActive, true));
    }

    if (filters?.categoryId) {
      conditions.push(eq(coupons.categoryId, filters.categoryId));
    }
    if (filters?.brandId) {
      conditions.push(eq(coupons.brandId, filters.brandId));
    }
    if (filters?.search) {
      conditions.push(sql`(${coupons.title} ILIKE ${`%${filters.search}%`} OR ${coupons.code} ILIKE ${`%${filters.search}%`})`);
    }

    let orderBy = [desc(coupons.successScore), desc(coupons.createdAt)];
    if (filters?.sort === 'newest') {
      orderBy = [desc(coupons.createdAt)];
    } else if (filters?.sort === 'expiring') {
      orderBy = [desc(coupons.expiryDate)];
    }

    const results = await query.where(conditions.length ? and(...conditions) : undefined).orderBy(...orderBy);

    return results.map(r => ({
      ...r.coupon,
      brand: r.brand,
      category: r.category
    }));
  }

  async getCoupon(id: number) {
    const [result] = await db.select({
      coupon: coupons,
      brand: brands,
      category: categories,
    })
      .from(coupons)
      .leftJoin(brands, eq(coupons.brandId, brands.id))
      .leftJoin(categories, eq(coupons.categoryId, categories.id))
      .where(eq(coupons.id, id));

    if (!result) return undefined;
    return {
      ...result.coupon,
      brand: result.brand,
      category: result.category
    };
  }

  async createCoupon(insertCoupon: InsertCoupon) {
    const [coupon] = await db.insert(coupons).values(insertCoupon).returning();
    return coupon;
  }

  async updateCoupon(id: number, updates: Partial<InsertCoupon>) {
    const [updated] = await db.update(coupons)
      .set(updates)
      .where(eq(coupons.id, id))
      .returning();
    return updated;
  }

  async deleteCoupon(id: number) {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async createFeedback(insertFeedback: CreateFeedbackRequest) {
    const [fb] = await db.insert(feedback).values(insertFeedback).returning();
    return fb;
  }

  async getCouponFeedbackStats(couponId: number) {
    const result = await db.select({
      total: sql<number>`count(*)`,
      positive: sql<number>`sum(case when ${feedback.worked} then 1 else 0 end)`
    })
      .from(feedback)
      .where(eq(feedback.couponId, couponId));

    return {
      total: Number(result[0]?.total || 0),
      positive: Number(result[0]?.positive || 0)
    };
  }

  async recordClick(couponId: number, userId?: string) {
    await db.insert(clicks).values({ couponId, userId });
    const [updated] = await db.update(coupons)
      .set({ clickCount: sql`${coupons.clickCount} + 1` })
      .where(eq(coupons.id, couponId))
      .returning({ clickCount: coupons.clickCount });
    return updated.clickCount || 0;
  }

  async recordConversion(couponId: number) {
    const [updated] = await db.update(coupons)
      .set({ conversionCount: sql`${coupons.conversionCount} + 1` })
      .where(eq(coupons.id, couponId))
      .returning({ conversionCount: coupons.conversionCount });
    return updated.conversionCount || 0;
  }

  async getAdminAnalytics() {
    const [stats] = await db.select({
      totalClicks: sql<number>`sum(${coupons.clickCount})`,
      totalConversions: sql<number>`sum(${coupons.conversionCount})`,
      totalCoupons: sql<number>`count(*)`,
      pendingCoupons: sql<number>`sum(case when ${coupons.isActive} = false then 1 else 0 end)`
    }).from(coupons);

    const topCoupons = await this.getCoupons({ sort: 'popular', includeInactive: true });

    return {
      totalClicks: Number(stats?.totalClicks || 0),
      totalConversions: Number(stats?.totalConversions || 0),
      totalCoupons: Number(stats?.totalCoupons || 0),
      pendingCoupons: Number(stats?.pendingCoupons || 0),
      topCoupons: topCoupons.slice(0, 5)
    };
  }

  async getBrands() {
    return await db.select().from(brands);
  }

  async getOrCreateBrand(name: string, slug?: string) {
    const safeSlug = slug || name.toLowerCase().replace(/ /g, '-');
    const [existing] = await db.select().from(brands).where(eq(brands.slug, safeSlug));
    if (existing) return existing;
    const [brand] = await db.insert(brands).values({ name, slug: safeSlug }).returning();
    return brand;
  }

  async getCategories() {
    return await db.select().from(categories);
  }

  async getOrCreateCategory(name: string, slug?: string, icon?: string, parentId?: number) {
    const safeSlug = slug || name.toLowerCase().replace(/ /g, '-');
    const [existing] = await db.select().from(categories).where(eq(categories.slug, safeSlug));
    if (existing) return existing;
    const [category] = await db.insert(categories).values({ name, slug: safeSlug, icon: icon || 'Tag', parentId }).returning();
    return category;
  }

  async seedCategories(cats: { name: string; slug: string; icon: string; parentId?: number }[]) {
    await db.insert(categories).values(cats).onConflictDoNothing();
  }

  async seedBrands(brandsList: { name: string; slug: string; logoUrl: string }[]) {
    await db.insert(brands).values(brandsList).onConflictDoNothing();
  }
}

export const storage = new DatabaseStorage();
