import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const transformJsAsJsx = {
  name: "transform-js-as-jsx",
  enforce: "pre",
  async transform(code, id) {
    if (!id.match(/src\/.*\.js$/)) {
      return null;
    }

    return transformWithEsbuild(code, id, {
      loader: "jsx",
      jsx: "automatic",
    });
  },
};

export default defineConfig({
  plugins: [transformJsAsJsx, react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/build/**", "**/.worktrees/**"],
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
