import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { openai } from "./replit_integrations/image/client"; // Using OpenAI from existing integration

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth & Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);

  // === COUPONS ===
  app.get(api.coupons.list.path, async (req, res) => {
    const filters = {
      search: req.query.search as string,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      brandId: req.query.brandId ? Number(req.query.brandId) : undefined,
      sort: req.query.sort as string,
      includeInactive: req.query.includeInactive === 'true',
    };
    const coupons = await storage.getCoupons(filters);
    res.json(coupons);
  });

  app.patch(api.coupons.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.coupons.update.input.parse(req.body);
      const coupon = await storage.updateCoupon(id, input);
      if (!coupon) return res.status(404).json({ message: "Coupon not found" });
      res.json(coupon);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  app.delete(api.coupons.delete.path, async (req, res) => {
    await storage.deleteCoupon(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.coupons.click.path, async (req, res) => {
    const clickCount = await storage.recordClick(Number(req.params.id), (req as any).user?.claims?.sub);
    res.json({ clickCount });
  });

  app.post(api.coupons.convert.path, async (req, res) => {
    const conversionCount = await storage.recordConversion(Number(req.params.id));
    res.json({ conversionCount });
  });

  // === ADMIN ANALYTICS ===
  app.get(api.analytics.dashboard.path, async (req, res) => {
    const stats = await storage.getAdminAnalytics();
    res.json(stats);
  });

  // === BRANDS & CATEGORIES ===
  app.get(api.brands.list.path, async (req, res) => res.json(await storage.getBrands()));
  app.post(api.brands.create.path, async (req, res) => {
    const { name, slug } = api.brands.create.input.parse(req.body);
    const brand = await storage.getOrCreateBrand(name, slug);
    res.status(201).json(brand);
  });

  app.get(api.categories.list.path, async (req, res) => res.json(await storage.getCategories()));
  app.post(api.categories.create.path, async (req, res) => {
    const { name, slug, icon } = api.categories.create.input.parse(req.body);
    const category = await storage.getOrCreateCategory(name, slug, icon);
    res.status(201).json(category);
  });

  // === SEED DATA ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const categories = await storage.getCategories();
  if (categories.length === 0) {
    await storage.seedCategories([
      { name: "Flights", slug: "flights", icon: "Plane" },
      { name: "Trains", slug: "trains", icon: "Train" },
      { name: "Hotels", slug: "hotels", icon: "Hotel" },
      { name: "Shopping", slug: "shopping", icon: "ShoppingBag" },
      { name: "Food", slug: "food", icon: "Utensils" },
      { name: "Recharge", slug: "recharge", icon: "Smartphone" },
      { name: "Education", slug: "education", icon: "GraduationCap" },
      { name: "Kids", slug: "kids", icon: "Baby" },
      { name: "Sports", slug: "sports", icon: "Dumbbell" },
    ]);

    await storage.seedBrands([
      { name: "Amazon", slug: "amazon", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" },
      { name: "Flipkart", slug: "flipkart", logoUrl: "https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg" },
      { name: "MakeMyTrip", slug: "makemytrip", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/80/MakeMyTrip_Logo.png" },
      { name: "Swiggy", slug: "swiggy", logoUrl: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg" },
      { name: "Zomato", slug: "zomato", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg" },
    ]);
    
    // Seed some dummy coupons
    const cats = await storage.getCategories();
    const brands = await storage.getBrands();
    
    if (brands.length > 0 && cats.length > 0) {
      await storage.createCoupon({
        title: "50% OFF on Domestic Flights",
        code: "FLY50",
        description: "Get flat 50% off up to ₹2000 on domestic flights.",
        categoryId: cats.find(c => c.slug === "flights")?.id,
        brandId: brands.find(b => b.slug === "makemytrip")?.id,
        discountAmount: "50% OFF",
        affiliateLink: "https://makemytrip.com",
        successScore: 85,
        expiryDate: new Date(Date.now() + 86400000 * 7), // +7 days
      });
      
      await storage.createCoupon({
        title: "Extra 10% Cashback on Electronics",
        code: "TECH10",
        description: "Valid on credit card EMI transactions.",
        categoryId: cats.find(c => c.slug === "shopping")?.id,
        brandId: brands.find(b => b.slug === "amazon")?.id,
        discountAmount: "10% Cashback",
        affiliateLink: "https://amazon.in",
        successScore: 92,
        expiryDate: new Date(Date.now() + 86400000 * 3), // +3 days
      });
    }
  }
}
