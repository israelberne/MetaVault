import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, ArrowLeft, Star } from "lucide-react";
import { useAsset, useDeleteAsset, useMarkAssetUsed } from "@/hooks/useAssets";
import { useRelations } from "@/hooks/useRelations";
import { useSupplier } from "@/hooks/useSuppliers";
import { useQuery } from "@tanstack/react-query";
import { fetchSuppliers } from "@/lib/api-suppliers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetType, AssetStatus, PhysicalExt, DigitalExt, SubscriptionExt } from "@/types/asset";
import { categoryLabels } from "@/types/asset";

const typeLabels: Record<AssetType, string> = { physical: "物理资产", digital: "数字资产", subscription: "订阅" };
const statusLabels: Record<AssetStatus, string> = { active: "使用中", idle: "闲置", expired: "过期", disposed: "已处置" };
const relationLabels: Record<string, string> = { depends_on: "依赖", contains: "包含", bound_to: "绑定", related_to: "相关" };

const sourceLabels: Record<string, string> = { purchase: "购入", self_build: "自建", donation: "捐赠", transfer: "调拨" };
const usageFreqLabels: Record<string, string> = { daily: "每天", weekly: "每周", monthly: "每月", rarely: "很少" };

function ReplacementSuppliers({ navigate }: { navigate: (path: string) => void }) {
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers", { type: "physical", favorite: true }],
    queryFn: () => fetchSuppliers({ type: "physical", favorite: true }),
  });

  if (!suppliers?.length) return null;

  return (
    <Card>
      <CardHeader><CardTitle>推荐替换供应商</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-md border px-3 py-2 cursor-pointer hover:bg-accent"
            onClick={() => navigate(`/suppliers/${s.id}`)}
          >
            <div className="flex items-center gap-2">
              <Star className={`h-4 w-4 ${s.is_favorite ? "fill-primary text-primary" : ""}`} />
              <span className="font-medium">{s.name}</span>
            </div>
            <Badge variant="outline">{s.type === "mixed" ? "混合" : "物理"}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AssetDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: asset, isLoading } = useAsset(id!);
  const { data: relations } = useRelations(id!);
  const deleteAsset = useDeleteAsset();
  const markUsed = useMarkAssetUsed();
  const { data: supplier } = useSupplier(asset?.supplier_id ?? "");

  if (isLoading) return <Skeleton className="h-64 rounded-lg" />;
  if (!asset) return <div className="text-muted-foreground">资产不存在</div>;

  // 块级 cast：按类型获取 ext
  const pExt = asset.type === "physical" ? (asset.ext as PhysicalExt) : null;
  const dExt = asset.type === "digital" ? (asset.ext as DigitalExt) : null;
  const sExt = asset.type === "subscription" ? (asset.ext as SubscriptionExt) : null;

  function handleDelete() {
    const relCount = relations?.length ?? 0;
    let message = "确定删除此资产？";
    if (relCount > 0) {
      const names = relations!.slice(0, 3).map((r) =>
        r.source_id === id ? r.target_name : r.source_name
      );
      const suffix = relCount > 3 ? `等 ${relCount} 个` : `${relCount} 个`;
      message = `此资产有 ${suffix}关联关系（${names.join("、")}）。删除后这些关系将一并移除。确定删除？`;
    }
    if (confirm(message)) {
      deleteAsset.mutate(id!, { onSuccess: () => navigate("/assets") });
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 头部 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold">{asset.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{typeLabels[asset.type]}</Badge>
              <Badge>{statusLabels[asset.status]}</Badge>
              <span>{categoryLabels[asset.category] ?? asset.category}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/assets/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" /> 编辑
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteAsset.isPending}>
            <Trash2 className="h-4 w-4 mr-1" /> 删除
          </Button>
        </div>
      </div>

      <Separator />

      {/* 基本信息 */}
      <Card>
        <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {asset.purchase_date && <div><span className="text-muted-foreground">获取日期：</span>{asset.purchase_date}</div>}
          {asset.purchase_price != null && <div><span className="text-muted-foreground">获取价格：</span>¥{asset.purchase_price.toLocaleString()}</div>}
          <div><span className="text-muted-foreground">币种：</span>{asset.currency}</div>
          {asset.supplier_id && supplier && (
            <div><span className="text-muted-foreground">供应商：</span>
              <span className="cursor-pointer hover:underline text-primary" onClick={() => navigate(`/suppliers/${asset.supplier_id}`)}>
                {supplier.is_favorite && <Star className="h-3 w-3 fill-primary text-primary inline mr-0.5" />}
                {supplier.name}
              </span>
            </div>
          )}
          {asset.notes && <div className="md:col-span-2"><span className="text-muted-foreground">备注：</span>{asset.notes}</div>}
          {asset.tags?.length > 0 && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground">标签：</span>
              <span className="ml-1 flex gap-1 flex-wrap">
                {asset.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 扩展信息 */}
      <Card>
        <CardHeader><CardTitle>类型详情</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {pExt && (
            <>
              {pExt.model && <div><span className="text-muted-foreground">规格型号：</span>{pExt.model}</div>}
              {pExt.quantity != null && <div><span className="text-muted-foreground">数量：</span>{pExt.quantity}{pExt.unit ? ` ${pExt.unit}` : ""}</div>}
              {pExt.location && <div><span className="text-muted-foreground">存放位置：</span>{pExt.location}</div>}
              {pExt.usage && <div><span className="text-muted-foreground">用途场景：</span>{pExt.usage}</div>}
              {pExt.owner && <div><span className="text-muted-foreground">归属人：</span>{pExt.owner}</div>}
              {pExt.source && <div><span className="text-muted-foreground">资产来源：</span>{sourceLabels[pExt.source] ?? pExt.source}</div>}
              {pExt.warranty_expiry && <div><span className="text-muted-foreground">保修到期：</span>{pExt.warranty_expiry}</div>}
              {pExt.serial_number && <div><span className="text-muted-foreground">序列号：</span>{pExt.serial_number}</div>}
            </>
          )}
          {dExt && (
            <>
              {dExt.platform && <div><span className="text-muted-foreground">平台：</span>{dExt.platform}</div>}
              {dExt.account && <div><span className="text-muted-foreground">账号：</span>{dExt.account}</div>}
              {dExt.expiry_date && <div><span className="text-muted-foreground">到期日：</span>{dExt.expiry_date}</div>}
              {dExt.usage_stats?.last_access && (
                <div><span className="text-muted-foreground">上次使用：</span>{new Date(dExt.usage_stats.last_access).toLocaleString("zh-CN")}</div>
              )}
              <div className="md:col-span-2">
                <Button variant="outline" size="sm" onClick={() => markUsed.mutate(id!)} disabled={markUsed.isPending}>
                  {markUsed.isPending ? "标记中..." : "标记已使用"}
                </Button>
              </div>
            </>
          )}
          {sExt && (
            <>
              {sExt.billing_cycle && <div><span className="text-muted-foreground">计费周期：</span>{sExt.billing_cycle}</div>}
              {sExt.amount != null && <div><span className="text-muted-foreground">每期费用：</span>¥{Number(sExt.amount).toLocaleString()}</div>}
              {sExt.next_billing_date && <div><span className="text-muted-foreground">下次扣费：</span>{sExt.next_billing_date}</div>}
              {sExt.trial_end && <div><span className="text-muted-foreground">试用到期：</span>{sExt.trial_end}</div>}
              {sExt.usage_frequency && <div><span className="text-muted-foreground">使用频率：</span>{usageFreqLabels[sExt.usage_frequency] ?? sExt.usage_frequency}</div>}
              {sExt.screenshot_url && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">订阅截图：</span>
                  <img src={sExt.screenshot_url} alt="订阅截图" className="mt-1 max-w-xs rounded-md border" />
                </div>
              )}
            </>
          )}
          {!pExt && !dExt && !sExt && <div className="text-muted-foreground">无扩展信息</div>}
        </CardContent>
      </Card>

      {/* 推荐替换供应商（折旧物理资产） */}
      {asset.type === "physical" && pExt?.current_value != null && asset.purchase_price != null && Number(pExt.current_value) <= Number(asset.purchase_price) * 0.1 && (
        <ReplacementSuppliers navigate={navigate} />
      )}

      {/* 关联资产 */}
      {(relations?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle>关联资产</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {relations!.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <Badge variant="outline">{relationLabels[r.relation]}</Badge>
                <span className="cursor-pointer hover:underline" onClick={() => navigate(`/assets/${r.source_id === id ? r.target_id : r.source_id}`)}>
                  {r.source_id === id ? r.target_name : r.source_name}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AssetDetail;