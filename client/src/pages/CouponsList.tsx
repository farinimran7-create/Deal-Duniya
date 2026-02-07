import { useCoupons } from "@/hooks/use-coupons";
import { Navigation } from "@/components/Navigation";
import { CouponCard } from "@/components/CouponCard";
import { Loader2 } from "lucide-react";

export default function CouponsList() {
  const { data: coupons, isLoading } = useCoupons();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <h1 className="text-3xl font-display font-bold mb-8">All Coupons</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons?.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
