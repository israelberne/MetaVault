import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsset, useCreateAsset, useUpdateAsset } from "@/hooks/useAssets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetType, AssetStatus, AssetInput } from "@/types/asset";

const assetTypes: { value: AssetType; label: string }[] = [
  { value: "physical", label: "物理资产" },
  { value: "digital", label: "数字资产" },
  { value: "subscription", label: "订阅" },
];

const assetStatuses: { value: AssetStatus; label: string }[] = [
  { value: "active", label: "使用中" },
  { value: "idle", label: "闲置" },
  { value: "expired", label: "过期" },
  { value: "disposed", label: "已处置" },
];

const categories: Record<AssetType, string[]> = {
  physical: ["physical.laptop", "physical.phone", "physical.monitor", "physical.furniture", "physical.camera", "physical.book", "physical.other"],
  digital: ["digital.domain", "digital.course", "digital.ebook", "digital.software_license", "digital.account", "digital.other"],
  subscription: ["subscription.saas", "subscription.membership", "subscription.cloud_service", "subscription.streaming", "subscription.insurance", "subscription.other"],
};

function AssetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: existing } = useAsset(id!);
  const create = useCreateAsset();
  const update = useUpdateAsset();

  const [form, setForm] = useState<AssetInput>({
    name: "",
    type: "physical",
    category: "physical.laptop",
    status: "active",
    tags: [],
    purchase_date: null,
    purchase_price: null,
    currency: "CNY",
    notes: null,
    ext: {},
  });

  // 编辑模式：加载已有数据
  if (isEdit && existing && form.name === "") {
    setForm({
      name: existing.name,
      type: existing.type,
      category: existing.category,
      status: existing.status,
      tags: existing.tags,
      purchase_date: existing.purchase_date,
      purchase_price: existing.purchase_price,
      currency: existing.currency,
      notes: existing.notes,
      ext: existing.ext,
    });
  }

  const [tagInput, setTagInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      update.mutate({ id: id!, input: form }, { onSuccess: () => navigate(`/assets/${id}`) });
    } else {
      create.mutate(form, { onSuccess: (asset) => navigate(`/assets/${asset.id}`) });
    }
  }

  function addTag() {
    if (tagInput.trim() && !form.tags?.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, tags: [...(f.tags ?? []), tagInput.trim()] }));
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags?.filter((t) => t !== tag) }));
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold">{isEdit ? "编辑资产" : "新建资产"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>名称</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>

        <div className="space-y-2">
          <Label>类型</Label>
          <Select value={form.type} onValueChange={(v: AssetType) => setForm((f) => ({ ...f, type: v, category: categories[v][0] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {assetTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>分类</Label>
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories[form.type].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>状态</Label>
          <Select value={form.status} onValueChange={(v: AssetStatus) => setForm((f) => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {assetStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>获取日期</Label>
          <Input type="date" value={form.purchase_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, purchase_date: e.target.value || null }))} />
        </div>

        <div className="space-y-2">
          <Label>获取价格</Label>
          <Input type="number" value={form.purchase_price ?? ""} onChange={(e) => setForm((f) => ({ ...f, purchase_price: e.target.value ? Number(e.target.value) : null }))} />
        </div>
      </div>

      {/* 标签 */}
      <div className="space-y-2">
        <Label>标签</Label>
        <div className="flex items-center gap-2">
          <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="输入标签后回车" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
          <Button type="button" variant="secondary" onClick={addTag}>添加</Button>
        </div>
        {form.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {form.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} <span className="text-muted-foreground">×</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 备注 */}
      <div className="space-y-2">
        <Label>备注</Label>
        <Textarea value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))} rows={3} />
      </div>

      {/* 类型扩展字段 */}
      {form.type === "physical" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>规格型号</Label>
            <Input value={(form.ext as Record<string, unknown>).model as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, model: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>数量</Label>
            <Input type="number" value={(form.ext as Record<string, unknown>).quantity as number ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, quantity: e.target.value ? Number(e.target.value) : null } }))} />
          </div>
          <div className="space-y-2">
            <Label>计量单位</Label>
            <Input value={(form.ext as Record<string, unknown>).unit as string ?? ""} placeholder="个/台/套" onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, unit: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>存放位置</Label>
            <Input value={(form.ext as Record<string, unknown>).location as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, location: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>用途场景</Label>
            <Input value={(form.ext as Record<string, unknown>).usage as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, usage: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>归属人</Label>
            <Input value={(form.ext as Record<string, unknown>).owner as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, owner: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>资产来源</Label>
            <Select value={(form.ext as Record<string, unknown>).source as string ?? "purchase"} onValueChange={(v) => setForm((f) => ({ ...f, ext: { ...f.ext, source: v } }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">购入</SelectItem>
                <SelectItem value="self_build">自建</SelectItem>
                <SelectItem value="donation">捐赠</SelectItem>
                <SelectItem value="transfer">调拨</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>保修到期日</Label>
            <Input type="date" value={(form.ext as Record<string, unknown>).warranty_expiry as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, warranty_expiry: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>序列号</Label>
            <Input value={(form.ext as Record<string, unknown>).serial_number as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, serial_number: e.target.value } }))} />
          </div>
        </div>
      )}

      {form.type === "digital" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>平台</Label>
            <Input value={(form.ext as Record<string, unknown>).platform as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, platform: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>到期日</Label>
            <Input type="date" value={(form.ext as Record<string, unknown>).expiry_date as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, expiry_date: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>账号</Label>
            <Input value={(form.ext as Record<string, unknown>).account as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, account: e.target.value } }))} />
          </div>
        </div>
      )}

      {form.type === "subscription" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>计费周期</Label>
            <Select value={(form.ext as Record<string, unknown>).billing_cycle as string ?? "monthly"} onValueChange={(v) => setForm((f) => ({ ...f, ext: { ...f.ext, billing_cycle: v } }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">月付</SelectItem>
                <SelectItem value="yearly">年付</SelectItem>
                <SelectItem value="lifetime">终身</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>每期费用</Label>
            <Input type="number" value={(form.ext as Record<string, unknown>).amount as number ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, amount: e.target.value ? Number(e.target.value) : null } }))} />
          </div>
          <div className="space-y-2">
            <Label>下次扣费日</Label>
            <Input type="date" value={(form.ext as Record<string, unknown>).next_billing_date as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, next_billing_date: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>试用到期日</Label>
            <Input type="date" value={(form.ext as Record<string, unknown>).trial_end as string ?? ""} onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, trial_end: e.target.value } }))} />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {create.isPending || update.isPending ? "保存中..." : "保存"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>取消</Button>
      </div>
    </form>
  );
}

export default AssetForm;