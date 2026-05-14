import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useAsset, useDeleteAsset } from "@/hooks/useAssets";
import { useRelations } from "@/hooks/useRelations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetType, AssetStatus } from "@/types/asset";

const typeLabels: Record<AssetType, string> = { physical: "物理资产", digital: "数字资产", subscription: "订阅" };
const statusLabels: Record<AssetStatus, string> = { active: "使用中", idle: "闲置", expired: "过期", disposed: "已处置" };
const relationLabels: Record<string, string> = { depends_on: "依赖", contains: "包含", bound_to: "绑定", related_to: "相关" };

const sourceLabels: Record<string, string> = { purchase: "购入", self_build: "自建", donation: "捐赠", transfer: "调拨" };

function AssetDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: asset, isLoading } = useAsset(id!);
  const { data: relations } = useRelations(id!);
  const deleteAsset = useDeleteAsset();

  if (isLoading) return <Skeleton className="h-64 rounded-lg" />;
  if (!asset) return <div className="text-muted-foreground">资产不存在</div>;

  const ext = asset.ext as Record<string, unknown>;

  function handleDelete() {
    if (confirm("确定删除此资产？关联关系也会一并删除。")) {
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
            <span>{asset.category}</span>
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
          {asset.type === "physical" && (
            <>
              {ext.model && <div><span className="text-muted-foreground">规格型号：</span>{ext.model as string}</div>}
              {ext.quantity != null && <div><span className="text-muted-foreground">数量：</span>{ext.quantity as number}{ext.unit ? ` ${ext.unit as string}` : ""}</div>}
              {ext.location && <div><span className="text-muted-foreground">存放位置：</span>{ext.location as string}</div>}
              {ext.usage && <div><span className="text-muted-foreground">用途场景：</span>{ext.usage as string}</div>}
              {ext.owner && <div><span className="text-muted-foreground">归属人：</span>{ext.owner as string}</div>}
              {ext.source && <div><span className="text-muted-foreground">资产来源：</span>{sourceLabels[ext.source as string] ?? ext.source as string}</div>}
              {ext.warranty_expiry && <div><span className="text-muted-foreground">保修到期：</span>{ext.warranty_expiry as string}</div>}
              {ext.serial_number && <div><span className="text-muted-foreground">序列号：</span>{ext.serial_number as string}</div>}
            </>
          )}
          {asset.type === "digital" && (
            <>
              {ext.platform && <div><span className="text-muted-foreground">平台：</span>{ext.platform as string}</div>}
              {ext.account && <div><span className="text-muted-foreground">账号：</span>{ext.account as string}</div>}
              {ext.expiry_date && <div><span className="text-muted-foreground">到期日：</span>{ext.expiry_date as string}</div>}
            </>
          )}
          {asset.type === "subscription" && (
            <>
              {ext.billing_cycle && <div><span className="text-muted-foreground">计费周期：</span>{ext.billing_cycle as string}</div>}
              {ext.amount != null && <div><span className="text-muted-foreground">每期费用：</span>¥{Number(ext.amount).toLocaleString()}</div>}
              {ext.next_billing_date && <div><span className="text-muted-foreground">下次扣费：</span>{ext.next_billing_date as string}</div>}
              {ext.trial_end && <div><span className="text-muted-foreground">试用到期：</span>{ext.trial_end as string}</div>}
            </>
          )}
          {!Object.keys(ext).length && <div className="text-muted-foreground">无扩展信息</div>}
        </CardContent>
      </Card>

      {/* 关联资产 */}
      {relations?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>关联资产</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {relations.map((r) => (
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