import { useAdminStats } from "@/hooks/use-admin";
import { Loader2, MousePointerClick, DollarSign, Tag, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CouponCard } from "@/components/CouponCard";

export default function AdminDashboard() {
    const { data: stats, isLoading } = useAdminStats();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) return <div>Failed to load stats</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Overview of Deal Duniya's performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClicks}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalConversions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCoupons}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingCoupons}</div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-xl font-display font-bold mb-4">Top Performing Coupons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.topCoupons.map((coupon) => (
                        <CouponCard key={coupon.id} coupon={coupon} />
                    ))}
                </div>
            </div>
        </div>
    );
}
