import { useAdminCoupons, useUpdateCouponStatus, useDeleteCoupon } from "@/hooks/use-admin";
import { Loader2, Check, X, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ManageCoupons() {
    const { data: coupons, isLoading } = useAdminCoupons();
    const updateStatus = useUpdateCouponStatus();
    const deleteCoupon = useDeleteCoupon();
    const { toast } = useToast();

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;

    const handleStatusChange = (id: number, isActive: boolean) => {
        updateStatus.mutate(
            { id, isActive },
            {
                onSuccess: () => {
                    toast({ title: isActive ? "Coupon Approved" : "Coupon Rejected" });
                },
            }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this coupon?")) {
            deleteCoupon.mutate(id, {
                onSuccess: () => toast({ title: "Coupon Deleted" }),
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold">Manage Coupons</h1>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons?.map((coupon) => (
                            <TableRow key={coupon.id}>
                                <TableCell>
                                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                                        {coupon.isActive ? "Active" : "Pending"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {coupon.title}
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {coupon.description}
                                    </div>
                                </TableCell>
                                <TableCell>{coupon.brand?.name}</TableCell>
                                <TableCell>
                                    <code className="bg-muted px-2 py-1 rounded text-xs">{coupon.code}</code>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {coupon.createdAt ? format(new Date(coupon.createdAt), "MMM d, yyyy") : "-"}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {!coupon.isActive && (
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => handleStatusChange(coupon.id, true)}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {coupon.isActive && (
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                            onClick={() => handleStatusChange(coupon.id, false)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(coupon.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
