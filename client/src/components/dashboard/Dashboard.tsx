import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Package, Building2, Bell, AlertTriangle } from "lucide-react";
import {
  useDashboardOverview,
  useHealthOverview,
  useDashboardTrends,
} from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TYPE_COLORS: Record<string, string> = {
  physical: "#3b82f6",
  digital: "#8b5cf6",
  subscription: "#f59e0b",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  idle: "#f59e0b",
  expired: "#ef4444",
  disposed: "#6b7280",
};

const typeLabels: Record<string, string> = {
  physical: "物理资产",
  digital: "数字资产",
  subscription: "订阅",
};

const statusLabels: Record<string, string> = {
  active: "使用中",
  idle: "闲置",
  expired: "已过期",
  disposed: "已报废",
};

function Dashboard() {
  const { data: overview } = useDashboardOverview();
  const { data: health } = useHealthOverview();
  const { data: trends } = useDashboardTrends();

  const byType = (overview?.byType ?? []).map((item: any) => ({
    name: typeLabels[item.type] ?? item.type,
    value: item.count,
    color: TYPE_COLORS[item.type] ?? "#94a3b8",
  }));

  const byStatus = (overview?.byStatus ?? []).map((item: any) => ({
    name: statusLabels[item.status] ?? item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] ?? "#94a3b8",
  }));

  // 聚合趋势数据：按月份合并所有订阅的 monthly_cost
  const trendMap = new Map<string, number>();
  for (const item of trends ?? []) {
    const prev = trendMap.get(item.month) ?? 0;
    trendMap.set(item.month, prev + item.monthly_cost);
  }
  const trendData = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cost]) => ({ month, cost: Math.round(cost * 100) / 100 }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">仪表盘</h2>

      {/* 数字卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              资产总数
            </div>
            <p className="text-2xl font-bold mt-1">{overview?.totalAssets ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              供应商
            </div>
            <p className="text-2xl font-bold mt-1">{overview?.totalSuppliers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              资产总值
            </div>
            <p className="text-2xl font-bold mt-1">
              ¥{((overview?.totalValue ?? 0) as number).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              即将到期
            </div>
            <p className="text-2xl font-bold mt-1">{health?.expiringAssets ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 资产类型分布 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">资产类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            {byType.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={byType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name} ${value}`}
                  >
                    {byType.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* 资产状态分布 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">资产状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name} ${value}`}
                  >
                    {byStatus.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">暂无数据</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 订阅月费用趋势 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">订阅月费用趋势</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="月费用"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">暂无订阅数据</p>
          )}
        </CardContent>
      </Card>

      {/* 未读提醒 */}
      {health && health.unreadNotifications > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-amber-500" />
              <span>你有 {health.unreadNotifications} 条未读提醒</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
