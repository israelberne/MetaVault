import { useDashboardOverview, useSubscriptionSummary, useHealthOverview } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Building2, Wallet, AlertTriangle } from "lucide-react";

const typeLabels: Record<string, string> = { physical: "物理资产", digital: "数字资产", subscription: "订阅" };
const statusLabels: Record<string, string> = { active: "使用中", idle: "闲置", expired: "过期", disposed: "已处置" };

function Dashboard() {
  const { data: overview, isLoading: loadingOverview } = useDashboardOverview();
  const { data: subscriptions, isLoading: loadingSubs } = useSubscriptionSummary();
  const { data: health, isLoading: loadingHealth } = useHealthOverview();

  if (loadingOverview) return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">仪表盘</h2>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{overview?.totalAssets ?? 0}</div>
              <div className="text-xs text-muted-foreground">总资产</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{overview?.totalSuppliers ?? 0}</div>
              <div className="text-xs text-muted-foreground">供应商</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">¥{(overview?.totalValue ?? 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">总价值</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <div className="text-2xl font-bold">{health?.unreadNotifications ?? 0}</div>
              <div className="text-xs text-muted-foreground">未读提醒</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 资产分布 */}
      <Card>
        <CardHeader><CardTitle>资产分布</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {overview?.byType?.map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <span className="text-sm">{typeLabels[item.type] ?? item.type}</span>
              <Badge variant="secondary">{item.count}</Badge>
            </div>
          ))}
          {!overview?.byType?.length && <div className="text-muted-foreground text-sm">暂无数据</div>}
        </CardContent>
      </Card>

      {/* 状态分布 */}
      <Card>
        <CardHeader><CardTitle>状态分布</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {overview?.byStatus?.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <span className="text-sm">{statusLabels[item.status] ?? item.status}</span>
              <Badge variant="secondary">{item.count}</Badge>
            </div>
          ))}
          {!overview?.byStatus?.length && <div className="text-muted-foreground text-sm">暂无数据</div>}
        </CardContent>
      </Card>

      {/* 订阅费用 */}
      {!loadingSubs && subscriptions && (
        <Card>
          <CardHeader><CardTitle>订阅费用</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between font-medium">
              <span>月度总计</span>
              <span>¥{subscriptions.monthlyTotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>年度总计</span>
              <span>¥{subscriptions.yearlyTotal.toLocaleString()}</span>
            </div>
            {subscriptions.items.length > 0 && (
              <div className="space-y-2 mt-3">
                {subscriptions.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">¥{item.amount}/{item.cycle === "monthly" ? "月" : item.cycle === "yearly" ? "年" : "终身"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 健康提醒 */}
      {!loadingHealth && health && health.expiringDetails?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>即将到期</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {health.expiringDetails.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.name}</span>
                <Badge variant="outline">{typeLabels[item.type]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;