import { Link, useLocation } from "wouter";
import { LayoutDashboard, Tag, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [location] = useLocation();

    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/coupons", icon: Tag, label: "Coupons" },
        { href: "/admin/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <Link href="/">
                        <div className="text-2xl font-display font-bold text-primary cursor-pointer">
                            DealDuniya
                            <span className="text-xs ml-2 bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 relative -top-1">Admin</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                                    location === item.href
                                        ? "bg-primary/5 text-primary"
                                        : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}
