import { z } from 'zod';
import { insertCouponSchema, insertFeedbackSchema, coupons, brands, categories } from './schema';

export * from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  coupons: {
    list: {
      method: 'GET' as const,
      path: '/api/coupons' as const,
      input: z.object({
        search: z.string().optional(),
        categoryId: z.coerce.number().optional(),
        brandId: z.coerce.number().optional(),
        sort: z.enum(['newest', 'popular', 'expiring']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<any>()), // Coupon & { brand: Brand, category: Category }
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/coupons/:id' as const,
      responses: {
        200: z.custom<any>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/coupons' as const,
      input: insertCouponSchema,
      responses: {
        201: z.custom<typeof coupons.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    validate: {
      method: 'POST' as const,
      path: '/api/coupons/:id/validate' as const,
      responses: {
        200: z.object({
          successScore: z.number(),
          confidence: z.enum(['high', 'medium', 'low']),
          analysis: z.string(),
        }),
        404: errorSchemas.notFound,
      },
    },
    vote: {
      method: 'POST' as const,
      path: '/api/coupons/:id/vote' as const,
      input: z.object({ worked: z.boolean() }),
      responses: {
        200: z.object({ successScore: z.number() }),
        404: errorSchemas.notFound,
      },
    }
  },
  brands: {
    list: {
      method: 'GET' as const,
      path: '/api/brands' as const,
      responses: {
        200: z.array(z.custom<typeof brands.$inferSelect>()),
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
