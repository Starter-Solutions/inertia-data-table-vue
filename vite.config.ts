import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
    plugins: [
        vue(),
        dts({
            entryRoot: "src",
            outDir: "dist",
            insertTypesEntry: true,
        }),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "InertiaDataTable",
            formats: ["es", "cjs"],
            fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
        },
        rollupOptions: {
            external: ["vue", "@inertiajs/vue3"],
            output: {
                globals: {
                    vue: "Vue",
                },
            },
        },
    },
});
