import { useCategories } from "@/hooks/use-coupons";
import { Navigation } from "@/components/Navigation";
import { CategoryPill } from "@/components/CategoryPill";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const [, setLocation] = useLocation();

  const handleCategoryClick = (id: number) => {
    // In a real app this would navigate to filtered list
    // For now we just go back home but ideally url params
    window.location.href = `/?categoryId=${id}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <h1 className="text-3xl font-display font-bold mb-8">All Categories</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories?.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <CategoryPill
                  name={cat.name}
                  iconName={cat.icon}
                  className="w-full h-32 text-lg gap-4 shadow-sm hover:shadow-md"
                  onClick={() => handleCategoryClick(cat.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
