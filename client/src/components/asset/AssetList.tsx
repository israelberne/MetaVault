import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetType, AssetStatus, AssetFilters } from "@/types/asset";

const typeLabels: Record<AssetType, string> = {
  physical: "物理资产",
  digital: "数字资产",
  subscription: "订阅",
};

const statusLabels: Record<AssetStatus, string> = {
  active: "使用中",
  idle: "闲置",
  expired: "过期",
  disposed: "已处置",
};

const statusColors: Record<AssetStatus, string> = {
  active: "bg-green-100 text-green-800",
  idle: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-800",
  disposed: "bg-gray-100 text-gray-800",
};

function AssetList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<AssetFilters>({});
  const search = searchParams.get("q") ?? "";
  const { data: assets, isLoading } = useAssets({
    ...filters,
    search: search || undefined,
  });

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.asset_type || "all"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, asset_type: v === "all" ? undefined : v as AssetType }))
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="资产类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="physical">物理资产</SelectItem>
              <SelectItem value="digital">数字资产</SelectItem>
              <SelectItem value="subscription">订阅</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, status: v === "all" ? undefined : v as AssetStatus }))
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="active">使用中</SelectItem>
              <SelectItem value="idle">闲置</SelectItem>
              <SelectItem value="expired">过期</SelectItem>
              <SelectItem value="disposed">已处置</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative hidden md:block w-48">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索..."
              value={search}
              onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {})}
              className="pl-8"
            />
          </div>
        </div>

        <Button onClick={() => navigate("/assets/new")} className="hidden md:inline-flex">
          <Plus className="h-4 w-4 mr-1" /> 新建资产
        </Button>
      </div>

      {/* 资产网格 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : !assets?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          暂无资产，点击右上角新建
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <Card
              key={asset.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/assets/${asset.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground">{asset.category}</p>
                  </div>
                  <Badge className={statusColors[asset.status]} variant="secondary">
                    {statusLabels[asset.status]}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{typeLabels[asset.type]}</Badge>
                  {asset.purchase_price != null && (
                    <span>¥{asset.purchase_price.toLocaleString()}</span>
                  )}
                  {asset.tags?.length > 0 && (
                    <span className="truncate">
                      {asset.tags.slice(0, 2).join("、")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 手机端 FAB */}
      <button
        onClick={() => navigate("/assets/new")}
        className="fixed bottom-20 right-4 md:hidden h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

export default AssetList;