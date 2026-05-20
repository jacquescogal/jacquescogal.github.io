import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

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
  build: {
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
