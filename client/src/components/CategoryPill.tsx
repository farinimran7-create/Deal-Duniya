import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface CategoryPillProps {
  name: string;
  iconName: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryPill({ name, iconName, isActive, onClick, className }: CategoryPillProps) {
  // Dynamically get icon component
  const IconComponent = (Icons[iconName as keyof typeof Icons] as LucideIcon) || Icons.Tag;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 min-w-[80px] rounded-xl transition-all duration-200 border",
        isActive 
          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
          : "bg-white text-muted-foreground border-transparent hover:border-border hover:bg-slate-50",
        className
      )}
    >
      <div className={cn(
        "p-2 rounded-full",
        isActive ? "bg-white/20" : "bg-primary/5 text-primary"
      )}>
        <IconComponent className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium whitespace-nowrap">{name}</span>
    </button>
  );
}
