import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertCoupon, type CouponResponse, type ValidateCouponResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCoupons(filters?: { search?: string; categoryId?: number; brandId?: number; sort?: string }) {
  const queryKey = [api.coupons.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build URL with query params
      const url = new URL(api.coupons.list.path, window.location.origin);
      if (filters?.search) url.searchParams.append("search", filters.search);
      if (filters?.categoryId) url.searchParams.append("categoryId", filters.categoryId.toString());
      if (filters?.brandId) url.searchParams.append("brandId", filters.brandId.toString());
      if (filters?.sort) url.searchParams.append("sort", filters.sort);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch coupons");
      return await res.json() as CouponResponse[]; // Using type assertion as Zod parse happens on server usually, but here strict for types
    },
  });
}

export function useCoupon(id: number) {
  return useQuery({
    queryKey: [api.coupons.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.coupons.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch coupon");
      return await res.json() as CouponResponse;
    },
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCoupon) => {
      const res = await fetch(api.coupons.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create coupon");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.coupons.list.path] });
      toast({
        title: "Coupon Submitted!",
        description: "Thank you for sharing. Your coupon is now live.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.coupons.validate.path, { id });
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to validate coupon");
      return await res.json() as ValidateCouponResponse;
    },
  });
}

export function useVoteCoupon() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, worked }: { id: number; worked: boolean }) => {
      const url = buildUrl(api.coupons.vote.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worked }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit vote");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Optimistic update or refetch
      queryClient.invalidateQueries({ queryKey: [api.coupons.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.coupons.get.path, variables.id] });
      toast({
        title: "Vote Recorded",
        description: "Thanks for helping the community!",
      });
    },
    onError: () => {
      toast({
        title: "Vote Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

export function useBrands() {
  return useQuery({
    queryKey: [api.brands.list.path],
    queryFn: async () => {
      const res = await fetch(api.brands.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch brands");
      return await res.json();
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json();
    },
  });
}
