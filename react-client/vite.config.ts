import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

//@ts-ignore
import manifest from "./manifest.json";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "",
      filename: "service-worker.js",
      manifest,
    }),
  ],
});
