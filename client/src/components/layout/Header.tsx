import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, Search, X, Check, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useMarkRead, useDismiss } from "@/hooks/useNotifications";

const typeLabels: Record<string, string> = {
  warranty_expiry: "保修到期",
  subscription_renewal: "订阅续费",
  digital_expiry: "到期提醒",
  trial_expiry: "试用到期",
  usage_stagnation: "使用停滞",
  deprecation: "严重折旧",
};

function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useNotifications(true);
  const markRead = useMarkRead();
  const dismiss = useDismiss();

  const unreadCount = notifications?.filter((n) => !n.is_read && !n.is_dismissed).length ?? 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/assets?q=${encodeURIComponent(searchText.trim())}`);
    } else {
      navigate("/assets");
    }
    setSearchOpen(false);
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
      {searchOpen ? (
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <Input
            placeholder="搜索资产、供应商..."
            className="flex-1"
            autoFocus
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button onClick={() => { setSearchOpen(false); setSearchText(searchParams.get("q") ?? ""); }} className="rounded-md p-2 text-muted-foreground hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleSearch} className="relative hidden md:block w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索资产、供应商..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </form>
          <button onClick={() => setSearchOpen(true)} className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden">
            <Search className="h-5 w-5" />
          </button>
        </>
      )}

      <div ref={notifRef} className="relative">
        <button onClick={() => setNotifOpen(!notifOpen)} className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 max-h-64 overflow-y-auto rounded-lg border bg-card shadow-lg z-50">
            <div className="p-3 border-b font-medium text-sm">通知</div>
            {!notifications?.filter((n) => !n.is_dismissed).length ? (
              <div className="p-4 text-sm text-muted-foreground text-center">暂无通知</div>
            ) : (
              notifications.filter((n) => !n.is_dismissed).map((n) => (
                <div key={n.id} className={`p-3 border-b last:border-b-0 text-sm ${n.is_read ? "text-muted-foreground" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="text-xs mb-1">{typeLabels[n.type]}</Badge>
                      <p className="mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.asset_name} · {n.trigger_date}</p>
                    </div>
                    <div className="flex gap-1">
                      {!n.is_read && (
                        <button onClick={() => markRead.mutate(n.id)} className="p-1 text-muted-foreground hover:text-primary" title="标记已读">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => dismiss.mutate(n.id)} className="p-1 text-muted-foreground hover:text-destructive" title="忽略">
                        <EyeOff className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;