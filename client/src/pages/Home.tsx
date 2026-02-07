import { useState } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, Sparkles, Filter } from "lucide-react";
import { useCoupons, useCategories } from "@/hooks/use-coupons";
import { CouponCard } from "@/components/CouponCard";
import { CategoryPill } from "@/components/CategoryPill";
import { Navigation } from "@/components/Navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: coupons, isLoading: couponsLoading } = useCoupons({
    categoryId: activeCategory,
    search: searchQuery,
  });
  
  const { data: categories } = useCategories();

  // Stock images for hero background (Unsplash)
  // office desk coupons saving money
  const heroImage = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=2070";

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 opacity-10">
          <img src={heroImage} alt="Savings" className="w-full h-full object-cover" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-8 md:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-sm mb-4 border border-accent/20">
              <Sparkles className="w-4 h-4 inline mr-2" />
              AI-Powered Savings Engine
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6 leading-tight">
              Stop searching.<br />
              Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">saving.</span>
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              DealDuniya validates thousands of coupons in real-time so you never face a "code invalid" error again.
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mb-10">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search brands like 'Amazon', 'Zomato', 'Uber'..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-white shadow-xl shadow-slate-200/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {/* Categories Scroller */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Browse Categories
            </h2>
            <button 
              onClick={() => setActiveCategory(undefined)}
              className="text-sm font-medium text-primary hover:underline"
            >
              See All
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
            <CategoryPill 
              name="All" 
              iconName="LayoutGrid" 
              isActive={activeCategory === undefined} 
              onClick={() => setActiveCategory(undefined)}
            />
            {categories?.map((cat) => (
              <CategoryPill
                key={cat.id}
                name={cat.name}
                iconName={cat.icon}
                isActive={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="mb-6 flex items-center gap-2 px-1">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-display font-bold">Trending Coupons</h2>
        </div>

        {couponsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border shadow-sm h-64">
                <div className="flex gap-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full mb-4 rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons?.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
            
            {coupons?.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No coupons found</h3>
                <p className="text-slate-500">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
