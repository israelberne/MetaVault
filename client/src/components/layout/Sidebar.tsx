import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Building2,
  Upload,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "仪表盘", icon: LayoutDashboard },
  { to: "/assets", label: "资产管理", icon: Package },
  { to: "/suppliers", label: "优秀供应商", icon: Building2 },
  { to: "/import", label: "数据导入", icon: Upload },
  { to: "/export", label: "数据导出", icon: Download },
];

function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center px-4 font-semibold tracking-tight">
        MetaVault
      </div>
      <nav className="flex-1 space-y-1 px-2 py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;