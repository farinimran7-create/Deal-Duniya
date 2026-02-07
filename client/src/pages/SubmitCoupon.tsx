import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCouponSchema } from "@shared/routes";
import { useCreateCoupon, useBrands, useCategories } from "@/hooks/use-coupons";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, PlusCircle, Tag, Link as LinkIcon, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";

// Enhance schema with coerced numbers
const formSchema = insertCouponSchema.extend({
  categoryId: z.coerce.number(),
  brandId: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitCoupon() {
  const { user } = useAuth();
  const createCoupon = useCreateCoupon();
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id || "",
    }
  });

  const onSubmit = (data: FormValues) => {
    if (!user) {
      toast({ title: "Please login", description: "You need to be logged in to submit coupons", variant: "destructive" });
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }

    createCoupon.mutate({ ...data, userId: user.id }, {
      onSuccess: () => setLocation("/coupons"),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-orange-400 p-6 text-white">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <PlusCircle className="w-6 h-6" />
              Submit a Coupon
            </h1>
            <p className="text-white/80 mt-2">Found a working code? Share it with the community!</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Brand</label>
                <select 
                  {...form.register("brandId")}
                  className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">Select Brand</option>
                  {brands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {form.formState.errors.brandId && <p className="text-red-500 text-xs">{form.formState.errors.brandId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select 
                  {...form.register("categoryId")}
                  className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {form.formState.errors.categoryId && <p className="text-red-500 text-xs">{form.formState.errors.categoryId.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Coupon Code</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  {...form.register("code")}
                  placeholder="e.g. SAVE20"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-primary focus:outline-none transition-colors font-mono font-bold text-lg uppercase"
                />
              </div>
              {form.formState.errors.code && <p className="text-red-500 text-xs">{form.formState.errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Discount Description</label>
              <input 
                {...form.register("discountAmount")}
                placeholder="e.g. 20% OFF or ₹500 Cashback"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-primary focus:outline-none transition-colors font-bold text-green-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <input 
                {...form.register("title")}
                placeholder="e.g. Get 20% off on first order"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea 
                {...form.register("description")}
                rows={3}
                placeholder="Any specific terms? Minimum order value?"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Affiliate/Offer Link</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  {...form.register("affiliateLink")}
                  placeholder="https://..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Expiry Date (Optional)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="date"
                  {...form.register("expiryDate", { valueAsDate: true })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createCoupon.isPending}
              className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-2"
            >
              {createCoupon.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Coupon"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
