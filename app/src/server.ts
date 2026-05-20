import "dotenv/config";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 3000;

//app.listen() が返すサーバー情報を入れる変数 server を作る。最初はまだ起動していないので null にしておく
let server: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;

/**
 * graceful shutdown
 * - 新規リクエスト停止
 * - DB切断
 * - timeout後に強制終了
 */
const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Shutdown timeout. Force exit.");
    process.exit(1);
  }, 10000);

  try {
    // サーバー起動済みならHTTP停止
    if (server) {
      server.close(async () => {
        try {
          console.log("HTTP server closed.");

          await prisma.$disconnect();
          console.log("Prisma disconnected.");

          clearTimeout(forceExitTimer);
          console.log("Graceful shutdown completed.");
          process.exit(0);
        } catch (error) {
          console.error("Disconnect error:", error);
          clearTimeout(forceExitTimer);
          process.exit(1);
        }
      });
    } else {
      // 起動前エラー時
      await prisma.$disconnect().catch(() => {});
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  } catch (error) {
    console.error("Shutdown error:", error);
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
};

/**
 * メイン起動処理
 * DB接続確認後にサーバー起動
 */
const startServer = async () => {
  try {
    console.log("Connecting to database...");

    await prisma.$connect();

    console.log("Database connected.");

    server = app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
};

// 起動
await startServer();

/**
 * 終了シグナル
 */

// Docker / Railway / Render / Linux停止
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Ctrl + C
process.on("SIGINT", () => shutdown("SIGINT"));

/**
 * 想定外エラー
 */

// 同期エラー
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});

// Promise未処理エラー
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  shutdown("unhandledRejection");
});
