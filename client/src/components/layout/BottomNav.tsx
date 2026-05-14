import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Building2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "仪表盘", icon: LayoutDashboard },
  { to: "/assets", label: "资产", icon: Package },
  { to: "/suppliers", label: "供应商", icon: Building2 },
  { to: "/import", label: "导入", icon: Upload },
];

function BottomNav() {
  return (
    <nav className="flex md:hidden border-t bg-card pb-[env(safe-area-inset-bottom)]">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors",
              isActive
                ? "text-primary font-medium"
                : "text-muted-foreground",
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
