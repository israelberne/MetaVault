export type AssetType = "physical" | "digital" | "subscription";
export type AssetStatus = "active" | "idle" | "expired" | "disposed";

export interface PhysicalExt {
  location?: string;
  warranty_expiry?: string;
  serial_number?: string;
  model?: string;
  quantity?: number;
  unit?: string;
  usage?: string;
  owner?: string;
  source?: string;
}

export interface UsageStats {
  last_access?: string;
}

export interface DigitalExt {
  platform?: string;
  account?: string;
  expiry_date?: string;
  auto_renew?: boolean;
  usage_stats?: UsageStats;
}

export interface SubscriptionExt {
  billing_cycle?: string;
  next_billing_date?: string;
  amount?: number;
  trial_end?: string;
  screenshot_url?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  category: string;
  status: AssetStatus;
  tags: string[];
  purchase_date: string | null;
  purchase_price: number | null;
  currency: string;
  supplier_id: string | null;
  notes: string | null;
  ext: PhysicalExt | DigitalExt | SubscriptionExt;
  created_at: string;
  updated_at: string;
}

export interface AssetInput {
  name: string;
  type: AssetType;
  category: string;
  status?: AssetStatus;
  tags?: string[];
  purchase_date?: string | null;
  purchase_price?: number | null;
  currency?: string;
  supplier_id?: string | null;
  notes?: string | null;
  ext?: PhysicalExt | DigitalExt | SubscriptionExt;
}

export interface AssetFilters {
  asset_type?: AssetType;
  status?: AssetStatus;
  category?: string;
  search?: string;
}
