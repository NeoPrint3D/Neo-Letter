import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import removeConsole from "vite-plugin-remove-console";
import webfontDownload from "vite-plugin-webfont-dl";

//@ts-ignore
import manifest from "./manifest.json";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(),
    removeConsole(),
    webfontDownload([
      "https://fonts.googleapis.com/css2?family=Crete+Round&display=swap",
    ]),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "",
      filename: "service-worker.js",
      manifest,
    }),
  ],
});
