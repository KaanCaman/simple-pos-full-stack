import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ],
        },
      }),
      tailwindcss(),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __API_URL__: JSON.stringify(
        env.VITE_API_URL === undefined
          ? "http://localhost:3000"
          : env.VITE_API_URL
      ),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME || "Simple POS"),
      __IDLE_TIMEOUT__: JSON.stringify(Number(env.VITE_IDLE_TIMEOUT) || 900000), // 15 mins
      __TAX_RATE__: JSON.stringify(Number(env.VITE_TAX_RATE) || 0),
    },
    server: {
      port: 3001,
    },
  };
});
