import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "./db/init.js";
import { errorHandler } from "./middleware/error-handler.js";
import assetsRouter from "./routes/assets.js";
import suppliersRouter from "./routes/suppliers.js";
import relationsRouter from "./routes/relations.js";
import notificationsRouter from "./routes/notifications.js";
import importRouter from "./routes/import.js";
import dashboardRouter from "./routes/dashboard.js";
import exportRouter from "./routes/export.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/assets", assetsRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/relations", relationsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/import", importRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/export", exportRouter);

// 生产部署：提供前端静态文件 + SPA fallback
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use(errorHandler);

async function start() {
  await getDb();
  console.log("Database initialized");

  // 启动时扫描一次提醒
  const { scanNotifications } = await import("./services/notification-scanner.js");
  const count = await scanNotifications();
  console.log(`Notification scan complete: ${count} new notifications`);

  // 每小时扫描一次
  setInterval(async () => {
    const c = await scanNotifications();
    if (c > 0) console.log(`Scheduled scan: ${c} new notifications`);
  }, 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
