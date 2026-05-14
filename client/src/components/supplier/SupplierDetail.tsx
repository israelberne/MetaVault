import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, Star, ArrowLeft } from "lucide-react";
import { useSupplier, useDeleteSupplier, useToggleFavorite } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const typeLabels: Record<string, string> = { physical: "物理", digital: "数字", subscription: "订阅", mixed: "混合" };

function SupplierDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: supplier, isLoading } = useSupplier(id!);
  const deleteSupplier = useDeleteSupplier();
  const toggleFav = useToggleFavorite();

  if (isLoading) return <Skeleton className="h-64 rounded-lg" />;
  if (!supplier) return <div className="text-muted-foreground">供应商不存在</div>;

  function handleDelete() {
    if (confirm("确定删除此供应商？")) {
      deleteSupplier.mutate(id!, { onSuccess: () => navigate("/suppliers") });
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">{supplier.name}</h2>
          <button onClick={() => toggleFav.mutate(id!)} className="text-muted-foreground hover:text-primary">
            <Star className={`h-5 w-5 ${supplier.is_favorite ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/suppliers/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" /> 编辑
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteSupplier.isPending}>
            <Trash2 className="h-4 w-4 mr-1" /> 删除
          </Button>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">类型：</span>{typeLabels[supplier.type]}</div>
          {supplier.rating && <div><span className="text-muted-foreground">评分：</span>{supplier.rating}/5</div>}
          {supplier.contact && <div><span className="text-muted-foreground">联系方式：</span>{supplier.contact}</div>}
          {supplier.website && <div><span className="text-muted-foreground">网址：</span>{supplier.website}</div>}
          {supplier.notes && <div className="md:col-span-2"><span className="text-muted-foreground">备注：</span>{supplier.notes}</div>}
          {supplier.tags?.length > 0 && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground">标签：</span>
              <span className="ml-1 flex gap-1 flex-wrap">
                {supplier.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SupplierDetail;