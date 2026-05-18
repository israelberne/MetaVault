import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, Camera, Star } from "lucide-react";
import { useAsset, useCreateAsset, useUpdateAsset } from "@/hooks/useAssets";
import { useFilteredSuppliers } from "@/hooks/useSuppliers";
import { ocrRecognize } from "@/lib/api-assets";
import type { OcrResult } from "@/lib/api-assets";
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
import { categoryLabels } from "@/types/asset";

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

function ScreenshotOcr({ onOcrResult }: { onOcrResult: (r: OcrResult) => void }) {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const result = await ocrRecognize(file);
      setOcrResult(result);
      onOcrResult(result);
    } catch (err) {
      alert(err instanceof Error ? err.message : "OCR 识别失败");
    }
    setOcrLoading(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent">
          <Upload className="h-4 w-4" />
          {ocrLoading ? "识别中..." : "上传截图识别"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={ocrLoading} />
        </label>
      </div>
      {ocrResult && (
        <div className="rounded-md border p-3 text-sm space-y-1">
          <p className="font-medium">识别结果：</p>
          {ocrResult.service_name && <p>服务名：{ocrResult.service_name}</p>}
          {ocrResult.amount != null && <p>金额：¥{ocrResult.amount}</p>}
          {ocrResult.billing_cycle && <p>计费周期：{ocrResult.billing_cycle === "monthly" ? "月付" : ocrResult.billing_cycle === "yearly" ? "年付" : ocrResult.billing_cycle}</p>}
          {ocrResult.next_billing_date && <p>下次扣费：{ocrResult.next_billing_date}</p>}
          <p className="text-muted-foreground">已自动填入表单，可手动修改</p>
        </div>
      )}
    </div>
  );
}

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
    supplier_id: null,
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
      supplier_id: existing.supplier_id,
      notes: existing.notes,
      ext: existing.ext,
    });
  }

  const [tagInput, setTagInput] = useState("");

  const { data: filteredSuppliers } = useFilteredSuppliers(
    form.type ? { type: form.type } : {}
  );

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
              {categories[form.type].map((c) => <SelectItem key={c} value={c}>{categoryLabels[c] ?? c}</SelectItem>)}
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

        <div className="space-y-2">
          <Label>供应商</Label>
          <Select
            value={form.supplier_id ?? "none"}
            onValueChange={(v) => setForm((f) => ({ ...f, supplier_id: v === "none" ? null : v }))}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="选择供应商" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">不选择</SelectItem>
              {filteredSuppliers?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.is_favorite ? "★ " : ""}{s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={(form.ext as Record<string, unknown>).auto_renew as boolean ?? false}
                onChange={(e) => setForm((f) => ({ ...f, ext: { ...f.ext, auto_renew: e.target.checked } }))}
              />
              自动续期
            </label>
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
          <div className="space-y-2">
            <Label>使用频率</Label>
            <Select value={(form.ext as Record<string, unknown>).usage_frequency as string ?? "monthly"} onValueChange={(v) => setForm((f) => ({ ...f, ext: { ...f.ext, usage_frequency: v } }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">每天</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
                <SelectItem value="monthly">每月</SelectItem>
                <SelectItem value="rarely">很少</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>订阅截图（OCR 自动识别）</Label>
            <ScreenshotOcr onOcrResult={(r) => {
              setForm((f) => ({
                ...f,
                name: r.service_name ?? f.name,
                ext: {
                  ...f.ext,
                  ...(r.amount != null && { amount: r.amount }),
                  ...(r.billing_cycle && { billing_cycle: r.billing_cycle }),
                  ...(r.next_billing_date && { next_billing_date: r.next_billing_date }),
                },
              }));
            }} />
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