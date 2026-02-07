import { 
  coupons, brands, categories, feedback,
  type Coupon, type InsertCoupon, type Brand, type Category, type Feedback, type CreateFeedbackRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Coupons
  getCoupons(filters?: { categoryId?: number; brandId?: number; search?: string; sort?: string }): Promise<(Coupon & { brand: Brand | null; category: Category | null })[]>;
  getCoupon(id: number): Promise<(Coupon & { brand: Brand | null; category: Category | null }) | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, updates: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  
  // Feedback
  createFeedback(feedback: CreateFeedbackRequest): Promise<Feedback>;
  getCouponFeedbackStats(couponId: number): Promise<{ positive: number; total: number }>;

  // Brands & Categories
  getBrands(): Promise<Brand[]>;
  getCategories(): Promise<Category[]>;
  
  // Seeding
  seedCategories(cats: { name: string; slug: string; icon: string }[]): Promise<void>;
  seedBrands(brandsList: { name: string; slug: string; logoUrl: string }[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCoupons(filters?: { categoryId?: number; brandId?: number; search?: string; sort?: string }) {
    let query = db.select({
      coupon: coupons,
      brand: brands,
      category: categories,
    })
    .from(coupons)
    .leftJoin(brands, eq(coupons.brandId, brands.id))
    .leftJoin(categories, eq(coupons.categoryId, categories.id));

    const conditions = [eq(coupons.isActive, true)];

    if (filters?.categoryId) {
      conditions.push(eq(coupons.categoryId, filters.categoryId));
    }
    if (filters?.brandId) {
      conditions.push(eq(coupons.brandId, filters.brandId));
    }
    if (filters?.search) {
      conditions.push(sql`(${coupons.title} ILIKE ${`%${filters.search}%`} OR ${coupons.code} ILIKE ${`%${filters.search}%`})`);
    }

    // Default sort by success score then date
    let orderBy = [desc(coupons.successScore), desc(coupons.createdAt)];
    if (filters?.sort === 'newest') {
      orderBy = [desc(coupons.createdAt)];
    } else if (filters?.sort === 'expiring') {
      orderBy = [desc(coupons.expiryDate)];
    }

    const results = await query.where(and(...conditions)).orderBy(...orderBy);
    
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

  async getBrands() {
    return await db.select().from(brands);
  }

  async getCategories() {
    return await db.select().from(categories);
  }

  async seedCategories(cats: { name: string; slug: string; icon: string }[]) {
    await db.insert(categories).values(cats).onConflictDoNothing();
  }

  async seedBrands(brandsList: { name: string; slug: string; logoUrl: string }[]) {
    await db.insert(brands).values(brandsList).onConflictDoNothing();
  }
}

export const storage = new DatabaseStorage();
