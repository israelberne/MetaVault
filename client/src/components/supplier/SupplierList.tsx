import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Star, Search } from "lucide-react";
import { useSuppliers, useToggleFavorite } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardColorBar } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const typeLabels: Record<string, string> = { physical: "物理", digital: "数字", subscription: "订阅", mixed: "混合" };

const typeBadgeVariant: Record<string, "physical" | "digital" | "subscription" | "secondary"> = {
  physical: "physical",
  digital: "digital",
  subscription: "subscription",
  mixed: "secondary",
};

function SupplierList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const { data: suppliers, isLoading } = useSuppliers();
  const toggleFav = useToggleFavorite();

  const filtered = suppliers?.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold tracking-[2px] uppercase">优秀供应商</h2>
        <Button onClick={() => navigate("/suppliers/new")} className="hidden md:inline-flex">
          <Plus className="h-4 w-4 mr-1" /> 新建供应商
        </Button>
      </div>

      <div className="relative hidden md:block w-48">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索供应商..."
          value={search}
          onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {})}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : !filtered?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? `没有匹配"${search}"的供应商` : "暂无供应商"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card key={s.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/suppliers/${s.id}`)}>
              <div className="flex">
                <CardColorBar color={s.is_favorite ? "var(--color-sub)" : "var(--color-ink4)"} />
                <CardContent className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{s.name}</h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant={typeBadgeVariant[s.type] ?? "secondary"}>
                          {typeLabels[s.type] ?? s.type}
                        </Badge>
                        {s.rating && <span>评分 {s.rating}/5</span>}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleFav.mutate(s.id); }} className="text-ink2 hover:text-sub">
                      <Star className={`h-4 w-4 ${s.is_favorite ? "fill-sub text-sub" : ""}`} />
                    </button>
                  </div>
                  {s.tags?.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {s.tags.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 手机端 FAB */}
      <button onClick={() => navigate("/suppliers/new")} className="fixed bottom-20 right-4 md:hidden h-12 w-12 rounded-full bg-ink text-pg shadow-lg flex items-center justify-center">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

export default SupplierList;