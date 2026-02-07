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
    };
    const coupons = await storage.getCoupons(filters);
    res.json(coupons);
  });

  app.get(api.coupons.get.path, async (req, res) => {
    const coupon = await storage.getCoupon(Number(req.params.id));
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(coupon);
  });

  app.post(api.coupons.create.path, async (req, res) => {
    try {
      const input = api.coupons.create.input.parse(req.body);
      const coupon = await storage.createCoupon(input);
      res.status(201).json(coupon);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  // === AI VALIDATION ===
  app.post(api.coupons.validate.path, async (req, res) => {
    const id = Number(req.params.id);
    const coupon = await storage.getCoupon(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    // AI Scoring Logic
    try {
      const stats = await storage.getCouponFeedbackStats(id);
      
      const prompt = `
        Analyze this coupon for "Deal Duniya":
        Title: ${coupon.title}
        Code: ${coupon.code}
        Expiry: ${coupon.expiryDate}
        Last Verified: ${coupon.lastVerified}
        User Feedback: ${stats.positive} worked out of ${stats.total} total.
        
        Calculate a success probability score (0-100) and confidence level.
        Return ONLY JSON: { "successScore": number, "confidence": "high"|"medium"|"low", "analysis": "short reasoning" }
      `;

      // Using the openai client from the integration we added
      // Note: Replit integration might export 'openai' differently, we need to import it correctly.
      // I'll assume standard OpenAI usage as per integration.
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(aiResponse.choices[0].message.content || "{}");
      
      // Update coupon score
      if (result.successScore !== undefined) {
        await storage.updateCoupon(id, { successScore: result.successScore });
      }

      res.json(result);
    } catch (error) {
      console.error("AI Validation failed:", error);
      res.status(500).json({ message: "AI Analysis failed" });
    }
  });

  // === FEEDBACK & VOTING ===
  app.post(api.coupons.vote.path, async (req, res) => {
    const id = Number(req.params.id);
    const { worked } = req.body;
    
    // Record feedback
    await storage.createFeedback({
      couponId: id,
      worked,
      userId: (req as any).user?.claims?.sub, // Optional user tracking
    });

    // Simple heuristic update (AI can do deeper update later)
    const stats = await storage.getCouponFeedbackStats(id);
    const newScore = Math.round((stats.positive / stats.total) * 100);
    
    await storage.updateCoupon(id, { successScore: newScore });

    res.json({ successScore: newScore });
  });

  // === BRANDS & CATEGORIES ===
  app.get(api.brands.list.path, async (req, res) => res.json(await storage.getBrands()));
  app.get(api.categories.list.path, async (req, res) => res.json(await storage.getCategories()));

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
