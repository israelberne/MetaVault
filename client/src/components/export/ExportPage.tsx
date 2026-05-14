import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { exportAssets, exportSuppliers, downloadBlob } from "@/lib/api-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleExportAssets() {
    setLoading("assets");
    try {
      const blob = await exportAssets();
      downloadBlob(blob, "assets.xlsx");
    } catch (err) {
      alert(err instanceof Error ? err.message : "导出失败");
    }
    setLoading(null);
  }

  async function handleExportSuppliers() {
    setLoading("suppliers");
    try {
      const blob = await exportSuppliers();
      downloadBlob(blob, "suppliers.xlsx");
    } catch (err) {
      alert(err instanceof Error ? err.message : "导出失败");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">数据导出</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            资产数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            导出所有资产数据为 Excel 文件，包含基本信息和类型扩展字段。
          </p>
          <Button onClick={handleExportAssets} disabled={loading === "assets"}>
            {loading === "assets" ? "导出中..." : (
              <>
                <Download className="h-4 w-4 mr-1" /> 导出资产 Excel
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            供应商数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            导出所有供应商数据为 Excel 文件，包含评分、标签、联系方式等。
          </p>
          <Button onClick={handleExportSuppliers} disabled={loading === "suppliers"}>
            {loading === "suppliers" ? "导出中..." : (
              <>
                <Download className="h-4 w-4 mr-1" /> 导出供应商 Excel
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExportPage;