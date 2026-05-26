import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSupplier, useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SupplierInput } from "@/lib/api-suppliers";

const supplierTypes = [
  { value: "physical", label: "物理" },
  { value: "digital", label: "数字" },
  { value: "subscription", label: "订阅" },
  { value: "mixed", label: "混合" },
];

function SupplierForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { data: existing } = useSupplier(id!);
  const create = useCreateSupplier();
  const update = useUpdateSupplier();

  const [form, setForm] = useState<SupplierInput>({ name: "", type: "physical" });
  const [tagInput, setTagInput] = useState("");

  if (isEdit && existing && form.name === "") {
    setForm({
      name: existing.name,
      type: existing.type,
      rating: existing.rating,
      tags: existing.tags,
      contact: existing.contact,
      website: existing.website,
      notes: existing.notes,
      is_favorite: existing.is_favorite,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      update.mutate({ id: id!, input: form }, { onSuccess: () => navigate(`/suppliers/${id}`) });
    } else {
      create.mutate(form, { onSuccess: (s) => navigate(`/suppliers/${s.id}`) });
    }
  }

  function addTag() {
    if (tagInput.trim() && !form.tags?.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, tags: [...(f.tags ?? []), tagInput.trim()] }));
      setTagInput("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <h2 className="font-display text-xl font-bold tracking-[2px] uppercase">{isEdit ? "编辑供应商" : "新建供应商"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>名称</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>类型</Label>
          <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as SupplierInput["type"] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {supplierTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>评分 (1-5)</Label>
          <Input type="number" min={1} max={5} value={form.rating ?? ""} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value ? Number(e.target.value) : null }))} />
        </div>
        <div className="space-y-2">
          <Label>联系方式</Label>
          <Input value={form.contact ?? ""} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>网址</Label>
          <Input value={form.website ?? ""} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>标签</Label>
        <div className="flex items-center gap-2">
          <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="输入标签后回车" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
          <Button type="button" variant="secondary" onClick={addTag}>添加</Button>
        </div>
        {(form.tags?.length ?? 0) > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {form.tags!.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs cursor-pointer" onClick={() => setForm((f) => ({ ...f, tags: f.tags?.filter((t) => t !== tag) }))}>
                {tag} <span className="text-muted-foreground">×</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>备注</Label>
        <Textarea value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {create.isPending || update.isPending ? "保存中..." : "保存"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>取消</Button>
      </div>
    </form>
  );
}

export default SupplierForm;