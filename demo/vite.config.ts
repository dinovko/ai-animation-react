import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL("..", import.meta.url));

// The demo imports the library from source (src/index.ts), so edits to the library reload instantly.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      "ai-animation-react": `${root}src/index.ts`,
    },
  },
  server: {
    port: 5173,
    open: false,
    fs: { allow: [root] },
  },
});
