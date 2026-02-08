import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Coupon, type Brand, type Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export type AdminStats = {
    totalClicks: number;
    totalConversions: number;
    totalCoupons: number;
    pendingCoupons: number;
    topCoupons: (Coupon & { brand: Brand | null; category: Category | null })[];
};

export function useAdminStats() {
    return useQuery<AdminStats>({
        queryKey: ["/api/admin/stats"],
    });
}

export function useAdminCoupons() {
    return useQuery<(Coupon & { brand: Brand | null; category: Category | null })[]>({
        queryKey: ["/api/coupons?includeInactive=true&sort=newest"], // Reusing public API but with inactive
    });
}

export function useUpdateCouponStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, isActive, successScore }: { id: number; isActive?: boolean; successScore?: number }) => {
            const res = await apiRequest("PATCH", `/api/coupons/${id}/status`, { isActive, successScore });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        },
    });
}

export function useDeleteCoupon() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/coupons/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; slug?: string; icon?: string; parentId?: number }) => {
            const res = await apiRequest("POST", "/api/categories", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
        },
    });
}

export function useCreateBrand() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; slug?: string; logoUrl?: string }) => {
            const res = await apiRequest("POST", "/api/brands", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
        },
    });
}
