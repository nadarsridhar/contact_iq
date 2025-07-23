import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// IMPORTANT: Comment server config while giving FE binaries

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: false,
  },
  server: {
    host: "0.0.0.0", // Optional: Allows access over the local network
    https: 
    {
      key: fs.readFileSync(path.resolve(__dirname, "ssl", "mykey.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "ssl", "mycert.crt")),
    },
  },
});
