import { useRoute } from "wouter";
import { useBrands, useCoupons } from "@/hooks/use-coupons";
import { Navigation } from "@/components/Navigation";
import { CouponCard } from "@/components/CouponCard";
import { Loader2 } from "lucide-react";

export default function BrandPage() {
    const [, params] = useRoute("/brand/:slug");
    const slug = params?.slug;

    const { data: brands, isLoading: brandsLoading } = useBrands();
    const brand = brands?.find((b: any) => b.slug === slug);

    const { data: coupons, isLoading: couponsLoading } = useCoupons({
        brandId: brand?.id,
    });

    const isLoading = brandsLoading || couponsLoading;

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

    if (!brand) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navigation />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Brand not found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
            <Navigation />

            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {brand.logoUrl && (
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-sm border p-4 flex items-center justify-center">
                                <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">{brand.name} Coupons</h1>
                            <p className="text-slate-600">
                                Best {brand.name} promo codes and offers for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons?.map((coupon) => (
                        <CouponCard key={coupon.id} coupon={coupon} />
                    ))}
                    {coupons?.length === 0 && (
                        <div className="col-span-full py-10 text-center text-slate-500">
                            No active coupons found for {brand.name} at the moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
