import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = (env.VITE_API_PROXY_TARGET || "").trim();
  const botApiTarget = (env.BOT_API_TARGET || "http://localhost:3001").trim();
  const botApiKey = (env.BOT_API_KEY || "").trim();

  return {
    plugins: [react(), tsconfigPaths()],

    server: {
      proxy: {
        ...(apiProxyTarget
          ? {
              "/api": {
                target: apiProxyTarget,
                changeOrigin: true,
                secure: false,
              },
            }
          : {}),
        "/bot-api": {
          target: botApiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/bot-api/, "/api"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (botApiKey) {
                proxyReq.setHeader("X-API-Key", botApiKey);
              }
            });
            proxy.on("error", (err, _req, res) => {
              if (res && "writeHead" in res && !res.headersSent) {
                res.writeHead(503, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: false,
                    code: "BOT_PROXY_UNAVAILABLE",
                    message: `Cannot reach Telegram bot service at ${botApiTarget} (${err.message}). Verify the bot service is running.`,
                  })
                );
              }
            });
          },
        },
      },
    },
  };
});