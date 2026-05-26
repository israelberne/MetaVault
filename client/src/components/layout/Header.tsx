import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Bell, Search, X, BellOff, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
} from "@/lib/api-notifications";
import { useNotifications } from "@/hooks/useNotifications";

function PushToggle() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.pushManager.getSubscription().then((sub) => {
            setPushEnabled(!!sub);
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, []);

  async function togglePush() {
    setLoading(true);
    try {
      if (pushEnabled) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
          await unsubscribePush(sub.endpoint);
          await sub.unsubscribe();
        }
        setPushEnabled(false);
      } else {
        const publicKey = await getVapidPublicKey();
        if (!publicKey) {
          toast.error("Web Push 未配置，请检查服务器 VAPID 密钥");
          return;
        }
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });
        await subscribePush(sub);
        setPushEnabled(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "推送设置失败");
    }
    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={togglePush}
      disabled={loading}
      title={pushEnabled ? "关闭推送通知" : "开启推送通知"}
    >
      {pushEnabled ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
    </Button>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n: any) => !n.is_read && !n.is_dismissed).length ?? 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/assets?q=${encodeURIComponent(searchText.trim())}`);
    }
  }

  return (
    <header className="nav-dashed-border sticky top-0 z-50 flex h-[54px] items-center justify-between border-b border-ink3 bg-pg px-6 gap-2">
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <PushToggle />
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-wrn text-[10px] text-white font-bold animate-badge-pulse">
                {unread}
              </span>
            )}
          </Button>
          {notifOpen && notifications && notifications.length > 0 && (
            <div className="absolute left-0 top-full mt-1 w-72 rounded-md border border-ink3 bg-card shadow-lg z-50 max-h-64 overflow-y-auto">
              {notifications.slice(0, 10).map((n: any) => (
                <div
                  key={n.id}
                  className="border-b border-ink4 px-3 py-2 text-sm last:border-0"
                >
                  <p className="font-medium">{n.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.trigger_date}
                  </p>
                </div>
              ))}
              <Link
                to="/notifications"
                className="block px-3 py-2 text-sm text-center text-muted-foreground hover:text-foreground border-t border-ink4"
                onClick={() => setNotifOpen(false)}
              >
                查看全部通知
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 桌面搜索 */}
      <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索资产..."
            className="pl-9"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </form>

      {/* 移动搜索 */}
      {mobileSearchOpen ? (
        <form onSubmit={handleSearch} className="flex md:hidden flex-1 gap-1">
          <Input
            placeholder="搜索资产..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
    </header>
  );
}

export default Header;