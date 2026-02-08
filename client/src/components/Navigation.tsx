import { Link, useLocation } from "wouter";
import { Home, Grid, PlusCircle, User, Ticket, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/Vibrant_logo_design_for_DealDuniya_1770491018249.png";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/categories", label: "Categories", icon: Grid },
    { href: "/submit", label: "Submit", icon: PlusCircle, isPrimary: true },
    { href: "/coupons", label: "Coupons", icon: Ticket },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Deal Duniya" className="h-10 w-auto" />
            <span className="font-display font-bold text-2xl text-primary hidden lg:block">DealDuniya</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/" ? "text-primary" : "text-muted-foreground")}>
              Home
            </Link>
            <Link href="/categories" className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/categories" ? "text-primary" : "text-muted-foreground")}>
              Categories
            </Link>
            <Link href="/coupons" className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/coupons" ? "text-primary" : "text-muted-foreground")}>
              All Coupons
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/submit">
              <button className="btn-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Submit Coupon
              </button>
            </Link>
            {user ? (
              <Link href="/profile" className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold hover:bg-secondary/20 transition-colors">
                {user.firstName?.[0] || <User className="w-5 h-5" />}
              </Link>
            ) : (
              <a href="/api/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Login
              </a>
            )}

            {user?.isAdmin && (
              <Link href="/admin">
                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Admin Panel">
                  <Shield className="w-5 h-5" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full z-50 bg-white border-t pb-safe">
        <div className={cn("grid h-16", user?.isAdmin ? "grid-cols-6" : "grid-cols-5")}>
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 w-full h-full relative">
                {item.isPrimary ? (
                  <div className="absolute -top-6 bg-primary rounded-full p-3 shadow-lg shadow-primary/30 border-4 border-white">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                )}
                <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-primary" : "text-muted-foreground", item.isPrimary && "mt-6")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          {user?.isAdmin && (
            <Link href="/admin" className="flex flex-col items-center justify-center gap-1 w-full h-full relative">
              <Shield className={cn("w-5 h-5 transition-colors", location.startsWith("/admin") ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px] font-medium transition-colors", location.startsWith("/admin") ? "text-primary" : "text-muted-foreground")}>
                Admin
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Spacer for fixed header/footer */}
      <div className="h-16 md:h-20" />
    </>
  );
}
