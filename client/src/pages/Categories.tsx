import { useCategories } from "@/hooks/use-coupons";
import { Navigation } from "@/components/Navigation";
import { CategoryPill } from "@/components/CategoryPill";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Group categories by parent
  const topLevel = categories?.filter(c => !c.parentId) || [];
  const getChildren = (parentId: number) => categories?.filter(c => c.parentId === parentId) || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      <Navigation />

      <div className="container mx-auto px-4 pt-8">
        <h1 className="text-3xl font-display font-bold mb-8">Browse Categories</h1>

        <div className="space-y-12">
          {topLevel.map((parent) => {
            const children = getChildren(parent.id);

            return (
              <div key={parent.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-slate-800">{parent.name}</h2>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* Show Parent as "All [Parent]" option if it has children, or just itself if no children */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CategoryPill
                      name={children.length > 0 ? `All ${parent.name}` : parent.name}
                      iconName={parent.icon}
                      className="w-full h-24 text-sm gap-2 shadow-sm hover:shadow-md bg-Primary/5 border-primary/20"
                      onClick={() => window.location.href = `/?categoryId=${parent.id}`}
                    />
                  </motion.div>

                  {children.map((child, index) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CategoryPill
                        name={child.name}
                        iconName={child.icon}
                        className="w-full h-24 text-sm gap-2 shadow-sm hover:shadow-md"
                        onClick={() => window.location.href = `/?categoryId=${child.id}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
