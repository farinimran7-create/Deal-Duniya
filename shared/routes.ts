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
        includeInactive: z.coerce.boolean().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<any>()),
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
    update: {
      method: 'PATCH' as const,
      path: '/api/coupons/:id' as const,
      input: insertCouponSchema.partial(),
      responses: {
        200: z.custom<typeof coupons.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/coupons/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
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
    },
    click: {
      method: 'POST' as const,
      path: '/api/coupons/:id/click' as const,
      responses: {
        200: z.object({ clickCount: z.number() }),
        404: errorSchemas.notFound,
      },
    },
    convert: {
      method: 'POST' as const,
      path: '/api/coupons/:id/convert' as const,
      responses: {
        200: z.object({ conversionCount: z.number() }),
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
    create: {
      method: 'POST' as const,
      path: '/api/brands' as const,
      input: z.object({ name: z.string(), slug: z.string(), logoUrl: z.string().optional() }),
      responses: {
        201: z.custom<typeof brands.$inferSelect>(),
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
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: z.object({ name: z.string(), slug: z.string(), icon: z.string() }),
      responses: {
        201: z.custom<typeof categories.$inferSelect>(),
      },
    },
  },
  analytics: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/admin/analytics' as const,
      responses: {
        200: z.object({
          totalClicks: z.number(),
          totalConversions: z.number(),
          topCoupons: z.array(z.custom<any>()),
        }),
      },
    },
  }
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
